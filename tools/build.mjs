// build.mjs — assembles the modular Vite project from src-legacy/ (patched on the fly).
// Usage: node tools/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'acorn';
import { full as walkFull } from 'acorn-walk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const LEG = path.join(ROOT, 'src-legacy');
const SRC = path.join(ROOT, 'src');
const code = fs.readFileSync(path.join(LEG, 'code.js'), 'utf8');
const xref = JSON.parse(fs.readFileSync(path.join(ROOT, 'xref.json'), 'utf8'));
const MUT = new Set(xref.mutableGlobals.map(m => m.name));
const ast = parse(code, { ecmaVersion: 2022, locations: true, sourceType: 'script' });

// ---------- 1. byte ranges per top-level decl ----------
const ranges = new Map();
for (const n of ast.body) {
  if (n.type === 'FunctionDeclaration' && n.id) ranges.set(n.id.name, [n.start, n.end]);
  else if (n.type === 'VariableDeclaration') for (const d of n.declarations) ranges.set(d.id.name, [n.start, n.end]);
  else if (n.type === 'ExpressionStatement' && n.expression.type === 'AssignmentExpression') {
    const l = n.expression.left;
    if (l.type === 'Identifier') ranges.set(l.name + '@assign', [n.start, n.end]);
  }
}
console.log('decls mapped:', ranges.size);

// ---------- 2. scope-aware free-identifier collector ----------
function patNames(p, out) {
  if (!p) return;
  if (p.type === 'Identifier') out.add(p.name);
  else if (p.type === 'ObjectPattern') p.properties.forEach(x => patNames(x.value || x.argument, out));
  else if (p.type === 'ArrayPattern') p.elements.forEach(e => { if (e) patNames(e, out); });
  else if (p.type === 'AssignmentPattern') patNames(p.left, out);
  else if (p.type === 'RestElement') patNames(p.argument, out);
}
// free top-level identifiers referenced inside [start,end), excluding locally-bound names
// NOTE: callers that patch the sliced source MUST recompute idents on the
// patched text (offsets shift after any insertion). Use freeIdentsIn for that.
function freeIdentsIn(srcText, off) {
  const sub = parse(srcText, { ecmaVersion: 2022, sourceType: 'script' });
  const bound = new Set();
  const free = new Map(); // name -> [{s,e}]
  function isBound(name, ancestors) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const b = ancestors[i].__bound;
      if (b && b.has(name)) return true;
    }
    return bound.has(name);
  }
  function visit(node, ancestors) {
    if (!node || typeof node.type !== 'string') return;
    // record bindings introduced at this node
    let local = null;
    const addLocal = (n) => { local = local || new Set(); n.forEach(x => local.add(x)); };
    if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
      const ps = new Set(); node.params.forEach(p => patNames(p, ps));
      if (node.type === 'FunctionDeclaration' && node.id) bound.add(node.id.name);
      addLocal(ps);
    } else if (node.type === 'VariableDeclarator') { const s = new Set(); patNames(node.id, s); addLocal(s); }
    else if (node.type === 'CatchClause') { const s = new Set(); patNames(node.param, s); addLocal(s); }
    else if (node.type === 'BlockStatement' || node.type === 'Program') {
      const s = new Set();
      for (const st of node.body || []) {
        if (st.type === 'FunctionDeclaration' && st.id) s.add(st.id.name);
        else if (st.type === 'VariableDeclaration') for (const d of st.declarations) patNames(d.id, s);
      }
      if (s.size) addLocal(s);
    }
    if (local) node.__bound = local;
    const anc = ancestors.concat(node);
    if (node.type === 'Identifier' && !isBound(node.name, ancestors)) {
      const parent = ancestors[ancestors.length - 1];
      const skip = parent && (
        (parent.type === 'MemberExpression' && parent.property === node && !parent.computed) ||
        (parent.type === 'Property' && parent.key === node && !parent.computed) ||
        (parent.type === 'LabeledStatement') ||
        ((parent.type === 'FunctionDeclaration' || parent.type === 'FunctionExpression') && parent.id === node)
      );
      if (!skip) {
        if (!free.has(node.name)) free.set(node.name, []);
        free.get(node.name).push([node.start + off, node.end + off]);
      }
    }
    for (const k in node) {
      if (k === '__bound' || k === 'start' || k === 'end' || k === 'loc' || k === 'range') continue;
      const v = node[k];
      if (Array.isArray(v)) v.forEach(x => x && x.type && visit(x, anc));
      else if (v && v.type) visit(v, anc);
    }
  }
  visit(sub, []);
  return free;
}
function freeIdents(start, end) {
  return freeIdentsIn(code.slice(start, end), start);
}

// ---------- 3. state rewrite: bare `NAME` -> `state.NAME` for mutable globals ----------
// Only rewrites *expression* identifiers (property keys, member props skipped by freeIdents).
function rewriteState(src, baseOff, free) {
  const edits = [];
  for (const name of MUT) {
    const occ = free.get(name);
    if (occ) for (const [s, e] of occ) edits.push([s - baseOff, e - baseOff, `state.${name}`]);
  }
  edits.sort((a, b) => b[0] - a[0]);
  let out = src;
  for (const [s, e, rep] of edits) out = out.slice(0, s) + rep + out.slice(e);
  return { out, count: edits.length };
}
console.log('codemod helpers ready');

// ---------- 4. module assignment ----------
const CHECK_CONSTS = new Set(xref.decls.filter(d => d.kind === 'const').map(d => d.name));
const MODULES = {
  'core/state.js':        { decls: [...MUT].sort(), kind: 'state' },
  'engine/checks.js':     { decls: [...CHECK_CONSTS].filter(n => n !== 'sensitivePatterns').sort(), kind: 'checks' },
  'core/utils.js':        { decls: ['copyToClipboard', 'formatFileSize', 'escapeHtml', 'maskValue', 'sensitivePatterns'], kind: 'pure' },
  'core/patterns.js':     { decls: ['analyzePatterns'], kind: 'pure' },
  'core/endpoints.js':    { decls: ['extractEndpoints'], kind: 'pure' },
  'core/manifest.js':     { decls: ['parseManifestPermissions', 'findAndReadManifest', 'classifyAndroidPermission', 'resolvePermissionWithRisk', 'analyzePermissionsFromManifest', 'NORMAL_PERMISSIONS', 'DANGEROUS_PERMISSIONS', 'SIGNATURE_PERMISSIONS', 'SIGNATURE_PRIVILEGED_PERMISSIONS', 'INTERNAL_SYSTEM_PERMISSIONS', 'APPOPS_PERMISSIONS'], kind: 'mixed' },
  'ingest/apk.js':        { decls: ['handleAPKSelected', 'analyzeAPKGlobal'], kind: 'ui' },
  'ingest/source.js':     { decls: ['handleDecompiledFolderSelected', 'handleDroppedDecompiledItems', 'readDirectoryRecursiveForSource', 'updateAnalysisHint', 'analyzeDecompiledSourceOnly'], kind: 'ui' },
  'ingest/dynamic.js':    { decls: ['handleDroppedItems', 'readDirectoryRecursive', 'analyzeDynamicFolder', 'analyzeSharedPreferences', 'analyzeSQLiteDatabases', 'analyzeOtherFiles'], kind: 'ui' },
  'ui/navigation.js':     { decls: ['toggleTheme', 'navigateTo', 'startGlobalAnalysis'], kind: 'ui' },
  'ui/misconfig.js':      { decls: ['toggleAllSections', 'expandAllSections', 'collapseAllSections', 'toggleSectionChip', 'updateChipCounts', 'displayPermissionAnalysis', 'renderPermissionComponents', 'setComponentFilter', 'displayMisconfigResults', 'renderFilteredResults', 'setFilter', 'setFlagCategoryFilter', 'setStorageCategoryFilter', 'setCryptoCategoryFilter', 'setLoggingCategoryFilter', 'setPermFilter', 'setComponentTypeFilter', 'exportPermissions'], kind: 'ui' },
  'ui/codeanalysis.js':   { decls: ['toggleAllCodeSections', 'expandAllCodeSections', 'collapseAllCodeSections', 'toggleCodeSection', 'toggleCodeSectionChip', 'displayCodeAnalysisResults', 'renderBackendRiskIndicators', 'renderServerSideVulnerabilities', 'renderSection', 'createCheckCard', 'toggleInstances', 'setCodeFilter'], kind: 'ui' },
  'ui/endpoints.js':      { decls: ['displayEndpointResults', 'renderEndpoints', 'filterEndpointsBySearch', 'toggleEndpointSectionsExpandCollapse', 'expandAllEndpointSections', 'collapseAllEndpointSections', 'toggleEndpointSectionChip', 'setEndpointFilter', 'exportEndpoints'], kind: 'ui' },
  'ui/dynamic.js':        { decls: ['toggleAllDynamicSections', 'expandAllDynamicSectionsInternal', 'collapseAllDynamicSectionsInternal', 'displayDynamicResults', 'renderSharedPrefsResults', 'renderSQLiteResults', 'renderFilesResults', 'renderSecurityIssues', 'toggleDynamicSection', 'toggleDynamicInstances', 'resetDynamicAnalysis'], kind: 'ui' },
  'ui/shell.js':          { decls: ['toggleSection', 'displayAllResults', 'resetGlobalAnalyzer', 'expandAllDynamicSections', 'collapseAllDynamicSections'], kind: 'ui' },
};
// verify coverage
{
  const all = new Set(); for (const m of Object.values(MODULES)) m.decls.forEach(d => all.add(d));
  const topo = new Set(xref.decls.map(d => d.name));
  const missing = [...topo].filter(n => !all.has(n) && !ranges.has(n + '@assign'));
  console.log('module coverage: assigned=' + all.size + ' top=' + topo.size + ' missing=' + JSON.stringify(missing));
}
const PATCH_ANALYZE_PATTERNS = fs.readFileSync(new URL('./patches/analyzePatterns.js', import.meta.url), 'utf8');
const PATCH_SQLITE = fs.readFileSync(new URL('./patches/analyzeSQLiteDatabases.js', import.meta.url), 'utf8');
const PATCH_UNIQUE = fs.readFileSync(new URL('./patches/uniqueView.js', import.meta.url), 'utf8');

// ---------- 5. per-decl patches (§5.1–§5.11) applied to sliced source ----------
const LOOP_BODY = (self) => `async function ${self}(dirEntry, files) {
            const reader = dirEntry.createReader();
            const all = [];
            while (true) {
                const batch = await new Promise((res, rej) => reader.readEntries(res, rej));
                if (batch.length === 0) break;
                all.push(...batch);
            }
            for (const entry of all) {
                if (entry.isFile) {
                    const f = await new Promise(res => entry.file(res));
                    f.relativePath = entry.fullPath;
                    files.push(f);
                } else if (entry.isDirectory) {
                    await ${self}(entry, files);
                }
            }
        }`;
const FLAG_FILTER_MAP = `function setFlagCategoryFilter(category) {
            currentFlagCategoryFilter = category;
            document.querySelectorAll('[id^="flagCat"]').forEach(b => b.classList.remove('active'));
            const map = {
                'all':'flagCatAll','Screen Protection':'flagCatScreen','UI Security':'flagCatUI',
                'Component Security':'flagCatComponent','Intent Security':'flagCatIntent',
                'Activity Security':'flagCatActivity','WebView Security':'flagCatWebView',
                'Build Security':'flagCatBuild','Data Security':'flagCatData',
                'Permission Security':'flagCatPermission','Network Security':'flagCatNetwork',
                'Runtime Security':'flagCatRuntime'
            };
            document.getElementById(map[category])?.classList.add('active');
            renderFilteredResults();
        }`;
const STATE_RESET = `
                analyzedPermComponents = [];
                customPermissions = {};
                appPermission = null;
                extractedEndpoints = [];`;
function patchDecl(name, src) {
  let s = src;
  // §5.11 dead code: drop whole decls (public dups; internals live in ui/dynamic.js)
  if (name === 'toggleSection') return { src: null, dropped: true };
  if ((name === 'expandAllDynamicSections' || name === 'collapseAllDynamicSections') &&
      s.includes("['sharedPrefs', 'sqlite', 'files', 'security']")) return { src: null, dropped: true };
  // §5.1 analyzePatterns -> regex-aware engine (same signature/shape)
  if (name === 'analyzePatterns') s = PATCH_ANALYZE_PATTERNS;
  // §5.2 XSS: inline copy handlers -> data-copy-id registry
  s = s.split(`onclick="copyToClipboard('\${escapeHtml(inst.content.replace(/'/g, "\\\\'"))}')"`).join('data-copy-id="${registerCopy(inst.content)}"');
  s = s.split(`onclick="copyToClipboard('\${escapeHtml(e.url.replace(/'/g, "\\\\'"))}')"`).join('data-copy-id="${registerCopy(e.url)}"');
  // deprecated substr -> slice (robustness)
  s = s.split('.substr(2, 9)').join('.slice(2, 11)');
  // scan console: mirror every loading-status line into the terminal (#ux).
  // All 17 status sites share one shape: `<indent>loadingStatus.textContent = EXPR;`
  s = s.replace(/^([ \t]*)(loadingStatus)\.textContent = (.*);$/gm,
    `$1$2.textContent = $3;\n$1logStage($3);`);
  // scan console: reset clock + terminal when a run's loading view opens
  if (name === 'analyzeAPKGlobal' || name === 'analyzeDecompiledSourceOnly') {
    s = s.split(`globalLoadingSection.classList.remove('hidden');`).join(
`globalLoadingSection.classList.remove('hidden');
                clearScanLog();`);
  }
  if (name === 'analyzeDynamicFolder') {
    s = s.split(`loadingSection.classList.remove('hidden');`).join(
`loadingSection.classList.remove('hidden');
            clearScanLog();`);
  }
  // §5.4 folder reader loop (FileSystem readEntries caps at ~100 per call)
  if (name === 'readDirectoryRecursive') s = LOOP_BODY('readDirectoryRecursive');
  if (name === 'readDirectoryRecursiveForSource') s = LOOP_BODY('readDirectoryRecursiveForSource');
  // §5.6 multi-word flag category filter -> explicit map
  if (name === 'setFlagCategoryFilter') s = FLAG_FILTER_MAP;
  // §5.7 stale cross-run state: reset at both analysis entry points…
  if (name === 'analyzeAPKGlobal' || name === 'analyzeDecompiledSourceOnly') {
    s = s.replace(/try\s*\{/, 'try {' + STATE_RESET);
    // #18: run pattern matching off the main thread (sync fallback under threshold)
    s = s.split('analyzePatterns(').join('await analyzePatternsAsync(');
    // freeze fix: endpoint mining also runs in the worker (single clone)
    s = s.split('extractEndpoints(').join('await extractEndpointsAsync(');
    // resume: route every category through the checkpoint-aware wrapper so an
    // interrupted scan continues from the first incomplete category.
    s = s.replace(/(\w+) = await analyzePatternsAsync\(analysisContent, (\w+), ([^)]+)\)/g,
      `$1 = await resumableCategory('$1', analysisContent, $2, $3);`);
    // history: persist results for reload-safe viewing (fire-and-forget)
    s = s.split(`\n                displayAllResults();`).join(
`\n                displayAllResults();
                saveCurrentScan().catch((e) => console.warn('history save failed', e));
                endRun().catch(() => {});`);
  }
  // #17 zip-bomb guard + #21 split-APK bundles + #22 array-join (APK extraction)
  if (name === 'analyzeAPKGlobal') {
    s = s.split(`const zip = new JSZip();\n                const contents = await zip.loadAsync(file);`).join(
`const zip = new JSZip();
                let contents = await zip.loadAsync(file);
                // #21: split-APK bundles (.apks/.xapk) — descend into the largest inner APK
                if (!contents.file('AndroidManifest.xml')) {
                    const innerNames = Object.keys(contents.files).filter(n => /\\.apk$/i.test(n) && !contents.files[n].dir);
                    if (innerNames.length > 0) {
                        innerNames.sort((a, b) => ((contents.files[b]._data?.uncompressedSize || 0) - (contents.files[a]._data?.uncompressedSize || 0)));
                        loadingStatus.textContent = 'Split-APK bundle detected — opening ' + innerNames[0] + '...';
                        contents = await new JSZip().loadAsync(await contents.file(innerNames[0]).async('uint8array'));
                    }
                }`);
    s = s.split(`let allContent = '';\n                const files = [];`).join(
`const contentParts = [];\n                const files = [];`);
    s = s.split(`                    try {
                        allContent += await files[i].entry.async('string') + '\\n';
                    } catch {
                        try {
                            const binary = await files[i].entry.async('uint8array');
                            allContent += new TextDecoder('utf-8', { fatal: false }).decode(binary) + '\\n';
                        } catch {}
                    }`).join(
`                    const entry = files[i].entry;
                    const declaredSize = entry._data?.uncompressedSize || 0;
                    // #17: per-entry 50MB cap (zip-bomb guard)
                    if (declaredSize > 50 * 1024 * 1024) {
                        console.warn('Skipping oversized entry:', files[i].path);
                        continue;
                    }
                    try {
                        contentParts.push(await entry.async('string') + '\\n');
                        totalBytes += declaredSize;
                    } catch {
                        try {
                            const binary = await entry.async('uint8array');
                            if (binary.length > 50 * 1024 * 1024) {
                                console.warn('Skipping oversized entry:', files[i].path);
                                continue;
                            }
                            contentParts.push(new TextDecoder('utf-8', { fatal: false }).decode(binary) + '\\n');
                            totalBytes += binary.length;
                        } catch {}
                    }`);
    s = s.split(`                const files = [];
                contents.forEach`).join(
`                let totalBytes = 0;
                const files = [];
                contents.forEach`);
    // freeze fix: .dex bytes are disassembled separately and the binary manifest
    // is parsed separately — string-decoding either is wasted work + memory.
    s = s.split(`                for (let i = 0; i < files.length; i++) {`).join(
`                for (let i = 0; i < files.length; i++) {
                    if (/\\.dex$/i.test(files[i].path) || files[i].path === 'AndroidManifest.xml') continue;`);
    s = s.split(`                    if (i % 50 === 0) progressBar.style.width = \`\${15 + (i / files.length) * 40}%\`;
                }`).join(
`                    // #17: 500MB total cap (zip-bomb guard)
                    if (totalBytes > 500 * 1024 * 1024) {
                        console.warn('Total uncompressed size exceeded 500MB — stopping extraction early.');
                        break;
                    }
                    if (i % 50 === 0) progressBar.style.width = \`\${15 + (i / files.length) * 40}%\`;
                    if (i % 500 === 0 && i > 0) logScan(\`extracted \${i}/\${files.length} entries (\${(totalBytes / 1048576).toFixed(0)} MB uncompressed)…\`);
                }
                // #22: single join instead of repeated string concat
                const allContent = contentParts.join('');`);
  }
  // auto-dex: in-browser DEX disassembly + binary manifest (no manual JADX needed)
  if (name === 'analyzeAPKGlobal') {
    // clear stale auto-manifest from previous runs
    s = s.split(`globalAPKData.file = file;`).join(
`globalAPKData.manifestXml = null;
                globalAPKData.file = file;
                beginRun(file).catch(() => {});`);
    // after split-APK resolution: parse the binary manifest straight from the APK
    s = s.split(`                let totalBytes = 0;`).join(
`                // auto-manifest: binary AndroidManifest.xml -> XML text (no JADX needed)
                try {
                    const mfEntry = contents.file('AndroidManifest.xml');
                    if (mfEntry) {
                        const { parseAxml } = await import('../core/axml.js');
                        globalAPKData.manifestXml = parseAxml(await mfEntry.async('uint8array'));
                    }
                } catch (e) { console.warn('auto manifest parse failed', e); }
                let totalBytes = 0;`);
    // disassemble DEX files to smali right after extraction
    s = s.split(`                // #22: single join instead of repeated string concat
                const allContent = contentParts.join('');`).join(
`                // #22: single join instead of repeated string concat
                const allContent = contentParts.join('');
                // auto-dex: DEX -> smali in-browser (no manual JADX folder needed)
                let smaliContent = '';
                try {
                    const dexFiles = files.filter(f => /\\.dex$/i.test(f.path));
                    if (dexFiles.length > 0) {
                        loadingStatus.textContent = 'Disassembling DEX (automatic, no JADX needed)...';
                        const { disassembleDexAsync } = await import('../core/patterns-async.js');
                        const smaliParts = [];
                        for (const d of dexFiles.slice(0, 10)) {
                            smaliParts.push(await disassembleDexAsync(await d.entry.async('uint8array'), d.path));
                        }
                        smaliContent = smaliParts.join('\\n');
                    }
                } catch (e) { console.warn('auto dex disassembly failed', e); }`);
    // smali feeds pattern analysis (under the APK bytecode section) + endpoint mining
    s = s.split(`                let analysisContent = allContent;`).join(
`                let analysisContent = smaliContent ? smaliContent + '\\n\\n// === APK BYTECODE CONTENT ===\\n\\n' + allContent : allContent;
                if (globalAPKData.manifestXml) analysisContent += '\\n\\n// === ANDROIDMANIFEST.XML ===\\n\\n' + globalAPKData.manifestXml;`);
    s = s.split(`extractedEndpoints = await extractEndpointsAsync(allContent);`).join(
`extractedEndpoints = await extractEndpointsAsync(smaliContent ? smaliContent + '\\n' + allContent : allContent);`);
  }
  // JADX runs: read the raw manifest early so manifest posture patterns fire
  if (name === 'analyzeDecompiledSourceOnly') {
    s = s.split(`const analysisContent = decompiledSourceData.content;`).join(
`let jadxManifestText = '';
                try { const jm = await findAndReadManifest(decompiledSourceData.files); if (jm) jadxManifestText = '\\n\\n// === ANDROIDMANIFEST.XML ===\\n\\n' + jm; } catch (e) {}
                const analysisContent = decompiledSourceData.content + jadxManifestText;`);
  }
  // resume: refresh the interrupted-scan offer whenever a file is (re-)selected
  if (name === 'handleAPKSelected') {
    s = s.split('updateAnalysisHint();').join(
`updateAnalysisHint();
            refreshResumeOffer(file).catch(() => {});`);
  }
  // resume: never show a stale offer after an explicit reset
  if (name === 'resetGlobalAnalyzer') {
    s = s.split(`document.getElementById('globalUploadSection').classList.remove('hidden');`).join(
`document.getElementById('globalUploadSection').classList.remove('hidden');
            document.getElementById('resumeSection')?.classList.add('hidden');`);
  }
  // auto-dex: upload hint reflects automatic disassembly
  if (name === 'updateAnalysisHint') {
    s = s.split(`'APK loaded. <span class="text-gray-400">Add JADX folder for readable source code.</span>'`).join(
`'APK loaded. <span class="text-gray-400">DEX auto-disassembly + manifest included. Add JADX folder for best accuracy.</span>'`);
    s = s.split(`'✅ JADX source loaded. <span class="text-gray-400">Add APK for endpoint extraction & manifest analysis.</span>'`).join(
`'✅ JADX source loaded. <span class="text-gray-400">Add APK for endpoint extraction.</span>'`);
  }
  // §5.9 endpoint hardening: octet-validated IP regex + scheme blocklist
  if (name === 'extractEndpoints') {
    s = s.split(`const ipRegex = /\\b(?:https?:\\/\\/)?(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})(?::(\\d+))?(?:\\/[^\\s"'<>\\\\]*)?\\b/gi;`)
         .join(`const ipRegex = /\\b((?:(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|1?\\d?\\d))(?::(\\d{1,5}))?(?:\\/[^\\s"'<>\\\\]*)?\\b/g;`);
    s = s.split(`if (!['http', 'https', 'ws', 'wss', 'file', 'ftp', 'mailto'].includes(scheme)`)
         .join(`if (!new Set(['http','https','ws','wss','file','ftp','mailto','javascript','data','blob','about']).has(scheme)`);
  }
  // §5.11 dead code: source-code regex checks inside analyzeOtherFiles (app-data folder)
  if (name === 'analyzeOtherFiles') {
    const startMarker = '// Analyze Java/Kotlin source code files';
    const si = s.indexOf(startMarker);
    const ei = s.indexOf('if (issues.length > 0)', si !== -1 ? si : 0);
    if (si !== -1 && ei !== -1 && ei > si) s = s.slice(0, si) + s.slice(ei);
  }
  // #13: reset endpoint expansion state at the end of each render
  if (name === 'displayEndpointResults') {
    s = s.split(`                renderEndpoints();\n            }`).join(
`                renderEndpoints();\n                allEndpointSectionsExpanded = true;\n                currentEndpointSection = null;\n            }`);
  }
  // #14 + auto-dex: hide the permission section when unavailable; prefer JADX
  // manifest but fall back to the auto-parsed APK manifest (no manual folder needed)
  if (name === 'analyzePermissionsFromManifest') {
    s = s.replace(/(async function analyzePermissionsFromManifest\(\) \{\n)/, '$1            analyzedPermComponents = [];\n');
    s = s.split(`            if (!decompiledSourceData.isLoaded || !decompiledSourceData.files) {
                console.log('No JADX folder loaded for permission analysis');
                return;
            }
            
            // Find and read AndroidManifest.xml
            const manifestXml = await findAndReadManifest(decompiledSourceData.files);
            if (!manifestXml) {
                console.log('AndroidManifest.xml not found in JADX folder');
                return;
            }`).join(
`            // Prefer the JADX manifest; fall back to the auto-parsed APK manifest
            const apkManifestXml = globalAPKData.manifestXml || null;
            const hasJadx = decompiledSourceData.isLoaded && decompiledSourceData.files;
            let manifestXml = null;
            if (hasJadx) manifestXml = await findAndReadManifest(decompiledSourceData.files);
            if (!manifestXml) manifestXml = apkManifestXml;
            if (!manifestXml) {
                console.log('No manifest available for permission analysis');
                document.getElementById('permissionSection')?.classList.add('hidden');
                return;
            }`);
    for (const log of ['Could not parse package name from manifest']) {
      s = s.split(`console.log('${log}');\n                return;`).join(
`console.log('${log}');\n                document.getElementById('permissionSection')?.classList.add('hidden');\n                return;`);
    }
  }
  // #23: real SQLite parsing (sql.js) with binary-scan fallback
  if (name === 'analyzeSQLiteDatabases') s = PATCH_SQLITE;
  // misconfig: Expand/Collapse All must cover every section (logging was orphaned).
  if (name === 'expandAllSections' || name === 'collapseAllSections') {
    s = s.split(`['root', 'emulator', 'ssl', 'flag', 'storage', 'crypto', 'permission']`).join(`['root', 'emulator', 'ssl', 'flag', 'storage', 'crypto', 'logging', 'permission']`);
  }
  // misconfig: after a fresh render show every section's content, but leave
  // all chips unselected. Permission visibility stays owned by
  // displayPermissionAnalysis (hidden when empty).
  if (name === 'displayAllResults') {
    s = s.split(`displayMisconfigResults();`).join(
`displayMisconfigResults();
            ['root', 'emulator', 'ssl', 'flag', 'storage', 'crypto', 'logging'].forEach(s => {
                document.getElementById(\`\${s}Section\`)?.classList.add('visible');
            });`);
  }
  // endpoints: the All/Detected/Not-Detected tabs filtered nothing (every
  // extracted endpoint is a detection by construction) — replaced in markup
  // by a static summary; write it here instead of the removed counters.
  if (name === 'displayEndpointResults') {
    s = s.split(`            document.getElementById('endpointTotalChecks').textContent = totalEndpoints;
            document.getElementById('endpointDetectedChecks').textContent = detectedEndpoints;
            document.getElementById('endpointNotDetectedChecks').textContent = notDetectedEndpoints;`).join(
`            const __sum = document.getElementById('endpointSummary');
            if (__sum) __sum.textContent = \`\${totalEndpoints} endpoints\`;`);
  }
  // endpoints: normalize the websocket section key to the markup's `ws` ids.
  // (renderEndpoints keeps 'websocket': e.type is data, not DOM.)
  if (['displayEndpointResults', 'expandAllEndpointSections', 'collapseAllEndpointSections', 'toggleEndpointSectionChip'].includes(name)) {
    s = s.split(`['http', 'api', 'websocket', 'deeplink', 'cloud', 'ip']`).join(`['http', 'api', 'ws', 'deeplink', 'cloud', 'ip']`);
  }
  // endpoints: chip click always isolates (second click re-expands).
  // Previously a no-op while expanded, and the ws chip hit missing ids.
  if (name === 'toggleEndpointSectionChip') {
    s = s.split(`currentEndpointSection = section;`).join(
`const prevChip = document.getElementById(\`\${section}EndpointChip\`);
            const wasIsolated = !!prevChip && prevChip.classList.contains('active') && currentEndpointSection === section && !allEndpointSectionsExpanded;
            currentEndpointSection = section;`);
    s = s.replace(/if \(chip\) chip\.classList\.add\('active'\);[\s\S]*?const sections = \['http', 'api', 'ws', 'deeplink', 'cloud', 'ip'\];/,
`if (wasIsolated) {
                sections.forEach(s => {
                    const sectionDiv = document.getElementById(\`\${s}EndpointSection\`);
                    if (sectionDiv) sectionDiv.classList.add('visible');
                });
                allEndpointSectionsExpanded = true;
                currentEndpointSection = null;
                const tbtn = document.getElementById('endpointToggleBtn');
                if (tbtn) tbtn.textContent = 'Collapse All';
                return;
            }
            if (chip) chip.classList.add('active');
            allEndpointSectionsExpanded = false;

            const sections = ['http', 'api', 'ws', 'deeplink', 'cloud', 'ip'];`);
    s = s.split(`            sections.forEach(s => {
                const sectionDiv = document.getElementById(\`\${s}EndpointSection\`);
                if (sectionDiv) {
                    if (allEndpointSectionsExpanded) {
                        sectionDiv.classList.add('visible');
                    } else {
                        if (s === section) {
                            sectionDiv.classList.add('visible');
                        } else {
                            sectionDiv.classList.remove('visible');
                        }
                    }
                }
            });`).join(
`            sections.forEach(s => {
                const sectionDiv = document.getElementById(\`\${s}EndpointSection\`);
                if (sectionDiv) sectionDiv.classList.toggle('visible', s === section);
            });
            const tbtn2 = document.getElementById('endpointToggleBtn');
            if (tbtn2) tbtn2.textContent = 'Expand All';
            document.getElementById('uniqueEndpointSection')?.classList.remove('visible');`);
  }
  // endpoints: unique-domains chip renders a dedicated view (one row per
  // hostname with URL counts). Early return runs before the per-type loop;
  // the helper is appended to the slice (module-private, same file).
  if (name === 'renderEndpoints') {
    s = s.split("            const searchTerm = document.getElementById('endpointSearch')?.value?.toLowerCase() || '';").join(
`            const searchTerm = document.getElementById('endpointSearch')?.value?.toLowerCase() || '';
            if (!!document.getElementById('uniqueDomainChip')?.classList.contains('active')) {
                renderUniqueDomains(searchTerm);
                return;
            }`);
    s += '\n' + PATCH_UNIQUE;
  }
  // endpoints: Expand/Collapse All own all six type sections; the unique view
  // is exclusive with them, so both buttons park it (chip + section).
  if (name === 'expandAllEndpointSections') {
    s = s.split(`allEndpointSectionsExpanded = true;`).join(
`allEndpointSectionsExpanded = true;
            document.getElementById('uniqueEndpointSection')?.classList.remove('visible');
            document.getElementById('uniqueDomainChip')?.classList.remove('active');`);
  }
  if (name === 'collapseAllEndpointSections') {
    s = s.split(`allEndpointSectionsExpanded = false;`).join(
`allEndpointSectionsExpanded = false;
            document.getElementById('uniqueEndpointSection')?.classList.remove('visible');`);
  }
  // reset: never leave the unique-domains toggle (or stale banner) behind
  if (name === 'resetGlobalAnalyzer') {
    s = s.split(`document.getElementById('endpointResultsSection').classList.add('hidden');`).join(
`document.getElementById('endpointResultsSection').classList.add('hidden');
            document.getElementById('uniqueDomainChip')?.classList.remove('active');`);
  }
  return { src: s, dropped: false };
}

  const all = new Set(); for (const m of Object.values(MODULES)) m.decls.forEach(d => all.add(d));
  const topo = new Set(xref.decls.map(d => d.name));
  const missing = [...topo].filter(n => !all.has(n) && !ranges.has(n + '@assign'));
  console.log('module coverage: assigned=' + all.size + ' top=' + topo.size + ' missing=' + JSON.stringify(missing));
// ---------- 6. emit modules ----------
const declToModule = new Map();
for (const [mod, cfg] of Object.entries(MODULES)) for (const d of cfg.decls) declToModule.set(d, mod);
function relImport(from, to) {
  const a = from.split('/'), b = to.split('/');
  let i = 0; while (i < a.length - 1 && i < b.length - 1 && a[i] === b[i]) i++;
  const up = a.length - 1 - i;
  const rel = ('../'.repeat(up) + b.slice(i).join('/')).replace(/\.js$/, '') + '.js';
  return rel.startsWith('.') ? rel : './' + rel;
}
function dedent(src) {
  const lines = src.split('\n');
  let min = Infinity;
  for (const l of lines) { if (!l.trim()) continue; const m = l.match(/^ */)[0].length; if (m < min) min = m; }
  if (!isFinite(min) || min === 0) return src;
  return lines.map(l => (l.trim() ? l.slice(Math.min(min, l.match(/^ */)[0].length)) : '')).join('\n');
}
const emitted = {};
for (const [mod, cfg] of Object.entries(MODULES)) {
  if (cfg.kind === 'state') continue; // handled below
  const parts = [];
  const needState = { v: false };
  for (const name of cfg.decls) {
    const r = ranges.get(name);
    if (!r) { console.log(`WARN no range for ${name}`); continue; }
    let raw = code.slice(r[0], r[1]);
    const patched = patchDecl(name, raw);
    if (patched.dropped) { console.log(`dropped dead decl: ${name}`); continue; }
    raw = dedent(patched.src);
    const free = freeIdentsIn(raw, 0);
    const { out, count } = rewriteState(raw, 0, free);
    if (count > 0) needState.v = true;
    // imports: every free ident that lives in another module (excluding self + state)
    const imports = new Map(); // mod -> Set(names)
    for (const [fname, occ] of free) {
      if (MUT.has(fname) || fname === name) continue;
      const owner = declToModule.get(fname);
      if (owner && owner !== mod) {
        if (!imports.has(owner)) imports.set(owner, new Set());
        imports.get(owner).add(fname);
      }
    }
    parts.push({ name, body: out, imports });
  }
  // merge imports
  const merged = new Map();
  for (const p of parts) for (const [o, ns] of p.imports) {
    if (!merged.has(o)) merged.set(o, new Set());
    ns.forEach(n => merged.get(o).add(n));
  }
  let header = `// ${mod} — generated from src-legacy/code.js (do not hand-edit; edit tools/build.mjs)\n`;
  if (needState.v) header += `import { state } from '${relImport(mod, 'core/state.js')}';\n`;
  for (const [o, ns] of merged) header += `import { ${[...ns].sort().join(', ')} } from '${relImport(mod, o)}';\n`;
  const names = parts.map(p => p.name);
  emitted[mod] = header + '\n' + parts.map(p => p.body).join('\n\n') + `\n\nexport { ${names.join(', ')} };\n`;
}
console.log('modules emitted:', Object.keys(emitted).length);

// ---------- 7. state module (one entry per declarator, deduped) ----------
{
  const seen = new Set();
  const lines = ['// core/state.js — single owner of all former mutable globals.', '', 'export const state = {'];
  for (const n of ast.body) {
    if (n.type !== 'VariableDeclaration') continue;
    for (const d of n.declarations) {
      if (!MUT.has(d.id.name) || seen.has(d.id.name)) continue;
      seen.add(d.id.name);
      const init = d.init ? code.slice(d.init.start, d.init.end) : 'undefined';
      lines.push(`  ${d.id.name}: ${init},`);
    }
  }
  lines.push('};', '');
  emitted['core/state.js'] = lines.join('\n');
  const missingState = [...MUT].filter(m => !seen.has(m));
  if (missingState.length) console.log('WARN state missing: ' + JSON.stringify(missingState));
  // stage 9: copy registry (§5.2) + single export block
  {
    const REG = `
const __copyRegistry = new Map();
let __copyCounter = 0;
function registerCopy(text) {
    const id = \`copy_\${++__copyCounter}\`;
    __copyRegistry.set(id, text);
    return id;
}
if (typeof document !== 'undefined') {
    document.addEventListener('click', e => {
        const btn = e.target.closest('[data-copy-id]');
        if (!btn) return;
        const text = __copyRegistry.get(btn.getAttribute('data-copy-id'));
        if (text !== undefined) copyToClipboard(text);
    });
}
`;
    const base = emitted['core/utils.js'];
    // replace the two separate export statements with one combined block
    const cleaned = base.replace(/export\s*\{[^}]*\};/g, '').replace(/\n\n+/g, '\n').trimEnd();
    const withReg = cleaned + '\n' + REG + '\n';
    emitted['core/utils.js'] = withReg + `export { copyToClipboard, formatFileSize, escapeHtml, maskValue, sensitivePatterns, registerCopy };\n`;
    // teach dependents
    for (const [mod, content] of Object.entries(emitted)) {
      if (mod === 'core/utils.js') continue;
      if (content.includes('registerCopy(') && !content.includes('registerCopy }') && !content.includes('registerCopy,')) {
        if (content.includes('../core/utils.js')) {
          emitted[mod] = content.replace(" } from '../core/utils.js';", ", registerCopy } from '../core/utils.js';");
        } else {
          const rel = (mod.startsWith('ui/') || mod.startsWith('ingest/')) ? '../core/utils.js' : './core/utils.js';
          emitted[mod] = content.replace('\n\n', `\nimport { registerCopy } from '${rel}';\n`);
        }
      }
    }
  }

}

// ---------- 7b. hand-written module rewiring (post-generation) ----------
// #18: ingest call sites now await analyzePatternsAsync — inject the header import
// (the name no longer exists as a free ident, so the generator emits no import).
for (const mod of ['ingest/apk.js', 'ingest/source.js']) {
  const full = `// ${mod} — generated from src-legacy/code.js (do not hand-edit; edit tools/build.mjs)`;
  const need = `import { analyzePatternsAsync, extractEndpointsAsync, resumableCategory } from '../core/patterns-async.js';`;
  if (!emitted[mod].includes(need)) {
    emitted[mod] = emitted[mod].replace(full, `${full}\n${need}`);
  }
  const needSave = `import { saveCurrentScan, refreshResumeOffer } from '../ui/history.js';`;
  if (!emitted[mod].includes(needSave)) {
    emitted[mod] = emitted[mod].replace(full, `${full}\n${needSave}`);
  }
  const needCp = `import { beginRun, endRun } from '../core/checkpoint.js';`;
  if (!emitted[mod].includes(needCp)) {
    emitted[mod] = emitted[mod].replace(full, `${full}\n${needCp}`);
  }
  if (mod === 'ingest/source.js') {
    const needMf = `import { findAndReadManifest } from '../core/manifest.js';`;
    if (!emitted[mod].includes('findAndReadManifest')) {
      emitted[mod] = emitted[mod].replace(full, `${full}\n${needMf}`);
    }
  }
}
// analyzePatterns patch body also defines analyzePatternsFromLines (worker use).
if (!emitted['core/patterns.js'].includes('analyzePatternsFromLines };')) {
  emitted['core/patterns.js'] += 'export { analyzePatternsFromLines };\n';
}
// scan console: zero-dependency logging helper for all ingest flows.
for (const mod of ['ingest/apk.js', 'ingest/source.js', 'ingest/dynamic.js']) {
  const needLog = `import { logScan, logStage, clearScanLog } from '../ui/scanlog.js';`;
  if (!emitted[mod].includes(needLog)) {
    const full = `// ${mod} — generated from src-legacy/code.js (do not hand-edit; edit tools/build.mjs)`;
    emitted[mod] = emitted[mod].replace(full, `${full}\n${needLog}`);
  }
}

// ---------- 8. write files (once) ----------
for (const [mod, content] of Object.entries(emitted)) {
  const p = path.join(SRC, mod);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
  console.log(`wrote ${(content.length / 1024).toFixed(1)}kb ${mod}`);
}



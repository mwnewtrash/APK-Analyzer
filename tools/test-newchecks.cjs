const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0;
const check = (l, c) => { console.log((c ? 'PASS ' : 'FAIL ') + l); if (!c) fail++; };
// new pattern checks exist in engine
const eng = fs.readFileSync(path.join(ROOT, 'src', 'engine', 'checks.js'), 'utf8');
for (const n of ['Disabled Hostname Verification', 'SSL Errors Ignored', 'Mixed Content Allowed', 'WebView Remote Debugging', 'WebView Universal File Access', 'Outdated targetSdkVersion', 'High-Risk Permissions', 'SMS Interception Surface', 'Sticky Broadcasts', 'Risky FileProvider Paths']) {
  check('check:' + n, eng.includes(`name: '${n}'`));
}
// state + calls
const pat = fs.readFileSync(path.join(ROOT, 'src', 'core', 'patterns.js'), 'utf8');
void pat;
const st = fs.readFileSync(path.join(ROOT, 'src', 'core', 'state.js'), 'utf8');
check('state-global', st.includes('currentManifestPostureResults'));
for (const f of ['src/ingest/apk.js', 'src/ingest/source.js']) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  check(f + ' call', s.includes("resumableCategory('currentManifestPostureResults'"));
}
const ca = fs.readFileSync(path.join(ROOT, 'src', 'ui', 'codeanalysis.js'), 'utf8');
check('display-count', ca.includes('manifestPostureCodeChipCount'));
check('display-render', ca.includes("renderBackendRiskIndicators('manifestPostureResults', state.currentManifestPostureResults)"));
check('display-agg', ca.includes('...state.currentManifestPostureResults'));
check('expand-list', ca.includes("'manifestPosture'"));
const h = fs.readFileSync(path.join(ROOT, 'src-legacy', 'head.html'), 'utf8'); // source of truth, not the built index.html
check('chip', h.includes('id="manifestPostureCodeChip"') && h.includes("toggleCodeSectionChip('manifestPosture')"));
check('section', h.includes('id="manifestPostureSection"') && h.includes('id="manifestPostureResults"') && h.includes('id="manifestPostureContent"'));
const a = fs.readFileSync(path.join(ROOT, 'src', 'ingest', 'apk.js'), 'utf8');
check('apk-manifest-feed', a.includes('ANDROIDMANIFEST.XML') && a.includes('state.globalAPKData.manifestXml'));
const so = fs.readFileSync(path.join(ROOT, 'src', 'ingest', 'source.js'), 'utf8');
check('jadx-manifest-feed', so.includes('findAndReadManifest(state.decompiledSourceData.files)') && so.includes('findAndReadManifest'));
const er = fs.readFileSync(path.join(ROOT, 'src', 'ui', 'export-report.js'), 'utf8');
check('csv-label', er.includes("currentManifestPostureResults: 'Manifest Posture'"));
process.exit(fail ? 1 : 0);

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const furl = (p) => 'file://' + p.replace(/\\/g, '/');
async function main() {
  let fail = 0;
  const check = (l, c) => { console.log((c ? 'PASS ' : 'FAIL ') + l); if (!c) fail++; };
  for (const f of ['src/ingest/apk.js', 'src/ingest/source.js', 'src/ingest/dynamic.js']) {
    const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
    const stages = [...s.matchAll(/logStage\(([^;]+)\);/g)];
    check(f + ' stage-mirrors>0', stages.length > 0);
    check(f + ' scanlog-import', s.includes("from '../ui/scanlog.js';"));
    check(f + ' clear-on-open', s.includes('clearScanLog();'));
  }
  const a = fs.readFileSync(path.join(ROOT, 'src/ingest/apk.js'), 'utf8');
  check('extract-progress-log', a.includes('entries ('));
  const h = fs.readFileSync(path.join(ROOT, 'src-legacy', 'head.html'), 'utf8'); // source of truth, not the built index.html
  check('consoles-x2', (h.match(/<div data-scan-console/g) || []).length === 2);
  check('pct-x2', (h.match(/<span data-scan-pct/g) || []).length === 2);
  check('pct-shadcn', (h.match(/data-scan-pct class="ml-auto/g) || []).length === 2);
  check('bar-label-row', (h.match(/Scan progress<\/span>/g) || []).length === 2);
  check('bar-modern', h.includes('relative h-[6px] bg-gray-800/80') && h.includes('rounded-sm overflow-hidden') && h.includes('bar-sheen'));
  check('console-tall', (h.match(/mt-2 h-\[60vh\] min-h-80 overflow-y-auto/g) || []).length === 2);
  check('scrollbar-themed', h.includes('[data-scan-console]::-webkit-scrollbar-thumb'));
  check('scroll-system', h.includes('.instances-container.show::-webkit-scrollbar-thumb') && h.includes('.max-h-60.overflow-y-auto::-webkit-scrollbar-thumb'));
  check('scroll-transparent-track', h.includes('scrollbar-color: rgba(45, 212, 191, 0.35) transparent;'));
  check('scroll-no-violet', !h.includes('139, 92, 246, 0.45') && !h.includes('139, 92, 246, 0.7'));
  check('elapsed-x2', (h.match(/<span data-scan-elapsed/g) || []).length === 2);
  check('loader-centered', (h.match(/flex flex-col items-center text-center gap-3 mb-6/g) || []).length === 2);
  check('loader-status-hidden-kept', h.includes('<p class="hidden" id="globalLoadingStatus">') && h.includes('<p class="hidden" id="dynamicLoadingStatus">'));
  // scanlog: import-safe + no-op in Node, no innerHTML sinks with data
  const S = await import(furl(path.join(ROOT, 'src', 'ui', 'scanlog.js')));
  check('api', typeof S.logScan === 'function' && typeof S.logStage === 'function' && typeof S.clearScanLog === 'function');
  S.logScan('x', 'ok'); S.logStage('y'); S.clearScanLog();
  check('node-noop', true);
  check('stage-map', S.matchStage('Disassembling DEX (automatic)...')?.index === 1 && S.matchStage('Analyzing SQLite databases...')?.rail === 'dynamic' && S.matchStage('Analysis complete!')?.done === true && S.matchStage('hello') === null);
  check('stage-fns', typeof S.setStage === 'function' && typeof S.isCategoryDoneLine === 'function');
  check('catline', S.isCategoryDoneLine('✓ Root — 6 findings (5.8s)') && !S.isCategoryDoneLine('✓ classes.dex → 10 classes (0.9s)') && !S.isCategoryDoneLine('✓ endpoints: 180 (2.0s)'));
  check('rails-markup', (h.match(/data-scan-stages="apk"/g) || []).length === 1 && (h.match(/data-scan-stages="dynamic"/g) || []).length === 1);
  check('rails-nodes', (h.match(/class="scan-stage"/g) || []).length === 9 && (h.match(/class="scan-link"/g) || []).length === 7);
  check('rails-css', h.includes('.scan-stage.active .scan-dot') && h.includes('.scan-link.done'));
  const src = fs.readFileSync(path.join(ROOT, 'src', 'ui', 'scanlog.js'), 'utf8');
  check('no-innerHTML-data', !/innerHTML *= *(?!''|"")/.test(src.replace("el.innerHTML = '';", '')));
  check('main-import', fs.readFileSync(path.join(ROOT, 'src', 'main.js'), 'utf8').includes("import './ui/scanlog.js';"));
  // timing logs present in async client
  const pa = fs.readFileSync(path.join(ROOT, 'src', 'core', 'patterns-async.js'), 'utf8');
  check('pa-logs', pa.includes('restored from checkpoint') && pa.includes('finding') && pa.includes('classes,'));
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });

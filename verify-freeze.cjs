const fs = require('fs');
let fail = 0;
const check = (l, c) => { console.log((c ? 'PASS ' : 'FAIL ') + l); if (!c) fail++; };
for (const f of ['src/ingest/apk.js', 'src/ingest/source.js']) {
  const s = fs.readFileSync(f, 'utf8');
  check(f + ' async-import', s.includes("from '../core/patterns-async.js';") && s.includes('resumableCategory'));
  check(f + ' save-import', s.includes("from '../ui/history.js';"));
  check(f + ' checkpoint-import', s.includes("from '../core/checkpoint.js';"));
  check(f + ' no-sync-patterns-call', !s.includes('= analyzePatterns('));
  check(f + ' no-sync-endpoints-call', !s.includes('= extractEndpoints('));
}
const a = fs.readFileSync('src/ingest/apk.js', 'utf8');
check('dex-worker-call', a.includes('await disassembleDexAsync('));
check('dex-skip', a.includes("if (/\\.dex$/i.test(files[i].path) || files[i].path === 'AndroidManifest.xml') continue;"));
check('no-direct-dex-import', !a.includes("from '../core/dex.js'"));
process.exit(fail ? 1 : 0);

const fs = require('fs');
let fail = 0;
const chk = (l, c) => { console.log((c ? 'PASS ' : 'FAIL ') + l); if (!c) fail++; };
for (const f of ['src/ingest/apk.js', 'src/ingest/source.js']) {
  const s = fs.readFileSync(f, 'utf8');
  chk(f + ' save-call', s.includes('saveCurrentScan().catch'));
  chk(f + ' save-import', s.includes("from '../ui/history.js';"));
}
const h = fs.readFileSync('src-legacy/head.html', 'utf8'); // source of truth, not the built index.html
chk('history-section', h.includes('id="scanHistorySection"') && h.includes('id="scanHistoryList"'));
chk('jadx-details', h.includes('id="jadxAdvanced"'));
chk('single-decompiled-zone', (h.match(/id="decompiledUploadZone"/g) || []).length === 1);
chk('jadx-optional', h.includes('(Optional)'));
chk('main-history-import', fs.readFileSync('src/main.js', 'utf8').includes("import './ui/history.js';"));
process.exit(fail ? 1 : 0);

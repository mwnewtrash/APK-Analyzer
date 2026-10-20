const path = require('path');
const ROOT = path.join(__dirname, '..');
const furl = (p) => 'file://' + p.replace(/\\/g, '/');
async function main() {
  let fail = 0;
  const check = (l, c) => { console.log((c ? 'PASS ' : 'FAIL ') + l); if (!c) fail++; };
  // import-safe despite ingest cycle (no top-level DOM/eval-time calls)
  const H = await import(furl(path.join(ROOT, 'src', 'ui', 'history.js')));
  check('imports', typeof H.saveCurrentScan === 'function' && typeof H.viewScan === 'function');
  const { state } = await import(furl(path.join(ROOT, 'src', 'core', 'state.js')));
  state.currentRootResults = [
    { name: 'R1', detected: true, instances: [{ lineNumber: 1, file: 'a.smali', content: 'x', pattern: 'p' }] },
    { name: 'R2', detected: false, instances: [] },
  ];
  state.extractedEndpoints = [{ url: 'https://example.com', category: 'HTTP/S', type: 'http' }];
  state.analyzedPermComponents = [{ type: 'activity', name: 'A' }];
  state.customPermissions = { 'com.x.P': 'signature' };
  state.appPermission = null;
  state.globalAPKData.file = { name: 't.apk', size: 1234 };
  const snap = H.snapshotState();
  check('snapshot-keys', Array.isArray(snap.currentRootResults) && Array.isArray(snap.extractedEndpoints) && snap.customPermissions['com.x.P'] === 'signature');
  const s = H.summarize(snap);
  check('summary', s.total === 2 && s.detected === 1 && s.endpoints === 1);
  // structured-cloneable (IndexedDB requirement)
  try {
    structuredClone(snap);
    check('cloneable', true);
  } catch { check('cloneable', false); }
  // save degrades gracefully without indexedDB
  try { await H.saveCurrentScan(); check('save-noIDB-survives', true); }
  catch { check('save-noIDB-survives', false); }
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });

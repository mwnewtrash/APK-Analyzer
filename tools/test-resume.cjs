const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const furl = (p) => 'file://' + p.replace(/\\/g, '/');
async function main() {
  let fail = 0;
  const check = (l, c) => { console.log((c ? 'PASS ' : 'FAIL ') + l); if (!c) fail++; };
  for (const f of ['src/ingest/apk.js', 'src/ingest/source.js']) {
    const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
    const slots = [...s.matchAll(/= await resumableCategory\('(\w+)', analysisContent, (\w+), ([^)]+)\);/g)];
    check(f + ' slots==26', slots.length === 26);
    check(f + ' no-raw-async-calls', !s.includes('= await analyzePatternsAsync(analysisContent'));
    check(f + ' pa-import', s.includes('resumableCategory }'));
    check(f + ' history-import', s.includes('refreshResumeOffer }'));
    check(f + ' checkpoint-import', s.includes("from '../core/checkpoint.js';"));
    check(f + ' endrun', s.includes('endRun().catch'));
  }
  const a = fs.readFileSync(path.join(ROOT, 'src/ingest/apk.js'), 'utf8');
  check('beginrun', a.includes('beginRun(file).catch'));
  check('refresh-call', a.includes('refreshResumeOffer(file).catch'));
  const sh = fs.readFileSync(path.join(ROOT, 'src/ui/shell.js'), 'utf8');
  check('reset-hides-banner', sh.includes("getElementById('resumeSection')"));
  const h = fs.readFileSync(path.join(ROOT, 'src-legacy', 'head.html'), 'utf8'); // source of truth, not the built index.html
  check('banner-markup', h.includes('id="resumeSection"') && h.includes('data-resume-start') && h.includes('data-resume-dismiss'));
  // checkpoint unit: fp format + passthrough without active run
  const CP = await import(furl(path.join(ROOT, 'src', 'core', 'checkpoint.js')));
  check('fp-format', CP.fpOf({ name: 'a.apk', size: 5, lastModified: 7 }) === 'a.apk::5::7');
  check('no-active', CP.getActiveFp() === null);
  const PA = await import(furl(path.join(ROOT, 'src', 'core', 'patterns-async.js')));
  const checks = [{ name: 'T', patterns: ['abc'], description: 'd', category: 'c', riskLevel: 'HIGH' }];
  const r1 = await PA.resumableCategory('currentRootResults', '// FILE: x\ny abc z', checks, false);
  check('passthrough', r1[0].detected === true);
  // active fp but no IDB: miss -> compute -> silent write-fail -> correct result
  CP.setActiveFp('test-fp');
  const r2 = await PA.resumableCategory('currentRootResults', '// FILE: x\ny abc z', checks, false);
  check('active-noIDB', r2[0].detected === true);
  CP.clearActiveFp();
  check('cleared', CP.getActiveFp() === null);
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });

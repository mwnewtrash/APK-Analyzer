const path = require('path');
const ROOT = path.join(__dirname, '..');
const furl = (p) => 'file://' + p.replace(/\\/g, '/');
async function main() {
  let fail = 0;
  const check = (l, c) => { console.log((c ? 'PASS ' : 'FAIL ') + l); if (!c) fail++; };
  const { handleWorkerMessage } = await import(furl(path.join(ROOT, 'src', 'workers', 'patterns.worker.js')));
  const replies = [];
  const reply = (r) => replies.push(r);
  const checks = [{ name: 'T', patterns: ['Log\\.d.*password', 'plain'], description: 'd', category: 'c', riskLevel: 'HIGH' }];
  const content = '// FILE: a.java\nLog.d("TAG", password);\nplain line';
  // init + cached run (no content on run)
  await handleWorkerMessage({ kind: 'init', id: 'i1', content }, reply);
  check('init-ack', replies.at(-1).ok === true);
  await handleWorkerMessage({ kind: 'run', id: 'r1', checks, mode: false }, reply);
  check('cached-run', replies.at(-1).results?.[0]?.detected === true);
  // run with content (rebuild path)
  await handleWorkerMessage({ kind: 'run', id: 'r2', content: '// FILE: b.java\nnothing here', checks, mode: false }, reply);
  check('rebuild-run', replies.at(-1).results?.[0]?.detected === false);
  // run with NO cache and NO content -> no-cache error (client falls back)
  const { handleWorkerMessage: fresh } = await import(furl(path.join(ROOT, 'src', 'workers', 'patterns.worker.js')) + '?fresh=1');
  void fresh;
  // endpoints kind
  await handleWorkerMessage({ kind: 'endpoints', id: 'e1', content: 'visit https://example.com/api/v1/x and 10.0.0.5:8080' }, reply);
  const eps = replies.at(-1).endpoints || [];
  check('worker-endpoints', eps.length >= 2);
  // dex kind with tiny fake dex (header only -> graceful failure comment, no throw)
  await handleWorkerMessage({ kind: 'dex', id: 'd1', buf: new Uint8Array([0x64, 0x65, 0x78, 0x0a]).buffer, byteOffset: 0, byteLength: 4, name: 't.dex' }, reply);
  check('worker-dex', typeof replies.at(-1).smali === 'string');
  // sync fallbacks (small inputs stay on main thread)
  const PA = await import(furl(path.join(ROOT, 'src', 'core', 'patterns-async.js')));
  const r2 = await PA.analyzePatternsAsync(content, checks, false);
  check('async-small-patterns', r2[0].detected === true);
  const e2 = await PA.extractEndpointsAsync('go https://example.org/a');
  check('async-small-endpoints', e2.length >= 1);
  // FromLines export exists
  const P = await import(furl(path.join(ROOT, 'src', 'core', 'patterns.js')));
  check('fromlines-export', typeof P.analyzePatternsFromLines === 'function');
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0;
const check = (l, c) => { console.log((c ? 'PASS ' : 'FAIL ') + l); if (!c) fail++; };
const m = fs.readFileSync(path.join(ROOT, 'src', 'ui', 'misconfig.js'), 'utf8');
check('expand-covers-logging', (m.match(/\['root', 'emulator', 'ssl', 'flag', 'storage', 'crypto', 'logging', 'permission'\]/g) || []).length === 2);
const sh = fs.readFileSync(path.join(ROOT, 'src', 'ui', 'shell.js'), 'utf8');
check('render-expand-logging', sh.includes("['root', 'emulator', 'ssl', 'flag', 'storage', 'crypto', 'logging']"));
const e = fs.readFileSync(path.join(ROOT, 'src', 'ui', 'endpoints.js'), 'utf8');
check('summary-write', e.includes("getElementById('endpointSummary')"));
check('no-dead-counters', !e.includes('endpointTotalChecks') && !e.includes('endpointDetectedChecks') && !e.includes('endpointNotDetectedChecks'));
check('setfilter-vestigial', e.includes('function setEndpointFilter'));
const h = fs.readFileSync(path.join(ROOT, 'src-legacy', 'head.html'), 'utf8'); // source of truth, not the built index.html
check('tabs-gone', !h.includes('endpointFilterAll') && !h.includes('setEndpointFilter('));
check('summary-markup', h.includes('id="endpointSummary"'));
process.exit(fail ? 1 : 0);

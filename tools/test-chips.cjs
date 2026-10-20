const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
let fail = 0;
const check = (l, c) => { console.log((c ? 'PASS ' : 'FAIL ') + l); if (!c) fail++; };
const e = fs.readFileSync(path.join(ROOT, 'src', 'ui', 'endpoints.js'), 'utf8');
// ws normalization: no 'websocket' left in DOM-id positions, filter type kept
check('ws-arrays', (e.match(/\['http', 'api', 'ws', 'deeplink', 'cloud', 'ip'\]/g) || []).length === 4);
check('no-websocket-ids', !e.includes('websocketEndpointChip') && !e.includes('websocketEndpointSection'));
check('filter-type-kept', e.includes("sectionMap") && e.includes("'websocket': 'wsEndpointResults'"));
// isolate toggle
check('isolate-toggle', e.includes('wasIsolated') && e.includes("textContent = 'Expand All'") && e.includes("textContent = 'Collapse All'"));
// unique domains dedicated view (replaces the old silent-filter approach)
const sh = fs.readFileSync(path.join(ROOT, 'src', 'ui', 'shell.js'), 'utf8');
check('reset-unique', sh.includes("getElementById('uniqueDomainChip')?.classList.remove('active')"));
check('render-expand', sh.includes("['root', 'emulator', 'ssl', 'flag', 'storage', 'crypto', 'logging']"));
check('unique-view-fns', e.includes('function renderUniqueDomains(q)') && e.includes('function hostOf(url)') && e.includes('function uniqueCard(g)'));
check('unique-early-return', e.includes("getElementById('uniqueDomainChip')?.classList.contains('active')") && e.includes('renderUniqueDomains(searchTerm);'));
check('no-silent-filter', !e.includes('__seenU') && !e.includes('__uniqueActive'));
check('expand-parks-unique', e.includes("getElementById('uniqueEndpointSection')?.classList.remove('visible')"));
// markup defaults cleared
const h = fs.readFileSync(path.join(ROOT, 'src-legacy', 'head.html'), 'utf8'); // source of truth, not the built index.html
check('unique-section-markup', h.includes('id="uniqueEndpointSection"') && h.includes('id="uniqueEndpointResults"'));
check('no-default-active', !h.includes('section-chip active'));
check('no-default-visible', !h.includes('section-content-block visible'));
check('ws-onclick', h.includes("toggleEndpointSectionChip('ws')"));
check('unique-chip', h.includes('id="uniqueDomainChip"') && h.includes('toggleUniqueDomains()') && h.includes('id="uniqueDomainCount"'));
check('grid-roomy', h.includes('grid grid-cols-2 md:grid-cols-3 gap-3 mb-6') && !h.includes('lg:grid-cols-7'));
// main wiring
const m = fs.readFileSync(path.join(ROOT, 'src', 'main.js'), 'utf8');
check('toggle-fn', m.includes('export function toggleUniqueDomains()'));
check('toggle-isolate', m.includes("getElementById('uniqueEndpointSection')?.classList.add('visible')"));
check('toggle-exposed', /toggleEndpointSectionChip,\n  setEndpointFilter, exportEndpoints, toggleUniqueDomains,/.test(m));
process.exit(fail ? 1 : 0);

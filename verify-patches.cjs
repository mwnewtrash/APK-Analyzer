const fs=require('fs');
let fail=0;
function check(label, cond){ console.log((cond?'PASS ':'FAIL ')+label); if(!cond) fail++; }
let s=fs.readFileSync('src/ingest/dynamic.js','utf8');
check('LOOP', s.includes('while (true)'));
let m=fs.readFileSync('src/ui/misconfig.js','utf8');
check('MAP', m.includes("'Permission Security':'flagCatPermission'"));
check('OLD-GONE', !m.includes("category.replace"));
let e=fs.readFileSync('src/core/endpoints.js','utf8');
check('OCTET', e.includes('25[0-5]'));
check('BLOCK', e.includes('javascript'));
let a=fs.readFileSync('src/ingest/apk.js','utf8');
check('RESET-APK', a.includes('state.analyzedPermComponents = []'));
let so=fs.readFileSync('src/ingest/source.js','utf8');
check('RESET-SRC', so.includes('state.analyzedPermComponents = []'));
let man=fs.readFileSync('src/core/manifest.js','utf8');
check('RESET-MAN', man.includes('state.analyzedPermComponents = []'));
check('DEAD-GONE', !s.includes('Analyze Java/Kotlin'));
let h=fs.readFileSync('src-legacy/head.html','utf8'); // source of truth, not the built index.html
check('DUP-COUNT==1', (h.match(/toggleAllSectionsBtn/g)||[]).length===1);
check('SAST', !h.includes('(DAST)') && h.includes('(SAST)'));
check('DENSITY', !h.includes('Security Score') && h.includes('Indicator Density'));
check('ORPHAN-GONE', !h.includes('user-select: none;\n        }\n        .section-chip:hover'));
// #13 endpoint expansion reset
let ep=fs.readFileSync('src/ui/endpoints.js','utf8');
check('ENDPOINT-RESET', ep.includes('state.allEndpointSectionsExpanded = true;\n                state.currentEndpointSection = null;'));
// #14 permission-section guard
check('PERM-GUARD', (man.match(/permissionSection/g) || []).length >= 2);
// #15 cap 50 + single pass
let p=fs.readFileSync('src/core/patterns.js','utf8');
check('CAP50', p.includes('>= 50') && !p.includes('>= 20'));
// #16 SRI
check('SRI-TW', h.includes('tailwindcss/browser@4.3.3') && h.includes('integrity="sha384-'));
check('SRI-ZIP', h.includes('jszip.min.js" integrity="sha384-'));
// #17 zip-bomb guard
check('ZIP-GUARD', a.includes('50 * 1024 * 1024') && a.includes('500 * 1024 * 1024'));
// #18 worker
check('WORKER-CALLS', (a.match(/await resumableCategory\('/g) || []).length === 26 && (so.match(/await resumableCategory\('/g) || []).length === 26);
check('WORKER-FILES', fs.existsSync('src/workers/patterns.worker.js') && fs.existsSync('src/core/patterns-async.js') && fs.existsSync('dist/assets/patterns.worker-Bl_3DbOu.js') || (fs.existsSync('src/workers/patterns.worker.js') && fs.readdirSync('dist/assets').some(f=>f.startsWith('patterns.worker-'))));
// #19 a11y
check('A11Y', fs.existsSync('src/ui/a11y.js') && fs.readFileSync('src/main.js','utf8').includes('enhanceA11y'));
// #20 export report
check('EXPORT-RPT', h.includes('exportReportJSON()') && h.includes('exportReportHTML()') && fs.existsSync('src/ui/export-report.js'));
// #21 split-apk
check('SPLITAPK', a.includes('.apk$/i') && h.includes('accept=".apk,.apks,.xapk"') && fs.readFileSync('src/main.js','utf8').includes('apks|xapk'));
// #22 mem churn
check('JOIN', a.includes("contentParts.join('')") && !a.includes('allContent +='));
check('LOW-PASS', p.includes('const low = effectiveLine.toLowerCase()') && p.includes('low: p.toLowerCase()'));
// #23 sql.js
check('SQLITE', s.includes("import('sql.js')") && fs.existsSync('node_modules/sql.js'));
// #24 dedup
let c=fs.readFileSync('src/engine/checks.js','utf8');
check('DEDUP-JWT', !c.includes("'JWT', 'JsonWebToken', 'jwt',"));
check('DEDUP-BEARER', !c.includes("'Authorization', 'Bearer', 'X-Auth-Token'"));
check('DEDUP-ROLE', !c.includes("'isAdmin()'"));
process.exit(fail?1:0);

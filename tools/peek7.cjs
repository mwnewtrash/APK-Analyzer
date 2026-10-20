// check the 3 unassigned: callers + bodies
const x = require('../xref2.json');
for (const k of ['toggleAllDynamicSections','expandAllDynamicSectionsInternal','collapseAllDynamicSectionsInternal']) {
  console.log('=== ' + k + ' ===');
  console.log(JSON.stringify(x[k], null, 1).slice(0, 900));
}
const fs = require('fs');
const code = fs.readFileSync('../src-legacy/code.js', 'utf8');
for (const k of ['toggleAllDynamicSections','expandAllDynamicSectionsInternal','collapseAllDynamicSectionsInternal']) {
  const re = new RegExp(k + '\\(', 'g');
  const hits = [];
  let m; while ((m = re.exec(code)) && hits.length < 8) hits.push(code.slice(Math.max(0, m.index - 80), m.index + 60).replace(/\n/g, ' '));
  console.log('--- call sites of ' + k + ' ---');
  hits.forEach(h => console.log('  ' + h));
}

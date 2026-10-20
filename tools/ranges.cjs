const fs = require('fs');
const x = require('../xref.json');
const want = ['analyzePatterns','extractEndpoints','readDirectoryRecursive','readDirectoryRecursiveForSource','setFlagCategoryFilter','setStorageCategoryFilter','analyzeAPKGlobal','analyzeDecompiledSourceOnly','analyzePermissionsFromManifest','analyzeOtherFiles','toggleSection','expandAllDynamicSections','collapseAllDynamicSections','escapeHtml','copyToClipboard'];
const byName = {};
for (const d of x.decls) { (byName[d.name] = byName[d.name] || []).push(d); }
for (const n of want) {
  const arr = byName[n];
  if (!arr) { console.log(n.padEnd(34), 'NOT FOUND'); continue; }
  for (const d of arr) {
    console.log(n.padEnd(34), d.kind.padEnd(10), 'start='+d.start, 'end='+d.end, 'len='+(d.end-d.start));
  }
}
console.log('--- total decls:', x.decls.length, 'code.js bytes:', fs.statSync('../src-legacy/code.js').size);

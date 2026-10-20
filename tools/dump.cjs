const fs = require('fs');
const x = require('../xref.json');
console.log('TOP KEYS:', Object.keys(x));
console.log('total:', x.total);
if (x.decls) {
  console.log('decls is array len', x.decls.length, 'sample:', JSON.stringify(x.decls[0]));
}
if (x.mutableGlobals) console.log('mutableGlobals sample:', JSON.stringify(x.mutableGlobals.slice(0,3)));
console.log('--- decl names by kind ---');
const byKind = {};
for (const d of x.decls) { (byKind[d.kind] = byKind[d.kind]||[]).push(d.name); }
for (const k in byKind) console.log(k + ' (' + byKind[k].length + '): ' + byKind[k].join(', '));

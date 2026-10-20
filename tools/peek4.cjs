// list all function + const names for module assignment
const x = require('../xref.json');
console.log('FUNCTIONS:');
for (const d of x.decls.filter(d => d.kind === 'function')) console.log('  ' + d.name);
console.log('CONSTS:');
for (const d of x.decls.filter(d => d.kind === 'const')) console.log('  ' + d.name);
console.log('LETS:');
for (const d of x.decls.filter(d => d.kind === 'let' || d.kind === 'var')) console.log('  ' + d.name);

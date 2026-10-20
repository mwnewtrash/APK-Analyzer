'use strict';
const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const CODE = fs.readFileSync(path.join(__dirname, '..', 'src-legacy', 'code.js'), 'utf8');
const ast = acorn.parse(CODE, { ecmaVersion: 2022, ranges: true });
for (const n of ast.body) {
  if (n.type === 'FunctionDeclaration' && n.id) console.log(`func\t${n.id.name}`);
  else if (n.type === 'VariableDeclaration') for (const d of n.declarations) if (d.id.type === 'Identifier') console.log(`${n.kind}\t${d.id.name}`);
}

// list multi-declarator state statements
const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const ROOT = path.join(__dirname, '..');
const code = fs.readFileSync(path.join(ROOT, 'src-legacy', 'code.js'), 'utf8');
const xref = JSON.parse(fs.readFileSync(path.join(ROOT, 'xref.json'), 'utf8'));
const MUT = new Set(xref.mutableGlobals.map(m => m.name));
const ast = acorn.parse(code, { ecmaVersion: 2022, locations: true, sourceType: 'script' });
for (const n of ast.body) {
  if (n.type !== 'VariableDeclaration') continue;
  const names = n.declarations.map(d => d.id.name);
  if (names.some(x => MUT.has(x))) {
    console.log(`${n.kind} [${names.join(', ')}] line ${n.loc.start.line} len ${n.end - n.start}`);
  }
}

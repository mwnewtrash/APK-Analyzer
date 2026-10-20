// Audit: find top-level functions whose params/locals shadow mutable-global names.
const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const walk = require('acorn-walk');
const ROOT = path.join(__dirname, '..');
const code = fs.readFileSync(path.join(ROOT, 'src-legacy', 'code.js'), 'utf8');
const xref = JSON.parse(fs.readFileSync(path.join(ROOT, 'xref.json'), 'utf8'));
const mut = new Set(xref.mutableGlobals.map(m => m.name));
const ast = acorn.parse(code, { ecmaVersion: 2022, locations: true, sourceType: 'script' });
function patNames(p, out) {
  if (!p) return;
  if (p.type === 'Identifier') out.add(p.name);
  else if (p.type === 'ObjectPattern') p.properties.forEach(x => patNames(x.value || x.argument, out));
  else if (p.type === 'ArrayPattern') p.elements.forEach(e => patNames(e, out));
  else if (p.type === 'AssignmentPattern') patNames(p.left, out);
  else if (p.type === 'RestElement') patNames(p.argument, out);
}
const collisions = [];
for (const n of ast.body) {
  if (n.type !== 'FunctionDeclaration') continue;
  const bound = new Set();
  n.params.forEach(p => patNames(p, bound));
  walk.full(n.body, (x) => {
    if (x.type === 'VariableDeclarator') patNames(x.id, bound);
    else if (x.type === 'FunctionDeclaration') { if (x.id) bound.add(x.id.name); x.params.forEach(p => patNames(p, bound)); }
    else if (x.type === 'CatchClause') patNames(x.param, bound);
  });
  const hit = [...bound].filter(b => mut.has(b));
  if (hit.length) collisions.push({ fn: n.id.name, shadow: hit });
}
// initializers of mutable globals
const inits = {};
for (const n of ast.body) {
  if (n.type === 'VariableDeclaration') for (const d of n.declarations) {
    if (mut.has(d.id.name)) inits[d.id.name] = { kind: n.kind, init: code.slice(d.init ? d.init.start : d.start, d.init ? d.init.end : d.end) };
  }
}
console.log('SHADOW COLLISIONS: ' + JSON.stringify(collisions, null, 1));
console.log('INIT COUNT: ' + Object.keys(inits).length);
for (const [k, v] of Object.entries(inits)) console.log(`INIT ${v.kind} ${k} = ${v.init.slice(0, 60).replace(/\n/g, ' ')}`);

// Full dependency + purity analysis for modularization.
const fs = require('fs');
const acorn = require('acorn');
const path = require('path');
const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'src-legacy', 'code.js'), 'utf8');
const ast = acorn.parse(src, { ecmaVersion: 2022, locations: true, sourceType: 'script' });

const decls = new Map();
for (const stmt of ast.body) {
  if (stmt.type === 'FunctionDeclaration' && stmt.id) {
    decls.set(stmt.id.name, { name: stmt.id.name, kind: 'function', start: stmt.start, end: stmt.end, line: stmt.loc.start.line, refs: new Set() });
  } else if (stmt.type === 'VariableDeclaration') {
    for (const d of stmt.declarations) if (d.id.type === 'Identifier') {
      decls.set(d.id.name, { name: d.id.name, kind: stmt.kind, start: stmt.start, end: stmt.end, line: d.loc.start.line, refs: new Set() });
    }
  }
}
const constNames = new Set([...decls.values()].filter(d => d.kind === 'const').map(d => d.name));
const mutableNames = new Set([...decls.values()].filter(d => d.kind === 'let' || d.kind === 'var').map(d => d.name));
const fnNames = new Set([...decls.values()].filter(d => d.kind === 'function').map(d => d.name));

function collectPattern(p, set) {
  if (!p) return;
  if (p.type === 'Identifier') set.add(p.name);
  else if (p.type === 'ObjectPattern') p.properties.forEach(pp => collectPattern(pp.value || pp.argument, set));
  else if (p.type === 'ArrayPattern') p.elements.forEach(e => collectPattern(e, set));
  else if (p.type === 'AssignmentPattern') collectPattern(p.left, set);
  else if (p.type === 'RestElement') collectPattern(p.argument, set);
}
function walk(node, scope, name) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) { node.forEach(n => walk(n, scope, name)); return; }
  switch (node.type) {
    case 'Identifier': {
      const n = node.name;
      if (decls.has(n) && n !== name && !scope.has(n)) decls.get(name).refs.add(n);
      return;
    }
    case 'FunctionDeclaration': case 'FunctionExpression': case 'ArrowFunctionExpression': {
      const s = new Set(scope);
      for (const p of node.params) collectPattern(p, s);
      if (node.id) s.add(node.id.name);
      for (const k in node) if (k !== 'type') walk(node[k], s, name);
      return;
    }
    case 'BlockStatement': {
      const s = new Set(scope);
      for (const st of node.body) {
        if (st.type === 'VariableDeclaration') for (const dd of st.declarations) collectPattern(dd.id, s);
        else if (st.type === 'FunctionDeclaration' && st.id) s.add(st.id.name);
      }
      for (const k in node) walk(node[k], s, name);
      return;
    }
    case 'VariableDeclarator': { collectPattern(node.id, scope); walk(node.init, scope, name); return; }
    default: for (const k in node) if (k !== 'type' && node[k] && typeof node[k] === 'object') walk(node[k], scope, name);
  }
}
for (const [name] of decls) {
  const node = ast.body.find(s =>
    (s.type === 'FunctionDeclaration' && s.id && s.id.name === name) ||
    (s.type === 'VariableDeclaration' && s.declarations.some(x => x.id.type === 'Identifier' && x.id.name === name)));
  if (node) walk(node, new Set([name]), name);
}
function reachesMutable(name, seen = new Set()) {
  if (seen.has(name)) return false;
  seen.add(name);
  const d = decls.get(name);
  if (!d) return false;
  for (const r of d.refs) {
    if (mutableNames.has(r)) return true;
    if (fnNames.has(r) && reachesMutable(r, seen)) return true;
  }
  return false;
}
const pureFns = [], statefulFns = [];
for (const n of fnNames) (reachesMutable(n) ? statefulFns : pureFns).push(n);
const out = {
  consts: [...constNames].sort(),
  mutable: [...mutableNames].sort(),
  pureFunctions: pureFns.sort(),
  statefulFunctions: statefulFns.sort(),
  edges: Object.fromEntries([...decls].map(([k, v]) => [k, [...v.refs].sort()]))
};
fs.writeFileSync(path.join(root, 'deps.json'), JSON.stringify(out, null, 2));
console.log('consts:', out.consts.length, 'mutable:', out.mutable.length, 'pure fns:', out.pureFunctions.length, 'stateful fns:', out.statefulFunctions.length);
console.log('PURE:', out.pureFunctions.join(', '));
console.log('STATEFUL:', out.statefulFunctions.join(', '));

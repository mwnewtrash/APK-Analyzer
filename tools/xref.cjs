// Build a full cross-reference model of code.js for safe modularization.
const fs = require('fs');
const acorn = require('acorn');

const src = fs.readFileSync('src-legacy/code.js', 'utf8');
const ast = acorn.parse(src, { ecmaVersion: 2022, locations: true, sourceType: 'script' });

const top = new Map(); // name -> {kind, line, start, end}
for (const stmt of ast.body) {
  if (stmt.type === 'FunctionDeclaration' && stmt.id) top.set(stmt.id.name, { kind: 'function', line: stmt.loc.start.line, start: stmt.start, end: stmt.end });
  else if (stmt.type === 'VariableDeclaration') for (const d of stmt.declarations) if (d.id.type === 'Identifier') top.set(d.id.name, { kind: stmt.kind, line: d.loc.start.line, start: stmt.start, end: stmt.end });
}

const reassigned = new Set();
function declNames(node) {
  const names = [];
  if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
    for (const p of node.params) collect(p, names);
    if (node.type === 'FunctionDeclaration' && node.id) names.push(node.id.name);
  }
  if (node.type === 'BlockStatement') for (const s of node.body) {
    if (s.type === 'VariableDeclaration') for (const d of s.declarations) collect(d.id, names);
    else if (s.type === 'FunctionDeclaration' && s.id) names.push(s.id.name);
    else if (s.type === 'ClassDeclaration' && s.id) names.push(s.id.name);
  }
  if (node.type === 'CatchClause' && node.param) collect(node.param, names);
  if (node.type === 'VariableDeclaration') for (const d of node.declarations) collect(d.id, names);
  return names;
}
function collect(pat, out) {
  if (!pat) return;
  if (pat.type === 'Identifier') out.push(pat.name);
  else if (pat.type === 'ObjectPattern') pat.properties.forEach(p => collect(p.value || p.argument, out));
  else if (pat.type === 'ArrayPattern') pat.elements.forEach(e => collect(e, out));
  else if (pat.type === 'AssignmentPattern') collect(pat.left, out);
  else if (pat.type === 'RestElement') collect(pat.argument, out);
}
function resolvesTop(name, ancestors) {
  if (!top.has(name)) return false;
  for (let i = ancestors.length - 1; i >= 1; i--) if (ancestors[i]._dn && ancestors[i]._dn.includes(name)) return false;
  return true;
}


const fnRefs = new Map(); // fnName -> Set(topName)
const mutableRefCount = new Map(); // name -> count

(function pass1() {
  function visit(node, anc) {
    if (!node || typeof node.type !== 'string') return;
    const dn = declNames(node);
    if (dn.length) node._dn = dn;
    const na = dn.length ? anc.concat(node) : anc;
    if (node.type === 'AssignmentExpression' && node.left.type === 'Identifier' && resolvesTop(node.left.name, na)) reassigned.add(node.left.name);
    if (node.type === 'UpdateExpression' && node.argument.type === 'Identifier' && resolvesTop(node.argument.name, na)) reassigned.add(node.argument.name);
    for (const k in node) {
      if (k === '_dn' || k === 'start' || k === 'end' || k === 'loc' || k === 'range') continue;
      const v = node[k];
      if (Array.isArray(v)) v.forEach(x => x && x.type && visit(x, na));
      else if (v && v.type) visit(v, na);
    }
  }
  visit(ast, [ast]);
})();

const mutable = new Set();
for (const [name, info] of top) if (reassigned.has(name) || info.kind === 'let' || info.kind === 'var') mutable.add(name);

(function pass2() {
  function visit(node, anc, curFn) {
    if (!node || typeof node.type !== 'string') return;
    const dn = declNames(node);
    if (dn.length) node._dn = dn;
    const na = dn.length ? anc.concat(node) : anc;
    let fn = curFn;
    if ((node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') && node.id) fn = node.id.name;
    if (node.type === 'Identifier' && resolvesTop(node.name, na)) {
      if (fn) { if (!fnRefs.has(fn)) fnRefs.set(fn, new Set()); fnRefs.get(fn).add(node.name); }
      if (mutable.has(node.name)) mutableRefCount.set(node.name, (mutableRefCount.get(node.name) || 0) + 1);
    }
    for (const k in node) {
      if (k === '_dn' || k === 'start' || k === 'end' || k === 'loc' || k === 'range') continue;
      const v = node[k];
      if (Array.isArray(v)) v.forEach(x => x && x.type && visit(x, na, fn));
      else if (v && v.type) visit(v, na, fn);
    }
  }
  visit(ast, [ast], null);
})();

const decls = [...top.entries()].map(([name, info]) => ({
  name, kind: info.kind, line: info.line, start: info.start, end: info.end,
  mutable: mutable.has(name), reassigned: reassigned.has(name),
  refs: [...(fnRefs.get(name) || [])].filter(n => n !== name).sort()
})).sort((a, b) => a.line - b.line);

const out = {
  total: decls.length,
  mutableGlobals: [...mutable].sort().map(n => ({ name: n, refs: mutableRefCount.get(n) || 0 })),
  consts: decls.filter(d => d.kind === 'const').map(d => d.name),
  functions: decls.filter(d => d.kind === 'function').map(d => d.name),
  decls
};
fs.writeFileSync('xref.json', JSON.stringify(out, null, 2));

console.log('TOTAL decls:', decls.length);
console.log('\nMUTABLE GLOBALS (' + out.mutableGlobals.length + ') by ref count:');
for (const m of out.mutableGlobals.sort((a, b) => b.refs - a.refs)) console.log('  ' + m.refs.toString().padStart(4) + '  ' + m.name);
console.log('\nCONST DATA (kind=const):', out.consts.length);
console.log('FUNCTIONS:', out.functions.length);

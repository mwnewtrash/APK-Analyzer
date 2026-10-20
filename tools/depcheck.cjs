'use strict';
const fs = require('fs');
const path = require('path');
const acorn = require('acorn');

const CODE = fs.readFileSync(path.join(__dirname, '..', 'src-legacy', 'code.js'), 'utf8');
const ast = acorn.parse(CODE, { ecmaVersion: 2022, locations: false, ranges: true });

// Collect top-level declarations (names + byte ranges) + which names are mutable let/var.
const topNames = new Set();
const mutable = new Set();
for (const node of ast.body) {
  if (node.type === 'VariableDeclaration') {
    for (const d of node.declarations) collectPat(d.id, topNames);
    if (node.kind !== 'const') for (const d of node.declarations) collectPat(d.id, mutable);
  } else if (node.type === 'FunctionDeclaration' && node.id) {
    topNames.add(node.id.name);
  }
}

function collectPat(p, set) {
  if (!p) return;
  if (p.type === 'Identifier') set.add(p.name);
  else if (p.type === 'ObjectPattern') p.properties.forEach(pr => collectPat(pr.value || pr.argument, set));
  else if (p.type === 'ArrayPattern') p.elements.forEach(e => collectPat(e, set));
}

// Simple scope tracker: given a function node, find locally bound names.
function boundNames(fn) {
  const bound = new Set();
  if (fn.params) fn.params.forEach(p => collectPat(p, bound));
  // walk body for var/let/const/function/class decls + params of nested fns + catch
  walk(fn.body, n => {
    if (n.type === 'VariableDeclaration') n.declarations.forEach(d => collectPat(d.id, bound));
    else if (n.type === 'FunctionDeclaration' && n.id) bound.add(n.id.name);
    else if (n.type === 'ClassDeclaration' && n.id) bound.add(n.id.name);
    else if ((n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression')) {
      (n.params || []).forEach(p => collectPat(p, bound));
    }
    if (n.type === 'CatchClause' && n.param) collectPat(n.param, bound);
  });
  return bound;
}

function walk(node, visit) {
  if (!node || typeof node.type !== 'string') return;
  visit(node);
  for (const k in node) {
    if (k === 'type' || k === 'start' || k === 'end') continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach(c => c && typeof c.type === 'string' && walk(c, visit));
    else if (v && typeof v.type === 'string') walk(v, visit);
  }
}

// Referenced identifiers in reference position (not object keys, not member props, not decl ids).
function referenced(fn) {
  const refs = new Set();
  const bound = boundNames(fn);
  walk(fn, n => {
    if (n.type === 'Identifier') refs.add(n.name);
  });
  // remove bound locals
  bound.forEach(b => refs.delete(b));
  return refs;
}

const targets = process.argv.slice(2);
const byName = new Map();
for (const node of ast.body) {
  if (node.type === 'FunctionDeclaration' && node.id) byName.set(node.id.name, node);
  if (node.type === 'VariableDeclaration') for (const d of node.declarations) if (d.id.type === 'Identifier') byName.set(d.id.name, node);
}

for (const t of targets) {
  const node = byName.get(t);
  if (!node) { console.log(`MISSING: ${t}`); continue; }
  const refs = referenced(node);
  const stateDeps = [...refs].filter(r => mutable.has(r));
  const topDeps = [...refs].filter(r => topNames.has(r) && !mutable.has(r));
  const kind = node.type === 'FunctionDeclaration' ? 'func' : 'const/var';
  console.log(`${t} [${kind}] stateDeps=[${stateDeps.join(',')}] topConstDeps=[${topDeps.join(',')}]`);
}

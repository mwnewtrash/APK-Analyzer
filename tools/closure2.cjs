#!/usr/bin/env node
/* Computes, per top-level declaration in src-legacy/code.js, the set of OTHER
   top-level declaration names it references. Uses acorn + a self-contained scope
   resolver so shadowed locals are ignored. Writes closure2.json. */
const fs = require('fs');
const path = require('path');
const acorn = require('acorn');

const root = path.join(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'src-legacy', 'code.js'), 'utf8');
const ast = acorn.parse(code, { ecmaVersion: 2022, sourceType: 'script', locations: true, ranges: true });

const topNames = new Set();
const declNodes = [];
for (const stmt of ast.body) {
  if (stmt.type === 'FunctionDeclaration') { topNames.add(stmt.id.name); declNodes.push({ name: stmt.id.name, node: stmt }); }
  else if (stmt.type === 'ClassDeclaration') { topNames.add(stmt.id.name); declNodes.push({ name: stmt.id.name, node: stmt }); }
  else if (stmt.type === 'VariableDeclaration') {
    for (const d of stmt.declarations) if (d.id.type === 'Identifier') { topNames.add(d.id.name); declNodes.push({ name: d.id.name, node: d }); }
  }
}

// Self-contained recursive walker.
function visit(node, scopes, refs, addName, isBound) {
  if (!node || typeof node.type !== 'string') return;
  // Scope-creating nodes
  const pushed = [];
  const declare = (n) => { if (scopes[scopes.length - 1]) scopes[scopes.length - 1].add(n); };

  if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
    scopes.push(new Set()); pushed.push('fn');
    node.params.forEach(p => bindPattern(p, scopes));
    if (node.id) declare(node.id.name);
  } else if (node.type === 'BlockStatement') {
    scopes.push(new Set()); pushed.push('block');
  } else if (node.type === 'CatchClause') {
    scopes.push(new Set()); pushed.push('catch');
    if (node.param) bindPattern(node.param, scopes);
  } else if (node.type === 'VariableDeclaration') {
    node.declarations.forEach(d => bindPattern(d.id, scopes));
  } else if (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') {
    if (node.id) declare(node.id.name);
  } else if (node.type === 'Identifier') {
    if (topNames.has(node.name) && !isBound(scopes, node.name)) refs.add(node.name);
  }

  for (const key in node) {
    if (key === 'type' || key === 'start' || key === 'end' || key === 'loc' || key === 'range') continue;
    const val = node[key];
    if (Array.isArray(val)) val.forEach(c => visit(c, scopes, refs));
    else if (val && typeof val.type === 'string') visit(val, scopes, refs);
  }
  pushed.forEach(() => scopes.pop());
}

function bindPattern(pat, scopes) {
  if (!pat) return;
  if (pat.type === 'Identifier') scopes[scopes.length - 1].add(pat.name);
  else if (pat.type === 'ArrayPattern') pat.elements.forEach(e => bindPattern(e, scopes));
  else if (pat.type === 'ObjectPattern') pat.properties.forEach(p => bindPattern(p.value || p.argument, scopes));
  else if (pat.type === 'AssignmentPattern') bindPattern(pat.left, scopes);
  else if (pat.type === 'RestElement') bindPattern(pat.argument, scopes);
}
function isBound(scopes, name) {
  for (let i = scopes.length - 1; i >= 0; i--) if (scopes[i].has(name)) return true;
  return false;
}

const result = {};
for (const { name, node } of declNodes) {
  const refs = new Set();
  visit(node, [new Set()], refs);
  result[name] = [...refs].filter(r => r !== name).sort();
}
fs.writeFileSync(path.join(root, 'closure2.json'), JSON.stringify(result, null, 2));
const names = Object.keys(result);
const pure = names.filter(n => result[n].length === 0);
console.log('Total decls:', names.length);
console.log('Zero-dep (pure):', pure.length);
console.log('PURE:', pure.sort().join(', '));
console.log('Wrote closure2.json');


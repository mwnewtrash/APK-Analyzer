#!/usr/bin/env node
// tools/graph.cjs — build the top-level cross-reference graph.
// For each top-level function/const, find which OTHER top-level names it
// references (scope-aware via acorn-walk). Output: graph.json
const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const walk = require('acorn-walk');

const ROOT = path.join(__dirname, '..');
const code = fs.readFileSync(path.join(ROOT, 'src-legacy/code.js'), 'utf8');
const ast = acorn.parse(code, { ecmaVersion: 2022, sourceType: 'script' });

// Collect top-level binding names
const decls = [];
const nameSet = new Set();
for (const node of ast.body) {
  if (node.type === 'FunctionDeclaration') {
    decls.push({ name: node.id.name, node, kind: 'function', mutable: false });
    nameSet.add(node.id.name);
  } else if (node.type === 'VariableDeclaration') {
    for (const d of node.declarations) {
      if (d.id.type !== 'Identifier') continue;
      const kind = d.init ? 'const/let' : 'let';
      const mutable = node.kind !== 'const';
      decls.push({ name: d.id.name, node, kind: 'varDecl', mutable });
      nameSet.add(d.id.name);
    }
  }
}

// For each decl node, walk its body and collect referenced top-level names,
// respecting nested scopes (don't count a shadowed local as a top-level ref).
function refsOf(node) {
  const found = new Set();
  // Gather all bound names in nested scopes (params + var/let/const/func decls)
  const shadow = new Set();
  const pushPat = (pat) => {
    if (!pat) return;
    if (pat.type === 'Identifier') shadow.add(pat.name);
    else if (pat.type === 'ObjectPattern') pat.properties.forEach(p => pushPat(p.value));
    else if (pat.type === 'ArrayPattern') pat.elements.forEach(pushPat);
    else if (pat.type === 'AssignmentPattern') pushPat(p.left);
    else if (pat.type === 'RestElement') pushPat(pat.argument);
  };
  const collectBindings = (scopeNode) => {
    if (scopeNode.params) scopeNode.params.forEach(pushPat);
    if (scopeNode.body) {
      const bodyArr = Array.isArray(scopeNode.body) ? scopeNode.body : (scopeNode.body.body ? scopeNode.body.body : []);
      bodyArr.forEach(st => {
        if (st.type === 'VariableDeclaration') st.declarations.forEach(d => pushPat(d.id));
        else if (st.type === 'FunctionDeclaration') shadow.add(st.id.name);
        else if (st.type === 'ClassDeclaration') shadow.add(st.id.name);
      });
    }
  };
  // We walk the whole subtree; whenever we enter a nested function/block scope,
  // add its bindings to shadow so inner same-named identifiers aren't top-level refs.
  walk.full(node, (n) => {
    if (n !== node && (n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression' ||
        n.type === 'ArrowFunctionExpression')) {
      collectBindings(n);
    }
    if (n.type === 'VariableDeclaration' && n !== node) {
      n.declarations.forEach(d => pushPat(d.id));
    }
    if (n.type === 'Identifier') {
      if (nameSet.has(n.name) && !shadow.has(n.name)) found.add(n.name);
    }
  });
  return [...found];
}

for (const d of decls) {
  d.refs = refsOf(d.node).filter(r => r !== d.name);
  d.start = d.node.start;
  d.end = d.node.end;
  d.line = d.node.loc ? d.node.loc.start.line : undefined;
}

// Which decls are referenced by inline handlers? (handlers are the public surface)
const body = fs.readFileSync(path.join(ROOT, 'src-legacy/body.html'), 'utf8');
const handlerNames = [...new Set(
  [...body.matchAll(/\son(?:click|change|input|keydown|keyup|keypress|submit|blur|focus)="\s*([A-Za-z_$][\w$]*)\s*\(/g)]
    .map(m => m[1])
)];

const out = {
  decls: decls.map(d => ({ name: d.name, kind: d.kind, mutable: d.mutable, start: d.start, end: d.end, line: d.line, refs: d.refs })),
  handlerNames
};
fs.writeFileSync(path.join(ROOT, 'graph.json'), JSON.stringify(out, null, 1));

// Summary
const fn = decls.filter(d => d.kind === 'function');
console.log('decls:', decls.length, 'functions:', fn.length, 'mutable vars:', decls.filter(d => d.mutable).length);
console.log('handlers:', handlerNames.length);
// print ref counts distribution
const withRefs = decls.filter(d => d.refs.length);
console.log('decls that reference others:', withRefs.length);
console.log('top 10 most-referenced decls:');
const refCount = {};
decls.forEach(d => d.refs.forEach(r => refCount[r] = (refCount[r] || 0) + 1));
Object.entries(refCount).sort((a,b)=>b[1]-a[1]).slice(0,10).forEach(([n,c])=>console.log('  '+n+': '+c));

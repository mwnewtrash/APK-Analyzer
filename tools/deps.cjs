// Definitive scope-aware dependency analyzer (see deps.json output).
const fs = require('fs');
const path = require('path');
const acorn = require('acorn');

const ROOT = __dirname;
const CODE = path.join(ROOT, '..', 'src-legacy', 'code.js');
const src = fs.readFileSync(CODE, 'utf8');
const ast = acorn.parse(src, { ecmaVersion: 2022, sourceType: 'script', locations: true });

// --- collect top-level declarations with ranges ---
const topDecls = [];
function addName(name, kind, node) { topDecls.push({ name, kind, start: node.start, end: node.end }); }
for (const node of ast.body) {
  if (node.type === 'FunctionDeclaration') addName(node.id.name, 'function', node);
  else if (node.type === 'VariableDeclaration')
    for (const d of node.declarations) if (d.id.type === 'Identifier') addName(d.id.name, 'var', d);
  else if (node.type === 'ClassDeclaration') addName(node.id.name, 'class', node);
}
const declNames = new Set(topDecls.map(d => d.name));

// --- recursive walker collecting references to top-level decl names ---
function collectFree(node, bound, out) {
  if (!node || typeof node.type !== 'string') return;
  switch (node.type) {
    case 'Identifier':
      if (node.name !== 'undefined' && !bound.has(node.name) && declNames.has(node.name)) out.add(node.name);
      return;
    case 'MemberExpression':
      collectFree(node.object, bound, out);
      if (node.computed) collectFree(node.property, bound, out);
      return;
    case 'Property':
      if (node.computed) collectFree(node.key, bound, out);
      collectFree(node.value, bound, out);
      return;
    case 'FunctionDeclaration':
    case 'FunctionExpression':
    case 'ArrowFunctionExpression': {
      const inner = new Set(bound);
      for (const p of node.params) collectBound(p, inner);
      if (node.id) inner.add(node.id.name);
      if (node.body.type === 'BlockStatement') {
        collectHoisted(node.body, inner);
        for (const s of node.body.body) collectFree(s, inner, out);
      } else collectFree(node.body, inner, out);
      return;
    }
    case 'BlockStatement': {
      const inner = new Set(bound);
      collectHoisted(node, inner);
      for (const s of node.body) collectFree(s, inner, out);
      return;
    }
    default:
      for (const k in node) {
        if (k === 'type' || k === 'start' || k === 'end' || k === 'loc' || k === 'range') continue;
        const v = node[k];
        if (Array.isArray(v)) { for (const c of v) collectFree(c, bound, out); }
        else if (v && typeof v.type === 'string') collectFree(v, bound, out);
      }
  }
}
function collectBound(pat, set) {
  if (!pat) return;
  if (pat.type === 'Identifier') set.add(pat.name);
  else if (pat.type === 'ObjectPattern') { for (const p of pat.properties) { if (p.value) collectBound(p.value, set); } if (pat.rest) collectBound(pat.rest.arg, set); }
  else if (pat.type === 'ArrayPattern') { for (const e of pat.elements) if (e) collectBound(e, set); if (pat.rest) collectBound(pat.argument, set); }
  else if (pat.type === 'AssignmentPattern') collectBound(pat.left, set);
  else if (pat.type === 'RestElement') collectBound(pat.argument, set);
}
function collectHoisted(block, set) {
  if (!block || !block.body) return;
  for (const s of block.body) {
    if (s.type === 'FunctionDeclaration' && s.id) set.add(s.id.name);
    else if (s.type === 'VariableDeclaration') for (const d of s.declarations) collectBound(d.id, set);
    else if (s.type === 'ClassDeclaration' && s.id) set.add(s.id.name);
  }
}

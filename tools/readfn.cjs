// Slice specific top-level decls by name from src-legacy/code.js using xref.json byte ranges.
// Prints each decl's source with a header, plus its direct references to other top-level decls.
const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const root = __dirname + '/..';
const code = fs.readFileSync(path.join(root, 'src-legacy/code.js'), 'utf8');
const xref = JSON.parse(fs.readFileSync(path.join(root, 'xref.json'), 'utf8'));
const decls = xref.decls;

function offsets(src) { const off = [0]; for (let i = 0; i < src.length; i++) if (src[i] === '\n') off.push(i + 1); return off; }
const off = offsets(code);
const byName = {}; for (const d of decls) byName[d.name] = d;

// Walk a decl's body, collecting free identifiers that match top-level decl names.
function freeRefs(node) {
  const found = new Set();
  const names = new Set(decls.map(d => d.name));
  (function walk(n, bound) {
    if (!n || typeof n !== 'object') return;
    let scope = bound;
    if (n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression') {
      scope = new Set(bound);
      for (const p of n.params || []) collectBindings(p, scope);
      if (n.type === 'FunctionDeclaration' && n.id) collectBindings(n.id, scope);
    }
    if ((n.type === 'VariableDeclarator')) collectBindings(n.id, scope);
    if (n.type === 'Identifier' && !bound.has(n.name) && names.has(n.name)) found.add(n.name);
    for (const k in n) { const v = n[k]; if (Array.isArray(v)) v.forEach(x => x && x.type && walk(x, scope)); else if (v && v.type) walk(v, scope); }
  })(node, new Set());
  return [...found];
}
function collectBindings(pat, set) {
  if (!pat) return;
  if (pat.type === 'Identifier') set.add(pat.name);
  else if (pat.type === 'ObjectPattern') (pat.properties || []).forEach(p => collectBindings(p.value || p.argument, set));
  else if (pat.type === 'ArrayPattern') (pat.elements || []).forEach(e => collectBindings(e, set));
  else if (pat.type === 'AssignmentPattern') collectBindings(pat.left, set);
  else if (pat.type === 'RestElement') collectBindings(pat.argument, set);
}

const want = process.argv.slice(2);
for (const name of want) {
  const d = byName[name];
  if (!d) { console.log('### NOT FOUND: ' + name); continue; }
  const src = code.slice(d.start, d.end);
  let refs = [];
  try {
    const ast = acorn.parse('(' + src + ')', { ecmaVersion: 2022 });
    refs = freeRefs(ast.body[0]);
  } catch (e) { refs = ['<parse-fail>']; }
  console.log('\n### ' + name + ' [' + d.kind + (d.mutable ? ',mutable' : '') + '] refs-> ' + refs.join(', '));
  console.log(src);
}

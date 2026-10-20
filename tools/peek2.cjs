const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const walk = require('acorn-walk');

const ROOT = path.join(__dirname, '..');
const code = fs.readFileSync(path.join(ROOT, 'src-legacy/code.js'), 'utf8');
const ast = acorn.parse(code, { ecmaVersion: 2022, locations: true, sourceType: 'script' });

// Map: top-level decl name -> {kind, mutable, start, end, refs:Set}
const decls = new Map();
const topNames = new Set();

function addDecl(name, kind, node) {
  decls.set(name, {
    kind,
    mutable: kind !== 'const' && kind !== 'function',
    start: node.start,
    end: node.end,
    refs: new Set(),
  });
  topNames.add(name);
}

for (const node of ast.body) {
  if (node.type === 'FunctionDeclaration') addDecl(node.id.name, 'function', node);
  else if (node.type === 'VariableDeclaration') {
    for (const d of node.declarations) {
      if (d.id.type === 'Identifier') addDecl(d.id.name, node.kind, node);
      // grouped destructuring: skip
    }
  }
}

// Determine which top-level decls each function references (free identifiers not shadowed by locals)
function computeRefs() {
  for (const [name, info] of decls) {
    if (info.kind !== 'function') continue;
    // find the function node
    const fn = ast.body.find(n =>
      (n.type === 'FunctionDeclaration' && n.id && n.id.name === name));
    if (!fn) continue;
    const local = new Set([name]);
    const stack = [fn.body];
    while (stack.length) {
      const node = stack.pop();
      if (!node || typeof node !== 'object') continue;
      if (Array.isArray(node)) { for (const c of node) stack.push(c); continue; }
      // collect declared names to exclude shadowing
      if (node.type === 'VariableDeclaration') {
        for (const d of node.declarations) collectPattern(d.id, local);
      }
      if (node.type === 'FunctionDeclaration' && node.id) local.add(node.id.name);
      if (node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
        for (const p of node.params) collectPattern(p, local);
      }
      if (node.type === 'Identifier') {
        if (topNames.has(node.name) && !local.has(node.name)) info.refs.add(node.name);
      }
      for (const k in node) {
        if (k === 'type' || k === 'start' || k === 'end') continue;
        const c = node[k];
        if (c && typeof c === 'object') stack.push(c);
      }
    }
  }
}
function collectPattern(pat, set) {
  if (!pat) return;
  if (pat.type === 'Identifier') set.add(pat.name);
  else if (pat.type === 'ObjectPattern') for (const p of pat.properties) collectPattern(p.value || p.argument, set);
  else if (pat.type === 'ArrayPattern') for (const e of pat.elements) collectPattern(e, set);
}
computeRefs();

const out = {};
for (const [name, info] of decls) {
  out[name] = { kind: info.kind, mutable: info.mutable, start: info.start, end: info.end, refs: [...info.refs] };
}
fs.writeFileSync(path.join(ROOT, 'xref2.json'), JSON.stringify(out, null, 0));

// Print summary
const funcs = [...decls].filter(([,i]) => i.kind === 'function').map(([n]) => n);
const muts = [...decls].filter(([,i]) => i.kind === 'let').map(([n]) => n);
const consts = [...decls].filter(([,i]) => i.kind === 'const').map(([n]) => n);
console.log('TOTAL', decls.size, 'FUNCS', funcs.length, 'LET', muts.length, 'CONST', consts.length);
console.log('CONSTS:', consts.join(', '));
console.log('MUTABLES:', muts.join(', '));

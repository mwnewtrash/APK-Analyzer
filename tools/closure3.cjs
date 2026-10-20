// Closure tool: compute transitive dependency closure of top-level decls in code.js
// Usage: node tools/closure3.cjs <seedName> [seedName...]
const fs = require('fs');
const acorn = require('acorn');
const path = require('path');

const CODE = path.join(__dirname, '..', 'src-legacy', 'code.js');
const src = fs.readFileSync(CODE, 'utf8');
const ast = acorn.parse(src, { ecmaVersion: 2022, sourceType: 'script', locations: true });

// 1) Collect top-level declarations: name -> {start,end,kind,node}
const top = new Map();
for (const stmt of ast.body) {
  if (stmt.type === 'FunctionDeclaration' && stmt.id) {
    top.set(stmt.id.name, { start: stmt.start, end: stmt.end, kind: 'function', node: stmt });
  } else if (stmt.type === 'VariableDeclaration') {
    for (const d of stmt.declarations) {
      if (d.id.type === 'Identifier') {
        top.set(d.id.name, { start: d.start, end: d.end, kind: 'var', decl: stmt, declr: d });
      }
    }
  } else if (stmt.type === 'ClassDeclaration' && stmt.id) {
    top.set(stmt.id.name, { start: stmt.start, end: stmt.end, kind: 'class', node: stmt });
  }
}
const topNames = new Set(top.keys());

// 2) Scope analysis: collect bound names for a node's subtree scope
function collectBound(node) {
  const bound = new Set();
  function addPattern(p) {
    if (!p) return;
    if (p.type === 'Identifier') bound.add(p.name);
    else if (p.type === 'ObjectPattern') p.properties.forEach(pr => addPattern(pr.value || pr.argument));
    else if (p.type === 'ArrayPattern') p.elements.forEach(addPattern);
    else if (p.type === 'AssignmentPattern') addPattern(p.left);
    else if (p.type === 'RestElement') addPattern(p.argument);
  }
  (function walk(n) {
    if (!n || typeof n.type !== 'string') return;
    if (n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression') {
      if (n.id) bound.add(n.id.name);
      n.params.forEach(addPattern);
    }
    if (n.type === 'ClassDeclaration' && n.id) bound.add(n.id.name);
    if (n.type === 'VariableDeclarator') addPattern(n.id);
    if (n.type === 'CatchClause' && n.param) addPattern(n.param);
    for (const k in n) {
      if (k === 'type' || k === 'start' || k === 'end') continue;
      const v = n[k];
      if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v.type === 'string') walk(v);
    }
  })(node);
  return bound;
}

// 3) Free identifiers referenced within a node (reads), that resolve to top-level names
function freeRefs(node) {
  const bound = collectBound(node);
  const found = new Set();
  (function walk(n, inPropKey) {
    if (!n || typeof n.type !== 'string') return;
    let propKey = false;
    if (n.type === 'MemberExpression' && !n.computed) {
      // only descend into object, not property
      walk(n.object, false);
      return;
    }
    if (n.type === 'Property' && !n.computed) {
      walk(n.key, true);      // key is a property name, not a ref
      walk(n.value, false);
      return;
    }
    if (n.type === 'Identifier' && !propKey && !inPropKey) {
      if (topNames.has(n.name) && !bound.has(n.name)) found.add(n.name);
      return;
    }
    if (n.type === 'LabeledStatement' || n.type === 'BreakStatement' || n.type === 'ContinueStatement') {
      // labels are not var refs; still walk label-less children safely
    }
    for (const k in n) {
      if (k === 'type' || k === 'start' || k === 'end') continue;
      const v = n[k];
      if (Array.isArray(v)) v.forEach(c => walk(c, false));
      else if (v && typeof v.type === 'string') walk(v, false);
    }
  })(node, false);
  return found;
}

// Precompute deps for every top-level decl
const depsMap = new Map();
for (const [name, info] of top) {
  const node = info.node || info.declr || info.decl;
  depsMap.set(name, freeRefs(info.node || info.decl));
}

// 4) Transitive closure for seeds
function closure(seeds) {
  const seen = new Set();
  const stack = [...seeds];
  while (stack.length) {
    const n = stack.pop();
    if (seen.has(n) || !top.has(n)) continue;
    seen.add(n);
    for (const d of (depsMap.get(n) || [])) if (!seen.has(d)) stack.push(d);
  }
  return seen;
}

const seeds = process.argv.slice(2);
const cl = closure(seeds);

// 5) Output: ordered by source position, with verbatim ranges
const members = [...cl].map(n => ({ name: n, ...top.get(n) })).sort((a, b) => a.start - b.start);
console.log('=== CLOSURE for', seeds.join(', '), '===', 'count', members.length);
for (const m of members) {
  const deps = [...(depsMap.get(m.name) || [])].filter(d => cl.has(d)).sort();
  console.log(`  ${m.kind}\t${m.name}\t[${m.start},${m.end}]\tdeps=${deps.join(',')}`);
}

// If CLOSE_JSON=1, dump source slices
if (process.env.CLOSE_JSON === '1') {
  const out = {};
  for (const m of members) out[m.name] = { kind: m.kind, start: m.start, end: m.end, text: src.slice(m.start, m.end) };
  fs.writeFileSync(path.join(__dirname, 'closure.json'), JSON.stringify(out, null, 0));
  console.log('wrote closure.json');
}

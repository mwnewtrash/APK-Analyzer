// Compute transitive closure of top-level declarations referenced by a set of
// root functions, classifying each referenced decl as pure-function / const / mutable-global.
// A root is "pure" iff its closure contains ZERO mutable globals.
// Usage: node tools/closure.cjs rootFn1 rootFn2 ...
const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const walk = require('acorn-walk');
const root = path.join(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'src-legacy', 'code.js'), 'utf8');
const inv = JSON.parse(fs.readFileSync(path.join(root, 'inventory.json'), 'utf8'));
const arr = Array.isArray(inv) ? inv : inv.decls;
const byName = {};
for (const d of arr) byName[d.name] = d;
const mutable = new Set(JSON.parse(fs.readFileSync(path.join(root, 'xref.json'), 'utf8')).mutableGlobals.map(m => m.name));

// Parse the whole file once; collect all identifier nodes with their nearest
// enclosing top-level declaration by mapping byte offset -> decl name.
const ast = acorn.parse(code, { ecmaVersion: 2022, sourceType: 'script', locations: false, ranges: true });
// Build list of decl source strings for standalone parsing of free refs.
const declSrc = {};
for (const d of arr) declSrc[d.name] = code.slice(d.start, d.end);

// For a given decl name, find the free identifiers it references (excluding its own
// locals/params). Parse its source wrapped so `name` is the binding.
function freeRefs(name) {
  const d = byName[name];
  if (!d) return [];
  const src = declSrc[name];
  let wrapped, argName;
  if (d.kind === 'FunctionDeclaration') {
    // rename to avoid clash, then parse and collect non-param, non-local refs
    wrapped = src.replace(/^function\s+[^(]*\(/, 'function __F(');
    argName = '__F';
  } else if (d.kind === 'VariableDeclaration') {
    wrapped = '(' + src + ');'; // as expression statements? no — declarations can't be wrapped as expr for const arrays
    // Instead parse as-is in a Program and collect top-level free ids.
    wrapped = src;
    argName = null;
  } else {
    wrapped = src;
    argName = null;
  }
  let a;
  try { a = acorn.parse(wrapped, { ecmaVersion: 2022, sourceType: 'script', ranges: true }); }
  catch (e) { return []; }
  const used = new Set();
  const bound = new Set();
  // crude scope collection: params + function decls + var/let/const within
  walk.full(a, (node) => {
    if (node.type === 'FunctionDeclaration' && node.id) bound.add(node.id.name);
    if (node.type === 'VariableDeclarator' && node.id && node.id.type === 'Identifier') bound.add(node.id.name);
    if (node.type === 'AssignmentPattern' && node.left && node.left.type === 'Identifier') bound.add(node.left.name);
  });
  if (d.kind === 'FunctionDeclaration') {
    // remove params from bound-as-local: params are local too (still bound)
  }
  walk.full(a, (node) => {
    if (node.type === 'Identifier') used.add(node.name);
  });
  // also property names get walked as Identifier? acorn-walk walks MemberExpression.property as Identifier only for computed? Actually it does visit .property. Filter those out:
  const nonProp = new Set();
  walk.full(a, (node) => {
    if (node.type === 'MemberExpression' && !node.computed && node.property && node.property.type === 'Identifier') {
      // mark as property (exclude) — handle by re-walking and skipping
    }
  });
  // Simpler: re-walk manually excluding non-computed member .property and object keys.
  const res = new Set();
  (function rec(n) {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) { n.forEach(rec); return; }
    if (n.type === 'MemberExpression') { rec(n.object); if (n.computed) rec(n.property); return; }
    if (n.type === 'Property' && !n.computed) { rec(n.value); return; }
    if (n.type === 'Identifier') { res.add(n.name); return; }
    for (const k in n) { if (k === 'type' || k === 'start' || k === 'end') continue; const v = n[k]; if (v && typeof v === 'object') rec(v); }
  })(a);
  // free = used - bound - globals(builtins ignored)
  const free = [...res].filter(x => !bound.has(x));
  return free;
}

function closure(rootNames) {
  const seen = new Set();
  const stack = [...rootNames];
  const mutableHit = new Set();
  const constsHit = new Set();
  const fnsHit = new Set();
  while (stack.length) {
    const n = stack.pop();
    if (seen.has(n)) continue;
    seen.add(n);
    if (mutable.has(n)) { mutableHit.add(n); continue; }
    if (!byName[n]) continue; // builtin or external
    if (byName[n].kind === 'VariableDeclaration') constsHit.add(n); else fnsHit.add(n);
    for (const ref of freeRefs(n)) if (!seen.has(ref)) stack.push(ref);
  }
  return { all: seen, mutableHit, constsHit, fnsHit };
}

for (const rn of process.argv.slice(2)) {
  const c = closure([rn]);
  console.log(`\n### ${rn}`);
  console.log(`  mutableGlobals (${c.mutableHit.size}): ${[...c.mutableHit].join(', ')}`);
  console.log(`  consts (${c.constsHit.size}): ${[...c.constsHit].join(', ')}`);
  console.log(`  fns (${c.fnsHit.size}): ${[...c.fnsHit].join(', ')}`);
  console.log(`  ALL refs (${c.all.size}): ${[...c.all].join(', ')}`);
}

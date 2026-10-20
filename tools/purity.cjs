// Compute transitive worker-safety for modularization.
// worker-safe = references NO mutable global, uses NO DOM global, and only CALLS worker-safe fns.
const fs = require('fs');
const path = require('path');
const acorn = require('acorn');

const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'src-legacy', 'code.js'), 'utf8');
const xref = JSON.parse(fs.readFileSync(path.join(root, 'xref.json'), 'utf8'));
const ast = acorn.parse(src, { ecmaVersion: 2022, locations: true, sourceType: 'script' });

const DOM_GLOBALS = new Set([
  'document', 'window', 'navigator', 'location', 'localStorage', 'sessionStorage',
  'alert', 'confirm', 'prompt', 'XMLHttpRequest', 'fetch', 'WebSocket', 'history',
  'getComputedStyle', 'requestAnimationFrame', 'FileReader', 'Blob', 'URL',
  'CustomEvent', 'Event', 'MutationObserver', 'ResizeObserver', 'Worker', 'postMessage', 'onmessage', 'self'
]);

const topNames = new Set(xref.decls.map(d => d.name));
const mutable = new Set(xref.mutableGlobals.map(m => m.name));
const fnNames = new Set(xref.decls.filter(d => d.kind === 'function').map(d => d.name));
const constNames = new Set(xref.decls.filter(d => d.kind === 'const').map(d => d.name));

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
  for (let i = ancestors.length - 1; i >= 1; i--) if (ancestors[i]._dn && ancestors[i]._dn.includes(name)) return false;
  return true;
}

const info = new Map(); // name -> { mrefs:Set, dom:Set, calls:Set }
for (const n of topNames) info.set(n, { mrefs: new Set(), dom: new Set(), calls: new Set() });

(function pass() {
  function visit(node, anc, cur) {
    if (!node || typeof node.type !== 'string') return;
    const dn = declNames(node);
    if (dn.length) node._dn = dn;
    const na = dn.length ? anc.concat(node) : anc;
    let fn = cur;
    if ((node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') && node.id) fn = node.id.name;
    if (node.type === 'Identifier' && resolvesTop(node.name, na)) {
      const rec = fn && info.has(fn) ? info.get(fn) : null;
      if (rec) {
        if (mutable.has(node.name)) rec.mrefs.add(node.name);
        if (fnNames.has(node.name) && node.name !== fn) rec.calls.add(node.name);
        if (DOM_GLOBALS.has(node.name)) rec.dom.add(node.name);
      }
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

// Attribute top-level const/let/var initializer refs under the decl's own name.
for (const d of xref.decls) {
  if (d.kind !== 'const' && d.kind !== 'let' && d.kind !== 'var') continue;
  const rec = info.get(d.name);
  if (!rec) continue;
  const declStmt = ast.body.find(s => s.type === 'VariableDeclaration' && s.declarations.some(x => x.id && x.id.name === d.name));
  if (!declStmt) continue;
  (function visit(node, anc) {
    if (!node || typeof node.type !== 'string') return;
    const dn = declNames(node);
    if (dn.length) node._dn = dn;
    const na = dn.length ? anc.concat(node) : anc;
    if (node.type === 'Identifier' && resolvesTop(node.name, na)) {
      if (mutable.has(node.name)) rec.mrefs.add(node.name);
      if (DOM_GLOBALS.has(node.name)) rec.dom.add(node.name);
    }
    for (const k in node) {
      if (k === '_dn' || k === 'start' || k === 'end' || k === 'loc' || k === 'range') continue;
      const v = node[k];
      if (Array.isArray(v)) v.forEach(x => x && x.type && visit(x, na));
      else if (v && v.type) visit(v, na);
    }
  })(declStmt, [ast]);
}

// Fixpoint transitive worker-safety.
const safe = new Map();
for (const [n] of info) safe.set(n, true);
let changed = true;
while (changed) {
  changed = false;
  for (const [n, rec] of info) {
    if (!safe.get(n)) continue;
    let ok = rec.mrefs.size === 0 && rec.dom.size === 0;
    if (ok) for (const c of rec.calls) if (fnNames.has(c) && !safe.get(c)) { ok = false; break; }
    if (!ok) { safe.set(n, false); changed = true; }
  }
}

const workerFns = xref.functions.filter(n => safe.get(n)).sort();
const workerConsts = xref.consts.filter(n => safe.get(n)).sort();
const domFns = xref.functions.filter(n => info.get(n).dom.size > 0);

fs.writeFileSync(path.join(root, 'purity.json'), JSON.stringify({
  workerSafeFunctions: workerFns,
  workerSafeConsts: workerConsts,
  domUsingFunctions: domFns,
  detail: [...info.entries()].map(([n, r]) => ({ name: n, mrefs: [...r.mrefs], dom: [...r.dom], calls: [...r.calls], safe: safe.get(n) }))
}, null, 2));

console.log('WORKER-SAFE FUNCTIONS (' + workerFns.length + '): ' + workerFns.join(', '));
console.log('WORKER-SAFE CONSTS (' + workerConsts.length + '): ' + workerConsts.join(', '));
console.log('DOM-USING FUNCTIONS (' + domFns.length + '): ' + domFns.join(', '));


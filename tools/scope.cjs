#!/usr/bin/env node
// tools/scope.cjs — definitive scope map for modularization.
// Parses code.js, reports top-level statements + the two DOMContentLoaded
// closures, classifies decls, and extracts inline-handler names from body.html.
const fs = require('fs');
const path = require('path');
const acorn = require('acorn');

const ROOT = path.join(__dirname, '..');
const code = fs.readFileSync(path.join(ROOT, 'src-legacy/code.js'), 'utf8');
const body = fs.readFileSync(path.join(ROOT, 'src-legacy/body.html'), 'utf8');

const ast = acorn.parse(code, { ecmaVersion: 2022, locations: true, sourceType: 'script' });

// Byte offset helper (acorn uses utf8; source is ASCII-ish here)
function byteLen(s) { return Buffer.byteLength(s, 'utf8'); }
function offToLine(off) { return code.slice(0, off).split('\n').length; }

// 1) Top-level statement inventory (kinds + ranges)
const topStmts = ast.body.map((n) => {
  const type = n.type;
  let name = '';
  if (n.type === 'FunctionDeclaration') name = 'fn ' + n.id.name;
  else if (n.type === 'VariableDeclaration') name = 'var ' + n.declarations.map(d => d.id.name).join(',');
  else if (n.type === 'ExpressionStatement' && n.expression.type === 'AssignmentExpression') {
    const l = n.expression.left;
    name = 'assign ' + (l.type === 'Identifier' ? l.name : l.type);
  } else if (n.type === 'ExpressionStatement') name = 'expr ' + n.expression.type;
  return { type, name, start: n.start, end: n.end, line: n.loc.start.line };
});

// 2) Find the two DOMContentLoaded addEventListener calls + their closure ranges
const dcl = [];
for (const s of topStmts) {
  const node = ast.body.find(n => n.start === s.start && n.end === s.end);
  if (!node) continue;
  if (node.type === 'ExpressionStatement') {
    let e = node.expression;
    // match document.addEventListener('DOMContentLoaded', () => {...})
    if (e.type === 'CallExpression' && e.callee.type === 'MemberExpression' &&
        e.callee.property && e.callee.property.name === 'addEventListener') {
      const arg0 = e.arguments[0];
      if (arg0 && arg0.value === 'DOMContentLoaded') {
        const cb = e.arguments[1];
        dcl.push({ start: node.start, end: node.end, cbStart: cb.start, cbEnd: cb.end });
      }
    }
  }
}

// 3) Inline handler function names from body.html
const handlerNames = [...new Set(
  [...body.matchAll(/\son(?:click|change|input|keydown|keyup|keypress|submit|blur|focus)="\s*([A-Za-z_$][\w$]*)\s*\(/g)]
    .map(m => m[1])
)];

// 4) Top-level function/const names (for export decisions)
const topFns = [];
const topConsts = [];
for (const s of ast.body) {
  if (s.type === 'FunctionDeclaration') topFns.push(s.id.name);
  if (s.type === 'VariableDeclaration') for (const d of s.declarations) topConsts.push(d.id.name);
}

// 5) Which handler names are top-level functions?
const handlerStatus = handlerNames.map(h => ({ name: h, isTopLevelFn: topFns.includes(h) }));

const out = {
  codeLines: code.split('\n').length,
  topStatementCount: topStmts.length,
  domContentLoaded: dcl.map(d => ({
    stmtStartLine: offToLine(d.start), stmtEndLine: offToLine(d.end),
    bodyStartLine: offToLine(d.cbStart), bodyEndLine: offToLine(d.cbEnd)
  })),
  topFunctionCount: topFns.length,
  topConstCount: topConsts.length,
  inlineHandlers: handlerStatus,
  topFns, topConsts
};
fs.writeFileSync(path.join(ROOT, 'scope.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify({
  codeLines: out.codeLines,
  topStatementCount: out.topStatementCount,
  dcl: out.domContentLoaded,
  topFunctionCount: out.topFunctionCount,
  topConstCount: out.topConstCount,
  inlineHandlerCount: handlerStatus.length,
  inlineHandlersNotTopLevel: handlerStatus.filter(h => !h.isTopLevelFn).map(h => h.name)
}, null, 2));

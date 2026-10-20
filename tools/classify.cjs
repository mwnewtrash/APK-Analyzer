// Scope-aware free-identifier extraction + purity classification.
const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const walk = require('acorn-walk');

const CODE = fs.readFileSync(path.join(__dirname, '..', 'src-legacy', 'code.js'), 'utf8');
const xref = require('../xref.json');

function patternNames(pat, out) {
  if (!pat) return;
  switch (pat.type) {
    case 'Identifier': out.add(pat.name); break;
    case 'ObjectPattern': pat.properties.forEach(p => {
      if (p.type === 'RestElement') patternNames(p.argument, out);
      else patternNames(p.value, out);
    }); break;
    case 'ArrayPattern': pat.elements.forEach(e => patternNames(e, out)); break;
    case 'AssignmentPattern': patternNames(pat.left, out); break;
    case 'RestElement': patternNames(pat.argument, out); break;
  }
}
function collectBindings(node, out) {
  walk.full(node, {
    VariableDeclarator(n) { patternNames(n.id, out); },
    FunctionDeclaration(n) { if (n.id) out.add(n.id.name); n.params.forEach(p => patternNames(p, out)); },
    FunctionExpression(n) { if (n.id) out.add(n.id.name); n.params.forEach(p => patternNames(p, out)); },
    ArrowFunctionExpression(n) { n.params.forEach(p => patternNames(p, out)); },
    ClassDeclaration(n) { if (n.id) out.add(n.id.name); },
    ClassExpression(n) { if (n.id) out.add(n.id.name); },
    CatchClause(n) { patternNames(n.param, out); }
  });
}

// Inventory top-level declarations of code.js: name, kind, reassigned?, referenced count, range.
import { readFileSync, writeFileSync } from 'fs';
import * as acorn from 'acorn';

const FILE = new URL('../src-legacy/code.js', import.meta.url);
const src = readFileSync(FILE, 'utf8');
const ast = acorn.parse(src, { ecmaVersion: 2022, locations: true, sourceType: 'script' });

const topNames = new Map(); // name -> {kind, start, end, declLine}
const reassigned = new Set();
const referenced = new Map(); // name -> count of references (non-declaration, non-prop)

function addTop(name, kind, node) {
    if (!topNames.has(name)) topNames.set(name, { kind, start: node.start, end: node.end, line: node.loc.start.line });
}

// Collect top-level declarations
for (const stmt of ast.body) {
    if (stmt.type === 'FunctionDeclaration' && stmt.id) {
        addTop(stmt.id.name, 'function', stmt);
    } else if (stmt.type === 'VariableDeclaration') {
        for (const d of stmt.declarations) {
            if (d.id.type === 'Identifier') addTop(d.id.name, stmt.kind, d);
        }
    }
}

// Walk whole AST with a stack of scopes to find reassignments (assignment to a name
// that resolves to a top-level binding) and count references.
function walkScopes() {
    const declsPerScope = []; // array of arrays of names
    const topList = [...topNames.keys()];

    function declaredHere(node) {
        const names = [];
        if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
            node.params.forEach(p => collectPattern(p, names));
            if (node.type === 'FunctionDeclaration' && node.id) names.push(node.id.name);
        }
        if (node.type === 'BlockStatement') {
            for (const s of node.body) {
                if (s.type === 'VariableDeclaration') for (const d of s.declarations) collectPattern(d.id, names);
                else if (s.type === 'FunctionDeclaration' && s.id) names.push(s.id.name);
                else if (s.type === 'ClassDeclaration' && s.id) names.push(s.id.name);
            }
        }
        if (node.type === 'CatchClause' && node.param) collectPattern(node.param, names);
        if (node.type === 'VariableDeclaration') for (const d of node.declarations) collectPattern(d.id, names);
        return names;
    }
    function collectPattern(pat, out) {
        if (!pat) return;
        if (pat.type === 'Identifier') out.push(pat.name);
        else if (pat.type === 'ObjectPattern') pat.properties.forEach(p => collectPattern(p.value || p.argument, out));
        else if (pat.type === 'ArrayPattern') pat.elements.forEach(e => collectPattern(e, out));
        else if (pat.type === 'AssignmentPattern') collectPattern(pat.left, out);
        else if (pat.type === 'RestElement') collectPattern(pat.argument, out);
    }
    // Resolve: a name at a point resolves to top-level if not declared in any enclosing scope
    // (approximation: check all ancestor scopes' declared names).
    function resolveToTop(node, ancestors) {
        const name = node.name;
        if (!topNames.has(name)) return false;
        // walk ancestors from nearest to farthest; if any declares this name, it's shadowed
        for (let i = ancestors.length - 1; i >= 1; i--) { // skip program (index 0) where top decls live
            const a = ancestors[i];
            if (a._declNames && a._declNames.includes(name)) return false;
        }
        return true;
    }

    function visit(node, ancestors) {
        if (!node || typeof node.type !== 'string') return;
        const decl = declaredHere(node);
        if (decl.length) node._declNames = decl;
        const newAnc = node._declNames ? ancestors.concat(node) : ancestors;

        if (node.type === 'AssignmentExpression' && node.left.type === 'Identifier') {
            if (resolveToTop(node.left, newAnc)) reassigned.add(node.left.name);
        }
        if ((node.type === 'UpdateExpression') && node.argument.type === 'Identifier') {
            if (resolveToTop(node.argument, newAnc)) reassigned.add(node.argument.name);
        }
        if (node.type === 'Identifier') {
            // count as reference if it resolves to top-level and is not a pure property/non-computed key
            if (resolveToTop(node, newAnc)) {
                referenced.set(node.name, (referenced.get(node.name) || 0) + 1);
            }
        }
        for (const key in node) {
            if (key === '_declNames' || key === 'start' || key === 'end' || key === 'loc' || key === 'range') continue;
            const val = node[key];
            if (Array.isArray(val)) val.forEach(v => v && v.type && visit(v, newAnc));
            else if (val && val.type) visit(val, newAnc);
        }
    }
    visit(ast, [ast]);
}

walkScopes();

const out = [...topNames.entries()].map(([name, info]) => ({
    name, kind: info.kind, line: info.line, start: info.start, end: info.end,
    mutable: reassigned.has(name) || info.kind === 'let' || info.kind === 'var',
    reassigned: reassigned.has(name),
    refs: referenced.get(name) || 0
})).sort((a, b) => a.line - b.line);

writeFileSync(new URL('../inventory.json', import.meta.url), JSON.stringify(out, null, 2));
console.log('total top-level decls:', out.length);
console.log('mutable (let/var/reassigned):', out.filter(o => o.mutable).map(o => o.name).join(', '));

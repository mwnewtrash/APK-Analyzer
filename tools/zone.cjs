// Zone + purity map. Run: node tools/zone.cjs
const fs = require('fs');
const path = require('path');
const P = p => path.join(__dirname, '..', p);
const code = fs.readFileSync(P('src-legacy/code.js'), 'utf8');
const x = JSON.parse(fs.readFileSync(P('xref.json'), 'utf8'));

// Find DOMContentLoaded callback ranges via acorn-free brace scan on the arrow body
const lines = code.split('\n');
const dclLines = [];
lines.forEach((ln, i) => { if (ln.includes("addEventListener('DOMContentLoaded'")) dclLines.push(i + 1); });

// Use byte offsets from xref to locate, then bracket-match each arrow callback end.
function idxOfLine(lineNo) { // 1-based -> char index
    let idx = 0;
    for (let i = 0; i < lineNo - 1; i++) idx += lines[i].length + 1;
    return idx;
}
function matchArrow(startIdx) {
    // find first '{' after startIdx, then brace-match respecting strings/comments/templates/regex-lite
    let i = code.indexOf('{', startIdx);
    let depth = 0, inS = null, inC = null, esc = false;
    for (; i < code.length; i++) {
        const c = code[i], n = code[i + 1];
        if (inC) { if (inC === '//' && c === '\n') inC = null; else if (inC === '/*' && c === '*' && n === '/') { inC = null; i++; } continue; }
        if (inS) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === inS) inS = null; continue; }
        if (c === '/' && n === '/') { inC = '//'; i++; continue; }
        if (c === '/' && n === '*') { inC = '/*'; i++; continue; }
        if (c === '"' || c === "'" || c === '`') { inS = c; continue; }
        if (c === '{') depth++;
        else if (c === '}') { depth--; if (depth === 0) return i; }
    }
    return code.length;
}
const dclRanges = dclLines.map(l => ({ startLine: l, startIdx: idxOfLine(l), endIdx: matchArrow(idxOfLine(l)) }));
function zoneOf(lineNo) {
    const idx = idxOfLine(lineNo);
    if (idx < dclRanges[0].startIdx) return 'pre';
    for (const r of dclRanges) if (idx >= r.startIdx && idx <= r.endIdx) return 'dcl';
    return 'between';
}

const funcs = x.decls.filter(d => d.kind === 'function');
const byName = {};
for (const f of funcs) byName[f.name] = f;

// mutability: which globals are reassigned anywhere (AssignmentExpression / UpdateExpression targets)
const mutableNames = new Set(x.mutableGlobals.map(g => g.name));

// Determine purity: a function is "pure-ish" if it never references a mutable global
// Build ref graph: func -> set of referenced top-level names (approximate via word boundary scan of its source)
function sliceSource(d) { return code.slice(d.start, d.end); }
const refMap = {};
for (const f of funcs) {
    const src = sliceSource(f);
    const refs = new Set();
    const names = [...funcs.map(g => g.name), ...mutableNames, ...x.consts.map(c => c && c.name).filter(Boolean)];
    for (const n of names) {
        const re = new RegExp('\\b' + n.replace(/[$]/g, '\\$') + '\\b');
        if (re.test(src)) refs.add(n);
    }
    refMap[f.name] = [...refs];
}
// transitive: a func is pure if it and all funcs it calls reference no mutable global
function isPure(name, seen = new Set()) {
    if (seen.has(name)) return true; seen.add(name);
    for (const r of refMap[name] || []) {
        if (mutableNames.has(r)) return false;
        const f = byName[r];
        if (f && !isPure(r, seen)) return false;
    }
    return true;
}

const HANDLERS = JSON.parse(fs.readFileSync(P('tools/fullmap.json'), 'utf8')).inlineHandlers;
const out = {
    dclLines,
    handlersByZone: Object.fromEntries(HANDLERS.map(h => [h, byName[h] ? zoneOf(byName[h].line) : 'MISSING'])),
    functionsInDcl: funcs.filter(f => zoneOf(f.line) === 'dcl').map(f => f.name),
    funcsPre: funcs.filter(f => zoneOf(f.line) === 'pre').map(f => f.name),
    pureFuncs: funcs.filter(f => isPure(f.name)).map(f => f.name),
    impureFuncs: funcs.filter(f => !isPure(f.name)).map(f => f.name),
};
fs.writeFileSync(P('tools/zone.json'), JSON.stringify(out, null, 1));
console.log('DCL lines:', dclLines.join(','));
console.log('Handlers inside DCL closure:', HANDLERS.filter(h => out.handlersByZone[h] === 'dcl').join(', ') || 'NONE');
console.log('Handlers pre-DCL (top-level):', HANDLERS.filter(h => out.handlersByZone[h] === 'pre').join(', ') || 'NONE');
console.log('Funcs in DCL closures:', out.functionsInDcl.length);
console.log('PURE funcs (' + out.pureFuncs.length + '):', out.pureFuncs.join(', '));
console.log('IMPURE funcs (' + out.impureFuncs.length + '):', out.impureFuncs.join(', '));

// Comprehensive structural map for modularization. Run: node tools/fullmap.cjs
const fs = require('fs');
const path = require('path');
const P = p => path.join(__dirname, '..', p);
const code = fs.readFileSync(P('src-legacy/code.js'), 'utf8');
const body = fs.readFileSync(P('src-legacy/body.html'), 'utf8');
const x = JSON.parse(fs.readFileSync(P('xref.json'), 'utf8'));

// 1. Inline handler names referenced in body.html
const handlerNames = new Set();
const re = /on(?:click|change|input|submit|keyup|keydown|load|dblclick)\s*=\s*"([^"]*)"/g;
let m;
while ((m = re.exec(body))) {
    // extract called identifiers: name( or name( inside handler
    const callRe = /\b([A-Za-z_$][\w$]*)\s*\(/g;
    let cm;
    while ((cm = callRe.exec(m[1]))) {
        const n = cm[1];
        if (!['if','for','while','switch','return','function','alert','parseInt','parseFloat','String','Number','Boolean','Array','Object','this'].includes(n))
            handlerNames.add(n);
    }
}
const allDeclNames = new Set(x.decls.map(d => d.name));

const funcs = x.decls.filter(d => d.kind === 'function');
// DOMContentLoaded boundaries
const dclLines = funcs.filter(f => /DOMContentLoaded/.test(f.name)); // won't match; DOMContentLoaded is a call not a decl
// Find the two DOMContentLoaded line numbers from raw text
const dclLineNos = [];
code.split('\n').forEach((ln, i) => { if (ln.includes("addEventListener('DOMContentLoaded'")) dclLineNos.push(i + 1); });

// Classify each top-level function: before first DCL, between, after second
function zone(line) {
    if (line < dclLineNos[0]) return 'pre';
    if (dclLineNos.length > 1 && line >= dclLineNos[0] && line < dclLineNos[1]) return 'in1';
    if (dclLineNos.length > 1) return 'in2';
    return 'in1';
}

const report = {
    totalDecls: x.total,
    dclLineNos,
    inlineHandlerCount: handlerNames.size,
    inlineHandlers: [...handlerNames].sort(),
    handlersThatAreTopLevelFuncs: [...handlerNames].filter(n => funcs.some(f => f.name === n)).sort(),
    handlersNotDeclared: [...handlerNames].filter(n => !allDeclNames.has(n)).sort(),
    mutableGlobals: x.mutableGlobals.map(g => g.name).sort(),
    mutableGlobalCount: x.mutableGlobals.length,
    consts: x.consts.map(c => c.name).sort(),
    constCount: x.consts.length,
    funcCount: funcs.length,
};

// Which mutable globals are referenced by which pure funcs is next step.
fs.writeFileSync(P('tools/fullmap.json'), JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));

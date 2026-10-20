// final anchors: DAST, smali-ish blocks, startGlobalAnalysis, analyzeDecompiledSourceOnly head
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const code = fs.readFileSync(path.join(ROOT, 'src-legacy', 'code.js'), 'utf8');
const body = fs.readFileSync(path.join(ROOT, 'src-legacy', 'body.html'), 'utf8');
console.log('--- DAST in body ---');
for (const m of body.matchAll(/DAST/g)) console.log(' body idx ' + m.index + ': ' + JSON.stringify(body.slice(m.index - 60, m.index + 20)));
console.log('--- DAST in code ---');
for (const m of code.matchAll(/DAST/g)) console.log(' code idx ' + m.index + ': ' + JSON.stringify(code.slice(m.index - 60, m.index + 20)));
console.log('--- smali-ish in analyzeOtherFiles ---');
let j = code.indexOf('async function analyzeOtherFiles');
console.log(code.slice(j, j + 1400));

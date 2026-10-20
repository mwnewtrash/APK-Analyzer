// remaining anchors: endpoint tail, dead-code block, orphan CSS, full onclick inventory
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const code = fs.readFileSync(path.join(ROOT, 'src-legacy', 'code.js'), 'utf8');
const head = fs.readFileSync(path.join(ROOT, 'src-legacy', 'head.html'), 'utf8');
const body = fs.readFileSync(path.join(ROOT, 'src-legacy', 'body.html'), 'utf8');
let i = code.indexOf('extractedEndpoints = Array.from(endpoints.values());');
console.log('--- extractEndpoints tail ---');
console.log(code.slice(i, i + 900));
console.log('--- analyzeOtherFiles smali block ---');
let j = code.indexOf("if (/\\.(java|kt|smali)$/i.test(pathLower))");
console.log('idx:', j);
if (j > 0) console.log(code.slice(Math.max(0, j - 700), j + 400));
console.log('--- orphan CSS search ---');
let k = head.indexOf('#page-misconfig .section-content-title h3');
console.log('idx:', k);
if (k > 0) console.log(head.slice(k, k + 1200));

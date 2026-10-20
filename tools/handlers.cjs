// Scan body.html for inline on* handler function names, and code.js for copyToClipboard sites.
const fs = require('fs');
const b = fs.readFileSync('src-legacy/body.html', 'utf8');
const names = new Set();
const re = /\son(click|change|input|submit|drop|dragover|keydown|keyup|keypress)="([^"]*)"/g;
let m;
while ((m = re.exec(b))) {
    const v = m[2].trim();
    const fm = v.match(/^([A-Za-z_$][\w$]*)\s*\(/);
    if (fm) names.add(fm[1]);
}
console.log('INLINE HANDLER FNS (' + names.size + '):');
console.log([...names].sort().join(', '));

const c = fs.readFileSync('src-legacy/code.js', 'utf8').split(/\r?\n/);
console.log('\n=== copyToClipboard( call sites in code.js ===');
c.forEach((l, i) => { if (l.includes('copyToClipboard(')) console.log((i + 1) + ': ' + l.trim().slice(0, 160)); });
console.log('\n=== onclick=" in code.js ===');
c.forEach((l, i) => { if (/onclick="/.test(l)) console.log((i + 1) + ': ' + l.trim().slice(0, 160)); });

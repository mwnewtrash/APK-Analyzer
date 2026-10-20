const fs = require('fs');
const h = fs.readFileSync('src-legacy/head.html', 'utf8');
let i = h.indexOf('</button>', h.indexOf('goHome'));
console.log('LINKS-DIV:', JSON.stringify(h.slice(i, i + 220)));
for (const id of ['codeAnalysisHeader', 'endpointsHeader', 'dynamicHeader']) {
  const k = h.indexOf(`id="${id}"`);
  console.log('=====', id, '=====');
  console.log(JSON.stringify(h.slice(k - 60, k + 420)));
}
const n = h.indexOf('.nav-link {');
console.log('NAV-LINK-CSS:', JSON.stringify(h.slice(n, n + 500)));

const fs = require('fs');
const h = fs.readFileSync('src-legacy/head.html', 'utf8');
const i = h.indexOf('No data uploaded to servers');
console.log('FOOTER-CTX:', JSON.stringify(h.slice(Math.max(0, i - 300), i + 100)));
const c = fs.readFileSync('src/engine/checks.js', 'utf8');
// print 2 full check objects from different arrays
const m1 = c.match(/authenticationChecks = \[([\s\S]{0,700})/);
console.log('AUTH-SAMPLE:', m1 ? m1[1].slice(0, 700) : 'none');

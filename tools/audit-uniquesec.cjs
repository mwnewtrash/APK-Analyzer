const fs = require('fs');
const h = fs.readFileSync('src-legacy/head.html', 'utf8');
const i = h.indexOf('id="ipEndpointSection"');
console.log(JSON.stringify(h.slice(i - 200, i + 1500)));

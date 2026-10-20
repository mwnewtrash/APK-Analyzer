const fs = require('fs');
const h = fs.readFileSync('src-legacy/head.html', 'utf8');
const show = (label, pat, len = 800) => {
  const i = typeof pat === 'string' ? h.indexOf(pat) : h.search(pat);
  console.log('===== ' + label + ' =====');
  console.log(i === -1 ? 'NOT FOUND' : h.slice(i, i + len));
};
show('NAV', '<nav class="glass');
show('MISHEADER', 'id="misconfigHeader"');
show('UPLOADZONE', 'id="globalUploadZone"');
show('SUMMARY-GRID', 'grid grid-cols-1 md:grid-cols-4');
const e = fs.readFileSync('src/ui/endpoints.js', 'utf8');
const r = e.indexOf('endpoint-card glass');
console.log('===== EP-CARD =====');
console.log(e.slice(Math.max(0, r - 600), r + 1200));

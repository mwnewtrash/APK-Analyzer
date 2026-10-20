// tools/fix-tiles.cjs — recover from the '$1' mishap AND apply the intended
// strip: bare icon divs + slate svgs. Verifies counts; fails loudly otherwise.
const fs = require('fs');
const p = 'src-legacy/head.html';
let h = fs.readFileSync(p, 'utf8');
let chip = 0, head = 0;
h = h.replace(/<div class="\$1">(\s*)<svg class="w-4 h-4 text-[a-z]+-\d+"/g, (m, ws) => {
  chip++;
  return '<div class="section-chip-icon">' + ws + '<svg class="w-4 h-4 text-slate-400"';
});
h = h.replace(/<div class="\$1">(\s*)<svg class="w-5 h-5 text-[a-z]+-\d+"/g, (m, ws) => {
  head++;
  return '<div class="section-header-icon">' + ws + '<svg class="w-5 h-5 text-slate-400"';
});
const leftover = (h.match(/class="\$1"/g) || []).length;
console.log('chip tiles fixed:', chip, '| header tiles fixed:', head, '| leftover $1:', leftover);
if (leftover > 0 || chip + head !== 60) { console.error('UNEXPECTED COUNTS — not writing'); process.exit(1); }
fs.writeFileSync(p, h);
console.log('wrote', p);

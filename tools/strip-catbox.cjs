// tools/strip-catbox.cjs — unbox category-summary icons (idempotent-ish).
// Bare slate glyphs; keeps svg size bumped one step to hold presence.
const fs = require('fs');
const p = 'src-legacy/head.html';
let h = fs.readFileSync(p, 'utf8');
let n = 0;
h = h.replace(/<div class="w-10 h-10 rounded-lg bg-[a-z]+-\d+\/\d+ flex items-center justify-center">\s*<svg class="w-5 h-5 text-[a-z]+-\d+"([\s\S]*?)<\/svg>\s*<\/div>/g,
  (m, rest) => {
    n++;
    return '<svg class="w-6 h-6 text-slate-400"' + rest + '</svg>';
  });
const leftover = (h.match(/<div class="w-10 h-10 rounded-lg bg-/g) || []).length;
console.log('unboxed:', n, '| leftover:', leftover);
if (leftover > 0) { console.error('LEFTOVERS REMAIN — not writing'); process.exit(1); }
fs.writeFileSync(p, h);
console.log('wrote', p);

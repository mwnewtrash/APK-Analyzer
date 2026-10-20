// tools/strip-gradbox.cjs — unbox gradient file-info icons (green=success keeps
// emerald, purple=neutral goes slate). Fails loudly on leftovers.
const fs = require('fs');
const p = 'src-legacy/head.html';
let h = fs.readFileSync(p, 'utf8');
let n = 0;
h = h.replace(/<div class="w-12 h-12 rounded-xl bg-gradient-to-br from-(green|purple)-500 to-(?:emerald-600|pink-600) flex items-center justify-center">\s*<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"([\s\S]*?)<\/svg>\s*<\/div>/g,
  (m, variant, rest) => {
    n++;
    const color = variant === 'green' ? 'emerald' : 'slate';
    return '<svg class="w-7 h-7 text-' + color + '-400" fill="currentColor" viewBox="0 0 24 24"' + rest + '</svg>';
  });
const leftover = (h.match(/w-12 h-12 rounded-xl bg-gradient/g) || []).length;
console.log('unboxed:', n, '| leftover:', leftover);
if (leftover > 0 || n !== 2) { console.error('UNEXPECTED — not writing'); process.exit(1); }
fs.writeFileSync(p, h);
console.log('wrote', p);

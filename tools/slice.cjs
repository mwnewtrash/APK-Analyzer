// Slice declarations out of src-legacy/code.js by byte range (from inventory.json).
// Usage: node tools/slice.cjs <name1> <name2> ...
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'src-legacy', 'code.js'));
const inv = JSON.parse(fs.readFileSync(path.join(root, 'inventory.json'), 'utf8'));
const arr = Array.isArray(inv) ? inv : inv.decls;
const byName = {};
for (const d of arr) byName[d.name] = d;

const want = process.argv.slice(2);
if (want.length === 0) {
  // list all names
  console.log(arr.map(d => `${d.kind}\t${d.name}\t${d.start}-${d.end}\t${d.end-d.start}b`).join('\n'));
  process.exit(0);
}
for (const name of want) {
  const d = byName[name];
  if (!d) { console.log(`// !! NOT FOUND: ${name}`); continue; }
  const src = code.slice(d.start, d.end).toString('utf8');
  console.log(`\n// ===== ${name} (${d.kind}, ${d.start}-${d.end}, ${d.end - d.start}b, line ${d.line}) =====`);
  console.log(src);
}

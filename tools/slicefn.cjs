// Slice specific declarations from code.js by name using xref.json byte ranges.
const fs = require('fs');
const path = require('path');
const code = fs.readFileSync(path.join(__dirname, '..', 'src-legacy', 'code.js'), 'utf8');
const x = require(path.join(__dirname, '..', 'xref.json'));
const decls = x.decls;
const names = process.argv.slice(2);
for (const name of names) {
  const d = decls.find(e => e.name === name);
  if (!d) { console.log(`\n===== ${name}: NOT FOUND =====`); continue; }
  console.log(`\n===== ${name} [${d.start}-${d.end}] =====`);
  console.log(code.slice(d.start, d.end));
}

// verify imports + exports across the project
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const files = [];
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.js')) files.push(p);
  }
}
walk(path.join(ROOT, 'src'));
const issues = [];
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/import\s*\{([^}]*?)}\s*from\s*['"]([^'"]+)['"]/g)) {
    const names = m[1].split(',').map(x => x.trim().replace(/;$/, '')).filter(Boolean);
    for (const n of names) {
      const p = path.resolve(path.dirname(f), m[2]);
      const target = fs.readFileSync(p, 'utf8');
      if (!target.includes(n)) issues.push(`${f} imports '${n}' missing in ${m[2]}`);
    }
  }
}
if (issues.length) { console.log('IMPORT ISSUES:'); issues.forEach(i => console.log('  ' + i)); }
else console.log('NO IMPORT ISSUES');
// count modules missing registerCopy import when needed
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  if (src.includes('registerCopy(') && !src.includes('registerCopy }') && !src.includes('registerCopy,')) {
    console.log('NEEDS registerCopy import: ' + f);
  }
}

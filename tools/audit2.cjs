// check for duplicate exports and other structural issues
const fs = require('fs');
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
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const exps = (src.match(/export\s*\{/g) || []).length;
  const imps = (src.match(/import\s*\{/g) || []).length;
  const hasReg = src.includes('registerCopy');
  if (exps > 1) console.log('DUPLICATE EXPORTS: ' + f + ' (' + exps + ' export blocks)');
  if (hasReg && imps === 0 && !src.includes("registerCopy }") && !src.includes("registerCopy,")) {
    console.log('NEEDS registerCopy IMPORT: ' + f);
  }
  if (exps === 0 && !src.includes('/* no exports */') && src.includes('function ') && !src.includes('export default')) {
    // check for non-default export usage
  }
}
// check worker files
const workerFiles = files.filter(f => f.includes('worker'));
if (workerFiles.length === 0) console.log('NO WORKER FILES YET');
console.log('total js files:', files.length);

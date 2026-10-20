const fs = require('fs');
const code = fs.readFileSync('src-legacy/code.js', 'utf8');
const at = (sub) => {
  const i = code.indexOf(sub);
  if (i === -1) { console.error('MISS:', sub.slice(0, 50)); process.exit(1); }
  return i;
};
// const manifestPostureChecks = [...] — find its full extent (to the closing '];')
const cs = at('const manifestPostureChecks = [');
const ce = code.indexOf('\n        ];', cs) + '\n        ];'.length;
const ls = at('let currentManifestPostureResults = [];');
const le = ls + 'let currentManifestPostureResults = [];'.length;
const lineOf = (off) => code.slice(0, off).split('\n').length;
const x = JSON.parse(fs.readFileSync('xref.json', 'utf8'));
x.decls.push({ name: 'manifestPostureChecks', kind: 'const', line: lineOf(cs), start: cs, end: ce, mutable: false, reassigned: false, refs: [] });
x.decls.push({ name: 'currentManifestPostureResults', kind: 'let', line: lineOf(ls), start: ls, end: le, mutable: true, reassigned: true, refs: [] });
x.mutableGlobals.push({ name: 'currentManifestPostureResults', refs: 0 });
x.total = x.decls.length;
fs.writeFileSync('xref.json', JSON.stringify(x, null, 2));
console.log('const', cs, ce, 'line', lineOf(cs));
console.log('let', ls, le, 'line', lineOf(ls));
console.log('total decls:', x.total);

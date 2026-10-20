// Diagnostic: confirm code.js structure + xref.json shape
const fs = require('fs');
const path = require('path');
const root = 'D:\\Notes_Excel\\Projects_Claude\\APK Analyzer\\apk-analyzer';
const code = fs.readFileSync(path.join(root, 'src-legacy', 'code.js'), 'utf8');
const lines = code.split('\n');
console.log('code.js lines:', lines.length, 'bytes:', Buffer.byteLength(code));

// 1. Indentation of first few non-empty lines
console.log('\n=== first 5 lines (repr) ===');
for (let i = 0; i < 5; i++) console.log(i + 1, JSON.stringify(lines[i].slice(0, 60)));

// 2. DOMContentLoaded locations
console.log('\n=== DOMContentLoaded ===');
lines.forEach((l, i) => { if (l.includes('DOMContentLoaded')) console.log(i + 1, l.trim().slice(0, 80)); });

// 3. Is it wrapped? Check line count of top-level 'function ' declarations vs indented
console.log('\n=== function decl indentation sample ===');
let topFn = 0, indentedFn = 0;
lines.forEach(l => {
  const m = l.match(/^(\s*)function\s+(\w+)/);
  if (m) { if (m[1].length === 0) topFn++; else indentedFn++; }
});
console.log('top-level function decls:', topFn, '| indented function decls:', indentedFn);

// const/let at col 0
let topConst = 0;
lines.forEach(l => { if (/^(const|let|var)\s/.test(l)) topConst++; });
console.log('top-level const/let/var:', topConst);

// 4. xref.json shape
console.log('\n=== xref.json shape ===');
const x = JSON.parse(fs.readFileSync(path.join(root, 'xref.json'), 'utf8'));
console.log('keys:', Object.keys(x));
console.log('decls[0]:', JSON.stringify(x.decls[0]));
console.log('decls count:', x.decls.length);
console.log('mutableGlobals count:', (x.mutableGlobals || []).length);
console.log('consts count:', (x.consts || []).length);
console.log('functions count:', (x.functions || []).length);
console.log('sample mutableGlobal:', JSON.stringify((x.mutableGlobals || [])[0]));
console.log('sample const:', JSON.stringify((x.consts || [])[0]));
console.log('sample function:', JSON.stringify((x.functions || [])[0]));

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const furl = (p) => 'file://' + p.replace(/\\/g, '/');
async function main() {
  const JSZip = require('jszip');
  const { disassembleDex } = await import(furl(path.join(ROOT, 'src', 'core', 'dex.js')));
  const { analyzePatterns } = await import(furl(path.join(ROOT, 'src', 'core', 'patterns.js')));
  const C = await import(furl(path.join(ROOT, 'src', 'engine', 'checks.js')));
  const zip = await JSZip.loadAsync(fs.readFileSync('D:/APK/Lenskart.apk'));
  const parts = [];
  for (const n of Object.keys(zip.files).filter((x) => /\.dex$/i.test(x) && !zip.files[x].dir).slice(0, 10)) {
    parts.push(disassembleDex(await zip.file(n).async('uint8array'), n));
  }
  const smali = parts.join('\n');
  for (const [label, arr] of [['ssl', C.sslPinningChecks], ['flag', C.flagChecks]]) {
    const s = Date.now();
    const res = analyzePatterns(smali, arr, false);
    const det = res.filter((r) => r.detected);
    console.log(`${label}: ${Date.now() - s}ms detected=${det.length}/${res.length} :: ${det.map((r) => r.name).join(' | ')}`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });

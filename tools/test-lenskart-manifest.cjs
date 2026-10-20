const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const furl = (p) => 'file://' + p.replace(/\\/g, '/');
async function main() {
  const JSZip = require('jszip');
  const { parseAxml } = await import(furl(path.join(ROOT, 'src', 'core', 'axml.js')));
  const { analyzePatterns } = await import(furl(path.join(ROOT, 'src', 'core', 'patterns.js')));
  const C = await import(furl(path.join(ROOT, 'src', 'engine', 'checks.js')));
  const zip = await JSZip.loadAsync(fs.readFileSync('D:/APK/Lenskart.apk'));
  const xml = parseAxml(await zip.file('AndroidManifest.xml').async('uint8array'));
  const content = '// FILE: AndroidManifest.xml\n' + xml;
  const res = analyzePatterns(content, C.manifestPostureChecks, false);
  console.log('manifest posture on Lenskart (package com.lenskart.app):');
  for (const r of res) {
    console.log(` ${r.detected ? 'DETECTED' : 'clean   '} ${r.name} :: ${(r.matchedPatterns || []).slice(0, 4).join(' | ')}`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });

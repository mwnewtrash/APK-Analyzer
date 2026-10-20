// tools/sample-run.cjs — real-APK pipeline harness (Node, no DOM).
// Usage: node tools/sample-run.cjs <path-to.apk>
// Exercises: JSZip load, auto-manifest (axml), auto-dex (dex.js),
// pattern analysis (subset), endpoint mining. Times each stage.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const furl = (p) => 'file://' + p.replace(/\\/g, '/');

async function main() {
  const apkPath = process.argv[2];
  if (!apkPath) { console.error('usage: node tools/sample-run.cjs <apk>'); process.exit(2); }
  const JSZip = require('jszip');
  const { disassembleDex } = await import(furl(path.join(ROOT, 'src', 'core', 'dex.js')));
  const { parseAxml } = await import(furl(path.join(ROOT, 'src', 'core', 'axml.js')));
  const { analyzePatterns } = await import(furl(path.join(ROOT, 'src', 'core', 'patterns.js')));
  const { extractEndpoints } = await import(furl(path.join(ROOT, 'src', 'core', 'endpoints.js')));
  const C = await import(furl(path.join(ROOT, 'src', 'engine', 'checks.js')));

  const t = (label, fn) => {
    const s = Date.now();
    const r = fn();
    return Promise.resolve(r).then((v) => ({ v, ms: Date.now() - s, label }));
  };

  console.log('== load ==');
  let r = await t('zip', async () => JSZip.loadAsync(fs.readFileSync(apkPath)));
  const zip = r.v;
  console.log(`zip: ${r.ms}ms, entries=${Object.keys(zip.files).length}`);
  const dexNames = Object.keys(zip.files).filter((n) => /\.dex$/i.test(n) && !zip.files[n].dir);
  console.log('dex files:', dexNames.join(', '));

  console.log('== auto-manifest ==');
  r = await t('axml', async () => parseAxml(await zip.file('AndroidManifest.xml').async('uint8array')));
  const xml = r.v;
  console.log(`axml: ${r.ms}ms, xml=${xml.length} chars`);
  const pkg = (xml.match(/package="([^"]+)"/) || [])[1];
  console.log('package:', pkg || 'NOT FOUND');
  console.log('xml head:', xml.slice(0, 200).replace(/\n/g, ' '));

  console.log('== auto-dex ==');
  const parts = [];
  for (const n of dexNames.slice(0, 10)) {
    const bytes = await zip.file(n).async('uint8array');
    const s = Date.now();
    const smali = disassembleDex(bytes, n);
    const ms = Date.now() - s;
    const classes = (smali.match(/\/\/ FILE: /g) || []).length;
    const strings = (smali.match(/const-string /g) || []).length;
    console.log(`${n}: bytes=${bytes.length} smali=${smali.length} classes=${classes} const-strings=${strings} ${ms}ms`);
    parts.push(smali);
  }
  const smaliAll = parts.join('\n');
  console.log(`total smali: ${(smaliAll.length / 1048576).toFixed(1)} MB`);

  console.log('== patterns (subset) ==');
  const subset = [
    ['root', C.rootChecks], ['ssl', C.sslPinningChecks], ['logging', C.insecureLoggingChecks],
    ['auth', C.authenticationChecks], ['crypto', C.cryptographyChecks],
  ];
  if (process.argv.includes('--full')) {
    subset.push(
      ['emulator', C.emulatorChecks], ['flag', C.flagChecks], ['storage', C.localStorageChecks],
      ['authz', C.authorizationChecks], ['featflags', C.featureFlagsChecks],
      ['hiddenep', C.hiddenEndpointsChecks], ['authtrust', C.authTrustChecks],
      ['massassign', C.massAssignmentChecks], ['inputval', C.inputValidationChecks],
      ['bizlogic', C.businessLogicChecks], ['filehandling', C.fileHandlingChecks],
      ['errorhandling', C.errorHandlingChecks], ['envleak', C.envLeakageChecks],
      ['cryptotrust', C.cryptoTrustChecks], ['sqli', C.sqlInjectionChecks],
      ['nosqli', C.nosqlInjectionChecks], ['ssrf', C.ssrfVulnerabilityChecks],
      ['xxe', C.xxeVulnerabilityChecks], ['deser', C.deserializationVulnerabilityChecks],
      ['cmdi', C.commandInjectionChecks],
    );
  }
  for (const [label, checks] of subset) {
    const s = Date.now();
    const res = analyzePatterns(smaliAll, checks, false);
    const det = res.filter((x) => x.detected);
    console.log(`${label}: ${Date.now() - s}ms detected=${det.length}/${res.length} :: ${det.map((x) => x.name || x.title || '?').slice(0, 8).join(' | ')}`);
  }

  console.log('== endpoints ==');
  r = await t('endpoints', async () => extractEndpoints(smaliAll));
  const byType = {};
  r.v.forEach((e) => { byType[e.type] = (byType[e.type] || 0) + 1; });
  console.log(`endpoints: ${r.ms}ms total=${r.v.length}`, JSON.stringify(byType));
  console.log('sample:', r.v.slice(0, 5).map((e) => e.url).join('\n  '));
}
main().catch((e) => { console.error(e); process.exit(1); });

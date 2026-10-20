const path = require('path');
const ROOT = path.join(__dirname, '..');
const furl = (p) => 'file://' + p.replace(/\\/g, '/');
async function main() {
  let fail = 0;
  const check = (l, c) => { console.log((c ? 'PASS ' : 'FAIL ') + l); if (!c) fail++; };
  const { buildScanCSV } = await import(furl(path.join(ROOT, 'src', 'ui', 'export-report.js')));
  const data = {
    currentRootResults: [
      { name: 'SU Check', riskLevel: 'HIGH', detected: true, description: 'root desc', instances: [
        { file: 'a.smali', lineNumber: 3, pattern: 'su', content: 'const-string v0, "su"' },
      ]},
      { name: 'Quiet Check', riskLevel: 'LOW', detected: false, description: 'quiet desc', instances: [] },
    ],
    currentSSLResults: [
      { name: 'Trust All', riskLevel: 'CRITICAL', detected: true, description: 'ssl desc', instances: [
        { file: null, lineNumber: 0, pattern: 'x', content: 'say "hi", ok\nnewline' },
      ]},
    ],
    extractedEndpoints: [{ url: 'https://example.com/a?b=c', category: 'API', type: 'api' }],
  };
  const csv = buildScanCSV('t.apk', data);
  const lines = csv.split('\n');
  check('bom', csv.charCodeAt(0) === 0xfeff);
  check('header', lines[0].replace(/^\uFEFF/, '') === 'section,category,check,severity,verdict,file,line,pattern,evidence,description');
  // summary block: 5 rows
  check('summary-app', lines[1] === 'summary,Scan,Application,,,,,,,t.apk');
  check('summary-exported', lines[2].startsWith('summary,Scan,Exported,,,,,,,'));
  check('summary-checks', lines[3] === 'summary,Scan,Checks analyzed,,,,,,,3');
  check('summary-findings', lines[4] === 'summary,Scan,Findings,,,,,,,2');
  check('summary-endpoints', lines[5] === 'summary,Scan,Endpoints,,,,,,,1');
  // findings severity-sorted: CRITICAL (SSL) before HIGH (Root), human labels
  // (Trust All's evidence contains a real newline, so assert on text order)
  check('finding-order', csv.indexOf('finding,SSL Pinning,Trust All,CRITICAL,detected') !== -1
    && csv.indexOf('finding,Root Detection,SU Check,HIGH,detected') !== -1
    && csv.indexOf('Trust All') < csv.indexOf('SU Check'));
  check('finding-evidence', csv.includes('ssl desc'));
  check('quote-escaping', csv.includes('"say ""hi"", ok\nnewline"'));
  // endpoint row
  const ep = lines.find((l) => l.startsWith('endpoint,'));
  check('endpoint-row', ep === 'endpoint,API,https://example.com/a?b=c,,detected,,,,https://example.com/a?b=c,');
  // ruled-out condensed at the end with description
  const ro = lines.find((l) => l.startsWith('ruled-out,'));
  check('ruled-out-row', ro === 'ruled-out,Root Detection,Quiet Check,LOW,not-detected,,,,,quiet desc');
  check('ruled-out-last', lines.indexOf(ro) > lines.indexOf(ep));
  // history wiring
  const fs = require('fs');
  const h = fs.readFileSync(path.join(ROOT, 'src', 'ui', 'history.js'), 'utf8');
  check('csv-button', h.includes('data-scan-csv'));
  check('csv-handler', h.includes('downloadScanCSV'));
  // home wiring
  const m = fs.readFileSync(path.join(ROOT, 'src', 'main.js'), 'utf8');
  check('gohome-fn', m.includes('export function goHome()'));
  check('gohome-exposed', m.includes('goHome,'));
  const head = fs.readFileSync(path.join(ROOT, 'src-legacy', 'head.html'), 'utf8');
  check('home-markup', head.includes('onclick="goHome()"') && head.includes('M2.25 12l8.954-8.955'));
  const gi = head.indexOf('onclick="goHome()"');
  const gwin = head.slice(gi, gi + 1200);
  check('header-home-scope', gwin.includes('M2.25 12l8.954-8.955') && !gwin.includes('M9 12l2 2 4-4m5.618-4.016'));
  check('android-mark', head.includes('M4 16.5a8 8 0 0 1 16 0H4z') && head.includes('aria-hidden="true"'));
  check('android-size', head.includes('h-[22px] w-auto text-[#3DDC84]'));
  check('android-after-title', head.indexOf('APK Security Analyzer\n                    </span>') < head.indexOf('M4 16.5a8 8 0 0 1 16 0H4z'));
  check('footer-removed', !head.includes('No data uploaded to servers'));
  const gi2 = head.indexOf('onclick="goHome()"');
  check('logo-20px', head.slice(gi2, gi2 + 400).includes('class="w-5 h-5 text-teal-300"'));
  check('advanced-hidden', head.includes('<div id="jadxAdvanced" class="hidden">') && !head.includes('<details'));
  check('hint-hidden', head.includes('<p id="analysisHint" class="hidden '));
  check('jadx-ids-kept', head.includes('id="decompiledFolderInput"') && head.includes('id="decompiledStatus"') && head.includes('id="hintText"'));
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });

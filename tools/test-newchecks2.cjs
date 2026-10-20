const path = require('path');
const ROOT = path.join(__dirname, '..');
const furl = (p) => 'file://' + p.replace(/\\/g, '/');
async function main() {
  let fail = 0;
  const check = (l, c) => { console.log((c ? 'PASS ' : 'FAIL ') + l); if (!c) fail++; };
  const { analyzePatterns } = await import(furl(path.join(ROOT, 'src', 'core', 'patterns.js')));
  const C = await import(furl(path.join(ROOT, 'src', 'engine', 'checks.js')));
  const code = [
    '// FILE: T.java',
    'SSLSocketFactory sf = new SSLSocketFactory(ALLOW_ALL_HOSTNAME_VERIFIER);',
    'HttpsURLConnection.setDefaultHostnameVerifier(new HostnameVerifier() { public boolean verify(String h, SSLSession s) { return true; } });',
    'public void onReceivedSslError(WebView v, SslErrorHandler handler, SslError e) { handler.proceed(); }',
    'settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);',
    'WebView.setWebContentsDebuggingEnabled(true);',
    'settings.setAllowUniversalAccessFromFileURLs(true);',
  ].join('\n');
  const manifest = [
    '// FILE: AndroidManifest.xml',
    '<manifest package="com.t" android:versionCode="1">',
    '<uses-sdk android:minSdkVersion="21" android:targetSdkVersion="30" />',
    '<uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />',
    '<uses-permission android:name="android.permission.BIND_ACCESSIBILITY_SERVICE" />',
    '<receiver android:name=".SmsR"><intent-filter><action android:name="android.provider.Telephony.SMS_RECEIVED" /></intent-filter></receiver>',
    '<receiver android:name=".B"><intent-filter><action android:name="android.intent.action.BOOT_COMPLETED" /></intent-filter></receiver>',
    'ctx.sendStickyBroadcast(new Intent("x"));',
    '<provider android:name="androidx.core.content.FileProvider"><meta-data android:name="android.support.FILE_PROVIDER_PATHS" android:resource="@xml/fp" /></provider>',
    '<external-path name="e" path="." /><root-path name="r" path="/" />',
    '<application android:testOnly="true" android:requestLegacyExternalStorage="true">',
  ].join('\n');
  const run = (content, arr, want) => {
    const res = analyzePatterns(content, arr, false);
    const got = Object.fromEntries(res.map((r) => [r.name, r.detected]));
    for (const [name, exp] of Object.entries(want)) check(`${name}=${exp}`, !!got[name] === exp);
  };
  run(code, C.sslPinningChecks, { 'Disabled Hostname Verification': true, 'SSL Errors Ignored': true, 'Mixed Content Allowed': true });
  run(code, C.flagChecks, { 'WebView Remote Debugging': true, 'WebView Universal File Access': true });
  run(manifest, C.manifestPostureChecks, {
    'Outdated targetSdkVersion': true, 'Legacy minSdkVersion': true, 'High-Risk Permissions': true,
    'SMS Interception Surface': true, 'Boot Persistence Receivers': true, 'Sticky Broadcasts': true,
    'Risky FileProvider Paths': true, 'Debuggable/Test/Legacy Flags': true,
  });
  // negatives: modern manifest stays quiet
  const modern = '// FILE: AndroidManifest.xml\n<manifest><uses-sdk android:minSdkVersion="26" android:targetSdkVersion="35" /></manifest>';
  run(modern, C.manifestPostureChecks, { 'Outdated targetSdkVersion': false, 'Legacy minSdkVersion': false, 'High-Risk Permissions': false });
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });

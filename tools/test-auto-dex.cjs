// tools/test-auto-dex.cjs — synthetic unit test for auto-dex (dex.js) + auto-manifest (axml.js).
// Builds minimal valid DEX and AXML binaries by hand, asserts parser output.
// Usage: node tools/test-auto-dex.cjs
const path = require('path');
const ROOT = path.join(__dirname, '..');

async function main() {
  const { disassembleDex, isDex } = await import('file://' + path.join(ROOT, 'src', 'core', 'dex.js').replace(/\\/g, '/'));
  const { parseAxml, isAxml } = await import('file://' + path.join(ROOT, 'src', 'core', 'axml.js').replace(/\\/g, '/'));
  let fail = 0;
  const check = (label, cond) => { console.log((cond ? 'PASS ' : 'FAIL ') + label); if (!cond) fail++; };

  // ---------- synthetic DEX ----------
  // strings: 0 Lfoo/Bar; | 1 Ljava/lang/Object; | 2 ()V | 3 V | 4 greet | 5 hi
  const strs = ['Lfoo/Bar;', 'Ljava/lang/Object;', '()V', 'V', 'greet', 'hi'];
  const buf = [];
  const u8 = (v) => buf.push(v & 0xff);
  const u16 = (v) => { u8(v); u8(v >> 8); };
  const u32 = (v) => { u8(v); u8(v >> 8); u8(v >> 16); u8(v >> 24); };
  const at = (pos, fn) => { const cur = buf.length; while (buf.length < pos) u8(0); return cur; };
  // header (112 bytes)
  const magic = [0x64, 0x65, 0x78, 0x0a, 0x30, 0x33, 0x35, 0x00];
  magic.forEach(u8);
  u32(0); for (let i = 0; i < 20; i++) u8(0); // checksum + signature
  const fileSizePos = buf.length; u32(0);
  u32(0x70); u32(0x12345678); u32(0); u32(0); u32(0); // header/endian/link/map
  const strSizePos = buf.length; u32(strs.length); const strOffPos = buf.length; u32(0);
  const typSizePos = buf.length; u32(3); const typOffPos = buf.length; u32(0);
  const proSizePos = buf.length; u32(1); const proOffPos = buf.length; u32(0);
  u32(0); const fldOffPos = buf.length; u32(0);
  const metSizePos = buf.length; u32(1); const metOffPos = buf.length; u32(0);
  const clsSizePos = buf.length; u32(1); const clsOffPos = buf.length; u32(0);
  const dataSizePos = buf.length; u32(0); const dataOffPos = buf.length; u32(0);
  const patch32 = (pos, v) => { buf[pos] = v & 0xff; buf[pos + 1] = (v >> 8) & 0xff; buf[pos + 2] = (v >> 16) & 0xff; buf[pos + 3] = (v >> 24) & 0xff; };
  // string_ids
  patch32(strOffPos, buf.length);
  const strDataPos = [];
  for (let i = 0; i < strs.length; i++) { strDataPos.push(0); u32(0); }
  // type_ids
  patch32(typOffPos, buf.length);
  [0, 1, 3].forEach((s) => u32(s));
  // proto_ids
  patch32(proOffPos, buf.length);
  u32(2); u32(2); u32(0); // shorty "()V", return V, no params
  // method_ids
  patch32(metOffPos, buf.length);
  u16(0); u16(0); u32(4); // class 0, proto 0, name "greet"
  // class_defs
  patch32(clsOffPos, buf.length);
  const classDataPosPtr = buf.length;
  u32(0); u32(0x1); u32(1); u32(0); u32(0xffffffff); u32(0); u32(0); u32(0);
  // data section
  patch32(dataOffPos, buf.length);
  const dataStart = buf.length;
  // string_data_items (ids patched to each item's offset as appended)
  let idBase = strOffPos;
  // string_ids region starts at strOffPos value; patch each entry:
  const idsOff = buf[strOffPos] | (buf[strOffPos + 1] << 8) | (buf[strOffPos + 2] << 16) | (buf[strOffPos + 3] << 24);
  for (let i = 0; i < strs.length; i++) {
    const s = strs[i];
    patch32(idsOff + i * 4, buf.length);
    u8(s.length); for (const ch of s) u8(ch.charCodeAt(0)); u8(0);
  }
  // class_data_item: static=0 inst=0 direct=1 virt=0; method diff=0 flags=9 code=uleb(addr)
  const classDataOff = buf.length;
  u8(0); u8(0); u8(1); u8(0); u8(0); u8(9);
  const codeOffPtr = buf.length; u8(0); u8(0); // uleb placeholder (2 bytes; addr < 0x4000)
  const codeOff = buf.length;
  patch32(classDataPosPtr + 24, classDataOff);
  // uleb128(codeOff) into placeholder
  buf[codeOffPtr] = (codeOff & 0x7f) | 0x80; buf[codeOffPtr + 1] = (codeOff >> 7) & 0x7f;
  // code_item: regs=1 ins=0 outs=0 tries=0 debug=0 insns=3; const-string v0,5; return-void
  u16(1); u16(0); u16(0); u16(0); u32(0); u32(3);
  u16(0x001a); u16(5); u16(0x000e);
  patch32(fileSizePos, buf.length);
  patch32(dataSizePos, buf.length - dataStart);
  const dex = new Uint8Array(buf);

  check('isDex', isDex(dex));
  const smali = disassembleDex(dex, 'classes.dex');
  check('FILE marker', smali.includes('// FILE: Lfoo/Bar;.smali'));
  check('class line', smali.includes('.class public Lfoo/Bar;'));
  check('super', smali.includes('.super Ljava/lang/Object;'));
  check('method', smali.includes('.method public static Lfoo/Bar;->greet()V'));
  check('const-string', smali.includes('const-string v0, "hi"'));
  check('return-void', smali.includes('return-void'));

  // ---------- synthetic AXML ----------
  const ab = [];
  const au16 = (v) => { ab.push(v & 0xff, (v >> 8) & 0xff); };
  const au32 = (v) => { ab.push(v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, (v >> 24) & 0xff); };
  const au8 = (v) => { ab.push(v & 0xff); };
  const astrs = ['manifest', 'package', 'com.example', 'application', 'android', 'http://schemas.android.com/apk/res/android', 'name', 'com.example.Main'];
  au16(0x0003); au16(8); au32(8); // xml header
  const poolPos = ab.length;
  au16(0x0001); au16(28);
  const poolSizePtr = ab.length; au32(0);
  au32(astrs.length); au32(0); au32(0);
  const poolStrStartPtr = ab.length; au32(0);
  au32(0); // stylesStart
  const offBase = ab.length;
  astrs.forEach(() => au32(0));
  const strStart = ab.length;
  astrs.forEach((s, i) => {
    const v = ab[offBase + i * 4];
    void v;
    ab[offBase + i * 4] = (ab.length - strStart) & 0xff;
    ab[offBase + i * 4 + 1] = ((ab.length - strStart) >> 8) & 0xff;
    ab[offBase + i * 4 + 2] = ((ab.length - strStart) >> 16) & 0xff;
    ab[offBase + i * 4 + 3] = ((ab.length - strStart) >> 24) & 0xff;
    au16(s.length);
    for (const ch of s) au16(ch.charCodeAt(0));
    au16(0);
  });
  ab[poolStrStartPtr] = (28 + astrs.length * 4) & 0xff;
  ab[poolStrStartPtr + 1] = ((28 + astrs.length * 4) >> 8) & 0xff;
  const poolEnd = ab.length;
  ab[poolSizePtr] = (poolEnd - poolPos) & 0xff; ab[poolSizePtr + 1] = ((poolEnd - poolPos) >> 8) & 0xff;
  au16(0x0180); au16(8); au32(8); // resource map (empty)
  au16(0x0100); au16(16); au32(16); au32(5); au32(4); // start ns: uri=5 prefix=4
  // start manifest, 1 attr: package="com.example"
  au16(0x0102); au16(16); au32(28 + 20);
  au32(0xffffffff); au32(0);
  au16(28); au16(20); au16(1); au16(0); au16(0); au16(0);
  au32(0xffffffff); au32(1); au32(0xffffffff); au16(8); au8(0); au8(3); au32(2);
  // start application, 1 attr: android:name="com.example.Main"
  au16(0x0102); au16(16); au32(28 + 20);
  au32(0xffffffff); au32(3);
  au16(28); au16(20); au16(1); au16(0); au16(0); au16(0);
  au32(5); au32(6); au32(0xffffffff); au16(8); au8(0); au8(3); au32(7);
  // end application, end manifest
  au16(0x0103); au16(16); au32(16); au32(0xffffffff); au32(3);
  au16(0x0103); au16(16); au32(16); au32(0xffffffff); au32(0);
  const axml = new Uint8Array(ab);
  check('isAxml', isAxml(axml));
  const xml = parseAxml(axml);
  check('package attr', xml.includes('package="com.example"'));
  check('android ns attr', xml.includes('android:name="com.example.Main"'));
  check('xmlns', xml.includes('xmlns:android="http://schemas.android.com/apk/res/android"'));
  check('self-close app', xml.includes('<application android:name="com.example.Main"/>'));
  check('manifest wrap', xml.includes('<manifest') && xml.includes('</manifest>'));

  // ---------- aapt2-style extended layout (8 gap bytes, name@+20, attrs@+36) ----------
  {
    const b2 = [];
    const w16 = (v) => { b2.push(v & 0xff, (v >> 8) & 0xff); };
    const w32 = (v) => { b2.push(v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, (v >> 24) & 0xff); };
    const w8 = (v) => { b2.push(v & 0xff); };
    w16(0x0003); w16(8); w32(8);
    // pool: manifest, package, com.ext, uses-sdk, minSdkVersion
    const xs = ['manifest', 'package', 'com.ext', 'uses-sdk', 'minSdkVersion'];
    w16(0x0001); w16(28);
    const szP = b2.length; w32(0);
    w32(xs.length); w32(0); w32(0);
    const ssP = b2.length; w32(0); w32(0);
    const ob = b2.length; xs.forEach(() => w32(0));
    const ds = b2.length;
    xs.forEach((s, i) => {
      b2[ob + i * 4] = (b2.length - ds) & 0xff;
      w16(s.length);
      for (const ch of s) w16(ch.charCodeAt(0));
      w16(0);
    });
    b2[ssP] = (28 + xs.length * 4) & 0xff;
    const pe = b2.length;
    b2[szP] = (pe - (szP - 4)) & 0xff; b2[szP + 1] = ((pe - (szP - 4)) >> 8) & 0xff;
    // start manifest: ns@+8, gap@+12..19, name@+20, attrs@+36; 1 attr package="com.ext"
    w16(0x0102); w16(16); w32(36 + 20);
    w32(0xffffffff); w32(0xffffffff); w32(0xffffffff);
    w32(0); // nameIdx=0 manifest
    w16(20); w16(20); w16(1); w16(0); w16(0); w16(0);
    w32(0xffffffff); w32(1); w32(0xffffffff); w16(8); w8(0); w8(3); w32(2);
    // start uses-sdk: 1 attr minSdkVersion=21 (int)
    w16(0x0102); w16(16); w32(36 + 20);
    w32(0xffffffff); w32(0xffffffff); w32(0xffffffff);
    w32(3);
    w16(20); w16(20); w16(1); w16(0); w16(0); w16(0);
    w32(0xffffffff); w32(4); w32(0xffffffff); w16(8); w8(0); w8(0x10); w32(21);
    w16(0x0103); w16(16); w32(16); w32(0xffffffff); w32(3);
    w16(0x0103); w16(16); w32(16); w32(0xffffffff); w32(0);
    const x2 = parseAxml(new Uint8Array(b2));
    check('ext-layout package', x2.includes('package="com.ext"'));
    check('ext-layout int attr', x2.includes('minSdkVersion="21"'));
    check('ext-layout nest', x2.includes('<uses-sdk') && x2.includes('</manifest>'));
  }

  // ---------- purity: no DOM in core parsers ----------
  for (const f of ['src/core/dex.js', 'src/core/axml.js']) {
    const src = require('fs').readFileSync(path.join(ROOT, f), 'utf8');
    check(f + ' DOM-free', !/document|window|localStorage|navigator\./.test(src));
  }
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });

// core/axml.js — HAND-MAINTAINED. Binary AndroidManifest.xml (AXML) → XML text.
// Lets APK-only runs do permission/component analysis without a JADX folder.
// Pure code: no DOM, no imports.

const ANDROID_NS = 'http://schemas.android.com/apk/res/android';

function escXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function isAxml(bytes) {
  return bytes.length > 8 && bytes[0] === 0x03 && bytes[1] === 0x00;
}

export function parseAxml(bytes) {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const u16 = (o) => dv.getUint16(o, true);
  const u32 = (o) => dv.getUint32(o, true);
  if (!isAxml(bytes)) throw new Error('not an AXML file');
  let strings = [];
  const nsMap = new Map(); // uri -> prefix
  let xml = '';
  const stack = []; // {tagEnd, hasKids}
  let rootDone = false;

  const readLen = (o) => {
    // UTF-8 varint or UTF-16 u16 length, depending on pool flags (handled by caller).
    if (bytes[o] & 0x80) return [((bytes[o] & 0x7f) << 8) | bytes[o + 1], o + 2];
    return [bytes[o], o + 1];
  };

  const parsePool = (base) => {
    const count = u32(base + 8), styleCount = u32(base + 12);
    const flags = u32(base + 16), stringsStart = u32(base + 20);
    const utf8 = (flags & 0x100) !== 0;
    const arr = [];
    for (let i = 0; i < count; i++) {
      let p = base + u32(base + 28 + i * 4) + stringsStart;
      if (utf8) {
        p = readLen(p)[1]; // utf16 char count — skip
        const [n, q] = readLen(p); // byte count
        arr.push(new TextDecoder('utf-8', { fatal: false }).decode(bytes.subarray(q, q + n)));
      } else {
        const n = u16(p);
        let s = '';
        for (let k = 0; k < n; k++) s += String.fromCharCode(u16(p + 2 + k * 2));
        arr.push(s);
      }
    }
    void styleCount;
    return arr;
  };

  let pos = 8;
  let guard = 0; // absolute backstop: chunk walk must always terminate
  while (pos + 8 <= bytes.length && guard++ < 100000) {
    const type = u16(pos), size = u32(pos + 4);
    if (size < 8 || pos + size > bytes.length + 1024) break;
    if (type === 0x0001) {
      strings = parsePool(pos);
    } else if (type === 0x0100) {
      const uri = strings[u32(pos + 8)] || '', prefix = strings[u32(pos + 12)] || '';
      if (uri) nsMap.set(uri, prefix);
    } else if (type === 0x0102) {
      // aapt2 start-element chunks carry 8 extra bytes between ns and name
      // (name@+20, attrs@+36); legacy files use name@+12, attrs@+28.
      // Validate before trusting either layout.
      const validName = (i) => i !== 0xffffffff && i < strings.length;
      const legacyOk = validName(u32(pos + 12)) && u16(pos + 18) === 20 &&
        28 + 20 * u16(pos + 20) <= size && u16(pos + 20) < 500;
      const extOk = validName(u32(pos + 20)) && u16(pos + 26) === 20 &&
        36 + 20 * u16(pos + 28) <= size && u16(pos + 28) < 500;
      if (!legacyOk && !extOk) {
        // corrupt element — skip body but MUST still advance pos (see bottom)
      } else {
      const ext = !legacyOk;
      const name = strings[ext ? u32(pos + 20) : u32(pos + 12)] || '?';
      const attrCount = ext ? u16(pos + 28) : u16(pos + 20);
      const attrBase = pos + (ext ? 36 : 28);
      let tag = `<${name}`;
      for (let i = 0; i < attrCount; i++) {
        const a = attrBase + i * 20;
        const nsIdx = u32(a), nameIdx = u32(a + 4), raw = u32(a + 8);
        const dataType = bytes[a + 15], data = u32(a + 16);
        const aName = strings[nameIdx] || '?';
        // Prefix: exact namespace mapping first, android-URI heuristic second
        // (aapt2 namespace chunks don't follow the textbook layout either).
        let prefix = '';
        if (nsIdx !== 0xffffffff) {
          const uri = strings[nsIdx] || '';
          prefix = nsMap.get(uri) || '';
          if (!prefix && /apk\/res\/android/.test(uri)) {
            prefix = 'android';
            nsMap.set(uri, prefix);
          }
        }
        let value;
        if (dataType === 0x03) value = strings[data] ?? '';
        else if (raw !== 0xffffffff && strings[raw] !== undefined) value = strings[raw];
        else if (dataType === 0x10) value = String(data | 0);
        else if (dataType === 0x11) value = '0x' + data.toString(16);
        else if (dataType === 0x12) value = data ? 'true' : 'false';
        else value = '0x' + data.toString(16);
        tag += ` ${prefix ? prefix + ':' : ''}${aName}="${escXml(value)}"`;
      }
      if (!rootDone) { tag += ` xmlns:android="${ANDROID_NS}"`; rootDone = true; }
      if (stack.length) stack[stack.length - 1].hasKids = true;
      const tagEnd = xml.length + tag.length;
      xml += tag + '>\n';
      stack.push({ name, tagEnd, hasKids: false });
      } // end layout-validated element body
    } else if (type === 0x0103) {
      const top = stack.pop();
      if (!top) continue;
      const name = strings[u32(pos + 12)] || top.name;
      void name;
      if (!top.hasKids) xml = xml.slice(0, top.tagEnd) + '/>\n' + xml.slice(top.tagEnd + 2);
      else xml += `</${top.name}>\n`;
    }
    if (size === 0) break;
    pos += size;
  }
  return xml;
}

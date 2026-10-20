// core/dex.js — HAND-MAINTAINED. Minimal DEX→smali disassembler (auto-dex).
// Lets APK-only runs analyze Dalvik bytecode without a manual JADX folder.
// Pure code: no DOM, no imports — safe for workers. Output uses `// FILE:`
// markers so analyzePatterns attributes findings per class. Linear sweep,
// analysis-grade (not reassemblable): branch labels are emitted, payloads
// are skipped, unknown opcodes are dumped raw.

// Instruction width in 16-bit code units, indexed by opcode. 0 = unused
// (treated as 1 at decode time to stay in sync on corrupt input).
const NO_OFF = 0xffffffff;
const WIDTHS = (() => {
  const w = new Array(256).fill(0);
  const w1 = [0x00,
    0x01, 0x04, 0x07, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x10, 0x11,
    0x12, 0x1d, 0x21, 0x27, 0x28,
    0x7b, 0x7c, 0x7d, 0x7e, 0x7f, 0x80, 0x81, 0x82, 0x83, 0x84, 0x85, 0x86,
    0x87, 0x88, 0x89, 0x8a, 0x8b, 0x8c, 0x8d, 0x8e, 0x8f,
    0xb0, 0xb1, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xbb,
    0xbc, 0xbd, 0xbe, 0xbf, 0xc0, 0xc1, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7,
    0xc8, 0xc9, 0xca, 0xcb, 0xcc, 0xcd, 0xce, 0xcf];
  const w2 = [0x02, 0x05, 0x08, 0x13, 0x15, 0x16, 0x19, 0x1a, 0x1c, 0x1e, 0x1f,
    0x20, 0x22, 0x23, 0x29, 0x2d, 0x2e, 0x2f, 0x30, 0x31,
    0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x3b, 0x3c, 0x3d,
    0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4a, 0x4b, 0x4c, 0x4d, 0x4e, 0x4f,
    0x50, 0x51, 0x52, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x5b,
    0x5c, 0x5d, 0x5e, 0x5f, 0x60, 0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67,
    0x68, 0x69, 0x6a, 0x6b, 0x6c, 0x6d,
    0x90, 0x91, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0x9b,
    0x9c, 0x9d, 0x9e, 0x9f, 0xa0, 0xa1, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7,
    0xa8, 0xa9, 0xaa, 0xab, 0xac, 0xad, 0xae, 0xaf,
    0xd0, 0xd1, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xdb,
    0xdc, 0xdd, 0xde, 0xdf, 0xe0, 0xe1, 0xe2];
  const w3 = [0x03, 0x06, 0x14, 0x17, 0x1b, 0x24, 0x25, 0x26, 0x2a, 0x2b, 0x2c,
    0x6e, 0x6f, 0x70, 0x71, 0x72, 0x74, 0x75, 0x76, 0x77, 0x78];
  w1.forEach((op) => { w[op] = 1; });
  w2.forEach((op) => { w[op] = 2; });
  w3.forEach((op) => { w[op] = 3; });
  w[0x18] = 5; // const-wide 51l
  w[0xfa] = 4; w[0xfb] = 4; // invoke-polymorphic(+range)
  return w;
})();

const NAMES = {
  0x00: 'nop', 0x01: 'move', 0x02: 'move/from16', 0x03: 'move/16', 0x04: 'move-wide', 0x05: 'move-wide/from16',
  0x06: 'move-wide/16', 0x07: 'move-object', 0x08: 'move-object/from16', 0x09: 'move-object/16',
  0x0a: 'move-result', 0x0b: 'move-result-wide', 0x0c: 'move-result-object', 0x0d: 'move-exception',
  0x0e: 'return-void', 0x0f: 'return', 0x10: 'return-wide', 0x11: 'return-object',
  0x12: 'const/4', 0x13: 'const/16', 0x14: 'const', 0x15: 'const/high16', 0x16: 'const-wide/16',
  0x17: 'const-wide/32', 0x18: 'const-wide', 0x19: 'const-wide/high16', 0x1a: 'const-string',
  0x1b: 'const-string/jumbo', 0x1c: 'const-class', 0x1d: 'monitor-enter', 0x1e: 'monitor-exit',
  0x1f: 'check-cast', 0x20: 'instance-of', 0x21: 'array-length', 0x22: 'new-instance', 0x23: 'new-array',
  0x24: 'filled-new-array', 0x25: 'filled-new-array/range', 0x26: 'fill-array-data', 0x27: 'throw',
  0x28: 'goto', 0x29: 'goto/16', 0x2a: 'goto/32', 0x2b: 'packed-switch', 0x2c: 'sparse-switch',
  0x2d: 'cmpl-float', 0x2e: 'cmpg-float', 0x2f: 'cmpl-double', 0x30: 'cmpg-double', 0x31: 'cmp-long',
  0x32: 'if-eq', 0x33: 'if-ne', 0x34: 'if-lt', 0x35: 'if-ge', 0x36: 'if-gt', 0x37: 'if-le',
  0x38: 'if-eqz', 0x39: 'if-nez', 0x3a: 'if-ltz', 0x3b: 'if-gez', 0x3c: 'if-gtz', 0x3d: 'if-lez',
  0x44: 'aget', 0x45: 'aget-wide', 0x46: 'aget-object', 0x47: 'aget-boolean', 0x48: 'aget-byte',
  0x49: 'aget-char', 0x4a: 'aget-short', 0x4b: 'aput', 0x4c: 'aput-wide', 0x4d: 'aput-object',
  0x4e: 'aput-boolean', 0x4f: 'aput-byte', 0x50: 'aput-char', 0x51: 'aput-short',
  0x52: 'iget', 0x53: 'iget-wide', 0x54: 'iget-object', 0x55: 'iget-boolean', 0x56: 'iget-byte',
  0x57: 'iget-char', 0x58: 'iget-short', 0x59: 'iput', 0x5a: 'iput-wide', 0x5b: 'iput-object',
  0x5c: 'iput-boolean', 0x5d: 'iput-byte', 0x5e: 'iput-char', 0x5f: 'iput-short',
  0x60: 'sget', 0x61: 'sget-wide', 0x62: 'sget-object', 0x63: 'sget-boolean', 0x64: 'sget-byte',
  0x65: 'sget-char', 0x66: 'sget-short', 0x67: 'sput', 0x68: 'sput-wide', 0x69: 'sput-object',
  0x6a: 'sput-boolean', 0x6b: 'sput-byte', 0x6c: 'sput-char', 0x6d: 'sput-short',
  0x6e: 'invoke-virtual', 0x6f: 'invoke-super', 0x70: 'invoke-direct', 0x71: 'invoke-static',
  0x72: 'invoke-interface', 0x74: 'invoke-virtual/range', 0x75: 'invoke-super/range',
  0x76: 'invoke-direct/range', 0x77: 'invoke-static/range', 0x78: 'invoke-interface/range',
  0x7b: 'neg-int', 0x7c: 'not-int', 0x90: 'add-int', 0x91: 'sub-int', 0xb0: 'add-int/2addr',
  0xd0: 'add-int/lit16', 0xd8: 'add-int/lit8',
};

function uleb(bytes, off) {
  let result = 0, shift = 0, i = off;
  while (true) {
    const b = bytes[i++];
    result |= (b & 0x7f) << shift;
    if ((b & 0x80) === 0) break;
    shift += 7;
  }
  return [result >>> 0, i];
}

const s16 = (v) => (v & 0x8000 ? v - 0x10000 : v);
const s8 = (v) => (v & 0x80 ? v - 0x100 : v);
const s4 = (v) => (v & 0x8 ? v - 0x10 : v);

function decodeMutf8(bytes, off) {
  // MUTF-8 (CESU-8) until 0x00.
  let i = off, out = '', pendingHigh = 0;
  const flush = (cp) => {
    if (pendingHigh) {
      out += (cp >= 0xdc00 && cp <= 0xdfff)
        ? String.fromCharCode(pendingHigh, cp)
        : String.fromCharCode(pendingHigh, cp);
      pendingHigh = 0;
    } else if (cp >= 0xd800 && cp <= 0xdbff) pendingHigh = cp;
    else out += String.fromCharCode(cp);
  };
  while (bytes[i] !== 0) {
    const a = bytes[i++];
    if (a < 0x80) flush(a);
    else if ((a & 0xe0) === 0xc0) flush(((a & 0x1f) << 6) | (bytes[i++] & 0x3f));
    else flush(((a & 0x0f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f));
  }
  if (pendingHigh) out += String.fromCharCode(pendingHigh);
  return [out, i + 1];
}

function escSmali(s) {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
}

function accStr(flags, kind) {
  const parts = [];
  if (flags & 0x1) parts.push('public');
  else if (flags & 0x2) parts.push('private');
  else if (flags & 0x4) parts.push('protected');
  if (flags & 0x8) parts.push('static');
  if (flags & 0x10) parts.push('final');
  if (flags & 0x200) parts.push('interface');
  if (flags & 0x4000) parts.push('enum');
  if (kind === 'mtd' && flags & 0x1000) parts.push('synthetic');
  return parts.length ? parts.join(' ') + ' ' : '';
}

export function isDex(bytes) {
  return bytes.length > 8 && bytes[0] === 0x64 && bytes[1] === 0x65 && bytes[2] === 0x78 && bytes[3] === 0x0a;
}

export function disassembleDex(bytes, name = 'classes.dex') {
  const out = [];
  const emit = (s) => { out.push(s); };
  try {
    const d = new Dex(bytes);
    out.push(`# auto-disassembled from ${name} (${d.classDefs.length} classes, linear sweep — for analysis, not reassembly)`);
    for (const cls of d.classDefs) {
      try {
        d.renderClass(cls, emit);
      } catch (e) {
        out.push(`# class skipped: ${(e && e.message) || e}`);
      }
      if (out.length > 400000) { out.push('# …truncated: output exceeded safety cap'); break; }
    }
  } catch (e) {
    out.push(`# disassembly failed for ${name}: ${(e && e.message) || e}`);
  }
  return out.join('\n');
}

class Dex {
  constructor(bytes) {
    this.b = bytes;
    this.dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (!isDex(bytes)) throw new Error('not a dex file');
    // Header layout: size/off pairs at fixed offsets.
    const H = (o) => this.dv.getUint32(o, true);
    this.stringIdsSize = H(0x38); this.stringIdsOff = H(0x3c);
    this.typeIdsSize = H(0x40); this.typeIdsOff = H(0x44);
    this.protoIdsSize = H(0x48); this.protoIdsOff = H(0x4c);
    this.fieldIdsSize = H(0x50); this.fieldIdsOff = H(0x54);
    this.methodIdsSize = H(0x58); this.methodIdsOff = H(0x5c);
    this.classDefsSize = H(0x60); this.classDefsOff = H(0x64);
    this.strCache = new Array(this.stringIdsSize);
    this.classDefs = [];
    for (let i = 0; i < this.classDefsSize; i++) {
      const o = this.classDefsOff + i * 32;
      this.classDefs.push({
        classIdx: H(o), access: H(o + 4), superIdx: H(o + 8), ifacesOff: H(o + 12),
        sourceIdx: H(o + 16), classDataOff: H(o + 24),
      });
    }
  }
  u16(o) { return this.dv.getUint16(o, true); }
  u32(o) { return this.dv.getUint32(o, true); }
  str(idx) {
    if (idx === NO_OFF || idx < 0 || idx >= this.stringIdsSize) return '?';
    if (this.strCache[idx] !== undefined) return this.strCache[idx];
    const off = this.u32(this.stringIdsOff + idx * 4);
    const [, p] = uleb(this.b, off);
    const [s] = decodeMutf8(this.b, p);
    return (this.strCache[idx] = s);
  }
  type(idx) {
    if (idx === 0xffff || idx < 0 || idx >= this.typeIdsSize) return '?';
    return this.str(this.u32(this.typeIdsOff + idx * 4));
  }
  proto(idx) {
    if (idx < 0 || idx >= this.protoIdsSize) return '(?)L?;';
    const o = this.protoIdsOff + idx * 12;
    const ret = this.type(this.u32(o + 4));
    const pOff = this.u32(o + 8);
    let params = '';
    if (pOff) {
      const n = this.u32(pOff);
      for (let i = 0; i < n; i++) params += this.type(this.u16(pOff + 4 + i * 2));
    }
    return `(${params})${ret}`;
  }
  field(idx) {
    const o = this.fieldIdsOff + idx * 8;
    return `${this.type(this.u16(o))}->${this.str(this.u32(o + 4))}:${this.type(this.u16(o + 2))}`;
  }
  method(idx) {
    const o = this.methodIdsOff + idx * 8;
    return `${this.type(this.u16(o))}->${this.str(this.u32(o + 4))}${this.proto(this.u16(o + 2))}`;
  }
  renderClass(cls, push) {
    const desc = this.type(cls.classIdx);
    push(`// FILE: ${desc}.smali`);
    push(`.class ${accStr(cls.access, 'cls')}${desc}`.replace(/ +/g, ' '));
    if (cls.superIdx !== 0xffff) push(`.super ${this.type(cls.superIdx)}`);
    if (cls.sourceIdx !== NO_OFF) push(`.source "${escSmali(this.str(cls.sourceIdx))}"`);
    if (cls.ifacesOff) {
      const n = this.u32(cls.ifacesOff);
      for (let i = 0; i < n; i++) push(`.implements ${this.type(this.u16(cls.ifacesOff + 4 + i * 2))}`);
    }
    if (!cls.classDataOff) return;
    let p = cls.classDataOff;
    const counts = [];
    for (let i = 0; i < 4; i++) { const r = uleb(this.b, p); counts.push(r[0]); p = r[1]; }
    let fIdx = 0;
    for (let i = 0; i < counts[0] + counts[1]; i++) {
      const rd = uleb(this.b, p); p = rd[1];
      const ra = uleb(this.b, p); p = ra[1];
      fIdx += rd[0];
      push(`.field ${accStr(ra[0], 'fld')}${this.field(fIdx)}`.replace(/ +/g, ' '));
    }
    let mIdx = 0;
    for (let m = 0; m < counts[2] + counts[3]; m++) {
      const rd = uleb(this.b, p); p = rd[1];
      const ra = uleb(this.b, p); p = ra[1];
      const rc = uleb(this.b, p); p = rc[1];
      mIdx += rd[0];
      push(`.method ${accStr(ra[0], 'mtd')}${this.method(mIdx)}`.replace(/ +/g, ' '));
      if (rc[0]) this.renderCode(rc[0], push);
      push('.end method');
    }
  }
  renderCode(off, push) {
    const regs = this.u16(off), insnsSize = this.u32(off + 12);
    push(`    .registers ${regs}`);
    const base = (off + 16) >> 1; // code units from file start
    const u = (i) => this.u16((base + i) << 1);
    // Pass 1: widths + branch targets (payload-aware).
    const ops = [];
    const targets = new Set();
    let pc = 0, guard = 0;
    while (pc < insnsSize && guard++ < 1500000) {
      const unit = u(pc);
      const op = unit & 0xff;
      let w = WIDTHS[op] || 1;
      if (op === 0) {
        const sig = unit;
        if (sig === 0x0100 || sig === 0x0200 || sig === 0x0300) w = payloadWidth(this, u, pc, sig);
      }
      const tgt = branchTarget(u, pc, op);
      if (tgt !== null && tgt >= 0 && tgt < insnsSize) targets.add(tgt);
      ops.push({ pc, op, w });
      pc += w;
    }
    // Pass 2: render.
    for (const { pc, op, w } of ops) {
      if (targets.has(pc)) push(`    :label_${pc.toString(16)}`);
      push('    ' + this.renderInsn(op, u, pc, w));
    }
  }
  renderInsn(op, u, pc, w) {
    const name = NAMES[op] || `op_${op.toString(16).padStart(2, '0')}`;
    const b0 = u(pc), vA = (b0 >> 8) & 0xf, vB = (b0 >> 12) & 0xf;
    const vrange = (n, lo) => { const r = []; for (let i = 0; i < n; i++) r.push(`v${lo + i}`); return `{${r.join(', ')}}`; };
    try {
      if (w === 1) {
        if (op === 0x12) return `${name} v${vA}, #+${s4(vB)}`;
        if (op === 0x28) return `${name} :label_${(((pc + s8(b0 >> 8)) >>> 0)).toString(16)}`;
        if (op === 0x00 || op === 0x0e) return `${name}`;
        if (op >= 0x0a && op <= 0x0d) return `${name} v${vA}`;
        if (op === 0x0f || op === 0x10 || op === 0x11 || op === 0x1d || op === 0x27) return `${name} v${vA}`;
        if ((op >= 0x01 && op <= 0x09) || op === 0x21) return `${name} v${vA}, v${vB}`;
        if ((op >= 0x7b && op <= 0x8f) || (op >= 0xb0 && op <= 0xcf)) return `${name} v${vA}, v${vB}`;
        return `${name}`;
      }
      if (w === 2) {
        const x = u(pc + 1);
        if (op === 0x29) return `${name} :label_${(((pc + s16(x)) >>> 0)).toString(16)}`;
        if (op === 0x13 || op === 0x16) return `${name} v${vA}, #+${s16(x)}`;
        if (op === 0x15 || op === 0x19) return `${name} v${vA}, #+${(x << 16) | 0}`;
        if (op === 0x1a) return `${name} v${vA}, "${escSmali(this.str(x))}"`;
        if (op === 0x1c || op === 0x1f || op === 0x22) return `${name} v${vA}, ${this.type(x)}`;
        if (op === 0x20 || op === 0x23) return `${name} v${vA}, v${x & 0xff}, ${this.type(x >>> 8)}`;
        if (op === 0x02 || op === 0x05 || op === 0x08) return `${name} v${vA}, v${x}`;
        if (op >= 0x32 && op <= 0x37) return `${name} v${vA}, v${vB}, :label_${(((pc + s16(x)) >>> 0)).toString(16)}`;
        if (op >= 0x38 && op <= 0x3d) return `${name} v${vA}, :label_${(((pc + s16(x)) >>> 0)).toString(16)}`;
        if (op >= 0x52 && op <= 0x5f) return `${name} v${vA}, v${vB}, ${this.field(x)}`;
        if ((op >= 0x44 && op <= 0x51) || (op >= 0x2d && op <= 0x31) || (op >= 0x90 && op <= 0xaf)) {
          return `${name} v${vA}, v${vB}, v${x & 0xff}`;
        }
        if (op >= 0xd0 && op <= 0xd7) return `${name} v${vA}, v${vB}, #+${s16(x)}`;
        if (op >= 0xd8 && op <= 0xe2) return `${name} v${vA}, v${vB}, #+${s8(x & 0xff)}`;
        return `${name} v${vA}, #+${x}`;
      }
      if (w === 3) {
        const x = (u(pc + 1) | (u(pc + 2) << 16)) | 0;
        if (op === 0x2a) return `${name} :label_${(((pc + x) >>> 0)).toString(16)}`;
        if (op === 0x14 || op === 0x17) return `${name} v${vA}, #+${x}`;
        if (op === 0x03 || op === 0x06) return `${name} v${vA}, v${(x >>> 0)}`;
        if (op === 0x1b) return `${name} v${vA}, "${escSmali(this.str(x >>> 0))}"`;
        if (op === 0x26 || op === 0x2b || op === 0x2c) return `${name} v${vA}, :label_${(((pc + x) >>> 0)).toString(16)}`;
        if (op === 0x24) return `${name} {${invokeRegs(b0, u(pc + 2))}}, ${this.type(x >>> 0)}`;
        if (op === 0x25) return `${name} ${vrange(vA, x & 0xffff)}, ${this.type(x >>> 16)}`;
        if (op >= 0x6e && op <= 0x78) {
          if (op >= 0x74) return `${name} ${vrange(vA, x & 0xffff)}, ${this.method(x >>> 16)}`;
          return `${name} {${invokeRegs(b0, u(pc + 2))}}, ${this.method(x >>> 0)}`;
        }
        return `${name} #+${x}`;
      }
      if (w === 5) {
        const lo = (u(pc + 1) | (u(pc + 2) << 16)) >>> 0, hi = (u(pc + 3) | (u(pc + 4) << 16)) | 0;
        return `${name} v${vA}, #+${hi * 0x100000000 + lo}`;
      }
      const raw = [];
      for (let i = 0; i < w; i++) raw.push(u(pc + i).toString(16).padStart(4, '0'));
      return `${name} ; raw ${raw.join(' ')}`;
    } catch {
      return `${name} ; decode-error @${pc.toString(16)}`;
    }
  }
}

function invokeRegs(b0, w2) {
  // 35c regs: C,D,E,F from unit2 nibbles + G from b0 high nibble, first A of them.
  const A = (b0 >> 8) & 0xf, G = (b0 >> 12) & 0xf;
  const regs = [w2 & 0xf, (w2 >> 4) & 0xf, (w2 >> 8) & 0xf, (w2 >> 12) & 0xf, G];
  return regs.slice(0, A).map((r) => `v${r}`).join(', ');
}

function payloadWidth(d, u, pc, sig) {
  try {
    if (sig === 0x0100) return 4 + u(pc + 1); // packed-switch: header + size targets
    if (sig === 0x0200) return 2 + u(pc + 1) * 4; // sparse-switch: header + size key/target pairs
    if (sig === 0x0300) { // fill-array-data: 4-unit header + data
      const size = (u(pc + 2) | (u(pc + 3) << 16)) >>> 0, ew = u(pc + 1);
      return 4 + Math.ceil((size * ew) / 2);
    }
  } catch {}
  return 1;
}

function branchTarget(u, pc, op) {
  try {
    if (op === 0x28) return pc + s8(u(pc) >> 8);
    if (op === 0x29) return pc + s16(u(pc + 1));
    if (op === 0x2a || op === 0x26 || op === 0x2b || op === 0x2c) {
      return (pc + ((u(pc + 1) | (u(pc + 2) << 16)) | 0)) | 0;
    }
    if ((op >= 0x32 && op <= 0x37) || (op >= 0x38 && op <= 0x3d)) return pc + s16(u(pc + 1));
  } catch {}
  return null;
}

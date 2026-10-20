// core/patterns-async.js — HAND-MAINTAINED. Off-main-thread analysis client.
// Large inputs run in workers/patterns.worker.js with sync fallbacks:
//   analyzePatternsAsync — content is sent ONCE (init) then analyzed per
//     category without re-cloning (previously 25 full-content clones).
//   disassembleDexAsync  — dex bytes are TRANSFERRED (zero-copy).
//   extractEndpointsAsync — single clone, off-thread.
import { analyzePatterns } from './patterns.js';
import { disassembleDex } from './dex.js';
import { extractEndpoints } from './endpoints.js';
import { getActiveFp, readSlot, writeSlot } from './checkpoint.js';
import { logScan } from '../ui/scanlog.js';

const fmtMB = (n) => (n / 1048576).toFixed(1) + ' MB';
const prettySlot = (slot) => slot.replace(/^current/, '').replace(/Results$/, '') || 'analysis';

const SYNC_THRESHOLD = 400_000; // chars — below this, sync beats IPC
const DEX_SYNC_THRESHOLD = 1_000_000; // bytes
const WORKER_TIMEOUT = 180_000;

let workerPromise = null;
let lastInitContent = null;

function getWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      try {
        return new Worker(new URL('../workers/patterns.worker.js', import.meta.url), { type: 'module' });
      } catch {
        return null;
      }
    })();
  }
  return workerPromise;
}

const nid = () => Math.random().toString(36).slice(2);

function callWorker(msg, transfer) {
  return getWorker().then((worker) => {
    if (!worker) throw new Error('no-worker');
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        worker.removeEventListener('message', onMsg);
        reject(new Error('worker-timeout'));
      }, WORKER_TIMEOUT);
      const onMsg = (e) => {
        if (!e.data || e.data.id !== msg.id) return;
        worker.removeEventListener('message', onMsg);
        clearTimeout(timer);
        if (e.data.error) reject(new Error(e.data.error));
        else resolve(e.data);
      };
      worker.addEventListener('message', onMsg);
      try {
        worker.postMessage(msg, transfer || []);
      } catch (err) {
        worker.removeEventListener('message', onMsg);
        clearTimeout(timer);
        reject(err);
      }
    });
  });
}

async function ensureInit(content) {
  if (content === lastInitContent) return true;
  const r = await callWorker({ kind: 'init', id: nid(), content });
  if (r && r.ok) lastInitContent = content;
  return !!(r && r.ok);
}

export async function analyzePatternsAsync(content, checks, usingDecompiledSource = false) {
  if (typeof Worker === 'undefined' || content.length < SYNC_THRESHOLD) {
    return analyzePatterns(content, checks, usingDecompiledSource);
  }
  try {
    await ensureInit(content);
    const r = await callWorker({ kind: 'run', id: nid(), checks, mode: usingDecompiledSource });
    if (!r.results) throw new Error('empty-results');
    return r.results;
  } catch {
    lastInitContent = null;
    return analyzePatterns(content, checks, usingDecompiledSource);
  }
}

export async function resumableCategory(slot, content, checks, usingDecompiledSource = false) {
  // Interrupt-resume: completed categories are checkpointed per APK fingerprint.
  // Without an active run this is a pure passthrough to the worker/sync path.
  const fp = getActiveFp();
  if (fp) {
    const hit = await readSlot(fp, slot);
    if (hit) {
      logScan(`✓ ${prettySlot(slot)} — restored from checkpoint`, 'ok');
      return hit;
    }
  }
  logScan(`◌ ${prettySlot(slot)} …`);
  const t = Date.now();
  const r = await analyzePatternsAsync(content, checks, usingDecompiledSource);
  if (fp) await writeSlot(fp, slot, r);
  const found = Array.isArray(r) ? r.filter((c) => c.detected).length : 0;
  logScan(`✓ ${prettySlot(slot)} — ${found} finding${found === 1 ? '' : 's'} (${((Date.now() - t) / 1000).toFixed(1)}s)`, 'ok');
  return r;
}

export async function disassembleDexAsync(bytes, name) {
  if (typeof Worker === 'undefined' || bytes.length < DEX_SYNC_THRESHOLD) {
    return disassembleDex(bytes, name);
  }
  const t = Date.now();
  logScan(`◌ disassembling ${name} (${fmtMB(bytes.length)}) …`);
  try {
    const copy = bytes.slice();
    const r = await callWorker(
      { kind: 'dex', id: nid(), buf: copy.buffer, byteOffset: copy.byteOffset, byteLength: copy.byteLength, name },
      [copy.buffer],
    );
    if (typeof r.smali !== 'string') throw new Error('empty-smali');
    const classes = (r.smali.match(/\/\/ FILE: /g) || []).length;
    logScan(`✓ ${name} → ${classes.toLocaleString()} classes, ${fmtMB(r.smali.length)} smali (${((Date.now() - t) / 1000).toFixed(1)}s)`, 'ok');
    return r.smali;
  } catch {
    return disassembleDex(bytes, name);
  }
}

export async function extractEndpointsAsync(content) {
  if (typeof Worker === 'undefined' || content.length < SYNC_THRESHOLD) {
    return extractEndpoints(content);
  }
  const t = Date.now();
  try {
    const r = await callWorker({ kind: 'endpoints', id: nid(), content });
    if (!r.endpoints) throw new Error('empty-endpoints');
    logScan(`✓ endpoints: ${r.endpoints.length} (${((Date.now() - t) / 1000).toFixed(1)}s)`, 'ok');
    return r.endpoints;
  } catch {
    return extractEndpoints(content);
  }
}

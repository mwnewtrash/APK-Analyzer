// core/checkpoint.js — HAND-MAINTAINED. Interrupt-resume checkpoints.
// While an APK analysis runs, each completed pattern category is checkpointed
// (small result objects keyed by APK fingerprint). After a reload/crash the
// user re-selects the same APK and resumes from the first incomplete category
// instead of starting over. Success clears the checkpoint; errors keep it.
import { idbPut, idbGet, idbDel } from './idb.js';

const DB = 'apk-analyzer-history';
const STORE = 'checkpoints';

let activeFp = null;

export const fpOf = (file) => `${file.name}::${file.size}::${file.lastModified}`;
export const getActiveFp = () => activeFp;
export const setActiveFp = (fp) => { activeFp = fp; };
export const clearActiveFp = () => { activeFp = null; };
export const countSlots = (rec) => (rec && rec.slots ? Object.keys(rec.slots).length : 0);

export async function beginRun(file) {
  const fp = fpOf(file);
  activeFp = fp;
  try {
    const existing = await idbGet(DB, STORE, fp);
    if (!existing) {
      await idbPut(DB, STORE, { id: fp, apkName: file.name, createdAt: Date.now(), updatedAt: Date.now(), slots: {} });
    }
  } catch (e) {
    console.warn('checkpoint init failed', e);
  }
  return fp;
}

export async function endRun() {
  if (!activeFp) return;
  const fp = activeFp;
  activeFp = null;
  try {
    await idbDel(DB, STORE, fp);
  } catch (e) {
    console.warn('checkpoint clear failed', e);
  }
}

export async function loadCheckpoint(fp) {
  try {
    return await idbGet(DB, STORE, fp);
  } catch {
    return null;
  }
}

export async function readSlot(fp, slot) {
  try {
    const rec = await idbGet(DB, STORE, fp);
    return rec && rec.slots ? rec.slots[slot] || null : null;
  } catch {
    return null;
  }
}

export async function writeSlot(fp, slot, result) {
  try {
    const rec = (await idbGet(DB, STORE, fp)) || { id: fp, apkName: '', createdAt: Date.now(), slots: {} };
    rec.slots = rec.slots || {};
    rec.slots[slot] = result;
    rec.updatedAt = Date.now();
    await idbPut(DB, STORE, rec);
  } catch (e) {
    console.warn('checkpoint write failed', e);
  }
}

// ui/history.js — HAND-MAINTAINED. Reload-safe scan history (IndexedDB) +
// interrupt-resume offers. Saves fire-and-forget after each analysis; viewing
// restores state + re-renders without re-scanning. Resume: re-selecting an APK
// with an unfinished checkpoint offers to continue from the first incomplete
// category. No server, no uploads — data stays in this browser.
import { state } from '../core/state.js';
import { escapeHtml, formatFileSize } from '../core/utils.js';
import { idbPut, idbGet, idbAll, idbDel } from '../core/idb.js';
import { fpOf, loadCheckpoint, countSlots, setActiveFp, clearActiveFp } from '../core/checkpoint.js';
import { displayAllResults } from './shell.js';
import { buildScanCSV, downloadCSV } from './export-report.js';
import { displayPermissionAnalysis } from './misconfig.js';
import { navigateTo, startGlobalAnalysis } from './navigation.js';

const DB_NAME = 'apk-analyzer-history';
const STORE = 'scans';
const TOTAL_CATEGORIES = 26;

let pendingResumeFp = null;

function summarize(data) {
  let total = 0, detected = 0;
  for (const [k, v] of Object.entries(data)) {
    if (k.endsWith('Results') && Array.isArray(v)) {
      total += v.length;
      detected += v.filter((c) => c.detected).length;
    }
  }
  return { total, detected, endpoints: (data.extractedEndpoints || []).length };
}

function snapshotState() {
  const data = {};
  for (const [k, v] of Object.entries(state)) {
    if (Array.isArray(v) && (k.endsWith('Results') || k === 'extractedEndpoints' || k === 'analyzedPermComponents')) {
      data[k] = v;
    }
  }
  data.customPermissions = state.customPermissions;
  data.appPermission = state.appPermission;
  return data;
}

function trimInstances(data) {
  const out = { ...data };
  for (const [k, v] of Object.entries(out)) {
    if (k.endsWith('Results') && Array.isArray(v)) {
      out[k] = v.map((c) => ({ ...c, instances: (c.instances || []).slice(0, 5) }));
    }
  }
  return out;
}

export { summarize, summarize as summarizeScan, snapshotState };

export async function saveCurrentScan() {
  const name = state.globalAPKData.file?.name
    || (state.decompiledSourceData.isLoaded ? `JADX folder (${state.decompiledSourceData.fileCount} files)` : 'scan');
  const sizeText = state.globalAPKData.file
    ? formatFileSize(state.globalAPKData.file.size)
    : (state.decompiledSourceData.isLoaded ? `${state.decompiledSourceData.fileCount} files` : '');
  const rec = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    name,
    sizeText,
    createdAt: Date.now(),
    data: snapshotState(),
  };
  rec.summary = summarize(rec.data);
  try {
    await idbPut(DB_NAME, STORE, rec);
  } catch (e) {
    // Quota fallback: retry once with trimmed instance lists.
    try {
      rec.data = trimInstances(rec.data);
      rec.summary = summarize(rec.data);
      await idbPut(DB_NAME, STORE, rec);
    } catch (e2) {
      console.warn('scan history save failed', e2);
      return;
    }
  }
  await renderScanHistory();
}

export async function viewScan(id) {
  const rec = await idbGet(DB_NAME, STORE, id);
  if (!rec || !rec.data) return;
  for (const [k, v] of Object.entries(rec.data)) {
    if (k === 'customPermissions' || k === 'appPermission') state[k] = v;
    else if (Array.isArray(v) && (k in state)) state[k] = v;
  }
  document.getElementById('globalUploadSection').classList.add('hidden');
  document.getElementById('globalLoadingSection').classList.add('hidden');
  document.getElementById('globalFileInfo').classList.remove('hidden');
  document.getElementById('globalFileName').textContent = rec.name;
  document.getElementById('globalFileSize').textContent = rec.sizeText || '';
  state.globalAPKData.isLoaded = true;
  displayAllResults();
  displayPermissionAnalysis();
  navigateTo('misconfig');
}

export async function deleteScan(id) {
  await idbDel(DB_NAME, STORE, id);
  await renderScanHistory();
}

export async function downloadScanCSV(id) {
  const rec = await idbGet(DB_NAME, STORE, id);
  if (!rec || !rec.data) return;
  downloadCSV(`${String(rec.name).replace(/[^\w\-. ]+/g, '_')}-report.csv`, buildScanCSV(rec.name, rec.data));
}

// ---- interrupt-resume ----

export async function refreshResumeOffer(file) {
  const banner = document.getElementById('resumeSection');
  pendingResumeFp = null;
  clearActiveFp();
  if (!banner) return;
  banner.classList.add('hidden');
  let rec = null;
  try {
    rec = await loadCheckpoint(fpOf(file));
  } catch {
    rec = null;
  }
  const done = countSlots(rec);
  if (!rec || done === 0) return;
  pendingResumeFp = rec.id;
  const label = document.getElementById('resumeText');
  if (label) {
    label.textContent = `Interrupted scan found for ${file.name} — ${done}/${TOTAL_CATEGORIES} categories already complete. Resume where you left off?`;
  }
  banner.classList.remove('hidden');
}

function hideResumeBanner() {
  document.getElementById('resumeSection')?.classList.add('hidden');
}

export async function startResumeFlow() {
  if (!pendingResumeFp) return;
  setActiveFp(pendingResumeFp);
  pendingResumeFp = null;
  hideResumeBanner();
  await startGlobalAnalysis();
}

export function dismissResume() {
  pendingResumeFp = null;
  clearActiveFp();
  hideResumeBanner();
}

function fmtDate(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return '';
  }
}

export async function renderScanHistory() {
  const list = document.getElementById('scanHistoryList');
  if (!list) return;
  let recs = [];
  try {
    recs = await idbAll(DB_NAME, STORE);
  } catch {
    list.innerHTML = '<p class="text-gray-500 text-sm">Scan history is unavailable in this browser.</p>';
    return;
  }
  recs.sort((a, b) => b.createdAt - a.createdAt);
  if (!recs.length) {
    list.innerHTML = '<p class="text-gray-500 text-sm">No saved scans yet — results save automatically after each analysis.</p>';
    return;
  }
  list.innerHTML = recs.map((r) => {
    const s = r.summary || { detected: 0, total: 0, endpoints: 0 };
    return `<div class="flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
      <div class="min-w-0">
        <p class="text-white font-medium truncate">${escapeHtml(r.name)}</p>
        <p class="text-gray-400 text-xs">${escapeHtml(fmtDate(r.createdAt))}${r.sizeText ? ` • ${escapeHtml(r.sizeText)}` : ''} • ${s.detected}/${s.total} findings • ${s.endpoints} endpoints</p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button data-scan-view="${r.id}" class="px-3 py-1.5 bg-[#2dd4bf] hover:bg-[#5eead4] text-[#052e2b] rounded-lg text-xs font-medium transition">View</button>
        <button data-scan-csv="${r.id}" class="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-xs font-medium transition">CSV</button>
        <button data-scan-del="${r.id}" class="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition">Delete</button>
      </div>
    </div>`;
  }).join('');
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    const t = e.target && e.target.closest ? e.target : null;
    if (!t) return;
    const v = t.closest('[data-scan-view]');
    if (v) {
      viewScan(v.getAttribute('data-scan-view')).catch((err) => console.warn('view scan failed', err));
      return;
    }
    const d = t.closest('[data-scan-del]');
    if (d) {
      if (confirm('Delete this saved scan?')) {
        deleteScan(d.getAttribute('data-scan-del')).catch((err) => console.warn('delete scan failed', err));
      }
      return;
    }
    const c = t.closest('[data-scan-csv]');
    if (c) {
      downloadScanCSV(c.getAttribute('data-scan-csv')).catch((err) => console.warn('csv export failed', err));
      return;
    }
    if (t.closest('[data-resume-start]')) {
      startResumeFlow().catch((err) => console.warn('resume failed', err));
      return;
    }
    if (t.closest('[data-resume-dismiss]')) {
      dismissResume();
    }
  });
  document.addEventListener('DOMContentLoaded', () => {
    renderScanHistory().catch(() => {});
  });
}

// ui/scanlog.js — HAND-MAINTAINED. Live scan console (terminal window).
// Zero imports (no cycles possible). All DOM access is guarded so this module
// is safe to import in Node/workers (logging becomes a no-op there).
// Conventions: logStage() mirrors loading-status lines (cyan), logScan() takes
// an explicit kind (info|ok|warn). clearScanLog() resets consoles + clock.
// Percent + elapsed readouts update themselves (MutationObserver + ticker).

const KINDS = {
  info: 'text-gray-300',
  stage: 'text-cyan-300',
  ok: 'text-emerald-300',
  warn: 'text-amber-300',
};

let t0 = 0;
let tickerStarted = false;

function now() {
  t0 = t0 || Date.now();
  return ((Date.now() - t0) / 1000).toFixed(1) + 's';
}

function consoles() {
  if (typeof document === 'undefined') return [];
  return [...document.querySelectorAll('[data-scan-console]')];
}

function fmtElapsed(ms) {
  const s = ms / 1000;
  if (s < 60) return s.toFixed(1) + 's';
  const m = Math.floor(s / 60);
  return m + 'm ' + (s - m * 60).toFixed(0) + 's';
}

function tick() {
  if (typeof document === 'undefined') return;
  const els = [...document.querySelectorAll('[data-scan-elapsed]')];
  if (!els.length) return;
  const txt = fmtElapsed(Date.now() - (t0 || Date.now()));
  els.forEach((el) => { el.textContent = txt; });
}

function startTicker() {
  if (tickerStarted || typeof document === 'undefined' || typeof setInterval === 'undefined') return;
  tickerStarted = true;
  setInterval(tick, 250);
}

function readPctFromBar(bar) {
  const m = /width:\s*([\d.]+%)/.exec(bar.getAttribute('style') || '');
  return m ? m[1] : null;
}

function syncPct(bar) {
  const pct = readPctFromBar(bar);
  if (!pct) return;
  const box = bar.closest('.glass');
  const out = box ? box.querySelector('[data-scan-pct]') : document.querySelector('[data-scan-pct]');
  if (out) out.textContent = pct;
}

function watchBars() {
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
  document.querySelectorAll('#globalProgressBar, #dynamicProgressBar').forEach((bar) => {
    syncPct(bar);
    new MutationObserver(() => syncPct(bar)).observe(bar, { attributes: true, attributeFilter: ['style'] });
  });
}

export function clearScanLog() {
  t0 = Date.now();
  startTicker();
  resetStages();
  consoles().forEach((el) => {
    el.innerHTML = '';
    const box = el.closest('.glass');
    const pct = box ? box.querySelector('[data-scan-pct]') : null;
    if (pct) pct.textContent = '0%';
    const lines = box ? box.querySelector('[data-scan-lines]') : null;
    if (lines) lines.textContent = '0';
  });
  logScan('scan started', 'stage');
}

export function logScan(msg, kind = 'info') {
  if (kind === 'ok' && isCategoryDoneLine(msg)) bumpCategoryCount();
  if (typeof document === 'undefined') return;
  startTicker();
  const cls = KINDS[kind] || KINDS.info;
  consoles().forEach((el) => {
    const line = document.createElement('div');
    line.className = cls;
    const ts = document.createElement('span');
    ts.className = 'text-gray-600 mr-2';
    ts.textContent = '[+' + now() + ']';
    line.appendChild(ts);
    line.appendChild(document.createTextNode(String(msg)));
    el.appendChild(line);
    while (el.children.length > 250) el.firstChild.remove();
    el.scrollTop = el.scrollHeight;
    const box = el.closest('.glass');
    const counter = box ? box.querySelector('[data-scan-lines]') : null;
    if (counter) counter.textContent = String(el.children.length);
  });
}

export function logStage(msg) {
  logScan('▸ ' + msg, 'stage');
  const hit = matchStage(String(msg));
  if (hit) {
    if (hit.done) completeAllStages();
    else setStage(hit.rail, hit.index);
  }
}

const STAGE_MAP = [
  { test: /reading apk|extracting contents|split-apk/i, rail: 'apk', index: 0 },
  { test: /disassembling dex/i, rail: 'apk', index: 1 },
  { test: /analyzing security patterns/i, rail: 'apk', index: 2 },
  { test: /extracting endpoints/i, rail: 'apk', index: 3 },
  { test: /analyzing permissions/i, rail: 'apk', index: 4 },
  { test: /scanning files/i, rail: 'dynamic', index: 0 },
  { test: /sharedpreferences/i, rail: 'dynamic', index: 1 },
  { test: /sqlite/i, rail: 'dynamic', index: 2 },
  { test: /files and cache/i, rail: 'dynamic', index: 3 },
];

export function matchStage(text) {
  if (/analysis complete/i.test(text)) return { done: true };
  for (const m of STAGE_MAP) {
    if (m.test.test(text)) return { rail: m.rail, index: m.index };
  }
  return null;
}

function paintRail(rail, activeIndex) {
  if (typeof document === 'undefined') return;
  const root = document.querySelector(`[data-scan-stages="${rail}"]`);
  if (!root) return;
  root.querySelectorAll('.scan-stage').forEach((el) => {
    const i = Number(el.getAttribute('data-stage'));
    el.classList.toggle('done', i < activeIndex);
    el.classList.toggle('active', i === activeIndex);
    const dot = el.querySelector('.scan-dot');
    if (dot) dot.textContent = i < activeIndex ? '✓' : String(i + 1);
  });
  root.querySelectorAll('.scan-link').forEach((el) => {
    el.classList.toggle('done', Number(el.getAttribute('data-link')) < activeIndex);
  });
}

export function setStage(rail, index) {
  paintRail(rail, index);
}

function completeAllStages() {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('[data-scan-stages]').forEach((root) => {
    root.querySelectorAll('.scan-stage').forEach((el) => {
      el.classList.remove('active');
      el.classList.add('done');
      const dot = el.querySelector('.scan-dot');
      if (dot) dot.textContent = '✓';
    });
    root.querySelectorAll('.scan-link').forEach((el) => el.classList.add('done'));
  });
}

function resetStages() {
  catDone = 0;
  if (typeof document === 'undefined') return;
  document.querySelectorAll('[data-scan-stages]').forEach((root) => {
    root.querySelectorAll('.scan-stage').forEach((el) => {
      el.classList.remove('active', 'done');
      const dot = el.querySelector('.scan-dot');
      if (dot) dot.textContent = String(Number(el.getAttribute('data-stage')) + 1);
    });
    root.querySelectorAll('.scan-link').forEach((el) => el.classList.remove('done'));
  });
  document.querySelectorAll('[data-scan-catcount]').forEach((el) => { el.textContent = ''; });
}

let catDone = 0;
const TOTAL_CATEGORIES = 26; // mirrors the analysis pipeline's category count

export function isCategoryDoneLine(msg) {
  return /✓[^]*\d+ findings?/.test(String(msg));
}

function bumpCategoryCount() {
  catDone = Math.min(catDone + 1, TOTAL_CATEGORIES);
  if (typeof document === 'undefined') return;
  document.querySelectorAll('[data-scan-catcount]').forEach((el) => {
    el.textContent = ` ${catDone}/${TOTAL_CATEGORIES}`;
  });
}

if (typeof document !== 'undefined') {
  const boot = () => watchBars();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
}

// ui/export-report.js — HAND-MAINTAINED. Full-report export (#20): JSON + standalone HTML.
import { state } from '../core/state.js';
import { escapeHtml } from '../core/utils.js';

function download(filename, text, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

function resultEntries() {
  return Object.entries(state)
    .filter(([k, v]) => k.endsWith('Results') && Array.isArray(v))
    .map(([key, checks]) => ({ key, checks }));
}

function checkTitle(c) {
  return c.title || c.name || c.id || c.category || 'Finding';
}

function summarize() {
  const perCategory = resultEntries().map(({ key, checks }) => ({
    key,
    total: checks.length,
    detected: checks.filter((c) => c.detected).length,
  }));
  return {
    categories: perCategory.length,
    totalChecks: perCategory.reduce((n, c) => n + c.total, 0),
    totalDetected: perCategory.reduce((n, c) => n + c.detected, 0),
    endpoints: (state.extractedEndpoints || []).length,
  };
}

export function exportReportJSON() {
  const report = {
    tool: 'APK Security Analyzer',
    exportedAt: new Date().toISOString(),
    summary: summarize(),
    categories: resultEntries().map(({ key, checks }) => ({ key, checks })),
    endpoints: state.extractedEndpoints || [],
  };
  download('apk-analysis-report.json', JSON.stringify(report, null, 2), 'application/json');
}

export function downloadCSV(filename, text) {
  download(filename, text, 'text/csv');
}

const csvCell = (v) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

function findingTitle(c) {
  return c.title || c.name || c.id || c.category || 'Finding';
}

// Human-readable category names for reports (keys are state result arrays).
const CATEGORY_LABELS = {
  currentRootResults: 'Root Detection', currentEmulatorResults: 'Emulator Detection',
  currentSSLResults: 'SSL Pinning', currentFlagResults: 'Security Flags',
  currentStorageResults: 'Data Storage', currentCryptoResults: 'Cryptography',
  currentLoggingResults: 'Insecure Logging', currentAuthResults: 'Authentication',
  currentAuthzResults: 'Authorization', currentFeatureFlagsResults: 'Feature Flags',
  currentHiddenEndpointsResults: 'Hidden Endpoints', currentAuthTrustResults: 'Auth Trust',
  currentMassAssignmentResults: 'Mass Assignment', currentInputValidationResults: 'Input Validation',
  currentBusinessLogicResults: 'Business Logic', currentFileHandlingResults: 'File Handling',
  currentErrorHandlingResults: 'Error Handling', currentEnvLeakageResults: 'Environment Leakage',
  currentCryptoTrustResults: 'Crypto Trust', currentSqlInjectionResults: 'SQL Injection',
  currentNosqlInjectionResults: 'NoSQL Injection', currentSsrfResults: 'SSRF',
  currentXxeResults: 'XXE', currentDeserializationResults: 'Deserialization',
  currentCommandInjectionResults: 'Command Injection',
  currentManifestPostureResults: 'Manifest Posture',
};

const SEV_RANK = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
const sevOf = (c) => c.riskLevel || c.severity || '';
const sevRank = (c) => SEV_RANK[sevOf(c)] ?? 4;

// Full flat CSV for agent-driven dynamic validation, structured for humans:
//   summary   — scan metadata (one row per fact)
//   finding   — detected checks, one row per evidence instance, severity-sorted
//   endpoint  — discovered endpoints grouped by type
//   ruled-out — non-detected checks (coverage proof), condensed, descriptions kept
// Columns: section,category,check,severity,verdict,file,line,pattern,evidence,description
export function buildScanCSV(name, data) {
  const rows = [['section', 'category', 'check', 'severity', 'verdict', 'file', 'line', 'pattern', 'evidence', 'description']];
  const d = data || {};
  let total = 0, detected = 0;
  const findings = [], ruledOut = [];
  for (const [key, checks] of Object.entries(d)) {
    if (!key.endsWith('Results') || !Array.isArray(checks)) continue;
    const label = CATEGORY_LABELS[key] || key;
    for (const c of checks) {
      total++;
      if (c.detected && c.instances && c.instances.length) {
        detected++;
        for (const i of c.instances) {
          findings.push({ rank: sevRank(c), label, row: ['finding', label, findingTitle(c), sevOf(c), 'detected', i.file || '', i.lineNumber ?? '', i.pattern || '', i.content || '', c.description || ''] });
        }
      } else {
        ruledOut.push({ rank: sevRank(c), label, row: ['ruled-out', label, findingTitle(c), sevOf(c), 'not-detected', '', '', '', '', c.description || ''] });
      }
    }
  }
  const byRank = (a, b) => a.rank - b.rank || (a.label < b.label ? -1 : 1);
  findings.sort(byRank);
  ruledOut.sort(byRank);
  const endpoints = (d.extractedEndpoints || []).map((e) => ['endpoint', e.category || e.type || '', e.url || '', '', 'detected', '', '', '', e.url || '', '']);
  rows.push(
    ['summary', 'Scan', 'Application', '', '', '', '', '', '', name],
    ['summary', 'Scan', 'Exported', '', '', '', '', '', '', new Date().toISOString()],
    ['summary', 'Scan', 'Checks analyzed', '', '', '', '', '', '', String(total)],
    ['summary', 'Scan', 'Findings', '', '', '', '', '', '', String(detected)],
    ['summary', 'Scan', 'Endpoints', '', '', '', '', '', '', String(endpoints.length)],
    ...findings.map((f) => f.row),
    ...endpoints,
    ...ruledOut.map((r) => r.row),
  );
  return '\uFEFF' + rows.map((r) => r.map(csvCell).join(',')).join('\n');
}

export function downloadScanCSV(name, data) {
  downloadCSV(`${String(name).replace(/[^\w\-. ]+/g, '_')}-report.csv`, buildScanCSV(name, data));
}

export function exportReportHTML() {
  const s = summarize();
  const sections = resultEntries()
    .map(({ key, checks }) => {
      const detected = checks.filter((c) => c.detected);
      if (!detected.length) return '';
      const cards = detected.map((c) => {
        const inst = (c.instances || []).slice(0, 25).map((i) =>
          `<li><code>${escapeHtml(i.file ? `${i.file}:${i.lineNumber}` : `line ${i.lineNumber}`)}</code> — <code>${escapeHtml(String(i.content).slice(0, 200))}</code></li>`
        ).join('');
        const more = (c.instances || []).length > 25 ? `<p>…and ${(c.instances || []).length - 25} more</p>` : '';
        return `<div class="card"><h3>${escapeHtml(checkTitle(c))} <span class="badge ${escapeHtml(c.riskLevel || c.severity || 'INFO')}">${escapeHtml(c.riskLevel || c.severity || '')}</span></h3><p>${escapeHtml(c.description || '')}</p><ul>${inst}</ul>${more}</div>`;
      }).join('');
      return `<h2>${escapeHtml(key)}</h2>${cards}`;
    }).join('');
  const endpoints = (state.extractedEndpoints || []).map((e) =>
    `<li><span class="badge">${escapeHtml(e.category || e.type || '')}</span> <code>${escapeHtml(e.url)}</code></li>`
  ).join('');
  const doc = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>APK Analysis Report</title><style>body{font-family:system-ui,sans-serif;background:#111827;color:#e5e7eb;max-width:960px;margin:0 auto;padding:2rem}a{color:#93c5fd}.card{background:#1f2937;border:1px solid #374151;border-radius:.75rem;padding:1rem;margin:.75rem 0}code{background:#030712;padding:.1rem .35rem;border-radius:.3rem;word-break:break-all}.badge{display:inline-block;background:#92400e;border-radius:.4rem;padding:.05rem .5rem;font-size:.75rem}ul{padding-left:1.2rem}li{margin:.3rem 0}.summary{display:flex;gap:1rem;flex-wrap:wrap}.summary div{background:#1f2937;border-radius:.75rem;padding:.75rem 1.25rem}</style></head><body><h1>APK Analysis Report</h1><p>Exported ${escapeHtml(new Date().toLocaleString())} • client-side analysis, no data uploaded.</p><div class="summary"><div><b>${s.totalDetected}</b> findings</div><div><b>${s.totalChecks}</b> checks</div><div><b>${s.endpoints}</b> endpoints</div></div>${sections}<h2>Endpoints (${s.endpoints})</h2><ul>${endpoints || '<li>none</li>'}</ul></body></html>`;
  download('apk-analysis-report.html', doc, 'text/html');
}

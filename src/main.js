// src/main.js — application entry point (hand-maintained, NOT generated).
// Imports every feature module, exposes legacy inline-handler names on
// window, and restores the two DOMContentLoaded init blocks that were
// top-level statements in the single-file build.
import { state } from './core/state.js';
import { toggleTheme, navigateTo, startGlobalAnalysis } from './ui/navigation.js';
import { displayAllResults, resetGlobalAnalyzer } from './ui/shell.js';
import {
  toggleAllSections, expandAllSections, collapseAllSections,
  toggleSectionChip, updateChipCounts,
  displayPermissionAnalysis, renderPermissionComponents, setComponentFilter,
  displayMisconfigResults, renderFilteredResults,
  setFilter, setFlagCategoryFilter, setStorageCategoryFilter,
  setCryptoCategoryFilter, setLoggingCategoryFilter,
  setPermFilter, setComponentTypeFilter, exportPermissions,
} from './ui/misconfig.js';
import {
  toggleAllCodeSections, expandAllCodeSections, collapseAllCodeSections,
  toggleCodeSection, toggleCodeSectionChip,
  displayCodeAnalysisResults, renderBackendRiskIndicators,
  renderServerSideVulnerabilities, renderSection, createCheckCard,
  toggleInstances, setCodeFilter,
} from './ui/codeanalysis.js';
import {
  displayEndpointResults, renderEndpoints, filterEndpointsBySearch,
  toggleEndpointSectionsExpandCollapse, expandAllEndpointSections,
  collapseAllEndpointSections, toggleEndpointSectionChip,
  setEndpointFilter, exportEndpoints,
} from './ui/endpoints.js';
import {
  toggleAllDynamicSections, expandAllDynamicSectionsInternal,
  collapseAllDynamicSectionsInternal, displayDynamicResults,
  renderSharedPrefsResults, renderSQLiteResults, renderFilesResults,
  renderSecurityIssues, toggleDynamicSection, toggleDynamicInstances,
  resetDynamicAnalysis,
} from './ui/dynamic.js';
import { handleAPKSelected, analyzeAPKGlobal } from './ingest/apk.js';
import {
  handleDecompiledFolderSelected, handleDroppedDecompiledItems,
  readDirectoryRecursiveForSource, updateAnalysisHint,
  analyzeDecompiledSourceOnly,
} from './ingest/source.js';
import {
  handleDroppedItems, readDirectoryRecursive, analyzeDynamicFolder,
} from './ingest/dynamic.js';
import { enhanceA11y } from './ui/a11y.js';
import { exportReportJSON, exportReportHTML } from './ui/export-report.js';
import './ui/history.js'; // side effects: history delegation + initial render
import './ui/scanlog.js'; // side effects: progress observer + elapsed ticker

// Theme: dark mode is the default; an explicit stored 'light' choice wins.
try {
  if ((localStorage.getItem('theme') || 'dark') === 'dark') document.body.classList.add('dark-mode');
  else document.body.classList.remove('dark-mode');
} catch {}

// Home: clean landing — clear every results view and land on Misconfig.
export function goHome() {
  resetGlobalAnalyzer();
  resetDynamicAnalysis();
  navigateTo('misconfig');
  if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Endpoints: unique-domains chip behaves like the section chips — selecting
// it isolates a dedicated unique-host view, selecting again re-expands.
export function toggleUniqueDomains() {
  const chip = document.getElementById('uniqueDomainChip');
  const sections = ['http', 'api', 'ws', 'deeplink', 'cloud', 'ip'];
  const wasActive = !!chip && chip.classList.contains('active');
  document.querySelectorAll('#page-endpoints .section-chip').forEach((c) => c.classList.remove('active'));
  const btn = document.getElementById('endpointToggleBtn');
  if (wasActive) {
    sections.forEach((s) => document.getElementById(`${s}EndpointSection`)?.classList.add('visible'));
    document.getElementById('uniqueEndpointSection')?.classList.remove('visible');
    state.allEndpointSectionsExpanded = true;
    state.currentEndpointSection = null;
    if (btn) btn.textContent = 'Collapse All';
  } else {
    if (chip) chip.classList.add('active');
    sections.forEach((s) => document.getElementById(`${s}EndpointSection`)?.classList.remove('visible'));
    document.getElementById('uniqueEndpointSection')?.classList.add('visible');
    state.allEndpointSectionsExpanded = false;
    state.currentEndpointSection = 'unique';
    if (btn) btn.textContent = 'Expand All';
  }
  renderEndpoints();
}

// Legacy single-file HTML calls these as globals via inline onclick="...".
// Expose them explicitly so the extracted body.html keeps working unchanged.
Object.assign(window, {
  goHome,
  toggleTheme, navigateTo, startGlobalAnalysis,
  displayAllResults, resetGlobalAnalyzer,
  toggleAllSections, expandAllSections, collapseAllSections,
  toggleSectionChip, updateChipCounts,
  displayPermissionAnalysis, renderPermissionComponents, setComponentFilter,
  displayMisconfigResults, renderFilteredResults,
  setFilter, setFlagCategoryFilter, setStorageCategoryFilter,
  setCryptoCategoryFilter, setLoggingCategoryFilter,
  setPermFilter, setComponentTypeFilter, exportPermissions,
  toggleAllCodeSections, expandAllCodeSections, collapseAllCodeSections,
  toggleCodeSection, toggleCodeSectionChip,
  displayCodeAnalysisResults, renderBackendRiskIndicators,
  renderServerSideVulnerabilities, renderSection, createCheckCard,
  toggleInstances, setCodeFilter,
  displayEndpointResults, renderEndpoints, filterEndpointsBySearch,
  toggleEndpointSectionsExpandCollapse, expandAllEndpointSections,
  collapseAllEndpointSections, toggleEndpointSectionChip,
  setEndpointFilter, exportEndpoints, toggleUniqueDomains,
  toggleAllDynamicSections, displayDynamicResults,
  renderSharedPrefsResults, renderSQLiteResults, renderFilesResults,
  renderSecurityIssues, toggleDynamicSection, toggleDynamicInstances,
  resetDynamicAnalysis,
  handleAPKSelected, analyzeAPKGlobal,
  handleDecompiledFolderSelected, handleDroppedDecompiledItems,
  readDirectoryRecursiveForSource, updateAnalysisHint,
  analyzeDecompiledSourceOnly,
  handleDroppedItems, readDirectoryRecursive, analyzeDynamicFolder,
  exportReportJSON, exportReportHTML, enhanceA11y,
  state,
});

// ---- Restored init block #1 (was DOMContentLoaded @ code.js:1421) ----
document.addEventListener('DOMContentLoaded', () => {
  const globalUploadZone = document.getElementById('globalUploadZone');
  const globalFileInput = document.getElementById('globalFileInput');
  if (globalFileInput) {
    globalFileInput.addEventListener('change', (e) => {
      if (e.target.files[0]) handleAPKSelected(e.target.files[0]);
    });
  }
  if (globalUploadZone) {
    globalUploadZone.addEventListener('dragover', (e) => { e.preventDefault(); globalUploadZone.classList.add('dragover'); });
    globalUploadZone.addEventListener('dragleave', () => globalUploadZone.classList.remove('dragover'));
    globalUploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      globalUploadZone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file && /\.(apk|apks|xapk)$/i.test(file.name)) handleAPKSelected(file);
    });
  }
  const decompiledFolderInput = document.getElementById('decompiledFolderInput');
  const decompiledUploadZone = document.getElementById('decompiledUploadZone');
  if (decompiledFolderInput) {
    decompiledFolderInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) handleDecompiledFolderSelected(e.target.files);
    });
  }
  if (decompiledUploadZone) {
    decompiledUploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      decompiledUploadZone.classList.add('dragover');
    });
    decompiledUploadZone.addEventListener('dragleave', () => decompiledUploadZone.classList.remove('dragover'));
    decompiledUploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      decompiledUploadZone.classList.remove('dragover');
      if (e.dataTransfer.items) handleDroppedDecompiledItems(e.dataTransfer.items);
    });
  }
  const hash = window.location.hash.replace('#', '') || 'misconfig';
  navigateTo(hash);
});

// ---- Restored init block #2 (was DOMContentLoaded @ code.js:2742) ----
document.addEventListener('DOMContentLoaded', () => {
  const dynamicUploadZone = document.getElementById('dynamicUploadZone');
  const dynamicFolderInput = document.getElementById('dynamicFolderInput');
  if (dynamicUploadZone && dynamicFolderInput) {
    dynamicUploadZone.addEventListener('click', () => dynamicFolderInput.click());
    dynamicFolderInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) analyzeDynamicFolder(e.target.files);
    });
    dynamicUploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dynamicUploadZone.classList.add('dragover');
    });
    dynamicUploadZone.addEventListener('dragleave', () => dynamicUploadZone.classList.remove('dragover'));
    dynamicUploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dynamicUploadZone.classList.remove('dragover');
      if (e.dataTransfer.items) {
        handleDroppedItems(Array.from(e.dataTransfer.items));
      }
    });
  }
});

// ui/shell.js — generated from src-legacy/code.js (do not hand-edit; edit tools/build.mjs)
import { state } from '../core/state.js';
import { displayMisconfigResults } from './misconfig.js';
import { collapseAllCodeSections, displayCodeAnalysisResults } from './codeanalysis.js';
import { displayEndpointResults } from './endpoints.js';

function displayAllResults() {
            // Show headers
            document.getElementById('misconfigHeader').classList.remove('hidden');
            document.getElementById('codeAnalysisHeader').classList.remove('hidden');
            document.getElementById('endpointsHeader').classList.remove('hidden');

            // Display misconfig results
            document.getElementById('resultsSection').classList.remove('hidden');
            displayMisconfigResults();
            ['root', 'emulator', 'ssl', 'flag', 'storage', 'crypto', 'logging'].forEach(s => {
                document.getElementById(`${s}Section`)?.classList.add('visible');
            });

            // Display code analysis results
            document.getElementById('codeAnalysisResults').classList.remove('hidden');
            displayCodeAnalysisResults();
            
            // Initialize Code Analysis page in collapsed state
            collapseAllCodeSections();

            // Display endpoints
            displayEndpointResults();
        }

function resetGlobalAnalyzer() {
            state.globalAPKData = { file: null, content: null, manifestContent: null, isLoaded: false };
            state.decompiledSourceData = { files: [], content: null, isLoaded: false, fileCount: 0 };
            state.analyzedPermComponents = [];
            state.currentComponentFilter = 'all';
            
            document.getElementById('globalUploadSection').classList.remove('hidden');
            document.getElementById('resumeSection')?.classList.add('hidden');
            document.getElementById('globalLoadingSection').classList.add('hidden');
            document.getElementById('globalFileInfo').classList.add('hidden');
            document.getElementById('globalFileInput').value = '';
            document.getElementById('decompiledFolderInput').value = '';
            document.getElementById('apkStatus').classList.add('hidden');
            document.getElementById('decompiledStatus').classList.add('hidden');
            document.getElementById('startAnalysisSection').classList.add('hidden');
            document.getElementById('misconfigHeader').classList.add('hidden');
            document.getElementById('codeAnalysisHeader').classList.add('hidden');
            document.getElementById('endpointsHeader').classList.add('hidden');
            document.getElementById('resultsSection').classList.add('hidden');
            document.getElementById('codeAnalysisResults').classList.add('hidden');
            document.getElementById('endpointResultsSection').classList.add('hidden');
            document.getElementById('uniqueDomainChip')?.classList.remove('active');
            
            // Hide permission section
            const permSection = document.getElementById('permissionSection');
            if (permSection) permSection.classList.add('hidden');
            
            // Hide notes
            const smaliNote = document.getElementById('smaliNote');
            const sourceNote = document.getElementById('sourceNote');
            if (smaliNote) smaliNote.classList.add('hidden');
            if (sourceNote) sourceNote.classList.add('hidden');
        }

export { displayAllResults, resetGlobalAnalyzer };

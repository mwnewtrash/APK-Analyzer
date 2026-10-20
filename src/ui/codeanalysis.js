// ui/codeanalysis.js — generated from src-legacy/code.js (do not hand-edit; edit tools/build.mjs)
import { state } from '../core/state.js';
import { escapeHtml, registerCopy } from '../core/utils.js';

function toggleAllCodeSections() {
            state.allCodeSectionsExpanded = !state.allCodeSectionsExpanded;
            if (state.allCodeSectionsExpanded) {
                expandAllCodeSections();
                document.getElementById('toggleAllCodeText').textContent = 'Collapse All';
                document.getElementById('toggleAllCodeIcon').style.transform = 'rotate(0deg)';
            } else {
                collapseAllCodeSections();
                document.getElementById('toggleAllCodeText').textContent = 'Expand All';
                document.getElementById('toggleAllCodeIcon').style.transform = 'rotate(180deg)';
            }
        }

function expandAllCodeSections() {
            const allSections = ['auth', 'authz', 'featureFlags', 'hiddenEndpoints', 'authTrust', 'massAssignment', 'inputValidation', 'businessLogic', 'fileHandling', 'errorHandling', 'envLeakage', 'cryptoTrust', 'sqlInjection', 'nosqlInjection', 'ssrf', 'xxe', 'deserialization', 'commandInjection', 'manifestPosture'];
            
            allSections.forEach(section => {
                const content = document.getElementById(`${section}Content`);
                const chevron = document.getElementById(`${section}Chevron`);
                const sectionDiv = document.getElementById(`${section}Section`);
                
                if (content) content.classList.add('expanded');
                if (chevron) chevron.style.transform = 'rotate(180deg)';
                
                // Show all section headers when expanding
                if (sectionDiv) {
                    sectionDiv.style.display = 'block';
                }
            });
            state.allCodeSectionsExpanded = true;
        }

function collapseAllCodeSections() {
            const allSections = ['auth', 'authz', 'featureFlags', 'hiddenEndpoints', 'authTrust', 'massAssignment', 'inputValidation', 'businessLogic', 'fileHandling', 'errorHandling', 'envLeakage', 'cryptoTrust', 'sqlInjection', 'nosqlInjection', 'ssrf', 'xxe', 'deserialization', 'commandInjection', 'manifestPosture'];
            
            allSections.forEach(section => {
                const content = document.getElementById(`${section}Content`);
                const chevron = document.getElementById(`${section}Chevron`);
                const sectionDiv = document.getElementById(`${section}Section`);
                
                if (content) content.classList.remove('expanded');
                if (chevron) chevron.style.transform = 'rotate(0deg)';
                
                // Hide all section headers when collapsing
                if (sectionDiv) {
                    sectionDiv.style.display = 'none';
                }
            });
            
            // Clear selection state
            state.currentCodeSection = null;
            document.querySelectorAll('#page-codeanalysis .section-chip').forEach(chip => {
                chip.classList.remove('active');
            });
            
            state.allCodeSectionsExpanded = false;
        }

function toggleCodeSection(sectionName) {
            const content = document.getElementById(`${sectionName}Content`);
            const chevron = document.getElementById(`${sectionName}Chevron`);
            if (content && chevron) {
                content.classList.toggle('expanded');
                chevron.style.transform = content.classList.contains('expanded') ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        }

function toggleCodeSectionChip(section) {
            // Update current section tracker
            state.currentCodeSection = section;
            
            // Remove active class from all chips
            document.querySelectorAll('#page-codeanalysis .section-chip').forEach(chip => {
                chip.classList.remove('active');
            });
            
            // Add active class to clicked chip
            const chip = document.getElementById(`${section}CodeChip`);
            if (chip) {
                chip.classList.add('active');
            }
            
            // Handle section visibility based on collapsed state
            const allSections = ['auth', 'authz', 'featureFlags', 'hiddenEndpoints', 'authTrust', 
                                'massAssignment', 'inputValidation', 'businessLogic', 'fileHandling', 'errorHandling', 
                                'envLeakage', 'cryptoTrust', 'sqlInjection', 'nosqlInjection', 'ssrf', 'xxe', 'deserialization', 'commandInjection', 'manifestPosture'];
            
            allSections.forEach(s => {
                const sectionDiv = document.getElementById(`${s}Section`);
                if (sectionDiv) {
                    if (state.allCodeSectionsExpanded) {
                        // When expanded, show all sections
                        sectionDiv.style.display = 'block';
                    } else {
                        // When collapsed, only show the selected section
                        if (s === section) {
                            sectionDiv.style.display = 'block';
                            // Expand the content of the selected section
                            const content = document.getElementById(`${s}Content`);
                            const chevron = document.getElementById(`${s}Chevron`);
                            if (content) content.classList.add('expanded');
                            if (chevron) chevron.style.transform = 'rotate(180deg)';
                        } else {
                            sectionDiv.style.display = 'none';
                        }
                    }
                }
            });
        }

function displayCodeAnalysisResults() {
            const authDetected = state.currentAuthResults.filter(r => r.detected).length;
            const authzDetected = state.currentAuthzResults.filter(r => r.detected).length;

            document.getElementById('authDetectedCount').textContent = `${authDetected} / ${state.currentAuthResults.length}`;
            document.getElementById('authzDetectedCount').textContent = `${authzDetected} / ${state.currentAuthzResults.length}`;

            // Update chip counts for Auth and Authz
            document.getElementById('authCodeChipCount').textContent = authDetected;
            document.getElementById('authzCodeChipCount').textContent = authzDetected;
            
            // Update chip counts for Backend Risk Indicators
            document.getElementById('featureFlagsCodeChipCount').textContent = state.currentFeatureFlagsResults.filter(r => r.detected).length;
            document.getElementById('hiddenEndpointsCodeChipCount').textContent = state.currentHiddenEndpointsResults.filter(r => r.detected).length;
            document.getElementById('authTrustCodeChipCount').textContent = state.currentAuthTrustResults.filter(r => r.detected).length;
            document.getElementById('rateLimitingCodeChipCount').textContent = state.currentMassAssignmentResults.filter(r => r.detected).length;
            document.getElementById('businessLogicCodeChipCount').textContent = state.currentBusinessLogicResults.filter(r => r.detected).length;
            document.getElementById('fileHandlingCodeChipCount').textContent = state.currentFileHandlingResults.filter(r => r.detected).length;
            document.getElementById('errorHandlingCodeChipCount').textContent = state.currentErrorHandlingResults.filter(r => r.detected).length;
            document.getElementById('envLeakageCodeChipCount').textContent = state.currentEnvLeakageResults.filter(r => r.detected).length;
            document.getElementById('cryptoTrustCodeChipCount').textContent = state.currentCryptoTrustResults.filter(r => r.detected).length;
            document.getElementById('manifestPostureCodeChipCount').textContent = state.currentManifestPostureResults.filter(r => r.detected).length;
            
            // Update filter counts
            const allCodeResults = [
                ...state.currentAuthResults,
                ...state.currentAuthzResults,
                ...state.currentFeatureFlagsResults,
                ...state.currentHiddenEndpointsResults,
                ...state.currentAuthTrustResults,
                ...state.currentMassAssignmentResults,
                ...state.currentInputValidationResults,
                ...state.currentBusinessLogicResults,
                ...state.currentFileHandlingResults,
                ...state.currentErrorHandlingResults,
                ...state.currentEnvLeakageResults,
                ...state.currentCryptoTrustResults,
                ...state.currentSqlInjectionResults,
                ...state.currentNosqlInjectionResults,
                ...state.currentSsrfResults,
                ...state.currentXxeResults,
                ...state.currentDeserializationResults,
                ...state.currentCommandInjectionResults,
                ...state.currentManifestPostureResults
            ];
            const totalCodeChecks = allCodeResults.length;
            const detectedCodeChecks = allCodeResults.filter(r => r.detected).length;
            const notDetectedCodeChecks = totalCodeChecks - detectedCodeChecks;
            
            document.getElementById('codeTotalChecks').textContent = totalCodeChecks;
            document.getElementById('codeDetectedChecks').textContent = detectedCodeChecks;
            document.getElementById('codeNotDetectedChecks').textContent = notDetectedCodeChecks;

            renderSection('authResults', state.currentAuthResults);
            renderSection('authzResults', state.currentAuthzResults);
            
            // Render Backend Risk Indicators
            renderBackendRiskIndicators('featureFlagsResults', state.currentFeatureFlagsResults);
            renderBackendRiskIndicators('hiddenEndpointsResults', state.currentHiddenEndpointsResults);
            renderBackendRiskIndicators('authTrustResults', state.currentAuthTrustResults);
            renderBackendRiskIndicators('massAssignmentResults', state.currentMassAssignmentResults);
            renderBackendRiskIndicators('inputValidationResults', state.currentInputValidationResults);
            renderBackendRiskIndicators('businessLogicResults', state.currentBusinessLogicResults);
            renderBackendRiskIndicators('fileHandlingResults', state.currentFileHandlingResults);
            renderBackendRiskIndicators('errorHandlingResults', state.currentErrorHandlingResults);
            renderBackendRiskIndicators('envLeakageResults', state.currentEnvLeakageResults);
            renderBackendRiskIndicators('cryptoTrustResults', state.currentCryptoTrustResults);
            
            // Render Server-Side Vulnerability Analysis Results
            renderServerSideVulnerabilities('sqlInjectionResults', state.currentSqlInjectionResults);
            renderServerSideVulnerabilities('nosqlInjectionResults', state.currentNosqlInjectionResults);
            renderServerSideVulnerabilities('ssrfResults', state.currentSsrfResults);
            renderServerSideVulnerabilities('xxeResults', state.currentXxeResults);
            renderServerSideVulnerabilities('deserializationResults', state.currentDeserializationResults);
            renderServerSideVulnerabilities('commandInjectionResults', state.currentCommandInjectionResults);
            renderBackendRiskIndicators('manifestPostureResults', state.currentManifestPostureResults);
        }

function renderBackendRiskIndicators(containerId, results) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            const detected = results.filter(r => r.detected);
            
            if (detected.length === 0) {
                container.innerHTML = '<div class="text-center py-6 text-gray-500"><p class="text-sm">✓ No indicators detected</p></div>';
                return;
            }
            
            container.innerHTML = detected.map(result => {
                const cardId = `card-${Math.random().toString(36).slice(2, 11)}`;
                
                let instancesHtml = '';
                if (result.instances && result.instances.length > 0) {
                    const instanceItems = result.instances.map(inst => {
                        const sourceType = inst.isSource ? '☕ Java/Kotlin' : (inst.isSmali ? '📦 Smali' : '📄 Extracted');
                        const borderColor = inst.isSource ? 'border-emerald-500' : (inst.isSmali ? 'border-amber-500' : 'border-gray-500');
                        return `
                        <div class="instance-item ${borderColor} text-sm">
                            <div class="flex items-start justify-between gap-2">
                                <div class="flex-1 min-w-0">
                                    <span class="text-cyan-400 font-semibold">L${inst.lineNumber}</span>
                                    <span class="${inst.isSource ? 'text-emerald-300' : 'text-amber-300'} text-xs ml-2">[${sourceType}]</span>
                                    <div class="text-gray-300 mt-1 break-all font-mono text-xs">${escapeHtml(inst.content)}</div>
                                </div>
                                <button data-copy-id="${registerCopy(inst.content)}" class="copy-btn p-1 hover:bg-white/10 rounded flex-shrink-0">
                                    <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                                    </svg>
                                </button>
                            </div>
                            ${inst.file ? `<div class="text-xs text-blue-400 mt-1 truncate" title="${escapeHtml(inst.file)}">📂 ${escapeHtml(inst.file.split('/').slice(-2).join('/'))}</div>` : ''}
                        </div>
                    `}).join('');
                    
                    instancesHtml = `
                        <div class="mt-3 pt-3 border-t border-gray-700/50">
                            <div class="instance-toggle" onclick="toggleInstances('${cardId}')">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                </svg>
                                <span class="text-sm">Found ${result.instances.length} instance${result.instances.length > 1 ? 's' : ''}</span>
                            </div>
                            <div id="${cardId}" class="instances-container">
                                ${instanceItems}
                            </div>
                        </div>
                    `;
                }
                
                return `
                    <div class="glass rounded-xl p-4 border border-orange-500/30 bg-orange-900/10">
                        <div class="flex items-start gap-3">
                            <div class="w-8 h-8 rounded-lg bg-orange-600/20 flex items-center justify-center flex-shrink-0">
                                <svg class="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                </svg>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h4 class="font-semibold text-orange-300 mb-1">${escapeHtml(result.name)}</h4>
                                <p class="text-sm text-gray-400 mb-2">${escapeHtml(result.description)}</p>
                                <div class="text-xs text-amber-300 bg-amber-900/20 rounded px-2 py-1 inline-block">
                                    <strong>Signal:</strong> ${escapeHtml(result.insight || result.description)}
                                </div>
                                ${instancesHtml}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

function renderServerSideVulnerabilities(containerId, results) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            const detected = results.filter(r => r.detected);
            
            if (detected.length === 0) {
                container.innerHTML = '<div class="text-center py-6 text-gray-500"><p class="text-sm">✓ No vulnerabilities detected</p></div>';
                return;
            }
            
            container.innerHTML = detected.map(result => {
                const cardId = `card-${Math.random().toString(36).slice(2, 11)}`;
                
                // Determine risk color
                const riskColor = result.riskLevel === 'HIGH' ? 'red' : 
                                  result.riskLevel === 'MEDIUM' ? 'yellow' : 'blue';
                const riskBg = result.riskLevel === 'HIGH' ? 'bg-red-900/20' : 
                               result.riskLevel === 'MEDIUM' ? 'bg-yellow-900/20' : 'bg-blue-900/20';
                const riskBorder = result.riskLevel === 'HIGH' ? 'border-red-500/40' : 
                                   result.riskLevel === 'MEDIUM' ? 'border-yellow-500/40' : 'border-blue-500/40';
                const riskText = result.riskLevel === 'HIGH' ? 'text-red-300' : 
                                 result.riskLevel === 'MEDIUM' ? 'text-yellow-300' : 'text-blue-300';
                
                let instancesHtml = '';
                if (result.instances && result.instances.length > 0) {
                    const instanceItems = result.instances.map(inst => {
                        const sourceType = inst.isSource ? '☕ Java/Kotlin' : (inst.isSmali ? '📦 Smali' : '📄 Extracted');
                        const borderColor = inst.isSource ? 'border-emerald-500' : (inst.isSmali ? 'border-amber-500' : 'border-gray-500');
                        return `
                        <div class="instance-item ${borderColor} text-sm">
                            <div class="flex items-start justify-between gap-2">
                                <div class="flex-1 min-w-0">
                                    <span class="text-cyan-400 font-semibold">L${inst.lineNumber}</span>
                                    <span class="${inst.isSource ? 'text-emerald-300' : 'text-amber-300'} text-xs ml-2">[${sourceType}]</span>
                                    <div class="text-gray-300 mt-1 break-all font-mono text-xs">${escapeHtml(inst.content)}</div>
                                </div>
                                <button data-copy-id="${registerCopy(inst.content)}" class="copy-btn p-1 hover:bg-white/10 rounded flex-shrink-0">
                                    <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                                    </svg>
                                </button>
                            </div>
                            ${inst.file ? `<div class="text-xs text-blue-400 mt-1 truncate" title="${escapeHtml(inst.file)}">📂 ${escapeHtml(inst.file.split('/').slice(-2).join('/'))}</div>` : ''}
                        </div>
                    `}).join('');
                    
                    instancesHtml = `
                        <div class="mt-3 pt-3 border-t border-gray-700/50">
                            <div class="instance-toggle" onclick="toggleInstances('${cardId}')">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                </svg>
                                <span class="text-sm">Found ${result.instances.length} instance${result.instances.length > 1 ? 's' : ''}</span>
                            </div>
                            <div id="${cardId}" class="instances-container">
                                ${instanceItems}
                            </div>
                        </div>
                    `;
                }
                
                return `
                    <div class="glass rounded-xl p-4 border ${riskBorder} ${riskBg}">
                        <div class="flex items-start gap-3">
                            <div class="w-8 h-8 rounded-lg bg-${riskColor}-600/20 flex items-center justify-center flex-shrink-0">
                                <svg class="w-4 h-4 text-${riskColor}-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                </svg>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-2">
                                    <h4 class="font-semibold ${riskText}">${escapeHtml(result.name)}</h4>
                                    <span class="text-xs px-2 py-0.5 rounded-full bg-${riskColor}-600 text-white font-semibold">${result.riskLevel}</span>
                                </div>
                                <p class="text-sm text-gray-400 mb-2">${escapeHtml(result.description)}</p>
                                ${result.serverImpact ? `
                                <div class="text-xs text-${riskColor}-200 bg-${riskColor}-900/30 rounded px-2 py-1 mb-2">
                                    <strong>Server Impact:</strong> ${escapeHtml(result.serverImpact)}
                                </div>
                                ` : ''}
                                ${result.recommendation ? `
                                <div class="text-xs text-emerald-300 bg-emerald-900/20 rounded px-2 py-1">
                                    <strong>✓ Recommendation:</strong> ${escapeHtml(result.recommendation)}
                                </div>
                                ` : ''}
                                ${instancesHtml}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

function renderSection(containerId, results) {
            const container = document.getElementById(containerId);
            if (!container) return;
            if (results.length === 0) {
                container.innerHTML = '<div class="col-span-2 text-center py-8 text-gray-500"><p>No matching checks</p></div>';
            } else {
                container.innerHTML = results.map(r => createCheckCard(r)).join('');
            }
        }

function createCheckCard(result) {
            const bg = result.detected ? 'bg-emerald-900/30 border-emerald-500/30' : 'bg-gray-800/30 border-gray-700/30';
            const status = result.detected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-600/20 text-gray-400';
            const icon = result.detected ? 'text-emerald-400' : 'text-gray-500';
            const cardId = `card-${Math.random().toString(36).slice(2, 11)}`;
            
            // Build instances HTML if there are any
            let instancesHtml = '';
            if (result.detected && result.instances && result.instances.length > 0) {
                const instanceItems = result.instances.map(inst => {
                    const sourceType = inst.isSource ? '☕ Java/Kotlin' : (inst.isSmali ? '📦 Smali' : '📄 Extracted');
                    const borderColor = inst.isSource ? 'border-emerald-500' : (inst.isSmali ? 'border-amber-500' : 'border-gray-500');
                    return `
                    <div class="instance-item ${borderColor}">
                        <div class="flex items-start justify-between gap-2">
                            <div class="flex-1 min-w-0">
                                <span class="text-cyan-400 font-semibold">L${inst.lineNumber}</span>
                                <span class="${inst.isSource ? 'text-emerald-300' : 'text-amber-300'} text-xs ml-2">[${sourceType}]</span>
                                <div class="text-gray-300 mt-1 break-all">${escapeHtml(inst.content)}</div>
                            </div>
                            <button data-copy-id="${registerCopy(inst.content)}" class="copy-btn p-1 hover:bg-white/10 rounded flex-shrink-0">
                                <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                                </svg>
                            </button>
                        </div>
                        ${inst.file ? `<div class="text-xs text-blue-400 mt-1 truncate" title="${escapeHtml(inst.file)}">📂 ${escapeHtml(inst.file.split('/').slice(-2).join('/'))}</div>` : ''}
                        <div class="text-xs text-gray-500 mt-1">Matched: <span class="text-emerald-400">${escapeHtml(inst.pattern)}</span></div>
                    </div>
                `}).join('');
                
                instancesHtml = `
                    <div class="mt-3 pt-3 border-t border-gray-700/50">
                        <div class="instance-toggle" onclick="toggleInstances('${cardId}')">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                            </svg>
                            <span>Found ${result.instances.length} instance${result.instances.length > 1 ? 's' : ''}</span>
                        </div>
                        <div id="${cardId}" class="instances-container">
                            ${instanceItems}
                        </div>
                    </div>
                `;
            }
            
            // Build found count badge
            const foundBadge = result.detected && result.instances && result.instances.length > 0 
                ? `<span class="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full ml-2">${result.instances.length} found</span>` 
                : '';
            
            return `<div class="check-card glass ${bg} border rounded-xl p-4">
                <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 ${icon} mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${result.detected ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'}"/>
                    </svg>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between gap-2 mb-1">
                            <div class="flex items-center">
                                <h4 class="font-medium text-white">${result.name}</h4>
                                ${foundBadge}
                            </div>
                            <span class="px-2 py-0.5 ${status} text-xs rounded-full flex-shrink-0">${result.detected ? 'Detected' : 'Not Found'}</span>
                        </div>
                        <p class="text-gray-400 text-sm">${result.description}</p>
                        ${result.detected && result.matchedPatterns && result.matchedPatterns.length ? `<div class="mt-2 flex flex-wrap gap-1">${result.matchedPatterns.slice(0, 3).map(p => `<span class="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 text-xs rounded">${escapeHtml(p)}</span>`).join('')}${result.matchedPatterns.length > 3 ? `<span class="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 text-xs rounded">+${result.matchedPatterns.length - 3}</span>` : ''}</div>` : ''}
                        ${instancesHtml}
                    </div>
                </div>
            </div>`;
        }

function toggleInstances(cardId) {
            const container = document.getElementById(cardId);
            if (container) {
                container.classList.toggle('show');
                // Rotate the arrow icon
                const toggle = container.previousElementSibling;
                if (toggle) {
                    const svg = toggle.querySelector('svg');
                    if (svg) {
                        svg.style.transform = container.classList.contains('show') ? 'rotate(90deg)' : 'rotate(0deg)';
                    }
                }
            }
        }

function setCodeFilter(filter) {
            state.currentCodeFilter = filter;
            ['codeFilterAll', 'codeFilterDetected', 'codeFilterNotDetected'].forEach(id => {
                document.getElementById(id).classList.remove('active');
            });
            document.getElementById(filter === 'all' ? 'codeFilterAll' : filter === 'detected' ? 'codeFilterDetected' : 'codeFilterNotDetected').classList.add('active');
        }

export { toggleAllCodeSections, expandAllCodeSections, collapseAllCodeSections, toggleCodeSection, toggleCodeSectionChip, displayCodeAnalysisResults, renderBackendRiskIndicators, renderServerSideVulnerabilities, renderSection, createCheckCard, toggleInstances, setCodeFilter };

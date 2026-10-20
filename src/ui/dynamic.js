// ui/dynamic.js — generated from src-legacy/code.js (do not hand-edit; edit tools/build.mjs)
import { state } from '../core/state.js';
import { escapeHtml, formatFileSize } from '../core/utils.js';

function toggleAllDynamicSections() {
            state.allDynamicSectionsExpanded = !state.allDynamicSectionsExpanded;
            if (state.allDynamicSectionsExpanded) {
                expandAllDynamicSectionsInternal();
                document.getElementById('toggleAllDynamicText').textContent = 'Collapse All';
                document.getElementById('toggleAllDynamicIcon').style.transform = 'rotate(0deg)';
            } else {
                collapseAllDynamicSectionsInternal();
                document.getElementById('toggleAllDynamicText').textContent = 'Expand All';
                document.getElementById('toggleAllDynamicIcon').style.transform = 'rotate(180deg)';
            }
        }

function expandAllDynamicSectionsInternal() {
            ['sharedPrefs', 'sqlite', 'files', 'security'].forEach(section => {
                const sectionMap = {
                    'sharedPrefs': 'sharedPrefsContent',
                    'sqlite': 'sqliteContent',
                    'files': 'filesContent',
                    'security': 'securityContent'
                };
                const chevronMap = {
                    'sharedPrefs': 'sharedPrefsChevron',
                    'sqlite': 'sqliteChevron',
                    'files': 'filesChevron',
                    'security': 'securityChevron'
                };
                
                const content = document.getElementById(sectionMap[section]);
                const chevron = document.getElementById(chevronMap[section]);
                if (content) content.classList.add('expanded');
                if (chevron) chevron.style.transform = 'rotate(180deg)';
            });
            state.allDynamicSectionsExpanded = true;
        }

function collapseAllDynamicSectionsInternal() {
            ['sharedPrefs', 'sqlite', 'files', 'security'].forEach(section => {
                const sectionMap = {
                    'sharedPrefs': 'sharedPrefsContent',
                    'sqlite': 'sqliteContent',
                    'files': 'filesContent',
                    'security': 'securityContent'
                };
                const chevronMap = {
                    'sharedPrefs': 'sharedPrefsChevron',
                    'sqlite': 'sqliteChevron',
                    'files': 'filesChevron',
                    'security': 'securityChevron'
                };
                
                const content = document.getElementById(sectionMap[section]);
                const chevron = document.getElementById(chevronMap[section]);
                if (content) content.classList.remove('expanded');
                if (chevron) chevron.style.transform = 'rotate(0deg)';
            });
            state.allDynamicSectionsExpanded = false;
        }

function displayDynamicResults() {
            document.getElementById('dynamicResultsSection').classList.remove('hidden');
            
            // Update summary counts
            document.getElementById('dynTotalFiles').textContent = state.dynamicAnalysisData.files.length;
            document.getElementById('dynSharedPrefs').textContent = state.dynamicAnalysisData.sharedPrefs.length;
            document.getElementById('dynDatabases').textContent = state.dynamicAnalysisData.databases.length;
            document.getElementById('dynIssuesFound').textContent = state.dynamicAnalysisData.issues.length;
            
            // Render SharedPreferences
            renderSharedPrefsResults();
            
            // Render SQLite results
            renderSQLiteResults();
            
            // Render other files
            renderFilesResults();
            
            // Render security issues
            renderSecurityIssues();
        }

function renderSharedPrefsResults() {
            const container = document.getElementById('sharedPrefsResults');
            
            if (state.dynamicAnalysisData.sharedPrefs.length === 0) {
                container.innerHTML = '<div class="glass rounded-xl p-6 text-center text-gray-400">No SharedPreferences files found</div>';
                return;
            }
            
            container.innerHTML = state.dynamicAnalysisData.sharedPrefs.map(sp => {
                const entries = sp.entries || [];
                const issues = sp.issues || [];
                const hasIssues = issues.length > 0;
                const borderClass = hasIssues ? 'border-red-500/50' : 'border-green-500/30';
                
                return `
                    <div class="glass rounded-xl p-4 border ${borderClass}">
                        <div class="flex items-start justify-between mb-3">
                            <div>
                                <h4 class="font-semibold text-white flex items-center gap-2">
                                    <svg class="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                    </svg>
                                    ${sp.path.split('/').pop()}
                                </h4>
                                <p class="text-gray-400 text-xs mt-1">${sp.path}</p>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="px-2 py-1 bg-gray-600/30 text-gray-300 text-xs rounded">${entries.length} entries</span>
                                ${hasIssues ? `<span class="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">${issues.length} issues</span>` : '<span class="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Clean</span>'}
                            </div>
                        </div>
                        
                        ${entries.length > 0 ? `
                            <div class="mt-3 pt-3 border-t border-gray-700/50">
                                <div class="instance-toggle" onclick="toggleDynamicInstances('sp-${sp.path.replace(/[^a-zA-Z0-9]/g, '')}')">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                    </svg>
                                    <span>View ${entries.length} entries</span>
                                </div>
                                <div id="sp-${sp.path.replace(/[^a-zA-Z0-9]/g, '')}" class="instances-container">
                                    <div class="mt-2 max-h-60 overflow-y-auto space-y-1">
                                        ${entries.slice(0, 50).map(e => {
                                            const isIssue = issues.some(i => i.key === e.name);
                                            return `
                                                <div class="instance-item ${isIssue ? 'border-red-500' : ''}">
                                                    <div class="flex items-start justify-between gap-2">
                                                        <div class="flex-1 min-w-0">
                                                            <span class="text-cyan-400 font-medium">${escapeHtml(e.name)}</span>
                                                            <span class="text-gray-500 mx-1">=</span>
                                                            <span class="text-gray-300">${escapeHtml(e.value.substring(0, 100))}${e.value.length > 100 ? '...' : ''}</span>
                                                        </div>
                                                        <span class="text-xs text-gray-500">${e.type}</span>
                                                    </div>
                                                </div>
                                            `;
                                        }).join('')}
                                        ${entries.length > 50 ? `<div class="text-center text-gray-500 text-xs py-2">... and ${entries.length - 50} more entries</div>` : ''}
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
        }

function renderSQLiteResults() {
            const container = document.getElementById('sqliteResults');
            
            if (state.dynamicAnalysisData.databases.length === 0) {
                container.innerHTML = '<div class="glass rounded-xl p-6 text-center text-gray-400">No SQLite databases found</div>';
                return;
            }
            
            container.innerHTML = state.dynamicAnalysisData.databases.map(db => {
                const info = db.info || {};
                const issues = info.issues || [];
                const tables = info.tables || [];
                const hasIssues = issues.length > 0;
                const borderClass = info.isEncrypted ? 'border-green-500/30' : (hasIssues ? 'border-red-500/50' : 'border-yellow-500/30');
                
                return `
                    <div class="glass rounded-xl p-4 border ${borderClass}">
                        <div class="flex items-start justify-between mb-3">
                            <div>
                                <h4 class="font-semibold text-white flex items-center gap-2">
                                    <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/>
                                    </svg>
                                    ${db.path.split('/').pop()}
                                </h4>
                                <p class="text-gray-400 text-xs mt-1">${db.path}</p>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="px-2 py-1 bg-gray-600/30 text-gray-300 text-xs rounded">${formatFileSize(info.size || 0)}</span>
                                ${info.isEncrypted ? 
                                    '<span class="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">🔒 Encrypted</span>' : 
                                    '<span class="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">⚠️ Unencrypted</span>'
                                }
                            </div>
                        </div>
                        
                        ${tables.length > 0 ? `
                            <div class="mb-3">
                                <p class="text-gray-400 text-xs mb-2">Tables Found:</p>
                                <div class="flex flex-wrap gap-1">
                                    ${tables.map(t => `<span class="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded">${escapeHtml(t)}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${issues.length > 0 ? `
                            <div class="mt-3 pt-3 border-t border-gray-700/50">
                                <p class="text-red-400 text-xs mb-2">⚠️ Issues Found:</p>
                                <div class="space-y-1">
                                    ${issues.map(i => `
                                        <div class="instance-item border-${i.severity === 'CRITICAL' ? 'red' : i.severity === 'HIGH' ? 'orange' : 'yellow'}-500">
                                            <span class="text-xs font-semibold ${i.severity === 'CRITICAL' ? 'text-red-400' : i.severity === 'HIGH' ? 'text-orange-400' : 'text-yellow-400'}">[${i.severity}]</span>
                                            <span class="text-gray-300 ml-2">${escapeHtml(i.description)}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
        }

function renderFilesResults() {
            const container = document.getElementById('filesResults');
            const filesWithIssues = state.dynamicAnalysisData.otherFiles.filter(f => f.issues && f.issues.length > 0);
            
            if (filesWithIssues.length === 0) {
                container.innerHTML = '<div class="glass rounded-xl p-6 text-center text-gray-400">No security issues found in files</div>';
                return;
            }
            
            container.innerHTML = filesWithIssues.map(f => {
                const issues = f.issues || [];
                
                return `
                    <div class="glass rounded-xl p-4 border border-orange-500/30">
                        <div class="flex items-start justify-between mb-2">
                            <div>
                                <h4 class="font-semibold text-white flex items-center gap-2">
                                    <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                    </svg>
                                    ${f.path.split('/').pop()}
                                </h4>
                                <p class="text-gray-400 text-xs">${f.path}</p>
                            </div>
                            <span class="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded">${issues.length} issues</span>
                        </div>
                        <div class="space-y-1">
                            ${issues.map(i => `
                                <div class="instance-item border-${i.severity === 'CRITICAL' ? 'red' : i.severity === 'HIGH' ? 'orange' : 'yellow'}-500">
                                    <span class="text-xs font-semibold ${i.severity === 'CRITICAL' ? 'text-red-400' : i.severity === 'HIGH' ? 'text-orange-400' : 'text-yellow-400'}">[${i.severity}]</span>
                                    <span class="text-gray-300 ml-2">${escapeHtml(i.description)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('');
        }

function renderSecurityIssues() {
            const container = document.getElementById('securityResults');
            const issues = state.dynamicAnalysisData.issues;
            
            if (issues.length === 0) {
                container.innerHTML = '<div class="glass rounded-xl p-6 text-center text-green-400">✅ No security issues detected</div>';
                return;
            }
            
            // Group by severity
            const critical = issues.filter(i => i.severity === 'CRITICAL');
            const high = issues.filter(i => i.severity === 'HIGH');
            const medium = issues.filter(i => i.severity === 'MEDIUM');
            const low = issues.filter(i => i.severity === 'LOW' || i.severity === 'INFO');
            
            container.innerHTML = `
                ${critical.length > 0 ? `
                    <div class="glass rounded-xl p-4 border border-red-500">
                        <h4 class="font-semibold text-red-400 mb-3 flex items-center gap-2">
                            <span class="w-3 h-3 rounded-full bg-red-500"></span>
                            CRITICAL (${critical.length})
                        </h4>
                        <div class="space-y-2">
                            ${critical.map(i => `
                                <div class="instance-item border-red-500">
                                    <div class="flex items-start justify-between">
                                        <div>
                                            <span class="font-medium text-red-300">${escapeHtml(i.type)}</span>
                                            <p class="text-gray-400 text-xs mt-1">${escapeHtml(i.description)}</p>
                                            <p class="text-gray-500 text-xs">${escapeHtml(i.file)}</p>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${high.length > 0 ? `
                    <div class="glass rounded-xl p-4 border border-orange-500">
                        <h4 class="font-semibold text-orange-400 mb-3 flex items-center gap-2">
                            <span class="w-3 h-3 rounded-full bg-orange-500"></span>
                            HIGH (${high.length})
                        </h4>
                        <div class="space-y-2">
                            ${high.map(i => `
                                <div class="instance-item border-orange-500">
                                    <div class="flex items-start justify-between">
                                        <div>
                                            <span class="font-medium text-orange-300">${escapeHtml(i.type)}</span>
                                            <p class="text-gray-400 text-xs mt-1">${escapeHtml(i.description)}</p>
                                            <p class="text-gray-500 text-xs">${escapeHtml(i.file)}</p>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${medium.length > 0 ? `
                    <div class="glass rounded-xl p-4 border border-yellow-500/50">
                        <h4 class="font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                            <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
                            MEDIUM (${medium.length})
                        </h4>
                        <div class="space-y-2">
                            ${medium.map(i => `
                                <div class="instance-item border-yellow-500">
                                    <div class="flex items-start justify-between">
                                        <div>
                                            <span class="font-medium text-yellow-300">${escapeHtml(i.type)}</span>
                                            <p class="text-gray-400 text-xs mt-1">${escapeHtml(i.description)}</p>
                                            <p class="text-gray-500 text-xs">${escapeHtml(i.file)}</p>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${low.length > 0 ? `
                    <div class="glass rounded-xl p-4 border border-gray-500/50">
                        <h4 class="font-semibold text-gray-400 mb-3 flex items-center gap-2">
                            <span class="w-3 h-3 rounded-full bg-gray-500"></span>
                            LOW/INFO (${low.length})
                        </h4>
                        <div class="space-y-2">
                            ${low.map(i => `
                                <div class="instance-item border-gray-500">
                                    <div class="flex items-start justify-between">
                                        <div>
                                            <span class="font-medium text-gray-300">${escapeHtml(i.type)}</span>
                                            <p class="text-gray-400 text-xs mt-1">${escapeHtml(i.description)}</p>
                                            <p class="text-gray-500 text-xs">${escapeHtml(i.file)}</p>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            `;
        }

function toggleDynamicSection(section) {
            const sectionMap = {
                'sharedPrefs': 'sharedPrefsContent',
                'sqlite': 'sqliteContent',
                'files': 'filesContent',
                'security': 'securityContent'
            };
            const chevronMap = {
                'sharedPrefs': 'sharedPrefsChevron',
                'sqlite': 'sqliteChevron',
                'files': 'filesChevron',
                'security': 'securityChevron'
            };
            
            const content = document.getElementById(sectionMap[section]);
            const chevron = document.getElementById(chevronMap[section]);
            
            if (content && chevron) {
                content.classList.toggle('expanded');
                chevron.style.transform = content.classList.contains('expanded') ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        }

function toggleDynamicInstances(id) {
            const container = document.getElementById(id);
            if (container) {
                container.classList.toggle('show');
                const toggle = container.previousElementSibling;
                if (toggle) {
                    const svg = toggle.querySelector('svg');
                    if (svg) {
                        svg.style.transform = container.classList.contains('show') ? 'rotate(90deg)' : 'rotate(0deg)';
                    }
                }
            }
        }

function resetDynamicAnalysis() {
            state.dynamicAnalysisData = {
                files: [],
                sharedPrefs: [],
                databases: [],
                otherFiles: [],
                issues: []
            };
            
            document.getElementById('dynamicUploadSection').classList.remove('hidden');
            document.getElementById('dynamicLoadingSection').classList.add('hidden');
            document.getElementById('dynamicFileInfo').classList.add('hidden');
            document.getElementById('dynamicResultsSection').classList.add('hidden');
            document.getElementById('dynamicFolderInput').value = '';
        }

export { toggleAllDynamicSections, expandAllDynamicSectionsInternal, collapseAllDynamicSectionsInternal, displayDynamicResults, renderSharedPrefsResults, renderSQLiteResults, renderFilesResults, renderSecurityIssues, toggleDynamicSection, toggleDynamicInstances, resetDynamicAnalysis };

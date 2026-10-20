// ui/misconfig.js — generated from src-legacy/code.js (do not hand-edit; edit tools/build.mjs)
import { state } from '../core/state.js';
import { escapeHtml } from '../core/utils.js';
import { renderSection } from './codeanalysis.js';

function toggleAllSections() {
            state.allSectionsExpanded = !state.allSectionsExpanded;
            if (state.allSectionsExpanded) {
                expandAllSections();
                document.getElementById('toggleAllText').textContent = 'Collapse All';
                document.getElementById('toggleAllIcon').style.transform = 'rotate(0deg)';
            } else {
                collapseAllSections();
                document.getElementById('toggleAllText').textContent = 'Expand All';
                document.getElementById('toggleAllIcon').style.transform = 'rotate(180deg)';
            }
        }

function expandAllSections() {
            ['root', 'emulator', 'ssl', 'flag', 'storage', 'crypto', 'logging', 'permission'].forEach(section => {
                const chip = document.getElementById(`${section}Chip`);
                const contentBlock = document.getElementById(`${section}Section`);
                if (chip) chip.classList.add('active');
                if (contentBlock) contentBlock.classList.add('visible');
            });
            state.allSectionsExpanded = true;
        }

function collapseAllSections() {
            ['root', 'emulator', 'ssl', 'flag', 'storage', 'crypto', 'logging', 'permission'].forEach(section => {
                const chip = document.getElementById(`${section}Chip`);
                const contentBlock = document.getElementById(`${section}Section`);
                if (chip) chip.classList.remove('active');
                if (contentBlock) contentBlock.classList.remove('visible');
            });
            state.allSectionsExpanded = false;
        }

function toggleSectionChip(sectionId) {
            const chip = document.getElementById(`${sectionId}Chip`);
            const section = document.getElementById(`${sectionId}Section`);
            
            if (chip && section) {
                chip.classList.toggle('active');
                section.classList.toggle('visible');
            }
        }

function updateChipCounts() {
            const counts = {
                root: state.currentRootResults.filter(r => r.detected).length,
                emulator: state.currentEmulatorResults.filter(r => r.detected).length,
                ssl: state.currentSSLResults.filter(r => r.detected).length,
                flag: state.currentFlagResults.filter(r => r.detected).length,
                storage: state.currentStorageResults.filter(r => r.detected).length,
                crypto: state.currentCryptoResults.filter(r => r.detected).length,
                logging: state.currentLoggingResults.filter(r => r.detected).length,
                permission: state.analyzedPermComponents.length
            };
            
            Object.keys(counts).forEach(key => {
                const countEl = document.getElementById(`${key}ChipCount`);
                if (countEl) {
                    countEl.textContent = counts[key];
                }
            });
        }

function displayPermissionAnalysis() {
            const section = document.getElementById('permissionSection');
            if (state.analyzedPermComponents.length === 0) {
                section.classList.add('hidden');
                return;
            }
            
            section.classList.remove('hidden');
            
            // Update counts
            const activities = state.analyzedPermComponents.filter(c => c.type === 'activity');
            const services = state.analyzedPermComponents.filter(c => c.type === 'service');
            const receivers = state.analyzedPermComponents.filter(c => c.type === 'receiver');
            const providers = state.analyzedPermComponents.filter(c => c.type === 'provider');
            
            document.getElementById('activityCount').textContent = activities.length;
            document.getElementById('serviceCount').textContent = services.length;
            document.getElementById('receiverCount').textContent = receivers.length;
            document.getElementById('providerCount').textContent = providers.length;
            
            // Update risk counts
            const highRisk = state.analyzedPermComponents.filter(c => c.risk === 'HIGH').length;
            const mediumRisk = state.analyzedPermComponents.filter(c => c.risk === 'MEDIUM').length;
            const lowRisk = state.analyzedPermComponents.filter(c => c.risk === 'LOW').length;
            
            document.getElementById('highRiskCount').textContent = `${highRisk} High Risk`;
            document.getElementById('mediumRiskCount').textContent = `${mediumRisk} Medium Risk`;
            document.getElementById('lowRiskCount').textContent = `${lowRisk} Low Risk`;
            
            renderPermissionComponents();
        }

function renderPermissionComponents() {
            const container = document.getElementById('componentsResults');
            const noMessage = document.getElementById('noComponentsMessage');
            
            let filtered = state.analyzedPermComponents;
            if (state.currentComponentFilter !== 'all') {
                filtered = state.analyzedPermComponents.filter(c => c.type === state.currentComponentFilter);
            }
            
            if (filtered.length === 0) {
                container.innerHTML = '';
                noMessage.classList.remove('hidden');
                return;
            }
            
            noMessage.classList.add('hidden');
            
            container.innerHTML = filtered.map(comp => {
                const riskClass = comp.risk === 'HIGH' ? 'border-red-500/50 bg-red-900/20' : 
                                  comp.risk === 'MEDIUM' ? 'border-yellow-500/50 bg-yellow-900/20' : 
                                  'border-green-500/50 bg-green-900/20';
                const riskBadge = comp.risk === 'HIGH' ? 'bg-red-500' : 
                                  comp.risk === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500';
                const typeColors = {
                    activity: 'bg-blue-500/20 text-blue-400',
                    service: 'bg-green-500/20 text-green-400',
                    receiver: 'bg-yellow-500/20 text-yellow-400',
                    provider: 'bg-purple-500/20 text-purple-400'
                };
                const protectionColors = {
                    'PUBLIC': 'text-red-400',
                    'dangerous': 'text-red-400',
                    'normal': 'text-green-400',
                    'signature': 'text-blue-400',
                    'signature|privileged': 'text-purple-400',
                    'internal': 'text-orange-400',
                    'appops': 'text-yellow-400',
                    'unknown/system': 'text-gray-400',
                    'normal (implicit)': 'text-yellow-400'
                };
                
                return `
                    <div class="component-card glass rounded-xl p-4 border ${riskClass}">
                        <div class="flex items-start justify-between gap-3">
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="px-2 py-0.5 rounded text-xs font-medium ${typeColors[comp.type]}">${comp.type.toUpperCase()}</span>
                                    <span class="px-2 py-0.5 rounded text-xs font-medium text-white ${riskBadge}">${comp.risk}</span>
                                </div>
                                <h4 class="font-mono text-sm text-white truncate" title="${escapeHtml(comp.name)}">${escapeHtml(comp.name)}</h4>
                                <div class="mt-2 text-xs">
                                    <span class="text-gray-400">Permission:</span>
                                    <span class="${protectionColors[comp.protectionLevel] || 'text-gray-400'} ml-1">${escapeHtml(comp.permission)}</span>
                                </div>
                                <div class="text-xs mt-1">
                                    <span class="text-gray-400">Protection Level:</span>
                                    <span class="${protectionColors[comp.protectionLevel] || 'text-gray-400'} ml-1">${comp.protectionLevel}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

function setComponentFilter(filter) {
            state.currentComponentFilter = filter;
            document.querySelectorAll('[id^="compFilter"]').forEach(btn => btn.classList.remove('active'));
            const btnId = 'compFilter' + filter.charAt(0).toUpperCase() + filter.slice(1);
            const btn = document.getElementById(btnId);
            if (btn) btn.classList.add('active');
            renderPermissionComponents();
        }

function displayMisconfigResults() {
            const total = state.currentRootResults.length + state.currentEmulatorResults.length + state.currentSSLResults.length + 
                         state.currentFlagResults.length + state.currentStorageResults.length + state.currentCryptoResults.length + state.currentLoggingResults.length;
            const detected = state.currentRootResults.filter(r => r.detected).length + state.currentEmulatorResults.filter(r => r.detected).length +
                            state.currentSSLResults.filter(r => r.detected).length + state.currentFlagResults.filter(r => r.detected).length +
                            state.currentStorageResults.filter(r => r.detected).length + state.currentCryptoResults.filter(r => r.detected).length +
                            state.currentLoggingResults.filter(r => r.detected).length;
            
            // Check if content contains smali (bytecode) rather than decompiled source
            const allResults = [...state.currentRootResults, ...state.currentEmulatorResults, ...state.currentSSLResults, 
                               ...state.currentFlagResults, ...state.currentStorageResults, ...state.currentCryptoResults, ...state.currentLoggingResults];
            const hasSmaliContent = allResults.some(r => r.instances && r.instances.some(i => i.isSmali));
            
            // Show/hide the smali note or source note
            const smaliNote = document.getElementById('smaliNote');
            const sourceNote = document.getElementById('sourceNote');
            
            if (state.decompiledSourceData.isLoaded) {
                // Using decompiled source - show source note
                if (smaliNote) smaliNote.classList.add('hidden');
                if (sourceNote) sourceNote.classList.remove('hidden');
            } else {
                // Using APK content - show smali note if smali content detected
                if (smaliNote) smaliNote.classList.toggle('hidden', !hasSmaliContent);
                if (sourceNote) sourceNote.classList.add('hidden');
            }

            document.getElementById('totalChecks').textContent = total;
            document.getElementById('detectedChecks').textContent = detected;
            document.getElementById('notDetectedChecks').textContent = total - detected;
            document.getElementById('totalChecksDisplay').textContent = total;
            document.getElementById('detectedChecksDisplay').textContent = detected;
            document.getElementById('notDetectedChecksDisplay').textContent = total - detected;
            document.getElementById('securityScore').textContent = Math.round((detected / total) * 100) + '%';

            document.getElementById('rootDetectedCount').textContent = state.currentRootResults.filter(r => r.detected).length;
            document.getElementById('rootTotalCount').textContent = state.currentRootResults.length;
            document.getElementById('emulatorDetectedCount').textContent = state.currentEmulatorResults.filter(r => r.detected).length;
            document.getElementById('emulatorTotalCount').textContent = state.currentEmulatorResults.length;
            document.getElementById('sslDetectedCount').textContent = state.currentSSLResults.filter(r => r.detected).length;
            document.getElementById('sslTotalCount').textContent = state.currentSSLResults.length;
            document.getElementById('flagDetectedCount').textContent = state.currentFlagResults.filter(r => r.detected).length;
            document.getElementById('flagTotalCount').textContent = state.currentFlagResults.length;
            document.getElementById('storageDetectedCount').textContent = state.currentStorageResults.filter(r => r.detected).length;
            document.getElementById('storageTotalCount').textContent = state.currentStorageResults.length;
            document.getElementById('cryptoDetectedCount').textContent = state.currentCryptoResults.filter(r => r.detected).length;
            document.getElementById('cryptoTotalCount').textContent = state.currentCryptoResults.length;

            renderFilteredResults();
            
            // Update chip counts for the new layout
            updateChipCounts();
        }

function renderFilteredResults() {
            let filteredRoot = state.currentRootResults, filteredEmulator = state.currentEmulatorResults, 
                filteredSSL = state.currentSSLResults, filteredFlag = state.currentFlagResults,
                filteredStorage = state.currentStorageResults, filteredCrypto = state.currentCryptoResults,
                filteredLogging = state.currentLoggingResults;

            if (state.currentFilter === 'detected') {
                filteredRoot = state.currentRootResults.filter(r => r.detected);
                filteredEmulator = state.currentEmulatorResults.filter(r => r.detected);
                filteredSSL = state.currentSSLResults.filter(r => r.detected);
                filteredFlag = state.currentFlagResults.filter(r => r.detected);
                filteredStorage = state.currentStorageResults.filter(r => r.detected);
                filteredCrypto = state.currentCryptoResults.filter(r => r.detected);
                filteredLogging = state.currentLoggingResults.filter(r => r.detected);
            } else if (state.currentFilter === 'not-detected') {
                filteredRoot = state.currentRootResults.filter(r => !r.detected);
                filteredEmulator = state.currentEmulatorResults.filter(r => !r.detected);
                filteredSSL = state.currentSSLResults.filter(r => !r.detected);
                filteredFlag = state.currentFlagResults.filter(r => !r.detected);
                filteredStorage = state.currentStorageResults.filter(r => !r.detected);
                filteredCrypto = state.currentCryptoResults.filter(r => !r.detected);
                filteredLogging = state.currentLoggingResults.filter(r => !r.detected);
            }

            if (state.currentFlagCategoryFilter !== 'all') {
                filteredFlag = filteredFlag.filter(r => r.category === state.currentFlagCategoryFilter);
            }
            if (state.currentStorageCategoryFilter !== 'all') {
                filteredStorage = filteredStorage.filter(r => r.category === state.currentStorageCategoryFilter);
            }
            if (state.currentCryptoCategoryFilter !== 'all') {
                filteredCrypto = filteredCrypto.filter(r => r.category === state.currentCryptoCategoryFilter);
            }
            if (state.currentLoggingCategoryFilter !== 'all') {
                filteredLogging = filteredLogging.filter(r => r.category === state.currentLoggingCategoryFilter);
            }

            renderSection('rootResults', filteredRoot);
            renderSection('emulatorResults', filteredEmulator);
            renderSection('sslResults', filteredSSL);
            renderSection('flagResults', filteredFlag);
            renderSection('storageResults', filteredStorage);
            renderSection('cryptoResults', filteredCrypto);
            renderSection('loggingResults', filteredLogging);
        }

function setFilter(filter) {
            state.currentFilter = filter;
            ['filterAll', 'filterDetected', 'filterNotDetected'].forEach(id => {
                document.getElementById(id).classList.remove('active');
            });
            document.getElementById(filter === 'all' ? 'filterAll' : filter === 'detected' ? 'filterDetected' : 'filterNotDetected').classList.add('active');
            renderFilteredResults();
        }

function setFlagCategoryFilter(category) {
            state.currentFlagCategoryFilter = category;
            document.querySelectorAll('[id^="flagCat"]').forEach(b => b.classList.remove('active'));
            const map = {
                'all':'flagCatAll','Screen Protection':'flagCatScreen','UI Security':'flagCatUI',
                'Component Security':'flagCatComponent','Intent Security':'flagCatIntent',
                'Activity Security':'flagCatActivity','WebView Security':'flagCatWebView',
                'Build Security':'flagCatBuild','Data Security':'flagCatData',
                'Permission Security':'flagCatPermission','Network Security':'flagCatNetwork',
                'Runtime Security':'flagCatRuntime'
            };
            document.getElementById(map[category])?.classList.add('active');
            renderFilteredResults();
        }

function setStorageCategoryFilter(category) {
            state.currentStorageCategoryFilter = category;
            document.querySelectorAll('[id^="storageCat"]').forEach(btn => btn.classList.remove('active'));
            const id = category === 'all' ? 'storageCatAll' : 
                       category === 'SharedPreferences' ? 'storageCatPrefs' :
                       category === 'SQLite' ? 'storageCatSqlite' :
                       category === 'File Storage' ? 'storageCatFiles' : 'storageCatSecrets';
            document.getElementById(id).classList.add('active');
            renderFilteredResults();
        }

function setCryptoCategoryFilter(category) {
            state.currentCryptoCategoryFilter = category;
            document.querySelectorAll('[id^="cryptoCat"]').forEach(btn => btn.classList.remove('active'));
            const categoryToId = {
                'all': 'cryptoCatAll', 'Weak Algorithms': 'cryptoCatWeak', 'Key Management': 'cryptoCatKey',
                'IV/Nonce Issues': 'cryptoCatIV', 'Random Generation': 'cryptoCatRandom',
                'Certificate Validation': 'cryptoCatCert', 'Custom Crypto': 'cryptoCatCustom', 'Keystore Issues': 'cryptoCatKeystore'
            };
            document.getElementById(categoryToId[category]).classList.add('active');
            renderFilteredResults();
        }

function setLoggingCategoryFilter(category) {
            state.currentLoggingCategoryFilter = category;
            document.querySelectorAll('[id^="loggingCat"]').forEach(btn => btn.classList.remove('active'));
            const categoryToId = {
                'all': 'loggingCatAll',
                'Credentials & Secrets': 'loggingCatSecrets',
                'PII': 'loggingCatPII'
            };
            document.getElementById(categoryToId[category]).classList.add('active');
            renderFilteredResults();
        }

function setPermFilter(filter) {
            state.currentPermFilter = filter;
            document.querySelectorAll('[id^="permFilter"]').forEach(btn => btn.classList.remove('active'));
            document.getElementById(`permFilter${filter.charAt(0).toUpperCase() + filter.slice(1)}`).classList.add('active');
        }

function setComponentTypeFilter(type) {
            state.currentComponentTypeFilter = type;
            document.querySelectorAll('[id^="compFilter"]').forEach(btn => btn.classList.remove('active'));
            document.getElementById(`compFilter${type.charAt(0).toUpperCase() + type.slice(1)}`).classList.add('active');
        }

function exportPermissions() { alert('Export functionality'); }

export { toggleAllSections, expandAllSections, collapseAllSections, toggleSectionChip, updateChipCounts, displayPermissionAnalysis, renderPermissionComponents, setComponentFilter, displayMisconfigResults, renderFilteredResults, setFilter, setFlagCategoryFilter, setStorageCategoryFilter, setCryptoCategoryFilter, setLoggingCategoryFilter, setPermFilter, setComponentTypeFilter, exportPermissions };

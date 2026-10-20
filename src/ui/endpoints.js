// ui/endpoints.js — generated from src-legacy/code.js (do not hand-edit; edit tools/build.mjs)
import { state } from '../core/state.js';
import { escapeHtml, registerCopy } from '../core/utils.js';

function displayEndpointResults() {
            const httpCount = state.extractedEndpoints.filter(e => e.type === 'http').length;
            const apiCount = state.extractedEndpoints.filter(e => e.type === 'api').length;
            const wsCount = state.extractedEndpoints.filter(e => e.type === 'websocket').length;
            const deeplinkCount = state.extractedEndpoints.filter(e => e.type === 'deeplink').length;
            const cloudCount = state.extractedEndpoints.filter(e => e.type === 'cloud').length;
            const ipCount = state.extractedEndpoints.filter(e => e.type === 'ip').length;
            
            document.getElementById('httpEndpointCount').textContent = httpCount;
            document.getElementById('apiEndpointCount').textContent = apiCount;
            document.getElementById('wsEndpointCount').textContent = wsCount;
            document.getElementById('deeplinkEndpointCount').textContent = deeplinkCount;
            document.getElementById('cloudEndpointCount').textContent = cloudCount;
            document.getElementById('ipEndpointCount').textContent = ipCount;
            
            // Update filter counts
            const totalEndpoints = state.extractedEndpoints.length;
            const detectedEndpoints = totalEndpoints;
            const notDetectedEndpoints = 0;
            
            const __sum = document.getElementById('endpointSummary');
            if (__sum) __sum.textContent = `${totalEndpoints} endpoints`;
            
            if (state.extractedEndpoints.length === 0) {
                document.getElementById('noEndpointsFound').classList.remove('hidden');
                document.getElementById('endpointResultsSection').classList.add('hidden');
            } else {
                document.getElementById('noEndpointsFound').classList.add('hidden');
                document.getElementById('endpointResultsSection').classList.remove('hidden');
                document.getElementById('endpointsHeader').classList.remove('hidden');
                
                const sections = ['http', 'api', 'ws', 'deeplink', 'cloud', 'ip'];
                sections.forEach(section => {
                    const sectionDiv = document.getElementById(`${section}EndpointSection`);
                    if (sectionDiv) sectionDiv.classList.add('visible');
                });
                
                renderEndpoints();
                state.allEndpointSectionsExpanded = true;
                state.currentEndpointSection = null;
            }
        }

function renderEndpoints() {
            const searchTerm = document.getElementById('endpointSearch')?.value?.toLowerCase() || '';
            if (!!document.getElementById('uniqueDomainChip')?.classList.contains('active')) {
                renderUniqueDomains(searchTerm);
                return;
            }
            
            const sections = ['http', 'api', 'websocket', 'deeplink', 'cloud', 'ip'];
            const sectionMap = {
                'http': 'httpEndpointResults',
                'api': 'apiEndpointResults',
                'websocket': 'wsEndpointResults',
                'deeplink': 'deeplinkEndpointResults',
                'cloud': 'cloudEndpointResults',
                'ip': 'ipEndpointResults'
            };
            const colorMap = {
                'http': 'blue',
                'api': 'purple',
                'websocket': 'green',
                'deeplink': 'orange',
                'cloud': 'pink',
                'ip': 'yellow'
            };
            
            let totalFiltered = 0;
            
            sections.forEach(type => {
                let filtered = state.extractedEndpoints.filter(e => e.type === type);
                
                if (searchTerm) {
                    filtered = filtered.filter(e => e.url.toLowerCase().includes(searchTerm));
                }
                
                totalFiltered += filtered.length;
                
                const container = document.getElementById(sectionMap[type]);
                if (!container) return;
                
                if (filtered.length === 0) {
                    container.innerHTML = '<div class="text-center py-6 text-gray-500"><p class="text-sm">No endpoints found</p></div>';
                    return;
                }
                
                const color = colorMap[type];
                container.innerHTML = filtered.map(e => `
                    <div class="endpoint-card glass rounded-xl p-4 border border-${color}-500/30">
                        <div class="flex items-center gap-3">
                            <div class="flex-1 min-w-0">
                                <span class="category-tag bg-${color}-500/20 text-${color}-400">${e.category}</span>
                                <p class="text-white font-mono text-sm break-all mt-1">${escapeHtml(e.url)}</p>
                            </div>
                            <button data-copy-id="${registerCopy(e.url)}" class="copy-btn p-2 hover:bg-white/10 rounded-lg">
                                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                `).join('');
            });
            
            const searchCount = document.getElementById('searchResultCount');
            if (searchCount) {
                searchCount.textContent = searchTerm ? `${totalFiltered} results` : '';
            }
        }
function renderUniqueDomains(q) {
    const groups = new Map();
    for (const e of state.extractedEndpoints) {
        if (q && !e.url.toLowerCase().includes(q)) continue;
        const hm = hostOf(e.url);
        const g = groups.get(hm) || { host: hm, count: 0, sample: e.url };
        g.count++;
        groups.set(hm, g);
    }
    const list = [...groups.values()].sort((a, b) => b.count - a.count || (a.host < b.host ? -1 : 1));
    paintUniqueDomains(list, q);
}

function hostOf(url) {
    try { return new URL(url).hostname.toLowerCase(); } catch (e) {}
    const m = /^[a-z][a-z0-9+\-.]*:\/\/([^\s/:?#]+)/i.exec(url);
    return m ? m[1].toLowerCase() : url;
}

function paintUniqueDomains(list, q) {
    const container = document.getElementById('uniqueEndpointResults');
    const uc = document.getElementById('uniqueDomainCount');
    if (uc) uc.textContent = list.length ? ' (' + list.length + ')' : '';
    const sc = document.getElementById('searchResultCount');
    if (sc) sc.textContent = q ? '' + list.length + ' results' : '';
    if (!container) return;
    if (!list.length) {
        container.innerHTML = '<div class="text-center py-6 text-gray-500"><p class="text-sm">No endpoints found</p></div>';
        return;
    }
    container.innerHTML = list.map(uniqueCard).join('');
}

function uniqueCard(g) {
    const n = g.count + ' URL' + (g.count === 1 ? '' : 's');
    return '<div class="endpoint-card glass rounded-xl p-4 border border-teal-500/30">' +
        '<div class="flex items-center gap-3">' +
        '<div class="flex-1 min-w-0">' +
        '<span class="category-tag bg-teal-500/20 text-teal-400">' + n + '</span>' +
        '<p class="text-white font-mono text-sm break-all mt-1">' + escapeHtml(g.host) + '</p>' +
        '<p class="text-gray-500 font-mono text-xs break-all mt-1">' + escapeHtml(g.sample) + '</p>' +
        '</div>' +
        '<button data-copy-id="' + registerCopy(g.host) + '" class="copy-btn p-2 hover:bg-white/10 rounded-lg">' +
        '<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>' +
        '</svg></button></div></div>';
}


function filterEndpointsBySearch() { renderEndpoints(); }

function toggleEndpointSectionsExpandCollapse() {
            const btn = document.getElementById('endpointToggleBtn');
            if (state.allEndpointSectionsExpanded) {
                collapseAllEndpointSections();
                if (btn) btn.textContent = 'Expand All';
            } else {
                expandAllEndpointSections();
                if (btn) btn.textContent = 'Collapse All';
            }
        }

function expandAllEndpointSections() {
            const sections = ['http', 'api', 'ws', 'deeplink', 'cloud', 'ip'];
            sections.forEach(section => {
                const sectionDiv = document.getElementById(`${section}EndpointSection`);
                if (sectionDiv) sectionDiv.classList.add('visible');
            });
            state.allEndpointSectionsExpanded = true;
            document.getElementById('uniqueEndpointSection')?.classList.remove('visible');
            document.getElementById('uniqueDomainChip')?.classList.remove('active');
        }

function collapseAllEndpointSections() {
            const sections = ['http', 'api', 'ws', 'deeplink', 'cloud', 'ip'];
            sections.forEach(section => {
                const sectionDiv = document.getElementById(`${section}EndpointSection`);
                if (sectionDiv) sectionDiv.classList.remove('visible');
            });
            
            state.currentEndpointSection = null;
            document.querySelectorAll('#page-endpoints .section-chip').forEach(chip => {
                chip.classList.remove('active');
            });
            
            state.allEndpointSectionsExpanded = false;
            document.getElementById('uniqueEndpointSection')?.classList.remove('visible');
        }

function toggleEndpointSectionChip(section) {
            const prevChip = document.getElementById(`${section}EndpointChip`);
            const wasIsolated = !!prevChip && prevChip.classList.contains('active') && state.currentEndpointSection === section && !state.allEndpointSectionsExpanded;
            state.currentEndpointSection = section;
            
            document.querySelectorAll('#page-endpoints .section-chip').forEach(chip => {
                chip.classList.remove('active');
            });
            
            const chip = document.getElementById(`${section}EndpointChip`);
            if (wasIsolated) {
                sections.forEach(s => {
                    const sectionDiv = document.getElementById(`${s}EndpointSection`);
                    if (sectionDiv) sectionDiv.classList.add('visible');
                });
                state.allEndpointSectionsExpanded = true;
                state.currentEndpointSection = null;
                const tbtn = document.getElementById('endpointToggleBtn');
                if (tbtn) tbtn.textContent = 'Collapse All';
                return;
            }
            if (chip) chip.classList.add('active');
            state.allEndpointSectionsExpanded = false;

            const sections = ['http', 'api', 'ws', 'deeplink', 'cloud', 'ip'];
            sections.forEach(s => {
                const sectionDiv = document.getElementById(`${s}EndpointSection`);
                if (sectionDiv) sectionDiv.classList.toggle('visible', s === section);
            });
            const tbtn2 = document.getElementById('endpointToggleBtn');
            if (tbtn2) tbtn2.textContent = 'Expand All';
            document.getElementById('uniqueEndpointSection')?.classList.remove('visible');
        }

function setEndpointFilter(filter) {
            state.currentEndpointFilterType = filter;
            ['endpointFilterAll', 'endpointFilterDetected', 'endpointFilterNotDetected'].forEach(id => {
                document.getElementById(id).classList.remove('active');
            });
            document.getElementById(filter === 'all' ? 'endpointFilterAll' : filter === 'detected' ? 'endpointFilterDetected' : 'endpointFilterNotDetected').classList.add('active');
        }

function exportEndpoints() {
            if (!state.extractedEndpoints.length) return;
            const a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([state.extractedEndpoints.map(e => e.url).join('\n')], { type: 'text/plain' }));
            a.download = 'endpoints.txt';
            a.click();
        }

export { displayEndpointResults, renderEndpoints, filterEndpointsBySearch, toggleEndpointSectionsExpandCollapse, expandAllEndpointSections, collapseAllEndpointSections, toggleEndpointSectionChip, setEndpointFilter, exportEndpoints };

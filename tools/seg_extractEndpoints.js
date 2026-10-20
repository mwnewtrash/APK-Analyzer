        function extractEndpoints(content) {
            const endpoints = new Map();
            
            // HTTP/HTTPS URLs
            const httpRegex = /https?:\/\/[a-zA-Z0-9][-a-zA-Z0-9]*(?:\.[a-zA-Z0-9][-a-zA-Z0-9]*)+(?::\d+)?(?:\/[^\s"'<>\\]*)?/gi;
            (content.match(httpRegex) || []).forEach(url => {
                const clean = url.replace(/['"\\<>)\]}]+$/, '').trim();
                if (clean.length > 10 && !['schemas.android.com', 'www.w3.org', 'xmlpull.org'].some(b => clean.includes(b))) {
                    let type = 'http';
                    let category = 'HTTP/S';
                    
                    // Categorize
                    if (clean.includes('/api/') || clean.includes('/v1/') || clean.includes('/v2/') || clean.includes('/rest/')) {
                        type = 'api';
                        category = 'API';
                    } else if (clean.includes('amazonaws.com') || clean.includes('googleapis.com') || clean.includes('azure.com') || clean.includes('firebaseio.com')) {
                        type = 'cloud';
                        category = 'Cloud';
                    }
                    
                    endpoints.set(clean, { url: clean, category, type });
                }
            });
            
            // WebSocket URLs
            const wsRegex = /wss?:\/\/[a-zA-Z0-9][-a-zA-Z0-9]*(?:\.[a-zA-Z0-9][-a-zA-Z0-9]*)+(?::\d+)?(?:\/[^\s"'<>\\]*)?/gi;
            (content.match(wsRegex) || []).forEach(url => {
                const clean = url.replace(/['"\\<>)\]}]+$/, '').trim();
                if (clean.length > 10) {
                    endpoints.set(clean, { url: clean, category: 'WebSocket', type: 'websocket' });
                }
            });
            
            // Deep Links
            const deepLinkRegex = /([a-z][a-z0-9+\-.]*):\/\/[^\s"'<>\\]+/gi;
            (content.match(deepLinkRegex) || []).forEach(url => {
                const clean = url.replace(/['"\\<>)\]}]+$/, '').trim();
                const scheme = clean.split(':')[0].toLowerCase();
                if (!['http', 'https', 'ws', 'wss', 'file', 'ftp', 'mailto'].includes(scheme) && clean.length > 10) {
                    endpoints.set(clean, { url: clean, category: 'Deep Link', type: 'deeplink' });
                }
            });
            
            // IP Addresses with ports
            const ipRegex = /\b(?:https?:\/\/)?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::(\d+))?(?:\/[^\s"'<>\\]*)?\b/gi;
            (content.match(ipRegex) || []).forEach(url => {
                const clean = url.replace(/['"\\<>)\]}]+$/, '').trim();
                if (clean.length > 7) {
                    endpoints.set(clean, { url: clean, category: 'IP Address', type: 'ip' });
                }
            });
            
            extractedEndpoints = Array.from(endpoints.values());
            return extractedEndpoints;
        }

        function displayEndpointResults() {
            const httpCount = extractedEndpoints.filter(e => e.type === 'http').length;
            const apiCount = extractedEndpoints.filter(e => e.type === 'api').length;
            const wsCount = extractedEndpoints.filter(e => e.type === 'websocket').length;
            const deeplinkCount = extractedEndpoints.filter(e => e.type === 'deeplink').length;
            const cloudCount = extractedEndpoints.filter(e => e.type === 'cloud').length;
            const ipCount = extractedEndpoints.filter(e => e.type === 'ip').length;
            
            document.getElementById('httpEndpointCount').textContent = httpCount;
            document.getElementById('apiEndpointCount').textContent = apiCount;
            document.getElementById('wsEndpointCount').textContent = wsCount;
            document.getElementById('deeplinkEndpointCount').textContent = deeplinkCount;
            document.getElementById('cloudEndpointCount').textContent = cloudCount;
            document.getElementById('ipEndpointCount').textContent = ipCount;
            
            // Update filter counts
            const totalEndpoints = extractedEndpoints.length;
            const detectedEndpoints = totalEndpoints;
            const notDetectedEndpoints = 0;
            
            document.getElementById('endpointTotalChecks').textContent = totalEndpoints;
            document.getElementById('endpointDetectedChecks').textContent = detectedEndpoints;
            document.getElementById('endpointNotDetectedChecks').textContent = notDetectedEndpoints;
            
            if (extractedEndpoints.length === 0) {
                document.getElementById('noEndpointsFound').classList.remove('hidden');
                document.getElementById('endpointResultsSection').classList.add('hidden');
            } else {
                document.getElementById('noEndpointsFound').classList.add('hidden');
                document.getElementById('endpointResultsSection').classList.remove('hidden');
                document.getElementById('endpointsHeader').classList.remove('hidden');
                
                const sections = ['http', 'api', 'websocket', 'deeplink', 'cloud', 'ip'];
                sections.forEach(section => {
                    const sectionDiv = document.getElementById(`${section}EndpointSection`);
                    if (sectionDiv) sectionDiv.classList.add('visible');
                });
                
                renderEndpoints();
            }
        }

        function renderEndpoints() {
            const searchTerm = document.getElementById('endpointSearch')?.value?.toLowerCase() || '';
            
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
                let filtered = extractedEndpoints.filter(e => e.type === type);
                
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
                            <button onclick="copyToClipboard('${escapeHtml(e.url.replace(/'/g, "\\'"))}')" class="copy-btn p-2 hover:bg-white/10 rounded-lg">
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

        function filterEndpointsBySearch() { renderEndpoints(); }
        
        function toggleEndpointSectionsExpandCollapse() {
            const btn = document.getElementById('endpointToggleBtn');
            if (allEndpointSectionsExpanded) {
                collapseAllEndpointSections();
                if (btn) btn.textContent = 'Expand All';
            } else {
                expandAllEndpointSections();
                if (btn) btn.textContent = 'Collapse All';
            }
        }
        
        function expandAllEndpointSections() {
            const sections = ['http', 'api', 'websocket', 'deeplink', 'cloud', 'ip'];
            sections.forEach(section => {
                const sectionDiv = document.getElementById(`${section}EndpointSection`);
                if (sectionDiv) sectionDiv.classList.add('visible');
            });
            allEndpointSectionsExpanded = true;
        }
        
        function collapseAllEndpointSections() {
            const sections = ['http', 'api', 'websocket', 'deeplink', 'cloud', 'ip'];
            sections.forEach(section => {
                const sectionDiv = document.getElementById(`${section}EndpointSection`);
                if (sectionDiv) sectionDiv.classList.remove('visible');
            });
            
            currentEndpointSection = null;
            document.querySelectorAll('#page-endpoints .section-chip').forEach(chip => {
                chip.classList.remove('active');
            });
            
            allEndpointSectionsExpanded = false;
        }
        
        function toggleEndpointSectionChip(section) {
            currentEndpointSection = section;
            
            document.querySelectorAll('#page-endpoints .section-chip').forEach(chip => {
                chip.classList.remove('active');
            });
            
            const chip = document.getElementById(`${section}EndpointChip`);
            if (chip) chip.classList.add('active');
            
            const sections = ['http', 'api', 'websocket', 'deeplink', 'cloud', 'ip'];
            sections.forEach(s => {
                const sectionDiv = document.getElementById(`${s}EndpointSection`);
                if (sectionDiv) {
                    if (allEndpointSectionsExpanded) {
                        sectionDiv.classList.add('visible');
                    } else {
                        if (s === section) {
                            sectionDiv.classList.add('visible');
                        } else {
                            sectionDiv.classList.remove('visible');
                        }
                    }
                }
            });
        }
        
        function setCodeFilter(filter) {
            currentCodeFilter = filter;
            ['codeFilterAll', 'codeFilterDetected', 'codeFilterNotDetected'].forEach(id => {
                document.getElementById(id).classList.remove('active');
            });
            document.getElementById(filter === 'all' ? 'codeFilterAll' : filter === 'detected' ? 'codeFilterDetected' : 'codeFilterNotDetected').classList.add('active');
        }
        
        function setEndpointFilter(filter) {
            currentEndpointFilterType = filter;
            ['endpointFilterAll', 'endpointFilterDetected', 'endpointFilterNotDetected'].forEach(id => {
                document.getElementById(id).classList.remove('active');
            });
            document.getElementById(filter === 'all' ? 'endpointFilterAll' : filter === 'detected' ? 'endpointFilterDetected' : 'endpointFilterNotDetected').classList.add('active');
        }
        
        function exportEndpoints() {
            if (!extractedEndpoints.length) return;
            const a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([extractedEndpoints.map(e => e.url).join('\n')], { type: 'text/plain' }));
            a.download = 'endpoints.txt';
            a.click();
        }

        function setPermFilter(filter) {
            currentPermFilter = filter;
            document.querySelectorAll('[id^="permFilter"]').forEach(btn => btn.classList.remove('active'));
            document.getElementById(`permFilter${filter.charAt(0).toUpperCase() + filter.slice(1)}`).classList.add('active');
        }

        function setComponentTypeFilter(type) {
            currentComponentTypeFilter = type;
            document.querySelectorAll('[id^="compFilter"]').forEach(btn => btn.classList.remove('active'));
            document.getElementById(`compFilter${type.charAt(0).toUpperCase() + type.slice(1)}`).classList.add('active');
        }

        function exportPermissions() { alert('Export functionality'); }

        function resetGlobalAnalyzer() {
            globalAPKData = { file: null, content: null, manifestContent: null, isLoaded: false };
            decompiledSourceData = { files: [], content: null, isLoaded: false, fileCount: 0 };
            analyzedPermComponents = [];
            currentComponentFilter = 'all';
            
            document.getElementById('globalUploadSection').classList.remove('hidden');
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
            
            // Hide permission section
            const permSection = document.getElementById('permissionSection');
            if (permSection) permSection.classList.add('hidden');
            
            // Hide notes
            const smaliNote = document.getElementById('smaliNote');
            const sourceNote = document.getElementById('sourceNote');
            if (smaliNote) smaliNote.classList.add('hidden');
            if (sourceNote) sourceNote.classList.add('hidden');
        }

        function analyzePatterns(content, checks, usingDecompiledSource = false) {
            const lower = content.toLowerCase();
            const lines = content.split('\n');
            
            // Track current file for decompiled source
            let currentFile = '';
            const fileLineMap = new Map(); // Track line numbers per file
            
            return checks.map(check => {
                const matchedPatterns = check.patterns.filter(p => lower.includes(p.toLowerCase()));
                const instances = [];
                
                // Find actual instances with line numbers and better context
                if (matchedPatterns.length > 0) {
                    let fileLineNumber = 0;
                    currentFile = '';
                    
                    for (let i = 0; i < lines.length && instances.length < 20; i++) {
                        const line = lines[i];
                        const lineLower = line.toLowerCase();
                        
                        // Track file changes in decompiled source
                        if (line.startsWith('// FILE: ')) {
                            currentFile = line.replace('// FILE: ', '').trim();
                            fileLineNumber = 0;
                            continue;
                        }
                        fileLineNumber++;
                        
                        for (const pattern of matchedPatterns) {
                            if (lineLower.includes(pattern.toLowerCase())) {
                                let trimmedLine = line.trim();
                                
                                // Skip very short lines or pure comments (but keep import statements)
                                if (trimmedLine.length < 3) continue;
                                if (trimmedLine === '{' || trimmedLine === '}' || trimmedLine === '};') continue;
                                
                                // Determine if this is source code or smali
                                const isSourceFile = currentFile && (currentFile.endsWith('.java') || currentFile.endsWith('.kt'));
                                const isSmaliContent = !isSourceFile && (
                                    trimmedLine.includes('Landroid/') || 
                                    trimmedLine.includes(';->') ||
                                    trimmedLine.startsWith('.') ||
                                    /^(invoke|iget|iput|sget|sput|const|move|return|if-|goto)/.test(trimmedLine)
                                );
                                
                                // For smali content, try to extract meaningful strings
                                if (isSmaliContent) {
                                    // Extract string value from const-string
                                    if (trimmedLine.includes('const-string')) {
                                        const stringMatch = trimmedLine.match(/const-string[^"]*"([^"]+)"/);
                                        if (stringMatch) {
                                            trimmedLine = `String: "${stringMatch[1]}"`;
                                        }
                                    } else if (trimmedLine.startsWith('.field') || trimmedLine.startsWith('.method')) {
                                        // Keep field and method declarations as they're useful
                                    } else if (trimmedLine.length < 15) {
                                        // Skip very short smali instructions
                                        continue;
                                    }
                                }
                                
                                // Format for better readability
                                if (trimmedLine.length > 0 && trimmedLine.length < 500) {
                                    // Avoid exact duplicates
                                    const contentPreview = trimmedLine.substring(0, 200);
                                    const isDuplicate = instances.some(inst => 
                                        inst.content === contentPreview || 
                                        (inst.content.length > 50 && contentPreview.includes(inst.content.substring(0, 50)))
                                    );
                                    
                                    if (!isDuplicate) {
                                        instances.push({
                                            lineNumber: fileLineNumber || (i + 1),
                                            file: currentFile || null,
                                            content: contentPreview + (trimmedLine.length > 200 ? '...' : ''),
                                            pattern: pattern,
                                            isSmali: isSmaliContent,
                                            isSource: isSourceFile
                                        });
                                    }
                                    break; // One instance per line
                                }
                            }
                        }
                    }
                }
                
                return { ...check, detected: matchedPatterns.length > 0, matchedPatterns, instances };
            });
        }

        function renderFilteredResults() {
            let filteredRoot = currentRootResults, filteredEmulator = currentEmulatorResults, 
                filteredSSL = currentSSLResults, filteredFlag = currentFlagResults,
                filteredStorage = currentStorageResults, filteredCrypto = currentCryptoResults,
                filteredLogging = currentLoggingResults;

            if (currentFilter === 'detected') {
                filteredRoot = currentRootResults.filter(r => r.detected);
                filteredEmulator = currentEmulatorResults.filter(r => r.detected);
                filteredSSL = currentSSLResults.filter(r => r.detected);
                filteredFlag = currentFlagResults.filter(r => r.detected);
                filteredStorage = currentStorageResults.filter(r => r.detected);
                filteredCrypto = currentCryptoResults.filter(r => r.detected);
                filteredLogging = currentLoggingResults.filter(r => r.detected);
            } else if (currentFilter === 'not-detected') {
                filteredRoot = currentRootResults.filter(r => !r.detected);
                filteredEmulator = currentEmulatorResults.filter(r => !r.detected);
                filteredSSL = currentSSLResults.filter(r => !r.detected);
                filteredFlag = currentFlagResults.filter(r => !r.detected);
                filteredStorage = currentStorageResults.filter(r => !r.detected);
                filteredCrypto = currentCryptoResults.filter(r => !r.detected);
                filteredLogging = currentLoggingResults.filter(r => !r.detected);
            }

            if (currentFlagCategoryFilter !== 'all') {
                filteredFlag = filteredFlag.filter(r => r.category === currentFlagCategoryFilter);
            }
            if (currentStorageCategoryFilter !== 'all') {
                filteredStorage = filteredStorage.filter(r => r.category === currentStorageCategoryFilter);
            }
            if (currentCryptoCategoryFilter !== 'all') {
                filteredCrypto = filteredCrypto.filter(r => r.category === currentCryptoCategoryFilter);
            }
            if (currentLoggingCategoryFilter !== 'all') {
                filteredLogging = filteredLogging.filter(r => r.category === currentLoggingCategoryFilter);
            }

            renderSection('rootResults', filteredRoot);
            renderSection('emulatorResults', filteredEmulator);
            renderSection('sslResults', filteredSSL);
            renderSection('flagResults', filteredFlag);
            renderSection('storageResults', filteredStorage);
            renderSection('cryptoResults', filteredCrypto);
            renderSection('loggingResults', filteredLogging);
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
            const cardId = `card-${Math.random().toString(36).substr(2, 9)}`;
            
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
                            <button onclick="copyToClipboard('${escapeHtml(inst.content.replace(/'/g, "\\'"))}')" class="copy-btn p-1 hover:bg-white/10 rounded flex-shrink-0">
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

        function setFilter(filter) {
            currentFilter = filter;
            ['filterAll', 'filterDetected', 'filterNotDetected'].forEach(id => {
                document.getElementById(id).classList.remove('active');
            });
            document.getElementById(filter === 'all' ? 'filterAll' : filter === 'detected' ? 'filterDetected' : 'filterNotDetected').classList.add('active');
            renderFilteredResults();
        }

        function setFlagCategoryFilter(category) {
            currentFlagCategoryFilter = category;
            document.querySelectorAll('[id^="flagCat"]').forEach(btn => btn.classList.remove('active'));
            document.getElementById(`flagCat${category === 'all' ? 'All' : category.replace(/\s+/g, '')}`).classList.add('active');
            renderFilteredResults();
        }

        function setStorageCategoryFilter(category) {
            currentStorageCategoryFilter = category;
            document.querySelectorAll('[id^="storageCat"]').forEach(btn => btn.classList.remove('active'));
            const id = category === 'all' ? 'storageCatAll' : 
                       category === 'SharedPreferences' ? 'storageCatPrefs' :
                       category === 'SQLite' ? 'storageCatSqlite' :
                       category === 'File Storage' ? 'storageCatFiles' : 'storageCatSecrets';
            document.getElementById(id).classList.add('active');
            renderFilteredResults();
        }

        function setCryptoCategoryFilter(category) {
            currentCryptoCategoryFilter = category;
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
            currentLoggingCategoryFilter = category;
            document.querySelectorAll('[id^="loggingCat"]').forEach(btn => btn.classList.remove('active'));
            const categoryToId = {
                'all': 'loggingCatAll',
                'Credentials & Secrets': 'loggingCatSecrets',
                'PII': 'loggingCatPII'
            };
            document.getElementById(categoryToId[category]).classList.add('active');
            renderFilteredResults();
        }


        // Endpoint functions
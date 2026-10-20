        async function analyzePermissionsFromManifest() {
            if (!decompiledSourceData.isLoaded || !decompiledSourceData.files) {
                console.log('No JADX folder loaded for permission analysis');
                return;
            }
            
            // Find and read AndroidManifest.xml
            const manifestXml = await findAndReadManifest(decompiledSourceData.files);
            if (!manifestXml) {
                console.log('AndroidManifest.xml not found in JADX folder');
                return;
            }
            
            // Parse manifest permissions
            const manifestData = parseManifestPermissions(manifestXml);
            if (!manifestData.packageName) {
                console.log('Could not parse package name from manifest');
                return;
            }
            
            // Parse the manifest DOM for components
            const parser = new DOMParser();
            const doc = parser.parseFromString(manifestXml, 'text/xml');
            
            analyzedPermComponents = [];
            
            // Helper to get android: attribute
            const getAttr = (node, name) => {
                return node.getAttribute(`android:${name}`) || 
                       node.getAttributeNS('http://schemas.android.com/apk/res/android', name);
            };
            
            // Helper to normalize component name
            const normalizeName = (name) => {
                if (!name) return name;
                return name.startsWith('.') ? manifestData.packageName + name : name;
            };
            
            // Helper to check if component is exported
            const isExported = (node) => {
                const exported = getAttr(node, 'exported');
                const hasIntentFilter = node.querySelector('intent-filter') !== null;
                if (exported === null || exported === '') return hasIntentFilter;
                return exported === 'true';
            };
            
            // Collect activities
            doc.querySelectorAll('activity').forEach(node => {
                if (!isExported(node)) return;
                const name = normalizeName(getAttr(node, 'name'));
                const perm = getAttr(node, 'permission') || manifestData.appPermission;
                const resolved = resolvePermissionWithRisk(perm, manifestData.customPermissions);
                analyzedPermComponents.push({ type: 'activity', name, ...resolved });
            });
            
            // Collect services
            doc.querySelectorAll('service').forEach(node => {
                if (!isExported(node)) return;
                const name = normalizeName(getAttr(node, 'name'));
                const perm = getAttr(node, 'permission') || manifestData.appPermission;
                const resolved = resolvePermissionWithRisk(perm, manifestData.customPermissions);
                analyzedPermComponents.push({ type: 'service', name, ...resolved });
            });
            
            // Collect receivers
            doc.querySelectorAll('receiver').forEach(node => {
                if (!isExported(node)) return;
                const name = normalizeName(getAttr(node, 'name'));
                const perm = getAttr(node, 'permission') || manifestData.appPermission;
                const resolved = resolvePermissionWithRisk(perm, manifestData.customPermissions);
                analyzedPermComponents.push({ type: 'receiver', name, ...resolved });
            });
            
            // Collect providers
            doc.querySelectorAll('provider').forEach(node => {
                if (getAttr(node, 'exported') !== 'true') return;
                const name = normalizeName(getAttr(node, 'name'));
                const perm = getAttr(node, 'readPermission') || getAttr(node, 'writePermission') || manifestData.appPermission;
                const resolved = resolvePermissionWithRisk(perm, manifestData.customPermissions);
                analyzedPermComponents.push({ type: 'provider', name, ...resolved });
            });
            
            console.log('Permission analysis complete:', analyzedPermComponents.length, 'exported components found');
            displayPermissionAnalysis();
        }
        
        // Display permission analysis results
        function displayPermissionAnalysis() {
            const section = document.getElementById('permissionSection');
            if (analyzedPermComponents.length === 0) {
                section.classList.add('hidden');
                return;
            }
            
            section.classList.remove('hidden');
            
            // Update counts
            const activities = analyzedPermComponents.filter(c => c.type === 'activity');
            const services = analyzedPermComponents.filter(c => c.type === 'service');
            const receivers = analyzedPermComponents.filter(c => c.type === 'receiver');
            const providers = analyzedPermComponents.filter(c => c.type === 'provider');
            
            document.getElementById('activityCount').textContent = activities.length;
            document.getElementById('serviceCount').textContent = services.length;
            document.getElementById('receiverCount').textContent = receivers.length;
            document.getElementById('providerCount').textContent = providers.length;
            
            // Update risk counts
            const highRisk = analyzedPermComponents.filter(c => c.risk === 'HIGH').length;
            const mediumRisk = analyzedPermComponents.filter(c => c.risk === 'MEDIUM').length;
            const lowRisk = analyzedPermComponents.filter(c => c.risk === 'LOW').length;
            
            document.getElementById('highRiskCount').textContent = `${highRisk} High Risk`;
            document.getElementById('mediumRiskCount').textContent = `${mediumRisk} Medium Risk`;
            document.getElementById('lowRiskCount').textContent = `${lowRisk} Low Risk`;
            
            renderPermissionComponents();
        }
        
        // Render permission components with filter
        function renderPermissionComponents() {
            const container = document.getElementById('componentsResults');
            const noMessage = document.getElementById('noComponentsMessage');
            
            let filtered = analyzedPermComponents;
            if (currentComponentFilter !== 'all') {
                filtered = analyzedPermComponents.filter(c => c.type === currentComponentFilter);
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
        
        // Set component filter
        function setComponentFilter(filter) {
            currentComponentFilter = filter;
            document.querySelectorAll('[id^="compFilter"]').forEach(btn => btn.classList.remove('active'));
            const btnId = 'compFilter' + filter.charAt(0).toUpperCase() + filter.slice(1);
            const btn = document.getElementById(btnId);
            if (btn) btn.classList.add('active');
            renderPermissionComponents();
        }

        // Include all the check patterns from the original file (abbreviated for space)
        const rootChecks = [
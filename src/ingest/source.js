// ingest/source.js — generated from src-legacy/code.js (do not hand-edit; edit tools/build.mjs)
import { logScan, logStage, clearScanLog } from '../ui/scanlog.js';
import { beginRun, endRun } from '../core/checkpoint.js';
import { saveCurrentScan, refreshResumeOffer } from '../ui/history.js';
import { analyzePatternsAsync, extractEndpointsAsync, resumableCategory } from '../core/patterns-async.js';
import { state } from '../core/state.js';
import { analyzePermissionsFromManifest, findAndReadManifest } from '../core/manifest.js';
import { authTrustChecks, authenticationChecks, authorizationChecks, businessLogicChecks, commandInjectionChecks, cryptoTrustChecks, cryptographyChecks, deserializationVulnerabilityChecks, emulatorChecks, envLeakageChecks, errorHandlingChecks, featureFlagsChecks, fileHandlingChecks, flagChecks, hiddenEndpointsChecks, inputValidationChecks, insecureLoggingChecks, localStorageChecks, manifestPostureChecks, massAssignmentChecks, nosqlInjectionChecks, rootChecks, sqlInjectionChecks, sslPinningChecks, ssrfVulnerabilityChecks, xxeVulnerabilityChecks } from '../engine/checks.js';
import { displayAllResults, resetGlobalAnalyzer } from '../ui/shell.js';

async function handleDecompiledFolderSelected(files) {
            console.log('handleDecompiledFolderSelected called with', files.length, 'files');
            
            const fileArray = Array.from(files);
            console.log('Files received:', fileArray.map(f => f.webkitRelativePath || f.name).slice(0, 10));
            
            const javaKotlinFiles = fileArray.filter(f => {
                const path = f.webkitRelativePath || f.name;
                return path.endsWith('.java') || path.endsWith('.kt');
            });
            
            console.log('Java/Kotlin files found:', javaKotlinFiles.length);
            
            if (javaKotlinFiles.length === 0) {
                alert('No Java/Kotlin files found in the selected folder. Please select a JADX decompiled output folder.\n\nMake sure to run: jadx -d output/ app.apk');
                return;
            }

            // Store ALL files (including AndroidManifest.xml) for permission analysis
            state.decompiledSourceData.files = fileArray;
            state.decompiledSourceData.fileCount = javaKotlinFiles.length;
            state.decompiledSourceData.isLoaded = true;

            // Show loading indicator
            const statusEl = document.getElementById('decompiledStatus');
            const folderNameEl = document.getElementById('decompiledFolderName');
            statusEl.classList.remove('hidden');
            folderNameEl.textContent = 'Loading source files...';

            // Read all source files
            let allContent = '';
            let processed = 0;
            for (const file of javaKotlinFiles) {
                try {
                    const text = await file.text();
                    allContent += `\n// FILE: ${file.webkitRelativePath || file.name}\n${text}\n`;
                    processed++;
                    if (processed % 100 === 0) {
                        folderNameEl.textContent = `Loading... ${processed}/${javaKotlinFiles.length} files`;
                    }
                } catch (e) {
                    console.error('Error reading file:', file.name, e);
                }
            }
            state.decompiledSourceData.content = allContent;

            const folderName = fileArray[0]?.webkitRelativePath?.split('/')[0] || 'Decompiled Source';
            folderNameEl.textContent = `${folderName} (${javaKotlinFiles.length} files)`;
            
            // Show the start analysis button - JADX folder is sufficient on its own
            document.getElementById('startAnalysisSection').classList.remove('hidden');
            updateAnalysisHint();
            
            console.log('Decompiled source loaded successfully:', javaKotlinFiles.length, 'files,', allContent.length, 'characters');
        }

async function handleDroppedDecompiledItems(items) {
            const files = [];
            for (const item of Array.from(items)) {
                if (item.kind === 'file') {
                    const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
                    if (entry && entry.isDirectory) {
                        await readDirectoryRecursiveForSource(entry, files);
                    } else {
                        const file = item.getAsFile();
                        if (file) files.push(file);
                    }
                }
            }
            if (files.length > 0) handleDecompiledFolderSelected(files);
        }

async function readDirectoryRecursiveForSource(dirEntry, files) {
            const reader = dirEntry.createReader();
            const all = [];
            while (true) {
                const batch = await new Promise((res, rej) => reader.readEntries(res, rej));
                if (batch.length === 0) break;
                all.push(...batch);
            }
            for (const entry of all) {
                if (entry.isFile) {
                    const f = await new Promise(res => entry.file(res));
                    f.relativePath = entry.fullPath;
                    files.push(f);
                } else if (entry.isDirectory) {
                    await readDirectoryRecursiveForSource(entry, files);
                }
            }
        }

function updateAnalysisHint() {
            const hintText = document.getElementById('hintText');
            if (state.globalAPKData.file && state.decompiledSourceData.isLoaded) {
                hintText.innerHTML = '✅ APK + JADX source loaded. <span class="text-emerald-400">Best accuracy!</span>';
            } else if (state.globalAPKData.file) {
                hintText.innerHTML = 'APK loaded. <span class="text-gray-400">DEX auto-disassembly + manifest included. Add JADX folder for best accuracy.</span>';
            } else if (state.decompiledSourceData.isLoaded) {
                hintText.innerHTML = '✅ JADX source loaded. <span class="text-gray-400">Add APK for endpoint extraction.</span>';
            }
        }

async function analyzeDecompiledSourceOnly() {
            const globalUploadSection = document.getElementById('globalUploadSection');
            const globalLoadingSection = document.getElementById('globalLoadingSection');
            const globalFileInfo = document.getElementById('globalFileInfo');
            const progressBar = document.getElementById('globalProgressBar');
            const loadingStatus = document.getElementById('globalLoadingStatus');

            globalUploadSection.classList.add('hidden');
            globalLoadingSection.classList.remove('hidden');
                clearScanLog();
            document.getElementById('globalLoadingTitle').textContent = 'Analyzing Source Code...';

            try {
                state.analyzedPermComponents = [];
                state.customPermissions = {};
                state.appPermission = null;
                state.extractedEndpoints = [];
                loadingStatus.textContent = 'Analyzing security patterns...';
                logStage('Analyzing security patterns...');
                progressBar.style.width = '20%';

                let jadxManifestText = '';
                try { const jm = await findAndReadManifest(state.decompiledSourceData.files); if (jm) jadxManifestText = '\n\n// === ANDROIDMANIFEST.XML ===\n\n' + jm; } catch (e) {}
                const analysisContent = state.decompiledSourceData.content + jadxManifestText;
                console.log('Analyzing decompiled source:', analysisContent.length, 'characters');

                // Analyze all categories using decompiled source (true = source code mode)
                state.currentRootResults = await resumableCategory('currentRootResults', analysisContent, rootChecks, true);;
                console.log('Root results:', state.currentRootResults.filter(r => r.detected).length, 'detected');
                
                state.currentEmulatorResults = await resumableCategory('currentEmulatorResults', analysisContent, emulatorChecks, true);;
                state.currentSSLResults = await resumableCategory('currentSSLResults', analysisContent, sslPinningChecks, true);;
                state.currentFlagResults = await resumableCategory('currentFlagResults', analysisContent, flagChecks, true);;
                state.currentStorageResults = await resumableCategory('currentStorageResults', analysisContent, localStorageChecks, true);;
                state.currentCryptoResults = await resumableCategory('currentCryptoResults', analysisContent, cryptographyChecks, true);;
                state.currentLoggingResults = await resumableCategory('currentLoggingResults', analysisContent, insecureLoggingChecks, true);;
                state.currentAuthResults = await resumableCategory('currentAuthResults', analysisContent, authenticationChecks, true);;
                state.currentAuthzResults = await resumableCategory('currentAuthzResults', analysisContent, authorizationChecks, true);;
                
                // Backend Risk Indicators
                state.currentFeatureFlagsResults = await resumableCategory('currentFeatureFlagsResults', analysisContent, featureFlagsChecks, true);;
                state.currentHiddenEndpointsResults = await resumableCategory('currentHiddenEndpointsResults', analysisContent, hiddenEndpointsChecks, true);;
                state.currentAuthTrustResults = await resumableCategory('currentAuthTrustResults', analysisContent, authTrustChecks, true);;
                state.currentMassAssignmentResults = await resumableCategory('currentMassAssignmentResults', analysisContent, massAssignmentChecks, true);;
                state.currentInputValidationResults = await resumableCategory('currentInputValidationResults', analysisContent, inputValidationChecks, true);;
                state.currentBusinessLogicResults = await resumableCategory('currentBusinessLogicResults', analysisContent, businessLogicChecks, true);;
                state.currentFileHandlingResults = await resumableCategory('currentFileHandlingResults', analysisContent, fileHandlingChecks, true);;
                state.currentErrorHandlingResults = await resumableCategory('currentErrorHandlingResults', analysisContent, errorHandlingChecks, true);;
                state.currentEnvLeakageResults = await resumableCategory('currentEnvLeakageResults', analysisContent, envLeakageChecks, true);;
                state.currentCryptoTrustResults = await resumableCategory('currentCryptoTrustResults', analysisContent, cryptoTrustChecks, true);;
                
                // Server-Side Vulnerability Analysis
                state.currentSqlInjectionResults = await resumableCategory('currentSqlInjectionResults', analysisContent, sqlInjectionChecks, true);;
                state.currentNosqlInjectionResults = await resumableCategory('currentNosqlInjectionResults', analysisContent, nosqlInjectionChecks, true);;
                state.currentSsrfResults = await resumableCategory('currentSsrfResults', analysisContent, ssrfVulnerabilityChecks, true);;
                state.currentXxeResults = await resumableCategory('currentXxeResults', analysisContent, xxeVulnerabilityChecks, true);;
                state.currentDeserializationResults = await resumableCategory('currentDeserializationResults', analysisContent, deserializationVulnerabilityChecks, true);;
                state.currentCommandInjectionResults = await resumableCategory('currentCommandInjectionResults', analysisContent, commandInjectionChecks, true);;
                state.currentManifestPostureResults = await resumableCategory('currentManifestPostureResults', analysisContent, manifestPostureChecks, true);;
                
                console.log('Auth results:', state.currentAuthResults.filter(r => r.detected).length, 'detected');
                console.log('Total instances in auth:', state.currentAuthResults.reduce((sum, r) => sum + (r.instances?.length || 0), 0));

                progressBar.style.width = '70%';
                loadingStatus.textContent = 'Extracting endpoints...';
                logStage('Extracting endpoints...');
                state.extractedEndpoints = await extractEndpointsAsync(analysisContent);

                progressBar.style.width = '85%';
                loadingStatus.textContent = 'Analyzing permissions...';
                logStage('Analyzing permissions...');
                await analyzePermissionsFromManifest();

                progressBar.style.width = '100%';
                loadingStatus.textContent = 'Analysis complete!';
                logStage('Analysis complete!');
                await new Promise(r => setTimeout(r, 500));

                globalLoadingSection.classList.add('hidden');
                globalFileInfo.classList.remove('hidden');
                
                // Show folder name instead of APK name
                const folderName = state.decompiledSourceData.files[0]?.webkitRelativePath?.split('/')[0] || 'Decompiled Source';
                document.getElementById('globalFileName').textContent = folderName;
                document.getElementById('globalFileSize').textContent = `${state.decompiledSourceData.fileCount} Java/Kotlin files`;

                displayAllResults();
                saveCurrentScan().catch((e) => console.warn('history save failed', e));
                endRun().catch(() => {});
                state.globalAPKData.isLoaded = true;

            } catch (error) {
                console.error('Error:', error);
                alert('Error analyzing source: ' + error.message);
                resetGlobalAnalyzer();
            }
        }

export { handleDecompiledFolderSelected, handleDroppedDecompiledItems, readDirectoryRecursiveForSource, updateAnalysisHint, analyzeDecompiledSourceOnly };

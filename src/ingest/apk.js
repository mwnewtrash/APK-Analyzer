// ingest/apk.js — generated from src-legacy/code.js (do not hand-edit; edit tools/build.mjs)
import { logScan, logStage, clearScanLog } from '../ui/scanlog.js';
import { beginRun, endRun } from '../core/checkpoint.js';
import { saveCurrentScan, refreshResumeOffer } from '../ui/history.js';
import { analyzePatternsAsync, extractEndpointsAsync, resumableCategory } from '../core/patterns-async.js';
import { state } from '../core/state.js';
import { updateAnalysisHint } from './source.js';
import { authTrustChecks, authenticationChecks, authorizationChecks, businessLogicChecks, commandInjectionChecks, cryptoTrustChecks, cryptographyChecks, deserializationVulnerabilityChecks, emulatorChecks, envLeakageChecks, errorHandlingChecks, featureFlagsChecks, fileHandlingChecks, flagChecks, hiddenEndpointsChecks, inputValidationChecks, insecureLoggingChecks, localStorageChecks, manifestPostureChecks, massAssignmentChecks, nosqlInjectionChecks, rootChecks, sqlInjectionChecks, sslPinningChecks, ssrfVulnerabilityChecks, xxeVulnerabilityChecks } from '../engine/checks.js';
import { analyzePermissionsFromManifest } from '../core/manifest.js';
import { formatFileSize } from '../core/utils.js';
import { displayAllResults, resetGlobalAnalyzer } from '../ui/shell.js';

function handleAPKSelected(file) {
            state.globalAPKData.file = file;
            document.getElementById('apkStatus').classList.remove('hidden');
            document.getElementById('apkFileName').textContent = file.name;
            document.getElementById('startAnalysisSection').classList.remove('hidden');
            updateAnalysisHint();
            refreshResumeOffer(file).catch(() => {});
        }

async function analyzeAPKGlobal(file) {
            const globalUploadSection = document.getElementById('globalUploadSection');
            const globalLoadingSection = document.getElementById('globalLoadingSection');
            const globalFileInfo = document.getElementById('globalFileInfo');
            const progressBar = document.getElementById('globalProgressBar');
            const loadingStatus = document.getElementById('globalLoadingStatus');

            globalUploadSection.classList.add('hidden');
            globalLoadingSection.classList.remove('hidden');
                clearScanLog();

            try {
                state.analyzedPermComponents = [];
                state.customPermissions = {};
                state.appPermission = null;
                state.extractedEndpoints = [];
                state.globalAPKData.manifestXml = null;
                state.globalAPKData.file = file;
                beginRun(file).catch(() => {});
                loadingStatus.textContent = 'Reading APK file...';
                logStage('Reading APK file...');
                progressBar.style.width = '5%';

                const zip = new JSZip();
                let contents = await zip.loadAsync(file);
                // #21: split-APK bundles (.apks/.xapk) — descend into the largest inner APK
                if (!contents.file('AndroidManifest.xml')) {
                    const innerNames = Object.keys(contents.files).filter(n => /\.apk$/i.test(n) && !contents.files[n].dir);
                    if (innerNames.length > 0) {
                        innerNames.sort((a, b) => ((contents.files[b]._data?.uncompressedSize || 0) - (contents.files[a]._data?.uncompressedSize || 0)));
                        loadingStatus.textContent = 'Split-APK bundle detected — opening ' + innerNames[0] + '...';
                        contents = await new JSZip().loadAsync(await contents.file(innerNames[0]).async('uint8array'));
                    }
                }
                loadingStatus.textContent = 'Extracting contents...';
                logStage('Extracting contents...');
                progressBar.style.width = '15%';

                const contentParts = [];
                // auto-manifest: binary AndroidManifest.xml -> XML text (no JADX needed)
                try {
                    const mfEntry = contents.file('AndroidManifest.xml');
                    if (mfEntry) {
                        const { parseAxml } = await import('../core/axml.js');
                        state.globalAPKData.manifestXml = parseAxml(await mfEntry.async('uint8array'));
                    }
                } catch (e) { console.warn('auto manifest parse failed', e); }
                let totalBytes = 0;
                const files = [];
                contents.forEach((path, entry) => { if (!entry.dir) files.push({ path, entry }); });

                for (let i = 0; i < files.length; i++) {
                    if (/\.dex$/i.test(files[i].path) || files[i].path === 'AndroidManifest.xml') continue;
                    const entry = files[i].entry;
                    const declaredSize = entry._data?.uncompressedSize || 0;
                    // #17: per-entry 50MB cap (zip-bomb guard)
                    if (declaredSize > 50 * 1024 * 1024) {
                        console.warn('Skipping oversized entry:', files[i].path);
                        continue;
                    }
                    try {
                        contentParts.push(await entry.async('string') + '\n');
                        totalBytes += declaredSize;
                    } catch {
                        try {
                            const binary = await entry.async('uint8array');
                            if (binary.length > 50 * 1024 * 1024) {
                                console.warn('Skipping oversized entry:', files[i].path);
                                continue;
                            }
                            contentParts.push(new TextDecoder('utf-8', { fatal: false }).decode(binary) + '\n');
                            totalBytes += binary.length;
                        } catch {}
                    }
                    // #17: 500MB total cap (zip-bomb guard)
                    if (totalBytes > 500 * 1024 * 1024) {
                        console.warn('Total uncompressed size exceeded 500MB — stopping extraction early.');
                        break;
                    }
                    if (i % 50 === 0) progressBar.style.width = `${15 + (i / files.length) * 40}%`;
                    if (i % 500 === 0 && i > 0) logScan(`extracted ${i}/${files.length} entries (${(totalBytes / 1048576).toFixed(0)} MB uncompressed)…`);
                }
                // #22: single join instead of repeated string concat
                const allContent = contentParts.join('');
                // auto-dex: DEX -> smali in-browser (no manual JADX folder needed)
                let smaliContent = '';
                try {
                    const dexFiles = files.filter(f => /\.dex$/i.test(f.path));
                    if (dexFiles.length > 0) {
                        loadingStatus.textContent = 'Disassembling DEX (automatic, no JADX needed)...';
                        const { disassembleDexAsync } = await import('../core/patterns-async.js');
                        const smaliParts = [];
                        for (const d of dexFiles.slice(0, 10)) {
                            smaliParts.push(await disassembleDexAsync(await d.entry.async('uint8array'), d.path));
                        }
                        smaliContent = smaliParts.join('\n');
                    }
                } catch (e) { console.warn('auto dex disassembly failed', e); }

                state.globalAPKData.content = allContent;
                loadingStatus.textContent = 'Analyzing security patterns...';
                logStage('Analyzing security patterns...');
                progressBar.style.width = '60%';

                // Combine both APK and JADX content for comprehensive analysis
                let analysisContent = smaliContent ? smaliContent + '\n\n// === APK BYTECODE CONTENT ===\n\n' + allContent : allContent;
                if (state.globalAPKData.manifestXml) analysisContent += '\n\n// === ANDROIDMANIFEST.XML ===\n\n' + state.globalAPKData.manifestXml;
                let usingDecompiledSource = false;
                
                if (state.decompiledSourceData.isLoaded && state.decompiledSourceData.content) {
                    // Prepend JADX content so it's analyzed first (better quality)
                    analysisContent = state.decompiledSourceData.content + '\n\n// === APK BYTECODE CONTENT ===\n\n' + allContent;
                    usingDecompiledSource = true;
                }

                // Analyze all categories - will find instances from both sources
                state.currentRootResults = await resumableCategory('currentRootResults', analysisContent, rootChecks, usingDecompiledSource);;
                state.currentEmulatorResults = await resumableCategory('currentEmulatorResults', analysisContent, emulatorChecks, usingDecompiledSource);;
                state.currentSSLResults = await resumableCategory('currentSSLResults', analysisContent, sslPinningChecks, usingDecompiledSource);;
                state.currentFlagResults = await resumableCategory('currentFlagResults', analysisContent, flagChecks, usingDecompiledSource);;
                state.currentStorageResults = await resumableCategory('currentStorageResults', analysisContent, localStorageChecks, usingDecompiledSource);;
                state.currentCryptoResults = await resumableCategory('currentCryptoResults', analysisContent, cryptographyChecks, usingDecompiledSource);;
                state.currentLoggingResults = await resumableCategory('currentLoggingResults', analysisContent, insecureLoggingChecks, usingDecompiledSource);;
                state.currentAuthResults = await resumableCategory('currentAuthResults', analysisContent, authenticationChecks, usingDecompiledSource);;
                state.currentAuthzResults = await resumableCategory('currentAuthzResults', analysisContent, authorizationChecks, usingDecompiledSource);;
                
                // Backend Risk Indicators
                state.currentFeatureFlagsResults = await resumableCategory('currentFeatureFlagsResults', analysisContent, featureFlagsChecks, usingDecompiledSource);;
                state.currentHiddenEndpointsResults = await resumableCategory('currentHiddenEndpointsResults', analysisContent, hiddenEndpointsChecks, usingDecompiledSource);;
                state.currentAuthTrustResults = await resumableCategory('currentAuthTrustResults', analysisContent, authTrustChecks, usingDecompiledSource);;
                state.currentMassAssignmentResults = await resumableCategory('currentMassAssignmentResults', analysisContent, massAssignmentChecks, usingDecompiledSource);;
                state.currentInputValidationResults = await resumableCategory('currentInputValidationResults', analysisContent, inputValidationChecks, usingDecompiledSource);;
                state.currentBusinessLogicResults = await resumableCategory('currentBusinessLogicResults', analysisContent, businessLogicChecks, usingDecompiledSource);;
                state.currentFileHandlingResults = await resumableCategory('currentFileHandlingResults', analysisContent, fileHandlingChecks, usingDecompiledSource);;
                state.currentErrorHandlingResults = await resumableCategory('currentErrorHandlingResults', analysisContent, errorHandlingChecks, usingDecompiledSource);;
                state.currentEnvLeakageResults = await resumableCategory('currentEnvLeakageResults', analysisContent, envLeakageChecks, usingDecompiledSource);;
                state.currentCryptoTrustResults = await resumableCategory('currentCryptoTrustResults', analysisContent, cryptoTrustChecks, usingDecompiledSource);;
                
                // Server-Side Vulnerability Analysis
                state.currentSqlInjectionResults = await resumableCategory('currentSqlInjectionResults', analysisContent, sqlInjectionChecks, usingDecompiledSource);;
                state.currentNosqlInjectionResults = await resumableCategory('currentNosqlInjectionResults', analysisContent, nosqlInjectionChecks, usingDecompiledSource);;
                state.currentSsrfResults = await resumableCategory('currentSsrfResults', analysisContent, ssrfVulnerabilityChecks, usingDecompiledSource);;
                state.currentXxeResults = await resumableCategory('currentXxeResults', analysisContent, xxeVulnerabilityChecks, usingDecompiledSource);;
                state.currentDeserializationResults = await resumableCategory('currentDeserializationResults', analysisContent, deserializationVulnerabilityChecks, usingDecompiledSource);;
                state.currentCommandInjectionResults = await resumableCategory('currentCommandInjectionResults', analysisContent, commandInjectionChecks, usingDecompiledSource);;
                state.currentManifestPostureResults = await resumableCategory('currentManifestPostureResults', analysisContent, manifestPostureChecks, usingDecompiledSource);;

                loadingStatus.textContent = 'Extracting endpoints...';
                logStage('Extracting endpoints...');
                progressBar.style.width = '80%';
                state.extractedEndpoints = await extractEndpointsAsync(smaliContent ? smaliContent + '\n' + allContent : allContent);

                progressBar.style.width = '90%';
                loadingStatus.textContent = 'Analyzing permissions...';
                logStage('Analyzing permissions...');
                await analyzePermissionsFromManifest();

                progressBar.style.width = '100%';
                loadingStatus.textContent = 'Analysis complete!';
                logStage('Analysis complete!');
                await new Promise(r => setTimeout(r, 500));

                globalLoadingSection.classList.add('hidden');
                globalFileInfo.classList.remove('hidden');
                document.getElementById('globalFileName').textContent = file.name;
                document.getElementById('globalFileSize').textContent = formatFileSize(file.size);

                displayAllResults();
                saveCurrentScan().catch((e) => console.warn('history save failed', e));
                endRun().catch(() => {});
                state.globalAPKData.isLoaded = true;

            } catch (error) {
                console.error('Error:', error);
                alert('Error analyzing APK: ' + error.message);
                resetGlobalAnalyzer();
            }
        }

export { handleAPKSelected, analyzeAPKGlobal };

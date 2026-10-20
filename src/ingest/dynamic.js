// ingest/dynamic.js — generated from src-legacy/code.js (do not hand-edit; edit tools/build.mjs)
import { logScan, logStage, clearScanLog } from '../ui/scanlog.js';
import { state } from '../core/state.js';
import { displayDynamicResults } from '../ui/dynamic.js';
import { maskValue, sensitivePatterns } from '../core/utils.js';

async function handleDroppedItems(items) {
            const files = [];
            for (const item of items) {
                if (item.kind === 'file') {
                    const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
                    if (entry && entry.isDirectory) {
                        await readDirectoryRecursive(entry, files);
                    } else {
                        files.push(item.getAsFile());
                    }
                }
            }
            if (files.length > 0) analyzeDynamicFolder(files);
        }

async function readDirectoryRecursive(dirEntry, files) {
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
                    await readDirectoryRecursive(entry, files);
                }
            }
        }

async function analyzeDynamicFolder(files) {
            const fileArray = Array.from(files);
            const uploadSection = document.getElementById('dynamicUploadSection');
            const loadingSection = document.getElementById('dynamicLoadingSection');
            const fileInfo = document.getElementById('dynamicFileInfo');
            const progressBar = document.getElementById('dynamicProgressBar');
            const loadingStatus = document.getElementById('dynamicLoadingStatus');
            
            uploadSection.classList.add('hidden');
            loadingSection.classList.remove('hidden');
            clearScanLog();
            document.getElementById('dynamicHeader').classList.remove('hidden');
            
            state.dynamicAnalysisData = {
                files: fileArray,
                sharedPrefs: [],
                databases: [],
                otherFiles: [],
                issues: []
            };
            
            loadingStatus.textContent = 'Scanning files...';
            logStage('Scanning files...');
            progressBar.style.width = '10%';
            
            // Categorize files
            for (const file of fileArray) {
                const path = file.webkitRelativePath || file.relativePath || file.name;
                const lowerPath = path.toLowerCase();
                
                if (lowerPath.includes('shared_prefs') && lowerPath.endsWith('.xml')) {
                    state.dynamicAnalysisData.sharedPrefs.push({ file, path });
                } else if (lowerPath.endsWith('.db') || lowerPath.endsWith('.sqlite') || lowerPath.endsWith('.sqlite3') || lowerPath.includes('databases/')) {
                    state.dynamicAnalysisData.databases.push({ file, path });
                } else {
                    state.dynamicAnalysisData.otherFiles.push({ file, path });
                }
            }
            
            progressBar.style.width = '30%';
            loadingStatus.textContent = 'Analyzing SharedPreferences...';
            logStage('Analyzing SharedPreferences...');
            await analyzeSharedPreferences();
            
            progressBar.style.width = '60%';
            loadingStatus.textContent = 'Analyzing SQLite databases...';
            logStage('Analyzing SQLite databases...');
            await analyzeSQLiteDatabases();
            
            progressBar.style.width = '80%';
            loadingStatus.textContent = 'Analyzing files and cache...';
            logStage('Analyzing files and cache...');
            await analyzeOtherFiles();
            
            progressBar.style.width = '100%';
            loadingStatus.textContent = 'Analysis complete!';
            logStage('Analysis complete!');
            
            await new Promise(r => setTimeout(r, 500));
            
            loadingSection.classList.add('hidden');
            fileInfo.classList.remove('hidden');
            
            // Get folder name
            const firstPath = fileArray[0]?.webkitRelativePath || fileArray[0]?.relativePath || '';
            const folderName = firstPath.split('/')[0] || 'Uploaded Folder';
            document.getElementById('dynamicFolderName').textContent = folderName;
            document.getElementById('dynamicFileCount').textContent = `${fileArray.length} files analyzed`;
            
            displayDynamicResults();
        }

async function analyzeSharedPreferences() {
            for (const { file, path } of state.dynamicAnalysisData.sharedPrefs) {
                try {
                    const content = await file.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(content, 'text/xml');
                    const entries = [];
                    const issues = [];
                    
                    // Parse all preference entries
                    const allElements = doc.querySelectorAll('string, int, boolean, long, float, set');
                    allElements.forEach(el => {
                        const name = el.getAttribute('name') || '';
                        const value = el.textContent || el.getAttribute('value') || '';
                        const type = el.tagName;
                        
                        entries.push({ name, value, type });
                        
                        // Check for sensitive data
                        const nameLower = name.toLowerCase();
                        const valueLower = value.toLowerCase();
                        
                        if (sensitivePatterns.tokens.test(nameLower)) {
                            issues.push({ severity: 'HIGH', type: 'Token Stored', file: path, key: name, value: maskValue(value), description: 'Authentication token stored in plaintext' });
                        }
                        if (sensitivePatterns.passwords.test(nameLower)) {
                            issues.push({ severity: 'HIGH', type: 'Password/Secret Stored', file: path, key: name, value: maskValue(value), description: 'Password or secret stored in plaintext' });
                        }
                        if (sensitivePatterns.pii.test(nameLower)) {
                            issues.push({ severity: 'MEDIUM', type: 'PII Stored', file: path, key: name, value: maskValue(value), description: 'Personally identifiable information stored' });
                        }
                        if (sensitivePatterns.jwt.test(value)) {
                            issues.push({ severity: 'HIGH', type: 'JWT Token Found', file: path, key: name, value: maskValue(value), description: 'JWT token stored in SharedPreferences' });
                        }
                        if (sensitivePatterns.awsKey.test(value)) {
                            issues.push({ severity: 'CRITICAL', type: 'AWS Key Found', file: path, key: name, value: maskValue(value), description: 'AWS access key stored in SharedPreferences' });
                        }
                        if (sensitivePatterns.otp.test(nameLower)) {
                            issues.push({ severity: 'HIGH', type: 'OTP/PIN Stored', file: path, key: name, value: maskValue(value), description: 'OTP or PIN code stored in plaintext' });
                        }
                    });
                    
                    state.dynamicAnalysisData.sharedPrefs.find(sp => sp.path === path).entries = entries;
                    state.dynamicAnalysisData.sharedPrefs.find(sp => sp.path === path).issues = issues;
                    state.dynamicAnalysisData.issues.push(...issues);
                    
                } catch (e) {
                    console.error('Error parsing SharedPrefs:', path, e);
                }
            }
        }

async function analyzeSQLiteDatabases() {
            // #23: real SQLite parsing via sql.js; binary-pattern scan as fallback.
            let SQL = null;
            try {
                const sqlJs = await import('sql.js');
                const wasmMod = await import('sql.js/dist/sql-wasm.wasm?url');
                SQL = await sqlJs.default({ locateFile: () => wasmMod.default });
            } catch (e) {
                console.warn('sql.js unavailable, using binary scan fallback:', e);
            }

            function parseWithSqlJs(SQL, bytes, dbInfo, path) {
                const sensitiveTablePatterns = ['user', 'account', 'credential', 'auth', 'session', 'token', 'password', 'secret', 'payment', 'card', 'key'];
                const sensitiveColumnKeys = ['password', 'passwd', 'token', 'secret', 'api_key', 'session', 'credit_card', 'ssn', 'pin'];
                const q = (name) => `"${String(name).replace(/"/g, '""')}"`;
                let db = null;
                try {
                    db = new SQL.Database(bytes);
                    const res = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
                    dbInfo.tables = res.length ? res[0].values.map(r => String(r[0])) : [];
                    dbInfo.tables.forEach(table => {
                        const tableLower = table.toLowerCase();
                        sensitiveTablePatterns.forEach(pattern => {
                            if (tableLower.includes(pattern)) {
                                dbInfo.issues.push({ severity: 'MEDIUM', type: 'Sensitive Table', file: path, table, description: `Table "${table}" may contain sensitive data` });
                            }
                        });
                    });
                    const colSeen = new Set();
                    dbInfo.tables.slice(0, 50).forEach(table => {
                        try {
                            const cols = db.exec(`PRAGMA table_info(${q(table)})`);
                            (cols.length ? cols[0].values : []).forEach(row => {
                                const col = String(row[1] || '').toLowerCase();
                                sensitiveColumnKeys.forEach(k => { if (col.includes(k)) colSeen.add(k); });
                            });
                        } catch {}
                    });
                    dbInfo.sensitiveData = [...colSeen];
                    if (dbInfo.sensitiveData.length > 0) {
                        dbInfo.issues.push({ severity: 'HIGH', type: 'Sensitive Columns', file: path, description: `Sensitive columns found: ${dbInfo.sensitiveData.join(', ')}` });
                    }
                    const secretHits = new Set();
                    dbInfo.tables.slice(0, 20).forEach(table => {
                        try {
                            const rows = db.exec(`SELECT * FROM ${q(table)} LIMIT 20`);
                            if (!rows.length) return;
                            rows[0].values.forEach(vals => {
                                vals.forEach(v => {
                                    if (typeof v !== 'string' || v.length > 2000) return;
                                    if (sensitivePatterns.jwt.test(v)) secretHits.add('JWT');
                                    if (sensitivePatterns.awsKey.test(v)) secretHits.add('AWS key');
                                    if (sensitivePatterns.privateKey.test(v)) secretHits.add('private key');
                                    if (sensitivePatterns.googleApi.test(v)) secretHits.add('Google API key');
                                });
                            });
                        } catch {}
                    });
                    secretHits.forEach(kind => {
                        dbInfo.issues.push({ severity: (kind === 'AWS key' || kind === 'private key') ? 'CRITICAL' : 'HIGH', type: `${kind} in Database`, file: path, description: `${kind} material found in unencrypted database rows` });
                    });
                    if (dbInfo.tables.length > 0) {
                        dbInfo.issues.push({ severity: 'MEDIUM', type: 'Unencrypted Database', file: path, description: 'SQLite database is not encrypted' });
                    }
                } finally {
                    if (db) db.close();
                }
            }

            function scanDbBinary(bytes, dbInfo, path) {
                const content = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
                const tableMatches = content.match(/CREATE\s+TABLE\s+[`"']?(\w+)[`"']?/gi) || [];
                dbInfo.tables = tableMatches.map(m => m.replace(/CREATE\s+TABLE\s+[`"']?/i, '').replace(/[`"']/g, ''));
                const sensitiveTablePatterns = ['user', 'account', 'credential', 'auth', 'session', 'token', 'password', 'secret', 'payment', 'card', 'key'];
                dbInfo.tables.forEach(table => {
                    const tableLower = table.toLowerCase();
                    sensitiveTablePatterns.forEach(pattern => {
                        if (tableLower.includes(pattern)) {
                            dbInfo.issues.push({ severity: 'MEDIUM', type: 'Sensitive Table', file: path, table, description: `Table "${table}" may contain sensitive data` });
                        }
                    });
                });
                if (sensitivePatterns.jwt.test(content)) {
                    dbInfo.issues.push({ severity: 'HIGH', type: 'JWT in Database', file: path, description: 'JWT tokens found in unencrypted database' });
                }
                if (sensitivePatterns.awsKey.test(content)) {
                    dbInfo.issues.push({ severity: 'CRITICAL', type: 'AWS Key in Database', file: path, description: 'AWS credentials found in database' });
                }
                if (sensitivePatterns.privateKey.test(content)) {
                    dbInfo.issues.push({ severity: 'CRITICAL', type: 'Private Key in Database', file: path, description: 'Private key found in database' });
                }
                const sensitiveColumns = ['password', 'passwd', 'token', 'secret', 'api_key', 'session', 'credit_card', 'ssn', 'pin'];
                sensitiveColumns.forEach(col => {
                    if (content.toLowerCase().includes(col)) {
                        dbInfo.sensitiveData.push(col);
                    }
                });
                if (dbInfo.sensitiveData.length > 0) {
                    dbInfo.issues.push({ severity: 'HIGH', type: 'Sensitive Columns', file: path, description: `Sensitive columns found: ${dbInfo.sensitiveData.join(', ')}` });
                }
                if (dbInfo.tables.length > 0) {
                    dbInfo.issues.push({ severity: 'MEDIUM', type: 'Unencrypted Database', file: path, description: 'SQLite database is not encrypted' });
                }
            }

            for (const { file, path } of state.dynamicAnalysisData.databases) {
                try {
                    const buffer = await file.arrayBuffer();
                    const bytes = new Uint8Array(buffer);

                    // Check SQLite header
                    const header = new TextDecoder().decode(bytes.slice(0, 16));
                    const isSQLite = header.startsWith('SQLite format 3');
                    const isEncrypted = !isSQLite && bytes.length > 100;

                    const dbInfo = {
                        path,
                        size: file.size,
                        isSQLite,
                        isEncrypted,
                        tables: [],
                        sensitiveData: [],
                        issues: []
                    };

                    if (isEncrypted) {
                        dbInfo.issues.push({ severity: 'INFO', type: 'Encrypted Database', file: path, description: 'Database appears to be encrypted (SQLCipher or similar)' });
                    } else if (isSQLite) {
                        if (SQL) parseWithSqlJs(SQL, bytes, dbInfo, path);
                        else scanDbBinary(bytes, dbInfo, path);
                    }

                    state.dynamicAnalysisData.databases.find(db => db.path === path).info = dbInfo;
                    state.dynamicAnalysisData.issues.push(...dbInfo.issues);

                } catch (e) {
                    console.error('Error analyzing database:', path, e);
                }
            }
        }


async function analyzeOtherFiles() {
            const sensitiveFilePatterns = [
                { pattern: /\.(pem|key|p12|pfx|jks|keystore)$/i, type: 'Key/Certificate File', severity: 'HIGH' },
                { pattern: /\.(json|xml|properties|conf|config|cfg)$/i, type: 'Config File', severity: 'MEDIUM' },
                { pattern: /\.(log|txt|tmp|temp|bak|backup)$/i, type: 'Temp/Log File', severity: 'LOW' },
                { pattern: /credentials|secrets?|keys?|tokens?|auth/i, type: 'Sensitive Named File', severity: 'HIGH' },
                { pattern: /\.(java|kt|smali)$/i, type: 'Source Code File', severity: 'INFO' }
            ];
            
            // Patterns to look for in source code files
            const sourceCodePatterns = {
                hardcodedSecrets: /(api[_-]?key|apikey|secret[_-]?key|password|passwd|pwd|private[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret|bearer)\s*[=:]\s*["'][^"']{8,}["']/gi,
                awsKeys: /AKIA[0-9A-Z]{16}/g,
                googleApiKeys: /AIza[0-9A-Za-z_-]{35}/g,
                jwtTokens: /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
                privateKeys: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/g,
                base64Secrets: /["'][A-Za-z0-9+/]{40,}={0,2}["']/g,
                sqlInjection: /rawQuery\s*\([^)]*\+|execSQL\s*\([^)]*\+|SELECT\s+.*\+.*FROM/gi,
                weakCrypto: /MessageDigest\.getInstance\s*\(\s*["']MD5["']\)|DES|RC4|ECB/gi,
                insecureRandom: /java\.util\.Random|new\s+Random\s*\(/g,
                webViewIssues: /setJavaScriptEnabled\s*\(\s*true\s*\)|setAllowFileAccess\s*\(\s*true\s*\)|addJavascriptInterface/gi,
                hardcodedIPs: /["']\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?["']/g,
                firebaseUrls: /https:\/\/[a-z0-9-]+\.firebaseio\.com/gi
            };
            
            for (const { file, path } of state.dynamicAnalysisData.otherFiles) {
                const issues = [];
                const pathLower = path.toLowerCase();
                
                // Check file patterns
                for (const { pattern, type, severity } of sensitiveFilePatterns) {
                    if (pattern.test(pathLower)) {
                        issues.push({ severity, type, file: path, description: `${type} found: ${path}` });
                    }
                }
                
                // Check for world-readable paths
                if (pathLower.includes('sdcard') || pathLower.includes('external')) {
                    issues.push({ severity: 'HIGH', type: 'External Storage', file: path, description: 'File stored in external/SD card storage (world-readable)' });
                }
                
                // Analyze text-based files for sensitive content
                if (file.size < 1024 * 1024 && /\.(json|xml|txt|log|properties|conf|config)$/i.test(pathLower)) {
                    try {
                        const content = await file.text();
                        
                        if (sensitivePatterns.jwt.test(content)) {
                            issues.push({ severity: 'HIGH', type: 'JWT in File', file: path, description: 'JWT token found in file' });
                        }
                        if (sensitivePatterns.awsKey.test(content)) {
                            issues.push({ severity: 'CRITICAL', type: 'AWS Key in File', file: path, description: 'AWS credentials found in file' });
                        }
                        if (sensitivePatterns.googleApi.test(content)) {
                            issues.push({ severity: 'HIGH', type: 'Google API Key', file: path, description: 'Google API key found in file' });
                        }
                        if (sensitivePatterns.privateKey.test(content)) {
                            issues.push({ severity: 'CRITICAL', type: 'Private Key', file: path, description: 'Private key found in file' });
                        }
                        
                        // Check for API endpoints that might leak
                        const urls = content.match(sensitivePatterns.urls) || [];
                        if (urls.length > 0) {
                            const sensitiveUrls = urls.filter(u => /api|auth|login|admin|internal|debug/i.test(u));
                            if (sensitiveUrls.length > 0) {
                                issues.push({ severity: 'MEDIUM', type: 'Sensitive URLs', file: path, description: `Sensitive URLs found: ${sensitiveUrls.slice(0, 3).join(', ')}${sensitiveUrls.length > 3 ? '...' : ''}` });
                            }
                        }
                    } catch (e) {
                        // Binary file or encoding issue
                    }
                }
                
                if (issues.length > 0) {
                    state.dynamicAnalysisData.otherFiles.find(f => f.path === path).issues = issues;
                    state.dynamicAnalysisData.issues.push(...issues);
                }
            }
        }

export { handleDroppedItems, readDirectoryRecursive, analyzeDynamicFolder, analyzeSharedPreferences, analyzeSQLiteDatabases, analyzeOtherFiles };

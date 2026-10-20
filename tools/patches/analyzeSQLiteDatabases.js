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

            for (const { file, path } of dynamicAnalysisData.databases) {
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

                    dynamicAnalysisData.databases.find(db => db.path === path).info = dbInfo;
                    dynamicAnalysisData.issues.push(...dbInfo.issues);

                } catch (e) {
                    console.error('Error analyzing database:', path, e);
                }
            }
        }

        // Theme toggle
        function toggleTheme() {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        }
        
        // Load saved theme (default is light/purple theme)
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
        }

        // Expand/Collapse All functions with toggle state
        let allSectionsExpanded = true;
        let allCodeSectionsExpanded = true;
        let currentCodeSection = null; // Track currently selected section for Code Analysis page
        let allDynamicSectionsExpanded = true;

        function toggleAllSections() {
            allSectionsExpanded = !allSectionsExpanded;
            if (allSectionsExpanded) {
                expandAllSections();
                document.getElementById('toggleAllText').textContent = 'Collapse All';
                document.getElementById('toggleAllIcon').style.transform = 'rotate(0deg)';
            } else {
                collapseAllSections();
                document.getElementById('toggleAllText').textContent = 'Expand All';
                document.getElementById('toggleAllIcon').style.transform = 'rotate(180deg)';
            }
        }

        function toggleAllCodeSections() {
            allCodeSectionsExpanded = !allCodeSectionsExpanded;
            if (allCodeSectionsExpanded) {
                expandAllCodeSections();
                document.getElementById('toggleAllCodeText').textContent = 'Collapse All';
                document.getElementById('toggleAllCodeIcon').style.transform = 'rotate(0deg)';
            } else {
                collapseAllCodeSections();
                document.getElementById('toggleAllCodeText').textContent = 'Expand All';
                document.getElementById('toggleAllCodeIcon').style.transform = 'rotate(180deg)';
            }
        }

        function toggleAllDynamicSections() {
            allDynamicSectionsExpanded = !allDynamicSectionsExpanded;
            if (allDynamicSectionsExpanded) {
                expandAllDynamicSectionsInternal();
                document.getElementById('toggleAllDynamicText').textContent = 'Collapse All';
                document.getElementById('toggleAllDynamicIcon').style.transform = 'rotate(0deg)';
            } else {
                collapseAllDynamicSectionsInternal();
                document.getElementById('toggleAllDynamicText').textContent = 'Expand All';
                document.getElementById('toggleAllDynamicIcon').style.transform = 'rotate(180deg)';
            }
        }

        function expandAllSections() {
            ['root', 'emulator', 'ssl', 'flag', 'storage', 'crypto', 'permission'].forEach(section => {
                const chip = document.getElementById(`${section}Chip`);
                const contentBlock = document.getElementById(`${section}Section`);
                if (chip) chip.classList.add('active');
                if (contentBlock) contentBlock.classList.add('visible');
            });
            allSectionsExpanded = true;
        }

        function collapseAllSections() {
            ['root', 'emulator', 'ssl', 'flag', 'storage', 'crypto', 'permission'].forEach(section => {
                const chip = document.getElementById(`${section}Chip`);
                const contentBlock = document.getElementById(`${section}Section`);
                if (chip) chip.classList.remove('active');
                if (contentBlock) contentBlock.classList.remove('visible');
            });
            allSectionsExpanded = false;
        }

        function expandAllCodeSections() {
            const allSections = ['auth', 'authz', 'featureFlags', 'hiddenEndpoints', 'authTrust', 'massAssignment', 'inputValidation', 'businessLogic', 'fileHandling', 'errorHandling', 'envLeakage', 'cryptoTrust', 'sqlInjection', 'nosqlInjection', 'ssrf', 'xxe', 'deserialization', 'commandInjection', 'manifestPosture'];
            
            allSections.forEach(section => {
                const content = document.getElementById(`${section}Content`);
                const chevron = document.getElementById(`${section}Chevron`);
                const sectionDiv = document.getElementById(`${section}Section`);
                
                if (content) content.classList.add('expanded');
                if (chevron) chevron.style.transform = 'rotate(180deg)';
                
                // Show all section headers when expanding
                if (sectionDiv) {
                    sectionDiv.style.display = 'block';
                }
            });
            allCodeSectionsExpanded = true;
        }

        function collapseAllCodeSections() {
            const allSections = ['auth', 'authz', 'featureFlags', 'hiddenEndpoints', 'authTrust', 'massAssignment', 'inputValidation', 'businessLogic', 'fileHandling', 'errorHandling', 'envLeakage', 'cryptoTrust', 'sqlInjection', 'nosqlInjection', 'ssrf', 'xxe', 'deserialization', 'commandInjection', 'manifestPosture'];
            
            allSections.forEach(section => {
                const content = document.getElementById(`${section}Content`);
                const chevron = document.getElementById(`${section}Chevron`);
                const sectionDiv = document.getElementById(`${section}Section`);
                
                if (content) content.classList.remove('expanded');
                if (chevron) chevron.style.transform = 'rotate(0deg)';
                
                // Hide all section headers when collapsing
                if (sectionDiv) {
                    sectionDiv.style.display = 'none';
                }
            });
            
            // Clear selection state
            currentCodeSection = null;
            document.querySelectorAll('#page-codeanalysis .section-chip').forEach(chip => {
                chip.classList.remove('active');
            });
            
            allCodeSectionsExpanded = false;
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
            allDynamicSectionsExpanded = true;
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
            allDynamicSectionsExpanded = false;
        }

        function toggleSection(sectionName) {
            const content = document.getElementById(`${sectionName}Content`);
            const chevron = document.getElementById(`${sectionName}Chevron`);
            if (content && chevron) {
                content.classList.toggle('expanded');
                chevron.style.transform = content.classList.contains('expanded') ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        }
        
        // NEW: Toggle section chip (for Page 1 only)
        function toggleSectionChip(sectionId) {
            const chip = document.getElementById(`${sectionId}Chip`);
            const section = document.getElementById(`${sectionId}Section`);
            
            if (chip && section) {
                chip.classList.toggle('active');
                section.classList.toggle('visible');
            }
        }
        
        // NEW: Update chip counts based on detection results
        function updateChipCounts() {
            const counts = {
                root: currentRootResults.filter(r => r.detected).length,
                emulator: currentEmulatorResults.filter(r => r.detected).length,
                ssl: currentSSLResults.filter(r => r.detected).length,
                flag: currentFlagResults.filter(r => r.detected).length,
                storage: currentStorageResults.filter(r => r.detected).length,
                crypto: currentCryptoResults.filter(r => r.detected).length,
                logging: currentLoggingResults.filter(r => r.detected).length,
                permission: analyzedPermComponents.length
            };
            
            Object.keys(counts).forEach(key => {
                const countEl = document.getElementById(`${key}ChipCount`);
                if (countEl) {
                    countEl.textContent = counts[key];
                }
            });
        }

        function toggleCodeSection(sectionName) {
            const content = document.getElementById(`${sectionName}Content`);
            const chevron = document.getElementById(`${sectionName}Chevron`);
            if (content && chevron) {
                content.classList.toggle('expanded');
                chevron.style.transform = content.classList.contains('expanded') ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        }

        function toggleCodeSectionChip(section) {
            // Update current section tracker
            currentCodeSection = section;
            
            // Remove active class from all chips
            document.querySelectorAll('#page-codeanalysis .section-chip').forEach(chip => {
                chip.classList.remove('active');
            });
            
            // Add active class to clicked chip
            const chip = document.getElementById(`${section}CodeChip`);
            if (chip) {
                chip.classList.add('active');
            }
            
            // Handle section visibility based on collapsed state
            const allSections = ['auth', 'authz', 'featureFlags', 'hiddenEndpoints', 'authTrust', 
                                'massAssignment', 'inputValidation', 'businessLogic', 'fileHandling', 'errorHandling', 
                                'envLeakage', 'cryptoTrust', 'sqlInjection', 'nosqlInjection', 'ssrf', 'xxe', 'deserialization', 'commandInjection', 'manifestPosture'];
            
            allSections.forEach(s => {
                const sectionDiv = document.getElementById(`${s}Section`);
                if (sectionDiv) {
                    if (allCodeSectionsExpanded) {
                        // When expanded, show all sections
                        sectionDiv.style.display = 'block';
                    } else {
                        // When collapsed, only show the selected section
                        if (s === section) {
                            sectionDiv.style.display = 'block';
                            // Expand the content of the selected section
                            const content = document.getElementById(`${s}Content`);
                            const chevron = document.getElementById(`${s}Chevron`);
                            if (content) content.classList.add('expanded');
                            if (chevron) chevron.style.transform = 'rotate(180deg)';
                        } else {
                            sectionDiv.style.display = 'none';
                        }
                    }
                }
            });
        }


        // Authentication checks
        const authenticationChecks = [
            // Login Mechanism
            { name: 'Hardcoded Credentials', patterns: ['hardcoded', 'password=', 'username=', 'admin:', 'root:', 'guest:', 'default_password', 'test_user'], description: 'Check for hardcoded credentials in APK', category: 'Login Mechanism' },
            { name: 'HTTPS Enforcement', patterns: ['https://', 'HttpsURLConnection', 'TLS', 'SSL', 'HTTPS'], description: 'Verify credentials are sent over HTTPS only', category: 'Login Mechanism' },
            { name: 'Empty Credential Check', patterns: ['isEmpty()', 'TextUtils.isEmpty', '.isEmpty()', 'length() == 0', 'equals("")'], description: 'Check if empty/null credentials are validated', category: 'Login Mechanism' },
            { name: 'Rate Limiting', patterns: ['rate_limit', 'throttle', 'max_attempts', 'login_attempts', 'lockout', 'cooldown'], description: 'Rate limiting/brute-force protection', category: 'Login Mechanism' },
            { name: 'CAPTCHA Implementation', patterns: ['captcha', 'recaptcha', 'hCaptcha', 'CAPTCHA', 'verify_captcha'], description: 'CAPTCHA protection for login', category: 'Login Mechanism' },

            // Session & Token Management
            { name: 'Session Token Generation', patterns: ['session_token', 'sessionToken', 'access_token', 'auth_token', 'bearer', 'JWT'], description: 'Session token issued after login', category: 'Session Management' },
            { name: 'Token Invalidation', patterns: ['logout', 'invalidate', 'clearSession', 'revokeToken', 'deleteToken', 'removeToken'], description: 'Token invalidation on logout', category: 'Session Management' },
            { name: 'Password Change Token Revoke', patterns: ['changePassword', 'updatePassword', 'resetPassword', 'newPassword'], description: 'Token revocation after password change', category: 'Session Management' },
            { name: 'Token Rotation', patterns: ['refreshToken', 'tokenRotation', 'renewToken', 'token_refresh', 'refresh_token'], description: 'Token rotation mechanism', category: 'Session Management' },
            { name: 'Multi-Device Token', patterns: ['device_id', 'deviceId', 'device_token', 'installation_id', 'fingerprint'], description: 'Device-bound token implementation', category: 'Session Management' },

            // JWT/OAuth/API Tokens
            { name: 'JWT Implementation', patterns: ['JsonWebToken', '.parseClaimsJws', 'JwtBuilder', 'io.jsonwebtoken'], description: 'JWT token usage detected', category: 'JWT Security' },
            { name: 'JWT Signature Validation', patterns: ['verify', 'validateSignature', 'signWith', 'SignatureAlgorithm', 'HS256', 'RS256'], description: 'JWT signature verification', category: 'JWT Security' },
            { name: 'JWT Algorithm None', patterns: ['alg=none', 'algorithm=none', 'none', 'Algorithm.NONE'], description: 'Check for alg=none vulnerability', category: 'JWT Security' },
            { name: 'OAuth Implementation', patterns: ['OAuth', 'oauth2', 'authorization_code', 'client_credentials', 'implicit_grant'], description: 'OAuth flow implementation', category: 'JWT Security' },
            { name: 'Token Expiry', patterns: ['exp', 'expires', 'expiration', 'token_expiry', 'exp_time', 'iat', 'nbf'], description: 'Token expiration claims', category: 'JWT Security' },

            // Biometric/PIN Authentication
            { name: 'Biometric Authentication', patterns: ['BiometricPrompt', 'FingerprintManager', 'biometric', 'fingerprint', 'FaceID', 'authenticate'], description: 'Biometric authentication usage', category: 'Biometric Security' },
            { name: 'Biometric Callback', patterns: ['onAuthenticationSucceeded', 'onAuthenticationError', 'onAuthenticationFailed', 'BiometricCallback'], description: 'Biometric result handling', category: 'Biometric Security' },
            { name: 'PIN/Pattern Auth', patterns: ['KeyguardManager', 'isDeviceSecure', 'isKeyguardSecure', 'setPassword', 'verifyPin'], description: 'PIN/Pattern authentication', category: 'Biometric Security' },
            { name: 'Fallback Authentication', patterns: ['fallback', 'alternative_auth', 'backup_auth', 'pin_fallback'], description: 'Authentication fallback logic', category: 'Biometric Security' },

            // OTP/2FA
            { name: 'OTP Implementation', patterns: ['OTP', 'otp', 'one_time', 'verification_code', 'verifyCode', 'sendOtp'], description: 'OTP implementation detected', category: 'OTP/2FA' },
            { name: 'OTP Validation', patterns: ['validateOtp', 'verifyOtp', 'checkOtp', 'otp_verification', 'confirm_otp'], description: 'OTP server-side validation', category: 'OTP/2FA' },
            { name: '2FA/MFA', patterns: ['2FA', 'MFA', 'two_factor', 'multi_factor', 'twoFactorAuth', 'secondFactor'], description: 'Two-factor authentication', category: 'OTP/2FA' },
            { name: 'TOTP Implementation', patterns: ['TOTP', 'GoogleAuthenticator', 'Authenticator', 'timebased', 'hotp'], description: 'TOTP authenticator usage', category: 'OTP/2FA' },

            // Remember Me/Auto Login
            { name: 'Remember Me', patterns: ['rememberMe', 'remember_me', 'stay_logged', 'keep_signed', 'persistent_login'], description: 'Remember me functionality', category: 'Persistent Auth' },
            { name: 'Auto Login', patterns: ['autoLogin', 'auto_login', 'automatic_login', 'silent_login', 'background_auth'], description: 'Auto login implementation', category: 'Persistent Auth' },
            { name: 'Persistent Token Storage', patterns: ['SharedPreferences', 'putString', 'getSharedPreferences', 'commit()', 'apply()'], description: 'Token persistence mechanism', category: 'Persistent Auth' },

            // Password Reset
            { name: 'Password Reset', patterns: ['forgot_password', 'password_reset', 'reset_link', 'recovery'], description: 'Password reset functionality', category: 'Account Recovery' },
            { name: 'Reset Token', patterns: ['reset_token', 'recovery_token', 'password_token', 'reset_code'], description: 'Password reset token handling', category: 'Account Recovery' },
            { name: 'Account Recovery', patterns: ['account_recovery', 'recover_account', 'security_question', 'backup_email'], description: 'Account recovery mechanisms', category: 'Account Recovery' },
        ];

        // Authorization checks
        const authorizationChecks = [
            // BOLA
            { name: 'User ID in Requests', patterns: ['user_id', 'userId', 'account_id', 'accountId', 'customer_id', 'profile_id'], description: 'User ID parameter in API requests (BOLA risk)', category: 'BOLA' },
            { name: 'Object ID Manipulation', patterns: ['order_id', 'orderId', 'file_id', 'document_id', 'resource_id', 'item_id'], description: 'Object IDs that may be manipulated', category: 'BOLA' },
            { name: 'Direct Object Reference', patterns: ['/users/', '/accounts/', '/orders/', '/files/', '/documents/'], description: 'Direct object reference patterns in URLs', category: 'BOLA' },

            // RBAC
            { name: 'Role Checking', patterns: ['role', 'isAdmin', 'is_admin', 'hasRole', 'checkRole', 'userRole', 'getRole'], description: 'Role-based access control checks', category: 'RBAC' },
            { name: 'Permission Checking', patterns: ['hasPermission', 'checkPermission', 'isAuthorized', 'canAccess', 'allowed'], description: 'Permission verification logic', category: 'RBAC' },
            { name: 'Admin Functionality', patterns: ['admin', 'administrator', 'superuser', 'moderator', 'privileged'], description: 'Admin/privileged functionality', category: 'RBAC' },
            { name: 'Client-Side Role Check', patterns: ['if.*role', 'if.*admin', 'role ==', 'role ==='], description: 'Client-side role verification (bypassable)', category: 'RBAC' },

            // Component Authorization
            { name: 'Exported Activities', patterns: ['android:exported="true"', 'exported="true"', '<activity', 'startActivity'], description: 'Exported activities check', category: 'Component Auth' },
            { name: 'Activity Intent Filters', patterns: ['<intent-filter>', 'android.intent.action', 'android.intent.category'], description: 'Intent filter exposure', category: 'Component Auth' },
            { name: 'Service Authorization', patterns: ['<service', 'bindService', 'startService', 'android:permission'], description: 'Service authorization checks', category: 'Component Auth' },
            { name: 'Broadcast Receiver', patterns: ['<receiver', 'BroadcastReceiver', 'sendBroadcast', 'registerReceiver'], description: 'Broadcast receiver security', category: 'Component Auth' },
            { name: 'Content Provider', patterns: ['<provider', 'ContentProvider', 'content://', 'grantUriPermission'], description: 'Content provider authorization', category: 'Component Auth' },

            // API Authorization
            { name: 'API Authorization Header', patterns: ['Authorization', 'X-Auth-Token', 'X-API-Key', 'api_key'], description: 'API authorization headers', category: 'API Security' },
            { name: 'Client-Side Flags', patterns: ['isSubscribed', 'isPremium', 'hasPaid', 'isVIP', 'unlocked', 'premium_user'], description: 'Client-side authorization flags (bypassable)', category: 'API Security' },
            { name: 'Sensitive Endpoints', patterns: ['/admin/', '/internal/', '/debug/', '/private/', '/management/'], description: 'Sensitive API endpoints', category: 'API Security' },
            { name: 'Profile Update', patterns: ['updateProfile', 'editProfile', 'changeEmail', 'updateUser', 'modifyAccount'], description: 'Profile update authorization', category: 'API Security' },
            { name: 'Delete Operations', patterns: ['deleteAccount', 'removeUser', 'delete/', 'destroy', 'remove/'], description: 'Delete operation authorization', category: 'API Security' },

            // Privilege Escalation
            { name: 'Horizontal Access', patterns: ['other_user', 'any_user', 'all_users', 'user_list', 'getAllUsers'], description: 'Horizontal privilege patterns', category: 'Privilege Escalation' },
            { name: 'Vertical Access', patterns: ['promote', 'elevate', 'upgrade_role', 'grant_admin', 'makeAdmin'], description: 'Vertical privilege patterns', category: 'Privilege Escalation' },
            { name: 'Premium Features', patterns: ['premium', 'pro_feature', 'paid_feature', 'subscription', 'entitlement'], description: 'Premium feature access control', category: 'Privilege Escalation' },

            // Deep Links
            { name: 'Deep Link Handling', patterns: ['deeplink', 'app_link', 'applink', 'handleDeepLink', 'getIntent()'], description: 'Deep link handling', category: 'Deep Links' },
            { name: 'Deep Link Auth Bypass', patterns: ['intent.getData()', 'Uri.parse', 'getQueryParameter', 'pathSegments'], description: 'Deep link parameter handling', category: 'Deep Links' },
            { name: 'App Links', patterns: ['android:autoVerify', 'assetlinks.json', 'Digital Asset Links'], description: 'App Links implementation', category: 'Deep Links' },

            // WebView Authorization
            { name: 'WebView JS Bridge', patterns: ['addJavascriptInterface', '@JavascriptInterface', 'evaluateJavascript'], description: 'WebView JavaScript interface', category: 'WebView Auth' },
            { name: 'WebView Session', patterns: ['CookieManager', 'WebView.loadUrl', 'setWebViewClient', 'WebSettings'], description: 'WebView session handling', category: 'WebView Auth' },
            { name: 'WebView File Access', patterns: ['setAllowFileAccess', 'setAllowContentAccess', 'file://', 'content://'], description: 'WebView file access', category: 'WebView Auth' },

            // Multi-Account
            { name: 'Account Switching', patterns: ['switchAccount', 'changeAccount', 'selectAccount', 'accountList', 'multiAccount'], description: 'Multi-account handling', category: 'Multi-Account' },
            { name: 'Account Isolation', patterns: ['clearCache', 'clearData', 'accountCache', 'userCache', 'sessionCache'], description: 'Account data isolation', category: 'Multi-Account' },
        ];

        // ===== BACKEND RISK INDICATOR CHECKS =====

        // 1. Feature Flags & Hidden Functionality
        const featureFlagsChecks = [
            { name: 'Local Boolean Flags', patterns: ['isFeatureEnabled', 'featureEnabled', 'enableFeature', 'isEnabled()', 'feature_flag', 'featureToggle'], description: 'Local boolean feature gates', insight: 'May indicate backend functionality exists even when disabled in UI' },
            { name: 'BuildConfig Flags', patterns: ['BuildConfig.', 'DEBUG', 'RELEASE', 'FEATURE_', 'ENABLE_'], description: 'Build configuration flags', insight: 'Features may be compiled out but backend APIs remain' },
            { name: 'Remote Config', patterns: ['FirebaseRemoteConfig', 'RemoteConfig', 'remoteConfig', 'getRemoteConfig', 'fetchAndActivate'], description: 'Remote configuration system', insight: 'Server-controlled features suggest backend supports both states' },
            { name: 'Conditional Features', patterns: ['if.*enabled', 'when.*enabled', '? enable', ': disable', 'isHidden', 'isVisible'], description: 'Conditional feature rendering', insight: 'UI gating may hide accessible backend functionality' },
            { name: 'Beta/Experimental', patterns: ['beta', 'experimental', 'preview', 'alpha', 'canary', 'unstable'], description: 'Beta/experimental feature flags', insight: 'Unreleased features may have active backend endpoints' },
            { name: 'Debug Features', patterns: ['debugMenu', 'debug_mode', 'devTools', 'developerMode', 'internal_tools'], description: 'Debug/dev features', insight: 'Debug features often expose privileged backend operations' },
            { name: 'A/B Testing', patterns: ['experiment', 'variant', 'abTest', 'testGroup', 'cohort', 'split'], description: 'A/B testing framework', insight: 'Multiple feature versions suggest backend supports all variants' },
        ];

        // 2. Hidden/Unused API Endpoints
        const hiddenEndpointsChecks = [
            { name: 'Admin Endpoints', patterns: ['/admin/', '/admin-', 'admin.', '/internal/', '/management/', '/console/'], description: 'Administrative API paths', insight: 'Admin endpoints may lack proper access controls' },
            { name: 'Versioned APIs', patterns: ['/v1/', '/v2/', '/v3/', '/api/v', '/beta/', '/alpha/'], description: 'Multiple API versions', insight: 'Old API versions may remain accessible with weaker security' },
            { name: 'Debug Endpoints', patterns: ['/debug/', '/test/', '/dev/', '/staging/', '/sandbox/'], description: 'Debug/test endpoints', insight: 'Debug endpoints may expose sensitive operations' },
            { name: 'Internal APIs', patterns: ['/internal/', '/_internal/', '/private/', '/_api/', '/system/'], description: 'Internal API paths', insight: 'Internal APIs often lack public-facing security hardening' },
            { name: 'Deprecated Endpoints', patterns: ['deprecated', 'legacy', 'old_api', 'v0/', 'obsolete'], description: 'Deprecated API references', insight: 'Deprecated endpoints may remain functional with known vulnerabilities' },
            { name: 'Undocumented Methods', patterns: ['_hidden', 'secret', 'undocumented', '_internal', '__api'], description: 'Hidden API method names', insight: 'Undocumented endpoints suggest incomplete security review' },
            { name: 'GraphQL Introspection', patterns: ['graphql', 'GraphQL', '__schema', '__type', 'introspectionQuery'], description: 'GraphQL endpoint with introspection', insight: 'GraphQL introspection may reveal all available operations' },
        ];

        // 3. Authentication & Authorization Trust Signals
        const authTrustChecks = [
            { name: 'Client-Supplied User ID', patterns: ['userId:', 'user_id:', 'setUserId(', 'putString("userId"', 'put("user_id"'], description: 'User ID set from client', insight: 'Backend may trust client-supplied identity without verification' },
            { name: 'Client-Supplied Role', patterns: ['role:', 'userRole:', 'setRole(', 'putString("role"', 'isAdmin:', 'admin:'], description: 'Role/permission set from client', insight: 'Authorization decisions may rely on untrusted client data' },
            { name: 'Custom Auth Headers', patterns: ['X-User-Id', 'X-Role', 'X-Tenant', 'X-Account-Id', 'X-Customer-Id'], description: 'Custom authentication headers', insight: 'Non-standard auth headers may lack proper validation' },
            { name: 'JWT Client Parsing', patterns: ['parseJWT', 'decodeJWT', 'jwt.decode', 'Base64.decode.*eyJ', 'split("\\.")'], description: 'JWT parsed/manipulated by client', insight: 'Client JWT manipulation suggests backend may accept modified tokens' },
            { name: 'Tenant/Org ID in Request', patterns: ['tenantId:', 'tenant_id:', 'orgId:', 'organization_id:', 'companyId:'], description: 'Tenant identifier in request', insight: 'Multi-tenant isolation may rely on client-supplied tenant ID' },
            { name: 'Bearer Token Construction', patterns: ['Bearer " +', '"Bearer: " +', 'Authorization: Bearer', 'token = "eyJ'], description: 'Bearer token constructed by client', insight: 'Client-constructed tokens suggest weak token generation' },
            { name: 'Permission Claims', patterns: ['permissions:', 'claims:', 'scopes:', 'authorities:', 'privileges:'], description: 'Permission claims in request', insight: 'Backend may accept client-defined permissions' },
        ];

        // 4. Mass Assignment Indicators
        const massAssignmentChecks = [
            { name: 'Broad Request DTOs', patterns: ['toJson()', 'toMap()', 'toHashMap()', 'JSONObject(this)', 'serialize()'], description: 'Entire objects serialized to requests', insight: 'Backend may accept unintended fields from request body' },
            { name: 'Privileged Fields', patterns: ['isAdmin:', 'role:', 'permission:', 'status:', 'verified:', 'approved:'], description: 'Privileged fields in request models', insight: 'Sensitive fields may be modifiable via mass assignment' },
            { name: 'ID Fields in PUT', patterns: ['userId:', 'accountId:', 'customerId:', 'orderId:', 'id:'], description: 'Identity fields in update requests', insight: 'Object IDs in request body may enable object takeover' },
            { name: 'Unreferenced Fields', patterns: ['private String', 'private int', 'private boolean', '@SerializedName'], description: 'DTO fields not used in UI', insight: 'Unused fields suggest backend accepts more parameters than UI sends' },
            { name: 'Generic String Fields', patterns: ['String data', 'String params', 'String payload', 'String json'], description: 'Generic string fields for data', insight: 'Unstructured data fields may enable arbitrary parameter injection' },
            { name: 'Map/Dict in Requests', patterns: ['Map<String', 'HashMap<', 'Dictionary<', 'params.put(', 'additionalData'], description: 'Key-value maps in requests', insight: 'Dynamic parameters may enable unexpected field submission' },
        ];

        // 5. Input Validation Signals
        const inputValidationChecks = [
            { name: 'Client-Only Validation', patterns: ['TextUtils.isEmpty', 'Validator.', 'isValid()', '.matches(', 'Pattern.compile'], description: 'Input validation in client code', insight: 'Backend may lack server-side validation for these inputs' },
            { name: 'Length Checks', patterns: ['length() >', 'length() <', 'length() ==', '.length >', 'maxLength'], description: 'String length validation', insight: 'Client length limits may not be enforced server-side' },
            { name: 'Regex Validation', patterns: ['Pattern.compile', '.matches(', 'Regex.', 'Pattern.matches'], description: 'Regex pattern matching', insight: 'Complex client regex may indicate missing server validation' },
            { name: 'Email Validation', patterns: ['isValidEmail', 'EMAIL_PATTERN', '@.*\\.', 'emailValidator', 'Patterns.EMAIL_ADDRESS'], description: 'Email format validation', insight: 'Format-only validation may miss injection vectors' },
            { name: 'SQL-like Strings', patterns: ['SELECT ', 'INSERT ', 'UPDATE ', 'DELETE ', 'WHERE ', 'UNION '], description: 'SQL keywords in string operations', insight: 'String concatenation with SQL keywords suggests injection risk' },
            { name: 'Dynamic Query Building', patterns: ['" + ', '.append(', 'String.format', 'StringBuilder', '+ "SELECT'], description: 'Dynamic string construction', insight: 'Dynamic queries may enable injection if server trusts input' },
            { name: 'Sanitization Functions', patterns: ['sanitize', 'escape', 'htmlEscape', 'stripTags', 'removeSpecialChars'], description: 'Client-side sanitization', insight: 'Client sanitization suggests backend may expect cleaned input' },
        ];

        // 6. Business Logic Enforcement
        const businessLogicChecks = [
            { name: 'Premium Checks', patterns: ['isPremium', 'hasPremium', 'premiumUser', 'isPro', 'isSubscribed'], description: 'Premium feature checks', insight: 'Client-side premium checks may be bypassable via API' },
            { name: 'Subscription Status', patterns: ['subscriptionStatus', 'subscription_active', 'planType', 'subscribedTo'], description: 'Subscription state management', insight: 'Backend may trust client subscription status' },
            { name: 'Pricing Logic', patterns: ['calculatePrice', 'getPrice', 'totalAmount', 'discount', 'couponCode'], description: 'Price calculation in client', insight: 'Client-side pricing may enable price manipulation' },
            { name: 'Discount/Coupon', patterns: ['applyCoupon', 'discountCode', 'promoCode', 'coupon', 'voucher'], description: 'Coupon/discount handling', insight: 'Client-applied discounts may bypass server validation' },
            { name: 'Trial Logic', patterns: ['isTrial', 'trialExpired', 'trialDays', 'freeTrialEnds', 'trialPeriod'], description: 'Trial/free tier logic', insight: 'Client trial enforcement may be circumventable' },
            { name: 'Quota/Limits', patterns: ['remainingQuota', 'usageLimit', 'maxRequests', 'rateLimitRemaining', 'quotaExceeded'], description: 'Usage quota enforcement', insight: 'Client-side quotas may not reflect true server limits' },
            { name: 'Feature Entitlement', patterns: ['hasAccess', 'canUseFeature', 'isEntitled', 'featureAccess', 'unlock'], description: 'Feature entitlement checks', insight: 'Entitlement logic in client suggests API may lack enforcement' },
            { name: 'Expiry Checks', patterns: ['isExpired', 'expiryDate', 'validUntil', 'expiration', 'hasExpired'], description: 'Expiration validation', insight: 'Client expiry checks may not be enforced server-side' },
        ];

        // ========================================================================
        // SERVER-SIDE VULNERABILITY CHECKS (COMPREHENSIVE STATIC ANALYSIS)
        // ========================================================================

        // SQL INJECTION VULNERABILITY CHECKS
        const sqlInjectionChecks = [
            { 
                name: 'SQL String Concatenation', 
                patterns: ['+ "SELECT', '+ "INSERT', '+ "UPDATE', '+ "DELETE', '+ "WHERE', '+ "ORDER BY', '" + userId', '" + username', 'String.format.*SELECT'], 
                description: 'SQL query with string concatenation', 
                riskLevel: 'HIGH',
                category: 'SQL Injection',
                serverImpact: 'Authentication bypass, data exfiltration, privilege escalation',
                recommendation: 'Use parameterized queries or PreparedStatement with bind parameters'
            },
            { 
                name: 'rawQuery without Parameters', 
                patterns: ['rawQuery("SELECT', 'rawQuery(.*\\+', 'rawQuery(String.format', 'rawQuery(.*StringBuilder'], 
                description: 'SQLite rawQuery with dynamic SQL', 
                riskLevel: 'HIGH',
                category: 'SQL Injection',
                serverImpact: 'Local database compromise, credential theft, data tampering',
                recommendation: 'Use rawQuery with selection args: rawQuery(sql, new String[]{param})'
            },
            { 
                name: 'execSQL with Concatenation', 
                patterns: ['execSQL("INSERT.*\\+', 'execSQL("UPDATE.*\\+', 'execSQL("DELETE.*\\+', 'execSQL(.*String.format'], 
                description: 'execSQL with dynamic content', 
                riskLevel: 'HIGH',
                category: 'SQL Injection',
                serverImpact: 'Database modification, authentication bypass',
                recommendation: 'Use execSQL with bind args or SQLiteStatement'
            },
            { 
                name: 'Dynamic WHERE Clause', 
                patterns: ['WHERE " + ', 'WHERE.*\\+.*userId', 'WHERE.*\\+.*username', 'WHERE.*String.format', 'WHERE.*StringBuilder'], 
                description: 'Dynamic WHERE clause construction', 
                riskLevel: 'HIGH',
                category: 'SQL Injection',
                serverImpact: 'Authorization bypass, lateral movement, data access',
                recommendation: 'Use selection and selectionArgs parameters'
            },
            { 
                name: 'Dynamic ORDER BY', 
                patterns: ['ORDER BY " + ', 'ORDER BY.*\\+', 'orderBy.*\\+'], 
                description: 'Dynamic ORDER BY clause', 
                riskLevel: 'MEDIUM',
                category: 'SQL Injection',
                serverImpact: 'Information disclosure, timing-based attacks',
                recommendation: 'Whitelist allowed column names for ordering'
            },
            { 
                name: 'Room @Query with Concatenation', 
                patterns: ['@Query.*\\$', '@Query.*\\+', '@Query.*String.format'], 
                description: 'Room query with string injection', 
                riskLevel: 'HIGH',
                category: 'SQL Injection',
                serverImpact: 'ORM-level injection, query manipulation',
                recommendation: 'Use Room query parameters with :paramName syntax'
            },
            { 
                name: 'ContentProvider SQL Injection', 
                patterns: ['query(.*selection.*\\+', 'update(.*selection.*\\+', 'delete(.*selection.*\\+'], 
                description: 'ContentProvider with dynamic selection', 
                riskLevel: 'HIGH',
                category: 'SQL Injection',
                serverImpact: 'Cross-app data access, privilege escalation',
                recommendation: 'Sanitize selection clauses in ContentProvider implementations'
            }
        ];

        // NoSQL INJECTION VULNERABILITY CHECKS
        const nosqlInjectionChecks = [
            { 
                name: 'MongoDB Query Object Construction', 
                patterns: ['BasicDBObject.*put', 'Document.*append', 'new Document.*userId', 'Filters.eq.*\\+', 'Bson.*\\+'], 
                description: 'Dynamic MongoDB query construction', 
                riskLevel: 'HIGH',
                category: 'NoSQL Injection',
                serverImpact: 'Authentication bypass via $ne, $gt operators, data exfiltration',
                recommendation: 'Validate and sanitize all input before building query documents'
            },
            { 
                name: 'Firebase Query with User Input', 
                patterns: ['orderByChild.*\\+', 'equalTo.*\\+', 'startAt.*\\+', 'endAt.*\\+', 'limitToFirst.*\\+'], 
                description: 'Firebase query with dynamic values', 
                riskLevel: 'MEDIUM',
                category: 'NoSQL Injection',
                serverImpact: 'Unauthorized data access, query manipulation',
                recommendation: 'Implement server-side Firebase Security Rules'
            },
            { 
                name: '$where Operator Usage', 
                patterns: ['$where', '\\$where', 'where:', '"where"'], 
                description: 'MongoDB $where operator detected', 
                riskLevel: 'HIGH',
                category: 'NoSQL Injection',
                serverImpact: 'JavaScript injection in MongoDB, RCE potential',
                recommendation: 'Avoid $where operator; use standard query operators'
            },
            { 
                name: 'Regex Injection in Queries', 
                patterns: ['$regex', '\\$regex', 'Pattern.compile.*\\+', 'new Regex.*userId'], 
                description: 'Regular expression in queries with user input', 
                riskLevel: 'MEDIUM',
                category: 'NoSQL Injection',
                serverImpact: 'ReDoS attacks, information disclosure',
                recommendation: 'Escape regex special characters or use exact matches'
            },
            { 
                name: 'Operator Injection ($ne, $gt)', 
                patterns: ['\\$ne', '\\$gt', '\\$gte', '\\$lt', '\\$lte', '\\$or', '\\$and'], 
                description: 'NoSQL operator usage in client', 
                riskLevel: 'HIGH',
                category: 'NoSQL Injection',
                serverImpact: 'Authentication bypass, authorization circumvention',
                recommendation: 'Strictly validate query structure server-side'
            },
            { 
                name: 'Couchbase N1QL Dynamic Query', 
                patterns: ['N1qlQuery.*\\+', 'SELECT.*FROM.*\\+', 'n1ql.*String.format'], 
                description: 'Couchbase N1QL with string concatenation', 
                riskLevel: 'HIGH',
                category: 'NoSQL Injection',
                serverImpact: 'NoSQL injection in Couchbase queries',
                recommendation: 'Use parameterized N1QL queries'
            }
        ];

        // SERVER-SIDE REQUEST FORGERY (SSRF) CHECKS
        const ssrfVulnerabilityChecks = [
            { 
                name: 'Dynamic URL Construction', 
                patterns: ['new URL(" + ', 'URL.*\\+.*userId', 'http://" + ', 'https://" + ', 'String url = .*\\+'], 
                description: 'URL built from user input', 
                riskLevel: 'HIGH',
                category: 'SSRF',
                serverImpact: 'Internal network scanning, cloud metadata access, internal API abuse',
                recommendation: 'Validate URLs against strict whitelist of allowed hosts'
            },
            { 
                name: 'HttpURLConnection with Dynamic Host', 
                patterns: ['HttpURLConnection.*\\+', 'openConnection.*\\+', 'URL.*userId.*openConnection', 'URL.*userInput.*openConnection'], 
                description: 'HTTP connection to user-controlled URL', 
                riskLevel: 'HIGH',
                category: 'SSRF',
                serverImpact: 'SSRF to internal services, AWS metadata theft',
                recommendation: 'Implement URL validation and restrict to external domains only'
            },
            { 
                name: 'WebView loadUrl with User Input', 
                patterns: ['loadUrl(" + ', 'loadUrl(url)', 'loadUrl(.*Intent', 'loadUrl(.*getStringExtra'], 
                description: 'WebView loading dynamic URLs', 
                riskLevel: 'HIGH',
                category: 'SSRF',
                serverImpact: 'Local file access (file://), internal network access',
                recommendation: 'Validate URL scheme (only allow http/https) and domain whitelist'
            },
            { 
                name: 'OkHttp with Dynamic URL', 
                patterns: ['Request.Builder.*url.*\\+', 'newCall.*url.*\\+', 'HttpUrl.parse.*\\+'], 
                description: 'OkHttp request with dynamic URL', 
                riskLevel: 'HIGH',
                category: 'SSRF',
                serverImpact: 'SSRF via HTTP client library',
                recommendation: 'Use URL builder with validated components'
            },
            { 
                name: 'Retrofit Dynamic BaseUrl', 
                patterns: ['baseUrl(" + ', 'baseUrl(url)', '.baseUrl(.*userId'], 
                description: 'Retrofit with user-controlled base URL', 
                riskLevel: 'HIGH',
                category: 'SSRF',
                serverImpact: 'API endpoint redirection to attacker-controlled server',
                recommendation: 'Hardcode base URLs or validate against whitelist'
            },
            { 
                name: 'Internal IP Detection', 
                patterns: ['127.0.0.1', 'localhost', '0.0.0.0', '169.254.169.254', '192.168.', '10.', '172.16.'], 
                description: 'Internal/localhost IP addresses in code', 
                riskLevel: 'MEDIUM',
                category: 'SSRF',
                serverImpact: 'Potential SSRF target indicators',
                recommendation: 'Block internal IPs in URL validation'
            },
            { 
                name: 'File URL Scheme', 
                patterns: ['file://', 'content://', 'ftp://', 'gopher://', 'dict://'], 
                description: 'Non-HTTP URL schemes', 
                riskLevel: 'HIGH',
                category: 'SSRF',
                serverImpact: 'Local file disclosure, protocol confusion',
                recommendation: 'Restrict to http:// and https:// schemes only'
            }
        ];

        // XML EXTERNAL ENTITY (XXE) VULNERABILITY CHECKS
        const xxeVulnerabilityChecks = [
            { 
                name: 'DocumentBuilderFactory without Security', 
                patterns: ['DocumentBuilderFactory', 'newDocumentBuilder', 'DocumentBuilder.parse'], 
                description: 'XML parsing without secure configuration', 
                riskLevel: 'HIGH',
                category: 'XXE',
                serverImpact: 'Local file disclosure, SSRF via XXE, DoS',
                recommendation: 'Disable external entities: setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true)'
            },
            { 
                name: 'SAXParserFactory without Security', 
                patterns: ['SAXParserFactory', 'newSAXParser', 'SAXParser.parse'], 
                description: 'SAX parser without XXE protection', 
                riskLevel: 'HIGH',
                category: 'XXE',
                serverImpact: 'XXE via SAX parser',
                recommendation: 'Disable DTD processing and external entities'
            },
            { 
                name: 'XMLInputFactory Unsafe', 
                patterns: ['XMLInputFactory', 'createXMLStreamReader', 'XMLStreamReader'], 
                description: 'StAX parser potentially vulnerable', 
                riskLevel: 'HIGH',
                category: 'XXE',
                serverImpact: 'XXE in streaming XML parser',
                recommendation: 'Disable external entities in XMLInputFactory'
            },
            { 
                name: 'XML Parsing from Untrusted Source', 
                patterns: ['parse(.*Intent', 'parse(.*getInputStream', 'parse(.*URL', 'parseXml.*userId'], 
                description: 'Parsing XML from external/user input', 
                riskLevel: 'HIGH',
                category: 'XXE',
                serverImpact: 'XXE exploitation via user-supplied XML',
                recommendation: 'Validate XML structure and disable external entities'
            },
            { 
                name: 'DTD Processing Enabled', 
                patterns: ['setFeature.*disallow-doctype-decl.*false', 'FEATURE.*NONVALIDATING', 'DTD'], 
                description: 'DTD processing not disabled', 
                riskLevel: 'HIGH',
                category: 'XXE',
                serverImpact: 'XXE via DTD injection',
                recommendation: 'Set disallow-doctype-decl to true'
            },
            { 
                name: 'XStream Deserialization', 
                patterns: ['XStream', 'fromXML', 'XStream.fromXML'], 
                description: 'XStream XML deserialization', 
                riskLevel: 'HIGH',
                category: 'XXE',
                serverImpact: 'RCE via XStream XXE and deserialization',
                recommendation: 'Use XStream with security framework and whitelist classes'
            }
        ];

        // INSECURE DESERIALIZATION VULNERABILITY CHECKS
        const deserializationVulnerabilityChecks = [
            { 
                name: 'ObjectInputStream Usage', 
                patterns: ['ObjectInputStream', 'readObject()', 'ObjectInputStream.readObject'], 
                description: 'Java object deserialization', 
                riskLevel: 'HIGH',
                category: 'Insecure Deserialization',
                serverImpact: 'Remote Code Execution via gadget chains',
                recommendation: 'Avoid ObjectInputStream; use JSON/Protobuf; implement custom readObject validation'
            },
            { 
                name: 'Serializable Classes', 
                patterns: ['implements Serializable', 'Serializable', 'serialVersionUID'], 
                description: 'Serializable objects in codebase', 
                riskLevel: 'MEDIUM',
                category: 'Insecure Deserialization',
                serverImpact: 'Potential deserialization attack surface',
                recommendation: 'Minimize Serializable classes; implement readObject validation'
            },
            { 
                name: 'Gson with TypeToken', 
                patterns: ['fromJson(.*TypeToken', 'fromJson(.*getType()', 'GsonBuilder.*registerTypeAdapter'], 
                description: 'Gson polymorphic deserialization', 
                riskLevel: 'MEDIUM',
                category: 'Insecure Deserialization',
                serverImpact: 'Type confusion, unexpected class instantiation',
                recommendation: 'Avoid polymorphic deserialization; validate expected types'
            },
            { 
                name: 'Jackson Polymorphic Deserialization', 
                patterns: ['@JsonTypeInfo', 'enableDefaultTyping', 'ObjectMapper.*enableDefaultTyping', 'JAVA_LANG_OBJECT'], 
                description: 'Jackson with default typing enabled', 
                riskLevel: 'HIGH',
                category: 'Insecure Deserialization',
                serverImpact: 'RCE via Jackson polymorphic deserialization gadgets',
                recommendation: 'Disable default typing; use @JsonTypeInfo with whitelist'
            },
            { 
                name: 'Kryo Deserialization', 
                patterns: ['Kryo', 'kryo.readObject', 'kryo.readClassAndObject'], 
                description: 'Kryo binary deserialization', 
                riskLevel: 'HIGH',
                category: 'Insecure Deserialization',
                serverImpact: 'RCE via Kryo deserialization',
                recommendation: 'Register only required classes; enable reference tracking'
            },
            { 
                name: 'Serialized Object from Network', 
                patterns: ['readObject().*socket', 'ObjectInputStream.*getInputStream', 'deserialize.*HTTP'], 
                description: 'Deserializing objects from network', 
                riskLevel: 'HIGH',
                category: 'Insecure Deserialization',
                serverImpact: 'RCE via untrusted serialized data',
                recommendation: 'Never deserialize untrusted data; use safe formats like JSON'
            },
            { 
                name: 'Parcelize with Custom Classes', 
                patterns: ['@Parcelize', 'Parcelable.Creator', 'createFromParcel', 'writeToParcel'], 
                description: 'Android Parcelable deserialization', 
                riskLevel: 'MEDIUM',
                category: 'Insecure Deserialization',
                serverImpact: 'Type confusion in Intent extras',
                recommendation: 'Validate Parcelable data from untrusted sources'
            }
        ];

        // COMMAND INJECTION VULNERABILITY CHECKS
        const commandInjectionChecks = [
            { 
                name: 'Runtime.exec() Usage', 
                patterns: ['Runtime.getRuntime().exec', 'Runtime.exec', 'exec("', 'exec(.*\\+'], 
                description: 'OS command execution', 
                riskLevel: 'HIGH',
                category: 'Command Injection',
                serverImpact: 'Remote Code Execution, system compromise',
                recommendation: 'Avoid Runtime.exec; use safer APIs; validate and sanitize all input'
            },
            { 
                name: 'ProcessBuilder with User Input', 
                patterns: ['ProcessBuilder.*\\+', 'ProcessBuilder(.*userId', 'new ProcessBuilder(.*\\+', 'processBuilder.command.*\\+'], 
                description: 'Process execution with dynamic input', 
                riskLevel: 'HIGH',
                category: 'Command Injection',
                serverImpact: 'Command injection, arbitrary command execution',
                recommendation: 'Use ProcessBuilder with fixed command array; validate arguments'
            },
            { 
                name: 'Shell Command Construction', 
                patterns: ['sh -c', '/bin/sh', '/system/bin/sh', 'cmd.exe', 'powershell'], 
                description: 'Shell invocation in code', 
                riskLevel: 'HIGH',
                category: 'Command Injection',
                serverImpact: 'Direct shell access enables chaining attacks',
                recommendation: 'Never invoke shell; use direct program execution'
            },
            { 
                name: 'Dynamic Command Arguments', 
                patterns: ['exec(.*String.format', 'exec(.*StringBuilder', 'exec(new String\\[\\].*\\+'], 
                description: 'Command with concatenated arguments', 
                riskLevel: 'HIGH',
                category: 'Command Injection',
                serverImpact: 'Argument injection, command chaining',
                recommendation: 'Use parameterized command arrays without concatenation'
            },
            { 
                name: 'Native Command Execution', 
                patterns: ['System.loadLibrary', 'System.load', 'JNI', 'native void', '@JvmNative'], 
                description: 'JNI/native code execution', 
                riskLevel: 'MEDIUM',
                category: 'Command Injection',
                serverImpact: 'Native code may execute system commands',
                recommendation: 'Audit native code for command execution'
            },
            { 
                name: 'Root Command Execution', 
                patterns: ['su -c', 'su"', 'ROOT', 'requestRoot', 'isRooted'], 
                description: 'Root/su command execution', 
                riskLevel: 'HIGH',
                category: 'Command Injection',
                serverImpact: 'Privileged command execution on rooted devices',
                recommendation: 'Never execute commands as root; detect and block on rooted devices'
            }
        ];

        // 7. File Handling & Object Access
        const fileHandlingChecks = [
            { name: 'Upload Endpoints', patterns: ['uploadFile', 'upload/', '/upload', 'multipart', 'fileUpload'], description: 'File upload functionality', insight: 'Upload endpoints may lack proper file validation and access control' },
            { name: 'Download Endpoints', patterns: ['downloadFile', 'download/', '/download', 'getFile', 'fetchFile'], description: 'File download functionality', insight: 'Download endpoints may be vulnerable to path traversal/IDOR' },
            { name: 'Client Filenames', patterns: ['fileName:', 'filename:', 'file_name:', 'setFileName(', 'name:'], description: 'Client-supplied filenames', insight: 'User-controlled filenames may enable path traversal attacks' },
            { name: 'File Paths', patterns: ['filePath:', 'path:', 'file_path:', 'setPath(', '/storage/', '/files/'], description: 'Client-supplied file paths', insight: 'Path parameters may allow unauthorized file access' },
            { name: 'Object IDs', patterns: ['fileId:', 'documentId:', 'imageId:', 'attachmentId:', 'mediaId:'], description: 'Object identifiers in requests', insight: 'Predictable IDs may enable IDOR attacks' },
            { name: 'Direct URLs', patterns: ['fileUrl:', 'document_url:', 'mediaUrl:', 'downloadUrl:', 'https://'], description: 'Direct file URLs', insight: 'Exposed file URLs may lack access control' },
            { name: 'S3/Cloud Storage', patterns: ['s3.amazonaws', 'storage.googleapis', 'blob.core.windows', 'amazonaws.com', '.blob.'], description: 'Cloud storage references', insight: 'Publicly accessible cloud buckets may leak sensitive files' },
        ];

        // 8. Error Handling & Debug Exposure
        const errorHandlingChecks = [
            { name: 'Verbose Error Display', patterns: ['error.getMessage()', 'exception.toString()', 'printStackTrace', 'Log.e.*exception'], description: 'Detailed error rendering', insight: 'Backend errors may expose stack traces and internal details' },
            { name: 'Server Response Logging', patterns: ['Log.d.*response', 'Log.i.*response', 'response.body()', 'responseBody'], description: 'Full response logging', insight: 'Logged responses may reveal sensitive backend data' },
            { name: 'Debug Flags', patterns: ['DEBUG', 'BuildConfig.DEBUG', 'isDebug', 'debugEnabled', 'VERBOSE'], description: 'Debug mode flags', insight: 'Debug builds may expose additional error information' },
            { name: 'Stack Trace Handling', patterns: ['getStackTrace', 'printStackTrace', 'Throwable', 'StackTraceElement'], description: 'Stack trace processing', insight: 'Client stack trace handling suggests backend sends detailed errors' },
            { name: 'Error Message Display', patterns: ['Toast.*error', 'showError', 'displayError', 'errorMessage', 'AlertDialog.*error'], description: 'Error message UI', insight: 'Displayed errors may leak backend implementation details' },
            { name: 'Exception Types', patterns: ['SQLException', 'NullPointerException', 'IllegalStateException', 'IOException'], description: 'Specific exception handling', insight: 'Detailed exception types suggest verbose server errors' },
        ];

        // 9. Environment & Infrastructure Leakage
        const envLeakageChecks = [
            { name: 'Staging URLs', patterns: ['staging.', '-staging.', 'stage.', '-stage.', 'stg.', '.staging'], description: 'Staging environment URLs', insight: 'Staging environments may be externally accessible with weak security' },
            { name: 'Dev URLs', patterns: ['dev.', '-dev.', 'development.', '.dev.', 'localhost:', '127.0.0.1'], description: 'Development environment URLs', insight: 'Dev environments often lack production security controls' },
            { name: 'Internal IPs', patterns: ['192.168.', '10.0.', '172.16.', '127.0.0.1', 'localhost'], description: 'Internal IP addresses', insight: 'Hardcoded internal IPs may indicate network topology' },
            { name: 'Internal Hostnames', patterns: ['.internal', '.local', '.corp', '.lan', '-internal'], description: 'Internal hostnames', insight: 'Internal domain names may be resolvable externally' },
            { name: 'Firebase Config', patterns: ['firebase', 'firebaseio.com', 'firebaseConfig', 'google-services.json'], description: 'Firebase project configuration', insight: 'Firebase projects may have permissive security rules' },
            { name: 'AWS Resources', patterns: ['amazonaws.com', 's3.', 'cloudfront', 'elasticbeanstalk', 'AKIA'], description: 'AWS resource identifiers', insight: 'AWS resources may have misconfigured access policies' },
            { name: 'Cloud Identifiers', patterns: ['.azurewebsites.', '.cloudapp.', '.herokuapp.', 'appspot.com'], description: 'Cloud platform identifiers', insight: 'Cloud services may have default/weak configurations' },
        ];

        // 10. Cryptographic Trust Signals
        const cryptoTrustChecks = [
            { name: 'Hardcoded Crypto Keys', patterns: ['SecretKeySpec', 'new byte[]{', 'AES_KEY', 'ENCRYPTION_KEY', 'private static final'], description: 'Hardcoded encryption keys', insight: 'If client has keys, attackers can extract and replicate encryption' },
            { name: 'Client-Side Signing', patterns: ['sign(', 'signature', 'HMAC', 'HmacSHA', 'Mac.getInstance'], description: 'Client generates signatures', insight: 'Client signing capability enables attackers to forge valid requests' },
            { name: 'Custom Crypto', patterns: ['XOR', 'xor(', 'customEncrypt', 'myEncrypt', 'obfuscate'], description: 'Custom cryptographic functions', insight: 'Custom crypto is often weak and reversible by attackers' },
            { name: 'Weak Algorithms', patterns: ['MD5', 'SHA1', 'DES', 'RC4', 'ECB'], description: 'Weak cryptographic algorithms', insight: 'Weak algorithms suggest inadequate server-side security' },
            { name: 'Client Token Gen', patterns: ['generateToken', 'createToken', 'newToken', 'UUID.randomUUID'], description: 'Client generates tokens', insight: 'Client-generated tokens may be predictable or forgeable' },
            { name: 'Verification Logic', patterns: ['verify(', 'checkSignature', 'validateHash', 'verifyToken'], description: 'Client performs verification', insight: 'If client can verify, server may accept client-validated data' },
            { name: 'Shared Secrets', patterns: ['API_SECRET', 'SECRET_KEY', 'SHARED_SECRET', 'CLIENT_SECRET'], description: 'Shared secrets in code', insight: 'Shared secrets in client code are extractable by attackers' },
        ];


        // Global state
        let globalAPKData = { file: null, content: null, manifestContent: null, isLoaded: false };
        let decompiledSourceData = { files: [], content: null, isLoaded: false, fileCount: 0, manifestXml: null };

        /**
         * Step 2: Parse manifest XML and extract application-level permission and custom permissions
         * @param {string} xmlString - The AndroidManifest.xml content as string
         * @returns {Object} - { packageName, appPermission, customPermissions }
         */
        function parseManifestPermissions(xmlString) {
            const result = {
                packageName: null,
                appPermission: null,
                customPermissions: {}  // { permissionName: protectionLevel }
            };
            
            if (!xmlString) {
                console.warn('parseManifestPermissions: No XML string provided');
                return result;
            }
            
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(xmlString, 'text/xml');
                
                // Check for parsing errors
                const parseError = doc.querySelector('parsererror');
                if (parseError) {
                    console.error('parseManifestPermissions: XML parsing error:', parseError.textContent);
                    return result;
                }
                
                // Get package name from <manifest> element
                const manifestNode = doc.querySelector('manifest');
                if (manifestNode) {
                    result.packageName = manifestNode.getAttribute('package');
                    console.log('parseManifestPermissions: Package name:', result.packageName);
                }
                
                // Get application-level permission from <application> element
                const applicationNode = doc.querySelector('application');
                if (applicationNode) {
                    // Try both with and without android: namespace
                    result.appPermission = applicationNode.getAttribute('android:permission') 
                        || applicationNode.getAttributeNS('http://schemas.android.com/apk/res/android', 'permission');
                    
                    if (result.appPermission) {
                        console.log('parseManifestPermissions: App-level permission:', result.appPermission);
                    }
                }
                
                // Extract custom permissions from <permission> elements
                const permissionNodes = doc.querySelectorAll('permission');
                permissionNodes.forEach(permNode => {
                    // Try both with and without android: namespace
                    const name = permNode.getAttribute('android:name') 
                        || permNode.getAttributeNS('http://schemas.android.com/apk/res/android', 'name');
                    
                    let protectionLevel = permNode.getAttribute('android:protectionLevel') 
                        || permNode.getAttributeNS('http://schemas.android.com/apk/res/android', 'protectionLevel')
                        || 'normal';  // Default to 'normal' if not specified
                    
                    if (name) {
                        result.customPermissions[name] = protectionLevel;
                    }
                });
                
                const customPermCount = Object.keys(result.customPermissions).length;
                if (customPermCount > 0) {
                    console.log('parseManifestPermissions: Found', customPermCount, 'custom permissions:', result.customPermissions);
                }
                
                return result;
                
            } catch (error) {
                console.error('parseManifestPermissions: Error parsing manifest:', error);
                return result;
            }
        }

        /**
         * Step 1: Locate and read AndroidManifest.xml from JADX decompiled folder
         * @param {FileList|Array} files - Array of files from the JADX folder
         * @returns {Promise<string|null>} - The XML content as string, or null if not found
         */
        async function findAndReadManifest(files) {
            const fileArray = Array.from(files);
            
            // Common paths where AndroidManifest.xml is located in JADX output
            const manifestPaths = [
                'AndroidManifest.xml',
                'resources/AndroidManifest.xml',
                'res/AndroidManifest.xml'
            ];
            
            // Search for AndroidManifest.xml
            let manifestFile = null;
            
            for (const file of fileArray) {
                const filePath = file.webkitRelativePath || file.relativePath || file.name;
                const normalizedPath = filePath.replace(/\\/g, '/');
                
                // Check if this file ends with any of the known manifest paths
                for (const manifestPath of manifestPaths) {
                    if (normalizedPath.endsWith(manifestPath) || 
                        normalizedPath.toLowerCase().endsWith(manifestPath.toLowerCase())) {
                        manifestFile = file;
                        console.log('Found AndroidManifest.xml at:', normalizedPath);
                        break;
                    }
                }
                
                if (manifestFile) break;
            }
            
            // If not found by path, search by filename
            if (!manifestFile) {
                for (const file of fileArray) {
                    const fileName = file.name.toLowerCase();
                    if (fileName === 'androidmanifest.xml') {
                        manifestFile = file;
                        const filePath = file.webkitRelativePath || file.relativePath || file.name;
                        console.log('Found AndroidManifest.xml by filename at:', filePath);
                        break;
                    }
                }
            }
            
            if (!manifestFile) {
                console.warn('AndroidManifest.xml not found in JADX folder');
                return null;
            }
            
            try {
                const xmlContent = await manifestFile.text();
                console.log('Successfully read AndroidManifest.xml, length:', xmlContent.length);
                return xmlContent;
            } catch (error) {
                console.error('Error reading AndroidManifest.xml:', error);
                return null;
            }
        }
        let currentFilter = 'all';
        let currentCodeFilter = 'all';
        let currentEndpointFilterType = 'all';
        let currentFlagCategoryFilter = 'all';
        let currentStorageCategoryFilter = 'all';
        let currentCryptoCategoryFilter = 'all';
        let currentLoggingCategoryFilter = 'all';
        let currentRootResults = [], currentEmulatorResults = [], currentSSLResults = [], currentFlagResults = [], currentStorageResults = [], currentCryptoResults = [], currentLoggingResults = [];
        let currentAuthResults = [], currentAuthzResults = [];
        let currentFeatureFlagsResults = [], currentHiddenEndpointsResults = [], currentAuthTrustResults = [];
        let currentMassAssignmentResults = [], currentInputValidationResults = [], currentBusinessLogicResults = [];
        let currentFileHandlingResults = [], currentErrorHandlingResults = [], currentEnvLeakageResults = [], currentCryptoTrustResults = [];
        // Server-Side Vulnerability Analysis Results
        let currentSqlInjectionResults = [], currentNosqlInjectionResults = [], currentSsrfResults = [];
        let currentXxeResults = [], currentDeserializationResults = [], currentCommandInjectionResults = [];
        let currentManifestPostureResults = [];
        let extractedEndpoints = [];
        let currentEndpointFilter = 'all';
        let currentEndpointSection = null;
        let allEndpointSectionsExpanded = true;
        let analyzedComponents = [];
        let customPermissions = {};
        let appPermission = null;
        let currentPermFilter = 'all';
        let currentComponentTypeFilter = 'all';
        let currentComponentFilter = 'all';
        let analyzedPermComponents = [];
        
        // Permission classification sets (from Python script)
        const NORMAL_PERMISSIONS = new Set([
            "android.permission.INTERNET", "android.permission.ACCESS_NETWORK_STATE", "android.permission.ACCESS_WIFI_STATE",
            "android.permission.BLUETOOTH", "android.permission.BLUETOOTH_ADMIN", "android.permission.NFC",
            "android.permission.VIBRATE", "android.permission.WAKE_LOCK", "android.permission.FLASHLIGHT",
            "android.permission.EXPAND_STATUS_BAR", "android.permission.KILL_BACKGROUND_PROCESSES",
            "android.permission.FOREGROUND_SERVICE", "android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS",
            "android.permission.RECEIVE_BOOT_COMPLETED", "android.permission.SET_WALLPAPER", "android.permission.SET_WALLPAPER_HINTS"
        ]);
        
        const DANGEROUS_PERMISSIONS = new Set([
            "android.permission.ACCESS_FINE_LOCATION", "android.permission.ACCESS_COARSE_LOCATION",
            "android.permission.ACCESS_BACKGROUND_LOCATION", "android.permission.CAMERA",
            "android.permission.READ_CONTACTS", "android.permission.WRITE_CONTACTS", "android.permission.GET_ACCOUNTS",
            "android.permission.READ_PHONE_STATE", "android.permission.READ_PHONE_NUMBERS", "android.permission.CALL_PHONE",
            "android.permission.ANSWER_PHONE_CALLS", "android.permission.READ_CALL_LOG", "android.permission.WRITE_CALL_LOG",
            "android.permission.ADD_VOICEMAIL", "android.permission.USE_SIP", "android.permission.PROCESS_OUTGOING_CALLS",
            "android.permission.SEND_SMS", "android.permission.RECEIVE_SMS", "android.permission.READ_SMS",
            "android.permission.RECEIVE_WAP_PUSH", "android.permission.RECEIVE_MMS",
            "android.permission.READ_EXTERNAL_STORAGE", "android.permission.WRITE_EXTERNAL_STORAGE",
            "android.permission.ACCESS_MEDIA_LOCATION", "android.permission.RECORD_AUDIO",
            "android.permission.READ_CALENDAR", "android.permission.WRITE_CALENDAR",
            "android.permission.BODY_SENSORS", "android.permission.ACTIVITY_RECOGNITION"
        ]);
        
        const SIGNATURE_PERMISSIONS = new Set([
            "android.permission.WRITE_SECURE_SETTINGS", "android.permission.STATUS_BAR", "android.permission.READ_LOGS",
            "android.permission.INTERACT_ACROSS_USERS", "android.permission.MANAGE_USERS", "android.permission.BACKUP",
            "android.permission.BIND_DEVICE_ADMIN", "android.permission.CLEAR_APP_CACHE", "android.permission.DIAGNOSTIC",
            "android.permission.DUMP", "android.permission.FACTORY_TEST", "android.permission.MASTER_CLEAR",
            "android.permission.REBOOT", "android.permission.SET_TIME"
        ]);
        
        const SIGNATURE_PRIVILEGED_PERMISSIONS = new Set([
            "android.permission.MODIFY_PHONE_STATE", "android.permission.INSTALL_PACKAGES", "android.permission.DELETE_PACKAGES",
            "android.permission.MOUNT_UNMOUNT_FILESYSTEMS", "android.permission.WRITE_SETTINGS", "android.permission.WRITE_APN_SETTINGS",
            "android.permission.BROADCAST_SMS", "android.permission.CHANGE_COMPONENT_ENABLED_STATE",
            "android.permission.CONNECTIVITY_INTERNAL", "android.permission.UPDATE_DEVICE_STATS"
        ]);
        
        const INTERNAL_SYSTEM_PERMISSIONS = new Set([
            "android.permission.SHUTDOWN", "android.permission.STOP_APP_SWITCHES", "android.permission.DISABLE_KEYGUARD",
            "android.permission.MANAGE_USERS", "android.permission.INTERACT_ACROSS_USERS_FULL",
            "android.permission.FORCE_STOP_PACKAGES", "android.permission.KILL_BACKGROUND_PROCESSES"
        ]);
        
        const APPOPS_PERMISSIONS = new Set([
            "android.permission.SYSTEM_ALERT_WINDOW", "android.permission.PACKAGE_USAGE_STATS",
            "android.permission.WRITE_SETTINGS", "android.permission.REQUEST_INSTALL_PACKAGES"
        ]);
        
        // Classify Android permission (from Python script)
        function classifyAndroidPermission(perm) {
            if (DANGEROUS_PERMISSIONS.has(perm)) return { protectionLevel: "dangerous", risk: "HIGH" };
            if (SIGNATURE_PRIVILEGED_PERMISSIONS.has(perm)) return { protectionLevel: "signature|privileged", risk: "LOW" };
            if (SIGNATURE_PERMISSIONS.has(perm)) return { protectionLevel: "signature", risk: "LOW" };
            if (INTERNAL_SYSTEM_PERMISSIONS.has(perm)) return { protectionLevel: "internal", risk: "LOW" };
            if (APPOPS_PERMISSIONS.has(perm)) return { protectionLevel: "appops", risk: "MEDIUM" };
            if (NORMAL_PERMISSIONS.has(perm)) return { protectionLevel: "normal", risk: "LOW" };
            return { protectionLevel: "unknown/system", risk: "MEDIUM" };
        }
        
        // Resolve permission with risk (from Python script logic)
        function resolvePermissionWithRisk(perm, customPerms) {
            if (!perm) return { permission: "NONE", protectionLevel: "PUBLIC", risk: "HIGH" };
            
            if (perm.startsWith("android.permission.")) {
                const { protectionLevel, risk } = classifyAndroidPermission(perm);
                return { permission: perm, protectionLevel, risk };
            }
            
            if (customPerms && customPerms[perm]) {
                const level = customPerms[perm].toLowerCase();
                if (level.includes("signature") && level.includes("privileged")) {
                    return { permission: perm, protectionLevel: "signature|privileged", risk: "LOW" };
                } else if (level.includes("signature")) {
                    return { permission: perm, protectionLevel: "signature", risk: "LOW" };
                } else if (level.includes("dangerous")) {
                    return { permission: perm, protectionLevel: "dangerous", risk: "HIGH" };
                } else if (level.includes("internal")) {
                    return { permission: perm, protectionLevel: "internal", risk: "LOW" };
                }
                return { permission: perm, protectionLevel: "normal", risk: "MEDIUM" };
            }
            
            return { permission: perm, protectionLevel: "normal (implicit)", risk: "MEDIUM" };
        }
        
        // Analyze permissions from AndroidManifest.xml
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
            { name: 'SU Binary Check', patterns: ['/system/bin/su', '/system/xbin/su', '/sbin/su', '/su/bin/su', 'which su'], description: 'Checks for su binary presence' },
            { name: 'Superuser APK', patterns: ['Superuser.apk', 'com.noshufou.android.su', 'com.thirdparty.superuser'], description: 'Checks for Superuser app' },
            { name: 'Magisk Detection', patterns: ['magisk', 'com.topjohnwu.magisk', '/sbin/.magisk', 'MagiskManager', 'MagiskHide'], description: 'Checks for Magisk root manager' },
            { name: 'SuperSU Detection', patterns: ['eu.chainfire.supersu', 'SuperSU', '/su/', 'daemonsu'], description: 'Checks for SuperSU' },
            { name: 'RootBeer Library', patterns: ['RootBeer', 'com.scottyab.rootbeer', 'isRooted', 'detectRootManagementApps'], description: 'Uses RootBeer library' },
            { name: 'SafetyNet/Play Integrity', patterns: ['SafetyNet', 'safetynet', 'PlayIntegrity', 'IntegrityManager'], description: 'Google SafetyNet/Play Integrity API' },
        ];

        const emulatorChecks = [
            { name: 'Build.FINGERPRINT', patterns: ['Build.FINGERPRINT', 'generic', 'unknown', 'google/sdk'], description: 'Checks device fingerprint' },
            { name: 'Build.MODEL', patterns: ['Build.MODEL', 'sdk', 'Emulator', 'Android SDK'], description: 'Checks device model' },
            { name: 'QEMU Detection', patterns: ['qemu', 'QEMU', 'goldfish', '/dev/qemu_pipe'], description: 'Checks for QEMU emulator' },
            { name: 'Genymotion Detection', patterns: ['genymotion', 'Genymotion', 'vbox'], description: 'Checks for Genymotion' },
            { name: 'BlueStacks Detection', patterns: ['bluestacks', 'BlueStacks', 'bst'], description: 'Checks for BlueStacks' },
        ];

        const sslPinningChecks = [
            { name: 'OkHttp Certificate Pinner', patterns: ['CertificatePinner', 'sha256/', 'sha1/'], description: 'OkHttp certificate pinning' },
            { name: 'Network Security Config', patterns: ['network_security_config', 'pin-set', 'trust-anchors'], description: 'Android Network Security Config' },
            { name: 'TrustManager', patterns: ['TrustManager', 'X509TrustManager', 'checkServerTrusted'], description: 'Custom TrustManager' },
            { name: 'SSL Pinning Libraries', patterns: ['TrustKit', 'appmattus', 'certificatetransparency'], description: 'SSL pinning libraries' },
            { name: 'Disabled Hostname Verification', patterns: ['ALLOW_ALL_HOSTNAME_VERIFIER', 'setHostnameVerifier', 'HostnameVerifier.*return\\s+true'], description: 'Custom HostnameVerifier that may accept any certificate — verify it pins or validates the hostname' },
            { name: 'SSL Errors Ignored', patterns: ['onReceivedSslError', 'handler\\.proceed\\(\\)', 'SslError'], description: 'WebView SSL errors bypassed via handler.proceed()' },
            { name: 'Mixed Content Allowed', patterns: ['MIXED_CONTENT_ALWAYS_ALLOW', 'setMixedContentMode'], description: 'WebView mixed HTTP/HTTPS content policy' },
        ];

        const manifestPostureChecks = [
            { name: 'Outdated targetSdkVersion', patterns: ['targetSdkVersion="21"', 'targetSdkVersion="22"', 'targetSdkVersion="23"', 'targetSdkVersion="24"', 'targetSdkVersion="25"', 'targetSdkVersion="26"', 'targetSdkVersion="27"', 'targetSdkVersion="28"', 'targetSdkVersion="29"', 'targetSdkVersion="30"', 'targetSdkVersion="31"', 'targetSdkVersion="32"', 'targetSdkVersion="33"', 'targetSdkVersion="34"'], description: 'Targets API 34 or below; misses scoped storage, permission and export hardening (baseline 35)', category: 'SDK Posture' },
            { name: 'Legacy minSdkVersion', patterns: ['minSdkVersion="16"', 'minSdkVersion="17"', 'minSdkVersion="18"', 'minSdkVersion="19"', 'minSdkVersion="20"', 'minSdkVersion="21"', 'minSdkVersion="22"'], description: 'No Android 6 runtime permission model (API 23+)', category: 'SDK Posture' },
            { name: 'High-Risk Permissions', patterns: ['QUERY_ALL_PACKAGES', 'BIND_ACCESSIBILITY_SERVICE', 'BIND_NOTIFICATION_LISTENER_SERVICE', 'BIND_VPN_SERVICE', 'PACKAGE_USAGE_STATS', 'READ_SMS', 'RECEIVE_SMS', 'SEND_SMS', 'READ_CALL_LOG', 'PROCESS_OUTGOING_CALLS', 'BIND_DEVICE_ADMIN', 'SYSTEM_ALERT_WINDOW', 'REQUEST_INSTALL_PACKAGES', 'MANAGE_EXTERNAL_STORAGE', 'ACCESS_BACKGROUND_LOCATION'], description: 'Manifest declares permissions commonly abused for surveillance, overlay or takeover', category: 'Permission Posture' },
            { name: 'SMS Interception Surface', patterns: ['SMS_RECEIVED', 'SMS_DELIVER', 'android.provider.Telephony.SMS_RECEIVED'], description: 'Component reacts to incoming SMS (OTP interception review)', category: 'Component Posture' },
            { name: 'Boot Persistence Receivers', patterns: ['BOOT_COMPLETED', 'QUICKBOOT_POWERON', 'PACKAGE_ADDED', 'PACKAGE_REPLACED'], description: 'Receivers that auto-start or persist across installs', category: 'Component Posture' },
            { name: 'Sticky Broadcasts', patterns: ['sendStickyBroadcast', 'sendStickyOrderedBroadcast'], description: 'Sticky broadcasts linger and leak to any receiver', category: 'Component Posture' },
            { name: 'Risky FileProvider Paths', patterns: ['root-path', 'external-path'], description: 'FileProvider exposes device-root or shared-storage paths', category: 'Component Posture' },
            { name: 'Debuggable/Test/Legacy Flags', patterns: ['testOnly="true"', 'requestLegacyExternalStorage="true"', 'preserveLegacyExternalStorage'], description: 'Test-only build or scoped-storage opt-out', category: 'Manifest Flags' },
        ];

        const flagChecks = [
            { name: 'FLAG_SECURE', patterns: ['FLAG_SECURE', 'WindowManager.LayoutParams.FLAG_SECURE'], description: 'Screenshot protection', category: 'Screen Protection' },
            { name: 'Tapjacking Protection', patterns: ['filterTouchesWhenObscured', 'FLAG_WINDOW_IS_OBSCURED'], description: 'Overlay protection', category: 'UI Security' },
            { name: 'WebView JavaScript', patterns: ['setJavaScriptEnabled', 'evaluateJavascript'], description: 'WebView JS enabled', category: 'WebView Security' },
            { name: 'WebView File Access', patterns: ['setAllowFileAccess', 'setAllowFileAccessFromFileURLs'], description: 'WebView file access', category: 'WebView Security' },
            { name: 'Debuggable', patterns: ['android:debuggable="true"', 'BuildConfig.DEBUG'], description: 'Debug mode enabled', category: 'Build Security' },
            { name: 'Backup Enabled', patterns: ['android:allowBackup="true"', 'allowBackup'], description: 'Backup enabled', category: 'Data Security' },
            { name: 'Cleartext Traffic', patterns: ['usesCleartextTraffic', 'cleartextTrafficPermitted'], description: 'HTTP allowed', category: 'Network Security' },
            { name: 'Exported Components', patterns: ['android:exported="true"', 'exported="true"'], description: 'Exported without permission', category: 'Component Security' },
            { name: 'PendingIntent Flags', patterns: ['FLAG_IMMUTABLE', 'FLAG_MUTABLE', 'FLAG_UPDATE_CURRENT'], description: 'PendingIntent security', category: 'Intent Security' },
            { name: 'Launch Mode', patterns: ['singleTask', 'singleInstance', 'taskAffinity'], description: 'Activity launch mode', category: 'Activity Security' },
            { name: 'Anti-Hooking', patterns: ['Frida', 'frida', 'Xposed', 'xposed', 'substrate'], description: 'Anti-tampering checks', category: 'Runtime Security' },
            { name: 'WebView Remote Debugging', patterns: ['setWebContentsDebuggingEnabled(true)', 'setWebContentsDebuggingEnabled'], description: 'WebView remote debugging enabled', category: 'WebView Security' },
            { name: 'WebView Universal File Access', patterns: ['setAllowUniversalAccessFromFileURLs(true)', 'setAllowUniversalAccessFromFileURLs'], description: 'WebView file-origin SOP bypass', category: 'WebView Security' },
        ];

        const localStorageChecks = [
            // SharedPreferences
            { name: 'SharedPreferences Usage', patterns: ['SharedPreferences', 'getSharedPreferences', 'MODE_PRIVATE', 'MODE_WORLD_READABLE', 'MODE_WORLD_WRITEABLE'], description: 'SharedPreferences usage detected', category: 'SharedPreferences' },
            { name: 'Token in SharedPrefs', patterns: ['putString("token', 'putString("access_token', 'putString("auth', 'putString("session', 'putString("jwt'], description: 'Authentication tokens stored in SharedPreferences', category: 'SharedPreferences' },
            { name: 'Credentials in SharedPrefs', patterns: ['putString("password', 'putString("passwd', 'putString("pwd', 'putString("pin', 'putString("secret'], description: 'Credentials stored in SharedPreferences', category: 'SharedPreferences' },
            { name: 'Unencrypted SharedPrefs', patterns: ['getSharedPreferences', 'PreferenceManager'], description: 'SharedPreferences without encryption (use EncryptedSharedPreferences)', category: 'SharedPreferences' },
            
            // SQLite
            { name: 'SQLite Database Usage', patterns: ['SQLiteDatabase', 'SQLiteOpenHelper', 'execSQL', 'rawQuery', 'openOrCreateDatabase'], description: 'SQLite database usage', category: 'SQLite' },
            { name: 'Unencrypted SQLite', patterns: ['SQLiteDatabase', 'openDatabase', 'getWritableDatabase', 'getReadableDatabase'], description: 'SQLite without encryption (consider SQLCipher)', category: 'SQLite' },
            { name: 'SQL Injection Risk', patterns: ['rawQuery', 'execSQL', 'query(', '+ "SELECT', '+ "INSERT', '+ "UPDATE', '+ "DELETE'], description: 'Potential SQL injection vulnerabilities', category: 'SQLite' },
            
            // File Storage
            { name: 'External Storage', patterns: ['getExternalStorageDirectory', 'getExternalFilesDir', '/sdcard/', 'EXTERNAL_STORAGE', 'Environment.getExternalStorage'], description: 'External storage usage (world-readable)', category: 'File Storage' },
            { name: 'Cache Directory', patterns: ['getCacheDir', 'getExternalCacheDir', 'cache/', '.cache'], description: 'Cache directory usage', category: 'File Storage' },
            { name: 'World Readable Files', patterns: ['MODE_WORLD_READABLE', 'MODE_WORLD_WRITEABLE', 'setReadable(true', 'setWritable(true'], description: 'World-readable/writable file permissions', category: 'File Storage' },
            { name: 'Temp File Usage', patterns: ['createTempFile', '.tmp', '.temp', 'tempFile'], description: 'Temporary files that may persist', category: 'File Storage' },
            
            // Hardcoded Secrets - Comprehensive patterns from regex
            { name: 'Hardcoded Passwords', patterns: ['password=', 'passwd=', 'pass=', 'pwd=', 'password:', 'passwd:', 'PASSWORD', 'PASSWD'], description: 'Hardcoded password values', category: 'Hardcoded Secrets' },
            { name: 'Hardcoded Usernames', patterns: ['username=', 'user=', 'username:', 'user:', 'USERNAME', 'USER_NAME'], description: 'Hardcoded username values', category: 'Hardcoded Secrets' },
            { name: 'Hardcoded API Keys', patterns: ['api_key=', 'api_key:', 'apiKey=', 'apiKey:', 'API_KEY', 'x-api-key', 'apikey'], description: 'Hardcoded API key values', category: 'Hardcoded Secrets' },
            { name: 'Hardcoded Secrets', patterns: ['secret=', 'secret:', 'secret_key=', 'secret_key:', 'SECRET_KEY', 'secretKey', 'client_secret', 'clientSecret'], description: 'Hardcoded secret values', category: 'Hardcoded Secrets' },
            { name: 'Hardcoded Tokens', patterns: ['token=', 'token:', 'access_token=', 'access_token:', 'auth_token=', 'auth_token:', 'authToken', 'accessToken', 'bearer'], description: 'Hardcoded token values', category: 'Hardcoded Secrets' },
            { name: 'Hardcoded Credentials', patterns: ['credential', 'cred=', 'creds=', 'cred:', 'creds:', 'CREDENTIAL'], description: 'Hardcoded credential values', category: 'Hardcoded Secrets' },
            { name: 'Hardcoded Auth Values', patterns: ['auth=', 'auth:', 'authorization=', 'authorization:', 'AUTH_TOKEN', 'auth_token'], description: 'Hardcoded authentication values', category: 'Hardcoded Secrets' },
            { name: 'Hardcoded Private Keys', patterns: ['private_key', 'privateKey', 'PRIVATE_KEY', 'private=', 'private:', '-----BEGIN PRIVATE KEY-----', '-----BEGIN RSA PRIVATE KEY-----'], description: 'Hardcoded private key values', category: 'Hardcoded Secrets' },
            { name: 'Hardcoded Public Keys', patterns: ['public_key', 'publicKey', 'PUBLIC_KEY', '-----BEGIN PUBLIC KEY-----'], description: 'Hardcoded public key values', category: 'Hardcoded Secrets' },
            { name: 'Hardcoded JWT', patterns: ['jwt=', 'jwt:', 'JWT_SECRET', 'jwt_token', 'jwtToken', 'eyJ'], description: 'Hardcoded JWT tokens or secrets', category: 'Hardcoded Secrets' },
            { name: 'Hardcoded Session', patterns: ['session_id=', 'session_id:', 'sessionId', 'SESSION_ID', 'session_token'], description: 'Hardcoded session identifiers', category: 'Hardcoded Secrets' },
            { name: 'Hardcoded OAuth', patterns: ['oauth=', 'oauth:', 'oauth_token', 'oauth_secret', 'OAUTH', 'client_id=', 'client_id:'], description: 'Hardcoded OAuth credentials', category: 'Hardcoded Secrets' },
            { name: 'Hardcoded CSRF', patterns: ['csrf=', 'csrf:', 'csrf_token', 'csrfToken', 'CSRF_TOKEN', '_csrf'], description: 'Hardcoded CSRF tokens', category: 'Hardcoded Secrets' },
            { name: 'Hardcoded Database URLs', patterns: ['database_url', 'databaseUrl', 'DATABASE_URL', 'mongodb_uri', 'MONGODB_URI', 'mysql://', 'postgresql://', 'mongodb://'], description: 'Hardcoded database connection strings', category: 'Hardcoded Secrets' },
            { name: 'Hardcoded API URLs', patterns: ['api_url', 'apiUrl', 'API_URL', 'base_url', 'baseUrl', 'BASE_URL', 'endpoint='], description: 'Hardcoded API endpoint URLs', category: 'Hardcoded Secrets' },
            { name: 'AWS Credentials', patterns: ['AKIA', 'aws_access_key', 'aws_secret_key', 'AWS_ACCESS_KEY', 'AWS_SECRET_KEY', 'aws_access_key_id', 'aws_secret_access_key'], description: 'Hardcoded AWS credentials', category: 'Hardcoded Secrets' },
            { name: 'Azure Credentials', patterns: ['azure_client_secret', 'AZURE_CLIENT_SECRET', 'azure_tenant', 'AZURE_TENANT_ID', 'azure_client_id'], description: 'Hardcoded Azure credentials', category: 'Hardcoded Secrets' },
            { name: 'Google API Keys', patterns: ['google_api_key', 'GOOGLE_API_KEY', 'AIza', 'google-services.json', 'gcp_credentials'], description: 'Hardcoded Google/GCP credentials', category: 'Hardcoded Secrets' },
            { name: 'Firebase Credentials', patterns: ['firebase', 'FIREBASE', 'firebaseConfig', 'firebase_token', 'firebase_api_key'], description: 'Hardcoded Firebase credentials', category: 'Hardcoded Secrets' },
            { name: 'SMTP Credentials', patterns: ['smtp_password', 'SMTP_PASSWORD', 'smtp_user', 'mail_password', 'email_password'], description: 'Hardcoded SMTP/email credentials', category: 'Hardcoded Secrets' },
            { name: 'Password Hash', patterns: ['password_hash', 'passwordHash', 'PASSWORD_HASH', 'hash=', 'hashed_password'], description: 'Hardcoded password hashes', category: 'Hardcoded Secrets' },
            { name: 'Token Secrets', patterns: ['token_secret', 'tokenSecret', 'TOKEN_SECRET', 'refresh_token', 'refreshToken'], description: 'Hardcoded token secrets', category: 'Hardcoded Secrets' },
            { name: 'Base64 Encoded Secrets', patterns: ['eyJ', 'base64', 'Base64.decode', 'Base64.encode'], description: 'Potential Base64 encoded secrets (check for long Base64 strings)', category: 'Hardcoded Secrets' },
            { name: 'Encryption Keys', patterns: ['encryption_key', 'encryptionKey', 'ENCRYPTION_KEY', 'aes_key', 'AES_KEY', 'des_key'], description: 'Hardcoded encryption keys', category: 'Hardcoded Secrets' },
            { name: 'Signing Keys', patterns: ['signing_key', 'signingKey', 'SIGNING_KEY', 'sign_key', 'hmac_key', 'HMAC_KEY'], description: 'Hardcoded signing keys', category: 'Hardcoded Secrets' },
        ];

        const cryptographyChecks = [
            { name: 'MD5 Usage', patterns: ['MD5', 'MessageDigest.getInstance("MD5")'], description: 'Weak MD5 hash', category: 'Weak Algorithms' },
            { name: 'SHA-1 Usage', patterns: ['SHA-1', 'SHA1'], description: 'Deprecated SHA-1', category: 'Weak Algorithms' },
            { name: 'DES Encryption', patterns: ['DES', 'DESKeySpec'], description: 'Weak DES cipher', category: 'Weak Algorithms' },
            { name: 'ECB Mode', patterns: ['ECB', 'AES/ECB'], description: 'Insecure ECB mode', category: 'Weak Algorithms' },
            { name: 'Hardcoded Key', patterns: ['SecretKeySpec("', 'new SecretKeySpec'], description: 'Hardcoded crypto key', category: 'Key Management' },
            { name: 'Static IV', patterns: ['new IvParameterSpec("', 'IvParameterSpec(new byte'], description: 'Static IV usage', category: 'IV/Nonce Issues' },
            { name: 'Insecure Random', patterns: ['java.util.Random', 'new Random()'], description: 'Weak PRNG', category: 'Random Generation' },
            { name: 'Trust All Certs', patterns: ['TrustAllCerts', 'X509TrustManager', 'checkServerTrusted.*{}'], description: 'Certificate bypass', category: 'Certificate Validation' },
            { name: 'Custom Crypto', patterns: ['XOR', 'xorBytes', 'myEncrypt'], description: 'Custom crypto', category: 'Custom Crypto' },
            { name: 'Keystore Password', patterns: ['keyStore.load.*password', '"changeit"'], description: 'Hardcoded keystore pwd', category: 'Keystore Issues' },
        ];

        const insecureLoggingChecks = [
            // Credentials & Secrets in Logs
            { name: 'Password in Logs', patterns: ['Log.d.*password', 'Log.i.*password', 'Log.v.*password', 'Log.w.*password', 'Log.e.*password', 'Log.d.*passwd', 'Log.i.*passwd', 'Log.v.*passwd', 'Log.w.*passwd', 'Log.e.*passwd', 'Log.d.*pwd', 'Log.i.*pwd', 'Log.v.*pwd', 'Log.w.*pwd', 'Log.e.*pwd'], description: 'Password logged to system logs', category: 'Credentials & Secrets', riskLevel: 'HIGH' },
            { name: 'Auth Token in Logs', patterns: ['Log.d.*token', 'Log.i.*token', 'Log.v.*token', 'Log.w.*token', 'Log.e.*token', 'Log.d.*access_token', 'Log.i.*access_token', 'Log.v.*access_token', 'Log.w.*access_token', 'Log.e.*access_token', 'Log.d.*jwt', 'Log.i.*jwt', 'Log.v.*jwt', 'Log.w.*jwt', 'Log.e.*jwt'], description: 'Authentication token logged to system logs', category: 'Credentials & Secrets', riskLevel: 'HIGH' },
            { name: 'API Key in Logs', patterns: ['Log.d.*api_key', 'Log.i.*api_key', 'Log.v.*api_key', 'Log.w.*api_key', 'Log.e.*api_key', 'Log.d.*apiKey', 'Log.i.*apiKey', 'Log.v.*apiKey', 'Log.w.*apiKey', 'Log.e.*apiKey', 'Log.d.*API_KEY', 'Log.i.*API_KEY', 'Log.v.*API_KEY', 'Log.w.*API_KEY', 'Log.e.*API_KEY'], description: 'API key logged to system logs', category: 'Credentials & Secrets', riskLevel: 'HIGH' },
            { name: 'Secret/Private Key in Logs', patterns: ['Log.d.*secret', 'Log.i.*secret', 'Log.v.*secret', 'Log.w.*secret', 'Log.e.*secret', 'Log.d.*private_key', 'Log.i.*private_key', 'Log.v.*private_key', 'Log.w.*private_key', 'Log.e.*private_key', 'Log.d.*privateKey', 'Log.i.*privateKey', 'Log.v.*privateKey', 'Log.w.*privateKey', 'Log.e.*privateKey'], description: 'Secret or private key logged to system logs', category: 'Credentials & Secrets', riskLevel: 'HIGH' },
            { name: 'Session ID in Logs', patterns: ['Log.d.*session', 'Log.i.*session', 'Log.v.*session', 'Log.w.*session', 'Log.e.*session', 'Log.d.*sessionId', 'Log.i.*sessionId', 'Log.v.*sessionId', 'Log.w.*sessionId', 'Log.e.*sessionId', 'Log.d.*JSESSIONID', 'Log.i.*JSESSIONID', 'Log.v.*JSESSIONID', 'Log.w.*JSESSIONID', 'Log.e.*JSESSIONID'], description: 'Session identifier logged to system logs', category: 'Credentials & Secrets', riskLevel: 'HIGH' },
            { name: 'OAuth Credentials in Logs', patterns: ['Log.d.*oauth', 'Log.i.*oauth', 'Log.v.*oauth', 'Log.w.*oauth', 'Log.e.*oauth', 'Log.d.*client_secret', 'Log.i.*client_secret', 'Log.v.*client_secret', 'Log.w.*client_secret', 'Log.e.*client_secret', 'Log.d.*clientSecret', 'Log.i.*clientSecret', 'Log.v.*clientSecret', 'Log.w.*clientSecret', 'Log.e.*clientSecret'], description: 'OAuth credentials logged to system logs', category: 'Credentials & Secrets', riskLevel: 'HIGH' },
            { name: 'Encryption Key in Logs', patterns: ['Log.d.*encryption_key', 'Log.i.*encryption_key', 'Log.v.*encryption_key', 'Log.w.*encryption_key', 'Log.e.*encryption_key', 'Log.d.*encryptionKey', 'Log.i.*encryptionKey', 'Log.v.*encryptionKey', 'Log.w.*encryptionKey', 'Log.e.*encryptionKey'], description: 'Encryption key logged to system logs', category: 'Credentials & Secrets', riskLevel: 'HIGH' },
            
            // PII in Logs
            { name: 'Email Address in Logs', patterns: ['Log.d.*email', 'Log.i.*email', 'Log.v.*email', 'Log.w.*email', 'Log.e.*email', 'Log.d.*@', 'Log.i.*@', 'Log.v.*@', 'Log.w.*@', 'Log.e.*@'], description: 'Email address logged to system logs', category: 'PII', riskLevel: 'MEDIUM' },
            { name: 'Phone Number in Logs', patterns: ['Log.d.*phone', 'Log.i.*phone', 'Log.v.*phone', 'Log.w.*phone', 'Log.e.*phone', 'Log.d.*phoneNumber', 'Log.i.*phoneNumber', 'Log.v.*phoneNumber', 'Log.w.*phoneNumber', 'Log.e.*phoneNumber', 'Log.d.*mobile', 'Log.i.*mobile', 'Log.v.*mobile', 'Log.w.*mobile', 'Log.e.*mobile'], description: 'Phone number logged to system logs', category: 'PII', riskLevel: 'MEDIUM' },
            { name: 'Username in Logs', patterns: ['Log.d.*username', 'Log.i.*username', 'Log.v.*username', 'Log.w.*username', 'Log.e.*username', 'Log.d.*userName', 'Log.i.*userName', 'Log.v.*userName', 'Log.w.*userName', 'Log.e.*userName', 'Log.d.*user_name', 'Log.i.*user_name', 'Log.v.*user_name', 'Log.w.*user_name', 'Log.e.*user_name'], description: 'Username logged to system logs', category: 'PII', riskLevel: 'MEDIUM' },
            { name: 'Device ID in Logs', patterns: ['Log.d.*IMEI', 'Log.i.*IMEI', 'Log.v.*IMEI', 'Log.w.*IMEI', 'Log.e.*IMEI', 'Log.d.*deviceId', 'Log.i.*deviceId', 'Log.v.*deviceId', 'Log.w.*deviceId', 'Log.e.*deviceId', 'Log.d.*ANDROID_ID', 'Log.i.*ANDROID_ID', 'Log.v.*ANDROID_ID', 'Log.w.*ANDROID_ID', 'Log.e.*ANDROID_ID'], description: 'Device identifier logged to system logs', category: 'PII', riskLevel: 'MEDIUM' },
            { name: 'User Data in Logs', patterns: ['Log.d.*userData', 'Log.i.*userData', 'Log.v.*userData', 'Log.w.*userData', 'Log.e.*userData', 'Log.d.*userInfo', 'Log.i.*userInfo', 'Log.v.*userInfo', 'Log.w.*userInfo', 'Log.e.*userInfo', 'Log.d.*personalInfo', 'Log.i.*personalInfo', 'Log.v.*personalInfo', 'Log.w.*personalInfo', 'Log.e.*personalInfo'], description: 'User data logged to system logs', category: 'PII', riskLevel: 'MEDIUM' },
            { name: 'Location Data in Logs', patterns: ['Log.d.*location', 'Log.i.*location', 'Log.v.*location', 'Log.w.*location', 'Log.e.*location', 'Log.d.*latitude', 'Log.i.*latitude', 'Log.v.*latitude', 'Log.w.*latitude', 'Log.e.*latitude', 'Log.d.*longitude', 'Log.i.*longitude', 'Log.v.*longitude', 'Log.w.*longitude', 'Log.e.*longitude', 'Log.d.*gps', 'Log.i.*gps', 'Log.v.*gps', 'Log.w.*gps', 'Log.e.*gps'], description: 'Location data logged to system logs', category: 'PII', riskLevel: 'MEDIUM' },
            
            // Stack Traces with Sensitive Data
            { name: 'Exception with Sensitive Data', patterns: ['Log.e.*Exception', 'printStackTrace', 'Log.e.*Throwable', 'Log.w.*Exception', 'Log.w.*Throwable'], description: 'Exception stack traces may expose sensitive information', category: 'PII', riskLevel: 'MEDIUM' },
        ];


        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            // APK Upload handlers
            const globalUploadZone = document.getElementById('globalUploadZone');
            const globalFileInput = document.getElementById('globalFileInput');
            
            if (globalFileInput) {
                globalFileInput.addEventListener('change', (e) => {
                    if (e.target.files[0]) handleAPKSelected(e.target.files[0]);
                });
            }

            if (globalUploadZone) {
                globalUploadZone.addEventListener('dragover', (e) => { e.preventDefault(); globalUploadZone.classList.add('dragover'); });
                globalUploadZone.addEventListener('dragleave', () => globalUploadZone.classList.remove('dragover'));
                globalUploadZone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    globalUploadZone.classList.remove('dragover');
                    const file = e.dataTransfer.files[0];
                    if (file && file.name.endsWith('.apk')) handleAPKSelected(file);
                });
            }

            // Decompiled folder upload handlers
            const decompiledFolderInput = document.getElementById('decompiledFolderInput');
            const decompiledUploadZone = document.getElementById('decompiledUploadZone');
            
            if (decompiledFolderInput) {
                decompiledFolderInput.addEventListener('change', (e) => {
                    console.log('Decompiled folder input changed:', e.target.files.length, 'files');
                    if (e.target.files.length > 0) {
                        handleDecompiledFolderSelected(e.target.files);
                    }
                });
            }

            if (decompiledUploadZone) {
                decompiledUploadZone.addEventListener('dragover', (e) => { 
                    e.preventDefault(); 
                    decompiledUploadZone.classList.add('dragover'); 
                });
                decompiledUploadZone.addEventListener('dragleave', () => decompiledUploadZone.classList.remove('dragover'));
                decompiledUploadZone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    decompiledUploadZone.classList.remove('dragover');
                    if (e.dataTransfer.items) {
                        handleDroppedDecompiledItems(e.dataTransfer.items);
                    }
                });
            }

            const hash = window.location.hash.replace('#', '') || 'misconfig';
            navigateTo(hash);
        });

        // Handle APK file selection (don't analyze yet, just store)
        function handleAPKSelected(file) {
            globalAPKData.file = file;
            document.getElementById('apkStatus').classList.remove('hidden');
            document.getElementById('apkFileName').textContent = file.name;
            document.getElementById('startAnalysisSection').classList.remove('hidden');
            updateAnalysisHint();
        }

        // Handle decompiled folder selection
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
            decompiledSourceData.files = fileArray;
            decompiledSourceData.fileCount = javaKotlinFiles.length;
            decompiledSourceData.isLoaded = true;

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
            decompiledSourceData.content = allContent;

            const folderName = fileArray[0]?.webkitRelativePath?.split('/')[0] || 'Decompiled Source';
            folderNameEl.textContent = `${folderName} (${javaKotlinFiles.length} files)`;
            
            // Show the start analysis button - JADX folder is sufficient on its own
            document.getElementById('startAnalysisSection').classList.remove('hidden');
            updateAnalysisHint();
            
            console.log('Decompiled source loaded successfully:', javaKotlinFiles.length, 'files,', allContent.length, 'characters');
        }

        // Handle dropped items for decompiled folder
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
            return new Promise((resolve) => {
                reader.readEntries(async (entries) => {
                    for (const entry of entries) {
                        if (entry.isFile) {
                            const file = await new Promise(res => entry.file(res));
                            file.relativePath = entry.fullPath;
                            files.push(file);
                        } else if (entry.isDirectory) {
                            await readDirectoryRecursiveForSource(entry, files);
                        }
                    }
                    resolve();
                });
            });
        }

        function updateAnalysisHint() {
            const hintText = document.getElementById('hintText');
            if (globalAPKData.file && decompiledSourceData.isLoaded) {
                hintText.innerHTML = '✅ APK + JADX source loaded. <span class="text-emerald-400">Best accuracy!</span>';
            } else if (globalAPKData.file) {
                hintText.innerHTML = 'APK loaded. <span class="text-gray-400">Add JADX folder for readable source code.</span>';
            } else if (decompiledSourceData.isLoaded) {
                hintText.innerHTML = '✅ JADX source loaded. <span class="text-gray-400">Add APK for endpoint extraction & manifest analysis.</span>';
            }
        }

        // Start the analysis (called by button click)
        async function startGlobalAnalysis() {
            if (!globalAPKData.file && !decompiledSourceData.isLoaded) {
                alert('Please select an APK file or JADX decompiled folder.');
                return;
            }
            
            if (globalAPKData.file) {
                await analyzeAPKGlobal(globalAPKData.file);
            } else if (decompiledSourceData.isLoaded) {
                // Analyze using only decompiled source
                await analyzeDecompiledSourceOnly();
            }
        }
        
        // Analyze using only decompiled source (no APK)
        async function analyzeDecompiledSourceOnly() {
            const globalUploadSection = document.getElementById('globalUploadSection');
            const globalLoadingSection = document.getElementById('globalLoadingSection');
            const globalFileInfo = document.getElementById('globalFileInfo');
            const progressBar = document.getElementById('globalProgressBar');
            const loadingStatus = document.getElementById('globalLoadingStatus');

            globalUploadSection.classList.add('hidden');
            globalLoadingSection.classList.remove('hidden');
            document.getElementById('globalLoadingTitle').textContent = 'Analyzing Source Code...';

            try {
                loadingStatus.textContent = 'Analyzing security patterns...';
                progressBar.style.width = '20%';

                const analysisContent = decompiledSourceData.content;
                console.log('Analyzing decompiled source:', analysisContent.length, 'characters');

                // Analyze all categories using decompiled source (true = source code mode)
                currentRootResults = analyzePatterns(analysisContent, rootChecks, true);
                console.log('Root results:', currentRootResults.filter(r => r.detected).length, 'detected');
                
                currentEmulatorResults = analyzePatterns(analysisContent, emulatorChecks, true);
                currentSSLResults = analyzePatterns(analysisContent, sslPinningChecks, true);
                currentFlagResults = analyzePatterns(analysisContent, flagChecks, true);
                currentStorageResults = analyzePatterns(analysisContent, localStorageChecks, true);
                currentCryptoResults = analyzePatterns(analysisContent, cryptographyChecks, true);
                currentLoggingResults = analyzePatterns(analysisContent, insecureLoggingChecks, true);
                currentAuthResults = analyzePatterns(analysisContent, authenticationChecks, true);
                currentAuthzResults = analyzePatterns(analysisContent, authorizationChecks, true);
                
                // Backend Risk Indicators
                currentFeatureFlagsResults = analyzePatterns(analysisContent, featureFlagsChecks, true);
                currentHiddenEndpointsResults = analyzePatterns(analysisContent, hiddenEndpointsChecks, true);
                currentAuthTrustResults = analyzePatterns(analysisContent, authTrustChecks, true);
                currentMassAssignmentResults = analyzePatterns(analysisContent, massAssignmentChecks, true);
                currentInputValidationResults = analyzePatterns(analysisContent, inputValidationChecks, true);
                currentBusinessLogicResults = analyzePatterns(analysisContent, businessLogicChecks, true);
                currentFileHandlingResults = analyzePatterns(analysisContent, fileHandlingChecks, true);
                currentErrorHandlingResults = analyzePatterns(analysisContent, errorHandlingChecks, true);
                currentEnvLeakageResults = analyzePatterns(analysisContent, envLeakageChecks, true);
                currentCryptoTrustResults = analyzePatterns(analysisContent, cryptoTrustChecks, true);
                
                // Server-Side Vulnerability Analysis
                currentSqlInjectionResults = analyzePatterns(analysisContent, sqlInjectionChecks, true);
                currentNosqlInjectionResults = analyzePatterns(analysisContent, nosqlInjectionChecks, true);
                currentSsrfResults = analyzePatterns(analysisContent, ssrfVulnerabilityChecks, true);
                currentXxeResults = analyzePatterns(analysisContent, xxeVulnerabilityChecks, true);
                currentDeserializationResults = analyzePatterns(analysisContent, deserializationVulnerabilityChecks, true);
                currentCommandInjectionResults = analyzePatterns(analysisContent, commandInjectionChecks, true);
                currentManifestPostureResults = analyzePatterns(analysisContent, manifestPostureChecks, true);
                
                console.log('Auth results:', currentAuthResults.filter(r => r.detected).length, 'detected');
                console.log('Total instances in auth:', currentAuthResults.reduce((sum, r) => sum + (r.instances?.length || 0), 0));

                progressBar.style.width = '70%';
                loadingStatus.textContent = 'Extracting endpoints...';
                extractedEndpoints = extractEndpoints(analysisContent);

                progressBar.style.width = '85%';
                loadingStatus.textContent = 'Analyzing permissions...';
                await analyzePermissionsFromManifest();

                progressBar.style.width = '100%';
                loadingStatus.textContent = 'Analysis complete!';
                await new Promise(r => setTimeout(r, 500));

                globalLoadingSection.classList.add('hidden');
                globalFileInfo.classList.remove('hidden');
                
                // Show folder name instead of APK name
                const folderName = decompiledSourceData.files[0]?.webkitRelativePath?.split('/')[0] || 'Decompiled Source';
                document.getElementById('globalFileName').textContent = folderName;
                document.getElementById('globalFileSize').textContent = `${decompiledSourceData.fileCount} Java/Kotlin files`;

                displayAllResults();
                globalAPKData.isLoaded = true;

            } catch (error) {
                console.error('Error:', error);
                alert('Error analyzing source: ' + error.message);
                resetGlobalAnalyzer();
            }
        }

        function navigateTo(page) {
            window.location.hash = page;
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            const selectedPage = document.getElementById(`page-${page}`);
            if (selectedPage) selectedPage.classList.add('active');
            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            const activeNav = document.getElementById(`nav-${page}`);
            if (activeNav) activeNav.classList.add('active');
            return false;
        }

        async function analyzeAPKGlobal(file) {
            const globalUploadSection = document.getElementById('globalUploadSection');
            const globalLoadingSection = document.getElementById('globalLoadingSection');
            const globalFileInfo = document.getElementById('globalFileInfo');
            const progressBar = document.getElementById('globalProgressBar');
            const loadingStatus = document.getElementById('globalLoadingStatus');

            globalUploadSection.classList.add('hidden');
            globalLoadingSection.classList.remove('hidden');

            try {
                globalAPKData.file = file;
                loadingStatus.textContent = 'Reading APK file...';
                progressBar.style.width = '5%';

                const zip = new JSZip();
                const contents = await zip.loadAsync(file);
                loadingStatus.textContent = 'Extracting contents...';
                progressBar.style.width = '15%';

                let allContent = '';
                const files = [];
                contents.forEach((path, entry) => { if (!entry.dir) files.push({ path, entry }); });

                for (let i = 0; i < files.length; i++) {
                    try {
                        allContent += await files[i].entry.async('string') + '\n';
                    } catch {
                        try {
                            const binary = await files[i].entry.async('uint8array');
                            allContent += new TextDecoder('utf-8', { fatal: false }).decode(binary) + '\n';
                        } catch {}
                    }
                    if (i % 50 === 0) progressBar.style.width = `${15 + (i / files.length) * 40}%`;
                }

                globalAPKData.content = allContent;
                loadingStatus.textContent = 'Analyzing security patterns...';
                progressBar.style.width = '60%';

                // Combine both APK and JADX content for comprehensive analysis
                let analysisContent = allContent;
                let usingDecompiledSource = false;
                
                if (decompiledSourceData.isLoaded && decompiledSourceData.content) {
                    // Prepend JADX content so it's analyzed first (better quality)
                    analysisContent = decompiledSourceData.content + '\n\n// === APK BYTECODE CONTENT ===\n\n' + allContent;
                    usingDecompiledSource = true;
                }

                // Analyze all categories - will find instances from both sources
                currentRootResults = analyzePatterns(analysisContent, rootChecks, usingDecompiledSource);
                currentEmulatorResults = analyzePatterns(analysisContent, emulatorChecks, usingDecompiledSource);
                currentSSLResults = analyzePatterns(analysisContent, sslPinningChecks, usingDecompiledSource);
                currentFlagResults = analyzePatterns(analysisContent, flagChecks, usingDecompiledSource);
                currentStorageResults = analyzePatterns(analysisContent, localStorageChecks, usingDecompiledSource);
                currentCryptoResults = analyzePatterns(analysisContent, cryptographyChecks, usingDecompiledSource);
                currentLoggingResults = analyzePatterns(analysisContent, insecureLoggingChecks, usingDecompiledSource);
                currentAuthResults = analyzePatterns(analysisContent, authenticationChecks, usingDecompiledSource);
                currentAuthzResults = analyzePatterns(analysisContent, authorizationChecks, usingDecompiledSource);
                
                // Backend Risk Indicators
                currentFeatureFlagsResults = analyzePatterns(analysisContent, featureFlagsChecks, usingDecompiledSource);
                currentHiddenEndpointsResults = analyzePatterns(analysisContent, hiddenEndpointsChecks, usingDecompiledSource);
                currentAuthTrustResults = analyzePatterns(analysisContent, authTrustChecks, usingDecompiledSource);
                currentMassAssignmentResults = analyzePatterns(analysisContent, massAssignmentChecks, usingDecompiledSource);
                currentInputValidationResults = analyzePatterns(analysisContent, inputValidationChecks, usingDecompiledSource);
                currentBusinessLogicResults = analyzePatterns(analysisContent, businessLogicChecks, usingDecompiledSource);
                currentFileHandlingResults = analyzePatterns(analysisContent, fileHandlingChecks, usingDecompiledSource);
                currentErrorHandlingResults = analyzePatterns(analysisContent, errorHandlingChecks, usingDecompiledSource);
                currentEnvLeakageResults = analyzePatterns(analysisContent, envLeakageChecks, usingDecompiledSource);
                currentCryptoTrustResults = analyzePatterns(analysisContent, cryptoTrustChecks, usingDecompiledSource);
                
                // Server-Side Vulnerability Analysis
                currentSqlInjectionResults = analyzePatterns(analysisContent, sqlInjectionChecks, usingDecompiledSource);
                currentNosqlInjectionResults = analyzePatterns(analysisContent, nosqlInjectionChecks, usingDecompiledSource);
                currentSsrfResults = analyzePatterns(analysisContent, ssrfVulnerabilityChecks, usingDecompiledSource);
                currentXxeResults = analyzePatterns(analysisContent, xxeVulnerabilityChecks, usingDecompiledSource);
                currentDeserializationResults = analyzePatterns(analysisContent, deserializationVulnerabilityChecks, usingDecompiledSource);
                currentCommandInjectionResults = analyzePatterns(analysisContent, commandInjectionChecks, usingDecompiledSource);
                currentManifestPostureResults = analyzePatterns(analysisContent, manifestPostureChecks, usingDecompiledSource);

                loadingStatus.textContent = 'Extracting endpoints...';
                progressBar.style.width = '80%';
                extractedEndpoints = extractEndpoints(allContent);

                progressBar.style.width = '90%';
                loadingStatus.textContent = 'Analyzing permissions...';
                await analyzePermissionsFromManifest();

                progressBar.style.width = '100%';
                loadingStatus.textContent = 'Analysis complete!';
                await new Promise(r => setTimeout(r, 500));

                globalLoadingSection.classList.add('hidden');
                globalFileInfo.classList.remove('hidden');
                document.getElementById('globalFileName').textContent = file.name;
                document.getElementById('globalFileSize').textContent = formatFileSize(file.size);

                displayAllResults();
                globalAPKData.isLoaded = true;

            } catch (error) {
                console.error('Error:', error);
                alert('Error analyzing APK: ' + error.message);
                resetGlobalAnalyzer();
            }
        }

        function displayAllResults() {
            // Show headers
            document.getElementById('misconfigHeader').classList.remove('hidden');
            document.getElementById('codeAnalysisHeader').classList.remove('hidden');
            document.getElementById('endpointsHeader').classList.remove('hidden');

            // Display misconfig results
            document.getElementById('resultsSection').classList.remove('hidden');
            displayMisconfigResults();

            // Display code analysis results
            document.getElementById('codeAnalysisResults').classList.remove('hidden');
            displayCodeAnalysisResults();
            
            // Initialize Code Analysis page in collapsed state
            collapseAllCodeSections();

            // Display endpoints
            displayEndpointResults();
        }

        function displayMisconfigResults() {
            const total = currentRootResults.length + currentEmulatorResults.length + currentSSLResults.length + 
                         currentFlagResults.length + currentStorageResults.length + currentCryptoResults.length + currentLoggingResults.length;
            const detected = currentRootResults.filter(r => r.detected).length + currentEmulatorResults.filter(r => r.detected).length +
                            currentSSLResults.filter(r => r.detected).length + currentFlagResults.filter(r => r.detected).length +
                            currentStorageResults.filter(r => r.detected).length + currentCryptoResults.filter(r => r.detected).length +
                            currentLoggingResults.filter(r => r.detected).length;
            
            // Check if content contains smali (bytecode) rather than decompiled source
            const allResults = [...currentRootResults, ...currentEmulatorResults, ...currentSSLResults, 
                               ...currentFlagResults, ...currentStorageResults, ...currentCryptoResults, ...currentLoggingResults];
            const hasSmaliContent = allResults.some(r => r.instances && r.instances.some(i => i.isSmali));
            
            // Show/hide the smali note or source note
            const smaliNote = document.getElementById('smaliNote');
            const sourceNote = document.getElementById('sourceNote');
            
            if (decompiledSourceData.isLoaded) {
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

            document.getElementById('rootDetectedCount').textContent = currentRootResults.filter(r => r.detected).length;
            document.getElementById('rootTotalCount').textContent = currentRootResults.length;
            document.getElementById('emulatorDetectedCount').textContent = currentEmulatorResults.filter(r => r.detected).length;
            document.getElementById('emulatorTotalCount').textContent = currentEmulatorResults.length;
            document.getElementById('sslDetectedCount').textContent = currentSSLResults.filter(r => r.detected).length;
            document.getElementById('sslTotalCount').textContent = currentSSLResults.length;
            document.getElementById('flagDetectedCount').textContent = currentFlagResults.filter(r => r.detected).length;
            document.getElementById('flagTotalCount').textContent = currentFlagResults.length;
            document.getElementById('storageDetectedCount').textContent = currentStorageResults.filter(r => r.detected).length;
            document.getElementById('storageTotalCount').textContent = currentStorageResults.length;
            document.getElementById('cryptoDetectedCount').textContent = currentCryptoResults.filter(r => r.detected).length;
            document.getElementById('cryptoTotalCount').textContent = currentCryptoResults.length;

            renderFilteredResults();
            
            // Update chip counts for the new layout
            updateChipCounts();
        }

        function displayCodeAnalysisResults() {
            const authDetected = currentAuthResults.filter(r => r.detected).length;
            const authzDetected = currentAuthzResults.filter(r => r.detected).length;

            document.getElementById('authDetectedCount').textContent = `${authDetected} / ${currentAuthResults.length}`;
            document.getElementById('authzDetectedCount').textContent = `${authzDetected} / ${currentAuthzResults.length}`;

            // Update chip counts for Auth and Authz
            document.getElementById('authCodeChipCount').textContent = authDetected;
            document.getElementById('authzCodeChipCount').textContent = authzDetected;
            
            // Update chip counts for Backend Risk Indicators
            document.getElementById('featureFlagsCodeChipCount').textContent = currentFeatureFlagsResults.filter(r => r.detected).length;
            document.getElementById('hiddenEndpointsCodeChipCount').textContent = currentHiddenEndpointsResults.filter(r => r.detected).length;
            document.getElementById('authTrustCodeChipCount').textContent = currentAuthTrustResults.filter(r => r.detected).length;
            document.getElementById('rateLimitingCodeChipCount').textContent = currentMassAssignmentResults.filter(r => r.detected).length;
            document.getElementById('businessLogicCodeChipCount').textContent = currentBusinessLogicResults.filter(r => r.detected).length;
            document.getElementById('fileHandlingCodeChipCount').textContent = currentFileHandlingResults.filter(r => r.detected).length;
            document.getElementById('errorHandlingCodeChipCount').textContent = currentErrorHandlingResults.filter(r => r.detected).length;
            document.getElementById('envLeakageCodeChipCount').textContent = currentEnvLeakageResults.filter(r => r.detected).length;
            document.getElementById('cryptoTrustCodeChipCount').textContent = currentCryptoTrustResults.filter(r => r.detected).length;
            document.getElementById('manifestPostureCodeChipCount').textContent = currentManifestPostureResults.filter(r => r.detected).length;
            
            // Update filter counts
            const allCodeResults = [
                ...currentAuthResults,
                ...currentAuthzResults,
                ...currentFeatureFlagsResults,
                ...currentHiddenEndpointsResults,
                ...currentAuthTrustResults,
                ...currentMassAssignmentResults,
                ...currentInputValidationResults,
                ...currentBusinessLogicResults,
                ...currentFileHandlingResults,
                ...currentErrorHandlingResults,
                ...currentEnvLeakageResults,
                ...currentCryptoTrustResults,
                ...currentSqlInjectionResults,
                ...currentNosqlInjectionResults,
                ...currentSsrfResults,
                ...currentXxeResults,
                ...currentDeserializationResults,
                ...currentCommandInjectionResults,
                ...currentManifestPostureResults
            ];
            const totalCodeChecks = allCodeResults.length;
            const detectedCodeChecks = allCodeResults.filter(r => r.detected).length;
            const notDetectedCodeChecks = totalCodeChecks - detectedCodeChecks;
            
            document.getElementById('codeTotalChecks').textContent = totalCodeChecks;
            document.getElementById('codeDetectedChecks').textContent = detectedCodeChecks;
            document.getElementById('codeNotDetectedChecks').textContent = notDetectedCodeChecks;

            renderSection('authResults', currentAuthResults);
            renderSection('authzResults', currentAuthzResults);
            
            // Render Backend Risk Indicators
            renderBackendRiskIndicators('featureFlagsResults', currentFeatureFlagsResults);
            renderBackendRiskIndicators('hiddenEndpointsResults', currentHiddenEndpointsResults);
            renderBackendRiskIndicators('authTrustResults', currentAuthTrustResults);
            renderBackendRiskIndicators('massAssignmentResults', currentMassAssignmentResults);
            renderBackendRiskIndicators('inputValidationResults', currentInputValidationResults);
            renderBackendRiskIndicators('businessLogicResults', currentBusinessLogicResults);
            renderBackendRiskIndicators('fileHandlingResults', currentFileHandlingResults);
            renderBackendRiskIndicators('errorHandlingResults', currentErrorHandlingResults);
            renderBackendRiskIndicators('envLeakageResults', currentEnvLeakageResults);
            renderBackendRiskIndicators('cryptoTrustResults', currentCryptoTrustResults);
            
            // Render Server-Side Vulnerability Analysis Results
            renderServerSideVulnerabilities('sqlInjectionResults', currentSqlInjectionResults);
            renderServerSideVulnerabilities('nosqlInjectionResults', currentNosqlInjectionResults);
            renderServerSideVulnerabilities('ssrfResults', currentSsrfResults);
            renderServerSideVulnerabilities('xxeResults', currentXxeResults);
            renderServerSideVulnerabilities('deserializationResults', currentDeserializationResults);
            renderServerSideVulnerabilities('commandInjectionResults', currentCommandInjectionResults);
            renderBackendRiskIndicators('manifestPostureResults', currentManifestPostureResults);
        }
        
        function renderBackendRiskIndicators(containerId, results) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            const detected = results.filter(r => r.detected);
            
            if (detected.length === 0) {
                container.innerHTML = '<div class="text-center py-6 text-gray-500"><p class="text-sm">✓ No indicators detected</p></div>';
                return;
            }
            
            container.innerHTML = detected.map(result => {
                const cardId = `card-${Math.random().toString(36).substr(2, 9)}`;
                
                let instancesHtml = '';
                if (result.instances && result.instances.length > 0) {
                    const instanceItems = result.instances.map(inst => {
                        const sourceType = inst.isSource ? '☕ Java/Kotlin' : (inst.isSmali ? '📦 Smali' : '📄 Extracted');
                        const borderColor = inst.isSource ? 'border-emerald-500' : (inst.isSmali ? 'border-amber-500' : 'border-gray-500');
                        return `
                        <div class="instance-item ${borderColor} text-sm">
                            <div class="flex items-start justify-between gap-2">
                                <div class="flex-1 min-w-0">
                                    <span class="text-cyan-400 font-semibold">L${inst.lineNumber}</span>
                                    <span class="${inst.isSource ? 'text-emerald-300' : 'text-amber-300'} text-xs ml-2">[${sourceType}]</span>
                                    <div class="text-gray-300 mt-1 break-all font-mono text-xs">${escapeHtml(inst.content)}</div>
                                </div>
                                <button onclick="copyToClipboard('${escapeHtml(inst.content.replace(/'/g, "\\'"))}')" class="copy-btn p-1 hover:bg-white/10 rounded flex-shrink-0">
                                    <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                                    </svg>
                                </button>
                            </div>
                            ${inst.file ? `<div class="text-xs text-blue-400 mt-1 truncate" title="${escapeHtml(inst.file)}">📂 ${escapeHtml(inst.file.split('/').slice(-2).join('/'))}</div>` : ''}
                        </div>
                    `}).join('');
                    
                    instancesHtml = `
                        <div class="mt-3 pt-3 border-t border-gray-700/50">
                            <div class="instance-toggle" onclick="toggleInstances('${cardId}')">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                </svg>
                                <span class="text-sm">Found ${result.instances.length} instance${result.instances.length > 1 ? 's' : ''}</span>
                            </div>
                            <div id="${cardId}" class="instances-container">
                                ${instanceItems}
                            </div>
                        </div>
                    `;
                }
                
                return `
                    <div class="glass rounded-xl p-4 border border-orange-500/30 bg-orange-900/10">
                        <div class="flex items-start gap-3">
                            <div class="w-8 h-8 rounded-lg bg-orange-600/20 flex items-center justify-center flex-shrink-0">
                                <svg class="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                </svg>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h4 class="font-semibold text-orange-300 mb-1">${escapeHtml(result.name)}</h4>
                                <p class="text-sm text-gray-400 mb-2">${escapeHtml(result.description)}</p>
                                <div class="text-xs text-amber-300 bg-amber-900/20 rounded px-2 py-1 inline-block">
                                    <strong>Signal:</strong> ${escapeHtml(result.insight || result.description)}
                                </div>
                                ${instancesHtml}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function renderServerSideVulnerabilities(containerId, results) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            const detected = results.filter(r => r.detected);
            
            if (detected.length === 0) {
                container.innerHTML = '<div class="text-center py-6 text-gray-500"><p class="text-sm">✓ No vulnerabilities detected</p></div>';
                return;
            }
            
            container.innerHTML = detected.map(result => {
                const cardId = `card-${Math.random().toString(36).substr(2, 9)}`;
                
                // Determine risk color
                const riskColor = result.riskLevel === 'HIGH' ? 'red' : 
                                  result.riskLevel === 'MEDIUM' ? 'yellow' : 'blue';
                const riskBg = result.riskLevel === 'HIGH' ? 'bg-red-900/20' : 
                               result.riskLevel === 'MEDIUM' ? 'bg-yellow-900/20' : 'bg-blue-900/20';
                const riskBorder = result.riskLevel === 'HIGH' ? 'border-red-500/40' : 
                                   result.riskLevel === 'MEDIUM' ? 'border-yellow-500/40' : 'border-blue-500/40';
                const riskText = result.riskLevel === 'HIGH' ? 'text-red-300' : 
                                 result.riskLevel === 'MEDIUM' ? 'text-yellow-300' : 'text-blue-300';
                
                let instancesHtml = '';
                if (result.instances && result.instances.length > 0) {
                    const instanceItems = result.instances.map(inst => {
                        const sourceType = inst.isSource ? '☕ Java/Kotlin' : (inst.isSmali ? '📦 Smali' : '📄 Extracted');
                        const borderColor = inst.isSource ? 'border-emerald-500' : (inst.isSmali ? 'border-amber-500' : 'border-gray-500');
                        return `
                        <div class="instance-item ${borderColor} text-sm">
                            <div class="flex items-start justify-between gap-2">
                                <div class="flex-1 min-w-0">
                                    <span class="text-cyan-400 font-semibold">L${inst.lineNumber}</span>
                                    <span class="${inst.isSource ? 'text-emerald-300' : 'text-amber-300'} text-xs ml-2">[${sourceType}]</span>
                                    <div class="text-gray-300 mt-1 break-all font-mono text-xs">${escapeHtml(inst.content)}</div>
                                </div>
                                <button onclick="copyToClipboard('${escapeHtml(inst.content.replace(/'/g, "\\'"))}')" class="copy-btn p-1 hover:bg-white/10 rounded flex-shrink-0">
                                    <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                                    </svg>
                                </button>
                            </div>
                            ${inst.file ? `<div class="text-xs text-blue-400 mt-1 truncate" title="${escapeHtml(inst.file)}">📂 ${escapeHtml(inst.file.split('/').slice(-2).join('/'))}</div>` : ''}
                        </div>
                    `}).join('');
                    
                    instancesHtml = `
                        <div class="mt-3 pt-3 border-t border-gray-700/50">
                            <div class="instance-toggle" onclick="toggleInstances('${cardId}')">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                </svg>
                                <span class="text-sm">Found ${result.instances.length} instance${result.instances.length > 1 ? 's' : ''}</span>
                            </div>
                            <div id="${cardId}" class="instances-container">
                                ${instanceItems}
                            </div>
                        </div>
                    `;
                }
                
                return `
                    <div class="glass rounded-xl p-4 border ${riskBorder} ${riskBg}">
                        <div class="flex items-start gap-3">
                            <div class="w-8 h-8 rounded-lg bg-${riskColor}-600/20 flex items-center justify-center flex-shrink-0">
                                <svg class="w-4 h-4 text-${riskColor}-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                </svg>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-2">
                                    <h4 class="font-semibold ${riskText}">${escapeHtml(result.name)}</h4>
                                    <span class="text-xs px-2 py-0.5 rounded-full bg-${riskColor}-600 text-white font-semibold">${result.riskLevel}</span>
                                </div>
                                <p class="text-sm text-gray-400 mb-2">${escapeHtml(result.description)}</p>
                                ${result.serverImpact ? `
                                <div class="text-xs text-${riskColor}-200 bg-${riskColor}-900/30 rounded px-2 py-1 mb-2">
                                    <strong>Server Impact:</strong> ${escapeHtml(result.serverImpact)}
                                </div>
                                ` : ''}
                                ${result.recommendation ? `
                                <div class="text-xs text-emerald-300 bg-emerald-900/20 rounded px-2 py-1">
                                    <strong>✓ Recommendation:</strong> ${escapeHtml(result.recommendation)}
                                </div>
                                ` : ''}
                                ${instancesHtml}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

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

        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                const n = document.createElement('div');
                n.className = 'fixed bottom-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 fade-in';
                n.textContent = 'Copied!';
                document.body.appendChild(n);
                setTimeout(() => n.remove(), 2000);
            });
        }

        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // ==================== DYNAMIC ANALYSIS ====================
        
        let dynamicAnalysisData = {
            files: [],
            sharedPrefs: [],
            databases: [],
            otherFiles: [],
            issues: []
        };

        // Initialize Dynamic Analysis upload handlers
        document.addEventListener('DOMContentLoaded', () => {
            const dynamicUploadZone = document.getElementById('dynamicUploadZone');
            const dynamicFolderInput = document.getElementById('dynamicFolderInput');
            
            if (dynamicUploadZone && dynamicFolderInput) {
                dynamicUploadZone.addEventListener('click', () => dynamicFolderInput.click());
                dynamicFolderInput.addEventListener('change', (e) => {
                    if (e.target.files.length > 0) analyzeDynamicFolder(e.target.files);
                });
                
                dynamicUploadZone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    dynamicUploadZone.classList.add('dragover');
                });
                dynamicUploadZone.addEventListener('dragleave', () => dynamicUploadZone.classList.remove('dragover'));
                dynamicUploadZone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    dynamicUploadZone.classList.remove('dragover');
                    if (e.dataTransfer.items) {
                        const items = Array.from(e.dataTransfer.items);
                        handleDroppedItems(items);
                    }
                });
            }
        });

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
            return new Promise((resolve) => {
                reader.readEntries(async (entries) => {
                    for (const entry of entries) {
                        if (entry.isFile) {
                            const file = await new Promise(res => entry.file(res));
                            file.relativePath = entry.fullPath;
                            files.push(file);
                        } else if (entry.isDirectory) {
                            await readDirectoryRecursive(entry, files);
                        }
                    }
                    resolve();
                });
            });
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
            document.getElementById('dynamicHeader').classList.remove('hidden');
            
            dynamicAnalysisData = {
                files: fileArray,
                sharedPrefs: [],
                databases: [],
                otherFiles: [],
                issues: []
            };
            
            loadingStatus.textContent = 'Scanning files...';
            progressBar.style.width = '10%';
            
            // Categorize files
            for (const file of fileArray) {
                const path = file.webkitRelativePath || file.relativePath || file.name;
                const lowerPath = path.toLowerCase();
                
                if (lowerPath.includes('shared_prefs') && lowerPath.endsWith('.xml')) {
                    dynamicAnalysisData.sharedPrefs.push({ file, path });
                } else if (lowerPath.endsWith('.db') || lowerPath.endsWith('.sqlite') || lowerPath.endsWith('.sqlite3') || lowerPath.includes('databases/')) {
                    dynamicAnalysisData.databases.push({ file, path });
                } else {
                    dynamicAnalysisData.otherFiles.push({ file, path });
                }
            }
            
            progressBar.style.width = '30%';
            loadingStatus.textContent = 'Analyzing SharedPreferences...';
            await analyzeSharedPreferences();
            
            progressBar.style.width = '60%';
            loadingStatus.textContent = 'Analyzing SQLite databases...';
            await analyzeSQLiteDatabases();
            
            progressBar.style.width = '80%';
            loadingStatus.textContent = 'Analyzing files and cache...';
            await analyzeOtherFiles();
            
            progressBar.style.width = '100%';
            loadingStatus.textContent = 'Analysis complete!';
            
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

        // Sensitive data patterns for detection
        const sensitivePatterns = {
            tokens: /\b(token|access_token|refresh_token|auth_token|bearer|jwt|session_id|sessionid|api_key|apikey)\b/i,
            passwords: /\b(password|passwd|pwd|pass|secret|credential|cred)\b/i,
            pii: /\b(email|phone|mobile|aadhaar|ssn|address|dob|birth|pan_card|passport)\b/i,
            financial: /\b(card|cvv|credit|debit|account_number|routing|iban|upi|bank)\b/i,
            otp: /\b(otp|verification_code|reset_code|pin|mpin)\b/i,
            urls: /(https?:\/\/[^\s<>"]+)/gi,
            base64: /^[A-Za-z0-9+/]{20,}={0,2}$/,
            jwt: /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/,
            privateKey: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/,
            awsKey: /AKIA[0-9A-Z]{16}/,
            googleApi: /AIza[0-9A-Za-z_-]{35}/
        };

        async function analyzeSharedPreferences() {
            for (const { file, path } of dynamicAnalysisData.sharedPrefs) {
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
                    
                    dynamicAnalysisData.sharedPrefs.find(sp => sp.path === path).entries = entries;
                    dynamicAnalysisData.sharedPrefs.find(sp => sp.path === path).issues = issues;
                    dynamicAnalysisData.issues.push(...issues);
                    
                } catch (e) {
                    console.error('Error parsing SharedPrefs:', path, e);
                }
            }
        }

        async function analyzeSQLiteDatabases() {
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
                        // Extract strings from database to analyze content
                        const content = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
                        
                        // Look for table names
                        const tableMatches = content.match(/CREATE\s+TABLE\s+[`"']?(\w+)[`"']?/gi) || [];
                        dbInfo.tables = tableMatches.map(m => m.replace(/CREATE\s+TABLE\s+[`"']?/i, '').replace(/[`"']/g, ''));
                        
                        // Check for sensitive table names
                        const sensitiveTablePatterns = ['user', 'account', 'credential', 'auth', 'session', 'token', 'password', 'secret', 'payment', 'card', 'key'];
                        dbInfo.tables.forEach(table => {
                            const tableLower = table.toLowerCase();
                            sensitiveTablePatterns.forEach(pattern => {
                                if (tableLower.includes(pattern)) {
                                    dbInfo.issues.push({ severity: 'MEDIUM', type: 'Sensitive Table', file: path, table, description: `Table "${table}" may contain sensitive data` });
                                }
                            });
                        });
                        
                        // Check for sensitive data patterns in content
                        if (sensitivePatterns.jwt.test(content)) {
                            dbInfo.issues.push({ severity: 'HIGH', type: 'JWT in Database', file: path, description: 'JWT tokens found in unencrypted database' });
                        }
                        if (sensitivePatterns.awsKey.test(content)) {
                            dbInfo.issues.push({ severity: 'CRITICAL', type: 'AWS Key in Database', file: path, description: 'AWS credentials found in database' });
                        }
                        if (sensitivePatterns.privateKey.test(content)) {
                            dbInfo.issues.push({ severity: 'CRITICAL', type: 'Private Key in Database', file: path, description: 'Private key found in database' });
                        }
                        
                        // Check for common sensitive column patterns
                        const sensitiveColumns = ['password', 'passwd', 'token', 'secret', 'api_key', 'session', 'credit_card', 'ssn', 'pin'];
                        sensitiveColumns.forEach(col => {
                            if (content.toLowerCase().includes(col)) {
                                dbInfo.sensitiveData.push(col);
                            }
                        });
                        
                        if (dbInfo.sensitiveData.length > 0) {
                            dbInfo.issues.push({ severity: 'HIGH', type: 'Sensitive Columns', file: path, description: `Sensitive columns found: ${dbInfo.sensitiveData.join(', ')}` });
                        }
                        
                        // Check for no encryption
                        if (dbInfo.tables.length > 0) {
                            dbInfo.issues.push({ severity: 'MEDIUM', type: 'Unencrypted Database', file: path, description: 'SQLite database is not encrypted' });
                        }
                    }
                    
                    dynamicAnalysisData.databases.find(db => db.path === path).info = dbInfo;
                    dynamicAnalysisData.issues.push(...dbInfo.issues);
                    
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
            
            for (const { file, path } of dynamicAnalysisData.otherFiles) {
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
                
                // Analyze Java/Kotlin source code files (from JADX decompiled output)
                if (file.size < 2 * 1024 * 1024 && /\.(java|kt|smali)$/i.test(pathLower)) {
                    try {
                        const content = await file.text();
                        const fileName = path.split('/').pop();
                        
                        // Check for hardcoded secrets
                        const secretMatches = content.match(sourceCodePatterns.hardcodedSecrets);
                        if (secretMatches) {
                            secretMatches.slice(0, 3).forEach(match => {
                                issues.push({ 
                                    severity: 'HIGH', 
                                    type: 'Hardcoded Secret', 
                                    file: path, 
                                    description: `Hardcoded credential found: ${match.substring(0, 50)}...`
                                });
                            });
                        }
                        
                        // Check for AWS keys
                        if (sourceCodePatterns.awsKeys.test(content)) {
                            issues.push({ severity: 'CRITICAL', type: 'AWS Key in Source', file: path, description: 'AWS access key found in source code' });
                        }
                        
                        // Check for Google API keys
                        const googleKeys = content.match(sourceCodePatterns.googleApiKeys);
                        if (googleKeys) {
                            issues.push({ severity: 'HIGH', type: 'Google API Key in Source', file: path, description: `Google API key found: ${googleKeys[0].substring(0, 15)}...` });
                        }
                        
                        // Check for JWT tokens
                        if (sourceCodePatterns.jwtTokens.test(content)) {
                            issues.push({ severity: 'HIGH', type: 'Hardcoded JWT', file: path, description: 'Hardcoded JWT token found in source code' });
                        }
                        
                        // Check for private keys
                        if (sourceCodePatterns.privateKeys.test(content)) {
                            issues.push({ severity: 'CRITICAL', type: 'Private Key in Source', file: path, description: 'Private key embedded in source code' });
                        }
                        
                        // Check for SQL injection vulnerabilities
                        const sqlIssues = content.match(sourceCodePatterns.sqlInjection);
                        if (sqlIssues) {
                            issues.push({ severity: 'HIGH', type: 'Potential SQL Injection', file: path, description: 'String concatenation in SQL query detected' });
                        }
                        
                        // Check for weak cryptography
                        const weakCrypto = content.match(sourceCodePatterns.weakCrypto);
                        if (weakCrypto) {
                            issues.push({ severity: 'MEDIUM', type: 'Weak Cryptography', file: path, description: `Weak crypto algorithm: ${weakCrypto[0]}` });
                        }
                        
                        // Check for insecure random
                        if (sourceCodePatterns.insecureRandom.test(content)) {
                            issues.push({ severity: 'MEDIUM', type: 'Insecure Random', file: path, description: 'java.util.Random used instead of SecureRandom' });
                        }
                        
                        // Check for WebView security issues
                        const webviewIssues = content.match(sourceCodePatterns.webViewIssues);
                        if (webviewIssues) {
                            issues.push({ severity: 'MEDIUM', type: 'WebView Security', file: path, description: `WebView security issue: ${webviewIssues[0]}` });
                        }
                        
                        // Check for hardcoded IPs
                        const ips = content.match(sourceCodePatterns.hardcodedIPs);
                        if (ips) {
                            issues.push({ severity: 'LOW', type: 'Hardcoded IP', file: path, description: `Hardcoded IP address: ${ips[0]}` });
                        }
                        
                        // Check for Firebase URLs
                        const firebase = content.match(sourceCodePatterns.firebaseUrls);
                        if (firebase) {
                            issues.push({ severity: 'MEDIUM', type: 'Firebase URL', file: path, description: `Firebase URL found: ${firebase[0]}` });
                        }
                        
                    } catch (e) {
                        // Error reading file
                    }
                }
                
                if (issues.length > 0) {
                    dynamicAnalysisData.otherFiles.find(f => f.path === path).issues = issues;
                    dynamicAnalysisData.issues.push(...issues);
                }
            }
        }

        function maskValue(value) {
            if (!value || value.length < 8) return value;
            return value.substring(0, 4) + '****' + value.substring(value.length - 4);
        }

        function displayDynamicResults() {
            document.getElementById('dynamicResultsSection').classList.remove('hidden');
            
            // Update summary counts
            document.getElementById('dynTotalFiles').textContent = dynamicAnalysisData.files.length;
            document.getElementById('dynSharedPrefs').textContent = dynamicAnalysisData.sharedPrefs.length;
            document.getElementById('dynDatabases').textContent = dynamicAnalysisData.databases.length;
            document.getElementById('dynIssuesFound').textContent = dynamicAnalysisData.issues.length;
            
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
            
            if (dynamicAnalysisData.sharedPrefs.length === 0) {
                container.innerHTML = '<div class="glass rounded-xl p-6 text-center text-gray-400">No SharedPreferences files found</div>';
                return;
            }
            
            container.innerHTML = dynamicAnalysisData.sharedPrefs.map(sp => {
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
            
            if (dynamicAnalysisData.databases.length === 0) {
                container.innerHTML = '<div class="glass rounded-xl p-6 text-center text-gray-400">No SQLite databases found</div>';
                return;
            }
            
            container.innerHTML = dynamicAnalysisData.databases.map(db => {
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
            const filesWithIssues = dynamicAnalysisData.otherFiles.filter(f => f.issues && f.issues.length > 0);
            
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
            const issues = dynamicAnalysisData.issues;
            
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

        function expandAllDynamicSections() {
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
        }

        function collapseAllDynamicSections() {
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
        }

        function resetDynamicAnalysis() {
            dynamicAnalysisData = {
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
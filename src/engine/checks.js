// engine/checks.js — generated from src-legacy/code.js (do not hand-edit; edit tools/build.mjs)

const APPOPS_PERMISSIONS = new Set([
            "android.permission.SYSTEM_ALERT_WINDOW", "android.permission.PACKAGE_USAGE_STATS",
            "android.permission.WRITE_SETTINGS", "android.permission.REQUEST_INSTALL_PACKAGES"
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

const INTERNAL_SYSTEM_PERMISSIONS = new Set([
            "android.permission.SHUTDOWN", "android.permission.STOP_APP_SWITCHES", "android.permission.DISABLE_KEYGUARD",
            "android.permission.MANAGE_USERS", "android.permission.INTERACT_ACROSS_USERS_FULL",
            "android.permission.FORCE_STOP_PACKAGES", "android.permission.KILL_BACKGROUND_PROCESSES"
        ]);

const NORMAL_PERMISSIONS = new Set([
            "android.permission.INTERNET", "android.permission.ACCESS_NETWORK_STATE", "android.permission.ACCESS_WIFI_STATE",
            "android.permission.BLUETOOTH", "android.permission.BLUETOOTH_ADMIN", "android.permission.NFC",
            "android.permission.VIBRATE", "android.permission.WAKE_LOCK", "android.permission.FLASHLIGHT",
            "android.permission.EXPAND_STATUS_BAR", "android.permission.KILL_BACKGROUND_PROCESSES",
            "android.permission.FOREGROUND_SERVICE", "android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS",
            "android.permission.RECEIVE_BOOT_COMPLETED", "android.permission.SET_WALLPAPER", "android.permission.SET_WALLPAPER_HINTS"
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

const authTrustChecks = [
            { name: 'Client-Supplied User ID', patterns: ['userId:', 'user_id:', 'setUserId(', 'putString("userId"', 'put("user_id"'], description: 'User ID set from client', insight: 'Backend may trust client-supplied identity without verification' },
            { name: 'Client-Supplied Role', patterns: ['role:', 'userRole:', 'setRole(', 'putString("role"', 'isAdmin:', 'admin:'], description: 'Role/permission set from client', insight: 'Authorization decisions may rely on untrusted client data' },
            { name: 'Custom Auth Headers', patterns: ['X-User-Id', 'X-Role', 'X-Tenant', 'X-Account-Id', 'X-Customer-Id'], description: 'Custom authentication headers', insight: 'Non-standard auth headers may lack proper validation' },
            { name: 'JWT Client Parsing', patterns: ['parseJWT', 'decodeJWT', 'jwt.decode', 'Base64.decode.*eyJ', 'split("\\.")'], description: 'JWT parsed/manipulated by client', insight: 'Client JWT manipulation suggests backend may accept modified tokens' },
            { name: 'Tenant/Org ID in Request', patterns: ['tenantId:', 'tenant_id:', 'orgId:', 'organization_id:', 'companyId:'], description: 'Tenant identifier in request', insight: 'Multi-tenant isolation may rely on client-supplied tenant ID' },
            { name: 'Bearer Token Construction', patterns: ['Bearer " +', '"Bearer: " +', 'Authorization: Bearer', 'token = "eyJ'], description: 'Bearer token constructed by client', insight: 'Client-constructed tokens suggest weak token generation' },
            { name: 'Permission Claims', patterns: ['permissions:', 'claims:', 'scopes:', 'authorities:', 'privileges:'], description: 'Permission claims in request', insight: 'Backend may accept client-defined permissions' },
        ];

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

const cryptoTrustChecks = [
            { name: 'Hardcoded Crypto Keys', patterns: ['SecretKeySpec', 'new byte[]{', 'AES_KEY', 'ENCRYPTION_KEY', 'private static final'], description: 'Hardcoded encryption keys', insight: 'If client has keys, attackers can extract and replicate encryption' },
            { name: 'Client-Side Signing', patterns: ['sign(', 'signature', 'HMAC', 'HmacSHA', 'Mac.getInstance'], description: 'Client generates signatures', insight: 'Client signing capability enables attackers to forge valid requests' },
            { name: 'Custom Crypto', patterns: ['XOR', 'xor(', 'customEncrypt', 'myEncrypt', 'obfuscate'], description: 'Custom cryptographic functions', insight: 'Custom crypto is often weak and reversible by attackers' },
            { name: 'Weak Algorithms', patterns: ['MD5', 'SHA1', 'DES', 'RC4', 'ECB'], description: 'Weak cryptographic algorithms', insight: 'Weak algorithms suggest inadequate server-side security' },
            { name: 'Client Token Gen', patterns: ['generateToken', 'createToken', 'newToken', 'UUID.randomUUID'], description: 'Client generates tokens', insight: 'Client-generated tokens may be predictable or forgeable' },
            { name: 'Verification Logic', patterns: ['verify(', 'checkSignature', 'validateHash', 'verifyToken'], description: 'Client performs verification', insight: 'If client can verify, server may accept client-validated data' },
            { name: 'Shared Secrets', patterns: ['API_SECRET', 'SECRET_KEY', 'SHARED_SECRET', 'CLIENT_SECRET'], description: 'Shared secrets in code', insight: 'Shared secrets in client code are extractable by attackers' },
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

const emulatorChecks = [
            { name: 'Build.FINGERPRINT', patterns: ['Build.FINGERPRINT', 'generic', 'unknown', 'google/sdk'], description: 'Checks device fingerprint' },
            { name: 'Build.MODEL', patterns: ['Build.MODEL', 'sdk', 'Emulator', 'Android SDK'], description: 'Checks device model' },
            { name: 'QEMU Detection', patterns: ['qemu', 'QEMU', 'goldfish', '/dev/qemu_pipe'], description: 'Checks for QEMU emulator' },
            { name: 'Genymotion Detection', patterns: ['genymotion', 'Genymotion', 'vbox'], description: 'Checks for Genymotion' },
            { name: 'BlueStacks Detection', patterns: ['bluestacks', 'BlueStacks', 'bst'], description: 'Checks for BlueStacks' },
        ];

const envLeakageChecks = [
            { name: 'Staging URLs', patterns: ['staging.', '-staging.', 'stage.', '-stage.', 'stg.', '.staging'], description: 'Staging environment URLs', insight: 'Staging environments may be externally accessible with weak security' },
            { name: 'Dev URLs', patterns: ['dev.', '-dev.', 'development.', '.dev.', 'localhost:', '127.0.0.1'], description: 'Development environment URLs', insight: 'Dev environments often lack production security controls' },
            { name: 'Internal IPs', patterns: ['192.168.', '10.0.', '172.16.', '127.0.0.1', 'localhost'], description: 'Internal IP addresses', insight: 'Hardcoded internal IPs may indicate network topology' },
            { name: 'Internal Hostnames', patterns: ['.internal', '.local', '.corp', '.lan', '-internal'], description: 'Internal hostnames', insight: 'Internal domain names may be resolvable externally' },
            { name: 'Firebase Config', patterns: ['firebase', 'firebaseio.com', 'firebaseConfig', 'google-services.json'], description: 'Firebase project configuration', insight: 'Firebase projects may have permissive security rules' },
            { name: 'AWS Resources', patterns: ['amazonaws.com', 's3.', 'cloudfront', 'elasticbeanstalk', 'AKIA'], description: 'AWS resource identifiers', insight: 'AWS resources may have misconfigured access policies' },
            { name: 'Cloud Identifiers', patterns: ['.azurewebsites.', '.cloudapp.', '.herokuapp.', 'appspot.com'], description: 'Cloud platform identifiers', insight: 'Cloud services may have default/weak configurations' },
        ];

const errorHandlingChecks = [
            { name: 'Verbose Error Display', patterns: ['error.getMessage()', 'exception.toString()', 'printStackTrace', 'Log.e.*exception'], description: 'Detailed error rendering', insight: 'Backend errors may expose stack traces and internal details' },
            { name: 'Server Response Logging', patterns: ['Log.d.*response', 'Log.i.*response', 'response.body()', 'responseBody'], description: 'Full response logging', insight: 'Logged responses may reveal sensitive backend data' },
            { name: 'Debug Flags', patterns: ['DEBUG', 'BuildConfig.DEBUG', 'isDebug', 'debugEnabled', 'VERBOSE'], description: 'Debug mode flags', insight: 'Debug builds may expose additional error information' },
            { name: 'Stack Trace Handling', patterns: ['getStackTrace', 'printStackTrace', 'Throwable', 'StackTraceElement'], description: 'Stack trace processing', insight: 'Client stack trace handling suggests backend sends detailed errors' },
            { name: 'Error Message Display', patterns: ['Toast.*error', 'showError', 'displayError', 'errorMessage', 'AlertDialog.*error'], description: 'Error message UI', insight: 'Displayed errors may leak backend implementation details' },
            { name: 'Exception Types', patterns: ['SQLException', 'NullPointerException', 'IllegalStateException', 'IOException'], description: 'Specific exception handling', insight: 'Detailed exception types suggest verbose server errors' },
        ];

const featureFlagsChecks = [
            { name: 'Local Boolean Flags', patterns: ['isFeatureEnabled', 'featureEnabled', 'enableFeature', 'isEnabled()', 'feature_flag', 'featureToggle'], description: 'Local boolean feature gates', insight: 'May indicate backend functionality exists even when disabled in UI' },
            { name: 'BuildConfig Flags', patterns: ['BuildConfig.', 'DEBUG', 'RELEASE', 'FEATURE_', 'ENABLE_'], description: 'Build configuration flags', insight: 'Features may be compiled out but backend APIs remain' },
            { name: 'Remote Config', patterns: ['FirebaseRemoteConfig', 'RemoteConfig', 'remoteConfig', 'getRemoteConfig', 'fetchAndActivate'], description: 'Remote configuration system', insight: 'Server-controlled features suggest backend supports both states' },
            { name: 'Conditional Features', patterns: ['if.*enabled', 'when.*enabled', '? enable', ': disable', 'isHidden', 'isVisible'], description: 'Conditional feature rendering', insight: 'UI gating may hide accessible backend functionality' },
            { name: 'Beta/Experimental', patterns: ['beta', 'experimental', 'preview', 'alpha', 'canary', 'unstable'], description: 'Beta/experimental feature flags', insight: 'Unreleased features may have active backend endpoints' },
            { name: 'Debug Features', patterns: ['debugMenu', 'debug_mode', 'devTools', 'developerMode', 'internal_tools'], description: 'Debug/dev features', insight: 'Debug features often expose privileged backend operations' },
            { name: 'A/B Testing', patterns: ['experiment', 'variant', 'abTest', 'testGroup', 'cohort', 'split'], description: 'A/B testing framework', insight: 'Multiple feature versions suggest backend supports all variants' },
        ];

const fileHandlingChecks = [
            { name: 'Upload Endpoints', patterns: ['uploadFile', 'upload/', '/upload', 'multipart', 'fileUpload'], description: 'File upload functionality', insight: 'Upload endpoints may lack proper file validation and access control' },
            { name: 'Download Endpoints', patterns: ['downloadFile', 'download/', '/download', 'getFile', 'fetchFile'], description: 'File download functionality', insight: 'Download endpoints may be vulnerable to path traversal/IDOR' },
            { name: 'Client Filenames', patterns: ['fileName:', 'filename:', 'file_name:', 'setFileName(', 'name:'], description: 'Client-supplied filenames', insight: 'User-controlled filenames may enable path traversal attacks' },
            { name: 'File Paths', patterns: ['filePath:', 'path:', 'file_path:', 'setPath(', '/storage/', '/files/'], description: 'Client-supplied file paths', insight: 'Path parameters may allow unauthorized file access' },
            { name: 'Object IDs', patterns: ['fileId:', 'documentId:', 'imageId:', 'attachmentId:', 'mediaId:'], description: 'Object identifiers in requests', insight: 'Predictable IDs may enable IDOR attacks' },
            { name: 'Direct URLs', patterns: ['fileUrl:', 'document_url:', 'mediaUrl:', 'downloadUrl:', 'https://'], description: 'Direct file URLs', insight: 'Exposed file URLs may lack access control' },
            { name: 'S3/Cloud Storage', patterns: ['s3.amazonaws', 'storage.googleapis', 'blob.core.windows', 'amazonaws.com', '.blob.'], description: 'Cloud storage references', insight: 'Publicly accessible cloud buckets may leak sensitive files' },
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

const hiddenEndpointsChecks = [
            { name: 'Admin Endpoints', patterns: ['/admin/', '/admin-', 'admin.', '/internal/', '/management/', '/console/'], description: 'Administrative API paths', insight: 'Admin endpoints may lack proper access controls' },
            { name: 'Versioned APIs', patterns: ['/v1/', '/v2/', '/v3/', '/api/v', '/beta/', '/alpha/'], description: 'Multiple API versions', insight: 'Old API versions may remain accessible with weaker security' },
            { name: 'Debug Endpoints', patterns: ['/debug/', '/test/', '/dev/', '/staging/', '/sandbox/'], description: 'Debug/test endpoints', insight: 'Debug endpoints may expose sensitive operations' },
            { name: 'Internal APIs', patterns: ['/internal/', '/_internal/', '/private/', '/_api/', '/system/'], description: 'Internal API paths', insight: 'Internal APIs often lack public-facing security hardening' },
            { name: 'Deprecated Endpoints', patterns: ['deprecated', 'legacy', 'old_api', 'v0/', 'obsolete'], description: 'Deprecated API references', insight: 'Deprecated endpoints may remain functional with known vulnerabilities' },
            { name: 'Undocumented Methods', patterns: ['_hidden', 'secret', 'undocumented', '_internal', '__api'], description: 'Hidden API method names', insight: 'Undocumented endpoints suggest incomplete security review' },
            { name: 'GraphQL Introspection', patterns: ['graphql', 'GraphQL', '__schema', '__type', 'introspectionQuery'], description: 'GraphQL endpoint with introspection', insight: 'GraphQL introspection may reveal all available operations' },
        ];

const inputValidationChecks = [
            { name: 'Client-Only Validation', patterns: ['TextUtils.isEmpty', 'Validator.', 'isValid()', '.matches(', 'Pattern.compile'], description: 'Input validation in client code', insight: 'Backend may lack server-side validation for these inputs' },
            { name: 'Length Checks', patterns: ['length() >', 'length() <', 'length() ==', '.length >', 'maxLength'], description: 'String length validation', insight: 'Client length limits may not be enforced server-side' },
            { name: 'Regex Validation', patterns: ['Pattern.compile', '.matches(', 'Regex.', 'Pattern.matches'], description: 'Regex pattern matching', insight: 'Complex client regex may indicate missing server validation' },
            { name: 'Email Validation', patterns: ['isValidEmail', 'EMAIL_PATTERN', '@.*\\.', 'emailValidator', 'Patterns.EMAIL_ADDRESS'], description: 'Email format validation', insight: 'Format-only validation may miss injection vectors' },
            { name: 'SQL-like Strings', patterns: ['SELECT ', 'INSERT ', 'UPDATE ', 'DELETE ', 'WHERE ', 'UNION '], description: 'SQL keywords in string operations', insight: 'String concatenation with SQL keywords suggests injection risk' },
            { name: 'Dynamic Query Building', patterns: ['" + ', '.append(', 'String.format', 'StringBuilder', '+ "SELECT'], description: 'Dynamic string construction', insight: 'Dynamic queries may enable injection if server trusts input' },
            { name: 'Sanitization Functions', patterns: ['sanitize', 'escape', 'htmlEscape', 'stripTags', 'removeSpecialChars'], description: 'Client-side sanitization', insight: 'Client sanitization suggests backend may expect cleaned input' },
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

const massAssignmentChecks = [
            { name: 'Broad Request DTOs', patterns: ['toJson()', 'toMap()', 'toHashMap()', 'JSONObject(this)', 'serialize()'], description: 'Entire objects serialized to requests', insight: 'Backend may accept unintended fields from request body' },
            { name: 'Privileged Fields', patterns: ['isAdmin:', 'role:', 'permission:', 'status:', 'verified:', 'approved:'], description: 'Privileged fields in request models', insight: 'Sensitive fields may be modifiable via mass assignment' },
            { name: 'ID Fields in PUT', patterns: ['userId:', 'accountId:', 'customerId:', 'orderId:', 'id:'], description: 'Identity fields in update requests', insight: 'Object IDs in request body may enable object takeover' },
            { name: 'Unreferenced Fields', patterns: ['private String', 'private int', 'private boolean', '@SerializedName'], description: 'DTO fields not used in UI', insight: 'Unused fields suggest backend accepts more parameters than UI sends' },
            { name: 'Generic String Fields', patterns: ['String data', 'String params', 'String payload', 'String json'], description: 'Generic string fields for data', insight: 'Unstructured data fields may enable arbitrary parameter injection' },
            { name: 'Map/Dict in Requests', patterns: ['Map<String', 'HashMap<', 'Dictionary<', 'params.put(', 'additionalData'], description: 'Key-value maps in requests', insight: 'Dynamic parameters may enable unexpected field submission' },
        ];

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

const rootChecks = [
            { name: 'SU Binary Check', patterns: ['/system/bin/su', '/system/xbin/su', '/sbin/su', '/su/bin/su', 'which su'], description: 'Checks for su binary presence' },
            { name: 'Superuser APK', patterns: ['Superuser.apk', 'com.noshufou.android.su', 'com.thirdparty.superuser'], description: 'Checks for Superuser app' },
            { name: 'Magisk Detection', patterns: ['magisk', 'com.topjohnwu.magisk', '/sbin/.magisk', 'MagiskManager', 'MagiskHide'], description: 'Checks for Magisk root manager' },
            { name: 'SuperSU Detection', patterns: ['eu.chainfire.supersu', 'SuperSU', '/su/', 'daemonsu'], description: 'Checks for SuperSU' },
            { name: 'RootBeer Library', patterns: ['RootBeer', 'com.scottyab.rootbeer', 'isRooted', 'detectRootManagementApps'], description: 'Uses RootBeer library' },
            { name: 'SafetyNet/Play Integrity', patterns: ['SafetyNet', 'safetynet', 'PlayIntegrity', 'IntegrityManager'], description: 'Google SafetyNet/Play Integrity API' },
        ];

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

const sslPinningChecks = [
            { name: 'OkHttp Certificate Pinner', patterns: ['CertificatePinner', 'sha256/', 'sha1/'], description: 'OkHttp certificate pinning' },
            { name: 'Network Security Config', patterns: ['network_security_config', 'pin-set', 'trust-anchors'], description: 'Android Network Security Config' },
            { name: 'TrustManager', patterns: ['TrustManager', 'X509TrustManager', 'checkServerTrusted'], description: 'Custom TrustManager' },
            { name: 'SSL Pinning Libraries', patterns: ['TrustKit', 'appmattus', 'certificatetransparency'], description: 'SSL pinning libraries' },
            { name: 'Disabled Hostname Verification', patterns: ['ALLOW_ALL_HOSTNAME_VERIFIER', 'setHostnameVerifier', 'HostnameVerifier.*return\\s+true'], description: 'Custom HostnameVerifier that may accept any certificate — verify it pins or validates the hostname' },
            { name: 'SSL Errors Ignored', patterns: ['onReceivedSslError', 'handler\\.proceed\\(\\)', 'SslError'], description: 'WebView SSL errors bypassed via handler.proceed()' },
            { name: 'Mixed Content Allowed', patterns: ['MIXED_CONTENT_ALWAYS_ALLOW', 'setMixedContentMode'], description: 'WebView mixed HTTP/HTTPS content policy' },
        ];

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

export { APPOPS_PERMISSIONS, DANGEROUS_PERMISSIONS, INTERNAL_SYSTEM_PERMISSIONS, NORMAL_PERMISSIONS, SIGNATURE_PERMISSIONS, SIGNATURE_PRIVILEGED_PERMISSIONS, authTrustChecks, authenticationChecks, authorizationChecks, businessLogicChecks, commandInjectionChecks, cryptoTrustChecks, cryptographyChecks, deserializationVulnerabilityChecks, emulatorChecks, envLeakageChecks, errorHandlingChecks, featureFlagsChecks, fileHandlingChecks, flagChecks, hiddenEndpointsChecks, inputValidationChecks, insecureLoggingChecks, localStorageChecks, manifestPostureChecks, massAssignmentChecks, nosqlInjectionChecks, rootChecks, sqlInjectionChecks, sslPinningChecks, ssrfVulnerabilityChecks, xxeVulnerabilityChecks };

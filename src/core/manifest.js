// core/manifest.js — generated from src-legacy/code.js (do not hand-edit; edit tools/build.mjs)
import { state } from './state.js';
import { displayPermissionAnalysis } from '../ui/misconfig.js';

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

function classifyAndroidPermission(perm) {
            if (DANGEROUS_PERMISSIONS.has(perm)) return { protectionLevel: "dangerous", risk: "HIGH" };
            if (SIGNATURE_PRIVILEGED_PERMISSIONS.has(perm)) return { protectionLevel: "signature|privileged", risk: "LOW" };
            if (SIGNATURE_PERMISSIONS.has(perm)) return { protectionLevel: "signature", risk: "LOW" };
            if (INTERNAL_SYSTEM_PERMISSIONS.has(perm)) return { protectionLevel: "internal", risk: "LOW" };
            if (APPOPS_PERMISSIONS.has(perm)) return { protectionLevel: "appops", risk: "MEDIUM" };
            if (NORMAL_PERMISSIONS.has(perm)) return { protectionLevel: "normal", risk: "LOW" };
            return { protectionLevel: "unknown/system", risk: "MEDIUM" };
        }

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

async function analyzePermissionsFromManifest() {
            state.analyzedPermComponents = [];
            // Prefer the JADX manifest; fall back to the auto-parsed APK manifest
            const apkManifestXml = state.globalAPKData.manifestXml || null;
            const hasJadx = state.decompiledSourceData.isLoaded && state.decompiledSourceData.files;
            let manifestXml = null;
            if (hasJadx) manifestXml = await findAndReadManifest(state.decompiledSourceData.files);
            if (!manifestXml) manifestXml = apkManifestXml;
            if (!manifestXml) {
                console.log('No manifest available for permission analysis');
                document.getElementById('permissionSection')?.classList.add('hidden');
                return;
            }
            
            // Parse manifest permissions
            const manifestData = parseManifestPermissions(manifestXml);
            if (!manifestData.packageName) {
                console.log('Could not parse package name from manifest');
                document.getElementById('permissionSection')?.classList.add('hidden');
                return;
            }
            
            // Parse the manifest DOM for components
            const parser = new DOMParser();
            const doc = parser.parseFromString(manifestXml, 'text/xml');
            
            state.analyzedPermComponents = [];
            
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
                state.analyzedPermComponents.push({ type: 'activity', name, ...resolved });
            });
            
            // Collect services
            doc.querySelectorAll('service').forEach(node => {
                if (!isExported(node)) return;
                const name = normalizeName(getAttr(node, 'name'));
                const perm = getAttr(node, 'permission') || manifestData.appPermission;
                const resolved = resolvePermissionWithRisk(perm, manifestData.customPermissions);
                state.analyzedPermComponents.push({ type: 'service', name, ...resolved });
            });
            
            // Collect receivers
            doc.querySelectorAll('receiver').forEach(node => {
                if (!isExported(node)) return;
                const name = normalizeName(getAttr(node, 'name'));
                const perm = getAttr(node, 'permission') || manifestData.appPermission;
                const resolved = resolvePermissionWithRisk(perm, manifestData.customPermissions);
                state.analyzedPermComponents.push({ type: 'receiver', name, ...resolved });
            });
            
            // Collect providers
            doc.querySelectorAll('provider').forEach(node => {
                if (getAttr(node, 'exported') !== 'true') return;
                const name = normalizeName(getAttr(node, 'name'));
                const perm = getAttr(node, 'readPermission') || getAttr(node, 'writePermission') || manifestData.appPermission;
                const resolved = resolvePermissionWithRisk(perm, manifestData.customPermissions);
                state.analyzedPermComponents.push({ type: 'provider', name, ...resolved });
            });
            
            console.log('Permission analysis complete:', state.analyzedPermComponents.length, 'exported components found');
            displayPermissionAnalysis();
        }

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

export { parseManifestPermissions, findAndReadManifest, classifyAndroidPermission, resolvePermissionWithRisk, analyzePermissionsFromManifest, NORMAL_PERMISSIONS, DANGEROUS_PERMISSIONS, SIGNATURE_PERMISSIONS, SIGNATURE_PRIVILEGED_PERMISSIONS, INTERNAL_SYSTEM_PERMISSIONS, APPOPS_PERMISSIONS };

// core/endpoints.js — generated from src-legacy/code.js (do not hand-edit; edit tools/build.mjs)
import { state } from './state.js';

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
                if (!new Set(['http','https','ws','wss','file','ftp','mailto','javascript','data','blob','about']).has(scheme) && clean.length > 10) {
                    endpoints.set(clean, { url: clean, category: 'Deep Link', type: 'deeplink' });
                }
            });
            
            // IP Addresses with ports
            const ipRegex = /\b((?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d))(?::(\d{1,5}))?(?:\/[^\s"'<>\\]*)?\b/g;
            (content.match(ipRegex) || []).forEach(url => {
                const clean = url.replace(/['"\\<>)\]}]+$/, '').trim();
                if (clean.length > 7) {
                    endpoints.set(clean, { url: clean, category: 'IP Address', type: 'ip' });
                }
            });
            
            state.extractedEndpoints = Array.from(endpoints.values());
            return state.extractedEndpoints;
        }

export { extractEndpoints };

// core/utils.js — generated from src-legacy/code.js (do not hand-edit; edit tools/build.mjs)
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
function maskValue(value) {
            if (!value || value.length < 8) return value;
            return value.substring(0, 4) + '****' + value.substring(value.length - 4);
        }
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

const __copyRegistry = new Map();
let __copyCounter = 0;
function registerCopy(text) {
    const id = `copy_${++__copyCounter}`;
    __copyRegistry.set(id, text);
    return id;
}
if (typeof document !== 'undefined') {
    document.addEventListener('click', e => {
        const btn = e.target.closest('[data-copy-id]');
        if (!btn) return;
        const text = __copyRegistry.get(btn.getAttribute('data-copy-id'));
        if (text !== undefined) copyToClipboard(text);
    });
}

export { copyToClipboard, formatFileSize, escapeHtml, maskValue, sensitivePatterns, registerCopy };

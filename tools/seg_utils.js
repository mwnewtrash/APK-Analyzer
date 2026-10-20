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
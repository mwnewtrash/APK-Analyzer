// ui/navigation.js — generated from src-legacy/code.js (do not hand-edit; edit tools/build.mjs)
import { state } from '../core/state.js';
import { analyzeAPKGlobal } from '../ingest/apk.js';
import { analyzeDecompiledSourceOnly } from '../ingest/source.js';

function toggleTheme() {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
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

async function startGlobalAnalysis() {
            if (!state.globalAPKData.file && !state.decompiledSourceData.isLoaded) {
                alert('Please select an APK file or JADX decompiled folder.');
                return;
            }
            
            if (state.globalAPKData.file) {
                await analyzeAPKGlobal(state.globalAPKData.file);
            } else if (state.decompiledSourceData.isLoaded) {
                // Analyze using only decompiled source
                await analyzeDecompiledSourceOnly();
            }
        }

export { toggleTheme, navigateTo, startGlobalAnalysis };

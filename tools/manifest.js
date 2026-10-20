#!/usr/bin/env node
/**
 * tools/manifest.js — parse the legacy single-file analyzer into a declaration map.
 *
 * Usage: node tools/manifest.js <sourceHtml> [--json]
 *
 * Splits the last <script> block into top-level declarations by brace matching and
 * prints name / kind / line range so module boundaries can be chosen safely.
 */
import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
    console.error('usage: node tools/manifest.js <sourceHtml> [--json]');
    process.exit(2);
}

const lines = readFileSync(file, 'utf8').split(/\r?\n/);

// Locate every <script> ... </script> pair that has no src attribute.
const scriptBlocks = [];
for (let i = 0; i < lines.length; i++) {
    if (/<script>\s*$/.test(lines[i])) {
        for (let j = i + 1; j < lines.length; j++) {
            if (/<\/script>/.test(lines[j])) {
                scriptBlocks.push([i + 1, j + 1]);
                i = j;
                break;
            }
        }
    }
}

if (scriptBlocks.length === 0) {
    console.error('no inline <script> block found');
    process.exit(1);
}
const [scriptStart, scriptEnd] = scriptBlocks[scriptBlocks.length - 1];

const DECL = /^\s*(?:async\s+function|function)\s+([A-Za-z_$][\w$]*)|^\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=|^\s*document\.addEventListener\(\s*'([A-Za-z]+)'/;

/** Walk forward from `start` (0-based) until braces balance; returns the closing line index. */
function findBlockEnd(start) {
    let depth = 0;
    let seen = false;
    for (let i = start; i < scriptEnd - 1; i++) {
        for (const ch of lines[i]) {
            if (ch === '{') { depth++; seen = true; }
            else if (ch === '}') depth--;
        }
        if (seen && depth <= 0) return i;
    }
    return scriptEnd - 2;
}

const decls = [];
for (let i = scriptStart; i < scriptEnd - 1; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('//')) continue;
    const m = line.match(DECL);
    if (!m) continue;
    // Skip declarations nested inside a function body: verify indentation is <= 8 spaces.
    if (/^\s{9,}\S/.test(line)) continue;
    const end = findBlockEnd(i);
    decls.push({
        name: m[1] || m[2] || `addEventListener:${m[3]}`,
        kind: m[3] ? 'listener' : (m[1] ? 'function' : 'var'),
        start: i + 1,
        end: end + 1,
        lines: end - i + 1,
    });
    i = end;
}

const report = {
    file,
    totalLines: lines.length,
    styleBlock: [10, 772],
    bodyBlock: [775, 2441],
    scriptBlock: [scriptStart, scriptEnd],
    declarationCount: decls.length,
    declarations: decls,
};

if (process.argv.includes('--json')) {
    console.log(JSON.stringify(report, null, 2));
} else {
    console.log(`script block: lines ${scriptStart}..${scriptEnd}`);
    console.log(`declarations: ${decls.length}\n`);
    for (const d of decls) {
        console.log(
            `${String(d.start).padStart(5)}-${String(d.end).padStart(5)}  ${String(d.lines).padStart(4)}L  ${d.kind.padEnd(9)} ${d.name}`,
        );
    }
}

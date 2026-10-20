#!/usr/bin/env node
/**
 * tools/extract.js — split the legacy single-file HTML into three raw working
 * files under src-legacy/ so downstream tools process plain text (no more
 * read_files placeholder issues on huge ranges):
 *
 *   src-legacy/head.html   — everything before the final <script>
 *   src-legacy/body.html   — the <body> markup (from <body...> to just before <script>)
 *   src-legacy/code.js     — the JS inside the final <script>...</script>
 *   src-legacy/foot.html   — everything from </script> to EOF
 *
 * Usage: node tools/extract.js <sourceHtml>
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = process.argv[2];
if (!src) { console.error('usage: node tools/extract.js <sourceHtml>'); process.exit(2); }

const text = readFileSync(src, 'utf8');
const lines = text.split(/\r?\n/);

// locate final inline <script> block (bare <script> ... </script>)
let scriptStart = -1, scriptEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (/<script>\s*$/.test(lines[i])) {
    scriptStart = i;
    for (let j = i + 1; j < lines.length; j++) {
      if (/<\/script>/.test(lines[j])) { scriptEnd = j; break; }
    }
  }
}
if (scriptStart < 0 || scriptEnd < 0) { console.error('script block not found'); process.exit(1); }

// locate <body ...> opening line for body boundary
let bodyStart = -1;
for (let i = 0; i < scriptStart; i++) {
  if (/<body[\s>]/i.test(lines[i])) { bodyStart = i; break; }
}

const outDir = join(here, '..', 'src-legacy');
mkdirSync(outDir, { recursive: true });

const head = lines.slice(0, scriptStart).join('\n');
const bodyMarkup = lines.slice(bodyStart < 0 ? 0 : bodyStart, scriptStart).join('\n');
const code = lines.slice(scriptStart + 1, scriptEnd).join('\n');
const foot = lines.slice(scriptEnd).join('\n'); // includes </script>..EOF

writeFileSync(join(outDir, 'head.html'), head, 'utf8');
writeFileSync(join(outDir, 'body.html'), bodyMarkup, 'utf8');
writeFileSync(join(outDir, 'code.js'), code, 'utf8');
writeFileSync(join(outDir, 'foot.html'), foot, 'utf8');

console.log(`head.html  : ${head.split('\n').length} lines  (1..${scriptStart})`);
console.log(`body.html  : ${bodyMarkup.split('\n').length} lines (body@${bodyStart + 1}..${scriptStart})`);
console.log(`code.js    : ${code.split('\n').length} lines (file ${scriptStart + 2}..${scriptEnd})`);
console.log(`foot.html  : ${foot.split('\n').length} lines`);

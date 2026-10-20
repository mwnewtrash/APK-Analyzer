#!/usr/bin/env node
/**
 * tools/plan.js — turn declmap.json into a grouped, ordered view to choose module
 * boundaries. Prints declarations in source order with running line coverage and
 * flags the big gaps (loose top-level statements) so nothing is silently dropped.
 *
 * Usage: node tools/plan.js
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const dm = JSON.parse(readFileSync(join(here, '..', 'declmap.json'), 'utf8'));
const [codeStart, codeEnd] = dm.scriptBlock;
const decls = dm.declarations;
const gaps = dm.gaps ?? [];

console.log(`file: ${dm.file}`);
console.log(`script block (file lines): ${codeStart}..${codeEnd}  (code lines 1..${codeEnd - codeStart - 1})`);
console.log(`declarations: ${decls.length}   gaps: ${gaps.length}\n`);

let covered = 0;
const rows = [];
for (const d of decls) {
  covered += d.lines;
  rows.push({
    start: d.start,
    end: d.end,
    lines: d.lines,
    kind: d.kind,
    name: d.name ?? `<anon ${d.kind}>`,
  });
}

// Only show "significant" declarations to keep output readable, but always list gaps.
console.log('DECLARATIONS (source order):');
for (const r of rows) {
  const big = r.lines >= 40 ? '  <== LARGE' : '';
  console.log(
    `${String(r.start).padStart(5)}-${String(r.end).padStart(5)}  ${String(r.lines).padStart(4)}L  ${r.kind.padEnd(9)} ${r.name}${big}`,
  );
}

console.log('\nGAPS (loose top-level statements — must be placed in a module):');
for (const g of gaps) {
  if (g.lines < 1) continue;
  console.log(`${String(g.start).padStart(5)}-${String(g.end).padStart(5)}  ${String(g.lines).padStart(4)}L`);
}

console.log(`\ncovered by named declarations: ${covered} code lines`);
console.log(`total code lines: ${codeEnd - codeStart - 1}`);

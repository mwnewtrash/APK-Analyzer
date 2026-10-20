#!/usr/bin/env node
/**
 * tools/declmap.js — top-level declaration map for the legacy single-file analyzer.
 *
 * Usage: node tools/declmap.js <sourceHtml> [--json] [--gaps]
 *
 * Parses the final inline <script> block with Acorn (a real JS parser) and reports
 * each top-level declaration with exact line ranges, so module boundaries can be
 * chosen without hand-rolled brace counting. --gaps additionally lists the line
 * ranges between declarations, which is where loose top-level statements live.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'acorn';

const file = process.argv[2];
if (!file) {
    console.error('usage: node tools/declmap.js <sourceHtml> [--json] [--gaps]');
    process.exit(2);
}

const lines = readFileSync(file, 'utf8').split(/\r?\n/);

// ---- locate the final inline <script> block -------------------------------
let scriptStart = -1;
let scriptEnd = -1;
for (let i = 0; i < lines.length; i++) {
    if (/<script>\s*$/.test(lines[i])) {
        scriptStart = i;
        for (let j = i + 1; j < lines.length; j++) {
            if (/<\/script>/.test(lines[j])) {
                scriptEnd = j;
                i = j;
                break;
            }
        }
    }
}
if (scriptStart < 0) {
    console.error('no inline <script> block found');
    process.exit(1);
}

const code = lines.slice(scriptStart + 1, scriptEnd).join('\n');
const OFFSET = scriptStart + 1; // 0-based index of code line 1

let ast;
try {
    ast = parse(code, { ecmaVersion: 'latest', sourceType: 'script', locations: true });
} catch (err) {
    console.error(`parse failed: ${err.message}`);
    process.exit(1);
}

const decls = [];
const gaps = [];
let cursor = scriptStart + 2; // 1-based line of first code line

for (const node of ast.body) {
    const start = OFFSET + node.loc.start.line + 1; // 1-based, +1 because node.loc is 1-based into `code`
    const end = OFFSET + node.loc.end.line + 1;
    const realStart = node.loc.start.line + 1;
    const realEnd = node.loc.end.line + 1;

    if (realStart > cursor) {
        gaps.push({ start: cursor, end: realStart - 1, lines: realStart - cursor });
    }
    cursor = realEnd + 1;

    let name = null;
    let kind = 'statement';
    if (node.type === 'FunctionDeclaration') { name = node.id.name; kind = 'function'; }
    else if (node.type === 'VariableDeclaration') {
        kind = 'var';
        for (const d of node.declarations) {
            if (d.id.type === 'Identifier') {
                decls.push({
                    name: d.id.name,
                    kind,
                    start: realStart,
                    end: realEnd,
                    lines: realEnd - realStart + 1,
                    init: d.init ? d.init.type : 'none',
                });
            }
        }
        continue;
    }
    else if (node.type === 'ExpressionStatement' &&
             node.expression.type === 'CallExpression') {
        const c = node.expression.callee;
        name = c.type === 'MemberExpression' ? `${c.object.name ?? '?'}.${c.property.name}` : 'call';
        kind = 'call';
    }
    else if (node.type === 'ClassDeclaration') { name = node.id.name; kind = 'class'; }

    decls.push({ name, kind, start: realStart, end: realEnd, lines: realEnd - realStart + 1 });
}

const report = {
    file,
    totalLines: lines.length,
    scriptBlock: [scriptStart + 1, scriptEnd + 1],
    declarationCount: decls.length,
    gapCount: gaps.length,
    declarations: decls,
    gaps,
};

if (process.argv.includes('--json')) {
    writeFileSync('declmap.json', JSON.stringify(report, null, 2));
    console.log('wrote declmap.json');
} else {
    console.log(`total lines: ${lines.length}`);
    console.log(`script block: lines ${scriptStart + 1}..${scriptEnd + 1} (code lines 1..${cursor - 1})`);
    console.log(`top-level nodes: ${decls.length}   gaps: ${gaps.length}\n`);
    console.log('DECLARATIONS (line ranges relative to the <script> code body):');
    for (const d of decls) {
        console.log(`${String(d.start).padStart(5)}-${String(d.end).padStart(5)}  ${String(d.lines).padStart(4)}L  ${d.kind.padEnd(9)} ${d.name}`);
    }
    if (process.argv.includes('--gaps')) {
        console.log('\nGAPS (top-level statements between declarations):');
        for (const g of gaps) {
            console.log(`${String(g.start).padStart(5)}-${String(g.end).padStart(5)}  ${String(g.lines).padStart(4)}L`);
            const first = code.split('\n')[g.start - 1] ?? '';
            console.log(`        └─ ${first.trim().slice(0, 100)}`);
        }
    }
}


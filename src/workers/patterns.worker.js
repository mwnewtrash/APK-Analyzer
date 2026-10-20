// workers/patterns.worker.js — HAND-MAINTAINED. Analysis worker (#18, freeze fix).
// Protocol (all messages carry `id`; replies carry `id` plus result/error):
//   {kind:'init', content}            -> split once, cache lines. {ok:true}
//   {kind:'run', checks, mode}        -> analyze cached lines. {results}
//   {kind:'run', content, checks, mode} -> (re)build cache from content, then run.
//   {kind:'dex', bytes, name}         -> disassemble (bytes transferred). {smali}
//   {kind:'endpoints', content}       -> mine endpoints. {endpoints}
// Single cache slot is enough: ingest issues strictly sequential same-content calls.
// No DOM access here. Importable in Node (handler exported; `self` guard).
import { analyzePatternsFromLines } from '../core/patterns.js';
import { disassembleDex } from '../core/dex.js';
import { extractEndpoints } from '../core/endpoints.js';

let cached = null; // {content, lines}

export async function handleWorkerMessage(m, reply) {
  try {
    if (!m || typeof m.kind !== 'string') return;
    if (m.kind === 'init') {
      cached = (cached && cached.content === m.content) ? cached : { content: m.content, lines: m.content.split('\n') };
      reply({ id: m.id, ok: true });
    } else if (m.kind === 'run') {
      if (typeof m.content === 'string') {
        cached = (cached && cached.content === m.content) ? cached : { content: m.content, lines: m.content.split('\n') };
      }
      if (!cached) { reply({ id: m.id, error: 'no-cache' }); return; }
      reply({ id: m.id, results: analyzePatternsFromLines(cached.lines, m.checks, m.mode) });
    } else if (m.kind === 'dex') {
      reply({ id: m.id, smali: disassembleDex(new Uint8Array(m.buf, m.byteOffset || 0, m.byteLength), m.name) });
    } else if (m.kind === 'endpoints') {
      reply({ id: m.id, endpoints: extractEndpoints(m.content) });
    }
  } catch (err) {
    reply({ id: m && m.id, error: String((err && err.message) || err) });
  }
}

if (typeof self !== 'undefined' && self.addEventListener) {
  self.onmessage = (e) => { handleWorkerMessage(e.data, (r) => self.postMessage(r)); };
}

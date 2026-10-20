const fs = require('fs');
const h = fs.readFileSync('src-legacy/head.html', 'utf8');
const toks = {};
for (const m of h.matchAll(/\b(?:bg|text|border|from|via|to|ring|divide|outline|decoration|accent|shadow|fill|stroke)-((?:violet|purple|blue|indigo|sky|cyan|teal|emerald|green|rose|pink|red|orange|amber|yellow|slate|gray|zinc)-?\d*)(?:\/\d+)?/g)) {
  const t = m[0];
  toks[t] = (toks[t] || 0) + 1;
}
Object.entries(toks).sort((a, b) => b[1] - a[1]).forEach(([t, n]) => console.log(String(n).padStart(3), t));

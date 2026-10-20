function renderUniqueDomains(q) {
    const groups = new Map();
    for (const e of extractedEndpoints) {
        if (q && !e.url.toLowerCase().includes(q)) continue;
        const hm = hostOf(e.url);
        const g = groups.get(hm) || { host: hm, count: 0, sample: e.url };
        g.count++;
        groups.set(hm, g);
    }
    const list = [...groups.values()].sort((a, b) => b.count - a.count || (a.host < b.host ? -1 : 1));
    paintUniqueDomains(list, q);
}

function hostOf(url) {
    try { return new URL(url).hostname.toLowerCase(); } catch (e) {}
    const m = /^[a-z][a-z0-9+\-.]*:\/\/([^\s/:?#]+)/i.exec(url);
    return m ? m[1].toLowerCase() : url;
}

function paintUniqueDomains(list, q) {
    const container = document.getElementById('uniqueEndpointResults');
    const uc = document.getElementById('uniqueDomainCount');
    if (uc) uc.textContent = list.length ? ' (' + list.length + ')' : '';
    const sc = document.getElementById('searchResultCount');
    if (sc) sc.textContent = q ? '' + list.length + ' results' : '';
    if (!container) return;
    if (!list.length) {
        container.innerHTML = '<div class="text-center py-6 text-gray-500"><p class="text-sm">No endpoints found</p></div>';
        return;
    }
    container.innerHTML = list.map(uniqueCard).join('');
}

function uniqueCard(g) {
    const n = g.count + ' URL' + (g.count === 1 ? '' : 's');
    return '<div class="endpoint-card glass rounded-xl p-4 border border-teal-500/30">' +
        '<div class="flex items-center gap-3">' +
        '<div class="flex-1 min-w-0">' +
        '<span class="category-tag bg-teal-500/20 text-teal-400">' + n + '</span>' +
        '<p class="text-white font-mono text-sm break-all mt-1">' + escapeHtml(g.host) + '</p>' +
        '<p class="text-gray-500 font-mono text-xs break-all mt-1">' + escapeHtml(g.sample) + '</p>' +
        '</div>' +
        '<button data-copy-id="' + registerCopy(g.host) + '" class="copy-btn p-2 hover:bg-white/10 rounded-lg">' +
        '<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>' +
        '</svg></button></div></div>';
}

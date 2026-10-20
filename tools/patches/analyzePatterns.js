function analyzePatternsFromLines(lines, checks, usingDecompiledSource = false) {
    // #22: precompute lowercase once per pattern; per-line lowercase computed once.
    const compiledChecks = checks.map(check => ({
        ...check,
        compiled: check.patterns.map(p => {
            const looksLikeRegex = /[.*+?^$()|[\]\\]|\\[dswb]/.test(p) &&
                                   !/^[a-zA-Z0-9_\-./:]+$/.test(p);
            if (looksLikeRegex) {
                try { return { raw: p, regex: new RegExp(p, 'i'), isRegex: true, low: null }; }
                catch { return { raw: p, regex: null, isRegex: false, low: p.toLowerCase() }; }
            }
            return { raw: p, regex: null, isRegex: false, low: p.toLowerCase() };
        })
    }));

    let currentFile = '', fileLineNumber = 0;
    const instancesByCheck = compiledChecks.map(() => []);

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('// FILE: ')) {
            currentFile = line.replace('// FILE: ', '').trim();
            fileLineNumber = 0;
            continue;
        }
        fileLineNumber++;
        const trimmed = line.trim();
        if (trimmed.length < 3) continue;

        const isSourceFile = currentFile && /\.(java|kt)$/.test(currentFile);
        const isSmaliContent = !isSourceFile && (
            trimmed.includes('Landroid/') || trimmed.includes(';->') ||
            trimmed.startsWith('.') ||
            /^(invoke|iget|iput|sget|sput|const|move|return|if-|goto)/.test(trimmed)
        );

        let effectiveLine = trimmed;
        if (isSmaliContent) {
            if (trimmed.includes('const-string')) {
                const m = trimmed.match(/const-string[^"]*"([^"]+)"/);
                if (m) effectiveLine = `String: "${m[1]}"`;
                else continue;
            } else if (!trimmed.startsWith('.field') && !trimmed.startsWith('.method') && trimmed.length < 15) {
                continue;
            }
        }
        if (effectiveLine.length > 500) effectiveLine = effectiveLine.slice(0, 500) + '...';

        const low = effectiveLine.toLowerCase();
        for (let c = 0; c < compiledChecks.length; c++) {
            if (instancesByCheck[c].length >= 50) continue;
            let matchedPattern = null;
            for (const { raw, regex, isRegex, low: patLow } of compiledChecks[c].compiled) {
                if (isRegex ? regex.test(effectiveLine)
                            : low.includes(patLow)) {
                    matchedPattern = raw; break;
                }
            }
            if (matchedPattern) {
                const key = `${currentFile}|${fileLineNumber}|${matchedPattern}`;
                if (!instancesByCheck[c].some(x => x._key === key)) {
                    instancesByCheck[c].push({
                        _key: key,
                        lineNumber: fileLineNumber || (i + 1),
                        file: currentFile || null,
                        content: effectiveLine,
                        pattern: matchedPattern,
                        isSmali: isSmaliContent,
                        isSource: isSourceFile
                    });
                }
            }
        }
    }

    return compiledChecks.map((check, idx) => {
        const instances = instancesByCheck[idx];
        instances.forEach(x => delete x._key);
        return {
            ...check, compiled: undefined,
            detected: instances.length > 0,
            matchedPatterns: [...new Set(instances.map(i => i.pattern))],
            instances
        };
    });
}

function analyzePatterns(content, checks, usingDecompiledSource = false) {
    return analyzePatternsFromLines(content.split('\n'), checks, usingDecompiledSource);
}

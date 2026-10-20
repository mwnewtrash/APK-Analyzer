// inspect xref2 refs for key orchestrators
const x = require('../xref2.json');
for (const k of ['displayMisconfigResults','displayCodeAnalysisResults','renderEndpoints','analyzeDynamicFolder','analyzeAPKGlobal','analyzeDecompiledSourceOnly','resetGlobalAnalyzer','createCheckCard','renderBackendRiskIndicators','renderServerSideVulnerabilities']) {
  const v = x[k];
  if (!v) { console.log(k, '=> MISSING'); continue; }
  console.log(k, '=> kind:' + v.kind, 'refs:' + (v.refs ? v.refs.length : 0), (v.refs || []).slice(0, 10).join(','));
}

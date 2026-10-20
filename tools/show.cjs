// Print exact source of named decls from code.js via xref ranges + free identifiers
const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const root = 'D:\\Notes_Excel\\Projects_Claude\\APK Analyzer\\apk-analyzer';
const code = fs.readFileSync(path.join(root, 'src-legacy', 'code.js'), 'utf8');
const x = JSON.parse(fs.readFileSync(path.join(root, 'xref.json'), 'utf8'));
const byName = {};
x.decls.forEach(d => byName[d.name] = d);

const targets = process.argv.slice(2);
for (const name of targets) {
  const d = byName[name];
  if (!d) { console.log('!! NOT FOUND:', name); continue; }
  const src = code.slice(d.start, d.end);
  console.log('\n===== ' + name + ' [' + d.kind + '] bytes ' + d.start + '-' + d.end + ' lines ' + d.line + ' =====');
  // free identifiers
  let free = new Set();
  try {
    const ast = acorn.parse('(function(){' + src + '\n})', { ecmaVersion: 2022 });
    const declared = new Set(['arguments']);
    // collect declared names in scopes
    function collectPatterns(node, set) {
      if (!node) return;
      if (node.type === 'Identifier') { set.add(node.name); return; }
      if (node.type === 'Property' && node.computed === false) return;
      if (node.type === 'ObjectPattern' || node.type === 'ArrayPattern') {
        (node.elements || node.properties).forEach(e => e && collectPatterns(e, set));
        return;
      }
      if (node.type === 'AssignmentPattern') { collectPatterns(node.left, set); return; }
      if (node.type === 'RestElement') { collectPatterns(node.argument, set); return; }
    }
    const walk = (node) => {
      if (!node || typeof node.type !== 'string') return;
      if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
        const local = new Set();
        node.params.forEach(p => collectPatterns(p, local));
        if (node.id) local.add(node.id.name);
        if (node.type === 'FunctionExpression' && node.id) local.add(node.id.name);
        walkParams(node, local);
        const saved = new Set(free);
        free = new Set();
        walkBody(node.body, local);
        // merge: free minus local
        const childFree = new Set(free);
        free = new Set(saved);
        childFree.forEach(f => { if (!declared.has(f)) free.add(f); });
      } else if (node.type === 'VariableDeclarator') {
        collectPatterns(node.id, declared);
      } else if (node.type === 'CatchClause' && node.param) {
        collectPatterns(node.param, declared);
      }
      for (const k in node) {
        if (k === 'type') continue;
        const v = node[k];
        if (Array.isArray(v)) v.forEach(walk);
        else if (v && typeof v.type === 'string') walk(v);
      }
    };
    function walkParams() {}
    function walkBody(body, local) {
      if (!body) return;
      if (body.type === 'BlockStatement') body.body.forEach(st => { if (st.type === 'VariableDeclaration') st.declarations.forEach(dd => collectPatterns(dd.id, local)); });
      if (!local) local = new Set();
      const localSet = local;
      const walk2 = (node) => {
        if (!node || typeof node.type !== 'string') return;
        if (node.type === 'Identifier') { if (!localSet.has(node.name)) free.add(node.name); return; }
        if (node.type === 'MemberExpression') { walk2(node.object); return; }
        if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
          const inner = new Set(localSet);
          node.params.forEach(p => collectPatterns(p, inner));
          if (node.id) inner.add(node.id.name);
          walkBody(node.body, inner);
          return;
        }
        if (node.type === 'VariableDeclaration') node.declarations.forEach(dd => collectPatterns(dd.id, localSet));
        for (const k in node) {
          if (k === 'type') continue;
          const v = node[k];
          if (Array.isArray(v)) v.forEach(walk2);
          else if (v && typeof v.type === 'string') walk2(v);
        }
      };
      if (body.type === 'BlockStatement') body.body.forEach(st => walk2(st));
      else walk2(body);
    }
    walkBody(ast.body[0].body, declared);
    // filter out globals that are known builtins/declared
    const globals = new Set(['window','document','console','JSZip','localStorage','alert','setTimeout','URL','Blob','FileReader','Math','JSON','Object','Array','String','Number','Boolean','RegExp','Map','Set','Date','Promise','fetch','navigator','location','undefined','null','true','false','this','require','postMessage','self','onmessage']);
    const interesting = [...free].filter(f => !globals.has(f)).sort();
    console.log('FREE REFS:', interesting.join(', '));
  } catch (e) {
    console.log('parse err:', e.message);
  }
  console.log('--- source (' + src.split('\n').length + ' lines) ---');
  console.log(src.slice(0, 400));
  if (src.length > 400) console.log('...[' + (src.length - 400) + ' more chars]');
}

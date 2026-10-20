const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..');
const head=fs.readFileSync(path.join(ROOT,'src-legacy','head.html'),'utf8');
const out=head+'\n<script type="module" src="/src/main.js"></script>\n</body>\n</html>\n';
fs.writeFileSync(path.join(ROOT,'index.html'),out,'utf8');
console.log('wrote index.html', out.length, 'bytes');

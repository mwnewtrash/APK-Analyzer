const fs = require('fs');
const h = fs.readFileSync('src-legacy/head.html', 'utf8');
for (const id of ['globalLoadingSection', 'dynamicLoadingSection']) {
  const i = h.indexOf(`id="${id}"`);
  console.log('===== ' + id + ' =====');
  console.log(h.slice(i - 200, i + 2600));
  console.log('\n');
}

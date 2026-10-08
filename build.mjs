import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const [html, css, ...modules] = await Promise.all([
  readFile(join(root, 'index.html'), 'utf8'),
  readFile(join(root, 'styles.css'), 'utf8'),
  ...['dialogue', 'character-art', 'movement', 'simulation', 'effects', 'renderer', 'app'].map(name => readFile(join(root, 'src', name + '.js'), 'utf8'))
]);
let script = modules.map(source => source.replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '')).join('\n\n');
// コード中の 'assets/….png' をすべて data URL として埋め込む（差分ポーズを増やしてもここの修正は不要）
const assetPaths = [...new Set(script.match(/assets\/[\w\-./]+\.png/g) || [])];
for (const path of assetPaths) {
  const data = await readFile(join(root, path));
  script = script.replaceAll(path, `data:image/png;base64,${data.toString('base64')}`);
}
const stylesheet = css.replace("url('assets/apartments.png')", 'none');
const standalone = html.replace('<link rel="stylesheet" href="styles.css">', () => `<style>${stylesheet}</style>`).replace('<script type="module" src="src/app.js"></script>', () => `<script type="module">\n${script}\n</script>`);
await writeFile(join(root, 'play.html'), standalone, 'utf8');
console.log(`Built standalone game: play.html (${assetPaths.length} images embedded, no server or install required)`);

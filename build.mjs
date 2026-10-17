import { GAME_MODULES } from './tools/game-modules.mjs';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const [html, css, ...modules] = await Promise.all([
  readFile(join(root, 'index.html'), 'utf8'),
  readFile(join(root, 'styles.css'), 'utf8'),
  ...GAME_MODULES.map(name => readFile(join(root, 'src', name + '.js'), 'utf8'))
]);
let script = modules.map(source => source.replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '')).join('\n\n');
// コード中の画像と通常BGMを data URL として埋め込む（差分ポーズを増やしてもここの修正は不要）
const assetPaths = [...new Set(script.replace(/assets\/voices\/[a-f0-9]+\.mp3/g,'').match(/assets\/[\w\-./]+\.(?:png|svg|mp3)/g) || [])];
const assetMime = path => path.endsWith('.svg') ? 'image/svg+xml' : path.endsWith('.mp3') ? 'audio/mpeg' : 'image/png';
// Store each unchanged asset once, then share its URL across all references.
const embeddedAssets = await Promise.all(assetPaths.map(async path => {
  const data = await readFile(join(root, path));
  return `data:${assetMime(path)};base64,${data.toString('base64')}`;
}));
for (const [index, path] of assetPaths.entries()) {
  const reference = `standaloneAssets[${index}]`;
  // Static HTML images live in template literals; JS asset definitions are strings.
  script = script.replaceAll(`src="${path}"`, `src="${'${'+reference+'}'}"`);
  script = script.replaceAll(`'${path}'`, reference).replaceAll(`"${path}"`, reference);
  if (script.includes(path)) throw new Error(`Unsupported embedded asset reference: ${path}`);
}
script = 'const standaloneAssets = '+JSON.stringify(embeddedAssets)+';\n'+script;
let stylesheet = css.replace("url('assets/apartments.png')", 'none');
for(const [index,path] of assetPaths.entries()){
  stylesheet=stylesheet.replaceAll("url('"+path+"')",'url("'+embeddedAssets[index]+'")').replaceAll('url("'+path+'")','url("'+embeddedAssets[index]+'")');
}
const standalone = html.replace('<link rel="stylesheet" href="styles.css">', () => `<style>${stylesheet}</style>`).replace(/<script type="module" src="src\/app\.js(?:\?v=[^"]+)?"><\/script>/, () => `<script type="module">\n${script}\n</script>`);
await writeFile(join(root, 'play.html'), standalone, 'utf8');
console.log(`Built standalone game: play.html (${assetPaths.length} assets embedded, no server or install required)`);

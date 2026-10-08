import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const [html, css, artwork, catSprite, catPortrait, ...modules] = await Promise.all([
  readFile(join(root, 'index.html'), 'utf8'),
  readFile(join(root, 'styles.css'), 'utf8'),
  readFile(join(root, 'assets/apartments.png')),
  readFile(join(root, 'assets/characters/cat/idle.png')),
  readFile(join(root, 'assets/characters/cat/portrait.png')),
  ...['character-art', 'movement', 'simulation', 'renderer', 'app'].map(name => readFile(join(root, 'src', name + '.js'), 'utf8'))
]);
const script = modules.map(source => source.replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '')).join('\n\n')
  .replaceAll('assets/characters/cat/idle.png', `data:image/png;base64,${catSprite.toString('base64')}`)
  .replaceAll('assets/characters/cat/portrait.png', `data:image/png;base64,${catPortrait.toString('base64')}`)
  .replaceAll('assets/apartments.png', `data:image/png;base64,${artwork.toString('base64')}`);
const stylesheet = css.replace("url('assets/apartments.png')", 'none');
const standalone = html.replace('<link rel="stylesheet" href="styles.css">', () => `<style>${stylesheet}</style>`).replace('<script type="module" src="src/app.js"></script>', () => `<script type="module">\n${script}\n</script>`);
await writeFile(join(root, 'play.html'), standalone, 'utf8');
console.log('Built standalone game: play.html (no server or install required)');

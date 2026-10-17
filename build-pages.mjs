import {GAME_MODULES} from './tools/game-modules.mjs';
import {cp,mkdir,mkdtemp,readFile,readdir,stat,writeFile,appendFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const projectRoot=dirname(fileURLToPath(import.meta.url));
// Unique output avoids stale files and never removes a checkout or user files.
const siteRoot=await mkdtemp(join(projectRoot,'.pages-build-'));
// The abandoned pose-animation study is retained in Git history/source only.
const moduleNames=(await readdir(join(projectRoot,'src'))).filter(name=>name.endsWith('.js')&&name!=='luna-motion.js');
const sourceFiles=['index.html','styles.css',...moduleNames.map(name=>'src/'+name)];
const source=await Promise.all(sourceFiles.map(path=>readFile(join(projectRoot,path),'utf8')));
const assets=[...new Set(source.join('\n').match(/assets\/[\w\-./]+\.(?:png|svg|mp3)/g)||[])];
// A refreshed HTML document must not mix newly deployed code with cached modules/CSS.
const version=process.env.GITHUB_SHA?.slice(0,12)||createHash('sha256').update(source.join('\n')).digest('hex').slice(0,12);
// Stable content hashes let unchanged art/audio survive later deployments in browser cache.
const assetVersions=new Map();
for(let index=0;index<assets.length;index+=8)await Promise.all(assets.slice(index,index+8).map(async path=>{
 assetVersions.set(path,createHash('sha256').update(await readFile(join(projectRoot,path))).digest('hex').slice(0,12));
}));
const publishedSource=new Map(sourceFiles.map((path,index)=>[path,source[index]
 .replace(/(from\s+['"])(\.\/[^'"]+\.js)(['"])/g,`$1$2?v=${version}$3`)
 .replace(/(['"])(src\/[^'"]+\.js|styles\.css)(['"])/g,`$1$2?v=${version}$3`)
 .replace(/assets\/[\w\-./]+\.(?:png|svg|mp3)/g,asset=>`${asset}?v=${assetVersions.get(asset)}`)]));
// One dependency-ordered module avoids dozens of serial requests on mobile networks.
const bundle=GAME_MODULES.map(name=>publishedSource.get('src/'+name+'.js').replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'')).join('\n\n');
const bundleVersion=createHash('sha256').update(bundle).digest('hex').slice(0,12);
publishedSource.set('src/game-bundle.js',bundle);
publishedSource.set('index.html',publishedSource.get('index.html').replace(/<script type="module" src="src\/app\.js[^"]*"><\/script>/,
 ()=>`<script type="module">window.kemonoBoot.loadBundle('src/game-bundle.js?v=${bundleVersion}',${Buffer.byteLength(bundle)});</script>`));
const files=[...sourceFiles,'src/game-bundle.js',...assets,'play.html'];
let bytes=0;
// A small concurrency limit avoids a burst of image IO on Windows and CI.
for(let index=0;index<files.length;index+=8)await Promise.all(files.slice(index,index+8).map(async path=>{
 const target=join(siteRoot,path);await mkdir(dirname(target),{recursive:true});
 if(publishedSource.has(path))await writeFile(target,publishedSource.get(path),'utf8');else await cp(join(projectRoot,path),target);
 const fileBytes=(await stat(target)).size;bytes+=fileBytes;
}));
await writeFile(join(siteRoot,'.nojekyll'),'');
if(process.env.GITHUB_OUTPUT)await appendFile(process.env.GITHUB_OUTPUT,'path='+siteRoot+'\n');
console.log(JSON.stringify({siteRoot,version,files:files.length,assets:assets.length,bytes}));

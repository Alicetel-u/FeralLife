import {GAME_MODULES} from './tools/game-modules.mjs';
import {cp,mkdir,mkdtemp,readFile,readdir,stat,writeFile,appendFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
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
const assets=[...new Set(source.join('\n').match(/assets\/[\w\-./]+\.(?:png|svg|mp3)/g)||[])].filter(path=>path!=='assets/audio/the-midnight-crossing.mp3'||existsSync(join(projectRoot,path)));
// A refreshed HTML document must not mix newly deployed code with cached modules/CSS.
const version=process.env.GITHUB_SHA?.slice(0,12)||createHash('sha256').update(source.join('\n')).digest('hex').slice(0,12);
// Stable content hashes let unchanged art/audio survive later deployments in browser cache.
const assetVersions=new Map();
for(let index=0;index<assets.length;index+=8)await Promise.all(assets.slice(index,index+8).map(async path=>{
 assetVersions.set(path,createHash('sha256').update(await readFile(join(projectRoot,path))).digest('hex').slice(0,12));
}));
const builtAt=new Date().toISOString();
const publishedSource=new Map(sourceFiles.map((path,index)=>[path,source[index]
 .replace('name="build-updated" content="local"',`name="build-updated" content="${builtAt}"`)
 .replace(/(from\s+['"])(\.\/[^'"]+\.js)(['"])/g,`$1$2?v=${version}$3`)
 .replace(/(['"])(src\/[^'"]+\.js|styles\.css)(['"])/g,`$1$2?v=${version}$3`)
 .replace(/assets\/[\w\-./]+\.(?:png|svg|mp3)/g,asset=>assetVersions.has(asset)?`${asset}?v=${assetVersions.get(asset)}`:asset)]));
// One dependency-ordered module avoids dozens of serial requests on mobile networks.
const bundle=GAME_MODULES.map(name=>publishedSource.get('src/'+name+'.js').replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'')).join('\n\n');
const bundleVersion=createHash('sha256').update(bundle).digest('hex').slice(0,12);
publishedSource.set('src/game-bundle.js',bundle);
publishedSource.set('index.html',publishedSource.get('index.html')
 .replace(/<script type="module" src="src\/app\.js[^"]*"><\/script>/,'')
 .replace('<!-- WEB_BOOT_ENTRY -->',()=>`<script>window.kemonoBoot.loadBundle('src/game-bundle.js?v=${bundleVersion}',${Buffer.byteLength(bundle)});</script>`));
// Old bookmarks must not download/parse the 200+ MB offline export on phones.
// Keep build.mjs's local standalone file, but publish a tiny compatibility entry.
publishedSource.set('play.html',`<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>けもの荘</title>
<script>location.replace('./'+location.search+location.hash);</script>
<noscript><meta http-equiv="refresh" content="0;url=./"></noscript>
</head><body><p>ゲームを開いています。<a href="./">通常版を開く</a></p></body></html>`);
// Isolated, opt-in cast comparison. Publish only its page and mastered audio.
const castTestFolder='assets/voice-tests/act3-v4-cast';
const castTests=existsSync(join(projectRoot,castTestFolder))?(await readdir(join(projectRoot,castTestFolder))).filter(name=>name==='index.html'||/^[a-f0-9]{64}\.mp3$/.test(name)).map(name=>castTestFolder+'/'+name):[];
const files=[...sourceFiles,'src/game-bundle.js',...assets,'play.html',...castTests];
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

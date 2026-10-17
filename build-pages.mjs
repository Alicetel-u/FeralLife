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
// Keep the early loading meter aligned with the actual entry module graph.
const moduleGraph=new Set();
function collectBootModules(path){
 if(moduleGraph.has(path))return;
 moduleGraph.add(path);
 const text=source[sourceFiles.indexOf(path)];
 if(text===undefined)throw new Error('Missing boot module: '+path);
 for(const match of text.matchAll(/^import .*?from ['"]\.\/([^'"]+\.js)(?:\?[^'"]*)?['"]/gm))collectBootModules('src/'+match[1]);
}
collectBootModules('src/app.js');
const assets=[...new Set(source.join('\n').match(/assets\/[\w\-./]+\.(?:png|svg|mp3)/g)||[])];
// A refreshed HTML document must not mix newly deployed code with cached modules/CSS.
const version=process.env.GITHUB_SHA?.slice(0,12)||createHash('sha256').update(source.join('\n')).digest('hex').slice(0,12);
const publishedSource=new Map(sourceFiles.map((path,index)=>[path,source[index]
 .replace(/const moduleTotal=\d+;/,`const moduleTotal=${moduleGraph.size};`)
 .replace(/(from\s+['"])(\.\/[^'"]+\.js)(['"])/g,`$1$2?v=${version}$3`)
 .replace(/(['"])(src\/[^'"]+\.js|styles\.css)(['"])/g,`$1$2?v=${version}$3`)
 .replace(/assets\/[\w\-./]+\.(?:png|svg|mp3)/g,asset=>`${asset}?v=${version}`)]));
const files=[...sourceFiles,...assets,'play.html'];
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

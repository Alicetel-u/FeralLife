import {cp,mkdir,mkdtemp,readFile,readdir,stat,writeFile,appendFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const projectRoot=dirname(fileURLToPath(import.meta.url));
// Unique output avoids stale files and never removes a checkout or user files.
const siteRoot=await mkdtemp(join(projectRoot,'.pages-build-'));
const moduleNames=(await readdir(join(projectRoot,'src'))).filter(name=>name.endsWith('.js'));
const sourceFiles=['index.html','styles.css',...moduleNames.map(name=>'src/'+name)];
const source=await Promise.all(sourceFiles.map(path=>readFile(join(projectRoot,path),'utf8')));
const assets=[...new Set(source.join('\n').match(/assets\/[\w\-./]+\.(?:png|svg|mp3)/g)||[])];
const files=[...sourceFiles,...assets,'play.html'];
let bytes=0;
// A small concurrency limit avoids a burst of image IO on Windows and CI.
for(let index=0;index<files.length;index+=8)await Promise.all(files.slice(index,index+8).map(async path=>{
 const target=join(siteRoot,path);await mkdir(dirname(target),{recursive:true});await cp(join(projectRoot,path),target);const fileBytes=(await stat(target)).size;bytes+=fileBytes;
}));
await writeFile(join(siteRoot,'.nojekyll'),'');
if(process.env.GITHUB_OUTPUT)await appendFile(process.env.GITHUB_OUTPUT,'path='+siteRoot+'\n');
console.log(JSON.stringify({siteRoot,files:files.length,assets:assets.length,bytes}));

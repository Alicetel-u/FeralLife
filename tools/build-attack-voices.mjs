import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const manifestPath=resolve(root,'src/voice-manifest.js');
const original=await readFile(manifestPath,'utf8');
const prefix='export const VOICE_MANIFEST = ';
if(!original.startsWith(prefix))throw new Error('Unexpected voice manifest format');
const manifest=JSON.parse(original.slice(prefix.length).trim().replace(/;$/,''));
let processed=0;
for(const entry of Object.values(manifest)){
 if(!['duel-manager-attack','duel-moku-attack'].includes(entry.performance))continue;
 const fastFile=entry.file.replace(/\.mp3$/,'.attack.mp3');
 if(fastFile===entry.file)throw new Error('Unexpected voice file: '+entry.file);
 const args=['-hide_banner','-loglevel','error','-y','-i',resolve(root,entry.file),
  '-af','atempo=1.5,apad=pad_dur=0.16','-codec:a','libmp3lame','-q:a','3',resolve(root,fastFile)];
 const ffmpeg=spawnSync('ffmpeg',args,{encoding:'utf8'});
 if(ffmpeg.status!==0)throw new Error('ffmpeg '+entry.file+': '+(ffmpeg.stderr||ffmpeg.error?.message));
 entry.fastFile=fastFile;processed++;
}
if(processed!==12)throw new Error('Expected 12 battle attack voices; found '+processed);
await writeFile(manifestPath,prefix+JSON.stringify(manifest,null,2)+';\n');
console.log('Created '+processed+' pitch-preserving 1.5x battle clips with a short quiet audio tail');

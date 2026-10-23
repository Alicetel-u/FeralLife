import {readFile,writeFile,stat} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const manifestPath=resolve(root,'src/voice-manifest.js');
const original=await readFile(manifestPath,'utf8');
const prefix='export const VOICE_MANIFEST = ';
const declaration=original.indexOf(prefix);
if(declaration<0)throw new Error('Voice manifest declaration missing');
const manifest=JSON.parse(original.slice(declaration+prefix.length).trim().replace(/;$/,''));
// Pitch-preserving speed lives in the file. Playback rate stays 1 so a media
// element routed through Web Audio does not drop the end of the phrase.
const paces=new Map([
 ['duel-manager-attack',{tempo:'1.5',suffix:'.attack.mp3'}],
 ['duel-moku-attack',{tempo:'1.5',suffix:'.attack.mp3'}],
 ['duel-moku',{tempo:'1.16',suffix:'.pace.mp3'}],
 ['duel-manager',{tempo:'1.25',suffix:'.pace.mp3'}],
 ['duel-luna',{tempo:'1.25',suffix:'.pace.mp3'}]
]);
let processed=0,encoded=0;
for(const entry of Object.values(manifest)){
 if(!String(entry.performance||'').startsWith('duel-'))continue;
 const pace=paces.get(entry.performance);
 if(!pace)throw new Error('No offline pace for '+entry.performance);
 const fastFile=entry.file.replace(/\.mp3$/,pace.suffix);
 if(fastFile===entry.file)throw new Error('Unexpected voice file: '+entry.file);
 entry.fastFile=fastFile;processed++;
 const source=resolve(root,entry.file),output=resolve(root,fastFile);
 // Git checkout does not preserve meaningful source/output mtimes. Files are
 // content-addressed by voice hash; a committed non-empty fast clip is reusable.
 await stat(source);
 let fresh=false;
 try{const outputStat=await stat(output);fresh=outputStat.size>0;}catch{fresh=false;}
 if(fresh)continue;
 const args=['-hide_banner','-loglevel','error','-y','-i',source,
  '-af',`atempo=${pace.tempo},apad=pad_dur=0.16`,'-codec:a','libmp3lame','-q:a','3',output];
 const ffmpeg=spawnSync('ffmpeg',args,{encoding:'utf8'});
 if(ffmpeg.status!==0)throw new Error('ffmpeg '+entry.file+': '+(ffmpeg.stderr||ffmpeg.error?.message));
 encoded++;
}
if(processed<12)throw new Error('Expected the duel voices, including 12 attacks; found '+processed);
const newline=original.includes('\r\n')?'\r\n':'\n';
const body=JSON.stringify(manifest,null,2).replace(/\n/g,newline);
await writeFile(manifestPath,original.slice(0,declaration)+prefix+body+';'+newline);
console.log('Duel pace files ready: '+processed+' ('+encoded+' encoded)');

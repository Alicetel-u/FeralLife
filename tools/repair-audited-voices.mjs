import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {VOICE_MANIFEST} from '../src/voice-manifest.js';
import {assertSpokenDuration} from './voice-quality.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const rules=JSON.parse(await readFile(new URL('../config/voice-quality-repairs.json',import.meta.url),'utf8')).entries;
const run=args=>{const result=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{encoding:'utf8',windowsHide:true});if(result.status!==0)throw Error(result.stderr||result.error?.message);};
let count=0;
for(const rule of rules){
 const entries=Object.values(VOICE_MANIFEST).filter(e=>e.hash===rule.hash&&e.text===rule.text&&e.speaker===rule.speaker);
 if(!entries.length)throw Error('Repair target missing: '+rule.hash);
 if(!/^assets\/voices\/[a-f0-9]+(?:\.[a-z-]+)*\.mp3$/.test(rule.input))throw Error('Unexpected repair input');
 const filters=[];
 // Never remove a pause from inside a line; leave 120 ms around both spoken edges.
 if(rule.trimEdges){
  const probe=spawnSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',resolve(root,rule.input)],{encoding:'utf8',windowsHide:true});
  const duration=Number(probe.stdout);if(probe.status!==0||!duration)throw Error('Repair input cannot be decoded');
  const scan=spawnSync('ffmpeg',['-hide_banner','-nostats','-i',resolve(root,rule.input),'-af','silencedetect=noise=-45dB:d=0.18','-f','null','-'],{encoding:'utf8',windowsHide:true});
  if(scan.status!==0)throw Error('Silence scan failed');
  const intervals=[];let begin=null;
  for(const m of scan.stderr.matchAll(/silence_(start|end):\s*([\d.]+)/g)){if(m[1]==='start')begin=Number(m[2]);else if(begin!==null){intervals.push([begin,Number(m[2])]);begin=null;}}
  if(begin!==null)intervals.push([begin,duration]);
  const start=Math.max(0,(intervals.find(([a])=>a<.05)?.[1]||0)-.12);
  const end=Math.min(duration,(intervals.findLast(([,b])=>b>=duration-.1)?.[0]??duration)+.12);
  if(end-start<.5)throw Error('Edge repair would remove the spoken line');
  filters.push(`atrim=start=${start}:end=${end}`,'asetpts=PTS-STARTPTS');
 }
 if(rule.reduceDB)filters.push('volume=-'+rule.reduceDB+'dB');
 if(!filters.length)filters.push('anull');
 const file='assets/voices/'+rule.hash+'.qa.mp3';
 run(['-i',resolve(root,rule.input),'-af',filters.join(','),'-codec:a','libmp3lame','-q:a','2',resolve(root,file)]);
 const probe=spawnSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',resolve(root,file)],{encoding:'utf8',windowsHide:true});
 if(probe.status!==0)throw Error('Repaired recording cannot be decoded');
 const seconds=Number(probe.stdout);assertSpokenDuration(rule.text,seconds);
 for(const entry of entries){entry.file=file;delete entry.fastFile;entry.audioQuality={edgeSilenceTrimmed:!!rule.trimEdges,peakReductionDB:rule.reduceDB||0,durationSeconds:seconds,...(rule.restoreFrom?{restoredFrom:rule.restoreFrom}:{})};}
 count++;
}
await writeFile(new URL('../src/voice-manifest.js',import.meta.url),'// Generated clips only.\nexport const VOICE_MANIFEST = '+JSON.stringify(VOICE_MANIFEST,null,2)+';\n');
console.log('Repaired audited voice recordings: '+count);

// Master only the explicit repair list; preserve every unrelated recording.
import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {VOICE_MANIFEST} from '../src/voice-manifest.js';
const rules=JSON.parse(await readFile(new URL('../config/voice-repairs.json',import.meta.url),'utf8')).lines;
let count=0;
for(const entry of Object.values(VOICE_MANIFEST)){
 if(!rules.some(r=>r.speaker===entry.speaker&&r.text===entry.text)||!entry.hash)continue;
 // Apply only the newly generated repair request, never another chapter's clip.
 const plan=JSON.parse(await readFile(new URL('../.local/voice-plan.json',import.meta.url),'utf8'));
 if(!plan.rows.some(r=>r.hash===entry.hash))continue;
 const source=`assets/voices/${entry.hash}.mp3`,output=`assets/voices/${entry.hash}.repair.mp3`;
 const shout=entry.text==='待ってろ！！ 今そっちに——！';
 const result=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',source,'-af',`loudnorm=I=${shout?-20:-18}:TP=${shout?-6:-3}:LRA=7`,'-ar','44100','-codec:a','libmp3lame','-q:a','2',output],{encoding:'utf8'});
 if(result.status!==0)throw Error(result.stderr||result.error?.message);
 entry.file=output;delete entry.fastFile;
 if(shout)entry.volumeGain=.5;
 entry.audioMastering={integratedLUFS:shout?-20:-18,truePeakDBTP:shout?-6:-3};count++;
}
if(count!==rules.length)throw Error(`Expected ${rules.length} repaired clips; found ${count}`);
await writeFile(new URL('../src/voice-manifest.js',import.meta.url),'// Generated clips only.\nexport const VOICE_MANIFEST = '+JSON.stringify(VOICE_MANIFEST,null,2)+';\n');
console.log('Mastered repair voices: '+count);

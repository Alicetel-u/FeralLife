// Prepare only the approved New Ally recordings; never retime other scenes.
import {writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {VOICE_MANIFEST} from '../src/voice-manifest.js';
const entries=Object.values(VOICE_MANIFEST).filter(e=>e.source?.startsWith('act2/observation/luna-new-ally:'));
if(entries.length!==32)throw Error('Expected exactly 32 new-ally voices');
for(const entry of entries){
 const source=`assets/voices/${entry.hash}.mp3`,output=`assets/voices/${entry.hash}.new-ally.mp3`;
 // Keep a small breath before/after speech. Interior comedic pauses stay intact.
 const trim='silenceremove=start_periods=1:start_duration=0.015:start_threshold=-48dB:start_silence=0.035';
 const filter=`${trim},areverse,${trim},areverse,loudnorm=I=-18:TP=-5:LRA=7`;
 const result=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',source,'-af',filter,'-ar','44100','-codec:a','libmp3lame','-q:a','2',output],{encoding:'utf8'});
 if(result.status!==0)throw Error(result.stderr||result.error?.message);
 entry.file=output;delete entry.fastFile;
 entry.audioMastering={integratedLUFS:-18,truePeakDBTP:-5,edgeSilenceTrimmed:true};
}
await writeFile(new URL('../src/voice-manifest.js',import.meta.url),'// Generated clips only.\nexport const VOICE_MANIFEST = '+JSON.stringify(VOICE_MANIFEST,null,2)+';\n');
console.log('Prepared 32 new-ally voices');

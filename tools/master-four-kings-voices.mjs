import {writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {VOICE_MANIFEST} from '../src/voice-manifest.js';
const entries=Object.values(VOICE_MANIFEST).filter(e=>e.source?.startsWith('act2/observation/luna-four-kings')||e.speaker==='manager'&&e.source?.startsWith('act2/observation/luna-new-ally:'));
if(entries.length!==48)throw Error('Expected 36 part-two clips and 12 refreshed landlord clips');
for(const entry of entries){
 const input=`assets/voices/${entry.hash}.mp3`,output=`assets/voices/${entry.hash}.four-kings.mp3`,level=entry.speaker==='manager'?-17:-18;
 const trim='silenceremove=start_periods=1:start_duration=0.015:start_threshold=-48dB:start_silence=0.035';
 const result=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',input,'-af',`${trim},areverse,${trim},areverse,loudnorm=I=${level}:TP=-5:LRA=7`,'-ar','44100','-codec:a','libmp3lame','-q:a','2',output],{encoding:'utf8'});
 if(result.status!==0)throw Error(result.stderr||result.error?.message);
 entry.file=output;delete entry.fastFile;entry.audioMastering={integratedLUFS:level,truePeakDBTP:-5,edgeSilenceTrimmed:true};
}
await writeFile(new URL('../src/voice-manifest.js',import.meta.url),'// Generated clips only.\nexport const VOICE_MANIFEST = '+JSON.stringify(VOICE_MANIFEST,null,2)+';\n');
console.log('Prepared 48 observation voice clips');

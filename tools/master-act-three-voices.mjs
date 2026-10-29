import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {extractVoiceScript} from './voice-script.mjs';
import {VOICE_MANIFEST} from '../src/voice-manifest.js';
const current=new Set(extractVoiceScript('act3-current').map(row=>row.lineKey));
for(const [key,entry] of Object.entries(VOICE_MANIFEST))if(/^act3\/(after|map)\//.test(entry.source)&&!current.has(key))delete VOICE_MANIFEST[key];
const entries=[...current].map(key=>VOICE_MANIFEST[key]);
if(entries.length!==88)throw Error('Expected 88 implemented chapter-three recordings, got '+entries.length);
for(const entry of entries){
 const input='assets/voices/'+entry.hash+'.mp3',output='assets/voices/'+entry.hash+'.act3.mp3';
 const trim='silenceremove=start_periods=1:start_duration=0.015:start_threshold=-48dB:start_silence=0.04';
 const filter=trim+',areverse,'+trim+',areverse,loudnorm=I=-18:TP=-5:LRA=7,apad=pad_dur=0.2';
 const result=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',input,'-af',filter,'-ar','44100','-codec:a','libmp3lame','-q:a','2',output],{encoding:'utf8',windowsHide:true});
 if(result.status!==0)throw Error(result.stderr||result.error?.message);
 entry.file=output;entry.audioMastering={integratedLUFS:-18,truePeakDBTP:-5,edgeSilenceTrimmed:true,tailPaddingSeconds:.2};
}
await writeFile('src/voice-manifest.js','// Generated clips only.\nexport const VOICE_MANIFEST = '+JSON.stringify(VOICE_MANIFEST,null,2)+';\n');
console.log('Mastered '+entries.length+' chapter-three recordings');

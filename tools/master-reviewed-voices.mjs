// Master only the exact completed repair plan. This script never calls a paid API.
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {VOICE_MANIFEST} from '../src/voice-manifest.js';
import {assertSpokenDuration} from './voice-quality.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const input=process.argv[2];if(!input)throw Error('Usage: node tools/master-reviewed-voices.mjs <completed-plan.json>');
const plan=JSON.parse(await readFile(resolve(root,input),'utf8'));
const rules=JSON.parse(await readFile(resolve(root,'config/voice-repairs.json'),'utf8')).lines;
if(plan.scope!=='repairs'||!Array.isArray(plan.rows)||!plan.rows.length||plan.rows.length>30||new Set(plan.rows.map(r=>r.lineKey)).size!==plan.rows.length)throw Error('Expected a bounded, exact repair plan');
const run=(name,args)=>{
 const result=spawnSync(name,args,{cwd:root,encoding:'utf8',windowsHide:true});
 if(result.status!==0)throw Error(result.stderr||result.error?.message||name+' failed');
 return result.stdout;
};
const duration=file=>Number(run('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',file]));
// Validate every source before modifying any delivery file or manifest entry.
const targets=[];
for(const row of plan.rows){
 const clip=VOICE_MANIFEST[row.lineKey],rule=rules.find(r=>r.speaker===row.speaker&&r.text===row.text);
 if(!/^[a-f0-9]{64}$/.test(row.hash)||clip?.hash!==row.hash||!rule?.repairComment)throw Error('Manifest or correction does not match plan: '+row.lineKey);
 const source='assets/voices/'+row.hash+'.mp3',output='assets/voices/'+row.hash+'.repair.mp3',seconds=duration(source);
 assertSpokenDuration(row.text,seconds);if(seconds<.4)throw Error('Unexpectedly short speech: '+row.lineKey);
 targets.push({row,clip,rule,source,output,seconds});
}
for(const {row,clip,rule,source,output,seconds} of targets){
 // Keep the entire source, including pauses; fades affect only 4/16ms at its edges.
 run('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',source,'-af',`loudnorm=I=-18:TP=-6:LRA=7,afade=t=in:d=0.004,afade=t=out:st=${Math.max(0,seconds-.016).toFixed(6)}:d=0.016,apad=pad_dur=0.25`,'-ar','44100','-c:a','libmp3lame','-q:a','2',output]);
 const delivered=duration(output);assertSpokenDuration(row.text,delivered);
 if(delivered<seconds+.20)throw Error('Tail padding was not preserved: '+row.lineKey);
 run('ffmpeg',['-v','error','-i',output,'-f','null','-']);
 clip.file=output;delete clip.fastFile;
 clip.repairReview=true;clip.repairComment=rule.repairComment;
 clip.audioMastering={integratedLUFS:-18,truePeakDBTP:-6,tailPaddingSeconds:.25,fadeInSeconds:.004,fadeOutSeconds:.016};
 console.log(JSON.stringify({text:row.text,sourceSeconds:seconds,deliveredSeconds:delivered,file:output}));
}
await writeFile(resolve(root,'src/voice-manifest.js'),'// Generated clips only.\nexport const VOICE_MANIFEST = '+JSON.stringify(VOICE_MANIFEST,null,2)+';\n');
console.log('Mastered exactly '+targets.length+' reviewed recordings');

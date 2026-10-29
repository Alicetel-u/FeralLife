// Generate isolated cast auditions; never replace gameplay or review decisions.
import {readFile,writeFile,mkdir,open,unlink,rename} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {extractVoiceScript,planVoices,digest} from './voice-script.mjs';
import {assertSpokenDuration} from './voice-quality.mjs';
import {VOICE_MANIFEST} from '../src/voice-manifest.js';
const json=async p=>JSON.parse((await readFile(p,'utf8')).replace(/^\uFEFF/,''));
const config=await json('config/voice-cast-test.json');
const script=extractVoiceScript('act3-current'),pronunciations=(await json('config/voice-pronunciation-issues.json')).issues;
const folder='assets/voice-tests/act3-v4-cast';
const rows=[];
for(const [speaker,character] of Object.entries(config.characters))for(const [index,sample] of character.samples.entries()){
 const original=script.find(row=>row.speaker===speaker&&row.line.text===sample.text);
 if(!original)throw Error('Audition must use a real playable line: '+speaker);
 const performance='cast-test-'+speaker+'-'+index;
 const profile={tags:sample.tags.map(tag=>'['+tag+']'),settings:{stability:config.stability,similarity_boost:config.similarityBoost},direction:character.description};
 const [row]=planVoices([{...original,performance}],{[speaker]:character.voiceId},{model:config.model,outputFormat:'mp3_44100_128',profiles:{[performance]:profile}},pronunciations);
 const baseline=VOICE_MANIFEST[original.lineKey];if(!baseline)throw Error('Missing comparison recording');
 rows.push({...row,speaker,name:character.name,description:character.description,kind:sample.kind,baseline:baseline.file,file:folder+'/'+row.hash+'.mp3',raw:'.local/cast-test-'+row.hash+'.mp3'});
}
if(rows.length!==8)throw Error('Expected two tests for each of four characters');
const planId=digest(rows.map(row=>row.hash));
const estimate=rows.filter(row=>!existsSync(row.raw)).reduce((sum,row)=>sum+row.billableCharacters,0);
await mkdir('.local',{recursive:true});
await writeFile('.local/voice-cast-test-plan.json',JSON.stringify({planId,estimatedCharacters:estimate,rows},null,2));
console.log(JSON.stringify({planId,clips:rows.length,estimatedCharacters:estimate,model:config.model}));
const args=process.argv.slice(2);
if(args.includes('--generate')){
 if(!args.includes('--approve='+planId))throw Error('Current audition plan hash required');
 if(estimate>1800)throw Error('Unexpected audition cost');
 for(const command of [['check-ignore','--quiet','.local/elevenlabs.json'],['ls-files','--error-unmatch','.local/elevenlabs.json']]){
  const result=spawnSync('git',command,{stdio:'ignore',windowsHide:true});
  if(result.error||result.status!==(command[0]==='check-ignore'?0:1))throw Error('Secret Git protection not confirmed');
 }
 const key=process.env.ELEVENLABS_API_KEY||(await json('.local/elevenlabs.json')).apiKey;
 const api=async(path,options={})=>{
  let response;try{response=await fetch('https://api.elevenlabs.io/v1/'+path,{...options,headers:{'xi-api-key':key,'Content-Type':'application/json'},signal:AbortSignal.timeout(90000)});}catch{throw Error('Connection interrupted; reconcile journal/history before retrying');}
  if(!response.ok)throw Error('ElevenLabs HTTP '+response.status+'; no automatic retry');return response;
 };
 const models=await (await api('models')).json();
 if(!models.some(model=>model.model_id===config.model&&model.can_do_text_to_speech&&model.languages.some(l=>l.language_id==='ja')))throw Error('Japanese model unavailable');
 for(const character of Object.values(config.characters))await api('voices/'+character.voiceId);
 const balance=await (await api('user/subscription')).json();
 if(balance.character_limit-balance.character_count<estimate)throw Error('Insufficient balance');
 const lock=await open('.local/voice-generation.lock','wx');
 try{
  const journal=existsSync('.local/voice-journal.json')?await json('.local/voice-journal.json'):{};
  const saveJournal=async()=>{await writeFile('.local/voice-journal.json.tmp',JSON.stringify(journal,null,2));await rename('.local/voice-journal.json.tmp','.local/voice-journal.json');};
  for(const row of rows){
   if(existsSync(row.raw))continue;
   if(journal[row.hash])throw Error('Audition attempt needs history reconciliation: '+row.hash);
   journal[row.hash]={status:'in-flight',source:row.source,audition:true,started:new Date().toISOString()};await saveJournal();
   const response=await api('text-to-speech/'+row.voiceId+'?output_format=mp3_44100_128',{method:'POST',body:JSON.stringify(row.request)});
   const bytes=Buffer.from(await response.arrayBuffer());
   if(!response.headers.get('content-type')?.includes('audio/')||bytes.length<128)throw Error('Invalid audio; inspect history');
   await writeFile(row.raw,bytes);
   journal[row.hash]={...journal[row.hash],status:'complete',requestId:response.headers.get('request-id'),chargedCharacters:response.headers.get('character-cost')};await saveJournal();
   console.log('Recorded '+row.name+' / '+row.kind);
  }
 }finally{await lock.close();await unlink('.local/voice-generation.lock');}
}
if(!args.includes('--build'))process.exit(0);
await mkdir(folder,{recursive:true});
for(const row of rows){
 if(!existsSync(row.raw))throw Error('Generate all auditions before building');
 const trim='silenceremove=start_periods=1:start_duration=0.015:start_threshold=-48dB:start_silence=0.04';
 const result=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',row.raw,'-af',trim+',areverse,'+trim+',areverse,loudnorm=I=-18:TP=-5:LRA=7,apad=pad_dur=0.2','-ar','44100','-codec:a','libmp3lame','-q:a','2',row.file],{encoding:'utf8',windowsHide:true});
 if(result.status!==0)throw Error(result.stderr||'Mastering failed');
 const probe=spawnSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',row.file],{encoding:'utf8',windowsHide:true});
 if(probe.status!==0)throw Error('Cannot decode audition');assertSpokenDuration(row.text,Number(probe.stdout));
}
const escape=text=>text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const tabs=Object.entries(config.characters).map(([speaker,c],i)=>`<button type="button" role="tab" aria-selected="${i===0}" aria-controls="panel-${speaker}" id="tab-${speaker}" data-cast="${speaker}">${c.name}</button>`).join('');
const panels=Object.entries(config.characters).map(([speaker,c],i)=>`<section id="panel-${speaker}" role="tabpanel" aria-labelledby="tab-${speaker}" ${i?'hidden':''}><h2>${c.name}</h2><p class="direction">${escape(c.description)}</p><div class="samples">${rows.filter(row=>row.speaker===speaker).map(row=>`<article><h3>${row.kind}</h3><p class="line">${escape(row.text)}</p><label>今の本編<audio controls preload="none" src="../../voices/${row.baseline.split('/').at(-1)}"></audio></label><label>調整したテスト<audio controls preload="none" src="${row.hash}.mp3"></audio></label></article>`).join('')}</div></section>`).join('');
await writeFile(folder+'/index.html',`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>4人のボイステスト｜けもの荘</title><style>
*{box-sizing:border-box} [hidden]{display:none!important} body{margin:0;background:#111827;color:#faf4e8;font:16px/1.45 system-ui,sans-serif}main{height:100dvh;max-width:1040px;margin:auto;padding:max(12px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(12px,env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:12px}h1{font-size:clamp(20px,3vw,28px);margin:0}p{margin:0}header p{font-size:13px;color:#bac6d8}nav{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}button{font:inherit;border:1px solid #748199;border-radius:8px;padding:10px 4px;background:#202b3e;color:inherit;cursor:pointer}button[aria-selected=true]{background:#ffe5b0;color:#151923;border-color:#ffe5b0}section{min-height:0}h2{font-size:22px;margin:0}.direction{color:#cbd3df;font-size:14px;margin:4px 0 12px}.samples{display:grid;grid-template-columns:1fr 1fr;gap:16px}article{background:#1c2739;padding:16px;border-radius:12px}h3{font-size:15px;margin:0 0 8px;color:#ffd89a}.line{min-height:3em;font-weight:600}label{display:block;font-size:13px;margin-top:12px}audio{display:block;width:100%;height:40px;margin-top:4px}button:focus-visible{outline:3px solid #7ed4ff;outline-offset:2px}@media(max-width:600px){main{gap:8px}.samples{grid-template-columns:1fr;gap:10px}article{padding:10px 12px}.direction{margin-bottom:8px}h2{font-size:18px}.line{min-height:0;font-size:15px}h3{margin-bottom:4px}label{margin-top:6px}audio{height:32px}}@media(max-height:650px){main{gap:5px;padding-top:8px}header p,.direction{font-size:11px}h1{font-size:18px}button{padding:5px}article{padding:8px}.samples{gap:6px}audio{height:28px}label{margin-top:4px}h2{font-size:16px}.line{font-size:13px}.direction{margin:2px 0 5px}}
</style><main><header><h1>4人のボイステスト</h1><p>同じ台詞で聴き比べ。本編の声はまだ変更していません。再生ボタンを押すまで音は出ません。</p></header><nav role="tablist" aria-label="キャラクター">${tabs}</nav>${panels}</main><script>
const tabs=[...document.querySelectorAll('[role=tab]')];
function select(tab){document.querySelectorAll('audio').forEach(audio=>audio.pause());tabs.forEach(button=>button.setAttribute('aria-selected',String(button===tab)));document.querySelectorAll('[role=tabpanel]').forEach(panel=>panel.hidden=panel.id!==tab.getAttribute('aria-controls'));}
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>select(tab));tab.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=tabs[event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length];select(next);next.focus();});});
document.querySelectorAll('audio').forEach(audio=>audio.addEventListener('play',()=>document.querySelectorAll('audio').forEach(other=>{if(other!==audio)other.pause();})));
</script></html>`);
console.log('Built isolated cast comparison: '+folder+'/index.html');

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {extractVoiceScript,planVoices} from '../tools/voice-script.mjs';
import {voiceLineKey,voicePerformance} from '../src/voice-policy.js';
import {createVoicePlayer} from '../src/voice-player.js';

test('backgrounding pauses and resumes the current voice without stale play failures ending it',async()=>{
 const line={speaker:'cat',text:'一時停止ニャ。'},sounds=[];let rejectFirst,plays=0;
 const player=createVoicePlayer({storage:null,manifest:{[voiceLineKey(line)]:{file:'voice.mp3'}},makeAudio:()=>{
  const sound={pauseCount:0,play(){plays++;return plays===1?new Promise((yes,no)=>{rejectFirst=no;}):Promise.resolve();},pause(){this.pauseCount++;},removeAttribute(){},load(){}};sounds.push(sound);return sound;
 }});
 try{
  player.play(line,'same');player.setSuspended(true);assert.equal(sounds[0].pauseCount,1);assert.equal(player.busy,true);
  player.setSuspended(false);assert.equal(plays,2);assert.equal(sounds.length,1);
  rejectFirst({name:'AbortError'});await Promise.resolve();assert.equal(player.busy,true);
  sounds[0].onended();assert.equal(player.busy,false);
  player.setSuspended(true);player.setSuspended(false);assert.equal(plays,2,'finished clips stay finished');
  player.setSuspended(true);player.play(line,'next');assert.equal(plays,2,'new clips wait while hidden');
  player.setEnabled(false);player.setSuspended(false);assert.equal(plays,2,'OFF prevents resume');
 }finally{player.stop();}
});

test('duel voice plays faster with original pitch and normal scenes return to 1x',()=>{
 const battle={speaker:'manager',text:'いくぞ！',duelRound:0,duelAttack:true};
 const normal={speaker:'manager',text:'そうか。'};
 const sounds=[];
 const manifest={
  [voiceLineKey(battle)]:{file:'battle.mp3',performance:'duel-manager-attack'},
  [voiceLineKey(normal)]:{file:'normal.mp3',performance:'normal'}
 };
 const player=createVoicePlayer({storage:null,manifest,makeAudio:()=>{
  const audio={play(){return Promise.resolve()},pause(){},removeAttribute(){},load(){}};sounds.push(audio);return audio;
 }});
 player.play(battle,'battle');
 assert.equal(sounds[0].playbackRate,1.75);
 const lunaAttack={speaker:'hostess',text:'そこっ！',duelRound:1,duelAttack:true};
 manifest[voiceLineKey(lunaAttack)]={file:'luna-attack.mp3',performance:'duel-luna'};
 player.play(lunaAttack,'luna-attack');
 assert.equal(sounds.at(-1).playbackRate,1.75);
 const moku={speaker:'cat',text:'ニャ！',duelRound:0};
 manifest[voiceLineKey(moku)]={file:'moku.mp3',performance:'duel-moku'};
 player.play(moku,'moku');
 assert.equal(sounds.at(-1).playbackRate,1.16);
 assert.equal(sounds[0].preservesPitch,true);
 player.play(normal,'normal');
 assert.equal(sounds.at(-1).playbackRate,1);
 player.stop();
});

test('discarding preloaded voices releases their media source and decoder',()=>{
 const line={speaker:'cat',text:'先読みニャ。'},sounds=[];
 const player=createVoicePlayer({storage:null,manifest:{[voiceLineKey(line)]:{file:'voice.mp3'}},makeAudio:()=>{
  const sound={loads:0,removed:0,pause(){},load(){this.loads++;},removeAttribute(name){if(name==='src')this.removed++;}};sounds.push(sound);return sound;
 }});
 player.prepare(line);player.prepare(null);
 assert.equal(sounds[0].removed,1);assert.equal(sounds[0].loads,2);
 player.stop();assert.equal(sounds[0].removed,1);
});

test('lively landlord keeps inner voice separate, uses audition settings and preserves Moku caches',async()=>{
 const rows=extractVoiceScript('act1').filter(row=>!row.source.startsWith('act1/observation/'));
 const ids=JSON.parse(await readFile(new URL('../config/voice-ids.json',import.meta.url)));
 const config=JSON.parse(await readFile(new URL('../config/voice-performance.json',import.meta.url)));
 const {issues}=JSON.parse(await readFile(new URL('../config/voice-pronunciation-issues.json',import.meta.url)));
 const plan=planVoices(rows,ids,config,issues);
 assert.equal(voicePerformance({speaker:'manager',text:'なんで俺が決めるんだよ……。'}),'weary');
 assert.equal(voicePerformance({speaker:'manager',text:'誰のせいだよ！！'}),'retort');
 for(const r of plan.filter(r=>r.speaker==='manager'&&!r.performance.startsWith('tragedy-'))){
  assert.equal(r.voiceId,'vY4PC2kSleyw73YRUOI6');
  assert.equal(r.request.voice_settings.stability,r.performance==='inner'?0.5:0);
  if(r.performance!=='inner')assert.equal(r.request.voice_settings.speed,1.05);
  else {
   assert.equal(r.request.voice_settings.speed,0.95);
   assert.ok(r.request.text.startsWith('[softly] [whispers] [thoughtful] '));
  }
 }
 const {VOICE_MANIFEST}=await import('../src/voice-manifest.js');
 for(const r of plan.filter(r=>r.speaker==='cat'&&!r.source.includes('attempt-1/ash/trash/reply')))assert.equal(VOICE_MANIFEST[r.lineKey]?.hash,r.hash);
 for(const r of plan.filter(r=>r.speaker==='manager'&&r.performance!=='inner'&&!r.source.includes('attempt-1/ash/trash/reply')))assert.equal(VOICE_MANIFEST[r.lineKey]?.hash,r.hash);
});

test('act1 extraction covers revised branches, epilogue and the complete daily schedule',async()=>{
 const rows=extractVoiceScript('act1').filter(row=>row.speaker==='cat');
 const texts=new Set(rows.map(row=>row.text||row.line.text));
 for(const text of ['唐揚げ弁当。大盛り。あとプリンも頼むニャ。','大家。歓迎会するニャ？','腹が減ったニャ……。でも、まぶたも重いニャ。','……あと五分だけニャ。','そろそろ部屋に戻るニャ。','気づいたら朝ニャ。昨日の続きのつもりだったニャ。'])assert.ok(texts.has(text),text);
 const ids=JSON.parse(await readFile(new URL('../config/voice-ids.json',import.meta.url)));
 const config=JSON.parse(await readFile(new URL('../config/voice-performance.json',import.meta.url)));
 assert.ok(planVoices(rows,ids,config).every(row=>row.voiceId==='0ptCJp0xgdabdcpVtCB5'));
 assert.ok(rows.every(row=>!row.source.startsWith('act2/')));
});

test('pronunciation repair changes only spoken input and affected cache hashes',async()=>{
 const rows=extractVoiceScript();
 const ids=JSON.parse(await readFile(new URL('../config/voice-ids.json',import.meta.url)));
 const config=JSON.parse(await readFile(new URL('../config/voice-performance.json',import.meta.url)));
 const {issues}=JSON.parse(await readFile(new URL('../config/voice-pronunciation-issues.json',import.meta.url)));
 const original=planVoices(rows,ids,config),fixed=planVoices(rows,ids,config,issues);
 for(let i=0;i<fixed.length;i++){
  assert.equal(fixed[i].text,original[i].text);
  assert.equal(fixed[i].lineKey,original[i].lineKey);
  const affected=issues.some(rule=>rows[i].line.text.includes(rule.term));
  assert.equal(fixed[i].hash!==original[i].hash,affected);
  if(affected)for(const rule of issues)assert.ok(!fixed[i].request.text.includes(rule.term));
 }
});
test('intro includes only real opening, ambient and pre-choice ash lines; inner voice is distinct',async()=>{
 const rows=extractVoiceScript();
 assert.equal(rows.filter(r=>r.performance==='inner').length,2);
 assert.ok(rows.some(r=>r.source.startsWith('act1/ambient/')));
 assert.ok(rows.every(r=>!['narrator','前大家からの手紙'].includes(r.speaker)));
 assert.equal(rows.at(-1).line.text,'なんで俺が決めるんだよ……。');
 assert.ok(rows.every(r=>!r.source.includes('dinner')&&!r.source.includes('act2')&&!r.source.includes('/ash/')));
 const ids=JSON.parse(await readFile(new URL('../config/voice-ids.json',import.meta.url)));
 const config=JSON.parse(await readFile(new URL('../config/voice-performance.json',import.meta.url)));
 const plan=planVoices(rows,ids,config);
 const modified=structuredClone(config);modified.profiles.inner.settings.stability=0;
 assert.notEqual(plan[0].hash,planVoices(rows,ids,modified)[0].hash);
 assert.equal(plan[2].hash,planVoices(rows,ids,modified)[2].hash);
 assert.notEqual(voiceLineKey({speaker:'manager',text:'同じ'}),voiceLineKey({speaker:'manager',text:'同じ',innerVoice:true}));
 assert.equal(voicePerformance({speaker:'manager',text:'こんにちは！',emotion:'angry'}),'normal');
 assert.ok(extractVoiceScript('act2').some(r=>r.speaker==='hostess'));
});
test('voice stops on advance, replay/back, OFF and skip; stale play failures cannot affect next line',async()=>{
 const line={speaker:'manager',text:'声'},other={speaker:'cat',text:'ニャ'};
 const manifest={[voiceLineKey(line)]:{file:'one.mp3'},[voiceLineKey(other)]:{file:'two.mp3'}};
 const sounds=[];let rejectFirst;
 const player=createVoicePlayer({manifest,storage:null,makeAudio:()=>{
   const a={paused:false,play:()=>sounds.length===1?new Promise((_,reject)=>{rejectFirst=reject;}):Promise.resolve(),pause(){this.paused=true;},removeAttribute(){},load(){}};sounds.push(a);return a;
 }});
 player.play(line,'1');assert.equal(player.busy,true);
 player.play(other,'2');assert.equal(sounds[0].paused,true);
 rejectFirst(Error('old'));await Promise.resolve();assert.equal(player.busy,true);
 sounds[1].onended();assert.equal(player.busy,false);
 player.play(line,'1');assert.equal(sounds.length,3);
 player.setVolume(0.2);assert.equal(sounds[2].volume,0.2*1.6);
 player.setEnabled(false);assert.equal(sounds[2].paused,true);assert.equal(player.busy,false);
 player.setEnabled(true);assert.equal(sounds.length,4);
 player.stop();assert.equal(sounds[3].paused,true);assert.equal(player.busy,false);
 player.play({speaker:'narrator',text:'silent'},'3');assert.equal(sounds.length,4);
});
test('autoplay rejection can be retried by a user gesture and network errors release AUTO',async()=>{
 const line={speaker:'manager',text:'声'},sounds=[];
 const player=createVoicePlayer({storage:null,manifest:{[voiceLineKey(line)]:{file:'one.mp3'}},makeAudio:()=>{
 const a={play:()=>sounds.length===1?Promise.reject({name:'NotAllowedError'}):Promise.resolve(),pause(){},removeAttribute(){},load(){}};sounds.push(a);return a;
 }});
 player.play(line,'1');await Promise.resolve();assert.equal(player.busy,false);
 player.unlock();assert.equal(sounds.length,2);assert.equal(player.busy,true);
 sounds[1].onerror();assert.equal(player.busy,false);player.stop();
});


test('first tragedy uses serious performances only after the fire and preserves ordinary caches',async()=>{
 const rows=extractVoiceScript('act1').filter(r=>r.source.includes('attempt-1/ash/trash/reply'));
 assert.equal(rows.length,19);
 assert.ok(rows.slice(0,8).every(r=>!r.performance.startsWith('tragedy-')));
 assert.ok(rows.slice(8).every(r=>r.performance.startsWith('tragedy-')));
 assert.equal(rows.at(-1).performance,'tragedy-grief');
 assert.equal(voicePerformance({speaker:'manager',text:'モク！！'}),'normal');
 const config=JSON.parse(await readFile(new URL('../config/voice-performance.json',import.meta.url)));
 for(const r of rows.slice(8))assert.ok(config.profiles[r.performance].tags.every(t=>!t.includes('lighthearted')));
});


test('act-two trouble-one scope includes the film, arrival, observation, all first-event branches and rewinds only',async()=>{
 const rows=extractVoiceScript('act2-trouble1');
 assert.deepEqual([...new Set(rows.map(r=>r.speaker))].sort(),['cat','hostess','manager']);
 assert.equal(rows.filter(r=>r.source.startsWith('act2/film/')).length,6);
 assert.ok(rows.some(r=>r.source.startsWith('act2/opening')));
 assert.ok(rows.some(r=>r.source.startsWith('act2/observation/')));
 assert.ok(rows.some(r=>r.source.includes('/rewind/')));
 assert.ok(rows.some(r=>r.performance==='tragedy-panic'));
 assert.ok(rows.every(r=>r.line.voiceChapter===2&&!r.source.includes('contract')));
 assert.equal(new Set(rows.map(r=>r.lineKey)).size,rows.length);
 const ids=JSON.parse(await readFile(new URL('../config/voice-ids.json',import.meta.url)));
 const config=JSON.parse(await readFile(new URL('../config/voice-performance.json',import.meta.url)));
 const plan=planVoices(rows,ids,config);
 assert.ok(plan.every(r=>r.voiceId&&r.request.text));
 assert.ok(plan.filter(r=>r.speaker==='hostess').every(r=>r.voiceId==='0sLdAOQEyDDSrsr4uwND'));
 assert.equal(voicePerformance({speaker:'cat',text:'いつものモクニャ。'}),'moku');
 assert.equal(voicePerformance({speaker:'hostess',text:'……怖かった。',emotion:'sad',voiceChapter:2}),'luna-serious');
 assert.equal(voicePerformance({speaker:'manager',text:'心の声',innerVoice:true,voiceChapter:2}),'inner');
});


test('iPhone initial gesture unlocks the same media element used by delayed film cues',async()=>{
 const descriptor=Object.getOwnPropertyDescriptor(globalThis,'navigator');
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{userAgent:'iPhone'}});
 let player;
 try{
  const {ACT_TWO_OPENING_SCENES}=await import('../src/act-two-opening.js');
  const cues=ACT_TWO_OPENING_SCENES.flatMap(s=>s.cues.filter(c=>!c.silent));
  const sounds=[],played=[];
  const manifest=Object.fromEntries(cues.map((c,i)=>[voiceLineKey(c),{file:`film-${i}.mp3`}]));
  player=createVoicePlayer({manifest,storage:null,chapter:()=>1,makeAudio:()=>{
   const a={play(){played.push([this,this.src]);return Promise.resolve();},pause(){},removeAttribute(){},load(){}};sounds.push(a);return a;
  }});
  player.unlock();await Promise.resolve();
  assert.match(played[0][1],/^data:audio/);
  for(const [i,cue] of cues.entries()){
   assert.equal(cue.voicePerformance,'luna-film-tense');
   player.prepare(cue);player.play(cue,'film:'+i);
   assert.equal(played.at(-1)[0],sounds[0]);assert.equal(played.at(-1)[1],`film-${i}.mp3`);
   player.stop();
  }
 }finally{player?.stop();if(descriptor)Object.defineProperty(globalThis,'navigator',descriptor);else delete globalThis.navigator;}
});

for(const mobile of [false,true])test(`character gain follows speaker and volume on the reused ${mobile?'iPhone':'desktop'} audio graph`,async()=>{
 const old=globalThis.AudioContext,descriptor=Object.getOwnPropertyDescriptor(globalThis,'navigator');const gains=[],compressors=[];let sources=0;
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{userAgent:mobile?'iPhone':'Desktop'}});
 const node=()=>({connect(){},disconnect(){}});
 globalThis.AudioContext=class{
  state='running';destination={};
  createMediaElementSource(){sources++;return node();}
  createGain(){const g={...node(),gain:{value:1}};gains.push(g);return g;}
  createDynamicsCompressor(){const comp={...node(),threshold:{},knee:{},ratio:{},attack:{},release:{}};compressors.push(comp);return comp;}
 };
 let player;
 try{
  const lines=['manager','hostess','cat'].map(speaker=>({speaker,text:speaker}));
  player=createVoicePlayer({storage:null,manifest:Object.fromEntries(lines.map(l=>[voiceLineKey(l),{file:l.speaker+'.mp3'}])),makeAudio:()=>({play:()=>Promise.resolve(),pause(){},load(){},removeAttribute(){}})});
  player.unlock();await Promise.resolve();
  for(const [i,l] of lines.entries()){player.play(l,String(i));assert.equal(gains[0].gain.value,(mobile?4:1)*0.8*[1.6,1.8,1][i]);}
  assert.equal(compressors[0].threshold.value,-1);
  assert.equal(compressors[0].ratio.value,20);
  assert.equal(sources,1,'reuse the unlocked graph across speakers');
  player.play({...lines[0],speaker:'大家（心の声）'},'inner');
  player.setVolume(0.25);assert.equal(gains[0].gain.value,(mobile?4:1)*0.25*1.6);
 }finally{player?.stop();if(old===undefined)delete globalThis.AudioContext;else globalThis.AudioContext=old;if(descriptor)Object.defineProperty(globalThis,'navigator',descriptor);else delete globalThis.navigator;}
});

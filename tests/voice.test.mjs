import test from 'node:test';
import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import {extractVoiceScript,planVoices} from '../tools/voice-script.mjs';
import {voiceLineKey,voicePerformance} from '../src/voice-policy.js';
import {createVoicePlayer} from '../src/voice-player.js';
import {playDuelCue} from '../src/act-two-duel-stage.js';
import {prepareMorningBirds} from '../src/act-two-bad-stage.js';
import {playEpilogueSound} from '../src/act-two-epilogue-stage.js';

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

test('duel voices use pre-rendered speed files at native rate without affecting other voices',()=>{
 const battle={speaker:'manager',text:'いくぞ！',duelRound:0,duelAttack:true};
 const normal={speaker:'manager',text:'そうか。'};
 const sounds=[];
 const manifest={
  [voiceLineKey(battle)]:{file:'battle.mp3',fastFile:'battle.attack.mp3',performance:'duel-manager-attack'},
  [voiceLineKey(normal)]:{file:'normal.mp3',performance:'normal'}
 };
 const player=createVoicePlayer({storage:null,manifest,makeAudio:()=>{
  const audio={play(){return Promise.resolve()},pause(){},removeAttribute(){},load(){}};sounds.push(audio);return audio;
 }});
 player.play(battle,'battle');
 assert.equal(sounds[0].playbackRate,1);
 assert.equal(sounds[0].src,'battle.attack.mp3');
 const moku={speaker:'cat',text:'ニャ！',duelRound:0};
 manifest[voiceLineKey(moku)]={file:'moku.mp3',fastFile:'moku.pace.mp3',performance:'duel-moku'};
 player.play(moku,'moku');
 assert.equal(sounds.at(-1).playbackRate,1);
 assert.equal(sounds.at(-1).src,'moku.pace.mp3');
 const luna={speaker:'hostess',text:'ねえ',duelRound:0};
 manifest[voiceLineKey(luna)]={file:'luna.mp3',fastFile:'luna.pace.mp3',performance:'duel-luna'};
 player.play(luna,'luna');
 assert.equal(sounds.at(-1).playbackRate,1);
 assert.equal(sounds.at(-1).src,'luna.pace.mp3');
 player.play(normal,'normal');
 assert.equal(sounds.at(-1).playbackRate,1);
 assert.equal(sounds.at(-1).src,'normal.mp3');
 player.stop();
});

test('committed duel clips carry their speed and stay on disk',async()=>{
 const {VOICE_MANIFEST}=await import('../src/voice-manifest.js');
 let attacks=0,lines=0;
 for(const entry of Object.values(VOICE_MANIFEST)){
  if(!String(entry.performance||'').startsWith('duel-'))continue;
  lines++;
  const attack=entry.performance.endsWith('-attack');
  if(attack)attacks++;
  if(entry.repairReview){assert.match(entry.file,/\.repair\.mp3$/);await access(new URL('../'+entry.file,import.meta.url));}
  else {assert.match(entry.fastFile,attack?/\.attack\.mp3$/:/\.pace\.mp3$/);await access(new URL('../'+entry.fastFile,import.meta.url));}
 }
 assert.equal(attacks,12);
 assert.ok(lines>attacks);
});

test('battle strike reuses one audio context and does not close the voice output',()=>{
 const previous=globalThis.AudioContext;
 let contexts=0,closed=0;
 globalThis.AudioContext=class{
  constructor(){contexts++;}
  state='running';currentTime=0;destination={};
  resume(){return Promise.resolve();}
  close(){closed++;return Promise.resolve();}
  createOscillator(){return {frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},start(){},stop(){},disconnect(){},set onended(fn){this.ended=fn;}};}
  createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}
 };
 try{
  const player=createVoicePlayer({storage:null,manifest:{},makeAudio:()=>({play(){return Promise.resolve();},pause(){},load(){},removeAttribute(){}})});
  player.playStrike({duelAttack:true,duelRank:4},.8);
  player.playStrike({duelAttack:true,duelRank:1},.8);
  assert.equal(contexts,1);
  assert.equal(closed,0);
  let strikes=0;
  const voice={playStrike(){strikes++;}};
  playDuelCue({duelAttack:true,duelRank:2},'strike-a',true,.5,voice);
  playDuelCue({duelAttack:true,duelRank:2},'strike-a',true,.5,voice);
  playDuelCue({duelAttack:true,duelRank:2},'strike-b',false,.5,voice);
  assert.equal(strikes,1);
  playDuelCue({duelAttack:true,duelRank:2},'strike-c',true,.5,voice);
  assert.equal(strikes,2);
 }finally{if(previous===undefined)delete globalThis.AudioContext;else globalThis.AudioContext=previous;}
});

test('scene cues share the voice context and leave it open',()=>{
 const previous=globalThis.AudioContext;
 let contexts=0,closed=0;
 globalThis.AudioContext=class{
  constructor(){contexts++;}
  state='running';currentTime=0;destination={};sampleRate=8000;
  resume(){return Promise.resolve();}
  close(){closed++;return Promise.resolve();}
  createOscillator(){return {frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},start(){},stop(){},disconnect(){},set onended(fn){}};}
  createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){}},connect(){},disconnect(){},stop(){}};}
  createBiquadFilter(){return {type:'',frequency:{value:0},Q:{value:0},connect(){},disconnect(){}};}
  createBuffer(){return {getChannelData:()=>new Float32Array(8)};}
  createBufferSource(){return {connect(){},start(){},stop(){},disconnect(){},set onended(fn){}};}
 };
 try{
  const player=createVoicePlayer({storage:null,manifest:{},makeAudio:()=>({play(){return Promise.resolve();},pause(){},load(){},removeAttribute(){}})});
  const shared=player.audioContext();
  player.playStrike({duelAttack:true,duelRank:1},.5);
  assert.equal(player.audioContext(),shared);
  prepareMorningBirds(.5,shared).play()();
  playEpilogueSound('lock',.5,shared)();
  assert.equal(contexts,1);
  assert.equal(closed,0);
 }finally{if(previous===undefined)delete globalThis.AudioContext;else globalThis.AudioContext=previous;}
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
   assert.ok(r.request.text.startsWith('[thoughtful] [conversational] '));
  }
 }
 const {VOICE_MANIFEST}=await import('../src/voice-manifest.js');
 const repairs=JSON.parse(await readFile(new URL('../config/voice-repairs.json',import.meta.url))).lines;
 const unchanged=r=>!repairs.some(f=>f.speaker===r.speaker&&f.text===r.text);
 for(const r of plan.filter(r=>r.speaker==='cat'&&r.performance!=='moku'&&unchanged(r)&&!r.source.includes('attempt-1/ash/trash/reply')))assert.equal(VOICE_MANIFEST[r.lineKey]?.hash,r.hash);
 for(const r of plan.filter(r=>r.speaker==='manager'&&r.performance!=='inner'&&unchanged(r)&&!r.source.includes('attempt-1/ash/trash/reply')))assert.equal(VOICE_MANIFEST[r.lineKey]?.hash,r.hash);
});

test('act1 extraction covers revised branches, epilogue and the complete daily schedule',async()=>{
 const rows=extractVoiceScript('act1').filter(row=>row.speaker==='cat');
 const texts=new Set(rows.map(row=>row.text||row.line.text));
 for(const text of ['唐揚げ弁当。大盛り。あとプリンも頼むニャ。','大家。歓迎会するニャ？','腹が減ったニャ……。でも、まぶたも重いニャ。','……すぅ……すぅ……。','少し歩くニャ。座りっぱなしで足が固まったニャ。','よく寝たニャ。朝の空気は気持ちいいニャ。'])assert.ok(texts.has(text),text);
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
 const vacancy=plan.find(r=>r.source.startsWith('act2/film/')&&r.text.includes('入居者'));
 assert.match(vacancy.request.text,/にゅうきょしゃ、ぼしゅう/);
 assert.doesNotMatch(vacancy.request.text,/whispers|softly|breathlessly/);
 assert.match(vacancy.request.text,/panicked/);
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

test('reported voice repairs change spoken input only for the exact matching speaker and text',async()=>{
 const config=JSON.parse(await readFile(new URL('../config/voice-performance.json',import.meta.url)));
 const repairs=JSON.parse(await readFile(new URL('../config/voice-repairs.json',import.meta.url))).lines;
 const {extractCompleteVoiceScript}=await import('../tools/voice-script.mjs');
 const rows=extractCompleteVoiceScript();
 const original=planVoices(rows,{manager:'m',cat:'c',hostess:'l'},config);
 const fixed=planVoices(rows,{manager:'m',cat:'c',hostess:'l'},config,[],repairs);
 for(let i=0;i<rows.length;i++){
  const rule=repairs.find(r=>r.speaker===rows[i].speaker&&r.text===rows[i].line.text);
  assert.equal(fixed[i].lineKey,original[i].lineKey);
  if(rule){assert.ok(fixed[i].request.text.includes(rule.spokenText));assert.notEqual(fixed[i].hash,original[i].hash);}
  else assert.equal(fixed[i].hash,original[i].hash);
 }
});
test('a mastered shout can reduce its own amplification without changing other voices',()=>{
 const l={speaker:'manager',text:'叫び'},a={play:()=>Promise.resolve(),pause(){},load(){},removeAttribute(){}};
 const p=createVoicePlayer({storage:null,manifest:{[voiceLineKey(l)]:{file:'shout.mp3',volumeGain:.5}},makeAudio:()=>a});
 try{p.play(l,'shout');assert.equal(a.volume,.8*1.6*.5);}finally{p.stop();}
});

test('Luna observation voice extraction preserves all authored performances without ambient duplicates',async()=>{
 const {ACT_TWO_OBSERVATION_BEATS}=await import('../src/act-two-observation.js');
 const rows=extractVoiceScript('act2-trouble1').filter(r=>r.source.startsWith('act2/observation/'));
 assert.equal(rows.length,68);
 assert.deepEqual(rows.map(r=>r.line.text),ACT_TWO_OBSERVATION_BEATS.flatMap(b=>b.lines.filter(l=>!l.silent).map(l=>l.text)));
 assert.ok(rows.every(r=>r.source.startsWith('act2/observation/luna-')));
});

test('all voice profiles and future repair overrides enforce clear delivery',async()=>{
 const config=JSON.parse(await readFile(new URL('../config/voice-performance.json',import.meta.url)));
 const ids=JSON.parse(await readFile(new URL('../config/voice-ids.json',import.meta.url)));
 const rows=extractVoiceScript('intro');
 for(const profile of Object.values(config.profiles))assert.doesNotMatch(profile.tags.join(' '),/\[(softly|whispers?|whispering|mumbling)\]/i);
 const row=rows[0];
 const future=structuredClone(config);future.profiles[row.performance].tags=['[whispers]'];
 assert.throws(()=>planVoices([row],ids,future),/clear and projected/);
 assert.throws(()=>planVoices([row],ids,config,[],[{speaker:row.speaker,text:row.line.text,tags:['[softly]']}]),/clear and projected/);
});

test('voice timing follows actual media including trailing silence, finishes at full duration and resets between clips',()=>{
 const a={speaker:'cat',text:'末尾まで確認ニャ。'},b={speaker:'manager',text:'次の録音。'},sounds=[];
 const player=createVoicePlayer({storage:null,manifest:{[voiceLineKey(a)]:{file:'a.mp3'},[voiceLineKey(b)]:{file:'b.mp3',fastFile:'b.pace.mp3'}},makeAudio:()=>{const audio={duration:NaN,currentTime:0,play:()=>Promise.resolve(),pause(){},removeAttribute(){},load(){}};sounds.push(audio);return audio;}});
 try{
  assert.deepEqual(player.timing,{currentTime:0,duration:0});player.play(a,'a');assert.deepEqual(player.timing,{currentTime:0,duration:0});
  sounds[0].duration=5.6;sounds[0].currentTime=4.9;assert.deepEqual(player.timing,{currentTime:4.9,duration:5.6});
  sounds[0].onended();assert.deepEqual(player.timing,{currentTime:5.6,duration:5.6});assert.equal(player.outcome,'ended');
  player.play(b,'b');assert.equal(sounds[1].src,'b.pace.mp3');assert.deepEqual(player.timing,{currentTime:0,duration:0});
  sounds[1].duration=Infinity;assert.deepEqual(player.timing,{currentTime:0,duration:0});sounds[1].duration=3;sounds[1].currentTime=4;assert.equal(player.timing.currentTime,3);
  player.stop();assert.deepEqual(player.timing,{currentTime:0,duration:0});
 }finally{player.stop();}
});

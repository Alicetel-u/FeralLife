import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {extractVoiceScript,planVoices} from '../tools/voice-script.mjs';
import {voiceLineKey,voicePerformance} from '../src/voice-policy.js';
import {createVoicePlayer} from '../src/voice-player.js';

test('lively landlord keeps inner voice separate, uses audition settings and preserves Moku caches',async()=>{
 const rows=extractVoiceScript('act1').filter(row=>!row.source.startsWith('act1/observation/'));
 const ids=JSON.parse(await readFile(new URL('../config/voice-ids.json',import.meta.url)));
 const config=JSON.parse(await readFile(new URL('../config/voice-performance.json',import.meta.url)));
 const {issues}=JSON.parse(await readFile(new URL('../config/voice-pronunciation-issues.json',import.meta.url)));
 const plan=planVoices(rows,ids,config,issues);
 assert.equal(voicePerformance({speaker:'manager',text:'なんで俺が決めるんだよ……。'}),'weary');
 assert.equal(voicePerformance({speaker:'manager',text:'誰のせいだよ！！'}),'retort');
 for(const r of plan.filter(r=>r.speaker==='manager')){
  assert.equal(r.voiceId,'vY4PC2kSleyw73YRUOI6');
  assert.equal(r.request.voice_settings.stability,r.performance==='inner'?0.5:0);
  if(r.performance!=='inner')assert.equal(r.request.voice_settings.speed,1.05);
  else {
   assert.equal(r.request.voice_settings.speed,0.95);
   assert.ok(r.request.text.startsWith('[softly] [whispers] [thoughtful] '));
  }
 }
 const {VOICE_MANIFEST}=await import('../src/voice-manifest.js');
 for(const r of plan.filter(r=>r.speaker==='cat'))assert.equal(VOICE_MANIFEST[r.lineKey]?.hash,r.hash);
 for(const r of plan.filter(r=>r.speaker==='manager'&&r.performance!=='inner'))assert.equal(VOICE_MANIFEST[r.lineKey]?.hash,r.hash);
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
 player.setVolume(0.2);assert.equal(sounds[2].volume,0.2);
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

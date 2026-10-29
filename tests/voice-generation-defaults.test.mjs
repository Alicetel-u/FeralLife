import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {extractVoiceScript,planVoices} from '../tools/voice-script.mjs';
const json=async path=>JSON.parse(await readFile(path,'utf8'));
test('future production uses the adopted V3-style V4 requests and approved Mimi without changing playback identities',async()=>{
 const config=await json('config/voice-performance.json');config.generationDefaults=await json('config/voice-generation-defaults.json');
 const ids=await json('config/voice-ids.json'),readings=(await json('config/voice-pronunciation-issues.json')).issues;
 const script=extractVoiceScript('act3-current');
 const previous=await json('config/voice-cast-test.json');
 for(const [speaker,c] of Object.entries(previous.characters))for(const [index,sample] of c.samples.entries()){
  const line=script.find(row=>row.speaker===speaker&&row.line.text===sample.text);
  const [planned]=planVoices([line],ids,config,readings);
  assert.equal(planned.request.model_id,'eleven_v4');assert.equal(planned.lineKey,line.lineKey);
  assert.deepEqual(planned.request.voice_settings,{stability:.5,similarity_boost:.85});
  assert.equal(planned.voiceId,config.generationDefaults.characters[speaker].voiceId);
  const mode=index?'tense':'casual';
  for(const tag of config.generationDefaults.characters[speaker][mode])assert.ok(planned.request.text.includes(tag));
  assert.equal(planned.deliveryProfile,'v3-inspired-v4:'+mode);
 }
 const collapse=script.find(row=>row.line.collapse);
 assert.match(planVoices([collapse],ids,config,readings)[0].request.text,/\[shocked\]/);
 // Previous chapters' future recordings follow the adoption too; old playback keys stay valid.
 const older=extractVoiceScript('intro').find(row=>row.speaker==='manager');
 const [future]=planVoices([older],ids,config,readings);
 assert.equal(future.request.model_id,'eleven_v4');assert.equal(future.lineKey,older.lineKey);
});

test('Moku gets energetic duel-only V4 direction while his ordinary languid character and other actors remain unchanged',async()=>{
 const ids=await json('config/voice-ids.json'),base=await json('config/voice-performance.json');
 base.generationDefaults=await json('config/voice-generation-defaults.json');
 const script=extractVoiceScript('act2-duel'),all=planVoices(script,ids,base);
 const moku=all.filter(r=>r.speaker==='cat'),attacks=moku.filter(r=>r.performance==='duel-moku-attack');
 assert.equal(moku.length,25,'cover all four rounds, choices and victory');
 assert.equal(attacks.length,4,'all four Moku attack/ultimate calls');
 for(const row of moku){
  assert.equal(row.request.model_id,'eleven_v4');
  assert.equal(row.request.voice_settings.stability,.35);
  assert.equal(row.request.voice_settings.similarity_boost,.85);
  assert.equal(row.voiceId,ids.characters.cat.voiceId);
  assert.match(row.request.text,/\\[excited\\]/);
  assert.doesNotMatch(row.request.text,/languid|sulky|drawn-out/i);
  if(row.performance==='duel-moku-attack')assert.match(row.request.text,/\\[shouting\\]/);
  else assert.match(row.request.text,/upbeat comic banter/);
 }
 const oldConfig=structuredClone(base);
 delete oldConfig.generationDefaults.duelMoku;
 const oldPlan=planVoices(script,ids,oldConfig);
 assert.equal(oldPlan.length,all.length);
 for(let i=0;i<all.length;i++){
  if(all[i].speaker==='cat')assert.notEqual(all[i].hash,oldPlan[i].hash,'new Moku recording intentionally differs');
  else assert.equal(all[i].hash,oldPlan[i].hash,'all other voices remain untouched');
  assert.equal(all[i].lineKey,oldPlan[i].lineKey,'dialogue and playback identity never change');
 }
 const normal=extractVoiceScript('intro').find(r=>r.speaker==='cat');
 const [normalVoice]=planVoices([normal],ids,base);
 assert.equal(normalVoice.request.voice_settings.stability,.5);
 assert.match(normalVoice.request.text,/languid, mildly sulky/);
 assert.doesNotMatch(normalVoice.request.text,/upbeat comic banter/);
});

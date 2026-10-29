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

test('Moku uses natural script-only V4 battle speech without extra laughter or overacting',async()=>{
 const ids=await json('config/voice-ids.json'),base=await json('config/voice-performance.json');
 base.generationDefaults=await json('config/voice-generation-defaults.json');
 const script=extractVoiceScript('act2-duel'),all=planVoices(script,ids,base);
 const moku=all.filter(r=>r.speaker==='cat'),attacks=moku.filter(r=>r.performance==='duel-moku-attack');
 assert.equal(moku.length,25,'cover all four rounds, choices and victory');
 assert.equal(attacks.length,4,'all four Moku attack/ultimate calls');
 for(const row of moku){
  assert.equal(row.request.model_id,'eleven_v4');
  assert.equal(row.request.voice_settings.stability,.65);
  assert.equal(row.request.voice_settings.similarity_boost,.85);
  assert.equal(row.voiceId,ids.characters.cat.voiceId);
  assert.equal(row.request.text,row.request.text.trim());
  assert.doesNotMatch(row.request.text,/\\[[^\\]]+\\]|excited|playful|shouting|languid|sulky|laugh|chuckl|giggl/i);
  assert.ok(row.request.text.includes('ニャ'),'No extra laughter or repeated ニャ is prompted');
  assert.equal(row.request.text.replace(/[^ニ]/g,'').length>=1,true);
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
 assert.equal(base.generationDefaults.unauthorizedVocalizations.policy.includes('Do not add laughter'),true);
});

test('future voice planning rejects unscripted laughs from any character pronunciation repairs',async()=>{
 const ids=await json('config/voice-ids.json'),base=await json('config/voice-performance.json');
 base.generationDefaults=await json('config/voice-generation-defaults.json');
 const row=extractVoiceScript('act2-duel').find(r=>r.speaker==='hostess');
 assert.ok(row);
 assert.throws(()=>planVoices([row],ids,base,[],[{speaker:'hostess',text:row.line.text,spokenText:'あはは。'+row.line.text}]),/Unscripted laughter/);
 const normal=planVoices([row],ids,base,[]);
 assert.equal(normal[0].text,row.line.text,'displayed dialogue and voice lookup stay unchanged');
});

test('fourteen apocalypse film voices have fear-and-survival acting for each scene without script changes or adlibs',async()=>{
 const config=await json('config/voice-performance.json');
 config.generationDefaults=await json('config/voice-generation-defaults.json');
 const ids=await json('config/voice-ids.json'),readings=(await json('config/voice-pronunciation-issues.json')).issues,repairs=(await json('config/voice-repairs.json')).lines;
 const film=extractVoiceScript('act3-prologue'),withDirections=planVoices(film,ids,config,readings,repairs);
 const ordinary=structuredClone(config);delete ordinary.generationDefaults.actThreeFilm;
 const without=planVoices(film,ids,ordinary,readings,repairs);
 assert.equal(film.length,14);
 assert.deepEqual(new Set(film.map(r=>r.source)),new Set(Object.keys(config.generationDefaults.actThreeFilm.cues)),'Every film line has exactly one acting direction');
 for(let i=0;i<film.length;i++){
  const row=withDirections[i],prev=without[i],cue=config.generationDefaults.actThreeFilm.cues[row.source];
  assert.equal(row.lineKey,prev.lineKey);
  assert.equal(row.voiceId,prev.voiceId,'keep each original voice actor');
  assert.equal(row.text,prev.text,'do not rewrite the dialogue');
  assert.equal(row.request.model_id,'eleven_v4');
  assert.equal(row.request.voice_settings.similarity_boost,.85);
  assert.equal(row.request.voice_settings.stability,cue.stability??.38);
  assert.equal(row.deliveryProfile,'v3-inspired-v4:film-crisis');
  assert.equal(row.request.text,[...cue.tags,row.text].join(' '),'only approved cinematic acting tags and exact script are used');
  assert.ok(row.request.text.endsWith(row.text),'speak the exact canonical script after acting cues');
  assert.doesNotMatch(row.request.text,/laugh|chuckle|giggle|playful|smiling|languid|comedic/i);
  assert.notEqual(row.hash,prev.hash,'every cinematic recording must be regenerated');
 }
 const normal=extractVoiceScript('act3-current');
 const original=planVoices(normal,ids,ordinary,readings,repairs),revised=planVoices(normal,ids,config,readings,repairs);
 assert.equal(normal.length,106);
 assert.deepEqual(revised.map(r=>r.hash),original.map(r=>r.hash),'third-act map/after voices must remain unchanged');
});

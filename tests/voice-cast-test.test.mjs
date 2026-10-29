import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {extractVoiceScript,planVoices} from '../tools/voice-script.mjs';
import {VOICE_MANIFEST} from '../src/voice-manifest.js';
test('all four auditions compare the same playable lines, stay out of the game manifest and never autoplay',async()=>{
 const config=JSON.parse(await readFile('config/voice-cast-test.json','utf8'));
 const page=await readFile('assets/voice-tests/act3-v4-cast/index.html','utf8');
 assert.equal((page.match(/<audio /g)||[]).length,16);assert.equal((page.match(/role="tabpanel"/g)||[]).length,4);
 assert.doesNotMatch(page,/autoplay/i);assert.equal((page.match(/preload="none"/g)||[]).length,16);
 const rows=extractVoiceScript('act3-current'),pronunciations=JSON.parse(await readFile('config/voice-pronunciation-issues.json','utf8')).issues;
 const ids=JSON.parse(await readFile('config/voice-ids.json','utf8')).characters;
 assert.equal(config.characters.rabbit.voiceId,ids.rabbit.voiceId);
 for(const [speaker,character] of Object.entries(config.characters)){
  assert.equal(character.samples.length,2);
  if(speaker!=='rabbit')assert.equal(character.voiceId,ids[speaker].voiceId);
  for(const [index,sample] of character.samples.entries()){
   const original=rows.find(row=>row.speaker===speaker&&row.line.text===sample.text);assert.ok(original);
   const performance='cast-test-'+speaker+'-'+index;
   const [planned]=planVoices([{...original,performance}],{[speaker]:character.voiceId},{model:config.model,outputFormat:'mp3_44100_128',profiles:{[performance]:{tags:sample.tags.map(t=>'['+t+']'),settings:{stability:config.stability,similarity_boost:config.similarityBoost}}}},pronunciations);
   assert.doesNotMatch(planned.request.text,/whisper|mumbling|softly/i);
   assert.notEqual(VOICE_MANIFEST[original.lineKey].hash,planned.hash);
   assert.ok(!Object.values(VOICE_MANIFEST).some(clip=>clip.hash===planned.hash));
   assert.ok(page.includes(planned.hash+'.mp3'));assert.ok(page.includes(VOICE_MANIFEST[original.lineKey].file.split('/').at(-1)));
   assert.ok((await readFile('assets/voice-tests/act3-v4-cast/'+planned.hash+'.mp3')).length>128);
  }
 }
});

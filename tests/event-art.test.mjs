import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENT_ART, eventParticipants } from '../src/character-art.js';
import { readFile } from 'node:fs/promises';
test('event portraits follow speakers and room residents without duplicates',()=>{
 assert.deepEqual(eventParticipants({lines:[{speaker:'sister'},{speaker:'cat'},{speaker:'sister'}],rooms:[101,102]},[{room:101,type:'cat'},{room:102,type:'sister'}]),['sister','cat']);
 assert.deepEqual(eventParticipants({rooms:[103]},[{room:103,type:'peko'}]),['peko']);
 assert.deepEqual(eventParticipants({lines:[{speaker:'patron'}],rooms:[]},[]),[]);
 assert.deepEqual(eventParticipants({rooms:[]},[]),[]);
});
test('all six event portraits are PNG assets',async()=>{
 assert.equal(Object.keys(EVENT_ART).length,6);
 for(const src of Object.values(EVENT_ART)){
  const data=await readFile(new URL('../'+src,import.meta.url));
  assert.equal(data.subarray(1,4).toString(),'PNG');
 }
});

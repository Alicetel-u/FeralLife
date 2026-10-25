import test from 'node:test';
import assert from 'node:assert/strict';
import {developerObservationBeats,createDeveloperObservation} from '../src/debug-observation.js';
import {observationView,tickObservation,observationClockLimit} from '../src/act-one-observation.js';
import {validActOne,advanceActOne} from '../src/act-one.js';
import {advanceActTwo} from '../src/act-two.js';
import {validateSave} from '../src/simulation.js';

for(const chapter of ['1','2'])test(`every chapter ${chapter} observation destination starts its real first line and can continue`,()=>{
 const beats=developerObservationBeats(chapter);
 assert.equal(beats.length,chapter==='1'?11:2);
 for(const beat of beats){
  const s=createDeveloperObservation(chapter,beat.id);
  assert.ok(s,beat.id);assert.ok(validActOne(s)&&validateSave(s),beat.id);
  assert.equal(observationView(s).identity,beat.id+':0');
  assert.equal(s.actOne.pending,null);assert.ok(s.events.every(e=>e.read));
  assert.equal(s.selected,chapter==='1'?101:102);
  if(chapter==='1')assert.deepEqual(s.actOne.completed,beat.phase===0?[]:beat.phase===1?['ash']:['ash','dinner']);
  for(let i=0;i<450&&observationView(s)?.beat?.id===beat.id;i++){
   tickObservation(s,.25);
   const dt=Math.min(.025,Math.max(0,observationClockLimit(s)-s.hour));
   (chapter==='1'?advanceActOne:advanceActTwo)(s,dt);
  }
  assert.ok(s.actOne.observation.done.includes(beat.id),beat.id+' finishes without a stale event blocking it');
 }
});
test('invalid debug observation destinations do not create a game',()=>{
 assert.equal(createDeveloperObservation('3','seat'),null);
 assert.equal(createDeveloperObservation('1','missing'),null);
});

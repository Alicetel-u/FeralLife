import test from 'node:test';
import assert from 'node:assert/strict';
import {createActOne,advanceActOne,answerActOne,nextActOneAt,validActOne} from '../src/act-one.js';
import {validateSave} from '../src/simulation.js';
import {sampleJourney,createOuting} from '../src/movement.js';
import {firstActMutters} from '../src/act-one-life.js';
const start=()=>createActOne(42,[],2,true);
test('first act walks the hall, returns before ash, stays awake until lunch and rests after safety',()=>{
 const s=start();advanceActOne(s,.6);const m=s.residents[0];assert.equal(sampleJourney(m,s.hour).zone,'room');
 advanceActOne(s,10);assert.equal(s.hour,19);assert.equal(s.actOne.pending.scene,'ash');assert.equal(sampleJourney(m,s.hour,'window').zone,'room');assert.equal(m.action,'smoke');
 answerActOne(s,s.actOne.pending.eventId,'water');
 while(s.hour<36.5){advanceActOne(s,Math.min(.25,36.5-s.hour));assert.notEqual(m.action,'sleep');}
 advanceActOne(s,10);assert.equal(s.hour,37);assert.equal(sampleJourney(m,s.hour,'fridge').zone,'room');assert.equal(m.action,'eat');
 answerActOne(s,s.actOne.pending.eventId,'coronation');advanceActOne(s,1.5);assert.equal(m.action,'sleep');assert.match(firstActMutters(s)[0],/五分/);
 advanceActOne(s,4);assert.equal(sampleJourney(m,s.hour).zone,'hall');assert.equal(sampleJourney(m,s.hour).phase,'visiting');
 advanceActOne(s,100);assert.equal(s.hour,57);assert.equal(s.actOne.status,'clear');assert.equal(m.storyUntil,undefined);
});
test('small steps and jump-to-event keep identical story pacing; mid-walk saves resume deterministically',()=>{
 const a=start();advanceActOne(a,.5);const b=JSON.parse(JSON.stringify(a));assert.ok(validateSave(b)&&validActOne(b));
 advanceActOne(a,100);while(!b.actOne.pending)advanceActOne(b,.01);
 assert.equal(a.hour,b.hour);assert.equal(a.actOne.pending.scene,b.actOne.pending.scene);assert.deepEqual(sampleJourney(a.residents[0],a.hour,'window'),sampleJourney(b.residents[0],b.hour,'window'));
 assert.ok(validateSave(a)&&validActOne(a));
});
test('older saves outside the room return on foot before an indoor event can open',()=>{
 const s=start();s.hour=18.99;const r=s.residents[0];r.action='outing';r.journey=createOuting(r,18);
 advanceActOne(s,.01);assert.equal(s.actOne.pending,null);assert.ok(nextActOneAt(s)>s.hour);
 advanceActOne(s,nextActOneAt(s)-s.hour);assert.equal(s.actOne.pending.scene,'ash');assert.equal(sampleJourney(r,s.hour,'window').zone,'room');
});

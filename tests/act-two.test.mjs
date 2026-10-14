import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,validateSave} from '../src/simulation.js';
import {validActOne} from '../src/act-one.js';
import {ACT_TWO_EVENTS,beginActTwo,advanceActTwo,answerActTwo,rewindActTwo} from '../src/act-two.js';
const create=()=>beginActTwo(createGame(42));
const answer=(s,id)=>answerActTwo(s,s.actOne.pending.eventId,id);
test('Luna joins automatically and opening is queued',()=>{
 const s=create();assert.equal(s.actOne.chapter,2);
 assert.equal(s.residents.length,2);assert.ok(s.residents.some(r=>r.type==='hostess'));
 assert.ok(s.events.some(e=>e.actScene==='act2-prologue'));
 assert.ok(validActOne(s)&&validateSave(s));
});
test('each act-two trouble offers one safe option and two bad options',()=>{
 assert.equal(Object.keys(ACT_TWO_EVENTS).length,2);
 for(const event of Object.values(ACT_TWO_EVENTS)){assert.equal(event.choices.length,3);assert.equal(event.choices.filter(c=>!!c.bad).length,2);}
});
test('first bad ending restores a playable checkpoint with memory',()=>{
 const s=create();s.actOne.prologuePending=false;advanceActTwo(s,5);
 assert.equal(s.actOne.pending.scene,'bag');
 answer(s,'guarantee');assert.equal(s.actOne.status,'bad');
 const next=rewindActTwo(s);assert.equal(next.hour,61.5);
 assert.equal(next.actOne.status,'playing');assert.equal(next.actOne.attempt,2);
 assert.ok(next.actOne.memory.includes('bag-guarantee'));
 assert.equal(next.actOne.rewindIntroPending,true);
 assert.ok(validActOne(next)&&validateSave(next));
 next.actOne.rewindIntroPending=false;advanceActTwo(next,.5);
 assert.equal(next.actOne.pending.scene,'bag');
});
test('safe route reaches chapter-two epilogue at day five',()=>{
 const s=create();s.actOne.prologuePending=false;
 advanceActTwo(s,5);answer(s,'return');
 advanceActTwo(s,100);assert.equal(s.actOne.pending.scene,'contract');
 answer(s,'refuse');advanceActTwo(s,100);
 assert.equal(s.actOne.status,'clear');
 assert.equal(s.hour,105);
 assert.equal(s.events.find(e=>e.actScene==='act2-epilogue')?.lines?.length>5,true);
 assert.ok(validActOne(s)&&validateSave(s));
});
test('second contract bad end returns to contract checkpoint',()=>{
 const s=create();s.actOne.prologuePending=false;
 advanceActTwo(s,5);answer(s,'return');advanceActTwo(s,100);
 answer(s,'sign');assert.equal(s.actOne.status,'bad');
 const next=rewindActTwo(s);
 assert.equal(next.hour,80.5);assert.deepEqual(next.actOne.completed,['bag']);
 assert.ok(next.actOne.memory.includes('contract-sign'));assert.ok(validActOne(next)&&validateSave(next));
});

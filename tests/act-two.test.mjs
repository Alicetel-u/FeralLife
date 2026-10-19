import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,validateSave} from '../src/simulation.js';
import {validActOne} from '../src/act-one.js';
import {ACT_TWO_EVENTS,beginActTwo,advanceActTwo,answerActTwo,rewindActTwo,retireActTwoContract} from '../src/act-two.js';
const create=()=>{const s=beginActTwo(createGame(42));s.actOne.started=true;s.actOne.titlePending=false;return s;};
const start=s=>{s.actOne.started=true;s.actOne.titlePending=false;s.actOne.prologuePending=false;};
const answer=(s,id)=>answerActTwo(s,s.actOne.pending.eventId,id);
test('Luna joins automatically and opening is queued',()=>{
 const s=create();assert.equal(s.actOne.chapter,2);
 assert.equal(s.residents.length,2);assert.ok(s.residents.some(r=>r.type==='hostess'));
 assert.ok(s.events.some(e=>e.actScene==='act2-prologue'));
 assert.ok(validActOne(s)&&validateSave(s));
});
test('second act has exactly the consultation and minigame',()=>{
 assert.deepEqual(Object.keys(ACT_TWO_EVENTS),['bag','duel']);
 assert.equal(ACT_TWO_EVENTS.bag.choices.length,3);
 assert.equal(ACT_TWO_EVENTS.bag.choices.filter(c=>c.bad).length,2);
});

test('first bad ending restores a playable checkpoint with memory',()=>{
 const s=create();start(s);advanceActTwo(s,9);
 assert.equal(s.actOne.pending.scene,'bag');
 answer(s,'guarantee');assert.equal(s.actOne.status,'bad');
 const next=rewindActTwo(s);assert.equal(next.hour,66);
 assert.equal(next.actOne.status,'playing');assert.equal(next.actOne.attempt,2);
 assert.ok(next.actOne.memory.includes('bag-guarantee'));
 assert.equal(next.actOne.rewindIntroPending,true);
 assert.ok(validActOne(next)&&validateSave(next));
 next.actOne.rewindIntroPending=false;
 assert.equal(next.actOne.pending.scene,'bag');
});
test('safe route reaches chapter-two epilogue at day five',()=>{
 const s=create();start(s);
 advanceActTwo(s,9);answer(s,'loan');
 advanceActTwo(s,100);assert.equal(s.actOne.pending.scene,'duel');
 for(const id of ['boundary','receipt','cancel','leave'])answer(s,id);
 advanceActTwo(s,100);
 assert.equal(s.actOne.status,'clear');
 assert.equal(s.hour,105);
 assert.equal(s.events.find(e=>e.actScene==='act2-epilogue')?.lines?.length>5,true);
 assert.ok(validActOne(s)&&validateSave(s));
});
test('retired contract saves resume at the minigame and preserve the first success',()=>{
 for(const mode of ['pending','failure','completed']){
  const s=create();start(s);advanceActTwo(s,100);answer(s,'loan');
  s.hour=81;
  if(mode==='pending')s.actOne.pending={scene:'contract',eventId:s.events.at(-1).id};
  if(mode==='failure'){s.actOne.status='bad';s.actOne.failure='contract-sign';s.actOne.memory.push('contract-sign');}
  if(mode==='completed')s.actOne.completed.push('contract');
  assert.equal(retireActTwoContract(s),true);
  assert.equal(s.hour,84);assert.equal(s.actOne.pending.scene,'duel');
  assert.deepEqual(s.actOne.completed,['bag']);assert.equal(s.actOne.duel.round,0);
  assert.ok(validActOne(s)&&validateSave(s));
 }
});

test('legacy minigame saves lose only the retired completion, preserving progress and rewind',()=>{
 const s=create();start(s);advanceActTwo(s,100);answer(s,'loan');advanceActTwo(s,100);
 s.actOne.completed.push('contract');s.actOne.rollbackPoint.state.actOne.completed.push('contract');
 answer(s,'vow');const history=JSON.stringify(s.actOne.duel);
 assert.ok(validActOne(s)&&validateSave(s));
 assert.equal(retireActTwoContract(s),false);assert.equal(JSON.stringify(s.actOne.duel),history);
 assert.deepEqual(s.actOne.completed,['bag']);assert.deepEqual(s.actOne.rollbackPoint.state.actOne.completed,['bag']);
 for(const id of ['shield','future','ultimate'])answer(s,id);
 const next=rewindActTwo(s);assert.equal(next.hour,84);assert.deepEqual(next.actOne.completed,['bag']);
 assert.ok(validActOne(next)&&validateSave(next));
});

test('chapter two remains active after the arrival dialogue ends',()=>{
 const s=create();const intro=s.events.find(e=>e.actScene==='act2-prologue');
 assert.ok(intro);s.actOne.started=true;s.actOne.titlePending=false;
 s.actOne.prologuePending=false;intro.read=true;s.selected=102;
 assert.equal(s.actOne.chapter,2);assert.equal(s.actOne.status,'playing');
 assert.equal(s.selected,102);assert.ok(s.residents.some(r=>r.type==='hostess'&&r.room===102));
 advanceActTwo(s,9);assert.equal(s.actOne.pending.scene,'bag');
});

test('second-act opening scene selection retains the arrival as the next scene',()=>{
 const state=beginActTwo(createGame(42));
 state.actOne.started=false;
 state.actOne.titlePending=true;
 state.actOne.prologuePending=true;
 const arrival=state.events.find(e=>e.actScene==='act2-prologue');
 arrival.read=false;
 assert.equal(state.actOne.chapter,2);
 assert.equal(state.actOne.prologuePending,true);
 assert.equal(arrival.read,false);
 state.actOne.started=true;
 state.actOne.titlePending=false;
 assert.ok(state.events.find(e=>e.actScene==='act2-prologue'&&!e.read));
});

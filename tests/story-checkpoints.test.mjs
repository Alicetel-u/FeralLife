import test from 'node:test';import assert from 'node:assert/strict';
import{createActOne,advanceActOne,answerActOne,rewindBeforeFire,validActOne}from'../src/act-one.js';
import{beginActTwo,advanceActTwo,answerActTwo,rewindActTwo}from'../src/act-two.js';
import{validateSave}from'../src/simulation.js';
const one=()=>createActOne(42,[],2,true);
const finishFirst=()=>{const s=one();advanceActOne(s,100);answerActOne(s,s.actOne.pending.eventId,'water');advanceActOne(s,100);answerActOne(s,s.actOne.pending.eventId,'coronation');advanceActOne(s,100);return s;};
test('repeated failure retains the same exact success snapshot without nesting',()=>{
 const s=one();advanceActOne(s,100);answerActOne(s,s.actOne.pending.eventId,'water');const saved=JSON.stringify(s.actOne.rollbackPoint.state);
 advanceActOne(s,100);answerActOne(s,s.actOne.pending.eventId,'turbo');let next=rewindBeforeFire(s);
 for(let i=0;i<2;i++){assert.equal(next.hour,23);assert.equal(JSON.stringify(next.actOne.rollbackPoint.state),saved);assert.equal(next.actOne.rollbackPoint.state.actOne.rollbackPoint,undefined);assert.ok(validActOne(next)&&validateSave(next));advanceActOne(next,100);answerActOne(next,next.actOne.pending.eventId,'show');next=rewindBeforeFire(next);}
});
test('second act restores chapter entry or bag success, including old saves without milestones',()=>{
 for(const late of [false,true]){
  const s=finishFirst();beginActTwo(s);s.actOne.started=true;s.actOne.prologuePending=false;s.actOne.titlePending=false;
  advanceActTwo(s,100);answerActTwo(s,s.actOne.pending.eventId,late?'loan':'guarantee');
  if(late){advanceActTwo(s,100);answerActTwo(s,s.actOne.pending.eventId,'sign');}
  for(const old of [false,true]){
   const load=JSON.parse(JSON.stringify(s));if(old)delete load.actOne.rollbackPoint;
   const next=rewindActTwo(load);assert.equal(next.hour,late?66:66);assert.deepEqual(next.actOne.completed,late?['bag']:[]);assert.equal(next.actOne.titlePending,false);assert.ok(validActOne(next)&&validateSave(next));assert.ok(next.actOne.memory.includes(late?'contract-sign':'bag-guarantee'));
  }
 }
});

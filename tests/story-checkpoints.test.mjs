import test from 'node:test';import assert from 'node:assert/strict';
import{createActOne,advanceActOne,answerActOne,rewindBeforeFire,validActOne}from'../src/act-one.js';
import{beginActTwo,advanceActTwo,answerActTwo,rewindActTwo}from'../src/act-two.js';
import{validateSave}from'../src/simulation.js';
import{storyCheckpointTarget,validStoryCheckpoint}from'../src/story-checkpoints.js';
const one=()=>createActOne(42,[],2,true);
const finishFirst=()=>{const s=one();advanceActOne(s,100);answerActOne(s,s.actOne.pending.eventId,'water');advanceActOne(s,100);answerActOne(s,s.actOne.pending.eventId,'coronation');advanceActOne(s,100);return s;};
test('both cooking failures resume at 13:00 with the original consultation, including old saves',()=>{
 for(const choice of ['turbo','show'])for(const legacy of [false,true]){
  const s=one();advanceActOne(s,100);answerActOne(s,s.actOne.pending.eventId,'water');
  advanceActOne(s,100);answerActOne(s,s.actOne.pending.eventId,choice);
  const loaded=JSON.parse(JSON.stringify(s));if(legacy)delete loaded.actOne.rollbackPoint;
  assert.equal(storyCheckpointTarget(loaded).hour,37);
  const next=rewindBeforeFire(loaded),intro=next.events.find(e=>e.actScene==='rewind');
  assert.equal(next.hour,37);assert.equal(next.actOne.pending.scene,'dinner');
  assert.deepEqual(next.actOne.completed,['ash']);assert.equal(intro.resumeScene,'dinner');
  const consultation=next.events.find(e=>e.id===next.actOne.pending.eventId);
  assert.equal(consultation.read,false);assert.equal(consultation.choicePresented,undefined);
  assert.ok(consultation.lines.length>1);assert.ok(validStoryCheckpoint(next.actOne.rollbackPoint,1));
  assert.ok(intro.lines[0].text.includes('料理の相談を受けた昼'));
  assert.ok(validActOne(next)&&validateSave(next));
 }
});
test('repeated cooking failure retains its trouble-start snapshot without nesting',()=>{
 const s=one();advanceActOne(s,100);answerActOne(s,s.actOne.pending.eventId,'water');
 advanceActOne(s,100);answerActOne(s,s.actOne.pending.eventId,'turbo');let next=rewindBeforeFire(s);const saved=JSON.stringify(next.actOne.rollbackPoint.state);
 for(let i=0;i<2;i++){assert.equal(next.hour,37);assert.equal(JSON.stringify(next.actOne.rollbackPoint.state),saved);assert.equal(next.actOne.rollbackPoint.state.actOne.rollbackPoint,undefined);assert.ok(validActOne(next)&&validateSave(next));advanceActOne(next,100);answerActOne(next,next.actOne.pending.eventId,'show');next=rewindBeforeFire(next);}
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

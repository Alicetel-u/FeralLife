import test from 'node:test';
import assert from 'node:assert/strict';
import {ACT_ONE_EVENTS,createActOne,advanceActOne,answerActOne,rewindActOne,validActOne} from '../src/act-one.js';
import {validateSave} from '../src/simulation.js';
const start=()=>createActOne(42,[],1,true);
const answer=(s,id)=>answerActOne(s,s.actOne.pending.eventId,id);
test('title waits for start; exactly two deadlines halt even a huge time step',()=>{
  const unstarted=createActOne(42);advanceActOne(unstarted,100);assert.equal(unstarted.hour,17);
  const s=start();advanceActOne(s,1000);assert.equal(s.hour,19);assert.equal(s.actOne.pending.scene,'ash');assert.equal(s.residents.length,1);assert.equal(s.pending,null);
  advanceActOne(s,1000);assert.equal(s.hour,19,'Unanswered scene holds time even when closed');
  assert.equal(answerActOne(s,s.actOne.pending.eventId,'forged'),null);
  const result=answer(s,'landlord');assert.ok(result.lines.some(l=>l.speaker==='cat'&&l.emotion==='surprised'));
  assert.equal(answerActOne(s,result.id,'landlord'),null,'No double resolution');
  advanceActOne(s,1000);assert.equal(s.hour,37);assert.equal(s.actOne.pending.scene,'dinner');
  assert.ok(validateSave(s)&&validActOne(s));
});
test('both scenes have one improbable safe answer and two individually authored full-burn endings',()=>{
  assert.equal(Object.keys(ACT_ONE_EVENTS).length,2);
  for(const [scene,c]of Object.entries(ACT_ONE_EVENTS)){
    assert.equal(c.choices.length,3);assert.equal(c.choices.filter(x=>x.bad).length,2);
    for(const bad of c.choices.filter(x=>x.bad)){
      const s=start();advanceActOne(s,1000);
      if(scene==='dinner'){answer(s,'landlord');advanceActOne(s,1000);}
      const result=answer(s,bad.id);
      assert.equal(s.actOne.status,'bad');assert.ok(s.ending.name.includes('全焼'));assert.ok(result.lines.length>=7);
      assert.ok(s.actOne.memory.includes(bad.bad));assert.equal(s.residents.length,1);
      const frozen=s.hour;advanceActOne(s,1000);assert.equal(s.hour,frozen);
      const loaded=JSON.parse(JSON.stringify(s));assert.ok(validateSave(loaded)&&validActOne(loaded));
      const loop=rewindActOne(loaded);assert.equal(loop.hour,17);assert.equal(loop.actOne.attempt,2);assert.equal(loop.actOne.started,true);
      assert.deepEqual(loop.actOne.memory,[bad.bad]);assert.equal(loop.actOne.completed.length,0);assert.equal(loop.ending,null);assert.equal(loop.residents.length,1);
      assert.ok(validateSave(loop)&&validActOne(loop));
      assert.ok(loop.events[0].lines.some(l=>l.text.includes('覚えているのは、大家だけ')));
    }
  }
});
test('survival reaches exactly day 3 at 09:00 and unlocks admission without admitting during the act',()=>{
  const s=start();advanceActOne(s,100);answer(s,'landlord');advanceActOne(s,100);answer(s,'coronation');advanceActOne(s,100);
  assert.equal(s.hour,57);assert.equal(s.actOne.status,'clear');assert.deepEqual(s.pending,['hostess','fox']);assert.equal(s.residents.length,1);
  advanceActOne(s,100);assert.equal(s.hour,57);
  assert.ok(validateSave(s)&&validActOne(s));assert.ok(s.ending.text.includes('焼けずに届いた'));
});
test('read conversation and pending choice survive reload without replaying or advancing past the decision',()=>{
  const s=start();advanceActOne(s,2);s.events[0].read=true;
  const loaded=JSON.parse(JSON.stringify(s));assert.ok(validActOne(loaded));advanceActOne(loaded,20);assert.equal(loaded.hour,19);
  assert.ok(answer(loaded,'landlord'));advanceActOne(loaded,100);assert.equal(loaded.actOne.pending.scene,'dinner');
  loaded.actOne.completed.push('forged');assert.equal(validActOne(loaded),false);
});

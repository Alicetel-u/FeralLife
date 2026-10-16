import test from 'node:test';
import assert from 'node:assert/strict';
import {ACT_ONE_EVENTS,getActOneChoices,actOneChosenChoices,createActOne,advanceActOne,answerActOne,rewindActOne,rewindBeforeFire,validActOne} from '../src/act-one.js';
import {validateSave} from '../src/simulation.js';
const start=(attempt=2)=>createActOne(42,[],attempt,true);
const answer=(s,id)=>answerActOne(s,s.actOne.pending.eventId,id);
test('title waits for start; exactly two deadlines halt even a huge time step',()=>{
  const unstarted=createActOne(42);advanceActOne(unstarted,100);assert.equal(unstarted.hour,17);
  const s=start();advanceActOne(s,1000);assert.equal(s.hour,23);assert.equal(s.actOne.pending.scene,'ash');assert.equal(s.residents.length,1);assert.equal(s.pending,null);
  advanceActOne(s,1000);assert.equal(s.hour,23,'Unanswered scene holds time even when closed');
  assert.equal(answerActOne(s,s.actOne.pending.eventId,'forged'),null);
  const result=answer(s,'water');assert.ok(result.lines.some(l=>l.speaker==='cat'&&l.emotion==='surprised'));
  assert.equal(answerActOne(s,result.id,'water'),null,'No double resolution');
  advanceActOne(s,1000);assert.equal(s.hour,37);assert.equal(s.actOne.pending.scene,'dinner');
  assert.ok(validateSave(s)&&validActOne(s));
});
test('loop scenes have one safe answer and two full-burn endings; first-run ash choices all burn',()=>{
  assert.equal(Object.keys(ACT_ONE_EVENTS).length,2);
  for(const [scene,c]of Object.entries(ACT_ONE_EVENTS)){
    const loopChoices=getActOneChoices(start(),scene);assert.equal(loopChoices.length,3);assert.equal(loopChoices.filter(x=>x.bad).length,2);
    for(const bad of c.choices.filter(x=>x.bad)){
      const s=start();advanceActOne(s,1000);
      if(scene==='dinner'){answer(s,'water');advanceActOne(s,1000);}
      const result=answer(s,bad.id);
      assert.equal(s.actOne.status,'bad');assert.ok(s.ending.name.includes('全焼'));assert.ok(result.lines.length>=7);
      assert.ok(s.actOne.memory.includes(bad.bad));assert.equal(s.residents.length,1);
      const frozen=s.hour;advanceActOne(s,1000);assert.equal(s.hour,frozen);
      const loaded=JSON.parse(JSON.stringify(s));assert.ok(validateSave(loaded)&&validActOne(loaded));
      const loop=rewindActOne(loaded);assert.equal(loop.hour,17);assert.equal(loop.actOne.attempt,s.actOne.attempt+1);assert.equal(loop.actOne.started,true);
      assert.deepEqual(loop.actOne.memory,[bad.bad]);assert.equal(loop.actOne.completed.length,0);assert.equal(loop.ending,null);assert.equal(loop.residents.length,1);
      assert.ok(validateSave(loop)&&validActOne(loop));
      assert.ok(loop.events[0].lines.some(l=>l.text.includes(s.actOne.attempt===1?'全部、覚えてる':'嫌ってほどな')));
    }
  }
});
test('survival reaches exactly day 3 at 09:00 and queues the epilogue without admitting anyone',()=>{
  const s=start();advanceActOne(s,100);answer(s,'water');advanceActOne(s,100);answer(s,'coronation');advanceActOne(s,100);
  assert.equal(s.hour,57);assert.equal(s.actOne.status,'clear');assert.equal(s.pending,null);assert.equal(s.residents.length,1);
  assert.equal(s.actOne.epilogueSeen,false);assert.ok(s.events.some(e=>e.actScene==='epilogue'&&e.lines.some(l=>l.text.includes('生き残った'))));
  advanceActOne(s,100);assert.equal(s.hour,57);
  assert.ok(validateSave(s)&&validActOne(s));assert.ok(s.ending.text.includes('燃えずに済んだ'));
});
test('read conversation and pending choice survive reload without replaying or advancing past the decision',()=>{
  const s=start();advanceActOne(s,6);s.events[0].read=true;
  const loaded=JSON.parse(JSON.stringify(s));assert.ok(validActOne(loaded));advanceActOne(loaded,20);assert.equal(loaded.hour,23);
  assert.ok(answer(loaded,'water'));advanceActOne(loaded,100);assert.equal(loaded.actOne.pending.scene,'dinner');
  loaded.actOne.completed.push('forged');assert.equal(validActOne(loaded),false);
});

test('first-run ash cannot use water until the landlord loops',()=>{
  const first=start(1);advanceActOne(first,6);
  assert.deepEqual(getActOneChoices(first,'ash').map(c=>c.id),['trash']);
  assert.equal(answer(first,'water'),null);
  answer(first,'trash');
  const loop=rewindActOne(first);advanceActOne(loop,6);
  assert.deepEqual(getActOneChoices(loop,'ash').map(c=>c.id),['trash','balcony','water']);
  assert.ok(answer(loop,'water'));assert.equal(loop.actOne.status,'playing');
});

test('chosen answers survive loops and save reloads including safe answers; old saves recover history',()=>{
  const s=start();advanceActOne(s,6);answer(s,'water');advanceActOne(s,100);answer(s,'turbo');
  assert.deepEqual(actOneChosenChoices(s),['ash:water','dinner:turbo']);
  const loaded=JSON.parse(JSON.stringify(s));assert.ok(validActOne(loaded));
  const loop=rewindActOne(loaded);assert.deepEqual(actOneChosenChoices(loop),['ash:water','dinner:turbo']);
  advanceActOne(loop,6);answer(loop,'water');assert.equal(actOneChosenChoices(loop).length,2);
  delete loaded.actOne.chosenChoices;assert.ok(validActOne(loaded));assert.deepEqual(new Set(actOneChosenChoices(loaded)),new Set(['ash:water','dinner:turbo']));
  loaded.actOne.chosenChoices=['ash:forged'];assert.equal(validActOne(loaded),false);
  assert.deepEqual(actOneChosenChoices(createActOne(42)),[]);
});

test('rewind has its own reunion scene, preserves choices and resumes at day 1 17:00',()=>{
  const s=createActOne(42,[],1,true);advanceActOne(s,6);answer(s,'trash');const loop=rewindActOne(s);
  const scene=loop.events[0];assert.equal(scene.actScene,'rewind');assert.equal(loop.actOne.rewindIntroPending,true);
  assert.equal(loop.actOne.rewindIntroCursor,0);assert.equal(loop.hour,17);
  assert.ok(scene.lines.some(l=>l.text==='お、お前……生きてるのか！？'));
  assert.ok(scene.lines.some(l=>l.text==='全部、覚えてる。'&&l.innerVoice));
  assert.equal(scene.lines.at(-1).text,'……もう二度と、あんな光景は見たくねぇ。');
  assert.ok(!scene.lines.some(l=>l.text==='うわっくっせぇ！！煙だらけじゃねーか！'));
  loop.actOne.rewindIntroCursor=8;assert.ok(validActOne(JSON.parse(JSON.stringify(loop))));
  assert.deepEqual(loop.actOne.chosenChoices,['ash:trash']);
});

test('story rewind restores start or the preceding success and preserves earlier success',()=>{
  const first=createActOne(42,[],1,true);advanceActOne(first,6);answer(first,'trash');
  const saved=JSON.parse(JSON.stringify(first));assert.ok(validActOne(saved));
  const recovered=rewindBeforeFire(saved);assert.equal(recovered.hour,17);assert.equal(recovered.actOne.attempt,2);
  assert.equal(recovered.actOne.pending,null);assert.equal(recovered.ending,null);assert.equal(recovered.actOne.rewindIntroPending,true);
  assert.ok(recovered.events.some(e=>e.actScene==='rewind'&&e.lines.some(l=>l.text.includes('さっきまで火事で'))));
  assert.deepEqual(recovered.actOne.chosenChoices,['ash:trash']);assert.deepEqual(recovered.actOne.memory,['ash-trash']);
  advanceActOne(recovered,6);assert.equal(recovered.actOne.pending.scene,'ash');answer(recovered,'water');
  advanceActOne(recovered,100);const checkpoint=JSON.parse(JSON.stringify(recovered.actOne.rollbackPoint.state));answer(recovered,'turbo');
  const next=rewindBeforeFire(JSON.parse(JSON.stringify(recovered)));assert.equal(next.hour,23);assert.deepEqual(next.actOne.completed,['ash']);
  const reprise=next.events.find(e=>e.actScene==='rewind'&&e.lines.some(l=>l.text.includes('また戻った')));
  assert.ok(reprise);
  assert.deepEqual(next.residents.map(r=>({...r,history:r.history.filter(id=>id!==reprise.id)})),checkpoint.residents);assert.equal(next.rent,checkpoint.rent);assert.ok(validateSave(next)&&validActOne(next));
  advanceActOne(next,18);assert.equal(next.actOne.pending.scene,'dinner');answer(next,'coronation');advanceActOne(next,100);assert.equal(next.actOne.status,'clear');
  const old=JSON.parse(JSON.stringify(recovered));delete old.actOne.rollbackPoint;
  const migrated=rewindBeforeFire(old);assert.equal(migrated.hour,23);assert.deepEqual(migrated.actOne.completed,['ash']);assert.ok(validActOne(migrated));
  saved.actOne.rollbackPoint.state.hour=20;assert.equal(validActOne(saved),false);
});

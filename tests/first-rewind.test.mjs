import {eventConversation} from '../src/event-stage.js';
import {messagePages} from '../src/message-pages.js';
import{readFileSync}from'node:fs';
import test from 'node:test';import assert from 'node:assert/strict';
import{automaticFirstRewind,rewindBeat,rewindTransitionHTML}from'../src/rewind-transition.js';
import{storyCheckpointTarget,validStoryCheckpoint,resumeStoryRewind}from'../src/story-checkpoints.js';
import{validateSave}from'../src/simulation.js';
import{getActOneChoices,createActOne,advanceActOne,answerActOne,rewindBeforeFire,validActOne}from'../src/act-one.js';
test('only the unavoidable first ash fire bypasses the results page and keeps checkpoint and memory',()=>{
 for(const answer of ['trash']){
  const s=createActOne(42,[],1,true);advanceActOne(s,100);answerActOne(s,s.actOne.pending.eventId,answer);assert.equal(automaticFirstRewind(s),true);
  const saved=JSON.parse(JSON.stringify(s));assert.equal(automaticFirstRewind(saved),true);
  const next=rewindBeforeFire(saved);assert.equal(next.hour,23);assert.equal(next.actOne.attempt,2);assert.ok(next.actOne.memory.includes(s.actOne.failure));assert.ok(validActOne(next));
  assert.equal(automaticFirstRewind({...s,actOne:{...s.actOne,attempt:2}}),false);assert.equal(automaticFirstRewind({...s,actOne:{...s.actOne,chapter:2}}),false);
 }
});
test('after-fire transition starts in darkness, retains its plea, then reverses clock without a second fire',()=>{
 assert.equal(rewindBeat(0,1,true).phase,'dark');assert.match(rewindBeat(0,1,true).text,/ドクン/);assert.equal(rewindBeat(5.6,1,true).phase,'clock');assert.equal(rewindBeat(12,1,true).finished,true);
 assert.match(rewindTransitionHTML('ash-trash',1,true),/data-rewind-phase="dark"/);assert.match(rewindTransitionHTML('ash-trash',1,true),/data-after-fire/);assert.equal(rewindBeat(0,2).phase,'fire');
});
test('rewind clicks cannot bypass the clock and restored dialogue remains pending',()=>{
 const s=createActOne(42,[],1,true);advanceActOne(s,100);answerActOne(s,s.actOne.pending.eventId,'trash');
 const next=rewindBeforeFire(s),e=next.events.find(e=>e.actScene==='rewind');
 assert.equal(next.actOne.rewindIntroPending,true);
 assert.ok(e.lines.some(l=>l.text.includes('さっきまで火事で')));
 assert.ok(e.lines.some(l=>l.innerVoice&&l.text.includes('戻ってる？ 時間が')));
});


test('first rewind clock and saved reunion agree on 23:00 and lead straight to unlocked ash choices',()=>{
 const s=createActOne(42,[],1,true);advanceActOne(s,100);answerActOne(s,s.actOne.pending.eventId,'trash');
 for(const legacy of [false,true]){
  const failed=structuredClone(s);if(legacy)delete failed.actOne.rollbackPoint;
  assert.equal(storyCheckpointTarget(failed).hour,23);
  const next=rewindBeforeFire(failed),intro=next.events.find(e=>e.actScene==='rewind'),consultation=next.events.find(e=>e.id===next.actOne.pending.eventId);
  assert.equal(next.hour,23);assert.equal(next.actOne.pending.scene,'ash');
  assert.equal(intro.resumeChoice,true);assert.equal(intro.revealCharacterAt,0);
  assert.ok(intro.lines.some(l=>l.text==='時計は、23時を指している。'));
  assert.ok(!intro.lines.some(l=>/17時|初めてこの部屋|新しい大家|走れ/.test(l.text)));
  assert.ok(intro.lines.some(l=>l.text.includes('吸い殻は、まだ捨てられていない')));
  assert.equal(intro.lines.at(-1).text,'だったら……今度こそ、間違えられねぇ。');
  assert.equal(consultation.choicePresented,true);assert.equal(consultation.lines.length,1);
  assert.equal(getActOneChoices(next,'ash').length,3);assert.ok(getActOneChoices(next,'ash').some(c=>c.id==='water'));
  assert.ok(validStoryCheckpoint(next.actOne.rollbackPoint,1));assert.equal(storyCheckpointTarget(next).hour,23);
  const load=JSON.parse(JSON.stringify(next));assert.ok(validateSave(load)&&validActOne(load));
  next.actOne.rewindIntroPending=false;answerActOne(next,next.actOne.pending.eventId,'trash');
  const repeat=rewindBeforeFire(next);assert.equal(repeat.hour,23);assert.equal(repeat.actOne.pending.scene,'ash');assert.equal(repeat.events.find(e=>e.actScene==='rewind'&&e.resumeChoice)?.resumeChoice,true);
 }
});


test('finishing the reunion opens the pending answer instead of observation',()=>{
 const s=createActOne(42,[],1,true);advanceActOne(s,100);answerActOne(s,s.actOne.pending.eventId,'trash');
 const state=rewindBeforeFire(s),app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 const branch=app.slice(app.indexOf("  if(button.hasAttribute('data-rewind-resume')"),app.indexOf("  if(button.hasAttribute('data-epilogue-done')"));
 let opened=null,closed=false,saves=0;
 new Function('resumeStoryRewind','eventConversation','messagePages','state','button','save','closeModal','showEvent',branch)(resumeStoryRewind,eventConversation,messagePages,state,{hasAttribute:key=>key==='data-rewind-resume'},()=>saves++,()=>closed=true,id=>opened=id);
 assert.equal(state.actOne.rewindIntroPending,false);assert.equal(opened,state.actOne.pending.eventId);assert.equal(closed,false);assert.equal(saves,1);
 assert.equal(state.events.find(e=>e.actScene==='rewind').read,true);
});

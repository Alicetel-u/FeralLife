import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createActOne,advanceActOne,answerActOne,rewindBeforeFire,getActOneChoices,validActOne} from '../src/act-one.js';
import {validateSave} from '../src/simulation.js';
import {resumeConversation,rememberConversation,clearConversation,continueDestination} from '../src/conversation-progress.js';
import {eventConversation} from '../src/event-stage.js';
import {storyCheckpointTarget} from '../src/story-checkpoints.js';
const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const source=app.slice(app.indexOf('function continueGame(){'),app.indexOf('function showTitleHelp(){'));
const answer=(s,id)=>answerActOne(s,s.actOne.pending.eventId,id);

test('real Continue resumes first-act opening, consultation, BAD dialogue and epilogue at their saved line/page',()=>{
 for(const route of ['opening','ash','tragedy','dinner','dinner-bad','epilogue']){
  let s=createActOne(42,[],route==='tragedy'?1:2,true),e=s.events[0];
  if(route!=='opening'){
   advanceActOne(s,100);e=s.events.find(e=>e.id===s.actOne.pending.eventId);
   if(route==='tragedy')e=answer(s,'trash');
   else if(route!=='ash'){
    answer(s,'water');advanceActOne(s,100);e=s.events.find(e=>e.id===s.actOne.pending.eventId);
    if(route==='dinner-bad')e=answer(s,'turbo');
    if(route==='epilogue'){answer(s,'coronation');advanceActOne(s,100);e=s.events.find(e=>e.actScene==='epilogue');}
   }
  }
  e.read=true;rememberConversation(s,e,2,1);s=JSON.parse(JSON.stringify(s));
  assert.ok(validActOne(s)&&validateSave(s));
  let view;const context={state:s,continueDestination,showEvent(id,cursor,page){view={id,cursor,page};},closeModal(){assert.fail('must not skip to observation');},showActEnding(){assert.fail('must not skip the BAD dialogue');},showActTitle(){assert.fail('must not open the burning chapter title');}};
  vm.createContext(context);vm.runInContext(source+';continueGame();',context);
  assert.deepEqual(view,{id:e.id,cursor:2,page:1});
 }
});

test('all first-act failures discard old conversation positions on rewind and retain the correct incident',()=>{
 for(const attempt of [1,2,3])for(const scene of ['ash','dinner']){
  if(attempt===1&&scene==='dinner')continue;
  let base=createActOne(42,[],attempt,true);advanceActOne(base,100);
  if(scene==='dinner'){answer(base,'water');advanceActOne(base,100);}
  for(const choice of getActOneChoices(base,scene).filter(c=>c.bad)){
   const s=structuredClone(base),reply=answer(s,choice.id);rememberConversation(s,reply,1,0);
   let next=rewindBeforeFire(JSON.parse(JSON.stringify(s)));
   assert.equal(resumeConversation(next),null,'old reply must not override the rewind intro');
   assert.equal(next.hour,storyCheckpointTarget(s).hour);assert.equal(next.actOne.pending.scene,scene);
   assert.deepEqual(next.actOne.completed,scene==='ash'?[]:['ash']);
   assert.ok(validActOne(next)&&validateSave(next));
   for(let repeat=0;repeat<2;repeat++){
    next.actOne.rewindIntroPending=false;const reply=answer(next,choice.id);rememberConversation(next,reply,1,0);
    next=rewindBeforeFire(JSON.parse(JSON.stringify(next)));
    assert.equal(resumeConversation(next),null);assert.equal(next.hour,scene==='ash'?23:37);
    assert.ok(validActOne(next)&&validateSave(next));
   }
  }
 }
});

test('closing the actual conversation clears progress but closing another panel preserves it',()=>{
 const source=app.slice(app.indexOf('function closeModal() {')+'function closeModal() {'.length,app.indexOf('  stopEpilogueTransition();stopEpilogueSound();',app.indexOf('function closeModal() {')));
 for(const conversationModal of [false,true]){
  const state=createActOne(42,[],2,true),event=state.events[0];rememberConversation(state,event,3,0);
  const context={state,eventView:{id:event.id},clearConversation,save(){},modal:{classList:{contains:()=>conversationModal}}};
  vm.createContext(context);vm.runInContext(source,context);
  assert.equal(resumeConversation(state)!==null,!conversationModal);
 }
});

test('saved first-act pages are reused only for the same event and explicit navigation resets the page',()=>{
 const state=createActOne(42,[],2,true),e=state.events[0];rememberConversation(state,e,2,1);
 const source=app.slice(app.indexOf('  const savedPosition=index===null?'),app.indexOf('  const epilogueDirection=actTwoEpilogueDirection(e,cursor);'));
 for(const index of [null,0]){
  const context={state,e,index,page:null,resumeConversation,eventConversation};vm.createContext(context);
  const position=vm.runInContext(source+';({cursor,page})',context);
  assert.equal(position.cursor,index===null?2:0);assert.equal(position.page,index===null?1:0);
 }
 for(const value of [null,{eventId:999,cursor:0,page:0},{eventId:e.id,cursor:-1,page:0},{eventId:e.id,cursor:0,page:'1'}]){
  state.actOne.conversation=value;assert.equal(resumeConversation(state),null);
 }
 delete state.actOne.conversation;assert.equal(resumeConversation(state),null);
 const legacy={...state,actOne:{...state.actOne,chapter:2,conversation:{eventId:e.id,cursor:2}}};
 assert.deepEqual(resumeConversation(legacy),{event:e,cursor:2,page:0});
});

test('Continue after a reload stays on the unfinished reply or the rewind, never the fire cinematic',()=>{
 const ash=()=>{const s=createActOne(42,[],1,true);advanceActOne(s,100);return s;};
 const playing=ash();
 playing.actOne.rewindTitlePending=true;
 assert.equal(continueDestination(playing).type,'event');
 assert.equal(continueDestination(playing).id,playing.actOne.pending.eventId);
 const consultation=playing.events.find(e=>e.id===playing.actOne.pending.eventId);
 rememberConversation(playing,consultation,1,0);
 const failed=structuredClone(playing);
 const reply=answer(failed,'trash');
 assert.equal(continueDestination(failed).id,reply.id,'a stale consultation must not outrank the unread tragedy');
 reply.read=true;delete failed.actOne.conversation;
 assert.deepEqual(continueDestination(failed),{type:'event',id:reply.id,cursor:0,page:0});
 failed.actOne.outcomeSeen=true;
 assert.equal(continueDestination(failed).type,'rewind');
 // Attempt one only offers the trash choice, so the safe reply starts on the next loop.
 const observing=createActOne(42,[],2,true);advanceActOne(observing,100);answer(observing,'water');
 observing.events.forEach(e=>e.read=true);delete observing.actOne.conversation;
 assert.equal(observing.actOne.status,'playing');assert.equal(observing.ending,null);
 assert.equal(continueDestination(observing).type,'observe');
});


test('finishing the first-act epilogue clears its saved conversation before the completion screen',()=>{
 const state=createActOne(42,[],2,true);advanceActOne(state,100);answer(state,'water');advanceActOne(state,100);answer(state,'coronation');advanceActOne(state,100);
 const event=state.events.find(e=>e.actScene==='epilogue');rememberConversation(state,event,eventConversation(event).length-1,0);
 const source=app.slice(app.indexOf("  if(button.hasAttribute('data-epilogue-done')"),app.indexOf("  if(button.hasAttribute('data-act-reward')"));
 let complete=0;const context={state,button:{hasAttribute:()=>true},clearConversation,save(){},showActEnding(){complete++;}};
 vm.createContext(context);vm.runInContext(source,context);
 assert.equal(complete,1);assert.equal(state.actOne.epilogueSeen,true);assert.equal(state.actOne.conversation,undefined);
 rememberConversation(state,event,0,0);assert.equal(resumeConversation(state),null,'a completed epilogue cannot replace the completion screen');
});

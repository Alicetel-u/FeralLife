import {eventConversation} from '../src/event-stage.js';
import {messagePages} from '../src/message-pages.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createGame,validateSave} from '../src/simulation.js';
import {validActOne} from '../src/act-one.js';
import {beginActTwo,advanceActTwo,answerActTwo,rewindActTwo,resumeActTwoRewind} from '../src/act-two.js';
import {continueDestination,rememberConversation} from '../src/conversation-progress.js';
import {storyCheckpointTarget,validStoryCheckpoint} from '../src/story-checkpoints.js';
import {createVoicePlayer} from '../src/voice-player.js';
import {voiceLineKey} from '../src/voice-policy.js';
import {mountDuelPlayback} from '../src/act-two-duel-stage.js';

function start(){const s=beginActTwo(createGame(42));Object.assign(s.actOne,{started:true,titlePending:false,prologuePending:false});return s;}
const answer=(s,id)=>answerActTwo(s,s.actOne.pending.eventId,id);
const valid=s=>assert.ok(validActOne(s)&&validateSave(s));

test('every repeated first-trouble failure restores its beginning and clock target, including legacy entry snapshots',()=>{
 for(const legacy of [false,true]){
  let s=start();const old=structuredClone(s.actOne.rollbackPoint);
  advanceActTwo(s,100);answer(s,'guarantee');if(legacy)s.actOne.rollbackPoint=old;
  for(let repeat=0;repeat<4;repeat++){
   assert.equal(storyCheckpointTarget(s).hour,66);
   s=JSON.parse(JSON.stringify(rewindActTwo(s)));valid(s);
   assert.equal(s.hour,66);assert.deepEqual(s.actOne.completed,[]);
   assert.equal(s.actOne.pending.scene,'bag');
   assert.equal(validStoryCheckpoint(s.actOne.rollbackPoint,2),true);
   assert.equal(s.actOne.rollbackPoint.state.actOne.rollbackPoint,undefined);
   assert.equal(s.events.filter(e=>e.actScene==='act2-rewind').length,1,'old rewind dialogue must not become the next destination');
   const snapshot=JSON.stringify(s.actOne.rollbackPoint);
   const id=resumeActTwoRewind(s);assert.equal(id,s.actOne.pending.eventId);assert.equal(s.hour,66);
   assert.equal(resumeActTwoRewind(s),null,'duplicate resume is inert');
   assert.equal(JSON.stringify(s.actOne.rollbackPoint),snapshot);
   answer(s,repeat%2?'guarantee':'return');valid(s);
  }
 }
});

test('chapter two Continue keeps an in-progress tragedy and does not open its ending cinematic',()=>{
 let s=start();advanceActTwo(s,100);
 const consultation=s.events.find(e=>e.id===s.actOne.pending.eventId);
 rememberConversation(s,consultation,2,0);
 const reply=answer(s,'guarantee');
 assert.equal(continueDestination(s).id,reply.id);
 rememberConversation(s,reply,4,1);
 assert.deepEqual(continueDestination(s),{type:'event',id:reply.id,cursor:4,page:1});
 delete s.actOne.conversation;reply.read=true;
 assert.deepEqual(continueDestination(s),{type:'event',id:reply.id,cursor:0,page:0});
 s.actOne.outcomeSeen=true;
 assert.equal(continueDestination(s).type,'rewind');
 const duel=start();advanceActTwo(duel,100);answer(duel,'loan');advanceActTwo(duel,100);
 for(const id of ['vow','shield','future','ultimate'])answer(duel,id);
 const event=duel.events.findLast(e=>e.duel);
 event.read=true;Object.assign(duel.actOne.duel,{eventId:event.id,dialogueComplete:false,cursor:3,page:1});
 assert.deepEqual(continueDestination(duel),{type:'event',id:event.id,cursor:3,page:1});
});

test('real resume button reaches choices without replaying trouble dialogue, including saved pre-fix duel rewinds',()=>{
 const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 const branch=app.slice(app.indexOf("  if(button.hasAttribute('data-rewind-resume')"),app.indexOf("  if(button.hasAttribute('data-epilogue-done')"));
 for(const route of ['bag','yandere','domination'])for(const legacy of [false,true]){
  let s=start();advanceActTwo(s,100);
  if(route==='bag')answer(s,'guarantee');
  else {answer(s,'loan');advanceActTwo(s,100);for(const id of route==='yandere'?['vow','shield','future','ultimate']:['help','discount','sleep','catapult'])answer(s,id);}
  s=structuredClone(rewindActTwo(s));if(legacy)delete s.events.find(e=>e.actScene==='act2-rewind').resumeDuel;
  const context={state:s,resumeActTwoRewind,eventConversation,messagePages,button:{hasAttribute:()=>true},save(){valid(s);},showEvent(id,index){context.landed={id,index};},closeModal(){assert.fail('must not return to observation');}};
  vm.createContext(context);vm.runInContext('(function(){'+branch+'})()',context);
  assert.equal(context.landed.id,s.actOne.pending.eventId);assert.equal(context.landed.index,eventConversation(s.events.find(e=>e.id===s.actOne.pending.eventId)).length-1);
  assert.equal(s.events.find(e=>e.id===s.actOne.pending.eventId).rewindChoiceReady,true);
  assert.equal(s.hour,route==='bag'?66:84);assert.equal(s.actOne.rewindIntroPending,false);
  assert.deepEqual(s.actOne.completed,route==='bag'?[]:['bag']);valid(s);
 }
});

test('all automatic duel lines wait for voice, hidden tabs and menus, and cancel stale callbacks',()=>{
 for(const line of [{duelWindup:true},{duelPlayback:true},{duelAttack:true}]){
  let time=0,blocked=true,count=0,id=0;const timers=new Map();
  const stop=mountDuelPlayback(line,{advance(){count++;},blocked:()=>blocked,now:()=>time,schedule(fn){timers.set(++id,fn);return id;},cancel:key=>timers.delete(key)});
  const tick=()=>{time+=5000;const [key,fn]=timers.entries().next().value;timers.delete(key);fn();};
  tick();tick();assert.equal(count,0);
  blocked=false;tick();assert.equal(count,1);stop();assert.equal(timers.size,0);
 }
});


test('pre-fix repeated first-trouble rewind saves at chapter entry skip directly to the incident',()=>{
 let s=start();advanceActTwo(s,100);answer(s,'guarantee');s=rewindActTwo(s);
 s.actOne.rewindIntroPending=false;answer(s,'return');s=rewindActTwo(s);
 // Former releases saved the repeat rewind at day 3 09:00 with no active trouble.
 s.hour=57;s.actOne.pending=null;s=JSON.parse(JSON.stringify(s));valid(s);
 assert.ok(resumeActTwoRewind(s));assert.equal(s.hour,66);assert.equal(s.actOne.pending.scene,'bag');valid(s);
});


test('switching voice OFF during an attack releases automatic playback instead of deadlocking',()=>{
 const line={speaker:'manager',text:'いくぞ！',duelAttack:true};let time=0,count=0;
 const player=createVoicePlayer({storage:null,manifest:{[voiceLineKey(line)]:{file:'attack.mp3'}},makeAudio:()=>({play:()=>Promise.resolve(),pause(){},load(){},removeAttribute(){}})});
 let callback;
 const stop=mountDuelPlayback(line,{advance(){count++;},blocked:()=>player.busy,voiceOutcome:()=>player.outcome,now:()=>time,schedule(fn){callback=fn;return 1;},cancel(){}});
 try{
  player.play(line,'attack');time=5000;callback();assert.equal(count,0);
  player.setEnabled(false);callback();assert.equal(count,1);
 }finally{stop();player.stop();}
});


test('real dialogue cursor selection keeps a saved duel page unless a new line is explicitly requested',()=>{
 const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 const source=app.slice(app.indexOf('  const lines=eventConversation(e),cursor='),app.indexOf('  const epilogueDirection=actTwoEpilogueDirection(e,cursor);'));
 for(const index of [null,0]){
  const context={savedPosition:null,e:{id:12,duel:true},state:{actOne:{duel:{eventId:12,cursor:1,page:1}}},index,page:null,eventConversation:()=>[{text:'a'},{text:'b'}]};
  vm.createContext(context);const result=vm.runInContext(source+';({cursor,page})',context);
  assert.equal(result.cursor,index===null?1:0);assert.equal(result.page,index===null?1:0);
 }
});

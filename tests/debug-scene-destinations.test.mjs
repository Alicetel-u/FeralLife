import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createActOne,advanceActOne,answerActOne,ACT_ONE_EVENTS} from '../src/act-one.js';
import {beginActTwo,advanceActTwo,answerActTwo,ACT_TWO_EVENTS,rewindActTwo} from '../src/act-two.js';
import {eventConversation} from '../src/event-stage.js';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
test('debug event names match the scenes they actually open in both chapters',()=>{
 const source=app.slice(app.indexOf('function showDebugSceneSelect('),app.indexOf("document.addEventListener('click',e=>{"));
 const context={ACT_ONE_EVENTS,ACT_TWO_EVENTS,createActOne,advanceActOne,answerActOne,beginActTwo,advanceActTwo,answerActTwo,developerMode:false,
  debugMenuPage:(title,detail,options)=>context.options=options,resetActState:next=>context.state=next,
  showEvent:id=>context.landed=context.state.events.find(e=>e.id===id),showOpening:()=>context.landed='intro',
  showActTitle:()=>context.landed='unexpected-title',showActTwoTitle:()=>context.landed='unexpected-title',showActTwoOpening:()=>context.landed='opening',
  save(){},requestAnimationFrame:fn=>fn()};
 vm.createContext(context);vm.runInContext(source,context);
 for(const chapter of ['1','2']){
  vm.runInContext(`showDebugSceneSelect('${chapter}')`,context);
  for(const [target,label] of context.options){
   context.landed=null;vm.runInContext(`startDeveloperScene('${target}')`,context);
   const scene=target.split(':')[1];
   if(['ash','dinner','bag','contract'].includes(scene)){
    assert.equal(context.landed?.actScene,scene,target);assert.equal(context.landed?.title,label,target);
   }else if(scene==='epilogue')assert.equal(context.landed?.actScene,chapter==='1'?'epilogue':'act2-epilogue');
   else if(scene==='arrival')assert.equal(context.landed?.actScene,'act2-prologue');
   else assert.equal(context.landed,scene);
  }
 }
});

test('second-act repeated bad endings return using in-world narration, including old saves',()=>{
 for(const late of [false,true]){
  const state=createActOne(42,[],2,true);beginActTwo(state);Object.assign(state.actOne,{started:true,titlePending:false,prologuePending:false,attempt:2});
  advanceActTwo(state,100);answerActTwo(state,state.actOne.pending.eventId,late?'loan':'return');
  if(late){advanceActTwo(state,100);answerActTwo(state,state.actOne.pending.eventId,'sign');}
  const next=rewindActTwo(state),event=next.events.find(e=>e.actScene==='act2-rewind');
  assert.doesNotMatch(JSON.stringify(eventConversation(event)),/開始時点|チェックポイント|事件を回避|第二幕/);
 }
 for(const actScene of ['rewind','act2-rewind']){
  const text=actScene==='rewind'?'また時間が戻った。1日目17時・物語の開始時点だ。':'第二幕の開始時点に時間が戻っている。';
  const old={actScene,detail:text,lines:[{speaker:'narrator',text}]};
  assert.equal(eventConversation(old).length,1);assert.doesNotMatch(JSON.stringify(eventConversation(old)),/開始時点|第二幕/);
  assert.equal(old.lines[0].text,text);
 }
});

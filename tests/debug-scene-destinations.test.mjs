import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createActOne,advanceActOne,answerActOne,rewindBeforeFire,validActOne,ACT_ONE_EVENTS} from '../src/act-one.js';
import {validateSave} from '../src/simulation.js';
import {beginActTwo,advanceActTwo,answerActTwo,ACT_TWO_EVENTS,rewindActTwo} from '../src/act-two.js';
import {actTwoChoices} from '../src/act-two.js';
import {eventConversation} from '../src/event-stage.js';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
test('debug event names match the scenes they actually open in both chapters',()=>{
 const source=app.slice(app.indexOf('function showDebugSectionSelect('),app.indexOf("document.addEventListener('click',e=>{"));
 const context={ACT_ONE_EVENTS,ACT_TWO_EVENTS,createActOne,advanceActOne,answerActOne,rewindBeforeFire,beginActTwo,advanceActTwo,answerActTwo,rewindActTwo,eventConversation,developerMode:false,
  modal:{querySelector:selector=>selector==='.persona-debug-actions'?{insertAdjacentHTML:(_,html)=>context.pagination=html}:selector==='.persona-debug'?{classList:{add(){}}}:null},
  debugMenuPage:(title,detail,options)=>context.options=options,resetActState:next=>context.state=next,
  showEvent:(id,index)=>{context.index=index;context.landed=context.state.events.find(e=>e.id===id);},showOpening:()=>context.landed='intro',
  showActTitle:()=>context.landed='unexpected-title',showActTwoTitle:()=>context.landed='unexpected-title',showActTwoOpening:()=>context.landed='opening',
  save(){},requestAnimationFrame:fn=>fn()};
 vm.createContext(context);vm.runInContext(source,context);
 for(const chapter of ['1','2']){
  const destinations=[];
  for(let page=0;page<(chapter==='1'?3:5);page++){
   vm.runInContext(`showDebugSceneSelect('${chapter}',${page})`,context);
   destinations.push(...context.options.filter(option=>option[2]==='data-debug-scene'));
   assert.ok(context.options.length<=6,'mobile pages have a bounded number of controls');
   assert.equal((context.pagination.match(/data-debug-scene-page=/g)||[]).length,2);
  }
  if(chapter==='2'){assert.equal(destinations.length,17);assert.ok(destinations.every(([target])=>!target.includes('contract')));}
  if(chapter==='2'){
   const groups={prologue:['opening','arrival'],trouble1:['bag','bag-choices','bag-loop','bad-bag'],trouble2:['duel','duel-choices','duel-loop'],endings:['end-yandere','end-domination','end-clear','epilogue','epilogue-alone','epilogue-memory','epilogue-night','epilogue-secret']};
   for(const [section,expected] of Object.entries(groups)){
    const listed=[];
    for(let page=0;page<Math.ceil(expected.length/4);page++){
     vm.runInContext(`showDebugSceneSelect('2',${page},'${section}')`,context);
     listed.push(...Array.from(context.options,([id])=>id.split(':')[1]));
    }
    assert.deepEqual(listed,expected);
   }
  }
  for(const [target,label] of destinations){
   context.landed=null;vm.runInContext(`startDeveloperScene('${target}')`,context);
   const scene=target.split(':')[1];
   if(scene.endsWith('-loop')||scene.endsWith('-choices')){
    const [trouble,phase]=scene.split('-');
    assert.equal(context.state.actOne.status,'playing');
    if(trouble==='duel'&&phase==='choices'){
     assert.equal(context.state.actOne.attempt,1);
     assert.equal(context.state.actOne.memory.includes('duel-yandere'),false);
     assert.ok(actTwoChoices(context.state,'duel').every(choice=>!choice.disabled&&!choice.restrained));
    }else assert.ok(context.state.actOne.attempt>1);
    if(phase==='loop'){
     assert.equal(context.landed.actScene,chapter==='1'?'rewind':'act2-rewind');assert.equal(context.index,0);
     assert.equal(context.state.actOne.rewindIntroPending,true);
     if(trouble==='duel')assert.equal(actTwoChoices(context.state,'duel').find(choice=>choice.delta===3).disabled,true);
    }else{
     assert.equal(context.landed.actScene,trouble);assert.equal(context.state.actOne.pending.scene,trouble);
     assert.equal(context.index,eventConversation(context.landed).length-1);
     assert.equal(context.state.actOne.rewindIntroPending,false);
    }
    assert.ok(context.state.events.filter(e=>!e.read).every(e=>e.id===context.landed.id),'no stale earlier scene is queued');
    assert.ok(validActOne(context.state)&&validateSave(context.state),target+' creates a valid state');
    if(phase==='choices'){
     const events=chapter==='1'?ACT_ONE_EVENTS:ACT_TWO_EVENTS;
     const safe=trouble==='duel'?actTwoChoices(context.state,'duel').find(choice=>choice.delta===3):events[trouble].choices.find(choice=>!choice.bad);
     const reply=(chapter==='1'?answerActOne:answerActTwo)(context.state,context.landed.id,safe.id);
     assert.ok(reply,target+' can answer immediately');assert.equal(context.state.actOne.status,'playing');
    }
   }else if(scene.startsWith('bad-')){
    assert.equal(context.landed?.actScene,'reply',target);
    assert.equal(context.state.actOne.status,'bad',target);
    assert.ok(validActOne(context.state)&&validateSave(context.state),target+' creates a valid BAD state');
   }else if(scene.startsWith('end-')){
    assert.equal(context.landed?.actScene,'duel',target);
    assert.equal(context.landed?.duelOutcome,scene.slice(4),target);
    assert.equal(eventConversation(context.landed)[context.index]?.duelEnding,scene.slice(4),target);
    assert.ok(validActOne(context.state)&&validateSave(context.state),target+' creates a valid ending state');
   }else if(['ash','dinner','bag','contract'].includes(scene)){
    const events=chapter==='1'?ACT_ONE_EVENTS:ACT_TWO_EVENTS;
    assert.equal(context.landed?.actScene,scene,target);assert.equal(context.landed?.title,events[scene].title,target);
    assert.match(label,/^トラブル開始｜/,target);
   }else if(scene==='epilogue')assert.equal(context.landed?.actScene,chapter==='1'?'epilogue':'act2-epilogue');
   else if(scene.startsWith('epilogue-')){
    assert.equal(context.landed?.actScene,'act2-epilogue');
    assert.equal(eventConversation(context.landed)[context.index]?.epilogueScene,scene.slice(9));
   }
   else if(scene==='arrival')assert.equal(context.landed?.actScene,'act2-prologue');
   else if(scene==='duel'){
    assert.equal(context.landed.actScene,'duel');
    assert.equal(context.state.actOne.memory.includes('duel-yandere'),false);
    assert.ok(actTwoChoices(context.state,'duel').every(choice=>!choice.disabled));
   }
   else assert.equal(context.landed,scene);
  }
 }
});

test('second-act repeated bad endings return using in-world narration, including old saves',()=>{
 for(const late of [false,true]){
  const state=createActOne(42,[],2,true);beginActTwo(state);Object.assign(state.actOne,{started:true,titlePending:false,prologuePending:false,attempt:2});
  advanceActTwo(state,100);answerActTwo(state,state.actOne.pending.eventId,late?'loan':'return');
  if(late){advanceActTwo(state,100);for(const id of ['vow','shield','future','ultimate'])answerActTwo(state,state.actOne.pending.eventId,id);}
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

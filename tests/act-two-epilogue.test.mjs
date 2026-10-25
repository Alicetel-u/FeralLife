import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {createGame,validateSave} from '../src/simulation.js';
import {validActOne} from '../src/act-one.js';
import {beginActTwo,advanceActTwo,answerActTwo} from '../src/act-two.js';
import {ACT_TWO_EPILOGUE_LINES,refreshActTwoEpilogue} from '../src/act-two-epilogue-script.js';
import {EPILOGUE_ART,actTwoEpilogueDirection,epilogueTransitionFor,actTwoEpilogueStageHTML,actTwoEpilogueCompleteHTML,startEpilogueTransition} from '../src/act-two-epilogue-stage.js';
import {eventConversation} from '../src/event-stage.js';
import {messagePages} from '../src/message-pages.js';

function epilogueStart(){
 const state=beginActTwo(createGame(42));Object.assign(state.actOne,{started:true,titlePending:false,prologuePending:false});
 advanceActTwo(state,100);answerActTwo(state,state.actOne.pending.eventId,'loan');advanceActTwo(state,100);
 for(const id of ['boundary','receipt','cancel','leave'])answerActTwo(state,state.actOne.pending.eventId,id);
 advanceActTwo(state,100);return state;
}
test('the safe route reaches the authored morning, memory and secret night without changing the saved clock',()=>{
 const state=epilogueStart(),event=state.events.find(e=>e.actScene==='act2-epilogue');
 assert.equal(state.hour,105);assert.equal(state.actOne.status,'clear');assert.equal(event.epilogueVersion,2);
 assert.deepEqual(event.lines,ACT_TWO_EPILOGUE_LINES);assert.equal(eventConversation(event).length,event.lines.length);
 assert.deepEqual([...new Set(event.lines.map(l=>l.epilogueScene))],['morning','alone','memory','return','night','secret']);
 assert.ok(event.lines.some(l=>l.text==='……証拠は全部、燃やしてしまえ。'));
 assert.ok(event.lines.some(l=>l.text==='全部は、ね♡'));
 assert.ok(event.lines.every(l=>!/(?:演出：|効果音：|シーン[①②③]|暗転|BGM|画面遷移)/.test(l.text)));
 assert.ok(validateSave(state)&&validActOne(state));assert.deepEqual(JSON.parse(JSON.stringify(event)),event);
});
test('each scene keeps the dialogue UI, its actual cast, its own artwork and silence at the reveal',()=>{
 const state=epilogueStart(),event=state.events.find(e=>e.actScene==='act2-epilogue'),before=JSON.stringify(state);
 for(const src of Object.values(EPILOGUE_ART))assert.ok(existsSync(src),src);
 for(let i=0;i<event.lines.length;i++)for(let page=0;page<messagePages(event.lines[i].text).length;page++){
  const direction=actTwoEpilogueDirection(event,i),html=actTwoEpilogueStageHTML(event,state.residents,i,page);
  assert.match(html,/stage-bubble/);assert.match(html,/speaker-name/);assert.match(html,/mobile-dialogue-tap/);
  assert.equal(html.includes('data-character="cat"'),direction.shot==='company'&&['cat','narrator'].includes(event.lines[i].speaker));
  assert.equal(html.includes('data-character="hostess"'),['company','vanity','close'].includes(direction.shot)&&['hostess','narrator'].includes(event.lines[i].speaker));
  if(direction.scene==='memory'||direction.scene==='secret')assert.equal(direction.silent,true);
  if(direction.shot==='blank')assert.ok(html.includes(EPILOGUE_ART.blank));
  if(direction.shot==='burn')assert.match(html,/epilogue-fire/);
  if(direction.shot==='outside')assert.equal(html.includes('epilogue-lamps'),page===0&&event.lines[i].epilogueTransition==='night');
 }
 assert.equal(JSON.stringify(state),before,'rendering never mutates the story or simulation time');
 const end=actTwoEpilogueCompleteHTML();assert.match(end,/第二幕/);assert.match(end,/第三幕へ続く/);assert.match(end,/data-act-title/);
 assert.doesNotMatch(end,/footer|masthead|KEMONOSOU|CHAPTER|TO BE CONTINUED/);
});
test('unfinished old epilogues migrate by scene, retaining resolved incidents, clocks and completed saves',()=>{
 for(const [cursor,scene] of [[0,'morning'],[2,'memory'],[3,'return'],[4,'night']]){
  const state=epilogueStart(),event=state.events.find(e=>e.actScene==='act2-epilogue');
  const completed=JSON.stringify(state.actOne.completed),duel=JSON.stringify(state.actOne.duel);
  event.epilogueVersion=undefined;event.detail='古い朝';
  event.lines=[{speaker:'narrator',text:'古い朝'},{speaker:'manager',text:'旧台詞'},
   {speaker:'mystery',text:'旧記憶',flashbackEffect:'whiteout'},
   {speaker:'narrator',text:'玄関に戻った。'},{speaker:'narrator',text:'その夜。古い場面'}];
  state.actOne.epilogueCursor=cursor;
  assert.equal(refreshActTwoEpilogue(state),true);
  assert.equal(event.lines[state.actOne.epilogueCursor].epilogueScene,scene);
  assert.equal(state.hour,105);assert.equal(JSON.stringify(state.actOne.completed),completed);assert.equal(JSON.stringify(state.actOne.duel),duel);
  assert.ok(validateSave(state)&&validActOne(state));assert.equal(refreshActTwoEpilogue(state),false);
 }
 const finished=epilogueStart();finished.actOne.epilogueSeen=true;
 const event=finished.events.find(e=>e.actScene==='act2-epilogue');delete event.epilogueVersion;
 const original=JSON.stringify(finished);assert.equal(refreshActTwoEpilogue(finished),false);assert.equal(JSON.stringify(finished),original);
});
test('transitions follow scene changes, including SKIP and restore, without replaying fades on a dialogue page',()=>{
 const event={actScene:'act2-epilogue',detail:ACT_TWO_EPILOGUE_LINES[0].text,lines:ACT_TWO_EPILOGUE_LINES};
 const at=scene=>event.lines.findIndex(line=>line.epilogueScene===scene),secret=at('secret');
 assert.equal(epilogueTransitionFor(event,null,0),'fade');
 assert.equal(epilogueTransitionFor(event,0,1),null);
 assert.equal(epilogueTransitionFor(event,at('alone')-1,at('alone')),'fade');
 assert.equal(epilogueTransitionFor(event,at('memory')-1,at('memory')),'white');
 assert.equal(epilogueTransitionFor(event,secret-1,secret),null,'close-up keeps the shot continuous');
 assert.equal(epilogueTransitionFor(event,0,event.lines.length-1),'night','SKIP still distinguishes the time change');
 assert.equal(epilogueTransitionFor(event,null,at('memory')+1),'white','restored memory starts behind white');
 assert.equal(epilogueTransitionFor(event,at('memory')-1,at('memory'),1),null);
});

function transitionHarness(hidden=false){
 const phases=[];let visibility,removed=0;
 const doc={hidden,createElement:()=>root,addEventListener:(_,fn)=>visibility=fn,removeEventListener:()=>visibility=null};
 const root={setAttribute(){},remove(){removed++;},animate(frames,options){
  let resolve,reject;const animation={finished:new Promise((yes,no)=>{resolve=yes;reject=no;}),pause(){this.paused=true;},play(){this.paused=false;},cancel(){reject(new Error('cancelled'));}};
  phases.push({frames,options,resolve,animation});return animation;
 }};
 return {host:{ownerDocument:doc,append(){}},doc,phases,get removed(){return removed;},visible(){doc.hidden=false;visibility?.();}};
}
const settle=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
test('scene changes retain an opaque hold, wait for art, pause while hidden, and finish once',async()=>{
 const h=transitionHarness(),calls=[];let ready;
 const dispose=startEpilogueTransition(h.host,'night',()=>calls.push('replace'),()=>calls.push('done'),{ready:()=>new Promise(resolve=>ready=resolve),reducedMotion:false});
 assert.equal(h.phases[0].options.duration,550);h.phases[0].resolve();await settle();
 assert.equal(h.phases[1].options.duration,1200);assert.deepEqual(h.phases[1].frames,[{opacity:1},{opacity:1}]);
 h.doc.hidden=true;h.phases[1].resolve();await settle();ready();await settle();assert.deepEqual(calls,[]);
 h.visible();await settle();assert.deepEqual(calls,['replace']);assert.equal(h.phases[2].options.duration,650);
 h.phases[2].resolve();await settle();assert.deepEqual(calls,['replace','done']);assert.equal(h.removed,1);dispose();
});
test('cancelled fades cannot advance after delayed readiness; reduced motion still retains the pause',async()=>{
 const h=transitionHarness();let advance=0,ready;
 const stop=startEpilogueTransition(h.host,'fade',()=>advance++,()=>advance++,{ready:()=>new Promise(resolve=>ready=resolve),reducedMotion:true});
 assert.equal(h.phases[0].options.duration,1);h.phases[0].resolve();await settle();assert.equal(h.phases[1].options.duration,850);
 stop();ready();await settle();assert.equal(advance,0);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {choiceUIHTML,mountChoiceUI} from '../src/choice-ui.js';
import {failedChoiceKeys} from '../src/choice-history.js';
import {createActOne,advanceActOne,answerActOne,rewindBeforeFire,getActOneChoices,actOneChosenChoices,validActOne} from '../src/act-one.js';
import {beginActTwo,advanceActTwo,answerActTwo,rewindActTwo,ACT_TWO_EVENTS,actTwoChosen} from '../src/act-two.js';
import {validateSave} from '../src/simulation.js';
const ashFailure=()=>{const s=createActOne(42,[],1,true);advanceActOne(s,100);answerActOne(s,s.actOne.pending.eventId,'trash');return s;};

test('used failed answers are labelled and disabled after rewind and reload, while water stays available',()=>{
 const s=rewindBeforeFire(ashFailure()),loaded=JSON.parse(JSON.stringify(s));
 const e=loaded.events.find(e=>e.id===loaded.actOne.pending.eventId);
 const html=choiceUIHTML(e,getActOneChoices(loaded,'ash'),new Set(actOneChosenChoices(loaded)),failedChoiceKeys(loaded));
 assert.match(html,/class="decision-choice previously-chosen choice-exhausted"[^>]*data-choice="trash"[^>]*disabled/);
 assert.match(html,/choice-history-badge">選択済/);
 assert.doesNotMatch(html,/<button[^>]*data-choice="water"[^>]* disabled/);
 assert.ok(validActOne(loaded)&&validateSave(loaded));
});

test('previously successful answers stay selectable when a later incident rewinds',()=>{
 const s=createActOne(42,[],2,true);advanceActOne(s,100);answerActOne(s,s.actOne.pending.eventId,'water');
 const choices=getActOneChoices(s,'ash'),html=choiceUIHTML({id:3,actScene:'ash'},choices,new Set(actOneChosenChoices(s)),new Set(['ash:water']));
 assert.match(html,/<button[^>]*previously-chosen[^>]*data-choice="water"/);
 assert.doesNotMatch(html,/<button[^>]*data-choice="water"[^>]* disabled/);
});

test('Luna first-night outcome does not lock her unseen later ending, but the later failure does',()=>{
 const s=createActOne(42,[],2,true);beginActTwo(s);Object.assign(s.actOne,{started:true,titlePending:false,prologuePending:false});
 advanceActTwo(s,100);answerActTwo(s,s.actOne.pending.eventId,'guarantee');
 const loop=rewindActTwo(s);assert.equal(failedChoiceKeys(loop).has('bag:guarantee'),false);
 assert.equal(actTwoChosen(loop).includes('bag:guarantee'),false,'first-night reassurance never marks the unseen middle choice');
 const legacy=JSON.parse(JSON.stringify(loop));legacy.actOne.chosenChoices=['bag:guarantee'];
 assert.equal(actTwoChosen(legacy).includes('bag:guarantee'),false,'remove stale labels from existing saves');
 loop.actOne.rewindIntroPending=false;answerActTwo(loop,loop.actOne.pending.eventId,'guarantee');
 const later=rewindActTwo(loop),loaded=JSON.parse(JSON.stringify(later));
 assert.equal(failedChoiceKeys(loaded).has('bag:guarantee'),true);
 const html=choiceUIHTML({id:3,actScene:'bag'},ACT_TWO_EVENTS.bag.choices,new Set(actTwoChosen(loaded)),failedChoiceKeys(loaded));
 assert.match(html,/<button[^>]*choice-exhausted[^>]*data-choice="guarantee"[^>]*disabled/);
 assert.doesNotMatch(html,/<button[^>]*data-choice="loan"[^>]* disabled/);
 assert.ok(validActOne(loaded)&&validateSave(loaded));
});

test('choice input skips exhausted buttons, never re-enables them, and rejects their confirmation',()=>{
 const originals={document:globalThis.document,matchMedia:globalThis.matchMedia,setTimeout:globalThis.setTimeout,clearTimeout:globalThis.clearTimeout};
 const timers=[];let answers=0;
 globalThis.document={activeElement:null};globalThis.matchMedia=()=>({matches:false});
 globalThis.setTimeout=fn=>{timers.push(fn);return timers.length;};globalThis.clearTimeout=()=>{};
 try{
  const button=disabled=>({disabled,attrs:{},setAttribute(k,v){this.attrs[k]=v;},focus(){document.activeElement=this;},classList:{add(){}}});
  const buttons=[button(true),button(false),button(false)],panel={querySelectorAll:()=>buttons,isConnected:true,classList:{add(){},contains:()=>false}};
  const modal=new EventTarget();modal.open=true;modal.style={};modal.classList={contains:()=>false};modal.querySelector=sel=>sel==='.cinematic-choice'?panel:sel==='.event-menu'?{hidden:true}:null;
  const control=mountChoiceUI(modal);assert.equal(document.activeElement,buttons[1]);timers[0]();
  assert.equal(buttons[0].disabled,true);assert.notEqual(buttons[0].attrs['aria-disabled'],'false');
  control.confirm(buttons[0],()=>answers++);assert.equal(timers.length,1);
  const key=new Event('keydown',{cancelable:true});key.key='ArrowDown';modal.dispatchEvent(key);assert.equal(document.activeElement,buttons[2]);
  const first=new Event('keydown',{cancelable:true});first.key='1';modal.dispatchEvent(first);assert.equal(document.activeElement,buttons[2]);
  control.confirm(buttons[2],()=>answers++);timers[1]();assert.equal(answers,1);control();
 }finally{Object.assign(globalThis,originals);}
});


test('obsolete ash outcomes do not produce invalid saved choice ids',()=>{
 const s=ashFailure();s.actOne.memory.push('ash-laundry','ash-wind');
 const next=rewindBeforeFire(s);assert.ok(validActOne(next)&&validateSave(next));
 assert.deepEqual([...failedChoiceKeys(next)],['ash:trash']);
});

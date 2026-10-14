import test from 'node:test';
import assert from 'node:assert/strict';
import { avoidedTrouble, troubleAvoidedHTML, startTroubleVictory } from '../src/trouble-victory.js';
import { ACT_ONE_EVENTS } from '../src/act-one.js';
import { ACT_TWO_EVENTS } from '../src/act-two.js';
test('only authored safe replies trigger victory in either chapter; seen replies never repeat',()=>{
  for(const [chapter,events] of [[1,ACT_ONE_EVENTS],[2,ACT_TWO_EVENTS]])for(const [scene,event] of Object.entries(events))for(const choice of event.choices){
    const reply={actScene:'reply',title:'返事：'+choice.label};
    assert.deepEqual(avoidedTrouble(reply,chapter),choice.bad?null:{scene,chapter});
    assert.equal(avoidedTrouble({...reply,avoidanceSeen:true},chapter),null);
    assert.equal(avoidedTrouble({...reply,actScene:scene},chapter),null);
  }
});
test('victory supports native keyboard activation, completes once and cleans up',()=>{
  const button=new EventTarget();button.focus=()=>{};
  let count=0;
  const stop=startTroubleVictory({querySelector:()=>button},()=>count++);
  button.dispatchEvent(new Event('click'));button.dispatchEvent(new Event('click'));stop();assert.equal(count,1);
  const cancel=startTroubleVictory({querySelector:()=>button},()=>count++);cancel();button.dispatchEvent(new Event('click'));assert.equal(count,1);
  assert.match(troubleAvoidedHTML(1),/トラブル/);assert.match(troubleAvoidedHTML(2),/data-victory-done/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { avoidedTrouble, troubleAvoidedHTML, actOneCompleteHTML, startTroubleVictory } from '../src/trouble-victory.js';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {storyScreenHTML} from '../src/story-screens.js';
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

test('first-act completion has one forward action and shares the victory soundtrack',()=>{
  const html=actOneCompleteHTML();
  assert.equal(storyScreenHTML(html),html);
  assert.equal((html.match(/<button/g)||[]).length,1);
  assert.match(html,/data-act-reward/);assert.doesNotMatch(html,/data-act-replay|FIRST ACT COMPLETE/);
  const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
  const source=app.slice(app.indexOf('function syncNormalBgm(){'),app.indexOf("modal.addEventListener('luna-film-phase'"));
  for(const screen of ['.trouble-victory','.act-one-complete']){
    let cue;
    const context={document:{hidden:false},state:{actOne:{chapter:1}},modal:{open:true,classList:{contains:()=>false},querySelector:s=>s.split(',').includes(screen)?{}:null},normalBgm:{setScene:(silent,name)=>{assert.equal(silent,false);cue=name;}}};
    vm.createContext(context);vm.runInContext(source+'\nsyncNormalBgm();',context);
    assert.equal(cue,'victory');
  }
});
test('victory waits for its button, supports keyboard activation, and cleans up',t=>{
  t.mock.timers.enable({apis:['setTimeout']});
  const button=new EventTarget();button.focus=()=>{};
  let count=0;
  const stop=startTroubleVictory({querySelector:()=>button},()=>count++);
  t.mock.timers.tick(60000);assert.equal(count,0,'waiting never dismisses the victory');
  button.dispatchEvent(new Event('click'));button.dispatchEvent(new Event('click'));stop();assert.equal(count,1);
  const cancel=startTroubleVictory({querySelector:()=>button},()=>count++);cancel();button.dispatchEvent(new Event('click'));assert.equal(count,1);
  assert.match(troubleAvoidedHTML(1),/トラブル/);assert.match(troubleAvoidedHTML(2),/data-victory-done/);
});

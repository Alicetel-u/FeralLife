import test from 'node:test';
import assert from 'node:assert/strict';
import {claimAutomaticScene,rememberReadScenes,createTalk,stepTalk} from '../src/dialogue.js';
import {createGame,validateSave} from '../src/simulation.js';

test('identical daily scenes are automatic only once, including after save/reload',()=>{
  const s=createGame(3),event={id:20,lines:[{speaker:'peko',text:'おいしかった！'}]};
  assert.equal(claimAutomaticScene(s,event),true);
  const loaded=JSON.parse(JSON.stringify(s));
  assert.ok(validateSave(loaded));
  assert.equal(claimAutomaticScene(loaded,{...event,id:21}),false);
  assert.equal(claimAutomaticScene(loaded,{id:22,lines:[{speaker:'peko',text:'今日は足りない……'}]}),true);
});
test('read diary records seed legacy saves but unread scenes and new conflicts remain available',()=>{
  const s={heard:[],events:[{read:true,lines:[{speaker:'sister',text:'お姉ちゃん、返信して'}]},{read:false,lines:[{speaker:'ann',text:'相談したい'}]}]};
  rememberReadScenes(s);
  assert.equal(claimAutomaticScene(s,{id:99,lines:s.events[0].lines}),false);
  assert.equal(claimAutomaticScene(s,s.events[1]),true);
  assert.equal(claimAutomaticScene(s,{caseId:'cigarette',lines:s.events[0].lines}),true);
  assert.equal(claimAutomaticScene(s,{caseResult:'cigarette',lines:s.events[0].lines}),true);
  assert.equal(claimAutomaticScene(s,{followupOf:'cigarette',lines:s.events[0].lines}),true);
});
test('a staged or read event is not replayed as observation speech after closing',()=>{
  const s=createGame(3),event=s.events.find(e=>e.lines?.length),talk=createTalk(0);
  stepTalk(talk,s,1000,false);
  assert.equal(talk.eventId,event.id);
  event.read=true;
  stepTalk(talk,s,1500,false);
  assert.equal(talk.eventId,0);
  assert.notEqual(talk.bubbles[0]?.text,event.lines[0].text);
  event.read=false;event.stageOnly=true;
  const fresh=createTalk(0);stepTalk(fresh,s,2000,false);
  assert.equal(fresh.eventId,0);
});

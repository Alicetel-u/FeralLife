import test from 'node:test';
import assert from 'node:assert/strict';
import {createActOne,advanceActOne,answerActOne,rewindBeforeFire,validActOne} from '../src/act-one.js';
import {beginActTwo,advanceActTwo,answerActTwo,rewindActTwo,resumeActTwoRewind} from '../src/act-two.js';
import {resumeStoryRewind} from '../src/story-checkpoints.js';
import {eventConversation,eventStageHTML} from '../src/event-stage.js';
import {duelStageHTML} from '../src/act-two-duel-stage.js';
import {validateSave} from '../src/simulation.js';
const answer=(s,id)=>answerActTwo(s,s.actOne.pending.eventId,id);
function failed(route){
 let s=createActOne(42,[],route==='ash'?1:2,true);advanceActOne(s,100);
 if(route==='ash'){answerActOne(s,s.actOne.pending.eventId,'trash');return s;}
 answerActOne(s,s.actOne.pending.eventId,'water');advanceActOne(s,100);
 if(route==='dinner'){answerActOne(s,s.actOne.pending.eventId,'turbo');return s;}
 answerActOne(s,s.actOne.pending.eventId,'coronation');advanceActOne(s,100);beginActTwo(s);
 Object.assign(s.actOne,{started:true,titlePending:false,prologuePending:false});advanceActTwo(s,100);
 if(route==='bag'){answer(s,'guarantee');return s;}
 answer(s,'loan');advanceActTwo(s,100);
 for(const id of route==='yandere'?['vow','shield','future','ultimate']:['help','discount','sleep','catapult'])answer(s,id);
 return s;
}
for(const route of ['ash','dinner','bag','yandere','domination'])test(route+': rewind choices survive reload, preserve prior incidents and remain playable',()=>{
 let s=failed(route);
 const chapter=s.actOne.chapter||1;
 s=chapter===1?rewindBeforeFire(s):rewindActTwo(s);
 const before=s.events.findLast(e=>['rewind','act2-rewind'].includes(e.actScene));
 assert.equal(s.actOne.rewindIntroPending,true);
 if(route==='dinner'){
  assert.ok(before.lines.some(l=>l.text.includes('料理の相談を受けた昼')));
  assert.ok(!before.lines.some(l=>l.text.includes('23時')||l.text.includes('灰皿')));
 }
 if(['yandere','domination'].includes(route)){
  assert.ok(!before.lines.some(l=>/花束|婚約|まだ何もお願い|頼み事をする前/.test(l.text)));
  assert.equal(before.lines.at(-1).text,'大家、今日はやけに慎重ニャ。');
 }
 const snapshot=JSON.stringify(s.actOne.rollbackPoint);
 s=JSON.parse(JSON.stringify(s));
 const id=chapter===1?resumeStoryRewind(s):resumeActTwoRewind(s);
 const event=s.events.find(e=>e.id===id),lines=eventConversation(event),index=lines.length-1;
 assert.equal(s.actOne.rewindIntroPending,false);assert.equal(event.choicePresented,true);assert.equal(event.rewindChoiceReady,true);
 assert.equal(s.hour,route==='ash'?23:route==='dinner'?37:route==='bag'?66:84);
 assert.deepEqual(s.actOne.completed,route==='ash'||route==='bag'?[]:route==='dinner'?['ash']:['bag']);
 assert.equal(JSON.stringify(s.actOne.rollbackPoint),snapshot);
 const html=event.duel?duelStageHTML(event,s.residents,index):eventStageHTML(event,s.residents,index);
 assert.ok(html.includes('rewind-choice-ready'));
 if(event.duel){assert.ok(html.includes('duel-field'));assert.ok(!html.includes('duel-opening-stage'));assert.equal(s.actOne.duel.round,0);assert.equal(s.actOne.duel.hearts,0);}
 assert.ok(validActOne(s)&&validateSave(s));
 s=JSON.parse(JSON.stringify(s));
 const reply=chapter===1?answerActOne(s,id,route==='ash'?'water':'coronation'):answer(s,route==='bag'?'loan':'boundary');
 assert.ok(reply);assert.ok(!reply.rewindChoiceReady);assert.equal(s.actOne.status,'playing');
 const count=s.events.length;assert.equal(resumeStoryRewind(s),null);assert.equal(s.events.length,count);
});

test('shared rewind handoff accepts future chapters without chapter-specific conditionals',()=>{
 const event={id:2,lines:[{speaker:'manager',text:'test'}]};
 const s={actOne:{chapter:4,rewindIntroPending:true,pending:null,conversation:{eventId:1,cursor:2,page:0}},events:[{id:1,actScene:'act4-rewind',read:false}]};
 assert.equal(resumeStoryRewind(s,()=>{s.events.push(event);s.actOne.pending={scene:'future',eventId:2};}),2);
 assert.equal(event.rewindChoiceReady,true);assert.equal(s.events[0].read,true);assert.equal(s.actOne.conversation,undefined);
});

test('legacy first-attempt cooking failures describe the cooking clock, not the ash consultation',()=>{
 const s=failed('dinner');s.actOne.attempt=1;
 const next=rewindBeforeFire(s),intro=next.events.findLast(e=>e.actScene==='rewind');
 assert.equal(next.hour,37);assert.ok(intro.lines.some(l=>l.text.includes('13時')));
 assert.ok(!intro.lines.some(l=>/23時|灰皿/.test(l.text)));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame} from '../src/simulation.js';
import {ACT_TWO_EVENTS,beginActTwo,advanceActTwo,answerActTwo} from '../src/act-two.js';
import {eventConversation} from '../src/event-stage.js';
import {actTwoMorningDirection,actTwoMorningStageHTML,startMorningBlackout} from '../src/act-two-bad-stage.js';

for(const id of ['guarantee','return'])test(`${id}: morning cast, exits and ending follow the existing scenario`,()=>{
 const choice=ACT_TWO_EVENTS.bag.choices.find(c=>c.id===id);
 const event={actScene:'reply',detail:choice.lines[0].text,lines:choice.lines,cast:['hostess','cat']};
 const before=JSON.stringify(event),lines=eventConversation(event);
 let present=false;
 for(let i=0;i<lines.length;i++){
  const d=actTwoMorningDirection(event,i),html=actTwoMorningStageHTML(event,[],i),text=lines[i].text;
  assert.ok(html.includes('speaker-name')&&html.includes('mobile-dialogue-tap'));
  if(i<d.morning)continue;
  if(/そのとき、モクが部屋に入って|そこへモクが顔を出した|数日後。|数か月後。/.test(text))present=true;
  if(/モクは悲鳴を上げ、部屋から逃げ出した|モクは勢いよく扉を閉めた|それから数週間。/.test(text))present=false;
  assert.equal(html.includes('data-character="hostess"'),false,text);
  assert.equal(html.includes('data-character="cat"'),present,text);
  if(i===d.morning)assert.equal(d.silent,true);
 }
 assert.equal(JSON.stringify(event),before,'dialogue, saved indices and voice keys are untouched');
 assert.ok(actTwoMorningStageHTML(event,[],0).includes('assets/apartments.png'));
 assert.ok(actTwoMorningStageHTML(event,[],actTwoMorningDirection(event).fade).includes('first-fire-corridor.png'));
 assert.ok(actTwoMorningStageHTML(event,[],lines.length-1).includes('assets/apartments.png'));
});

test('forced tragedy and other replies keep their existing direction',()=>{
 const state=beginActTwo(createGame(42));Object.assign(state.actOne,{started:true,titlePending:false,prologuePending:false});advanceActTwo(state,100);
 const event=answerActTwo(state,state.actOne.pending.eventId,'guarantee');
 assert.equal(actTwoMorningDirection(event),null);
 assert.equal(actTwoMorningDirection({actScene:'bag',lines:[{text:'翌朝。チュン'}]}),null);
});

test('black lasts one second, pauses out of view, completes once, and cancels safely',async()=>{
 let resolve,reject,listener,options,done=0,paused=0,played=0,cancelled=0;
 const doc={hidden:true,addEventListener:(type,fn)=>listener=fn,removeEventListener:()=>listener=null};
 const animation={finished:new Promise((yes,no)=>{resolve=yes;reject=no;}),pause:()=>paused++,play:()=>played++,cancel:()=>cancelled++};
 const root={ownerDocument:doc,animate:(frames,opts)=>{assert.deepEqual(frames,[{opacity:1},{opacity:1}]);options=opts;return animation;}};
 const dispose=startMorningBlackout(root,()=>done++);
 assert.equal(options.duration,1000);assert.equal(paused,1);
 doc.hidden=false;listener();assert.equal(played,1);
 resolve();await Promise.resolve();assert.equal(done,1);assert.equal(listener,null);
 dispose();assert.equal(done,1);assert.ok(cancelled>=1);
 animation.finished=new Promise((yes,no)=>{reject=no;});
 const cancel=startMorningBlackout(root,()=>done++);cancel();reject(new Error('cancelled'));await Promise.resolve();assert.equal(done,1);
});


test('morning transitions show story prose instead of screen direction, including old saves',()=>{
 for(const text of ['ルナが意味ありげに微笑む。画面がゆっくり暗転する。','二人は大家の部屋へ。扉が閉まり、画面が暗転する。']){
  const event={actScene:'reply',detail:text,lines:[{speaker:'narrator',text}]};
  const lines=eventConversation(event);
  assert.equal(lines.length,1);assert.ok(!lines[0].text.includes('画面'));
  assert.equal(event.lines[0].text,text);
 }
 for(const id of ['guarantee','return']){
  const choice=ACT_TWO_EVENTS.bag.choices.find(c=>c.id===id);
  assert.ok(!choice.lines.some(l=>/画面.*暗転/.test(l.text)));
 }
});

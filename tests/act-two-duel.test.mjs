import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {createGame,validateSave} from '../src/simulation.js';
import {validActOne} from '../src/act-one.js';
import {beginActTwo,advanceActTwo,answerActTwo,rewindActTwo,actTwoChoices} from '../src/act-two.js';
import {DUEL_ART,DUEL_INTRO,DUEL_ROUNDS,duelChoices} from '../src/act-two-duel.js';
import {duelStageHTML,duelFrame,duelChoiceHTML,mountDuelPlayback} from '../src/act-two-duel-stage.js';
import {eventConversation} from '../src/event-stage.js';
import {storyCheckpointTarget} from '../src/story-checkpoints.js';

function duelStart(){
 const s=beginActTwo(createGame(42));Object.assign(s.actOne,{started:true,titlePending:false,prologuePending:false});
 advanceActTwo(s,100);answerActTwo(s,s.actOne.pending.eventId,'loan');
 advanceActTwo(s,100);answerActTwo(s,s.actOne.pending.eventId,'refuse');advanceActTwo(s,100);
 return s;
}
test('81 routes preserve saves at every round, resolve only after four enemies, and reach all outcomes',()=>{
 const counts={clear:0,yandere:0,domination:0};let ultimateSafe=0;
 for(let pattern=0;pattern<81;pattern++){
  let s=duelStart(),digits=pattern;
  for(let round=0;round<4;round++){
   const index=digits%3;digits=Math.floor(digits/3);
   assert.equal(s.actOne.duel.round,round);assert.equal(s.actOne.status,'playing');assert.equal(s.ending,null);
   assert.equal(actTwoChoices(s,'duel').length,3);
   const id=duelChoices(round)[index].id,pending=s.actOne.pending.eventId;
   const reply=answerActTwo(s,pending,id);assert.ok(reply);
   assert.equal(answerActTwo(s,pending,id),null,'stale event cannot apply damage twice');
   assert.ok(s.actOne.duel.hearts>=0&&s.actOne.duel.hearts<=10);
   assert.ok(validateSave(s)&&validActOne(s),`valid save pattern ${pattern}, round ${round}`);
   s=JSON.parse(JSON.stringify(s));
  }
  const outcome=s.actOne.duel.outcome;counts[outcome]++;
  if(outcome==='clear'){
   if(s.actOne.duel.history[3].choice==='ultimate')ultimateSafe++;
   advanceActTwo(s,100);assert.equal(s.actOne.status,'clear');assert.equal(s.hour,105);assert.ok(validActOne(s));
  }else{
   assert.equal(storyCheckpointTarget(s).hour,84);
   const next=rewindActTwo(s);assert.equal(next.hour,84);assert.deepEqual(next.actOne.completed,['bag','contract']);
   assert.equal(next.actOne.duel.hearts,0);assert.ok(validActOne(next)&&validateSave(next));
   next.actOne.rewindIntroPending=false;advanceActTwo(next,1);
   assert.equal(next.actOne.pending.scene,'duel');assert.equal(next.actOne.duel.round,0);
  }
 }
 assert.ok(counts.clear&&counts.yandere&&counts.domination);assert.ok(ultimateSafe,'ultimate is not an automatic BAD');
 console.log('Four-round route counts:',counts);
});

test('saved transcript keeps enemies gone after impact and hearts hidden until Luna reacts',()=>{
 const s=duelStart();
 for(const choice of ['vow','receipt','sleep','ultimate']){
  const original=s.events.find(e=>e.id===s.actOne.pending.eventId),at=eventConversation(original).length-1;
  assert.equal(duelFrame(original,at).defeated,false,'next opponent is visible');
  const before=s.actOne.duel.hearts;
  const reply=answerActTwo(s,original.id,choice),lines=eventConversation(reply);
  const impact=lines.findIndex(l=>l.duelAttack),reaction=lines.findIndex(l=>l.duelHeartUpdate);
  for(let i=0;i<reaction;i++)assert.equal(duelFrame(reply,i).hearts,before);
  assert.equal(duelFrame(reply,reaction).hearts,s.actOne.duel.hearts);
  assert.equal(duelFrame(reply,0).entrance,false,'answer never replays enemy arrival');
  assert.doesNotMatch(duelStageHTML(reply,s.residents,impact),/duel-arriving/);
  for(let i=impact+1;i<lines.length&&lines[i].duelRound===lines[impact].duelRound;i++){
   assert.equal(duelFrame(reply,i).defeated,true,'retreat is permanent within this encounter');
   assert.match(duelStageHTML(reply,s.residents,i),/duel-enemy duel-defeated/);
  }
  const restored=JSON.parse(JSON.stringify(reply));
  assert.deepEqual(duelFrame(restored,reaction),duelFrame(reply,reaction));
 }
});

test('dedicated commands keep existing ids, repeat history, and reserve gold for the final move',()=>{
 for(let round=0;round<4;round++){
  const choices=duelChoices(round),html=duelChoiceHTML({id:42},choices,new Set(['duel:'+choices[1].id]));
  for(const choice of choices)assert.ok(html.includes(`data-choice="${choice.id}"`));
  assert.equal((html.match(/data-case-event="42"/g)||[]).length,3);
  assert.match(html,/選択済/);assert.equal(html.includes('duel-ultimate'),round===3);
  assert.doesNotMatch(html,/ヤンデレ|BAD|2〜9|ハート.*[+-][137]/,'does not disclose the ending trick');
 }
});

test('attack montage pauses for hidden tabs and menus, cancels stale callbacks, and leaves choices manual',()=>{
 let id=0,advances=0,blocked=true;const timers=new Map();
 const options={advance:()=>advances++,blocked:()=>blocked,schedule:fn=>{timers.set(++id,fn);return id;},cancel:id=>timers.delete(id)};
 const tick=()=>{const [id,fn]=timers.entries().next().value;timers.delete(id);fn();};
 const stop=mountDuelPlayback({duelAttack:'モク出動！'},options);
 tick();assert.equal(advances,0);assert.equal(timers.size,1);
 blocked=false;tick();assert.equal(advances,1);assert.equal(timers.size,0);stop();
 const cancel=mountDuelPlayback({duelPlayback:true},options),stale=[...timers.values()][0];
 cancel();assert.equal(timers.size,0);stale();assert.equal(advances,1);
 mountDuelPlayback({duelRound:1,text:'会話'},options);assert.equal(timers.size,0);
 mountDuelPlayback({duelEnding:'clear',duelDefeated:true},options);assert.equal(timers.size,0);
});
test('approved opening, supplied corrected art, ten hearts, original dialogue window and distinct ending CGs',()=>{
 assert.deepEqual(DUEL_INTRO.slice(0,6).map(l=>l.text),['大家さ〜ん♡ ちょっとお願いがあるんだけど','……嫌な予感しかしねぇ。','今日だけ、あたしの彼氏になってくれない？','はぁ！？ 昨日も似たようなことやっただろ！！','昨日は昨日。今日は今日♡','大家、彼氏のアルバイト始めたニャ？']);
 for(const path of Object.values(DUEL_ART))assert.ok(existsSync(path),path);
 const s=duelStart(),e=s.events.find(e=>e.id===s.actOne.pending.eventId),index=eventConversation(e).length-1;
 const html=duelStageHTML(e,s.residents,index);
 assert.match(html,/stage-bubble/);assert.match(html,/stage-speaker/);assert.match(html,/duel-field/);
 assert.equal((html.match(/aria-hidden="true">♥/g)||[]).length,10);
 for(const id of ['vow','shield','future','ultimate'])answerActTwo(s,s.actOne.pending.eventId,id);
 const last=s.events.find(e=>e.duelOutcome==='yandere'),lines=eventConversation(last),at=lines.findIndex(l=>l.duelEnding);
 assert.match(duelStageHTML(last,s.residents,at),/assets\/events\/duel\/yandere.png/);
 assert.equal(DUEL_ROUNDS.length,4);
});

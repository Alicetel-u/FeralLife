import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {createGame,validateSave} from '../src/simulation.js';
import {validActOne} from '../src/act-one.js';
import {beginActTwo,advanceActTwo,answerActTwo,rewindActTwo,actTwoChoices} from '../src/act-two.js';
import {DUEL_ART,DUEL_INTRO,DUEL_ROUNDS,duelChoices} from '../src/act-two-duel.js';
import {duelStageHTML} from '../src/act-two-duel-stage.js';
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

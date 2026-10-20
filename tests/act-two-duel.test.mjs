import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createGame,validateSave} from '../src/simulation.js';
import {validActOne} from '../src/act-one.js';
import {beginActTwo,advanceActTwo,answerActTwo,rewindActTwo,actTwoChoices,refreshDuelYandereEnding} from '../src/act-two.js';
import {DUEL_ART,DUEL_INTRO,DUEL_ROUNDS,duelChoices,duelReplyLines,duelEndingLines} from '../src/act-two-duel.js';
import {duelStageHTML,duelFrame,duelChoiceHTML,mountDuelPlayback,duelReadDelay} from '../src/act-two-duel-stage.js';
import {messagePages} from '../src/message-pages.js';
import {eventConversation} from '../src/event-stage.js';
import {storyCheckpointTarget} from '../src/story-checkpoints.js';
import {rewindBeat,rewindTransitionHTML} from '../src/rewind-transition.js';

function duelStart(){
 const s=beginActTwo(createGame(42));Object.assign(s.actOne,{started:true,titlePending:false,prologuePending:false});
 advanceActTwo(s,100);answerActTwo(s,s.actOne.pending.eventId,'loan');
 advanceActTwo(s,100);
 return s;
}

test('all twelve answers give the three characters distinct exchanges with stable playback markers',()=>{
 const spoken={hostess:new Set(),cat:new Set(),manager:new Set()},assists=new Set();
 for(let round=0;round<4;round++)for(const choice of duelChoices(round)){
  const lines=duelReplyLines(round,choice),weak=choice.delta<0;
  assert.equal(lines.length,weak?7:5,'keep the existing conversation pace');
  assert.ok(lines.every(line=>line.duelRound===round&&typeof line.text==='string'&&line.text.length));
  assert.equal(lines.filter(line=>line.duelDefeated).length,1);
  assert.equal(lines.filter(line=>line.duelHeartUpdate).length,1);
  assert.deepEqual(JSON.parse(JSON.stringify(lines)),lines,'saved dialogue needs no random state');
  const reaction=lines.find(line=>line.duelHeartUpdate);
  assert.equal(reaction.speaker,'hostess');
  assert.equal(reaction.emotion,weak?'tired':choice.delta>=3?'shy':'neutral');
  for(const speaker of Object.keys(spoken)){
   const line=lines.filter(line=>line.speaker===speaker).at(-1);
   assert.ok(!spoken[speaker].has(line.text),`${speaker} repeats across answers`);
   spoken[speaker].add(line.text);
  }
  if(weak){
   const attack=lines.find(line=>line.duelAttack);
   assert.equal(attack.speaker,'cat');assert.equal(attack.text,attack.duelAttack);
   assert.ok(!assists.has(attack.text));assists.add(attack.text);
  }
 }
 for(const speeches of Object.values(spoken))assert.equal(speeches.size,12);
 assert.equal(assists.size,4);
});
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
   const next=rewindActTwo(s);assert.equal(next.hour,84);assert.deepEqual(next.actOne.completed,['bag']);
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
 const last=s.events.find(e=>e.duelOutcome==='yandere'),lines=eventConversation(last),at=lines.findIndex(l=>l.duelEndingPhase==='reveal');
 assert.match(duelStageHTML(last,s.residents,at),/assets\/events\/duel\/yandere.png/);
 assert.equal(DUEL_ROUNDS.length,4);
});

test('Luna high-heart BAD develops through ordinary scenes and reserves the CG for its final reveal',()=>{
 const s=duelStart();
 for(const id of ['vow','shield','future','ultimate'])answerActTwo(s,s.actOne.pending.eventId,id);
 const ending=s.events.find(e=>e.duelOutcome==='yandere'),lines=eventConversation(ending);
 const phases=[...new Set(lines.map(l=>l.duelEndingPhase).filter(Boolean))];
 assert.deepEqual(phases,['day-1','day-2','day-3','day-4','day-5','reveal']);
 const start=lines.findIndex(l=>l.duelEnding),reveal=lines.findIndex(l=>l.duelEndingPhase==='reveal');
 assert.equal(reveal-start,10,'five daily exchanges precede the final image');
 assert.equal(lines.length-reveal,3,'the final three-line exchange uses the yandere CG');
 for(let index=start;index<lines.length;index++)for(let page=0;page<messagePages(lines[index].text).length;page++){
  const html=duelStageHTML(ending,s.residents,index,page);
  assert.match(html,/stage-bubble/);assert.match(html,/stage-speaker/);
  assert.doesNotMatch(html,/duel-enemy|duel-hud|duel-result/);
  if(index<reveal){assert.doesNotMatch(html,/assets\/events\/duel\/yandere.png/);assert.match(html,/data-character="hostess"/);}
  else {assert.match(html,/assets\/events\/duel\/yandere.png/);assert.doesNotMatch(html,/stage-character/);}
 }
 const restored=JSON.parse(JSON.stringify(s)),saved=restored.events.find(e=>e.id===ending.id);
 for(const phase of phases){
  const at=lines.findIndex(l=>l.duelEndingPhase===phase);
  assert.equal(duelStageHTML(saved,restored.residents,at),duelStageHTML(ending,s.residents,at));
 }
 assert.equal(s.hour,84,'bad-ending passage of days never changes the rewind checkpoint');
 assert.equal(storyCheckpointTarget(s).hour,84);
 assert.deepEqual(rewindActTwo(s).actOne.completed,['bag']);
 const legacy={duel:true,detail:'過去の会話',lines:[{speaker:'hostess',text:'過去の会話',duelEnding:'yandere'}]};
 assert.match(duelStageHTML(legacy,[]),/assets\/events\/duel\/yandere.png/,'old saved transcripts remain readable');
 for(const outcome of ['clear','domination'])assert.ok(duelEndingLines(outcome).every(l=>!l.duelEndingPhase));
});

test('unfinished legacy yandere saves resume the expanded ending without replaying fights or losing earlier incidents',()=>{
 for(const cursorInEnding of [false,true]){
  const s=duelStart();for(const id of ['vow','shield','future','ultimate'])answerActTwo(s,s.actOne.pending.eventId,id);
  const event=s.events.find(e=>e.duelOutcome==='yandere'),start=event.lines.findIndex(l=>l.duelEnding);
  const prefix=JSON.stringify(event.lines.slice(0,start)),history=JSON.stringify(s.actOne.duel.history),checkpoint=JSON.stringify(s.actOne.rollbackPoint);
  event.lines=[...event.lines.slice(0,start),{speaker:'hostess',text:'これで邪魔する人はいないね。',duelEnding:'yandere'},{speaker:'manager',text:'……ルナ？',duelEnding:'yandere'}];
  Object.assign(s.actOne.duel,{eventId:event.id,cursor:cursorInEnding?start+1:0,page:0});
  const restored=JSON.parse(JSON.stringify(s));assert.equal(refreshDuelYandereEnding(restored),true);
  const updated=restored.events.find(e=>e.id===event.id);
  assert.equal(JSON.stringify(updated.lines.slice(0,start)),prefix);
  assert.equal(updated.lines[start].duelEndingPhase,'day-1');
  assert.equal(restored.actOne.duel.cursor,cursorInEnding?start:0);
  assert.equal(JSON.stringify(restored.actOne.duel.history),history);
  assert.equal(JSON.stringify(restored.actOne.rollbackPoint),checkpoint);
  assert.ok(validateSave(restored)&&validActOne(restored));assert.equal(refreshDuelYandereEnding(restored),false);
  s.actOne.duel.dialogueComplete=true;assert.equal(refreshDuelYandereEnding(s),false);
 }
});

test('each opponent gets one result stamp, including paginated defeats and the final victory dialogue',()=>{
 const s=duelStart();
 for(const id of ['vow','shield','future','ultimate']){
  const reply=answerActTwo(s,s.actOne.pending.eventId,id),lines=eventConversation(reply);
  let stamps=0;
  for(let index=0;index<lines.length;index++)for(let page=0;page<messagePages(lines[index].text).length;page++){
   const html=duelStageHTML(reply,s.residents,index,page);
   stamps+=(html.match(/class="duel-result"/g)||[]).length;
   if(lines[index].duelHeartUpdate)assert.doesNotMatch(html,/class="duel-result"/);
  }
  assert.equal(stamps,1,`one stamp for ${id}`);
 }
});

test('all twelve commands are spoken exactly once and attack bubbles use the spoken wording',()=>{
 for(let round=0;round<4;round++)for(const choice of duelChoices(round)){
  const lines=duelReplyLines(round,choice);
  assert.equal(lines.filter(l=>l.speaker==='manager'&&l.text===choice.label).length,1);
  assert.equal(lines[0].text,choice.label);
  for(const line of lines.filter(l=>l.duelAttack))assert.equal(line.duelAttack,line.text);
  if(choice.delta>=0)assert.equal(lines.filter(l=>l.speaker==='manager'&&l.duelAttack).length,1);
 }
 for(const round of DUEL_ROUNDS)for(const line of round.lines.filter(l=>l.speaker==='manager')){
  assert.match(line.text,/誰|？/,'pre-choice landlord lines only ask questions, not settle the argument');
 }
});

test('real dialogue advance rejects rapid taps for 650ms on every duel page and 1400ms on attacks',()=>{
 const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 const source=app.slice(app.indexOf('function advanceConversation(){'),app.indexOf("modal.addEventListener('click',e=>{"));
 let time=0,shown=0;
 const event={id:1,duel:true,detail:'一行目',lines:[{text:'一行目'},{text:'二行目'},{text:'三行目'}]};
 const context={state:{events:[event]},eventView:{id:1,index:0,page:0},eventConversation,messagePages,
  modal:{open:true,classList:{contains:c=>c==='conversation-modal'},querySelector:sel=>sel==='.event-menu'?{hidden:true}:null},
  showEvent(id,index,page=0){shown++;context.eventView={id,index,page};context.cleanupDuelPlayback=mountDuelPlayback(event.lines[index],{advance(){},blocked:()=>false,now:()=>time});}};
 context.cleanupDuelPlayback=mountDuelPlayback(event.lines[0],{advance(){},blocked:()=>false,now:()=>time});
 vm.createContext(context);vm.runInContext(source,context);
 for(time=0;time<650;time+=100)assert.equal(context.advanceConversation(),false);
 time=650;assert.equal(context.advanceConversation(),true);assert.equal(shown,1);
 for(let i=0;i<5;i++)assert.equal(context.advanceConversation(),false);
 time=1300;assert.equal(context.advanceConversation(),true);assert.equal(shown,2);
 time=0;
 const stop=mountDuelPlayback({text:'こいつの明日は、俺が守る！',duelAttack:true},{advance(){},blocked:()=>false,now:()=>time,schedule:()=>1,cancel(){}});
 time=1399;assert.equal(stop.canAdvance(),false);time=1400;assert.equal(stop.canAdvance(),true);stop();assert.equal(stop.canAdvance(),false);
 assert.ok(duelReadDelay({text:'忘れ物だけ返せ。今の暮らしは本人が決める！'})>=1800);
});

test('only the yandere rewind gives the landlord a hint about affection and boundaries',()=>{
 for(const [choices,hint] of [[['vow','shield','future','ultimate'],true],[['help','discount','sleep','catapult'],false]]){
  const s=duelStart();for(const id of choices)answerActTwo(s,s.actOne.pending.eventId,id);
  assert.equal(s.actOne.status,'bad');
  const next=rewindActTwo(s),lines=next.events.find(e=>e.actScene==='act2-rewind').lines;
  const thought=lines.find(line=>line.text.includes('気持ちが高まりすぎると'));
  assert.equal(!!thought,hint);
  if(hint){assert.equal(thought.innerVoice,true);assert.ok(lines.some(line=>line.innerVoice&&line.text.includes('期待させすぎない')));}
  assert.equal(next.hour,84);assert.deepEqual(next.actOne.completed,['bag']);
  assert.ok(validActOne(next)&&validateSave(next));
 }
});


test('yandere clock animation says landlord reaction, not other routes\' resolve',()=>{
 const clock=rewindBeat(4,2,true,2,'duel-yandere');
 assert.equal(clock.phase,'clock');
 assert.equal(clock.text,'ルナ……お前……');
 assert.notEqual(rewindBeat(4,2,true,2,'duel-domination').text,clock.text);
 assert.equal(rewindTransitionHTML('duel-yandere',2,true,2).includes('ルナ……お前……'),false,'do not reveal the line before clock phase');
});

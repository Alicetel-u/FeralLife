import test from 'node:test';
import assert from 'node:assert/strict';
import { createActOne,advanceActOne,answerActOne,ACT_ONE_EVENTS } from '../src/act-one.js';
import { beginActTwo,advanceActTwo,answerActTwo,ACT_TWO_EVENTS } from '../src/act-two.js';
import { eventStageHTML,eventConversation,eventEmotion } from '../src/event-stage.js';
import { EVENT_EXPRESSIONS } from '../src/character-art.js';

function expectExpression(event,text,emotion,residents,checkLegacy=true){
  const line=event.lines.find(l=>l.text===text);assert.ok(line,text);
  assert.equal(line.emotion,emotion,text);
  const cursor=eventConversation(event).indexOf(line);
  const html=eventStageHTML(event,residents,cursor);
  assert.ok(html.includes(`data-emotion="${emotion}" data-character="${line.speaker}"`),text);
  assert.ok(html.includes(EVENT_EXPRESSIONS[line.speaker][emotion]),text);
  if(checkLegacy){
    const oldEvent=JSON.parse(JSON.stringify(event));oldEvent.lines.forEach(l=>l.emotion='neutral');
    assert.equal(eventEmotion(oldEvent.lines.find(l=>l.text===text),oldEvent),emotion,'old save: '+text);
  }
}
function firstActComplete(){
  const s=createActOne(42,[],2,true);
  advanceActOne(s,100);answerActOne(s,s.actOne.pending.eventId,'water');
  advanceActOne(s,100);answerActOne(s,s.actOne.pending.eventId,'coronation');
  advanceActOne(s,100);return s;
}
test('first act epilogue changes expression through disbelief, exhaustion, anger and celebration',()=>{
  const s=firstActComplete(),e=s.events.find(e=>e.actScene==='epilogue');
  for(const [text,emotion] of [['ニャ？ 誰がニャ？','surprised'],['昨日の夜から起きてるから、まだ昨日ニャ。','tired'],['気持ち悪いニャ。','angry'],['大家。歓迎会するニャ？','happy']])expectExpression(e,text,emotion,s.residents);
});
test('second act first incident and successful answer show both residents reacting',()=>{
  const s=firstActComplete();beginActTwo(s);s.actOne.started=true;s.actOne.prologuePending=false;
  advanceActTwo(s,100);
  // The revised incident has explicit emotions from its first release; these
  // new lines never existed in the older neutral-only saves.
  const incident=s.events.find(e=>e.id===s.actOne.pending.eventId);
  for(const [text,emotion] of [['……っ！','surprised'],['……なんで……ここが……。','surprised'],['……お願い。もう帰って。','sad']])expectExpression(incident,text,emotion,s.residents,false);
  const reply=answerActTwo(s,s.actOne.pending.eventId,'loan');
  for(const [text,emotion] of [['忘れるなニャ！！','angry'],['……ふふっ。そうなの、この人が今の彼氏♡','happy'],['……大家さん、ありがとう。でも、あの人だけじゃ終わらないと思う。','sad'],['……今は、まだ話せない。','sad']])expectExpression(reply,text,emotion,s.residents,false);
  advanceActTwo(s,100);answerActTwo(s,s.actOne.pending.eventId,'refuse');advanceActTwo(s,100);
  expectExpression(s.events.find(e=>e.actScene==='act2-epilogue'),'大家、酒はまだかニャ？','happy',s.residents);
});
test('all chapter choices have available portraits, preserve deliberate neutral lines and explicit emotions',()=>{
  for(const events of [ACT_ONE_EVENTS,ACT_TWO_EVENTS])for(const event of Object.values(events))for(const lines of [event.lines,...event.choices.map(c=>c.lines)])for(const line of lines){
    if(EVENT_EXPRESSIONS[line.speaker])assert.ok(EVENT_EXPRESSIONS[line.speaker][line.emotion],line.text);
  }
  assert.equal(eventEmotion({speaker:'cat',emotion:'neutral',text:'灰皿いっぱいになったニャ。'},{actScene:'ash',stageOnly:true}),'neutral');
  assert.equal(eventEmotion({speaker:'cat',emotion:'shy',text:'……軽っ！？'},{actScene:'reply',stageOnly:true}),'shy');
  assert.equal(eventEmotion({speaker:'cat',emotion:'neutral',text:'……軽っ！？'},{}),'neutral');
});

test('chapter-two arrival starts with Luna bust alone, then Moku joins naturally',()=>{
  const state=firstActComplete();beginActTwo(state);
  const event=state.events.find(e=>e.actScene==='act2-prologue');
  const opening=eventStageHTML(event,state.residents,0);
  assert.ok(opening.includes('assets/events/busts/hostess-neutral.png'));
  assert.match(opening,/expression-art/);
  assert.doesNotMatch(opening,/data-character="cat"/);
  const lead=eventStageHTML(event,state.residents,event.revealCharacterAt-1);
  assert.doesNotMatch(lead,/data-character="cat"/);
  const entry=eventStageHTML(event,state.residents,event.revealCharacterAt);
  assert.match(entry,/data-character="cat"/);
  assert.ok(event.lines.some(line=>line.text.includes('101号室のドアが開いた')));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {createActOne,advanceActOne,answerActOne} from '../src/act-one.js';
import {eventStageHTML} from '../src/event-stage.js';
import {isFirstFireReply,firstFireCut,firstFireStageHTML} from '../src/first-fire-stage.js';

const tragedy=()=>{const s=createActOne(42,[],1,true);advanceActOne(s,100);return {event:answerActOne(s,s.actOne.pending.eventId,'trash'),act:s.actOne};};
test('only the first one-choice ash tragedy uses the directed sequence, including a restored save',()=>{
 const {event,act}=tragedy();assert.ok(isFirstFireReply(event,act));
 const saved=JSON.parse(JSON.stringify({event,act}));assert.ok(isFirstFireReply(saved.event,saved.act));
 assert.equal(isFirstFireReply(event,{...act,attempt:2}),false);
 assert.equal(isFirstFireReply(event,{...act,chapter:2}),false);
 assert.equal(isFirstFireReply({...event,actScene:'ash'},act),false);
 assert.equal(isFirstFireReply({...event,lines:[{text:'another reply'}]},act),false);
});
test('landlord exits before smoke, then approaches the blocked entrance without rescuing Moku',()=>{
 const {event}=tragedy(),cuts=event.lines.map((_,i)=>firstFireCut(event.lines,i));
 assert.deepEqual([...new Set(cuts)],['trust','departure','smoke','ignition','rush','blocked','collapse','plea','silence']);
 const before=JSON.stringify(event);
 for(const [i,line] of event.lines.entries()){
  const html=firstFireStageHTML(event,[],i);
  assert.equal(html.includes('first-fire-stage'),cuts[i]!=='trust');assert.ok(html.includes('aria-live="polite"'));
  assert.ok(html.includes(line.text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;')));
  if(cuts[i]!=='trust')assert.ok(!html.includes('data-character="cat"'));
  if(cuts[i]==='smoke')assert.ok(html.includes('けもの荘 · 屋外'));
  if(cuts[i]==='blocked')assert.ok(html.includes('first-fire-entrance.png'));

  assert.ok(!html.includes('assets/characters/manager'));
 }
 assert.equal(JSON.stringify(event),before,'direction never mutates script or voice identity');
 const last=event.lines.at(-1);assert.equal(firstFireCut(event.lines,event.lines.length-1),'silence');assert.equal(last.text,'返事はなかった。');
});

test('every cinematic line uses the original message window markup and controls',()=>{
 const {event}=tragedy();
 for(let i=0;i<event.lines.length;i++){
  const normal=eventStageHTML(event,[],i),cinematic=firstFireStageHTML(event,[],i);
  const message=html=>html.slice(html.indexOf('<div style="--speech-color:'));
  assert.equal(message(cinematic),message(normal),'message window must remain identical at line '+i);
  assert.ok(cinematic.includes('class="stage-speaker"'));
  assert.ok(cinematic.includes('class="speaker-name"'));
  assert.ok(cinematic.includes('mobile-dialogue-tap'));
  assert.ok(!cinematic.includes('first-fire-caption'));
 }
});

test('ordinary conversation after the choice keeps the entire normal UI until the landlord departs',()=>{
 const {event}=tragedy();
 const departure=event.lines.findIndex(l=>l.text.includes('その場を離れた'));
 assert.ok(departure>0);
 for(let i=0;i<departure;i++)assert.equal(firstFireStageHTML(event,[],i),eventStageHTML(event,[],i));
 assert.ok(firstFireStageHTML(event,[],departure).includes('data-cut="departure"'));
});

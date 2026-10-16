import test from 'node:test';
import assert from 'node:assert/strict';
import {createActOne,advanceActOne,answerActOne} from '../src/act-one.js';
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
  const html=firstFireStageHTML(event.lines,i,line.text);
  assert.ok(html.includes('first-fire-stage'));assert.ok(html.includes('aria-live="polite"'));
  assert.ok(html.includes(line.text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;')));
  if(cuts[i]!=='trust')assert.ok(!html.includes('first-fire-moku'));
  if(cuts[i]==='smoke')assert.ok(html.includes('けもの荘 · 屋外'));
  if(cuts[i]==='blocked')assert.ok(html.includes('first-fire-entrance.png'));
  if(line.speaker==='cat'&&cuts[i]!=='trust')assert.ok(html.includes('モク · 101号室の中'));
  assert.ok(!html.includes('assets/characters/manager'));
 }
 assert.equal(JSON.stringify(event),before,'direction never mutates script or voice identity');
 const last=event.lines.at(-1);assert.equal(firstFireCut(event.lines,event.lines.length-1),'silence');assert.equal(last.text,'返事はなかった。');
});

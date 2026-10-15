import test from 'node:test';import assert from 'node:assert/strict';
import{automaticFirstRewind,rewindBeat,rewindTransitionHTML,rewindClickAction}from'../src/rewind-transition.js';
import{createActOne,advanceActOne,answerActOne,rewindBeforeFire,validActOne}from'../src/act-one.js';
test('only the unavoidable first ash fire bypasses the results page and keeps checkpoint and memory',()=>{
 for(const answer of ['trash','balcony','freezer']){
  const s=createActOne(42,[],1,true);advanceActOne(s,100);answerActOne(s,s.actOne.pending.eventId,answer);assert.equal(automaticFirstRewind(s),true);
  const saved=JSON.parse(JSON.stringify(s));assert.equal(automaticFirstRewind(saved),true);
  const next=rewindBeforeFire(saved);assert.equal(next.hour,17);assert.equal(next.actOne.attempt,2);assert.ok(next.actOne.memory.includes(s.actOne.failure));assert.ok(validActOne(next));
  assert.equal(automaticFirstRewind({...s,actOne:{...s.actOne,attempt:2}}),false);assert.equal(automaticFirstRewind({...s,actOne:{...s.actOne,chapter:2}}),false);
 }
});
test('after-fire transition starts in darkness, retains its plea, then reverses clock without a second fire',()=>{
 assert.equal(rewindBeat(0,1,true).phase,'dark');assert.match(rewindBeat(0,1,true).text,/もう一度/);assert.equal(rewindBeat(2.5,1,true).phase,'clock');assert.equal(rewindBeat(8,1,true).finished,true);
 assert.match(rewindTransitionHTML('ash-trash',1,true),/data-rewind-phase="dark"/);assert.match(rewindTransitionHTML('ash-trash',1,true),/data-after-fire/);assert.equal(rewindBeat(0,2).phase,'fire');
});
test('rewind clicks cannot bypass the clock and restored dialogue remains pending',()=>{
 assert.equal(rewindClickAction('ash-trash',1,'dark'),'clock');
 assert.equal(rewindClickAction('ash-trash',1,'clock'),'finish');
 assert.equal(rewindClickAction('bag-return',1,'dark'),'clock');
 const s=createActOne(42,[],1,true);advanceActOne(s,100);answerActOne(s,s.actOne.pending.eventId,'trash');
 const next=rewindBeforeFire(s),e=next.events.find(e=>e.actScene==='rewind');
 assert.equal(next.actOne.rewindIntroPending,true);
 assert.ok(e.lines.some(l=>l.text.includes('さっきまで火事で')));
 assert.ok(e.lines.some(l=>l.innerVoice&&l.text.includes('戻ってる？ 時間が')));
});

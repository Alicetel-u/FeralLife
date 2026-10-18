import test from 'node:test';
import assert from 'node:assert/strict';
import { debtEndingHTML,startDebtEnding } from '../src/debt-ending.js';

test('debt cinematic distinguishes sale and seizure with a bounded number of papers',()=>{
  assert.match(debtEndingHTML('bag-loan'),/SOLD OUT/);
  assert.match(debtEndingHTML('contract-sign'),/差 押/);
  assert.equal((debtEndingHTML('bag-loan').match(/--paper:/g)||[]).length,10);
  assert.doesNotMatch(debtEndingHTML('bag-loan'),/<canvas|<button|data-debt-finish/);
});
test('cinematic pauses when hidden, finishes once, and removes listeners on disposal',async()=>{
  const doc=new EventTarget();doc.hidden=false;
  const button=new EventTarget();button.focus=()=>{};
  let resolve,played=0,paused=0,cancelled=0,done=0;
  const animation={finished:new Promise(r=>resolve=r),play:()=>played++,pause:()=>paused++,cancel:()=>cancelled++};
  const root={ownerDocument:doc,querySelector:()=>button,classList:{toggle(){}},animate:()=>animation};
  const stop=startDebtEnding(root,()=>done++);
  doc.hidden=true;doc.dispatchEvent(new Event('visibilitychange'));assert.equal(paused,1);
  doc.hidden=false;doc.dispatchEvent(new Event('visibilitychange'));assert.equal(played,2);
  button.dispatchEvent(new Event('click'));assert.equal(done,0);resolve();await Promise.resolve();assert.equal(done,1);
  stop();button.dispatchEvent(new Event('click'));assert.equal(done,1);
  const before=paused;doc.hidden=true;doc.dispatchEvent(new Event('visibilitychange'));assert.equal(paused,before);assert.ok(cancelled>0);
});

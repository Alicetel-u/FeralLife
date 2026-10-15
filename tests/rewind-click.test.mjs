import test from 'node:test';
import assert from 'node:assert/strict';
import {rewindTransitionHTML,startRewindTransition} from '../src/rewind-transition.js';

test('second act rewind shows clock and restored apartment without replaying fire',()=>{
  const html=rewindTransitionHTML('contract-sign',1,true,2);
  assert.match(html,/rewind-clock-dial/);
  assert.match(html,/data-rewind-phase="dark"/);
  assert.match(html,/src="assets\/apartments.png"/);
  assert.doesNotMatch(html,/fire-cinematic|fire-canvas/);
});
test('click anywhere completes rewind once; disposal removes click listener and cancels frames',()=>{
  const originals={matchMedia:globalThis.matchMedia,requestAnimationFrame:globalThis.requestAnimationFrame,cancelAnimationFrame:globalThis.cancelAnimationFrame};
  let cancelled=0;
  globalThis.matchMedia=()=>({matches:false});
  globalThis.requestAnimationFrame=()=>123;
  globalThis.cancelAnimationFrame=()=>cancelled++;
  try{
    const root=new EventTarget();root.querySelector=()=>({focus(){}});
    let done=0;
    const stop=startRewindTransition(root,'bag-return',()=>done++,false,1,57,true);
    root.dispatchEvent(new Event('click'));root.dispatchEvent(new Event('click'));
    assert.equal(done,1);assert.equal(cancelled,1);
    stop();root.dispatchEvent(new Event('click'));assert.equal(done,1);
    const dispose=startRewindTransition(root,'contract-sign',()=>done++,false,2,62,true);
    dispose();root.dispatchEvent(new Event('click'));assert.equal(done,1);
  }finally{Object.assign(globalThis,originals);}
});

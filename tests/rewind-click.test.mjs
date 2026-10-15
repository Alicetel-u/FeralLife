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
test('the skip button completes rewind once; disposal removes that listener and cancels frames',()=>{
  const originals={matchMedia:globalThis.matchMedia,requestAnimationFrame:globalThis.requestAnimationFrame,cancelAnimationFrame:globalThis.cancelAnimationFrame,document:globalThis.document,now:performance.now};
  let cancelled=0,now=0;
  globalThis.matchMedia=()=>({matches:false});
  globalThis.requestAnimationFrame=()=>123;
  globalThis.cancelAnimationFrame=()=>cancelled++;
  globalThis.document={hidden:false};
  performance.now=()=>now;
  try{
    const node=()=>{const el=new EventTarget();el.focus=()=>{};el.style={setProperty(){}};el.classList={toggle(){}};el.dataset={};return el;};
    const skip=node();
    const root=new EventTarget();root.isConnected=true;root.dataset={};root.querySelector=selector=>selector==='[data-rewind-skip]'?skip:node();
    let done=0;
    const stop=startRewindTransition(root,'bag-return',()=>done++,false,1,57,true);
    skip.dispatchEvent(new Event('click'));
    assert.equal(done,0);
    now=400;
    skip.dispatchEvent(new Event('click'));
    assert.equal(done,1);assert.ok(cancelled>=1);
    stop();skip.dispatchEvent(new Event('click'));assert.equal(done,1);
    const dispose=startRewindTransition(root,'contract-sign',()=>done++,false,2,62,true);
    dispose();skip.dispatchEvent(new Event('click'));assert.equal(done,1);
  }finally{Object.assign(globalThis,originals);performance.now=originals.now;}
});

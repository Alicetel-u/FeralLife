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

test('first rewind has no skip; later rewinds have skip and continue prompt',()=>{
  assert.doesNotMatch(rewindTransitionHTML('ash-trash',1,true,1),/data-rewind-skip/);
  assert.match(rewindTransitionHTML('ash-trash',2,true,1),/data-rewind-skip/);
  assert.match(rewindTransitionHTML('ash-trash',2,true,1),/rewind-white-fade/);
});

test('later rewind can skip, but its exit uses the white fade',()=>{
  const originals={matchMedia:globalThis.matchMedia,requestAnimationFrame:globalThis.requestAnimationFrame,cancelAnimationFrame:globalThis.cancelAnimationFrame,document:globalThis.document,now:performance.now,CustomEvent:globalThis.CustomEvent};
  let now=0,frame=()=>{},done=0;
  globalThis.matchMedia=()=>({matches:false});
  globalThis.requestAnimationFrame=callback=>{frame=callback;return 123;};
  globalThis.cancelAnimationFrame=()=>{};
  globalThis.document={hidden:false};
  globalThis.CustomEvent=class extends Event{constructor(type,options){super(type,options);this.detail=options?.detail;}};
  performance.now=()=>now;
  try{
    const node=()=>{const el=new EventTarget();el.focus=()=>{};el.style={setProperty(){}};el.classList={toggle(){},add(){}};el.dataset={};return el;};
    const skip=node();skip.closest=selector=>selector==='[data-rewind-skip]'?skip:null;
    const root=new EventTarget();root.isConnected=true;root.dataset={};root.classList={add(v){root.fading=v;}};root.querySelector=selector=>selector==='[data-rewind-skip]'?skip:node();
    const stop=startRewindTransition(root,'bag-return',()=>done++,false,2,57,true);
    const skipClick=new Event('click',{bubbles:true});
    Object.defineProperty(skipClick,'target',{get(){return skip;}});
    root.dispatchEvent(skipClick);
    root.dispatchEvent(new Event('click'));
    assert.equal(done,0);
    assert.equal(root.fading,'rewind-fading');
    for(let n=0;n<12;n++){now+=100;frame(now);}
    assert.equal(done,1);
    stop();assert.equal(done,1);
  }finally{Object.assign(globalThis,originals);performance.now=originals.now;}
});

test('first rewind waits for the complete clock track before fading automatically',()=>{
  const originals={matchMedia:globalThis.matchMedia,requestAnimationFrame:globalThis.requestAnimationFrame,cancelAnimationFrame:globalThis.cancelAnimationFrame,document:globalThis.document,now:performance.now,CustomEvent:globalThis.CustomEvent};
  let now=0,frame=()=>{},done=0;
  globalThis.matchMedia=()=>({matches:false});
  globalThis.requestAnimationFrame=callback=>{frame=callback;return 123;};
  globalThis.cancelAnimationFrame=()=>{};
  globalThis.document={hidden:false};
  globalThis.CustomEvent=class extends Event{constructor(type,options){super(type,options);this.detail=options?.detail;}};
  performance.now=()=>now;
  try{
    const node=()=>{const el=new EventTarget();el.style={setProperty(){}};el.classList={toggle(){},add(){}};el.dataset={};el.focus=()=>{};return el;};
    const root=new EventTarget();root.isConnected=true;root.dataset={};root.classList={add(v){root.fading=v;}};root.querySelector=selector=>selector==='[data-rewind-skip]'?null:node();
    const minute=node(),hour=node(),clock=node();
    root.querySelector=selector=>selector==='[data-rewind-skip]'?null:selector==='.rewind-hand.minute'?minute:selector==='.rewind-hand.hour'?hour:clock;
    const audio={ended:false,paused:false};
    const stop=startRewindTransition(root,'ash-trash',()=>done++,true,1,23,true,audio);
    root.dispatchEvent(new Event('click'));
    for(let n=0;n<170;n++){now+=100;frame(now);}
    assert.equal(done,0);
    assert.equal(root.fading,undefined);
    assert.equal(hour.style.transform,'rotate(330deg)');
    assert.equal(minute.style.transform,'rotate(-1440deg)');
    audio.ended=true;
    for(let n=0;n<14;n++){now+=100;frame(now);}
    assert.equal(done,1);
    assert.equal(root.fading,'rewind-fading');
    stop();
  }finally{Object.assign(globalThis,originals);performance.now=originals.now;}
});

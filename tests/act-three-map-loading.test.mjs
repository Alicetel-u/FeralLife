import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {prepareActThreeMapAssets} from '../src/act-three-map.js';

test('map assets decode once across the clock handoff; a failed asset can be retried',async()=>{
 const previous=globalThis.Image,images=[];let decodeReady;
 const decoding=new Promise(resolve=>decodeReady=resolve);
 globalThis.Image=class{constructor(){images.push(this);}set src(value){this.source=value;}decode(){return decoding;}};
 try{
  const first=prepareActThreeMapAssets(),count=images.length;
  assert.ok(count>10);
  const shared=prepareActThreeMapAssets();assert.equal(images.length,count);
  let settled=false;first.then(()=>{settled=true;},()=>{});
  for(const image of images)image.onload();
  await new Promise(resolve=>setImmediate(resolve));assert.equal(settled,false,'Image load alone must not expose undecoded art');
  decodeReady();await Promise.all([first,shared]);assert.equal(settled,true);
  await prepareActThreeMapAssets();assert.equal(images.length,count,'Returning from the clock does not reload the map');
  // Import a fresh module to exercise a cold failed load, independent of the warm cache.
  const fresh=await import('../src/act-three-map.js?failed-preload');
  const failed=fresh.prepareActThreeMapAssets();const batch=images.slice(count);
  const rejected=assert.rejects(failed,/offline/);batch[0].onerror(new Error('offline'));for(const image of batch.slice(1))image.onload();await rejected;
  const beforeRetry=images.length,retry=fresh.prepareActThreeMapAssets();assert.equal(images.length,beforeRetry+1);images.at(-1).onload();await retry;
 }finally{globalThis.Image=previous;}
});

test('bridge clock keeps its final frame until the return scene is ready, and cannot reopen a closed modal',async()=>{
 const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 const source=app.slice(app.indexOf('function showActThreeBridgeRewind(){'),app.indexOf('function showActThreeMap(){'));
 for(const cancelled of [false,true]){
  let prepared,clockDone,shown=0;const order=[],clock={isConnected:true};
  const context={state:{},normalBgm:{enabled:false,setSuppressed(){},clockAudio:null},save(){},prepareActThreeMapAssets(){order.push('preload');return new Promise(resolve=>prepared=resolve);},rewindTransitionHTML(){return 'clock';},openModal(){order.push('clock');},modal:{open:true,querySelector(){return clock;}},startRewindTransition(root,failure,finish){clockDone=finish;return ()=>{};},characterVoice:{},actThreeStoryDebug(){return {phase:'map',mapScene:'return'};},showActThreeMap(){shown++;}};
  vm.runInNewContext(source,context);context.showActThreeBridgeRewind();assert.deepEqual(order,['preload','clock']);
  clockDone();await new Promise(resolve=>setImmediate(resolve));assert.equal(shown,0);assert.equal(context.state.actThree.phase,'bridge-rewind');
  if(cancelled)context.modal.open=false;
  prepared();await new Promise(resolve=>setImmediate(resolve));assert.equal(shown,cancelled?0:1);
 }
});

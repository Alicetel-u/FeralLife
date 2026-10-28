import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {ACT_THREE_COLLAPSE_ART,ACT_THREE_COLLAPSE_HOLD,actThreeCollapseFrame} from '../src/act-three-collapse.js';
import {actThreeMapVisualState,startActThreeMap} from '../src/act-three-map.js';
import {ACT_THREE_MAP_SCENES,actThreeStoryDebug} from '../src/act-three-story.js';

test('collapse uses distinct full-scene art, settles into aftermath and retains a readable hold in reduced motion',()=>{
 for(const src of Object.values(ACT_THREE_COLLAPSE_ART))assert.ok(existsSync(src),src);
 assert.equal(new Set(Object.values(ACT_THREE_COLLAPSE_ART)).size,2);
 assert.equal(actThreeCollapseFrame(0).phase,'fall');assert.equal(actThreeCollapseFrame(.55).phase,'impact');
 assert.equal(actThreeCollapseFrame(1).afterOpacity,1);assert.equal(actThreeCollapseFrame(1).fallOpacity,0);
 assert.equal(actThreeCollapseFrame(ACT_THREE_COLLAPSE_HOLD-.01).ready,false);assert.equal(actThreeCollapseFrame(ACT_THREE_COLLAPSE_HOLD).ready,true);
 assert.equal(actThreeCollapseFrame(0,true).phase,'aftermath');assert.equal(actThreeCollapseFrame(0,true).transform,actThreeCollapseFrame(2,true).transform);
 const lines=ACT_THREE_MAP_SCENES.bridge.lines;assert.equal(actThreeMapVisualState('bridge',lines[5]).collapse,false);
 for(const line of lines.slice(6)){const state=actThreeMapVisualState('bridge',line);assert.equal(state.collapse,true);assert.equal(state.hideCharacters,true);}
});

test('rapid next cannot skip the fall; menu and hidden tabs pause it, reload replays it, and the original loop follows',async()=>{
 const keys=['Image','requestAnimationFrame','cancelAnimationFrame','document','addEventListener','removeEventListener','matchMedia'],previous=Object.fromEntries(keys.map(k=>[k,globalThis[k]]));
 let raf,clickHandler,visibility,stop,now=0,loops=0;const saves=[],quiet=[];
 const el=()=>({style:{setProperty(){}},dataset:{},hidden:false,open:false,disabled:false,setAttribute(){},removeAttribute(){},remove(){},querySelector(){return el();}});
 const nodes=new Map(),section={...el(),focus(){},querySelector(s){if(!nodes.has(s))nodes.set(s,el());return nodes.get(s);},querySelectorAll(){return [];},addEventListener(k,fn){if(k==='click')clickHandler=fn;},removeEventListener(k){if(k==='click')clickHandler=null;}};
 section.querySelector('.map-viewport').clientWidth=390;section.querySelector('.map-viewport').clientHeight=600;section.querySelector('.event-menu').hidden=true;
 const click=key=>clickHandler?.({target:{closest:()=>({hasAttribute:k=>k===key})},preventDefault(){},stopPropagation(){}});
 const tick=(count=1)=>{for(let i=0;i<count;i++){now+=50;const fn=raf;raf=null;fn?.(now);}};
 const mount=async saved=>{stop=startActThreeMap({querySelector:()=>section},{story:true,initialProgress:saved,onProgress:p=>saves.push(p),bgm:{setSuppressed:v=>quiet.push(v)},onLoop:()=>loops++});await new Promise(r=>setImmediate(r));};
 try{
  globalThis.Image=class{set src(v){queueMicrotask(()=>this.onload());}decode(){return Promise.resolve();}};
  globalThis.requestAnimationFrame=fn=>{raf=fn;return 1;};globalThis.cancelAnimationFrame=()=>raf=null;
  globalThis.document={hidden:false,addEventListener(k,fn){if(k==='visibilitychange')visibility=fn;},removeEventListener(){}};
  globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.matchMedia=()=>({matches:false});
  await mount({...actThreeStoryDebug('bridge'),mapCursor:6});assert.equal(section.dataset.collapse,'true');assert.equal(section.querySelector('[data-dialogue-next]').disabled,true);
  for(let i=0;i<12;i++)click('data-dialogue-next');assert.equal(saves.at(-1).mapCursor,6);assert.equal(loops,0);assert.ok(quiet.includes(true));
  tick(20);
  click('data-event-menu');assert.equal(section.dataset.effectsPaused,'true');tick(100);assert.equal(section.querySelector('[data-dialogue-next]').disabled,true);
  click('data-event-menu');document.hidden=true;visibility();tick(100);assert.equal(section.querySelector('[data-dialogue-next]').disabled,true);
  document.hidden=false;visibility();tick(50);assert.equal(section.querySelector('[data-dialogue-next]').disabled,false);
  const saved=saves.at(-1);stop();await mount(saved);assert.equal(section.querySelector('[data-dialogue-next]').disabled,true);tick(70);
  click('data-dialogue-next');assert.equal(saves.at(-1).mapCursor,7);click('data-dialogue-next');assert.equal(loops,1);
 }finally{stop?.();for(const key of keys){if(previous[key]===undefined)delete globalThis[key];else globalThis[key]=previous[key];}}
});

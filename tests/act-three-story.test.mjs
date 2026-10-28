import test from 'node:test';
import assert from 'node:assert/strict';
import {ACT_THREE_MAP_SCENES,actThreeStoryProgress,actThreeStorySave,actThreeStoryDebug} from '../src/act-three-story.js';
import {startActThreeMap} from '../src/act-three-map.js';

test('old map demos cannot skip newly authored story; saves resume the actual unanswered scene and page',()=>{
 assert.equal(actThreeStoryProgress({phase:'map',mapStep:4}).scene,'departure');
 for(const id of ['departure','crossing','detour','store','farewell']){
  const saved=actThreeStoryDebug(id),p=actThreeStoryProgress(saved);assert.equal(p.step,saved.mapStep);assert.equal(p.scene,saved.mapScene);assert.equal(p.cursor,saved.mapCursor);
 }
 const saved={...actThreeStoryDebug('store'),mapCursor:37,mapPage:999};
 assert.equal(actThreeStoryProgress(saved).page,0);assert.equal(actThreeStoryProgress(saved).keyGiven,true);
 const p=actThreeStoryProgress({...actThreeStoryDebug('store'),mapCursor:20});assert.equal(p.keyGiven,false);
 assert.deepEqual(actThreeStoryProgress(actThreeStorySave(p)),p);
 assert.equal(actThreeStoryDebug('unknown'),null);
});

test('script stops at Mimi farewell, keeps the specified lines and reveals zombies only after countdown',()=>{
 assert.equal(ACT_THREE_MAP_SCENES.departure.lines.at(-1).text,'……行くぞ');
 const crossing=ACT_THREE_MAP_SCENES.crossing.lines;assert.equal(crossing[4].text,'……3、2、1');assert.ok(!crossing.slice(0,5).some(l=>l.horde));assert.ok(crossing[5].horde);
 const store=ACT_THREE_MAP_SCENES.store.lines;
 for(const text of ['銃！','ああ…緊急事態だ気にすんな','二階に空き部屋がある。そこを使っていい','……ああ。きっとな'])assert.ok(store.some(l=>l.text===text));
 assert.match(store.at(-1).text,/ミミは鍵を両手で握りしめる/);
 assert.ok(!store.some(l=>/倒れ|脱出成功|薬|前大家/.test(l.text)));
 for(const scene of Object.values(ACT_THREE_MAP_SCENES))for(const line of scene.lines)assert.ok(!/ここからゲーム|画面|シーン\d|選択肢/.test(line.text));
});

test('real map gates motion behind dialogue, resumes mid-conversation and ends before bridge',async()=>{
 const names=['Image','requestAnimationFrame','cancelAnimationFrame','document','addEventListener','removeEventListener','matchMedia'];
 const previous=Object.fromEntries(names.map(k=>[k,globalThis[k]]));let frame,clicked;const saved=[];
 const el=()=>({style:{setProperty(){}},dataset:{},hidden:false,disabled:false,setAttribute(){},removeAttribute(){},remove(){},querySelector(){return el();}});
 const elements=new Map(),section={...el(),focus(){},querySelector(key){if(!elements.has(key))elements.set(key,el());return elements.get(key);},querySelectorAll(){return Array.from({length:5},el);},addEventListener(key,fn){if(key==='click')clicked=fn;},removeEventListener(){clicked=null;}};
 section.querySelector('.map-viewport').clientWidth=390;section.querySelector('.map-viewport').clientHeight=600;
 const click=name=>clicked?.({target:{closest:()=>({hasAttribute:key=>key===name})},preventDefault(){},stopPropagation(){}});
 let clock=0;const move=()=>{for(let n=0;n<65;n++){clock+=50;const fn=frame;frame=null;fn?.(clock);}};
 let stop;
 try{
  globalThis.Image=class{set src(v){queueMicrotask(()=>this.onload());}decode(){return Promise.resolve();}};
  globalThis.requestAnimationFrame=fn=>{frame=fn;return 1;};globalThis.cancelAnimationFrame=()=>frame=null;
  globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.matchMedia=()=>({matches:false});
  stop=startActThreeMap({querySelector:()=>section},{story:true,onProgress:p=>saved.push(p)});
  await new Promise(resolve=>setImmediate(resolve));
  click('data-map-next');move();assert.equal(saved.at(-1).mapStep,0);
  for(let n=0;n<11;n++)click('data-map-dialogue-next');assert.equal(saved.at(-1).mapScene,null);
  click('data-map-next');move();assert.equal(saved.at(-1).mapScene,'crossing');
  for(let n=0;n<6;n++)click('data-map-dialogue-next');const mid=saved.at(-1);assert.equal(mid.mapCursor,6);
  stop();stop=startActThreeMap({querySelector:()=>section},{story:true,initialProgress:mid,onProgress:p=>saved.push(p)});await new Promise(resolve=>setImmediate(resolve));assert.equal(saved.at(-1).mapCursor,6);
  for(let n=6;n<11;n++)click('data-map-dialogue-next');click('data-map-next');move();assert.equal(saved.at(-1).mapStep,2);assert.equal(saved.at(-1).mapScene,null);
  click('data-map-next');move();assert.equal(saved.at(-1).mapScene,'store');
  for(let n=0;n<100;n++)click('data-map-dialogue-next');assert.equal(saved.at(-1).mimiKeyGiven,true);assert.deepEqual(saved.at(-1).mapSeen,['departure','crossing','store']);
  click('data-map-next');move();assert.equal(saved.at(-1).mapStep,3);assert.equal(section.querySelector('[data-map-next]').hidden,true);assert.equal(section.querySelector('[data-map-finish]').hidden,false);
 }finally{stop?.();for(const key of names){if(previous[key]===undefined)delete globalThis[key];else globalThis[key]=previous[key];}}
});

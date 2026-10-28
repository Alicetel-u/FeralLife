import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {ACT_THREE_MAP_PLACES,ACT_THREE_MAP_CAST,ACT_THREE_MAP_ZOMBIE,actThreeMapCheckpoint,actThreeMapTravel,actThreeMapWorldPosition,actThreeMapTravelDuration,ACT_THREE_BRIDGE_SPAN,actThreeMapHTML,startActThreeMap} from '../src/act-three-map.js';

test('escape map requires crossing then bypass before store and bridge; all art is packaged',()=>{
 assert.deepEqual(ACT_THREE_MAP_PLACES.map(p=>p.id),['home','crossing','detour','store','bridge']);
 assert.equal(ACT_THREE_MAP_PLACES[1].action,'裏道から回避する');
 for(const src of [...ACT_THREE_MAP_PLACES.map(p=>p.image),...ACT_THREE_MAP_CAST.map(p=>p.image),ACT_THREE_MAP_ZOMBIE])assert.ok(existsSync(src),src);
 assert.equal(actThreeMapCheckpoint(undefined),0);assert.equal(actThreeMapCheckpoint(-2),0);assert.equal(actThreeMapCheckpoint(99),4);
 assert.match(actThreeMapHTML(),/data-chapter="3"/);assert.ok(!actThreeMapHTML().includes('town-map-v1'));
 assert.equal(ACT_THREE_BRIDGE_SPAN,2.6);
 assert.equal(actThreeMapWorldPosition(3),3);
 assert.equal(actThreeMapWorldPosition(4),5.6);
 assert.ok(Math.abs(actThreeMapWorldPosition(3.5)-4.3)<1e-8);
 assert.equal(actThreeMapTravelDuration(2),2.4);
 assert.equal(actThreeMapTravelDuration(3),8.4);
 assert.ok(actThreeMapTravelDuration(3,true)>actThreeMapTravelDuration(2,true));
 const route=actThreeMapHTML();
 for(const id of ['route-zombies-a','route-zombies-b','route-zombies-c','route-zombies-d','barricade-a','barricade-b'])assert.match(route,new RegExp(id));
 assert.equal(route.split('assets/events/chapter3/map-zombie.png').length-1,16);
 let previous=1;for(let n=0;n<=100;n++){const f=actThreeMapTravel(1,2,n/100);assert.ok(f.position>=previous&&f.position<=2);previous=f.position;}
 assert.equal(actThreeMapTravel(1,2,1).finished,true);assert.equal(actThreeMapTravel(1,2,-1).position,1);
});

test('map saves only arrival, pauses motion, resumes bypass and cleans up callbacks',async()=>{
 const keys=['Image','requestAnimationFrame','cancelAnimationFrame','document','addEventListener','removeEventListener','matchMedia'];
 const original=Object.fromEntries(keys.map(k=>[k,globalThis[k]]));let frame,clicked,resize;const saved=[];
 const element=()=>({style:{setProperty(){}},dataset:{},hidden:false,disabled:false,textContent:'',innerHTML:'',setAttribute(){},removeAttribute(){},remove(){},querySelector(){return element();}});
 const elements=new Map(),landmarks=Array.from({length:5},element),steps=Array.from({length:5},element);
 const section={...element(),focus(){},querySelector(key){if(!elements.has(key))elements.set(key,element());return elements.get(key);},querySelectorAll(key){return key==='[data-map-landmark]'?landmarks:steps;},addEventListener(k,fn){if(k==='click')clicked=fn;},removeEventListener(){clicked=null;}};
 section.querySelector('.map-viewport').clientWidth=390;section.querySelector('.map-viewport').clientHeight=430;
 const click=attribute=>clicked?.({target:{closest:()=>({hasAttribute:k=>k===attribute})},preventDefault(){},stopPropagation(){}});
 const tick=now=>{const fn=frame;frame=null;fn?.(now);};
 try{
  globalThis.Image=class{set src(v){queueMicrotask(()=>this.onload());}decode(){return Promise.resolve();}};
  globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
  globalThis.requestAnimationFrame=fn=>{frame=fn;return 1;};globalThis.cancelAnimationFrame=()=>{frame=null;};
  globalThis.addEventListener=(key,fn)=>resize=fn;globalThis.removeEventListener=()=>resize=null;globalThis.matchMedia=()=>({matches:false});
  const stop=startActThreeMap({querySelector:()=>section},{initialStep:1,onArrival:v=>saved.push(v)});
  await new Promise(resolve=>setImmediate(resolve));assert.equal(section.dataset.location,'crossing');
  click('data-map-next');tick(0);for(let n=1;n<15;n++)tick(n*50);assert.deepEqual(saved,[]);
  click('data-map-pause');const before=section.querySelector('.map-world').style.transform;
  for(let n=15;n<80;n++)tick(n*50);assert.equal(section.querySelector('.map-world').style.transform,before);assert.deepEqual(saved,[]);
  click('data-map-pause');for(let n=80;n<145;n++)tick(n*50);assert.deepEqual(saved,[2]);assert.equal(section.dataset.location,'detour');
  click('data-map-next');click('data-map-next');for(let n=145;n<205;n++)tick(n*50);assert.deepEqual(saved,[2,3]);
  stop();assert.equal(frame,null);assert.equal(clicked,null);assert.equal(resize,null);stop();
 }finally{for(const k of keys){if(original[k]===undefined)delete globalThis[k];else globalThis[k]=original[k];}}
});

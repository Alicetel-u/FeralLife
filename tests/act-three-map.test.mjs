import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {eventStageHTML} from '../src/event-stage.js';
import {ACT_THREE_MAP_SCENES} from '../src/act-three-story.js';
import {ACT_THREE_MAP_PLACES,ACT_THREE_MAP_CAST,ACT_THREE_MIMI_MINI,ACT_THREE_MAP_ZOMBIE,ACT_THREE_MAP_EXPLOSION,actThreeMapVisualState,actThreeMapCheckpoint,actThreeMapTravel,actThreeMapWorldPosition,actThreeMapVerticalPosition,actThreeMapTravelDirection,actThreeMapTravelDuration,ACT_THREE_BRIDGE_SPAN,actThreeMapHTML,startActThreeMap} from '../src/act-three-map.js';

test('escape map requires crossing then bypass before store and bridge; all art is packaged',()=>{
 assert.deepEqual(ACT_THREE_MAP_PLACES.map(p=>p.id),['home','crossing','detour','store','bridge']);
 assert.equal(ACT_THREE_MAP_PLACES[1].action,'裏道から回避する');
 for(const src of [...ACT_THREE_MAP_PLACES.map(p=>p.image),...ACT_THREE_MAP_CAST.map(p=>p.image),ACT_THREE_MAP_ZOMBIE,ACT_THREE_MAP_EXPLOSION,ACT_THREE_MIMI_MINI])assert.ok(existsSync(src),src);
 assert.equal(actThreeMapCheckpoint(undefined),0);assert.equal(actThreeMapCheckpoint(-2),0);assert.equal(actThreeMapCheckpoint(99),4);
 assert.match(actThreeMapHTML(),/data-chapter="3"/);assert.ok(!actThreeMapHTML().includes('town-map-v1'));
 assert.equal(ACT_THREE_BRIDGE_SPAN,2.6);
 assert.equal(actThreeMapWorldPosition(0),0);
 assert.equal(actThreeMapWorldPosition(1),1);
 assert.equal(actThreeMapWorldPosition(1.5),1); // Crossing → detour: no horizontal movement.
 assert.equal(actThreeMapWorldPosition(2),1);
 assert.equal(actThreeMapWorldPosition(2.5),1.5); // Detour → store: eastbound.
 assert.equal(actThreeMapWorldPosition(3),2);
 assert.ok(Math.abs(actThreeMapWorldPosition(4)-4.6)<1e-8);
 assert.ok(Math.abs(actThreeMapWorldPosition(3.5)-3.3)<1e-8);
 assert.equal(actThreeMapVerticalPosition(1),0);
 assert.equal(actThreeMapVerticalPosition(1.5),.5);
 assert.equal(actThreeMapVerticalPosition(2),1);
 assert.equal(actThreeMapVerticalPosition(3.5),1);
 assert.equal(actThreeMapTravelDirection(1),'up');
 assert.equal(actThreeMapTravelDirection(2),'right');
 assert.equal(actThreeMapTravelDirection(3,true),'left');
 assert.equal(actThreeMapTravelDirection(2,true),'down');
 assert.equal(actThreeMapTravelDirection(1,true),'left');
 assert.equal(actThreeMapTravelDuration(1),3);
 assert.equal(actThreeMapTravelDuration(2),2.4);
 assert.equal(actThreeMapTravelDuration(3),8.4);
 assert.ok(actThreeMapTravelDuration(3,true)>actThreeMapTravelDuration(2,true));
 const route=actThreeMapHTML();
 assert.match(route,/map-companion-rabbit/);
 assert.doesNotMatch(route,/data-map-pause|data-map-back/);
 assert.ok(route.indexOf('class="map-zombies"')>route.indexOf('class="map-bridge-route"')); // Horde stays outside the translated world.
 assert.ok(route.includes(ACT_THREE_MIMI_MINI));
 assert.ok(!route.includes('assets/events/busts/mimi-neutral.png'));
 const mini=readFileSync(ACT_THREE_MIMI_MINI);
 assert.equal(mini.subarray(1,4).toString(),'PNG');
 assert.equal(mini.readUInt32BE(16),640);assert.equal(mini.readUInt32BE(20),384);
 for(const id of ['route-zombies-a','route-zombies-b','route-zombies-c','route-zombies-d',])assert.match(route,new RegExp(id));
 assert.equal(route.split('assets/events/chapter3/map-zombie.png').length-1,30);
 for(const id of ['map-bypass-route','map-bypass-road','map-bypass-wall','map-detour-exit','map-route-road','map-route-barricade','map-route-debris'])assert.ok(!route.includes(id),id);
 let previous=1;for(let n=0;n<=100;n++){const f=actThreeMapTravel(1,2,n/100);assert.ok(f.position>=previous&&f.position<=2);previous=f.position;}
 assert.equal(actThreeMapTravel(1,2,1).finished,true);assert.equal(actThreeMapTravel(1,2,-1).position,1);
 assert.equal(actThreeMapTravel(3,2,0).position,3);assert.equal(actThreeMapTravel(3,2,1).position,2);
 assert.ok(actThreeMapTravel(2,1,.5).position<2);
 const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
 assert.match(css,/data-returning="true"[^\n]*\.map-companion:not\(\.map-companion-rabbit\)>img\{transform:scaleX\(-1\)\}/);
 assert.match(css,/data-returning="true"[^\n]*\.map-companion-rabbit/);
 assert.match(css,/\.map-rabbit-frame img\{[\s\S]*?width:400%;height:200%/);
});

test('map saves only arrival, finishes uninterrupted motion and cleans up callbacks',async()=>{
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
  assert.equal(section.dataset.travelDirection,'up');
  assert.ok(section.querySelector('.map-world').style.transform.startsWith('translate3d(-380px,'));
  assert.equal(section.dataset.travelDirection,'up');
  for(let n=15;n<80;n++)tick(n*50);assert.deepEqual(saved,[2]);assert.equal(section.dataset.location,'detour');
  const afterClimb=section.querySelector('.map-world').style.transform;
  click('data-map-next');click('data-map-next');for(let n=80;n<145;n++)tick(n*50);assert.deepEqual(saved,[2,3]);
  assert.equal(section.dataset.travelDirection,'idle');
  assert.notEqual(section.querySelector('.map-world').style.transform,afterClimb);
  assert.equal(section.querySelector('.map-world').style.transform.split(',')[1],afterClimb.split(',')[1]); // Right turn: same elevation.
  assert.ok(section.querySelector('.map-world').style.transform.endsWith('px,0)'));
  stop();assert.equal(frame,null);assert.equal(clicked,null);assert.equal(resize,null);stop();
 }finally{for(const k of keys){if(original[k]===undefined)delete globalThis[k];else globalThis[k]=original[k];}}
});


test('crossing and explosion action beats hide portraits without altering their message window',()=>{
 for(const [id,index] of [['crossing',5],['detour',8]]){
  const scene=ACT_THREE_MAP_SCENES[id],visual=actThreeMapVisualState(id,scene.lines[index]);
  assert.equal(visual.hideCharacters,true);
  const html=eventStageHTML({detail:scene.lines[0].text,lines:scene.lines,cast:scene.cast},[],index,0,{hideCharacters:visual.hideCharacters});
  assert.doesNotMatch(html,/<figure|stage-character/);assert.match(html,/stage-bubble/);assert.ok(html.includes(scene.lines[index].text));
 }
 assert.equal(actThreeMapVisualState('crossing',ACT_THREE_MAP_SCENES.crossing.lines[4]).crossing,false);
 assert.equal(actThreeMapVisualState('crossing',ACT_THREE_MAP_SCENES.crossing.lines[6]).hideCharacters,false);
 assert.equal(actThreeMapVisualState('detour',ACT_THREE_MAP_SCENES.detour.lines[8]).explosion,'blast');
 const html=actThreeMapHTML(),css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
 assert.equal((html.match(/class="map-zombie-walker"/g)||[]).length,10);assert.doesNotMatch(html,/map-crash-truck|truck-cargo|truck-cab/);assert.doesNotMatch(css,/map-crash-truck|truck-cargo|act3-truck/);
 assert.match(css,/@keyframes map-horde-traverse/);assert.match(css,/data-effects-paused=true/);
 const png=readFileSync(ACT_THREE_MAP_EXPLOSION);assert.equal(png[25],6);assert.ok(png.length<3*1024*1024,'The effect stays a single small RGBA asset');
});

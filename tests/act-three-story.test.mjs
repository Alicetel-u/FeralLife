import test from 'node:test';
import assert from 'node:assert/strict';
import {ACT_THREE_MAP_SCENES,actThreeStoryProgress,actThreeStorySave,actThreeStoryDebug} from '../src/act-three-story.js';
import {startActThreeMap} from '../src/act-three-map.js';
import {UNEASY_BGM_SRC,CLOCK_BGM_SRC} from '../src/bgm.js';

test('old map demos cannot skip newly authored story; saves resume the actual unanswered scene and page',()=>{
 assert.equal(actThreeStoryProgress({phase:'map',mapStep:4}).scene,'departure');
 for(const id of ['departure','crossing','detour','store','farewell','bridge','return','homecoming']){
  const saved=actThreeStoryDebug(id),p=actThreeStoryProgress(saved);assert.equal(p.step,saved.mapStep);assert.equal(p.scene,saved.mapScene);assert.equal(p.cursor,saved.mapCursor);
 }
 const saved={...actThreeStoryDebug('store'),mapCursor:37,mapPage:999};
 const blast={...actThreeStoryDebug('detour'),mapCursor:8};assert.equal(actThreeStoryProgress(blast).cursor,8);
 assert.equal(actThreeStoryProgress(saved).page,0);assert.equal(actThreeStoryProgress(saved).keyGiven,true);
 const p=actThreeStoryProgress({...actThreeStoryDebug('store'),mapCursor:20});assert.equal(p.keyGiven,false);
 assert.deepEqual(actThreeStoryProgress(actThreeStorySave(p)),p);
 assert.equal(actThreeStoryDebug('unknown'),null);
});

test('Mimi encounter, bridge collapse and rewind script preserve the specified lines',()=>{
 assert.equal(ACT_THREE_MAP_SCENES.departure.lines.at(-1).text,'……行くぞ');
 const crossing=ACT_THREE_MAP_SCENES.crossing.lines;assert.equal(crossing[4].text,'……3、2、1');assert.ok(!crossing.slice(0,5).some(l=>l.horde));assert.ok(crossing[5].horde);
 const detour=ACT_THREE_MAP_SCENES.detour.lines;
 assert.ok(detour.some(l=>l.text.includes('配送トラックが大爆発')&&l.explosion));
 assert.ok(detour.some(l=>l.text==='……前は、ここで失敗したからな'));
 assert.ok(detour.some(l=>l.aftermath));
 const bridge=ACT_THREE_MAP_SCENES.bridge.lines;
 assert.equal(bridge.at(-1).text,'…………え？');assert.equal(bridge.at(-2).collapse,true);
 assert.equal(bridge[2].text,'モクは冷えた酒が飲みたいニャ！');
 const store=ACT_THREE_MAP_SCENES.store.lines;
 assert.equal(store.find(l=>l.text.includes('怒られるニャ')).text,'なんでモクが怒られるニャ！？');
 for(const text of ['銃！','ああ…緊急事態だ気にすんな','二階に空き部屋がある。そこを使っていい','……ああ。きっとな'])assert.ok(store.some(l=>l.text===text));
 assert.match(store.at(-1).text,/ミミは鍵を両手で握りしめる/);
 assert.ok(!store.some(l=>/倒れ|脱出成功|薬|前大家/.test(l.text)));
 for(const scene of Object.values(ACT_THREE_MAP_SCENES))for(const line of scene.lines)assert.ok(!/ここからゲーム|画面|シーン\d|選択肢/.test(line.text));
});

test('bridge rewind starts at surprised landlord, stays in his thoughts, then escorts Mimi home',async()=>{
 const lines=ACT_THREE_MAP_SCENES.return.lines;
 assert.equal(lines[0].text,'……は？');
 assert.equal(lines[0].speaker,'manager');
 const change=lines.findIndex(l=>l.text==='……予定変更だ。アパートに戻るぞ');
 assert.ok(change>10);
 assert.ok(lines.slice(0,change).every(l=>['manager','narrator'].includes(l.speaker)),'Nobody addresses the landlord during the realization');
 assert.ok(lines.some(l=>l.text==='だが、俺は死んでない'&&l.innerVoice));
 assert.ok(lines.some(l=>l.text==='今度はコンビニが起点なのか……？'&&l.innerVoice));
 assert.ok(lines.some(l=>l.text==='ミミを一人で帰らせるわけにはいかないだろ'));
 assert.ok(lines.some(l=>l.text==='ルナがミミに肩を貸す。'));
 assert.ok(!lines.some(l=>l.text.includes('二人とも、生きてる')));
 assert.equal(lines.at(-1).text,'四人はコンビニを出て、けもの荘へ向かう。');
 assert.equal(ACT_THREE_MAP_SCENES.homecoming.lines[0].text,'四人は、けもの荘へ戻った。');
 assert.equal(UNEASY_BGM_SRC,'assets/audio/uneasy-air.mp3','Regular post-BAD-END BGM is reused');
 assert.equal(CLOCK_BGM_SRC,'assets/audio/clock-rewind.mp3','Clock sound effect remains reserved for the dial');
 assert.notEqual(UNEASY_BGM_SRC,CLOCK_BGM_SRC,'Clock SE must never loop as the return-scene BGM');
 const olderReturn={...actThreeStoryDebug('return'),mapStoryRevision:3,mapCursor:2};
 const migrated=actThreeStoryProgress(olderReturn);
 assert.equal(migrated.scene,'return');assert.equal(migrated.cursor,0);
 const olderFinished={...olderReturn,mapScene:null,mapSeen:[...olderReturn.mapSeen,'return']};
 assert.equal(actThreeStoryProgress(olderFinished).scene,'return');
 const stage=actThreeStoryProgress(actThreeStoryDebug('homecoming'));
 assert.equal(stage.step,0);assert.equal(stage.scene,'homecoming');assert.ok(stage.seen.includes('return'));
 const finished=actThreeStoryProgress({...actThreeStorySave(stage),mapScene:null,mapSeen:[...stage.seen,'homecoming']});
 assert.equal(finished.step,0);assert.equal(finished.scene,null);assert.ok(finished.seen.includes('homecoming'));
 const oldArrival={...actThreeStoryDebug('homecoming'),mapStoryRevision:4,mapScene:null};
 assert.equal(actThreeStoryProgress(oldArrival).scene,'homecoming','Old instant-return saves must reach final apartment arrival');
});

test('post-rewind dialogue advances to existing home landmark and unlocks finish without replaying Mimi meeting',async()=>{
 const names=['Image','requestAnimationFrame','cancelAnimationFrame','document','addEventListener','removeEventListener','matchMedia'];
 const previous=Object.fromEntries(names.map(k=>[k,globalThis[k]]));let frame,clicked;const saved=[];
 const el=()=>({style:{setProperty(){}},dataset:{},hidden:false,disabled:false,setAttribute(){},removeAttribute(){},querySelector(){return el();}});
 const elements=new Map(),section={...el(),focus(){},querySelector(key){if(!elements.has(key))elements.set(key,el());return elements.get(key);},querySelectorAll(){return Array.from({length:5},el);},addEventListener(key,fn){if(key==='click')clicked=fn;},removeEventListener(){clicked=null;}};
 section.querySelector('.map-viewport').clientWidth=390;section.querySelector('.map-viewport').clientHeight=600;
 const click=name=>clicked?.({target:{closest:()=>({hasAttribute:key=>key===name})},preventDefault(){},stopPropagation(){}});
 let stop;
 try{
  globalThis.Image=class{set src(v){queueMicrotask(()=>this.onload());}decode(){return Promise.resolve();}};
  globalThis.requestAnimationFrame=fn=>{frame=fn;return 1;};globalThis.cancelAnimationFrame=()=>frame=null;
  globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.matchMedia=()=>({matches:false});
  stop=startActThreeMap({querySelector:()=>section},{story:true,initialProgress:actThreeStoryDebug('return'),onProgress:p=>saved.push(p)});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(saved.at(-1).mapScene,'return');
  assert.equal(section.dataset.rewindReturn,'true');
  for(let i=0;i<110&&saved.at(-1).mapScene==='return';i++)click('data-dialogue-next');
  assert.equal(saved.at(-1).mapScene,null);assert.equal(saved.at(-1).mapStep,3);
  assert.equal(section.dataset.returning,'true');
  assert.equal(section.dataset.travelDirection,'left');
  assert.equal(section.dataset.location,'store');
  assert.equal(section.querySelector('[data-map-finish]').hidden,true);
  assert.equal(section.querySelector('[data-map-next]').hidden,true);
  // The original L-shaped route is retraced automatically, without detour/store dialogue.
  let clock=0;const move=frames=>{for(let n=0;n<frames;n++){clock+=50;const run=frame;frame=null;run?.(clock);}};
  move(60);assert.equal(saved.at(-1).mapStep,2);assert.equal(saved.at(-1).mapScene,null);
  assert.equal(section.dataset.travelDirection,'down');
  move(70);assert.equal(saved.at(-1).mapStep,1);assert.equal(saved.at(-1).mapScene,null);
  assert.equal(section.dataset.travelDirection,'left');
  move(70);assert.equal(saved.at(-1).mapStep,0);assert.equal(saved.at(-1).mapScene,'homecoming');
  assert.equal(section.dataset.location,'home');
  assert.equal(section.querySelector('[data-map-finish]').hidden,true);
  click('data-dialogue-next');
  assert.equal(saved.at(-1).mapScene,null);
  assert.ok(saved.at(-1).mapSeen.includes('homecoming'));
  assert.equal(section.querySelector('[data-map-finish]').hidden,false);
  assert.equal(section.dataset.returning,'true','Mimi remains with the party after arrival');
  assert.equal(section.querySelector('[data-map-next]').hidden,true);
  assert.ok(actThreeStoryProgress(saved.at(-1)).seen.includes('homecoming'));
 }finally{stop?.();for(const key of names){if(previous[key]===undefined)delete globalThis[key];else globalThis[key]=previous[key];}}
});

test('real map gates motion, reaches bridge collapse and initiates forced loop',async()=>{
 const names=['Image','requestAnimationFrame','cancelAnimationFrame','document','addEventListener','removeEventListener','matchMedia'];
 const previous=Object.fromEntries(names.map(k=>[k,globalThis[k]]));let frame,clicked,looped=0;const saved=[];
 const el=()=>({style:{setProperty(){}},dataset:{},hidden:false,disabled:false,setAttribute(){},removeAttribute(){},remove(){},querySelector(){return el();}});
 const elements=new Map(),section={...el(),focus(){},querySelector(key){if(!elements.has(key))elements.set(key,el());return elements.get(key);},querySelectorAll(){return Array.from({length:5},el);},addEventListener(key,fn){if(key==='click')clicked=fn;},removeEventListener(){clicked=null;}};
 section.querySelector('.map-viewport').clientWidth=390;section.querySelector('.map-viewport').clientHeight=600;
 const click=name=>clicked?.({target:{closest:()=>({hasAttribute:key=>key===name})},preventDefault(){},stopPropagation(){}});
 let clock=0;const move=(frames=65)=>{for(let n=0;n<frames;n++){clock+=50;const fn=frame;frame=null;fn?.(clock);}};
 let stop;
 try{
  globalThis.Image=class{set src(v){queueMicrotask(()=>this.onload());}decode(){return Promise.resolve();}};
  globalThis.requestAnimationFrame=fn=>{frame=fn;return 1;};globalThis.cancelAnimationFrame=()=>frame=null;
  globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.matchMedia=()=>({matches:false});
  stop=startActThreeMap({querySelector:()=>section},{story:true,onProgress:p=>saved.push(p),onLoop:()=>looped++});
  await new Promise(resolve=>setImmediate(resolve));
  click('data-map-next');move();assert.equal(saved.at(-1).mapStep,0);
  for(let n=0;n<11;n++)click('data-dialogue-next');assert.equal(saved.at(-1).mapScene,null);
  click('data-map-next');move();assert.equal(saved.at(-1).mapScene,'crossing');
  for(let n=0;n<5;n++)click('data-dialogue-next');assert.equal(section.dataset.hordeCrossing,'true');assert.doesNotMatch(section.querySelector('.map-dialogue').innerHTML,/<figure/);click('data-dialogue-next');const mid=saved.at(-1);assert.equal(mid.mapCursor,6);
  stop();stop=startActThreeMap({querySelector:()=>section},{story:true,initialProgress:mid,onProgress:p=>saved.push(p),onLoop:()=>looped++});await new Promise(resolve=>setImmediate(resolve));assert.equal(saved.at(-1).mapCursor,6);
  for(let n=6;n<11;n++)click('data-dialogue-next');click('data-map-next');move();assert.equal(saved.at(-1).mapStep,2);assert.equal(saved.at(-1).mapScene,'detour');
  for(let n=0;n<8;n++)click('data-dialogue-next');assert.equal(section.dataset.explosion,'blast');assert.doesNotMatch(section.querySelector('.map-dialogue').innerHTML,/<figure/);
  for(let n=8;n<ACT_THREE_MAP_SCENES.detour.lines.length;n++)click('data-dialogue-next');assert.deepEqual(saved.at(-1).mapSeen,['departure','crossing','detour']);
  click('data-map-next');move();assert.equal(saved.at(-1).mapScene,'store');
  for(let n=0;n<100;n++)click('data-dialogue-next');assert.equal(saved.at(-1).mimiKeyGiven,true);assert.deepEqual(saved.at(-1).mapSeen,['departure','crossing','detour','store']);
  click('data-map-next');move(60);
  assert.equal(saved.at(-1).mapStep,3);assert.equal(section.dataset.longTravel,'true');
  move(120);assert.equal(saved.at(-1).mapStep,4);assert.equal(saved.at(-1).mapScene,'bridge');
  for(let n=0;n<6;n++)click('data-dialogue-next');assert.equal(section.dataset.collapse,'true');assert.equal(section.querySelector('[data-dialogue-next]').disabled,true);assert.doesNotMatch(section.querySelector('.map-dialogue').innerHTML,/<figure/);
  for(let n=0;n<10;n++)click('data-dialogue-next');assert.equal(looped,0);
  move(70);assert.equal(section.querySelector('[data-dialogue-next]').disabled,false);
  for(let n=0;n<3&&!looped;n++)click('data-dialogue-next');assert.equal(looped,1);
 }finally{stop?.();for(const key of names){if(previous[key]===undefined)delete globalThis[key];else globalThis[key]=previous[key];}}
});

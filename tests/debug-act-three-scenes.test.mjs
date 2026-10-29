import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {actThreeStoryDebug,actThreeStoryProgress,ACT_THREE_MAP_SCENES} from '../src/act-three-story.js';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const source=app.slice(app.indexOf('const ACT_THREE_DEBUG_GROUPS=['),app.indexOf('function showDebugSectionSelect('));
assert.ok(source.startsWith('const ACT_THREE_DEBUG_GROUPS=['));

function environment(){
 const screens=[],calls=[];
 const context={
  state:{actThree:null},developerMode:false,actThreeStoryDebug,
  modal:{querySelector:s=>s==='.persona-debug'?{classList:{add(...names){calls.push(['classList',names]);}}}:null},
  debugMenuPage:(title,subtitle,options,back)=>screens.push({title,subtitle,options,back}),
  showActThree:()=>calls.push(['film']),
  showActThreeClock:()=>calls.push(['clock']),
  showActThreeTitle:()=>calls.push(['title']),
  showActThreeAfter:()=>calls.push(['after']),
  showActThreeBridgeRewind:()=>calls.push(['bridge-clock']),
  showActThreeMap:()=>calls.push(['map'])
 };
 vm.createContext(context);
 vm.runInContext(source,context);
 return {context,screens,calls};
}

test('act-three scene selection is one menu, four chronological sections with <=4 targets per screen',()=>{
 const {context,screens}=environment();
 vm.runInContext('showDebugChapterSelect()',context);
 const root=screens.at(-1);
 assert.equal(root.options.length,3);
 assert.deepEqual(Array.from(root.options,([id])=>id),['1','2','3']);
 assert.equal(root.options[2][2],'data-debug-act3-groups');
 assert.equal((app.match(/\['3','第3幕/g)||[]).length,0,'No old duplicate Act III top-level entries');

 vm.runInContext('showDebugActThreeSections()',context);
 const main=screens.at(-1);
 assert.equal(main.back,'data-debug-chapters-back');
 assert.equal(main.options.length,4);
 assert.deepEqual(Array.from(main.options,([id])=>id),['opening','explore','escape','loop']);
 assert.ok(main.options.every(e=>e[2]==='data-debug-act3-group'&&e[4].length>5));
 const expected={
  opening:['film','clock','title','after'],
  explore:['departure','crossing','detour'],
  escape:['store','farewell','bridge','collapse'],
  loop:['bridge-clock','return','homeward','homecoming']
 };
 const all=[];
 for(const [id,ids] of Object.entries(expected)){
  vm.runInContext('showDebugActThreeScenes('+JSON.stringify(id)+')',context);
  const page=screens.at(-1);
  assert.equal(page.back,'data-debug-act3-groups-back');
  assert.ok(page.options.length<=4,'No scrolling page or extra pagination for '+id);
  assert.deepEqual(Array.from(page.options,([target])=>target),ids);
  assert.ok(page.options.every(([target,label,attribute,kind,description])=>
   attribute==='data-debug-act3-scene'&&label.length>5&&kind&&description),id);
  all.push(...ids);
 }
 assert.equal(all.length,new Set(all).size,'Every destination is listed only once');
 assert.ok(!app.includes('showDebugActThreeMap('),'Remove obsolete flat Act III list');
 assert.ok(!app.includes('data-debug-act3-map-page'),'Remove obsolete pagination');
});

test('every Act III button launches its exact real destination and preserves developer-mode isolation',()=>{
 const {context,calls}=environment();
 const expected={
  film:'film',clock:'clock',title:'title',after:'after','bridge-clock':'bridge-clock',
  departure:'departure',crossing:'crossing',detour:'detour',store:'store',
  farewell:'farewell',bridge:'bridge',collapse:'collapse',return:'return',
  homeward:'homeward',homecoming:'homecoming'
 };
 const list=vm.runInContext('ACT_THREE_DEBUG_GROUPS.flatMap(g=>g.scenes.map(s=>s[0]))',context);
 for(const id of list){
  calls.length=0;context.developerMode=false;context.state.actThree=null;
  vm.runInContext('startDebugActThreeScene('+JSON.stringify(id)+')',context);
  assert.equal(context.developerMode,true,id);
  const flow=expected[id];
  if(['film','clock','title','after','bridge-clock'].includes(id)){
   assert.ok(calls.some(([x])=>x===flow),id);
   if(id!=='bridge-clock')assert.equal(context.state.actThree.phase,id==='film'?'film':id==='after'?'after':id);
  }else{
   assert.ok(calls.some(([x])=>x==='map'),id);
   const actual=actThreeStoryProgress(context.state.actThree);
   if(id==='homeward'){
    assert.equal(actual.step,3);
    assert.equal(actual.scene,null);
    assert.ok(actual.seen.includes('return'));
    assert.equal(actual.seen.includes('homecoming'),false);
   }else{
    const scene=id==='farewell'?'store':id==='collapse'?'bridge':id;
    assert.equal(actual.scene,scene,id);
    if(id==='farewell'){
     assert.equal(actual.cursor,42);
     assert.match(ACT_THREE_MAP_SCENES.store.lines[42].text,/ミミちゃん/);
    }
    if(id==='collapse')assert.equal(ACT_THREE_MAP_SCENES.bridge.lines[actual.cursor].collapse,true);
   }
  }
 }
 context.developerMode=false;calls.length=0;
 vm.runInContext("startDebugActThreeScene('not-real')",context);
 assert.equal(context.developerMode,false);
 assert.equal(calls.length,0);
});

test('Act III section back routing and bridge rewind reuse the real clock transition',()=>{
 assert.match(app,/button\.dataset\.debugAct3Group\)\{showDebugActThreeScenes\(button\.dataset\.debugAct3Group\)/);
 assert.match(app,/data-debug-act3-groups-back'\)\)\{showDebugActThreeSections\(\)/);
 assert.match(app,/button\.dataset\.debugAct3Scene\)\{startDebugActThreeScene\(button\.dataset\.debugAct3Scene\)/);
 assert.match(app,/onLoop:showActThreeBridgeRewind/);
 const rewind=app.slice(app.indexOf('function showActThreeBridgeRewind(){'),app.indexOf('function showActThreeMap(){'));
 assert.match(rewind,/rewindTransitionHTML\('',1,true,3,true\)/);
 assert.match(rewind,/startRewindTransition/);
 assert.match(rewind,/actThreeStoryDebug\('return'\)/);
 assert.ok(!rewind.includes("normalBgm.setSuppressed(false);"),'Do not flash map audio in the transition');
});

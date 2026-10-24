import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

test('boot has no measurement screen and the cache version matches',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const version=html.match(/name="app-version" content="([^"]+)"/)[1];
 assert.doesNotMatch(html,/boot-diagnostics|boot-report|bootdiag|getEntriesByType|計測結果/);
 assert.match(html,new RegExp(`styles\\.css\\?v=${version.replaceAll('.','\\.')}`));
 assert.match(html,new RegExp(`src/app\\.js\\?v=${version.replaceAll('.','\\.')}`));
 const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 assert.match(app,new RegExp(`BUILD_VERSION='${version}'`));
 for(const file of ['src/app.js','src/act-two.js','src/act-two-duel-stage.js']){
  for(const pin of readFileSync(new URL('../'+file,import.meta.url),'utf8').matchAll(/\?v=([^'"]+)/g))assert.equal(pin[1],version,file);
 }
});

test('a restored fire waits at START without replaying or saving before the title',()=>{
  const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
  const source=app.slice(app.indexOf('function frame(now)'),app.indexOf('\nsyncStageCursor();',app.indexOf('function frame(now)')));
  let scheduled=0;
  const context={lastTime:0,renderer:{last:0},state:{ending:true,actOne:{status:'bad'}},endingShown:false,
    document:{hidden:false,documentElement:{classList:{contains:()=>false}},querySelector:selector=>selector==='#entry-gate:not([hidden])'?{}:null},
    requestAnimationFrame:()=>scheduled++};
  vm.createContext(context);
  vm.runInContext(source+'\nframe(100);frame(200);',context);
  assert.equal(scheduled,2);
  assert.equal(context.renderer.last,200);
  assert.equal(context.endingShown,false);
  assert.equal(context.state.ending,true);
});

function titleBootHarness(){
  const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
  const setup=app.slice(app.indexOf('let titleArtImages='),app.indexOf('const talk ='));
  const boot=app.slice(app.indexOf('async function finishBoot(){'),app.indexOf('\nfinishBoot();'));
  const decodes=[],images=[],progress=[];
  let start,shown=0,unlocks=0;
  const gate={hidden:true,remove(){this.removed=true;},querySelector:()=>({addEventListener:(type,handler)=>{start=handler;}})};
  const screen={classList:{add(){}},remove(){this.removed=true;}};
  const retry={hidden:true};
  const elements={'entry-gate':gate,'boot-screen':screen,'boot-retry':retry};
  const context={Image:class{constructor(){images.push(this);}decode(){return new Promise((resolve,reject)=>decodes.push({resolve,reject}));}},
    EVENT_EXPRESSIONS:{hostess:{happy:'luna.png'},sister:{happy:'nemu.png'},cat:{tired:'moku.png'}},
    previewType:null,paintBootProgress:(percent,label)=>progress.push({percent,label}),$:id=>elements[id],
    requestAnimationFrame:fn=>fn(),setTimeout:fn=>fn(),matchMedia:()=>({matches:true}),
    document:{documentElement:{classList:{remove(){}}},getElementById:id=>elements[id]},
    window:{kemonoBoot:{destroy(){}}},location:{search:''},URLSearchParams,
    state:{actOne:{}},startWorldArt(){},showGameTitle:()=>shown++,normalBgm:{unlock:()=>{unlocks++;return Promise.resolve();}}};
  vm.createContext(context);vm.runInContext(setup+boot,context);
  return {context,decodes,images,progress,gate,screen,retry,start:()=>start,shown:()=>shown,unlocks:()=>unlocks};
}

test('START stays hidden until every title image is decoded, then opens the title in the audio-unlock click',async()=>{
  const h=titleBootHarness(),pending=h.context.finishBoot();
  assert.equal(h.images.length,4);
  assert.deepEqual(h.images.map(image=>image.src),['assets/apartments.png','luna.png','nemu.png','moku.png']);
  assert.equal(h.gate.hidden,true);assert.equal(h.screen.removed,undefined);
  h.decodes.slice(0,3).forEach(decode=>decode.resolve());
  await Promise.resolve();await Promise.resolve();
  assert.equal(h.gate.hidden,true,'one undecoded image still holds the loading screen');
  assert.ok(h.progress.every(step=>step.percent<100));
  h.decodes[3].resolve();await pending;
  assert.equal(h.gate.hidden,false);assert.equal(h.screen.removed,true);
  assert.equal(h.shown(),0,'title still waits for the trusted START gesture');
  await h.context.prepareTitleArt();assert.equal(h.images.length,4,'decoded images are retained');
  h.start()();assert.equal(h.shown(),1);assert.equal(h.unlocks(),1);
});

test('a failed title image offers retry without restoring the deleted diagnostics screen',async()=>{
  const h=titleBootHarness(),pending=h.context.finishBoot();
  h.decodes[0].reject(new Error('image download failed'));await pending;
  assert.equal(h.gate.hidden,true);assert.equal(h.screen.removed,undefined);
  assert.equal(h.retry.hidden,false);
  assert.match(h.progress.at(-1).label,/再読み込み/);assert.equal(h.shown(),0);
});

test('title uses the same decoded image elements on first display and return visits',()=>{
  const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
  const source=app.slice(app.indexOf('function showGameTitle(){'),app.indexOf('function showActTwoOpening(){'));
  const images=Array.from({length:4},()=>({})),replaced=[];
  const context={debugTapCount:0,state:{actOne:{started:false}},EVENT_EXPRESSIONS:{hostess:{happy:'luna'},sister:{happy:'nemu'},cat:{tired:'moku'}},
    titleArtImages:images,openModal(){},modal:{querySelector:()=>null,querySelectorAll:()=>images.map((_,i)=>({className:i===0?'title-city':i===3?'title-moku':'',alt:'',replaceWith:image=>replaced.push(image)}))}};
  vm.createContext(context);vm.runInContext(source+'\nshowGameTitle();showGameTitle();',context);
  assert.deepEqual(replaced,[...images,...images]);
  assert.equal(images[0].className,'title-city');assert.equal(images[3].className,'title-moku');
});


test('a load failure before the body exists still offers retry when the loading screen mounts',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
 const elements={},listeners={};
 const context={window:{},document:{getElementById:id=>elements[id],addEventListener:(name,fn)=>listeners[name]=fn}};
 vm.createContext(context);vm.runInContext(script,context);
 context.window.kemonoBoot.fail('読み込みを完了できませんでした。再読み込みしてください');
 elements['boot-label']={};elements['boot-retry']={hidden:true};listeners.readystatechange();
 assert.equal(elements['boot-retry'].hidden,false);assert.match(elements['boot-label'].textContent,/再読み込み/);
});

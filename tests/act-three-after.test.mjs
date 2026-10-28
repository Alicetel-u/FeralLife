import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {ACT_THREE_AFTER_SCENES,actThreeAfterEntry,actThreeAfterHTML,startActThreeAfter} from '../src/act-three-prologue.js';
test('time-leap aftermath preserves the requested dialogue and separates its two illustrated scenes',()=>{
 assert.deepEqual(ACT_THREE_AFTER_SCENES.flatMap(scene=>scene.lines.map(line=>line.text)),['静寂に包まれたけもの荘。','……また、駄目だったか','時計を確認する。','戻り先は……今回は変わってないな','大家は無言で空き部屋へ向かう。','隠し場所を開け、武器と弾薬を確認する。','銃も弾薬もある。準備はできてる','……今度こそ、二人とも生き残らせる']);
 assert.equal(actThreeAfterEntry(3).scene.id,'corridor');assert.equal(actThreeAfterEntry(4).scene.id,'empty-room');assert.equal(actThreeAfterEntry(999).line.text,'……今度こそ、二人とも生き残らせる');
 for(const scene of ACT_THREE_AFTER_SCENES)assert.ok(existsSync(scene.image),scene.image);
 assert.ok(!actThreeAfterHTML().includes('シーン2'));
 const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');assert.match(app,/startActThreeTitle\(modal,\(\)=>\{state.actThree=\{phase:'after',cursor:0\}/);assert.match(app,/initialCursor:cursor,onCursor:cursor=>\{state.actThree=\{phase:'after',cursor\}/);assert.match(app,/progress.phase==='complete'&&!progress.afterSeen/);
});
test('aftermath resumes the saved line, navigates both scenes and completes once without replaying the film',async()=>{
 const previous=globalThis.Image;globalThis.Image=class{set src(value){queueMicrotask(()=>this.onload());}decode(){return Promise.resolve();}};
 const elements=new Map();const el=()=>({hidden:false,disabled:false,textContent:'',src:'',alt:'',remove(){}});
 const dialogue={html:'',set innerHTML(value){this.html=value;},querySelector(){return el();}};
 const loading={...el(),querySelector:key=>elements.get('load:'+key)||elements.set('load:'+key,el()).get('load:'+key)};
 const listeners={};const section={dataset:{},focus(){},querySelector:key=>key==='.act3-dialogue'?dialogue:key==='.act3-loading'?loading:elements.get(key)||elements.set(key,el()).get(key),addEventListener:(key,fn)=>listeners[key]=fn,removeEventListener:key=>delete listeners[key]};
 const root={querySelector:()=>section},saved=[];let complete=0;
 const click=name=>listeners.click?.({target:{closest:()=>({hasAttribute:value=>value===name})},preventDefault(){},stopPropagation(){}});
 try{
  const stop=startActThreeAfter(root,()=>complete++,{initialCursor:3,onCursor:value=>saved.push(value)});await new Promise(resolve=>setImmediate(resolve));
  assert.deepEqual(saved,[3]);assert.equal(section.dataset.cut,'corridor');click('data-act3-after-next');assert.equal(section.dataset.cut,'empty-room');assert.equal(saved.at(-1),4);
  click('data-act3-after-back');assert.equal(saved.at(-1),3);for(let n=0;n<5;n++)click('data-act3-after-next');assert.equal(complete,1);assert.ok(!listeners.click);stop();assert.equal(complete,1);
 }finally{globalThis.Image=previous;}
});

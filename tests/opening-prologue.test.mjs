import test from 'node:test';
import assert from 'node:assert/strict';
import {PROLOGUE_CUTS,openingPrologueHTML,prologueCutHTML,startOpeningPrologue} from '../src/opening-prologue.js';
test('letter text stays intact across cuts and insert art contains no embedded UI text',()=>{
 const letter=PROLOGUE_CUTS.filter(c=>c.speaker==='前大家からの手紙').map(c=>c.text).join('\n');
 for(const text of ['おめでとうございます。','あなたは本日から「けもの荘」の大家です。','現在の入居者は1名。','家賃収入は期待しないでください。','なお、私はもう関わりたくありません。','前大家より'])assert.ok(letter.includes(text));
 assert.equal(new Set(PROLOGUE_CUTS.filter(c=>c.image).map(c=>c.image)).size,3);
 assert.ok(openingPrologueHTML().includes('data-prologue-skip'));
 assert.ok(PROLOGUE_CUTS.every(c=>!prologueCutHTML(c).includes('ink-typography')));
 assert.ok(prologueCutHTML(PROLOGUE_CUTS[2]).includes('aria-live="polite"'));
});
test('skip finishes once and cleanup cancels pending narration and transition',t=>{
 t.mock.timers.enable({apis:['setTimeout']});
 const classes=new Set(),handlers=new Map();const button={disabled:false,setAttribute(){},focus(){}};
 const line={textContent:''};const content={innerHTML:'',querySelector(){return line;}};
 const root={dataset:{},classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),toggle(c,on){on?classes.add(c):classes.delete(c);}},querySelector(s){return s==='.ink-cut-content'?content:s==='.ink-progress'?{}:button;},addEventListener(k,h){handlers.set(k,h);},removeEventListener(k){handlers.delete(k);}};
 t.mock.method(globalThis,'setTimeout',globalThis.setTimeout);
 const oldMotion=globalThis.matchMedia,oldImage=globalThis.Image;
 globalThis.matchMedia=()=>({matches:false});globalThis.Image=class{};
 try{
  let calls=0;let clean=startOpeningPrologue(root,()=>calls++);
  const skip={target:{closest:s=>s==='[data-prologue-skip]'?{}:null},preventDefault(){},stopImmediatePropagation(){}};
  handlers.get('click')(skip);handlers.get('click')(skip);t.mock.timers.tick(500);assert.equal(calls,1);clean();assert.equal(handlers.size,0);
  calls=0;clean=startOpeningPrologue(root,()=>calls++);handlers.get('click')(skip);clean();t.mock.timers.tick(500);assert.equal(calls,0);
 }finally{if(oldMotion===undefined)delete globalThis.matchMedia;else globalThis.matchMedia=oldMotion;if(oldImage===undefined)delete globalThis.Image;else globalThis.Image=oldImage;}
});

test('rapid deliberate clicks reveal text then advance without dead-time; finish remains single-shot',t=>{
 t.mock.timers.enable({apis:['setTimeout']});
 const handlers=new Map(),line={textContent:''},button={disabled:false,setAttribute(){},focus(){}},content={innerHTML:'',querySelector:()=>line};
 const root={dataset:{},classList:{add(){},remove(){},toggle(){}},querySelector:s=>s==='.ink-cut-content'?content:s==='.ink-progress'?{}:button,addEventListener:(k,h)=>handlers.set(k,h),removeEventListener:k=>handlers.delete(k)};
 const oldMotion=globalThis.matchMedia,oldImage=globalThis.Image;
 globalThis.matchMedia=()=>({matches:false});globalThis.Image=class{};
 try{
  let calls=0;const clean=startOpeningPrologue(root,()=>calls++);
  const click={target:{closest:()=>null},preventDefault(){},stopImmediatePropagation(){}};
  for(let i=0;i<PROLOGUE_CUTS.length;i++){
   assert.equal(root.dataset.cut,PROLOGUE_CUTS[i].shot);
   handlers.get('click')(click);assert.equal(line.textContent,PROLOGUE_CUTS[i].text);
   handlers.get('click')(click);
  }
  handlers.get('click')(click);t.mock.timers.tick(179);assert.equal(calls,0);t.mock.timers.tick(1);assert.equal(calls,1);clean();assert.equal(handlers.size,0);
 }finally{if(oldMotion===undefined)delete globalThis.matchMedia;else globalThis.matchMedia=oldMotion;if(oldImage===undefined)delete globalThis.Image;else globalThis.Image=oldImage;}
});

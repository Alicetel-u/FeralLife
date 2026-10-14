import test from 'node:test';
import assert from 'node:assert/strict';
import {PROLOGUE_CUTS,openingPrologueHTML,prologueCutHTML,startOpeningPrologue} from '../src/opening-prologue.js';
test('letter text stays intact across cuts and insert art contains no embedded UI text',()=>{
 const letter=PROLOGUE_CUTS.filter(c=>c.speaker==='前大家からの手紙').map(c=>c.text).join('\n');
 for(const text of ['おめでとうございます。','あなたは本日から「けもの荘」の大家です。','現在の入居者は1名。','家賃収入は期待しないでください。','なお、私はもう関わりたくありません。','前大家より'])assert.ok(letter.includes(text));
 assert.equal(new Set(PROLOGUE_CUTS.filter(c=>c.image).map(c=>c.image)).size,3);
 assert.ok(openingPrologueHTML().includes('data-prologue-skip'));
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

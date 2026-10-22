import test from 'node:test';
import assert from 'node:assert/strict';
import {replaceConversationContent} from '../src/conversation-dom.js';

function portrait(character,src){
 const attrs=new Map([['data-character',character]]);
 const image={alt:character,getAttribute:()=>src};
 const caption={textContent:character};
 return {className:'stage-character left',get attributes(){return [...attrs].map(([name,value])=>({name,value}));},
  getAttribute:name=>attrs.get(name),setAttribute:(name,value)=>attrs.set(name,value),removeAttribute:name=>attrs.delete(name),
  querySelector:selector=>selector==='img'?image:caption};
}

for(const same of [false,true])test(`portrait reuse ${same?'preserves the same character':'never carries over a different character'}`,()=>{
 const original=globalThis.document;
 const previous=portrait('hostess','luna.png'),next=portrait(same?'hostess':'cat',same?'luna.png':'moku.png');
 let inserted=next,result;
 next.replaceWith=node=>{inserted=node;};
 const previousStage={querySelector:selector=>selector.endsWith('.left')?previous:null};
 const nextStage={querySelector:selector=>selector.endsWith('.left')?next:null};
 const fragment={querySelector:()=>nextStage};
 globalThis.document={createElement:()=>({content:fragment})};
 try{
  replaceConversationContent({querySelector:()=>previousStage,replaceChildren:content=>{result=content;}},'<stage>');
  assert.equal(result,fragment);assert.equal(inserted,same?previous:next);
  assert.equal(previous.getAttribute('data-character'),'hostess');
 }finally{if(original===undefined)delete globalThis.document;else globalThis.document=original;}
});

test('ultimate follow-up reuses the same landlord image and spark nodes without resetting them',()=>{
 const original=globalThis.document;
 const node=(src,cls)=>({getAttribute:key=>key==='src'?src:cls,setAttribute(key,value){if(key==='class')this.updatedClass=value;}});
 const previousManager=node('ougi.png','duel-manager'),nextManager=node('ougi.png','duel-manager duel-manager-held');
 const previousSparks=node(null,'duel-static-electricity'),nextSparks=node(null,'duel-static-electricity');
 let manager,sparks;
 nextManager.replaceWith=n=>{manager=n;};nextSparks.replaceWith=n=>{sparks=n;};
 const previousStage={querySelector:s=>s==='.duel-manager'?previousManager:s==='.duel-static-electricity'?previousSparks:null};
 const nextStage={querySelector:s=>s==='.duel-manager'||s==='.duel-manager-held'?nextManager:s==='.duel-static-electricity'?nextSparks:null};
 const fragment={querySelector:()=>nextStage};globalThis.document={createElement:()=>({content:fragment})};
 try{
  replaceConversationContent({querySelector:()=>previousStage,replaceChildren(){}},'');
  assert.equal(manager,previousManager);assert.equal(sparks,previousSparks);
  assert.equal(manager.updatedClass,'duel-manager duel-manager-held');
 }finally{if(original===undefined)delete globalThis.document;else globalThis.document=original;}
});

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

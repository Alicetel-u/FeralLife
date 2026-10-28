import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dialogueAdvanceHTML,chapterDialogueControlsHTML,createChapterDialogueControls} from '../src/dialogue-controls.js';
import {actThreeHTML,actThreeAfterHTML} from '../src/act-three-prologue.js';
import {actThreeMapHTML} from '../src/act-three-map.js';

test('ordinary dialogue and every act-three scene use one advance-button renderer and standard window styles',()=>{
 const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');assert.match(app,/:dialogueAdvanceHTML\(\)/);
 const next=dialogueAdvanceHTML();
 for(const html of [actThreeHTML(),actThreeAfterHTML(),actThreeMapHTML()]){
  assert.ok(html.includes(next));assert.ok(!html.includes('>次へ</button>'));assert.ok(!html.includes('>前へ</button>'));assert.ok(html.includes('voice-settings-open'));
 }
 const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');assert.doesNotMatch(css,/\.act3-dialogue\s+\.stage-bubble/);
 assert.ok(chapterDialogueControlsHTML().includes('data-dialogue-back>前のセリフへ'));
});

test('standard controls gate next while menu is open, restore it, and keep silent previews muted',()=>{
 const previous=globalThis.document;globalThis.document={hidden:false};
 const elements=new Map(),make=()=>({hidden:true,open:false,value:0,textContent:'',disabled:false,setAttribute(){},toggleAttribute(){},addEventListener(){},removeEventListener(){}});
 const section={querySelector:key=>elements.get(key)||elements.set(key,make()).get(key),classList:{toggle(){},remove(){}},addEventListener(){},removeEventListener(){}};
 let advances=0,backs=0,skips=0,changes=0,canAdvance=true;
 const controller=createChapterDialogueControls(section,{getState:()=>({active:true,canBack:true,canAdvance,line:{text:'確認'},lines:[]}),onNext:()=>advances++,onBack:()=>backs++,onSkip:()=>skips++,voice:{enabled:true,setSuspended(){},setEnabled(){changes++;}},bgm:{enabled:false,setEnabled(){changes++;}},silent:true});
 const click=name=>controller.click({target:{closest:()=>({hasAttribute:k=>k===name})},preventDefault(){},stopPropagation(){}});
 try{
  controller.refresh();click('data-dialogue-next');assert.equal(advances,1);canAdvance=false;controller.refresh();assert.equal(section.querySelector('[data-dialogue-next]').disabled,true);click('data-dialogue-next');assert.equal(advances,1);canAdvance=true;controller.refresh();
  click('data-event-menu');assert.equal(controller.blocked,true);click('data-dialogue-next');assert.equal(advances,1);
  click('data-dialogue-back');assert.equal(backs,1);click('data-event-menu');assert.equal(controller.blocked,false);
  click('data-dialogue-next');assert.equal(advances,2);click('data-event-skip');assert.equal(skips,1);
  click('data-voice-toggle');click('data-bgm-toggle');assert.equal(changes,0);
 }finally{controller.stop();if(previous===undefined)delete globalThis.document;else globalThis.document=previous;}
});

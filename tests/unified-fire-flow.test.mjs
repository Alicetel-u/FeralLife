import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {fireEndingHTML} from '../src/fire-ending.js';
import {ACT_ONE_EVENTS} from '../src/act-one.js';
import test from 'node:test';
import assert from 'node:assert/strict';

test('every first-act fire uses the same exterior and automatically enters rewind without a result card',()=>{
 const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 const source=app.slice(app.indexOf('function showActEnding('),app.indexOf('function showActTwoEnding('));
 for(const attempt of [1,2,3])for(const choice of Object.values(ACT_ONE_EVENTS).flatMap(e=>e.choices).filter(c=>c.bad)){
  const opened=[],rewinds=[];let complete;
  const context={state:{actOne:{chapter:1,attempt,status:'bad',failure:choice.bad}},endingShown:false,stopFireEnding:null,
   fireEndingHTML,openModal:html=>opened.push(html),modal:{querySelector:()=>({})},
   startFireEnding:(root,failure,finish)=>{complete=finish;return ()=>{};},beginRewind:afterFire=>rewinds.push(afterFire)};
  vm.createContext(context);vm.runInContext(source+'\nshowActEnding();',context);
  assert.equal(opened.length,1);assert.match(opened[0],/unified-fire/);assert.match(opened[0],/first-fire-exterior\.png/);
  assert.doesNotMatch(opened[0],/fire-room-background|data-act-rewind|act-ending-copy|showcase-word/);
  complete();assert.deepEqual(rewinds,[true]);assert.equal(opened.length,1,'no stopped result card or second fire');
 }
});

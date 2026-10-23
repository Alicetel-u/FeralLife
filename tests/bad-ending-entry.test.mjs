import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {badEndingEntryPlan,badEndingEntryHTML,startBadEndingEntry} from '../src/bad-ending-entry.js';

test('silent room-to-corridor transition has no extra BAD END writing or fire imagery',()=>{
 const plan=badEndingEntryPlan('corridor'),html=badEndingEntryHTML();
 assert.equal(plan.kind,'corridor');
 assert.ok(plan.hold>=500&&plan.veil>=450);
 assert.doesNotMatch(html,/bad-entry-caption|焦げ|燃え|火/);
 assert.match(html,/data-kind="corridor"/);
});
test('first tragedy transition connects the two story backgrounds instead of ending dialogue',()=>{
 const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 const stage=readFileSync(new URL('../src/first-fire-stage.js',import.meta.url),'utf8');
 assert.match(app,/firstFireCut\(lines,eventView.index\)==='trust'/);
 assert.match(app,/firstFireCut\(lines,cursor\)==='departure'/);
 assert.match(app,/showFirstFireCorridorCut\(id,cursor,page\)/);
 assert.doesNotMatch(app,/function enterBadEnding\(/);
 assert.match(stage,/first-fire-corridor.png/);
 assert.match(stage,/if\(inside\)return eventStageHTML/);
});
test('silent transition waits for final voice and pauses while tab is hidden',()=>{
 const cut={dataset:{},style:{setProperty(){}},isConnected:true};
 const host={isConnected:true,get firstElementChild(){return cut;},remove(){this.isConnected=false;cut.isConnected=false;},innerHTML:''};
 const doc={hidden:false,createElement:()=>host};
 const modal={ownerDocument:doc,append:()=>{}};
 let callback,clock=0,swap=0,busy=true;
 const raf=f=>{callback=f;return ++clock;};
 const stop=startBadEndingEntry(modal,'corridor',()=>swap++,{voiceBusy:()=>busy,raf,cancel:()=>{}});
 for(const n of [0,1000,2000])callback(n);
 assert.equal(swap,0);busy=false;
 for(const n of [2100,2220,2340])callback(n);
 assert.equal(cut.dataset.phase,'hold');
 doc.hidden=true;callback(5000);doc.hidden=false;
 for(let n=5200;n<11000&&swap===0;n+=100)callback(n);
 assert.equal(swap,1);stop();
});

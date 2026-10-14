import test from 'node:test';
import assert from 'node:assert/strict';
import {WorldRenderGate} from '../src/render-policy.js';
test('unchanged paused world settles then stops; live play retains every frame',()=>{
 const g=new WorldRenderGate(),s={hour:17,nextId:1};let draws=0;
 for(let n=0;n<600;n++)if(g.shouldDraw(s,n*1000/60,true,'room-101',[]))draws++;
 assert.ok(draws<=13);assert.ok(draws>=12);
 for(let n=0;n<60;n++)assert.equal(g.shouldDraw(s,10000+n*1000/60,false,'room-101',[]),true);
});
test('pause cache invalidates for cameras, time, events, speech and restored saves',()=>{
 const g=new WorldRenderGate();let now=0;let s={hour:17,nextId:1};
 const settle=(camera='room-101',bubbles=[])=>{now+=1000;g.shouldDraw(s,now,true,camera,bubbles);now+=500;assert.equal(g.shouldDraw(s,now,true,camera,bubbles),false);};
 settle();assert.equal(g.shouldDraw(s,now+100,true,'exterior',[]),true);
 settle();s.hour++;assert.equal(g.shouldDraw(s,now+100,true,'room-101',[]),true);
 settle();s.nextId++;assert.equal(g.shouldDraw(s,now+100,true,'room-101',[]),true);
 settle();assert.equal(g.shouldDraw(s,now+100,true,'room-101',[{speaker:'cat',text:'ニャ。'}]),true);
 settle();s={...s};assert.equal(g.shouldDraw(s,now+100,true,'room-101',[]),true);
});

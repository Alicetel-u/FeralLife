import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createActOne,advanceActOne,validActOne} from '../src/act-one.js';
import {managerTarget,managerFrame,managerReaction,advanceManager} from '../src/manager-life.js';
import {CHARACTER_ART} from '../src/character-art.js';
import {eventStageHTML} from '../src/event-stage.js';
test('caretaker sweeps outside without becoming a tenant or changing saved state',()=>{
 const s=createActOne(42,[],2,true),before=JSON.stringify(s),target=managerTarget(s);
 assert.equal(target.zone,'street');assert.equal(target.chat,false);
 assert.equal(managerFrame(target,0),'clean_a');assert.equal(managerFrame(target,.4),'clean_b');
 assert.equal(JSON.stringify(s),before);assert.equal(s.residents.length,1);assert.ok(validActOne(s));
});
test('outdoor encounters stop the broom and put the caretaker beside the visitor',()=>{
 const s=createActOne(42,[],2,true);advanceActOne(s,2.5);
 const target=managerTarget(s,[{speaker:'manager',text:'戻ったら振り出しだろ、それ。'}]);
 assert.equal(target.chat,true);assert.equal(target.zone,'street');assert.equal(target.pose,'retort');
 assert.equal(managerFrame(target,1),'retort');
});
test('reactions distinguish joy, annoyance, regret, surprise and comic exasperation',()=>{
 for(const [line,pose] of [[{emotion:'happy'},'happy'],[{emotion:'angry'},'angry'],[{text:'俺のせいだ……。'},'sad'],[{text:'燃えてんじゃねぇか！！'},'surprised'],[{text:'なんで俺が決めるんだよ……。'},'retort'],[{text:'おはよう！'},'idle']])assert.equal(managerReaction(line),pose);
});
test('every approved caretaker pose ships at one foot origin, with distinct sweep frames',async()=>{
 const art=CHARACTER_ART.manager;assert.deepEqual(art.origin,[80,156]);assert.equal(art.displayHeight,44);
 const frames=await Promise.all([art.src,...Object.values(art.poses).map(p=>p.src)].map(path=>readFile(path)));
 for(const frame of frames){assert.equal(frame.readUInt32BE(16),160);assert.equal(frame.readUInt32BE(20),160);assert.equal(frame[25],6);}
 assert.notDeepEqual(frames[1],frames[2]);
});
test('landlord reaction is visible without removing either resident from a shared conversation',()=>{
 const event={detail:'大家さん。',cast:['hostess','cat'],lines:[{speaker:'hostess',text:'大家さん。'},{speaker:'manager',text:'なんで俺が決めるんだよ……。'}]};
 const html=eventStageHTML(event,[],1);for(const id of ['hostess','cat','manager'])assert.ok(html.includes('data-character="'+id+'"'));
 assert.ok(html.includes('manager/poses/retort.png'));assert.ok(!html.includes('observation-story'));
});

test('landlord reaches first-floor encounters via stairs and pause holds his position',()=>{
 const target={x:520,y:440,zone:'hall'};let p=advanceManager(null,target,0);assert.equal(p.x,650);assert.equal(p.y,513);
 for(let i=0;i<5;i++)p=advanceManager(p,target,.1);assert.equal(p.y,513);assert.ok(p.x>650);
 const paused=advanceManager(p,target,0);assert.equal(paused.x,p.x);assert.equal(paused.y,p.y);
 for(let i=0;i<100;i++)p=advanceManager(p,target,.1);assert.equal(p.x,520);assert.equal(p.y,440);
});

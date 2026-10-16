import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createActOne,advanceActOne,validActOne} from '../src/act-one.js';
import {managerTarget,managerFrame,managerReaction,advanceManager} from '../src/manager-life.js';
import {CHARACTER_ART,SCENE_ART} from '../src/character-art.js';
import {WorldRenderer} from '../src/renderer.js';
import {foregroundKeys} from '../src/exterior-occlusion.js';
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
 for(const [a,b] of [['clean_a','clean_b'],['walk_a','walk_b']])assert.notDeepEqual(await readFile(art.poses[a].src),await readFile(art.poses[b].src));
});
test('landlord has no conversation portrait and both residents remain visible',()=>{
 const event={detail:'大家さん。',cast:['hostess','cat'],lines:[{speaker:'hostess',text:'大家さん。'},{speaker:'manager',text:'なんで俺が決めるんだよ……。'}]};
 const html=eventStageHTML(event,[],1);for(const id of ['hostess','cat'])assert.ok(html.includes('data-character="'+id+'"'));
 assert.ok(!html.includes('data-character="manager"'));assert.ok(!html.includes('assets/characters/manager'));assert.ok(html.includes('なんで俺が決めるんだよ'));assert.ok(!html.includes('observation-story'));
 for(const cast of [[],['cat'],['manager']]){
  const solo=eventStageHTML({...event,cast},[],1);
  assert.ok(!solo.includes('data-character="manager"'));assert.ok(!solo.includes('assets/characters/manager'));
 }
});

test('landlord walks in alternating frames, faces travel direction, then resumes sweeping on arrival',()=>{
 const target={x:610,y:513,zone:'street',chat:false,direction:1};
 let p=advanceManager(null,target,.1);
 assert.equal(p.moving,true);assert.equal(p.direction,-1);
 assert.equal(managerFrame(target,0,p.moving),'walk_a');
 assert.equal(managerFrame(target,.25,p.moving),'walk_b');
 const paused=advanceManager(p,target,0);assert.deepEqual(paused,p);
 for(let i=0;i<4;i++)p=advanceManager(p,target,.1);
 assert.equal(p.x,610);assert.equal(p.moving,false);
 assert.equal(managerFrame(target,0,p.moving),'clean_a');
 const returning=advanceManager(p,{...target,x:650},.1);assert.equal(returning.direction,1);
});

test('landlord reaches first-floor encounters via stairs and pause holds his position',()=>{
 const target={x:520,y:440,zone:'hall'};let p=advanceManager(null,target,0);assert.equal(p.x,650);assert.equal(p.y,513);
 for(let i=0;i<5;i++)p=advanceManager(p,target,.1);assert.equal(p.y,513);assert.ok(p.x>650);
 const paused=advanceManager(p,target,0);assert.equal(paused.x,p.x);assert.equal(paused.y,p.y);
 for(let i=0;i<100;i++)p=advanceManager(p,target,.1);assert.equal(p.x,520);assert.equal(p.y,440);
});

test('landlord uses stair rails in transit and hallway rails on arrival in both directions',()=>{
 let p=null;
 for(const target of [{x:520,y:440,zone:'hall'},{x:650,y:513,zone:'street'}]){
  let stairs=false;
  for(let i=0;i<100;i++){
   p=advanceManager(p,target,.1);
   if(p.y>440&&p.y<513){stairs=true;assert.equal(p.zone,'stairs');assert.ok(foregroundKeys(p).includes('stairs'));}
  }
  assert.ok(stairs);assert.equal(p.zone,target.zone);
  assert.equal(foregroundKeys(p).includes('lower'),target.zone==='hall');
 }
});

test('landlord sprite is covered by clipped foreground with matching night tint',()=>{
 const calls=[],scene={},sprite={width:160,height:160};
 const previousScene=SCENE_ART.image,previousSprite=CHARACTER_ART.manager.image;
 try{
  SCENE_ART.image=scene;CHARACTER_ART.manager.image=sprite;
  const ctx=new Proxy({}, {get:(_,key)=>(...args)=>calls.push([key,...args]),set:(_,key,value)=>(calls.push([key,value]),true)});
  const renderer=Object.create(WorldRenderer.prototype);renderer.ctx=ctx;renderer.focus=false;
  renderer.managerPosition={x:520,y:440,zone:'hall'};renderer.managerTarget={chat:true,pose:'idle',direction:-1};
  renderer.drawExterior({residents:[]},null,0,.57);
  const drawn=calls.findIndex(c=>c[0]==='drawImage'&&c[1]===sprite);
  const foreground=calls.findIndex((c,i)=>i>drawn&&c[0]==='drawImage'&&c[1]===scene);
  assert.ok(drawn>=0&&foreground>drawn);
  assert.ok(calls.slice(drawn,foreground).some(c=>c[0]==='clip'));
  assert.ok(calls.slice(foreground).some(c=>c[0]==='fillStyle'&&c[1]==='rgba(16,27,49,0.57)'));
 }finally{SCENE_ART.image=previousScene;CHARACTER_ART.manager.image=previousSprite;}
});

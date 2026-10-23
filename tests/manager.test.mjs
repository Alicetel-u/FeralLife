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
test('every approved caretaker pose ships at one foot origin, with distinct walk frames',async()=>{
 const art=CHARACTER_ART.manager;assert.ok(art.origin[0]>0&&art.origin[1]<=512);assert.ok(art.displayHeight>0);
 const frames=await Promise.all([art.src,...Object.values(art.poses).map(p=>p.src)].map(path=>readFile(path)));
 for(const frame of frames){assert.equal(frame.readUInt32BE(16),512);assert.equal(frame.readUInt32BE(20),512);assert.equal(frame[25],6);}
 for(const [a,b] of [['walk_a','walk_b']])assert.notDeepEqual(await readFile(art.poses[a].src),await readFile(art.poses[b].src));
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
 assert.equal(managerFrame(target,.4,p.moving),'walk_b');
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

test('all observation poses use the matched master and a fixed pivot without legacy daily art',async()=>{
 const art=CHARACTER_ART.manager;
 assert.ok(art.src.includes('/matched-v3/'));assert.equal(art.portraitSrc,art.src);
 const metadata=JSON.parse(await readFile('assets/characters/manager/matched-v3/asset.json','utf8'));
 for(const [name,pose] of Object.entries(art.poses)){
  if(name.startsWith('battle_'))continue;
  assert.ok(pose.src.includes('/matched-v3/'),name);
  assert.deepEqual(pose.origin,[256,492],name);
 }
 assert.ok(Math.abs(art.displayHeight*metadata.standingBodyHeight/512-44)<1e-6);
 assert.notDeepEqual(await readFile(art.poses.clean_a.src),await readFile(art.poses.clean_b.src));
 const walk=['walk_a','walk_pass_a','walk_b','walk_pass_b'];
 assert.equal(new Set(walk.map(name=>metadata.poses[name].packagingScale)).size,1,'entire gait has one source scale');
 assert.equal(new Set(walk.map(name=>art.poses[name].src)).size,4);
});

test('landlord gait follows distance through four phases and does not advance on pause',()=>{
 const target={x:900,y:513,zone:'street',chat:false,direction:1};
 const frames=['walk_a','walk_pass_a','walk_b','walk_pass_b'];
 for(let i=0;i<8;i++){
  assert.equal(managerFrame(target,0,true,i*20),frames[i%4]);
  assert.equal(managerFrame(target,999,true,i*20),frames[i%4],'global time cannot change a planted gait phase');
 }
 let p=advanceManager(null,target,.1);
 assert.equal(p.walkDistance,10);assert.equal(p.direction,1);
 const paused=advanceManager(p,target,0);assert.deepEqual(paused,p);
 assert.equal(managerFrame(target,20,true,paused.walkDistance),managerFrame(target,0,true,p.walkDistance));
 let quarter=advanceManager(null,target,.025);
 for(let i=0;i<3;i++)quarter=advanceManager(quarter,target,.025);
 assert.equal(quarter.walkDistance,p.walkDistance);assert.equal(quarter.x,p.x);
 p=advanceManager(p,{...target,x:400},.1);assert.equal(p.direction,-1);assert.equal(p.walkDistance,20);
});


test('listening in the first evening encounter puts the broom away until the encounter ends',()=>{
 const s=createActOne(42,[],2,true);advanceActOne(s,2.5);
 const before=JSON.stringify(s);
 for(const bubbles of [[{speaker:'cat',text:'大家',emotion:'neutral'}],[],[{speaker:'manager',text:'ああ。',emotion:'neutral'}]]){
  const target=managerTarget(s,bubbles);
  assert.equal(target.chat,true);assert.equal(target.pose,'idle');
  for(const time of [0,.4,1])assert.equal(managerFrame(target,time),'idle');
 }
 assert.equal(JSON.stringify(s),before,'pose changes must not mutate the save');
 s.residents.find(r=>r.type==='cat').lifeBeat=19;
 const alone=managerTarget(s);assert.equal(alone.chat,false);
 assert.equal(managerFrame(alone,0),'clean_a');assert.equal(managerFrame(alone,.4),'clean_b');
});

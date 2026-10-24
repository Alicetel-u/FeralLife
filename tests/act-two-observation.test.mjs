import test from 'node:test';
import assert from 'node:assert/strict';
import {createActOne,validActOne} from '../src/act-one.js';
import {beginActTwo,advanceActTwo,answerActTwo} from '../src/act-two.js';
import {ACT_TWO_OBSERVATION_BEATS,LUNA_NEW_ALLY_ID,newAllyPosition,newAllyFrame,NEW_ALLY_END} from '../src/act-two-observation.js';
import {observationView,observationClockLimit,tickObservation,observationLineSeconds} from '../src/act-one-observation.js';
import {createTalk,stepTalk} from '../src/dialogue.js';
import {createDeveloperObservation,developerObservationBeats} from '../src/debug-observation.js';
import {WorldRenderer} from '../src/renderer.js';
import {exteriorFeet} from '../src/exterior-occlusion.js';
import {exteriorRoomBounds} from '../src/movement.js';
import {managerTarget,managerFrame} from '../src/manager-life.js';
const start=()=>{const s=beginActTwo(createActOne(32));Object.assign(s.actOne,{started:true,prologuePending:false,titlePending:false});observationView(s);return s;};
const step=(s,speed)=>{tickObservation(s,.1);advanceActTwo(s,Math.min(speed/100,Math.max(0,observationClockLimit(s)-s.hour)));tickObservation(s,0);};
const direct=(s,index,elapsed=0)=>{s.actOne.observation.current={id:LUNA_NEW_ALLY_ID,index,elapsed};};

test('only the approved New Ally script and one debug entrance remain',()=>{
 const [beat]=ACT_TWO_OBSERVATION_BEATS;
 assert.equal(ACT_TWO_OBSERVATION_BEATS.length,1);assert.equal(developerObservationBeats('2').length,1);
 assert.equal(beat.lines.length,32);assert.equal(beat.lines[0].text,'だからダメだって言ってんだろ！');
 assert.equal(beat.lines[11].text,'モクの冷蔵庫、ビールでいっぱいになったニャ。');
 assert.equal(beat.lines[17].text,'せっかくだし、今日は休肝日にしよっか♡');
 assert.equal(beat.lines[21].text,'お前が味方に呼んだんだろ！');assert.equal(beat.lines.at(-1).text,'えへへ。そっか♡');
 assert.ok(beat.lines.every(l=>l.voicePerformance.startsWith('new-ally-')));
 assert.ok(new Set(beat.lines.map(l=>l.voicePerformance)).size>=8);
 assert.equal(createDeveloperObservation('2','luna-tea'),null);
});

for(const speed of [1,6,20])test(`normal and debug entry play the complete part at speed ${speed} before the same trouble`,()=>{
 for(const s of [start(),createDeveloperObservation('2',LUNA_NEW_ALLY_ID)]){
  const seen=new Set(),talk=createTalk();let frames=0;
  while(!s.actOne.pending&&frames++<3000){step(s,speed);const v=observationView(s);stepTalk(talk,s,frames*100,false);
   if(v?.identity){seen.add(v.identity);assert.equal(talk.bubbles[0].text,v.line.text);assert.equal(talk.chapterChat,null);}
  }
  assert.equal(s.actOne.pending?.scene,'bag');assert.equal(s.hour,66);assert.equal(seen.size,32);
  assert.ok(validActOne(JSON.parse(JSON.stringify(s))));assert.equal(newAllyFrame(s),null);
  const lines=s.events.find(e=>e.id===s.actOne.pending.eventId).lines;
  assert.equal(lines.filter(l=>l.text==='男「あっ！ ルナちゃん！」').length,1);
  assert.ok(lines.findIndex(l=>l.speaker==='cat')>lines.findIndex(l=>l.text==='男は大家を押しのけようとする。'));
  answerActTwo(s,s.actOne.pending.eventId,'loan');assert.equal(observationView(s),null);
 }
});

test('every line boundary retains the previous position, and normal and debug blocking are identical',()=>{
 const normal=start();normal.hour=65.1;tickObservation(normal,0);
 const debug=createDeveloperObservation('2',LUNA_NEW_ALLY_ID);
 for(let i=0;i<31;i++)for(const type of ['cat','hostess','manager']){
  direct(normal,i,Math.max(5,observationLineSeconds(ACT_TWO_OBSERVATION_BEATS[0].lines[i])));
  const end=newAllyPosition(normal,type);direct(normal,i+1,0);const next=newAllyPosition(normal,type);
  assert.ok(Math.hypot(next.x-end.x,next.y-end.y)<.001,`${type}: line ${i} must not snap back`);
  for(const elapsed of [0,.1,.4,.9,1.5,4.2]){
   direct(normal,i,elapsed);direct(debug,i,elapsed);
   assert.deepEqual(newAllyPosition(normal,type),newAllyPosition(debug,type));
  }
 }
});

test('the opening argument stays on screen, and Luna is not hidden by the exterior cut',()=>{
 const s=createDeveloperObservation('2',LUNA_NEW_ALLY_ID),room=exteriorRoomBounds(102);
 const inside=type=>{const p=newAllyPosition(s,type);assert.equal(p.zone,'hall');assert.ok(p.x>=room.x+10&&p.x<=room.x+room.w-10,`${type} x ${p.x}`);};
 direct(s,0,.2);assert.equal(newAllyFrame(s).view,'interior');inside('cat');inside('manager');
 assert.equal(newAllyPosition(s,'manager').direction,-1);
 const renderer=Object.create(WorldRenderer.prototype);
 Object.assign(renderer,{view:'interior',focus:true,focusRoom:102,reducedMotion:false});
 const anchor=renderer.speechAnchor(s,'manager');
 assert.ok(anchor.x>80&&anchor.x<1920,`manager speech ${anchor.x}`);
 for(let elapsed=0;elapsed<0.7;elapsed+=.05){
  direct(s,7,elapsed);
  if(newAllyFrame(s).view==='interior'){inside('cat');inside('manager');assert.equal(newAllyPosition(s,'hostess').zone,'room');}
 }
 direct(s,7,0);assert.equal(newAllyFrame(s).view,'interior');assert.equal(newAllyPosition(s,'hostess').zone,'room');
 assert.equal(newAllyPosition(s,'manager',{reduced:true}).cameraView,'exterior');
 direct(s,7,.7);assert.equal(newAllyFrame(s).view,'exterior');assert.equal(newAllyPosition(s,'hostess').zone,'hall');
});

test('the trio face each other in the hall, Moku hides behind Luna and returns alone, then the others take the stairs',()=>{
 const s=createDeveloperObservation('2',LUNA_NEW_ALLY_ID),renderer=Object.create(WorldRenderer.prototype);
 direct(s,0,1);assert.equal(newAllyFrame(s).view,'interior');assert.equal(newAllyPosition(s,'hostess').zone,'room');
 direct(s,7,1);
 const [cat,luna,manager]=['cat','hostess','manager'].map(t=>newAllyPosition(s,t));
 assert.ok(cat.x<luna.x&&luna.x<manager.x);assert.ok(cat.y<luna.y);
 assert.ok([cat,luna,manager].every(p=>p.zone==='hall'));assert.equal(manager.direction,-1);
 assert.equal(renderer.interiorResidentPosition(s,s.residents.find(r=>r.type==='cat')).direction,cat.direction);
 direct(s,24,1.4);assert.equal(newAllyPosition(s,'cat').room,101);assert.equal(newAllyPosition(s,'cat').zone,'room');
 assert.equal(newAllyPosition(s,'hostess').zone,'hall');assert.equal(newAllyPosition(s,'manager').zone,'hall');
 direct(s,31,2.1);assert.ok(newAllyPosition(s,'manager').x>=777);assert.equal(managerFrame(managerTarget(s),0,true,newAllyPosition(s,'manager').walkDistance).startsWith('walk'),true);
 direct(s,31,4.2);for(const type of ['cat','hostess','manager']){
  const p=newAllyPosition(s,type);assert.equal(p.x,NEW_ALLY_END[type].x);assert.equal(p.y,NEW_ALLY_END[type].y);
 }
});

test('pause, voices, reload, reduced motion and old saves retain a stable scene',()=>{
 let s=createDeveloperObservation('2',LUNA_NEW_ALLY_ID);direct(s,17,.2);
 const before=JSON.stringify(s);for(let i=0;i<10;i++)tickObservation(s,.1,{stopped:true});assert.equal(JSON.stringify(s),before);
 s=JSON.parse(before);for(let i=0;i<40;i++)tickObservation(s,.1,{voiceBusy:true});assert.equal(observationView(s).lineIndex,17);
 for(let i=0;i<32;i++)for(const type of ['cat','hostess','manager']){
  direct(s,i,0);const p=newAllyPosition(s,type,{reduced:true});direct(s,i,3);
  assert.deepEqual(newAllyPosition(s,type,{reduced:true}),p);
 }
 s.actOne.observation={version:2,done:['luna-unpack','luna-neighbor'],seen:['luna-tea'],gap:.08,current:{id:'luna-tidy',index:4,elapsed:.3}};
 observationView(s);assert.deepEqual(s.actOne.observation.done,[]);assert.equal(s.actOne.observation.current,null);
 tickObservation(s,0);assert.equal(observationView(s).identity,LUNA_NEW_ALLY_ID+':0');
});


test('speech follows the same courtyard camera as the directed sprites',()=>{
 const s=createDeveloperObservation('2',LUNA_NEW_ALLY_ID);direct(s,31,2.2);
 const renderer=Object.create(WorldRenderer.prototype);Object.assign(renderer,{view:'exterior',focus:true,managerPosition:newAllyPosition(s,'manager')});
 const luna=newAllyPosition(s,'hostess'),manager=renderer.managerPosition;
 const projected=renderer.projectExterior(manager.x,exteriorFeet(manager).y-80*.86,luna);
 const anchor=renderer.speechAnchor(s,'manager');assert.equal(anchor.x,projected.x);assert.equal(anchor.y,projected.y);
});


test('the real renderer uses the authored landlord route once, without a second walk toward it',()=>{
 const s=createDeveloperObservation('2',LUNA_NEW_ALLY_ID);
 const ctx=new Proxy({}, {get:()=>()=>{},set:()=>true});
 const renderer=new WorldRenderer({width:1200,height:675,getContext:()=>ctx});
 renderer.view='exterior';renderer.managerPosition={x:650,y:513,zone:'street'};
 renderer.drawExterior=()=>{};renderer.drawSpeech=()=>{};
 let timestamp=100;
 for(const [index,elapsed] of [[0,0],[7,.4],[24,1.4],[31,0],[31,.8],[31,2],[31,4.2]]){
  direct(s,index,elapsed);renderer.draw(s,timestamp+=100,false,[]);
  assert.deepEqual(renderer.managerPosition,newAllyPosition(s,'manager',{reduced:renderer.reducedMotion}));
  const before=JSON.stringify(renderer.managerPosition);renderer.draw(s,timestamp+=100,true,[]);
  assert.equal(JSON.stringify(renderer.managerPosition),before,'pausing never continues a second route');
 }
});

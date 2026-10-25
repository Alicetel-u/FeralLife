import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ACT_TWO_SECOND_OBSERVATION_BEATS,FOUR_KINGS_IDS,fourKingsFrame,fourKingsPosition,playFourKingsNotice} from '../src/act-two-observation-two.js';
import {createDeveloperObservation,developerObservationBeats} from '../src/debug-observation.js';
import {advanceActTwo,answerActTwo,rewindActTwo,resumeActTwoRewind,ACT_TWO_EVENTS} from '../src/act-two.js';
import {observationView,tickObservation,observationClockLimit} from '../src/act-one-observation.js';
import {validateSave} from '../src/simulation.js';
import {validActOne} from '../src/act-one.js';
import {WorldRenderer} from '../src/renderer.js';
import {secondActLife} from '../src/act-two-life.js';
const start=()=>createDeveloperObservation('2',FOUR_KINGS_IDS[0]);
const step=s=>{tickObservation(s,.1);advanceActTwo(s,Math.min(.03,Math.max(0,observationClockLimit(s)-s.hour)));tickObservation(s,0);};

test('the entire approved part-two dialogue is implemented verbatim, with two debug part entrances',()=>{
 const doc=readFileSync('docs/story/act2-observation-part2-approved.md','utf8');
 const body=doc.slice(doc.indexOf('## シーン1'),doc.indexOf('## 観察パート2終了'));
 const expected=[...body.matchAll(/\*\*(ルナ|モク|大家)\*\*「(.+)」/g)].map(m=>[m[1],m[2]]);
 const actual=ACT_TWO_SECOND_OBSERVATION_BEATS.flatMap(b=>b.lines.map(l=>[l.name,l.text]));
 assert.equal(actual.length,37);assert.deepEqual(actual,expected);
 assert.deepEqual(developerObservationBeats('2').map(b=>b.id),['luna-new-ally',FOUR_KINGS_IDS[0]]);
 assert.equal(ACT_TWO_EVENTS.duel.at,84);assert.equal(ACT_TWO_EVENTS.bag.at,66);
});

test('the complete morning plays at authored times before the original noon battle',()=>{
 const s=start(),seen=new Map();let frames=0;
 assert.equal(s.hour,80);assert.deepEqual(s.actOne.completed,['bag']);
 while(!s.actOne.pending&&frames++<4000){step(s);const v=observationView(s);if(v?.identity)seen.set(v.identity,s.hour);}
 assert.equal(seen.size,37);assert.equal(s.hour,84);assert.equal(s.actOne.pending.scene,'duel');
 for(const beat of ACT_TWO_SECOND_OBSERVATION_BEATS)for(let i=0;i<beat.lines.length;i++)assert.equal(seen.get(beat.id+':'+i),beat.at);
 assert.ok(validateSave(s)&&validActOne(s));assert.equal(observationView(s).line,undefined);
 const before=s.events.find(e=>e.id===s.actOne.pending.eventId).lines;
 assert.ok(before.some(l=>l.text==='結婚にお試し期間をつけるな！！'));
 assert.deepEqual(s.actOne.completed,['bag']);
});

test('the shared room and exits retain floor placement, distinguish speakers and leave Luna alone',()=>{
 const s=start(),r=Object.create(WorldRenderer.prototype);Object.assign(r,{view:'interior',focus:true,focusRoom:102});
 for(const type of ['cat','hostess','manager']){const p=fourKingsPosition(s,type);assert.equal(p.room,102);assert.equal(p.zone,'room');assert.ok(p.y>=436);assert.equal(p.height,300);assert.equal(r.speechAnchor(s,type).tail,true);}
 const anchors=['cat','hostess','manager'].map(t=>r.speechAnchor(s,t).x);assert.ok(anchors[0]<anchors[1]&&anchors[1]<anchors[2]);
 s.hour=80.5;s.actOne.observation.done=[FOUR_KINGS_IDS[0]];
 for(const [index,elapsed] of [[4,1],[10,2.5]]){
  s.actOne.observation.current={id:FOUR_KINGS_IDS[1],index,elapsed};
  const p=fourKingsPosition(s,'hostess');assert.equal(p.cameraView,index===4?'exterior':'interior');
 }
 assert.equal(fourKingsPosition(s,'cat').room,101);assert.equal(fourKingsPosition(s,'manager').visible,false);
 s.hour=82.5;s.actOne.observation.current=null;s.actOne.observation.done=FOUR_KINGS_IDS.slice(0,3);
 assert.equal(fourKingsPosition(s,'hostess').pose,'clean');assert.equal(fourKingsPosition(s,'cat').visible,false);
 s.hour=84;s.actOne.observation.done=[...FOUR_KINGS_IDS];secondActLife(s);
 assert.equal(fourKingsPosition(s,'hostess').zone,'street');assert.equal(fourKingsPosition(s,'cat').zone,'hall');assert.equal(fourKingsPosition(s,'manager').zone,'street');
});

test('pause, voice completion, reload and legacy post-trouble saves do not skip the new morning',()=>{
 const s=start();for(let i=0;i<10;i++)tickObservation(s,.1,{stopped:true});assert.equal(observationView(s).lineIndex,0);
 for(let i=0;i<60;i++)tickObservation(s,.1,{voiceBusy:true});assert.equal(observationView(s).lineIndex,0);assert.equal(s.hour,80);
 const reload=JSON.parse(JSON.stringify(s));assert.deepEqual(fourKingsFrame(reload),fourKingsFrame(s));
 const old=start();old.hour=67;delete old.actOne.fourKingsObservationVersion;delete old.actOne.observation;
 for(const resident of old.residents){resident.action='outing';delete resident.journey;}
 observationView(old);secondActLife(old);assert.equal(old.hour,80);tickObservation(old,0);assert.equal(observationView(old).identity,FOUR_KINGS_IDS[0]+':0');assert.ok(validateSave(old)&&validActOne(old));
});

test('battle rewinds preserve the resolved first trouble and never replay the morning observation',()=>{
 let s=start();for(let i=0;!s.actOne.pending&&i<4000;i++)step(s);
 for(const id of ['vow','shield','future','ultimate'])answerActTwo(s,s.actOne.pending.eventId,id);
 s=rewindActTwo(s);assert.equal(s.hour,84);assert.deepEqual(s.actOne.completed,['bag']);
 resumeActTwoRewind(s);assert.equal(s.actOne.pending.scene,'duel');assert.equal(s.actOne.duel.round,0);assert.equal(s.events.find(e=>e.id===s.actOne.pending.eventId).rewindChoiceReady,true);
 tickObservation(s,0);assert.equal(s.actOne.observation?.current??null,null);assert.equal(fourKingsFrame(s),null);
});

test('phone notices sound once per notice on the shared voice audio context',()=>{
 let tones=0;const context={currentTime:0,destination:{},createOscillator(){tones++;return {frequency:{},connect(){},start(){},stop(){},disconnect(){}};},createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}};
 const line=ACT_TWO_SECOND_OBSERVATION_BEATS[0].lines[0];
 assert.equal(playFourKingsNotice(line,'first',context,.5),true);assert.equal(tones,2);
 assert.equal(playFourKingsNotice(line,'first',context,.5),false);assert.equal(tones,2);
 assert.equal(playFourKingsNotice(line,'reply',context,.5),true);assert.equal(tones,4);
 assert.equal(playFourKingsNotice(line,'muted',context,0),false);
});


test('the seated phone scene keeps its seat and pose instead of being overridden by a standing expression',()=>{
 const s=start();s.hour=81.5;s.actOne.observation.done=FOUR_KINGS_IDS.slice(0,2);
 for(let index=0;index<3;index++){s.actOne.observation.current={id:FOUR_KINGS_IDS[2],index,elapsed:1};const p=fourKingsPosition(s,'hostess');assert.equal(p.pose,'sit');assert.equal(p.lockPose,true);assert.equal(p.seat,true);assert.ok(p.props.some(p=>p.kind==='phone'));}
});

test('voiced replies advance on their own completion while the silent reaction stays brief',()=>{
 const s=start();tickObservation(s,0);
 tickObservation(s,.25,{voiceBusy:true});
 assert.equal(observationView(s).lineIndex,0);
 tickObservation(s,0,{voiceEnded:true});
 assert.equal(observationView(s).lineIndex,1);
 // A stale completion must not be supplied for the next line by the player.
 tickObservation(s,.25,{voiceBusy:true});
 assert.equal(observationView(s).lineIndex,1);
 s.actOne.observation.current={id:FOUR_KINGS_IDS[0],index:15,elapsed:0};
 tickObservation(s,.25);tickObservation(s,.15);
 assert.equal(observationView(s).lineIndex,16);
});

test('room conversations use the shared size and stable floor positions before either exit',()=>{
 const s=start();
 for(const stage of [0,1])for(const index of (stage===0?[0,9,18]:[0,1,2,3])){
  s.actOne.observation.current={id:FOUR_KINGS_IDS[stage],index,elapsed:1};
  const cast=['cat','hostess','manager'].map(type=>fourKingsPosition(s,type));
  for(const p of cast){assert.equal(p.height,300);assert.equal(p.y,440);assert.equal(p.zone,'room');assert.equal(p.roomGroup,true);assert.equal(p.moving,false);}
  assert.ok(cast[1].x-cast[0].x>=28);assert.ok(cast[2].x-cast[1].x>=28);
  assert.equal(cast[2].x,500,'the landlord stays in the shot while talking');
 }
 s.actOne.observation.current={id:FOUR_KINGS_IDS[2],index:0,elapsed:1};
 assert.equal(fourKingsPosition(s,'hostess').height,300);
 assert.equal(fourKingsPosition(s,'hostess').roomGroup,false);
});

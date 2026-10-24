import test from 'node:test';
import assert from 'node:assert/strict';
import {createActOne,validActOne} from '../src/act-one.js';
import {beginActTwo,advanceActTwo,answerActTwo} from '../src/act-two.js';
import {ACT_TWO_OBSERVATION_BEATS,lunaEscapePosition} from '../src/act-two-observation.js';
import {observationView,observationClockLimit,tickObservation} from '../src/act-one-observation.js';
import {createTalk,stepTalk} from '../src/dialogue.js';
import {sampleJourney} from '../src/movement.js';
const start=()=>{const s=beginActTwo(createActOne(32));Object.assign(s.actOne,{started:true,prologuePending:false,titlePending:false});observationView(s);return s;};
const step=(s,speed)=>{tickObservation(s,.25);advanceActTwo(s,Math.min(speed/40,Math.max(0,observationClockLimit(s)-s.hour)));tickObservation(s,0);};

for(const speed of [1,6,20])test(`Act 2 at speed ${speed}: all jokes finish before the first incident, without interrupting the authored scene`,()=>{
 const s=start(),seen=new Set(),talk=createTalk();let frames=0;
 while(!s.actOne.pending&&frames++<1200){
  step(s,speed);const v=observationView(s);stepTalk(talk,s,frames*250,false);
  if(v?.identity)seen.add(v.identity);
  if(v?.line){
   const positions=['cat','hostess'].map(type=>sampleJourney(s.residents.find(r=>r.type===type),s.hour));
   assert.ok(positions.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));
   assert.equal(talk.chapterChat,null);assert.equal(talk.bubbles[0].text,v.line.text);
  }
 }
 assert.equal(s.actOne.pending?.scene,'bag');assert.equal(s.hour,66);
 assert.equal(seen.size,ACT_TWO_OBSERVATION_BEATS.reduce((n,b)=>n+b.lines.length,0));
 assert.ok(validActOne(JSON.parse(JSON.stringify(s))));
 if(speed===6)assert.ok(frames*.25<110,'the default pace reaches the incident within 110 seconds');
 answerActTwo(s,s.actOne.pending.eventId,'loan');assert.equal(observationView(s),null);assert.equal(observationClockLimit(s),Infinity);
});

test('reload, pause, voice playback, and legacy saves preserve the right observation scene',()=>{
 let s=start();while(observationView(s).beat?.id!=='luna-neighbor')step(s,6);
 const before=observationView(s).identity;
 s=JSON.parse(JSON.stringify(s));assert.equal(observationView(s).identity,before);
 const hour=s.hour;
 for(let i=0;i<40;i++)tickObservation(s,.25,{stopped:true});
 assert.equal(s.hour,hour);assert.equal(observationView(s).identity,before);
 for(let i=0;i<40;i++)tickObservation(s,.25,{voiceBusy:true});
 assert.equal(observationView(s).identity,before);
 delete s.actOne.observation;s.hour=64;
 assert.equal(observationView(s).done,0,'old saves retain the upcoming evening conversation');
});

test('five saved IDs form one escape scene, with clear lively voices',()=>{
 assert.equal(ACT_TWO_OBSERVATION_BEATS.length,5);
 const lines=ACT_TWO_OBSERVATION_BEATS.flatMap(b=>b.lines);
 assert.equal(lines.length,31);
 assert.ok(lines.every(l=>l.voicePerformance==='observation-'+l.speaker));
 assert.equal(lines.at(-1).text,'帰ってくる前には終わる仕事だよ。');
 assert.ok(!lines.some(l=>/お仕事|留守番|ごはんを出して/.test(l.text)));
});

test('Moku stays with Luna between conversations and returns normally when she leaves',()=>{
 const s=start();advanceActTwo(s,1.5);
 const cat=s.residents.find(r=>r.type==='cat'),luna=s.residents.find(r=>r.type==='hostess');
 for(const hour of [59.1,61.08,63.1,65.08]){
  advanceActTwo(s,hour-s.hour);
  for(const r of [cat,luna]){const p=sampleJourney(r,s.hour);assert.equal(p.room,102);assert.equal(p.moving,false);assert.notEqual(r.action,'clean');}
 }
 advanceActTwo(s,.42);assert.ok(sampleJourney(cat,s.hour).moving||sampleJourney(cat,s.hour).room===101);
});


test('escape blocking survives reload and keeps the hallway, hiding place and exit distinct',()=>{
 const s=start();s.hour=65.08;
 const o=s.actOne.observation;
 const position=(id,index,type,elapsed=1)=>{o.current={id,index,elapsed};return lunaEscapePosition(s,type);};
 assert.equal(position('luna-unpack',0,'cat').zone,'hall');
 assert.equal(position('luna-neighbor',0,'cat').zone,'room');
 const hidden=position('luna-neighbor',0,'cat');
 assert.ok(hidden.x<position('luna-neighbor',0,'hostess').x);
 assert.equal(position('luna-before-outing',2,'cat').zone,'hall');
 assert.equal(position('luna-tea',2,'manager').zone,'hall');
 const before=JSON.stringify(s),p=lunaEscapePosition(s,'cat');
 assert.deepEqual(lunaEscapePosition(JSON.parse(before),'cat'),p);
 assert.equal(JSON.stringify(s),before);
 s.actOne.pending={scene:'bag'};assert.equal(lunaEscapePosition(s,'cat'),null);
});

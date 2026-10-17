import test from 'node:test';
import assert from 'node:assert/strict';
import {createActOne,validActOne} from '../src/act-one.js';
import {beginActTwo,advanceActTwo,answerActTwo} from '../src/act-two.js';
import {ACT_TWO_OBSERVATION_BEATS} from '../src/act-two-observation.js';
import {observationView,observationClockLimit,tickObservation} from '../src/act-one-observation.js';
import {createTalk,stepTalk} from '../src/dialogue.js';
import {sampleJourney} from '../src/movement.js';
const start=()=>{const s=beginActTwo(createActOne(32));Object.assign(s.actOne,{started:true,prologuePending:false,titlePending:false});observationView(s);return s;};
const step=(s,speed)=>{tickObservation(s,.25);advanceActTwo(s,Math.min(speed/40,Math.max(0,observationClockLimit(s)-s.hour)));tickObservation(s,0);};

for(const speed of [1,6,20])test(`Act 2 at speed ${speed}: all jokes finish before the first incident, with both speakers in the room`,()=>{
 const s=start(),seen=new Set(),talk=createTalk();let frames=0;
 while(!s.actOne.pending&&frames++<1200){
  step(s,speed);const v=observationView(s);stepTalk(talk,s,frames*250,false);
  if(v?.identity)seen.add(v.identity);
  if(v?.beat?.together){
   const positions=['cat','hostess'].map(type=>sampleJourney(s.residents.find(r=>r.type===type),s.hour));
   assert.ok(positions.every(p=>!p.moving&&p.zone==='room'&&p.room===102));
   assert.equal(talk.chapterChat,null);assert.equal(talk.bubbles[0].text,v.line.text);
  }
 }
 assert.equal(s.actOne.pending?.scene,'bag');assert.equal(s.hour,66);
 assert.equal(seen.size,ACT_TWO_OBSERVATION_BEATS.reduce((n,b)=>n+b.lines.length,0));
 assert.ok(validActOne(JSON.parse(JSON.stringify(s))));
 if(speed===6)assert.ok(frames*.25<90,'the default pace reaches the incident within 90 seconds');
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
 assert.equal(observationView(s).done,4,'old saves skip scenes whose scheduled time has passed');
});

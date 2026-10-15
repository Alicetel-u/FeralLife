import test from 'node:test';
import assert from 'node:assert/strict';
import {createActOne,advanceActOne,answerActOne,validActOne,rewindBeforeFire} from '../src/act-one.js';
import {OBSERVATION_BEATS,observationState,observationClockLimit,tickObservation,observationView,finishObservationLine,inspectObservation,canSkipObservation,skipObservation,inheritObservation} from '../src/act-one-observation.js';
import {extractVoiceScript} from '../tools/voice-script.mjs';
const start=()=>{const s=createActOne();s.actOne.started=true;observationState(s);return s;};
const step=(s,stopped=false)=>{tickObservation(s,.25,{stopped});if(!stopped)advanceActOne(s,Math.min(.15,Math.max(0,observationClockLimit(s)-s.hour)));tickObservation(s,0,{stopped});};
test('first visit reads four unique everyday scenes before the ash incident, even at high speed',()=>{
 const s=start(),seen=new Set();let frames=0;
 while(!s.actOne.pending&&frames++<600){step(s);const v=observationView(s);if(v.identity)seen.add(v.identity);}
 assert.equal(s.actOne.pending?.scene,'ash');assert.equal(seen.size,12);assert.ok(frames>=172);assert.equal(s.hour,19);assert.ok(validActOne(s));
});
test('pause and active voice freeze reading; inspect adds one persistent note without advancing',()=>{
 const s=start();for(let i=0;i<4;i++)step(s);const before=JSON.stringify(s.actOne.observation),hour=s.hour;
 for(let i=0;i<40;i++)step(s,true);assert.equal(JSON.stringify(s.actOne.observation),before);assert.equal(s.hour,hour);
 for(let i=0;i<40;i++)tickObservation(s,.25,{voiceBusy:true});assert.equal(observationView(s).identity,'seat:0');
 inspectObservation(s);inspectObservation(s);assert.equal(observationView(s).notes.length,1);assert.equal(observationView(s).identity,'seat:0');
 for(let i=0;i<40;i++)tickObservation(s,.25);assert.equal(observationView(s).identity,'seat:0');
 const saved=JSON.parse(JSON.stringify(s));assert.ok(validActOne(saved));assert.equal(observationView(saved).notes[0].id,'seat');
 finishObservationLine(saved);assert.equal(observationView(saved).identity,'seat:1');
});
test('unseen scenes cannot be skipped; rewind preserves notes and unlocks only previously read phases',()=>{
 const s=start();assert.equal(skipObservation(s),false);inspectObservation(s);
 for(let i=0;!s.actOne.pending&&i<600;i++)step(s);
 answerActOne(s,s.actOne.pending.eventId,'trash');const next=rewindBeforeFire(s);inheritObservation(s,next);next.actOne.started=true;next.actOne.rewindIntroPending=false;
 assert.equal(canSkipObservation(next),true);assert.equal(skipObservation(next),true);
 assert.equal(observationClockLimit(next),Infinity);
});
test('legacy saves migrate without replaying past scenes; malformed observation fields recover',()=>{
 const s=start();delete s.actOne.observation;advanceActOne(s,1.5);assert.equal(observationView(s).done,3);
 s.actOne.observation.current={id:'seat',index:100};s.actOne.observation.gap='bad';observationState(s);assert.equal(s.actOne.observation.current,null);assert.equal(s.actOne.observation.gap,0);
 s.actOne.chapter=2;assert.equal(observationView(s),null);assert.equal(observationClockLimit(s),Infinity);
});
test('all phases follow completed events and new speech is extracted directly from game data',()=>{
 const s=start();s.actOne.completed=['ash'];s.hour=19;assert.equal(observationView(s).total,6);
 s.actOne.completed.push('dinner');s.hour=37;assert.equal(observationView(s).total,4);
 const rows=extractVoiceScript('act1').filter(r=>r.source.startsWith('act1/observation/'));
 assert.equal(rows.length,42);assert.deepEqual(rows.map(r=>r.line.text),OBSERVATION_BEATS.flatMap(b=>b.lines.map(l=>l.text)));
 assert.equal(extractVoiceScript('intro').some(r=>r.source.startsWith('act1/observation/')),false);
});

test('every safe phase completes before the next event and the original ending remains reachable',()=>{
 const s=createActOne(1,[],2,true);observationState(s);let count=0;
 for(let i=0;i<4000&&s.actOne.status==='playing';i++){
  step(s);
  if(s.actOne.pending){const scene=s.actOne.pending.scene;assert.equal(observationView(s).done,scene==='ash'?4:6);answerActOne(s,s.actOne.pending.eventId,scene==='ash'?'water':'coronation');count++;}
 }
 assert.equal(count,2);assert.equal(s.actOne.status,'clear');assert.equal(s.hour,57);assert.equal(s.actOne.observation.seen.length,14);assert.ok(validActOne(s));
});

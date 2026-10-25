import {tickObservation,observationView,finishObservationLine} from '../src/act-one-observation.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createActOne} from '../src/act-one.js';
import {beginActTwo,advanceActTwo,answerActTwo} from '../src/act-two.js';
import {secondActLife,secondActChat,lunaNearby,lunaMutters} from '../src/act-two-life.js';
import {createTalk,stepTalk,SPEECH_MS} from '../src/dialogue.js';
import {sampleJourney} from '../src/movement.js';
import {validateSave} from '../src/simulation.js';
function state(){const s=createActOne(91);beginActTwo(s);s.actOne.started=true;s.actOne.prologuePending=false;s.events.forEach(e=>e.read=true);observationView(s);return s;}

test('before the new scene the residents stay in their own rooms; direct trouble entry puts Luna at the entrance',()=>{
 const s=state(),luna=s.residents.find(r=>r.type==='hostess'),cat=s.residents.find(r=>r.type==='cat');
 advanceActTwo(s,2.25);assert.equal(sampleJourney(cat,s.hour).room,101);assert.equal(sampleJourney(luna,s.hour).room,102);assert.equal(secondActChat(s),null);
 advanceActTwo(s,100);assert.equal(s.actOne.pending.scene,'bag');assert.equal(s.hour,66);
 assert.equal(sampleJourney(luna,s.hour).zone,'street');assert.equal(sampleJourney(cat,s.hour).room,101);
 const loaded=JSON.parse(JSON.stringify(s)),oldLuna=loaded.residents.find(r=>r.type==='hostess');
 oldLuna.actTwoBeat=65;oldLuna.action='eat';delete oldLuna.journey;
 secondActLife(loaded);assert.equal(sampleJourney(oldLuna,loaded.hour).zone,'street');assert.equal(oldLuna.action,'idle');
 assert.ok(validateSave(loaded));
});

test('the first success hands off to the next morning at home, with no old work outing',()=>{
 const s=state();advanceActTwo(s,100);answerActTwo(s,s.actOne.pending.eventId,'loan');
 assert.equal(s.hour,80);secondActLife(s);
 for(const type of ['hostess','cat']){const r=s.residents.find(r=>r.type===type);assert.equal(sampleJourney(r,s.hour).room,102);assert.notEqual(r.action,'outing');}
 advanceActTwo(s,100);assert.equal(s.actOne.pending.scene,'duel');assert.equal(s.hour,84);assert.ok(validateSave(s));
});

test('stepping or skipping time yields identical second-act blocking and old saves receive direction',()=>{
 const a=state(),b=state();advanceActTwo(a,5);for(let i=0;i<20;i++)advanceActTwo(b,.25);
 for(const type of ['hostess','cat']){
  const x=a.residents.find(r=>r.type===type),y=b.residents.find(r=>r.type===type);
  assert.equal(x.action,y.action);assert.deepEqual(x.journey,y.journey);
 }
 const old=JSON.parse(JSON.stringify(a));for(const r of old.residents){delete r.actTwoBeat;delete r.storyUntil;}
 secondActLife(old);assert.equal(old.residents.find(r=>r.type==='hostess').storyUntil,106);assert.ok(validateSave(old));
});
test('offscreen Luna does not produce a detached bubble and pause holds conversation',()=>{
 const s=state(),talk=createTalk();advanceActTwo(s,100);answerActTwo(s,s.actOne.pending.eventId,'loan');advanceActTwo(s,10);
 assert.deepEqual(lunaMutters(s),[]);stepTalk(talk,s,1,false);assert.deepEqual(talk.bubbles,[]);
 const nearby=state();advanceActTwo(nearby,2.25);tickObservation(nearby,0);stepTalk(talk,nearby,100,false);const identity=observationView(nearby).identity;tickObservation(nearby,.25,{stopped:true});stepTalk(talk,nearby,10000,true);assert.equal(observationView(nearby).identity,identity);
});

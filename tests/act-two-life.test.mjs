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

test('Luna finishes her conversation and walks to the entrance before the street trouble',()=>{
 const s=state(),luna=s.residents.find(r=>r.type==='hostess');
 advanceActTwo(s,8.08);assert.equal(luna.action,'chat');assert.equal(sampleJourney(luna,s.hour).zone,'room');
 advanceActTwo(s,.42);assert.equal(luna.action,'idle');assert.equal(sampleJourney(luna,s.hour).moving,true);
 advanceActTwo(s,100);const pos=sampleJourney(luna,s.hour);
 assert.equal(s.actOne.pending.scene,'bag');assert.equal(s.hour,66);
 assert.equal(pos.zone,'street');assert.equal(pos.moving,false);assert.notEqual(luna.action,'eat');
 const loaded=JSON.parse(JSON.stringify(s)),oldLuna=loaded.residents.find(r=>r.type==='hostess');
 oldLuna.actTwoBeat=65;oldLuna.action='eat';delete oldLuna.journey;
 secondActLife(loaded);assert.equal(sampleJourney(oldLuna,loaded.hour).zone,'street');assert.notEqual(oldLuna.action,'eat');
 assert.ok(validateSave(JSON.parse(JSON.stringify(s))));
});
test('Luna unpacks, receives a visitor, goes to work and returns before the minigame',()=>{
 const s=state(),luna=s.residents.find(r=>r.type==='hostess'),cat=s.residents.find(r=>r.type==='cat');
 assert.equal(luna.action,'chat');
 advanceActTwo(s,2.25);
 assert.equal(lunaNearby(s),true);
 assert.equal(sampleJourney(cat,s.hour).room,102);
 assert.equal(sampleJourney(cat,s.hour).moving,false);
 assert.equal(secondActChat(s).key,'act2-chat-arrival');
 advanceActTwo(s,100);assert.equal(s.hour,66);answerActTwo(s,s.actOne.pending.eventId,'loan');
 advanceActTwo(s,6);assert.equal(luna.action,'outing');
 advanceActTwo(s,12.9);
 const p=sampleJourney(luna,s.hour);assert.equal(p.zone,'room');assert.equal(p.room,102);
 advanceActTwo(s,100);assert.equal(s.hour,84);assert.equal(s.actOne.pending.scene,'duel');
 assert.ok(validateSave(JSON.parse(JSON.stringify(s))));
});
test('authored neighbor chat follows saved dialogue and never creates a second ambient conversation',()=>{
 const s=state(),talk=createTalk();s.actOne.observation.done.push('luna-unpack');advanceActTwo(s,2.25);tickObservation(s,0);
 stepTalk(talk,s,100,false);assert.equal(talk.bubbles[0].speaker,'hostess');assert.equal(talk.chapterChat,null);
 assert.ok(lunaNearby(s));
 tickObservation(s,.25);tickObservation(s,.25);finishObservationLine(s);
 stepTalk(talk,s,200,false);assert.equal(talk.bubbles[0].speaker,'cat');
 assert.equal(talk.bubbles[0].text,observationView(s).line.text);
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

import test from 'node:test';
import assert from 'node:assert/strict';
import {createActOne} from '../src/act-one.js';
import {beginActTwo,advanceActTwo,answerActTwo} from '../src/act-two.js';
import {secondActLife,secondActChat,lunaNearby,lunaMutters} from '../src/act-two-life.js';
import {createTalk,stepTalk,SPEECH_MS} from '../src/dialogue.js';
import {sampleJourney} from '../src/movement.js';
import {validateSave} from '../src/simulation.js';
function state(){const s=createActOne(91);beginActTwo(s);s.actOne.started=true;s.actOne.prologuePending=false;s.events.forEach(e=>e.read=true);return s;}
test('Luna unpacks, receives a visitor, goes to work and returns before the contract',()=>{
 const s=state(),luna=s.residents.find(r=>r.type==='hostess'),cat=s.residents.find(r=>r.type==='cat');
 assert.equal(luna.action,'clean');
 advanceActTwo(s,2.25);
 assert.equal(lunaNearby(s),true);
 assert.equal(sampleJourney(cat,s.hour).room,102);
 assert.equal(sampleJourney(cat,s.hour).moving,false);
 assert.equal(secondActChat(s).key,'act2-chat-arrival');
 advanceActTwo(s,100);assert.equal(s.hour,62);answerActTwo(s,s.actOne.pending.eventId,'loan');
 advanceActTwo(s,6);assert.equal(luna.action,'outing');
 advanceActTwo(s,12.9);
 const p=sampleJourney(luna,s.hour);assert.equal(p.zone,'room');assert.equal(p.room,102);
 advanceActTwo(s,100);assert.equal(s.hour,81);assert.equal(s.actOne.pending.scene,'contract');
 assert.ok(validateSave(JSON.parse(JSON.stringify(s))));
});
test('Moku speaks only alongside Luna, and a meeting advances by readable real time',()=>{
 const s=state(),talk=createTalk();
 stepTalk(talk,s,100,false);assert.equal(talk.bubbles[0].speaker,'hostess');
 advanceActTwo(s,2.25);stepTalk(talk,s,200,false);
 assert.ok(talk.chapterChat);assert.equal(talk.bubbles[0].speaker,'hostess');
 stepTalk(talk,s,200+SPEECH_MS.line,false);assert.equal(talk.bubbles[0].speaker,'cat');assert.ok(lunaNearby(s));
 stepTalk(talk,s,200+SPEECH_MS.line*2,false);assert.equal(talk.bubbles[0].speaker,'hostess');
 stepTalk(talk,s,200+SPEECH_MS.line*3,false);assert.equal(talk.chapterChat,null);assert.ok(s.heard.includes('act2-chat-arrival'));
 advanceActTwo(s,2);stepTalk(talk,s,30000,false);assert.ok(talk.bubbles.every(l=>l.speaker==='hostess'));
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
 const nearby=state();advanceActTwo(nearby,2.25);stepTalk(talk,nearby,100,false);stepTalk(talk,nearby,10000,true);stepTalk(talk,nearby,10001,false);assert.equal(talk.chapterChat.index,0);
});

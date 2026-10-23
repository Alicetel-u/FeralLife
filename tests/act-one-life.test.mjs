import test from 'node:test';
import assert from 'node:assert/strict';
import {createActOne,advanceActOne,answerActOne,nextActOneAt,validActOne} from '../src/act-one.js';
import {validateSave} from '../src/simulation.js';
import {sampleJourney,createOuting,homeSpot,WALK_SPEED} from '../src/movement.js';
import {firstActMutters,firstActLife} from '../src/act-one-life.js';
const start=()=>createActOne(42,[],2,true);
test('first act walks the hall, returns before ash, stays awake until lunch and rests after safety',()=>{
 const s=start();advanceActOne(s,.6);const m=s.residents[0];assert.equal(sampleJourney(m,s.hour).zone,'hall');
 advanceActOne(s,10);assert.equal(s.hour,23);assert.equal(s.actOne.pending.scene,'ash');assert.equal(sampleJourney(m,s.hour,'window').zone,'room');assert.equal(m.action,'smoke');
 answerActOne(s,s.actOne.pending.eventId,'water');
 while(s.hour<36.5){advanceActOne(s,Math.min(.25,36.5-s.hour));assert.notEqual(m.action,'sleep');}
 advanceActOne(s,10);assert.equal(s.hour,37);assert.equal(sampleJourney(m,s.hour,'fridge').zone,'room');assert.equal(m.action,'eat');
 answerActOne(s,s.actOne.pending.eventId,'coronation');advanceActOne(s,1.5);assert.equal(m.action,'sleep');assert.match(firstActMutters(s)[0],/すぅ/);
 advanceActOne(s,14);assert.equal(m.action,'sleep');assert.equal(sampleJourney(m,s.hour).moving,false);
 advanceActOne(s,2.55);assert.equal(sampleJourney(m,s.hour).zone,'hall');
 advanceActOne(s,100);assert.equal(s.hour,57);assert.equal(s.actOne.status,'clear');assert.equal(m.storyUntil,undefined);
});
test('small steps and jump-to-event keep identical story pacing; mid-walk saves resume deterministically',()=>{
 const a=start();advanceActOne(a,.5);const b=JSON.parse(JSON.stringify(a));assert.ok(validateSave(b)&&validActOne(b));
 advanceActOne(a,100);while(!b.actOne.pending)advanceActOne(b,.01);
 assert.equal(a.hour,b.hour);assert.equal(a.actOne.pending.scene,b.actOne.pending.scene);assert.deepEqual(sampleJourney(a.residents[0],a.hour,'window'),sampleJourney(b.residents[0],b.hour,'window'));
 assert.ok(validateSave(a)&&validActOne(a));
});
test('older saves outside the room return on foot before an indoor event can open',()=>{
 const s=start();s.hour=22.99;const r=s.residents[0];r.action='outing';r.journey=createOuting(r,22);
 advanceActOne(s,.01);assert.equal(s.actOne.pending,null);assert.ok(nextActOneAt(s)>s.hour);
 advanceActOne(s,nextActOneAt(s)-s.hour);assert.equal(s.actOne.pending.scene,'ash');assert.equal(sampleJourney(r,s.hour,'window').zone,'room');
});


test('Moku returns through the door to the floor in front of her table',()=>{
 const state=start();advanceActOne(state,3.75);const r=state.residents[0],journey=r.journey;
 assert.equal(journey.reason,'101号室へ帰宅');
 assert.deepEqual(journey.path.at(-2),homeSpot(101,'hall'));
 assert.deepEqual(journey.path.at(-1),homeSpot(101,'table'));
 for(let hour=journey.startedAt;hour<=journey.endsAt;hour+=.005){
  const p=sampleJourney(r,hour);
  if(p.zone==='room')assert.ok(p.y>=homeSpot(101,'table').y,'walk on the floor, not the furniture');
  const next=sampleJourney(r,hour+.005);
  assert.ok(Math.hypot(next.x-p.x,next.y-p.y)<=WALK_SPEED*.005+.00001);
 }
 assert.equal(sampleJourney(r,journey.endsAt).moving,false);
 assert.ok(validateSave(state)&&validActOne(state));
});

test('saved legacy home routes are repaired while preserving their start time and daily beat',()=>{
 const state=start();advanceActOne(state,3.75);const r=state.residents[0],old=structuredClone(r.journey),beat=r.lifeBeat;
 old.path[old.path.length-2]={x:331,y:420,zone:'room',room:101};old.path[old.path.length-1]={x:330,y:396,zone:'room',room:101};r.journey=old;
 firstActLife(state);
 assert.equal(r.lifeBeat,beat);assert.equal(r.journey.startedAt,old.startedAt);
 assert.deepEqual(r.journey.path.at(-1),homeSpot(101,'table'));
 const repaired=r.journey;firstActLife(state);assert.equal(r.journey,repaired,'repair runs once');
 assert.ok(validateSave(state)&&validActOne(state));
});

test('safe cooking leads to uninterrupted sleep, morning outside, then a return before the ending',()=>{
 const s=start();advanceActOne(s,100);answerActOne(s,s.actOne.pending.eventId,'water');advanceActOne(s,100);answerActOne(s,s.actOne.pending.eventId,'coronation');
 const r=s.residents[0];
 while(s.hour<52.99){advanceActOne(s,Math.min(.1,52.99-s.hour));if(s.hour>=38.4){assert.equal(r.action,'sleep');assert.equal(sampleJourney(r,s.hour).moving,false);}}
 while(s.hour<55.05)advanceActOne(s,Math.min(.05,55.05-s.hour));
 assert.equal(sampleJourney(r,s.hour).zone,'hall');assert.equal(sampleJourney(r,s.hour).moving,false);
 while(s.actOne.status==='playing')advanceActOne(s,.05);
 assert.equal(s.hour,57);assert.equal(sampleJourney(r,s.hour).zone,'room');assert.equal(sampleJourney(r,s.hour).moving,false);
 const ending=s.events.find(e=>e.actScene==='epilogue');assert.ok(ending);assert.ok(!ending.lines.some(l=>l.text.includes('昨日の夜から起きてる')));
});

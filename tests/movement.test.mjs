import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, advance, validateSave } from '../src/simulation.js';
import { homeSpot, createOuting, createVisit, sampleJourney, validJourney, WALK_SPEED } from '../src/movement.js';

test('upstairs outings descend stairs, leave the screen and return along the same route',()=>{
  const r={type:'cat',room:201};r.journey=createOuting(r,18);
  const j=r.journey;
  assert.ok(j.path.some(p=>p.zone==='stairs'));
  assert.ok(j.path.at(-1).x>1000);
  assert.deepEqual(j.back,[...j.path].reverse());
  assert.equal(sampleJourney(r,j.arriveAt+.01).zone,'away');
  assert.equal(sampleJourney(r,j.returnAt+.01).phase,'returning');
  assert.deepEqual(sampleJourney(r,j.endsAt),{...homeSpot(201),moving:false,direction:1,phase:'home'});
  for(let h=j.startedAt+.01;h<j.endsAt;h+=.01){
    const before=sampleJourney(r,h-.01),after=sampleJourney(r,h);
    assert.ok(Math.hypot(before.x-after.x,before.y-after.y)<=WALK_SPEED*.01+.000001);
  }
});
test('visits use the stairs only when crossing floors',()=>{
  const r={type:'fox',room:102};
  const same=createVisit(r,30,homeSpot(102),103),upper=createVisit(r,30,homeSpot(102),202);
  assert.ok(!same.path.some(p=>p.zone==='stairs'));
  assert.ok(upper.path.some(p=>p.zone==='stairs'));
  r.journey=upper;assert.equal(sampleJourney(r,upper.arriveAt+.1).room,202);
  assert.equal(sampleJourney(r,upper.arriveAt+.1).phase,'visiting');
  assert.equal(sampleJourney(r,upper.endsAt).room,102);
});
test('scheduled outings keep their route during hourly AI decisions and save restoration',()=>{
  const s=createGame(123);advance(s,1.5);
  const r=s.residents[0],journey=structuredClone(r.journey);
  assert.equal(r.action,'outing');assert.equal(journey.kind,'outing');
  const restored=JSON.parse(JSON.stringify(s));assert.ok(validateSave(restored));
  assert.deepEqual(sampleJourney(r,s.hour),sampleJourney(restored.residents[0],restored.hour));
  advance(s,1);advance(restored,1);
  assert.deepEqual(s,restored);assert.deepEqual(r.journey,journey);
  advance(s,journey.endsAt-s.hour+1);
  assert.ok(s.events.some(e=>e.title.includes('帰ってきた')));
});
test('old saves without routes remain valid and malformed routes are rejected safely',()=>{
  const s=createGame(99);assert.ok(validateSave(s));
  s.residents[0].journey={kind:'outing'};assert.equal(validateSave(s),false);
  const j=createOuting(s.residents[0],18);assert.ok(validJourney(j));
  j.path[0].x=NaN;assert.equal(validJourney(j),false);
  j.path[0]=null;assert.equal(validJourney(j),false);
});

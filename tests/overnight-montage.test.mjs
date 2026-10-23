import test from 'node:test';
import assert from 'node:assert/strict';
import {overnightMontageFrame} from '../src/overnight-montage.js';
import {createDeveloperObservation} from '../src/debug-observation.js';
import {advanceActOne} from '../src/act-one.js';
import {observationClockLimit} from '../src/act-one-observation.js';

test('sleep shows a settled pose, a full night and a held dawn before waking',()=>{
 const s=createDeveloperObservation('1','blanket'),o=s.actOne.observation;
 o.current=null;o.gap=0;o.done.push('blanket');
 const start=s.hour;
 assert.equal(overnightMontageFrame('sleep',start,1).hour,start);
 const night=overnightMontageFrame('sleep',start,4);
 assert.ok(night.shade>.35);assert.equal(night.dawn,0);
 for(const elapsed of [1,3,5.8,6.7]){
  const f=overnightMontageFrame('sleep',start,elapsed);
  advanceActOne(s,Math.max(0,Math.min(f.hour,observationClockLimit(s))-s.hour));
  assert.equal(s.residents[0].action,'sleep');assert.equal(f.finished,false);
 }
 const dawn=overnightMontageFrame('sleep',start,6.7);assert.ok(dawn.dawn>.8);
 const end=overnightMontageFrame('sleep',start,6.81);assert.equal(end.finished,true);assert.equal(end.hour,53);
 advanceActOne(s,end.hour-s.hour);assert.equal(s.residents[0].action,'idle');
});

test('late viewing lasts through midnight and sunrise and stops exactly at the next scene',()=>{
 const captions=new Set();let previous=24.1;
 for(let t=0;t<8.4;t+=.1){
  const f=overnightMontageFrame('tv',24.1,t);
  assert.ok(f.hour>=previous&&f.hour<36.65);assert.equal(f.finished,false);previous=f.hour;captions.add(f.caption);
 }
 assert.equal(captions.size,4);
 const dawn=overnightMontageFrame('tv',24.1,5);assert.ok(dawn.dawn>0);
 const end=overnightMontageFrame('tv',24.1,8.41);assert.equal(end.hour,36.65);assert.equal(end.finished,true);
});

test('montage sampling is deterministic and resumes from a mid-night save without reversing time',()=>{
 for(const [kind,start] of [['sleep',49],['tv',31]]){
  let hour=start;
  for(let elapsed=0;elapsed<=10;elapsed+=.25){
   const f=overnightMontageFrame(kind,start,elapsed);assert.deepEqual(f,overnightMontageFrame(kind,start,elapsed));
   assert.ok(f.hour>=hour);hour=f.hour;
  }
 }
});

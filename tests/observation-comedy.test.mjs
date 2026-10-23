import test from 'node:test';
import assert from 'node:assert/strict';
import {observationComedy,drawObservationComedy,OBSERVATION_GAGS} from '../src/observation-comedy.js';
import {createActOne} from '../src/act-one.js';
import {WorldRenderer} from '../src/renderer.js';
const stateFor=(id,index,elapsed=1.5)=>({hour:17.1,actOne:{started:true,status:'playing',observation:{done:[],gap:0,current:{id,index,elapsed}}}});
const cat={type:'cat',room:101,action:'clean',lifeBeat:17,needs:{}};

test('cleaning has a preparation, two misplaced cans, then a seated punchline',()=>{
 const s=stateFor('seat',0),before=JSON.stringify(s);
 const opening=observationComedy(s,cat);assert.equal(opening.pose,'clean');assert.equal(JSON.stringify(s),before);
 s.actOne.observation.current.index=1;const shove=observationComedy(s,cat);
 assert.ok(shove.props[0].x<opening.props[0].x);assert.equal(shove.pose,'clean');
 s.actOne.observation.current.index=2;assert.equal(observationComedy(s,cat).reaction,'discover');
 s.actOne.observation.current.index=4;const end=observationComedy(s,cat);
 assert.equal(end.pose,'sit');assert.ok(end.props[0].x<0&&end.props[1].x>0);
 s.actOne.observation.current=null;s.actOne.observation.done=['seat'];
 assert.equal(observationComedy(s,cat).pose,'sit','she does not instantly resume cleaning after declaring herself finished');
});

test('phone was held from the start, and bedtime keeps the tired cat asleep',()=>{
 for(const i of [0,1,2]){
  const d=observationComedy(stateFor('phone-search',i),cat);
  assert.equal(d.props.filter(p=>p.kind==='phone').length,1);
  if(i<2)assert.ok(d.props[0].y>-50);else assert.ok(d.props[0].y<-60);
 }
 assert.deepEqual([0,1,2].map(i=>observationComedy(stateFor('blanket',i),cat).pose),['sleep','sleep','sleep']);
});

test('shared tea scene leaves an empty dish while Moku feigns sleep',()=>{
 const s=stateFor('luna-tea',0),luna={type:'hostess'};
 assert.equal(observationComedy(s,luna).pose,'drink');
 s.actOne.observation.current.index=1;assert.equal(observationComedy(s,cat).pose,'drink');
 s.actOne.observation.current.index=4;assert.equal(observationComedy(s,luna).pose,'chat');
 s.actOne.observation.current.index=5;const d=observationComedy(s,cat);
 assert.equal(d.pose,'sleep');assert.ok(d.props.some(p=>p.kind==='dish'));
 s.actOne.chapter=2;s.hour=64;s.actOne.observation.current=null;s.actOne.observation.done=['luna-tea'];
 assert.equal(observationComedy(s,cat).pose,'sleep');
 s.hour=65;assert.equal(observationComedy(s,cat),null);
});

test('choreography is deterministic, reload-safe, bounded, and does not mutate saves',()=>{
 const allowed=new Set(['stand','clean','chat','sit','sleep','drink','eat']);
 for(const id of OBSERVATION_GAGS)for(const type of ['cat','hostess','manager'])for(const index of [0,1,2,3,4,5,99])for(const elapsed of [0,.25,.7,2,60]){
  const state=stateFor(id,index,elapsed),r={...cat,type},before=JSON.stringify(state);
  const d=observationComedy(state,r);
  assert.equal(JSON.stringify(state),before);
  assert.deepEqual(d,observationComedy(JSON.parse(before),r));
  if(!d)continue;
  assert.ok(allowed.has(d.pose));assert.ok(Math.abs(d.dx)<=24);assert.ok(Math.abs(d.rotate)<=.1);
  assert.ok(d.props.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));
  assert.equal(observationComedy(state,{type:'manager'}),null);
 }
 for(const patch of [{started:false},{status:'bad'},{pending:{scene:'ash'}},{rewindIntroPending:true},{prologuePending:true}]){
  const s=stateFor('seat',1);Object.assign(s.actOne,patch);assert.equal(observationComedy(s,cat),null);
 }
});

test('reduced motion retains the joke and props without leaning or partial movement',()=>{
 for(const id of OBSERVATION_GAGS)for(const type of ['cat','hostess'])for(const index of [0,1,2,3,4,5]){
  const a=observationComedy(stateFor(id,index,0),{...cat,type},{reduced:true});
  const b=observationComedy(stateFor(id,index,2),{...cat,type},{reduced:true});
  assert.deepEqual(a,b);if(a)assert.equal(a.rotate,0);
 }
});

test('props render inside balanced canvas saves without affecting simulation state',()=>{
 const calls=[],ctx=new Proxy({}, {get:(_,key)=>(...args)=>calls.push([key,...args]),set:()=>true});
 for(const id of OBSERVATION_GAGS)for(const type of ['cat','hostess']){
  const d=observationComedy(stateFor(id,1),{...cat,type});
  drawObservationComedy(ctx,d,100,200,2);
 }
 assert.equal(calls.filter(c=>c[0]==='save').length,calls.filter(c=>c[0]==='restore').length);
 assert.ok(calls.some(c=>c[0]==='fillRect'));
});

test('camera and speech follow directed cleanup positions without altering the saved path',()=>{
 const s=createActOne(42,[],1,true);s.hour=17.1;s.selected=101;
 s.actOne.observation={version:2,seen:[],done:[],gap:0,current:{id:'seat',index:0,elapsed:1}};
 const r=s.residents[0];Object.assign(r,{action:'clean',lifeBeat:17,journey:null});
 const renderer=new WorldRenderer({getContext:()=>new Proxy({}, {get:()=>()=>{},set:()=>true})});renderer.view='interior';renderer.focus=true;renderer.focusRoom=101;
 const positions=[];
 for(const index of [0,1,2,3,4]){
  s.actOne.observation.current.index=index;const before=JSON.stringify(s);
  renderer.drawInteriorResident(s,r,1);const anchor=renderer.speechAnchor(s,'cat');
  assert.ok(Math.abs(anchor.x-renderer.followCharacterX*1920/1200)<.01);
  assert.equal(JSON.stringify(s),before);positions.push(anchor.x);
 }
 assert.ok(Math.max(...positions)-Math.min(...positions)>200);
});

test('settled sleepers align with the painted bed even in a legacy saved route',()=>{
 for(const type of ['cat','hostess']){
  const s=createActOne(42,[],2,true),r=s.residents[0];
  r.type=type;r.action='sleep';s.hour=45;
  r.journey={kind:'room',startedAt:38,arriveAt:38.2,returnAt:38.2,endsAt:38.2,path:[{x:300,y:435,zone:'room',room:101},{x:266,y:423,zone:'room',room:101}],back:[],reason:'',actionAfter:'sleep',returned:false};
  const renderer=new WorldRenderer({getContext:()=>({})}),before=JSON.stringify(s);
  const p=renderer.interiorResidentPosition(s,r);
  assert.deepEqual([p.x,p.y],[252,412]);assert.equal(p.direction,1);
  assert.equal(JSON.stringify(s),before);
 }
});

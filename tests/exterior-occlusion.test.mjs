import test from 'node:test';
import assert from 'node:assert/strict';
import {EXTERIOR_OCCLUDERS,foregroundKeys,drawExteriorForeground} from '../src/exterior-occlusion.js';
const contains=(poly,x,y)=>{let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;}return inside;};
const blocked=(key,x,y)=>EXTERIOR_OCCLUDERS[key].some(p=>contains(p,x,y));
test('rail silhouettes cover bars and leave openings visible',()=>{
  assert.ok(blocked('upper',500,452));
  assert.ok(blocked('upper',499,480));
  assert.ok(!blocked('upper',510,480));
  assert.ok(blocked('lower',499,710));
  assert.ok(!blocked('lower',510,710));
  assert.ok(blocked('bulletin',1300,740));
  assert.ok(!blocked('bulletin',1200,740));
});
test('street residents stay in front of rails; hallway and stairs use their foreground',()=>{
  assert.deepEqual(foregroundKeys({zone:'street',y:513}),['signs']);
  assert.deepEqual(foregroundKeys({zone:'hall',y:300}),['signs','bulletin','upper']);
  assert.deepEqual(foregroundKeys({zone:'hall',y:440}),['signs','bulletin','lower']);
  assert.deepEqual(foregroundKeys({zone:'stairs',y:370}),['signs','bulletin','upper','lower','stairs']);
  assert.deepEqual(foregroundKeys({zone:'away'}),[]);
  assert.deepEqual(foregroundKeys({zone:'room'}),[]);
});

test('bulletin depth follows feet on both outward and returning walks',()=>{
 for(const direction of [-1,1])for(const phase of ['outbound','returning']){
  for(const y of [370,440,475,510])assert.ok(foregroundKeys({zone:'street',y,direction,phase}).includes('bulletin'));
  for(const y of [512,513,520])assert.ok(!foregroundKeys({zone:'street',y,direction,phase}).includes('bulletin'));
 }
});
test('foreground uses matching scene coordinates and restores night tint inside clip',()=>{
  const calls=[],ctx=new Proxy({}, {get:(_,key)=>(...args)=>calls.push([key,...args]),set:(_,key,value)=>(calls.push([key,value]),true)}),image={};
  drawExteriorForeground(ctx,image,{zone:'hall',y:300},.57);
  assert.deepEqual(calls.find(c=>c[0]==='scale'),['scale',1000/1672,562.5/941]);
  assert.ok(calls.findIndex(c=>c[0]==='clip')<calls.findIndex(c=>c[0]==='drawImage'));
  assert.ok(calls.some(c=>c[0]==='fillStyle'&&c[1]==='rgba(16,27,49,0.57)'));
  assert.equal(calls.at(-1)[0],'restore');
});

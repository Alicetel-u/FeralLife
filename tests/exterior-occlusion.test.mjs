import test from 'node:test';
import assert from 'node:assert/strict';
import {EXTERIOR_OCCLUDERS,foregroundKeys,drawExteriorForeground,exteriorFeet} from '../src/exterior-occlusion.js';
const contains=(poly,x,y)=>{let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;}return inside;};
const blocked=(key,x,y)=>EXTERIOR_OCCLUDERS[key].some(p=>contains(p,x,y));
test('rail silhouettes cover bars and leave openings visible',()=>{
  assert.ok(blocked('upper',500,452));
  assert.ok(blocked('upper',494,480));
  assert.ok(!blocked('upper',516,480));
  assert.ok(blocked('lower',494,710));
  assert.ok(!blocked('lower',516,710));
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

 test('display feet meet the illustrated corridor without changing saved journey coordinates',()=>{
  const lower={x:400,y:440,zone:'hall'},upper={x:400,y:300,zone:'hall'};
  assert.equal(exteriorFeet(lower).y,447);assert.equal(exteriorFeet(upper).y,308);
  assert.equal(lower.y,440);assert.equal(upper.y,300);
  for(const zone of ['hall','stairs','street']){
   assert.equal(exteriorFeet({y:440,zone}).y,447);
   assert.equal(exteriorFeet({y:513,zone}).y,513);
  }
  assert.equal(exteriorFeet({y:400,zone:'room'}).y,400);
 });
 test('actual rail bars cover their source columns without painting over adjacent openings',()=>{
  for(const key of ['upper','lower']){
   const y=key==='upper'?480:710;
   for(const x of [494,509,773,787])assert.ok(blocked(key,x,y));
   for(const x of [499,780])assert.ok(!blocked(key,x,y));
  }
 });

test('street landlord is painted after hall residents and their railing restoration',async()=>{
 const {WorldRenderer}=await import('../src/renderer.js');
 const {CHARACTER_ART}=await import('../src/character-art.js');
 const calls=[],ctx=new Proxy({}, {get:(_,key)=>(...args)=>calls.push([key,...args]),set:()=>true});
 const renderer=new WorldRenderer({getContext:()=>ctx});renderer.focus=false;
 renderer.managerPosition={x:400,y:513,zone:'street'};
 const original=CHARACTER_ART.manager.image;CHARACTER_ART.manager.image={width:128,height:128};
 const p={x:400,y:440,zone:'hall',room:101};
 const resident={type:'cat',room:101,action:'idle',needs:{},journey:{kind:'room',startedAt:0,arriveAt:0,returnAt:0,endsAt:0,path:[p,p],back:[]}};
 try{renderer.drawExterior({hour:14,residents:[resident]},null,0,0);}finally{CHARACTER_ART.manager.image=original;}
 const shadows=calls.filter(c=>c[0]==='fillRect'&&c[3]===26&&c[4]===3);
 assert.deepEqual(shadows.map(c=>c[2]),[448,514]);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CHARACTERS} from '../src/simulation.js';
import {CHARACTER_ART} from '../src/character-art.js';
import {drawSprite,WorldRenderer} from '../src/renderer.js';
import {MINI_EMOTIONS,MINI_EMOTION_ART,MINI_PERSONALITY,miniLineEmotion,miniDailyEmotion,miniEmotionMotion,MiniReactionState} from '../src/mini-emotions.js';

const pen=()=>{const calls=[];const ctx=new Proxy({}, {get:(_,key)=>(...args)=>calls.push([key,...args]),set:()=>true});return {ctx,calls};};

test('all eleven residents, landlord and visitor ship eight bounded transparent reaction frames',async()=>{
 const types=[...Object.keys(CHARACTERS),'manager','patron'].sort();
 assert.deepEqual(Object.keys(MINI_EMOTION_ART).sort(),types);
 assert.deepEqual(Object.keys(MINI_PERSONALITY).sort(),types);
 for(const type of types){
  const art=MINI_EMOTION_ART[type],png=await readFile(art.src);
  assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png[25],6);
  const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
  assert.deepEqual(Object.keys(art.frames),MINI_EMOTIONS);
  for(const [x,y,w,h] of Object.values(art.frames)){
   assert.ok(w>0&&h>0&&x>=0&&y>=0&&x+w<=width&&y+h<=height,type);
   assert.ok(h<=art.height);
  }
 }
});

test('authored emotion and serious voice direction override text without interpreting exclamation marks',()=>{
 assert.equal(miniLineEmotion({speaker:'cat',emotion:'sad',text:'ありがとう！'}),'sad');
 assert.equal(miniLineEmotion({speaker:'cat',emotion:'happy',voicePerformance:'tragedy-fear',text:'助けて'}),'scared');
 assert.equal(miniLineEmotion({speaker:'cat',text:'今日は忙しいニャ。寝る予定があるニャ。'}),'tired');
 assert.equal(miniLineEmotion({speaker:'manager',text:'おはよう！！'}),'neutral');
 assert.equal(miniLineEmotion({text:'無事でよかった'}),'relieved');
 assert.equal(miniLineEmotion({text:'どういうこと？'}),'confused');
});

test('listeners retain their last reaction briefly after speaking and new neutral speech clears it',()=>{
 const state=new MiniReactionState(),line={speaker:'cat',text:'うれしい',emotion:'happy'};
 state.update([line],0);state.update([line],10);
 state.update([{speaker:'sister',text:'そうなんだ',emotion:'shy'}],10.1);
 assert.equal(state.emotion('cat',11),'happy');
 assert.equal(state.emotion('cat',13),null);
 state.update([{speaker:'cat',text:'うん',emotion:'neutral'}],13);
 assert.equal(state.emotion('cat',13,true),'neutral');
 state.reset();assert.equal(state.emotion('cat',13),null);
});

test('loaded emotions use their crop and foot anchor; walking, eating and sleep preserve existing poses',()=>{
 const sheet=MINI_EMOTION_ART.cat,art=CHARACTER_ART.cat,originalImage=art.image;
 const originalSheet=sheet.image,walk=art.poses.walk_a.image;
 try{
  art.image={width:96,height:128};sheet.image={};art.poses.walk_a.image={width:96,height:128};
  let p=pen();drawSprite(p.ctx,'cat',20,30,1,'idle',2,1,{emotion:'scared'});
  let call=p.calls.find(c=>c[0]==='drawImage');assert.equal(call[1],sheet.image);assert.equal(call.length,10);
  assert.equal(call[7],-call[9]); // image bottom lies at the foot origin
  for(const [action,pose] of [['outing','walk_a'],['eat','eat'],['sleep','sleep']]){
   p=pen();drawSprite(p.ctx,'cat',20,30,1,action,2,1,{emotion:'scared',pose});
   call=p.calls.find(c=>c[0]==='drawImage');assert.notEqual(call[1],sheet.image,action);
  }
  sheet.image=null;p=pen();drawSprite(p.ctx,'cat',0,0,0,'idle',1,1,{emotion:'happy'});
  assert.equal(p.calls.find(c=>c[0]==='drawImage')[1],art.image);
 }finally{art.image=originalImage;sheet.image=originalSheet;art.poses.walk_a.image=walk;}
});

test('reaction rendering respects reduced motion and leaves game state untouched',()=>{
 assert.deepEqual(miniEmotionMotion('peko','scared',1,true),{dx:0,dy:0,rotate:0});
 assert.notDeepEqual(miniEmotionMotion('peko','happy',.5),miniEmotionMotion('ann','happy',.5));
 const resident={type:'cat',action:'idle',needs:{stress:90}},before=JSON.stringify(resident);
 const renderer=Object.create(WorldRenderer.prototype);
 assert.equal(renderer.miniReaction('cat',0,resident).emotion,'sad');
 assert.equal(JSON.stringify(resident),before);
});


test('daily mood uses the actual stress and sleep needs, and sleep remains undisturbed',()=>{
 assert.equal(miniDailyEmotion({action:'idle',needs:{sleep:90}}),'tired');
 assert.equal(miniDailyEmotion({action:'sleep',needs:{stress:99,sleep:99}}),'neutral');
 assert.equal(miniDailyEmotion({action:'fight',needs:{}}),'angry');
});

test('newly illustrated residents keep a single walking silhouette and visitors can react on their route',()=>{
 const sheet=MINI_EMOTION_ART.rabbit,visitor=MINI_EMOTION_ART.patron;
 const before=sheet.image,previousVisitor=visitor.image;
 try{
  sheet.image={};visitor.image={};
  const images=[];
  for(const emotion of ['happy','scared']){const p=pen();drawSprite(p.ctx,'rabbit',0,0,0,'outing',1,1,{emotion});images.push(p.calls.find(c=>c[0]==='drawImage').slice(2,6));}
  assert.deepEqual(images[0],images[1]);assert.deepEqual(images[0],sheet.frames.relieved);
  const p=pen();drawSprite(p.ctx,'patron',0,0,0,'outing',1,1,{emotion:'happy'});
  assert.equal(p.calls.find(c=>c[0]==='drawImage')[1],visitor.image);
  assert.deepEqual(p.calls.find(c=>c[0]==='drawImage').slice(2,6),visitor.frames.happy);
 }finally{sheet.image=before;visitor.image=previousVisitor;}
});

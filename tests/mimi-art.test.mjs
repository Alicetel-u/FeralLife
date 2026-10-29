import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTER_ART} from '../src/character-art.js';
import {MINI_EMOTION_ART,MIMI_MINI_EMOTIONS,miniEmotionFrameName} from '../src/mini-emotions.js';
import {resolvePose,drawSprite} from '../src/renderer.js';
import {actThreeMimiWalkPose} from '../src/act-three-map.js';

test('Mimi has the same nine daily actions and nine reactions as the current mini families, with a common frame and pivot',()=>{
 const art=CHARACTER_ART.rabbit,keys=['stand','walk_a','walk_b','sit','sleep','eat','drink','clean','chat'];
 assert.deepEqual(Object.keys(art.poses),keys);assert.deepEqual(Object.keys(MINI_EMOTION_ART.rabbit.frames),MIMI_MINI_EMOTIONS);
 for(const name of keys){const pose=art.poses[name],png=readFileSync(pose.src);assert.equal(png[25],6);assert.equal(png.readUInt32BE(16),512);assert.equal(png.readUInt32BE(20),512);assert.deepEqual(pose.origin,[256,492]);}
 assert.notDeepEqual(readFileSync(art.poses.walk_a.src),readFileSync(art.poses.walk_b.src));
 assert.equal(miniEmotionFrameName('rabbit','rejecting'),'exasperated');assert.equal(miniEmotionFrameName('rabbit','furious'),'angry');assert.equal(miniEmotionFrameName('rabbit','panic'),'scared');
});
test('Mimi daily poses are selected through the shared renderer, and a missing frame falls back safely',()=>{
 const art=CHARACTER_ART.rabbit;
 try{for(const pose of Object.values(art.poses))pose.image={};
 for(const [action,pose] of Object.entries({tv:'sit',sleep:'sleep',eat:'eat',drink:'drink',clean:'clean',chat:'chat',counsel:'chat'}))assert.equal(resolvePose('rabbit',action),pose);
 assert.equal(resolvePose('rabbit','idle',true,0),'walk_a');assert.equal(resolvePose('rabbit','idle',true,.25),'walk_b');art.poses.walk_b.image=null;assert.equal(resolvePose('rabbit','idle',true,.25),'base');
 }finally{for(const pose of Object.values(art.poses))pose.image=null;}
});
test('Mimi map footfalls advance only with distance and rest in stand when stopped or reduced',()=>{
 assert.equal(actThreeMimiWalkPose(0),'walk_a');assert.equal(actThreeMimiWalkPose(19.9),'walk_a');assert.equal(actThreeMimiWalkPose(20),'walk_b');assert.equal(actThreeMimiWalkPose(40),'walk_a');
 assert.equal(actThreeMimiWalkPose(20,false),'stand');assert.equal(actThreeMimiWalkPose(20,true,true),'stand');
 const source=readFileSync(new URL('../src/act-three-map.js',import.meta.url),'utf8');assert.match(source,/!document.hidden\)walkDistance\+=Math.hypot/);
});
test('Mimi sleeping and sitting retain the single stand scale rather than growing to full standing height',()=>{
 const art=CHARACTER_ART.rabbit,old=art.image;const calls=[];const ctx=new Proxy({}, {get:(_,key)=>(...args)=>{if(key==='drawImage')calls.push(args);},set:()=>true});
 try{art.image={width:512,height:512};for(const pose of Object.values(art.poses))pose.image={width:512,height:512};
 for(const name of ['stand','sit','sleep','walk_a'])drawSprite(ctx,'rabbit',0,0,0,name==='sleep'?'sleep':'idle',1,1,{pose:name,poseLocked:true,reduced:true});
 assert.equal(calls.length,4);assert.ok(calls.every(args=>args[3]===calls[0][3]&&args[4]===calls[0][4]));
 }finally{art.image=old;for(const pose of Object.values(art.poses))pose.image=null;}
});

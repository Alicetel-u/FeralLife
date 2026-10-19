import {tickObservation,observationClockLimit} from '../src/act-one-observation.js';
import {readFileSync} from 'node:fs';
import {extractVoiceScript} from '../tools/voice-script.mjs';
import {createActOne} from '../src/act-one.js';
import {beginActTwo,advanceActTwo,answerActTwo} from '../src/act-two.js';
import {lunaNearby,secondActChat} from '../src/act-two-life.js';
import {createTalk,stepTalk,SPEECH_MS} from '../src/dialogue.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CHARACTERS} from '../src/simulation.js';
import {CHARACTER_ART} from '../src/character-art.js';
import {drawSprite,WorldRenderer} from '../src/renderer.js';
import {MINI_EMOTIONS,LUNA_MINI_EMOTIONS,MOKU_MINI_EMOTIONS,MOKU_EXTRA_EMOTIONS,MINI_EMOTION_ART,MINI_PERSONALITY,miniLineEmotion,miniDailyEmotion,miniEmotionMotion,MiniReactionState,miniEmotionFrameName} from '../src/mini-emotions.js';

const pen=()=>{const calls=[];const ctx=new Proxy({}, {get:(_,key)=>(...args)=>calls.push([key,...args]),set:()=>true});return {ctx,calls};};

test('all eleven residents, landlord and visitor ship bounded transparent reaction frames, including Moku and Luna’s nine',async()=>{
 const types=[...Object.keys(CHARACTERS),'manager','patron'].sort();
 assert.deepEqual(Object.keys(MINI_EMOTION_ART).sort(),types);
 assert.deepEqual(Object.keys(MINI_PERSONALITY).sort(),types);
 for(const type of types){
  const art=MINI_EMOTION_ART[type],png=await readFile(art.src);
  assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png[25],6);
  const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
  assert.deepEqual(Object.keys(art.frames),type==='hostess'?LUNA_MINI_EMOTIONS:type==='cat'?MOKU_MINI_EMOTIONS:MINI_EMOTIONS);
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


test('all nine Luna reactions are directed by real authored lines and serious scenes never flirt',()=>{
 const lines=[...extractVoiceScript('act2'),...extractVoiceScript('act2-trouble1')].filter(r=>r.speaker==='hostess');
 const used=new Set(lines.map(r=>miniLineEmotion(r.line)));
 for(const emotion of LUNA_MINI_EMOTIONS)assert.ok(used.has(emotion),emotion+' must have a real authored trigger');
 for(const r of lines.filter(r=>/act2\/(bag|contract|film)/.test(r.source)&&!r.source.includes('/runtime/')&&!r.source.includes('act2/bag/guarantee')))assert.ok(!miniLineEmotion(r.line).startsWith('flirt-'),r.line.text);
 assert.equal(miniLineEmotion({speaker:'hostess',text:'助けて♡',emotion:'scared'}),'scared');
 assert.equal(miniLineEmotion({speaker:'hostess',text:'おはよう',miniEmotion:'toString'}),'neutral');
 assert.equal(miniLineEmotion({speaker:'cat',text:'モクちゃん、それ毎日言ってない？'}),'neutral');
 const tracker=new MiniReactionState();
 tracker.update([{speaker:'hostess',text:'同じ台詞',miniEmotion:'flirt-wink'}],0);
 assert.equal(tracker.emotion('hostess',0,true),'flirt-wink');
 tracker.update([{speaker:'hostess',text:'同じ台詞',miniEmotion:'flirt-lean'}],0);
 assert.equal(tracker.emotion('hostess',0,true),'flirt-lean');
});

test('both flirting crops render distinctly, respect reduced motion, and defer to walking and sleep',()=>{
 const sheet=MINI_EMOTION_ART.hostess,art=CHARACTER_ART.hostess;
 const before=sheet.image,base=art.image;
 try{
  sheet.image={};art.image={width:128,height:128};const crops=[];
  for(const emotion of ['flirt-wink','flirt-lean']){
   const p=pen();drawSprite(p.ctx,'hostess',0,0,0,'idle',1,1,{emotion,reduced:true});
   const draw=p.calls.find(c=>c[0]==='drawImage');assert.equal(draw[1],sheet.image);crops.push(draw.slice(2,6));
   assert.deepEqual(miniEmotionMotion('hostess',emotion,1,true),{dx:0,dy:0,rotate:0});
   for(const [action,pose] of [['outing','walk_a'],['sleep','sleep']]){
    const pp=pen();drawSprite(pp.ctx,'hostess',0,0,0,action,1,1,{emotion,pose});
    assert.notEqual(pp.calls.find(c=>c[0]==='drawImage')[1],sheet.image);
   }
  }
  assert.notDeepEqual(crops[0],crops[1]);
  sheet.image=null;const p=pen();drawSprite(p.ctx,'hostess',0,0,0,'idle',1,1,{emotion:'flirt-wink'});
  assert.equal(p.calls.find(c=>c[0]==='drawImage')[1],art.image);
 }finally{sheet.image=before;art.image=base;}
});

test('chapter-two observation actually reaches both flirt reactions without editing the save or dialogue',()=>{
 const s=createActOne(91);beginActTwo(s);s.actOne.started=true;s.actOne.prologuePending=false;s.events.forEach(e=>e.read=true);
 let talk=createTalk();
 for(let i=0;i<600;i++){tickObservation(s,.25);advanceActTwo(s,Math.min(.15,Math.max(0,observationClockLimit(s)-s.hour)));tickObservation(s,0);stepTalk(talk,s,i*250,false);if(miniLineEmotion(talk.bubbles[0])==='wicked')break;}
 assert.equal(miniLineEmotion(talk.bubbles[0]),'wicked');
 advanceActTwo(s,100);answerActTwo(s,s.actOne.pending.eventId,'loan');
 advanceActTwo(s,100);
 for(let i=0;i<50&&!(lunaNearby(s)&&secondActChat(s)?.key==='act2-chat-relief');i++)advanceActTwo(s,.1);
 assert.equal(secondActChat(s)?.key,'act2-chat-relief');
 talk=createTalk();stepTalk(talk,s,100,false);stepTalk(talk,s,100+SPEECH_MS.line,false);stepTalk(talk,s,100+SPEECH_MS.line*2,false);
 assert.equal(miniLineEmotion(talk.bubbles[0]),'charm');
 const renderer=Object.create(WorldRenderer.prototype);renderer.miniReactions=new MiniReactionState();renderer.speaking=new Set(['hostess']);
 const before=JSON.stringify(s);renderer.miniReactions.update(talk.bubbles,1);
 assert.equal(renderer.miniReaction('hostess',1,s.residents.find(r=>r.type==='hostess')).emotion,'charm');
 assert.equal(JSON.stringify(s),before);
});


test('native Luna cutout renders without runtime alpha truncation or an intermediate canvas',()=>{
 const art=MINI_EMOTION_ART.hostess,base=CHARACTER_ART.hostess;
 const image=art.image,baseImage=base.image,doc=globalThis.document;
 const pixels=new Uint8ClampedArray([10,20,30,40,40,50,60,254]);let reads=0;
 const cleanCanvas={width:0,height:0,getContext:()=>({drawImage(){},getImageData(){reads++;return {data:pixels};},putImageData(){}})};
 try{
  globalThis.document={createElement:()=>cleanCanvas};art.image={width:2,height:1};base.image={width:128,height:128};
  for(let i=0;i<2;i++){const p=pen();drawSprite(p.ctx,'hostess',0,0,0,'idle',1,1,{emotion:'flirt-wink'});assert.equal(p.calls.find(c=>c[0]==='drawImage')[1],art.image);}
  assert.equal(reads,0);assert.deepEqual([...pixels],[10,20,30,40,40,50,60,254]);
 }finally{art.image=image;base.image=baseImage;if(doc===undefined)delete globalThis.document;else globalThis.document=doc;}
});


test('Moku uses her rebuilt nine mini frames and all strong directions match existing lines',()=>{
 const rows=extractVoiceScript('act1').filter(r=>r.speaker==='cat');
 const used=new Set(rows.map(r=>miniLineEmotion(r.line)));
 for(const emotion of MOKU_EXTRA_EMOTIONS)assert.ok(used.has(emotion),emotion);
 assert.equal(Object.keys(MINI_EMOTION_ART.cat.frames).length,9);
 assert.equal(MINI_EMOTION_ART.cat.src,'assets/characters/cat/emotions-v4.png');
 assert.equal(CHARACTER_ART.cat.src,'assets/characters/cat/observation-v4/stand.png');
 assert.equal(CHARACTER_ART.hostess.src,'assets/characters/hostess/observation-v4/stand.png');
 assert.equal(miniEmotionFrameName('cat','furious'),'angry');assert.equal(miniEmotionFrameName('hostess','flirt-lean'),'charm');
});

test('Moku and Luna share native-resolution art across every observation action',()=>{
 for(const type of ['cat','hostess']){
  const art=CHARACTER_ART[type],emotion=MINI_EMOTION_ART[type];
  assert.ok(emotion.height>=350,'retain native emotion resolution');assert.equal(emotion.alphaCutoff,undefined,'alpha cleaned once at native resolution');
  assert.match(art.src,/observation-v4\/stand.png$/);
  for(const name of ['stand','walk_a','walk_b','sit','sleep','eat','drink','clean','chat']){
   const pose=art.poses[name];assert.ok(pose,`${type}/${name}`);assert.match(pose.src,/observation-v4\//);
   const png=readFileSync(new URL('../'+pose.src,import.meta.url));
   assert.ok(png.readUInt32BE(16)>=250&&png.readUInt32BE(20)>=200,'no 96/128px intermediate sprite');
  }
 }
});

test('approved nine-frame families cover old directions and keep playful looks out of tragedy',()=>{
 for(const type of ['cat','hostess']){
  assert.equal(Object.keys(MINI_EMOTION_ART[type].frames).length,9);
  for(const emotion of ['furious','panic','despair','pleading','stunned','laughing','shy','relieved','rejecting'])assert.ok(miniEmotionFrameName(type,emotion),type+'/'+emotion);
 }
 assert.notDeepEqual(MINI_EMOTION_ART.hostess.frames.charm,MINI_EMOTION_ART.hostess.frames['flirt-wink']);
 assert.notDeepEqual(MINI_EMOTION_ART.hostess.frames.wicked,MINI_EMOTION_ART.hostess.frames.charm);
 for(const text of ['……お願い。もう帰って。','助けて♡'])assert.ok(!['charm','flirt-wink','wicked'].includes(miniEmotionFrameName('hostess',miniLineEmotion({speaker:'hostess',text,emotion:'scared'}))));
 assert.equal(miniEmotionFrameName('hostess','toString'),null);
});

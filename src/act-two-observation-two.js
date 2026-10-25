import {OBSERVATION_CHARACTER_SIZE} from './room-layouts.js';
import {homeSpot} from './movement.js';
export const FOUR_KINGS_START=80;
export const FOUR_KINGS_IDS=['luna-four-kings-notice','luna-four-kings-support','luna-four-kings-message','luna-four-kings-reply'];
const kingsLine=(speaker,text,delivery='bright',emotion='happy',extra={})=>({speaker,name:{manager:'大家',cat:'モク',hostess:'ルナ'}[speaker],text,emotion,voicePerformance:'four-kings-'+delivery,...(speaker==='hostess'?{miniEmotion:{tease:'charm',confess:'shy',surprise:'confused',bright:'relieved',laugh:'laughing'}[delivery]}:speaker==='cat'?{miniEmotion:delivery==='moku-proud'?'laughing':'exasperated'}:{}),...extra});
export const ACT_TWO_SECOND_OBSERVATION_BEATS=[
 {id:FOUR_KINGS_IDS[0],phase:1,at:80,title:'観察パート2「ルナと四天王」',lines:[
 kingsLine('hostess','あ、ちょっとごめんね。','bright','happy',{observationSfx:'phone'}),
 kingsLine('hostess','……げっ。','surprise','surprised'),
 kingsLine('manager','どうした？','manager-alert'),
 kingsLine('hostess','ううん、何でもない♡','tease'),
 kingsLine('cat','何でもない顔じゃないニャ。','moku','surprised'),
 kingsLine('manager','また昨日の男か？','manager-alert'),
 kingsLine('hostess','ううん。別の人。','bright'),
 kingsLine('manager','……別の？','manager-surprise','surprised'),
 kingsLine('hostess','実はね、ほかにも何人か、ちょっと誤解させちゃった人がいて……。','confess','shy'),
 kingsLine('manager','お前……いったい何人に勘違いさせてんだよ！？','manager-retort','surprised'),
 kingsLine('hostess','えへへ……ちょっとだけ♡','tease'),
 kingsLine('cat','昨日の男は、ただの前座だったニャ。','moku'),
 kingsLine('manager','前座ってなんだよ！','manager-retort'),
 kingsLine('cat','このあと四天王が出てくるニャ！','moku-proud'),
 kingsLine('manager','なんで急に戦いが始まるんだよ！！','manager-retort','surprised'),
 kingsLine('hostess','……。','confess','shy',{silent:true}),
 kingsLine('manager','……おい。なんで黙ってんだ？','manager-alert','surprised'),
 kingsLine('hostess','……あはは♡','tease'),
 kingsLine('manager','笑ってごまかすな！！','manager-retort','angry')
 ]},
 {id:FOUR_KINGS_IDS[1],phase:1,at:80.5,debugEntry:false,title:'ルナと四天王｜後方支援',lines:[
 kingsLine('manager','ったく……。昨日みたいな騒ぎはもう勘弁してくれよ。','manager-alert'),
 kingsLine('hostess','……うん。ごめんね、大家さん。','confess','sad'),
 kingsLine('manager','謝ることじゃねぇけど、困ったら早めに言えよ。','manager-warm'),
 kingsLine('hostess','……ありがと♡','bright'),
 kingsLine('cat','ルナ。','moku','neutral',{motionSeconds:1}),
 kingsLine('hostess','ん？ なあに？','bright'),
 kingsLine('cat','本当に四天王が来たら、モクを呼ぶニャ。','moku-proud'),
 kingsLine('hostess','ふふっ。モクちゃん、戦ってくれるの？','tease'),
 kingsLine('cat','もちろんニャ！ ……大家が。','moku-proud'),
 kingsLine('hostess','あははっ！ モクちゃんは？','laugh'),
 kingsLine('cat','モクは後方支援ニャ。','moku-proud','happy',{motionSeconds:1.5})
 ]},
 {id:FOUR_KINGS_IDS[2],phase:1,at:81.5,debugEntry:false,title:'ルナと四天王｜ルナの決意',lines:[
 kingsLine('hostess','……はぁ。どうしよっかなぁ。','thinking','tired'),
 kingsLine('hostess','……また変に期待させちゃダメだよね。','determined','neutral'),
 kingsLine('hostess','……よしっ。今度こそ、ちゃんと話そう。','determined')
 ]},
 {id:FOUR_KINGS_IDS[3],phase:1,at:83.5,debugEntry:false,title:'ルナと四天王｜今日来るの！？',lines:[
 kingsLine('hostess','……え？','surprise','surprised',{observationSfx:'phone'}),
 kingsLine('hostess','……今日来るの！？','surprise','surprised'),
 kingsLine('hostess','……ちょっと待って。これ、あたし一人じゃ無理かも……。','surprise','surprised'),
 kingsLine('hostess','……あっ。そうだ♡','bright','happy',{motionSeconds:2.6})
 ]}
];
const kingsPoint=(x,y=440,zone='room',room=102,direction=1)=>({x,y,zone,room,direction});
const KINGS_ROOM={cat:kingsPoint(444),hostess:kingsPoint(472),manager:kingsPoint(500,440,'room',102,-1)};
const KINGS_HALL={cat:kingsPoint(450,438,'hall'),hostess:kingsPoint(525,440,'hall'),manager:kingsPoint(605,440,'hall',102,-1)};
const kingsHome={...homeSpot(101),direction:1};
export const FOUR_KINGS_END={cat:kingsPoint(540,440,'hall'),hostess:kingsPoint(640,513,'street',null,1),manager:kingsPoint(695,513,'street',null,-1)};
function kingsMove(path,elapsed,duration,{delay=0,reduced=false}={}){
 const p=reduced?1:Math.max(0,Math.min(1,(elapsed-delay)/duration));
 const lengths=path.slice(1).map((b,i)=>Math.hypot(b.x-path[i].x,b.y-path[i].y)),total=lengths.reduce((a,b)=>a+b,0);let left=total*p;
 if(p<=0)return {...path[0],moving:false,walkDistance:0};
 for(let i=0;i<lengths.length;i++){if(left<lengths[i]){const a=path[i],b=path[i+1],q=left/lengths[i];
  const zone=a.zone==='room'&&q<.8?'room':b.zone==='room'&&q>.2?'room':a.zone==='street'||b.zone==='street'?'street':'hall';
  return {...b,x:a.x+(b.x-a.x)*q,y:a.y+(b.y-a.y)*q,zone,room:zone==='room'?(a.zone==='room'?a.room:b.room):b.room,direction:b.x<a.x?-1:1,moving:true,walkDistance:total*p};
 }left-=lengths[i];}
 return {...path.at(-1),moving:false,walkDistance:total};
}
export function prepareFourKingsMorning(state){
 const a=state.actOne;
 if(a?.chapter!==2||!a.completed.includes('bag')||a.completed.includes('duel')||a.duel||a.pending||a.status!=='playing')return false;
 if(a.fourKingsObservationVersion===1)return false;
 a.fourKingsObservationVersion=1;state.hour=80;
 if(a.observation){a.observation.current=null;a.observation.gap=0;}
 return true;
}
export function fourKingsFrame(state){
 const a=state.actOne,o=a?.observation;
 if(a?.chapter!==2||!a.started||a.status!=='playing'||a.pending||a.rewindIntroPending||!a.completed.includes('bag')||a.completed.includes('duel'))return null;
 const current=o?.current;if(state.hour>=84&&!current)return {stage:3,index:4,elapsed:0,active:false};
 const stage=current?FOUR_KINGS_IDS.indexOf(current.id):-1;
 if(stage>=0)return {stage,index:current.index,elapsed:Math.max(0,current.elapsed||0),active:true};
 const done=id=>o?.done?.includes(id);
 if(!done(FOUR_KINGS_IDS[0]))return {stage:0,index:0,elapsed:0,active:false};
 if(!done(FOUR_KINGS_IDS[1]))return {stage:1,index:0,elapsed:0,active:false};
 if(!done(FOUR_KINGS_IDS[2]))return {stage:2,index:-1,elapsed:0,active:false};
 if(!done(FOUR_KINGS_IDS[3]))return {stage:2,index:3,elapsed:0,active:false};
 return {stage:3,index:4,elapsed:0,active:false};
}
export function fourKingsPosition(state,type,{reduced=false}={}){
 const f=fourKingsFrame(state);if(!f||!KINGS_ROOM[type])return null;
 const {stage,index,elapsed}=f;
 let p={...KINGS_ROOM[type],moving:false,walkDistance:0},height=OBSERVATION_CHARACTER_SIZE.interior,pose='chat',action='chat',props=[],visible=true,lockPose=false;
 if(stage===0){
  if(type==='hostess')props=[{kind:'phone',x:22,y:-53}];
  if(type==='manager')pose=[9,12,14,18].includes(index)?'retort':'talk';
 }
 if(stage===1){
  if(type==='manager'){
   if(index<4)p={...KINGS_ROOM.manager,moving:false,walkDistance:0};
   else {p=kingsMove([KINGS_ROOM.manager,KINGS_HALL.manager,kingsPoint(777,440,'hall',103),kingsPoint(815,513,'street',null),kingsPoint(1040,513,'street',null)],index===4?elapsed:4,2.8,{reduced});visible=p.x<1030;}
   pose='talk';
  }else if(index>=4){
   p=type==='cat'?kingsMove([KINGS_ROOM.cat,kingsPoint(513,440,'hall'),KINGS_HALL.cat],index===4?elapsed:2,.45,{reduced}):kingsMove([KINGS_ROOM.hostess,kingsPoint(513),KINGS_HALL.hostess],index===4?elapsed:2,.5,{delay:.45,reduced});
   if(index===10){
    if(type==='cat')p=kingsMove([KINGS_HALL.cat,kingsPoint(331,440,'hall',101),kingsHome],elapsed,1.1,{delay:.2,reduced});
    else p=kingsMove([KINGS_HALL.hostess,kingsPoint(513,440,'hall'),kingsPoint(472)],elapsed,.6,{delay:.85,reduced});
   }
  }
 }
 if(stage>=2){
  if(type==='cat'){p={...kingsHome};visible=false;}
  if(type==='manager'){p={...FOUR_KINGS_END.manager};visible=stage===3;}
  if(type==='hostess'){
   p=kingsPoint(472);pose=stage===2&&index<3?'sit':'clean';action='idle';lockPose=pose==='sit';
   props=[{kind:'phone',x:22,y:-48}];
   if(stage===2&&index===3){const q=Math.max(0,Math.min(1,(state.hour-81.5)/2));p.x=472+22*Math.sin(q*Math.PI);props=[{kind:'cloth',x:20,y:-25}];lockPose=true;action='clean';}
   if(stage===3){pose='chat';if(index>=3){
    p=kingsMove([kingsPoint(472),kingsPoint(513,440,'hall'),kingsPoint(777,440,'hall',103),kingsPoint(815,513,'street',null),FOUR_KINGS_END.hostess],index===3?elapsed:5,2.4,{delay:.15,reduced});props=[];
   }}
  }
  if(type==='cat'&&stage===3){const q=Math.max(0,Math.min(1,(state.hour-83.5)/.4));p=kingsMove([kingsHome,kingsPoint(331,440,'hall',101),FOUR_KINGS_END.cat],q,1,{reduced});visible=q>0;}
 }
 if(stage===1&&type==='manager'&&index<4&&!p.moving)p.direction=-1;
 if(stage===1&&type==='hostess'&&index>=5&&index<10&&!p.moving)p.direction=-1;
 const moving=p.moving||false;
 const pulse=reduced?0:Math.sin(Math.min(1,elapsed/.45)*Math.PI);
 const dy=f.active&&type==='manager'&&stage===0&&[9,12,14,18].includes(index)?-5*pulse:0;
 // Camera follows Luna, so all callers receive the same scene view below.
 let cameraView='interior';
 if(stage===1&&index>=4){const l=index===10?kingsMove([KINGS_HALL.hostess,kingsPoint(513,440,'hall'),kingsPoint(472)],elapsed,.6,{delay:.85,reduced}):kingsMove([KINGS_ROOM.hostess,kingsPoint(513),KINGS_HALL.hostess],index===4?elapsed:2,.5,{delay:.45,reduced});cameraView=l.zone==='room'?'interior':'exterior';}
 if(stage===3&&index>=3){const l=kingsMove([kingsPoint(472),kingsPoint(513,440,'hall'),kingsPoint(777,440,'hall',103),kingsPoint(815,513,'street',null),FOUR_KINGS_END.hostess],index===3?elapsed:5,2.4,{delay:.15,reduced});cameraView=l.zone==='room'?'interior':'exterior';}
 return {...p,height,roomGroup:stage===0||stage===1&&index<4,pose,action,props,lockPose,seat:type==='hostess'&&stage===2&&index<3,visible,dy,rotate:0,chat:true,cameraView,...(stage===1&&cameraView==='exterior'?{cameraTarget:{x:525,y:440,zone:'hall'}}:{})};
}
const kingsCueHistory=new WeakMap();
export function playFourKingsNotice(line,key,context,volume){
 if(line?.observationSfx!=='phone'||!context||volume<=0)return false;
 let seen=kingsCueHistory.get(context);if(!seen){seen=new Set();kingsCueHistory.set(context,seen);}if(seen.has(key))return false;seen.add(key);
 const now=context.currentTime;
 for(const [offset,hz] of [[0,880],[.13,1174]]){const o=context.createOscillator(),g=context.createGain();o.type='sine';o.frequency.value=hz;g.gain.setValueAtTime(0,now+offset);g.gain.linearRampToValueAtTime(Math.min(.12,volume*.12),now+offset+.012);g.gain.exponentialRampToValueAtTime(.001,now+offset+.11);o.connect(g);g.connect(context.destination);o.start(now+offset);o.stop(now+offset+.12);o.onended=()=>{o.disconnect();g.disconnect();};}
 return true;
}

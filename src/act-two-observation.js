import {homeSpot} from './movement.js';

export const LUNA_NEW_ALLY_ID='luna-new-ally';
const newAllyLine=(speaker,text,delivery,emotion='happy',extra={})=>({speaker,name:{cat:'モク',hostess:'ルナ',manager:'大家'}[speaker],text,emotion,voicePerformance:'new-ally-'+delivery,...(speaker==='cat'?{miniEmotion:{protest:'furious',call:'panic',proud:'laughing',shock:'stunned'}[delivery]}:speaker==='hostess'?{miniEmotion:{surprise:'confused',bright:'relieved',tease:'charm',laugh:'laughing'}[delivery]}:{}),...extra});
// The user's approved script. One observation part, one cursor, one debug entry.
export const ACT_TWO_OBSERVATION_BEATS=[{id:LUNA_NEW_ALLY_ID,phase:0,at:65.1,title:'観察パート1「新入りの味方」',lines:[
 newAllyLine('manager','だからダメだって言ってんだろ！','retort','angry'),
 newAllyLine('cat','大家のケチ！ 鬼！ 悪徳大家ニャ！','protest','angry'),
 newAllyLine('manager','誰が悪徳大家だ！','retort','angry'),
 newAllyLine('cat','ルナ！ 助けてくれニャー！','call','surprised',{motionSeconds:.8}),
 newAllyLine('hostess','えっ！？ どうしたの？','surprise','surprised'),
 newAllyLine('cat','大家がモクをいじめるニャ！','protest','angry'),
 newAllyLine('manager','人聞きの悪いこと言うな！','retort','angry'),
 newAllyLine('hostess','まあまあ、二人とも落ち着いて。何があったの？','bright','happy',{motionSeconds:.8}),
 newAllyLine('cat','モクはちょっとお願いしただけニャ！','protest'),
 newAllyLine('manager','ちょっとじゃねぇだろ！ 俺の部屋の冷蔵庫を勝手に使おうとしやがって！','retort','angry'),
 newAllyLine('hostess','冷蔵庫？','surprise','surprised'),
 newAllyLine('cat','モクの冷蔵庫、ビールでいっぱいになったニャ。','proud'),
 newAllyLine('manager','だからって俺の冷蔵庫にまで入れるな！','retort','angry'),
 newAllyLine('hostess','ふふっ。モクちゃん、お酒好きなんだね♡','tease'),
 newAllyLine('cat','ルナは分かってくれるニャ！','proud'),
 newAllyLine('hostess','でも、そんなに飲んだら体に悪いよ？','bright'),
 newAllyLine('cat','……ニャ？','shock','surprised'),
 newAllyLine('hostess','せっかくだし、今日は休肝日にしよっか♡','tease','happy',{miniEmotion:'wicked'}),
 newAllyLine('cat','……大家。','shock','tired'),
 newAllyLine('manager','なんだよ。','plain'),
 newAllyLine('cat','この女、大家より厳しいニャ。','shock','surprised'),
 newAllyLine('manager','お前が味方に呼んだんだろ！','retort'),
 newAllyLine('cat','ふんっ！ 二人ともグルだったのかニャ！ もう信用しないニャ！','protest','angry'),
 newAllyLine('manager','今日初めて会ったばっかりだろ！','retort'),
 newAllyLine('hostess','あははっ。モクちゃん、面白いね。','laugh','happy',{motionSeconds:1.35}),
 newAllyLine('manager','面白がってられるのは今のうちだぞ……。','plain','tired'),
 newAllyLine('hostess','ふふっ。でも、なんだか楽しそうなアパートだね♡','bright'),
 newAllyLine('manager','毎日あんな調子じゃ、こっちは身が持たねぇよ。','plain','tired'),
 newAllyLine('manager','さて、外でも掃除するか。','plain'),
 newAllyLine('hostess','あ、大家さん。ちょっと外の空気吸ってきてもいい？','bright'),
 newAllyLine('manager','別に許可なんかいらねぇよ。','plain'),
 newAllyLine('hostess','えへへ。そっか♡','bright','happy',{motionSeconds:4.15})
]}];

const newAllyPoint=(x,y,zone='hall',room=102,direction=1)=>({x,y,zone,room,direction});
const newAllyHome={...homeSpot(101,'table'),direction:1};
export const NEW_ALLY_END={cat:newAllyHome,hostess:newAllyPoint(615,513,'street',null,1),manager:newAllyPoint(745,513,'street',null,-1)};
// Each move is keyed once. Subsequent lines retain its endpoint, rather than replaying it.
const NEW_ALLY_ROUTES={
 cat:[
  {line:0,path:[newAllyPoint(412,440)],duration:0},
  {line:3,path:[newAllyPoint(412,440),newAllyPoint(468,440)],duration:.7},
  {line:7,path:[newAllyPoint(468,440),newAllyPoint(460,440,'hall',102)],duration:.7},
  {line:24,path:[newAllyPoint(460,440),newAllyPoint(331,440,'hall',101),newAllyHome],duration:1.3}
 ],
 hostess:[
  {line:0,path:[newAllyPoint(483,427,'room',102,-1)],duration:0},
  {line:7,path:[newAllyPoint(483,427,'room',102,-1),newAllyPoint(556,440,'hall',102)],duration:.7},
  {line:31,path:[newAllyPoint(556,440),newAllyPoint(777,440,'hall',103),newAllyPoint(815,513,'street',null),NEW_ALLY_END.hostess],duration:3.65,delay:.45}
 ],
 manager:[
  {line:0,path:[newAllyPoint(662,440,'hall',102,-1)],duration:0},
  {line:31,path:[newAllyPoint(662,440),newAllyPoint(777,440,'hall',103),newAllyPoint(815,513,'street',null),NEW_ALLY_END.manager],duration:3.1}
 ]
};
function sampleNewAllyRoute(cue,index,elapsed,reduced){
 const path=cue.path,lengths=path.slice(1).map((to,i)=>Math.hypot(to.x-path[i].x,to.y-path[i].y)),total=lengths.reduce((a,b)=>a+b,0);
 const progress=reduced||index>cue.line||!cue.duration?1:Math.max(0,Math.min(1,(elapsed-(cue.delay||0))/cue.duration));
 const travelled=total*progress;let remaining=travelled;
 for(let i=0;i<lengths.length;i++){
  if(remaining<lengths[i]){const a=path[i],b=path[i+1],p=remaining/lengths[i];
   const zone=a.zone==='room'&&p<.8?'room':b.zone==='room'&&p>.2?'room':a.zone==='street'||b.zone==='street'?'street':'hall';
   return {...b,x:a.x+(b.x-a.x)*p,y:a.y+(b.y-a.y)*p,zone,room:zone==='room'?(a.zone==='room'?a.room:b.room):b.room,direction:b.x<a.x?-1:1,moving:progress>0&&progress<1,walkDistance:travelled};
  }remaining-=lengths[i];
 }
 return {...path.at(-1),moving:false,walkDistance:total};
}
export function newAllyFrame(state){
 const a=state.actOne,o=a?.observation;
 if(a?.chapter!==2||!a.started||a.status!=='playing'||a.prologuePending||a.rewindIntroPending||a.pending||a.completed?.includes('bag'))return null;
 if(o?.current?.id===LUNA_NEW_ALLY_ID)return {index:o.current.index,elapsed:Math.max(0,o.current.elapsed||0),view:o.current.index<7?'interior':'exterior'};
 if(o?.done?.includes(LUNA_NEW_ALLY_ID))return {index:32,elapsed:0,view:'exterior'};
 return null;
}
export function newAllyPosition(state,type,{reduced=false}={}){
 const frame=newAllyFrame(state),cues=NEW_ALLY_ROUTES[type];if(!frame||!cues)return null;
 const cue=cues.findLast(c=>c.line<=frame.index),p=sampleNewAllyRoute(cue,frame.index,frame.elapsed,reduced);
 const pulse=reduced?0:Math.sin(Math.min(1,frame.elapsed/.45)*Math.PI);
 let pose='chat',action='chat',dy=0,rotate=0,props=[],lockPose=false;
 if(type==='manager')pose=frame.index>=31?'clean':frame.index>=28?'clean':frame.index===25||frame.index===27?'think':[0,2,6,9,12,21,23].includes(frame.index)?'retort':'talk';
 if(type==='manager'&&[0,2,6,9,12,21,23].includes(frame.index)){dy=-3*pulse;rotate=-.035*pulse;}
 if(type==='cat'){
  if(frame.index>=24){pose='sit';action='idle';}
  if([1,3,5,8,14,22].includes(frame.index)){dy=-7*pulse;rotate=-.055*pulse;}
  if([16,18,20].includes(frame.index)){rotate=.09*pulse;dy=-4*pulse;}
 }
 if(type==='hostess'&&frame.index<3){pose='clean';lockPose=true;props=[{kind:'bag',x:20,y:0}];}
 if(type==='hostess'&&frame.index===24){dy=-4*pulse;rotate=.025*pulse;}
 return {...p,dy,rotate,pose,action,props,lockPose,chat:true,cameraView:frame.view};
}
// Old observations are intentionally removed. Unfinished old saves start the new part.
export function migrateNewAllyObservation(state){
 const o=state.actOne?.observation;if(state.actOne?.chapter!==2||!o||state.actOne.completed?.includes('bag'))return;
 const old=id=>typeof id==='string'&&id.startsWith('luna-')&&id!==LUNA_NEW_ALLY_ID;
 if(old(o.current?.id)||o.done?.some(old)||o.seen?.some(old)){
  o.current=null;o.gap=0;o.done=(o.done||[]).filter(id=>!old(id));o.seen=(o.seen||[]).filter(id=>!old(id));
 }
}

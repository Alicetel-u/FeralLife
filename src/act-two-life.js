import {createRoomMove,createVisit,createOuting,createEntranceMove,sampleJourney} from './movement.js';
import {ACT_TWO_OBSERVATION_BEATS} from './act-two-observation.js';

const LUNA_DAY=[
 [57,'chat','table','arrival'],[58.5,'chat','table','arrival'],[61,'chat','table','photo'],
 [62.25,'chat','table','tea'],[65,'chat','table','farewell'],[65.25,'idle','entrance'],
 [67,'outing','hall'],[80,'idle','table'],[81.25,'clean','table'],
 [83,'idle','table','relief'],[87,'sleep','bed'],[95,'eat','fridge'],
 [97,'clean','center'],[103,'idle','window']
];
const POSITIONS={idle:'table',clean:'center',eat:'fridge',sleep:'bed',smoke:'window',tv:'tv',drink:'table'};
export function secondActLife(state,delta=0){
 if(state.actOne?.chapter!==2||state.actOne.status!=='playing')return;
 const luna=state.residents.find(r=>r.type==='hostess'),cat=state.residents.find(r=>r.type==='cat');if(!luna)return;
 const escaped=ACT_TWO_OBSERVATION_BEATS.every(b=>state.actOne.observation?.done?.includes(b.id));
 const beat=escaped&&state.hour<65.25?LUNA_DAY.find(([at])=>at===65.25):LUNA_DAY.findLast(([at])=>at<=state.hour)||LUNA_DAY[0];
 // Old saves may still have a cleaning/snack pose or a short visit at this beat.
 if(state.hour<65.25&&!state.actOne.completed.includes('bag')&&(luna.action==='clean'||luna.action==='eat'||!escaped&&cat?.journey?.returnAt<65.25))delete luna.actTwoBeat;
 for(const r of [luna,cat].filter(Boolean))r.storyUntil=106;
 if(luna.actTwoBeat!==beat[0]){
  const start=escaped&&state.hour<65.25?{x:513,y:419,zone:'room',room:102}:sampleJourney(luna,state.hour,POSITIONS[luna.action]||'table');
  luna.previous=luna.action;luna.action=beat[1];luna.actionAge=0;luna.targetRoom=null;luna.actTwoBeat=beat[0];
  luna.journey=beat[2]==='entrance'?createEntranceMove(luna,Math.min(state.hour,65.25),start):beat[1]==='outing'?createOuting(luna,state.hour,start):createRoomMove(luna,state.hour,start,beat[2]);
  if(cat){
   const from=escaped&&state.hour<65.25?{x:510,y:440,zone:'hall',room:102}:sampleJourney(cat,state.hour,POSITIONS[cat.action]||'table');
   cat.previous=cat.action;cat.action=beat[3]?'chat':state.hour%24<8?'sleep':'tv';cat.actionAge=0;cat.targetRoom=beat[3]?luna.room:null;
   cat.journey=beat[3]?(from.zone==='room'&&from.room===luna.room?createRoomMove({...cat,room:luna.room},state.hour,from,'center'):createVisit(cat,state.hour,from,luna.room)):createRoomMove(cat,state.hour,from,cat.action==='sleep'?'bed':'tv');
   if(beat[3]){cat.journey.reason='ルナと立ち話';cat.journey.returnAt=state.hour<65.25?Math.max(65.25,cat.journey.arriveAt+1):cat.journey.arriveAt+1;cat.journey.endsAt=cat.journey.returnAt+(cat.journey.arriveAt-cat.journey.startedAt);}
  }
 }
 if(luna.action==='sleep')luna.needs.sleep=Math.max(0,luna.needs.sleep-delta*18);
 if(luna.action==='eat')luna.needs.hunger=Math.max(0,luna.needs.hunger-delta*30);
 if(luna.action==='clean')luna.trash=Math.max(0,luna.trash-delta*2);
}
export function lunaNearby(state){
 const luna=state.residents.find(r=>r.type==='hostess'),cat=state.residents.find(r=>r.type==='cat');if(!luna||!cat)return false;
 const a=sampleJourney(luna,state.hour,POSITIONS[luna.action]||'table'),b=sampleJourney(cat,state.hour,POSITIONS[cat.action]||'table');
 return !a.moving&&!b.moving&&a.zone==='room'&&b.zone==='room'&&a.room===b.room&&Math.hypot(a.x-b.x,a.y-b.y)<90;
}
export function secondActChat(state){
 if(!lunaNearby(state))return null;
 const luna=state.residents.find(r=>r.type==='hostess');
 const beat=LUNA_DAY.find(([at])=>at===luna.actTwoBeat),kind=beat?.[3];
 const observed={arrival:'luna-unpack',photo:'luna-tidy',tea:'luna-tea',farewell:'luna-before-outing'};
 const lines=observed[kind]?ACT_TWO_OBSERVATION_BEATS.find(b=>b.id===observed[kind]).lines.map(l=>[l.speaker,l.text]):kind==='relief'?[['hostess','やっと、ひと息つけるね。'],['cat','休憩なら、いつでもつきあうニャ。'],['hostess','そこは頼りになるね。']]:null;
 return lines?{key:'act2-chat-'+kind,lines,observationId:observed[kind]||null}:null;
}
export function lunaMutters(state){
 const luna=state.residents.find(r=>r.type==='hostess');if(!luna)return [];
 const p=sampleJourney(luna,state.hour,POSITIONS[luna.action]||'table');
 if(p.zone==='away')return [];
 if(p.moving)return [p.phase==='returning'?'ただいま。帰ったら少し休もう。':'忘れ物、ないよね。'];
 if(luna.action==='sleep')return ['……あと少しだけ……。'];
 if(state.hour<62)return ['買い忘れたもの、あったかな。','荷ほどきって、思ったより時間かかるね。'];
 if(state.hour<67)return ['あの人、もう来ないといいな。','玄関に誰もいないと、ほっとする。'];
 if(state.hour<81)return ['そろそろ帰る時間かな。','大家さんにも、ちゃんと相談しよう。'];
 if(luna.action==='eat')return ['ちゃんと食べてから、片づけの続きをしよう。'];
 return ['困ったときは、ちゃんと相談しよう。','部屋が落ち着くと、ちょっと安心するね。'];
}

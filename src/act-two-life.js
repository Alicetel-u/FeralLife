import {createRoomMove,createVisit,createOuting,createEntranceMove,sampleJourney} from './movement.js';
import {ACT_TWO_OBSERVATION_BEATS} from './act-two-observation.js';

const LUNA_DAY=[
 [57,'clean','center'],[58.5,'idle','table','arrival'],[61,'clean','center'],
 [62.25,'idle','table','tea'],[65,'eat','fridge'],[65.25,'idle','entrance'],
 [67,'outing','hall'],[80,'idle','table'],[81.25,'clean','table'],
 [83,'idle','table','relief'],[87,'sleep','bed'],[95,'eat','fridge'],
 [97,'clean','center'],[103,'idle','window']
];
const POSITIONS={idle:'table',clean:'center',eat:'fridge',sleep:'bed',smoke:'window',tv:'tv',drink:'table'};
export function secondActLife(state,delta=0){
 if(state.actOne?.chapter!==2||state.actOne.status!=='playing')return;
 const luna=state.residents.find(r=>r.type==='hostess'),cat=state.residents.find(r=>r.type==='cat');if(!luna)return;
 const beat=LUNA_DAY.findLast(([at])=>at<=state.hour)||LUNA_DAY[0];
 for(const r of [luna,cat].filter(Boolean))r.storyUntil=106;
 if(luna.actTwoBeat!==beat[0]){
  const start=sampleJourney(luna,state.hour,POSITIONS[luna.action]||'table');
  luna.previous=luna.action;luna.action=beat[1];luna.actionAge=0;luna.targetRoom=null;luna.actTwoBeat=beat[0];
  luna.journey=beat[2]==='entrance'?createEntranceMove(luna,Math.min(state.hour,65.25),start):beat[1]==='outing'?createOuting(luna,state.hour,start):createRoomMove(luna,state.hour,start,beat[2]);
  if(cat){
   const from=sampleJourney(cat,state.hour,POSITIONS[cat.action]||'table');
   cat.previous=cat.action;cat.action=beat[3]?'chat':state.hour%24<8?'sleep':'tv';cat.actionAge=0;cat.targetRoom=beat[3]?luna.room:null;
   cat.journey=beat[3]?createVisit(cat,state.hour,from,luna.room):createRoomMove(cat,state.hour,from,cat.action==='sleep'?'bed':'tv');
   if(beat[3]){cat.journey.reason='ルナと立ち話';cat.journey.returnAt=cat.journey.arriveAt+1;cat.journey.endsAt=cat.journey.returnAt+(cat.journey.arriveAt-cat.journey.startedAt);}
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
 const chats={
  arrival:[['hostess','荷ほどき、まだ終わらないんだよね。'],['cat','今日はここまで、って決めるのも大事ニャ。'],['hostess','モクちゃん、それ毎日言ってない？']],
  papers:[['hostess','玄関のこと、大家さんに相談しておこう。'],['cat','困ったら、ひとりで抱え込まないニャ。'],['hostess','うん。ありがとう、モクちゃん。']],
  relief:[['hostess','片づけてたら、もうこんな時間。'],['cat','休憩の時間も片づけたらダメニャ。'],['hostess','ふふ。じゃあ、少しだけ休もうかな。']]
 };
 const lines=kind==='tea'?ACT_TWO_OBSERVATION_BEATS.find(b=>b.id==='luna-tea').lines.map(l=>[l.speaker,l.text]):chats[kind];
 return lines?{key:'act2-chat-'+kind,lines}:null;
}
export function lunaMutters(state){
 const luna=state.residents.find(r=>r.type==='hostess');if(!luna)return [];
 const p=sampleJourney(luna,state.hour,POSITIONS[luna.action]||'table');
 if(p.zone==='away')return [];
 if(p.moving)return [p.phase==='returning'?'ただいま。帰ったら少し休もう。':'忘れ物、ないよね。'];
 if(luna.action==='sleep')return ['……あと少しだけ……。'];
 if(state.hour<62)return ['仕事で使う荷物、そろそろ届くかな。','荷ほどきって、思ったより時間かかるね。'];
 if(state.hour<67)return ['あの人、もう来ないといいな。','玄関に誰もいないと、ほっとする。'];
 if(state.hour<81)return ['そろそろ帰る時間かな。','大家さんにも、ちゃんと相談しよう。'];
 if(luna.action==='eat')return ['ちゃんと食べてから、片づけの続きをしよう。'];
 return ['困ったときは、ちゃんと相談しよう。','部屋が落ち着くと、ちょっと安心するね。'];
}

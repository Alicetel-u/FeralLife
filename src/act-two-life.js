import {prepareFourKingsMorning,fourKingsFrame,fourKingsPosition} from './act-two-observation-two.js';
import {sampleJourney,homeSpot} from './movement.js';
import {LUNA_NEW_ALLY_ID,NEW_ALLY_END} from './act-two-observation.js';

const POSITIONS={idle:'table',clean:'center',eat:'fridge',sleep:'bed',smoke:'window',tv:'tv',drink:'table'};
function holdStoryResident(r,state,p,beat){
 const end={x:p.x,y:p.y,zone:p.zone,room:p.room??null};
 r.storyUntil=106;r.targetRoom=null;
 if(r.actTwoBeat===beat&&r.action===(p.action||'idle')&&r.journey?.path?.at(-1)?.x===p.x&&r.journey?.path?.at(-1)?.y===p.y)return;
 r.previous=r.action;r.action=p.action||'idle';r.actionAge=0;r.actTwoBeat=beat;
 r.journey={kind:'room',startedAt:state.hour,arriveAt:state.hour,returnAt:state.hour,endsAt:state.hour,reason:'',path:[{...end},{...end}],back:[],actionAfter:r.action,returned:false};
}
export function secondActLife(state,delta=0){
 const a=state.actOne;if(a?.chapter!==2||a.status!=='playing')return;
 const luna=state.residents.find(r=>r.type==='hostess'),cat=state.residents.find(r=>r.type==='cat');if(!luna)return;
 if(!a.completed.includes('bag')){
  const outside=state.hour>=65.25||a.observation?.done?.includes(LUNA_NEW_ALLY_ID);
  for(const r of [luna,cat].filter(Boolean))holdStoryResident(r,state,r===luna&&outside?NEW_ALLY_END.hostess:homeSpot(r.room,'table'),outside?65.25:57);
  return;
 }
 prepareFourKingsMorning(state);
 const f=fourKingsFrame(state);if(!f)return;
 for(const r of [luna,cat].filter(Boolean)){
  const p=fourKingsPosition(state,r.type);
  holdStoryResident(r,state,p,[80,80.5,81.5,83.5][f.stage]);
  if(p.action==='clean')r.trash=Math.max(0,r.trash-delta*2);
 }
}
export function lunaNearby(state){
 const luna=state.residents.find(r=>r.type==='hostess'),cat=state.residents.find(r=>r.type==='cat');if(!luna||!cat)return false;
 const a=sampleJourney(luna,state.hour),b=sampleJourney(cat,state.hour);
 return !a.moving&&!b.moving&&a.zone==='room'&&b.zone==='room'&&a.room===b.room&&Math.hypot(a.x-b.x,a.y-b.y)<90;
}
export function secondActChat(){return null;}
export function lunaMutters(state){
 const luna=state.residents.find(r=>r.type==='hostess');if(!luna||state.actOne?.completed.includes('bag'))return [];
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

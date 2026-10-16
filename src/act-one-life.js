import { createRoomMove, sampleJourney } from './movement.js';

// First-act daily blocking; story deadlines and authored conversations stay unchanged.
export const MOKU_DAY = [
  [17,'clean','center','通り道を片づける'],[17.25,'outside','street','外へ出て一服'],[19.3,'meet','street','大家に近づく'],[21.2,'home','table','部屋へ帰る'],
  [22,'idle','table','帰宅してひと息'],[22.5,'smoke','window','灰皿の前で一服'],
  [23.25,'idle','table','灰皿のあとにひと息'],[23.85,'idle','center','スマホを探す'],[24.1,'tv','tv','テレビを見て夜更かし'],
  [36.5,'eat','fridge','眠いまま食事の準備'],
  [37.25,'eat','table','カップ麺で昼食'],[38,'sleep','bed','食後のうたた寝'],
  [41,'walk','hall','夕方の気分転換'],[46,'eat','fridge','夕食'],
  [47,'tv','tv','また夜更かし'],
  [54,'idle','table','朝まで起きていた'],[56.5,'drink','table','朝の缶を開ける']
];
const places={smoke:'window',eat:'fridge',sleep:'bed',tv:'tv',clean:'center',drink:'table',idle:'table'};
export function firstActLife(state, delta=0){
  if(!state.actOne||state.actOne.chapter===2||state.actOne.status!=='playing')return;
  const r=state.residents.find(r=>r.type==='cat');if(!r)return;
  const preparing=state.hour>=22.5&&!state.actOne.completed.includes('ash')?22.5:state.hour>=36.5&&!state.actOne.completed.includes('dinner')?36.5:null;
  const beat=preparing?MOKU_DAY.find(([at])=>at===preparing):MOKU_DAY.findLast(([at])=>at<=state.hour)||MOKU_DAY[0];
  r.storyUntil=58;
  if(r.lifeBeat!==beat[0]){
    const start=sampleJourney(r,state.hour,places[r.action]||'table');
    r.previous=r.action;r.action=beat[1]==='outside'?'smoke':['meet','home','walk'].includes(beat[1])?'idle':beat[1];r.actionAge=0;r.targetRoom=null;r.lifeBeat=beat[0];
    if(beat[1]==='outside'){
      const path=[start,{x:331,y:440,zone:'hall',room:101},{x:777,y:440,zone:'hall',room:103},{x:815,y:513,zone:'street'},{x:865,y:513,zone:'street'}];
      const travel=path.slice(1).reduce((n,p,i)=>n+Math.hypot(p.x-path[i].x,p.y-path[i].y),0)/430;
      r.journey={kind:'room',startedAt:state.hour,arriveAt:state.hour+travel,returnAt:state.hour+travel,endsAt:state.hour+travel,path,back:[],reason:'外で一服',actionAfter:'smoke',returned:false};
    }else if(beat[1]==='meet'){
      const path=[start,{x:705,y:513,zone:'street'}];
      const travel=Math.hypot(start.x-705,start.y-513)/430;
      r.journey={kind:'room',startedAt:state.hour,arriveAt:state.hour+travel,returnAt:state.hour+travel,endsAt:state.hour+travel,path,back:[],reason:'大家のところまで歩く',actionAfter:'idle',returned:false};
    }else if(beat[1]==='home'){
      const path=[start,{x:815,y:513,zone:'street'},{x:777,y:440,zone:'hall',room:103},{x:331,y:440,zone:'hall',room:101},{...start,x:331,y:420,zone:'room',room:101}];
      const destination={x:330,y:396,zone:'room',room:101};path.push(destination);
      const travel=path.slice(1).reduce((n,p,i)=>n+Math.hypot(p.x-path[i].x,p.y-path[i].y),0)/430;
      r.journey={kind:'room',startedAt:state.hour,arriveAt:state.hour+travel,returnAt:state.hour+travel,endsAt:state.hour+travel,path,back:[],reason:'101号室へ帰宅',actionAfter:'idle',returned:false};
    }else if(beat[1]==='walk'){
      const end={x:410,y:440,zone:'hall',room:101};
      const path=[start,{x:331,y:440,zone:'hall',room:101},end];
      const travel=path.slice(1).reduce((n,p,i)=>n+Math.hypot(p.x-path[i].x,p.y-path[i].y),0)/430;
      // Use real path timing; the return is complete before the following home activity.
      r.journey={kind:'visit',startedAt:state.hour,arriveAt:state.hour+travel,returnAt:state.hour+travel+3.5,endsAt:state.hour+travel*2+3.5,path,back:[...path].reverse(),reason:'廊下で気分転換',actionAfter:'idle',returned:false};
    }else r.journey=createRoomMove(r,state.hour,start,beat[2]);
  }
  if(r.action==='sleep')r.needs.sleep=Math.max(0,r.needs.sleep-delta*18);
  if(r.action==='eat')r.needs.hunger=Math.max(0,r.needs.hunger-delta*30);
  if(r.action==='tv')r.needs.fun=Math.max(0,r.needs.fun-delta*12);
  if(r.action==='smoke')r.needs.smoke=Math.max(0,r.needs.smoke-delta*22);
  if(r.action==='clean')r.trash=Math.max(0,r.trash-delta*2);
}
export function firstActMutters(state){
  const r=state.residents.find(r=>r.type==='cat');if(!r)return null;
  const p=sampleJourney(r,state.hour,places[r.action]||'table');
  if(p.moving)return [p.phase==='returning'?'そろそろ部屋に戻るニャ。':'少し歩くニャ。座りっぱなしで足が固まったニャ。'];
  if(p.zone!=='room')return ['廊下は涼しいニャ。部屋の空気も入れ替えるかニャ。'];
  const h=state.hour;
  if(state.actOne.pending?.scene==='ash')return ['灰皿がいっぱいニャ。まだ熱いし、大家に聞くニャ。'];
  if(state.actOne.pending?.scene==='dinner')return ['腹が減ったニャ……。でも、まぶたも重いニャ。'];
  if(r.action==='sleep')return ['……あと五分だけニャ。'];
  if(r.action==='eat')return h<37?['冷蔵庫に何か残ってたはずニャ。まず中を見てみるニャ。','食べ終わったら、容器だけでも片づけるニャ。']:['火を使わずに済むご飯、楽でいいニャ。洗い物も少ないニャ。'];
  if(r.action==='drink')return ['もう朝ニャ。寝てないから、まだ昨日のつもりニャ。'];
  if(r.action==='smoke'&&state.actOne.completed.includes('ash'))return ['吸い殻の火は消したニャ。大家にまた怒鳴られるのはごめんニャ。'];
  if(r.lifeBeat===17.25)return ['窓を少し開けるニャ。部屋の空気が煙たくなってきたニャ。'];
  if(h<19)return r.action==='smoke'?['灰皿、そろそろいっぱいニャ。捨てる場所を考えないとニャ。']:['テレビの続きが気になるニャ。あと一本だけ見たら動くニャ。','新しい大家、声が大きいニャ。静かすぎるよりはいいかニャ。'];
  if(h<32)return ['次の動画を見たら終わりニャ。……また次が出てきたニャ。','時計、見なきゃよかったニャ。もうこんな時間ニャ。'];
  if(h<37)return r.action==='clean'?['缶を三本拾ったニャ。今日はもう、かなり働いたニャ。']:['朝まで動画を見てしまったニャ。目を閉じたら、そのまま寝そうニャ。','お腹が鳴ったニャ。何か食べたいけど、立つのが面倒ニャ。'];
  if(h>=54)return ['気づいたら朝ニャ。昨日の続きのつもりだったニャ。','今日は静かニャ。こういう朝なら、悪くないニャ。'];
  return ['今日はもう料理しないニャ。コンロもちゃんと消えてるニャ。','この番組を見終わったら寝るニャ。……昨日も言った気がするニャ。'];
}

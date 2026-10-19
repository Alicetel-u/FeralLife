import {DUEL_ART,DUEL_ROUNDS} from './act-two-duel.js';
import {eventConversation,eventStageHTML,eventEscape} from './event-stage.js';

export function duelStageHTML(event,residents,index=0,page=0){
 const lines=eventConversation(event),line=lines[index],ending=line.duelEnding;
 if(line.duelRound===undefined&&!ending)return eventStageHTML(event,residents,index,page);
 const round=line.duelRound??3,enemy=DUEL_ROUNDS[round];
 const latest=lines.slice(0,index+1).reverse().find(l=>l.duelRound===round&&l.duelHeartUpdate);
 const hearts=latest||ending||round>(event.duelResolvedRound??-1)?event.duelHearts:event.duelPreviousHearts??event.duelHearts;
 const defeated=line.duelDefeated||!!latest;
 const scene=ending&&ending!=='clear'?`<img class="duel-cg" src="${DUEL_ART[ending]}" alt="${ending==='yandere'?'独占するルナ':'管理椅子から見下ろすルナ'}">`:
 `<div class="duel-field"><img class="duel-building" src="assets/apartments.png" alt=""><img class="duel-mini duel-luna" src="assets/characters/hostess/observation-v4/stand.png" alt="ルナ"><img class="duel-mini duel-manager" src="assets/characters/manager/idle.png" alt="大家"><img class="duel-mini duel-moku ${line.duelRank===1?'duel-charge':''}" src="assets/characters/cat/observation-v4/stand.png" alt="モク"><img class="duel-mini duel-enemy ${defeated?'duel-defeated':''}" src="${DUEL_ART[enemy.enemy]}" alt="${enemy.name}"></div>`;
 const hud=ending?'':`<div class="duel-hud"><span>${round+1} / 4　${enemy.name}</span><div class="duel-hearts ${line.duelHeartUpdate?'duel-heart-pop':''}" role="img" aria-label="ルナのハート ${hearts}個、最大10個">${Array.from({length:10},(_,i)=>`<span class="${i<hearts?'lit':''}" aria-hidden="true">♥</span>`).join('')}</div></div>`;
 const cut=line.duelAttack?`<div class="duel-impact rank-${line.duelRank}" aria-hidden="true"><strong>${eventEscape(line.duelAttack)}</strong></div>`:'';
 const stage=eventStageHTML(event,residents,index,page,{hideCharacters:true,cinematic:true});
 return stage.replace('class="event-stage ',`class="event-stage duel-stage ${ending?'duel-ending-scene':''} `).replace(/^(<div[^>]*>)/,'$1'+scene+hud+cut);
}
export function duelBadHTML(state){
 const y=state.actOne.failure==='duel-yandere';
 return `<section class="act-screen graphic-title duel-bad"><img class="duel-cg" src="${y?DUEL_ART.yandere:DUEL_ART.domination}" alt="金城ルナ"><div class="duel-bad-copy"><p>BAD END</p><h2 id="modal-title">${y?'あなただけの大家さん':'大家さん、返事は？'}</h2><p>${eventEscape(state.ending.text)}</p><button class="act-primary" data-act2-rewind>あの昼へ、もう一度 ↶</button></div></section>`;
}
let duelLastCue='';
export function playDuelCue(line,key,enabled,volume){
 if(!line?.duelAttack||key===duelLastCue||!enabled||volume<=0)return;
 duelLastCue=key;
 try{
  const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return;
  const ctx=new Context(),osc=ctx.createOscillator(),gain=ctx.createGain(),t=ctx.currentTime;
  osc.type='sawtooth';osc.frequency.setValueAtTime(line.duelRank===4?620:330,t);osc.frequency.exponentialRampToValueAtTime(65,t+.22);
  gain.gain.setValueAtTime(volume*.07,t);gain.gain.exponentialRampToValueAtTime(.0001,t+.26);
  osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(t+.27);osc.onended=()=>ctx.close();
 }catch{}
}

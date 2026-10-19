import {DUEL_ART,DUEL_ROUNDS} from './act-two-duel.js';
import {eventConversation,eventStageHTML,eventEscape,eventIcon} from './event-stage.js';
import {MINI_EMOTION_ART} from './mini-emotions.js';

function duelMini(type,emotion,classes,label){
 const sheet=MINI_EMOTION_ART[type],frame=sheet.frames[emotion];
 if(!frame)return `<img class="duel-mini ${classes}" src="${type==='cat'?'assets/characters/cat/observation-v4/stand.png':'assets/characters/hostess/observation-v4/stand.png'}" alt="${label}">`;
 const [width,height]=type==='cat'?[1145,1374]:[1204,1306];
 const [x,y,w,h]=frame,clipId=`duel-crop-${type}-${emotion}`;
 return `<svg class="duel-mini ${classes}" viewBox="${frame.join(' ')}" preserveAspectRatio="xMidYMax meet" role="img" aria-label="${label}"><defs><clipPath id="${clipId}" clipPathUnits="userSpaceOnUse"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs><image href="${sheet.src}" width="${width}" height="${height}" clip-path="url(#${clipId})"/></svg>`;
}

// Derive presentation from the saved transcript. No animation state enters a save.
export function duelFrame(event,index=0){
 const lines=eventConversation(event),cursor=Math.max(0,Math.min(index,lines.length-1)),line=lines[cursor];
 const round=line.duelRound??3,ending=line.duelEnding;
 const updated=lines.slice(0,cursor+1).some(l=>l.duelRound===round&&l.duelHeartUpdate);
 const resolved=event.duelResolvedRound??-1;
 const before=event.duelPreviousHearts??event.duelHearts??0;
 const hearts=Math.max(0,Math.min(10,updated||ending||round>resolved?event.duelHearts??0:before));
 const entrance=line.duelRound!==undefined&&round>resolved&&cursor===lines.findIndex(l=>l.duelRound===round);
 const showResult=!!line.duelDefeated&&!ending&&cursor===lines.findIndex(l=>l.duelRound===round&&l.duelDefeated);
 return {line,round,ending,hearts,before,updated,entrance,showResult,defeated:!!line.duelDefeated||updated};
}

export function duelChoiceHTML(event,choices,history=new Set()){
 return `<section class="cinematic-choice duel-choices" aria-labelledby="choice-title"><div class="duel-choice-heading"><h2 id="choice-title">大家の漢気、見せてやれ！</h2><span>ひと言選んで、撃退！</span></div><div class="decision-panel" aria-label="大家の返事">${choices.map((choice,i)=>{
  const ultimate=choice.delta===7,assist=choice.delta<0,seen=history.has('duel:'+choice.id);
  return `<button type="button" class="decision-choice duel-command ${ultimate?'duel-ultimate':''}" style="--choice-index:${i}" data-case-event="${event.id}" data-choice="${eventEscape(choice.id)}" aria-disabled="true"><span class="duel-command-icon" aria-hidden="true">${eventIcon(assist?'cat':ultimate?'spark':'chat')}</span><span class="duel-command-copy"><small>${ultimate?'切り札・超絶奥義':assist?'困ったときのモク頼み':i===0?'啖呵を切る':'きっぱり断る'}</small><strong>${eventEscape(choice.label)}</strong>${seen?'<span class="choice-history-badge">選択済</span>':''}</span><span class="duel-command-key" aria-hidden="true">${i+1}</span></button>`;
 }).join('')}</div><p class="choice-hint">↑ ↓ / 数字で移動 · Enter で決定</p></section>`;
}

export function duelStageHTML(event,residents,index=0,page=0){
 const {line,round,ending,hearts,before,entrance,defeated,showResult}=duelFrame(event,index);
 if(line.duelRound===undefined&&!ending)return eventStageHTML(event,residents,index,page);
 // Ordinary Luna comes first. The outcome alone must not reveal the final CG.
 if(ending==='yandere'&&line.duelEndingPhase&&line.duelEndingPhase!=='reveal'){
  const exterior=['relief','interference'].includes(line.duelEndingPhase);
  const cast=line.duelEndingPhase==='relief'||line.speaker==='cat'?['hostess','cat']:['hostess'];
  const stage=eventStageHTML({...event,cast},residents,index,page,{cinematic:true});
  const shot=`<div class="duel-story-backdrop" aria-hidden="true"><img src="${exterior?'assets/apartments.png':'assets/events/first-fire-corridor.png'}" alt=""></div>`;
  return stage.replace('class="event-stage ',`data-duel-phase="${line.duelEndingPhase}" class="event-stage duel-stage duel-yandere-story `).replace(/^(<div[^>]*>)/,'$1'+shot);
 }
 const enemy=DUEL_ROUNDS[round],strike=!!line.duelAttack,delta=hearts-before,cleared=round+(defeated?1:0);
 const managerPose=strike?'assets/characters/manager/poses/angry.png':line.speaker==='manager'?'assets/characters/manager/poses/retort.png':'assets/characters/manager/idle.png';
 const lunaLine=eventConversation(event).slice(0,index+1).reverse().find(l=>l.duelRound===round&&l.speaker==='hostess');
 const lunaEmotion=({shy:'charm',tired:'confused'})[lunaLine?.emotion]||lunaLine?.emotion;
 const luna=duelMini('hostess',lunaEmotion,`duel-luna ${line.duelHeartUpdate?'duel-react':''}`,'ルナ');
 const moku=duelMini('cat',line.duelRank===1?'angry':line.speaker==='cat'?'exasperated':null,`duel-moku ${line.duelRank===1?'duel-charge':''} ${line.speaker==='cat'?'duel-speaking':''}`,'モク');
 const scene=ending&&ending!=='clear'?`<img class="duel-cg" src="${DUEL_ART[ending]}" alt="${ending==='yandere'?'独占するルナ':'管理椅子から見下ろすルナ'}">`:
 `<div class="duel-field"><div class="duel-set ${strike?'duel-striking rank-'+line.duelRank:''}"><img class="duel-building" src="assets/apartments.png" alt="">${luna}<img class="duel-mini duel-manager ${line.speaker==='manager'?'duel-speaking':''}" src="${managerPose}" alt="大家">${moku}<img class="duel-mini duel-enemy ${defeated?'duel-defeated':entrance?'duel-arriving':''}" src="${DUEL_ART[enemy.enemy]}" alt="${enemy.name}"><span class="duel-hit-ring" aria-hidden="true"></span></div>${entrance?`<div class="duel-arrival" aria-hidden="true"><small>${round===3?'最後の来訪者':'来訪者'}</small><strong>${enemy.name}</strong></div>`:''}${showResult&&page===0?'<div class="duel-result" aria-label="撃退成功">撃退！<span>あと'+(3-round)+'人</span></div>':''}</div>`;
 const hud=ending?'':`<div class="duel-hud"><div class="duel-opponent"><span class="duel-round">${round===3?'最終戦':`${round+1}人目`}<small> / 4人</small></span><strong>${enemy.name}</strong><div class="duel-progress" aria-label="${cleared}人撃退済">${DUEL_ROUNDS.map((r,i)=>`<i class="${i<cleared?'done':i===round?'current':''}" aria-hidden="true"></i>`).join('')}</div></div><div class="duel-affection"><span class="duel-heart-label">ルナのハート <b>${hearts}<small> / 10</small></b></span><div class="duel-hearts" role="img" aria-label="ルナのハート ${hearts}個、最大10個">${Array.from({length:10},(_,i)=>`<span style="--heart-index:${Math.abs(i-before)}" class="${i<hearts?'lit':''} ${line.duelHeartUpdate&&i>=Math.min(before,hearts)&&i<Math.max(before,hearts)?'duel-heart-changed':''}" aria-hidden="true">♥</span>`).join('')}</div>${line.duelHeartUpdate?`<span class="duel-heart-delta ${delta<0?'down':''}" role="status">${delta>0?'+':''}${delta||'±0'}</span>`:''}</div></div>`;
 const cut=strike&&page===0?`<div style="animation-duration:${duelReadDelay(line)}ms" class="duel-impact rank-${line.duelRank}" aria-hidden="true"><strong>${eventEscape(line.duelAttack)}</strong></div>`:'';
 const stage=eventStageHTML(event,residents,index,page,{hideCharacters:true,cinematic:true});
 return stage.replace('class="event-stage ',`class="event-stage duel-stage ${ending?'duel-ending-scene':''} `).replace(/^(<div[^>]*>)/,'$1'+scene+hud+cut);
}

// Only the brief attack montage advances itself; conversation and choices stay manual.
// Cancel on every modal replacement and pause while menus, voice or hidden tabs are active.
export function duelReadDelay(line){
 return Math.max(1800,Math.min(3200,Array.from(line?.text||'').length*65+650));
}
export function mountDuelPlayback(line,{advance,blocked,schedule=setTimeout,cancel=clearTimeout,now=()=>performance.now()}){
 if(!line)return ()=>{};
 // Reduced motion changes movement, never the time available to read a line.
 const delay=line.duelAttack||line.duelWindup?duelReadDelay(line):line.duelPlayback?1800:0;
 const readyAt=now()+(line.duelAttack?1400:650);
 let timer,stopped=false;
 const tick=()=>{if(stopped)return;if(blocked())timer=schedule(tick,200);else advance();};
 if(delay)timer=schedule(tick,delay);
 return Object.assign(()=>{stopped=true;if(timer!==undefined)cancel(timer);},{canAdvance:()=>!stopped&&now()>=readyAt});
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

import {DUEL_ART,DUEL_ROUNDS} from './act-two-duel.js?v=2026.10.20.38';
import {eventConversation,eventStageHTML,eventEscape,eventIcon} from './event-stage.js';
import {MINI_EMOTION_ART} from './mini-emotions.js';

// Neighboring rows overlap the rectangular cells at a few edges. Keep the
// character's feet while excluding those fragments in source-sheet coordinates.
const DUEL_FRAME_CUTOUTS={
 hostess:{confused:[[975,449,36,1],[923,857,21,8]],charm:[[285,863,26,1]],'flirt-wink':[[643,863,31,1]],wicked:[[1062,864,34,1]]},
 cat:{exasperated:[[788,1171,18,39]]}
};
const cropRectPath=([x,y,w,h])=>`M${x} ${y}h${w}v${h}h-${w}Z`;

function duelMini(type,emotion,classes,label){
 const sheet=MINI_EMOTION_ART[type],frame=sheet.frames[emotion];
 if(!frame)return `<img class="duel-mini ${classes}" src="${type==='cat'?'assets/characters/cat/observation-v4/stand.png':'assets/characters/hostess/observation-v4/stand.png'}" alt="${label}">`;
 const [width,height]=type==='cat'?[1145,1374]:[1204,1306];
 const clipId=`duel-crop-${type}-${emotion}`;
 const cropPath=[frame,...(DUEL_FRAME_CUTOUTS[type]?.[emotion]||[])].map(cropRectPath).join(' ');
 return `<svg class="duel-mini ${classes}" viewBox="${frame.join(' ')}" preserveAspectRatio="xMidYMax meet" role="img" aria-label="${label}"><defs><clipPath id="${clipId}" clipPathUnits="userSpaceOnUse"><path clip-rule="evenodd" d="${cropPath}"/></clipPath></defs><image href="${sheet.src}" width="${width}" height="${height}" clip-path="url(#${clipId})"/></svg>`;
}

// Derive presentation from the saved transcript. No animation state enters a save.
export function duelFrame(event,index=0){
 const lines=eventConversation(event),cursor=Math.max(0,Math.min(index,lines.length-1)),line=lines[cursor];
 const round=line.duelRound??3,ending=line.duelEnding;
 const updated=lines.slice(0,cursor+1).some(l=>l.duelRound===round&&l.duelHeartUpdate);
 const resolved=event.duelResolvedRound??-1;
 const before=event.duelPreviousHearts??event.duelHearts??0;
 const hearts=updated||ending||round>resolved?event.duelHearts??0:before;
 const entrance=line.duelRound!==undefined&&round>resolved&&cursor===lines.findIndex(l=>l.duelRound===round);
 const showResult=!!line.duelDefeated&&!ending&&cursor===lines.findIndex(l=>l.duelRound===round&&l.duelDefeated);
 return {line,round,ending,hearts,before,updated,entrance,showResult,defeated:!!line.duelDefeated||updated};
}

export function duelChoiceHTML(event,choices,history=new Set()){
 const restrained=choices.some(choice=>choice.restrained);
 return `<section class="cinematic-choice duel-choices" aria-labelledby="choice-title"><div class="duel-choice-heading"><h2 id="choice-title">${restrained?'大家の漢気！全力を出すな！':'大家の漢気、見せてやれ！'}</h2><span>ひと言選んで、撃退！</span></div><div class="decision-panel" aria-label="大家の返事">${choices.map((choice,i)=>{
  const ultimate=choice.delta===7,assist=choice.delta<0,catUltimate=choice.id==='catapult',seen=history.has('duel:'+choice.id);
  const tier=ultimate?'ultimate':choice.delta>=3?'high':assist?'assist':'medium';
  const expectation=ultimate?'超高期待':choice.delta>=3?'高期待':assist?'モクに頼る':'中期待';
  const gain=assist?'？？？':`${choice.delta>0?'+':''}${choice.delta}`;
  return `<button type="button" class="decision-choice duel-command duel-expect-${tier} ${ultimate?'duel-ultimate':assist?'duel-assist':''}${catUltimate?' duel-cat-command':''}${choice.disabled?' choice-exhausted':''}" style="--choice-index:${i}" data-case-event="${event.id}" data-choice="${eventEscape(choice.id)}" aria-disabled="true" ${choice.disabled?'disabled data-choice-exhausted="true"':''}><span class="duel-command-icon" aria-hidden="true">${eventIcon(assist?'cat':ultimate?'spark':'chat')}</span><span class="duel-command-copy"><span class="duel-expectation"><b>${expectation}</b><span class="duel-gain"><span aria-hidden="true">♥</span><span class="sr-only">ハート</span> ${gain}</span>${assist?'':`<span class="duel-expect-meter" aria-hidden="true">${[1,2,3,4].map(level=>`<i${level<=(ultimate?4:choice.delta>=3?3:assist?1:2)?' class="lit"':''}></i>`).join('')}</span>`}</span><strong class="duel-command-line">${eventEscape(choice.label)}</strong>${seen?'<span class="choice-history-badge">選択済</span>':''}</span><span class="duel-command-key" aria-hidden="true">${i+1}</span></button>`;
 }).join('')}</div></section>`;
}

function duelHeartGem(extra=''){
 return `<svg class="duel-heart-gem ${extra}" viewBox="0 0 32 30" focusable="false"><path class="heart-body" d="M16 28 3.5 15.5C-4 7.5 7-4 16 5 25-4 36 7.5 28.5 15.5Z"/><path class="heart-facet" d="m16 5 5 10-5 13-5-13Z"/><path class="heart-glint" d="M5 9c1-4 5-5 8-2L7 13Z"/><path class="heart-edge" d="m22 18-6 7"/><path class="heart-spark" d="m28-4 1.5 4.5L34 2l-4.5 1.5L28 8l-1.5-4.5L22 2l4.5-1.5Z"/></svg>`;
}
function duelHeartSlots(hearts,before=hearts,updated=false,final=false){
 const valueAt=(value,i)=>value<0?(i< -value?-1:0):(i<value?1:0)+(i<value-10?1:0);
 return Array.from({length:10},(_,i)=>{
  const value=valueAt(hearts,i),changed=updated&&value!==valueAt(before,i);
  return `<span style="--heart-index:${i};--result-heart-index:${i}" class="duel-heart-slot ${final?'duel-final-heart ':''}${value?'lit':'empty'}${value<0?' negative':''}${value>1?' overcharged':''}${changed?' duel-heart-changed':''}" aria-hidden="true">${duelHeartGem()}${value>1?duelHeartGem('duel-heart-overflow'):''}</span>`;
 }).join('');
}
const duelHeartMood=hearts=>hearts<0?'heart-negative':hearts>=10?'heart-hot'+(hearts>10?' over-limit':''):'';
function duelPawBurst(){
 return `<span class="duel-paw-burst" aria-hidden="true">${Array.from({length:5},(_,i)=>`<svg style="--paw-index:${i}" viewBox="0 0 64 64"><ellipse cx="13" cy="23" rx="7" ry="10"/><ellipse cx="27" cy="14" rx="7" ry="10"/><ellipse cx="43" cy="16" rx="7" ry="10"/><ellipse cx="54" cy="29" rx="7" ry="10"/><path d="M12 47c0-8 8-20 20-20s20 12 20 20c0 14-13 8-20 8s-20 6-20-8Z"/></svg>`).join('')}</span>`;
}

export function duelStageHTML(event,residents,index=0,page=0){
 const {line,round,ending,hearts,before,entrance,defeated,showResult}=duelFrame(event,index);
 // The opening conversation belongs to the ordinary full-size character stage.
 // Only switch to the mini-game when the first opponent actually speaks.
 if(line.duelRound===undefined&&!ending){
  const stage=eventStageHTML(event,residents,index,page,{cinematic:true});
  return stage.replace('class="event-stage ','class="event-stage duel-opening-stage ').replace(/^(<div[^>]*>)/,'$1<img class="duel-opening-background" src="assets/apartments.png" alt="">');
 }
 // Ordinary Luna comes first. The outcome alone must not reveal the final CG.
 if(ending==='yandere'&&line.duelStoryDay&&line.duelEndingPhase!=='reveal'){
  const day=line.duelStoryDay;
  const stage=eventStageHTML({...event,cast:['hostess']},residents,index,page,{cinematic:true});
  const tint=['#ffc0dc','#f38ebc','#dd648f','#b72e55','#f04458'][day-1];
  const location=day>=5?'assets/events/first-fire-corridor.png':'assets/apartments.png';
  const storyBackdrop=`<div class="duel-story-backdrop" aria-hidden="true"><img src="${location}" alt=""></div>`;
  // A short, self-contained transition on the first speech of each day.
  // No timeouts, no simulation-state changes, no extra dialogue clicks.
  const calendar=line.duelDayStart?`<div class="duel-day-transition" aria-label="あの日から${day}日目"><span>AFTER DAY ${String(day).padStart(2,'0')}</span></div>`:'';
  const style=`<style>
  .duel-yandere-short{--duel-day-tint:${tint};--duel-story-day:${day}}
  .duel-yandere-short .duel-story-backdrop:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(125deg,transparent 35%,var(--duel-day-tint));opacity:calc(.12 + (var(--duel-story-day) - 1) * .09)}
  .duel-day-transition{position:absolute;inset:0;z-index:30;display:flex;justify-content:center;align-items:center;padding:24px;box-sizing:border-box;background:linear-gradient(145deg,#110f1beb,#24101deF 70%,#07040bf5);color:#fff;pointer-events:none;animation:duel-day-curtain 3s ease-in-out both}
  .duel-day-transition span{font-weight:900;font-size:clamp(34px,7vw,88px);letter-spacing:.075em;text-align:center;color:var(--duel-day-tint);text-shadow:0 0 25px var(--duel-day-tint);animation:duel-day-words 3s ease-in-out both}
  .duel-yandere-short[data-duel-phase="day-5"] .duel-day-transition{animation-duration:3.5s}
  .duel-yandere-short[data-duel-phase="day-5"] .duel-day-transition span{animation-duration:3.5s}
  @keyframes duel-day-curtain{0%,79%{opacity:1;visibility:visible}100%{opacity:0;visibility:hidden}}
  .duel-day-opening .stage-bubble,.duel-day-opening .mobile-dialogue-tap,.duel-day-opening .stage-character{animation:duel-day-scene-reveal 3s step-end both}
  .duel-day-opening[data-duel-phase="day-5"] .stage-bubble,.duel-day-opening[data-duel-phase="day-5"] .mobile-dialogue-tap,.duel-day-opening[data-duel-phase="day-5"] .stage-character{animation-duration:3.5s}
  @keyframes duel-day-scene-reveal{0%,99%{visibility:hidden;opacity:0}100%{visibility:visible;opacity:1}}
  @keyframes duel-day-words{0%{opacity:0;transform:translateY(16px);filter:blur(9px)}30%,73%{opacity:1;transform:translateY(0);filter:blur(0)}100%{opacity:0;transform:translateY(-8px);filter:blur(4px)}}
  @media(prefers-reduced-motion:reduce){.duel-day-transition,.duel-day-transition span{animation-duration:3s;animation-timing-function:linear}.duel-yandere-short[data-duel-phase="day-5"] .duel-day-transition,.duel-yandere-short[data-duel-phase="day-5"] .duel-day-transition span{animation-duration:3.5s}.duel-day-transition span{filter:none!important;transform:none!important}}
  </style>`;
  return stage.replace('class="event-stage ',`data-duel-phase="day-${day}" class="event-stage duel-stage duel-yandere-story duel-yandere-short ${line.duelDayStart?'duel-day-opening':''} `).replace(/^(<div[^>]*>)/,'$1'+storyBackdrop+calendar+style);
 }

 const enemy=DUEL_ROUNDS[round],strike=!!line.duelAttack,delta=hearts-before,cleared=round+(defeated?1:0);
 const managerPoses={stand:'assets/characters/manager/new-poses/act2-battle/stand_proud.png',protect:'assets/characters/manager/new-poses/act2-battle/protect.png',weak:'assets/characters/manager/new-poses/act2-battle/kime_weak.png',mid:'assets/characters/manager/new-poses/act2-battle/kime_mid.png',strong:'assets/characters/manager/new-poses/act2-battle/kime_strong.png',ultimate:'assets/characters/manager/new-poses/act2-battle/ougi.png',fail:'assets/characters/manager/new-poses/act2-battle/fail.png',victory:'assets/characters/manager/new-poses/act2-battle/victory.png'};
 const managerPose=ending==='clear'?managerPoses.victory:strike?managerPoses[({1:'weak',2:'mid',3:'strong',4:'ultimate'})[line.duelRank]||'strong']:line.duelWindup?managerPoses.weak:line.duelRank===1?managerPoses.fail:line.speaker==='manager'?managerPoses.protect:managerPoses.stand;
 const lunaLine=eventConversation(event).slice(0,index+1).reverse().find(l=>l.duelRound===round&&l.speaker==='hostess');
 const lunaEmotion=({shy:'charm',tired:'confused'})[lunaLine?.emotion]||lunaLine?.emotion;
 const luna=duelMini('hostess',lunaEmotion,`duel-luna ${line.duelHeartUpdate?'duel-react':''}`,'ルナ');
 const moku=duelMini('cat',line.duelRank===1?'angry':line.speaker==='cat'?'exasperated':null,`duel-moku ${line.duelRank===1?'duel-charge':''} ${line.speaker==='cat'?'duel-speaking':''}`,'モク');
 const intro=line.duelRound===undefined&&!ending;
 const legacyYandereReveal=ending==='yandere'&&!line.duelEndingPhase&&!event.lines?.some(item=>item.duelEndingPhase);
 const scene=(ending==='domination'||(ending==='yandere'&&line.duelEndingPhase==='reveal')||legacyYandereReveal)?`<img class="duel-cg" src="${DUEL_ART[ending]}" alt="${ending==='yandere'?'独占するルナ':'管理椅子から見下ろすルナ'}">`:
 `<div class="duel-field"><div class="duel-set ${strike?'duel-striking rank-'+line.duelRank:''}${line.duelCatUltimate?' duel-cat-ultimate':''}"><img class="duel-building" src="assets/apartments.png" alt="">${luna}<img class="duel-mini duel-manager ${line.speaker==='manager'?'duel-speaking':''}" src="${managerPose}" alt="大家">${moku}<img class="duel-mini duel-enemy ${intro?'duel-enemy-waiting ':''}${defeated?'duel-defeated':entrance?'duel-arriving':''}" src="${DUEL_ART[enemy.enemy]}" alt="${enemy.name}"><span class="duel-hit-ring" aria-hidden="true"></span></div>${entrance?`<div class="duel-arrival" aria-hidden="true"><small>${round===3?'最後の来訪者':'来訪者'}</small><strong>${enemy.name}</strong></div>`:''}${showResult&&page===0?'<div class="duel-result" aria-label="撃退成功">撃退！<span>あと'+(3-round)+'人</span></div>':''}</div>`;
 const hud=ending||intro?'':`<div class="duel-hud"><div class="duel-opponent"><span class="duel-round">${round===3?'最終戦':`${round+1}人目`}<small> / 4人</small></span><strong>${enemy.name}</strong><div class="duel-progress" aria-label="${cleared}人撃退済">${DUEL_ROUNDS.map((r,i)=>`<i class="${i<cleared?'done':i===round?'current':''}" aria-hidden="true"></i>`).join('')}</div></div><div class="duel-affection ${duelHeartMood(hearts)}">${hearts>10?'<span class="duel-limit-badge">限界突破</span>':''}<span class="duel-heart-label">ルナの感情メーター <b>${hearts}<small> / 10</small></b></span><div class="duel-hearts" role="img" aria-label="ルナの感情メーター ${hearts}個、基準10個">${duelHeartSlots(hearts,before,line.duelHeartUpdate)}</div>${line.duelHeartUpdate?`<span class="duel-heart-delta ${delta<0?'down':''}" role="status">${delta>0?'+':''}${delta||'±0'}</span>`:''}</div></div>`;
 const cut=strike&&page===0?`<div class="duel-impact rank-${line.duelRank}${line.duelCatUltimate?' duel-cat-ultimate':''}" aria-hidden="true"><strong>${line.duelCatUltimate?'<span>'+eventEscape(line.duelAttack).replace('・','・</span><span>')+'</span>':eventEscape(line.duelAttack)}</strong>${line.duelCatUltimate?duelPawBurst():''}</div>`:'';
 const stage=eventStageHTML(event,residents,index,page,{hideCharacters:true,cinematic:true});
 const resultOutcome=line.duelVictoryResult;
 const resultLabel={yandere:'超完全勝利！',clear:'完全勝利！',domination:'完全勝利？'}[resultOutcome];
 const resultHearts=duelHeartSlots(hearts,hearts,false,true);
 const finalResult=resultLabel&&page===0?`<div class="duel-final-result duel-final-${resultOutcome} ${duelHeartMood(hearts)}" role="img" aria-label="${resultLabel} ルナのハート ${hearts}個 / 10個"><strong class="duel-final-title">${resultLabel}</strong><div class="duel-final-hearts duel-hearts">${resultHearts}</div><span class="duel-final-count">${hearts}<small> / 10</small>${hearts>10?'<em>限界突破</em>':''}</span></div>`:'';
 const startTitle=((intro&&index===0&&page===0)||event.debugDuelSplash)&&page===0?`<div class="duel-start-title" aria-label="ミニゲーム開始：嘘つきルナを守れ！"><div class="duel-start-slash" aria-hidden="true"></div><div class="duel-start-panel"><strong>嘘つきルナを守れ！</strong></div></div>`:'';
 return stage.replace('class="event-stage ',`class="event-stage duel-stage ${ending?'duel-ending-scene':''} ${intro?'duel-intro-scene':''} `).replace(/^(<div[^>]*>)/,'$1'+scene+hud+cut+startTitle+finalResult);
}

// Only the brief attack montage advances itself; conversation and choices stay manual.
// Cancel on every modal replacement and pause while menus, voice or hidden tabs are active.
export function duelReadDelay(line){
 return Math.max(1800,Math.min(3200,Array.from(line?.text||'').length*65+650));
}
export function mountDuelPlayback(line,{advance,blocked,onDayReveal,voiceOutcome=()=>null,schedule=setTimeout,cancel=clearTimeout,now=()=>performance.now()}){
 if(!line)return ()=>{};
 // Reduced motion changes movement, never the time available to read a line.
 // Attack callouts stay on-screen until the voice actually finishes.
 // Do not allow taps to skip an in-flight attack recording.
 const attack=!!line.duelAttack;
 const delay=attack?duelReadDelay(line):line.duelWindup?duelReadDelay(line):line.duelPlayback?1800:0;
 const readyAt=now()+(line.duelDayStart?(line.duelStoryDay===5?3500:3000):line.duelVictoryResult?2800:line.duelStartTitle?1550:attack?duelReadDelay(line):650);
 let timer,revealTimer,stopped=false;
 if(line.duelDayStart&&onDayReveal)revealTimer=schedule(()=>{if(!stopped)onDayReveal();},line.duelStoryDay===5?3500:3000);
 // Keep the final audible syllable and callout on screen after media 'ended'.
 // Some mobile decoders signal ended while their buffered output is still draining.
 const ATTACK_TAIL_MS=450;
 let voiceEndedAt=null;
 const canAdvance=()=>{
  if(stopped)return false;
  const outcome=attack?voiceOutcome():null;
  if(attack){
   if(outcome==='ended')voiceEndedAt??=now();
   else voiceEndedAt=null;
  }
  if(now()<readyAt||attack&&blocked())return false;
  if(!attack)return true;
  if(outcome==='playing'||outcome==='idle')return false;
  if(outcome==='ended')return now()>=voiceEndedAt+ATTACK_TAIL_MS;
  // Missing/failed audio must not deadlock a playthrough. Keep the subtitle
  // visible longer instead of incorrectly treating a failed play as completed.
  if(outcome==='missing'||outcome==='error'||outcome==='timeout')return now()>=readyAt+1200;
  return true; // Legacy callers without a voice outcome callback.
 };
 const tick=()=>{if(stopped)return;if(!canAdvance())timer=schedule(tick,80);else advance();};
 if(delay)timer=schedule(tick,delay);
 return Object.assign(()=>{stopped=true;if(timer!==undefined)cancel(timer);if(revealTimer!==undefined)cancel(revealTimer);},{canAdvance});
}
export function duelBadHTML(state){
 const y=state.actOne.failure==='duel-yandere';
 return `<section class="act-screen graphic-title duel-bad ${y?'duel-bad-yandere':''}"><img class="duel-cg" src="${y?DUEL_ART.yandere:DUEL_ART.domination}" alt="金城ルナ"><div class="duel-bad-copy"><p>BAD END</p><h2 id="modal-title">${y?'わたしだけの大家さん♡':'大家さん、返事は？'}</h2>${y?'':`<p>${eventEscape(state.ending.text)}</p>`}<button class="act-primary" data-act2-rewind>${y?'……このままじゃ終われねぇ':'あの昼へ、もう一度 ↶'}</button></div></section>`;
}
let duelLastCue='';
export function playDuelCue(line,key,enabled,volume,voice){
 if(!line?.duelAttack||key===duelLastCue||!enabled||volume<=0)return;
 duelLastCue=key;
 voice?.playStrike?.(line,volume);
}

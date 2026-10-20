import {DUEL_ART,DUEL_ROUNDS} from './act-two-duel.js?v=2026.10.20.09';
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
 // Keep the duel arena visible from the very first introductory line.\n // Enemy sprites still enter only when their round begins.
 // Ordinary Luna comes first. The outcome alone must not reveal the final CG.
 if(ending==='yandere'&&line.duelStoryDay&&line.duelEndingPhase!=='reveal'){
  const day=line.duelStoryDay;
  const stage=eventStageHTML({...event,cast:['hostess']},residents,index,page,{cinematic:true});
  const tint=['#ffc0dc','#f38ebc','#dd648f','#b72e55','#f04458'][day-1];
  const location=day>=5?'assets/events/first-fire-corridor.png':'assets/apartments.png';
  const storyBackdrop=`<div class="duel-story-backdrop" aria-hidden="true"><img src="${location}" alt=""></div>`;
  // A short, self-contained transition on the first speech of each day.
  // No timeouts, no simulation-state changes, no extra dialogue clicks.
  const calendar=line.duelDayStart?`<div class="duel-day-transition" aria-hidden="true"><span>DAY ${String(day).padStart(2,'0')}</span><small>―― ${day}日目 ――</small></div>`:'';
  const style=`<style>
  .duel-yandere-short{--duel-day-tint:${tint};--duel-story-day:${day}}
  .duel-yandere-short .duel-story-backdrop:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(125deg,transparent 35%,var(--duel-day-tint));opacity:calc(.12 + (var(--duel-story-day) - 1) * .09)}
  .duel-day-transition{position:absolute;inset:0;z-index:30;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:12px;background:linear-gradient(145deg,#130f1b,#2f1022 65%,#07040b);border-top:9px solid var(--duel-day-tint);color:#fff;pointer-events:none;animation:duel-day-curtain 1.15s ease both}
  .duel-day-transition span{font-weight:900;font-size:clamp(42px,8vw,104px);letter-spacing:.1em;text-shadow:0 0 24px var(--duel-day-tint)}
  .duel-day-transition small{font-weight:700;letter-spacing:.3em;font-size:clamp(13px,2vw,22px);color:var(--duel-day-tint)}
  @keyframes duel-day-curtain{0%,42%{opacity:1}100%{opacity:0;visibility:hidden}}
  @media(prefers-reduced-motion:reduce){.duel-day-transition{animation-duration:.5s}}
  </style>`;
  return stage.replace('class="event-stage ',`data-duel-phase="day-${day}" class="event-stage duel-stage duel-yandere-story duel-yandere-short `).replace(/^(<div[^>]*>)/,'$1'+storyBackdrop+calendar+style);
 }

 const enemy=DUEL_ROUNDS[round],strike=!!line.duelAttack,delta=hearts-before,cleared=round+(defeated?1:0);
 const managerPoses={stand:'assets/characters/manager/new-poses/act2-battle/stand_proud.png',protect:'assets/characters/manager/new-poses/act2-battle/protect.png',weak:'assets/characters/manager/new-poses/act2-battle/kime_weak.png',mid:'assets/characters/manager/new-poses/act2-battle/kime_mid.png',strong:'assets/characters/manager/new-poses/act2-battle/kime_strong.png',ultimate:'assets/characters/manager/new-poses/act2-battle/ougi.png',fail:'assets/characters/manager/new-poses/act2-battle/fail.png',victory:'assets/characters/manager/new-poses/act2-battle/victory.png'};
 const managerPose=ending==='clear'?managerPoses.victory:strike?managerPoses[({1:'weak',2:'mid',3:'strong',4:'ultimate'})[line.duelRank]||'strong']:line.duelWindup?managerPoses.weak:line.duelRank===1?managerPoses.fail:line.speaker==='manager'?managerPoses.protect:managerPoses.stand;
 const lunaLine=eventConversation(event).slice(0,index+1).reverse().find(l=>l.duelRound===round&&l.speaker==='hostess');
 const lunaEmotion=({shy:'charm',tired:'confused'})[lunaLine?.emotion]||lunaLine?.emotion;
 const luna=duelMini('hostess',lunaEmotion,`duel-luna ${line.duelHeartUpdate?'duel-react':''}`,'ルナ');
 const moku=duelMini('cat',line.duelRank===1?'angry':line.speaker==='cat'?'exasperated':null,`duel-moku ${line.duelRank===1?'duel-charge':''} ${line.speaker==='cat'?'duel-speaking':''}`,'モク');
 const intro=line.duelRound===undefined&&!ending;\n const scene=ending&&ending!=='clear'?`<img class="duel-cg" src="${DUEL_ART[ending]}" alt="${ending==='yandere'?'独占するルナ':'管理椅子から見下ろすルナ'}">`:
 `<div class="duel-field"><div class="duel-set ${strike?'duel-striking rank-'+line.duelRank:''}"><img class="duel-building" src="assets/apartments.png" alt="">${luna}<img class="duel-mini duel-manager ${line.speaker==='manager'?'duel-speaking':''}" src="${managerPose}" alt="大家">${moku}<img class="duel-mini duel-enemy ${intro?'duel-enemy-waiting ':''}${defeated?'duel-defeated':entrance?'duel-arriving':''}" src="${DUEL_ART[enemy.enemy]}" alt="${enemy.name}"><span class="duel-hit-ring" aria-hidden="true"></span></div>${entrance?`<div class="duel-arrival" aria-hidden="true"><small>${round===3?'最後の来訪者':'来訪者'}</small><strong>${enemy.name}</strong></div>`:''}${showResult&&page===0?'<div class="duel-result" aria-label="撃退成功">撃退！<span>あと'+(3-round)+'人</span></div>':''}</div>`;
 const hud=ending||intro?'':`<div class="duel-hud"><div class="duel-opponent"><span class="duel-round">${round===3?'最終戦':`${round+1}人目`}<small> / 4人</small></span><strong>${enemy.name}</strong><div class="duel-progress" aria-label="${cleared}人撃退済">${DUEL_ROUNDS.map((r,i)=>`<i class="${i<cleared?'done':i===round?'current':''}" aria-hidden="true"></i>`).join('')}</div></div><div class="duel-affection"><span class="duel-heart-label">ルナのハート <b>${hearts}<small> / 10</small></b></span><div class="duel-hearts" role="img" aria-label="ルナのハート ${hearts}個、最大10個">${Array.from({length:10},(_,i)=>`<span style="--heart-index:${Math.abs(i-before)}" class="${i<hearts?'lit':''} ${line.duelHeartUpdate&&i>=Math.min(before,hearts)&&i<Math.max(before,hearts)?'duel-heart-changed':''}" aria-hidden="true">♥</span>`).join('')}</div>${line.duelHeartUpdate?`<span class="duel-heart-delta ${delta<0?'down':''}" role="status">${delta>0?'+':''}${delta||'±0'}</span>`:''}</div></div>`;
 const cut=strike&&page===0?`<div style="animation-duration:${duelReadDelay(line)}ms" class="duel-impact rank-${line.duelRank}" aria-hidden="true"><strong>${eventEscape(line.duelAttack)}</strong></div>`:'';
 const stage=eventStageHTML(event,residents,index,page,{hideCharacters:true,cinematic:true});
 const startTitle=intro&&index===0&&page===0?`<div class="duel-start-title" aria-label="ミニゲーム開始：嘘つきルナを守れ！"><div class="duel-start-slash" aria-hidden="true"></div><div class="duel-start-panel"><small>ACT 02 / TROUBLE 02</small><strong>嘘つきルナを守れ！</strong><span>大家の漢気で撃退しろ！</span><b>GAME START</b></div></div>`:'';
 return stage.replace('class="event-stage ',`class="event-stage duel-stage ${ending?'duel-ending-scene':''} ${intro?'duel-intro-scene':''} `).replace(/^(<div[^>]*>)/,'$1'+scene+hud+cut+startTitle);
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
 const readyAt=now()+(line.duelStartTitle?1550:line.duelAttack?1400:650);
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

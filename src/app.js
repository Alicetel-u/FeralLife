import {duelStageHTML,duelBadHTML,playDuelCue,duelChoiceHTML,mountDuelPlayback} from './act-two-duel-stage.js?v=2026.10.20.13';
import {failedChoiceKeys} from './choice-history.js';
import {secondActLife} from './act-two-life.js';
import {storyScreenHTML} from './story-screens.js';
import {actTwoMorningDirection,actTwoMorningStageHTML,startMorningBlackout,prepareMorningBirds} from './act-two-bad-stage.js';
import {isFirstStalkerReply,firstStalkerStageHTML,prepareFirstStalkerAssets,needsStalkerPreface,stalkerPrefaceHTML,startStalkerPreface} from './first-stalker-stage.js';
import { LUNA_MINI_EMOTIONS, MOKU_MINI_EMOTIONS } from './mini-emotions.js';
import {isFirstFireReply,firstFireStageHTML} from './first-fire-stage.js';
import {clearLegacyObservationMemo,observationView,observationClockLimit,tickObservation,inheritObservation} from './act-one-observation.js';
import {createVoicePlayer} from './voice-player.js';
const characterVoice=createVoicePlayer({chapter:()=>state?.actOne?.chapter,onPlaybackChange:active=>normalBgm.setVoiceActive(active)});
document.addEventListener('pointerdown',()=>characterVoice.unlock(),{capture:true});
document.addEventListener('keydown',()=>characterVoice.unlock(),{capture:true});
import { storyCheckpointTarget } from './story-checkpoints.js';
import { messagePages } from './message-pages.js';
import { replaceConversationContent } from './conversation-dom.js';
import { speakerColorStyle } from './speaker-colors.js';
import { avoidedTrouble, troubleAvoidedHTML, actOneCompleteHTML, startTroubleVictory } from './trouble-victory.js';
import { WorldRenderGate } from './render-policy.js';
import { INITIAL_MOKU_LINES, openingPrologueHTML, startOpeningPrologue } from './opening-prologue.js';
import { choiceUIHTML, mountChoiceUI } from './choice-ui.js';
import { actTwoOpeningHTML, startActTwoOpening } from './act-two-opening.js?v=2026.10.20.08';
import { ACT_TWO_TITLE, ACT_TWO_EVENTS, actTwoChoices, actTwoChosen, beginActTwo, advanceActTwo, answerActTwo, rewindActTwo, retireActTwoContract, refreshDuelYandereEnding } from './act-two.js?v=2026.10.20.13';
import { rewindTransitionHTML, startRewindTransition } from './rewind-transition.js';
import { fireEndingHTML, startFireEnding } from './fire-ending.js';
import { debtEndingHTML, startDebtEnding } from './debt-ending.js';
import { bedCue, createNormalBgm } from './bgm.js';
import { createGame, advance, admit, addEvent, ROOMS, CHARACTERS, NEEDS, ACTIONS, dateAt, formatTime, atmosphere, validateSave } from './simulation.js';
import { createTalk, stepTalk, claimAutomaticScene, rememberReadScenes, automaticChapterScene } from './dialogue.js';
import { WorldRenderer, roomBounds, drawPortrait } from './renderer.js';
import { CHARACTER_ART, loadCharacterArt, loadRoomArt, EVENT_ART, EVENT_EXPRESSIONS, eventParticipants } from './character-art.js';
import { sampleJourney, motionLabel } from './movement.js';
import { MANAGEMENT_CASES } from './event-cases.js';
import { ensureManagement, managementSummary, managementImpact, openManagementCase, resolveManagementCase } from './management.js';
import { eventConversation, eventStageHTML, eventIcon, troubleCardHTML } from './event-stage.js';
import { actOneTitle, ACT_ONE_EVENTS, getActOneChoices, actOneChosenChoices, createActOne, advanceActOne, answerActOne, rewindBeforeFire, validActOne } from './act-one.js';


// iOS Safari may ignore viewport zoom restrictions: intercept only native page magnification gestures.
if ('ontouchstart' in window) {
  for (const eventName of ['gesturestart','gesturechange']) {
    document.addEventListener(eventName,event=>event.preventDefault(),{passive:false});
  }
}

const $ = id => document.getElementById(id);
const escape = text => String(text ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const yen = n => '¥' + Math.round(n).toLocaleString('ja-JP');
const managerPreview = new URLSearchParams(location.search).get('preview')==='manager';
const observationPreview = new URLSearchParams(location.search).get('preview')==='observation';
const STORAGE = ['act-two-opening','luna-motion'].includes(new URLSearchParams(location.search).get('preview'))?'feral-luna-film-preview-v1':managerPreview?'feral-manager-preview-v1':observationPreview?'feral-observation-preview-v1':'feral-act-one-v1';
const previewType = new URLSearchParams(location.search).get('preview');
const eventPreview = previewType === 'events';
const actTwoPreview = previewType === 'act-two';
// Old preview links now lead to the same full opening used by the story.
const actTwoOpeningPreview = ['act-two-opening','luna-motion'].includes(previewType);
const firstRewindPreview = previewType === 'first-rewind';
const firstFirePreview = previewType === 'first-fire';
const firstStalkerPreview = previewType === 'first-stalker';
const previewResident = ['hostess', 'fox', 'sister', 'peko', 'ann'].includes(previewType) ? previewType : null;
let state, restored = false;
let developerMode=false, debugTapCount=0, debugLastTap=0;
try { const saved = previewResident || eventPreview || actTwoPreview || firstRewindPreview || firstFirePreview || firstStalkerPreview || observationPreview || managerPreview ? null : JSON.parse(localStorage.getItem(STORAGE)); if (validateSave(saved) && validActOne(saved)) { state = saved; restored = true; } } catch {}
state ||= previewResident || eventPreview ? createGame() : createActOne();
retireActTwoContract(state);
refreshDuelYandereEnding(state);
clearLegacyObservationMemo(state);
ensureManagement(state);
if(observationPreview){state.actOne.started=true;observationView(state);state.hour=17.08;state.events.forEach(e=>e.read=true);tickObservation(state,0);}
if(firstRewindPreview||firstFirePreview){state.actOne.started=true;advanceActOne(state,100);answerActOne(state,state.actOne.pending.eventId,'trash');state.events.forEach(e=>e.read=true);}
if(firstStalkerPreview){beginActTwo(state);state.actOne.started=true;state.actOne.titlePending=false;state.actOne.prologuePending=false;advanceActTwo(state,100);answerActTwo(state,state.actOne.pending.eventId,'guarantee');state.events.forEach(e=>e.read=true);}
if(actTwoPreview){beginActTwo(state);state.actOne.started=true;state.actOne.titlePending=false;state.actOne.prologuePending=false;state.events.forEach(e=>e.read=true);}
if(actTwoOpeningPreview){beginActTwo(state);}
if(eventPreview) {
  for(const type of ['hostess','fox','sister','peko','ann']) {state.pending=[type];admit(state,type);}
  state.hour=100;
  const id=new URLSearchParams(location.search).get('case')||'cigarette';
  openManagementCase(state,id,addEvent);
}
if (previewResident) {
  advance(state, 40);
  if (!state.pending.includes(previewResident)) state.pending[0] = previewResident;
  admit(state, previewResident);
  if (previewResident === 'ann') {
    advance(state, 7);
    const ann = state.residents.find(r => r.type === 'ann');
    for (let wait = 0; wait < 3 && ann.journey?.kind !== 'outing'; wait++) advance(state, 1);
    const route = ann.journey;
    // 建物前で二人が並んでいる時点で確認画面を止める。
    const streetIndex = route.path.findIndex(p => p.zone === 'street');
    const distance = route.path.slice(1, streetIndex + 1).reduce((sum, p, i) => sum + Math.hypot(p.x-route.path[i].x,p.y-route.path[i].y),0);
    advance(state, route.startedAt + distance / 430 + .35 - state.hour);
  }
}
// 旧セーブは保持しつつ、これからの入居候補を専用画像のある6人だけに限定する。
const approvedResidents = ['cat', 'hostess', 'fox', 'sister', 'peko', 'ann'];
state.remaining = approvedResidents.filter(type => !state.residents.some(r => r.type === type));
if (state.pending) {
  state.pending = state.pending.filter(type => state.remaining.includes(type));
  if (!state.pending.length) state.pending = null;
}
let speed = 6, paused = !!previewResident || eventPreview || observationPreview || managerPreview, filter = 'all', profileKey = null, lastUI = 0, lastSave = 0, lastTime = performance.now(), lastEventId = 0, endingShown = false, toastTimer;
let eventView = null;
let eventAuto=false,eventAutoTimer=null;
let seenStageId = 0;
const stageQueue = [];
const renderer = new WorldRenderer($('world'));
if(previewResident==='hostess'){const emotion=new URLSearchParams(location.search).get('miniEmotion');if(LUNA_MINI_EMOTIONS.includes(emotion))renderer.miniPreview={type:'hostess',emotion};}
if(observationPreview){const emotion=new URLSearchParams(location.search).get('miniEmotion');if(MOKU_MINI_EMOTIONS.includes(emotion))renderer.miniPreview={type:'cat',emotion};}
if(managerPreview){renderer.view='exterior';renderer.focus=false;const pose=new URLSearchParams(location.search).get('pose');if(pose==='idle'||Object.hasOwn(CHARACTER_ART.manager.poses,pose))renderer.managerPreviewPose=pose;}
let artVersion=0;
const onArtReady=()=>{artVersion++;worldRenderGate.state=null;};
// START needs no world artwork. Fetch it after the first gesture (or in previews).
let artStarted=false;
function startWorldArt(){
  if(artStarted)return;
  artStarted=true;
  document.body.classList.add('world-art-started');
  requestAnimationFrame(()=>{loadCharacterArt(onArtReady);loadRoomArt(onArtReady);});
}
function paintBootProgress(percent,label){window.kemonoBoot?.update(percent,label);}
window.kemonoBoot?.modulesReady();
const talk = createTalk(restored ? (state.events[0]?.id || 0) : 0);
const modal = $('modal');
if(state.actOne){
  const goal=document.createElement('section');goal.className='act-objective';goal.id='act-objective';
  goal.innerHTML=`<div><small>けもの荘 / 第一幕</small><strong>${actOneTitle(state)}</strong><span id="act-progress"></span></div>`;
  document.querySelector('main').prepend(goal);
  document.querySelector('.brand small').textContent='第一幕 · 二晩を、生き延びろ。';
}
let autoFollow = !managerPreview, cameraKey = '';

function updateCamera() {
  if(autoFollow&&state.actOne){const lead=state.residents.find(r=>r.type===(state.actOne.chapter===2?'hostess':'cat'));if(lead)state.selected=lead.room;}
  const r = state.residents.find(r => r.room === state.selected);
  const p = r ? sampleJourney(r,state.hour,ACTIONS[r.action].place) : null;
  if (autoFollow) { renderer.view = p && p.zone !== 'room' ? 'exterior' : 'interior'; renderer.focus = true; }
  renderer.focusRoom = renderer.focus ? (p?.zone === 'room' ? p.room : state.selected) : null;
  document.body.classList.toggle('camera-focused',renderer.focus);
  const key = `${renderer.view}-${renderer.focus}-${renderer.focusRoom}-${state.selected}-${state.residents.length}`;
  if (key !== cameraKey) { cameraKey = key; updateRooms(); }
}
function setInspector(open) {
  document.body.classList.toggle('inspector-open',open);
  $('resident-panel').inert = !open;
  $('inspector-button').setAttribute('aria-expanded',String(open));
  if (open) $('inspector-close').focus(); else $('inspector-button').focus();
}

function save() {
  if(developerMode){$('save-status').textContent='◇ DEBUG（通常セーブは変更しません）';return;}
  if(managerPreview){$('save-status').textContent='○ 大家のミニキャラ確認用（保存なし）';return;}
  if(firstStalkerPreview){$('save-status').textContent='○ 第二幕初回悲劇確認用（保存なし）';return;}
  if(firstFirePreview){$('save-status').textContent='○ 初回火災演出確認用（保存なし）';return;}
  if(firstRewindPreview){$('save-status').textContent='○ 第一幕巻き戻し確認用（保存なし）';return;}
  if(actTwoPreview){$('save-status').textContent='○ 第二幕観察確認用（保存なし）';return;}
  if(eventPreview) { $('save-status').textContent='○ イベント確認用（保存なし）';return; }
  if (previewResident) { $('save-status').textContent = `○ ${CHARACTERS[previewResident].name.split(' ')[1]}確認用（保存なし）`; return; }
  try { localStorage.setItem(STORAGE, JSON.stringify(state)); $('save-status').textContent = '● 自動保存'; }
  catch { $('save-status').textContent = '○ 保存できません'; }
}
function toast(text) { $('toast').textContent = text; $('toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').hidden = true, 4500); }
function updateRooms() {
  $('room-access').innerHTML = ROOMS.map(room => {
    const b = renderer.view === 'interior' ? roomBounds(room,renderer.focusRoom) : null, r = state.residents.find(r => r.room === room);
    if (!b) return '';
    return `<button class="room-hotspot ${state.selected === room ? 'selected' : ''}" data-room="${room}" style="left:${b.x/12}%;top:${b.y/6.75}%;width:${b.w/12}%;height:${b.h/6.75}%" aria-label="${room}号室 ${r ? escape(CHARACTERS[r.type].name) : '空室'}" aria-pressed="${state.selected === room}"></button>`;
  }).join('');
  if (!$('room-strip').children.length) $('room-strip').innerHTML = ROOMS.map(room=>`<button data-room="${room}"><strong>${room}</strong><span></span><small></small></button>`).join('');
  updateRoomStrip();
}
function updateRoomStrip() {
  for (const button of $('room-strip').children) {
    const room=Number(button.dataset.room),r=state.residents.find(r=>r.room===room);
    button.classList.toggle('active',room===state.selected);button.setAttribute('aria-pressed',String(room===state.selected));
    button.querySelector('span').textContent=r?CHARACTERS[r.type].name.split(' ')[1]:'空室';
    button.querySelector('small').textContent=r?motionLabel(r,state.hour,ACTIONS[r.action].label):'入居待ち';
  }
}
function updateProfile() {
  const r = state.residents.find(r => r.room === state.selected);
  const key = r ? r.id : `empty-${state.selected}`;
  if (profileKey !== key) {
    profileKey = key;
    if (!r) { $('resident-content').innerHTML = `<div class="empty-note"><span>⌂</span><h2>${state.selected}号室 · 空室</h2><p>まだ、誰の暮らしもない部屋。<br>次はどんな住人が来るのだろう。</p><button class="secondary-button" id="empty-arrival" ${state.pending ? '' : 'disabled'}>入居希望者を見る</button></div>`; return; }
    const c = CHARACTERS[r.type];
    $('resident-content').innerHTML = `<div class="resident-top"><div class="portrait-frame"><canvas id="resident-portrait" aria-label="${escape(c.species)}獣人の肖像"></canvas></div><div class="resident-meta"><p class="eyebrow">ROOM ${r.room} · 入居中</p><h2>${escape(c.name)}</h2><small>${escape(c.species)}獣人 / ${c.age}歳</small></div></div><div class="traits">${c.traits.map(t=>`<span class="trait">${escape(t)}</span>`).join('')}</div><div class="action-box"><span id="action-icon"></span><div><small>いま、なにしてる？</small><strong id="current-action"></strong></div></div><div class="needs-heading"><span>暮らしのようす</span><span>0 — 100</span></div><div id="needs-list">${NEEDS.map(([k,label])=>`<div class="need"><span class="need-name">${label}</span><div class="need-track"><div class="need-fill" id="need-${k}"></div></div><span class="need-value" id="value-${k}"></span></div>`).join('')}</div><div class="resident-details"><div class="detail-row"><span>職業</span><strong>${escape(c.job)}</strong></div><div class="detail-row"><span>所持金 / 借金</span><strong id="resident-money"></strong></div><div class="detail-row"><span>ご近所づきあい</span><strong id="resident-relation"></strong></div></div><p class="resident-quote">${escape(c.quote).replace(/\n/g,'<br>')}</p>`;
    drawPortrait($('resident-portrait'), r.type);
  }
  if (!r) { const b = $('empty-arrival'); if (b) b.disabled = !state.pending; return; }
  $('current-action').textContent = motionLabel(r,state.hour,ACTIONS[r.action].label);
  $('action-icon').textContent = ACTIONS[r.action].icon;
  $('resident-money').textContent = `${yen(r.cash)} / ${yen(r.debt)}`;
  for (const [key] of NEEDS) { const v = Math.round(r.needs[key]); $(`need-${key}`).style.width = `${v}%`; $(`need-${key}`).classList.toggle('warn',key === 'hygiene' ? v < 30 : v > 70); $(`value-${key}`).textContent = v; }
  const others = state.residents.filter(x => x !== r).sort((a,b)=>(r.relationships[a.id]||0)-(r.relationships[b.id]||0));
  if (!others.length) $('resident-relation').textContent = 'まだ、ひとり';
  else { const worst = others[0], best = others.at(-1); const chosen = (r.relationships[worst.id]||0) < -15 ? worst : best; const n = r.relationships[chosen.id]||0; $('resident-relation').textContent = `${CHARACTERS[chosen.type].name.split(' ')[1]} / ${n < -30 ? '険悪' : n < -10 ? '苦手' : n > 25 ? '気が合う' : '顔見知り'}`; }
}
const kindNames = { life:'日常', trouble:'トラブル', arrival:'お知らせ' };
function eventLabel(e) { return e.kind==='trouble' && e.caseId && MANAGEMENT_CASES[e.caseId]?.call || e.title; }
function eventHTML(e) { return `<button class="event-row" data-event="${e.id}"><span class="event-time">${escape(formatTime(e.hour))}</span><span class="event-tag ${e.kind}">${kindNames[e.kind]}</span><span class="event-text">${escape(eventLabel(e))}</span>${!e.read?'<span class="event-new">NEW</span>':''}<span class="event-arrow">↗</span></button>`; }
function updateJournal() {
  const events = state.events.filter(e => filter === 'all' || e.kind === filter).slice(0,5);
  $('event-list').innerHTML = events.length ? events.map(eventHTML).join('') : '<div class="event-row"><span class="event-text" style="color:#999787">今のところ、トラブルはありません。静かなうちに眺めておこう。</span></div>';
  $('unread-count').textContent = state.events.filter(e => !e.read).length;
}
function updateUI() {
  if(state.actOne){
    $('act-objective').querySelector('strong').textContent=(state.actOne.chapter===2?ACT_TWO_TITLE:actOneTitle(state));
    $('act-progress').textContent=`${state.actOne.attempt}周目 · ${state.actOne.completed.length}/2件を突破 · 目標：${state.actOne.chapter===2?'5日目9時':'3日目9時'}`;

  }
  const management=ensureManagement(state);
  if(state.actOne){
    const p=state.actOne.pending;
    $('request-count').textContent=p?'1':'0';$('management-button').classList.toggle('has-request',!!p);
    $('request-notice').hidden=!p;if(p)$('request-title').textContent=(state.actOne.chapter===2?ACT_TWO_EVENTS:ACT_ONE_EVENTS)[p.scene].call;
  }
  if(!state.actOne){$('request-count').textContent=management.pending&&!state.ending?'1':'0';
  $('management-button').classList.toggle('has-request',!!management.pending&&!state.ending);
  $('request-notice').hidden=!management.pending||!!state.ending;}
  if(management.pending) $('request-title').textContent=MANAGEMENT_CASES[management.pending.caseId].call||MANAGEMENT_CASES[management.pending.caseId].title;
  const d = dateAt(state.hour), clock = `${String(d.hour).padStart(2,'0')}:${String(d.minute).padStart(2,'0')}`;
  $('day-clock').innerHTML = `<b class="clock-day">DAY <em>${String(d.day).padStart(2,'0')}</em><small>${d.day}日目</small></b><span class="clock-digits">${clock}</span>`;
  const timeLabel = d.hour >= 20 || d.hour < 5 ? '夜更け' : d.hour < 10 ? '朝' : d.hour < 16 ? '昼下がり' : '夕暮れ';
  $('time-label').textContent = `${timeLabel} · ${state.ending ? '観察終了' : 'けもの荘'}`;
  $('weather-icon').textContent = d.hour >= 19 || d.hour < 6 ? '☾' : '☀';
  $('scene-day').textContent = `DAY ${String(d.day).padStart(2,'0')}`;
  $('occupancy').innerHTML = `${state.residents.length} <span>/ 6室</span>`;
  $('rent').textContent = yen(state.rent);
  $('atmosphere').textContent = atmosphere(state);
  $('next-arrival').innerHTML = state.ending ? '観察終了' : state.residents.length === 6 ? '満室御礼' : state.pending ? '<span style="color:#a5533b">申込書が届いています</span>' : `${dateAt(state.nextArrival).day}日目 <span>09:00</span>`;
  $('scene-notice').hidden = !state.pending || !!state.ending;
  $('playback-state').textContent = state.ending ? (state.actOne?'第一幕の結末に到達しました':'18日間の観察が終わりました') : modal.open ? '会話中は一時停止' : state.actOne?.pending?'モクが大家の返事を待っています' : paused ? '時間を止めて眺めています' : speed > 1 ? `${speed}倍の速さで暮らしが進みます` : '時間はゆっくり進んでいます';
  const r = state.residents.find(r => r.room === state.selected);
  const line = talk.bubbles[0];
  const liveObservation=observationView(state);
  const caption=$('scene-caption');
  const activityVisible=!!state.actOne&&!state.ending&&!state.actOne.pending;
  caption.classList.toggle('story-observation',activityVisible);
  caption.setAttribute('role','status');
  caption.setAttribute('aria-live','polite');
  if(activityVisible){
    const beat=liveObservation?.beat,title=beat?.title||(r?motionLabel(r,state.hour,ACTIONS[r.action].label):'住人の暮らしを観察中');
    const moving=r&&sampleJourney(r,state.hour,ACTIONS[r.action].place).moving;
    const status=paused?'一時停止中':beat?'会話中':moving?'移動中':'観察中';
    const total=beat?.lines.length||0,index=liveObservation?.lineIndex||0;
    const dots=Array.from({length:Math.min(7,total)},(_,i)=>`<i class="${i<Math.floor(index*Math.min(7,total)/total)?'done':i===Math.floor(index*Math.min(7,total)/total)?'current':''}"></i>`).join('');
    const name=r?CHARACTERS[r.type].name.split(' ').at(-1):'住人';
    const content=`<div class="activity-meta" style="${speakerColorStyle({speaker:r?.type})}"><span class="activity-person">${escape(name)}</span><small>${r?escape(r.room)+'号室':''}</small>${total?`<span class="activity-count">${index+1}<small> / ${total}</small></span>`:''}</div><strong class="activity-title">${escape(title)}</strong><div class="activity-foot"><span>${status}</span><div class="activity-dots" aria-hidden="true">${dots}</div></div>`;
    if(caption.innerHTML!==content)caption.innerHTML=content;
  }else caption.textContent = state.ending ? 'ろくでもない灯りが、今日もここに。' : r ? `${r.room}号室 · ${CHARACTERS[r.type].name.split(' ')[1]} / ${motionLabel(r,state.hour,ACTIONS[r.action].label)}` : `${state.selected}号室 · 次の住人を待っている。`;
  $('world').setAttribute('aria-label', line ? `${line.name}「${line.text}」` : '住人の暮らしと廊下・階段・屋外の移動を観察する画面');
  for (const button of document.querySelectorAll('[data-view]')) { const active=button.dataset.view===renderer.view;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active)); }
  for (const button of document.querySelectorAll('[data-camera]')) { const active=(button.dataset.camera==='focus')===renderer.focus;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active)); }
  $('follow-button').textContent=`住人を追う ${autoFollow?'ON':'OFF'}`;$('follow-button').classList.toggle('active',autoFollow);$('follow-button').setAttribute('aria-pressed',String(autoFollow));
  $('camera-hint').textContent=renderer.view==='interior'?(renderer.focus?'ひと部屋を大きく観察':'6部屋を同時に観察'):(renderer.focus?'選んだ住人の移動を観察':'建物・廊下・階段・通り');
  updateRoomStrip();
  updateProfile();
  if (lastEventId !== state.nextId) { lastEventId = state.nextId; updateJournal(); }
}
function header(eyebrow,title,closable=true) { return `<div class="modal-header"><div><p class="eyebrow">${eyebrow}</p><h2 id="modal-title">${title}</h2></div>${closable?'<button class="close-modal" data-close aria-label="閉じる">×</button>':''}</div>`; }
let stopFireEnding = null;
let stopOpeningPrologue = () => {};
let cleanupChoiceUI = () => {};
let cleanupDuelPlayback = () => {};
function clearFireEnding(){stopFireEnding?.();stopFireEnding=null;}
function openModal(html) { html=storyScreenHTML(html);characterVoice.stop(); stopOpeningPrologue(); cleanupChoiceUI(); cleanupDuelPlayback();modal.classList.remove('choice-mode'); clearFireEnding();clearTimeout(eventAutoTimer); replaceConversationContent($('modal-content'),html); modal.classList.toggle('act-modal',html.includes('act-screen'));modal.classList.toggle('conversation-modal',html.includes('event-stage')); document.body.classList.toggle('conversation-active',html.includes('event-stage')); if (!modal.open) modal.showModal(); updateUI(); syncNormalBgm(); }
function closeModal() {
  const duelEvent=state.actOne?.duel&&state.events.find(e=>e.id===eventView?.id);
  if(duelEvent?.duel&&eventView.index===eventConversation(duelEvent).length-1){state.actOne.duel.dialogueComplete=true;save();}
  const event=modal.classList.contains('conversation-modal')&&state.actOne?state.events.find(e=>e.id===eventView?.id):null;
  if(event&&eventView.index===eventConversation(event).length-1&&avoidedTrouble(event,state.actOne.chapter)){
    event.avoidanceSeen=true;save();
    openModal(troubleAvoidedHTML(state.actOne.chapter));
    stopFireEnding=startTroubleVictory(modal.querySelector('.trouble-victory'),()=>{closeModal();});
    return;
  }
  characterVoice.stop(); stopOpeningPrologue(); cleanupChoiceUI(); cleanupDuelPlayback(); clearFireEnding();clearTimeout(eventAutoTimer);modal.close(); updateUI(); syncNormalBgm(); }
modal.addEventListener('close', () => { if(modal.open)return;characterVoice.stop();stopOpeningPrologue();cleanupChoiceUI(); cleanupDuelPlayback();clearFireEnding();clearTimeout(eventAutoTimer);document.body.classList.remove('conversation-active'); modal.classList.remove('event-ui-hidden');lastTime = performance.now(); updateUI(); openNextStageEvent(); syncNormalBgm(); });
function syncStageCursor() {
  rememberReadScenes(state);
  seenStageId = state.events.reduce((max, event) => Math.max(max, event.id), 0);
  stageQueue.length = 0;
  // Show the opening on a new game without replaying the restored journal.
  if (!eventPreview && !previewResident) stageQueue.push(...state.events.filter(event => !event.read && event.lines?.length && (state.actOne?automaticChapterScene(event, state.actOne):!restored)).sort((a,b)=>a.id-b.id).map(event=>event.id));
}
let stageScanState=null,stageScanNextId=-1;
function queueFreshStageEvents() {
  if(stageScanState===state&&stageScanNextId===state.nextId)return;
  stageScanState=state;stageScanNextId=state.nextId;
  const fresh = state.events.filter(event => (event.stageOnly || event.lines?.length) && (!state.actOne||automaticChapterScene(event, state.actOne)) && event.id > seenStageId).sort((a, b) => a.id - b.id);
  for (const event of fresh) {
    seenStageId = event.id;
    // Dialogue now belongs to the full conversation view, not a second canvas playback.
    if(event.lines?.length)event.stageOnly=true;
    if (!stageQueue.includes(event.id)) stageQueue.push(event.id);
  }
}
function openNextStageEvent() {
  if (document.documentElement.classList.contains('game-booting') || modal.open || state.ending || document.hidden || (state.actOne&&!state.actOne.started)) return;
  while (stageQueue.length) {
    const id = stageQueue.shift();
    const event=state.events.find(event=>event.id===id);
    if (event && !event.read && (!state.actOne || automaticChapterScene(event, state.actOne)) && claimAutomaticScene(state,event)) { showEvent(id); return; }
  }
}
let lastStalkerImpactCue='';
function playStalkerImpactCue(line,key){
  const impact=line?.tragedyEffect==='impact',creak=line?.text==='背後で、床が小さくきしんだ。',step=/^深夜。大家が102|^大家は102号室へ入る/.test(line?.text||'');
  if(!(impact||creak||step)||lastStalkerImpactCue===key)return;
  lastStalkerImpactCue=key;
  if(!normalBgm.enabled||normalBgm.volume===0)return;
  try{
    const AudioContextType=window.AudioContext||window.webkitAudioContext;
    if(!AudioContextType)return;
    const ctx=new AudioContextType(),osc=ctx.createOscillator(),gain=ctx.createGain(),filter=ctx.createBiquadFilter(),start=ctx.currentTime;
    osc.type=creak?'sawtooth':'triangle';osc.frequency.setValueAtTime(creak?180:130,start);osc.frequency.exponentialRampToValueAtTime(creak?90:38,start+.28);
    filter.type='lowpass';filter.frequency.value=460;
    gain.gain.setValueAtTime(Math.min(impact ? .18 : .045,normalBgm.volume*(impact ? .3 : .09)),start);
    gain.gain.exponentialRampToValueAtTime(.0001,start+.36);
    osc.connect(filter);filter.connect(gain);gain.connect(ctx.destination);osc.start(start);osc.stop(start+.38);
    osc.onended=()=>{osc.disconnect();filter.disconnect();gain.disconnect();ctx.close().catch(()=>{});};
  }catch{}
}
function showEvent(id,index=null,page=0,afterMorningBlackout=false) {
  const e = state.events.find(e => e.id === Number(id)); if (!e) return;
  if(e.actScene==='bag'&&state.actOne?.chapter===2)secondActLife(state);
  if (e.stageOnly || e.lines?.length) {
    seenStageId = Math.max(seenStageId, e.id);
    const queued = stageQueue.indexOf(e.id);
    if (queued >= 0) stageQueue.splice(queued, 1);
  }
  e.read = true; rememberReadScenes(state); save(); updateJournal();
  if (!state.actOne && state.ending && e.id === state.events[0].id) { showEnding(); return; }
  const lines=eventConversation(e),cursor=Math.max(0,Math.min(index ?? (e.duel&&state.actOne?.duel?.eventId===e.id?state.actOne.duel.cursor:e.choicePresented?lines.length-1:0),lines.length-1));
  if(!afterMorningBlackout&&needsStalkerPreface(e,eventView,cursor)){
    openModal(stalkerPrefaceHTML());
    stopFireEnding=startStalkerPreface(modal.querySelector('.first-stalker-preface'),()=>showEvent(id,cursor,page,true));
    return;
  }
  const morningDirection=actTwoMorningDirection(e,cursor);
  const crossingMorning=morningDirection&&eventView?.id===e.id&&eventView.index<morningDirection.morning&&cursor>=morningDirection.morning;
  if(crossingMorning&&!afterMorningBlackout){
    const birds=normalBgm.enabled&&cursor===morningDirection.morning?prepareMorningBirds(normalBgm.volume):null;
    openModal('<section class="act-screen act-two-morning-blackout" aria-label="夜が明けるまで暗転"><h2 id="modal-title" class="visually-hidden">翌朝へ</h2></section>');
    const stopBlackout=startMorningBlackout(modal.querySelector('.act-two-morning-blackout'),()=>{
      stopFireEnding=null;
      showEvent(id,cursor,page,true);
      if(birds)stopFireEnding=birds.play();
    });
    stopFireEnding=()=>{stopBlackout();birds?.stop();};
    return;
  }
  const pages=messagePages(lines[cursor].text),pageIndex=Math.min(page,pages.length-1),last=cursor===lines.length-1&&pageIndex===pages.length-1;
  eventView={id:e.id,index:cursor,page:pageIndex};
  if(e.duel&&state.actOne?.duel){state.actOne.duel.cursor=cursor;state.actOne.duel.eventId=e.id;state.actOne.duel.page=pageIndex;save();}
  playDuelCue(lines[cursor],e.id+':'+cursor,normalBgm.enabled,normalBgm.volume);
  playStalkerImpactCue(lines[cursor],e.id+':'+cursor);
  if(['rewind','act2-rewind'].includes(e.actScene)&&state.actOne.rewindIntroPending){state.actOne.rewindIntroCursor=cursor;save();}
  if(['epilogue','act2-epilogue'].includes(e.actScene)&&!state.actOne.epilogueSeen){state.actOne.epilogueCursor=cursor;save();}
  const waiting=!state.ending&&(state.actOne?state.actOne.pending?.eventId===e.id:state.management.pending?.eventId===e.id);
  const c=state.actOne?(state.actOne.chapter===2?ACT_TWO_EVENTS:ACT_ONE_EVENTS)[e.actScene]:MANAGEMENT_CASES[e.caseId];
  const chosenChoices=new Set(state.actOne?(state.actOne.chapter===2?actTwoChosen(state):actOneChosenChoices(state)):[]);
  const choices=waiting&&last?(e.duel?duelChoiceHTML:choiceUIHTML)(e,state.actOne?(state.actOne.chapter===2?actTwoChoices(state,e.actScene):getActOneChoices(state,e.actScene)):c.choices,chosenChoices,failedChoiceKeys(state)):'';
  const trouble=c?.call&&e.kind==='trouble'?troubleCardHTML(c.call,waiting&&cursor===0,state.actOne?.attempt??1):'';
  const firstFire=isFirstFireReply(e,state.actOne),firstStalker=isFirstStalkerReply(e);
  if(firstStalker)prepareFirstStalkerAssets();
  const forward=last&&e.actScene==='act2-prologue'&&state.actOne.prologuePending?'<button class="primary-button" data-act2-prologue-done aria-label="第二幕へ">'+eventIcon('next')+'</button>':last&&['epilogue','act2-epilogue'].includes(e.actScene)&&!state.actOne.epilogueSeen?'<button class="primary-button" data-epilogue-done aria-label="第一幕を終える">'+eventIcon('next')+'</button>':last&&['rewind','act2-rewind'].includes(e.actScene)&&state.actOne.rewindIntroPending?'<button class="primary-button" data-rewind-resume aria-label="'+(e.resumeChoice?(e.resumeScene==='dinner'?'料理の相談に戻る':'灰皿の返事をする'):'観察を再開')+'">'+eventIcon('next')+'</button>':last&&e.actScene==='prologue'?'<button class="primary-button" data-opening="3" aria-label="タイトル演出へ進む">'+eventIcon('next')+'</button>':last?(waiting?'<button class="event-return" data-close>返事は後で</button>':state.pending&&e.kind==='arrival'&&!e.rooms.length?'<button class="event-return" data-show-candidates>申込書を見る</button>':`<button class="primary-button" data-close aria-label="${firstStalker?'暗闇の先へ':firstFire?'火災の先へ':morningDirection?'結末へ':'観察に戻る'}">${eventIcon('next')}</button>`):`<button class="primary-button" data-dialogue-next aria-label="次のセリフ">${eventIcon('next')}</button>`;
  const stageHTML=e.duel?duelStageHTML(e,state.residents,cursor,pageIndex):firstStalker?firstStalkerStageHTML(e,state.residents,cursor,pageIndex):firstFire?firstFireStageHTML(e,state.residents,cursor,pageIndex):morningDirection?actTwoMorningStageHTML(e,state.residents,cursor,pageIndex):eventStageHTML(e,state.residents,cursor,pageIndex);
  const toolbar=`<nav class="event-toolbar" aria-label="会話の操作"><button data-event-auto aria-pressed="${eventAuto}">${eventIcon('play')}<span>AUTO</span></button><button data-event-skip ${last?'disabled':''}>${eventIcon('skip')}<span>SKIP</span></button><button data-event-log aria-expanded="false">${eventIcon('log')}<span>LOG</span></button><button data-event-hide>${eventIcon('hide')}<span>HIDE</span></button><button data-event-menu aria-expanded="false">${eventIcon('menu')}<span>MENU</span></button></nav>`;
  openModal(`<h2 id="modal-title" class="conversation-title">${escape(c?.call&&e.kind==='trouble'?c.call:e.title)}</h2><div class="conversation-body" ${e.actScene==='act2-prologue'?'data-act-two-arrival':''} ${['bag','act2-rewind'].includes(e.actScene)&&state.actOne?.chapter===2?'data-act-two-stalker-exterior':''} ${e.actScene==='prologue'?'data-prologue':e.actScene==='rewind'&&state.actOne.rewindIntroPending?'data-rewind-intro':''}>${trouble}${stageHTML}${choices}${toolbar}<details class="conversation-log"><summary>会話履歴を閉じる</summary>${lines.map(l=>`<p style="${speakerColorStyle(l)}"><strong>${escape(l.memoryVoice?'大家（過去の声）':l.innerVoice?'大家（心の声）':l.speaker==='mystery'?'謎の声':CHARACTERS[l.speaker]?.name||(l.speaker==='manager'?'管理人':'記録'))}</strong> ${escape(l.text)}</p>`).join('')}</details><button class="voice-settings-open" data-event-menu aria-label="ボイス・会話設定">⚙</button><div class="event-menu" hidden><button data-event-auto aria-pressed="${eventAuto}">AUTO</button><button data-event-skip ${last?'disabled':''}>SKIP</button><button data-voice-toggle aria-pressed="${characterVoice.enabled}">ボイス ${characterVoice.enabled?'ON':'OFF'}</button><button data-bgm-toggle aria-pressed="${normalBgm.enabled}">BGM ${normalBgm.enabled?'ON':'OFF'}</button><label>BGM音量 <input type="range" data-bgm-volume min="0" max="1" step="0.05" value="${normalBgm.volume}"></label><label>ボイス音量 <input type="range" data-voice-volume min="0" max="1" step="0.05" value="${characterVoice.volume}"></label><button data-dialogue-back ${cursor===0?'disabled':''}>前のセリフへ</button><button data-event-menu>会話を続ける</button><button ${e.actScene==='act2-prologue'&&state.actOne.prologuePending?'data-act2-prologue-done':e.actScene==='prologue'?'data-opening="3"':['epilogue','act2-epilogue'].includes(e.actScene)&&!state.actOne.epilogueSeen?'data-epilogue-done':['rewind','act2-rewind'].includes(e.actScene)&&state.actOne.rewindIntroPending?'data-rewind-resume':'data-close'}>${e.actScene==='act2-prologue'&&state.actOne.prologuePending?'第二幕へ進む':e.actScene==='prologue'?'タイトル演出へ進む':['epilogue','act2-epilogue'].includes(e.actScene)&&!state.actOne.epilogueSeen?'幕を終える':e.actScene==='rewind'&&state.actOne.rewindIntroPending?(e.resumeChoice?(e.resumeScene==='dinner'?'料理の相談に戻る':'灰皿の返事をする'):'観察を再開'):waiting?'返事を保留して観察へ':'観察画面に戻る'}</button></div></div><div class="modal-footer">${forward}</div><button class="event-restore" data-event-hide hidden aria-label="会話UIを再表示">${eventIcon('hide')} 表示を戻す</button>`);
  modal.classList.toggle('choice-mode',Boolean(choices));
  if(choices){e.choicePresented=true;save();}
  cleanupChoiceUI=mountChoiceUI(modal,state.actOne?.chapter===2?'hostess':'cat');

  characterVoice.play(lines[cursor],e.id+':'+cursor+':'+pageIndex);
  characterVoice.prepare(cursor+1<lines.length?lines[cursor+1]:null);
  cleanupDuelPlayback=mountDuelPlayback(e.duel?lines[cursor]:null,{advance:advanceConversation,blocked:()=>document.hidden||characterVoice.busy||modal.classList.contains('event-ui-hidden')||!!modal.querySelector('.conversation-log[open]')||!modal.querySelector('.event-menu')?.hidden});
  scheduleEventAuto();
  document.querySelector(last&&waiting?'[data-choice]:not([disabled])':last?(['epilogue','act2-epilogue'].includes(e.actScene)&&!state.actOne.epilogueSeen?'[data-epilogue-done].primary-button':['rewind','act2-rewind'].includes(e.actScene)&&state.actOne.rewindIntroPending?'[data-rewind-resume].primary-button':e.actScene==='act2-prologue'&&state.actOne.prologuePending?'[data-act2-prologue-done].primary-button':e.actScene==='prologue'?'[data-opening="3"].primary-button':'[data-close].primary-button'):'[data-dialogue-next]')?.focus({preventScroll:true});
}

function scheduleEventAuto(){
  clearTimeout(eventAutoTimer);
  if(!eventAuto||!modal.open||!modal.classList.contains('conversation-modal')||!eventView)return;
  const current=state.events.find(e=>e.id===eventView.id),lines=current?eventConversation(current):[];
  if(!lines.length||current.duel&&(lines[eventView.index].duelAttack||lines[eventView.index].duelPlayback||lines[eventView.index].duelWindup))return;
  const last=eventView.index>=lines.length-1&&eventView.page>=messagePages(lines[eventView.index].text).length-1;
  const waiting=state.actOne?state.actOne.pending?.eventId===current.id:state.management.pending?.eventId===current.id;
  if(last&&waiting)return;
  eventAutoTimer=setTimeout(()=>{
    if(document.hidden||modal.classList.contains('event-ui-hidden')||modal.querySelector('.conversation-log[open]')||!modal.querySelector('.event-menu')?.hidden){scheduleEventAuto();return;}
    if(characterVoice.busy){scheduleEventAuto();return;}
    if(last){
      modal.querySelector('.modal-footer .primary-button')?.click();
    }else advanceConversation();
  },Math.max(2500,(messagePages(lines[eventView.index].text)[eventView.page].length*75)+1200));
}

function managementMeters() {
  const m=managementSummary(state);
  return `<div class="management-meters">${[['管理資金',yen(m.funds)],['建物の安全',`${Math.round(m.safety)} / 100`],['管理人への信頼',`${Math.round(m.trust)} / 100`],['住人の幸福',`${m.happiness} / 100`],['ご近所の仲',`${m.neighbors} / 100`],['話題になり度',`${Math.round(m.buzz)} / 100`]].map(([label,value])=>`<div><small>${label}</small><strong>${value}</strong></div>`).join('')}</div>`;
}
function showManagement() {
  if(state.actOne){showActNotebook();return;}
  const m=ensureManagement(state),pending=m.pending&&!state.ending;
  const request=pending?`<button class="manager-request" data-event="${m.pending.eventId}"><small>返事を待っている住人</small><strong>${escape(MANAGEMENT_CASES[m.pending.caseId].call||MANAGEMENT_CASES[m.pending.caseId].title)}</strong><span>左右の立ち絵で話を聞く →</span></button>`:'<p class="modal-copy">今は返事を待っている相談はありません。暮らしを眺めて、次の便りを待ちましょう。</p>';
  const later=m.queue.filter(q=>q.kind==='report');
  openModal(header('MANAGER’S ROOM / 管理人室','解決しても、暮らしは続く。')+`<div class="modal-body"><p class="modal-copy">管理人は住人を直接操作しません。相談が届いたとき、限られた予算と、その人の気持ちの間で返事を選びます。返事は保留できます。</p><button class="secondary-button" data-sensitive aria-pressed="${!!m.includeSensitive}">生活の重い相談も受ける ${m.includeSensitive?'ON':'OFF'}</button><p class="modal-copy">通常は日常のブラックコメディ。ONにすると、妊娠に関する生活支援の相談も登場します。本人の決断は本人がします。</p>${managementMeters()}${request}<h3 class="manager-section-title">あの返事の、その後</h3>${later.length?later.map(q=>`<div class="aftermath-note"><span>${escape(formatTime(q.dueAt))}ごろ</span><strong>${escape(MANAGEMENT_CASES[q.parentCase].title)}</strong><small>何が起きたかは、届いてから。</small></div>`).join(''):'<p class="modal-copy">後日談の便りは、まだありません。</p>'}<div class="manager-ledger">家賃の入金を管理資金へ加算。維持費は毎日 ¥1,800＋入居者1人につき¥300。支払いで資金がマイナスになった分は管理負債です。18日目の結末までに立て直せます。</div></div><div class="modal-footer"><span>相談 ${m.decisions.length}件に返事 · 助け合い ${m.solidarity}回</span><button class="primary-button" data-close>観察に戻る →</button></div>`);
}
function showCandidates() {
  if(state.actOne){if(state.actOne.status==='clear')showActReward();return;}
  if (!state.pending || state.ending) return;
  openModal(header('NEW NEIGHBORS / 入居申込書','空いている部屋に、誰を迎える？')+`<div class="modal-body"><p class="modal-copy">${state.pending.length === 1 ? '最後の入居候補です。' : '次の住人は、どちらか一人。暮らしの組み合わせが、けもの荘の未来を変えます。'}</p><div class="candidate-grid">${state.pending.map(type=>{
    const c=CHARACTERS[type];return `<article class="candidate-card"><div class="portrait-frame"><canvas data-portrait="${type}" aria-label="${escape(c.species)}獣人の肖像"></canvas></div><h3>${escape(c.name)}</h3><div class="candidate-sub">${escape(c.species)}獣人 · ${c.age}歳 / ${escape(c.job)}</div><div class="traits">${c.traits.map(t=>`<span class="trait">${escape(t)}</span>`).join('')}</div><p>${escape(c.bio)}</p><div class="candidate-warning">⚑ ${escape(c.warning)}</div><button class="primary-button" data-admit="${type}">この住人を迎える →</button></article>`;
  }).join('')}</div></div><div class="modal-footer"><span>一度迎えた住人は、追い出せません。</span><button class="text-button" data-close>もう少し考える</button></div>`);
  document.querySelectorAll('[data-portrait]').forEach(c=>drawPortrait(c,c.dataset.portrait));
}
function showHistory() {
  openModal(header('APARTMENT ARCHIVE / 観察日誌','ろくでもない、日々の記録')+`<div class="modal-body"><p class="modal-copy">${state.events.length}件の記録。新しい出来事から順に並んでいます。（最新240件を保存）</p><div class="history-list">${state.events.map(eventHTML).join('')}</div></div><div class="modal-footer"><span>気になる出来事を選ぶと、詳細を読めます。</span><button class="primary-button" data-close>観察に戻る →</button></div>`);
}
function storyHelpContent(){
  return `<div class="persona-help">
    <div class="persona-help-hero"><span>HOW TO PLAY</span><strong>遊び方<span class="persona-help-paw">✦</span></strong><p>このアパートの運命は、大家の選択で変わる。</p></div>
    <div class="persona-help-steps">
      <section class="persona-help-step"><b>01</b><div><h3>住人たちを見守ろう</h3><p>部屋ではモクの行動と独り言を見守りましょう。外や廊下では大家と顔を合わせて会話することも。セリフは住人のそばの吹き出しに表示され、自動で進みます。</p></div></section>
      <section class="persona-help-step"><b>02</b><div><h3>大家として返事を選ぼう</h3><p>トラブルが起きたら会話を読み、3つの選択肢から返事を決めます。選び方によって、その後の展開が変わります。会話中はゲーム内の時間が止まります。</p></div></section>
      <section class="persona-help-step"><b>03</b><div><h3>失敗を次の挑戦に生かそう</h3><p>選択を間違えると、アパートを失う結末になることも。時間を巻き戻せばもう一度挑戦できます。前の周回で分かったことを手がかりに、別の選択を試しましょう。</p></div></section>
    </div>
    <div class="persona-help-note"><strong>操作のヒント</strong><p>AUTO：セリフを自動で進める　／　SKIP：選択肢まで会話を送る<br>進行状況は自動保存。タイトルの「つづきから」で再開できます。</p></div>
  </div>`;
}
function showHelp() {
  if(state.actOne){
    openModal(header('HOW TO PLAY / 遊び方','けもの荘での暮らし方を覚えよう。')+`<div class="modal-body persona-help-body">${storyHelpContent()}</div><div class="modal-footer"><button class="primary-button" data-close>観察に戻る →</button></div>`);
    return;
  }
  openModal(header('HOW TO OBSERVE / 管理人の心得','あなたは、暮らしの後始末を引き受ける。')+`<div class="modal-body"><p class="modal-copy">住人は自分で暮らします。相談や後日談が発生すると、その場で立ち絵と吹き出しが開きます。費用・信頼・安全にはそれぞれ変化があり、後日談が別の事件につながることもあります。返事は保留できます。</p><div class="help-grid"><div class="help-step"><strong><span>01</span>暮らしを眺める</strong>最初は猫の部屋を大きく表示。「全体を見る」で6部屋を一覧できます。下の部屋一覧で住人を選び、「住人ノート」で欲求や所持金を確認。衛生状態だけは、数値が高いほど良好です。</div><div class="help-step"><strong><span>02</span>記録を読む</strong>「日誌」から会話を読み返せます。管理人室には未回答の相談と後日談の予定が届きます。「次へ」で会話を読み、最後に返事を選びます。会話中は時間が止まります。</div><div class="help-step"><strong><span>03</span>次の住人を選ぶ</strong>3日目の9時から、原則3日ごとに2人の入居希望者が現れます。封筒から申込書を開き、一人を空室に迎えましょう。</div><div class="help-step"><strong><span>04</span>アパートの結末を見届ける</strong>18日目の9時に、管理資金・安全・信頼・助け合い・話題と、住人の暮らしから結末が決まります。組み合わせを変えて、別の観察記を始められます。</div></div><p class="modal-copy" style="margin-top:18px;margin-bottom:0">「住人を追う」をONにすると、選んだ住人が部屋を出たとき外観へ、帰宅すると内装へ自動で切り替わります。手動の内装／外観・大きさ切り替えは追跡をOFFにします。⛶で全画面表示。通常速度では10秒＝ゲーム内1時間。3×・6×で進行を速められます。ブラウザを閉じたり、別のタブを表示している間は進行しません。データはこのブラウザに自動保存されます。</p></div><div class="modal-footer"><span>Space：一時停止 / Esc：ノートを閉じる</span><button class="primary-button" data-close>けもの荘を眺める →</button></div>`);
}
function showOpening(step = 0) {
  if (step === 0) {
    openModal(openingPrologueHTML());
    stopOpeningPrologue=startOpeningPrologue(modal.querySelector('.cinematic-prologue'),()=>showOpening(1),characterVoice);
  } else if (step < 3) {
    let prologue=state.events.find(event=>event.actScene==='prologue');
    if(!prologue){
      prologue=addEvent(state,'life','101号室 · 大家就任','お、新しい大家かニャ？',[101]);
      prologue.actScene='prologue';prologue.cast=['cat'];prologue.stageOnly=true;
      prologue.lines=INITIAL_MOKU_LINES.map(line=>({...line}));
    }
    showEvent(prologue.id,step-1);
  } else {
    openModal(`<section class="act-screen opening-reveal"><img src="assets/apartments.png" class="opening-reveal-art" alt="夕暮れのけもの荘"><div class="opening-reveal-shade"></div><div class="opening-logo"><p>あなたは本日から、この家の大家です。</p><h2 id="modal-title">けもの荘<span>～このアパート、問題しかない。～</span></h2></div><button class="opening-next opening-reveal-next" data-opening-continue>第一幕へ →</button></section>`);
  }
}

function showGameTitle(){
  debugTapCount=0;
  const continuing=state.actOne.started||state.actOne.chapter===2;
  openModal(`<section class="act-screen game-title graphic-title title-refined"><button type="button" data-debug-hotspot aria-label=" " tabindex="-1" style="position:absolute;z-index:20;top:0;right:0;width:clamp(80px,12vw,150px);height:clamp(75px,12vh,130px);border:0;background:transparent;box-shadow:none;padding:0;opacity:0;cursor:default"></button><img class="title-city" src="assets/apartments.png" alt=""><div class="title-slash" aria-hidden="true"></div><div class="title-cast" aria-hidden="true"><div class="title-support title-luna"><img src="${EVENT_EXPRESSIONS.hostess.happy}" alt=""></div><div class="title-support title-nemu"><img src="${EVENT_EXPRESSIONS.sister.happy}" alt=""></div><img class="title-moku" src="${EVENT_EXPRESSIONS.cat.tired}" alt=""></div><div class="title-poster"><p class="title-label">住人観察 × 崩壊回避アドベンチャー</p><h2 id="modal-title" class="title-logo"><span>けもの<span class="title-logo-last">荘</span></span><small>～このアパート、問題しかない。～</small></h2><p class="title-hook">ロクでもない日常に、最悪の結末を。<br><strong>――させるかよ。</strong></p><nav class="title-actions" aria-label="ゲームタイトルメニュー">${continuing?'<button data-game-continue><span class="title-menu-mark" aria-hidden="true"></span><span>つづきから</span></button>':''}<button data-game-new><span class="title-menu-mark" aria-hidden="true"></span><span>はじめから</span></button><button data-title-help><span class="title-menu-mark" aria-hidden="true"></span><span>遊び方</span></button></nav><p class="title-record">${continuing?'前回の記録は自動保存されています。':'本日より、あなたが大家さん。'}</p></div></section>`);
  modal.querySelector('.title-actions button')?.focus({preventScroll:true});
}
function showActTwoOpening(){
  openModal(actTwoOpeningHTML());
  stopOpeningPrologue=startActTwoOpening(modal,()=>{
    if(state.actOne?.chapter!==2)return;
    showActTwoTitle();
  },characterVoice,normalBgm);
}
function showActTwoTitle(){openModal(`<section class="act-screen act-title" data-chapter="2"><div class="act-title-copy"><p class="act-kicker">KEMONOSOU / CHAPTER 02</p><p class="act-number">第二幕</p><h2 id="modal-title">アパートを<br><span>借金<span class="act-resident">（ルナ）</span></span>から守れ！</h2><p class="act-tagline">燃えなかったアパート。次は借金のカタに取られるな。</p><button class="act-primary" data-act2-start>第二幕を始める →</button></div><img class="act-key-art" src="assets/events/busts/hostess-neutral.png" alt="金城ルナ"></section>`);}
function showActTitle(){
  openModal(`<section data-chapter="1" class="act-screen act-title ${state.actOne.attempt>1?'act-title-burning':''}">${state.actOne.attempt>1?'<div class="act-title-fire" aria-hidden="true">'+fireEndingHTML(null).replace('id="modal-title"','')+'</div>':''}<div class="title-embers" aria-hidden="true"></div><img class="act-key-art" src="${EVENT_EXPRESSIONS.cat.tired}" alt="灰田モク"><div class="act-title-copy"><p class="act-kicker">KEMONOSOU / CHAPTER 01</p><p class="act-number">第一幕</p><h2 id="modal-title">${state.actOne.attempt > 1 ? 'アパートを<br><span>火事<span class="act-moku">（モク）</span></span>から守れ！' : 'アパートを<br><span>モク</span>から守れ！'}</h2><p class="act-tagline">${state.actOne.attempt > 1 ? 'たった一人の住人。たった三日間。<br>なのに、この家は何度でも燃える。' : 'たった一人の住人。たった三日間。<br>訳ありアパートの大家生活が、いま始まる。'}</p><div class="act-rule"><span>START <b>1日目 17:00</b></span><i>→</i><span>GOAL <b>3日目 09:00</b></span></div><button class="act-primary" data-act-start>大家さんの一日を始める <span>→</span></button></div></section>`);
  if(state.actOne.attempt>1)stopFireEnding=startFireEnding(modal.querySelector('.act-title-fire .fire-cinematic'),null,()=>{},{ambient:true});
}
function continueGame(){
  const d=state.actOne?.duel,e=d&&state.events.find(e=>e.id===d.eventId);
  if(e?.duel&&!d.dialogueComplete){showEvent(e.id,d.cursor||0,d.page||0);return;}
  if(state.actOne.rewindIntroPending){showEvent(state.events.find(e=>e.actScene===(state.actOne.chapter===2?'act2-rewind':'rewind')).id,state.actOne.rewindIntroCursor||0);return;}
  if(state.actOne.rewindTitlePending){showActTitle();return;}
  if(state.actOne.chapter===2&&state.actOne.titlePending){showActTwoOpening();return;}
  if(state.actOne.chapter===2&&state.actOne.prologuePending){const e=state.events.find(e=>e.actScene==='act2-prologue');if(e){showEvent(e.id);return;}}
  closeModal();if(state.ending)showActEnding();else if(state.actOne.pending)showEvent(state.actOne.pending.eventId);else openNextStageEvent();
}
function showTitleHelp(){
  openModal(header('HOW TO PLAY / 遊び方','この家の平穏は、あなたの選択次第。',false)+`<div class="modal-body persona-help-body">${storyHelpContent()}</div><div class="modal-footer"><button class="primary-button" data-act-title>タイトルに戻る →</button></div>`);
}

function showActNotebook(){
  if(state.actOne.chapter===2){
    const a=state.actOne,p=a.pending;
    const choices=Object.values(ACT_TWO_EVENTS).flatMap(e=>e.choices.filter(c=>c.bad&&a.memory.includes(c.bad)).map(c=>`<article class="act-memory"><small>失敗の記憶</small><strong>${escape(c.label)}</strong><p>${escape(c.clue)}</p></article>`));
    openModal(header('大家ノート / 第二幕',`${a.attempt}周目 — ルナと住まいを守る。`)+`<div class="modal-body"><p class="modal-copy">待ち伏せと押しかける男たちに対処し、ルナと住まいを守ろう。</p>${p?`<button class="manager-request" data-event="${p.eventId}"><strong>${escape(ACT_TWO_EVENTS[p.scene].call)}</strong><span>返事をする →</span></button>`:''}${choices.join('')||'<p class="modal-copy">失敗の記憶はまだありません。</p>'}</div><div class="modal-footer"><button class="primary-button" data-close>観察に戻る →</button></div>`);
    return;
  }
  const a=state.actOne,p=a.pending;
  const memories=Object.values(ACT_ONE_EVENTS).flatMap(c=>c.choices.filter(x=>a.memory.includes(x.bad)).map(x=>`<article class="act-memory"><small>焼け跡に残った記憶</small><strong>${escape(x.label)}</strong><p>${escape(x.clue)}</p></article>`));
  openModal(header('LANDLORD’S MEMORY / 大家ノート',`${a.attempt}周目 — 今度こそ、この家を残す。`)+`<div class="modal-body"><p class="modal-copy">目標：3日目9時。モクの返事と、部屋の様子が手がかり。変な回答にも、生き残る理由が一つだけあります。</p>${p?`<button class="manager-request" data-event="${p.eventId}"><strong>${escape(ACT_ONE_EVENTS[p.scene].call)}</strong><span>返事をする →</span></button>`:''}${memories.join('')||'<p class="modal-copy">まだ失敗の記憶はありません。まずはモクの話を聞いてみましょう。</p>'}</div><div class="modal-footer"><button class="primary-button" data-close>観察に戻る →</button></div>`);
}
function showActEnding(afterFire=false){
  endingShown=true;
  if(state.actOne.chapter===2){showActTwoEnding();return;}
  const a=state.actOne,bad=a.status==='bad';
  if(bad&&!afterFire){
    openModal(fireEndingHTML(a.failure,{firstTragedy:a.attempt===1&&a.failure==='ash-trash'}));
    stopFireEnding=startFireEnding(modal.querySelector('.fire-cinematic'),a.failure,()=>showActEnding(true),{firstTragedy:a.attempt===1&&a.failure==='ash-trash'});
    return;
  }
  if(bad){beginRewind(true);return;}
  if(!a.epilogueSeen){const epilogue=state.events.find(e=>e.actScene==='epilogue');if(epilogue){showEvent(epilogue.id,a.epilogueCursor||0);return;}}
  openModal(actOneCompleteHTML());
}
function showActTwoEnding(afterCinematic=false){
 const a=state.actOne;
 if(a.status==='bad'&&a.failure?.startsWith('duel-')){openModal(duelBadHTML(state));return;}
 if(a.status==='bad'){
  if(a.failure==='bag-guarantee'&&a.attempt===1){
   beginRewind(true);return;
  }
  if(!afterCinematic){
   openModal(debtEndingHTML(a.failure));
   stopFireEnding=startDebtEnding(modal.querySelector('.debt-cinematic'),()=>showActTwoEnding(true));
   return;
  }
  const choice=Object.values(ACT_TWO_EVENTS).flatMap(v=>v.choices).find(v=>v.bad===a.failure);
  openModal(`<section class="act-screen act-burn" data-chapter="2"><div class="ending-building" aria-hidden="true"><img src="assets/apartments.png" alt=""></div><img class="ending-character" src="${a.failure?.startsWith("bag-")?EVENT_EXPRESSIONS.cat.sad:EVENT_EXPRESSIONS.hostess.sad}" alt="${a.failure?.startsWith("bag-")?"灰田モク":"金城ルナ"}"><div class="act-ending-copy"><p class="act-kicker">BAD END / 第二幕 · ${a.attempt}周目</p><h2 id="modal-title">${escape(choice?.endingName||(a.failure?.startsWith("bag-")?"夜 逃 げ":"差 し 押 さ え"))}</h2><p class="act-ending-story">${escape(state.ending.text)}</p><p class="act-clue">${escape(choice?.clue||'契約書はよく読む。')}</p><p>大家「……アパートまで失ってたまるか！ 次こそは！」</p><button class="act-primary" data-act2-rewind>あの時へ、もう一度 ↶</button></div></section>`);return;
 }
 if(!a.epilogueSeen){const e=state.events.find(e=>e.actScene==='act2-epilogue');if(e){showEvent(e.id,a.epilogueCursor||0);return;}}
 openModal(`<section class="act-screen act-clear" data-chapter="2"><img class="ending-character" src="${EVENT_EXPRESSIONS.hostess.happy}" alt="金城ルナ"><div class="act-ending-copy"><p class="act-kicker">SECOND ACT COMPLETE</p><h2 id="modal-title">第二幕・完</h2><p class="act-ending-story">けもの荘は、借金のカタにならずに済んだ。</p><button class="act-primary" data-act2-finish>次章へ続く →</button></div></section>`);
}
function showActReward(){
  openModal(header('第二幕 PROLOGUE / 新しい住人','一枚の申込書が、けもの荘に届いた。',false)+`<div class="modal-body"><p class="modal-copy">けもの荘に届いた、一枚の入居申込書。</p><p class="modal-copy">果たして、新たな住人はどんな人物なのか。そして、モクとの共同生活はどうなってしまうのか——。</p><p class="modal-copy">第二幕の物語は、これから始まる。</p></div><div class="modal-footer"><button class="primary-button" data-act-replay>第一幕をもう一度遊ぶ →</button></div>`);
}
function showNextChapter(){
  openModal(`<section class="act-screen act-clear act-intermission" data-chapter="2"><img class="ending-character" src="${EVENT_EXPRESSIONS.hostess.happy}" alt="金城ルナ"><div class="act-ending-copy"><p class="act-kicker">TO BE CONTINUED</p><h2 id="modal-title">第三幕、<br>準備中。</h2><button class="act-primary" data-act-replay>最初から遊ぶ →</button></div></section>`);
}
function beginRewind(afterFire=false){
  const secondAct=state.actOne.chapter===2;
  afterFire=afterFire||secondAct;
  const failure=state.actOne.failure;
  const rollbackHour=storyCheckpointTarget(state).hour;
  openModal(rewindTransitionHTML(failure,state.actOne.attempt,afterFire,secondAct?2:1));
  const sound=$('sound-button').getAttribute('aria-pressed')==='true';
  const stopTransition=startRewindTransition(modal.querySelector('.rewind-screen'),failure,()=>resetActState(secondAct?rewindActTwo(state):rewindBeforeFire(state),true),sound,state.actOne.attempt,rollbackHour,afterFire,normalBgm.clockAudio);
  stopFireEnding=()=>stopTransition();
}
let rewindWhiteoutPending=false;
function resetActState(next,resume=false,skipInitialScreen=false){
  const reveal=rewindWhiteoutPending;rewindWhiteoutPending=false;
  let whiteout=null;
  if(reveal){whiteout=document.createElement('div');whiteout.className='rewind-scene-reveal';document.body.append(whiteout);}
  if(resume)inheritObservation(state,next);
  state=next;restored=false;Object.assign(talk,createTalk(0));syncStageCursor();profileKey=null;lastEventId=0;endingShown=false;paused=false;autoFollow=true;
  renderer.reset();closeModal();updateCamera();updateRooms();updateUI();save();
  if(whiteout){requestAnimationFrame(()=>requestAnimationFrame(()=>whiteout.classList.add('revealing')));setTimeout(()=>whiteout.remove(),1300);}
  if(skipInitialScreen)return;
  if(state.actOne.chapter===2){if(state.actOne.titlePending){showActTwoOpening();return;}const e=state.events.find(e=>e.actScene===(state.actOne.prologuePending?'act2-prologue':'act2-rewind'));if(e&&(state.actOne.prologuePending||state.actOne.rewindIntroPending)){showEvent(e.id,state.actOne.rewindIntroCursor||0);return;}showActTwoTitle();return;}
  if(state.actOne.rewindIntroPending)showEvent(state.events.find(e=>e.actScene==='rewind').id,state.actOne.rewindIntroCursor||0);else showActTitle();
}
modal.addEventListener('cancel',e=>{const current=state.events.find(x=>x.id===eventView?.id);if(modal.classList.contains('conversation-modal')&&state.actOne&&eventView?.index===eventConversation(current||{}).length-1&&avoidedTrouble(current,state.actOne.chapter)){e.preventDefault();closeModal();return;}if(state.actOne&&(modal.classList.contains('act-modal')||modal.querySelector('[data-prologue],[data-rewind-intro]')))e.preventDefault();});
function showEnding() {
  if (!state.ending) return;
  if(state.actOne){showActEnding();return;}
  endingShown=true;
  const debt=state.residents.reduce((s,r)=>s+r.debt,0);
  openModal(header('THE END / けもの荘・観察記','18日間、見守ってくれてありがとう。')+`<div class="modal-body"><div class="ending-title">「${escape(state.ending.name)}」</div><p class="event-detail" style="text-align:center">${escape(state.ending.text)}</p>${managementMeters()}<div class="ending-stats"><div>暮らした住人<strong>${state.residents.length}人</strong></div><div>受け取った家賃<strong>${yen(state.rent)}</strong></div><div>残った借金<strong>${yen(debt)}</strong></div></div><p class="modal-copy">相談への返事 ${state.management.decisions.length}件。未回答 ${state.management.pending?1:0}件、まだ届いていない後日談 ${state.management.queue.filter(q=>q.kind==='report').length}件。最後の状態で結末を判定しています。</p></div><div class="modal-footer"><button class="text-button" data-close>最後のけもの荘を眺める</button><button class="primary-button" data-restart>別の観察記を始める →</button></div>`);
}
function restart() {
  state=state.actOne?createActOne():createGame();restored=false;Object.assign(talk, createTalk(0));syncStageCursor();profileKey=null;lastEventId=0;endingShown=false;paused=false;autoFollow=true;renderer.reset();updateCamera();closeModal();updateRooms();updateUI();save();if(state.actOne){showOpening();}else toast('新しい観察記が始まりました。101号室には、いつもの猫。');
}
const BUILD_VERSION='2026.10.20.13';
const buildTimestamp=document.querySelector('meta[name="build-updated"]')?.content;
const BUILD_UPDATED=buildTimestamp&&buildTimestamp!=='local'?new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',dateStyle:'short',timeStyle:'short'}).format(new Date(buildTimestamp))+' JST':'ローカル開発版';
function debugMenuPage(title,subtitle,buttons,back){
  const tone=(id,kind)=>{
    if(kind)return kind;
    if(id==='boot'||id==='copy-boot')return 'utility';
    if(id==='1')return 'chapter1';
    if(id==='2')return 'chapter2';
    if(id==='scenes')return 'navigation';
    if(id.endsWith('-loop'))return 'rewind';
    if(id.endsWith('-choices'))return 'choice';
    if(/:(ash|dinner|bag|duel)$/.test(id))return 'start';
    if(id.endsWith(':epilogue'))return 'ending';
    if(id.includes(':opening')||id.includes(':intro')||id.includes(':arrival'))return 'story';
    return 'navigation';
  };
  openModal(`<section class="act-screen debug-menu persona-debug">
    <div class="persona-debug-stripe" aria-hidden="true">DEBUG / SCENE SELECT / DEBUG /</div>
    <header><span class="persona-debug-kicker">KEMONOSOU // DEVELOPER MODE</span><h2 id="modal-title">${title}</h2><p>${subtitle}</p></header>
    <div class="persona-debug-actions">${buttons.map(([id,label,attr,kind],i)=>`<button type="button" class="persona-debug-button tone-${tone(id,kind)}" ${attr}="${escape(id)}"><span class="persona-debug-index">${String(i+1).padStart(2,'0')}</span><span class="persona-debug-label">${escape(label)}</span><span class="persona-debug-arrow" aria-hidden="true">↗</span></button>`).join('')}</div>
    <button type="button" class="persona-debug-back" ${back}>← 戻る</button>
    <footer>VERSION ${BUILD_VERSION}　/　${BUILD_UPDATED}</footer>
  </section>`);
}
function showDeveloperMenu(){
  debugMenuPage('開発者メニュー','テストしたい項目を選択',[['scenes','シーンセレクト（第一幕・第二幕）','data-debug-tool'],['boot','起動診断・計測結果のコピー','data-debug-tool']], 'data-debug-back');
}
function showBootDiagnostics(){
  debugMenuPage('起動診断','この端末で今回の起動にかかった時間です。結果は自動送信しません。',[['copy-boot','計測結果をコピー','data-debug-tool']], 'data-debug-tools-back');
  const area=document.createElement('textarea');area.id='debug-boot-report';area.readOnly=true;area.setAttribute('aria-label','起動診断の計測結果');
  area.value=window.kemonoBoot?.getReport?.()||'この版には起動計測がありません。最新版を再読み込みしてください。';
  area.style.cssText='width:min(100%,640px);min-height:36vh;flex-shrink:0;box-sizing:border-box;overflow:auto;white-space:pre;background:#080b11;color:#e8edf6;border:1px solid #71809a;padding:12px;font:12px/1.5 monospace;user-select:text;-webkit-user-select:text';
  modal.querySelector('footer').before(area);
}
async function copyBootDiagnostics(button){
  const area=$('debug-boot-report');if(!area)return;
  try{await navigator.clipboard.writeText(area.value);button.textContent='コピーしました';}
  catch{area.focus();area.select();area.setSelectionRange(0,area.value.length);button.textContent='選択された結果を長押ししてコピーしてください';}
}
function showDebugChapterSelect(){
  debugMenuPage('シーンセレクト','確認する章を選択してください。通常セーブには影響しません。',[['1','第一幕 — モク編','data-debug-chapter'],['2','第二幕 — ルナ編','data-debug-chapter']], 'data-debug-tools-back');
}
function showDebugSceneSelect(chapter,page=0){
  // Label destinations by their exact entry point. The duel's first-choice warp
  // belongs to the chapter-two scene selector, not the top-level debug menu.
  const options=chapter==='1'
    ?[
      ['intro','物語｜第一幕オープニング','story'],
      ['ash','トラブル開始｜灰皿の火事','start'],
      ['ash-choices','選択肢｜灰皿・3択直前','choice'],
      ['ash-loop','巻き戻り｜灰皿の火事','rewind'],
      ['dinner','トラブル開始｜料理','start'],
      ['dinner-choices','選択肢｜料理・3択直前','choice'],
      ['dinner-loop','巻き戻り｜料理','rewind'],
      ['epilogue','エンディング｜第一幕','ending']
    ]
    :[
      ['opening','物語｜第二幕オープニング映像','story'],
      ['arrival','物語｜ルナ入居プロローグ','story'],
      ['bag','トラブル開始｜待ち伏せ事件','start'],
      ['bag-choices','選択肢｜待ち伏せ・3択直前','choice'],
      ['bag-loop','巻き戻り｜待ち伏せ事件','rewind'],
      ['duel','トラブル開始｜嘘つきルナを守れ！','start'],
      ['duel-choices','ミニゲーム｜漢気バトル・最初の3択','battle'],
      ['duel-loop','巻き戻り｜漢気バトルBAD後','rewind'],
      ['epilogue','エンディング｜第二幕','ending']
    ];
  const pageCount=Math.ceil(options.length/4),current=Math.max(0,Math.min(pageCount-1,page));
  const buttons=options.slice(current*4,current*4+4).map(([id,label,kind])=>[chapter+':'+id,label,'data-debug-scene',kind]);
  if(current>0)buttons.push([chapter+':'+(current-1),'前のページ','data-debug-scene-page']);
  if(current<pageCount-1)buttons.push([chapter+':'+(current+1),'次のページ','data-debug-scene-page']);
  debugMenuPage(chapter==='1'?'第一幕｜シーンセレクト':'第二幕｜シーンセレクト','色で移動先を分類。トラブル開始と選択肢直前は別の地点です。',buttons,'data-debug-chapters-back');
}
function startDeveloperScene(target){
  const [chapter,point]=target.split(':');
  const phase=point?.endsWith('-loop')?'loop':point?.endsWith('-choices')?'choices':null;
  const scene=phase?point.slice(0,point.lastIndexOf('-')):point;
  if(!['1','2'].includes(chapter))return;
  developerMode=true;
  let next=createActOne(42,[],chapter==='1'&&['dinner','epilogue'].includes(scene)?2:1,true);
  // Observation movement may finish just after the event hour; enter the scene only once it is queued.
  const advanceFirstScene=()=>{
    for(let step=0;step<12&&!next.actOne.pending&&next.actOne.status==='playing';step++)advanceActOne(next,100);
  };
  if(chapter==='1'){
    if(scene==='dinner'||scene==='epilogue'){
      advanceFirstScene();
      answerActOne(next,next.actOne.pending.eventId,'water');
    }
    if(scene==='epilogue'){
      advanceFirstScene();
      answerActOne(next,next.actOne.pending.eventId,'coronation');
      advanceFirstScene();
    }else if(scene==='ash'||scene==='dinner')advanceFirstScene();
  }else{
    beginActTwo(next);
    next.actOne.started=true;next.actOne.titlePending=false;next.actOne.prologuePending=false;
    next.events.filter(e=>e.actScene==='act2-prologue').forEach(e=>e.read=true);
    if(['bag','duel','epilogue'].includes(scene)){
      advanceActTwo(next,100);
      if(scene!=='bag'){
        answerActTwo(next,next.actOne.pending.eventId,'loan');
        advanceActTwo(next,100);
        if(['duel','epilogue'].includes(scene)){
          if(scene==='epilogue'){for(const id of ['boundary','receipt','cancel','leave'])answerActTwo(next,next.actOne.pending.eventId,id);advanceActTwo(next,100);}
        }
      }
    }
  }
  if(phase){
    const events=chapter==='1'?ACT_ONE_EVENTS:ACT_TWO_EVENTS;
    if(scene==='duel'){for(const id of ['vow','shield','future','ultimate'])answerActTwo(next,next.actOne.pending.eventId,id);next=rewindActTwo(next);}
    const choice=events[scene]?.choices.find(choice=>choice.bad);
    if(scene!=='duel'&&(!choice||!next.actOne.pending))return;
    if(scene!=='duel')(chapter==='1'?answerActOne:answerActTwo)(next,next.actOne.pending.eventId,choice.id);
    if(scene!=='duel')next=chapter==='1'?rewindBeforeFire(next):rewindActTwo(next);
    if(phase==='choices'){
      next.actOne.rewindIntroPending=false;
      for(let step=0;step<12&&!next.actOne.pending;step++)(chapter==='1'?advanceActOne:advanceActTwo)(next,100);
    }
    next.events.forEach(event=>event.read=true);
    resetActState(next,false,true);
    const event=phase==='loop'?next.events.find(e=>e.actScene===(chapter==='1'?'rewind':'act2-rewind')):next.events.find(e=>e.id===next.actOne.pending?.eventId);
    if(event){event.read=false;showEvent(event.id,phase==='choices'?eventConversation(event).length-1:0);}
    return;
  }
  // Scene-select reconstructs past answers only to establish the chosen destination.
  // Do not leave those earlier scenes queued behind the current conversation.
  next.events.forEach(event=>event.read=true);
  resetActState(next,false,true);
  if(chapter==='1'){
    if(scene==='intro'){showOpening();return;}
    const eventName=scene==='epilogue'?'epilogue':scene;
    const event=next.events.find(e=>e.actScene===eventName);
    if(event){event.read=false;showEvent(event.id);}else showActTitle();
    return;
  }
  if(scene==='opening'){
    // Scene-select must enter the real chapter-two flow: film -> chapter title -> Luna arrival.
    state.actOne.started=false;state.actOne.titlePending=true;state.actOne.prologuePending=true;
    const arrival=state.events.find(e=>e.actScene==='act2-prologue');if(arrival)arrival.read=false;
    save();
    requestAnimationFrame(()=>showActTwoOpening());return;
  }
  if(scene==='arrival'){next.actOne.prologuePending=true;}
  const name=scene==='arrival'?'act2-prologue':scene==='epilogue'?'act2-epilogue':scene;
  const event=next.events.find(e=>e.actScene===name);
  if(event){event.read=false;showEvent(event.id);}else showActTwoTitle();
}
document.addEventListener('click',e=>{
  const button=e.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-debug-hotspot')){const now=performance.now();debugTapCount=now-debugLastTap>2500?1:debugTapCount+1;debugLastTap=now;if(debugTapCount>=3){debugTapCount=0;showDeveloperMenu();}return;}
  if(button.hasAttribute('data-debug-back')){showGameTitle();return;}
  if(button.hasAttribute('data-debug-tools-back')){showDeveloperMenu();return;}
  if(button.hasAttribute('data-debug-chapters-back')){showDebugChapterSelect();return;}
  if(button.dataset.debugTool==='scenes'){showDebugChapterSelect();return;}
  if(button.dataset.debugTool==='boot'){showBootDiagnostics();return;}
  if(button.dataset.debugTool==='copy-boot'){copyBootDiagnostics(button);return;}
  if(button.dataset.debugChapter){showDebugSceneSelect(button.dataset.debugChapter);return;}
  if(button.dataset.debugScenePage){const [chapter,page]=button.dataset.debugScenePage.split(':');showDebugSceneSelect(chapter,Number(page));return;}
  if(button.dataset.debugScene){startDeveloperScene(button.dataset.debugScene);return;}
  if(button.dataset.opening)showOpening(Number(button.dataset.opening));
  if(button.hasAttribute('data-opening-continue'))showActTitle();
  if(button.hasAttribute('data-act-title'))showGameTitle();
  if(button.hasAttribute('data-title-help'))showTitleHelp();
  if(button.hasAttribute('data-game-continue')&&(state.actOne.started||state.actOne.chapter===2))continueGame();
  if(button.hasAttribute('data-game-new')){if(state.actOne.started||state.actOne.chapter===2)button.setAttribute('data-title-new','');else showOpening();}
  if(button.hasAttribute('data-title-new'))openModal(`<section class="restart-confirm" aria-describedby="restart-description"><div class="restart-stamp" aria-hidden="true">DAY<span>01</span></div><div class="restart-content"><p class="restart-kicker"><span aria-hidden="true">↺</span> NEW GAME / はじめから</p><h2 id="modal-title"><span>一日目から、</span><strong>やり直しますか？</strong></h2><p id="restart-description">今の進行と、タイムループで集めた<br class="restart-desktop-break">失敗の記憶をリセットします。</p><div class="restart-actions"><button class="restart-back" data-act-title><small aria-hidden="true">01 / BACK</small><span>タイトルに戻る</span><b aria-hidden="true">↩</b></button><button class="restart-start" data-restart><small aria-hidden="true">02 / NEW GAME</small><span>新しく始める</span><b aria-hidden="true">→</b></button></div></div><div class="restart-edge" aria-hidden="true">KEMONOSOU / RESTART?</div></section>`);
  if(button.hasAttribute('data-act2-start')&&state.actOne?.chapter===2){state.actOne.started=true;state.actOne.titlePending=false;save();const intro=state.events.find(e=>e.actScene==='act2-prologue');if(state.actOne.prologuePending&&intro)showEvent(intro.id);else{closeModal();openNextStageEvent();}}
  if(button.hasAttribute('data-act-start')){state.actOne.started=true;state.actOne.rewindTitlePending=false;save();closeModal();if(state.ending)showActEnding();else if(state.actOne.pending)showEvent(state.actOne.pending.eventId);else openNextStageEvent();}
  if(button.hasAttribute('data-act2-prologue-done')&&state.actOne?.chapter===2){state.actOne.started=true;state.actOne.titlePending=false;state.actOne.prologuePending=false;const intro=state.events.find(e=>e.actScene==='act2-prologue');if(intro)intro.read=true;state.selected=102;autoFollow=true;cameraKey='';updateCamera();updateRooms();save();closeModal();openNextStageEvent();}
  if(button.hasAttribute('data-rewind-resume')&&state.actOne?.rewindIntroPending){state.actOne.rewindIntroPending=false;const intro=state.events.find(e=>e.actScene===(state.actOne.chapter===2?'act2-rewind':'rewind'));if(intro)intro.read=true;save();if(intro?.resumeChoice&&state.actOne.pending){showEvent(state.actOne.pending.eventId);return;}closeModal();}
  if(button.hasAttribute('data-epilogue-done')&&state.actOne?.status==='clear'){state.actOne.epilogueSeen=true;const ep=state.events.find(e=>e.actScene===(state.actOne.chapter===2?'act2-epilogue':'epilogue'));if(ep)ep.read=true;save();showActEnding();}
  if(button.hasAttribute('data-act-reward')&&state.actOne?.status==='clear')resetActState(beginActTwo(state));
  if(button.hasAttribute('data-act2-rewind')&&state.actOne?.chapter===2&&state.actOne.status==='bad')beginRewind(true);
  if(button.hasAttribute('data-act2-finish'))showNextChapter();
  if(button.hasAttribute('data-act-replay'))resetActState(createActOne());
  if(button.dataset.actAdmit&&state.actOne?.status==='clear'&&!state.actOne.reward&&['hostess','fox'].includes(button.dataset.actAdmit)){state.actOne.reward=button.dataset.actAdmit;save();showActReward();}
  if(button.hasAttribute('data-close')){
    if(button.closest('.modal-footer')&&cleanupDuelPlayback.canAdvance?.()===false)return;
    closeModal();
  }
  if(button.dataset.room){state.selected=Number(button.dataset.room);updateCamera();updateRooms();updateProfile();updateUI();save();}
  if(button.dataset.view){autoFollow=false;renderer.view=button.dataset.view;updateCamera();updateUI();}
  if(button.dataset.camera){autoFollow=false;renderer.focus=button.dataset.camera==='focus';updateCamera();updateUI();}
  if(button.dataset.event)showEvent(button.dataset.event);
  if(button.hasAttribute('data-sensitive')){state.management.includeSensitive=!state.management.includeSensitive;save();showManagement();}
  if(button.hasAttribute('data-bgm-toggle')){normalBgm.setEnabled(!normalBgm.enabled);paintSoundButton();button.textContent='BGM '+(normalBgm.enabled?'ON':'OFF');button.setAttribute('aria-pressed',String(normalBgm.enabled));}
  if(button.hasAttribute('data-voice-toggle')){characterVoice.setEnabled(!characterVoice.enabled);button.textContent='ボイス '+(characterVoice.enabled?'ON':'OFF');button.setAttribute('aria-pressed',String(characterVoice.enabled));}
  if(button.hasAttribute('data-event-auto')){eventAuto=!eventAuto;button.setAttribute('aria-pressed',String(eventAuto));scheduleEventAuto();}
  if(button.hasAttribute('data-event-skip')&&eventView){eventAuto=false;const current=state.events.find(e=>e.id===eventView.id);if(current)showEvent(eventView.id,eventConversation(current).length-1);characterVoice.stop();}
  if(button.hasAttribute('data-event-log')){const log=modal.querySelector('.conversation-log');if(log){log.open=!log.open;button.setAttribute('aria-expanded',String(log.open));}}
  if(button.hasAttribute('data-event-hide')){const hidden=modal.classList.toggle('event-ui-hidden');modal.querySelector('.event-restore').hidden=!hidden;}
  if(button.hasAttribute('data-event-menu')){const menu=modal.querySelector('.event-menu');if(menu){menu.hidden=!menu.hidden;modal.querySelector('.event-toolbar [data-event-menu]').setAttribute('aria-expanded',String(!menu.hidden));}}
  if(button.hasAttribute('data-dialogue-next')&&eventView)advanceConversation();
  if(button.hasAttribute('data-dialogue-back')&&eventView){
    if(eventView.page>0)showEvent(eventView.id,eventView.index,eventView.page-1);
    else showEvent(eventView.id,eventView.index-1);
  }
  if(button.dataset.choice){
    const current=state.events.find(e=>e.id===Number(button.dataset.caseEvent));
    if(eventView?.id===current?.id&&eventView.index===eventConversation(current).length-1){
      const answer=()=>{
      const result=state.actOne?(state.actOne.chapter===2?answerActTwo(state,button.dataset.caseEvent,button.dataset.choice):answerActOne(state,button.dataset.caseEvent,button.dataset.choice)):resolveManagementCase(state,button.dataset.caseEvent,button.dataset.choice,addEvent);
      if(result){save();updateUI();showEvent(result.id);}
    };
      cleanupChoiceUI.confirm?.(button,answer);
    }
  }
  if(button.hasAttribute('data-show-candidates'))showCandidates();
  if(button.dataset.admit){if(admit(state,button.dataset.admit)){closeModal();profileKey=null;updateRooms();updateUI();save();toast(`${CHARACTERS[button.dataset.admit].name}が入居しました。`);}}
  if(button.dataset.speed){speed=Number(button.dataset.speed);document.querySelectorAll('[data-speed]').forEach(b=>{b.classList.toggle('active',Number(b.dataset.speed)===speed);b.setAttribute('aria-pressed',String(Number(b.dataset.speed)===speed));});updateUI();}
  if(button.dataset.filter){filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b.dataset.filter===filter);b.setAttribute('aria-pressed',String(b.dataset.filter===filter));});updateJournal();}
  if(button.hasAttribute('data-restart'))restart();
  if(button.id==='empty-arrival')showCandidates();
});
// Native details controls also update the toolbar accessibility state.
modal.addEventListener('toggle',e=>{
  if(e.target.matches('.conversation-log'))modal.querySelector('[data-event-log]')?.setAttribute('aria-expanded',String(e.target.open));
},true);
function advanceConversation(){
  if(!modal.open||!modal.classList.contains('conversation-modal')||!eventView)return false;
  if(modal.classList.contains('event-ui-hidden')||modal.querySelector('.conversation-log[open]')||!modal.querySelector('.event-menu')?.hidden)return false;
  const current=state.events.find(x=>x.id===eventView.id);
  if(!current)return false;
  if(current.duel&&cleanupDuelPlayback.canAdvance?.()===false)return false;
  const pages=messagePages(eventConversation(current)[eventView.index].text);
  if(eventView.page<pages.length-1){showEvent(eventView.id,eventView.index,eventView.page+1);return true;}
  if(eventView.index<eventConversation(current).length-1){showEvent(eventView.id,eventView.index+1);return true;}
  // A final line uses the same action as the visible next button. Choices stay manual.
  const waiting=state.actOne?state.actOne.pending?.eventId===current.id:state.management.pending?.eventId===current.id;
  if(waiting)return false;
  const forward=modal.querySelector('.modal-footer .primary-button');
  if(!forward||forward.disabled)return false;
  forward.click();return true;
}
modal.addEventListener('click',e=>{
  if(e.target.closest('button,a,input,summary,textarea,select,[contenteditable],.decision-panel,.graphic-choice,.event-toolbar,.event-menu,.conversation-log,.modal-footer'))return;
  if(e.target.closest('.stage-bubble,.memory-whiteout')){
    advanceConversation();
    return;
  }
  // On phones, the open middle of the scene is an easier one-handed tap target.
  // Never bypass a choice screen or the existing explicit controls.
  if(window.matchMedia('(max-width:700px) and (pointer:coarse)').matches
    &&!modal.classList.contains('choice-mode')
    &&e.target.closest('.event-stage:not(.memory-whiteout)'))advanceConversation();
});
document.addEventListener('keydown',e=>{
  if(e.repeat||e.altKey||e.ctrlKey||e.metaKey||!['Enter','Space'].includes(e.code)||document.activeElement?.closest('button, summary, input, textarea, select, a, [contenteditable]'))return;
  if(advanceConversation())e.preventDefault();
});
const observationOptions=document.createElement('div');
observationOptions.id='observation-options';
observationOptions.className='observation-options';
document.querySelector('.observation').append(observationOptions);
observationOptions.append(document.querySelector('.header-right'),document.querySelector('.speed-group'),$('sound-button'));
const setObservationMenu=open=>{
  document.body.classList.toggle('controls-expanded',open);
  $('camera-toggle').setAttribute('aria-expanded',String(open));
  $('camera-toggle').textContent=open?'× CLOSE':'☰ MENU';
  [$('camera-controls'),$('room-strip'),observationOptions].forEach(panel=>{panel.inert=!open;});
};
setObservationMenu(false);
$('camera-toggle').onclick=()=>setObservationMenu(!document.body.classList.contains('controls-expanded'));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('controls-expanded')){setObservationMenu(false);$('camera-toggle').focus();}});
$('help-button').onclick=showHelp;
$('scene-notice').onclick=showCandidates;
$('history-button').onclick=showHistory;
$('management-button').onclick=showManagement;
$('request-notice').onclick=()=>{const p=state.actOne?state.actOne.pending:state.management.pending;if(p)showEvent(p.eventId);};
$('follow-button').onclick=()=>{autoFollow=!autoFollow;updateCamera();updateUI();};
$('inspector-button').onclick=()=>setInspector(!document.body.classList.contains('inspector-open'));
$('inspector-close').onclick=()=>setInspector(false);
$('fullscreen-button').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('ブラウザのF11キーでも全画面にできます。');}};
document.addEventListener('fullscreenchange',()=>{const active=!!document.fullscreenElement;$('fullscreen-button').setAttribute('aria-label',active?'全画面を終了':'全画面表示');$('fullscreen-button').setAttribute('aria-pressed',String(active));});
$('new-game').onclick=()=>openModal(header('NEW OBSERVATION / はじめから','新しい観察記を始めますか？')+'<div class="modal-body"><p class="modal-copy">今の住人と観察記録はリセットされます。101号室の猫から、別の共同生活を始めましょう。</p></div><div class="modal-footer"><button class="secondary-button" data-close>今の暮らしに戻る</button><button class="primary-button" data-restart>はじめから →</button></div>');
document.addEventListener('keydown',e=>{if(e.code==='Escape'&&!modal.open&&document.body.classList.contains('inspector-open'))setInspector(false);if(e.code==='Space'&&!modal.open&&!['BUTTON','INPUT','TEXTAREA','SELECT','A'].includes(document.activeElement.tagName)){e.preventDefault();paused=!paused;updateUI();}});
window.addEventListener('pagehide',save);
document.addEventListener('visibilitychange',()=>{lastTime=performance.now();if(document.hidden)save();characterVoice.setSuspended(document.hidden);syncNormalBgm();});

const normalBgm=createNormalBgm();
function paintSoundButton(){$('sound-button').setAttribute('aria-pressed',String(normalBgm.enabled));$('sound-button').innerHTML=normalBgm.label();}
function syncNormalBgm(){
  const morningStage=modal.open?modal.querySelector('.act-two-morning-stage'):null;
  const morningQuiet=modal.open&&(!!modal.querySelector('.act-two-morning-blackout')||morningStage?.dataset.quiet==='true');
  const firstFireStage=modal.open?modal.querySelector('.first-fire-stage'):null;
  const firstStalkerScene=modal.open&&!!modal.querySelector('.first-stalker-stage');
  const firstStalkerUneasy=firstStalkerScene&&state.actOne?.chapter===2&&state.actOne?.attempt===1;
  const stalkerSilent=firstStalkerScene&&!firstStalkerUneasy;
  const firstActMemorySilence=state.actOne?.chapter!==2&&modal.open&&!!modal.querySelector('.event-stage.memory-whiteout');
  const firstFireDanger=firstFireStage&&!['trust','departure','collapse','plea','silence'].includes(firstFireStage.dataset.cut);
  const rewind=modal.querySelector('.rewind-screen');
  const clock=modal.open&&!!rewind&&(rewind.dataset.rewindPhase==='clock'||rewind.dataset.rewindPhase==='return');
  const bad=!clock&&modal.open&&!modal.querySelector('.act-title')&&(firstFireDanger||!!modal.querySelector('.fire-cinematic,.debt-cinematic,.act-burn,.rewind-screen,.duel-bad'));
  const title=!bad&&!clock&&modal.open&&!!modal.querySelector('.game-title,.title-help');
  const activeDialogue=modal.open&&modal.classList.contains('conversation-modal')?state.events.find(e=>e.id===eventView?.id):null;
  const victory=!bad&&!clock&&!title&&modal.open&&!!modal.querySelector('.trouble-victory,.act-one-complete');
  const trouble=!victory&&!bad&&!clock&&!title&&modal.open&&(!!modal.querySelector('.trouble-card')||activeDialogue?.actScene==='reply');
  const lunaFilm=modal.open?modal.querySelector('[data-act2-opening]'):null;
  // Quiet film cuts reduce Foley only; keep the uneasy BGM continuous.
  const filmPaused=!!lunaFilm&&lunaFilm.dataset.paused==='true';
  const firstRewindUneasy=lunaFilm||!bad&&!clock&&!title&&!victory&&!trouble&&['rewind','act2-rewind'].includes(activeDialogue?.actScene)&&state.actOne?.attempt===2&&state.actOne?.rewindIntroPending;
  // Use Moku's theme only when her portrait is actually visible in the dialogue.
  // Trouble stings always take precedence over character themes.
  const mokuVisible=!!activeDialogue&&!!modal.querySelector('.event-stage .stage-character[data-character="cat"]');
  return normalBgm.setScene(document.hidden||!!modal.querySelector('.first-stalker-preface')||morningQuiet||filmPaused||stalkerSilent||firstActMemorySilence||!!firstFireStage&&['departure','collapse','plea','silence'].includes(firstFireStage.dataset.cut), clock?'clock':bad?'bad':title?'title':victory?'victory':morningStage&&['days','months'].includes(morningStage.dataset.cut)?'uneasy':firstStalkerUneasy?'uneasy':trouble?'trouble':firstRewindUneasy?'uneasy':mokuVisible?'moku':bedCue(state?.actOne));
}
modal.addEventListener('luna-film-phase',()=>{syncNormalBgm();});
modal.addEventListener('rewind-phase',()=>{syncNormalBgm();});
modal.addEventListener('rewind-fade',()=>{rewindWhiteoutPending=true;normalBgm.setSuppressed(true);});
function unlockNormalBgm(event){
  // The START button owns the first gesture. Unlocking on its pointerdown
  // would briefly play the default room track before the title cue is selected.
  if(document.getElementById('entry-gate') || event.target.closest?.('#sound-button'))return;
  normalBgm.unlock().catch(()=>{});
}
document.addEventListener('pointerdown',unlockNormalBgm,true);
document.addEventListener('keydown',unlockNormalBgm,true);
$('sound-button').onclick=async()=>{
  try{await normalBgm.setEnabled(!normalBgm.enabled);paintSoundButton();}
  catch{toast('このブラウザではBGMを再生できません。');}
};
paintSoundButton();
const worldRenderGate = new WorldRenderGate();
let lastResolutionCheck=-Infinity;
let lateNightWarp = null;
function nightMontageCaption(hour){
  return hour<27?'00:30　「あと一本だけ見るニャ。」':hour<30?'03:00　「……これ、続きが気になるニャ。」':hour<34?'06:00　「……もう朝かニャ？ まあいいニャ。」':'12:30　「……あれ、もう昼ニャ……？」';
}
function removeNightMontage(){document.querySelector('#night-montage-caption')?.remove();document.body.classList.remove('late-night-warp');}

function frame(now){
  const seconds=Math.min(.25,Math.max(0,(now-lastTime)/1000));lastTime=now;
  // Restored endings must wait for START and the title's Continue action.
  if(document.hidden||document.documentElement.classList.contains('game-booting')||document.querySelector('#entry-gate:not([hidden])')){renderer.last=now;requestAnimationFrame(frame);return;}
  if(now-lastResolutionCheck>500){lastResolutionCheck=now;if(renderer.resizeToDisplay())worldRenderGate.state=null;}
  const stopped=document.documentElement.classList.contains('game-booting')||paused||modal.open||!!state.ending||!!document.querySelector('#entry-gate:not([hidden])');
  const observationStopped=stopped||document.body.classList.contains('controls-expanded');
  tickObservation(state,seconds,{stopped:observationStopped,voiceBusy:characterVoice.busy});
  if(!observationStopped&&!talk.chapterChat){
    const firstNight=state.actOne?.chapter!==2&&state.actOne?.completed?.includes('ash')&&!state.actOne?.completed?.includes('dinner')&&!state.actOne?.pending&&state.hour>=24.1&&state.hour<36.65;
    if(!lateNightWarp&&firstNight&&observationView(state)?.beat==null&&state.actOne?.observation?.done?.includes('tv-late')&&!state.actOne?.observation?.done?.includes('before-dinner')){
      lateNightWarp={rate:(36.65-state.hour)/11,tail:0};document.body.classList.add('late-night-warp');
      const caption=document.createElement('div');caption.id='night-montage-caption';caption.className='night-montage-caption';document.body.append(caption);
    }
    if(lateNightWarp){
      if(state.hour<36.65){advanceActOne(state,Math.min(36.65-state.hour,seconds*lateNightWarp.rate));const caption=document.querySelector('#night-montage-caption');if(caption)caption.textContent=nightMontageCaption(state.hour);}
      else {lateNightWarp.tail+=seconds;if(lateNightWarp.tail>=1.1){lateNightWarp=null;removeNightMontage();}}
    }else if(state.actOne)(state.actOne.chapter===2?advanceActTwo(state,Math.min(seconds*speed/10,Math.max(0,observationClockLimit(state)-state.hour))):advanceActOne(state,Math.min(seconds*speed/10,Math.max(0,observationClockLimit(state)-state.hour))));else advance(state,seconds*speed/10);
  }
  tickObservation(state,0,{stopped:observationStopped,voiceBusy:characterVoice.busy});
  queueFreshStageEvents();
  stepTalk(talk, state, now, observationStopped);
  updateCamera();
  if(!modal.open){const spoken=talk.bubbles[0];if(spoken)characterVoice.play(spoken,'bubble:'+JSON.stringify([spoken.speaker,spoken.text,talk.mutterShownAt,talk.eventId,talk.index]));else characterVoice.stop();}
  const bubbles=document.body.classList.contains('conversation-active')?[]:talk.bubbles;
  const drawWorld=worldRenderGate.shouldDraw(state,now,observationStopped,cameraKey,bubbles);
  if(drawWorld)renderer.draw(state,now,observationStopped,bubbles);
  else renderer.last=now;
  const portraitFollow=matchMedia('(max-width:700px) and (orientation:portrait)').matches && renderer.view==='interior' && renderer.focus && Number.isFinite(renderer.followCharacterX);
  const scene=$('scene'), canvas=$('world');
  if(portraitFollow){
    const width=canvas.offsetWidth,viewport=scene.clientWidth,maxShift=Math.max(0,(width-viewport)/2);
    const target=Math.max(-maxShift,Math.min(maxShift,(600-renderer.followCharacterX)*width/1200));
    const previous=Number(scene.dataset.followShift||0);
    const shift=previous+(target-previous)*Math.min(1,Math.max(.12,seconds*9));
    scene.dataset.followShift=String(shift);
    scene.style.setProperty('--follow-shift',shift+'px');
  }else if(scene.dataset.followShift){delete scene.dataset.followShift;scene.style.removeProperty('--follow-shift');}
  if(now-lastUI>300&&(!stopped||drawWorld)){updateUI();lastUI=now;}
  if(now-lastSave>5000){save();lastSave=now;}
  if(state.ending&&!endingShown&&(!state.actOne||!modal.open)){showEnding();save();}
  else if(!lateNightWarp)openNextStageEvent();
  requestAnimationFrame(frame);
}
syncStageCursor();
updateCamera();updateRooms();updateUI();updateJournal();save();requestAnimationFrame(frame);
if(restored)toast('前回の観察記の続きから。住人たちは、ここで待っていました。');
async function finishBoot(){

paintBootProgress(100,'準備完了');
// Two animation frames allow the 100% state to paint before the exit transition.
await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));

$('boot-screen')?.classList.add('boot-exit');
await new Promise(resolve=>setTimeout(resolve,matchMedia('(prefers-reduced-motion: reduce)').matches?0:250));
document.documentElement.classList.remove('game-booting');
document.getElementById('boot-screen')?.remove();
window.kemonoBoot?.destroy();
const entryGate=$('entry-gate');
if(entryGate && !previewType){
  // Show the audio-unlock gate BEFORE opening the modal title screen.
  // A modal dialog lives in the browser's top layer, above ordinary overlays.
  entryGate.hidden=false;
  entryGate.querySelector('#entry-start').addEventListener('click',()=>{
    // Open the title and unlock its soundtrack in the same trusted click.
    entryGate.remove();
    if(new URLSearchParams(location.search).get('bootdiag')!=='1')document.getElementById('boot-diagnostics')?.remove();
    startWorldArt();
    if(state.actOne)showGameTitle();
    normalBgm.unlock().catch(()=>{});
  },{once:true});
}else{
  entryGate?.remove();
  startWorldArt();
  if(actTwoOpeningPreview)showActTwoOpening();
  else if(firstStalkerPreview||firstFirePreview){const reply=state.events.find(e=>e.actScene==='reply');showEvent(reply.id,Number(new URLSearchParams(location.search).get('line')||0));}
  else if(firstRewindPreview)showActEnding();
  else if(state.actOne&&!actTwoPreview&&!observationPreview&&!managerPreview)showGameTitle();
}


}
finishBoot();

document.addEventListener('input',event=>{if(event.target.matches('[data-voice-volume]'))characterVoice.setVolume(event.target.value);if(event.target.matches('[data-bgm-volume]'))normalBgm.setVolume(event.target.value);});

// Published update check. Inform the player instead of forcing an unsafe reload.
const currentBuild=document.querySelector('meta[name="app-version"]')?.content;
async function checkPublishedBuild(){
  if(!currentBuild)return;
  try{
    const url=new URL('index.html',location.href);
    url.searchParams.set('build-check',String(Date.now()));
    const response=await fetch(url,{cache:'no-store'});
    if(!response.ok)return;
    const html=await response.text();
    const published=html.match(/<meta name="app-version" content="([^"]+)"/)?.[1];
    if(published&&published!==currentBuild){const banner=document.getElementById('update-banner');if(banner)banner.hidden=false;}
  }catch{}
}
document.getElementById('update-reload')?.addEventListener('click',()=>location.reload());
setInterval(checkPublishedBuild,90000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkPublishedBuild();});

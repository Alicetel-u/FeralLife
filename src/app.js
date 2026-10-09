import { createGame, advance, admit, ROOMS, CHARACTERS, NEEDS, ACTIONS, dateAt, formatTime, atmosphere, validateSave } from './simulation.js';
import { createTalk, stepTalk } from './dialogue.js';
import { WorldRenderer, roomBounds, drawPortrait } from './renderer.js';
import { loadCharacterArt, loadRoomArt } from './character-art.js';
import { sampleJourney, motionLabel } from './movement.js';

await loadCharacterArt();
await loadRoomArt();

const $ = id => document.getElementById(id);
const escape = text => String(text ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const yen = n => '¥' + Math.round(n).toLocaleString('ja-JP');
const STORAGE = 'feral-apartments-v1';
const previewType = new URLSearchParams(location.search).get('preview');
const previewResident = ['hostess', 'fox', 'sister', 'peko', 'ann'].includes(previewType) ? previewType : null;
let state, restored = false;
try { const saved = previewResident ? null : JSON.parse(localStorage.getItem(STORAGE)); if (validateSave(saved)) { state = saved; restored = true; } } catch {}
state ||= createGame();
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
let speed = 1, paused = !!previewResident, filter = 'all', profileKey = null, lastUI = 0, lastSave = 0, lastTime = performance.now(), lastEventId = 0, endingShown = false, toastTimer;
const renderer = new WorldRenderer($('world'));
const talk = createTalk(restored ? (state.events[0]?.id || 0) : 0);
const modal = $('modal');
let autoFollow = true, cameraKey = '';

function updateCamera() {
  const r = state.residents.find(r => r.room === state.selected);
  const p = r ? sampleJourney(r,state.hour,ACTIONS[r.action].place) : null;
  if (autoFollow) { renderer.view = p && p.zone !== 'room' ? 'exterior' : 'interior'; renderer.focus = true; }
  renderer.focusRoom = renderer.focus ? (p?.zone === 'room' ? p.room : state.selected) : null;
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
function eventHTML(e) { return `<button class="event-row" data-event="${e.id}"><span class="event-time">${escape(formatTime(e.hour))}</span><span class="event-tag ${e.kind}">${kindNames[e.kind]}</span><span class="event-text">${escape(e.title)}</span>${!e.read?'<span class="event-new">NEW</span>':''}<span class="event-arrow">↗</span></button>`; }
function updateJournal() {
  const events = state.events.filter(e => filter === 'all' || e.kind === filter).slice(0,5);
  $('event-list').innerHTML = events.length ? events.map(eventHTML).join('') : '<div class="event-row"><span class="event-text" style="color:#999787">今のところ、トラブルはありません。静かなうちに眺めておこう。</span></div>';
  $('unread-count').textContent = state.events.filter(e => !e.read).length;
}
function updateUI() {
  const d = dateAt(state.hour), clock = `${String(d.hour).padStart(2,'0')}:${String(d.minute).padStart(2,'0')}`;
  $('day-clock').innerHTML = `${d.day}日目 <span>${clock}</span>`;
  const timeLabel = d.hour >= 20 || d.hour < 5 ? '夜更け' : d.hour < 10 ? '朝' : d.hour < 16 ? '昼下がり' : '夕暮れ';
  $('time-label').textContent = `${timeLabel} · ${state.ending ? '観察終了' : 'けもの荘'}`;
  $('weather-icon').textContent = d.hour >= 19 || d.hour < 6 ? '☾' : '☀';
  $('scene-day').textContent = `DAY ${String(d.day).padStart(2,'0')}`;
  $('occupancy').innerHTML = `${state.residents.length} <span>/ 6室</span>`;
  $('rent').textContent = yen(state.rent);
  $('atmosphere').textContent = atmosphere(state);
  $('next-arrival').innerHTML = state.ending ? '観察終了' : state.residents.length === 6 ? '満室御礼' : state.pending ? '<span style="color:#a5533b">申込書が届いています</span>' : `${dateAt(state.nextArrival).day}日目 <span>09:00</span>`;
  $('scene-notice').hidden = !state.pending || !!state.ending;
  const stopped = paused || modal.open || !!state.ending;
  $('pause-button').textContent = stopped ? '▶' : 'Ⅱ';
  $('pause-button').setAttribute('aria-label', stopped ? '再生' : '一時停止');
  $('pause-button').setAttribute('aria-pressed', String(paused));
  $('pause-button').disabled = !!state.ending;
  $('playback-state').textContent = state.ending ? '18日間の観察が終わりました' : modal.open ? 'ノートを読んでいる間は一時停止' : paused ? '時間を止めて眺めています' : speed > 1 ? `${speed}倍の速さで暮らしが進みます` : '時間はゆっくり進んでいます';
  const r = state.residents.find(r => r.room === state.selected);
  const line = talk.bubbles[0];
  $('scene-caption').textContent = state.ending ? 'ろくでもない灯りが、今日もここに。' : r ? `${r.room}号室 · ${CHARACTERS[r.type].name.split(' ')[1]} / ${motionLabel(r,state.hour,ACTIONS[r.action].label)}` : `${state.selected}号室 · 次の住人を待っている。`;
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
function openModal(html) { $('modal-content').innerHTML = html; if (!modal.open) modal.showModal(); updateUI(); }
function closeModal() { modal.close(); updateUI(); }
modal.addEventListener('close', () => { lastTime = performance.now(); updateUI(); });
function showEvent(id) {
  const e = state.events.find(e => e.id === Number(id)); if (!e) return;
  e.read = true; save(); updateJournal();
  if (state.ending && e.id === state.events[0].id) { showEnding(); return; }
  openModal(header('OBSERVATION NOTE / 観察記録',escape(e.title)) + `<div class="modal-body"><span class="event-tag ${e.kind} event-detail-tag">${kindNames[e.kind]}</span><p class="event-detail">${escape(e.detail)}</p>${e.impact?`<div class="event-impact">${escape(e.impact)}</div>`:''}<div class="event-detail-meta"><span>${escape(formatTime(e.hour))}</span><span>${e.rooms.map(r=>r+'号室').join(' / ') || 'けもの荘・掲示板'}</span></div></div><div class="modal-footer"><span>記録を読んでいる間、時間は止まっています。</span>${state.pending && e.kind === 'arrival' && !e.rooms.length ? '<button class="primary-button" data-show-candidates>申込書を見る →</button>' : '<button class="primary-button" data-close>観察に戻る →</button>'}</div>`);
}
function showCandidates() {
  if (!state.pending || state.ending) return;
  openModal(header('NEW NEIGHBORS / 入居申込書','空いている部屋に、誰を迎える？')+`<div class="modal-body"><p class="modal-copy">${state.pending.length === 1 ? '最後の入居候補です。' : '次の住人は、どちらか一人。暮らしの組み合わせが、けもの荘の未来を変えます。'}</p><div class="candidate-grid">${state.pending.map(type=>{
    const c=CHARACTERS[type];return `<article class="candidate-card"><div class="portrait-frame"><canvas data-portrait="${type}" aria-label="${escape(c.species)}獣人の肖像"></canvas></div><h3>${escape(c.name)}</h3><div class="candidate-sub">${escape(c.species)}獣人 · ${c.age}歳 / ${escape(c.job)}</div><div class="traits">${c.traits.map(t=>`<span class="trait">${escape(t)}</span>`).join('')}</div><p>${escape(c.bio)}</p><div class="candidate-warning">⚑ ${escape(c.warning)}</div><button class="primary-button" data-admit="${type}">この住人を迎える →</button></article>`;
  }).join('')}</div></div><div class="modal-footer"><span>一度迎えた住人は、追い出せません。</span><button class="text-button" data-close>もう少し考える</button></div>`);
  document.querySelectorAll('[data-portrait]').forEach(c=>drawPortrait(c,c.dataset.portrait));
}
function showHistory() {
  openModal(header('APARTMENT ARCHIVE / 観察日誌','ろくでもない、日々の記録')+`<div class="modal-body"><p class="modal-copy">${state.events.length}件の記録。新しい出来事から順に並んでいます。（最新240件を保存）</p><div class="history-list">${state.events.map(eventHTML).join('')}</div></div><div class="modal-footer"><span>気になる出来事を選ぶと、詳細を読めます。</span><button class="primary-button" data-close>観察に戻る →</button></div>`);
}
function showHelp() {
  openModal(header('HOW TO OBSERVE / 管理人の心得','あなたは、ただ眺めていればいい。')+`<div class="modal-body"><p class="modal-copy">住人は欲求と性格に従って、自分で暮らします。生活に口を出さず、ちょっと困った隣人たちの毎日を見守りましょう。</p><div class="help-grid"><div class="help-step"><strong><span>01</span>暮らしを眺める</strong>最初は猫の部屋を大きく表示。「全体を見る」で6部屋を一覧できます。下の部屋一覧で住人を選び、「住人ノート」で欲求や所持金を確認。衛生状態だけは、数値が高いほど良好です。</div><div class="help-step"><strong><span>02</span>記録を読む</strong>「日誌」から出来事の背景や影響を確認できます。詳細や申込書を読んでいる間は、時間が止まります。</div><div class="help-step"><strong><span>03</span>次の住人を選ぶ</strong>3日目の9時から、原則3日ごとに2人の入居希望者が現れます。封筒から申込書を開き、一人を空室に迎えましょう。</div><div class="help-step"><strong><span>04</span>アパートの結末を見届ける</strong>18日目の9時に、借金・ゴミ・関係から結末が決まります。組み合わせを変えて、別の観察記を始められます。</div></div><p class="modal-copy" style="margin-top:18px;margin-bottom:0">「住人を追う」をONにすると、選んだ住人が部屋を出たとき外観へ、帰宅すると内装へ自動で切り替わります。手動の内装／外観・大きさ切り替えは追跡をOFFにします。⛶で全画面表示。通常速度では10秒＝ゲーム内1時間。3×・6×で進行を速められます。ブラウザを閉じたり、別のタブを表示している間は進行しません。データはこのブラウザに自動保存されます。</p></div><div class="modal-footer"><span>Space：一時停止 / Esc：ノートを閉じる</span><button class="primary-button" data-close>けもの荘を眺める →</button></div>`);
}
function showEnding() {
  if (!state.ending) return;
  endingShown=true;
  const debt=state.residents.reduce((s,r)=>s+r.debt,0);
  openModal(header('THE END / けもの荘・観察記','18日間、見守ってくれてありがとう。')+`<div class="modal-body"><div class="ending-title">「${escape(state.ending.name)}」</div><p class="event-detail" style="text-align:center">${escape(state.ending.text)}</p><div class="ending-stats"><div>暮らした住人<strong>${state.residents.length}人</strong></div><div>受け取った家賃<strong>${yen(state.rent)}</strong></div><div>残った借金<strong>${yen(debt)}</strong></div></div></div><div class="modal-footer"><button class="text-button" data-close>最後のけもの荘を眺める</button><button class="primary-button" data-restart>別の観察記を始める →</button></div>`);
}
function restart() {
  state=createGame();Object.assign(talk, createTalk(0));profileKey=null;lastEventId=0;endingShown=false;paused=false;autoFollow=true;renderer.reset();updateCamera();closeModal();updateRooms();updateUI();save();toast('新しい観察記が始まりました。101号室には、いつもの猫。');
}
document.addEventListener('click',e=>{
  const button=e.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-close')) closeModal();
  if(button.dataset.room){state.selected=Number(button.dataset.room);updateCamera();updateRooms();updateProfile();updateUI();save();}
  if(button.dataset.view){autoFollow=false;renderer.view=button.dataset.view;updateCamera();updateUI();}
  if(button.dataset.camera){autoFollow=false;renderer.focus=button.dataset.camera==='focus';updateCamera();updateUI();}
  if(button.dataset.event)showEvent(button.dataset.event);
  if(button.hasAttribute('data-show-candidates'))showCandidates();
  if(button.dataset.admit){if(admit(state,button.dataset.admit)){closeModal();profileKey=null;updateRooms();updateUI();save();toast(`${CHARACTERS[button.dataset.admit].name}が入居しました。`);}}
  if(button.dataset.speed){speed=Number(button.dataset.speed);document.querySelectorAll('[data-speed]').forEach(b=>{b.classList.toggle('active',Number(b.dataset.speed)===speed);b.setAttribute('aria-pressed',String(Number(b.dataset.speed)===speed));});updateUI();}
  if(button.dataset.filter){filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b.dataset.filter===filter);b.setAttribute('aria-pressed',String(b.dataset.filter===filter));});updateJournal();}
  if(button.hasAttribute('data-restart'))restart();
  if(button.id==='empty-arrival')showCandidates();
});
$('pause-button').onclick=()=>{paused=!paused;updateUI();};
$('help-button').onclick=showHelp;
$('scene-notice').onclick=showCandidates;
$('history-button').onclick=showHistory;
$('follow-button').onclick=()=>{autoFollow=!autoFollow;updateCamera();updateUI();};
$('inspector-button').onclick=()=>setInspector(!document.body.classList.contains('inspector-open'));
$('inspector-close').onclick=()=>setInspector(false);
$('fullscreen-button').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('ブラウザのF11キーでも全画面にできます。');}};
document.addEventListener('fullscreenchange',()=>{const active=!!document.fullscreenElement;$('fullscreen-button').setAttribute('aria-label',active?'全画面を終了':'全画面表示');$('fullscreen-button').setAttribute('aria-pressed',String(active));});
$('new-game').onclick=()=>openModal(header('NEW OBSERVATION / はじめから','新しい観察記を始めますか？')+'<div class="modal-body"><p class="modal-copy">今の住人と観察記録はリセットされます。101号室の猫から、別の共同生活を始めましょう。</p></div><div class="modal-footer"><button class="secondary-button" data-close>今の暮らしに戻る</button><button class="primary-button" data-restart>はじめから →</button></div>');
document.addEventListener('keydown',e=>{if(e.code==='Escape'&&!modal.open&&document.body.classList.contains('inspector-open'))setInspector(false);if(e.code==='Space'&&!modal.open&&!['BUTTON','INPUT','TEXTAREA','SELECT','A'].includes(document.activeElement.tagName)){e.preventDefault();paused=!paused;updateUI();}});
window.addEventListener('pagehide',save);
document.addEventListener('visibilitychange',()=>{lastTime=performance.now();if(document.hidden)save();});

let audio=null;
$('sound-button').onclick=async()=>{
  if(audio){await audio.close();audio=null;$('sound-button').setAttribute('aria-pressed','false');$('sound-button').innerHTML='♫ <span>環境音 OFF</span>';return;}
  try {
    audio=new (window.AudioContext||window.webkitAudioContext)();
    const buffer=audio.createBuffer(1,audio.sampleRate*4,audio.sampleRate),data=buffer.getChannelData(0);let previous=0;
    for(let i=0;i<data.length;i++){previous=(previous+Math.random()*.04-.02)*.985;data[i]=previous;}
    const source=audio.createBufferSource(),gain=audio.createGain(),low=audio.createBiquadFilter();source.buffer=buffer;source.loop=true;low.type='lowpass';low.frequency.value=450;gain.gain.value=.16;source.connect(low);low.connect(gain);gain.connect(audio.destination);source.start();
    for(const hz of [110,164.81]){const osc=audio.createOscillator(),volume=audio.createGain();osc.type='sine';osc.frequency.value=hz;volume.gain.value=.003;osc.connect(volume);volume.connect(audio.destination);osc.start();}
    await audio.resume();$('sound-button').setAttribute('aria-pressed','true');$('sound-button').innerHTML='♫ <span>環境音 ON</span>';
  }catch{audio=null;toast('このブラウザでは環境音を再生できません。');}
};
function frame(now){
  const seconds=Math.min(.25,Math.max(0,(now-lastTime)/1000));lastTime=now;
  const stopped=paused||modal.open||document.hidden||!!state.ending;
  if(!stopped)advance(state,seconds*speed/10);
  stepTalk(talk, state, now, stopped);
  updateCamera();
  renderer.draw(state,now,stopped,talk.bubbles);
  if(now-lastUI>300){updateUI();lastUI=now;}
  if(now-lastSave>5000){save();lastSave=now;}
  if(state.ending&&!endingShown){showEnding();save();}
  requestAnimationFrame(frame);
}
updateCamera();updateRooms();updateUI();updateJournal();save();requestAnimationFrame(frame);
if(restored)toast('前回の観察記の続きから。住人たちは、ここで待っていました。');

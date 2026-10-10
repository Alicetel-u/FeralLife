import { OUTINGS, createOuting, createVisit, createRoomMove, sampleJourney, validJourney } from './movement.js';
import { OPENING_LINES, catIncident, catDoorIncident, catOutingLines, catRentLines, catRentScene } from './dialogue.js';
import { ensureManagement, tickManagement, managementEnding, validManagement } from './management.js';

export const ROOMS = [101, 102, 103, 201, 202, 203];
export const NEEDS = [['hunger', '空腹'], ['sleep', '眠気'], ['stress', 'ストレス'], ['hygiene', '衛生状態'], ['fun', '娯楽欲求'], ['alcohol', '飲酒欲求'], ['smoke', '喫煙欲求']];
export const ACTIONS = {
  idle: { label: 'ぼんやりしている', icon: '…', place: 'table' },
  eat: { label: '冷蔵庫を物色中', icon: '♧', place: 'fridge' },
  sleep: { label: '夢の中に逃避中', icon: '☾', place: 'bed' },
  smoke: { label: 'タバコで一服中', icon: '≈', place: 'window' },
  drink: { label: '今日もひとり酒', icon: '♧', place: 'table' },
  tv: { label: 'テレビとにらめっこ', icon: '▣', place: 'tv' },
  clean: { label: '珍しく片づけ中', icon: '✦', place: 'center' },
  shop: { label: '通販のカートが満杯', icon: '▤', place: 'table' },
  sell: { label: '「絶対お得」を布教中', icon: '◇', place: 'hall' },
  stream: { label: '大声で生配信中', icon: '▣', place: 'tv' },
  steal: { label: 'おすそ分けを自主回収', icon: '♧', place: 'hall' },
  collect: { label: '拾い物を仕分け中', icon: '▤', place: 'center' },
  gamble: { label: '一発逆転を夢見てる', icon: '♤', place: 'table' },
  chat: { label: '廊下で立ち話', icon: '♡', place: 'hall' },
  counsel: { label: '廊下で無料お悩み相談', icon: '♡', place: 'hall' },
  checkBrother: { label: '兄の生存確認中', icon: '♡', place: 'hall' },
  fight: { label: 'お隣と口論中', icon: '!', place: 'hall' },
  outing: { label: '出かけている', icon: '↗', place: 'table' }
};
export const CHARACTERS = {
  ann: { name: '蜜野 アン', species: '猫', age: 27, job: '在宅の文字起こし', traits: ['愛人暮らし', '口止め上手', '約束待ち'], quote: '「一人暮らしだよ。\n……あの人は、たまに寄るだけ。」', color: '#a17d6d', shirt: '#947583', accent: '#cc9b87', cash: 10000, habit: 'shop', warning: '援助は三日おきの会食頼み。「今度」が多い相手を待つ。', bio: '既婚の会社役員・金満トクゾウ（56歳）の愛人。けもの荘では一人暮らしをしている。「いつか一緒に住もう」の約束より、今月の家賃を信用したい。ときどき二人で喫茶店へ歩いていく。', income: 1000 },
  peko: { name: '空腹 ペコ', species: '猫', age: 23, job: 'パン屋の短時間バイト', traits: ['大食い', '財布は空', '特売ハンター'], quote: '「家賃は来週、必ず。\n……このドーナツは別予算だから。」', color: '#403e52', shirt: '#7188bb', accent: '#4177cb', cash: 300, habit: 'eat', warning: '食費が家賃を追い越す。特売弁当では、すぐにお腹が空く。', bio: '給料日だけ満腹で、翌日には財布が空っぽ。パン屋のまかない目当てに働き、帰り道でドーナツを買う。安い家賃にひかれて来たが、食べる量だけは節約できない。', income: 1800 },
  sister: { name: '灰田 ネム', species: '猫', age: 22, job: '雑貨店のアルバイト', traits: ['地雷系ファッション', '返信待ち', '兄には辛口'], quote: '「別に、お兄ちゃんのために来たんじゃないし。\n……で、今日ごはん食べた？」', color: '#423943', shirt: '#26232c', accent: '#df79a6', cash: 12000, habit: 'checkBrother', warning: '既読がつかないと落ち着かない。推しグッズは「生活必需品」。', bio: 'モクの7歳下の妹。黒とピンクで武装し、兄の「明日から」を一番信用していない。家賃の安さを理由に越してきたが、買い物袋には兄の分のおにぎりも入っている。', income: 2600 },
  hostess: { name: '金城 ルナ', species: '猫', age: 25, job: 'キャバクラ勤務（源氏名ルナ）', traits: ['営業スマイル', '昼は省エネ', '情に弱い'], quote: '「相談は無料。延長も無料。\n……家賃まで無料にはならないか。」', color: '#d3ad83', shirt: '#302832', accent: '#e8bf70', cash: 16000, habit: 'counsel', warning: '夜は出勤、昼は爆睡。ご褒美の買い物で給料が消える。', bio: '店では聞き上手、家では既読をつけるだけで精一杯。独立資金を貯めるはずが「仕事用」のバッグが増える。廊下の相談だけは、つい無料で延長してしまう。', income: 4800 },
  cat: { name: '灰田 モク', species: '猫', age: 29, job: '日雇い（休業中）', traits: ['だらしない', '愛煙家', '無気力'], quote: '「明日からちゃんとするニャ。\n……明日になったら言うけどニャ。」', color: '#929f94', shirt: '#52675e', accent: '#bac1a9', cash: 14000, habit: 'smoke', warning: '掃除も貯金も苦手。タバコだけは切らさない。', bio: 'ずっと101号室にいる、けもの荘の古株。灰皿は満杯、予定は空白。', income: 1500 },
  rabbit: { name: '桃井 ミミ', species: '猫', age: 24, job: 'アパレル店員', traits: ['浪費家', '見栄っ張り', 'ブランド好き'], quote: '「これ？ 安かったの。\n分割にしたら、ほぼ無料だし。」', color: '#e1b0a0', shirt: '#b47582', accent: '#f3d5bc', cash: 18000, habit: 'shop', warning: '通販と分割払い。借金がふくらみやすい。', bio: 'おしゃれな部屋に住みたい。でも家賃は安いほうがいい。段ボールは毎日届く。', income: 4500 },
  fox: { name: '酔田 ホロ', species: '猫', age: 27, job: '無職（飲酒中）', traits: ['酒猫', '缶を捨てない', 'だらしがない'], quote: '「一杯でやめる。\n……この一杯は数えない。」', color: '#8d6a58', shirt: '#2a2a2a', accent: '#e4c2b0', cash: 8000, habit: 'drink', warning: '空き缶が家具になる。夜ほど、廊下まで声が届く。', bio: '床は缶の墓場。一杯でやめると言って、三本目を開ける。', income: 1600 },
  wolf: { name: '夜野 ウル', species: '猫', age: 26, job: '動画配信者', traits: ['昼夜逆転', '騒音主', '承認欲求'], quote: '「みんな聞こえてるー!?\n……隣には聞こえなくていい。」', color: '#8a9eaf', shirt: '#666995', accent: '#c2ced2', cash: 17000, habit: 'stream', warning: '夜中ほど声が大きい。隣人の眠りを奪う。', bio: '視聴者はまだ12人。それでもリアクションの音量は、人気配信者級。', income: 2700 },
  bear: { name: '熊谷 ゴロ', species: '猫', age: 35, job: '配送ドライバー', traits: ['大食漢', '食いしん坊', '悪気なし'], quote: '「名前、書いてなかったよ？\n……書いてあっても読めなかった。」', color: '#997354', shirt: '#a0915c', accent: '#d8b384', cash: 21000, habit: 'steal', warning: '他人の冷蔵庫も食料庫。食費と揉め事が増える。', bio: '体も胃袋も大きい、気のいい住人。「ひとくち」がひと皿になる。', income: 4200 },
  mouse: { name: '根津 チリ', species: '猫', age: 27, job: 'リサイクル店員', traits: ['ゴミ収集家', '捨てられない', 'マイペース'], quote: '「ゴミじゃないよ、資源だよ。\n使い道は、あとで考える。」', color: '#ac9b96', shirt: '#7c8662', accent: '#d8c2aa', cash: 10000, habit: 'collect', warning: '拾い物で部屋が埋まる。共用廊下にも進出する。', bio: '街のゴミ置き場は宝の山。いつか使う「いつか」が、まだ来ない。', income: 2000 },
  tanuki: { name: '八代 ポン', species: '猫', age: 31, job: 'フリーター', traits: ['ギャンブラー', '楽天家', '借金体質'], quote: '「負けじゃない、投資。\n次の一回でぜんぶ返せるから。」', color: '#a08a6b', shirt: '#8c6c4e', accent: '#d4bb94', cash: 16000, habit: 'gamble', warning: '大勝ちも大負けも。家賃より勝負を優先する。', bio: 'ここへ越してきた理由は「運気を変えるため」。住所より先に財布が変わる。', income: 2800 }
};

const clamp = (n, low = 0, high = 100) => Math.max(low, Math.min(high, n));
export function dateAt(hour) { return { day: Math.floor(hour / 24) + 1, hour: Math.floor(hour % 24), minute: Math.floor((hour % 1) * 60) }; }
export function formatTime(hour) { const d = dateAt(hour); return `${d.day}日目 ${String(d.hour).padStart(2, '0')}:${String(d.minute).padStart(2, '0')}`; }
export function createGame(seed = Date.now()) {
  const state = { version: 1, hour: 17, seed: (seed >>> 0) || 1, residents: [], events: [], nextId: 1, remaining: ['hostess', 'fox', 'sister', 'peko', 'ann'], pending: null, nextArrival: 57, rent: 0, missedRent: 0, ending: null, selected: 101, heard: [] };
  state.residents.push(createResident('cat', 101));
  addEvent(state, 'arrival', '101号室に、灰田 モクが住んでいる。', '親戚から引き継いだのは、築38年の古いアパート。\n\n唯一の住人は、いつも窓辺でタバコを吸っている猫獣人。「管理人？ ああ、よろしく」。それだけ言うと、また煙の向こうへ目をやった。\n\nあなたの仕事は、この暮らしを見守ること。次の入居募集は3日目の朝9時。', [101], '管理人としての観察が始まった。');
  const opening = addEvent(state, 'life', 'モクが「明日から片づける」とつぶやいた。', 'テーブルの空き缶を一本だけ動かして、モクは片づけを終えた気になった。\n\n「今日は準備の日ってことで」。\n\n灰皿だけが、几帳面に手の届く位置にある。', [101], '101号室の散らかりが少し増えた。');
  opening.lines = OPENING_LINES.map(line => ({ ...line }));
  ensureManagement(state);
  return state;
}
function random(state) { let x = state.seed; x ^= x << 13; x ^= x >>> 17; x ^= x << 5; state.seed = x >>> 0; return state.seed / 4294967296; }
const pick = (state, list) => list[Math.floor(random(state) * list.length)];
function createResident(type, room) {
  const c = CHARACTERS[type];
  return { id: type, type, room, cash: c.cash, debt: 0, needs: { hunger: type === 'peko' ? 72 : 26, sleep: 30, stress: 21, hygiene: 68, fun: 35, alcohol: type === 'fox' ? 74 : type === 'cat' ? 40 : 12, smoke: type === 'cat' ? 78 : 5 }, action: type === 'cat' ? 'smoke' : 'idle', previous: 'idle', actionAge: 0, cooldowns: {}, relationships: {}, history: [], trash: type === 'cat' ? 23 : type === 'mouse' ? 30 : type === 'fox' ? 20 : 9, eventCooldown: 0, targetRoom: null };
}
export function addEvent(state, kind, title, detail, rooms = [], impact = '') {
  const event = { id: state.nextId++, hour: state.hour, kind, title, detail, rooms, impact, read: false };
  state.events.unshift(event);
  if (state.events.length > 240) {
    const protectedId=state.management?.pending?.eventId;
    let drop=state.events.length-1;
    if(state.events[drop].id===protectedId)drop--;
    state.events.splice(drop,1);
  }
  for (const r of state.residents) if (rooms.includes(r.room)) { r.history.unshift(event.id); r.history.length = Math.min(r.history.length, 35); }
  return event;
}
export function admit(state, type) {
  if (state.ending || !state.pending?.includes(type) || !state.remaining.includes(type)) return false;
  const room = ROOMS.find(room => !state.residents.some(r => r.room === room));
  if (!room) return false;
  const r = createResident(type, room);
  for (const other of state.residents) {
    let relation = 0;
    if (['cat', 'fox'].every(t => [type, other.type].includes(t))) relation = 8;
    if (['cat', 'wolf'].every(t => [type, other.type].includes(t))) relation = -15;
    if (['mouse', 'bear'].every(t => [type, other.type].includes(t))) relation = 14;
    if ([type, other.type].includes('hostess')) relation = other.type === 'wolf' || type === 'wolf' ? -8 : 6;
    if (['cat', 'sister'].every(t => [type, other.type].includes(t))) relation = 25;
    r.relationships[other.id] = relation; other.relationships[r.id] = relation;
  }
  state.residents.push(r);
  state.remaining = state.remaining.filter(t => t !== type);
  state.pending = null;
  state.nextArrival += 72;
  if (state.nextArrival <= state.hour) state.nextArrival = state.hour + 72;
  state.selected = room;
  const c = CHARACTERS[type];
  addEvent(state, 'arrival', `${room}号室に、${c.name}が入居した。`, `${c.bio}\n\n${c.quote}\n\n玄関で受け取った鍵は、少し錆びていた。このアパートに、またひとつ癖のある暮らしが加わる。`, [room], `入居数 ${state.residents.length}/6室。新しい相性とトラブルが生まれる。`);
  if (type === 'sister') {
    const event = addEvent(state, 'life', 'モクの「明日から」に、妹の監査が入った。', 'ネムは兄の部屋をひと目見て、スマホの画面を伏せた。\n\n「写真に残すと、私まで片づけてない家の子みたいじゃん」。文句を言いながら、持ってきたおにぎりをテーブルに置いた。', [101, room], '兄妹の関係は25から開始。ネムも別の部屋の住人として家賃を払う。');
    event.lines = [{ speaker: 'sister', name: 'ネム', text: 'お兄ちゃん、まだ明日の準備してるの？' }, { speaker: 'cat', name: 'モク', text: '準備は、丁寧にするほうだから。' }, { speaker: 'sister', name: 'ネム', text: '何年かけてんの。……はい、おにぎり。' }];
  }
  return true;
}
export function advance(state, hours) {
  if (state.ending || !Number.isFinite(hours) || hours <= 0) return;
  const end = state.hour + hours;
  while (Math.floor(state.hour) < Math.floor(end) && !state.ending) {
    state.hour = Math.floor(state.hour) + 1;
    updateHour(state);
  }
  if (!state.ending) state.hour = end;
}
function updateHour(state) {
  const h = dateAt(state.hour).hour;
  const night = h >= 22 || h < 7;
  for (const r of state.residents) {
    const n = r.needs;
    r.actionAge++;
    r.eventCooldown = Math.max(0, r.eventCooldown - 1);
    for (const k of Object.keys(r.cooldowns)) r.cooldowns[k] = Math.max(0, r.cooldowns[k] - 1);
    n.hunger = clamp(n.hunger + (r.type === 'peko' ? 16 : r.type === 'bear' ? 11 : 6));
    n.sleep = clamp(n.sleep + (night && r.type !== 'wolf' ? 10 : 5));
    n.stress = clamp(n.stress + 1 + r.trash / 45);
    n.hygiene = clamp(n.hygiene - 2);
    n.fun = clamp(n.fun + 5);
    n.alcohol = clamp(n.alcohol + (r.type === 'fox' ? 9 : r.type === 'cat' ? 6 : 2));
    n.smoke = clamp(n.smoke + (r.type === 'cat' ? 13 : 1));
    r.trash = clamp(r.trash + (r.type === 'mouse' ? 2 : .3));
    if (r.storyUntil > state.hour) continue;
    if (r.journey && state.hour < r.journey.endsAt) continue;
    if (r.journey?.kind === 'outing' && !r.journey.returned) {
      r.journey.returned = true;
      n.fun = clamp(n.fun - 28); n.stress = clamp(n.stress - 10);
      if (r.type === 'mouse') r.trash = clamp(r.trash + 12);
      addEvent(state, 'life', `${CHARACTERS[r.type].name.split(' ')[1]}が、けもの荘に帰ってきた。`, `${r.journey.reason}から帰宅。\n\n玄関の鍵を開ける音が、いつもの廊下に戻ってきた。`, [r.room], '外で過ごした時間で、娯楽欲求とストレスが下がった。');
    }
    const start = sampleJourney(r, state.hour, ACTIONS[r.action].place);
    if (r.action === 'outing') r.action = 'idle';
    const plan = OUTINGS[r.type], day = dateAt(state.hour).day;
    if (h >= plan.hour && h < plan.hour + 3 && (r.lastOutingDay || 0) !== day) {
      r.lastOutingDay = day; r.journey = createOuting(r, state.hour, start); r.previous = r.action; r.action = 'outing';
      if (r.type === 'ann' && day % 3 === 0) {
        r.journey.companion = 'patron';
        r.journey.reason = 'トクゾウと喫茶店へ';
        r.cash += 6000;
        const meeting = addEvent(state, 'life', 'アンがトクゾウと、少し距離を空けて歩いている。', '金満トクゾウ、56歳。既婚の会社役員で、アンの恋人でもある。\n\n「今日は時間がなくてね」。その言葉は、アンのほうが先に覚えていた。建物前で合流し、二人は喫茶店へ向かう。渡された封筒は、未来の約束より軽くない。', [r.room], '生活費の援助6000円を受け取った。外観の街路ではトクゾウが隣を歩く。彼は入居せず、アンは一人で帰宅する。');
        meeting.lines = [{ speaker: 'ann', name: 'アン', text: '今日は「今度」じゃなくて、来てくれたんだ。' }, { speaker: 'ann', name: 'アン', text: '家賃の封筒、約束より先に出してね。' }];
      }
      const outing = addEvent(state, 'life', `${CHARACTERS[r.type].name.split(' ')[1]}が「${plan.reason}」に出かけた。`, '玄関から共用廊下へ。上の階なら階段を下りて、アパートの前の道を歩いていく。\n\n外観モードなら、出かける姿も帰ってくる姿も見守れる。', [r.room], '画面外でしばらく過ごし、同じ道を通って帰宅する。');
      if (r.type === 'cat') { const lines = catOutingLines(state); if (lines) outing.lines = lines; }
      continue;
    }
    const sleepTime = ['wolf', 'hostess'].includes(r.type) ? h >= 7 && h < 16 : night;
    if (r.action === 'sleep' && sleepTime && n.sleep > 12) { applyAction(state, r, 'sleep', false); continue; }
    const scores = {
      eat: n.hunger * 1.13, sleep: n.sleep + (sleepTime ? 22 : -15), smoke: n.smoke * (r.type === 'cat' ? 1.1 : .16),
      drink: n.alcohol * .75 + n.stress * .37, tv: n.fun * .85, clean: (100 - n.hygiene) * (r.type === 'cat' || r.type === 'mouse' ? .25 : .75), idle: 13,
      chat: state.residents.length > 1 ? 20 + n.fun * .24 : -100,
      fight: state.residents.length > 1 && n.stress > 65 ? n.stress * .8 : -100
    };
    if (r.type === 'hostess') {
      scores.counsel = state.residents.length > 1 && !sleepTime ? 48 + n.fun * .3 : -100;
      scores.shop = 25 + n.fun * .5;
    }
    if (r.type === 'sister') scores.shop = 22 + n.fun * .45;
    if (r.type !== 'hostess') scores[CHARACTERS[r.type].habit] = Math.max(scores[CHARACTERS[r.type].habit] || 0, 40 + random(state) * 34 + (r.type === 'wolf' && night ? 28 : 0));
    let best = 'idle', score = -Infinity;
    for (const [a, value] of Object.entries(scores)) {
      const v = value + random(state) * 16 - (r.cooldowns[a] ? 45 : 0) - (r.action === a && a !== 'sleep' ? 24 : 0);
      if (v > score) { best = a; score = v; }
    }
    r.previous = r.action; r.action = best; r.actionAge = 0; r.targetRoom = null;
    r.cooldowns[best] = best === 'sleep' ? 0 : ['shop', 'sell', 'stream', 'steal', 'collect', 'gamble', 'checkBrother'].includes(best) ? 6 : 2;
    applyAction(state, r, best, true);
    r.journey = r.targetRoom ? createVisit(r, state.hour, start, r.targetRoom) : createRoomMove(r, state.hour, start, ACTIONS[best].place);
  }
  if (h === 9) dailyMoney(state);
  if (!state.pending && state.residents.length < 6 && state.hour >= state.nextArrival) {
    const pool = [...state.remaining];
    if (pool.length) {
      const first = state.residents.length === 1 && pool.includes('hostess') ? 'hostess' : pick(state, pool);
      pool.splice(pool.indexOf(first), 1);
      state.pending = pool.length ? [first, pick(state, pool)] : [first];
      addEvent(state, 'arrival', `掲示板に、${state.pending.length}通の入居申込書が届いた。`, '空いている部屋に新しい住人を迎えられる。最後の一人なら申込書は一通だけ。', [], '観察画面の封筒、またはこの記録から入居希望者を選べる。');
    }
  }
  tickManagement(state, addEvent);
  if (state.hour >= 417) finish(state);
}
function spend(r, amount) { r.cash -= amount; if (r.cash < 0) { r.debt -= r.cash; r.cash = 0; } }
function relation(a, b, delta) { a.relationships[b.id] = clamp((a.relationships[b.id] || 0) + delta, -100, 100); b.relationships[a.id] = clamp((b.relationships[a.id] || 0) + delta, -100, 100); }
function applyAction(state, r, action, changed) {
  const n = r.needs, c = CHARACTERS[r.type];
  let scripted = false;
  switch (action) {
    case 'eat': {
      const bargain = r.type === 'peko' && r.cash < 900;
      n.hunger = clamp(n.hunger - (r.type === 'peko' ? bargain ? 38 : 65 : 57));
      n.stress = clamp(n.stress - 6);
      spend(r, r.type === 'peko' ? bargain ? 200 : 900 : r.type === 'bear' ? 1100 : 400);
      r.trash += r.type === 'peko' ? 4 : 2;
      if (r.type === 'peko' && changed) {
        const event = addEvent(state, bargain ? 'trouble' : 'life', bargain ? 'ペコの特売弁当、満腹まであと三箱。' : 'ペコが「おやつ」のドーナツと大盛りごはんを食べた。', bargain ? '「200円なら節約。二つ買っても節約」。\n\n一箱だけ食べ終え、ペコは空になった容器と財布を見比べた。胃袋は、まだ会議を続けたがっている。' : '「ドーナツは真ん中に穴があるから、実質少なめ」。\n\n大盛りごはんも食べたところで、やっと満足げに耳が揺れた。家賃用の小銭まで、食費になっていた。', [r.room], bargain ? '特売弁当200円。空腹は38減るが、毎時16増える。支払い不足は借金になる。' : '食費900円で空腹が65減少。食べ終えた容器が増えた。');
        event.lines = [{ speaker: 'peko', name: 'ペコ', text: bargain ? 'お財布は軽いのに、お腹は重くならない……。' : 'お腹いっぱい。……で、デザートは？' }];
        scripted = true;
      }
      break;
    }
    case 'sleep': n.sleep = clamp(n.sleep - 29); n.stress = clamp(n.stress - 7); break;
    case 'smoke': n.smoke = clamp(n.smoke - 65); n.stress = clamp(n.stress - 12); spend(r, 180); r.trash += 2; break;
    case 'drink': n.alcohol = clamp(n.alcohol - 55); n.stress = clamp(n.stress - 16); n.sleep = clamp(n.sleep + 12); spend(r, 600); r.trash += 4; break;
    case 'tv': n.fun = clamp(n.fun - 50); n.stress = clamp(n.stress - 7); break;
    case 'clean': n.hygiene = clamp(n.hygiene + 45); r.trash = clamp(r.trash - 22); n.stress = clamp(n.stress - 3); break;
    case 'shop': n.fun = clamp(n.fun - 55); n.stress = clamp(n.stress - 12); spend(r, 800 + Math.floor(random(state) * 2200)); r.trash = clamp(r.trash + 8); break;
    case 'stream': n.fun = clamp(n.fun - 55); n.stress = clamp(n.stress - 12); r.cash += Math.floor(random(state) * 550); break;
    case 'collect': n.fun = clamp(n.fun - 50); n.stress = clamp(n.stress - 12); n.hygiene = clamp(n.hygiene - 7); r.trash = clamp(r.trash + 9); break;
    case 'gamble': {
      const win = random(state) > .73;
      if (win) { r.cash += 4200; n.stress = clamp(n.stress - 30); }
      else { spend(r, 1800); n.stress = clamp(n.stress + 9); }
      n.fun = clamp(n.fun - 45); break;
    }
    case 'counsel': {
      const others = state.residents.filter(x => x !== r && sampleJourney(x, state.hour, ACTIONS[x.action].place).zone === 'room' && x.action !== 'sleep');
      const target = others.sort((a, b) => b.needs.stress - a.needs.stress)[0];
      n.fun = clamp(n.fun - 28);
      if (target) {
        r.targetRoom = target.room;
        target.needs.stress = clamp(target.needs.stress - 22);
        n.stress = clamp(n.stress + 5);
        relation(r, target, 9);
        if (changed) {
          const name = CHARACTERS[target.type].name.split(' ')[1];
          const event = addEvent(state, 'life', `ルナの廊下相談室、${name}が無料延長した。`, '「それ、しんどかったね」。店では時間を測る言葉も、ここでは時計を見ずに出てくる。\n\n相談が終わると、ルナは自分の部屋で無言になった。営業スマイルの充電には、ひとりの時間がいる。', [r.room, target.room], '相手のストレスが22下がり、関係が9改善。ルナのストレスは5増えた。お金のやり取りはない。');
          event.lines = [{ speaker: 'hostess', name: 'ルナ', text: 'ここ、指名料いらないから。とりあえず座りな。' }, { speaker: target.type, name, text: '……もう少しだけ、聞いてくれる？' }, { speaker: 'hostess', name: 'ルナ', text: '延長ね。はいはい、今日も売上ゼロ。' }];
        }
      } else if (changed) addEvent(state, 'life', 'ルナの相談室、今日は予約ゼロ。', '廊下は静か。「じゃ、私も休憩」。スマホを裏返して、誰にも愛想を振りまかない時間を確保した。', [r.room], '娯楽欲求が下がった。相談相手がいないので関係は変わらない。');
      scripted = true;
      break;
    }
    case 'checkBrother': {
      const brother = state.residents.find(x => x.type === 'cat');
      n.fun = clamp(n.fun - 32);
      if (brother && brother.action !== 'sleep' && sampleJourney(brother, state.hour, ACTIONS[brother.action].place).zone === 'room') {
        r.targetRoom = brother.room;
        brother.trash = clamp(brother.trash - 8);
        brother.needs.stress = clamp(brother.needs.stress - 8);
        n.stress = clamp(n.stress - 5);
        relation(r, brother, 6);
        if (changed) {
          const event = addEvent(state, 'life', 'ネムの生存確認、ついでに空き缶を回収。', '「返信くらいしなよ。生きてるか分かんないじゃん」。\n\n文句の数だけ、袋に空き缶が入っていく。モクは「ありがと」とだけ言った。ネムはそれを聞かなかった顔をした。', [r.room, brother.room], '兄のゴミが8減り、ストレスが8低下。ネムのストレスが5低下し、兄妹の関係が6改善。');
          event.lines = [{ speaker: 'sister', name: 'ネム', text: '生きてるなら返信して。あと、缶は家具じゃない。' }, { speaker: 'cat', name: 'モク', text: 'いま返そうとしてた。……ありがと。' }, { speaker: 'sister', name: 'ネム', text: '別に。袋が余ってただけ。' }];
        }
      } else {
        n.stress = clamp(n.stress + 8);
        if (changed) {
          const event = addEvent(state, 'life', 'ネムが送った「生きてる？」に既読がつかない。', '兄は外出中か、夢の中。ネムはスマホを伏せて、三秒後にまた開いた。\n\n「心配じゃない。連絡のマナーの話」。廊下は静かなままだった。', [r.room], '返信待ちでネムのストレスが8増加。寝ている兄を起こしたり、外出先を追いかけたりはしない。');
          event.lines = [{ speaker: 'sister', name: 'ネム', text: '通知ゼロ。……電波のせいってことにしとこ。' }];
        }
      }
      scripted = true;
      break;
    }
    case 'chat': case 'fight': case 'steal': case 'sell': {
      const others = state.residents.filter(x => x !== r && sampleJourney(x, state.hour, ACTIONS[x.action].place).zone === 'room');
      if (others.length) {
        const target = action === 'fight' ? [...others].sort((a, b) => (r.relationships[a.id] || 0) - (r.relationships[b.id] || 0))[0] : pick(state, others);
        r.targetRoom = target.room;
        n.fun = clamp(n.fun - 34);
        if (changed && target.type === 'cat' && r.type !== 'cat') {
          const scene = catDoorIncident(state, r.type, action);
          if (scene) { const event = addEvent(state, scene.kind, scene.title, scene.detail, [r.room, target.room], scene.impact); event.lines = scene.lines; scripted = true; }
        }
        if (action === 'chat') { relation(r, target, 7); n.stress = clamp(n.stress - 9); }
        if (action === 'fight') { relation(r, target, -9); n.stress = clamp(n.stress - 12); target.needs.stress = clamp(target.needs.stress + 17); }
        if (action === 'steal') { n.hunger = clamp(n.hunger - 60); relation(r, target, -6); target.needs.stress = clamp(target.needs.stress + 12); }
        if (action === 'sell') { spend(target, 800); r.cash += 800; relation(r, target, -4); target.needs.stress = clamp(target.needs.stress + 8); }
      } else { n.fun = clamp(n.fun - 35); }
      break;
    }
  }
  if (action === 'stream' && (dateAt(state.hour).hour >= 22 || dateAt(state.hour).hour < 6)) {
    for (const other of state.residents) if (other !== r && sampleJourney(other,state.hour,ACTIONS[other.action].place).zone === 'room') { other.needs.stress = clamp(other.needs.stress + 9); other.needs.sleep = clamp(other.needs.sleep + 6); relation(r, other, -2); }
  }
  r.trash = clamp(r.trash);
  if (changed && r.type === 'sister' && action === 'shop') {
    const event = addEvent(state, 'trouble', 'ネムの「生活必需品」、推しグッズが届いた。', '「これないと出勤できないから、ほぼ仕事道具」。\n\n新しいキーホルダーをバッグにつけ、支払い通知はそっと閉じた。兄のだらしなさには厳しいが、自分のカートには甘い。', [r.room], '通常の買い物代を支払い、足りない分は借金に。箱とゴミが増えた。');
    event.lines = [{ speaker: 'sister', name: 'ネム', text: '節約？ してるよ。送料が無料になるまで買ったし。' }];
    scripted = true;
  }
  if (changed && r.type === 'hostess' && action === 'shop') {
    addEvent(state, 'trouble', 'ルナが「仕事用」のバッグをまた買った。', '「これは経費。こっちは気合い。あっちは来月の私への投資」。\n\n独立資金の封筒は薄くなったが、バッグを置く場所だけはなくなった。', [r.room], '買い物代を支払い、足りない分は借金に。空き箱とゴミが増えた。');
    scripted = true;
  }
  if (changed && r.type === 'cat') {
    const other = ['chat', 'fight'].includes(action) ? state.residents.find(resident => resident.room === r.targetRoom && resident !== r) : null;
    const scene = catIncident(state, action, other?.type || null);
    if (scene) { const event = addEvent(state, scene.kind, scene.title, scene.detail, other ? [r.room, other.room] : [r.room], scene.impact); event.lines = scene.lines; scripted = true; }
  }
  if (changed && !scripted && !r.eventCooldown && random(state) < .43) { recordAction(state, r, action); r.eventCooldown = 4 + Math.floor(random(state) * 4); }
}
function recordAction(state, r, action) {
  const name = CHARACTERS[r.type].name.split(' ')[1];
  const target = state.residents.find(x => x.room === r.targetRoom);
  const other = target ? CHARACTERS[target.type].name.split(' ')[1] : 'お隣';
  const rooms = target ? [r.room, target.room] : [r.room];
  const descriptions = {
    smoke: ['life', `${name}が窓辺で、何本目かのタバコを吸っている。`, '夕飯のことも、家賃のことも、ひとまず煙に巻く。\n\n灰皿を見て「そろそろ捨てるか」と言ったきり、次の一本に火をつけた。', '喫煙欲求とストレスが下がった。空き箱が増えた。'],
    eat: ['life', `${name}の部屋から、夜食のいい匂いがする。`, '冷蔵庫には、半分の玉ねぎと正体不明のタッパー。\n\nとりあえず焼けば何とかなる。今日も、台所から小さな勝利の音がした。', '空腹が下がった。食費を支払い、ゴミが少し増えた。'],
    sleep: ['life', `${name}が、すべてを放り出して眠った。`, 'テレビをつけたまま、布団にもぐりこんだ。\n\nやらなければいけないことは山ほどある。それでも、寝顔だけは平和だった。', '眠気とストレスが下がっている。'],
    drink: ['life', `${name}が空き缶に囲まれ、ひとり乾杯した。`, '「お疲れ、俺」。\n\n誰もいないテーブルに、乾杯の音だけが響く。今日の問題は明日の自分に託された。', '飲酒欲求とストレスが下がった。部屋が散らかった。'],
    tv: ['life', `${name}がテレビの前で、同じ番組を見ている。`, '再放送なのは知っている。でも、チャンネルを変えるほどの気力もない。\n\n聞き覚えのある笑い声に、つられて少しだけ笑った。', '娯楽欲求とストレスが下がった。'],
    clean: ['life', `${name}が部屋を掃除した。たぶん、気まぐれ。`, '何かを探すうちに、床が少し見えるようになった。\n\n「こんな色だったんだな」。本人がいちばん驚いている。', '衛生状態が良くなり、部屋のゴミが減った。'],
    shop: ['trouble', `${name}宛ての段ボールが、また届いた。`, '「セール最終日だったから」。昨日もそう言っていた。\n\n分割払いの明細をそっと裏返し、新しい服を鏡に合わせる。箱だけが部屋に残った。', '買い物で所持金が減った。足りない分は借金になった。'],
    sell: ['trouble', target ? `${name}が${other}に「幸運の石」を売りつけた。` : `${name}が、怪しい商品のチラシを作っている。`, target ? '「これ、持ってるだけで運気が上がる」。\n\n翌朝、石がただの重しとして使われていた。返金を頼むと、コンは「信じる力が足りない」と笑った。' : '売り文句は完璧。顧客だけがいない。\n\n「隣の部屋、早く埋まらないかな」。商売人は空室を見つめた。', target ? '相手の所持金が800円減り、二人の関係が悪化した。' : '空室に、未来のお客様を期待している。'],
    stream: ['trouble', `${name}の「うわああ！」が、壁を突き抜けた。`, '画面の中で負けたのはゲームのキャラクター。\n\n壁の向こうで負けたのは、隣人の睡眠。配信のチャットには「声でかい」と一言だけ流れた。', '娯楽欲求が下がった。深夜なら周囲の眠気とストレスが増え、関係も悪化する。'],
    steal: ['trouble', target ? `${other}のプリンが、${name}のお腹に消えた。` : `${name}が、自分の冷蔵庫を食べ尽くした。`, target ? '共用廊下で顔を合わせた瞬間、ゴロは目をそらした。\n\n「一口だけのつもりだった」。空の容器が、正直すぎる証拠になっている。' : '扉を開けても、冷たい空気しかない。\n\n「あとで何か買おう」。その「あとで」まで、胃袋は待ってくれない。', target ? '空腹が下がった。食べ物を失った相手のストレスが増え、関係が悪化した。' : '食料を探している。'],
    collect: ['trouble', `${name}が「まだ使える椅子」を持ち帰った。`, '脚は三本。座面はない。でも、チリには可能性が見えている。\n\n床の見える面積が、今日も少しだけ減った。廊下にも「あとで整理する」袋が置かれている。', '娯楽欲求が下がった。ゴミが増え、衛生状態が悪化した。'],
    gamble: ['trouble', `${name}が「次こそ勝てる」と財布を確かめた。`, '勝っても負けても、結論は同じ。もう一回。\n\nポンは財布の中をのぞき、「まだいける」と小さくつぶやいた。家賃の封筒は、見なかったことにする。', `現在の所持金は${r.cash.toLocaleString('ja-JP')}円。勝負でお金とストレスが変動した。`],
    chat: ['life', `${name}と${other}が、廊下でどうでもいい話をした。`, '「今日、暑くない？」「昨日も言ってたよ」。\n\n何の解決にもならない会話が、少しだけ一日を軽くした。気づけば、二人とも笑っていた。', '二人の関係が良くなった。ストレスと娯楽欲求が下がった。'],
    fight: ['trouble', `${name}と${other}が、廊下で言い合いになった。`, 'きっかけは小さなこと。積もっていたのは、小さくない不満。\n\n「こっちだって我慢してるんだよ」。どちらも、自分がいちばん我慢していると思っている。\n\n管理人の出番はない。今日も観察記録に、二つの名前が増えた。', '二人の関係が悪化した。相手のストレスが増えた。'],
    idle: ['life', `${name}が、天井の染みを数えている。`, '染みの形が、何かに似ている。\n\n考えているうちに、一時間が過ぎた。こんな日も、ここでは立派な一日。', 'しばらく何もしない時間を過ごした。']
  };
  const e = descriptions[action];
  if (e) addEvent(state, e[0], e[1], e[2], rooms, e[3]);
}
function dailyMoney(state) {
  for (const r of state.residents) {
    r.cash += CHARACTERS[r.type].income;
    const paid = Math.min(r.cash, 1200); r.cash -= paid; state.rent += paid;
    if (paid < 1200) { r.debt += 1200 - paid; state.missedRent++; r.needs.stress = clamp(r.needs.stress + 12); const short = addEvent(state, 'trouble', `${r.room}号室の家賃が、少し足りない。`, '家賃用の封筒を開けると、申し訳程度の小銭が入っていた。\n\n「来週、まとめて払います」。掲示板には、何度も聞いた約束が残った。', [r.room], `本日の不足分 ${1200 - paid}円が借金に加わった。`); if (r.type === 'cat') { const lines = catRentLines(state, false); if (lines) short.lines = lines; } }
    else if (r.type === 'cat') { const lines = catRentLines(state, true); if (lines) { const scene = catRentScene(); const paidNote = addEvent(state, scene.kind, scene.title, scene.detail, [r.room], scene.impact); paidNote.lines = lines; } }
    if (r.trash >= 85 && dateAt(state.hour).day % 3 === 0) addEvent(state, 'trouble', `${r.room}号室のゴミが、廊下にはみ出した。`, '袋の山が玄関の境界を越えた。\n\n「これは一時的に置いてるだけ」。一時的、という言葉だけは毎日新しくなる。', [r.room], '散らかった部屋は、住人のストレスを増やしている。');
  }
}
export function atmosphere(state) {
  const stress = state.residents.reduce((s, r) => s + r.needs.stress, 0) / state.residents.length;
  const relations = state.residents.flatMap(r => Object.values(r.relationships));
  const hostile = relations.filter(n => n < -30).length;
  return stress > 70 || hostile > 8 ? '一触即発' : stress > 43 || hostile > 2 ? 'ざわついている' : state.residents.length > 2 ? 'にぎやかな日常' : 'まだ、穏やか';
}
function finish(state) {
  const debt = state.residents.reduce((s, r) => s + r.debt, 0);
  const trash = state.residents.reduce((s, r) => s + r.trash, 0) / state.residents.length;
  const relations = state.residents.flatMap(r => Object.values(r.relationships));
  const avg = relations.reduce((s, n) => s + n, 0) / Math.max(relations.length, 1);
  const worst = relations.length ? Math.min(...relations) : 0;
  const managed=managementEnding(state);
  if (managed) state.ending=managed;
  else if (state.residents.length === 1) state.ending = { name: 'ひとりと、ひとつの灰皿', text: '結局、住人はあの猫だけだった。\n窓辺には煙。テーブルには空き缶。\n大きな事件はなくても、ここに暮らしはあった。' };
  else if (avg < -35 || (worst < -45 && avg < 15)) state.ending = { name: '壁の薄い戦場', text: '小さな不満は、薄い壁を越えて積もった。\n廊下ですれ違っても、誰も目を合わせない。\nそれでも、家賃の安さだけは全員の味方だった。' };
  else if (debt > 60000) state.ending = { name: '明日払いの楽園', text: '住人は増えた。約束も増えた。お金は増えなかった。\n「来週には払うから」。今日も扉の向こうから、\n似たような声が聞こえてくる。' };
  else if (trash > 40) state.ending = { name: '宝の山と、獣の巣', text: '誰かのゴミは、誰かの宝。\nけもの荘は、いつしか街でいちばん物の多い家になった。\n足の踏み場を探しながら、住人たちは意外と元気だ。' };
  else state.ending = { name: 'ろくでもない、ただいま', text: '大したことは何も変わらなかった。\n誰も更生せず、誰も立派にはならなかった。\nそれでも、帰ってくる場所だけは同じだった。\n\n今日もけもの荘には、ろくでもない灯りがともる。' };
  addEvent(state, 'arrival', `観察記・結末「${state.ending.name}」`, state.ending.text, [], '18日間の観察が終わった。別の住人の組み合わせで、新しい暮らしを見守れる。');
}
export function validateSave(s) {
  if (!s || s.version !== 1 || !Number.isFinite(s.hour) || s.hour < 17 || s.hour > 418 || !Number.isInteger(s.seed) || !Array.isArray(s.residents) || s.residents.length < 1 || s.residents.length > 6 || !Array.isArray(s.events) || !Array.isArray(s.remaining) || !Number.isFinite(s.rent) || !Number.isFinite(s.nextArrival) || !Number.isInteger(s.nextId)) return false;
  const types = new Set(), rooms = new Set();
  for (const r of s.residents) {
    if (!CHARACTERS[r.type] || !ROOMS.includes(r.room) || types.has(r.type) || rooms.has(r.room) || !ACTIONS[r.action] || !r.cooldowns || !r.relationships || !Array.isArray(r.history) || !Number.isFinite(r.cash) || !Number.isFinite(r.debt) || !Number.isFinite(r.trash) || !Number.isFinite(r.eventCooldown) || !NEEDS.every(([k]) => Number.isFinite(r.needs?.[k]) && r.needs[k] >= 0 && r.needs[k] <= 100)) return false;
    types.add(r.type); rooms.add(r.room);
    if (!validJourney(r.journey)) return false;
    if (r.storyUntil !== undefined && !Number.isFinite(r.storyUntil)) return false;
  }
  if (s.remaining.some(t => !CHARACTERS[t] || types.has(t)) || new Set(s.remaining).size !== s.remaining.length) return false;
  if (s.pending !== null && (!Array.isArray(s.pending) || (s.pending.length !== 1 && s.pending.length !== 2) || (s.pending.length === 2 && s.pending[0] === s.pending[1]) || s.pending.some(t => !s.remaining.includes(t)))) return false;
  if (s.events.some(e => !Number.isInteger(e.id) || !Number.isFinite(e.hour) || !['life', 'trouble', 'arrival'].includes(e.kind) || typeof e.title !== 'string' || typeof e.detail !== 'string' || !Array.isArray(e.rooms))) return false;
  return validManagement(s) && (s.ending === null || (typeof s.ending.name === 'string' && typeof s.ending.text === 'string'));
}

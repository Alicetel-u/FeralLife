import { OUTINGS, createOuting, createVisit, createRoomMove, sampleJourney, validJourney } from './movement.js';

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
  fight: { label: 'お隣と口論中', icon: '!', place: 'hall' },
  outing: { label: '出かけている', icon: '↗', place: 'table' }
};
export const CHARACTERS = {
  cat: { name: '灰田 モク', species: '猫', age: 29, job: '日雇い（休業中）', traits: ['だらしない', '愛煙家', '無気力'], quote: '「明日からちゃんとする。\n……明日になったら言うけど。」', color: '#929f94', shirt: '#52675e', accent: '#bac1a9', cash: 14000, habit: 'smoke', warning: '掃除も貯金も苦手。タバコだけは切らさない。', bio: 'ずっと101号室にいる、けもの荘の古株。灰皿は満杯、予定は空白。', income: 1500 },
  rabbit: { name: '桃井 ミミ', species: '兎', age: 24, job: 'アパレル店員', traits: ['浪費家', '見栄っ張り', 'ブランド好き'], quote: '「これ？ 安かったの。\n分割にしたら、ほぼ無料だし。」', color: '#e1b0a0', shirt: '#b47582', accent: '#f3d5bc', cash: 18000, habit: 'shop', warning: '通販と分割払い。借金がふくらみやすい。', bio: 'おしゃれな部屋に住みたい。でも家賃は安いほうがいい。段ボールは毎日届く。', income: 4500 },
  fox: { name: '九条 コン', species: '狐', age: 32, job: '自称・起業家', traits: ['口がうまい', '怪しい商売', '社交的'], quote: '「今だけ特別に。\n君には成功してほしいんだよ。」', color: '#c68449', shirt: '#786d91', accent: '#f1d2a3', cash: 24000, habit: 'sell', warning: 'お隣さんを「お客様」と呼ぶ。財布に注意。', bio: '笑顔と名刺を絶やさない商売人。扱う商品にだけ、説明書がない。', income: 2200 },
  wolf: { name: '夜野 ウル', species: '狼', age: 26, job: '動画配信者', traits: ['昼夜逆転', '騒音主', '承認欲求'], quote: '「みんな聞こえてるー!?\n……隣には聞こえなくていい。」', color: '#8a9eaf', shirt: '#666995', accent: '#c2ced2', cash: 17000, habit: 'stream', warning: '夜中ほど声が大きい。隣人の眠りを奪う。', bio: '視聴者はまだ12人。それでもリアクションの音量は、人気配信者級。', income: 2700 },
  bear: { name: '熊谷 ゴロ', species: '熊', age: 35, job: '配送ドライバー', traits: ['大食漢', '食いしん坊', '悪気なし'], quote: '「名前、書いてなかったよ？\n……書いてあっても読めなかった。」', color: '#997354', shirt: '#a0915c', accent: '#d8b384', cash: 21000, habit: 'steal', warning: '他人の冷蔵庫も食料庫。食費と揉め事が増える。', bio: '体も胃袋も大きい、気のいい住人。「ひとくち」がひと皿になる。', income: 4200 },
  mouse: { name: '根津 チリ', species: '鼠', age: 27, job: 'リサイクル店員', traits: ['ゴミ収集家', '捨てられない', 'マイペース'], quote: '「ゴミじゃないよ、資源だよ。\n使い道は、あとで考える。」', color: '#ac9b96', shirt: '#7c8662', accent: '#d8c2aa', cash: 10000, habit: 'collect', warning: '拾い物で部屋が埋まる。共用廊下にも進出する。', bio: '街のゴミ置き場は宝の山。いつか使う「いつか」が、まだ来ない。', income: 2000 },
  tanuki: { name: '八代 ポン', species: '狸', age: 31, job: 'フリーター', traits: ['ギャンブラー', '楽天家', '借金体質'], quote: '「負けじゃない、投資。\n次の一回でぜんぶ返せるから。」', color: '#a08a6b', shirt: '#8c6c4e', accent: '#d4bb94', cash: 16000, habit: 'gamble', warning: '大勝ちも大負けも。家賃より勝負を優先する。', bio: 'ここへ越してきた理由は「運気を変えるため」。住所より先に財布が変わる。', income: 2800 }
};

const clamp = (n, low = 0, high = 100) => Math.max(low, Math.min(high, n));
export function dateAt(hour) { return { day: Math.floor(hour / 24) + 1, hour: Math.floor(hour % 24), minute: Math.floor((hour % 1) * 60) }; }
export function formatTime(hour) { const d = dateAt(hour); return `${d.day}日目 ${String(d.hour).padStart(2, '0')}:${String(d.minute).padStart(2, '0')}`; }
export function createGame(seed = Date.now()) {
  const state = { version: 1, hour: 17, seed: (seed >>> 0) || 1, residents: [], events: [], nextId: 1, remaining: ['rabbit', 'fox', 'wolf', 'bear', 'mouse', 'tanuki'], pending: null, nextArrival: 57, rent: 0, missedRent: 0, ending: null, selected: 101 };
  state.residents.push(createResident('cat', 101));
  addEvent(state, 'arrival', '101号室に、灰田 モクが住んでいる。', '親戚から引き継いだのは、築38年の古いアパート。\n\n唯一の住人は、いつも窓辺でタバコを吸っている猫獣人。「管理人？ ああ、よろしく」。それだけ言うと、また煙の向こうへ目をやった。\n\nあなたの仕事は、この暮らしを見守ること。次の入居募集は3日目の朝9時。', [101], '管理人としての観察が始まった。');
  addEvent(state, 'life', 'モクが「明日から片づける」とつぶやいた。', 'テーブルの空き缶を一本だけ動かして、モクは片づけを終えた気になった。\n\n「今日は準備の日ってことで」。\n\n灰皿だけが、几帳面に手の届く位置にある。', [101], '101号室の散らかりが少し増えた。');
  return state;
}
function random(state) { let x = state.seed; x ^= x << 13; x ^= x >>> 17; x ^= x << 5; state.seed = x >>> 0; return state.seed / 4294967296; }
const pick = (state, list) => list[Math.floor(random(state) * list.length)];
function createResident(type, room) {
  const c = CHARACTERS[type];
  return { id: type, type, room, cash: c.cash, debt: 0, needs: { hunger: 26, sleep: 30, stress: 21, hygiene: 68, fun: 35, alcohol: type === 'cat' ? 40 : 12, smoke: type === 'cat' ? 78 : 5 }, action: type === 'cat' ? 'smoke' : 'idle', previous: 'idle', actionAge: 0, cooldowns: {}, relationships: {}, history: [], trash: type === 'cat' ? 23 : type === 'mouse' ? 30 : 9, eventCooldown: 0, targetRoom: null };
}
export function addEvent(state, kind, title, detail, rooms = [], impact = '') {
  const event = { id: state.nextId++, hour: state.hour, kind, title, detail, rooms, impact, read: false };
  state.events.unshift(event);
  if (state.events.length > 240) state.events.length = 240;
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
    if ([type, other.type].includes('fox')) relation = -6;
    if (['cat', 'wolf'].every(t => [type, other.type].includes(t))) relation = -15;
    if (['mouse', 'bear'].every(t => [type, other.type].includes(t))) relation = 14;
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
    n.hunger = clamp(n.hunger + (r.type === 'bear' ? 11 : 6));
    n.sleep = clamp(n.sleep + (night && r.type !== 'wolf' ? 10 : 5));
    n.stress = clamp(n.stress + 1 + r.trash / 45);
    n.hygiene = clamp(n.hygiene - 2);
    n.fun = clamp(n.fun + 5);
    n.alcohol = clamp(n.alcohol + (r.type === 'cat' ? 6 : 2));
    n.smoke = clamp(n.smoke + (r.type === 'cat' ? 13 : 1));
    r.trash = clamp(r.trash + (r.type === 'mouse' ? 2 : .3));
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
      addEvent(state, 'life', `${CHARACTERS[r.type].name.split(' ')[1]}が「${plan.reason}」に出かけた。`, '玄関から共用廊下へ。上の階なら階段を下りて、アパートの前の道を歩いていく。\n\n外観モードなら、出かける姿も帰ってくる姿も見守れる。', [r.room], '画面外でしばらく過ごし、同じ道を通って帰宅する。');
      continue;
    }
    const sleepTime = r.type === 'wolf' ? h >= 7 && h < 16 : night;
    if (r.action === 'sleep' && sleepTime && n.sleep > 12) { applyAction(state, r, 'sleep', false); continue; }
    const scores = {
      eat: n.hunger * 1.13, sleep: n.sleep + (sleepTime ? 22 : -15), smoke: n.smoke * (r.type === 'cat' ? 1.1 : .16),
      drink: n.alcohol * .75 + n.stress * .37, tv: n.fun * .85, clean: (100 - n.hygiene) * (r.type === 'cat' || r.type === 'mouse' ? .25 : .75), idle: 13,
      chat: state.residents.length > 1 ? 20 + n.fun * .24 : -100,
      fight: state.residents.length > 1 && n.stress > 65 ? n.stress * .8 : -100
    };
    scores[CHARACTERS[r.type].habit] = Math.max(scores[CHARACTERS[r.type].habit] || 0, 40 + random(state) * 34 + (r.type === 'wolf' && night ? 28 : 0));
    let best = 'idle', score = -Infinity;
    for (const [a, value] of Object.entries(scores)) {
      const v = value + random(state) * 16 - (r.cooldowns[a] ? 45 : 0) - (r.action === a && a !== 'sleep' ? 24 : 0);
      if (v > score) { best = a; score = v; }
    }
    r.previous = r.action; r.action = best; r.actionAge = 0; r.targetRoom = null;
    r.cooldowns[best] = best === 'sleep' ? 0 : ['shop', 'sell', 'stream', 'steal', 'collect', 'gamble'].includes(best) ? 6 : 2;
    applyAction(state, r, best, true);
    r.journey = r.targetRoom ? createVisit(r, state.hour, start, r.targetRoom) : createRoomMove(r, state.hour, start, ACTIONS[best].place);
  }
  if (h === 9) dailyMoney(state);
  if (!state.pending && state.residents.length < 6 && state.hour >= state.nextArrival) {
    const pool = [...state.remaining];
    const first = pick(state, pool); pool.splice(pool.indexOf(first), 1);
    state.pending = [first, pick(state, pool)];
    addEvent(state, 'arrival', '掲示板に、2通の入居申込書が届いた。', '家賃の安さにつられて、また二人がやって来た。\n\n空いている部屋はひとつずつ埋まっていく。迎えるのは、あなたが選んだ一人だけ。', [], '観察画面の封筒、またはこの記録から入居希望者を選べる。');
  }
  if (state.hour >= 417) finish(state);
}
function spend(r, amount) { r.cash -= amount; if (r.cash < 0) { r.debt -= r.cash; r.cash = 0; } }
function relation(a, b, delta) { a.relationships[b.id] = clamp((a.relationships[b.id] || 0) + delta, -100, 100); b.relationships[a.id] = clamp((b.relationships[a.id] || 0) + delta, -100, 100); }
function applyAction(state, r, action, changed) {
  const n = r.needs, c = CHARACTERS[r.type];
  switch (action) {
    case 'eat': n.hunger = clamp(n.hunger - 57); n.stress = clamp(n.stress - 6); spend(r, r.type === 'bear' ? 1100 : 400); r.trash += 2; break;
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
    case 'chat': case 'fight': case 'steal': case 'sell': {
      const others = state.residents.filter(x => x !== r && sampleJourney(x, state.hour, ACTIONS[x.action].place).zone === 'room');
      if (others.length) {
        const target = action === 'fight' ? [...others].sort((a, b) => (r.relationships[a.id] || 0) - (r.relationships[b.id] || 0))[0] : pick(state, others);
        r.targetRoom = target.room;
        n.fun = clamp(n.fun - 34);
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
  if (changed && !r.eventCooldown && random(state) < .43) { recordAction(state, r, action); r.eventCooldown = 4 + Math.floor(random(state) * 4); }
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
    if (paid < 1200) { r.debt += 1200 - paid; state.missedRent++; r.needs.stress = clamp(r.needs.stress + 12); addEvent(state, 'trouble', `${r.room}号室の家賃が、少し足りない。`, '家賃用の封筒を開けると、申し訳程度の小銭が入っていた。\n\n「来週、まとめて払います」。掲示板には、何度も聞いた約束が残った。', [r.room], `本日の不足分 ${1200 - paid}円が借金に加わった。`); }
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
  if (state.residents.length === 1) state.ending = { name: 'ひとりと、ひとつの灰皿', text: '結局、住人はあの猫だけだった。\n窓辺には煙。テーブルには空き缶。\n大きな事件はなくても、ここに暮らしはあった。' };
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
  }
  if (s.remaining.some(t => !CHARACTERS[t] || types.has(t)) || new Set(s.remaining).size !== s.remaining.length) return false;
  if (s.pending !== null && (!Array.isArray(s.pending) || s.pending.length !== 2 || s.pending[0] === s.pending[1] || s.pending.some(t => !s.remaining.includes(t)))) return false;
  if (s.events.some(e => !Number.isInteger(e.id) || !Number.isFinite(e.hour) || !['life', 'trouble', 'arrival'].includes(e.kind) || typeof e.title !== 'string' || typeof e.detail !== 'string' || !Array.isArray(e.rooms))) return false;
  return s.ending === null || (typeof s.ending.name === 'string' && typeof s.ending.text === 'string');
}

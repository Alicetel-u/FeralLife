const NAMES = { cat: 'モク', rabbit: 'ミミ', fox: 'ホロ', wolf: 'ウル', bear: 'ゴロ', mouse: 'チリ', tanuki: 'ポン', hostess: 'ルナ', sister: 'ネム', peko: 'ペコ', ann: 'アン' };
export const SPEECH_MS = { line: 5200, mutter: 7000 };

// モク（cat）の発話だけを表示時に猫語へ統一する。旧セーブの台詞にも適用する。
export const mokuNya = text => String(text).replace(/([^。！？!?\n]+)([。！？!?]+|$)/gm, (whole, body, ending) => {
  const tail = body.match(/^(.*?)(\s*)$/);
  const words = tail[1], spaces = tail[2];
  return words && !words.endsWith('ニャ') ? words + 'ニャ' + spaces + ending : whole;
});
const say = (speaker, text) => ({ speaker, name: NAMES[speaker] || '住人', text: speaker === 'cat' ? mokuNya(text) : text });
const mark = (state, id) => { if (!Array.isArray(state.heard)) state.heard = []; if (!state.heard.includes(id)) state.heard.push(id); };
const heard = (state, id) => Array.isArray(state.heard) && state.heard.includes(id);

export const OPENING_LINES = [
  say('cat', '明日から、片づける。'),
  say('cat', '今日は準備。灰皿の位置を直した。'),
  say('cat', '明日の俺が、ちゃんとやる。たぶん。')
];

const MUTTERS = {
  smoke: ['換気？ 窓、開いてるから。煙は外。', '灰皿、溢れてない。山になってるだけ。', '一本でやめる。この一本は数えない。', '家賃の封筒、灰の下で守られてる。', '肺が文句言うなら、肺が出ていけばいい。'],
  drink: ['乾杯の相手は、昨日の俺。来なかった。', '空き缶は家具。捨てると部屋が減る。', '明日から減らす。明日の俺に言っといて。', 'これ栄養。液体の、夜ごはん。'],
  idle: ['天井の染み、昨日より偉そう。', '動くと疲れる。考えてるだけで仕事。', '何もしないのが、今日の成果。', '管理人、見てるなら家賃を見て。'],
  eat: ['期限は目安。匂いは、まだ家族。', '玉ねぎと謎。焼けば、どっちも飯。', '皿を洗う前に、次の皿がいる。'],
  tv: ['再放送。俺の人生と一緒。', '笑うところ、一緒に笑っといた。楽。', 'リモコンは遠い。番組は近い。'],
  clean: ['床、この色だった。知らなかった。', '一本どかした。片づけ、完了。', 'きれいな場所ができた。灰皿を置こう。'],
  sleep: ['起きてない。見学は静かに。', '夢の中なら、家賃ない。'],
  outing: ['コンビニ、歩く分だけ運動。', '袋は、タバコが本体。', '食料はおまけ。帰りに一本。'],
  chat: ['別に用はない。沈黙が気まずいだけ。', '相手の話、半分は煙の向こう。'],
  fight: ['悪いのは、壁が薄いほう。', '謝る気はない。説明なら、する。']
};
const FALLBACK = ['……いま、考えてる。考えたことにする。', '管理人、まだ見てる。暇なんだ。'];

const reply = {
  chat: { rabbit: 'その煙、今日の服に入らない。', fox: '飲む？ ないなら、私のがある。', wolf: '無言だと、配信の間が持たない。', bear: '無口だと、腹の音が主になる。', mouse: '沈黙、袋に詰めて保管する。', tanuki: '気まずいなら、一回賭けない。' },
  fight: { rabbit: '匂いの話、分割でも払えない。', fox: '酔ってない。床が斜めなだけ。', wolf: 'それ、コメント欄の意見と一緒。', bear: '臭くても、飯の匂いは別腹。', mouse: 'その灰、資源として引き取る。', tanuki: '喧嘩、次の一回でチャラにできる。' },
  doorChat: { rabbit: '窓、閉めて。この服、投稿用。', fox: '煙い。でも、缶は開ける。', wolf: '今それ、マイクが拾ってる。', bear: '煙たい。でも、なんか腹が減った。', mouse: '灰、捨てないで。あとで使う。', tanuki: 'この匂いの席、いくらで買える。' },
  doorFight: { rabbit: '開けるか、匂いを分割にして。', fox: 'うるさい。今、いいところなのに。', wolf: '壁ドン、配信的には好感度。', bear: '開けて。匂いの前に、腹だ。', mouse: '閉まってても、匂いは資源。', tanuki: '開けないなら、その態度に賭ける。' },
  steal: { rabbit: '名前くらい、ブランド表記で書いて。', fox: 'それ、おつまみだったの。', wolf: '食ってるとこ、撮っていいか。', bear: '読めなかった。ご縁だと思った。', mouse: '残りは、私が保管する。', tanuki: 'それ、勝ち分の前借りで。' },
  sell: { rabbit: 'その石、コーデに合わない。', fox: '石じゃ飲めない。お酒にして。', wolf: 'それ、スーパーチャットで売るやつ。', bear: '食べられない石は、腹に溜まらない。', mouse: '石、まだ使える。引き取る。', tanuki: 'その石、次の一回に使える。' }
};
const answer = (table, type) => table[type] || '……いま、それどころじゃない。';

const INCIDENTS = {
  smoke: { id: 'ash-vent', kind: 'life', title: 'モクが、換気は終わっていると言った。', detail: '窓は、指一本ぶん開いていた。\n\n煙のほとんどは部屋に残っている。本人はそれを「外の仕事」と呼んだ。', impact: '喫煙でモクのストレスは下がった。部屋の空気は、下がっていない。', lines: [say('cat', '換気はしてる。窓、開いてる。'), say('cat', '開いてないように見えるなら、見方が悪い。'), say('cat', '煙は外の責任。部屋は通り道。')] },
  drink: { id: 'toast-can', kind: 'life', title: 'モクが、いない自分と乾杯した。', detail: 'テーブルの空き缶が、聴衆だった。\n\n「お疲れ」のあと、返事をした缶はひとつもない。そのぶん、缶は増えた。', impact: '飲酒でストレスは下がった。空き缶は、家具のまま残った。', lines: [say('cat', 'お疲れ、俺。昨日の俺は来ない。'), say('cat', '返事がない。缶は否定しない。'), say('cat', 'じゃあ、缶だけでいい。いい相棒。')] },
  idle: { id: 'stain-boss', kind: 'life', title: 'モクが、天井の染みに負けた。', detail: '染みは昨日と同じ形をしていた。\n\n動いたら負けだと思ったらしい。一時間後も、モクは染みの下にいた。', impact: '何もしない一時間が、本人の中では成果になった。', lines: [say('cat', 'あの染み、昨日より上から見てくる。'), say('cat', '動けって顔してる。動いたら負け。'), say('cat', '今日は、染みの下で暮らす。')] },
  eat: { id: 'expiry-family', kind: 'trouble', title: 'モクが、期限切れを家族と呼んだ。', detail: '冷蔵庫の奥から、昨日の残りが出てきた。\n\n匂いは反対していた。モクは火をつけて、反対を黙らせた。', impact: '空腹は下がった。冷蔵庫の奥は、明日の家族のまま。', lines: [say('cat', '期限は昨日。昨日は家族。'), say('cat', '匂いが反対しても、焼けば黙る。'), say('cat', '残ったら、明日の家族。')] },
  tv: { id: 'rerun-life', kind: 'life', title: 'モクが、再放送に今日の参加を済ませた。', detail: 'オチは知っている。リモコンは遠い。\n\n笑うところだけ一緒に笑って、モクは今日を終えた気になった。', impact: '娯楽欲求は下がった。番組表は、明日も同じところから始まる。', lines: [say('cat', 'この回、前にも見た。オチも知ってる。'), say('cat', 'リモコンまで、往復が遠い。'), say('cat', '笑っとけば、今日は参加したことになる。')] },
  clean: { id: 'clean-ash', kind: 'life', title: 'モクが、空いた床に灰皿を戻した。', detail: '床の色が、少しだけ見えた。\n\nモクはそこをしばらく見て、灰皿を元の位置に置いた。片づけは、それで完了した。', impact: '床は一瞬見えた。灰皿が、その証拠を隠した。', lines: [say('cat', '床、この色だった。知らなかった。'), say('cat', '空いた。ここに置くもの、決まってる。'), say('cat', '灰皿。片づけ、完了。')] },
  sleep: { id: 'sleep-rent', kind: 'life', title: 'モクが、夢の中の家賃を踏み倒した。', detail: '寝息だけが規則正しい。\n\n起きているあいだの約束は、枕の向こうに置いてきた。', impact: '眠気は下がっていく。家賃の約束は、枕の下のまま。', lines: [say('cat', '起きてない。見学は、静かに。'), say('cat', '夢の中なら、家賃がない。'), say('cat', '起こすなら、灰皿を持ってきて。')] },
  chat: { id: 'fill-silence', kind: 'life', title: 'モクが、沈黙を煙で埋めた。', detail: '話の続きは、特にない。\n\n煙が代わりに廊下へ出て、二人のあいだを埋めた。', impact: '立ち話で関係は少し動いた。空気は、モクのほうに寄った。', lines: other => [say('cat', '別に用はない。沈黙が気まずい。'), ...(other ? [say(other, answer(reply.chat, other))] : []), say('cat', 'じゃあ、煙で埋めておく。')] },
  fight: { id: 'smell-follows', kind: 'trouble', title: 'モクが、匂いだけ相手に付けて返した。', detail: '文句は廊下で受け取った。\n\nモクは部屋の側に残り、煙だけを相手に付けて返した。', impact: '口論で関係は悪化した。煙は、モクの部屋を本籍のまま出た。', lines: other => [say('cat', '文句なら、外で聞いた。'), ...(other ? [say(other, answer(reply.fight, other))] : []), say('cat', '帰れ。煙は、ついていく。')] }
};

const DOORS = {
  chat: { id: 'door-chat', kind: 'life', title: name => `${name}が廊下に立ったら、モクは煙を席代にした。`, detail: '会話は成立している。条件が、おかしいだけだ。\n\n灰が一つ落ちるたび、相手の返事は短くなった。', impact: '立ち話で関係は動いた。席代は、服に残る煙で払われた。', lines: actor => [say('cat', '用があるなら、煙の前で言って。'), say(actor, answer(reply.doorChat, actor)), say('cat', '座ると服に残る。それが席代。')] },
  fight: { id: 'door-fight', kind: 'trouble', title: name => `${name}がドアを叩いた。モクは開けなかった。`, detail: 'ドアは閉まったまま、声だけが通った。\n\n開けていたら、灰まで廊下に出ていた。', impact: '口論で関係は悪化した。ドアの向こうに、煙が残った。', lines: actor => [say('cat', 'ドアは開けない。声は通る。'), say(actor, answer(reply.doorFight, actor)), say('cat', '開けたら、灰が向こうまで行く。')] },
  steal: { id: 'door-steal', kind: 'trouble', title: name => `${name}が、モクの棚の一番前を空けた。`, detail: '名前は書いてあった。読まれなかった。\n\n残ったのは、洗われた空の容器だけだった。', impact: '食べ物が消えた。モクのストレスと、相手との関係が悪化した。', lines: actor => [say('cat', 'それ、棚の一番前。昨日の家族。'), say(actor, answer(reply.steal, actor)), say('cat', '洗った容器は、もう食べ物じゃない。')] },
  sell: { id: 'door-sell', kind: 'trouble', title: name => `${name}が、モクの灰皿の横を売場にした。`, detail: '石は、灰皿の足として採用された。\n\n金運が定着したかは、灰の山に聞いてみないとわからない。', impact: '所持金が動き、関係が悪化した。石は、灰皿の足になった。', lines: actor => [say('cat', '石は、灰皿の足でいい。'), say(actor, answer(reply.sell, actor)), say('cat', '定着した灰は、金になるの。'), say(actor, '返すなら、説明が要る。')] }
};

const copyLines = lines => lines.map(line => ({ ...line }));
export function catMutters(action) { return MUTTERS[action] || FALLBACK; }
export function catIncident(state, action, otherType = null) {
  const scene = INCIDENTS[action];
  if (!scene || heard(state, scene.id)) return null;
  mark(state, scene.id);
  const lines = typeof scene.lines === 'function' ? scene.lines(otherType) : copyLines(scene.lines);
  return { kind: scene.kind, title: scene.title, detail: scene.detail, impact: scene.impact, lines };
}
export function catDoorIncident(state, actorType, action) {
  const scene = DOORS[action];
  if (!scene || actorType === 'cat' || !NAMES[actorType] || heard(state, scene.id)) return null;
  mark(state, scene.id);
  return { kind: scene.kind, title: scene.title(NAMES[actorType]), detail: scene.detail, impact: scene.impact, lines: scene.lines(actorType) };
}
export function catOutingLines(state) {
  if (heard(state, 'first-outing')) return null;
  mark(state, 'first-outing');
  return [say('cat', '買い出し。歩いたから、運動した。'), say('cat', '袋の本体は、タバコ。'), say('cat', '食料はおまけ。帰りに一本。')];
}
export function catRentLines(state, paid) {
  const id = paid ? 'rent-ok' : 'rent-short';
  if (heard(state, id)) return null;
  mark(state, id);
  return paid
    ? [say('cat', '払った。偉い。褒めなくていい。'), say('cat', 'タバコ代は削ってない。家賃を削った。'), say('cat', '足りてる。今日は。見てたなら、それでいい。')]
    : [say('cat', '封筒が軽い。灰が重いだけ。'), say('cat', '来週まとめて。今週は、煙がある。'), say('cat', '足りない分は、壁に貸しとく。')];
}
export function catRentScene() {
  return { kind: 'life', title: 'モクが、家賃を払ってタバコ代は守った。', detail: '封筒には、足りる金額が入っていた。\n\n何を削ったのかと聞く相手はいない。タバコは、いつもどおり灰皿にある。', impact: '家賃は払われた。タバコの本数は、減っていない。' };
}

export function createTalk(latestEventId = 0) {
  return { seenEvent: latestEventId, eventId: 0, index: 0, since: 0, queue: [], mutterIndex: 0, mutterAction: '', bubbles: [] };
}
export function stepTalk(talk, state, now, stopped) {
  for (const event of state.events) {
    if (!event.lines?.length || event.id <= talk.seenEvent || event.id === talk.eventId || talk.queue.includes(event.id)) continue;
    talk.queue.push(event.id);
  }
  talk.queue.sort((a, b) => a - b);
  if (talk.queue.length > 3) for (const id of talk.queue.splice(0, talk.queue.length - 3)) talk.seenEvent = Math.max(talk.seenEvent, id);
  if (!talk.eventId && talk.queue.length) { talk.eventId = talk.queue.shift(); talk.index = 0; talk.since = now; }
  const incident = () => talk.eventId ? state.events.find(event => event.id === talk.eventId) : null;
  let reading = incident();
  if (!talk.since) talk.since = now;
  if (!stopped && now - talk.since >= (reading?.lines?.[talk.index] ? SPEECH_MS.line : SPEECH_MS.mutter)) {
    talk.since = now;
    if (reading?.lines?.[talk.index] && talk.index < reading.lines.length - 1) talk.index += 1;
    else if (reading?.lines?.[talk.index]) {
      talk.seenEvent = Math.max(talk.seenEvent, talk.eventId);
      talk.eventId = 0; talk.index = 0; talk.mutterAction = '';
      if (talk.queue.length) { talk.eventId = talk.queue.shift(); talk.index = 0; }
    } else talk.mutterIndex += 1;
  }
  reading = incident();
  const line = reading?.lines?.[talk.index];
  if (line) { talk.bubbles = [{ ...line, text: line.speaker === 'cat' ? mokuNya(line.text) : line.text }]; return talk; }
  const cat = state.residents.find(resident => resident.type === 'cat');
  if (!cat) { talk.bubbles = []; return talk; }
  if (cat.action !== talk.mutterAction) { talk.mutterAction = cat.action; talk.mutterIndex += 1; talk.since = now; }
  const pool = catMutters(cat.action);
  talk.bubbles = [{ speaker: 'cat', name: 'モク', text: mokuNya(pool[talk.mutterIndex % pool.length]) }];
  return talk;
}

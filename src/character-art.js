// Add future approved character art here; unregistered residents retain their draft sprites.
export const SCENE_ART = { src: 'assets/apartments.png', image: null };
// イベント専用の立ち絵。観察画面のドット絵とは独立して管理する。
export const EVENT_ART = {
  cat: 'assets/events/cat.png', hostess: 'assets/events/hostess.png',
  fox: 'assets/events/fox.png', ann: 'assets/events/ann.png',
  peko: 'assets/events/peko.png', sister: 'assets/events/sister.png'
};

export function eventParticipants(event, residents) {
  const speakers = (event.lines || []).map(line => line.speaker);
  const occupants = (event.rooms || []).flatMap(room => residents.filter(r => r.room === room).map(r => r.type));
  return [...new Set([...speakers, ...occupants])].filter(type => EVENT_ART[type]);
}
// 入居者ごとの部屋絵。キーは住人の type。未登録の部屋は従来の共通間取りのまま。
export const ROOM_ART = {
  cat: { src: 'assets/rooms/cat/interior.png', image: null }
};

// ポーズ差分の共通設定：立ち・座りは 96×128（足元 48,126）、寝姿は 160×112（体の下端中央 80,108）。
// 単体版ビルドで画像を埋め込めるよう、パスは省略せず文字列で書く。
const catPose = (src, origin = [48, 126]) => ({ src, origin, image: null });

export const CHARACTER_ART = {
  ann: {
    src: 'assets/characters/ann/idle.png', portraitSrc: 'assets/characters/ann/idle.png', displayHeight: 44, origin: [625, 1250], image: null, portrait: null
  },
  patron: {
    src: 'assets/characters/patron/idle.png', portraitSrc: 'assets/characters/patron/idle.png', displayHeight: 44, origin: [627, 1230], image: null, portrait: null
  },
  peko: {
    src: 'assets/characters/peko/idle.png', portraitSrc: 'assets/characters/peko/idle.png', displayHeight: 44, origin: [680, 1240], image: null, portrait: null
  },
  sister: {
    src: 'assets/characters/sister/idle.png', portraitSrc: 'assets/characters/sister/idle.png', displayHeight: 44, origin: [700, 1230], image: null, portrait: null
  },
  hostess: {
    src: 'assets/characters/hostess/idle.png', portraitSrc: 'assets/characters/hostess/portrait.png', displayHeight: 49, origin: [64, 126], image: null, portrait: null,
    poses: {
      walk_a: catPose('assets/characters/hostess/poses/walk_a.png', [64,126]),
      walk_b: catPose('assets/characters/hostess/poses/walk_b.png', [64,126]),
      sit: catPose('assets/characters/hostess/poses/sit.png', [64,126]),
      sleep: catPose('assets/characters/hostess/poses/sleep.png', [88,108]),
      eat: catPose('assets/characters/hostess/poses/eat.png', [64,126]),
      drink: catPose('assets/characters/hostess/poses/drink.png', [64,126]),
      clean: catPose('assets/characters/hostess/poses/clean.png', [64,126]),
      angry: catPose('assets/characters/hostess/poses/angry.png', [64,126]),
      chat: catPose('assets/characters/hostess/poses/chat.png', [64,126])
    },
    actionPoses: { idle: ['base','sit','base','chat'], tv: 'sit', sleep: 'sleep', eat: 'eat', drink: 'drink', clean: 'clean', fight: 'angry', chat: 'chat', counsel: 'chat', shop: 'base', outing: 'base' }
  },
  cat: {
    src: 'assets/characters/cat/idle.png', portraitSrc: 'assets/characters/cat/portrait.png', displayHeight: 44, origin: [48, 126], image: null, portrait: null,
    // 行動ごとの差分ポーズ。読み込めなかったポーズは基本立ち絵へ自動的に戻る。
    poses: {
      walk_a: catPose('assets/characters/cat/poses/walk_a.png'), walk_b: catPose('assets/characters/cat/poses/walk_b.png'), sit: catPose('assets/characters/cat/poses/sit.png'), sleep: catPose('assets/characters/cat/poses/sleep.png', [80, 108]),
      eat: catPose('assets/characters/cat/poses/eat.png'), drink: catPose('assets/characters/cat/poses/drink.png'), clean: catPose('assets/characters/cat/poses/clean.png'), angry: catPose('assets/characters/cat/poses/angry.png'), chat: catPose('assets/characters/cat/poses/chat.png')
    },
    // 行動 → ポーズ。配列はゲーム内30分ごとに切り替わる「パターン違い」。'base' は基本立ち絵（タバコ＋缶）。
    actionPoses: { idle: ['base', 'sit', 'base', 'chat'], tv: 'sit', eat: 'eat', drink: 'drink', smoke: 'base', clean: 'clean', fight: 'angry', chat: 'chat', sleep: 'sleep', outing: 'base' },
    // タバコの火の位置（足元からの相対ドット）。煙エフェクトの出発点。
    smokeTip: { base: [18, -56] }
  },
  fox: {
    src: 'assets/characters/fox/base-game.png', portraitSrc: 'assets/characters/fox/portrait-game.png', displayHeight: 44, origin: [64, 126], image: null, portrait: null,
    poses: {
      stand: catPose('assets/characters/fox/poses/stand.png', [64,126]),
      walk_a: catPose('assets/characters/fox/poses/walk_a.png', [64,126]),
      walk_b: catPose('assets/characters/fox/poses/walk_b.png', [64,126]),
      sit: catPose('assets/characters/fox/poses/sit.png', [64,126]),
      sleep: catPose('assets/characters/fox/poses/sleep.png', [88,108]),
      eat: catPose('assets/characters/fox/poses/eat.png', [64,126]),
      drink: catPose('assets/characters/fox/poses/drink.png', [64,126]),
      clean: catPose('assets/characters/fox/poses/clean.png', [64,126]),
      angry: catPose('assets/characters/fox/poses/angry.png', [64,126]),
      chat: catPose('assets/characters/fox/poses/chat.png', [64,126])
    },
    actionPoses: {idle:['base','sit','stand','chat'],tv:'sit',eat:'eat',drink:'drink',clean:'clean',fight:'angry',chat:'chat',sleep:'sleep',outing:'stand',smoke:'stand'}
  }
};

export async function loadRoomArt() {
  await Promise.all(Object.values(ROOM_ART).map(async art => {
    art.image = await new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => { console.warn('Room image could not load:', art.src); resolve(null); };
      image.src = art.src;
    });
  }));
}

export async function loadCharacterArt() {
  const load = src => new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => { console.warn('Character image could not load:', src); resolve(null); };
    image.src = src;
  });
  await Promise.all([load(SCENE_ART.src).then(image => { SCENE_ART.image = image; }), ...Object.values(CHARACTER_ART).map(async art => {
    [art.image, art.portrait] = await Promise.all([load(art.src), load(art.portraitSrc)]);
    // 差分ポーズも起動時にまとめて読み込む
    await Promise.all(Object.values(art.poses || {}).map(async pose => { pose.image = await load(pose.src); }));
  })]);
}

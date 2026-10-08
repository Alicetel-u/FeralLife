// Add future approved character art here; unregistered residents retain their draft sprites.
export const SCENE_ART = { src: 'assets/apartments.png', image: null };

// ポーズ差分の共通設定：立ち・座りは 96×128（足元 48,126）、寝姿は 160×112（体の下端中央 80,108）。
// 単体版ビルドで画像を埋め込めるよう、パスは省略せず文字列で書く。
const catPose = (src, origin = [48, 126]) => ({ src, origin, image: null });

export const CHARACTER_ART = {
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
    src: 'assets/characters/fox/idle.png', portraitSrc: 'assets/characters/fox/portrait.png', displayHeight: 44, origin: [48, 126], image: null, portrait: null
  }
};

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

// キャラクター周りのエフェクト（煙・Zzz・怒りマーク・湯気・汗・酔いのハート・もやもや・ため息・ハエ・食べかす・掃除の埃・おしゃべり線）。
// すべてアニメ時刻 t から計算し、内部状態を持たない。一時停止・速度変更・セーブ復元でも破綻しない。
// 座標の単位は「スプライトの1ドット」（u）。足元 (x, y) を原点に、上がマイナス。dir は左右の向き。

const frac = v => v - Math.floor(v);
const OUTLINE = '#262a23';

// ドット絵の小さな記号。'#' が1ドット。
const GLYPHS = {
  Z: ['#####', '...#.', '..#..', '.#...', '#####'],
  heart: ['.#.#.', '#####', '#####', '.###.', '..#..'],
  vein: ['.#...#.', '##...##', '.......', '.......', '.......', '##...##', '.#...#.'],
  drop: ['..#..', '.###.', '#####', '#####', '.###.'],
  bubble: ['.##.', '#..#', '#..#', '.##.']
};

function glyph(ctx, name, cx, cy, s, color, alpha = 1, outline = true) {
  const rows = GLYPHS[name], w = rows[0].length, h = rows.length;
  const x0 = cx - w * s / 2, y0 = cy - h * s / 2, size = Math.max(1, Math.round(s));
  ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  const paint = (dx, dy, col) => {
    ctx.fillStyle = col;
    rows.forEach((row, j) => { for (let i = 0; i < w; i++) if (row[i] === '#') ctx.fillRect(Math.round(x0 + i * s + dx), Math.round(y0 + j * s + dy), size, size); });
  };
  if (outline) for (const [dx, dy] of [[-size, 0], [size, 0], [0, -size], [0, size]]) paint(dx, dy, OUTLINE);
  paint(0, 0, color);
  ctx.restore();
}
function dot(ctx, x, y, s, color, alpha = 1) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = Math.min(1, alpha); ctx.fillStyle = color;
  const size = Math.max(1, Math.round(s));
  ctx.fillRect(Math.round(x - size / 2), Math.round(y - size / 2), size, size);
  ctx.restore();
}

/**
 * 住人の周囲にエフェクトを描く。
 * o = { x, y, u, dir, t, action, pose, moving, needs, trash, seed, speaking, tip }
 *   tip … タバコの火の位置（足元からの相対ドット）。省略時は既定値。
 */
export function drawCharacterEffects(ctx, o) {
  const { x, y, u, dir = 1, t, action, pose, moving, needs = {}, trash = 0, seed = 0, speaking } = o;
  const P = (dx, dy) => [x + dx * u * dir, y + dy * u];   // 向きに合わせた相対座標
  const A = (dx, dy) => [x + dx * u, y + dy * u];         // 向きに関係ない相対座標
  const sleeping = action === 'sleep' && !moving;
  const head = sleeping ? (pose === 'sleep' ? [40, -62] : [-70, -14]) : pose === 'sit' ? [0, -78] : [0, -84];
  const angry = !sleeping && (action === 'fight' || (needs.stress ?? 0) >= 88);
  const t0 = t + seed * 1.37;

  // 1. タバコの煙：ゆらぎながら広がって消える粒＋ときどき吐き出す煙の輪
  if (action === 'smoke' && !moving) {
    const tip = o.tip || [18, -56];
    for (let i = 0; i < 9; i++) {
      const s = frac(t0 * .35 + i / 9);
      const [sx, sy] = P(tip[0] + Math.sin(s * 7 + i * 1.7) * 3 * s + s * 8, tip[1] - s * 48);
      dot(ctx, sx, sy, (1.2 + s * 3.4) * u, '#d8d9e2', .6 * Math.pow(1 - s, 1.3));
    }
    const p = frac(t0 / 5);
    if (p < .4) {
      const k = p / .4, [rx, ry] = P(tip[0] + 6 + k * 18, tip[1] - 8 - k * 20), rad = (3 + k * 9) * u;
      for (let a = 0; a < 10; a++) dot(ctx, rx + Math.cos(a / 10 * Math.PI * 2) * rad, ry + Math.sin(a / 10 * Math.PI * 2) * rad * .6, 1.6 * u, '#e4e4ea', .5 * (1 - k));
    }
  }

  // 2. 寝息：ふわふわ昇る Z
  if (sleeping) {
    for (let i = 0; i < 3; i++) {
      const s = frac(t0 * .28 + i / 3);
      const [zx, zy] = A(head[0] + 8 + s * 20 + Math.sin(s * 6) * 2, head[1] - 14 - s * 36);
      glyph(ctx, 'Z', zx, zy, (.6 + s * .7) * u, '#ece6c6', s < .15 ? s / .15 : 1 - (s - .15) / .85);
    }
    // 鼻ちょうちん（ふくらんだりしぼんだり）
    const b = .5 + .5 * Math.sin(t0 * 1.4);
    // 寝姿の鼻先（足元原点からのドット）。額の基準点から足すと髪や頬に埋もれる。
    if (pose === 'sleep') glyph(ctx, 'bubble', ...A(22, -39), (1.2 + b * .5) * u, '#bfe2ef', .9, false);
  }

  // 3. 怒り：脈打つ怒りマーク＋頭から湯気
  if (angry) {
    const pulse = Math.sin(t0 * 10) > 0 ? 1.15 : .95;
    glyph(ctx, 'vein', ...P(head[0] + 22, head[1] - 22), 1.2 * pulse * u, '#d8473a');
    for (let i = 0; i < 4; i++) {
      const s = frac(t0 * 1.1 + i / 4), side = i % 2 ? 1 : -1;
      const [sx, sy] = A(head[0] + side * (18 + s * 8), head[1] - 24 - s * 22);
      dot(ctx, sx, sy, (2 + s * 3) * u, '#f3f1ea', .7 * (1 - s));
    }
  }

  // 4. 汗：掃除中、不潔、または怒っている時
  if (!sleeping && (action === 'clean' || (needs.hygiene ?? 100) < 25 || angry)) {
    for (let i = 0; i < 2; i++) {
      const s = frac(t0 * .7 + i * .5), side = i ? 1 : -1;
      const [dx, dy] = A(head[0] + side * 24, head[1] - 6 + s * s * 26);
      glyph(ctx, 'drop', dx, dy, .8 * u, '#a4d6ec', 1 - s);
    }
  }

  // 5. 酔い：ほろ酔いハート
  if (!sleeping && ((needs.alcohol ?? 0) >= 70 || action === 'drink')) {
    for (let i = 0; i < 3; i++) {
      const s = frac(t0 * .4 + i / 3);
      const [hx, hy] = P(head[0] - 18 + i * 6 + Math.sin(s * 9 + i) * 4, head[1] + 4 - s * 40);
      glyph(ctx, 'heart', hx, hy, (.5 + s * .4) * u, '#ea8ea4', (1 - s) * .9);
    }
  }

  // 6. もやもや＋ため息：ストレスが高い時
  if (!sleeping && !angry && (needs.stress ?? 0) >= 70) {
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2 + t0 * .8;
      const [cx, cy] = A(head[0] + Math.cos(a) * 14 + Math.sin(t0 * 3 + i) * 1.5, head[1] - 40 + Math.sin(a) * 5);
      dot(ctx, cx, cy, (4 + (i % 3)) * u, i % 2 ? '#4a4e56' : '#5d616a', .85);
    }
    const p = frac(t0 / 6);
    if (p < .3) { const k = p / .3; dot(ctx, ...P(head[0] + 14 + k * 16, head[1] + 22 + k * 6), (2 + k * 4) * u, '#e2e6e8', .7 * (1 - k)); }
  }

  // 7. ハエ：部屋が散らかっている時
  if (trash >= 40 && !moving) {
    for (let i = 0; i < 3; i++) {
      const a = t0 * (2.6 + i * .7) + i * 2.1;
      const [fx, fy] = A(Math.cos(a) * (24 + i * 4), -34 + Math.sin(a * 2) * 12 - i * 6);
      dot(ctx, fx, fy, 1.4 * u, '#1b1d19');
      if (frac(t0 * 14 + i * .3) < .5) dot(ctx, fx, fy - 1.2 * u, 1.2 * u, '#c9d0d4', .8);
    }
  }

  // 8. 食べかす：もぐもぐ中にこぼれて床へ落ちる
  if (action === 'eat' && !moving) {
    for (let i = 0; i < 4; i++) {
      const s = frac(t0 * .9 + i / 4);
      const [cx, cy] = P(-2 + i * 3 + Math.sin(i * 3) * 2, -62 + s * s * 62);
      dot(ctx, cx, cy, 1.4 * u, i % 2 ? '#efe2c0' : '#e2c788', 1 - s * .4);
    }
  }

  // 9. 掃除の埃：足元から舞い上がる
  if (action === 'clean' && !moving) {
    for (let i = 0; i < 5; i++) {
      const s = frac(t0 * .7 + i / 5), side = i % 2 ? 1 : -1;
      const [px, py] = A(side * (10 + s * 18), -2 - s * 10);
      dot(ctx, px, py, (2 + s * 4) * u, '#c3b892', .65 * (1 - s));
    }
  }

  // 10. おしゃべり線：吹き出しが出ていない会話中
  if (action === 'chat' && !moving && !speaking && frac(t0 * 1.6) < .6) {
    for (let i = -1; i <= 1; i++) for (let k = 0; k < 3; k++) {
      const [lx, ly] = P(head[0] + 26 + k * 2.2, head[1] + 14 + i * (5 + k * 1.6));
      dot(ctx, lx, ly, 1.3 * u, '#f3ead2');
    }
  }
}

// スプライト本体に掛ける動き・色味（呼吸、千鳥足、怒りの震え、テレビの照り返し、酔いの赤み）
export function spriteMotion(action, moving, needs = {}, t = 0, pose = 'base') {
  const m = { dx: 0, sy: 1, rotate: 0, tint: null };
  if (moving) return m;
  if (action === 'sleep') { m.sy = 1 + Math.sin(t * 1.4) * .025; return m; }
  m.sy = 1 + Math.sin(t * 1.8) * .012;                                   // 呼吸
  if (action === 'fight') m.dx = Math.sin(t * 45) * .7;                  // 怒りで震える
  if ((needs.alcohol ?? 0) >= 70 || action === 'drink') {
    if ((needs.alcohol ?? 0) >= 70 && pose !== 'sit') m.rotate = Math.sin(t * 1.2) * .045; // 千鳥足
    m.tint = 'rgba(232,96,96,.10)';
  }
  if (action === 'tv') m.tint = Math.sin(t * 3) > 0 ? 'rgba(120,196,196,.18)' : 'rgba(150,160,220,.15)';
  return m;
}

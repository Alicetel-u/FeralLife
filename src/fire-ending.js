// A self-contained cinematic. Animation time pauses when the tab is hidden.
export function fireEndingPhase(seconds) {
  return seconds < 5 ? 'room' : seconds < 11 ? 'building' : 'ruins';
}

export function fireEndingHTML(failure) {
  return `<section class="act-screen fire-cinematic" data-fire-phase="room"><div class="fire-camera"><img class="fire-room-background" src="assets/rooms/cat/interior.png" alt="炎に包まれる101号室"><img class="fire-building-background" src="assets/apartments.png" alt="炎が広がるけもの荘"><canvas class="fire-canvas" width="960" height="540" aria-hidden="true"></canvas><div class="fire-soot"></div></div><div class="fire-letterbox top"></div><div class="fire-letterbox bottom"></div><h2 id="modal-title" class="visually-hidden">けもの荘の火災</h2><p class="fire-narration" aria-live="polite">昨日まで、ただ散らかっているだけの部屋だった。</p><button class="fire-skip" data-fire-finish>スキップ</button></section>`;
}

export function startFireEnding(root, failure, finish, options = {}) {
  const canvas = root.querySelector('.fire-canvas'), ctx = canvas.getContext('2d');
  const camera = root.querySelector('.fire-camera');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const kitchen = failure?.startsWith('dinner-');
  let elapsed = 0, previous = performance.now(), frameId, phase = '';
  const W = canvas.width, H = canvas.height;
  const hash = n => { const x = Math.sin(n * 78.233 + 12.71) * 43758.5453; return x - Math.floor(x); };
  function draw(t, current) {
    ctx.clearRect(0, 0, W, H);
    const intensity = current === 'ruins' ? .3 : current === 'building' ? 1 : Math.min(1, .35 + t / 5);
    const glow = ctx.createLinearGradient(0, 0, 0, H);
    glow.addColorStop(0, 'rgba(25,14,14,.1)'); glow.addColorStop(.55, `rgba(164,28,5,${intensity * .32})`); glow.addColorStop(1, `rgba(255,87,9,${intensity * .75})`);
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    // Billowing smoke collects under the ceiling and rises from the roof.
    for (let i = 0; i < 38; i++) {
      const p = (t * (.075 + hash(i) * .06) + hash(i + 40)) % 1;
      const x = hash(i + 10) * W + Math.sin(t * .65 + i) * 45;
      const y = H * .78 - p * H;
      const radius = 38 + p * 90 + hash(i + 15) * 35;
      const smoke = ctx.createRadialGradient(x, y, 0, x, y, radius);
      smoke.addColorStop(0, `rgba(24,21,23,${(.2 + p * .4) * intensity})`); smoke.addColorStop(1, 'rgba(24,21,23,0)');
      ctx.fillStyle = smoke; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    // Separate flame tongues along floor, windows and roof; yellow inner cores.
    const sources = current === 'ruins' ? [[.2,.91,.16],[.55,.94,.2],[.82,.92,.12]] : current === 'room' ? [[kitchen ? .72 : .31, .76, .35], [.17,.94,.48], [.53,.98,.6], [.83,.97,.5]] : [[.18,.78,.4],[.42,.78,.5],[.65,.79,.45],[.23,.49,.28],[.48,.49,.35],[.72,.49,.3],[.5,.35,.22],[.8,.95,.4],[.1,.96,.35]];
    for (let j = 0; j < sources.length; j++) {
      const [sx, sy, height] = sources[j];
      for (let i = 0; i < 12; i++) {
        const seed = j * 12 + i, p = (t * (.7 + hash(seed) * .45) + hash(seed + 60)) % 1;
        const x = sx * W + (i - 5.5) * 12;
        const base = sy * H + Math.sin(seed * 2.7) * 12;
        const h = H * height * intensity * (.45 + .55 * Math.sin(p * Math.PI));
        const width = 15 + hash(seed + 90) * 20;
        const sway = Math.sin(t * 4 + seed) * 20;
        for (let layer = 0; layer < 3; layer++) {
          const scale = 1 - layer * .24, tip = base - h * scale;
          const fireColor = ['239,64,27', '255,147,27', '255,232,152'][layer];
          const flame = ctx.createLinearGradient(0, tip, 0, base);
          flame.addColorStop(0, `rgba(${fireColor},.7)`);
          flame.addColorStop(.55, `rgba(${fireColor},.9)`);
          flame.addColorStop(1, `rgba(${fireColor},0)`);
          ctx.fillStyle = flame;
          ctx.beginPath(); ctx.moveTo(x - width * scale, base);
          ctx.bezierCurveTo(x - width * 1.3 * scale, base - h * .45, x + sway - width * .3, tip + h * .23, x + sway, tip);
          ctx.bezierCurveTo(x + sway + width * .15, tip + h * .35, x + width * 1.3 * scale, base - h * .35, x + width * scale, base);
          ctx.closePath(); ctx.fill();
        }
      }
    }
    // Embers sweep upwards; falling ash remains after the building burns down.
    for (let i = 0; i < 110; i++) {
      const p = (t * (.16 + hash(i + 200) * .17) + hash(i + 400)) % 1;
      const x = hash(i + 300) * W + Math.sin(p * 7 + i) * 45 + p * 70;
      const y = current === 'ruins' ? p * H : H - p * H * 1.2;
      ctx.globalAlpha = Math.sin(p * Math.PI) * .9;
      ctx.fillStyle = current === 'ruins' ? '#a29b94' : i % 3 ? '#ffb442' : '#fff1b5';
      ctx.fillRect(x, y, 2 + hash(i) * 3, current === 'ruins' ? 2 : 4 + hash(i + 100) * 8);
    }
    ctx.globalAlpha = 1;
    if (current === 'ruins') {
      ctx.fillStyle = '#100e11';
      ctx.beginPath(); ctx.moveTo(0,H);
      for (let x = 0; x <= W; x += 18) ctx.lineTo(x, H * (.79 + hash(x) * .15));
      ctx.lineTo(W,H); ctx.fill();
      for (let i = 0; i < 18; i++) { const x = hash(i + 700) * W; ctx.fillStyle = '#271c1b'; ctx.fillRect(x,H*.76,9,H*.24); }
    }
  }
  function tick(now) {
    if (!root.isConnected) return;
    const dt = Math.min(.1, (now - previous) / 1000); previous = now;
    if (!document.hidden) elapsed += dt;
    const next = options.ambient ? 'building' : fireEndingPhase(elapsed);
    if (next !== phase) {
      phase = next; root.dataset.firePhase = phase;
      const narration = phase === 'building' ? '誰もいない部屋まで、炎だけが律儀に訪ねていった。' : phase === 'ruins' ? '家賃は、一円も入らなかった。帰る場所も、なくなった。' : '昨日まで、ただ散らかっているだけの部屋だった。';
      root.querySelector('.fire-narration').textContent = narration;
    }
    if (!document.hidden) {
      draw(reduced ? (phase === 'room' ? 3 : phase === 'building' ? 8 : 12) : elapsed, phase);
      const shake = !options.ambient && !reduced && phase !== 'ruins' ? (phase === 'building' ? 5 : 3) : 0;
      camera.style.transform = `translate(${Math.sin(elapsed * 29) * shake}px,${Math.cos(elapsed * 23) * shake * .6}px) scale(1.025)`;
    }
    if (!options.ambient && elapsed >= 15) { finish(); return; }
    frameId = requestAnimationFrame(tick);
  }
  frameId = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frameId);
}

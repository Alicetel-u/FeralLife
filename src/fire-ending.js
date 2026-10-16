// A self-contained cinematic. Animation time pauses when the tab is hidden.
export function fireEndingPhase(seconds) {
  return seconds < 5 ? 'room' : seconds < 11 ? 'building' : 'ruins';
}

export function fireEndingHTML(failure) {
  return `<section class="act-screen fire-cinematic" data-fire-phase="room"><div class="fire-camera"><img class="fire-room-background" src="assets/rooms/cat/interior-v2.png" alt="炎に包まれる101号室"><img class="fire-building-background" src="assets/apartments.png" alt="炎が広がるけもの荘"><canvas class="fire-canvas" width="960" height="540" aria-hidden="true"></canvas><div class="fire-soot"></div></div><div class="fire-letterbox top"></div><div class="fire-letterbox bottom"></div><h2 id="modal-title" class="visually-hidden">けもの荘の火災</h2><p class="fire-narration" aria-live="polite">昨日まで、ただ散らかっているだけの部屋だった。</p><button class="fire-skip" data-fire-finish>クリックで次へ</button></section>`;
}

// Gradients use local coordinates and inherit the same transform as the path.
// Geometry, particle counts, phase timing and refresh rate stay unchanged.
let fireSmokeTexture=null;
function smokeTextureFor(canvas){
 if(fireSmokeTexture)return fireSmokeTexture;
 const texture=(canvas.ownerDocument||document).createElement('canvas');texture.width=texture.height=384;
 const pen=texture.getContext('2d'),gradient=pen.createRadialGradient(192,192,0,192,192,192);
 gradient.addColorStop(0,'rgba(24,21,23,1)');gradient.addColorStop(1,'rgba(24,21,23,0)');pen.fillStyle=gradient;pen.fillRect(0,0,384,384);
 fireSmokeTexture=texture;return texture;
}
export function createFirePainter(canvas,kitchen=false) {
 const ctx=canvas.getContext('2d'),W=canvas.width,H=canvas.height;
 const hash=n=>{const x=Math.sin(n*78.233+12.71)*43758.5453;return x-Math.floor(x);};
 ctx.setTransform(1,0,0,1,0,0);
 const smokeTexture=smokeTextureFor(canvas);
 const flameGradients=['239,64,27','255,147,27','255,232,152'].map((color,layer)=>{
  const scale=1-layer*.24,g=ctx.createLinearGradient(0,-scale,0,0);
  g.addColorStop(0,'rgba('+color+',.7)');g.addColorStop(.55,'rgba('+color+',.9)');g.addColorStop(1,'rgba('+color+',0)');return g;
 });
 const smokeParticles=Array.from({length:38},(_,i)=>({i,speed:.075+hash(i)*.06,offset:hash(i+40),x:hash(i+10)*W,radius:38+hash(i+15)*35}));
 const sourceSets={ruins:[[.2,.91,.16],[.55,.94,.2],[.82,.92,.12]],room:[[kitchen?.72:.31,.76,.35],[.17,.94,.48],[.53,.98,.6],[.83,.97,.5]],building:[[.18,.78,.4],[.42,.78,.5],[.65,.79,.45],[.23,.49,.28],[.48,.49,.35],[.72,.49,.3],[.5,.35,.22],[.8,.95,.4],[.1,.96,.35]]};
 const flameParticles=Object.fromEntries(Object.entries(sourceSets).map(([phase,sources])=>[phase,sources.flatMap(([sx,sy,height],j)=>Array.from({length:12},(_,i)=>{
  const seed=j*12+i;return {seed,x:sx*W+(i-5.5)*12,base:sy*H+Math.sin(seed*2.7)*12,height:H*height,width:15+hash(seed+90)*20,speed:.7+hash(seed)*.45,offset:hash(seed+60)};
 }))]));
 const embers=Array.from({length:110},(_,i)=>({i,speed:.16+hash(i+200)*.17,offset:hash(i+400),x:hash(i+300)*W,width:2+hash(i)*3,height:4+hash(i+100)*8}));
 const rubblePoints=Array.from({length:Math.floor(W/18)+1},(_,i)=>[i*18,H*(.79+hash(i*18)*.15)]);
 const rubblePosts=Array.from({length:18},(_,i)=>hash(i+700)*W);
 const fixedGlows=new Map();
 const glowFor=intensity=>{
  if(fixedGlows.has(intensity))return fixedGlows.get(intensity);
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(25,14,14,.1)');g.addColorStop(.55,'rgba(164,28,5,'+intensity*.32+')');g.addColorStop(1,'rgba(255,87,9,'+intensity*.75+')');
  if(intensity===1||intensity===.3)fixedGlows.set(intensity,g);return g;
 };
 return function draw(t,current){
  ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.clearRect(0,0,W,H);
  const intensity=current==='ruins'?.3:current==='building'?1:Math.min(1,.35+t/5);
  ctx.fillStyle=glowFor(intensity);ctx.fillRect(0,0,W,H);
  for(const particle of smokeParticles){
   const p=(t*particle.speed+particle.offset)%1,x=particle.x+Math.sin(t*.65+particle.i)*45,y=H*.78-p*H,radius=particle.radius+p*90;
   ctx.globalAlpha=(.2+p*.4)*intensity;ctx.drawImage(smokeTexture,x-radius,y-radius,radius*2,radius*2);
  }
  ctx.globalAlpha=1;
  for(const particle of flameParticles[current]){
   const p=(t*particle.speed+particle.offset)%1,h=particle.height*intensity*(.45+.55*Math.sin(p*Math.PI)),sway=Math.sin(t*4+particle.seed)*20/particle.width;
   ctx.setTransform(particle.width,0,0,h,particle.x,particle.base);
   for(let layer=0;layer<3;layer++){
    const scale=1-layer*.24;ctx.fillStyle=flameGradients[layer];ctx.beginPath();ctx.moveTo(-scale,0);
    ctx.bezierCurveTo(-1.3*scale,-.45,sway-.3,-scale+.23,sway,-scale);
    ctx.bezierCurveTo(sway+.15,-scale+.35,1.3*scale,-.35,scale,0);ctx.closePath();ctx.fill();
   }
  }
  ctx.setTransform(1,0,0,1,0,0);
  for(const particle of embers){
   const p=(t*particle.speed+particle.offset)%1,x=particle.x+Math.sin(p*7+particle.i)*45+p*70,y=current==='ruins'?p*H:H-p*H*1.2;
   ctx.globalAlpha=Math.sin(p*Math.PI)*.9;ctx.fillStyle=current==='ruins'?'#a29b94':particle.i%3?'#ffb442':'#fff1b5';ctx.fillRect(x,y,particle.width,current==='ruins'?2:particle.height);
  }
  ctx.globalAlpha=1;
  if(current==='ruins'){
   ctx.fillStyle='#100e11';ctx.beginPath();ctx.moveTo(0,H);for(const [x,y]of rubblePoints)ctx.lineTo(x,y);ctx.lineTo(W,H);ctx.fill();
   ctx.fillStyle='#271c1b';for(const x of rubblePosts)ctx.fillRect(x,H*.76,9,H*.24);
  }
 };
}

export function startFireEnding(root, failure, finish, options = {}) {
  const canvas = root.querySelector('.fire-canvas');
  const camera = root.querySelector('.fire-camera');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const kitchen = failure?.startsWith('dinner-');
  let elapsed = 0, previous = performance.now(), frameId, phase = '', paintedPhase='';
  const draw=createFirePainter(canvas,kitchen);
  let stopped=false;
  function stop(){stopped=true;cancelAnimationFrame(frameId);root.removeEventListener('click',nextMessage);}
  function complete(){if(stopped)return;stop();finish();}
  function nextMessage(){
    if(stopped)return;
    if(elapsed>=11){complete();return;}
    elapsed=elapsed<5?5:11;
    cancelAnimationFrame(frameId);previous=performance.now();tick(previous);
  }
  if(!options.ambient)root.addEventListener('click',nextMessage);
  function tick(now) {
    if(stopped||!root.isConnected){stop();return;}
    const dt = Math.min(.1, (now - previous) / 1000); previous = now;
    if (!document.hidden) elapsed += dt;
    const next = options.ambient ? 'building' : fireEndingPhase(elapsed);
    if (next !== phase) {
      phase = next; root.dataset.firePhase = phase;
      const tragedy=options.firstTragedy===true;
      const narration = tragedy?(phase==='room'?'燃え上がる101号室。もう、モクの声は聞こえない。':phase==='building'?'「……嘘だろ。さっきまで普通に話してたじゃねえか……。」':'「ゴミ袋に捨てろって……俺が……。すまねえ、モク……。」'):(phase === 'building' ? '誰もいない部屋まで、炎だけが律儀に訪ねていった。' : phase === 'ruins' ? '家賃は、一円も入らなかった。帰る場所も、なくなった。' : '昨日まで、ただ散らかっているだけの部屋だった。');
      const caption = root.querySelector('.fire-narration');
      caption.classList.remove('fire-line-visible');
      caption.textContent = narration;
      // Restart the fade for each fire phase, including skipped phases.
      void caption.offsetWidth;
      caption.classList.add('fire-line-visible');
    }
    if (!document.hidden) {
      if(!reduced||paintedPhase!==phase){draw(reduced ? (phase === 'room' ? 3 : phase === 'building' ? 8 : 12) : elapsed, phase);paintedPhase=phase;}
      const shake = !options.ambient && !reduced && phase !== 'ruins' ? (phase === 'building' ? 5 : 3) : 0;
      if(shake)camera.style.transform = `translate(${Math.sin(elapsed * 29) * shake}px,${Math.cos(elapsed * 23) * shake * .6}px) scale(1.025)`;
      else if(camera.style.transform!=='scale(1.025)')camera.style.transform='scale(1.025)';
    }
    if (!options.ambient && elapsed >= 15) { complete(); return; }
    frameId = requestAnimationFrame(tick);
  }
  frameId = requestAnimationFrame(tick);
  return stop;
}

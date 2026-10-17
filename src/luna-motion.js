// A short acting study, deliberately separate from the complete opening.
// Eight authored poses share ground anchors; the camera, weather and body
// motion have independent clocks. All authored times are in seconds.
export const LUNA_MOTION_ASSETS = {
 background:'assets/events/luna-courtyard-plate.png',
 poses:'assets/events/luna-collapse-sheet.png'
};
export const LUNA_MOTION_DURATION = 10.5;
const lunaPoseTimes = [0,.32,.45,.58,.72,.86,1.02,1.18];
const lunaPoseRects = [
 [0,0,444,510,484],[444,0,443,510,484],
 [887,0,444,510,484],[1331,0,443,510,484],
 [0,510,444,377,342],[444,510,443,377,346],
 [887,510,444,377,342],[1331,510,443,377,337]
];
const lunaClamp = value=>Math.max(0,Math.min(1,value));
const lunaEase = value=>{const p=lunaClamp(value);return p*p*(3-2*p);};
export const LUNA_MOTION_VOICE = {id:'shelter',speaker:'hostess',emotion:'tired',text:'……ここなら、しばらく隠れられるかな'};

export function lunaMotionState(seconds,reduced=false){
 const t=Math.max(0,Math.min(LUNA_MOTION_DURATION,seconds));
 const reveal=lunaEase((t-2.8)/4.7);
 const pose=reduced?7:Math.max(0,lunaPoseTimes.findLastIndex(at=>t>=at));
 return {
  time:t,pose,phase:t<1.4?'collapse':t<2.8?'breath':t<7.5?'reveal':'hold',
  backgroundScale:reduced?1.02:1.4-.38*reveal,
  backgroundY:reduced?0:-100*(1-reveal),
  characterScale:reduced?1.74:2.42-.68*reveal,
  floorY:reduced?1030:1070-40*reveal,
  breath:!reduced&&t>1.4?Math.sin((t-1.4)*3.1)*Math.exp(-.045*(t-1.4)):0,
  impact:!reduced&&t>1.02&&t<1.6?Math.sin((t-1.02)*45)*Math.exp(-(t-1.02)*10)*4:0,
  fade:lunaClamp(t/.35),subtitle:t>=8&&t<10.1?LUNA_MOTION_VOICE.text:''
 };
}

export function lunaMotionHTML(){
 return `<section class="act-screen luna-film luna-motion" data-luna-motion tabindex="-1" aria-label="座り込むルナとけもの荘・演出試作">
 <h2 id="modal-title" class="visually-hidden">ルナ・座り込む場面の試作</h2>
 <div class="luna-film-frame"><canvas class="luna-motion-canvas" width="1920" height="1080" aria-label="ルナが膝を折って座り込み、背中越しにけもの荘を見上げる"></canvas></div>
 <p class="luna-film-subtitle" aria-live="polite" aria-atomic="true"></p>
 <div class="luna-motion-gate"><small>第二幕 · 演出試作</small><button type="button" data-motion-start disabled>準備しています…</button></div>
 <div class="luna-film-controls"><button type="button" data-motion-pause disabled aria-label="一時停止">Ⅱ</button><button type="button" data-motion-replay disabled>最初から</button><button type="button" data-motion-exit>第二幕へ</button></div>
 </section>`;
}

export function startLunaMotion(root,onExit,voice=null,sound=null){
 const section=root.querySelector('[data-luna-motion]');if(!section)return ()=>{};
 const canvas=section.querySelector('canvas'),ctx=canvas.getContext('2d');
 const gate=section.querySelector('.luna-motion-gate'),start=section.querySelector('[data-motion-start]');
 const pause=section.querySelector('[data-motion-pause]'),replay=section.querySelector('[data-motion-replay]');
 const subtitle=section.querySelector('.luna-film-subtitle');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let destroyed=false,ready=false,running=false,paused=false,elapsed=0,last=null,raf=0,spoken=false,landed=false;
 let background,poses,context=null,rainSource=null,noiseBuffer=null;
 const load=src=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('image'));image.src=src;});
 const stopSound=()=>{try{rainSource?.stop();rainSource?.disconnect();}catch{}rainSource=null;};
 // A low rain bed and a soft cloth/ground contact. Dialogue remains a separate
 // voice cue and can be recorded later without baking it into the animation.
 const startSound=()=>{
  if(!sound?.enabled)return;
  try{
   const Type=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Type)return;
   context ||= new Type();context.resume().catch(()=>{});stopSound();
   if(!noiseBuffer){noiseBuffer=context.createBuffer(1,context.sampleRate*2,context.sampleRate);const data=noiseBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;}
   const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();
   source.buffer=noiseBuffer;source.loop=true;filter.type='lowpass';filter.frequency.value=1600;gain.gain.value=sound.volume*.045;
   source.connect(filter);filter.connect(gain);gain.connect(context.destination);source.start();rainSource=source;
   source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
  }catch{}
 };
 const impactSound=()=>{
  if(!context||!sound?.enabled)return;
  try{const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain(),at=context.currentTime;
   source.buffer=noiseBuffer;filter.type='lowpass';filter.frequency.value=300;gain.gain.setValueAtTime(sound.volume*.22,at);gain.gain.exponentialRampToValueAtTime(.0001,at+.24);
   source.connect(filter);filter.connect(gain);gain.connect(context.destination);source.start(at);source.stop(at+.25);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
  }catch{}
 };
 const drawBody=(state,reflection=false)=>{
  const [sx,sy,sw,sh,anchorY]=lunaPoseRects[state.pose];
  const scale=state.characterScale,dx=960-250*scale,dy=state.floorY-anchorY*scale;
  ctx.save();
  if(reflection){ctx.translate(0,state.floorY);ctx.scale(1,-.23);ctx.translate(0,-state.floorY);ctx.globalAlpha=.10;}
  // Horizontal strips give the settled hair/shoulders a small breathing lag,
  // rather than translating the entire character as a rigid card.
  const bands=32;
  for(let i=0;i<bands;i++){
   const sourceY=sh*i/bands,height=sh/bands;
   const upper=state.pose===7?Math.pow(1-i/bands,2):0;
   const sway=state.breath*.9*upper;
   ctx.drawImage(poses,sx,sy+sourceY,sw,height,dx+sway,dy+sourceY*scale-state.breath*2*upper,sw*scale,height*scale+.7);
  }
  ctx.restore();
 };
 const paint=()=>{
  if(!ready||destroyed)return;
  const state=lunaMotionState(elapsed,reduced);section.dataset.phase=state.phase;section.dataset.pose=String(state.pose);
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#03060c';ctx.fillRect(0,0,1920,1080);
  ctx.save();ctx.translate(0,state.impact);
  const scale=state.backgroundScale,bw=1920*scale,bh=1080*scale;
  ctx.drawImage(background,960-bw/2,540-bh/2+state.backgroundY,bw,bh);
  const night=ctx.createLinearGradient(0,0,0,1080);night.addColorStop(0,'#07102035');night.addColorStop(.6,'#07102008');night.addColorStop(1,'#01050e55');ctx.fillStyle=night;ctx.fillRect(0,0,1920,1080);
  const shadow=ctx.createRadialGradient(960,state.floorY,5,960,state.floorY,350);shadow.addColorStop(0,'#01040bc0');shadow.addColorStop(1,'#01040b00');ctx.save();ctx.translate(0,state.floorY*.8);ctx.scale(1,.2);ctx.fillStyle=shadow;ctx.fillRect(350,state.floorY-400,1220,800);ctx.restore();
  drawBody(state,true);drawBody(state);
  if(!reduced){
   // Rain has depth: nearer streaks move faster and drift further sideways.
   for(let i=0;i<96;i++){
    const depth=(i%3+1)/3,speed=270+depth*620;
    const x=((i*179.31+elapsed*45*depth)%2100)-90,y=(i*97.1+elapsed*speed)%1150-35;
    ctx.strokeStyle=`rgba(177,201,228,${.025+depth*.055})`;ctx.lineWidth=.5+depth;
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-3*depth,y+8+depth*17);ctx.stroke();
   }
   for(let i=0;i<20;i++){
    const age=(elapsed*.65+i*.173)%1,x=130+(i*157)%1690,y=890+(i*73)%175;
    ctx.strokeStyle=`rgba(232,200,145,${(1-age)*.10})`;ctx.lineWidth=.7;ctx.beginPath();ctx.ellipse(x,y,age*23,age*4,0,0,Math.PI*2);ctx.stroke();
   }
   const splash=elapsed-1.05;
   if(splash>0&&splash<.8){ctx.strokeStyle=`rgba(220,209,185,${(1-splash/.8)*.3})`;ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(960,state.floorY-8,20+splash*180,3+splash*24,0,0,Math.PI*2);ctx.stroke();}
  }
  ctx.restore();
  const vignette=ctx.createRadialGradient(960,500,350,960,500,1150);vignette.addColorStop(0,'#02040a00');vignette.addColorStop(1,'#02040a9c');ctx.fillStyle=vignette;ctx.fillRect(0,0,1920,1080);
  if(state.fade<1){ctx.fillStyle=`rgba(3,6,12,${1-state.fade})`;ctx.fillRect(0,0,1920,1080);}
  subtitle.textContent=state.subtitle;subtitle.classList.toggle('visible',!!state.subtitle);
 };
 const begin=()=>{if(!ready||destroyed)return;voice?.stop();elapsed=0;last=null;spoken=false;landed=false;paused=false;running=true;gate.hidden=true;pause.disabled=false;replay.disabled=false;pause.textContent='Ⅱ';pause.setAttribute('aria-label','一時停止');startSound();paint();};
 const tick=now=>{
  if(destroyed)return;
  const delta=last===null?0:Math.min(.08,(now-last)/1000);last=now;
  if(running&&!paused&&!document.hidden){
   elapsed+=delta;
   if(elapsed>=1.05&&!landed){landed=true;impactSound();}
   if(elapsed>=8&&!spoken){spoken=true;voice?.play(LUNA_MOTION_VOICE,'luna-motion:shelter');}
   if(voice?.busy)elapsed=Math.min(elapsed,9.6);
   if(elapsed>=LUNA_MOTION_DURATION){elapsed=LUNA_MOTION_DURATION;running=false;stopSound();pause.disabled=true;replay.textContent='もう一度見る';}
   paint();
  }
  raf=requestAnimationFrame(tick);
 };
 const toggle=()=>{if(!running)return;paused=!paused;pause.textContent=paused?'▶':'Ⅱ';pause.setAttribute('aria-label',paused?'再生':'一時停止');pause.setAttribute('aria-pressed',String(paused));last=null;if(paused){voice?.stop();stopSound();}else{spoken=elapsed>10.1;startSound();}};
 const visibility=()=>{last=null;if(document.hidden){voice?.stop();stopSound();}else if(running&&!paused){spoken=elapsed>10.1;startSound();}};
 const click=e=>{const button=e.target.closest('button');if(!button)return;e.preventDefault();e.stopPropagation();if(button.matches('[data-motion-exit]')){cleanup();onExit();}else if(button.matches('[data-motion-pause]'))toggle();else begin();};
 const key=e=>{if(e.repeat||e.altKey||e.ctrlKey||e.metaKey||e.target.closest('button'))return;if(e.code==='Space'||e.code==='Enter'){e.preventDefault();if(!running)begin();else toggle();}};
 function cleanup(){if(destroyed)return;destroyed=true;cancelAnimationFrame(raf);voice?.stop();stopSound();context?.close().catch(()=>{});section.removeEventListener('click',click);section.removeEventListener('keydown',key);document.removeEventListener('visibilitychange',visibility);}
 section.addEventListener('click',click);section.addEventListener('keydown',key);document.addEventListener('visibilitychange',visibility);
 Promise.all([load(LUNA_MOTION_ASSETS.background),load(LUNA_MOTION_ASSETS.poses)]).then(images=>{if(destroyed)return;[background,poses]=images;ready=true;elapsed=.4;paint();start.disabled=false;start.textContent='試作を再生';start.focus({preventScroll:true});}).catch(()=>{if(!destroyed){start.textContent='画像を読み込めませんでした';gate.querySelector('small').textContent='ページを再読み込みしてください';}});
 raf=requestAnimationFrame(tick);return cleanup;
}

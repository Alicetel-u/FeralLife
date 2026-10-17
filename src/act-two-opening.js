// Each shot owns camera timing and stable voice cue IDs. Recordings use the
// standard voice manifest; a cut waits for speech before advancing.
export const ACT_TWO_OPENING_SCENES = [
 {shot:'chase',image:'assets/events/luna-flight.png',duration:5.4,alt:'深夜の路地を駆けるルナ',camera:[1.6,8,3,1.3,0,0],steps:true,cues:[]},
 {shot:'pursuit',image:'assets/events/luna-flight.png',duration:4.8,alt:'背後を振り返るルナ',camera:[1.9,8,14,2.05,10,16],cues:[{id:'breath',at:.8,end:4.8,speaker:'hostess',emotion:'tired',text:'……はぁ、はぁ……っ。\n……もう、追ってこない……？'}]},
 {shot:'call',image:'assets/events/luna-phone.png',duration:5.2,alt:'暗闇で震えるルナのスマートフォン',camera:[1.08,0,0,1.18,-2,1],cues:[{id:'message',at:1.4,end:4.8,speaker:'narrator',text:'「まだ話は終わっていない」',silent:true}]},
 {shot:'collapse',image:'assets/events/luna-sanctuary.png',duration:5.6,alt:'力尽きて座り込んだルナの後ろ姿',camera:[1.82,5,-24,1.65,4,-17],cues:[]},
 {shot:'reveal',image:'assets/events/luna-sanctuary.png',duration:8.8,alt:'ルナの背後から見上げる夜のけもの荘の全景',camera:[1.65,4,-17,1,0,0],cues:[]},
 {shot:'look',image:'assets/events/luna-sanctuary.png',duration:6.4,alt:'けもの荘の灯りを見上げるルナ',camera:[1,0,0,1.04,0,0],text:'……ここなら、しばらく隠れられるかな',cues:[{id:'shelter',at:1,end:5.8,speaker:'hostess',emotion:'tired',text:'……ここなら、しばらく隠れられるかな'}]}
];
export function actTwoOpeningHTML(){
 return `<section class="act-screen luna-film" data-act2-opening aria-label="第二幕オープニング・逃げる女" tabindex="-1">
 <h2 id="modal-title" class="visually-hidden">第二幕・逃げる女</h2>
 <div class="luna-film-frame"><div class="luna-film-camera"><img class="luna-film-image" alt=""></div><div class="luna-film-shade"></div><div class="luna-film-grain"></div><div class="luna-film-black"></div></div>
 <p class="luna-film-subtitle" aria-live="polite" aria-atomic="true"></p><span class="luna-film-intro" aria-hidden="true">深夜、人気のない裏道。</span>
 <div class="luna-film-controls"><button type="button" data-film-pause aria-label="一時停止" aria-pressed="false">Ⅱ</button><button type="button" data-film-next aria-label="次のカットへ">次へ</button><button type="button" data-film-skip>スキップ</button></div>
 <div class="luna-film-loading" role="status">映像を準備しています…</div></section>`;
}
export function actTwoOpeningFrame(index,seconds,reduced=false){
 const shot=ACT_TWO_OPENING_SCENES[index],p=Math.max(0,Math.min(1,seconds/shot.duration)),ease=p*p*(3-2*p),c=shot.camera;
 const shake=shot.steps&&!reduced?Math.sin(seconds*19)*.28*(1-p):0;
 const scale=reduced?1:c[0]+(c[3]-c[0])*ease,x=reduced?0:c[1]+(c[4]-c[1])*ease,y=reduced?0:c[2]+(c[5]-c[2])*ease+shake;
 return {transform:`translate(${x}%,${y}%) scale(${scale})`,subtitle:shot.cues.find(cue=>seconds>=cue.at&&seconds<cue.end)?.text||'',black:index===0?Math.max(0,1-seconds/.9):index===ACT_TWO_OPENING_SCENES.length-1?Math.min(1,Math.max(0,(seconds-shot.duration+1.1)/1.1)):0};
}
export function startActTwoOpening(root,onDone,voice=null,sound=null){
 const section=root.querySelector('[data-act2-opening]');if(!section)return ()=>{};
 const img=section.querySelector('.luna-film-image'),camera=section.querySelector('.luna-film-camera'),subtitle=section.querySelector('.luna-film-subtitle'),black=section.querySelector('.luna-film-black'),pause=section.querySelector('[data-film-pause]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let index=0,elapsed=0,last=null,raf=0,destroyed=false,paused=false,ready=false,activeCue=null,stepAt=0,audioContext=null;
 const preload=[...new Set(ACT_TWO_OPENING_SCENES.map(s=>s.image))].map(src=>new Promise(resolve=>{const image=new Image();image.onload=resolve;image.onerror=resolve;image.src=src;}));
 const effect=(phone=false)=>{
  if(!sound?.enabled||document.hidden)return;
  try{const Context=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Context)return;audioContext ||= new Context();audioContext.resume().catch(()=>{});
   const osc=audioContext.createOscillator(),gain=audioContext.createGain(),at=audioContext.currentTime;osc.type=phone?'sawtooth':'sine';osc.frequency.setValueAtTime(phone?125:105,at);osc.frequency.exponentialRampToValueAtTime(phone?95:35,at+.09);
   gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(sound.volume*(phone ? .065 : .16),at+.008);gain.gain.exponentialRampToValueAtTime(.0001,at+(phone ? .22 : .12));osc.connect(gain);gain.connect(audioContext.destination);osc.start(at);osc.stop(at+.25);osc.onended=()=>{osc.disconnect();gain.disconnect();};
  }catch{}
 };
 const paint=()=>{const frame=actTwoOpeningFrame(index,elapsed,reduced);camera.style.transform=frame.transform;subtitle.textContent=frame.subtitle;subtitle.classList.toggle('visible',!!frame.subtitle);black.style.opacity=frame.black;section.querySelector('.luna-film-intro').style.opacity=index===0&&elapsed>1&&elapsed<4?'1':'0';};
 const show=()=>{const shot=ACT_TWO_OPENING_SCENES[index];section.dataset.cut=shot.shot;img.src=shot.image;img.alt=shot.alt;activeCue=null;stepAt=0;voice?.stop();voice?.prepare(shot.cues.find(c=>!c.silent)||null);paint();};
 function cleanup(){if(destroyed)return;destroyed=true;cancelAnimationFrame(raf);voice?.stop();audioContext?.close().catch(()=>{});section.removeEventListener('click',click);section.removeEventListener('keydown',key);document.removeEventListener('visibilitychange',visibility);}
 const finish=()=>{if(destroyed)return;cleanup();onDone();};
 const next=()=>{if(!ready||destroyed)return;if(index===ACT_TWO_OPENING_SCENES.length-1){finish();return;}index++;elapsed=0;last=null;show();};
 const tick=now=>{
  if(destroyed)return;const delta=last===null?0:Math.min(.1,(now-last)/1000);last=now;
  if(ready&&!paused&&!document.hidden){elapsed+=delta;const shot=ACT_TWO_OPENING_SCENES[index];
   for(const cue of shot.cues)if(!cue.silent&&elapsed>=cue.at&&elapsed<cue.end&&activeCue!==cue.id){activeCue=cue.id;voice?.play(cue,'act2-film:'+cue.id);}
   if(shot.steps&&elapsed>=stepAt){effect();stepAt=elapsed+.29;}if(shot.shot==='call'&&elapsed>=stepAt&&elapsed<1.2){effect(true);stepAt=elapsed+.32;}
   // Keep both the subtitle and the final fade behind a future long recording.
   if(voice?.busy)elapsed=Math.min(elapsed,shot.duration-1.1);
   paint();if(elapsed>=shot.duration&&!voice?.busy)next();
  }if(!destroyed)raf=requestAnimationFrame(tick);
 };
 const toggle=()=>{paused=!paused;section.dataset.paused=String(paused);pause.textContent=paused?'▶':'Ⅱ';pause.setAttribute('aria-label',paused?'再生':'一時停止');pause.setAttribute('aria-pressed',String(paused));if(paused){voice?.stop();audioContext?.suspend().catch(()=>{});}else{activeCue=null;audioContext?.resume().catch(()=>{});}last=null;};
 function click(e){const button=e.target.closest('button');if(!button)return;e.preventDefault();e.stopPropagation();if(button.hasAttribute('data-film-skip'))finish();else if(button.hasAttribute('data-film-pause'))toggle();else next();}
 function key(e){if(e.altKey||e.ctrlKey||e.metaKey||e.repeat||e.target.closest('button'))return;if(e.code==='Space'){e.preventDefault();toggle();}else if(e.code==='Enter'||e.code==='ArrowRight'){e.preventDefault();next();}}
 function visibility(){last=null;if(document.hidden){voice?.stop();audioContext?.suspend().catch(()=>{});}else{activeCue=null;if(!paused)audioContext?.resume().catch(()=>{});}}
 section.addEventListener('click',click);section.addEventListener('keydown',key);document.addEventListener('visibilitychange',visibility);section.focus({preventScroll:true});
 Promise.all(preload).then(()=>{if(destroyed)return;ready=true;section.querySelector('.luna-film-loading').remove();show();});raf=requestAnimationFrame(tick);return cleanup;
}

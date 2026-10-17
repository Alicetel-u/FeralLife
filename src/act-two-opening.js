// Composed cinematic stills; no interpolated character poses or body animation.
// Voice cue IDs/times are independent of cuts so recordings can be added later.
export const ACT_TWO_OPENING_REVISION='2026.10.17.16';
export const ACT_TWO_SEATED_ART='assets/events/luna-seated-rear.png';
export const ACT_TWO_OPENING_SCENES=[
 {shot:'heel',image:'assets/events/luna-heel.png',duration:3.6,from:[1.12,-2,1],to:[1.06,0,0],events:Array.from({length:10},(_,i)=>({at:.1+i*.34,type:'step',power:.8})),cues:[{id:'breath',at:1,end:3.5,speaker:'hostess',emotion:'tired',text:'……はぁ、はぁ……っ。'}]},
 {shot:'chase',image:'assets/events/luna-corner-v2.png',duration:4.4,from:[1.09,-2,0],to:[1.025,0,0],events:Array.from({length:9},(_,i)=>({at:i*.34,type:'step',power:.7})).concat([{at:3.1,type:'scrape'}]),cues:[]},
 {shot:'listen',image:'assets/events/luna-watch-v2.png',duration:4,from:[1,0,0],to:[1.02,0,0],quiet:true,events:[],cues:[{id:'corner',at:.6,end:3.7,speaker:'hostess',emotion:'tired',text:'……ここまで来れば……。'}]},
 {shot:'call',image:'assets/events/luna-handset-v2.png',duration:5.2,from:[1,0,0],to:[1.035,0,0],quiet:true,events:[{at:.25,type:'buzz'},{at:.52,type:'ring'},{at:.7,type:'buzz'}],cues:[{id:'persistent',at:3.1,end:5,speaker:'hostess',emotion:'angry',text:'……しつこい……。'}]},
 {shot:'dismiss',image:'assets/events/luna-dismiss-v2.png',duration:2.8,from:[1.02,0,0],to:[1.02,0,0],quiet:true,events:[{at:.1,type:'scrape',power:.35}],cues:[]},
 {shot:'collapse',image:'assets/events/luna-courtyard-plate.png',duration:3.2,from:[2.8,0,-88],to:[2.8,0,-88],person:true,personFrom:1.7,personTo:1.7,quiet:true,events:[{at:.05,type:'land',power:.55}],cues:[]},
 {shot:'notice',image:'assets/events/luna-rental-insert.png',duration:4.8,from:[1,0,0],to:[1,0,0],quiet:true,events:[],cues:[{id:'vacancy',at:1,end:4.5,speaker:'hostess',emotion:'tired',text:'……入居者、募集……？'}]},
 {shot:'reveal',image:'assets/events/luna-courtyard-plate.png',duration:6,from:[1.48,0,-12],to:[1.02,0,0],person:true,personFrom:1.2,personTo:1,events:[],cues:[{id:'shelter',at:3.2,end:5.8,speaker:'hostess',emotion:'tired',text:'……ここなら……。'}]},
 {shot:'out',image:'assets/events/luna-courtyard-plate.png',duration:1.4,from:[1.02,0,0],to:[1.02,0,0],person:true,personFrom:1,personTo:1,events:[],cues:[]}
];
export const ACT_TWO_OPENING_DURATION=ACT_TWO_OPENING_SCENES.reduce((sum,shot)=>sum+shot.duration,0);
const filmClamp=n=>Math.max(0,Math.min(1,n));
const filmEase=n=>{const p=filmClamp(n);return p*p*(3-2*p);};
export function actTwoOpeningFrame(index,seconds,reduced=false){
 const shot=ACT_TWO_OPENING_SCENES[index],t=Math.max(0,seconds),p=filmEase(t/shot.duration);
 const blend=reduced?0:p;
 const camera=shot.from.map((n,i)=>n+(shot.to[i]-n)*blend);
 let x=0,y=0,roll=0;
 if(!reduced){
  for(const event of shot.events){const age=t-event.at;if(age<0||age>.5||event.type==='ring')continue;
   const amplitude=(event.power||1)*(event.type==='buzz'?2.2:event.type==='land'?9:5);
   const impulse=Math.exp(-age*(event.type==='land'?10:17));
   x+=Math.sin(age*95)*amplitude*impulse;y+=Math.cos(age*71)*amplitude*impulse;
  }
  if(shot.shot==='chase'){const settle=1-filmEase((t-2.6)/1.6);x+=Math.sin(t*8)*4*settle;y+=Math.sin(t*11)*3*settle;roll=Math.sin(t*5)*.16*settle;}
  if(shot.shot==='glance'){x+=28*Math.exp(-t*19);roll=-1.1*Math.exp(-t*10);}
 }
 const foreground=(shot.personFrom||1)+((shot.personTo||1)-(shot.personFrom||1))*blend;
 const black=shot.shot==='heel'?1-filmClamp((t-.2)/1.1):shot.shot==='out'?filmClamp(t/1.4):shot.shot==='dismiss'?filmClamp((t-(shot.duration-.6))/.35):0;
 return {
  transform:`translate(${camera[1]}%,${camera[2]}%) scale(${camera[0]})`,
  foreground:`scale(${foreground})`,rig:`translate(${x.toFixed(3)}px,${y.toFixed(3)}px) rotate(${roll.toFixed(3)}deg) scale(1.035)`,
  black,blur:!reduced&&shot.shot==='glance'?Math.max(0,5-t*30):0,
  subtitle:shot.cues.find(cue=>t>=cue.at&&t<cue.end)?.text||'',
  glow:shot.shot==='call'&&t<4.6?filmClamp((t-.45)/.25)*.06:0,
  notification:shot.shot==='call'&&t>=.65&&t<4.6
 };
}
export function actTwoOpeningHTML(){
 return `<section class="act-screen luna-film directed-luna-film" data-act2-opening data-opening-version="${ACT_TWO_OPENING_REVISION}" aria-label="第二幕オープニング・逃げる女" tabindex="-1">
 <h2 id="modal-title" class="visually-hidden">第二幕・逃げる女</h2>
 <div class="luna-film-frame"><div class="luna-film-rig"><div class="luna-film-camera"><img class="luna-film-image" alt=""><div class="luna-film-phone-ui" aria-label="スマートフォンの通知" hidden><span>メッセージ</span><p>まだ話は<br>終わっていない</p></div></div><div class="luna-film-foreground"><div class="luna-film-contact-shadow"></div><img class="luna-film-person" src="${ACT_TWO_SEATED_ART}" alt="地面に座り込んだルナの後ろ姿"></div></div><div class="luna-film-shade"></div><div class="luna-film-phone-light"></div><div class="luna-film-notice" hidden><small>けもの荘</small><strong>入居者募集</strong><span>お気軽にお問い合わせください</span></div><div class="luna-film-grain"></div><div class="luna-film-black"></div></div>
 <p class="luna-film-subtitle" aria-live="polite" aria-atomic="true"></p>
 <div class="luna-film-controls"><button type="button" data-film-pause aria-label="一時停止" aria-pressed="false">Ⅱ</button><button type="button" data-film-next aria-label="次のカットへ">次へ</button><button type="button" data-film-skip>スキップ</button></div>
 <div class="luna-film-loading" role="status"><span>映像を準備しています…</span><button type="button" data-film-retry hidden>もう一度読み込む</button></div></section>`;
}

// Small Foley sounds, separate from BGM and future speech recordings.
function createLunaFilmSound(settings){
 let context=null,buffer=null,rain=null,rainGain=null,closed=false;
 const ensure=()=>{
  if(closed||!settings?.enabled||document.hidden)return false;
  const Type=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Type)return false;
  context ||= new Type();context.resume().catch(()=>{});
  if(!buffer){buffer=context.createBuffer(1,context.sampleRate*2,context.sampleRate);const data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;}
  return true;
 };
 const noise=(duration,level,frequency,type='lowpass')=>{
  const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain(),at=context.currentTime;
  source.buffer=buffer;filter.type=type;filter.frequency.value=frequency;
  gain.gain.setValueAtTime(level*settings.volume,at);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
  source.connect(filter);filter.connect(gain);gain.connect(context.destination);source.start(at);source.stop(at+duration+.02);
  source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
 };
 return {
  scene(quiet){try{if(!ensure())return;
   if(!rain){rain=context.createBufferSource();rain.buffer=buffer;rain.loop=true;const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=1700;rainGain=context.createGain();rainGain.gain.value=0;rain.connect(filter);filter.connect(rainGain);rainGain.connect(context.destination);rain.start();rain.onended=()=>{filter.disconnect();rainGain?.disconnect();};}
   rainGain.gain.setTargetAtTime(settings.volume*(quiet ? .007 : .025),context.currentTime,.12);
  }catch{}},
  play(event){try{if(!ensure())return;const power=event.power||1;
   if(event.type==='step'){noise(.045,.14*power,2800,'highpass');noise(.12,.12*power,350);}
   else if(event.type==='land')noise(.28,.3,260);
   else if(event.type==='scrape')noise(.19,.11,1200,'bandpass');
   else if(event.type==='ring'){
    for(const [delay,hz] of [[0,880],[.13,1174]]){const osc=context.createOscillator(),gain=context.createGain(),at=context.currentTime+delay;osc.type='sine';osc.frequency.value=hz;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(settings.volume*.09,at+.012);gain.gain.exponentialRampToValueAtTime(.0001,at+.28);osc.connect(gain);gain.connect(context.destination);osc.start(at);osc.stop(at+.3);osc.onended=()=>{osc.disconnect();gain.disconnect();};}
   }
   else if(event.type==='buzz'){
    const osc=context.createOscillator(),gain=context.createGain(),at=context.currentTime;osc.type='sawtooth';osc.frequency.value=112;gain.gain.setValueAtTime(settings.volume*.024,at);gain.gain.exponentialRampToValueAtTime(.0001,at+.17);osc.connect(gain);gain.connect(context.destination);osc.start(at);osc.stop(at+.18);osc.onended=()=>{osc.disconnect();gain.disconnect();};
   }
  }catch{}},
  pause(){context?.suspend().catch(()=>{});},
  close(){closed=true;try{rain?.stop();rain?.disconnect();}catch{}context?.close().catch(()=>{});}
 };
}

export function startActTwoOpening(root,onDone,voice=null,sound=null){
 const section=root.querySelector('[data-act2-opening]');if(!section)return ()=>{};
 const image=section.querySelector('.luna-film-image'),camera=section.querySelector('.luna-film-camera'),foreground=section.querySelector('.luna-film-foreground'),rig=section.querySelector('.luna-film-rig');
 const subtitle=section.querySelector('.luna-film-subtitle'),black=section.querySelector('.luna-film-black'),light=section.querySelector('.luna-film-phone-light');
 const phoneUI=section.querySelector('.luna-film-phone-ui'),notice=section.querySelector('.luna-film-notice');
 const pause=section.querySelector('[data-film-pause]'),loading=section.querySelector('.luna-film-loading');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,foley=createLunaFilmSound(sound);
 let index=0,elapsed=0,last=null,raf=0,ready=false,paused=false,destroyed=false,loadVersion=0,activeCue=null;
 let soundsPlayed=new Set();
 const decodedAssets=new Map();
 const announce=()=>section.dispatchEvent(new CustomEvent('luna-film-phase',{bubbles:true}));
 const paint=()=>{const frame=actTwoOpeningFrame(index,elapsed,reduced);camera.style.transform=frame.transform;foreground.style.transform=frame.foreground;rig.style.transform=frame.rig;rig.style.filter=frame.blur?`blur(${frame.blur}px)`:'none';black.style.opacity=frame.black;light.style.opacity=frame.glow;phoneUI.hidden=!frame.notification;subtitle.textContent=frame.subtitle;subtitle.classList.toggle('visible',!!frame.subtitle);};
 const show=()=>{
  const shot=ACT_TWO_OPENING_SCENES[index];section.dataset.cut=shot.shot;section.dataset.quiet=String(!!shot.quiet);
  notice.hidden=shot.shot!=='notice';
  if(image.getAttribute('src')!==shot.image)image.src=shot.image;image.alt=({cold:'人気のない深夜の裏道',heel:'濡れた路面を蹴るヒール',chase:'走る視点から見える深夜の路地',glance:'背後を気にするルナの表情',listen:'暗がりで息を潜めるルナ',call:'手の中のスマートフォンに届いたメッセージ',dismiss:'壁にもたれてスマートフォンを見るルナ',collapse:'けもの荘の前で座り込んだルナ',silence:'静まり返った路地とルナの後ろ姿',reveal:'ルナの背後から見上げる夜のけもの荘',look:'けもの荘の灯りを見上げるルナ'}[shot.shot]||'夜のけもの荘');
  foreground.hidden=!shot.person;activeCue=null;soundsPlayed=new Set();voice?.stop();voice?.prepare(shot.cues.find(c=>!c.silent)||null);
  if(!paused&&!document.hidden)foley.scene(!!shot.quiet);paint();announce();
 };
 function cleanup(){if(destroyed)return;destroyed=true;loadVersion++;cancelAnimationFrame(raf);voice?.stop();foley.close();section.removeEventListener('click',click);section.removeEventListener('keydown',key);document.removeEventListener('visibilitychange',visibility);}
 const finish=()=>{if(destroyed)return;cleanup();onDone();};
 const next=()=>{if(!ready||destroyed)return;if(index===ACT_TWO_OPENING_SCENES.length-1){finish();return;}index++;elapsed=0;last=null;show();};
 const tick=now=>{
  if(destroyed)return;const delta=last===null?0:Math.min(.1,(now-last)/1000);last=now;
  if(ready&&!paused&&!document.hidden){
   elapsed+=delta;const shot=ACT_TWO_OPENING_SCENES[index];
   for(const [number,event] of shot.events.entries())if(elapsed>=event.at&&!soundsPlayed.has(number)){soundsPlayed.add(number);foley.play(event);}
   for(const cue of shot.cues)if(!cue.silent&&elapsed>=cue.at&&elapsed<cue.end&&activeCue!==cue.id){activeCue=cue.id;voice?.play(cue,'act2-film:'+cue.id);}
   if(voice?.busy)elapsed=Math.min(elapsed,shot.duration-.75);
   paint();if(elapsed>=shot.duration&&!voice?.busy)next();
  }
  if(!destroyed)raf=requestAnimationFrame(tick);
 };
 const toggle=()=>{if(!ready)return;paused=!paused;section.dataset.paused=String(paused);pause.textContent=paused?'▶':'Ⅱ';pause.setAttribute('aria-label',paused?'再生':'一時停止');pause.setAttribute('aria-pressed',String(paused));last=null;if(paused){voice?.stop();foley.pause();}else{activeCue=null;foley.scene(!!ACT_TWO_OPENING_SCENES[index].quiet);}announce();};
 const load=()=>{
  const version=++loadVersion;ready=false;loading.hidden=false;loading.querySelector('span').textContent='映像を準備しています…';loading.querySelector('button').hidden=true;
  const sources=[...new Set([...ACT_TWO_OPENING_SCENES.map(s=>s.image),ACT_TWO_SEATED_ART])];
  Promise.all(sources.map(src=>new Promise((resolve,reject)=>{const asset=new Image();asset.onload=async()=>{try{await asset.decode?.();decodedAssets.set(src,asset);resolve();}catch(error){reject(error);}};asset.onerror=reject;asset.src=src;}))).then(()=>{if(destroyed||version!==loadVersion)return;ready=true;last=null;loading.hidden=true;show();}).catch(()=>{if(destroyed||version!==loadVersion)return;loading.querySelector('span').textContent='画像の読み込みに失敗しました';loading.querySelector('button').hidden=false;});
 };
 function click(e){const button=e.target.closest('button');if(!button)return;e.preventDefault();e.stopPropagation();if(button.hasAttribute('data-film-skip'))finish();else if(button.hasAttribute('data-film-pause'))toggle();else if(button.hasAttribute('data-film-retry'))load();else next();}
 function key(e){if(e.repeat||e.altKey||e.ctrlKey||e.metaKey||e.target.closest('button'))return;if(e.code==='Space'){e.preventDefault();toggle();}else if(e.code==='Enter'||e.code==='ArrowRight'){e.preventDefault();next();}}
 function visibility(){last=null;if(document.hidden){voice?.stop();foley.pause();}else if(ready&&!paused){activeCue=null;foley.scene(!!ACT_TWO_OPENING_SCENES[index].quiet);}}
 section.addEventListener('click',click);section.addEventListener('keydown',key);document.addEventListener('visibilitychange',visibility);section.focus({preventScroll:true});load();raf=requestAnimationFrame(tick);return cleanup;
}

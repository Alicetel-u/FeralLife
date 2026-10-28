import {eventStageHTML} from './event-stage.js';
export const ACT_THREE_REVISION='2026.10.27.1';
const act3Cue=(speaker,text,at,end)=>({speaker,text,at,end,voicePerformance:'act3-urgent'});
export const ACT_THREE_SHOTS=[
 {id:'news',image:'assets/events/chapter3/chapter3_prologue_01.png',duration:8.4,zoom:1.03,events:[{at:8,type:'gun'}],cues:[act3Cue('announcer','緊急速報です！ 各地で原因不明の暴動が発生！',.3,4.4),act3Cue('announcer','感染は世界各国に拡大し、政府は――',4.5,8.35)]},
 {id:'defend',image:'assets/events/chapter3/chapter3_prologue_02.png',duration:7.8,zoom:1.12,events:[0,.16,.32,1.4,1.56,3.2,3.36,5.5,5.66,6.8].map(at=>({at,type:'gun'})),cues:[act3Cue('cat','まだ来るニャ！！',.3,2.6),act3Cue('hostess','多すぎるって！！',2.7,5),act3Cue('manager','下がってろ！！',5.1,7.6)]},
 {id:'empty',image:'assets/events/chapter3/chapter3_prologue_03.png',duration:3.7,zoom:1,events:[{at:.1,type:'empty'}],cues:[act3Cue('manager','……弾切れか',.65,3.5)]},
 {id:'throw',image:'assets/events/chapter3/chapter3_prologue_04.png',duration:1.3,zoom:1.06,events:[{at:.1,type:'throw'}],cues:[]},
 {id:'blast',image:'assets/events/chapter3/chapter3_prologue_05.png',duration:2.2,zoom:1.1,events:[{at:0,type:'blast'}],cues:[]},
 {id:'horde',image:'assets/events/chapter3/chapter3_prologue_06.png',duration:6,zoom:1.07,events:[],cues:[act3Cue('cat','減ってないニャ！！',.4,3),act3Cue('hostess','もう無理！！',3.1,5.8)]},
 {id:'escape',image:'assets/events/chapter3/chapter3_prologue_07.png',duration:14,zoom:1.06,pan:2,events:[],cues:[act3Cue('manager','モク、ルナ。裏から行け',.3,3.3),act3Cue('hostess','大家さんは！？',3.4,5.8),act3Cue('manager','俺が止める',5.9,8.1),act3Cue('cat','無茶だニャ！！',8.2,10.5),act3Cue('manager','いいから行け！！',10.6,13.8)]},
 {id:'knife',image:'assets/events/chapter3/chapter3_prologue_08.png',duration:3.3,zoom:1.05,events:[{at:.1,type:'knife'}],cues:[act3Cue('hostess','大家さん！！',.6,3.3)]},
 {id:'charge',image:'assets/events/chapter3/chapter3_prologue_09.png',duration:.8,zoom:1.28,events:[{at:0,type:'charge'}],cues:[]},
 {id:'white',duration:1.5,events:[],cues:[]}
];
export function actThreeFrame(index,t,reduced=false){
 const shot=ACT_THREE_SHOTS[index],p=Math.min(1,Math.max(0,t/shot.duration));
 let shake=0,flash=0;
 for(const e of shot.events){const age=t-e.at;if(age<0||age>.55)continue;
  if(['gun','blast','charge'].includes(e.type)){shake+=Math.exp(-age*12)*(e.type==='blast'?15:4);flash=Math.max(flash,Math.exp(-age*25)*(e.type==='blast'?.8:.25));}
 }
 return {transform:`translate(${reduced?0:(shot.pan||0)*(p-.5)}%,0) scale(${reduced?1.035:1.035+((shot.zoom||1)-1)*p})`,rig:reduced?'none':`translate(${Math.sin(t*93)*shake}px,${Math.cos(t*79)*shake}px)`,flash:reduced?0:flash,white:shot.id==='white'?1:0,cue:shot.cues.find(c=>t>=c.at&&t<c.end)||null};
}
export function actThreeHTML(){return `<section class="act-screen act3-film" data-act3-film data-chapter="3" tabindex="-1" aria-label="第3幕プロローグ"><h2 id="modal-title" class="visually-hidden">第3幕プロローグ</h2><div class="act3-rig"><img class="act3-image" alt=""><div class="act3-smoke" aria-hidden="true"></div></div><div class="act3-grain" aria-hidden="true"></div><div class="act3-flash" aria-hidden="true"></div><div class="act3-white" aria-hidden="true"></div><div class="act3-dialogue" data-renderer="event-stage"></div><nav class="act3-controls" aria-label="再生操作"><button type="button" data-act3-pause aria-pressed="false">一時停止</button><button type="button" data-act3-next>次へ</button><button type="button" data-act3-skip>スキップ</button></nav><div class="act3-loading" role="status"><span>画像を読み込んでいます…</span><button type="button" data-act3-retry hidden>再読み込み</button></div></section>`;}
// Synthesis supplies short cinematic effects without embedding large sound files.
export function createActThreeSound(settings,shared=null){
 let context=null,owned=false;const nodes=new Set();
 const stop=()=>{for(const n of nodes){try{n.stop?.();n.disconnect();}catch{}}nodes.clear();};
 const play=type=>{if(!settings?.enabled||document.hidden)return;try{
  if(!context){context=shared?.();if(!context){const Type=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Type)return;context=new Type();owned=true;}}
  context.resume().catch(()=>{});const at=context.currentTime;
  const duration=({gun:.19,blast:1.7,empty:.07,throw:.3,knife:.4,charge:.4,title:2})[type]||.2;
  const gain=context.createGain(),filter=context.createBiquadFilter();nodes.add(gain);nodes.add(filter);filter.type='lowpass';filter.frequency.value=type==='knife'?5500:type==='empty'?3400:type==='gun'?1900:400;
  gain.gain.setValueAtTime(Math.max(.0001,settings.volume*(type==='blast'?.32:type==='title'?.2:.13)),at);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
  const source=context.createBufferSource(),buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(type==='empty'?Math.sin(i*.8):1);
  source.buffer=buffer;nodes.add(source);source.connect(filter);filter.connect(gain);gain.connect(context.destination);source.start(at);source.onended=()=>{for(const n of [source,filter,gain]){n.disconnect();nodes.delete(n);}};
  if(['blast','title'].includes(type)){const osc=context.createOscillator(),low=context.createGain();nodes.add(osc);nodes.add(low);osc.frequency.setValueAtTime(95,at);osc.frequency.exponentialRampToValueAtTime(28,at+duration);low.gain.setValueAtTime(settings.volume*.25,at);low.gain.exponentialRampToValueAtTime(.0001,at+duration);osc.connect(low);low.connect(context.destination);osc.start(at);osc.stop(at+duration);osc.onended=()=>{osc.disconnect();low.disconnect();nodes.delete(osc);nodes.delete(low);};}
 }catch{}};
 return {play,stop,close(){stop();if(owned)context?.close().catch(()=>{});}};
}
export function startActThree(root,onDone,{settings,shared,voice,onShot=()=>{},initialShot=0}={}){
 const section=root.querySelector('[data-act3-film]');if(!section)return ()=>{};
 const img=section.querySelector('.act3-image'),rig=section.querySelector('.act3-rig'),dialogue=section.querySelector('.act3-dialogue'),loading=section.querySelector('.act3-loading'),pause=section.querySelector('[data-act3-pause]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,sfx=createActThreeSound(settings,shared),decoded=new Map();
 let index=Math.max(0,Math.min(ACT_THREE_SHOTS.length-1,initialShot|0)),elapsed=0,last=null,raf=0,dead=false,paused=false,ready=false,version=0,shown=undefined,played=new Set();
 const paint=()=>{const f=actThreeFrame(index,elapsed,reduced);img.style.transform=f.transform;rig.style.transform=f.rig;section.querySelector('.act3-flash').style.opacity=paused?0:f.flash;section.querySelector('.act3-white').style.opacity=f.white;
  if(shown!==f.cue){shown=f.cue;if(f.cue)voice?.play(f.cue,'act3:'+index+':'+f.cue.at);else voice?.stop();dialogue.innerHTML=f.cue?eventStageHTML({detail:f.cue.text,lines:[f.cue],cast:[]},[],0,0,{hideCharacters:true,cinematic:true}):'';
   const name=dialogue.querySelector('.speaker-name');if(name)name.textContent=({announcer:'アナウンサー',cat:'モク',hostess:'ルナ',manager:'大家'})[f.cue.speaker];
   dialogue.querySelector('.mobile-dialogue-tap')?.remove();dialogue.querySelector('.stage-page')?.remove();}
 };
 const show=()=>{sfx.stop();voice?.stop();const shot=ACT_THREE_SHOTS[index];section.dataset.cut=shot.id;img.hidden=!shot.image;if(shot.image){img.src=shot.image;img.alt=({news:'世界各地の混乱を伝える緊急ニュース',defend:'モクとルナを守り迎撃する大家',empty:'弾切れで銃を構える大家',throw:'手榴弾を投げる大家',blast:'廊下を満たす爆炎',horde:'爆煙から迫るゾンビの群れ',escape:'二人を逃がそうとする大家',knife:'ナイフを抜く大家',charge:'群れへ単身で突撃する大家'})[shot.id];}shown=undefined;played=new Set();if(shot.id==='white')sfx.stop();paint();onShot(index);};
 function cleanup(){if(dead)return;dead=true;version++;cancelAnimationFrame(raf);sfx.close();voice?.stop();voice?.setSuspended(false);section.removeEventListener('click',click);section.removeEventListener('keydown',key);document.removeEventListener('visibilitychange',visibility);}
 const finish=()=>{if(dead)return;cleanup();onDone();};
 const next=()=>{if(!ready||dead)return;if(index===ACT_THREE_SHOTS.length-1){finish();return;}index++;elapsed=0;last=null;show();};
 // Advance one utterance at a time; this control never skips another speaker in a shot.
 const advanceLine=()=>{if(!ready)return;const nextCue=ACT_THREE_SHOTS[index].cues.find(c=>c.at>elapsed+.05);if(nextCue){sfx.stop();voice?.stop();elapsed=nextCue.at;ACT_THREE_SHOTS[index].events.forEach((e,n)=>{if(e.at<elapsed)played.add(n);});paint();}else next();};
 const toggle=()=>{if(!ready)return;paused=!paused;pause.textContent=paused?'再生':'一時停止';pause.setAttribute('aria-pressed',String(paused));section.dataset.paused=String(paused);last=null;voice?.setSuspended(paused||document.hidden);if(paused)sfx.stop();paint();section.dispatchEvent(new Event('act3-film-phase',{bubbles:true}));};
 function click(e){const b=e.target.closest('button');if(!b)return;e.preventDefault();e.stopPropagation();voice?.unlock();if(b.hasAttribute('data-act3-skip'))finish();else if(b.hasAttribute('data-act3-pause'))toggle();else if(b.hasAttribute('data-act3-retry'))load();else advanceLine();}
 function key(e){if(e.repeat||e.target.closest('button'))return;if(e.code==='Space'){e.preventDefault();e.stopPropagation();toggle();}else if(['Enter','ArrowRight'].includes(e.code)){e.preventDefault();e.stopPropagation();advanceLine();}}
 function visibility(){last=null;voice?.setSuspended(paused||document.hidden);if(document.hidden)sfx.stop();}
 function load(){const token=++version;ready=false;loading.hidden=false;loading.querySelector('span').textContent='画像を読み込んでいます…';loading.querySelector('button').hidden=true;
  Promise.all(ACT_THREE_SHOTS.filter(s=>s.image).map(s=>new Promise((resolve,reject)=>{const asset=new Image();asset.onload=async()=>{try{await asset.decode?.();decoded.set(s.image,asset);resolve();}catch(e){reject(e);}};asset.onerror=reject;asset.src=s.image;}))).then(()=>{if(dead||version!==token)return;ready=true;last=null;loading.hidden=true;show();}).catch(()=>{if(dead||version!==token)return;loading.querySelector('span').textContent='画像を読み込めませんでした';loading.querySelector('button').hidden=false;});
 }
 function tick(now){if(dead)return;const dt=last===null?0:Math.min(.1,(now-last)/1000);last=now;if(ready&&!paused&&!document.hidden){const cue=actThreeFrame(index,elapsed,reduced).cue;const step=cue&&voice?.busy?Math.min(dt,Math.max(0,cue.end-elapsed-.001)):dt;elapsed+=step;for(const [n,e]of ACT_THREE_SHOTS[index].events.entries())if(elapsed>=e.at&&!played.has(n)){played.add(n);sfx.play(e.type);}paint();if(elapsed>=ACT_THREE_SHOTS[index].duration)next();}if(!dead)raf=requestAnimationFrame(tick);}
 section.addEventListener('click',click);section.addEventListener('keydown',key);document.addEventListener('visibilitychange',visibility);section.focus({preventScroll:true});load();raf=requestAnimationFrame(tick);return cleanup;
}
export function actThreeTitleFrame(t){return {number:Math.min(1,Math.max(0,(t-.6)/.8)),title:Math.min(1,Math.max(0,(t-1.7)/.35)),black:Math.min(1,Math.max(0,(t-5.5)/1.2)),finished:t>=7};}
export function actThreeTitleHTML(){return `<section class="act-screen act3-title" data-act3-title data-chapter="3" aria-label="第3幕 世界崩壊"><div class="act3-title-smoke" aria-hidden="true"></div><div class="act3-title-copy"><p>第3幕</p><h2 id="modal-title">世界崩壊</h2></div><div class="act3-title-black" aria-hidden="true"></div></section>`;}
// Cinematic Boom by DRAGON-STUDIO / Pixabay (Pixabay Content License).
// https://pixabay.com/sound-effects/film-special-effects-cinematic-boom-335489/
export const ACT_THREE_TITLE_SOUND='assets/audio/chapter3-cinematic-boom.mp3';
export function createActThreeTitleSound(settings,shared,makeAudio=()=>new Audio()){
 const audio=makeAudio();audio.src=ACT_THREE_TITLE_SOUND;audio.preload='auto';let source=null,gain=null,started=false,closed=false;
 const play=()=>{if(closed||started||!settings?.enabled||settings.volume<=0)return;started=true;
  try{const context=shared?.();if(context){source=context.createMediaElementSource(audio);gain=context.createGain();gain.gain.value=Math.min(1,settings.volume);source.connect(gain);gain.connect(context.destination);audio.volume=1;}else audio.volume=Math.min(1,settings.volume);Promise.resolve(audio.play()).catch(()=>{});}catch{}
 };
 const visibility=()=>{if(!started||closed)return;if(document.hidden)audio.pause();else if(settings?.enabled&&settings.volume>0)Promise.resolve(audio.play()).catch(()=>{});};
 const stop=()=>{if(closed)return;closed=true;audio.pause();audio.removeAttribute?.('src');audio.load?.();source?.disconnect();gain?.disconnect();};
 return {play,visibility,stop};
}
export function startActThreeTitle(root,onDone,settings,shared){
 const section=root.querySelector('[data-act3-title]'),sound=createActThreeTitleSound(settings,shared);let t=0,last=null,raf=0,dead=false,hit=false;
 const visibility=()=>{last=null;sound.visibility();};document.addEventListener('visibilitychange',visibility);
 const stop=()=>{if(dead)return;dead=true;cancelAnimationFrame(raf);document.removeEventListener('visibilitychange',visibility);sound.stop();};
 const tick=now=>{if(dead)return;const dt=last===null?0:Math.min(.1,(now-last)/1000);last=now;if(!document.hidden)t+=dt;const f=actThreeTitleFrame(t);section.querySelector('p').style.opacity=f.number;section.querySelector('h2').style.opacity=f.title;section.querySelector('.act3-title-black').style.opacity=f.black;if(t>=1.7&&!hit){hit=true;sound.play();}if(f.finished){stop();onDone();return;}raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);return stop;
}
export function actThreeCompleteHTML(){return `<section class="act-screen act3-complete" data-chapter="3"><h2 id="modal-title" class="visually-hidden">第3幕プロローグ再生終了</h2><nav aria-label="再生終了メニュー"><button type="button" data-act3-replay>もう一度見る</button><button type="button" data-act-title>タイトルに戻る</button></nav></section>`;}

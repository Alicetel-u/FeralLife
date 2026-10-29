import {chapterDialogueControlsHTML,createChapterDialogueControls} from './dialogue-controls.js';
import {eventStageHTML} from './event-stage.js';
export const ACT_THREE_REVISION='2026.10.28.1';
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
export function actThreeHTML(){return `<section class="act-screen act3-film" data-act3-film data-chapter="3" tabindex="-1" aria-label="第3幕プロローグ"><h2 id="modal-title" class="visually-hidden">第3幕プロローグ</h2><div class="act3-rig"><img class="act3-image" alt=""><div class="act3-smoke" aria-hidden="true"></div></div><div class="act3-grain" aria-hidden="true"></div><div class="act3-flash" aria-hidden="true"></div><div class="act3-white" aria-hidden="true"></div><div class="act3-dialogue" data-renderer="event-stage"></div>${chapterDialogueControlsHTML()}<div class="act3-loading" role="status"><span>画像を読み込んでいます…</span><button type="button" data-act3-retry hidden>再読み込み</button></div></section>`;}
// Synthesis supplies short cinematic effects without embedding large sound files.
export function createActThreeSound(settings,shared=null){
 let context=null,owned=false;const nodes=new Set();
 const stop=()=>{for(const n of nodes){try{n.stop?.();n.disconnect();}catch{}}nodes.clear();};
 const play=type=>{if(!settings?.enabled||document.hidden)return;try{
  if(!context){context=shared?.();if(!context){const Type=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Type)return;context=new Type();owned=true;}}
  context.resume().catch(()=>{});const at=context.currentTime;
  const duration=({gun:.19,blast:1.7,empty:.07,throw:.3,knife:.4,charge:.4,title:2})[type]||.2;
  const gain=context.createGain(),filter=context.createBiquadFilter();nodes.add(gain);nodes.add(filter);filter.type='lowpass';filter.frequency.value=type==='knife'?5500:type==='empty'?3400:type==='gun'?1900:400;
  gain.gain.setValueAtTime(Math.max(.0001,settings.volume*(type==='blast'?.55:type==='title'?.65:.42)),at);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
  const source=context.createBufferSource(),buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(type==='empty'?Math.sin(i*.8):1);
  source.buffer=buffer;nodes.add(source);source.connect(filter);filter.connect(gain);gain.connect(context.destination);source.start(at);source.onended=()=>{for(const n of [source,filter,gain]){n.disconnect();nodes.delete(n);}};
  if(['blast','title'].includes(type)){const osc=context.createOscillator(),low=context.createGain();nodes.add(osc);nodes.add(low);osc.frequency.setValueAtTime(95,at);osc.frequency.exponentialRampToValueAtTime(28,at+duration);low.gain.setValueAtTime(settings.volume*(type==='title'?.45:.38),at);low.gain.exponentialRampToValueAtTime(.0001,at+duration);osc.connect(low);low.connect(context.destination);osc.start(at);osc.stop(at+duration);osc.onended=()=>{osc.disconnect();low.disconnect();nodes.delete(osc);nodes.delete(low);};}
 }catch{}};
 return {play,stop,close(){stop();if(owned)context?.close().catch(()=>{});}};
}
export function startActThree(root,onDone,{settings,shared,voice,silent=false,onShot=()=>{},initialShot=0}={}){
 const section=root.querySelector('[data-act3-film]');if(!section)return ()=>{};
 const img=section.querySelector('.act3-image'),rig=section.querySelector('.act3-rig'),dialogue=section.querySelector('.act3-dialogue'),loading=section.querySelector('.act3-loading');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,sfx=createActThreeSound(settings,shared),decoded=new Map();
 let index=Math.max(0,Math.min(ACT_THREE_SHOTS.length-1,initialShot|0)),elapsed=0,last=null,raf=0,dead=false,paused=false,uiBlocked=false,ready=false,version=0,shown=undefined,played=new Set();
 const paint=()=>{const f=actThreeFrame(index,elapsed,reduced);img.style.transform=f.transform;rig.style.transform=f.rig;section.querySelector('.act3-flash').style.opacity=paused?0:f.flash;section.querySelector('.act3-white').style.opacity=f.white;
  if(shown!==f.cue){shown=f.cue;if(f.cue)voice?.play(f.cue,'act3:'+index+':'+f.cue.at);else voice?.stop();dialogue.innerHTML=f.cue?eventStageHTML({detail:f.cue.text,lines:[f.cue],cast:[]},[],0,0,{hideCharacters:true,cinematic:true}):'';
   const name=dialogue.querySelector('.speaker-name');if(name)name.textContent=({announcer:'アナウンサー',cat:'モク',hostess:'ルナ',manager:'大家'})[f.cue.speaker];
   dialogue.querySelector('.stage-page')?.remove();}controls.refresh();
 };
 const show=()=>{sfx.stop();voice?.stop();const shot=ACT_THREE_SHOTS[index];section.dataset.cut=shot.id;img.hidden=!shot.image;if(shot.image){img.src=shot.image;img.alt=({news:'世界各地の混乱を伝える緊急ニュース',defend:'モクとルナを守り迎撃する大家',empty:'弾切れで銃を構える大家',throw:'手榴弾を投げる大家',blast:'廊下を満たす爆炎',horde:'爆煙から迫るゾンビの群れ',escape:'二人を逃がそうとする大家',knife:'ナイフを抜く大家',charge:'群れへ単身で突撃する大家'})[shot.id];}shown=undefined;played=new Set();if(shot.id==='white')sfx.stop();paint();onShot(index);};
 function cleanup(){if(dead)return;dead=true;controls.stop();version++;cancelAnimationFrame(raf);sfx.close();voice?.stop();voice?.setSuspended(false);section.removeEventListener('click',click);section.removeEventListener('keydown',key);document.removeEventListener('visibilitychange',visibility);}
 const finish=()=>{if(dead)return;cleanup();onDone();};
 const next=()=>{if(!ready||dead)return;if(index===ACT_THREE_SHOTS.length-1){finish();return;}index++;elapsed=0;last=null;show();};
 // Advance one utterance at a time; this control never skips another speaker in a shot.
 const advanceLine=()=>{if(!ready)return;const nextCue=ACT_THREE_SHOTS[index].cues.find(c=>c.at>elapsed+.05);if(nextCue){sfx.stop();voice?.stop();elapsed=nextCue.at;ACT_THREE_SHOTS[index].events.forEach((e,n)=>{if(e.at<elapsed)played.add(n);});paint();}else next();};
 const toggle=()=>{if(!ready)return;paused=!paused;controls.refresh();section.dataset.paused=String(paused);last=null;voice?.setSuspended(paused||document.hidden);if(paused)sfx.stop();paint();section.dispatchEvent(new Event('act3-film-phase',{bubbles:true}));};
 function click(e){if(controls.click(e))return;const b=e.target.closest('button');if(!b)return;e.preventDefault();e.stopPropagation();voice?.unlock();if(b.hasAttribute('data-act3-skip'))finish();else if(b.hasAttribute('data-act3-pause'))toggle();else if(b.hasAttribute('data-act3-retry'))load();else advanceLine();}
 function key(e){if(e.repeat||e.target.closest('button')||controls.blocked)return;if(['Space','Enter','ArrowRight'].includes(e.code)){e.preventDefault();e.stopPropagation();advanceLine();}}
 function visibility(){last=null;voice?.setSuspended(paused||document.hidden);if(document.hidden)sfx.stop();}
 function load(){const token=++version;ready=false;loading.hidden=false;loading.querySelector('span').textContent='画像を読み込んでいます…';loading.querySelector('button').hidden=true;
  Promise.all(ACT_THREE_SHOTS.filter(s=>s.image).map(s=>new Promise((resolve,reject)=>{const asset=new Image();asset.onload=async()=>{try{await asset.decode?.();decoded.set(s.image,asset);resolve();}catch(e){reject(e);}};asset.onerror=reject;asset.src=s.image;}))).then(()=>{if(dead||version!==token)return;ready=true;last=null;loading.hidden=true;show();}).catch(()=>{if(dead||version!==token)return;loading.querySelector('span').textContent='画像を読み込めませんでした';loading.querySelector('button').hidden=false;});
 }
 function tick(now){if(dead)return;const dt=last===null?0:Math.min(.1,(now-last)/1000);last=now;if(ready&&!paused&&!uiBlocked&&!document.hidden){const cue=actThreeFrame(index,elapsed,reduced).cue;const step=cue&&voice?.busy?Math.min(dt,Math.max(0,cue.end-elapsed-.001)):dt;elapsed+=step;for(const [n,e]of ACT_THREE_SHOTS[index].events.entries())if(elapsed>=e.at&&!played.has(n)){played.add(n);sfx.play(e.type);}paint();if(elapsed>=ACT_THREE_SHOTS[index].duration)next();}if(!dead)raf=requestAnimationFrame(tick);}
 const controls=createChapterDialogueControls(section,{getState:()=>({active:ready&&ACT_THREE_SHOTS[index].id!=='white',line:actThreeFrame(index,elapsed,reduced).cue,lines:ACT_THREE_SHOTS.flatMap(s=>s.cues),canBack:index>0||elapsed>1}),onNext:advanceLine,onBack:()=>{sfx.stop();voice?.stop();const cue=ACT_THREE_SHOTS[index].cues.filter(c=>c.at<elapsed-.1).at(-1);if(cue){elapsed=cue.at;shown=undefined;paint();}else if(index>0){index--;elapsed=0;show();}last=null;},onSkip:finish,voice,bgm:settings,silent,getAuto:()=>!paused,onAuto:toggle,onBlock:blocked=>{uiBlocked=blocked;last=null;voice?.setSuspended(paused||document.hidden||blocked);section.dataset.paused=String(paused||blocked);section.dispatchEvent(new Event('act3-film-phase',{bubbles:true}));}});
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
export function actThreeCompleteHTML(){return `<section class="act-screen act3-complete" data-chapter="3"><h2 id="modal-title" class="visually-hidden">第3幕 再生メニュー</h2><nav aria-label="再生終了メニュー"><button type="button" data-act3-map>街マップへ</button><button type="button" data-act3-replay>もう一度見る</button><button type="button" data-act3-after-replay>タイムリープ後から見る</button><button type="button" data-act-title>タイトルに戻る</button></nav></section>`;}

export const ACT_THREE_AFTER_SCENES=[
 {id:'corridor',image:'assets/events/chapter3/chapter3-after-awake-v2.png',watchImage:'assets/events/chapter3/chapter3-after-watch-v2.png',lines:[
  {speaker:'narrator',text:'静寂に包まれたけもの荘。'},
  {speaker:'manager',text:'……また、駄目だったか'},
  {speaker:'narrator',text:'時計を確認する。'},
  {speaker:'manager',text:'戻り先は……今回は変わってないな'}
 ]},
 {id:'empty-room',image:'assets/events/chapter3/chapter3-after-room-v2.png',lines:[
  {speaker:'narrator',text:'大家は無言で空き部屋へ向かう。'},
  {speaker:'narrator',text:'隠し場所を開け、武器と弾薬を確認する。'},
  {speaker:'manager',text:'銃も弾薬もある。準備はできてる'},
  {speaker:'manager',text:'……今度こそ、二人とも生き残らせる'}
 ]}
];
for(const scene of ACT_THREE_AFTER_SCENES)for(const line of scene.lines)line.voiceChapter=3;
export function actThreeAfterEntry(cursor=0){
 const entries=ACT_THREE_AFTER_SCENES.flatMap(scene=>scene.lines.map(line=>({scene,line})));
 const entry=entries[Math.max(0,Math.min(entries.length-1,Number.isInteger(cursor)?cursor:0))];
 const watch=!!entry.scene.watchImage&&entry.scene.lines.indexOf(entry.line)>=2;
 return {...entry,image:watch?entry.scene.watchImage:entry.scene.image,watch,count:entries.length};
}
export function actThreeAfterHTML(){return `<section class="act-screen act3-film act3-after" data-act3-after data-chapter="3" tabindex="-1" aria-label="第3幕 タイムリープ後"><h2 id="modal-title" class="visually-hidden">第3幕 タイムリープ後</h2><div class="act3-rig"><img class="act3-image" alt=""></div><div class="act3-dialogue" data-renderer="event-stage"></div>${chapterDialogueControlsHTML()}<div class="act3-loading" role="status"><span>画像を読み込んでいます…</span><button type="button" data-act3-after-retry hidden>再読み込み</button></div></section>`;}
export function startActThreeAfter(root,onDone,{initialCursor=0,onCursor=()=>{},bgm=null,voice=null,silent=false}={}){
 const section=root.querySelector('[data-act3-after]');if(!section)return ()=>{};
 const img=section.querySelector('.act3-image'),dialogue=section.querySelector('.act3-dialogue'),loading=section.querySelector('.act3-loading');
 let cursor=Math.max(0,Math.min(actThreeAfterEntry().count-1,Number.isInteger(initialCursor)?initialCursor:0)),dead=false,ready=false,version=0,spoken=null;
 const paint=()=>{
  const {scene,line,image,watch,count}=actThreeAfterEntry(cursor);section.dataset.cut=scene.id;img.src=image;
  img.alt=scene.id==='corridor'?(watch?'古いけもの荘の廊下に座り込み、震える手で腕時計を確かめる大家':'ゾンビに襲われた恐怖を引きずり、けもの荘の古い廊下で喉元を押さえて息をのむ大家'):'けもの荘の古い空き部屋で、恐怖をこらえて床の隠し場所の武器と弾薬を確かめる大家';
  const lines=ACT_THREE_AFTER_SCENES.flatMap(scene=>scene.lines);
  dialogue.innerHTML=eventStageHTML({detail:lines[0].text,lines,cast:[]},[],cursor,0,{hideCharacters:true,cinematic:true});
  dialogue.querySelector('.speaker-name').textContent=line.speaker==='manager'?'大家':'けもの荘';
  if(spoken!==line){spoken=line;voice?.stop();if(line.speaker!=='narrator')voice?.play(line,'act3-after:'+cursor);}
  controls.refresh();onCursor(cursor);
 };
 const stop=()=>{if(dead)return;controls.stop();voice?.stop();voice?.setSuspended(false);document.removeEventListener('visibilitychange',afterVisibility);dead=true;version++;section.removeEventListener('click',click);section.removeEventListener('keydown',key);};
 function afterVisibility(){voice?.setSuspended(document.hidden||controls.blocked);}
 const advance=()=>{if(!ready||dead)return;if(cursor===actThreeAfterEntry().count-1){stop();onDone();return;}cursor++;paint();};
 const back=()=>{if(!ready||dead||cursor===0)return;cursor--;paint();};
 function click(e){if(controls.click(e))return;const button=e.target.closest('button');if(!button)return;e.preventDefault();e.stopPropagation();if(button.hasAttribute('data-act3-after-retry'))load();else if(button.hasAttribute('data-act3-after-back'))back();else if(button.hasAttribute('data-act3-after-next'))advance();}
 function key(e){if(e.repeat||e.target.closest('button')||controls.blocked)return;if(['Enter','ArrowRight','Space'].includes(e.code)){e.preventDefault();e.stopPropagation();advance();}else if(e.code==='ArrowLeft'){e.preventDefault();e.stopPropagation();back();}}
 function load(){const token=++version;ready=false;loading.hidden=false;loading.querySelector('button').hidden=true;
  Promise.all(ACT_THREE_AFTER_SCENES.flatMap(scene=>[scene.image,scene.watchImage].filter(Boolean)).map(src=>new Promise((resolve,reject)=>{const asset=new Image();asset.onload=async()=>{try{await asset.decode?.();resolve();}catch(e){reject(e);}};asset.onerror=reject;asset.src=src;}))).then(()=>{if(dead||version!==token)return;ready=true;loading.hidden=true;paint();}).catch(()=>{if(dead||version!==token)return;loading.querySelector('span').textContent='画像を読み込めませんでした';loading.querySelector('button').hidden=false;});
 }
 const controls=createChapterDialogueControls(section,{getState:()=>({active:ready,line:actThreeAfterEntry(cursor).line,lines:ACT_THREE_AFTER_SCENES.flatMap(s=>s.lines),canBack:cursor>0,last:cursor===actThreeAfterEntry().count-1}),onNext:advance,onBack:back,onSkip:()=>{cursor=actThreeAfterEntry().count-1;paint();},voice,bgm,silent});
 section.addEventListener('click',click);section.addEventListener('keydown',key);document.addEventListener('visibilitychange',afterVisibility);section.focus({preventScroll:true});load();return stop;
}

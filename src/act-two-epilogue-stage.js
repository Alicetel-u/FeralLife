import {eventConversation,eventStageHTML} from './event-stage.js';

export const EPILOGUE_ART={morning:'assets/events/epilogue/morning-v1.png',night:'assets/events/epilogue/night-v1.png',room:'assets/events/epilogue/room-night-v1.png',ledger:'assets/events/epilogue/ledger-v1.png',blank:'assets/events/epilogue/ledger-blank-v1.png'};
let epilogueAssetsReady;
export function prepareEpilogueAssets(){
 return epilogueAssetsReady||=Promise.all(Object.values(EPILOGUE_ART).map(src=>{const image=new Image();image.src=src;return image.decode();})).catch(error=>{epilogueAssetsReady=null;throw error;});
}
export function actTwoEpilogueDirection(event,index=0){
 if(event?.actScene!=='act2-epilogue')return null;
 const line=eventConversation(event)[index];if(!line?.epilogueScene)return null;
 const scene=line.epilogueScene,shot=line.epilogueShot;
 const cast=shot==='company'?['hostess','cat']:['vanity','close'].includes(shot)?['hostess']:[];
 return {line,scene,shot,cast,silent:scene==='memory'||scene==='secret'||!!line.epilogueSilent,cue:['return','night','secret'].includes(scene)?'uneasy':shot==='company'?'luna':'normal'};
}
export function epilogueTransitionFor(event,previousIndex,index,page=0){
 const next=actTwoEpilogueDirection(event,index);
 if(!next||page>0||previousIndex===index)return null;
 const previous=previousIndex===null?null:actTwoEpilogueDirection(event,previousIndex);
 if(previous?.scene===next.scene)return next.line.epilogueTransition||null;
 // A close-up within Luna's room is a slow camera push, not another blackout.
 if(previous?.scene==='night'&&next.scene==='secret')return null;
 return next.line.epilogueTransition||(['night','secret'].includes(next.scene)?'night':next.scene==='memory'?'white':'fade');
}
export function actTwoEpilogueStageHTML(event,residents,index=0,page=0){
 const direction=actTwoEpilogueDirection(event,index);if(!direction)return eventStageHTML(event,residents,index,page);
 const {scene,shot,cast,silent,cue}=direction;
 const memory=scene==='memory';
 const source=memory?(shot==='blank'?EPILOGUE_ART.blank:EPILOGUE_ART.ledger):shot==='outside'?EPILOGUE_ART.night:['vanity','close'].includes(shot)?EPILOGUE_ART.room:EPILOGUE_ART.morning;
 const background=`<div class="epilogue-backdrop" aria-hidden="true"><img src="${source}" alt=""></div>`;
 const flames=shot==='burn'?'<div class="epilogue-fire" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>':'';
 const lamps=shot==='outside'&&direction.line.epilogueTransition==='night'&&page===0?'<div class="epilogue-lamps" aria-hidden="true"><i></i><i></i><i></i><i></i></div>':'';
 const stage=eventStageHTML({...event,cast},residents,index,page,{hideCharacters:!cast.length,cinematic:true});
 return stage.replace('class="event-stage ',`data-epilogue-scene="${scene}" data-epilogue-shot="${shot}" data-silent="${silent}" data-cue="${cue}" class="event-stage act-two-epilogue epilogue-${scene} epilogue-shot-${shot} ${direction.line.epilogueFocus?'epilogue-focus':''} `).replace(/^(<div[^>]*>)/,'$1'+background+lamps+flames);
}
export function actTwoEpilogueCompleteHTML(){
 return `<section class="act-screen graphic-title epilogue-complete"><img src="${EPILOGUE_ART.night}" alt="夜のけもの荘"><div class="epilogue-complete-copy"><h2 id="modal-title">第二幕<span>完</span></h2><p>第三幕へ続く</p><button class="act-primary" data-act-title>タイトルへ</button></div></section>`;
}

// Each transition has an opaque hold. A hidden tab pauses it; disposal never advances.
export function startEpilogueTransition(host,kind,replace,done=()=>{},{ready=()=>Promise.resolve(),reducedMotion=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true}={}){
 const doc=host.ownerDocument,root=doc.createElement('div');
 const white=['white','flash-return','page'].includes(kind);
 root.className=`epilogue-transition${white?' epilogue-transition-white':''}${kind==='white'&&!reducedMotion?' epilogue-memory-entry':''}`;
 root.setAttribute('aria-hidden','true');host.append(root);
 const timing=kind==='night'?[550,1200,650]:kind==='white'?[120,650,500]:kind==='flash-return'?[120,450,650]:kind==='page'?[180,500,350]:[350,850,450];
 let animation,cancelled=false,visibleResolve;
 const sync=()=>{if(doc.hidden)animation?.pause();else{animation?.play();visibleResolve?.();visibleResolve=null;}};
 const clear=()=>{animation?.cancel();root.remove();doc.removeEventListener('visibilitychange',sync);visibleResolve?.();visibleResolve=null;};
 const phase=(from,to,duration)=>{animation=root.animate([{opacity:from},{opacity:to}],{duration:Math.max(1,duration),fill:'forwards',easing:'ease-in-out'});sync();return animation.finished;};
 const visible=()=>doc.hidden?new Promise(resolve=>visibleResolve=resolve):Promise.resolve();
 doc.addEventListener('visibilitychange',sync);
 (async()=>{
  try{
   const loaded=Promise.resolve().then(ready);
   // Consume readiness errors immediately, even if a fade is still running.
   const prepared=loaded.then(()=>true,()=>false);
   await phase(0,1,reducedMotion?0:timing[0]);if(cancelled)return;
   const [,available]=await Promise.all([phase(1,1,timing[1]),prepared]);
   if(cancelled)return;await visible();if(cancelled)return;
   // Leave the current scene intact if its new artwork could not be loaded.
   if(available)replace();
   if(cancelled)return;
   await phase(1,0,reducedMotion?0:timing[2]);if(cancelled)return;
   clear();done();
  }catch{if(!cancelled){clear();done();}}
 })();
 return ()=>{if(cancelled)return;cancelled=true;clear();};
}

// Brief local Foley only; every context and source is disposed on scene changes.
export function playEpilogueSound(kind,volume=0){
 if(!kind||volume<=0)return ()=>{};
 let context,timer;const nodes=[];
 const stop=()=>{clearTimeout(timer);for(const node of nodes){try{node.stop?.();node.disconnect?.();}catch{}}if(context&&context.state!=='closed')context.close().catch(()=>{});};
 try{
  const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)return stop;
  context=new Audio();context.resume().catch(()=>{});const now=context.currentTime;
  const gain=context.createGain();nodes.push(gain);gain.connect(context.destination);
  if(kind==='ring'||kind==='lock'||kind==='unlock'){
   const osc=context.createOscillator();nodes.push(osc);osc.type=kind==='ring'?'sine':'triangle';
   const duration=kind==='ring'?1.1:.2;
   osc.frequency.setValueAtTime(kind==='ring'?1850:kind==='lock'?1200:850,now);
   osc.frequency.exponentialRampToValueAtTime(kind==='ring'?1650:160,now+duration);
   gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(Math.max(.0001,volume*(kind==='ring'?.025:.11)),now+.015);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
   osc.connect(gain);osc.start();osc.stop(now+duration);
  }else{
   const duration=kind==='fire'?.9:.5,buffer=context.createBuffer(1,Math.floor(context.sampleRate*duration),context.sampleRate),data=buffer.getChannelData(0);
   for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(kind==='fire'?(i%900<35?1:.12):Math.sin(Math.PI*i/data.length));
   const source=context.createBufferSource(),filter=context.createBiquadFilter();nodes.push(source,filter);source.buffer=buffer;filter.type='bandpass';filter.frequency.value=kind==='fire'?950:2200;filter.Q.value=.65;
   gain.gain.setValueAtTime(volume*.08,now);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
   source.connect(filter);filter.connect(gain);source.start();
  }
  timer=setTimeout(stop,1600);
 }catch{stop();}
 return stop;
}

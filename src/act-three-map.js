import {ACT_THREE_COLLAPSE_ART,ACT_THREE_COLLAPSE_HOLD,actThreeCollapseFrame,actThreeCollapseHTML} from './act-three-collapse.js';
import {chapterDialogueControlsHTML,createChapterDialogueControls} from './dialogue-controls.js';
import {EVENT_EXPRESSIONS} from './character-art.js';
import {eventStageHTML} from './event-stage.js';
import {messagePages} from './message-pages.js';
import {ACT_THREE_MAP_SCENES,ACT_THREE_STORE_INTERIOR,actThreeStoryProgress,actThreeStorySave} from './act-three-story.js';
export const ACT_THREE_MAP_PLACES=[
 {id:'home',name:'けもの荘',image:'assets/events/chapter3/map-home.png',action:'交差点へ',note:'モクとルナを脱出地点まで連れていく'},
 {id:'crossing',name:'交差点',image:'assets/events/chapter3/map-crossing.png',action:'裏道から回避する',note:'交差点はゾンビの群れで通れない'},
 {id:'detour',name:'裏道',image:'assets/events/chapter3/map-detour.png',action:'コンビニへ',note:'群れを避け、裏道を進む'},
 {id:'store',name:'コンビニ',image:'assets/events/chapter3/map-store.png',action:'橋へ向かう',note:'脱出地点は、この先の橋'},
 {id:'bridge',name:'脱出地点・橋',image:'assets/events/chapter3/map-bridge.png',action:null,note:'橋に到着'}
];
export const ACT_THREE_MAP_EXPLOSION='assets/events/chapter3/map-explosion-v1.png';
export function actThreeMapVisualState(scene,line){
 return {collapse:scene==='bridge'&&!!line?.collapse,hideCharacters:scene==='bridge'&&!!line?.collapse||!!line?.hidePortraits||scene==='crossing'&&line?.speaker==='narrator'&&!!line.horde||scene==='detour'&&!!line?.explosion, crossing:scene==='crossing'&&!!line?.horde, explosion:scene==='detour'?(line?.explosion?'blast':line?.aftermath?'smoke':'idle'):'none'};
}
export const ACT_THREE_MAP_ZOMBIE='assets/events/chapter3/map-zombie.png';
export const ACT_THREE_MAP_CAST=[
 {id:'manager',name:'大家',image:'assets/characters/manager/matched-v3/idle.png'},
 {id:'cat',name:'モク',image:'assets/characters/cat/observation-v4/stand.png'},
 {id:'hostess',name:'ルナ',image:'assets/characters/hostess/observation-v4/stand.png'}
];
export const ACT_THREE_BRIDGE_SPAN=2.6;
// Map route: home → crossing, then straight UP to the detour, then RIGHT to the store and bridge.
// Coordinates are map-world positions, not the saved story checkpoint (which remains 0–4).
export function actThreeMapWorldPosition(position){
 if(position<=1)return position;
 if(position<=2)return 1;
 if(position<=3)return position-1;
 return 2+(position-3)*ACT_THREE_BRIDGE_SPAN;
}
export function actThreeMapVerticalPosition(position){return Math.min(1,Math.max(0,position-1));}
export function actThreeMapTravelDirection(step){return step===1?'up':'right';}
export function actThreeMapTravelDuration(step,reduced=false){return step===3?(reduced?4.2:8.4):step===1?(reduced?1.2:3):(reduced?.45:2.4);}
export function actThreeMapCheckpoint(value){return Number.isInteger(value)?Math.max(0,Math.min(ACT_THREE_MAP_PLACES.length-1,value)):0;}
// Arrival is saved only after motion finishes. Reload during transit returns to departure.
export function actThreeMapTravel(from,to,t){
 const start=actThreeMapCheckpoint(from),end=actThreeMapCheckpoint(to),p=Math.min(1,Math.max(0,t)),ease=p*p*(3-2*p);
 return {position:start+(end-start)*ease,bounce:Math.sin(p*Math.PI)*Math.sin(p*Math.PI*6),finished:p===1};
}
export function actThreeMapHTML(){return `<section class="act-screen act3-map" data-act3-map data-chapter="3" tabindex="-1" aria-label="第三幕 街マップ"><h2 id="modal-title" class="visually-hidden">街マップ</h2><div class="map-viewport"><div class="map-world">${ACT_THREE_MAP_PLACES.map((p,i)=>`<div class="map-landmark" data-map-landmark="${i}"><img src="${p.image}" alt="${p.name}" draggable="false"><span class="map-location-label">${p.name}</span></div>`).join('')}<div class="map-zombies" aria-label="交差点を横切るゾンビの群れ">${Array.from({length:6},(_,i)=>`<div class="map-zombie-walker" style="--z:${i};--lane:${i%3}"><img src="${ACT_THREE_MAP_ZOMBIE}" alt="" draggable="false"></div>`).join('')}</div><div class="map-bridge-route" aria-label="コンビニから橋までの長い道" role="img">
  <div class="map-route-zombies route-zombies-a">${[0,1].map(i=>`<img src="${ACT_THREE_MAP_ZOMBIE}" alt="" style="--walker:${i}" draggable="false">`).join('')}</div>
  <div class="map-route-zombies route-zombies-b">${[0,1,2].map(i=>`<img src="${ACT_THREE_MAP_ZOMBIE}" alt="" style="--walker:${i}" draggable="false">`).join('')}</div>
  <div class="map-route-zombies route-zombies-c">${[0,1].map(i=>`<img src="${ACT_THREE_MAP_ZOMBIE}" alt="" style="--walker:${i}" draggable="false">`).join('')}</div>
  <div class="map-route-zombies route-zombies-d">${[0,1,2].map(i=>`<img src="${ACT_THREE_MAP_ZOMBIE}" alt="" style="--walker:${i}" draggable="false">`).join('')}</div>
</div></div><div class="map-explosion-effect" aria-hidden="true"><div class="map-explosion-light"></div><img class="map-explosion-sticker" src="${ACT_THREE_MAP_EXPLOSION}" alt="" draggable="false"><div class="map-explosion-smoke"></div></div><div class="map-party" aria-label="大家、モク、ルナ">${ACT_THREE_MAP_CAST.map((c,i)=>`<div class="map-companion map-companion-${c.id}" style="--member:${i}"><img src="${c.image}" alt="${c.name}" draggable="false"></div>`).join('')}</div><div class="map-loading" role="status"><span>マップを読み込んでいます…</span><button type="button" data-map-retry hidden>再読み込み</button></div></div><img class="map-scene-backdrop" alt="荒らされたコンビニの店内" hidden>${actThreeCollapseHTML()}<div class="map-dialogue act3-dialogue" data-renderer="event-stage" hidden></div>${chapterDialogueControlsHTML()}<div class="map-panel"><div class="map-status visually-hidden"><strong data-map-location>けもの荘</strong><p data-map-status role="status" aria-live="polite"></p></div><nav class="map-actions" aria-label="移動操作"><button type="button" data-map-next class="map-next" disabled>交差点へ <span aria-hidden="true">➜</span></button><button type="button" data-map-pause hidden>一時停止</button><button type="button" data-map-finish class="map-next" hidden>ここまでを読み終える</button><button type="button" data-map-reset hidden>もう一度移動する</button><button type="button" data-map-back>戻る</button></nav></div></section>`;}
export function startActThreeMap(root,{initialStep=0,onArrival=()=>{},onBack=()=>{},story=false,initialProgress=null,onProgress=()=>{},voice=null,bgm=null,silent=false,onScene=()=>{},onLoop=()=>{}}={}){
 const section=root.querySelector('[data-act3-map]');if(!section)return ()=>{};
 const viewport=section.querySelector('.map-viewport'),world=section.querySelector('.map-world'),party=section.querySelector('.map-party'),zombies=section.querySelector('.map-zombies'),bridgeRoute=section.querySelector('.map-bridge-route');
 const next=section.querySelector('[data-map-next]'),pause=section.querySelector('[data-map-pause]'),reset=section.querySelector('[data-map-reset]'),status=section.querySelector('[data-map-status]'),loading=section.querySelector('.map-loading');
 const dialogue=section.querySelector('.map-dialogue'),backdrop=section.querySelector('.map-scene-backdrop'),collapseScene=section.querySelector('.bridge-collapse-scene');
 let collapseActive=false,collapseAge=0,collapseReady=false;
 let progress=story?actThreeStoryProgress(initialProgress):null,shownLine=null;
 const publish=()=>{if(story)onProgress(actThreeStorySave(progress));};
 const reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches===true;
 let step=story?progress.step:actThreeMapCheckpoint(initialStep),position=step,elapsed=0,moving=false,paused=false,ready=false,dead=false,last=null,raf=0,version=0;
 const paint=()=>{
  const width=viewport.clientWidth,height=viewport.clientHeight,gap=Math.max(380,Math.min(1100,width*.94)),anchor=width*.48;
  const climb=Math.max(260,height*.84);
  world.style.transform=`translate3d(${-actThreeMapWorldPosition(position)*gap}px,${actThreeMapVerticalPosition(position)*climb}px,0)`;
  section.querySelectorAll('[data-map-landmark]').forEach((el,i)=>{
   el.style.left=`${anchor+actThreeMapWorldPosition(i)*gap}px`;
   el.style.transform=`translate(-50%,${-actThreeMapVerticalPosition(i)*climb}px)`;
   el.dataset.current=String(i===step);
  });
  bridgeRoute.style.left=`${anchor+actThreeMapWorldPosition(3)*gap}px`;
  bridgeRoute.style.width=`${ACT_THREE_BRIDGE_SPAN*gap}px`;
  bridgeRoute.style.transform=`translateY(${-climb}px)`;
  zombies.style.left=`${gap-140}px`;zombies.style.setProperty('--cross-distance',`${width+280}px`);zombies.hidden=position<.6||position>2.5||story&&progress.scene==='crossing'&&!ACT_THREE_MAP_SCENES.crossing.lines[progress.cursor].horde;
  party.style.left=`${anchor}px`;
  const upwardStep=moving&&step===1;
  const upwardProgress=upwardStep?Math.min(1,elapsed/actThreeMapTravelDuration(step,reduced)):0;
  party.style.transform=upwardStep&&!reduced?`translateY(${-Math.sin(Math.PI*upwardProgress)*Math.min(64,height*.14)}px)`:'';
  party.style.setProperty('--bounce',String(moving&&!reduced?Math.sin(elapsed*9)*4:0));
  party.style.setProperty('--lean',moving&&!paused&&!reduced?(upwardStep?'0deg':'5deg'):'0deg');
  section.dataset.moving=String(moving&&!paused);section.dataset.paused=String(paused||document.hidden);section.dataset.location=ACT_THREE_MAP_PLACES[step].id;
  section.dataset.longTravel=String(moving&&step===3);
  section.dataset.travelDirection=moving?actThreeMapTravelDirection(step):'idle';
  next.hidden=(story?(step>=4||progress?.seen.includes('return')):step===4)||moving||!!progress?.scene;next.disabled=!ready;next.innerHTML=`${ACT_THREE_MAP_PLACES[step].action||''} <span aria-hidden="true">➜</span>`;
  pause.hidden=!moving;pause.textContent=paused?'移動を再開':'一時停止';pause.setAttribute('aria-pressed',String(paused));reset.hidden=story?true:step!==4||moving;
  section.querySelector('[data-map-location]').textContent=ACT_THREE_MAP_PLACES[step].name;
  section.querySelector('[data-map-finish]').hidden=!(story&&progress?.seen.includes('homecoming')&&!progress.scene);
  if(story)paintDialogue();else controls.refresh();
  status.textContent=moving?(paused?'移動を一時停止しています':step===3?'ゾンビのいる長い道を抜け、橋へ移動中':step===1?'ゾンビを避けて裏道を北へ移動中':`${ACT_THREE_MAP_PLACES[step+1].name}へ移動中`):ACT_THREE_MAP_PLACES[step].note;
 };
 const paintDialogue=()=>{
  const scene=progress.scene?ACT_THREE_MAP_SCENES[progress.scene]:null;
  dialogue.hidden=!scene||!ready;controls.refresh();
  section.dataset.dialogue=String(!!scene&&ready);
  section.querySelector('.map-panel').hidden=!!scene;
  backdrop.hidden=true;
  if(!scene||!ready){section.dataset.rewindReturn=String(story&&progress?.seen.includes('return'));collapseActive=false;collapseAge=0;collapseReady=false;collapseScene.hidden=true;section.dataset.collapse='false';section.dataset.explosion='none';section.dataset.hordeCrossing='false';section.dataset.hidePortraits='false';if(shownLine){voice?.stop();shownLine=null;}section.dataset.scene='map';onScene('map');return;}
  const line=scene.lines[progress.cursor],inside=!!line.inside;
  const collapsing=progress.scene==='bridge'&&!!line.collapse;
  if(collapsing&&!collapseActive){collapseAge=0;collapseReady=false;}
  collapseActive=collapsing;section.dataset.collapse=String(collapsing);
  if(collapsing)bgm?.setSuppressed?.(true);
  paintCollapse();
  const visual=actThreeMapVisualState(progress.scene,line);
  section.dataset.explosion=visual.explosion;section.dataset.hordeCrossing=String(visual.crossing);section.dataset.hidePortraits=String(visual.hideCharacters);
  section.dataset.scene=inside?'mimi':progress.scene;
  section.dataset.rewindReturn=String(progress.scene==='return'||progress.scene==='homecoming'||progress.seen.includes('return'));
  if(inside){backdrop.src=ACT_THREE_STORE_INTERIOR;backdrop.hidden=false;}
  const revealed=progress.scene==='return'||progress.scene==='store'&&scene.lines.slice(0,progress.cursor+1).some(l=>l.revealMimi);
  const cast=scene.cast.filter(id=>id!=='rabbit'||revealed);
  const event={actScene:'act3-'+progress.scene,detail:scene.lines[0].text,lines:scene.lines,cast};
  dialogue.innerHTML=eventStageHTML(event,[],progress.cursor,progress.page,{hideCharacters:visual.hideCharacters});
  if(line.speaker==='mystery')dialogue.querySelector('.speaker-name').textContent='？？？';
  if(line.speaker==='rabbit')dialogue.querySelector('.speaker-name').textContent='ミミ';

  if(shownLine!==line){shownLine=line;voice?.stop();if(line.speaker!=='narrator')voice?.play(line,'act3-map:'+progress.scene+':'+progress.cursor);}
  onScene(inside?'mimi':'map');controls.refresh();
 };
 const paintCollapse=()=>{collapseScene.hidden=!collapseActive;if(!collapseActive)return;const frame=actThreeCollapseFrame(collapseAge,reduced);collapseScene.dataset.phase=frame.phase;collapseScene.querySelector('.bridge-collapse-frame').style.transform=frame.transform;const fall=collapseScene.querySelector('.bridge-collapse-fall'),after=collapseScene.querySelector('.bridge-collapse-after');fall.style.opacity=frame.fallOpacity;after.style.opacity=frame.afterOpacity;fall.hidden=frame.fallOpacity===0;after.hidden=frame.afterOpacity===0;};
 function advanceDialogue(back=false){
  if(!story||!progress.scene||!ready||!back&&collapseActive&&!actThreeCollapseFrame(collapseAge,reduced).ready)return;
  const scene=ACT_THREE_MAP_SCENES[progress.scene],pages=messagePages(scene.lines[progress.cursor].text);
  if(back){if(progress.page>0)progress.page--;else if(progress.cursor>0){progress.cursor--;progress.page=messagePages(scene.lines[progress.cursor].text).length-1;}}
  else if(progress.page<pages.length-1)progress.page++;
  else if(progress.cursor<scene.lines.length-1){progress.cursor++;progress.page=0;}
  else {
    if(progress.scene==='bridge'){voice?.stop();onLoop();return;}
    if(!progress.seen.includes(progress.scene))progress.seen.push(progress.scene);
    if(progress.scene==='return'){
      // Escort Mimi back; show the existing apartment landmark, no new map roads or events.
      step=0;position=0;moving=false;elapsed=0;last=null;progress.step=0;
      progress.scene='homecoming';
    }else progress.scene=null;
    progress.cursor=0;progress.page=0;
   }
  if(progress.scene==='store'&&scene.lines[progress.cursor].keyGiven)progress.keyGiven=true;
  publish();paint();
 }
 const stop=()=>{if(dead)return;controls.stop();voice?.stop();voice?.setSuspended(false);dead=true;version++;cancelAnimationFrame(raf);section.removeEventListener('click',click);section.removeEventListener('keydown',key);document.removeEventListener('visibilitychange',visibility);globalThis.removeEventListener('resize',paint);};
 function click(e){if(controls.click(e))return;const b=e.target.closest('button');if(!b)return;e.preventDefault();e.stopPropagation();
  if(b.hasAttribute('data-map-finish')){stop();onBack();return;}
  if(b.hasAttribute('data-map-back')){stop();onBack();return;}
  if(b.hasAttribute('data-map-retry')){load();return;}
  if(b.hasAttribute('data-map-pause')&&moving){paused=!paused;last=null;paint();return;}
  if(!ready||moving||progress?.scene)return;
  if(b.hasAttribute('data-map-reset')){step=0;position=0;elapsed=0;onArrival(step);paint();return;}
  if(b.hasAttribute('data-map-next')&&step<4&&!progress?.seen.includes('return')){moving=true;paused=false;elapsed=0;last=null;paint();}
 }
 function key(e){if(e.repeat||e.target.closest('button')||!progress?.scene||controls.blocked)return;if(['Enter','Space','ArrowRight'].includes(e.code)){e.preventDefault();e.stopPropagation();advanceDialogue();}else if(e.code==='ArrowLeft'){e.preventDefault();e.stopPropagation();advanceDialogue(true);}}
 function visibility(){last=null;voice?.setSuspended(document.hidden);paint();}
 function tick(now){if(dead)return;const dt=last===null?0:Math.min(.05,(now-last)/1000);last=now;
  if(ready&&moving&&!paused&&!document.hidden){elapsed+=dt;const f=actThreeMapTravel(step,step+1,elapsed/actThreeMapTravelDuration(step,reduced));position=f.position;if(f.finished){step++;moving=false;elapsed=0;if(story){progress.step=step;progress.scene=step===1?'crossing':step===2?'detour':step===3?'store':step===4?'bridge':null;progress.cursor=0;progress.page=0;publish();}onArrival(step);}paint();}
  if(ready&&collapseActive&&!document.hidden&&!controls.blocked){collapseAge=Math.min(ACT_THREE_COLLAPSE_HOLD,collapseAge+dt);paintCollapse();if(!collapseReady&&actThreeCollapseFrame(collapseAge,reduced).ready){collapseReady=true;controls.refresh();}}
  raf=requestAnimationFrame(tick);
 }
 function load(){const token=++version;ready=false;loading.hidden=false;loading.querySelector('button').hidden=true;
  const sources=[...(story?[ACT_THREE_STORE_INTERIOR,...Object.values(EVENT_EXPRESSIONS.rabbit)]:[]),...ACT_THREE_MAP_PLACES.map(p=>p.image),ACT_THREE_MAP_ZOMBIE,ACT_THREE_MAP_EXPLOSION,...Object.values(ACT_THREE_COLLAPSE_ART),...ACT_THREE_MAP_CAST.map(c=>c.image)];
  Promise.all(sources.map(src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=async()=>{try{await img.decode?.();resolve();}catch(e){reject(e);}};img.onerror=reject;img.src=src;}))).then(()=>{if(dead||token!==version)return;ready=true;loading.hidden=true;publish();paint();}).catch(()=>{if(dead||token!==version)return;loading.querySelector('span').textContent='画像を読み込めませんでした';loading.querySelector('button').hidden=false;});
 }
 const controls=createChapterDialogueControls(section,{getState:()=>{const scene=progress?.scene?ACT_THREE_MAP_SCENES[progress.scene]:null;return {active:ready&&!!scene,canAdvance:!collapseActive||actThreeCollapseFrame(collapseAge,reduced).ready,canBack:progress?.cursor>0||progress?.page>0,last:!!scene&&progress.cursor===scene.lines.length-1,line:scene?.lines[progress.cursor],lines:scene?.lines};},onNext:()=>advanceDialogue(),onBack:()=>advanceDialogue(true),onSkip:()=>{if(!progress?.scene)return;progress.cursor=ACT_THREE_MAP_SCENES[progress.scene].lines.length-1;progress.page=messagePages(ACT_THREE_MAP_SCENES[progress.scene].lines[progress.cursor].text).length-1;publish();paint();},voice,bgm,silent,onBlock:blocked=>{section.dataset.effectsPaused=String(blocked);}});
 section.addEventListener('click',click);section.addEventListener('keydown',key);document.addEventListener('visibilitychange',visibility);globalThis.addEventListener('resize',paint);section.focus({preventScroll:true});paint();load();raf=requestAnimationFrame(tick);return stop;
}

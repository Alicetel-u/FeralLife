import {eventConversation,eventStageHTML} from './event-stage.js';

// Derive direction from existing dialogue so old saves and voice keys stay valid.
export function actTwoMorningDirection(event,index=0){
 if(event?.actScene!=='reply')return null;
 const lines=eventConversation(event),morning=lines.findIndex(l=>l.text.startsWith('翌朝。チュン'));
 if(morning<0)return null;
 const find=text=>lines.findIndex(l=>l.text.includes(text));
 const entry=lines.findIndex(l=>/そのとき、モクが部屋に入って|そこへモクが顔を出した/.test(l.text));
 const exit=lines.findIndex(l=>/モクは悲鳴を上げ、部屋から逃げ出した|モクは勢いよく扉を閉めた/.test(l.text));
 const days=find('数日後。'),months=find('数か月後。');
 const empty=lines.findIndex(l=>/102号室には、ルナの荷物|102号室はもぬけの殻/.test(l.text));
 const night=find('その夜。');
 let cast=event.cast||['hostess','cat'];
 if(night>=0&&index>=night)cast=['hostess'];
 if(index>=morning-1)cast=[];
 if(index>=entry&&index<exit||index>=days&&days>=0)cast=['cat'];
 const weeks=find('それから数週間。');
 if(weeks>=0&&index>=weeks&&index<months)cast=[];
 const evening=night>=0?night:find('ねえ、大家さん。');
 const cut=index<evening?'confrontation':index<morning-1?'night':index===morning-1?'fade':index<empty?'morning':index<days?'empty':index<months?'days':'months';
 return {morning,fade:morning-1,cast,cut,silent:index>=morning-1&&index<days};
}

// Short sparrow calls, no network asset or voice generation. Follows sound settings.
export function prepareMorningBirds(volume,sharedContext=null){
 let ctx,timer,owned=false;const nodes=[];
 const stop=()=>{clearTimeout(timer);for(const node of nodes){try{node.stop?.();node.disconnect?.();}catch{}}nodes.length=0;if(owned&&ctx&&ctx.state!=='closed')ctx.close().catch(()=>{});};
 try{
  if(sharedContext)ctx=sharedContext;
  else{
   const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;
   if(Audio){ctx=new Audio();owned=true;ctx.resume().catch(()=>{});}
  }
 }catch{}
 return {stop,play(){
  if(!ctx||ctx.state==='closed')return stop;
  try{
   for(const offset of [.05,.23,.76,.94]){
    const osc=ctx.createOscillator(),gain=ctx.createGain(),t=ctx.currentTime+offset;
    nodes.push(osc,gain);
    osc.frequency.setValueAtTime(2600,t);osc.frequency.exponentialRampToValueAtTime(3900,t+.045);osc.frequency.exponentialRampToValueAtTime(2800,t+.11);
    gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(Math.max(.0001,volume*.055),t+.015);gain.gain.exponentialRampToValueAtTime(.0001,t+.12);
    osc.connect(gain);gain.connect(ctx.destination);osc.start(t);osc.stop(t+.13);
    osc.onended=()=>{try{osc.disconnect();gain.disconnect();}catch{}};
   }
   timer=setTimeout(stop,1400);
  }catch{stop();}
  return stop;
 }};
}

export function actTwoMorningStageHTML(event,residents,index=0,page=0){
 const direction=actTwoMorningDirection(event,index);
 if(!direction)return eventStageHTML(event,residents,index,page);
 const stage=eventStageHTML({...event,cast:direction.cast},residents,index,page,{hideCharacters:!direction.cast.length});
 const label={confrontation:'けもの荘 / 玄関',night:'けもの荘 / 夜',fade:'その夜',morning:'翌朝',empty:'102号室 / 返事のない扉',days:'数日後',months:'数か月後'}[direction.cut];
 const exterior=['confrontation','months'].includes(direction.cut);
 const shot=`<div class="act-two-morning-shot" aria-hidden="true"><img src="${exterior?'assets/apartments.png':'assets/events/first-fire-corridor.png'}" alt=""></div><span class="act-two-morning-label" aria-hidden="true">${label}</span>`;
 return stage.replace('class="event-stage ',`data-cut="${direction.cut}" data-quiet="${direction.silent}" class="event-stage act-two-morning-stage `).replace(/^(<div[^>]*>)/,'$1'+shot);
}

// Pause the full second of black when Safari is backgrounded; disposal never advances.
export function startMorningBlackout(root,done){
 const doc=root.ownerDocument;
 const animation=root.animate([{opacity:1},{opacity:1}],{duration:1000});
 let finished=false;
 const sync=()=>{if(doc.hidden)animation.pause();else animation.play();};
 const cleanup=()=>{animation.cancel();doc.removeEventListener('visibilitychange',sync);};
 animation.finished.then(()=>{if(finished)return;finished=true;cleanup();done();},()=>{});
 doc.addEventListener('visibilitychange',sync);sync();
 return ()=>{finished=true;cleanup();};
}

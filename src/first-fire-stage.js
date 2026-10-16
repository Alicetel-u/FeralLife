import {eventConversation,eventStageHTML} from './event-stage.js';

// Direction only: the authored dialogue, voice keys and saved cursor stay intact.
export function isFirstFireReply(event,act){
 return act?.chapter!==2&&act?.attempt===1&&act?.status==='bad'&&act?.failure==='ash-trash'
  &&event?.actScene==='reply'&&event.lines?.[0]?.text==='とりあえず、ゴミ袋にまとめて捨てとけ。';
}
export function firstFireCut(lines,index){
 const reached=text=>{const at=lines.findIndex(l=>l.text.includes(text));return at>=0&&index>=at;};
 if(reached('返事はなかった'))return 'silence';
 if(reached('頼む、返事をしてくれ'))return 'plea';
 if(reached('激しい崩落音'))return 'collapse';
 if(reached('大家が駆け寄る'))return 'blocked';
 if(reached('今そっちに'))return 'rush';
 if(reached('ガラスの割れる音'))return 'ignition';
 if(reached('突然、黒い煙'))return 'smoke';
 if(reached('その場を離れた'))return 'departure';
 return 'trust';
}
export function firstFireStageHTML(event,residents,index=0,page=0){
 const lines=eventConversation(event),cut=firstFireCut(lines,index),inside=cut==='trust',corridor=['departure','rush','blocked'].includes(cut);
 if(inside)return eventStageHTML(event,residents,index,page);
 const background=inside?'assets/rooms/cat/interior-v2.png':corridor?(cut==='departure'?'assets/events/first-fire-corridor.png':'assets/events/first-fire-entrance.png'):cut==='smoke'?'assets/apartments.png':'assets/events/first-fire-exterior.png';
 const shot=`<div class="first-fire-shot" aria-hidden="true"><img class="first-fire-background" src="${background}" alt=""><div class="first-fire-smoke"></div><div class="first-fire-vignette"></div><div class="first-fire-slash"></div></div><div class="first-fire-bars" aria-hidden="true"></div><span class="first-fire-location" aria-hidden="true">${inside?'101 / 23:00':corridor?'けもの荘 · 一階廊下':'けもの荘 · 屋外'}</span>`;
 // Reuse the exact normal message window, nameplate, colors, pagination and tap target.
 return eventStageHTML(event,residents,index,page,{hideCharacters:!inside})
  .replace('class="event-stage ',`data-cut="${cut}" class="event-stage first-fire-stage `)
  .replace(/^(<div[^>]*>)/,'$1'+shot);
}

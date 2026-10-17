import {eventConversation,eventStageHTML} from './event-stage.js';

export function isFirstStalkerReply(event){
 return event?.actScene==='reply'&&event.lines?.[0]?.text==='もう大丈夫だろ。今日はゆっくり休め。'
  &&event.lines.some(l=>l.text==='扉が少し開いている。');
}
// Preserve cursor positions and spoken lines in older saves. Only narration changes.
export function safeStalkerLine(line){
 const text={
  '部屋の奥で、ルナが血だらけになって倒れていた。':'部屋の奥へ目を向けた大家が、その場で足を止めた。',
  '大家はルナに駆け寄る。':'大家は部屋の奥へ駆け寄り、膝をついた。',
  'ルナは動かない。':'背後で、床が小さくきしんだ。',
  '大家が立ち上がろうとした、その瞬間。鈍い衝撃音が響く。':'振り返るより早く、背後から鈍い衝撃が走った。',
  '……カチッ。':'何も、見えない。',
  '暗闇の中で時計の針が逆回転を始める。':'声を出そうとしても、息が続かない。',
  '針が夕暮れの18時を指すと、白い光が広がった。':'意識が、遠のいていく。',
  '血だらけのルナを見た直後、夕暮れの景色が戻っている。':'102号室の暗闇が途切れ、夕暮れの景色が戻っている。',
  '血だらけで倒れていたはずのルナが、何事もなかったように立っている。':'さっきは何度呼んでも返事がなかった。そのルナが、今は目の前で話している。'
 }[line.text]||line.text;
 const result={...line,text};
 if(line.tragedyEffect==='clock'||line.flashbackEffect==='whiteout'){result.tragedyEffect='blackout';delete result.flashbackEffect;}
 return result;
}
export function firstStalkerCut(lines,index){
 const reached=text=>{const at=lines.findIndex(l=>l.text.includes(text));return at>=0&&index>=at;};
 if(reached('視界が揺れ'))return 'blackout';
 if(reached('背後から鈍い衝撃')||reached('大家が立ち上がろう'))return 'impact';
 if(reached('背後で、床が'))return 'behind';
 if(reached('膝をついた'))return 'plea';
 if(reached('足を止めた'))return 'silence';
 if(reached('倒れた椅子'))return 'room';
 if(reached('扉が少し'))return 'door';
 if(reached('深夜。'))return 'corridor';
 return 'farewell';
}
let stalkerAssetsReady=false;
export function prepareFirstStalkerAssets(){
 if(stalkerAssetsReady||typeof Image==='undefined')return;
 stalkerAssetsReady=true;
 for(const src of ['assets/events/first-stalker-door.png','assets/events/first-stalker-room.png']){const image=new Image();image.src=src;image.decode?.().catch(()=>{});}
}
export function firstStalkerStageHTML(event,residents,index=0,page=0){
 const lines=eventConversation(event),cut=firstStalkerCut(lines,index);
 if(cut==='farewell')return eventStageHTML(event,residents,index,page);
 const corridor=cut==='corridor'||cut==='door';
 const src=corridor?'assets/events/first-stalker-door.png':'assets/events/first-stalker-room.png';
 // Same dialogue window, speaker colors, history, pagination and tap targets as act one.
 const stage=eventStageHTML(event,residents,index,page,{hideCharacters:true,cinematic:true});
 const shot=`<div class="first-stalker-shot" aria-hidden="true"><img class="first-stalker-background" src="${src}" alt=""><div class="first-stalker-shadow"></div><div class="first-stalker-shock"></div></div><div class="first-fire-bars" aria-hidden="true"></div><span class="first-fire-location" aria-hidden="true">${corridor?'102 / 深夜':'102 / 室内'}</span>`;
 return stage.replace('class="event-stage ',`data-cut="${cut}" class="event-stage first-fire-stage first-stalker-stage `).replace(/^(<div[^>]*>)/,'$1'+shot);
}

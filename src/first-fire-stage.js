import { EVENT_EXPRESSIONS } from './character-art.js';
import { speakerColorStyle } from './speaker-colors.js';

const fireEscape = value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
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
export function firstFireStageHTML(lines,index,pageText){
 const line=lines[index],cut=firstFireCut(lines,index),inside=cut==='trust',corridor=['departure','rush','blocked'].includes(cut);
 const background=inside?'assets/rooms/cat/interior-v2.png':corridor?(cut==='departure'?'assets/events/first-fire-corridor.png':'assets/events/first-fire-entrance.png'):cut==='smoke'?'assets/apartments.png':'assets/events/first-fire-exterior.png';
 const distant=line.speaker==='cat'&&!inside;
 const speaker=line.speaker==='manager'?'大家':line.speaker==='cat'?(distant?'モク · 101号室の中':'モク'):'';
 const portrait=inside?EVENT_EXPRESSIONS.cat[line.emotion]||EVENT_EXPRESSIONS.cat.neutral:null;
 return `<div class="event-stage first-fire-stage" data-cut="${cut}" data-speaker="${fireEscape(line.speaker)}"><div class="first-fire-shot" aria-hidden="true"><img class="first-fire-background" src="${background}" alt="">${portrait?`<img class="first-fire-moku" src="${portrait}" alt="">`:''}<div class="first-fire-smoke"></div><div class="first-fire-vignette"></div><div class="first-fire-slash"></div></div><div class="first-fire-bars" aria-hidden="true"></div><span class="first-fire-location" aria-hidden="true">${inside?'101 / 23:00':corridor?'けもの荘 · 一階廊下':'けもの荘 · 屋外'}</span><div class="stage-bubble first-fire-caption ${distant?'first-fire-distant':''} ${line.speaker==='narrator'?'first-fire-narration':''}" style="${speakerColorStyle(line)}" aria-live="polite" aria-atomic="true">${speaker?`<span class="first-fire-speaker">${fireEscape(speaker)}</span>`:''}<p>${fireEscape(pageText)}</p></div><span class="first-fire-next" aria-hidden="true">CLICK / ENTER <b>▸</b></span></div>`;
}

// Shared left/right conversation view for requests, replies and ordinary journal scenes.
import { EVENT_ART, CHARACTER_ART, eventParticipants } from './character-art.js';
import { CHARACTERS } from './simulation.js';
const eventEscape = value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const eventSpeakerName = speaker=>speaker==='manager'?'あなた · 管理人':speaker==='narrator'?'けもの荘の記録':CHARACTERS[speaker]?.name||'住人';

export function eventConversation(event) {
  const lines=(event.lines||[]).filter(l=>l&&typeof l.text==='string');
  // A narration intro preserves story information that wasn't spoken aloud.
  return lines.length && lines[0].text===event.detail ? lines : [{speaker:'narrator',text:event.detail},...lines];
}

export function eventStageHTML(event,residents,index=0) {
  const lines=eventConversation(event),cursor=Math.max(0,Math.min(index,lines.length-1)),line=lines[cursor];
  const participants=Array.isArray(event.cast)?event.cast.filter(type=>CHARACTERS[type]):eventParticipants(event,residents),left=participants[0]||null;
  const right=line.speaker==='manager'&&participants[1]?participants[1]:line.speaker!=='narrator'&&line.speaker!==left?line.speaker:participants[1]||'manager';
  const character=(type,side)=> {
    const src=EVENT_ART[type]||CHARACTER_ART[type]?.src,active=line.speaker===type;
    return `<figure class="stage-character ${side} ${active?'speaking':''}" data-character="${eventEscape(type||'narrator')}">${src?`<img src="${src}" alt="${eventEscape(eventSpeakerName(type))}の立ち絵">`:''}<figcaption>${eventEscape(eventSpeakerName(type||'narrator'))}</figcaption></figure>`;
  };
  const side=line.speaker===left?'left':line.speaker===right?'right':'narration';
  return `<div class="event-stage">${character(left,'left')}${character(right,'right')}<div class="stage-bubble ${side}" aria-live="polite" aria-atomic="true"><strong class="stage-speaker"><span aria-hidden="true">🐾</span> ${eventEscape(eventSpeakerName(line.speaker))}</strong><p>${eventEscape(line.text)}</p></div><span class="stage-page">${cursor+1} / ${lines.length}</span></div>`;
}

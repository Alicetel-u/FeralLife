// Shared left/right conversation view for requests, replies and ordinary journal scenes.
import { EVENT_ART, CHARACTER_ART, eventParticipants } from './character-art.js';
import { CHARACTERS } from './simulation.js';
const eventEscape = value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const eventSpeakerName = speaker=>speaker==='manager'?'あなた · 管理人':speaker==='narrator'?'けもの荘の記録':CHARACTERS[speaker]?.name||'住人';

// Vector ornaments keep their shape at any display size, without platform emoji.
export function eventIcon(name) {
  const paths={
    paw:'<ellipse cx="12" cy="16" rx="6" ry="5"/><ellipse cx="4.5" cy="9" rx="2.6" ry="3.3" transform="rotate(-25 4.5 9)"/><ellipse cx="10" cy="5" rx="2.5" ry="3.3"/><ellipse cx="16" cy="5" rx="2.5" ry="3.3"/><ellipse cx="21" cy="10" rx="2.5" ry="3.3" transform="rotate(25 21 10)"/>',
    heart:'<path d="M12 22 2.5 12C-4 4 6-2 12 5c6-7 16-1 9.5 7Z"/>',
    chat:'<path d="M3 3h18v14H9l-5 4v-4H3Z"/><g fill="#171416"><circle cx="7" cy="10" r="1.2"/><circle cx="12" cy="10" r="1.2"/><circle cx="17" cy="10" r="1.2"/></g>',
    cat:'<path d="M3 8V2l6 4h6l6-4v6c5 12-1 15-9 15S-2 20 3 8Z"/><g fill="#171416"><circle cx="8" cy="13" r="1.2"/><circle cx="16" cy="13" r="1.2"/><path d="m10 17 2-2 2 2-2 2Z"/></g>',
    play:'<path d="M5 3 21 12 5 21Z"/>', skip:'<path d="m2 4 10 8-10 8Zm11 0 10 8-10 8Z"/>',
    log:'<g fill="none" stroke="currentColor" stroke-width="1.7"><rect x="4" y="2" width="16" height="20" rx="1"/><path d="M8 7h8M8 11h8M8 15h8M8 19h5"/></g>',
    hide:'<g fill="none" stroke="currentColor" stroke-width="1.7"><path d="M2 12c5-9 15-9 20 0-5 9-15 9-20 0Z"/><circle cx="12" cy="12" r="4"/><path d="m2 23 20-22"/></g>',
    menu:'<path d="M2 4h20v2H2Zm0 7h20v2H2Zm0 7h20v2H2Z"/>',
    next:'<path d="m2 6 10 8 10-8v7L12 23 2 13Z"/>',
    spark:'<path d="M12 0c1 8 4 11 12 12-8 1-11 4-12 12C11 16 8 13 0 12 8 11 11 8 12 0Z"/>'
  };
  return `<svg class="event-icon icon-${name}" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">${paths[name]||paths.paw}</svg>`;
}
const eventNameFrame=()=>`<svg class="name-frame" viewBox="0 0 360 92" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="nameGold" x2="0" y2="1"><stop stop-color="#fff0bb"/><stop offset=".5" stop-color="#b29265"/><stop offset="1" stop-color="#f8d79a"/></linearGradient></defs><path d="M3 76Q3 42 27 40L34 5Q36 0 42 5L72 27Q119 10 170 18L221 27 264 1Q269-2 272 5L286 43H328Q355 44 355 64L344 82H28Q3 83 3 76Z" fill="#151315" fill-opacity=".94" stroke="url(#nameGold)" stroke-width="2.4"/><path d="M27 79h315" stroke="#9e7756" stroke-width=".6"/></svg>`;

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
  return `<div class="event-stage">${character(left,'left')}${character(right,'right')}<div class="stage-bubble ${side}" aria-live="polite" aria-atomic="true"><div class="window-ornaments" aria-hidden="true"><span class="ornament paw-one">${eventIcon('paw')}</span><span class="ornament paw-two">${eventIcon('paw')}</span><span class="ornament paw-three">${eventIcon('paw')}</span><span class="ornament paw-four">${eventIcon('paw')}</span><span class="ornament cat-bottom">${eventIcon('cat')}</span><span class="ornament heart-outline">♡</span><span class="ornament star-left">${eventIcon('spark')}</span></div><strong class="stage-speaker">${eventNameFrame()}<span class="speaker-paw">${eventIcon('paw')}</span><span class="speaker-name">${eventEscape(eventSpeakerName(line.speaker))}</span><span class="speaker-heart">${eventIcon('heart')}</span><span class="speaker-star">${eventIcon('spark')}</span></strong><p>${eventEscape(line.text)}</p></div><span class="stage-page">${cursor+1} / ${lines.length}</span></div>`;
}

import {isFirstStalkerReply,safeStalkerLine} from './first-stalker-stage.js';
import { speakerColorStyle } from './speaker-colors.js';
import { savedActExpression } from './act-expressions.js';
import { messagePages } from './message-pages.js';
// Shared left/right conversation view for requests, replies and ordinary journal scenes.
import { EVENT_ART, EVENT_EXPRESSIONS, CHARACTER_ART, eventParticipants } from './character-art.js';
import { CHARACTERS } from './simulation.js';
const eventEscape = value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const eventSpeakerName = speaker=>speaker==='manager'?'あなた · 管理人':speaker==='narrator'?'けもの荘の記録':speaker==='mystery'?'謎の声':CHARACTERS[speaker]?.name||'住人';

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
const eventNameFrame=()=>`<svg class="name-frame" viewBox="0 0 360 92" preserveAspectRatio="none" aria-hidden="true"><path d="M15 9 354 0 338 83 0 92Z" fill="#f6edde" stroke="#121016" stroke-width="5"/></svg>`;

export function eventConversation(event) {
  const directed=isFirstStalkerReply(event)||event.actScene==='act2-rewind';
  const lines=(event.lines||[]).filter(l=>l&&typeof l.text==='string').map(l=>directed?safeStalkerLine(l):l);
  // A narration intro preserves story information that wasn't spoken aloud.
  return lines.length && lines[0].text===event.detail ? lines : [{speaker:'narrator',text:directed?safeStalkerLine({text:event.detail}).text:event.detail},...lines];
}

// Explicit emotion wins; older saves and ordinary journal dialogue use text cues.
export const EVENT_EMOTION_NAMES = {neutral:'通常',happy:'喜び',angry:'怒り',sad:'落ち込み・不安',surprised:'驚き',shy:'照れ',tired:'脱力'};
// Directed reactions for the scripted disputes; index follows original event.lines.
const EVENT_CASE_EMOTIONS = {
  cigarette:['angry','angry','neutral','angry','tired','neutral'],
  quit_smoking:['angry','tired','neutral','angry','neutral','surprised'],
  collection:['angry','tired','neutral','angry','neutral','angry'],
  karaoke:['tired','happy','neutral','angry','neutral','tired'],
  wrong_room:['angry','sad','neutral','surprised','angry','neutral'],
  sober:['angry','happy','neutral','angry','neutral','tired'],
  gift:['sad','angry','neutral','angry','neutral','angry'],
  missing_bag:['sad','angry','neutral','angry','sad','neutral'],
  address:['sad','angry','neutral','angry','neutral','tired'],
  expose:['sad','sad','neutral','angry','neutral','tired'],
  limited:['sad','sad','neutral','angry','neutral','sad'],
  insinuation:['shy','sad','neutral','angry','neutral','sad'],
  fridge_empty:['sad','angry','shy','angry','neutral','sad','angry'],
  contest:['neutral','happy','neutral','angry','neutral','sad'],
  soup:['happy','happy','neutral','angry','neutral','sad'],
  midnight:['tired','angry','neutral','angry','neutral','tired'],
  pregnancy:['sad','sad','neutral','sad','angry','neutral'],
  patron_secret:['angry','neutral','neutral','angry','neutral','angry'],
  siblings:['sad','angry','neutral','angry','neutral','angry'],
  fridge:['sad','angry','neutral','sad','neutral','angry'],
  night_talk:['sad','sad','neutral','angry','neutral','sad'],
  produce:['sad','neutral','neutral','tired','neutral','angry'],
  jobs:['angry','sad','neutral','angry','neutral','angry'],
  roomshare:['neutral','tired','neutral','shy','neutral','angry']
};
export function eventEmotion(line, event = {}) {
  const chapterEmotion=savedActExpression(line,event);
  if (Object.hasOwn(EVENT_EMOTION_NAMES,chapterEmotion))return chapterEmotion;
  if (Object.hasOwn(EVENT_EMOTION_NAMES, line?.emotion)) return line.emotion;
  const directed=EVENT_CASE_EMOTIONS[event.caseId]?.[event.lines?.indexOf(line)];
  if (directed) return directed;
  const text = line?.text || '';
  if (/照れ|恥ずか|別に.*ため|好き|近いほど|いい匂い/.test(text)) return 'shy';
  if (/えっ|ええっ|なんで|まさか|びっくり|嘘|うそ|本当|ほんと/.test(text)) return 'surprised';
  if (/ありがとう|嬉し|うれし|楽し|よかった|好き|助か|安心|笑/.test(text)) return 'happy';
  if (/困|ごめん|すみません|不安|心配|怖|悲し|寂し|どうしよう|済まない/.test(text)) return 'sad';
  if (/抗議|うるさ|くせぇ|怒|ふざけ|やめ|悪いの|するな|嗅いでる場合|穴が開|匂いが移/.test(text)) return 'angry';
  if (/眠|疲れ|明日|面倒|めんど|だる|起きてない|何もしない|数えない|一本で/.test(text)) return 'tired';
  return 'neutral';
}

export function eventStageHTML(event,residents,index=0,page=0,{hideCharacters=false,cinematic=false}={}) {
  const lines=eventConversation(event),cursor=Math.max(0,Math.min(index,lines.length-1)),line=lines[cursor];
  const pages=messagePages(line.text),pageIndex=Math.max(0,Math.min(page,pages.length-1)),pageText=pages[pageIndex];
  if(!cinematic&&line.flashbackEffect==='whiteout'){
    const name=line.memoryVoice?'大家（過去の声）':line.innerVoice?'大家（心の声）':eventSpeakerName(line.speaker);
    return `<div class="event-stage memory-whiteout"><div class="memory-text" style="${speakerColorStyle(line)}" aria-live="polite" aria-atomic="true"><span class="visually-hidden">${eventEscape(name)}：</span><p>${eventEscape(pageText)}</p></div><span class="memory-prompt" aria-hidden="true">CLICK / ENTER</span></div>`;
  }
  const cast=Array.isArray(event.cast)?event.cast.filter(type=>CHARACTERS[type]):eventParticipants(event,residents);
  // The unseen man has no portrait. Keep Luna on screen, never use Moku as his stand-in.
  const manFocus=line.speaker==='narrator'&&/^(?:男[「はがの]|翌朝。スーツ姿の男)/.test(line.text);
  const catEntrance=lines.findIndex(l=>l.speaker==='cat'||/モクが(?:現れる|男の前に歩み出た)/.test(l.text));
  const lunaOnly=cast.includes('hostess')&&(manFocus||['bag','act2-rewind'].includes(event.actScene)&&(catEntrance<0||cursor<catEntrance));
  const participants=cast.filter(type=>!(lunaOnly&&type!=='hostess')&&!(Number.isInteger(event.revealCharacterAt)&&index<event.revealCharacterAt&&type==='cat')),left=participants[0]||null;
  const right=line.speaker==='manager'&&participants[1]?participants[1]:line.speaker!=='narrator'&&line.speaker!=='mystery'&&line.speaker!==left?line.speaker:participants[1]||'manager';
  const character=(type,side)=> {
    if(hideCharacters||!type||type==='manager')return '';
    const previous=lines.slice(0,cursor+1).reverse().find(item=>item.speaker===type);
    const emotion=eventEmotion(previous,event),expression=EVENT_EXPRESSIONS[type]?.[emotion];
    const arrivalBust=event.actScene==='act2-prologue'&&type==='hostess'&&emotion==='neutral';
    const src=arrivalBust?'assets/events/busts/hostess-neutral.png':expression||EVENT_ART[type]||CHARACTER_ART[type]?.src,active=line.speaker===type;
    const bustLayout=arrivalBust||!!expression&&(type!=='hostess'||expression!==EVENT_ART.hostess); // Chapter-two arrival always uses bust portraits; other scenes preserve Luna's approved neutral full-body art.
    return `<figure class="stage-character ${side} ${active?'speaking':''} ${bustLayout?'expression-art':'fullbody-art'}" data-emotion="${emotion}" data-character="${eventEscape(type||'narrator')}">${src?`<img src="${src}" alt="${eventEscape(eventSpeakerName(type))}のバストアップ（${EVENT_EMOTION_NAMES[emotion]}）">`:''}<figcaption>${eventEscape(eventSpeakerName(type||'narrator'))}</figcaption></figure>`;
  };
  const side=line.speaker==='manager'?'narration':line.speaker===left?'left':line.speaker===right?'right':'narration';
  return `<div class="event-stage ${participants.length===1?'solo':''} ${line.flashbackEffect==='whiteout'?'memory-whiteout':''}">${character(left,'left')}${character(right,'right')}<button type="button" class="mobile-dialogue-tap" data-dialogue-next tabindex="-1" aria-label="中央をタップして次のセリフへ"></button><div style="${speakerColorStyle(line)}" class="stage-bubble ${side} ${line.innerVoice?'inner-voice':''}" aria-live="polite" aria-atomic="true"><div class="window-ornaments" aria-hidden="true"><span class="ornament paw-one">${eventIcon('paw')}</span><span class="ornament paw-two">${eventIcon('paw')}</span><span class="ornament paw-three">${eventIcon('paw')}</span><span class="ornament paw-four">${eventIcon('paw')}</span><span class="ornament cat-bottom">${eventIcon('cat')}</span><span class="ornament heart-outline">♡</span><span class="ornament star-left">${eventIcon('spark')}</span></div><strong class="stage-speaker">${eventNameFrame()}<span class="speaker-paw">${eventIcon('paw')}</span><span class="speaker-name">${eventEscape(line.memoryVoice?'大家（過去の声）':line.innerVoice?'大家（心の声）':eventSpeakerName(line.speaker))}</span><span class="speaker-heart">${eventIcon('heart')}</span><span class="speaker-star">${eventIcon('spark')}</span></strong><p>${eventEscape(pageText)}</p></div><span class="stage-page">${cursor+1} / ${lines.length}</span>${pages.length>1?`<span class="message-continuation">${pageIndex+1} / ${pages.length}　${pageIndex<pages.length-1?'クリックで続き →':'次へ →'}</span>`:''}</div>`;
}

export function troubleCardHTML(call, slam=false, attempt=1) {
  const loop=Number.isInteger(attempt)&&attempt>1?`<span class="trouble-loop" aria-label="${attempt}周目">${attempt}周目！</span>`:'';
  return `<div class="trouble-card${slam?' slam':''}"><div class="trouble-headline"><p class="trouble-bang">トラブル発生！</p>${loop}</div><p class="trouble-name">${eventEscape(call)}</p></div>`;
}

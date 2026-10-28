import {eventIcon,eventEscape} from './event-stage.js';
import {speakerColorStyle} from './speaker-colors.js';

// Use the same advance button in ordinary events and illustrated chapter scenes.
export function dialogueAdvanceHTML(attributes='data-dialogue-next',label='次のセリフ'){
 return `<button type="button" class="primary-button" ${attributes} aria-label="${eventEscape(label)}">${eventIcon('next')}</button>`;
}
export function chapterDialogueControlsHTML(){return `<div class="chapter-dialogue-controls"><div class="modal-footer">${dialogueAdvanceHTML('data-dialogue-next')}</div><button type="button" class="voice-settings-open" data-event-menu aria-label="ボイス・会話設定">⚙</button><div class="event-menu" hidden><button type="button" data-event-auto aria-pressed="false">AUTO</button><button type="button" data-event-skip>SKIP</button><button type="button" data-event-log>会話履歴</button><button type="button" data-event-hide>会話UIを隠す</button><button type="button" data-voice-toggle>ボイス</button><button type="button" data-bgm-toggle>BGM</button><label>BGM音量 <input type="range" data-bgm-volume min="0" max="1" step="0.05"></label><label>ボイス音量 <input type="range" data-voice-volume min="0" max="1" step="0.05"></label><button type="button" data-dialogue-back>前のセリフへ</button><button type="button" data-event-menu>会話を続ける</button></div><details class="conversation-log"><summary>会話履歴を閉じる</summary><div data-chapter-log></div></details><button type="button" class="event-restore" data-event-hide hidden aria-label="会話UIを再表示">${eventIcon('hide')} 表示を戻す</button></div>`;}

export function createChapterDialogueControls(section,{getState,onNext,onBack,onSkip,voice=null,bgm=null,silent=false,getAuto=null,onAuto=null,onBlock=()=>{}}){
 let auto=false,hidden=false,blocked=false,timer=0,dead=false;
 const q=s=>section.querySelector(s),setBlock=()=>{blocked=!!q('.conversation-log')?.open||q('.event-menu')?.hidden===false||hidden;voice?.setSuspended(blocked||document.hidden);onBlock(blocked);};
 const schedule=()=>{clearTimeout(timer);if(dead||!auto||getAuto)return;const state=getState();if(!state?.active)return;
  timer=setTimeout(()=>{if(dead)return;if(document.hidden||blocked||voice?.busy){schedule();return;}onNext();},Math.max(1200,Math.min(4200,(state.line?.text?.length||0)*65)));timer.unref?.();
 };
 const refresh=()=>{if(dead)return;const s=getState()||{},active=!!s.active;
  const footer=q('.chapter-dialogue-controls .modal-footer');if(footer)footer.hidden=!active;
  const gear=q('.voice-settings-open');if(gear)gear.hidden=!active;
  q('[data-dialogue-back]')?.toggleAttribute?.('disabled',!s.canBack);
  const next=q('[data-dialogue-next]');next?.setAttribute?.('aria-label',s.last?'会話を終えて進む':'次のセリフ');
  const toggle=q('[data-event-auto]');toggle?.setAttribute?.('aria-pressed',String(getAuto?getAuto():auto));
  const voiceButton=q('[data-voice-toggle]');if(voiceButton){voiceButton.textContent='ボイス '+(voice?.enabled?'ON':'OFF');voiceButton.disabled=silent||!voice;}
  const bgmButton=q('[data-bgm-toggle]');if(bgmButton){bgmButton.textContent='BGM '+(bgm?.enabled?'ON':'OFF');bgmButton.disabled=silent||!bgm;}
  const bv=q('[data-bgm-volume]'),vv=q('[data-voice-volume]');if(bv){bv.value=bgm?.volume??0;bv.disabled=silent||!bgm;}if(vv){vv.value=voice?.volume??0;vv.disabled=silent||!voice;}
  schedule();
 };
 const click=e=>{const b=e.target.closest('button');
  if(!b){if(e.target.closest('.stage-bubble')&&!blocked&&getState()?.active){e.preventDefault();e.stopPropagation();onNext();return true;}return false;}
  const has=a=>b.hasAttribute(a);let handled=true;
  if(has('data-dialogue-next')){if(getState()?.active&&!blocked)onNext();}
  else if(has('data-dialogue-back')){if(getState()?.canBack)onBack();}
  else if(has('data-event-menu')){const menu=q('.event-menu');if(menu)menu.hidden=!menu.hidden;setBlock();}
  else if(has('data-event-hide')){hidden=!hidden;section.classList?.toggle('event-ui-hidden',hidden);const restore=q('.event-restore');if(restore)restore.hidden=!hidden;setBlock();}
  else if(has('data-event-auto')){if(onAuto)onAuto();else auto=!auto;q('.event-menu').hidden=true;setBlock();}
  else if(has('data-event-skip')){auto=false;q('.event-menu').hidden=true;setBlock();onSkip();}
  else if(has('data-event-log')){const log=q('.conversation-log');if(log){log.open=!log.open;const host=q('[data-chapter-log]');if(host)host.innerHTML=(getState()?.lines||[]).map(l=>`<p style="${speakerColorStyle(l)}"><strong>${eventEscape(({cat:'モク',hostess:'ルナ',rabbit:'ミミ',manager:'大家',narrator:'記録',announcer:'アナウンサー',mystery:'？？？'})[l.speaker]||l.speaker)}</strong> ${eventEscape(l.text)}</p>`).join('');}setBlock();}
  else if(has('data-voice-toggle')){if(!silent)voice?.setEnabled(!voice.enabled);}
  else if(has('data-bgm-toggle')){if(!silent)bgm?.setEnabled(!bgm.enabled);}
  else handled=false;
  if(handled){e.preventDefault();e.stopPropagation();refresh();}return handled;
 };
 const input=e=>{if(silent)return;if(e.target.hasAttribute?.('data-bgm-volume'))bgm?.setVolume(e.target.value);if(e.target.hasAttribute?.('data-voice-volume'))voice?.setVolume(e.target.value);};
 const logToggle=()=>{setBlock();schedule();};q('.conversation-log')?.addEventListener?.('toggle',logToggle);section.addEventListener('input',input);
 return {refresh,click,get blocked(){return blocked;},stop(){dead=true;clearTimeout(timer);q('.conversation-log')?.removeEventListener?.('toggle',logToggle);section.removeEventListener('input',input);section.classList?.remove('event-ui-hidden');}};
}

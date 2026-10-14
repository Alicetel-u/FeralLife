import { ROOM_ART } from './character-art.js';
import { eventIcon } from './event-stage.js';
const choiceEscape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const choiceAssetPaths = ["assets/ui/choices/trash.svg","assets/ui/choices/balcony.svg","assets/ui/choices/freezer.svg","assets/ui/choices/water.svg","assets/ui/choices/bag.svg","assets/ui/choices/loan.svg","assets/ui/choices/document.svg","assets/ui/choices/stamp.svg","assets/ui/choices/refuse.svg","assets/ui/choices/meal.svg","assets/ui/choices/flame.svg","assets/ui/choices/cat.svg"];
const choiceIcons = {trash:'trash',balcony:'balcony',freezer:'freezer',water:'water',guarantee:'bag',loan:'loan',return:'document',sign:'document',stamp:'stamp',refuse:'refuse',coronation:'meal',turbo:'flame'};
export function choiceUIHTML(event, choices, history) {
 return '<section class="cinematic-choice graphic-choice" aria-labelledby="choice-title"><div class="choice-heading"><span class="choice-emblem" aria-hidden="true">'+eventIcon('cat')+'</span><h2 id="choice-title">大家の返事は？</h2><p>どう返すか、選択してください。</p></div><div class="decision-panel" aria-label="大家の返事">'+choices.map((choice,i)=>'<button type="button" class="decision-choice '+(history.has(event.actScene+':'+choice.id)?'previously-chosen':'')+'" style="--choice-index:'+i+'" data-case-event="'+event.id+'" data-choice="'+choiceEscape(choice.id)+'" aria-disabled="true"><img class="choice-icon" src="'+choiceAssetPaths[['trash','balcony','freezer','water','bag','loan','document','stamp','refuse','meal','flame','cat'].indexOf(choiceIcons[choice.id]||'cat')]+'" alt=""><strong>'+choiceEscape(choice.label)+'</strong>'+(history.has(event.actScene+':'+choice.id)?'<span class="choice-history-badge">✓ 選択済み</span>':'')+'<span class="choice-arrow" aria-hidden="true">↗</span></button>').join('')+'</div><p class="choice-hint">↑ ↓ / 数字で移動 · Enter で決定</p></section>';
}
export function mountChoiceUI(modal, roomType='cat') {
 const panel=modal.querySelector('.cinematic-choice');
 if(!panel)return ()=>{};
 modal.style.backgroundImage='linear-gradient(#100b084d,#100b084d),url("'+(ROOM_ART[roomType]||ROOM_ART.cat).src+'")';
 const buttons=[...panel.querySelectorAll('[data-choice]')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let ready=false,locked=false,commitTimer;
 const readyTimer=setTimeout(()=>{ready=true;buttons.forEach(b=>b.setAttribute('aria-disabled','false'));},reduced?0:Math.max(650,470+(buttons.length-1)*80));
 buttons[0]?.focus({preventScroll:true});
 const onKey=e=>{
  if(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||modal.classList.contains('event-ui-hidden')||modal.querySelector('.conversation-log[open]')||!modal.querySelector('.event-menu')?.hidden)return;
  const index=buttons.indexOf(document.activeElement);
  if(index<0)return;
  let next;
  if(e.key==='ArrowDown')next=(index+1)%buttons.length;
  if(e.key==='ArrowUp')next=(index+buttons.length-1)%buttons.length;
  if(/^[1-9]$/.test(e.key)&&Number(e.key)<=buttons.length)next=Number(e.key)-1;
  if(next!==undefined){e.preventDefault();if(!locked)buttons[next].focus();}
  if(e.repeat&&['Enter',' '].includes(e.key))e.preventDefault();
 };
 modal.addEventListener('keydown',onKey);
 return Object.assign(()=>{modal.style.backgroundImage="";clearTimeout(readyTimer);clearTimeout(commitTimer);modal.removeEventListener('keydown',onKey);}, {confirm(button,answer){
  if(!ready||locked||!buttons.includes(button))return;
  locked=true;panel.classList.add('choice-confirming');button.classList.add('choice-selected');
  buttons.forEach(b=>{b.disabled=true;b.setAttribute('aria-disabled','true');});
  commitTimer=setTimeout(()=>{if(modal.open&&panel.isConnected)answer();},reduced?0:420);
 }});
}

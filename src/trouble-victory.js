import { ACT_ONE_EVENTS } from './act-one.js';
import { ACT_TWO_EVENTS } from './act-two.js';
import { EVENT_EXPRESSIONS } from './character-art.js';

// Derive presentation from authored answers; branching and save schema stay unchanged.
export function avoidedTrouble(event, chapter) {
  if(event?.actScene!=='reply'||event.avoidanceSeen)return null;
  const events=chapter===2?ACT_TWO_EVENTS:ACT_ONE_EVENTS;
  for(const [scene, trouble] of Object.entries(events)) {
    if(trouble.choices.some(choice=>!choice.bad&&event.title==='返事：'+choice.label))return {scene,chapter};
  }
  return null;
}
export function troubleAvoidedHTML(chapter) {
  const portrait=chapter===2?EVENT_EXPRESSIONS.hostess.happy:EVENT_EXPRESSIONS.cat.happy;
  return `<section class="act-screen trouble-victory"><div class="victory-rays" aria-hidden="true"></div><div class="victory-portrait" aria-hidden="true"><img src="${portrait}" alt=""></div><div class="victory-copy"><p class="victory-kicker">GOOD CALL / 大家の返事</p><h2 id="modal-title"><span>トラブル</span><strong>回避！</strong></h2><p class="victory-stamp">この日常、まだ続く。</p></div><button class="victory-next" data-victory-done>観察に戻る <span aria-hidden="true">→</span></button></section>`;
}
export function startTroubleVictory(root, done) {
  let finished=false;
  const button=root.querySelector('[data-victory-done]');
  const finish=()=>{if(finished)return;finished=true;clearTimeout(timer);button.removeEventListener('click',finish);done();};
  const timer=setTimeout(finish,2400);
  button.addEventListener('click',finish);
  button.focus({preventScroll:true});
  return ()=>{finished=true;clearTimeout(timer);button.removeEventListener('click',finish);};
}

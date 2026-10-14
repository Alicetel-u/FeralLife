// A sequence of insert CGs, controlled like dialogue rather than a document page.
export const PROLOGUE_CUTS = [
 {shot:'arrival',image:null,speaker:'けもの荘の記録',text:'訳ありのボロアパートを引き継いだあなたに、\n前の大家から一通の手紙が届いた。'},
 {shot:'keys',image:'assets/prologue/keys.png',speaker:'大家（心の声）',text:'古びた鍵と、一通の手紙。\n……今日から、ここを俺が預かるのか。'},
 {shot:'letter',image:'assets/prologue/letter.png',speaker:'前大家からの手紙',text:'おめでとうございます。\nあなたは本日から「けもの荘」の大家です。'},
 {shot:'income',image:'assets/prologue/letter.png',speaker:'前大家からの手紙',text:'現在の入居者は1名。\n家賃収入は期待しないでください。'},
 {shot:'warning',image:'assets/prologue/keys.png',speaker:'前大家からの手紙',text:'なお、私はもう関わりたくありません。\n\n前大家より'},
 {shot:'door',image:'assets/prologue/door.png',speaker:'大家（心の声）',text:'……何があったんだよ、この家。\nまずは、たった一人の住人に会ってみるか。'}
];
const prologueEscape = text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function openingPrologueHTML(){
 return '<section class="act-screen opening-letter cinematic-prologue ink-prologue" aria-label="プロローグ"><img class="ink-establishing" src="'+ 'assets/apartments.png' +'" alt="夕暮れのけもの荘"><div class="ink-vignette" aria-hidden="true"></div><div class="ink-slash slash-one" aria-hidden="true"></div><div class="ink-slash slash-two" aria-hidden="true"></div><h2 id="modal-title" class="visually-hidden">けもの荘 · プロローグ</h2><span class="ink-location">けもの荘 / 1日目 17:00</span><div class="ink-cut-content"></div><nav class="ink-controls" aria-label="プロローグの操作"><span class="ink-progress" aria-label="場面"></span><button type="button" class="ink-skip" data-prologue-skip>スキップ</button><button type="button" class="ink-next" data-prologue-next aria-label="次へ">次へ <span aria-hidden="true">▶</span></button></nav></section>';
}
export function prologueCutHTML(cut){
 return (cut.image?'<figure class="ink-insert"><div class="ink-insert-border"><img src="'+prologueEscape(cut.image)+'" alt="'+({keys:'鍵と封筒を持つ大家の手元',letter:'封筒から取り出した便箋',income:'家賃についての手紙を読む手元',warning:'手紙を読んで止まる、鍵を握る手',door:'薄暗い101号室の入口と大家の手元'}[cut.shot]||'')+'"></div></figure>':'')+'<div class="ink-dialogue"><span class="ink-speaker">'+prologueEscape(cut.speaker)+'</span><p class="ink-line" aria-hidden="true"></p><p class="visually-hidden" aria-live="polite" aria-atomic="true">'+prologueEscape(cut.text)+'</p><span class="ink-prompt" aria-hidden="true">CLICK / ENTER</span></div>';
}
export function startOpeningPrologue(root,onContinue){
 const content=root.querySelector('.ink-cut-content'),next=root.querySelector('.ink-next'),progress=root.querySelector('.ink-progress');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let cursor=0,typing=false,leaving=false,destroyed=false,lineTimer,exitTimer;
 // Retain only this scene's small CG set; no polling or permanent animation loop.
 const preload=PROLOGUE_CUTS.filter(c=>c.image).map(c=>c.image);
 for(const src of new Set(preload)){const image=new Image();image.src=src;}
 const show=()=>{
  clearTimeout(lineTimer);const cut=PROLOGUE_CUTS[cursor];root.dataset.cut=cut.shot;
  content.innerHTML=prologueCutHTML(cut);progress.textContent=String(cursor+1).padStart(2,'0')+' / '+String(PROLOGUE_CUTS.length).padStart(2,'0');
  next.setAttribute('aria-label',cursor===PROLOGUE_CUTS.length-1?'101号室へ':'次へ');
  const line=content.querySelector('.ink-line'),chars=Array.from(cut.text);let count=0;
  const tick=()=>{if(destroyed)return;count=reduced?chars.length:Math.min(chars.length,count+2);line.textContent=chars.slice(0,count).join('');typing=count<chars.length;root.classList.toggle('ink-typing',typing);if(typing)lineTimer=setTimeout(tick,25);};
  tick();
 };
 const advance=()=>{
  if(leaving||destroyed)return;
  if(typing){clearTimeout(lineTimer);content.querySelector('.ink-line').textContent=PROLOGUE_CUTS[cursor].text;typing=false;root.classList.remove('ink-typing');return;}
  if(cursor<PROLOGUE_CUTS.length-1){cursor++;show();}else finish();
 };
 const finish=()=>{if(leaving)return;leaving=true;next.disabled=true;root.querySelector('.ink-skip').disabled=true;root.classList.add('ink-leaving');clearTimeout(lineTimer);exitTimer=setTimeout(()=>{if(!destroyed)onContinue();},reduced?0:180);};
 const click=e=>{e.preventDefault();e.stopImmediatePropagation();if(e.target.closest('[data-prologue-skip]'))finish();else advance();};
 const key=e=>{if(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||!['Enter',' '].includes(e.key))return;if(e.target.closest('[data-prologue-skip]'))return;e.preventDefault();e.stopPropagation();if(!e.repeat)advance();};
 root.addEventListener('click',click,true);root.addEventListener('keydown',key);show();next.focus({preventScroll:true});
 return ()=>{destroyed=true;clearTimeout(lineTimer);clearTimeout(exitTimer);root.removeEventListener('click',click,true);root.removeEventListener('keydown',key);};
}

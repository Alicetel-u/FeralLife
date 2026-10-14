// Presentation only: the original letter and subsequent story remain unchanged.
export function openingPrologueHTML(){
 return `<section class="act-screen opening-letter cinematic-prologue"><img class="prologue-establishing" src="assets/apartments.png" alt="夕暮れのけもの荘"><div class="prologue-atmosphere" aria-hidden="true"></div><div class="prologue-grain" aria-hidden="true"></div><div class="prologue-arrival"><span class="prologue-chapter">序章</span><h2 id="modal-title">一通の手紙から。</h2><span class="prologue-rule" aria-hidden="true"></span><p>訳ありのボロアパートを引き継いだあなたに、<br>前の大家から一通の手紙が届いた。</p><span class="prologue-place">けもの荘 · 大家就任の日</span></div><div class="prologue-correspondence"><div class="prologue-envelope" aria-hidden="true"><span>新しい大家様へ</span><i>荘</i></div><article class="prologue-paper" aria-label="前大家からの手紙"><header><span>けもの荘</span><h3>前大家からの手紙</h3><small>新しい大家様へ</small></header><div class="prologue-letter-body"><p style="--line:0">おめでとうございます。</p><p style="--line:1">あなたは本日から<br>「けもの荘」の大家です。</p><p style="--line:2">現在の入居者は1名。<br>家賃収入は期待しないでください。</p><p class="prologue-last-line" style="--line:3">なお、私はもう関わりたくありません。</p><p class="prologue-signature" style="--line:4">前大家より</p></div></article></div><div class="prologue-controls"><span class="prologue-reading-hint">クリック / Enter で全文を表示</span><button type="button" class="opening-next prologue-next" data-opening="1">手紙を読む <span aria-hidden="true">→</span></button></div></section>`;
}
export function startOpeningPrologue(root,onContinue){
 const button=root.querySelector('.prologue-next'),hint=root.querySelector('.prologue-reading-hint');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let complete=false,leaving=false,leaveTimer;
 const reveal=()=>{complete=true;root.classList.add('prologue-read');button.innerHTML='101号室へ <span aria-hidden="true">→</span>';hint.textContent='クリック / Enter で物語を始める';};
 const revealTimer=setTimeout(reveal,reduced?0:6800);
 const click=e=>{
  if(!e.target.closest('[data-opening]'))return;
  e.preventDefault();e.stopImmediatePropagation();
  if(leaving)return;
  if(!complete){clearTimeout(revealTimer);reveal();return;}
  leaving=true;button.disabled=true;root.classList.add('prologue-leaving');
  leaveTimer=setTimeout(onContinue,reduced?0:550);
 };
 root.addEventListener('click',click,true);
 button.focus({preventScroll:true});
 return ()=>{clearTimeout(revealTimer);clearTimeout(leaveTimer);root.removeEventListener('click',click,true);};
}

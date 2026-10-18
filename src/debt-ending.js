// Finite CSS animation: no canvas, particle loop, or new bitmap assets.
export function debtEndingHTML(failure) {
  const sold=!!failure?.startsWith('bag-');
  return `<section class="act-screen debt-cinematic" data-debt-kind="${sold?'sold':'seized'}"><div class="debt-building"><img src="assets/apartments.png" alt="けもの荘の外観"><div class="debt-dusk"></div></div><div class="debt-papers" aria-hidden="true">${Array.from({length:10},(_,i)=>`<i style="--paper:${i};--x:${(i*37)%100}%"><b>NOTICE</b><span></span><span></span><span></span></i>`).join('')}</div><div class="debt-sign"><small>KEMONOSOU / PROPERTY NOTICE</small><h2 id="modal-title">${sold?'SOLD OUT':'差 押'}</h2><p>${sold?'売 却 済':'SEIZED'}</p><span>けもの荘</span></div><div class="debt-seal" aria-hidden="true">${sold?'売却済':'差押物件'}</div><p class="debt-caption">${sold?'SOLD OUT / 売却済':'差押 / SEIZED'}</p></section>`;
}

export function startDebtEnding(root,done) {
  const doc=root.ownerDocument;
  let finished=false;
  const clock=root.animate([{opacity:1},{opacity:1}],{duration:8500});
  const sync=()=>{
    root.classList.toggle('debt-hidden',doc.hidden);
    if(doc.hidden)clock.pause();else clock.play();
  };
  const cleanup=()=>{clock.cancel();doc.removeEventListener('visibilitychange',sync);};
  const finish=()=>{if(finished)return;finished=true;cleanup();done();};
  clock.finished.then(finish,()=>{});
  doc.addEventListener('visibilitychange',sync);
  sync();
  return ()=>{finished=true;cleanup();};
}

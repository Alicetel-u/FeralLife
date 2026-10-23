// A story beat between the final failed reply and the existing BAD END cinematic.
// The current dialogue stays mounted until its voice finishes; no saved timer or
// chapter state is added. The veil remains across the destination screen swap.
const ENTRIES={
 'ash-trash':{kind:'fire',caption:'……焦げた匂いがする。',hold:1150,veil:850,linger:950},
 'ash-balcony':{kind:'fire',caption:'小さな火種が、夜風に流されていく。',hold:1100,veil:900,linger:1050},
 'ash-freezer':{kind:'fire',caption:'……火は、まだ消えていなかった。',hold:1200,veil:850,linger:1050},
 'dinner-turbo':{kind:'fire',caption:'笑い声の向こうで、火が跳ねた。',hold:1100,veil:900,linger:1050},
 'dinner-show':{kind:'fire',caption:'さっきまでの声が、途切れた。',hold:1250,veil:900,linger:1100},
 'bag-guarantee':{kind:'stalker',caption:'返事は、なかった。',hold:1400,veil:800,linger:1300},
 'bag-return':{kind:'absence',caption:'けもの荘から、ひとつ灯りが消えた。',hold:1350,veil:1100,linger:1250},
 'duel-yandere':{kind:'obsession',caption:'ルナは、まだ笑っていた。',hold:1300,veil:1000,linger:1300},
 'duel-domination':{kind:'submission',caption:'大家は、もう言い返せなかった。',hold:1450,veil:950,linger:1250}
};
const FALLBACK={kind:'debt',caption:'一枚の紙が、けもの荘の運命を変えた。',hold:1200,veil:1000,linger:1200};
export function badEndingEntryPlan(failure){
 const plan=ENTRIES[failure]||(failure?.startsWith('duel-')?ENTRIES['duel-domination']:FALLBACK);
 return {...plan,fadeOut:700,total:plan.hold+plan.veil+plan.linger};
}
export function badEndingEntryHTML(failure){
 const {kind,caption}=badEndingEntryPlan(failure);
 // Captions are authored constants, never interpolated user content.
 return `<div class="bad-entry-cut" data-phase="hold" data-kind="${kind}" aria-hidden="true"><div class="bad-entry-grain"></div><div class="bad-entry-light"></div><p class="bad-entry-caption">${caption}</p></div>`;
}
export function startBadEndingEntry(modal,failure,onSwap,{voiceBusy=()=>false,raf=callback=>requestAnimationFrame(callback),cancel=id=>cancelAnimationFrame(id)}={}){
 const plan=badEndingEntryPlan(failure),doc=modal.ownerDocument;
 const host=doc.createElement('div');
 host.className='bad-entry-host';
 host.innerHTML=badEndingEntryHTML(failure);
 modal.append(host);
 const cut=host.firstElementChild;
 cut.style.setProperty('--bad-veil-ms',plan.veil+'ms');
 cut.style.setProperty('--bad-reveal-ms',plan.fadeOut+'ms');
 let last=null,elapsed=0,swapped=false,finished=false,frame=0;
 const stop=()=>{if(finished)return;finished=true;cancel(frame);host.remove();};
 const tick=now=>{
  if(finished||!host.isConnected){stop();return;}
  if(doc.hidden){last=null;frame=raf(tick);return;}
  const delta=last===null?0:Math.min(120,Math.max(0,now-last));last=now;
  // Never drown out an active last line. It remains visible and audible.
  if(!swapped&&elapsed===0&&voiceBusy()){frame=raf(tick);return;}
  elapsed+=delta;
  if(!swapped){
   cut.dataset.phase=elapsed<plan.hold?'hold':elapsed<plan.hold+plan.veil?'veil':'still';
   if(elapsed>=plan.total){
    swapped=true;elapsed=0;
    cut.dataset.phase='covered';
    try{onSwap();}finally{if(!finished)cut.dataset.phase='reveal';}
   }
  }else if(elapsed>=plan.fadeOut){stop();return;}
  frame=raf(tick);
 };
 frame=raf(tick);
 return stop;
}

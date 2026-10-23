// A story beat between the final failed reply and the existing BAD END cinematic.
// The current dialogue stays mounted until its voice finishes; no saved timer or
// chapter state is added. The veil remains across the destination screen swap.
// Silent scene cut; only the first Act I room-to-corridor change uses this.
// Other endings keep their authored cinematic staging unchanged.
export function badEndingEntryPlan(failure){
 return {kind:'corridor',hold:750,veil:550,linger:350,fadeOut:650,total:1650};
}
export function badEndingEntryHTML(){
 return '<div class="bad-entry-cut" data-phase="hold" data-kind="corridor" aria-hidden="true"><div class="bad-entry-grain"></div><div class="bad-entry-light"></div></div>';
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

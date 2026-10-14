// Keep each on-screen portrait alive across dialogue updates. Decode replacements first.
const portraitRequests=new WeakMap();
export function replaceConversationContent(container,html){
 const template=document.createElement('template');template.innerHTML=html;
 const nextStage=template.content.querySelector('.event-stage:not(.memory-whiteout)');
 const previousStage=container.querySelector('.event-stage:not(.memory-whiteout)');
 if(nextStage&&previousStage)for(const side of ['left','right']){
  const previous=previousStage.querySelector('.stage-character.'+side);
  const next=nextStage.querySelector('.stage-character.'+side);
  const currentImage=previous?.querySelector('img'),desiredImage=next?.querySelector('img');
  if(!previous||!next||!currentImage||!desiredImage)continue;
  const request={};portraitRequests.set(previous,request);
  previous.className=next.className;
  for(const attr of [...previous.attributes])if(attr.name!=='class')previous.removeAttribute(attr.name);
  for(const attr of [...next.attributes])if(attr.name!=='class')previous.setAttribute(attr.name,attr.value);
  previous.querySelector('figcaption').textContent=next.querySelector('figcaption').textContent;
  const src=desiredImage.getAttribute('src');
  if(currentImage.getAttribute('src')===src)currentImage.alt=desiredImage.alt;
  else{
   const replacement=new Image();replacement.alt=desiredImage.alt;replacement.src=src;
   const ready=replacement.decode?replacement.decode():new Promise((resolve,reject)=>{replacement.onload=resolve;replacement.onerror=reject;});
   ready.then(()=>{
    if(previous.isConnected&&portraitRequests.get(previous)===request)currentImage.replaceWith(replacement);
   }).catch(()=>{}); // Keep the last visible expression if a replacement is unavailable.
  }
  next.replaceWith(previous);
 }
 container.replaceChildren(template.content);
}

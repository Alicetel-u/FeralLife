import {fireEndingHTML,startFireEnding} from './fire-ending.js';

function rewindClockSVG(){
  const gear=(cx,cy,r,teeth)=>{
    const points=Array.from({length:teeth*4},(_,i)=>{const a=i*Math.PI*2/(teeth*4),radius=r*(i%4===0||i%4===3?1:.86);return `${cx+Math.cos(a)*radius},${cy+Math.sin(a)*radius}`;}).join(' ');
    return `<g class="clock-gear" style="transform-origin:${cx}px ${cy}px"><polygon points="${points}" fill="url(#clock-brass)"/><circle cx="${cx}" cy="${cy}" r="${r*.65}" fill="#0b1117" stroke="#b38b51" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="${r*.17}" fill="url(#clock-brass)"/>${[0,60,120].map(a=>`<path d="M ${cx-r*.58} ${cy} H ${cx+r*.58}" stroke="#9b7748" stroke-width="4" transform="rotate(${a} ${cx} ${cy})"/>`).join('')}</g>`;
  };
  const roman=['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'];
  return `<svg class="rewind-clock-dial" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="clock-face"><stop stop-color="#1e2832"/><stop offset=".68" stop-color="#10171f"/><stop offset="1" stop-color="#03070d"/></radialGradient><linearGradient id="clock-brass" x2=".8" y2="1"><stop stop-color="#f6e3ac"/><stop offset=".25" stop-color="#947348"/><stop offset=".48" stop-color="#e6c58c"/><stop offset=".72" stop-color="#57412b"/><stop offset="1" stop-color="#cbaa6f"/></linearGradient><filter id="clock-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="7"/></filter><radialGradient id="clock-halo"><stop stop-color="#8bb4cf" stop-opacity="0"/><stop offset=".7" stop-color="#7192b5" stop-opacity=".03"/><stop offset=".85" stop-color="#a4c8e1" stop-opacity=".2"/><stop offset="1" stop-color="#7ea4bd" stop-opacity="0"/></radialGradient></defs><circle cx="400" cy="400" r="397" fill="url(#clock-halo)"/><g class="clock-orbit"><circle cx="400" cy="400" r="359" fill="none" stroke="#c4dbe7" stroke-opacity=".2" stroke-dasharray="2 12"/><circle cx="400" cy="400" r="374" fill="none" stroke="#9dbfd5" stroke-opacity=".6" stroke-dasharray="150 700 110 900"/><path d="M400 16V39 M400 761V784 M16 400H39 M761 400H784" stroke="#c6d9e5" stroke-width="2"/></g><circle cx="400" cy="400" r="327" fill="url(#clock-face)" stroke="url(#clock-brass)" stroke-width="10"/><circle cx="400" cy="400" r="312" fill="none" stroke="#af8c56" stroke-width="1"/><circle cx="400" cy="400" r="252" fill="none" stroke="#b09464" stroke-opacity=".35"/><g opacity=".22">${gear(345,447,80,18)}${gear(460,477,56,14)}${gear(436,348,100,24)}</g>${Array.from({length:60},(_,i)=>`<path d="M400 ${i%5===0?92:98}V${i%5===0?119:109}" stroke="${i%5===0?'#e3ca94':'#8c7959'}" stroke-width="${i%5===0?3:1}" transform="rotate(${i*6} 400 400)"/>`).join('')}${roman.map((n,i)=>{const a=i*Math.PI/6;return `<text x="${400+Math.sin(a)*274}" y="${400-Math.cos(a)*274}" dy=".35em" text-anchor="middle" fill="#dac49a" font-family="Georgia,serif" font-size="25" letter-spacing="2">${n}</text>`;}).join('')}<circle cx="400" cy="400" r="223" fill="none" stroke="#adc5d4" stroke-opacity=".08" stroke-dasharray="1 5"/><g class="clock-light-ring" filter="url(#clock-glow)"><circle cx="400" cy="400" r="330" fill="none" stroke="#a9d6ed" stroke-width="5" stroke-dasharray="240 1500"/></g><g class="clock-light-ring"><circle cx="400" cy="400" r="337" fill="none" stroke="#d4e9f2" stroke-opacity=".7" stroke-width="1" stroke-dasharray="200 1600"/></g><g class="clock-hand-trail" filter="url(#clock-glow)"><path d="M397 431V178L400 154L403 178V431Z" fill="#b7d8ec"/></g><g class="rewind-hand hour"><path d="M400 240L410 275L405 389L413 400L405 409L403 444L397 444L395 409L387 400L395 389L390 275Z" fill="url(#clock-brass)" stroke="#efdfbd" stroke-width=".7"/></g><g class="rewind-hand minute"><path d="M400 151L406 179L403 389L411 400L403 412L402 449L398 449L397 412L389 400L397 389L394 179Z" fill="#e6d4a7" stroke="#fff1cc" stroke-width=".6"/></g><circle cx="400" cy="400" r="13" fill="url(#clock-brass)" stroke="#f0dab0" stroke-width="1"/><circle cx="400" cy="400" r="4" fill="#0e131a"/><g class="clock-dust">${Array.from({length:26},(_,i)=>{const a=i*2.399,r=340+(i%4)*12;return `<circle cx="${400+Math.cos(a)*r}" cy="${400+Math.sin(a)*r}" r="${i%3===0?2:1}" fill="#d4e5ef" opacity="${.15+(i%5)*.1}"/>`;}).join('')}</g></svg>`;
}

export function rewindBeat(t,attempt=1){
  const repeat=attempt>1,fireEnd=repeat?8:4,clockStart=fireEnd+1;
  const phase=t<fireEnd?'fire':t<clockStart?'dark':t<clockStart+4?'clock':'return';
  let text='',kind='spoken';
  if(phase==='fire'){
    if(repeat){
      text=t<2?'くそっ！！ またかよ！！':t<4?'今度こそ大丈夫だと思ったのに……！':t<6?'燃え落ちる101号室を前に、大家は拳を握りしめる。':'……また、戻れるんだよな？';
      if(t>=4&&t<6)kind='narration';
    }else{text=t<2?'嘘だろ……。':'俺が……俺のせいで……。';kind='inner';}
  }
  if(phase==='clock'){
    text=t>=clockStart+3.5?'……カチッ。':repeat?'次こそは……絶対に守ってやる！':'';
    kind=t>=clockStart+3.5?'narration':'inner';
  }
  return {phase,text,kind,clockStart,finished:t>=clockStart+5.5};
}
export function rewindTransitionHTML(failure,attempt=1){
  return `<section class="act-screen rewind-screen" data-rewind-phase="fire">${fireEndingHTML(failure)}<div class="rewind-dark"></div><div class="rewind-clock" aria-hidden="true">${rewindClockSVG()}</div><p class="rewind-voice" aria-live="polite">${attempt>1?'くそっ！！ またかよ！！':'嘘だろ……。'}</p><img class="rewind-restored-room" src="assets/rooms/cat/interior.png" alt="元に戻った101号室"><button class="rewind-skip" data-rewind-skip>スキップ</button></section>`;
}

export function startRewindTransition(root,failure,finish,sound,attempt=1,targetTime=17){
  const stopFire=startFireEnding(root.querySelector('.fire-cinematic'),failure,()=>{});
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let t=0,last=performance.now(),frameId,phase='',audioContext=null,siren=null,clickPlayed=false;
  if(sound){
    try{
      audioContext=new (window.AudioContext||window.webkitAudioContext)();
      const gain=audioContext.createGain();gain.gain.value=.055;gain.connect(audioContext.destination);
      siren=audioContext.createOscillator();siren.type='sine';siren.connect(gain);siren.start();audioContext.resume().catch(()=>{});
    }catch{}
  }
  const mute=()=>{if(siren){try{siren.stop();}catch{}siren=null;}};
  function tick(now){
    if(!root.isConnected){cleanup();return;}
    const dt=Math.min(.1,(now-last)/1000);last=now;if(!document.hidden)t+=dt;
    const beat=rewindBeat(t,attempt),next=beat.phase;
    const voice=root.querySelector('.rewind-voice');voice.textContent=beat.text;voice.dataset.voiceKind=beat.kind;voice.style.opacity=beat.text?'1':'0';
    if(phase!==next){
      phase=next;root.dataset.rewindPhase=phase;
      if(phase!=='fire'){mute();stopFire();}
    }
    if(siren&&!document.hidden)siren.frequency.setTargetAtTime(550+Math.sin(t*3)*170,audioContext.currentTime,.08);
    if(document.hidden&&audioContext?.state==='running')audioContext.suspend().catch(()=>{});
    if(!document.hidden&&audioContext?.state==='suspended'&&phase==='fire')audioContext.resume().catch(()=>{});
    if(phase==='clock'){
      const progress=Math.min(1,Math.max(0,(t-beat.clockStart)/3.5));
      const eased=progress*progress*(3-2*progress);
      const targetMinute=(targetTime%1)*360;
      const targetHour=(targetTime%12)*30;
      const angle=reduced?targetMinute:targetMinute-1440*eased;
      root.querySelector('.rewind-clock').style.setProperty('--clock-turn',`${angle}deg`);
      root.querySelector('.rewind-clock').style.setProperty('--clock-trail',progress<1&&!reduced?'.4':'0');
      root.querySelector('.rewind-clock').classList.toggle('clock-locked',progress>=1);
      root.querySelector('.rewind-hand.minute').style.transform=`rotate(${angle}deg)`;
      root.querySelector('.rewind-hand.hour').style.transform=`rotate(${reduced?targetHour:targetHour+120+(angle-targetMinute)/12}deg)`;
      if(t>=beat.clockStart+3.5&&!clickPlayed){
        clickPlayed=true;if(audioContext){const osc=audioContext.createOscillator(),volume=audioContext.createGain();volume.gain.setValueAtTime(.12,audioContext.currentTime);volume.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.06);osc.frequency.value=1300;osc.connect(volume);volume.connect(audioContext.destination);osc.start();osc.stop(audioContext.currentTime+.06);}
      }
    }
    if(beat.finished){cleanup();finish();return;}
    frameId=requestAnimationFrame(tick);
  }
  function cleanup(){cancelAnimationFrame(frameId);stopFire();mute();if(audioContext&&audioContext.state!=='closed')audioContext.close().catch(()=>{});}
  frameId=requestAnimationFrame(tick);return cleanup;
}

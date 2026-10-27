import {fireEndingHTML,startFireEnding} from './fire-ending.js';

function rewindClockSVG(){
  const gear=(cx,cy,r,teeth)=>{
    const points=Array.from({length:teeth*4},(_,i)=>{const a=i*Math.PI*2/(teeth*4),radius=r*(i%4===0||i%4===3?1:.86);return `${cx+Math.cos(a)*radius},${cy+Math.sin(a)*radius}`;}).join(' ');
    return `<g class="clock-gear" style="transform-origin:${cx}px ${cy}px"><polygon points="${points}" fill="url(#clock-brass)"/><circle cx="${cx}" cy="${cy}" r="${r*.65}" fill="#0b1117" stroke="#b38b51" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="${r*.17}" fill="url(#clock-brass)"/>${[0,60,120].map(a=>`<path d="M ${cx-r*.58} ${cy} H ${cx+r*.58}" stroke="#9b7748" stroke-width="4" transform="rotate(${a} ${cx} ${cy})"/>`).join('')}</g>`;
  };
  const roman=['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'];
  return `<svg class="rewind-clock-dial" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="clock-face"><stop stop-color="#251827"/><stop offset=".68" stop-color="#17101e"/><stop offset="1" stop-color="#09050e"/></radialGradient><linearGradient id="clock-brass" x2=".8" y2="1"><stop stop-color="#f5e7cf"/><stop offset=".25" stop-color="#83747b"/><stop offset=".48" stop-color="#e9dac2"/><stop offset=".72" stop-color="#493845"/><stop offset="1" stop-color="#c9b6bc"/></linearGradient><filter id="clock-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="7"/></filter><radialGradient id="clock-halo"><stop stop-color="#df3a54" stop-opacity="0"/><stop offset=".7" stop-color="#ad2641" stop-opacity=".03"/><stop offset=".85" stop-color="#f16778" stop-opacity=".2"/><stop offset="1" stop-color="#bf314b" stop-opacity="0"/></radialGradient></defs><circle cx="400" cy="400" r="397" fill="url(#clock-halo)"/><g class="clock-orbit"><circle cx="400" cy="400" r="359" fill="none" stroke="#efcfce" stroke-opacity=".2" stroke-dasharray="2 12"/><circle cx="400" cy="400" r="374" fill="none" stroke="#d75568" stroke-opacity=".6" stroke-dasharray="150 700 110 900"/><path d="M400 16V39 M400 761V784 M16 400H39 M761 400H784" stroke="#f4dfce" stroke-width="2"/></g><circle cx="400" cy="400" r="327" fill="url(#clock-face)" stroke="url(#clock-brass)" stroke-width="10"/><circle cx="400" cy="400" r="312" fill="none" stroke="#af8c56" stroke-width="1"/><circle cx="400" cy="400" r="252" fill="none" stroke="#b09464" stroke-opacity=".35"/><g opacity=".22">${gear(345,447,80,18)}${gear(460,477,56,14)}${gear(436,348,100,24)}</g>${Array.from({length:60},(_,i)=>`<path d="M400 ${i%5===0?92:98}V${i%5===0?119:109}" stroke="${i%5===0?'#e3ca94':'#8c7959'}" stroke-width="${i%5===0?3:1}" transform="rotate(${i*6} 400 400)"/>`).join('')}${roman.map((n,i)=>{const a=i*Math.PI/6;return `<text x="${400+Math.sin(a)*274}" y="${400-Math.cos(a)*274}" dy=".35em" text-anchor="middle" fill="#dac49a" font-family="Georgia,serif" font-size="25" letter-spacing="2">${n}</text>`;}).join('')}<circle cx="400" cy="400" r="223" fill="none" stroke="#adc5d4" stroke-opacity=".08" stroke-dasharray="1 5"/><g class="clock-light-ring" filter="url(#clock-glow)"><circle cx="400" cy="400" r="330" fill="none" stroke="#e5435b" stroke-width="5" stroke-dasharray="240 1500"/></g><g class="clock-light-ring"><circle cx="400" cy="400" r="337" fill="none" stroke="#f7d5d5" stroke-opacity=".7" stroke-width="1" stroke-dasharray="200 1600"/></g><g class="clock-hand-trail" filter="url(#clock-glow)"><path d="M397 431V178L400 154L403 178V431Z" fill="#e66379"/></g><g class="rewind-hand hour"><path d="M400 240L410 275L405 389L413 400L405 409L403 444L397 444L395 409L387 400L395 389L390 275Z" fill="url(#clock-brass)" stroke="#efdfbd" stroke-width=".7"/></g><g class="rewind-hand minute"><path d="M400 151L406 179L403 389L411 400L403 412L402 449L398 449L397 412L389 400L397 389L394 179Z" fill="#e6d4a7" stroke="#fff1cc" stroke-width=".6"/></g><circle cx="400" cy="400" r="13" fill="url(#clock-brass)" stroke="#f0dab0" stroke-width="1"/><circle cx="400" cy="400" r="4" fill="#0e131a"/><g class="clock-dust">${Array.from({length:26},(_,i)=>{const a=i*2.399,r=340+(i%4)*12;return `<circle cx="${400+Math.cos(a)*r}" cy="${400+Math.sin(a)*r}" r="${i%3===0?2:1}" fill="#f4d7d1" opacity="${.15+(i%5)*.1}"/>`;}).join('')}</g></svg>`;
}

export function automaticFirstRewind(state){
  const a=state?.actOne;
  return !!a&&a.chapter!==2&&a.attempt===1&&a.status==='bad'&&a.failure?.startsWith('ash-');
}
export function rewindBeat(t,attempt=1,afterFire=false,chapter=1,failure=''){
  const repeat=attempt>1,fireEnd=afterFire?0:repeat?8:4,clockStart=fireEnd+(afterFire&&attempt===1?5.6:afterFire?2.5:1);
  const phase=t<fireEnd?'fire':t<clockStart?'dark':t<clockStart+4?'clock':'return';
  let text='',kind='spoken';
  if(phase==='fire'){
    if(repeat){
      text=t<2?'くそっ！！ またかよ！！':t<4?'今度こそ大丈夫だと思ったのに……！':t<6?'燃え落ちる101号室を前に、大家は拳を握りしめる。':'……また、戻れるんだよな？';
      if(t>=4&&t<6)kind='narration';
    }else{text=t<2?'嘘だろ……。':'俺が……俺のせいで……。';kind='inner';}
  }
  if(phase==='dark'&&afterFire){text=attempt===1?(t<1.1?'ドクン……':t<2.35?'ドクンッ！！':'くそっ！俺も煙を吸い過ぎたか…意識が…'):'……もう一度、やり直せるなら。';kind='inner';}
  if(phase==='dark'&&chapter===2){text=failure==='duel-yandere'?'':t<2.35?'':attempt===1?'……ルナ……。':'……もう一度、やり直せるなら。';kind='inner';}
  if(phase==='clock'){
    text=chapter===2&&failure==='duel-yandere'?'ルナ……お前……':repeat?'次こそは……絶対に守ってやる！':'';
    kind='inner';
  }
  return {phase,text,kind,clockStart,finished:t>=clockStart+5.5};
}
export function rewindTransitionHTML(failure,attempt=1,afterFire=false,chapter=1,clockOnly=false){
  const restored=chapter===2?'assets/apartments.png':'assets/rooms/cat/interior-illustrated-v1.png';
  return `<section class="act-screen rewind-screen" data-rewind-phase="${clockOnly?'clock':afterFire?'dark':'fire'}" data-chapter="${chapter}" ${afterFire?'data-after-fire':''}>${clockOnly||afterFire?'':fireEndingHTML(failure)}<div class="rewind-dark"></div><div class="rewind-clock" aria-hidden="true">${rewindClockSVG()}</div><p class="rewind-voice" aria-live="polite">${clockOnly?'':chapter===2&&failure==='duel-yandere'?'':chapter===2&&attempt===1?'':afterFire?'……もう一度、やり直せるなら。':attempt>1?'くそっ！！ またかよ！！':'嘘だろ……。'}</p><img class="rewind-restored-room" src="${restored}" alt="${chapter===2?'元に戻ったけもの荘':'元に戻った101号室'}"><div class="rewind-white-fade" aria-hidden="true"></div></section>`;
}

export function startRewindTransition(root,failure,finish,sound,attempt=1,targetTime=17,afterFire=false,clockAudio=null,sharedAudio=null,options={}){
  const stopFire=options.clockOnly||afterFire?()=>{}:startFireEnding(root.querySelector('.fire-cinematic'),failure,()=>{});
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let t=0,last=performance.now(),frameId,phase='',finished=false,clockComplete=false,fadeStarted=false,fadeStart=0;
  let heartbeatAudio=null,ownsHeartbeat=false,playedHeartbeats=0;
  function beatHeart(){
    if(!sound)return;
    try{
      if(sharedAudio)heartbeatAudio=sharedAudio;
      else if(!heartbeatAudio){
        if(typeof AudioContext==='undefined')return;
        heartbeatAudio=new AudioContext();ownsHeartbeat=true;
      }
      const start=heartbeatAudio.currentTime,osc=heartbeatAudio.createOscillator(),gain=heartbeatAudio.createGain();
      osc.type='sine';osc.frequency.setValueAtTime(64,start);osc.frequency.exponentialRampToValueAtTime(38,start+.25);
      gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.68,start+.035);gain.gain.exponentialRampToValueAtTime(.0001,start+.3);
      osc.connect(gain);gain.connect(heartbeatAudio.destination);osc.start(start);osc.stop(start+.31);
      // A quieter upper harmonic keeps the pulse audible on small phone speakers.
      const overtone=heartbeatAudio.createOscillator(),presence=heartbeatAudio.createGain();
      overtone.type='triangle';overtone.frequency.setValueAtTime(128,start);overtone.frequency.exponentialRampToValueAtTime(76,start+.25);
      presence.gain.setValueAtTime(.0001,start);presence.gain.exponentialRampToValueAtTime(.12,start+.035);presence.gain.exponentialRampToValueAtTime(.0001,start+.3);
      overtone.connect(presence);presence.connect(heartbeatAudio.destination);overtone.start(start);overtone.stop(start+.31);
      osc.onended=()=>{osc.disconnect();gain.disconnect();};overtone.onended=()=>{overtone.disconnect();presence.disconnect();};
    }catch{}
  }
  const chapter=Number(root.dataset.chapter)||1;
  const readBeat=seconds=>options.clockOnly?{phase:'clock',text:'',kind:'inner',clockStart:0}:rewindBeat(seconds,attempt,afterFire,chapter,failure);
  const clockStart=readBeat(0).clockStart;
  function tick(now){
    if(finished)return;
    if(!root.isConnected){cleanup();return;}
    const dt=Math.min(.1,(now-last)/1000);last=now;if(!document.hidden)t+=dt;
    if(!options.clockOnly&&afterFire&&attempt===1&&t<2.5){const beats=t>=1.3?2:t>=.2?1:0;while(playedHeartbeats<beats){beatHeart();playedHeartbeats++;}}
    const clockElapsed=t-clockStart;
    const musicDone=clockAudio?.ended===true;
    const unavailable=!sound||!clockAudio||!!clockAudio.error||(clockAudio.paused&&clockElapsed>=10)
      ||clockElapsed>=Math.max(20,Number.isFinite(clockAudio?.duration)?clockAudio.duration+3:20);
    if(clockElapsed>=4&&(musicDone||(unavailable&&clockElapsed>=5.5)))clockComplete=true;
    const shownTime=Math.min(t,clockStart+3.99);
    const beat=readBeat(shownTime),next=beat.phase;
    const voice=root.querySelector('.rewind-voice');voice.textContent=beat.text;voice.dataset.voiceKind=beat.kind;voice.style.opacity=beat.text?'1':'0';
    if(phase!==next){
      phase=next;root.dataset.rewindPhase=phase;
      root.dispatchEvent(new CustomEvent('rewind-phase',{bubbles:true,detail:phase}));
      if(phase!=='fire')stopFire();
    }
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
    }
    if(clockComplete&&!fadeStarted)beginFade();
    if(fadeStarted&&t-fadeStart>=1.1){complete();return;}
    frameId=requestAnimationFrame(tick);
  }
  function complete(){if(finished)return;cleanup();finish();}
  function beginFade(){if(fadeStarted||finished)return;fadeStarted=true;fadeStart=t;root.classList.add('rewind-fading');root.dataset.rewindPhase='return';root.dispatchEvent(new CustomEvent('rewind-fade',{bubbles:true}));}
  function cleanup(){finished=true;cancelAnimationFrame(frameId);stopFire();if(ownsHeartbeat&&heartbeatAudio)heartbeatAudio.close().catch(()=>{});}
  frameId=requestAnimationFrame(tick);return cleanup;
}

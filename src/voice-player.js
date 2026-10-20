import {VOICE_MANIFEST} from './voice-manifest.js';
import {voiceLineKey,voiceSpeaker} from './voice-policy.js';
export function createVoicePlayer({manifest=VOICE_MANIFEST,makeAudio=()=>new Audio(),storage,chapter=()=>null,onPlaybackChange=()=>{}}={}) {
  let prefs={enabled:true,volume:0.8};
  try{if(storage===undefined)storage=globalThis.localStorage;const saved=JSON.parse(storage?.getItem('feral-voice')||'null');if(saved&&typeof saved.enabled==='boolean'&&Number.isFinite(saved.volume))prefs={enabled:saved.enabled,volume:Math.max(0,Math.min(1,saved.volume))};}catch{}
  let audio=null,token=0,current=null,active=false,blocked=false,watchdog=null,suspended=false,playAttempt=0,playbackOutcome='idle';
  // Apply character balance through Web Audio, including iOS where element volume is ignored.
  const mobile=typeof navigator!=='undefined'&&/iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const AudioContextType=(globalThis.AudioContext||globalThis.webkitAudioContext);
  let context=null,source=null,gain=null,limiter=null,mobileAudio=null,unlocked=false;
  const speakerBoost=()=>(({manager:1.6,hostess:1.8}[voiceSpeaker(current?.line||{})]||1)*(current?.line?.duelAttack?1.35:1));
  const playbackGain=()=>(mobile?4:1)*prefs.volume*speakerBoost();
  const applyVolume=()=>{if(gain){gain.gain.value=playbackGain();if(audio)audio.volume=1;}else if(audio)audio.volume=Math.min(1,prefs.volume*speakerBoost());};
  const disconnect=()=>{
    // Disconnect EVERY Web Audio node. Otherwise each old compressor remains
    // connected to the destination, retaining a graph per dialogue line on iOS.
    for(const node of [source,gain,limiter]){
      try{node?.disconnect();}catch{}
    }
    source=null;gain=null;limiter=null;
  };
  const connectMobile=element=>{
    if(!AudioContextType)return;
    if(source&&element===mobileAudio){gain.gain.value=playbackGain();element.volume=1;if(context.state==='suspended')context.resume().catch(()=>{});return;}
    try{
      context ||= new AudioContextType();
      const node=context.createMediaElementSource(element);
      const boost=context.createGain();
      // Dynamics compression limits sharp peaks rather than allowing harsh clipping.
      const comp=context.createDynamicsCompressor();
      // Keep quiet phone dialogue audible; restrain peaks near full scale.
      comp.threshold.value=-1;comp.knee.value=0;comp.ratio.value=20;
      comp.attack.value=0.003;comp.release.value=0.2;
      boost.gain.value=playbackGain();
      node.connect(boost);boost.connect(comp);comp.connect(context.destination);
      source=node;gain=boost;limiter=comp;
      // The current play is initiated by a tap, so resume inside that gesture.
      if(context.state==='suspended')context.resume().catch(()=>{});
      element.volume=1;
    }catch{
      disconnect();
      // Fallback to native playback rather than failing the entire voice line.
      element.volume=Math.min(1,prefs.volume*speakerBoost());
    }
  };
  let prepared=null;
  const clipFor=line=>{if(!line)return;const scoped=chapter()===2?{...line,voiceChapter:2}:line;return manifest[voiceLineKey(scoped)]||manifest[voiceLineKey(line)];};
  const clearPrepared=()=>{if(prepared){const old=prepared.audio;prepared=null;old.pause();old.removeAttribute?.('src');old.load?.();}};
  const prepare=line=>{
    const clip=prefs.enabled&&clipFor(line);
    if(!clip){clearPrepared();return;}
    if(prepared?.file===clip.file)return;
    clearPrepared();
    try{const next=makeAudio();next.preload='auto';next.src=clip.file;next.load?.();prepared={file:clip.file,audio:next};}catch{prepared=null;}
  };
  const save=()=>{try{storage?.setItem('feral-voice',JSON.stringify(prefs));}catch{}};
  const stop=()=>{token++;playbackOutcome='idle';clearTimeout(watchdog);if(audio){audio.pause();audio.removeAttribute('src');audio.load();}audio=null;active=false;blocked=false;onPlaybackChange(false);};
  const startPlayback=version=>{
    const attempt=++playAttempt;
    const done=outcome=>{if(version===token&&attempt===playAttempt){playbackOutcome=outcome;active=false;onPlaybackChange(false);clearTimeout(watchdog);}};
    audio.onended=()=>done('ended');audio.onerror=()=>done('error');
    if(suspended)return;
    clearTimeout(watchdog);watchdog=setTimeout(()=>done('timeout'),60000);
    try{Promise.resolve(audio.play()).catch(error=>{if(version!==token||attempt!==playAttempt||suspended)return;done('error');blocked=error?.name==='NotAllowedError';});}
    catch{done('error');}
  };
  const play=(line,identity)=>{
    if(current?.identity===identity)return;
    stop();current=line?{line,identity}:null;
    const clip=clipFor(line);
    if(!prefs.enabled||!clip){playbackOutcome='missing';return;}
    const version=token;
    try{
      if(mobile||AudioContextType){mobileAudio ||= makeAudio();audio=mobileAudio;audio.src=clip.file;clearPrepared();}else if(prepared?.file===clip.file){audio=prepared.audio;prepared=null;}else{audio=makeAudio();audio.preload='auto';audio.src=clip.file;}// Accelerate only battle dialogue. Playback rate preserves the original pitch
      // and reuses existing recordings, so there is no additional TTS cost.
      const duelClip=clip.performance?.startsWith('duel-');
      audio.playbackRate=line?.duelAttack?1.75:duelClip?(clip.speaker==='cat'||clip.performance?.startsWith('duel-moku')?1.16:1.25):1;
      audio.preservesPitch=true;
      audio.mozPreservesPitch=true;
      audio.webkitPreservesPitch=true;
      audio.volume=Math.min(1,prefs.volume*speakerBoost());connectMobile(audio);playbackOutcome='playing';active=true;onPlaybackChange(true);
      startPlayback(version);
    }catch{playbackOutcome='error';active=false;onPlaybackChange(false);}
  };
  return {
    play,prepare,stop:()=>{if(!audio&&!prepared&&!current&&!active&&!blocked)return;stop();clearPrepared();current=null;},get busy(){return prefs.enabled&&active;},get outcome(){return playbackOutcome;},get enabled(){return prefs.enabled;},get volume(){return prefs.volume;},
    setSuspended(value){
      const next=Boolean(value);if(next===suspended)return;suspended=next;
      if(suspended){playAttempt++;clearTimeout(watchdog);audio?.pause();clearPrepared();}
      else if(active&&audio&&prefs.enabled)startPlayback(token);
    },
    unlock(){
      // Safari needs a media play and AudioContext resume inside the initial tap,
      // before cinematic cues fire later from requestAnimationFrame.
      if((mobile||AudioContextType)&&!unlocked&&!active){
        mobileAudio ||= makeAudio();connectMobile(mobileAudio);
        mobileAudio.src='data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQIAAACAgA==';
        const version=token;
        try{Promise.resolve(mobileAudio.play()).then(()=>{unlocked=true;if(version===token&&!active)mobileAudio.pause();}).catch(()=>{});}catch{}
      }
      if(context?.state==='suspended')context.resume().catch(()=>{});
      if(blocked&&current){const {line,identity}=current;current=null;play(line,identity);}},
    setEnabled(value){prefs.enabled=Boolean(value);save();if(!prefs.enabled){stop();clearPrepared();}else if(current){const {line,identity}=current;current=null;play(line,identity);}},
    setVolume(value){prefs.volume=Math.max(0,Math.min(1,Number(value)||0));applyVolume();save();}
  };
}

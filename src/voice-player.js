import {VOICE_MANIFEST} from './voice-manifest.js';
import {voiceLineKey,voiceSpeaker} from './voice-policy.js';
export function createVoicePlayer({manifest=VOICE_MANIFEST,makeAudio=()=>new Audio(),storage,chapter=()=>null,onPlaybackChange=()=>{}}={}) {
  let prefs={enabled:true,volume:0.8};
  try{if(storage===undefined)storage=globalThis.localStorage;const saved=JSON.parse(storage?.getItem('feral-voice')||'null');if(saved&&typeof saved.enabled==='boolean'&&Number.isFinite(saved.volume))prefs={enabled:saved.enabled,volume:Math.max(0,Math.min(1,saved.volume))};}catch{}
  let audio=null,token=0,current=null,active=false,blocked=false,watchdog=null;
  // Apply character balance through Web Audio, including iOS where element volume is ignored.
  const mobile=typeof navigator!=='undefined'&&/iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const AudioContextType=(globalThis.AudioContext||globalThis.webkitAudioContext);
  let context=null,source=null,gain=null,limiter=null,mobileAudio=null,unlocked=false;
  const speakerBoost=()=>({manager:1.6,hostess:1.8}[voiceSpeaker(current?.line||{})]||1);
  const playbackGain=()=>(mobile?2:1)*prefs.volume*speakerBoost();
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
      comp.threshold.value=mobile?-12:-1;comp.knee.value=mobile?6:0;comp.ratio.value=mobile?6:20;
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
  const clearPrepared=()=>{if(prepared){prepared.audio.pause();prepared=null;}};
  const prepare=line=>{
    const clip=prefs.enabled&&clipFor(line);
    if(!clip){clearPrepared();return;}
    if(prepared?.file===clip.file)return;
    clearPrepared();
    try{const next=makeAudio();next.preload='auto';next.src=clip.file;next.load?.();prepared={file:clip.file,audio:next};}catch{prepared=null;}
  };
  const save=()=>{try{storage?.setItem('feral-voice',JSON.stringify(prefs));}catch{}};
  const stop=()=>{token++;clearTimeout(watchdog);if(audio){audio.pause();audio.removeAttribute('src');audio.load();}audio=null;active=false;blocked=false;onPlaybackChange(false);};
  const play=(line,identity)=>{
    if(current?.identity===identity)return;
    stop();current=line?{line,identity}:null;
    const clip=clipFor(line);
    if(!prefs.enabled||!clip)return;
    const version=token;
    try{
      if(mobile||AudioContextType){mobileAudio ||= makeAudio();audio=mobileAudio;audio.src=clip.file;clearPrepared();}else if(prepared?.file===clip.file){audio=prepared.audio;prepared=null;}else{audio=makeAudio();audio.preload='auto';audio.src=clip.file;}audio.volume=Math.min(1,prefs.volume*speakerBoost());connectMobile(audio);active=true;onPlaybackChange(true);
      const done=()=>{if(version===token){active=false;onPlaybackChange(false);clearTimeout(watchdog);}};
      audio.onended=done;audio.onerror=done;
      watchdog=setTimeout(done,60000);
      Promise.resolve(audio.play()).catch(error=>{if(version!==token)return;done();blocked=error?.name==='NotAllowedError';});
    }catch{active=false;onPlaybackChange(false);}
  };
  return {
    play,prepare,stop:()=>{stop();clearPrepared();current=null;},get busy(){return prefs.enabled&&active;},get enabled(){return prefs.enabled;},get volume(){return prefs.volume;},
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

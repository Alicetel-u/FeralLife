import {VOICE_MANIFEST} from './voice-manifest.js';
import {voiceLineKey} from './voice-policy.js';
export function createVoicePlayer({manifest=VOICE_MANIFEST,makeAudio=()=>new Audio(),storage,onPlaybackChange=()=>{}}={}) {
  let prefs={enabled:true,volume:0.8};
  try{if(storage===undefined)storage=globalThis.localStorage;const saved=JSON.parse(storage?.getItem('feral-voice')||'null');if(saved&&typeof saved.enabled==='boolean'&&Number.isFinite(saved.volume))prefs={enabled:saved.enabled,volume:Math.max(0,Math.min(1,saved.volume))};}catch{}
  let audio=null,token=0,current=null,active=false,blocked=false,watchdog=null;
  // iOS ignores HTMLMediaElement.volume on some versions. Amplify mobile speech
  // through Web Audio while leaving desktop playback completely unchanged.
  const mobile=typeof navigator!=='undefined'&&/iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const AudioContextType=mobile&&(globalThis.AudioContext||globalThis.webkitAudioContext);
  let context=null,source=null,gain=null,limiter=null;
  const disconnect=()=>{
    try{source?.disconnect();}catch{}
    source=null;gain=null;limiter=null;
  };
  const connectMobile=element=>{
    if(!AudioContextType)return;
    try{
      context ||= new AudioContextType();
      const node=context.createMediaElementSource(element);
      const boost=context.createGain();
      // Dynamics compression limits sharp peaks rather than allowing harsh clipping.
      const comp=context.createDynamicsCompressor();
      comp.threshold.value=-12;comp.knee.value=6;comp.ratio.value=6;
      comp.attack.value=0.003;comp.release.value=0.2;
      boost.gain.value=2.0*prefs.volume;
      node.connect(boost);boost.connect(comp);comp.connect(context.destination);
      source=node;gain=boost;limiter=comp;
      // The current play is initiated by a tap, so resume inside that gesture.
      if(context.state==='suspended')context.resume().catch(()=>{});
      element.volume=1;
    }catch{
      disconnect();
      // Fallback to native playback rather than failing the entire voice line.
      element.volume=prefs.volume;
    }
  };
  let prepared=null;
  const clipFor=line=>line&&manifest[voiceLineKey(line)];
  const clearPrepared=()=>{if(prepared){prepared.audio.pause();prepared=null;}};
  const prepare=line=>{
    const clip=prefs.enabled&&clipFor(line);
    if(!clip){clearPrepared();return;}
    if(prepared?.file===clip.file)return;
    clearPrepared();
    try{const next=makeAudio();next.preload='auto';next.src=clip.file;next.load?.();prepared={file:clip.file,audio:next};}catch{prepared=null;}
  };
  const save=()=>{try{storage?.setItem('feral-voice',JSON.stringify(prefs));}catch{}};
  const stop=()=>{token++;clearTimeout(watchdog);if(audio){audio.pause();audio.removeAttribute('src');audio.load();}disconnect();audio=null;active=false;blocked=false;onPlaybackChange(false);};
  const play=(line,identity)=>{
    if(current?.identity===identity)return;
    stop();current=line?{line,identity}:null;
    const clip=clipFor(line);
    if(!prefs.enabled||!clip)return;
    const version=token;
    try{
      if(prepared?.file===clip.file){audio=prepared.audio;prepared=null;}else{audio=makeAudio();audio.preload='auto';audio.src=clip.file;}audio.volume=prefs.volume;connectMobile(audio);active=true;onPlaybackChange(true);
      const done=()=>{if(version===token){active=false;onPlaybackChange(false);clearTimeout(watchdog);}};
      audio.onended=done;audio.onerror=done;
      watchdog=setTimeout(done,60000);
      Promise.resolve(audio.play()).catch(error=>{if(version!==token)return;done();blocked=error?.name==='NotAllowedError';});
    }catch{active=false;onPlaybackChange(false);}
  };
  return {
    play,prepare,stop:()=>{stop();clearPrepared();current=null;},get busy(){return prefs.enabled&&active;},get enabled(){return prefs.enabled;},get volume(){return prefs.volume;},
    unlock(){if(blocked&&current){const {line,identity}=current;current=null;play(line,identity);}},
    setEnabled(value){prefs.enabled=Boolean(value);save();if(!prefs.enabled){stop();clearPrepared();}else if(current){const {line,identity}=current;current=null;play(line,identity);}},
    setVolume(value){prefs.volume=Math.max(0,Math.min(1,Number(value)||0));if(gain)gain.gain.value=2.0*prefs.volume;else if(audio)audio.volume=prefs.volume;save();}
  };
}

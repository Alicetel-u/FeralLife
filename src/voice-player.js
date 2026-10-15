import {VOICE_MANIFEST} from './voice-manifest.js';
import {voiceLineKey} from './voice-policy.js';
export function createVoicePlayer({manifest=VOICE_MANIFEST,makeAudio=()=>new Audio(),storage,onPlaybackChange=()=>{}}={}) {
  let prefs={enabled:true,volume:0.8};
  try{if(storage===undefined)storage=globalThis.localStorage;const saved=JSON.parse(storage?.getItem('feral-voice')||'null');if(saved&&typeof saved.enabled==='boolean'&&Number.isFinite(saved.volume))prefs={enabled:saved.enabled,volume:Math.max(0,Math.min(1,saved.volume))};}catch{}
  let audio=null,token=0,current=null,active=false,blocked=false,watchdog=null;
  const save=()=>{try{storage?.setItem('feral-voice',JSON.stringify(prefs));}catch{}};
  const stop=()=>{token++;clearTimeout(watchdog);if(audio){audio.pause();audio.removeAttribute('src');audio.load();}audio=null;active=false;blocked=false;onPlaybackChange(false);};
  const play=(line,identity)=>{
    if(current?.identity===identity)return;
    stop();current=line?{line,identity}:null;
    const clip=line&&manifest[voiceLineKey(line)];
    if(!prefs.enabled||!clip)return;
    const version=token;
    try{
      audio=makeAudio();audio.preload='none';audio.volume=prefs.volume;audio.src=clip.file;active=true;onPlaybackChange(true);
      const done=()=>{if(version===token){active=false;onPlaybackChange(false);clearTimeout(watchdog);}};
      audio.onended=done;audio.onerror=done;
      watchdog=setTimeout(done,60000);
      Promise.resolve(audio.play()).catch(error=>{if(version!==token)return;done();blocked=error?.name==='NotAllowedError';});
    }catch{active=false;onPlaybackChange(false);}
  };
  return {
    play,stop:()=>{stop();current=null;},get busy(){return prefs.enabled&&active;},get enabled(){return prefs.enabled;},get volume(){return prefs.volume;},
    unlock(){if(blocked&&current){const {line,identity}=current;current=null;play(line,identity);}},
    setEnabled(value){prefs.enabled=Boolean(value);save();if(!prefs.enabled){stop();}else if(current){const {line,identity}=current;current=null;play(line,identity);}},
    setVolume(value){prefs.volume=Math.max(0,Math.min(1,Number(value)||0));if(audio)audio.volume=prefs.volume;save();}
  };
}

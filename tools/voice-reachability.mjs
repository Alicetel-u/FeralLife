import {ACT_THREE_SHOTS,ACT_THREE_AFTER_SCENES} from '../src/act-three-prologue.js';
import {createActOne,advanceActOne,answerActOne,getActOneChoices,rewindBeforeFire} from '../src/act-one.js';
import {beginActTwo,advanceActTwo,answerActTwo,actTwoChoices,rewindActTwo,resumeActTwoRewind} from '../src/act-two.js';
import {resumeStoryRewind} from '../src/story-checkpoints.js';
import {OBSERVATION_BEATS} from '../src/act-one-observation.js';
import {ACT_TWO_OBSERVATION_BEATS} from '../src/act-two-observation.js';
import {PROLOGUE_CUTS,INITIAL_MOKU_LINES} from '../src/opening-prologue.js';
import {ACT_TWO_OPENING_SCENES} from '../src/act-two-opening.js';
import {voiceLineKey,voiceSpeaker} from '../src/voice-policy.js';

// Trace the choices and rewind handoffs used by app.js, not every retained script.
// The manifest stays intact so old saves can still play their stored transcripts.
export function tracePlayableVoiceLines(manifest){
 const lines=new Map(),seen=new Set();let states=0;
 const add=(entries,chapter,source)=>{
  for(const [index,original] of (entries||[]).entries()){
   if(original.silent||!['manager','cat','hostess','announcer'].includes(voiceSpeaker(original)))continue;
   const line=chapter===2?{...original,voiceChapter:2}:original;
   const preferred=voiceLineKey(line),fallback=voiceLineKey(original);
   // Match voice-player's chapter lookup and its unscoped recording fallback.
   const key=manifest[preferred]?preferred:manifest[fallback]?fallback:preferred;
   if(!lines.has(key))lines.set(key,{lineKey:key,line,chapter,source:source+':'+index,recorded:!!manifest[key]});
  }
 };
 const events=(state,chapter,path)=>{
  for(const event of state.events){
   if(event.read||!event.actScene)continue;
   const scene=event.actScene==='reply'?state.actOne.completed.at(-1)||'reply':event.actScene;
   add(event.lines,chapter,`act${chapter}/${scene}/runtime`);event.read=true;
  }
 };
 add(PROLOGUE_CUTS,1,'prologue');add(INITIAL_MOKU_LINES,1,'foyer');
 for(const beat of OBSERVATION_BEATS)add(beat.lines,1,'observation/'+beat.id);
 for(const beat of ACT_TWO_OBSERVATION_BEATS)add(beat.lines,2,'observation/'+beat.id);
 for(const shot of ACT_TWO_OPENING_SCENES)add(shot.cues,2,'film/'+shot.shot);
 for(const shot of ACT_THREE_SHOTS)add(shot.cues,3,'act3/film/'+shot.id);
 for(const scene of ACT_THREE_AFTER_SCENES)add(scene.lines,3,'act3/after/'+scene.id);
 const walk=(state,chapter,path)=>{
  if(++states>10000)throw Error('Voice reachability exceeded the bounded story graph');
  events(state,chapter,path);
  const a=state.actOne,advance=chapter===1?advanceActOne:advanceActTwo;
  if(a.rewindIntroPending){
   if(chapter===1)resumeStoryRewind(state,()=>{for(let i=0;i<12&&!state.actOne.pending;i++)advanceActOne(state,100);});
   else resumeActTwoRewind(state);
   events(state,chapter,path+'/resume');
  }
  for(let i=0;i<12&&a.status==='playing'&&!a.pending;i++)advance(state,100);
  events(state,chapter,path+'/advance');
  if(a.status==='clear'||!a.pending)return;
  // Attempts >=3 share the same dialogue rules. Duel score determines endings;
  // yandere memory additionally restricts which choices the player can select.
  const signature=JSON.stringify([chapter,Math.min(a.attempt,3),a.completed,a.pending.scene,a.duel?.round,a.duel?.hearts,!!a.memory?.includes('duel-yandere')]);
  if(seen.has(signature))return;seen.add(signature);
  const choices=(chapter===1?getActOneChoices(state,a.pending.scene):actTwoChoices(state,a.pending.scene)).filter(choice=>!choice.disabled);
  for(const choice of choices){
   const next=structuredClone(state);
   const answer=(chapter===1?answerActOne:answerActTwo)(next,next.actOne.pending.eventId,choice.id);
   if(!answer)throw Error('A selectable voice-audit choice was rejected: '+choice.id);
   events(next,chapter,path+'/'+choice.id);
   if(next.actOne.status==='bad')walk((chapter===1?rewindBeforeFire:rewindActTwo)(next),chapter,path+'/'+choice.id+'/rewind');
   else walk(next,chapter,path+'/'+choice.id);
  }
 };
 walk(createActOne(42,[],1,true),1,'new');
 const second=createActOne(42,[],1,true);beginActTwo(second);
 Object.assign(second.actOne,{started:true,prologuePending:false,titlePending:false});walk(second,2,'new');
 return {lines,states,missing:[...lines.values()].filter(row=>!row.recorded)};
}

import {createActOne,advanceActOne,answerActOne} from './act-one.js';
import {beginActTwo,advanceActTwo} from './act-two.js';
import {OBSERVATION_BEATS,tickObservation} from './act-one-observation.js';
import {ACT_TWO_OBSERVATION_BEATS} from './act-two-observation.js';

export function developerObservationBeats(chapter){return chapter==='1'?OBSERVATION_BEATS:chapter==='2'?ACT_TWO_OBSERVATION_BEATS:[];}

// Reconstruct the real daily route and earlier successful consultations in an isolated game.
export function createDeveloperObservation(chapter,id){
 const beats=developerObservationBeats(chapter),index=beats.findIndex(b=>b.id===id);
 if(index<0)return null;
 const beat=beats[index];
 let next=createActOne(42,[],2,true);
 if(chapter==='2'){
  beginActTwo(next);Object.assign(next.actOne,{started:true,titlePending:false,prologuePending:false});
 }
 const advance=chapter==='1'?advanceActOne:advanceActTwo;
 for(let step=0;next.hour<beat.at-1e-7&&step<6000;step++){
  if(next.actOne.pending){
   if(chapter!=='1')return null;
   answerActOne(next,next.actOne.pending.eventId,next.actOne.pending.scene==='ash'?'water':'coronation');
  }
  advance(next,Math.min(.05,beat.at-next.hour));
 }
 if(next.hour<beat.at)advance(next,beat.at-next.hour);
 next.actOne.observation={version:2,seen:[],done:beats.slice(0,index).map(b=>b.id),current:null,gap:0};
 for(let step=0;step<600&&!next.actOne.observation.current&&!next.actOne.pending;step++){
  tickObservation(next,0);
  if(!next.actOne.observation.current)advance(next,.01);
 }
 if(next.actOne.observation.current?.id!==id)return null;
 next.events.forEach(e=>e.read=true);
 next.selected=chapter==='2'?102:101;
 return next;
}

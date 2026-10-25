import {prepareFourKingsMorning} from './act-two-observation-two.js';
import {ACT_TWO_OBSERVATION_BEATS,migrateNewAllyObservation} from './act-two-observation.js';
import {sampleJourney} from './movement.js';
// Solo room speech; landlord replies only during shared outdoor/hall encounters.
export const OBSERVATION_BEATS=[
  {
    "id": "seat",
    "phase": 0,
    "at": 17.08,
    "title": "片づけ（座れたら終了）",
    "lines": [
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "新しい大家も来たし、今日は片づけるニャ。"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "surprised",
        "text": "この缶をどかして……お、床ニャ。"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "happy",
        "text": "久しぶりニャ。元気にしてたかニャ。"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "……もう一本どかせば、座れるニャ。"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "happy",
        "text": "よし、座れたニャ。片づけ終了ニャ！"
      }
    ]
  },
  {
    "id": "outside-smoke",
    "phase": 0,
    "at": 18.95,
    "title": "外の空気で一服",
    "place": "street",
    "lines": [
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "happy",
        "text": "ふぅ〜……外で吸うのもうまいニャ。缶を二本も動かしたあとの一本は格別ニャ。"
      }
    ]
  },
  {
    "id": "outside",
    "phase": 0,
    "at": 19.85,
    "title": "大家に片づけの成果を報告",
    "lines": [
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "happy",
        "text": "大家、いい知らせニャ。"
      },
      {
        "speaker": "manager",
        "name": "大家",
        "emotion": "happy",
        "text": "お、部屋を片づけたのか？"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "happy",
        "text": "ちゃんと床が見えたニャ！"
      },
      {
        "speaker": "manager",
        "name": "大家",
        "emotion": "surprised",
        "text": "おお！ どのくらい？"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "足の裏くらいニャ。"
      },
      {
        "speaker": "manager",
        "name": "大家",
        "emotion": "angry",
        "text": "立ってた場所だけじゃねぇか！"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "happy",
        "text": "明日はもう片足ぶん頑張るニャ。"
      },
      {
        "speaker": "manager",
        "name": "大家",
        "emotion": "angry",
        "text": "せめて両足ぶんは今日やれ！"
      }
    ],
    "place": "street"
  },
  {
    "id": "ash-sign",
    "phase": 0,
    "at": 22.9,
    "title": "灰皿がそろそろ限界",
    "lines": [
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "surprised",
        "text": "もう一本……灰皿が山盛りニャ。"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "surprised",
        "text": "押せば入るかニャ。……あ、崩れたニャ。"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "surprised",
        "text": "大家ー！ ちょっと知恵を貸すニャ！"
      }
    ]
  },
  {
    "id": "after-ash",
    "phase": 1,
    "at": 23.6,
    "title": "灰皿トラブルのあと",
    "lines": [
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "ふぅ……これで安心ニャ。"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "大家、やっぱり頼りになるニャ。"
      }
    ]
  },
  {
    "id": "phone-search",
    "phase": 1,
    "at": 23.85,
    "title": "スマホがないニャ",
    "lines": [
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "……スマホどこやったかニャ？"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "……ないニャ。"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "……持ってたニャ。"
      }
    ]
  },
  {
    "id": "tv-late",
    "phase": 1,
    "at": 24.1,
    "title": "動画の続き",
    "lines": [
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "そういえば、昨日の動画の続き見てなかったニャ。"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "ちょっとだけ見るかニャ。"
      }
    ]
  },
  {
    "id": "before-dinner",
    "phase": 1,
    "at": 36.65,
    "title": "昼過ぎの空腹",
    "lines": [
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "tired",
        "text": "……腹減ったニャ。"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "tired",
        "text": "そういえば、昨日から何も食べてない気がするニャ……。"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "tired",
        "text": "……なんか作るかニャ。"
      }
    ]
  },
  {
    id:'blanket',phase:2,at:38.4,title:'火の元を確かめて、おやすみ',
    lines:[
      {speaker:'cat',name:'モク',emotion:'tired',text:'火は消えてる。お腹もいっぱい。……今度こそ寝るニャ。'},
      {speaker:'cat',name:'モク',emotion:'tired',text:'テレビもおしまいニャ。おやすみニャ……。'}
    ]
  },
  {
    id:'wake-up',phase:2,at:55,title:'朝7時、おはようニャ',
    lines:[
      {speaker:'cat',name:'モク',emotion:'happy',text:'……ふぁ。おはようニャ。よく寝たニャ。'},
      {speaker:'cat',name:'モク',emotion:'neutral',text:'朝の空気を吸ってくるニャ。……ついでにタバコもニャ。'}
    ]
  },
  {
    id:'hall',phase:2,at:55.6,title:'朝、部屋の前で大家とばったり',place:'hall',
    lines:[
      {speaker:'manager',name:'大家',emotion:'neutral',text:'お、起きたのか。'},
      {speaker:'cat',name:'モク',emotion:'neutral',text:'寝すぎて疲れたから、気分転換ニャ。'},
      {speaker:'manager',name:'大家',emotion:'neutral',text:'休憩のあとに休憩するなよ。'},
      {speaker:'cat',name:'モク',emotion:'neutral',text:'歩いてるニャ。今はかなり活動的ニャ。'},
      {speaker:'manager',name:'大家',emotion:'neutral',text:'……まあ、部屋にこもってるよりいいか。'}
    ]
  }
];
const secondObservation=state=>state.actOne?.chapter===2&&!state.actOne.completed?.includes('duel')&&state.residents.some(r=>r.type==='hostess');
const observationBeats=state=>secondObservation(state)?ACT_TWO_OBSERVATION_BEATS:OBSERVATION_BEATS;
const obsPhaseNames=['モクの最初の晩','夜更かしの代償','ぐっすり眠った翌朝'];
export function observationPhase(state){if(secondObservation(state))return state.actOne.completed.includes('bag')?1:0;return state.actOne?.completed?.includes('dinner')?2:state.actOne?.completed?.includes('ash')?1:0;}
export function clearLegacyObservationMemo(state){
 const a=state.actOne;if(!a)return;
 if(a.observation){delete a.observation.notes;if(a.observation.current)delete a.observation.current.inspecting;}
 if(a.rollbackPoint?.state)clearLegacyObservationMemo(a.rollbackPoint.state);
}
export function observationState(state){
 const a=state.actOne;if(!a||a.chapter===2&&!secondObservation(state))return null;
 prepareFourKingsMorning(state);
 if(!a.observation||a.observation.version!==2){
  const phase=observationPhase(state);
  a.observation={version:2,seen:[],done:secondObservation(state)?[]:observationBeats(state).filter(b=>b.phase<phase||b.at<state.hour).map(b=>b.id),current:null,gap:0};
 }
 migrateNewAllyObservation(state);
 const o=a.observation;
 if(o.current)delete o.current.inspecting;
 if(!Array.isArray(o.seen))o.seen=[];if(!Array.isArray(o.done))o.done=[];delete o.notes;
 if(o.current&&!observationBeats(state).some(b=>b.id===o.current.id&&b.phase===observationPhase(state)&&Number.isInteger(o.current.index)&&o.current.index>=0&&o.current.index<b.lines.length))o.current=null;
 if(!Number.isFinite(o.gap))o.gap=0;
 if(o.current&&!Number.isFinite(o.current.elapsed))o.current.elapsed=0;
 return o;
}
export function observationActive(state){return !!state.actOne&&(state.actOne.chapter!==2||secondObservation(state))&&state.actOne.started&&!state.actOne.prologuePending&&!state.actOne.rewindIntroPending&&state.actOne.status==='playing'&&!state.actOne.pending;}
const obsBeats=state=>observationBeats(state).filter(b=>b.phase===observationPhase(state));
// Begin the final sleep time-lapse only after Moku's bedtime dialogue has finished.
export function firstActSleepClockReady(state){
 if(!observationActive(state)||state.actOne.chapter===2||!state.actOne.completed.includes('dinner')||state.hour<38.4||state.hour>=55)return false;
 const o=observationState(state),moku=state.residents.find(r=>r.type==='cat');
 return !!o?.done.includes('blanket')&&!o.current&&o.gap<=0&&moku?.action==='sleep'&&!sampleJourney(moku,state.hour).moving;
}
export function canSkipObservation(state){const o=observationState(state);return observationActive(state)&&obsBeats(state).every(b=>o.done.includes(b.id)||o.seen.includes(b.id));}
function observationInPlace(state,beat){
 const cat=state.residents.find(r=>r.type==='cat');
 if(beat.place&&(!cat||sampleJourney(cat,state.hour).zone!==beat.place))return false;
 if(!beat.together)return true;
 const luna=state.residents.find(r=>r.type==='hostess');if(!cat||!luna)return false;
 const a=sampleJourney(cat,state.hour),b=sampleJourney(luna,state.hour);
 return !a.moving&&!b.moving&&a.zone==='room'&&b.zone==='room'&&a.room===b.room;
}
export function observationClockLimit(state){
 if(!observationActive(state))return Infinity;
 const o=observationState(state);if(o.current||o.gap>0)return state.hour;
 const next=obsBeats(state).find(b=>!o.done.includes(b.id));if(next?.together&&!observationInPlace(state,next)){const cat=state.residents.find(r=>r.type==='cat');return Math.max(state.hour,next.at,cat?.journey?.arriveAt??next.at);}
 if(next?.place){const r=state.residents.find(r=>r.type==='cat');if(r?.journey&&sampleJourney(r,state.hour).zone!==next.place)return Math.max(next.at,r.journey.arriveAt);}
 return next?Math.max(state.hour,next.at):Infinity;
}
export function finishObservationLine(state){
 const o=observationState(state),c=o?.current;if(!c)return false;
 const beat=observationBeats(state).find(b=>b.id===c.id);
 if(c.elapsed<(c.id.startsWith('luna-four-kings-')?.25:.5))return false;
 c.index++;c.elapsed=0;
 if(c.index>=beat.lines.length){
  if(!o.done.includes(beat.id))o.done.push(beat.id);
  if(!o.seen.includes(beat.id))o.seen.push(beat.id);
  o.current=null;o.gap=secondObservation(state)?.08:observationPhase(state)===0?.45:.85;
 }
 return true;
}
export function tickObservation(state,seconds,{stopped=false,voiceBusy=false,voiceEnded=false}={}){
 if(!observationActive(state)||stopped)return;
 const o=observationState(state),dt=Math.max(0,Math.min(seconds,0.25));
 if(o.gap>0){o.gap=Math.max(0,o.gap-dt);return;}
 if(!o.current){const beat=obsBeats(state).find(b=>!o.done.includes(b.id));if(beat&&state.hour>=beat.at-1e-7&&observationInPlace(state,beat))o.current={id:beat.id,index:0,elapsed:0};return;}
 const c=o.current,beat=observationBeats(state).find(b=>b.id===c.id);c.elapsed+=dt;
 const line=beat.lines[c.index],finishedVoice=voiceEnded&&c.id.startsWith('luna-four-kings-');
   if(!voiceBusy&&c.elapsed>=(finishedVoice?Math.max(.25,line.motionSeconds||0):(secondObservation(state)||observationPhase(state)===0?observationLineSeconds(beat.lines[c.index]):Math.max(2.7,Array.from(beat.lines[c.index].text).length*.075))))finishObservationLine(state);
}
export function skipObservation(state){
 if(!canSkipObservation(state))return false;
 const o=observationState(state);for(const b of obsBeats(state))if(!o.done.includes(b.id))o.done.push(b.id);o.current=null;o.gap=0;return true;
}
export function observationView(state){
 const o=observationState(state);if(!o)return null;
 const beats=obsBeats(state),beat=observationBeats(state).find(b=>b.id===o.current?.id);
 return {phaseTitle:secondObservation(state)?(observationPhase(state)===1?'ルナと四天王':'ルナの引っ越し初日'):obsPhaseNames[observationPhase(state)],lineIndex:o.current?.index??0,total:beats.length,done:beats.filter(b=>o.done.includes(b.id)).length,beat,line:beat?.lines[o.current.index],identity:beat?beat.id+':'+o.current.index:null};
}
export function inheritObservation(previous,next){
 const before=observationState(previous),after=observationState(next);if(!before||!after)return;
 after.seen=[...new Set([...after.seen,...before.seen])];
}

export function observationLineSeconds(line){if(line?.voicePerformance?.startsWith('four-kings-')&&line.silent)return .4; if((line?.voicePerformance?.startsWith('new-ally-')||line?.voicePerformance?.startsWith('four-kings-')))return Math.max(line.motionSeconds||0,Math.min(4,Math.max(1.1,.55+Array.from(line.text).length*.052))); return Math.min(3.7,Math.max(2.0,1+Array.from(line?.text||'').length*.058));}

import {sampleJourney} from './movement.js';
// Solo room speech; landlord replies only during shared outdoor/hall encounters.
export const OBSERVATION_BEATS=[
  {
    "id": "seat",
    "phase": 0,
    "at": 17.08,
    "title": "片づけの第一歩",
    "lines": [
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "片づけるニャ。今日は通り道を作るニャ。"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "まずは、この缶を……よいしょニャ。"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "……まだ落ちてるニャ。あっちも拾うニャ。"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "ふぅ。ちょっとは綺麗になったニャ。"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "続きは明日でいいニャ。"
      }
    ]
  },
  {
    "id": "outside-smoke",
    "phase": 0,
    "at": 18.95,
    "title": "外で一服",
    "place": "street",
    "lines": [
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "ふぅ〜……外で吸うタバコもうまいニャ。"
      }
    ]
  },
  {
    "id": "outside",
    "phase": 0,
    "at": 19.85,
    "title": "大家に話しかける",
    "lines": [
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "お、大家。ちょうどいいところにいたニャ。"
      },
      {
        "speaker": "manager",
        "name": "大家",
        "emotion": "neutral",
        "text": "なんだよ。今度は何か頼み事か？"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "失礼ニャ。たまには普通に話しかけるニャ。"
      },
      {
        "speaker": "manager",
        "name": "大家",
        "emotion": "neutral",
        "text": "……そうか。で、何の話だ？"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "……忘れたニャ。"
      },
      {
        "speaker": "manager",
        "name": "大家",
        "emotion": "neutral",
        "text": "用もないのに話しかけてきたのかよ！"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "まあまあ、そう怒るとハゲるニャ。"
      },
      {
        "speaker": "manager",
        "name": "大家",
        "emotion": "neutral",
        "text": "余計なお世話だ！！"
      }
    ],
    "place": "street"
  },
  {
    "id": "ash-sign",
    "phase": 0,
    "at": 22.9,
    "title": "灰皿の限界",
    "lines": [
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "ふぅ……もう一本吸うかニャ。"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "……ん？"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "……ニャ？"
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
        "text": "大家、やっぱりと頼りになるニャ。"
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
    "title": "夜更かし",
    "lines": [
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "あと一本だけ見るニャ。"
      }
    ]
  },
  {
    "id": "blanket",
    "phase": 2,
    "at": 38.4,
    "title": "ようやく休憩",
    "lines": [
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "……あと五分ニャ。"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "……五分って、こんなに短かったかニャ。"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "今のは練習ニャ。ここから本番ニャ……。"
      }
    ]
  },
  {
    "id": "hall",
    "phase": 2,
    "at": 42,
    "title": "廊下でばったり",
    "lines": [
      {
        "speaker": "manager",
        "name": "大家",
        "emotion": "neutral",
        "text": "お、起きたのか。"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "寝すぎて疲れたから、気分転換ニャ。"
      },
      {
        "speaker": "manager",
        "name": "大家",
        "emotion": "neutral",
        "text": "休憩のあとに休憩するなよ。"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "歩いてるニャ。今はかなり活動的ニャ。"
      },
      {
        "speaker": "manager",
        "name": "大家",
        "emotion": "neutral",
        "text": "……まあ、部屋にこもってるよりいいか。"
      }
    ],
    "place": "hall"
  },
  {
    "id": "quiet-evening",
    "phase": 2,
    "at": 47.5,
    "title": "静かな夜",
    "lines": [
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "今日はもう料理しないニャ。片づけもしないニャ。"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "……片づけはしてもよかったニャ。"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "でも、今から動くとこの番組を見逃すニャ。"
      }
    ]
  },
  {
    "id": "last-morning",
    "phase": 2,
    "at": 56.8,
    "title": "いつもどおりの朝",
    "lines": [
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "朝ニャ。缶はまだあるし、テレビもつくニャ。"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "……あの缶、昨日どかしたやつニャ。"
      },
      {
        "speaker": "cat",
        "name": "モク",
        "emotion": "neutral",
        "text": "今日はちゃんと捨てるニャ。まず座って、順番を考えるニャ。"
      }
    ]
  }
];
const obsPhaseNames=['モクの最初の晩','夜更かしの代償','何も起こらない一日'];
export function observationPhase(state){return state.actOne?.completed?.includes('dinner')?2:state.actOne?.completed?.includes('ash')?1:0;}
export function clearLegacyObservationMemo(state){
 const a=state.actOne;if(!a)return;
 if(a.observation){delete a.observation.notes;if(a.observation.current)delete a.observation.current.inspecting;}
 if(a.rollbackPoint?.state)clearLegacyObservationMemo(a.rollbackPoint.state);
}
export function observationState(state){
 const a=state.actOne;if(!a||a.chapter===2)return null;
 if(!a.observation||a.observation.version!==2){
  const phase=observationPhase(state);
  a.observation={version:2,seen:[],done:OBSERVATION_BEATS.filter(b=>b.phase<phase||b.at<state.hour).map(b=>b.id),current:null,gap:0};
 }
 const o=a.observation;
 if(o.current)delete o.current.inspecting;
 if(!Array.isArray(o.seen))o.seen=[];if(!Array.isArray(o.done))o.done=[];delete o.notes;
 if(o.current&&!OBSERVATION_BEATS.some(b=>b.id===o.current.id&&b.phase===observationPhase(state)&&Number.isInteger(o.current.index)&&o.current.index>=0&&o.current.index<b.lines.length))o.current=null;
 if(!Number.isFinite(o.gap))o.gap=0;
 if(o.current&&!Number.isFinite(o.current.elapsed))o.current.elapsed=0;
 return o;
}
export function observationActive(state){return !!state.actOne&&state.actOne.chapter!==2&&state.actOne.started&&!state.actOne.rewindIntroPending&&state.actOne.status==='playing'&&!state.actOne.pending;}
const obsBeats=state=>OBSERVATION_BEATS.filter(b=>b.phase===observationPhase(state));
export function canSkipObservation(state){const o=observationState(state);return observationActive(state)&&obsBeats(state).every(b=>o.done.includes(b.id)||o.seen.includes(b.id));}
export function observationClockLimit(state){
 if(!observationActive(state))return Infinity;
 const o=observationState(state);if(o.current||o.gap>0)return state.hour;
 const next=obsBeats(state).find(b=>!o.done.includes(b.id));if(next?.place){const r=state.residents.find(r=>r.type==='cat');if(r?.journey&&sampleJourney(r,state.hour).zone!==next.place)return Math.max(next.at,r.journey.arriveAt);}
 return next?Math.max(state.hour,next.at):Infinity;
}
export function finishObservationLine(state){
 const o=observationState(state),c=o?.current;if(!c)return false;
 const beat=OBSERVATION_BEATS.find(b=>b.id===c.id);
 if(c.elapsed<0.5)return false;
 c.index++;c.elapsed=0;
 if(c.index>=beat.lines.length){
  if(!o.done.includes(beat.id))o.done.push(beat.id);
  if(!o.seen.includes(beat.id))o.seen.push(beat.id);
  o.current=null;o.gap=1.5;
 }
 return true;
}
export function tickObservation(state,seconds,{stopped=false,voiceBusy=false}={}){
 if(!observationActive(state)||stopped)return;
 const o=observationState(state),dt=Math.max(0,Math.min(seconds,0.25));
 if(o.gap>0){o.gap=Math.max(0,o.gap-dt);return;}
 if(!o.current){const beat=obsBeats(state).find(b=>!o.done.includes(b.id));if(beat&&state.hour>=beat.at-1e-7&&(!beat.place||sampleJourney(state.residents.find(r=>r.type==='cat'),state.hour).zone===beat.place))o.current={id:beat.id,index:0,elapsed:0};return;}
 const c=o.current,beat=OBSERVATION_BEATS.find(b=>b.id===c.id);c.elapsed+=dt;
 if(!voiceBusy&&c.elapsed>=Math.max(3.6,Array.from(beat.lines[c.index].text).length*0.095))finishObservationLine(state);
}
export function skipObservation(state){
 if(!canSkipObservation(state))return false;
 const o=observationState(state);for(const b of obsBeats(state))if(!o.done.includes(b.id))o.done.push(b.id);o.current=null;o.gap=0;return true;
}
export function observationView(state){
 const o=observationState(state);if(!o)return null;
 const beats=obsBeats(state),beat=OBSERVATION_BEATS.find(b=>b.id===o.current?.id);
 return {phaseTitle:obsPhaseNames[observationPhase(state)],total:beats.length,done:beats.filter(b=>o.done.includes(b.id)).length,beat,line:beat?.lines[o.current.index],identity:beat?beat.id+':'+o.current.index:null};
}
export function inheritObservation(previous,next){
 const before=observationState(previous),after=observationState(next);if(!before||!after)return;
 after.seen=[...new Set([...after.seen,...before.seen])];
}

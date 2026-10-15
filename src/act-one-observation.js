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
    "text": "この缶をこっちに……こっちにも缶があるニャ。"
   },
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "じゃあ、まとめて足で寄せるニャ。"
   },
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "……通れたニャ。"
   },
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "片づけって、思ったより簡単ニャ。"
   }
  ]
 },
 {
  "id": "outside",
  "phase": 0,
  "at": 19.5,
  "title": "建物の前でひと休み",
  "lines": [
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "お、大家も外にいたニャ。部屋より涼しいニャ。"
   },
   {
    "speaker": "manager",
    "name": "大家",
    "emotion": "neutral",
    "text": "部屋もこのくらい空気がよければいいんだけどな。"
   },
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "窓は開けてきたニャ。留守の間に換気できるニャ。"
   },
   {
    "speaker": "manager",
    "name": "大家",
    "emotion": "neutral",
    "text": "自分が煙の元だってわかってるじゃねぇか。"
   },
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "だから今、外にいるニャ。ちゃんと協力してるニャ。"
   },
   {
    "speaker": "manager",
    "name": "大家",
    "emotion": "neutral",
    "text": "……戻ったら振り出しだろ、それ。"
   }
  ],
  "place": "street"
 },
 {
  "id": "remote",
  "phase": 0,
  "at": 22.3,
  "title": "帰宅後の大仕事",
  "lines": [
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "よく歩いたニャ。足を休ませるニャ。"
   },
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "リモコン……あとちょっとで届くニャ。"
   },
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "……立った方が早い気がするニャ。"
   },
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "でも今立ったら、休んだことにならないニャ。"
   },
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "あ、次の番組が始まったニャ。もうこれでいいニャ。"
   }
  ]
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
    "text": "……吸い殻、立てたらもう一本入るかニャ。"
   },
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "そーっと……そーっと……。"
   },
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "……崩れたニャ。"
   },
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "灰皿が小さいのが悪いニャ。"
   },
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "大家さーん。ちょっと聞きたいことがあるニャ。"
   }
  ]
 },
 {
  "id": "after-ash",
  "phase": 1,
  "at": 23.6,
  "title": "片づいた、その直後",
  "lines": [
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "灰皿が空いたニャ。テーブルも広くなったニャ。"
   },
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "ここに缶を置けば……。"
   },
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "……さっき空いたところだったニャ。今日は端に置くニャ。"
   }
  ]
 },
 {
  "id": "evening",
  "phase": 1,
  "at": 24.5,
  "title": "夜食のあと",
  "lines": [
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "食べたニャ。あとは容器を捨てるだけニャ。"
   },
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "この番組が終わったら捨てるニャ。"
   },
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "……容器は逃げないニャ。番組は待ってくれないニャ。"
   }
  ]
 },
 {
  "id": "late-video",
  "phase": 1,
  "at": 28.3,
  "title": "終われない夜",
  "lines": [
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "今度こそ最後の動画ニャ。"
   },
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "……前編？"
   },
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "ここでやめたら、逆に気になって眠れないニャ。後編も見るニャ。"
   }
  ]
 },
 {
  "id": "morning",
  "phase": 1,
  "at": 32.5,
  "title": "朝の言い訳",
  "lines": [
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "まぶしいニャ。誰が電気つけたニャ……。"
   },
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "……太陽ニャ。"
   },
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "寝てないだけで、早起きした気分ニャ。"
   }
  ]
 },
 {
  "id": "three-cans",
  "phase": 1,
  "at": 34.5,
  "title": "本日の働き",
  "lines": [
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "一本、二本、三本。缶を拾ったニャ。"
   },
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "……まだあるニャ。"
   },
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "いっぺんに終わらせたら、明日の仕事がなくなるニャ。今日はここまでニャ。"
   }
  ]
 },
 {
  "id": "hungry",
  "phase": 1,
  "at": 36.8,
  "title": "空腹と眠気",
  "lines": [
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "何か食べたいニャ。冷蔵庫に……何があったかニャ。"
   },
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "立ったら目が覚めると思ったのに、立ったまま眠いニャ。"
   },
   {
    "speaker": "cat",
    "name": "モク",
    "emotion": "neutral",
    "text": "……大家に聞いてからにするニャ。"
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

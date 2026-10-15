// First-act everyday scenes. They add no new story facts or hidden-plot reveals.
// Clock barriers live here, leaving the authored event deadlines and saves intact.
const obsCat=text=>({speaker:'cat',name:'モク',emotion:'neutral',text});
const obsManager=text=>({speaker:'manager',name:'大家',emotion:'neutral',text});
export const OBSERVATION_BEATS=[
 {id:'seat',phase:0,at:17.08,title:'座る場所を探して',object:'テーブルを見る',note:'飲みかけの缶がテーブルを占領している。モクは一本だけ寄せて、片づけた顔をしていた。',lines:[obsCat('大家、そこ座れるニャ。缶を一本どかしたニャ。'),obsManager('一本で済む量じゃないだろ、これ。'),obsCat('まずは小さな一歩ニャ。座れたなら成功ニャ。')]},
 {id:'window',phase:0,at:17.7,title:'窓辺の換気',object:'窓辺を見る',note:'開いた窓から煙が細く流れている。部屋は涼しくなったが、灰皿の中身は減っていない。',lines:[obsCat('窓を開けたニャ。これで部屋が広く感じるニャ。'),obsManager('広くなったんじゃなくて、煙が抜けたんだよ。'),obsCat('じゃあ、片づけも少し進んだってことニャ。')]},
 {id:'remote',phase:0,at:18.3,title:'あと一本の番組',object:'リモコンを見る',note:'次の動画が自動で始まった。立ち上がりかけたモクは、またソファへ沈んだ。',lines:[obsCat('これが終わったら動くニャ。今、いいところニャ。'),obsManager('さっきの番組でも同じこと言ってなかったか？'),obsCat('いい番組が多くて困るニャ。')]},
 {id:'ash-sign',phase:0,at:18.9,title:'置き場所が、もうない',object:'灰皿を見る',note:'吸い殻が縁まで積もっている。モクが灰を落とすたび、小さな山が崩れそうになる。',lines:[obsCat('……ここなら、もう一本置けるかニャ。'),obsManager('積み方の問題にするなよ。'),obsCat('ちょっと相談したいことができたニャ。')]},
 {id:'after-ash',phase:1,at:19.6,title:'ひとまず、ひと息',object:'テーブルを見る',note:'さっきまでの吸い殻は片づいた。空いた場所へ缶を置きかけ、モクは大家の顔を見て引っ込めた。',lines:[obsCat('さっきは助かったニャ。大家がいてよかったニャ。'),obsManager('次からは呼ぶ前に、ちゃんと考えてくれよ。'),obsCat('考えてわからなかったら呼ぶニャ。早めに呼ぶニャ。')]},
 {id:'evening',phase:1,at:20.5,title:'静かな夜のはじまり',object:'テレビを見る',note:'食事の容器は空になった。画面の中だけは忙しく、モクの足はすっかり止まっている。',lines:[obsCat('お腹も落ち着いたし、少しだけテレビ見るニャ。'),obsManager('少しって、どれくらいだ？'),obsCat('眠くなるまでニャ。わかりやすいニャ。')]},
 {id:'late-video',phase:1,at:25,title:'終わらない「次の一本」',object:'画面を見る',note:'窓の外は真っ暗だ。動画の終了画面に、また別のおすすめが並ぶ。',lines:[obsCat('次の動画が、さっきより面白そうニャ。'),obsManager('それじゃ一生終わらないだろ。'),obsCat('大家もわかってきたニャ。困った仕組みニャ。')]},
 {id:'morning',phase:1,at:32.5,title:'朝になっていた',object:'モクの様子を見る',note:'朝の光にモクが目を細める。あくびを途中で止めようとして、結局もう一度あくびをした。',lines:[obsCat('窓が明るいニャ。動画、そんなに長かったかニャ。'),obsManager('夜が終わるくらいには見てたんだよ。'),obsCat('……今日は目を使わない生活にするニャ。')]},
 {id:'three-cans',phase:1,at:34.5,title:'本日の働き',object:'床を見る',note:'空き缶が三本、袋に入った。まだ床は散らかっているが、通り道が少し見える。',lines:[obsCat('缶を三本拾ったニャ。もう昼までの仕事は終わりニャ。'),obsManager('昼までっていうか、今の一分で終わっただろ。'),obsCat('短時間で結果を出したニャ。')]},
 {id:'hungry',phase:1,at:36.8,title:'眠気と空腹',object:'台所を見る',note:'モクが冷蔵庫とコンロを交互に見ている。フライパンを持つ手より、まぶたの方が先に下がった。',lines:[obsCat('お腹は起きてるのに、顔が寝そうニャ。'),obsManager('今から何か作るつもりか？'),obsCat('……そこも含めて相談するニャ。')]},
 {id:'blanket',phase:2,at:38.4,title:'ようやく、休憩',object:'ソファを見る',note:'さっきの騒ぎが収まり、寝息だけが聞こえる。毛布の端から、モクの足が少しはみ出していた。',lines:[obsManager('……寝るなら最初から寝てくれよ。'),obsCat('……聞こえてるニャ。目だけ休んでるニャ。'),obsManager('返事したまま寝るなよ。')]},
 {id:'hall',phase:2,at:42,title:'外の空気',object:'廊下を見る',note:'部屋の外は少し涼しい。モクは遠くへ出かけず、廊下をゆっくり歩いている。',lines:[obsCat('ずっと座ってたから、少し歩くニャ。'),obsManager('やっと自分から動いたな。'),obsCat('戻ったら座りやすくするためニャ。')]},
 {id:'quiet-evening',phase:2,at:47.5,title:'何も起こらない夜',object:'台所を見る',note:'コンロには火がついていない。いつもどおりのテレビの音が、今夜は少しだけ安心に聞こえる。',lines:[obsCat('今日はもう料理しないニャ。安心していいニャ。'),obsManager('普通はそれ、安心させるために言うことじゃないんだけどな。'),obsCat('この部屋では、大事なお知らせニャ。')]},
 {id:'last-morning',phase:2,at:56.8,title:'迎えられた朝',object:'窓の外を見る',note:'朝の光が、昨日と同じ窓から差している。テレビの音も、散らかった部屋も、そのままここにある。',lines:[obsCat('今日も部屋があるニャ。座る場所もあるニャ。'),obsManager('……ああ。ちゃんとあるな。'),obsCat('じゃあ、もう少しゆっくりするニャ。')]}
];
const obsPhaseNames=['夕暮れの101号室','夜更かしの代償','何も起こらない一日'];
export function observationPhase(state){return state.actOne?.completed?.includes('dinner')?2:state.actOne?.completed?.includes('ash')?1:0;}
export function observationState(state){
 const a=state.actOne;if(!a||a.chapter===2)return null;
 if(!a.observation||a.observation.version!==1){
  const phase=observationPhase(state);
  a.observation={version:1,seen:[],done:OBSERVATION_BEATS.filter(b=>b.phase<phase||b.at<state.hour).map(b=>b.id),current:null,gap:0,notes:[]};
 }
 const o=a.observation;
 if(!Array.isArray(o.seen))o.seen=[];if(!Array.isArray(o.done))o.done=[];if(!Array.isArray(o.notes))o.notes=[];
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
 const next=obsBeats(state).find(b=>!o.done.includes(b.id));return next?Math.max(state.hour,next.at):Infinity;
}
export function finishObservationLine(state){
 const o=observationState(state),c=o?.current;if(!c)return false;
 const beat=OBSERVATION_BEATS.find(b=>b.id===c.id);
 if(c.elapsed<0.5)return false;
 c.index++;c.elapsed=0;c.inspecting=false;
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
 if(!o.current){const beat=obsBeats(state).find(b=>!o.done.includes(b.id));if(beat&&state.hour>=beat.at-1e-7)o.current={id:beat.id,index:0,elapsed:0};return;}
 const c=o.current,beat=OBSERVATION_BEATS.find(b=>b.id===c.id);c.elapsed+=dt;
 if(!voiceBusy&&!c.inspecting&&c.elapsed>=Math.max(3.6,Array.from(beat.lines[c.index].text).length*0.095))finishObservationLine(state);
}
export function skipObservation(state){
 if(!canSkipObservation(state))return false;
 const o=observationState(state);for(const b of obsBeats(state))if(!o.done.includes(b.id))o.done.push(b.id);o.current=null;o.gap=0;return true;
}
export function inspectObservation(state){const o=observationState(state);if(!o?.current)return false;o.current.inspecting=true;const id=o.current.id;if(!o.notes.includes(id))o.notes.push(id);return true;}
export function observationView(state){
 const o=observationState(state);if(!o)return null;
 const beats=obsBeats(state),beat=OBSERVATION_BEATS.find(b=>b.id===o.current?.id);
 return {phaseTitle:obsPhaseNames[observationPhase(state)],total:beats.length,done:beats.filter(b=>o.done.includes(b.id)).length,beat,line:beat?.lines[o.current.index],identity:beat?beat.id+':'+o.current.index:null,inspected:beat&&o.notes.includes(beat.id),notes:o.notes.map(id=>OBSERVATION_BEATS.find(b=>b.id===id)).filter(Boolean)};
}
export function inheritObservation(previous,next){
 const before=observationState(previous),after=observationState(next);if(!before||!after)return;
 after.seen=[...new Set([...after.seen,...before.seen])];after.notes=[...new Set([...after.notes,...before.notes])];
}

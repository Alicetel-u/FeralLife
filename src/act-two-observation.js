const lunaEscapeLine=(speaker,text,emotion='happy')=>({speaker,name:{cat:'モク',hostess:'ルナ',manager:'大家'}[speaker],emotion,text,voicePerformance:'observation-'+speaker});
const lunaEscapeMoku=(text,emotion)=>lunaEscapeLine('cat',text,emotion),lunaEscapeLuna=(text,emotion)=>lunaEscapeLine('hostess',text,emotion),lunaEscapeLandlord=(text,emotion)=>lunaEscapeLine('manager',text,emotion);
// Keep all five saved IDs; these are consecutive beats of one continuous scene.
export const ACT_TWO_OBSERVATION_BEATS=[
 {id:'luna-unpack',phase:0,at:65.08,title:'ルナ、いるニャ？',lines:[
 lunaEscapeLandlord('モク、ちょっと手伝ってくれ。'),lunaEscapeMoku('今、忙しいニャ。'),lunaEscapeLandlord('何してるんだ？'),lunaEscapeMoku('……ルナに用があるニャ。'),lunaEscapeMoku('ルナ、いるニャ？'),lunaEscapeLuna('いるよ。')
 ]},
 {id:'luna-neighbor',phase:0,at:65.09,title:'逃げ込んだ先にも',lines:[
 lunaEscapeMoku('助けてニャ。ちょっと、かくまってほしいニャ。','surprised'),lunaEscapeLuna('えっ、誰かに追われてるの？','surprised'),lunaEscapeMoku('大家ニャ。'),lunaEscapeLuna('……何したの？'),lunaEscapeMoku('何もしてないニャ。だから手伝えって言われたニャ。'),lunaEscapeLuna('じゃあ、手伝ってあげなよ。'),lunaEscapeMoku('……ここにも大家がいたニャ。','surprised')
 ]},
 {id:'luna-tidy',phase:0,at:65.10,title:'何かしたら？',lines:[
 lunaEscapeLuna('大家さん、いつもあんなに怒ってるの？'),lunaEscapeMoku('モクが何もしないと、だいたい怒るニャ。'),lunaEscapeLuna('何かしたら？'),lunaEscapeMoku('もっと怒るニャ。'),lunaEscapeLuna('それ、何をしたのか聞いてもいい？'),lunaEscapeMoku('……手伝ってくるニャ。'),lunaEscapeLuna('そこは話してくれないんだ。')
 ]},
 {id:'luna-tea',phase:0,at:65.11,title:'返事が早いニャ！',lines:[
 lunaEscapeLuna('じゃ、あたし買い物に行ってくるね。'),lunaEscapeMoku('大家がいないか、見てほしいニャ。'),lunaEscapeLandlord('モク、いるだろ。'),lunaEscapeLuna('……いるよ。'),lunaEscapeMoku('返事が早いニャ！','surprised')
 ]},
 {id:'luna-before-outing',phase:0,at:65.12,title:'順番を守れ',lines:[
 lunaEscapeLandlord('手伝いが終わったら帰っていいって言っただろ。'),lunaEscapeMoku('帰っていいところだけ、先にやったニャ。'),lunaEscapeLandlord('順番を守れ。'),lunaEscapeLuna('じゃあ、頑張ってね。'),lunaEscapeMoku('買い物、ゆっくりしてくるといいニャ。'),lunaEscapeLandlord('帰ってくる前には終わる仕事だよ。')
 ]}
];
// Presentation coordinates only: the simulation and old journey saves remain intact.
export function lunaEscapePosition(state,type,{reduced=false}={}){
 const a=state.actOne,obs=a?.observation;
 const previous=ACT_TWO_OBSERVATION_BEATS.find(b=>b.id===obs?.done?.at(-1));
 const c=obs?.current||(obs?.gap>0&&previous?{id:previous.id,index:previous.lines.length-1,elapsed:1}:null);
 if(a?.chapter!==2||!a.started||a.status!=='playing'||a.prologuePending||a.rewindIntroPending||a.pending||!c)return null;
 const beat=ACT_TWO_OBSERVATION_BEATS.findIndex(b=>b.id===c.id);if(beat<0)return null;
 const i=c.index,e=Math.min(1,(c.elapsed||0)/.36),p=reduced?1:e*e*(3-2*e);
 const hall=(x)=>({x,y:440,zone:'hall',room:102,direction:1,moving:false});
 const room=(x)=>({x,y:419,zone:'room',room:102,direction:-1,moving:false});
 let from,to;
 if(type==='manager')return {...hall(565),direction:-1,chat:true,pose:'idle'};
 if(type==='cat'){
  if(beat===0){from=hall(410);to=hall(i>=3?510:410);if(i>=4)from=hall(510);}
  else if(beat===1){from=i===0?hall(510):room(462);to=room(i>=6?438:462);}
  else if(beat===2){from=to=room(438);}
  else if(beat===3){from=room(438);to=room(i>=4?484:438);if(i<4)from=to;}
  else {from=i===0?room(484):hall(510);to=hall(510);}
 }else if(type==='hostess'){
  from=room(502);to=room(beat>=3?513:502);
 }else return null;
 return {...to,x:from.x+(to.x-from.x)*p,y:from.y+(to.y-from.y)*p,zone:p<.5?from.zone:to.zone,moving:p<1&&(from.x!==to.x||from.y!==to.y),direction:to.x<from.x?-1:to.direction};
}

import { saveStoryCheckpoint, validStoryCheckpoint, storyCheckpointTarget } from './story-checkpoints.js';
import { firstActLife } from './act-one-life.js';
import { actExpression } from './act-expressions.js';
import {createGame,advance,addEvent,validateSave} from './simulation.js';

export const ACT_ONE_TITLE='アパートをモクから守れ！';
export const ACT_ONE_LOOP_TITLE='アパートを火事（モク）から守れ！';
export function actOneTitle(state){return state.actOne.attempt > 1 ? ACT_ONE_LOOP_TITLE : ACT_ONE_TITLE;}
const actLine=(speaker,emotion,text)=>({speaker,emotion:actExpression(speaker,text,emotion),text});
const ac=(emotion,text)=>actLine('cat',emotion,text);
const am=text=>actLine('manager','neutral',text);
const an=text=>actLine('narrator','neutral',text);
export const ACT_ONE_EVENTS={
  ash:{at:19,title:'第一の火種：灰皿がもう限界ニャ！',call:'灰皿がもう限界ニャ！',detail:'1日目19時。101号室。テーブルにはストロング缶、灰皿には山盛りの吸い殻。まだ熱い吸い殻をどうするか、モクが大家へ相談してきた。',lines:[
    an('夜の101号室。モクはテレビを見ながらタバコを吸っている。テーブルにはストロング缶。灰皿には吸い殻が山盛りだ。'),
    ac('tired','大家さ〜ん。ちょっといいかニャ？'),
    am('なんだよ、今度は。'),
    ac('neutral','灰皿いっぱいになったニャ。'),
    am('捨てろよ。'),
    ac('surprised','それが……さっき吸ったやつ、まだ熱いニャ。'),
    am('だったらちゃんと火を消せよ！'),
    ac('tired','めんどくさいから、大家が決めてニャ。'),
    am('なんで俺が決めるんだよ……。')
  ],choices:[
    {id:'trash',label:'ゴミと一緒に捨てちまえ！',bad:'ash-trash',lines:[
      am('もうゴミと一緒に捨てちまえ！'),
      ac('tired','まだ熱いけど……まぁいいかニャ。'),
      an('モクは吸い殻をゴミ袋に放り込んだ。'),
      ac('happy','よし！ 部屋が片づいたニャ！'),
      an('数分後。ゴミ袋から白い煙が立ち上る。'),
      ac('surprised','……あれ？ ゴミって自分で燃えるんだっけニャ？'),
      an('101号室から出火。けもの荘は全焼した。')
    ],regret:'ゴミと一緒に捨てろなんて……火が残ってるって言ってたのに。',clue:'消えていない吸い殻をゴミ袋に入れてはいけない。',ending:'燃えるゴミの日'},
    {id:'balcony',label:'ベランダからポイしとけ！',bad:'ash-balcony',lines:[
      am('ベランダからポイしとけ！'),
      ac('happy','おっ、証拠隠滅ニャ！'),
      an('モクは吸い殻をベランダから投げ捨てた。'),
      ac('happy','これで灰皿スッキリニャ！'),
      an('しかし、吸い殻は階下のゴミ置き場へ落下。'),
      ac('surprised','……なんか下が明るいニャ。'),
      an('火は建物へ燃え広がり、けもの荘は全焼した。')
    ],regret:'外に捨てれば済むと思った。火種まで外へ落とすことになった。',clue:'熱い吸い殻を外に捨てても火は消えない。',ending:'ポイ捨ての代償'},
    {id:'freezer',label:'灰皿を冷凍庫にぶち込め！',bad:'ash-freezer',lines:[
      am('灰皿を冷凍庫にぶち込め！ キンキンに冷やせ！'),
      ac('surprised','えっ！？ 冷凍チャーハンと一緒でいいニャ？'),
      am('チャーハンより先に冷やせ！ 緊急事態だ！'),
      ac('tired','了解ニャ！ ……でも冷凍庫パンパンだニャ。'),
      am('じゃあ中のもん出せばいいだろ！'),
      an('モクは冷凍食品を取り出し、灰皿を冷凍庫に入れようとする。ところが手を滑らせて灰皿をひっくり返す。'),
      an('まだ熱い吸い殻が、床に積まれた紙くずの中へ。'),
      ac('surprised','……あっ。'),
      am('……何やってんだ？'),
      ac('tired','チャーハンは無事ニャ。'),
      an('101号室から火が広がり、けもの荘は全焼した。')
    ],regret:'冷やす前に、火を消せばよかった……。',clue:'冷凍庫へ運ぶ前に、吸い殻の火を確実に消すべきだった。',ending:'冷凍失敗、建物はこんがり'},
    {id:'water',label:'灰皿ごと水に沈めろ！',lines:[
      am('灰皿ごと水に沈めろ！'),
      ac('surprised','灰皿を溺れさせるニャ！？'),
      am('火を消すんだよ！'),
      ac('angry','……最初からそう言えニャ！'),
      an('モクは吸い殻を水で確実に消火し、灰皿を安定した安全な場所へ置いた。'),
      ac('happy','ふぅ……これで安心ニャ。'),
      am('最初からやれよ！'),
      ac('neutral','明日からちゃんとするニャ。'),
      am('今日やれ！！')
    ],clue:'前の周回で失ったものを思い出した。吸い殻は水で確実に消火する。'}
  ]},
  dinner:{at:37,title:'第二の火種：寝不足なのに料理すんな！',call:'寝不足なのに料理すんな！',detail:'2日目13時。昼過ぎの101号室。朝まで動画を見ていたモクが、眠そうな顔でフライパンを握っている。テーブルにはストロング缶とカップ麺の容器。',lines:[
    an('昼過ぎの101号室。昨夜、朝まで動画を見ていたモク。テーブルには飲みかけのストロング缶と、食べ終わったカップ麺の容器。モクはフライパンを片手に、今にも眠りそうになっている。'),
    ac('tired','大家さ〜ん……腹減ったニャ……。'),
    am('なんだよ、その顔。ゾンビかよ。'),
    ac('tired','昨日、ちょっと夜更かししたニャ……。'),
    am('何時まで起きてたんだ？'),
    ac('shy','朝の……8時くらいニャ。'),
    am('それ夜更かしじゃねぇ！ 朝帰りの時間だろ！'),
    ac('neutral','でも一睡もしてないから、朝帰りじゃないニャ。'),
    am('そこ訂正する必要ある！？'),
    an('モクはフライパンをコンロに置く。'),
    ac('tired','とりあえず飯作るニャ……。'),
    am('いや、お前その状態で火使う気か？'),
    ac('tired','大丈夫ニャ。料理くらいできるニャ……ふぁぁ……。'),
    am('今あくびしただろ！'),
    ac('neutral','口の換気ニャ……。'),
    am('お前の身体、換気するところ多すぎだろ！'),
    ac('tired','で、どうすればいいニャ……？')
  ],choices:[
    {id:'coronation',label:'今日はカップ麺で我慢しろ！',lines:[
      am('今日はカップ麺で我慢しろ！ 火を使う料理は禁止！'),
      ac('tired','え〜……昨日もカップ麺だったニャ。'),
      am('じゃあ今日は豪華に卵でも入れろ。'),
      ac('happy','おっ！ ごちそうニャ！'),
      am('安上がりな猫だな……。'),
      ac('neutral','卵がないニャ。'),
      am('ないのかよ！！'),
      an('モクは電気ケトルでお湯を沸かし、カップ麺を食べることにした。コンロの火は使わずに済んだ。'),
      ac('happy','うまいニャ……。やっぱり文明って最高ニャ。'),
      am('お前が言うと文明が退化しそうだわ。')
    ],clue:'眠いときはコンロを使わず、簡単に食事を済ませる。'},
    {id:'turbo',label:'強火で一気に作っちまえ！',bad:'dinner-turbo',lines:[
      am('強火で一気に作っちまえ！ さっさと食って寝ろ！'),
      ac('happy','なるほどニャ！ 強火ならすぐ完成ニャ！'),
      an('モクはコンロの火を強くする。'),
      ac('tired','よーし……あとは焼けるのを待つだけニャ……。'),
      am('おい、目閉じてんぞ！'),
      ac('tired','閉じてないニャ……まばたきが長いだけニャ……。'),
      am('長すぎだろ！'),
      an('モクは椅子に座ったまま眠ってしまった。'),
      an('やがてフライパンから煙が上がり、炎が燃え広がる。'),
      ac('surprised','……あれ？ 料理ってこんなに明るかったかニャ？'),
      am('明るいどころじゃねぇ！！'),
      an('けもの荘は全焼した。')
    ],regret:'眠くて危ないのに、強火で急がせるんじゃなかった……。',clue:'火力を強くしても眠気は消えない。料理中の寝落ちが火事につながった。'},
    {id:'show',label:'眠気覚ましに酒でも飲め！',bad:'dinner-show',lines:[
      am('眠気覚ましに酒でも飲め！'),
      ac('surprised','えっ！？ 大家、お酒飲んでいいニャ！？'),
      am('お前、普段から飲んでるだろ。'),
      ac('happy','大家公認なら堂々と飲めるニャ！'),
      an('モクは冷蔵庫からストロング缶を取り出す。'),
      ac('happy','くぅ〜〜！ 生き返るニャ〜！'),
      am('どうだ、目ぇ覚めたか？'),
      ac('tired','なんか……すっごく気持ちよくなってきたニャ……。'),
      am('おい、まさか……。'),
      ac('tired','おやすみニャ……。'),
      an('モクは火を使った料理の途中で眠り込んでしまった。'),
      am('寝るなぁぁ！！'),
      an('コンロから出火。けもの荘は全焼した。')
    ],regret:'眠気覚ましに酒を勧めるなんて……。火を使わせるべきじゃなかった。',clue:'飲酒は眠気覚ましにならない。寝不足のまま火を使わせないこと。'}
  ]}
};

export function getActOneChoices(s,scene){
  const choices=ACT_ONE_EVENTS[scene]?.choices||[];
  return scene==='ash'&&s.actOne?.attempt===1?choices.filter(c=>c.id!=='water'):choices.filter(c=>scene!=='ash'||c.id!=='freezer');
}

export function actOneChosenChoices(s){
  const chosen=new Set(s.actOne.chosenChoices||[]);
  for(const [scene,event] of Object.entries(ACT_ONE_EVENTS))for(const choice of event.choices){
    if((choice.bad&&s.actOne.memory.includes(choice.bad))||s.events.some(e=>e.actScene===scene&&e.actChoice===choice.id))chosen.add(`${scene}:${choice.id}`);
  }
  return [...chosen];
}
export function createActOne(seed=Date.now(),memory=[],attempt=1,started=false,chosenChoices=[]){
  const s=createGame(seed);
  s.events=[];s.nextId=1;s.residents[0].history=[];s.heard=[];
  s.actOne={version:1,started,attempt,memory:[...memory],chosenChoices:[...chosenChoices],status:'playing',completed:[],pending:null,seed:s.seed};
  const e=addEvent(s,'life','1日目17時。101号室の新しい大家。','築38年の古びたアパート「けもの荘」。夕暮れの101号室。窓から大量の煙が漂っている。',[101]);
  e.actScene='opening';e.cast=['cat'];e.stageOnly=true;
  e.lines=attempt>=3?[
    an('1日目17時。見覚えのある101号室。何事もなかったように、また煙が漂っている。'),
    ac('neutral','新しい大家？ モクですニャ。よろしくニャ。'),
    am('……ああ、知ってるよ。嫌ってほどな。'),
    ac('surprised','ニャ？ 初めて会ったはずニャ。'),
    am('こっちは何回も会ってんだよ……。'),
    ac('tired','……大家、変な人ニャ。'),
    an('また最初からか……。今度こそ、このボロアパートを守ってやる。')
  ]:[
    an('築38年の古びたアパート「けもの荘」。夕暮れの101号室。窓から大量の煙が漂っている。'),
    ac('neutral','新しい大家？ モクですニャ。よろしくニャ。'),
    am('うわっくっせぇ！！煙だらけじゃねーか！'),
    ac('happy','大丈夫ニャ。換気扇は昨日から回してるニャ。'),
    am('換気扇より先にタバコ止めろよ！'),
    am('まぁよろしく。……ずいぶん自由に暮らしてるな。'),
    ac('tired','他に誰もいないからニャ。静かで最高ニャ。'),
    am('部屋、少しは片づけたらどうだ？'),
    ac('neutral','明日からやるニャ。今日は準備の日ニャ。'),
    am('……何の準備だ？'),
    ac('shy','明日から頑張るために、今日は休む準備ニャ。'),
    an('モクは満足そうに寝転がった。テーブルにはストロング缶。灰皿にはおびただしい吸い殻。大家は部屋を見渡し、小さくため息をついた。'),
    am('……まぁ、家賃さえ払ってくれりゃいいか。'),
    ...(attempt===2?[an('同じ声。同じ灰皿。同じ「明日から」。焼けた廊下を覚えているのは、大家だけだった。')]:[])
  ];
  saveStoryCheckpoint(s,'ash','物語の開始時点');
  return s;
}
export function nextActOneAt(s){
  const at=Object.entries(ACT_ONE_EVENTS).find(([id])=>!s.actOne.completed.includes(id))?.[1].at??57;
  const moku=s.residents.find(r=>r.type==='cat');
  return s.hour>=at-.5?Math.max(at,moku?.journey?.endsAt||0):at;
}
function advanceFirstActLife(s,hours){
  const end=s.hour+hours;
  firstActLife(s);
  while(s.hour<end){
    const next=Math.min(end,(Math.floor(s.hour*4+1e-7)+1)/4);
    const delta=next-s.hour;
    advance(s,delta);firstActLife(s,delta);
  }
}
export function advanceActOne(s,hours){
  const a=s.actOne;if(!a?.started||a.status!=='playing'||a.pending||!Number.isFinite(hours)||hours<=0)return;
  firstActLife(s);
  const at=nextActOneAt(s),end=Math.min(s.hour+hours,at);
  advanceFirstActLife(s,Math.max(0,end-s.hour));
  // Admission is the reward, never a resident during the act.
  s.pending=null;s.management.pending=null;s.management.queue=[];
  if(s.hour<at||s.residents.find(r=>r.type==='cat')?.journey?.endsAt>s.hour)return;
  const id=Object.keys(ACT_ONE_EVENTS).find(id=>!a.completed.includes(id));
  if(id){
    const moku=s.residents[0];moku.journey=null;moku.targetRoom=null;moku.action=id==='ash'?'smoke':'eat';moku.actionAge=0;
    const c=ACT_ONE_EVENTS[id],e=addEvent(s,'trouble',c.title,c.detail,[101],'大家の返事を待っています。');
    e.actScene=id;e.cast=['cat'];e.stageOnly=true;e.lines=c.lines.map(l=>({...l}));
    a.pending={scene:id,eventId:e.id};
  }else{
    a.status='clear';s.pending=null;
    const moku=s.residents.find(r=>r.type==='cat');if(moku){delete moku.storyUntil;delete moku.lifeBeat;}
    a.epilogueSeen=false;
    const epilogue=addEvent(s,'life','第一幕 エピローグ「燃えなかった朝」','3日目9時。燃えなかった朝、101号室で。',[101]);
    epilogue.actScene='epilogue';epilogue.cast=['cat'];epilogue.stageOnly=true;
    epilogue.lines=[
      an("三日目の朝。けもの荘は、今日も無事に建っていた。焼け焦げた壁も、煙を上げる屋根もない。ただ、101号室からは相変わらずタバコの煙が漏れている。"),
      am("……生き残った。"),
      ac('neutral',"ニャ？ 誰がニャ？"),
      am("このアパートだよ！"),
      ac('neutral',"変な大家ニャ。アパートは生き物じゃないニャ。"),
      am("お前がそれ言うな！"),
      an("モクはいつものように寝転がり、ストロング缶を開ける。プシュッ。"),
      am("……朝9時だぞ。"),
      ac('neutral',"知ってるニャ。時計くらい読めるニャ。"),
      am("じゃあなんで酒飲んでんだよ！"),
      ac('neutral',"昨日の夜から起きてるから、まだ昨日ニャ。"),
      am("そういう問題じゃねぇ！！"),
      ac('neutral',"大家、最近ずっとピリピリしてるニャ。"),
      am("誰のせいだと思ってんだ……。"),
      ac('neutral',"更年期かニャ？"),
      am("ぶっ飛ばすぞ！！"),
      an("大家は怒鳴りかけて、ふと口を閉じた。何度も燃えた廊下。何度も繰り返した、あの時間。それでも今、目の前にはいつも通りのモクがいる。"),
      ({...am("……まぁ、いいか。"),innerVoice:true}),
      ({...am("こいつがこうしてバカなこと言ってられるなら。"),innerVoice:true}),
      ac('neutral',"大家、なんか笑ってるニャ。"),
      am("笑ってねぇよ。"),
      ac('neutral',"気持ち悪いニャ。"),
      am("せっかくいい気分だったのに台無しだよ！"),
      an("そのとき、外から声が聞こえてきた。"),
      an("配達員（外からの声）「郵便でーす！」"),
      am("ん？ 郵便？"),
      ac('neutral',"大家、呼んでるニャ。"),
      am("わかったよ。ちょっと行ってくる。"),
      an("大家は101号室を出て、アパートの入り口へ向かった。配達員から封筒を受け取る。"),
      am("どうもー。"),
      an("封筒には「入居申込書在中」の文字。"),
      am("……入居申込書？"),
      am("こんなボロアパートに？"),
      an("大家は封筒を持って101号室へ戻った。"),
      ac('neutral',"なんだったニャ？"),
      am("入居希望者だってさ。"),
      ac('neutral',"……正気かニャ？"),
      am("お前が住んでんだろ！！"),
      ac('neutral',"モクはもう手遅れニャ。"),
      am("自覚あったのかよ！"),
      an("大家が封筒を開けると、中には一枚の入居申込書が入っていた。"),
      am("……入居希望者か。"),
      ac('neutral',"新しい住人が来るニャ？"),
      am("ああ。どうやら、ここに住みたい奴がいるらしい。"),
      ac('neutral',"静かな人がいいニャ。"),
      am("お前が一番うるせぇよ。"),
      ac('neutral',"タバコ吸っても怒らない人がいいニャ。"),
      am("もっと無理だろ！"),
      ({...am("……頼むから、まともな奴であってくれ。"),innerVoice:true}),
      ac('neutral',"大家。歓迎会するニャ？"),
      am("お、珍しくまともなこと言うじゃねぇか。"),
      ac('neutral',"酒代は大家持ちで。"),
      am("やっぱりお前は黙ってろ！！"),
      an("こうして、けもの荘の最初の三日間は幕を閉じた。燃えるはずだったアパートは、今日も変わらずそこにある。"),
      an("大家が手元の入居申込書に目を落とした、そのときだった。不意に、激しい眩暈が襲う。"),
      ({...am("……っ！？"),emotion:'surprised'}),
      ({...an("視界が大きく揺れる。次の瞬間、目の前が真っ白になり、周囲の音が消えた。"),flashbackEffect:'whiteout'}),
      ({...actLine('mystery','neutral',"……証拠は全部、燃やしてしまえ。"),flashbackEffect:'whiteout'}),
      ({...am("……誰だ？ 今の声……。"),flashbackEffect:'whiteout'}),
      an("白い光が消え、101号室の景色が戻ってくる。"),
      ac('neutral',"大家、何ぼーっとしてるニャ？"),
      am("……いや、なんでもねぇ。"),
      ac('neutral',"じゃあ酒買ってきてニャ。"),
      am("お前はそればっかりか！！"),
      an("大家は小さく息を吐き、もう一度、手元の入居申込書に目を落とした。"),
      an("だが、大家はまだ知らない。この一枚の申込書が、けもの荘に新たな騒動を呼び込むことを——。"),
    ];
    s.ending={name:'第一幕クリア — 燃えなかった朝',text:'けもの荘は、今日も燃えずに済んだ。'};
  }
}
export function answerActOne(s,eventId,choiceId){
  const a=s.actOne,p=a?.pending,c=ACT_ONE_EVENTS[p?.scene];
  const choice=getActOneChoices(s,p?.scene).find(x=>x.id===choiceId);
  if(a?.status!=='playing'||p?.eventId!==Number(eventId)||!choice)return null;
  const original=s.events.find(e=>e.id===p.eventId);original.read=true;original.actChoice=choiceId;
  a.chosenChoices=actOneChosenChoices(s);
  a.pending=null;a.completed.push(p.scene);
  const result=addEvent(s,'life','返事：'+choice.label,choice.lines[0].text,[101]);
  result.actScene='reply';result.cast=['cat'];result.stageOnly=true;result.lines=choice.lines.map(l=>({...l}));
  if(choice.bad){
    a.status='bad';a.failure=choice.bad;
    if(!a.memory.includes(choice.bad))a.memory.push(choice.bad);
    s.ending={name:'全焼 — '+c.title,text:choice.regret};
  }
  if(!choice.bad&&p.scene==='ash')saveStoryCheckpoint(s,'dinner','灰皿の火事を回避した直後');
  return result;
}
export function rewindBeforeFire(s){
  if(s.actOne?.status!=='bad')return null;
  const scene=Object.keys(ACT_ONE_EVENTS).find(id=>ACT_ONE_EVENTS[id].choices.some(c=>c.bad===s.actOne.failure))||'ash';
  let next;
  if(s.actOne.rollbackPoint?.kind==='story'&&s.actOne.rollbackPoint.scene===scene){
    next=JSON.parse(JSON.stringify(s.actOne.rollbackPoint.state));
  }else{
    // Older saves lack a checkpoint. Rebuild the completed decisions deterministically.
    next=createActOne(s.actOne.seed,[],s.actOne.attempt,true);
    for(const id of Object.keys(ACT_ONE_EVENTS)){
      if(id===scene)break;
      advanceActOne(next,ACT_ONE_EVENTS[id].at-next.hour);
      const recorded=s.events.find(e=>e.actScene===id&&e.actChoice)?.actChoice;
      const safe=ACT_ONE_EVENTS[id].choices.find(c=>!c.bad);
      answerActOne(next,next.actOne.pending.eventId,recorded||safe.id);
    }

  }
  if(s.actOne.rollbackPoint?.kind==='story')next.actOne.rollbackPoint=JSON.parse(JSON.stringify(s.actOne.rollbackPoint));
  next.actOne.attempt=s.actOne.attempt+1;
  next.actOne.memory=[...s.actOne.memory];
  next.actOne.chosenChoices=actOneChosenChoices(s);
  next.actOne.started=true;next.actOne.status='playing';next.actOne.pending=null;
  next.actOne.rewindIntroPending=false;next.actOne.rewindTitlePending=false;
  next.ending=null;next.pending=null;
  next.events.forEach(e=>e.read=true);
  const firstLoop=s.actOne.attempt===1;
  const intro=addEvent(next,'life',firstLoop?'初めての巻き戻し':'また、火事の前へ',
    firstLoop?'焼け落ちたはずの101号室が、何事もなかったように戻っている。':'また時間が戻った。'+storyCheckpointTarget(s).label+'だ。',[101]);
  intro.actScene='rewind';intro.cast=['cat'];intro.stageOnly=true;intro.read=false;
  intro.lines=firstLoop?[
    an('火の音が消える。気づけば101号室。さっきまで燃えていた壁も、モクも、元のままだ。'),
    ac('neutral','大家？ どうしたニャ？'),
    {...am('……は？ ここ、燃えたはずだろ！？'),emotion:'surprised'},
    ac('surprised','何言ってるニャ？ まだ何も燃えてないニャ。'),
    {...am('夢じゃねぇ……あの熱さも覚えてる。'),innerVoice:true},
    an('時計は1日目17時。この家での暮らしが始まった時刻を示していた。'),
    {...am('戻ったのか……？ 今度こそ、あんな目には遭わせねぇ。'),innerVoice:true},
    ac('tired','大家、顔色悪いニャ。'),
    am('……気にすんな。今度はちゃんと話を聞く。')
  ]:[
    an('炎の音が遠ざかる。見慣れた101号室。'+storyCheckpointTarget(s).label+'に戻っていた。'),
    {...am('……また戻った。今度こそ大丈夫だと思ったのに。'),innerVoice:true},
    ac('neutral','大家？ 何かあったニャ？'),
    am('いや。今度こそ、このアパートを燃やさせねぇ。'),
    ac('surprised','ニャ！？ 急にどうしたニャ？'),
    {...am('同じ失敗はもうしねぇ。次こそは……！'),innerVoice:true}
  ];
  next.actOne.rewindIntroPending=true;
  next.actOne.rewindIntroCursor=0;
  return next;
}
export function rewindActOne(s){
  const next=createActOne(s.actOne.seed,s.actOne.memory,s.actOne.attempt+1,true,actOneChosenChoices(s));
  const opening=next.events[0];opening.actScene='rewind';
  if(next.actOne.attempt<3){
    opening.title='夕暮れの101号室';
    opening.detail='夕暮れの101号室。先ほどまで炎に包まれていた部屋が、何事もなかったように元に戻っている。';
    opening.lines=[
      an(opening.detail),ac('neutral','新しい大家？ モクですニャ。よろしくニャ。'),
      {...am('…………は？'),emotion:'surprised'},ac('surprised','……ニャ？'),
      {...am('お、お前……生きてるのか！？'),emotion:'surprised'},ac('surprised','えっ！？ 勝手に殺さないでニャ！？'),
      am('いや、だって……ここ、燃えて……！'),
      an('大家は部屋を見渡す。焦げ跡ひとつない壁。いつものストロング缶。山盛りの吸い殻。そして、目の前でタバコを吸うモク。'),
      {...am('……夢？'),innerVoice:true},{...am('いや、違う。あの熱さも、煙の臭いも……。'),innerVoice:true},{...am('全部、覚えてる。'),innerVoice:true},
      ac('tired','大家？ 顔色悪いニャ。'),am('……お前、さっき灰皿どうした？'),ac('surprised','灰皿？ そこにあるニャ。'),am('いや、そうじゃなくて……！'),
      an('大家は言葉を飲み込んだ。まだ、灰皿はいっぱいになっていない。時計を見る。'),an('1日目 17:00。'),
      {...am('……時間が、戻ってる？'),innerVoice:true},{...am('あのとき俺が、まともな指示を出していれば……。'),innerVoice:true},{...am('今度こそ……。'),innerVoice:true},
      ac('neutral','大家？'),am('……いや、なんでもない。'),am('とりあえず……生きててよかった。'),ac('shy','ニャ？ なんか知らんけど、ありがとニャ。'),
      an('モクは何事もなかったようにタバコを吸い始める。大家はその様子を黙って見つめていた。'),
      {...am('……もう二度と、あんな光景は見たくねぇ。'),innerVoice:true}
    ];
  }
  next.actOne.rewindIntroPending=true;next.actOne.rewindIntroCursor=0;
  return next;
}
export function validActOne(s){
  const a=s?.actOne;
  if(a?.chapter===2){
    if(a.version!==1||!Number.isInteger(a.attempt)||a.attempt<1||!Number.isInteger(a.seed)||!Array.isArray(a.memory)||!Array.isArray(a.completed)||!['playing','bad','clear'].includes(a.status))return false;
    const scenes={bag:{at:62},contract:{at:81}},failures=['bag-guarantee','bag-loan','bag-return','contract-sign','contract-stamp'];
    const chosen=['bag:guarantee','bag:loan','bag:return','contract:sign','contract:stamp','contract:refuse'];
    if(!Array.isArray(a.chosenChoices)||a.chosenChoices.some(x=>!chosen.includes(x))||a.memory.some(x=>!failures.includes(x))||a.completed.some(x=>!Object.hasOwn(scenes,x)))return false;
    if(s.hour<57||s.hour>105||s.residents.length!==2||!s.residents.some(r=>r.type==='hostess'))return false;
    if(a.pending!==null&&(!scenes[a.pending?.scene]||!s.events.some(e=>e.id===a.pending.eventId&&e.actScene===a.pending.scene)))return false;
    if(a.rollbackPoint!==undefined){const p=a.rollbackPoint,saved=p?.state;if(!scenes[p?.scene]||(p.kind==='story'?!validStoryCheckpoint(p,2):saved?.hour!==scenes[p.scene].at-.5)||saved?.actOne?.rollbackPoint!==undefined||saved?.actOne?.pending!==null||saved?.actOne?.status!=='playing'||!validateSave(saved)||!validActOne(saved))return false;}
    return a.status==='playing'?!s.ending:a.status==='clear'?s.hour===105&&a.completed.length===2&&!!s.ending:failures.includes(a.failure)&&!!s.ending;
  }if(!a||a.version!==1||typeof a.started!=='boolean'||!Number.isInteger(a.attempt)||a.attempt<1||!Number.isInteger(a.seed)||!Array.isArray(a.memory)||!Array.isArray(a.completed)||!['playing','bad','clear'].includes(a.status))return false;
  if(a.rollbackPoint!==undefined){
    const point=a.rollbackPoint,event=(a.chapter===2?{'bag':{at:62},'contract':{at:81}}:ACT_ONE_EVENTS)[point?.scene],saved=point?.state;
    if(!event||saved?.actOne?.rollbackPoint!==undefined||(point.kind==='story'?!validStoryCheckpoint(point,1):saved?.hour!==event.at-.5)||saved?.actOne?.pending!==null||saved?.actOne?.status!=='playing'||!validateSave(saved)||!validActOne(saved))return false;
  }
  const failures=[...Object.values(ACT_ONE_EVENTS).flatMap(e=>e.choices.map(c=>c.bad).filter(Boolean)),'ash-laundry','ash-wind'];
  if(a.chosenChoices!==undefined){
    const known=Object.entries(ACT_ONE_EVENTS).flatMap(([scene,e])=>e.choices.map(c=>`${scene}:${c.id}`));
    if(!Array.isArray(a.chosenChoices)||a.chosenChoices.some(key=>!known.includes(key))||new Set(a.chosenChoices).size!==a.chosenChoices.length)return false;
  }
  if(a.memory.some(x=>!failures.includes(x))||new Set(a.memory).size!==a.memory.length||a.completed.some(x=>!Object.hasOwn(ACT_ONE_EVENTS,x))||new Set(a.completed).size!==a.completed.length)return false;
  if(s.hour<17||s.hour>57||s.residents.length!==1||s.residents[0].type!=='cat')return false;
  if(a.pending!==null&&(!Object.hasOwn(ACT_ONE_EVENTS,a.pending?.scene)||!s.events.some(e=>e.id===a.pending.eventId&&e.actScene===a.pending.scene)||a.completed.includes(a.pending.scene)))return false;
  return a.status==='playing'?!s.ending:a.status==='clear'?s.hour===57&&a.completed.length===2&&!!s.ending:failures.includes(a.failure)&&!!s.ending;
}

import {createGame,advance,addEvent} from './simulation.js';

export const ACT_ONE_TITLE='アパートを火事（モク）から守れ！';
const actLine=(speaker,emotion,text)=>({speaker,emotion,text});
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
    ac('tired','めんどくさいから、大家さんが決めてニャ。'),
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
      ac('surprised','えっ！？ 大家さん、お酒飲んでいいニャ！？'),
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

export function createActOne(seed=Date.now(),memory=[],attempt=1,started=false){
  const s=createGame(seed);
  s.events=[];s.nextId=1;s.residents[0].history=[];s.heard=[];
  s.actOne={version:1,started,attempt,memory:[...memory],status:'playing',completed:[],pending:null,seed:s.seed};
  const e=addEvent(s,'life','1日目17時。101号室の新しい大家。','築38年の古びたアパート「けもの荘」。夕暮れの101号室。窓から大量の煙が漂っている。',[101]);
  e.actScene='opening';e.cast=['cat'];e.stageOnly=true;
  e.lines=attempt>=3?[
    an('1日目17時。見覚えのある101号室。何事もなかったように、また煙が漂っている。'),
    ac('neutral','新しい大家さん？ モクですニャ。よろしくニャ。'),
    am('……ああ、知ってるよ。嫌ってほどな。'),
    ac('surprised','ニャ？ 初めて会ったはずニャ。'),
    am('こっちは何回も会ってんだよ……。'),
    ac('tired','……大家さん、変な人ニャ。'),
    an('また最初からか……。今度こそ、このボロアパートを守ってやる。')
  ]:[
    an('築38年の古びたアパート「けもの荘」。夕暮れの101号室。窓から大量の煙が漂っている。'),
    ac('neutral','新しい大家さん？ モクですニャ。よろしくニャ。'),
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
  return s;
}
export function nextActOneAt(s){return Object.entries(ACT_ONE_EVENTS).find(([id])=>!s.actOne.completed.includes(id))?.[1].at??57;}
export function advanceActOne(s,hours){
  const a=s.actOne;if(!a?.started||a.status!=='playing'||a.pending||!Number.isFinite(hours)||hours<=0)return;
  const at=nextActOneAt(s),end=Math.min(s.hour+hours,at);
  advance(s,Math.max(0,end-s.hour));
  // Admission is the reward, never a resident during the act.
  s.pending=null;s.management.pending=null;s.management.queue=[];
  if(s.hour<at)return;
  const id=Object.keys(ACT_ONE_EVENTS).find(id=>!a.completed.includes(id));
  if(id){
    const moku=s.residents[0];moku.journey=null;moku.targetRoom=null;moku.action=id==='ash'?'smoke':'eat';moku.actionAge=0;
    const c=ACT_ONE_EVENTS[id],e=addEvent(s,'trouble',c.title,c.detail,[101],'大家の返事を待っています。');
    e.actScene=id;e.cast=['cat'];e.stageOnly=true;e.lines=c.lines.map(l=>({...l}));
    a.pending={scene:id,eventId:e.id};
  }else{
    a.status='clear';s.pending=['hostess','fox'];
    s.ending={name:'第一幕クリア — この家は、まだここにある。',text:'3日目9時。玄関の封筒は、焼けずに届いた。モクは欠伸をしながら「新しい人、来るニャ？」と聞く。大家は答える前に、無事な天井を一度だけ見た。'};
  }
}
export function answerActOne(s,eventId,choiceId){
  const a=s.actOne,p=a?.pending,c=ACT_ONE_EVENTS[p?.scene];
  const choice=getActOneChoices(s,p?.scene).find(x=>x.id===choiceId);
  if(a?.status!=='playing'||p?.eventId!==Number(eventId)||!choice)return null;
  const original=s.events.find(e=>e.id===p.eventId);original.read=true;original.actChoice=choiceId;
  a.pending=null;a.completed.push(p.scene);
  const result=addEvent(s,'life','返事：'+choice.label,choice.lines[0].text,[101]);
  result.actScene='reply';result.cast=['cat'];result.stageOnly=true;result.lines=choice.lines.map(l=>({...l}));
  if(choice.bad){
    a.status='bad';a.failure=choice.bad;
    if(!a.memory.includes(choice.bad))a.memory.push(choice.bad);
    s.ending={name:'全焼 — '+c.title,text:choice.regret};
  }
  return result;
}
export function rewindActOne(s){return createActOne(s.actOne.seed,s.actOne.memory,s.actOne.attempt+1,true);}
export function validActOne(s){
  const a=s?.actOne;if(!a||a.version!==1||typeof a.started!=='boolean'||!Number.isInteger(a.attempt)||a.attempt<1||!Number.isInteger(a.seed)||!Array.isArray(a.memory)||!Array.isArray(a.completed)||!['playing','bad','clear'].includes(a.status))return false;
  const failures=[...Object.values(ACT_ONE_EVENTS).flatMap(e=>e.choices.map(c=>c.bad).filter(Boolean)),'ash-laundry','ash-wind'];
  if(a.memory.some(x=>!failures.includes(x))||new Set(a.memory).size!==a.memory.length||a.completed.some(x=>!Object.hasOwn(ACT_ONE_EVENTS,x))||new Set(a.completed).size!==a.completed.length)return false;
  if(s.hour<17||s.hour>57||s.residents.length!==1||s.residents[0].type!=='cat')return false;
  if(a.pending!==null&&(!Object.hasOwn(ACT_ONE_EVENTS,a.pending?.scene)||!s.events.some(e=>e.id===a.pending.eventId&&e.actScene===a.pending.scene)||a.completed.includes(a.pending.scene)))return false;
  return a.status==='playing'?!s.ending:a.status==='clear'?s.hour===57&&a.completed.length===2&&!!s.ending:failures.includes(a.failure)&&!!s.ending;
}

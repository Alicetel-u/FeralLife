import {createGame,advance,addEvent} from './simulation.js';

export const ACT_ONE_TITLE='アパートを火事（モク）から守れ！';
const actLine=(speaker,emotion,text)=>({speaker,emotion,text});
const ac=(emotion,text)=>actLine('cat',emotion,text);
const am=text=>actLine('manager','neutral',text);
const an=text=>actLine('narrator','neutral',text);
export const ACT_ONE_EVENTS={
  ash:{at:19,title:'第一の火種：灰皿にも人権を',call:'灰皿がもう限界ニャ！',detail:'1日目19時。モクの部屋は、夕飯の匂いより煙が濃い。山盛りの灰皿の隣に、紙袋と洗濯物。「片づけるつもり」という言葉だけが、いつも綺麗に並んでいる。',lines:[
    ac('tired','大家さん。灰皿、いっぱいニャ。いま捨てたら、ちゃんと片づけたことになるニャ？'),am('一本も床に落とさず積んだのか。才能の使い道が狭いな。'),ac('angry','褒めるか怒るか、どっちかにしてニャ。……袋にまとめたら早いかなニャ。'),an('モクが紙袋へ手を伸ばす。灰皿の底には、消したつもりの一本。触れた指を引っ込めて、モクは耳を伏せた。'),ac('surprised','……あ、まだ熱いニャ。袋は後かニャ。'),am('面倒な灰皿だ。わしが画期的な方針を決めてやろう。'),ac('sad','画期的じゃなくてもいいニャ。私、ここ気に入ってるから、部屋なくなるのは嫌ニャ。')],choices:[
    {id:'laundry',label:'吸い殻を洗濯物の里子に出す',bad:'ash-laundry',lines:[am('洗濯物が柔らかい。吸い殻をそっちへ里子に出せ。灰皿も独り立ちだ。'),an('モクの手が止まった。紙袋を抱いたまま、大家との間に半歩の距離を作る。'),ac('surprised','……里子？ タバコの親、洗濯物ニャ？'),am('包んでおけば見えん。片づけは見た目が九割。'),ac('angry','残り一割で死にそうなこと言ってるニャ。'),an('それでもモクは、大家の指示なら大丈夫だと思ってしまった。見えなくなった熱が、少しずつ布へ移る。'),ac('sad','……焦げ臭いニャ。さっきより、変な匂いニャ。'),an('「ちゃんと片づけた」部屋から煙が上がった。大家は、見えない物ほど危ないという当たり前を、燃える廊下で思い出した。')],regret:'見た目が九割。残りの一割が、建物を全部持っていった。',clue:'見えなくしても、熱はなくならない。モクが「まだ熱い」と言っていた。'},
    {id:'landlord',label:'灰皿を101号室の臨時大家に任命する',lines:[am('灰皿を臨時大家に任命する。役職付きなら、布の上ではなく専用の金属トレーへ引っ越しだ。'),an('モクが真顔になった。灰皿を見る。大家を見る。もう一度、灰皿を見る。'),ac('surprised','……私、灰皿に家賃払うニャ？'),am('まずは消えたか確認して、冷めるまで袋には入れん。灰皿の仕事場は散らかった机から離して固定する。役職は重い。'),ac('tired','途中から普通のこと言ってるのに、肩書きだけ全部邪魔ニャ。'),an('モクは文句を言いながら、安定した専用の置き場へ灰皿を動かした。周りの紙と布も遠ざける。'),ac('neutral','……まあ、ここなら物がぶつからないニャ。袋に捨てるのは冷めてからにするニャ。'),am('わしより仕事のできる大家になったな。'),ac('tired','初日に抜かれてるニャ。……でも、熱いって言ったの、聞いてくれたのは助かったニャ。')],clue:'肩書きは意味不明。でも灰皿の置き場と、熱いまま捨てない約束は残った。'},
    {id:'wind',label:'煙に退去命令！ 扇風機で強制執行',bad:'ash-wind',lines:[am('煙は家賃を払ってない。扇風機で強制退去だ。散らかった机ごと風に任せろ。'),an('モクは扇風機ではなく、大家を先に見た。期待していた説明は、待っても増えなかった。'),ac('surprised','……煙に家賃って、どう請求するニャ。'),am('払えないなら出ていけ。簡単だ。'),ac('angry','灰皿も紙もあるニャ。片づける前に風、当てていいニャ？'),am('風が片づける。わしの発明だ。'),an('大家が風を起こした。紙が舞い、灰皿が傾く。煙だけを追い出すつもりが、火種まで部屋へ招いてしまった。'),ac('sad','大家さん！ 退去するの、煙じゃなくて私たちニャ！')],regret:'煙を追い出したかった。それより先に、住む場所がなくなった。',clue:'灰皿の隣には紙と布。先に動かすべきは、空気ではなく物だった。'}
  ]},
  dinner:{at:37,title:'第二の火種：夕飯王、即位',call:'夕飯中に寝そうニャ！',detail:'2日目13時。モクは昨夜、動画を見て夜更かしした。いまは空腹と眠気が同時に襲っている。コンロの前でフライパンを出しかけて、欠伸を一つ。「夕飯の準備を先に」と言う目は、半分閉じていた。',lines:[
    ac('tired','いま夕飯まで作れば、あとは寝るだけニャ。昨日ちょっと、動画見すぎたニャ。'),am('ちょっと、とは何時間だ。'),ac('shy','次の一本だけ、を……何本かニャ。動画って続くようにできてるニャ。'),an('欠伸のたびに、手が止まる。使うつもりのフライパンだけが、コンロの上で先に待っていた。'),ac('sad','ちゃんとご飯作らないと、ネムにまた心配されるニャ。手抜きって言われるのも嫌ニャ。'),am('妹の前で見栄を張って、家まで消す必要はなかろう。'),ac('surprised','家まで？ 大げさニャ。……寝ないで済む妙案、あるニャ？')],choices:[
    {id:'coronation',label:'カップ麺を夕飯の王にして、コンロを失職させる',lines:[am('今夜の王はカップ麺だ。コンロは失職。フライパンは王の即位式に呼ばれてないから片づけろ。'),an('モクは返事をしなかった。カップ麺を手に取り、書いてある商品名と大家の顔を見比べた。'),ac('surprised','……これ、王族だったニャ？'),am('今日は火を使う料理をやめよう。湯は自動で切れる電気ケトルで、起きている間に用意。食べてから寝ればいい。'),ac('tired','肩書き以外、まともニャ。昨日の灰皿と同じ手口ニャ。'),an('コンロの火を使わず、道具も片づけた。モクは大家と湯の準備を確認してから、椅子へ座る。'),ac('sad','……これでも、ちゃんとご飯食べたって言っていいニャ？'),am('王を食べたと報告しろ。妹も驚く。'),ac('angry','ネムに通報されるのは大家さんニャ。'),an('モクはネムに「今日は眠いから簡単にした」と送った。返事は「食べてから寝て」。姉の耳が、ようやく少し上がった。'),ac('shy','……助かったニャ。コンロも、今日は有休ってことにしとくニャ。')],clue:'立派な料理より、眠い日に無理をしないこと。変な王様が火を使う予定を消した。'},
    {id:'turbo',label:'夕飯を早送り！ 火力に残業させる',bad:'dinner-turbo',lines:[am('火力に残業させれば早く済む。起きてるうちに一気に夕飯だ。'),an('モクは欠伸を途中で止めた。呆れた目だけは、今朝いちばん開いていた。'),ac('surprised','……料理に早送りボタン、ついてないニャ。'),am('わしの人生にはある。気合で済ませろ。'),ac('angry','気合がないから眠いって相談してるニャ！'),an('それでもモクは、ちゃんと作れと言われた気がした。火を使い始めてから「一分だけ」と椅子へ座る。'),ac('tired','……一分なら、起きてられるニャ。'),an('一分のつもりの眠りは、一分では終わらなかった。目を開けた時、大家が早送りしたのは夕飯ではなく、この建物の最後だった。')],regret:'急がせれば大丈夫だと思った。眠いという返事を、急いで聞き流した。',clue:'欠伸も「手が止まる」描写も警告だった。時間短縮では眠気は消えない。'},
    {id:'show',label:'大家の独演会で、まぶたに根性を叩き込む',bad:'dinner-show',lines:[am('わしが昔話をしてやる。笑えば目が覚める。若い頃の武勇伝からいこう。'),an('モクが椅子を引いた。大家へ近づくためではなく、逃げ道を作るためだった。'),ac('tired','……眠い時に昔話。嫌がらせの種類、増えてないニャ？'),am('第一章「わしが遅刻しなかった日」だ。'),ac('surprised','そんな日が章になるほど珍しいニャ？'),am('続いて第二章。理由を話すと長いぞ。'),an('モクは相槌を打ちながら料理を始めた。やがて相槌がなくなる。大家だけが、それを夢中で聞いている証拠だと思った。'),ac('tired','……ニャ……。'),an('大家が第三章を話す頃には、モクは眠っていた。異変に気づくには、自分の話が面白いという思い込みを、先に消す必要があった。')],regret:'起こしているつもりだった。黙った理由を、最後まで聞こうとしなかった。',clue:'話しかけるだけでは、火の見張りにならない。眠い日は料理そのものを変える。'}
  ]}
};

export function createActOne(seed=Date.now(),memory=[],attempt=1,started=false){
  const s=createGame(seed);
  s.events=[];s.nextId=1;s.residents[0].history=[];s.heard=[];
  s.actOne={version:1,started,attempt,memory:[...memory],status:'playing',completed:[],pending:null,seed:s.seed};
  const e=addEvent(s,'life','1日目17時。101号室の新しい大家。','築38年の古びたアパート「けもの荘」。夕暮れの101号室。窓から大量の煙が漂っている。',[101]);
  e.actScene='opening';e.cast=['cat'];e.stageOnly=true;
  e.lines=[
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
    ...(attempt>1?[an('同じ声。同じ灰皿。同じ「明日から」。焼けた廊下を覚えているのは、大家だけだった。')]:[])
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
  const choice=c?.choices.find(x=>x.id===choiceId);
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
  const failures=Object.values(ACT_ONE_EVENTS).flatMap(e=>e.choices.map(c=>c.bad).filter(Boolean));
  if(a.memory.some(x=>!failures.includes(x))||new Set(a.memory).size!==a.memory.length||a.completed.some(x=>!Object.hasOwn(ACT_ONE_EVENTS,x))||new Set(a.completed).size!==a.completed.length)return false;
  if(s.hour<17||s.hour>57||s.residents.length!==1||s.residents[0].type!=='cat')return false;
  if(a.pending!==null&&(!Object.hasOwn(ACT_ONE_EVENTS,a.pending?.scene)||!s.events.some(e=>e.id===a.pending.eventId&&e.actScene===a.pending.scene)||a.completed.includes(a.pending.scene)))return false;
  return a.status==='playing'?!s.ending:a.status==='clear'?s.hour===57&&a.completed.length===2&&!!s.ending:failures.includes(a.failure)&&!!s.ending;
}

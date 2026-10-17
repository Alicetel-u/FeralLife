import { saveStoryCheckpoint, storyCheckpointTarget } from './story-checkpoints.js';
import { createActOne,advanceActOne,answerActOne } from './act-one.js';
import {advance,addEvent,admit} from './simulation.js';
import { actExpression } from './act-expressions.js';
import { secondActLife } from './act-two-life.js';
const n=text=>({speaker:'narrator',emotion:'neutral',text});
const m=text=>({speaker:'manager',emotion:'neutral',text});
const l=(emotion,text)=>({speaker:'hostess',emotion:actExpression('hostess',text,emotion),text});
const c=(emotion,text)=>({speaker:'cat',emotion:actExpression('cat',text,emotion),text});
export const ACT_TWO_TITLE='第二幕「アパートを借金（ルナ）から守れ！」';
export const ACT_TWO_EVENTS={
  bag:{at:62,title:'第一の事件：夜の待ち伏せ',call:'ルナを探す男にどう対応する？',detail:'3日目14時。けもの荘の前を、不審な男が何度も行き来している。',lines:[
    n('昼下がり、けもの荘の向かい。電柱の陰に隠れるように、スーツ姿ではない中年の男が立っていた。'),
    n('男は102号室の窓を見上げては、スマートフォンを確認している。'),
    c('neutral','さっきから同じおじさんがいるニャ。散歩が趣味ニャ？'),
    m('同じ場所を往復する散歩があるか。'),
    n('男は大家に気づき、急に愛想笑いを浮かべた。'),
    n('男「ねえ、ここに金城ルナって女の子、住んでるでしょ？」'),
    m('何の用だ？'),
    n('男「俺はあの子の常連でね。店の人に頼まれて探してるんだよ。」'),
    n('男「ルナちゃん、店の金を持って逃げたらしいんだ！」'),
    c('surprised','お金持ちニャ！？'),
    m('話が飛びすぎだ。本人に確認するまで何も教えられねぇよ。'),
    n('ちょうど玄関から出てきたルナが男の顔を見て、足を止めた。'),
    l('surprised','……どうして、ここが……。'),
    n('男「ルナちゃん！ 俺のことまで避けるなんてひどいよ！」'),
    l('sad','……大家さん。その人と話さないで。'),
    m('……さて、どうする？')
  ],choices:[
    {id:'guarantee',label:'知り合いなら話し合え！ ルナを呼び出す',bad:'bag-guarantee',regret:'ルナは夜逃げした。店の連中に押し切られ、けもの荘を手放すことになった。',clue:'住人の事情を確かめず、追ってきた男に住所と接触の機会を渡してしまった。',lines:[
      m('知り合いなら話し合え！ ルナを呼び出す。'),n('男は笑みを深め、部屋番号と大家の名前を執拗に聞き出した。'),
      l('sad','……どうして、その人を入れたの？'),m('話し合えば済むと思ったんだよ！'),
      n('その夜、ルナは一言も告げずに102号室から姿を消した。'),
      n('数日後、店の関係者が「ルナの債務の保証について話がついている」と主張する書類を持って現れた。'),
      n('大家は否定したが、男が集めた個人情報を利用した偽造書類と金銭請求への対応が長期化した。'),
      n('店側の不正な取り立てに巻き込まれ、訴訟対応費用と維持費が重なって資金繰りは限界に達する。大家はけもの荘を売却するしかなかった。'),
      m('……住人を守れなかった上に、アパートまで……。'),c('tired','明日からどこで寝ればいいニャ？'),m('今それを聞くな！！')
    ]},
    {id:'loan',label:'モク、男の足止めを頼む！ その間に確認する',lines:[
      m('モク、男の足止めを頼む！ その間にルナに確認する。'),
      c('happy','任せろニャ！'),c('neutral','おじさん、モクに一杯おごってくれるニャ？'),
      m('その足止めはやめろ！！'),n('男がモクに気を取られる間に、大家はルナを建物の中へ戻した。'),
      m('あいつ、何者だ？'),l('sad','……前のお店のお客さん。何度も断ったのに、ずっと追いかけてくるの。'),
      m('店の金を盗んだって言ってたぞ。'),l('tired','……お金のことは、あたしにも責任があるから。'),
      m('それ、どういう意味だ？'),l('sad','今は……ごめん。全部は話せない。'),
      n('大家は住人の情報を渡さず、男に退去を求めた。男はしぶしぶ道を引き返す。'),
      n('男「俺は店の人間に頼まれただけなんだよ！ あの子に逃げられたら困るって！」'),
      m('……店の人間？'),n('男が落としたメモには、ある会社名と「独立支援」「精算」の文字が残っていた。'),
      c('neutral','おじさん、歩くと紙を落とすニャ。'),m('……嫌な予感がするな。')
    ]},
    {id:'return',label:'追い返せば済むだろ！ 一人で男を怒鳴りつける',bad:'bag-return',regret:'男はさらに執着し、ルナは夜逃げした。店側の金銭請求からアパートを守れなかった。',clue:'追い返すだけでは、個人情報を探る相手の行動を止められなかった。',lines:[
      m('二度と来るな！ 帰れ！'),n('男は一度立ち去ったが、暗くなると再び建物の陰に現れた。'),
      n('男は部屋の場所と郵便受けの名前を確認し、店の関係者に連絡していた。'),
      l('sad','……もう、ここにもいられない。'),n('翌朝、102号室は空になっていた。ルナは夜逃げしたのだ。'),
      n('その後、店側は虚偽の請求書と偽造された保証書類を突きつけてきた。大家は争ったが、対応費用と建物の維持費が重なり、けもの荘を売却することになった。'),
      m('追い返しただけじゃ……駄目だったのか。'),c('neutral','モクはずっと怪しいと思ってたニャ。'),m('だったら先に言え！！')
    ]}
  ]},
  contract:{at:81,title:'第二の事件：夜の店の裏事情',call:'店の関係者が持参した契約書をどうする？',detail:'4日目9時。ルナの前の店の関係者が、売上金の横領を訴えて現れた。',lines:[
    n('翌朝。スーツ姿の男が、けもの荘の玄関へやって来た。'),
    n('男「金城ルナさんはこちらですね。店の売上金について、説明していただきたい。」'),
    m('また店かよ。昨日も変な男が来たんだぞ。'),
    n('男「ルナさんが金を持ち逃げした。こちらには帳簿も送金記録もあります。」'),
    l('sad','……全部、私が盗んだことになってるんだ。'),
    m('どういう意味だ？'),
    l('tired','帳簿の数字、店が勝手に書き換えてる。女の子たちの給料から引いたお金まで、私のせいにして。'),
    n('男「証拠もないことを。ですが穏便に済ませる方法はあります。」'),
    n('男は「独立支援」と書かれた契約書を差し出した。'),
    n('男「こちらに大家さんの署名をいただければ、ルナさんの件は取り下げても構いません。」'),
    c('surprised','タダで許してくれるニャ？'),m('そんなうまい話があるか！'),
    n('契約書の隅に、小さく「不動産担保」の文字がある。'),
    m('……これ、うちのアパートを差し出す契約じゃねぇか！'),
    l('sad','大家さん……私のせいで、ごめんなさい。')
  ],choices:[
    {id:'sign',label:'ルナを信じる！ ここにサインだ！',bad:'contract-sign',regret:'親切のつもりで署名し、アパートを担保に差し出してしまった。',clue:'他人の融資に不動産を担保として差し出してはいけない。',lines:[m('ルナを信じる！ ここにサインだ！'),l('surprised','えっ、ほんとに！？'),c('happy','大家さん太っ腹ニャ。'),n('契約書に署名した瞬間、男の笑顔が消えた。'),n('数日後、ルナは突然夜逃げした。店側から返済を迫る通知と、けもの荘の差し押さえ手続きの書面が届いた。'),m('俺のアパートが……持っていかれる！？'),l('sad','ごめん……こんなはずじゃ……。')]},
    {id:'stamp',label:'ハンコだけ貸す！ あとは頼んだ！',bad:'contract-stamp',regret:'印鑑を預けたせいで、知らない契約が成立してしまった。',clue:'印鑑や署名を他人任せにしない。',lines:[m('ハンコだけ貸す！ あとは頼んだ！'),l('surprised','それ、ほんとにいいの？'),c('neutral','ハンコって押すだけで金が出るニャ？'),n('男は大家の印鑑を使い、建物を担保にする書類を仕上げた。'),n('数日後、ルナは夜逃げした。けもの荘には差し押さえ通知が届いた。'),m('ハンコ一本で家が消えるとか聞いてねぇぞ！'),l('sad','……大家さん、ごめんなさい。')]},
    {id:'refuse',label:'担保は絶対ダメだ！ 契約は持ち帰れ！',lines:[m('担保は絶対ダメだ！ 契約は持ち帰れ！'),l('surprised','でも、今日だけって……。'),m('今日しか考える時間をくれない契約なんて、なおさらダメだ！'),c('happy','じゃあモクのハンコも貸さないニャ。'),m('お前はそもそも持ってないだろ！'),n('大家は署名を拒み、昨日男が落としたメモと帳簿を照らし合わせた。売上金の数字は噛み合わず、店側が従業員への不当な請求をルナの横領に見せかけた疑いが浮かぶ。男は舌打ちして立ち去った。'),l('sad','……私が盗んだって言われても、信じないでくれたんだね。ありがとう、大家さん。'),m('次からは小さい文字ほど先に読め。')]}
  ]}
};
export const actTwoChoices=(s,scene)=>ACT_TWO_EVENTS[scene]?.choices||[];
export const actTwoChosen=s=>[...new Set([...(s.actOne.chosenChoices||[]),...s.events.filter(e=>e.actChoice&&ACT_TWO_EVENTS[e.actScene]).map(e=>e.actScene+':'+e.actChoice)])];
export function beginActTwo(s){
  s.ending=null;s.pending=['hostess'];admit(s,'hostess');s.hour=57;
  s.actOne={version:1,chapter:2,started:false,titlePending:true,attempt:1,status:'playing',completed:[],pending:null,memory:[],chosenChoices:[],seed:s.seed,prologuePending:true};
  const e=addEvent(s,'life','第二幕 プロローグ「新しい住人」','3日目の午後。けもの荘の玄関。',[102]);
  e.actScene='act2-prologue';e.cast=['hostess','cat'];e.stageOnly=true;
  e.lines=[
    n('けもの荘、3日目の午後。玄関の前に、一人の女性が立っている。大きなキャリーバッグを引き、手には入居申込書。'),
    l('happy','こんにちはー！ 今日からお世話になります、金城ルナです♡'),
    m('ああ、入居予定の人か。俺が大家だ。よろしく。'),
    l('happy','よろしくお願いします！ いや～、本当に助かりました！'),
    m('そんなに急いで引っ越したかったのか？'),
    l('surprised','えっ？'),
    n('ルナの笑顔が、一瞬だけ止まった。'),
    l('shy','……あはは！ ちょっと前の家が合わなくて！'),
    m('ふーん。まあ、うちは安さだけが取り柄だからな。'),
    c('neutral','安さ以外にも取り柄はあるニャ。'),
    m('例えば？'),
    c('happy','家賃を待ってくれるニャ。'),
    m('待たねぇよ！！'),
    l('happy','あははっ！ 面白い人たちですね！'),
    n('そのとき、ルナのスマートフォンが小さく振動した。'),
    l('surprised','……っ。'),
    n('ルナは画面を見ると、すぐに通知を消した。'),
    m('どうした？'),
    l('happy','ううん、なんでもないです！ それより、102号室ってこっちですか？'),
    m('ああ、101号室の隣だ。'),
    c('neutral','隣人のモクですニャ。よろしくニャ。'),
    l('happy','モクちゃんね！ よろしく♡'),
    c('happy','ちゃん……悪くないニャ。'),
    m('調子に乗るな。'),
    n('ルナは二人に背を向け、102号室の鍵を差し込んだ。'),
    l('sad','……ここから、やり直さなきゃ。'),
    m('ん？ 何か言ったか？'),
    l('happy','ううん！ なんでもない♡'),
    n('ルナは笑顔で部屋に入っていった。')
  ];
  saveStoryCheckpoint(s,'bag','第二幕の開始時点');
 secondActLife(s);
  return s;
}
export const nextActTwoAt=s=>Object.entries(ACT_TWO_EVENTS).find(([id])=>!s.actOne.completed.includes(id))?.[1].at??105;
export function advanceActTwo(s,hours){
 const a=s.actOne;if(!a.started||a.status!=='playing'||a.pending||a.prologuePending||hours<=0)return;
 const at=nextActTwoAt(s),end=Math.min(at,s.hour+hours);
 const scene=Object.keys(ACT_TWO_EVENTS).find(id=>!a.completed.includes(id));

 secondActLife(s);
 while(s.hour<end){const next=Math.min(end,(Math.floor(s.hour*4+1e-7)+1)/4),delta=next-s.hour;advance(s,delta);secondActLife(s,delta);}
 s.pending=null;s.management.pending=null;s.management.queue=[];
 if(s.hour<at)return;
 if(scene){const ev=ACT_TWO_EVENTS[scene],e=addEvent(s,'trouble',ev.title,ev.detail,[102]);e.actScene=scene;e.cast=['hostess','cat'];e.stageOnly=true;e.lines=ev.lines.map(x=>({...x}));a.pending={scene,eventId:e.id};}
 else{a.status='clear';a.epilogueSeen=false;const e=addEvent(s,'life','第二幕 エピローグ「残った鍵」','5日目9時。アパートは今日も大家のものだった。',[102]);e.actScene='act2-epilogue';e.cast=['hostess','cat'];e.stageOnly=true;e.lines=[
 n('5日目の朝。けもの荘の玄関には、差し押さえの貼り紙も、見知らぬ鍵もない。'),
 m('……残った。今度は建物ごと取られずに済んだ。'),
 l('shy','大家さん、あのとき止めてくれてありがとう。'),
 c('happy','燃えないし売られないし、けもの荘って頑丈ニャ。'),
 m('お前たちが何もしなけりゃな！'),
 l('happy','お礼に、今夜ご飯おごるね。'),
 m('おっ、いいじゃねぇか。'),
 l('shy','……給料日になったら。'),
 c('tired','モクも明日から働くニャ。'),
 m('お前ら、明日って言えば許されると思うなよ！！'),
 n('こうして第二幕は幕を閉じた。大家もモクも、ルナの疑惑は晴れたものと信じていた。'),
 n('大家が玄関の鍵を閉めようとした、そのときだった。ふと、昼間の契約書が頭をよぎる。'),
 ({...n('視界がぼやける。目の前が白く染まっていく。'),flashbackEffect:'whiteout'}),
 ({speaker:'mystery',emotion:'neutral',text:'お前は言われたとおりにすればいい。',flashbackEffect:'whiteout'}),
 ({...m('……でも、あの人たちは……。'),flashbackEffect:'whiteout',memoryVoice:true}),
 ({speaker:'mystery',emotion:'neutral',text:'余計なことは考えるな。',flashbackEffect:'whiteout'}),
 n('ハンコを押す乾いた音が響く。白い光が消え、玄関の景色が戻ってくる。'),
 m('……っ！？'),
 l('surprised','大家さん？ どうしたの？'),
 m('……いや。なんでもない。'),
 c('neutral','大家、酒はまだかニャ？'),
 m('今それどころじゃねぇよ！'),
 n('大家は首を振り、玄関の鍵をかけた。'),
 n('だが、静かな日々が続くかどうかは、また別の話。'),
 n('その夜。大家とモクが眠りについたあと。102号室にはルナ一人。'),
 n('ルナは鏡の前に座り、そっと引き出しの奥に手を伸ばした。'),
 n('かちり。小さく、鍵の開く音がする。中身は見えない。'),
 l('shy','……大家さん、ほんとにいい人♡'),
 n('鏡に映ったルナが、ゆっくりと口角を上げる。'),
 l('neutral','……あたし、嘘はついてないよ？'),
 l('shy','全部は、ね♡'),
 n('ルナは不敵に微笑んだ。誰も、その笑顔を見ていない。')];
 s.ending={name:'第二幕クリア — 残った鍵',text:'けもの荘は、借金のカタにならずに済んだ。'};}
}
export function answerActTwo(s,eventId,choiceId){
 const a=s.actOne,p=a.pending,event=ACT_TWO_EVENTS[p?.scene];const choice=event?.choices.find(c=>c.id===choiceId);
 if(a.status!=='playing'||p?.eventId!==Number(eventId)||!choice)return null;
 const original=s.events.find(e=>e.id===p.eventId);original.read=true;original.actChoice=choiceId;
 a.chosenChoices=actTwoChosen(s);a.pending=null;a.completed.push(p.scene);
 const r=addEvent(s,'life','返事：'+choice.label,choice.lines[0].text,[102]);r.actScene='reply';r.cast=['hostess','cat'];r.stageOnly=true;r.lines=choice.lines;
 if(choice.bad){a.status='bad';a.failure=choice.bad;if(!a.memory.includes(choice.bad))a.memory.push(choice.bad);s.ending={name:(p.scene==='bag'?'夜逃げ':'差し押さえ')+' — '+event.title,text:choice.regret};}
 if(!choice.bad&&p.scene==='bag')saveStoryCheckpoint(s,'contract','バッグの事件を回避した直後');
 return r;
}
export function rewindActTwo(s){
 const a=s.actOne;const scene=Object.keys(ACT_TWO_EVENTS).find(id=>ACT_TWO_EVENTS[id].choices.some(c=>c.bad===a.failure));
 let next;
 if(a.rollbackPoint?.kind==='story'&&a.rollbackPoint.scene===scene)next=JSON.parse(JSON.stringify(a.rollbackPoint.state));
 else{
  // Reconstruct a milestone for saves made under the former 30-minute rollback rule.
  next=createActOne(a.seed,[],2,true);advanceActOne(next,100);answerActOne(next,next.actOne.pending.eventId,'water');advanceActOne(next,100);answerActOne(next,next.actOne.pending.eventId,'coronation');advanceActOne(next,100);beginActTwo(next);
  next.actOne.started=true;next.actOne.titlePending=false;next.actOne.prologuePending=false;
  if(scene==='contract'){advanceActTwo(next,100);answerActTwo(next,next.actOne.pending.eventId,ACT_TWO_EVENTS.bag.choices.find(c=>!c.bad).id);}
 }
 if(s.actOne.rollbackPoint?.kind==='story')next.actOne.rollbackPoint=JSON.parse(JSON.stringify(s.actOne.rollbackPoint));
 next.actOne.attempt=a.attempt+1;next.actOne.skipUnlockedScene=scene;next.actOne.memory=[...a.memory];next.actOne.chosenChoices=actTwoChosen(s);next.actOne.status='playing';next.actOne.pending=null;next.actOne.prologuePending=false;next.actOne.titlePending=false;next.actOne.started=true;next.ending=null;next.pending=null;next.events.forEach(e=>e.read=true);
 const intro=addEvent(next,'life','また、差し押さえの前へ',storyCheckpointTarget(s).label+'に時間が戻った。',[102]);intro.actScene='act2-rewind';intro.cast=['hostess','cat'];intro.stageOnly=true;intro.read=false;intro.lines=[
 n('失ったはずのけもの荘が戻った。'+storyCheckpointTarget(s).label+'に時間が戻っている。'),
 m(scene==='bag'?'……また戻った。あの荷物と書類、今度は見逃さねぇ。':'……また戻った。今度こそ、絶対にハンコは押さねぇ。'),
 l('surprised','大家さん？ 何かあった？'),
 m('ああ。取り返しのつかない未来を見た。'),
 c('tired','大家、寝不足ニャ？'),
 m('お前らのせいでな！！')];
 next.actOne.rewindIntroPending=true;next.actOne.rewindIntroCursor=0;
 return next;
}

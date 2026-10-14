import {advance,addEvent,admit} from './simulation.js';
const n=text=>({speaker:'narrator',emotion:'neutral',text});
const m=text=>({speaker:'manager',emotion:'neutral',text});
const l=(emotion,text)=>({speaker:'hostess',emotion,text});
const c=(emotion,text)=>({speaker:'cat',emotion,text});
export const ACT_TWO_TITLE='第二幕「アパートを借金（ルナ）から守れ！」';
export const ACT_TWO_EVENTS={
  bag:{at:62,title:'第一の事件：謎の届け物',call:'謎の届け物をどう受け取る？',detail:'3日目14時。金城ルナ宛てに、大きな段ボール箱が一つ届いた。',lines:[
    n("ルナが入居して間もなく、けもの荘に宅配便がやって来た。大きな段ボール箱が一つ。"),
    n("配達員「お届け物でーす！ 金城ルナさん宛てです！」"),
    m("おーい！ ルナ！ 荷物来てるぞー！"),
    l("neutral","はーい！ 大家さん、代わりに受け取ってくれる？"),
    m("自分で受け取れよ！"),
    l("neutral","今、部屋を片づけてて手が離せないの！ お願い♡"),
    c("neutral","モクも手伝うニャ。"),
    m("お前、暇なだけだろ。"),
    c("neutral","今日は忙しいニャ。寝る予定があるニャ。"),
    m("じゃあ寝てろよ！"),
    n("配達員「あの……受け取りの確認をお願いできますか？」"),
    m("ったく、どうするかな……。")
  ],choices:[
    {id:"guarantee",label:"面倒くせぇ！ さっさと受け取っちまえ！",bad:"bag-guarantee",regret:"住人は消えた。詐欺の争いが続き、けもの荘も手放した。",clue:"受領書に見えた紙だけを信じて押印してしまった。あの配達員の書類は本当に一枚だったのか？",lines:[
      m("面倒くせぇ！ さっさと受け取っちまえ！"),
      n("配達員「ありがとうございます。こちらに確認の印をお願いします。」"),
      m("ほらよ！"),
      n("大家は書類にハンコを押し、大きな箱を受け取った。中には仕事用のバッグが一つ入っていた。"),
      l("neutral","ありがとー！ 助かった♡"),
      c("neutral","大家さん、仕事が早いニャ。"),
      m("こういうのはさっさと終わらせるに限る！"),
      n("数日後。102号室からルナの姿が消えていた。家具も洋服もなく、机の上には一通の置き手紙。"),
      m("……ルナ？ なんだ、この手紙。"),
      n("ルナの置き手紙「大家さんへ。本当にごめんなさい。あの日の荷物、ネットで知り合った人から買ったバッグだったの。あとになって詐欺グループだったって知った。受領書の下には別の書類が重なっていて、大家さんのハンコも悪用され、知らない契約まで作られていたって……。怖くなって逃げちゃった。本当にごめんなさい。ルナ」"),
      m("……は？"),
      c("neutral","どうしたニャ？"),
      m("俺、荷物を受け取っただけだよな……？"),
      c("neutral","そうニャ。"),
      n("それから数週間。詐欺グループは大家の押印と個人情報を悪用し、偽造書類で多額の債務を作り出していた。大家は契約の無効を訴えたが、書類の偽造をめぐる争いと建物の維持費が重なり、資金繰りが行き詰まる。最終的に、大家はけもの荘を売却せざるを得なくなった。"),
      m("……俺のアパートが……。"),
      c("neutral","引っ越すニャ？"),
      m("引っ越すも何も、もう俺のじゃねぇんだよ！！")
    ]},
    {id:"loan",label:"おいモク！ ちゃんと手伝えよ！",lines:[
      m("おいモク！ ちゃんと手伝えよ！"),
      c("neutral","任せろニャ！ モクは力持ちニャ！"),
      m("昨日、ペットボトルの蓋開けられなかっただろ。"),
      c("neutral","あれは蓋が強かったニャ。"),
      n("配達員「では、こちらの確認をお願いします。」"),
      m("はいはい、ちょっと待ってくれ。"),
      n("モクは大きめの段ボールを持ち上げた。"),
      c("neutral","よいしょ……っと！"),
      c("neutral","……軽っ！？"),
      m("なんだよ、大げさだな。"),
      c("neutral","重いと思って勢いつけすぎたニャ！"),
      n("勢い余ったモクが配達員にぶつかった。バサバサッ！ 配達員の手から書類が床に散らばる。"),
      n("配達員「あっ！ ちょっと！」"),
      m("おい！ 何やってんだよ！"),
      c("neutral","箱に裏切られたニャ……。"),
      m("箱のせいにすんな！"),
      n("大家が床の書類を拾い上げた。"),
      m("……ん？ これ、受領書じゃないよな？"),
      n("配達員「そ、それは……。」"),
      m("……なんで、うちのアパートの住所と俺の名前が書いてあるんだ？"),
      m("おい、説明しろよ！"),
      n("男は突然、大家の手から書類を奪い返した。"),
      n("配達員「す、すみません！ 間違えました！」"),
      n("男は段ボールを抱え、その場から逃げ出した。"),
      m("おい！ 待てコラ！！"),
      c("neutral","荷物も持ってっちゃったニャ。"),
      m("荷物どころの話じゃねぇよ！！"),
      n("騒ぎを聞いたルナが、102号室から顔を出した。"),
      l("neutral","なになに？ どうしたの？"),
      m("お前、あの荷物どこで買った？"),
      l("neutral","え？ ネットで知り合った人からだけど……。"),
      m("……名前と連絡先、ちゃんと確認したのか？"),
      l("sad","……してない。"),
      m("おいおい……。"),
      c("neutral","モクのおかげで助かったニャ！"),
      m("……まあ、今回はそうだな。"),
      c("neutral","じゃあ、ご褒美にストロング缶買ってニャ。"),
      m("調子に乗るな！！"),
      n("こうして、大家は怪しい書類にハンコを押さずに済んだ。しかし、ルナに近づいた人物の正体は、まだわからない。")
    ]},
    {id:"return",label:"まず荷物の中身を確認させろ！",bad:"bag-return",regret:"確認したのは、箱の中身だけだった。詐欺被害の末にアパートを手放した。",clue:"箱の中身を確認しただけでは、受け取りの書類に隠された罠は見抜けなかった。",lines:[
      m("まず荷物の中身を確認させろ！"),
      n("配達員「申し訳ありません。受け取り前の開封はできませんので。」"),
      m("じゃあ、確認だけ済ませりゃいいんだな？"),
      n("配達員「はい。こちらにお願いします。」"),
      n("大家は受領書だと思って書類にハンコを押した。"),
      m("よし、これで開けられるな！"),
      n("箱を開けると、中にはバッグが一つ。大きな箱のほとんどは緩衝材だった。"),
      c("neutral","箱のほうが高そうニャ。"),
      m("そんなわけあるか！"),
      n("しかし数日後、ルナが突然姿を消した。102号室には一通の置き手紙が残されていた。"),
      n("ルナの置き手紙「大家さんへ。本当にごめんなさい。あの日の荷物、変な人たちから買っちゃったみたい。大家さんがハンコを押した紙には、別の書類が重なってたんだって。その書類を使って偽の契約まで作られていたみたい。私、怖くなって逃げちゃった。ごめんなさい。ルナ」"),
      n("大家は契約を否定した。しかし偽造書類をめぐる争いは長引き、詐欺への対応と建物の維持費が家計を圧迫した。やがて、けもの荘を売却する日が来た。"),
      m("……中身はちゃんと確認したのに。"),
      c("neutral","紙の中身は確認しなかったニャ。"),
      m("今それ言うなあああ！！")
    ]}
  ]},
  contract:{at:81,title:'第二の請求：契約書の小さな文字',call:'謎の「資金援助」の契約をどうする？',detail:'4日目9時。スーツ姿の男が「ルナの独立支援」と称して契約書を持ってきた。',lines:[
    n('翌朝、アパートの入口。スーツ姿の男が分厚い書類を差し出した。'),
    l('sad','前のお店の知り合いなの。「独立資金を出す」って……。'),
    m('なんでそれを俺に持ってくるんだ？'),
    l('tired','保証人の欄に、建物の持ち主の名前が必要らしくて。'),
    c('surprised','タダでお金をくれる人、いい人ニャ！'),
    m('そんなうまい話があるか！'),
    l('shy','でも、今日サインしないと取り消しだって。'),
    n('契約書の隅に「不動産担保」と小さく書かれている。'),
    m('……これ、うちのアパートが担保じゃねぇか！')
  ],choices:[
    {id:'sign',label:'ルナを信じる！ ここにサインだ！',bad:'contract-sign',regret:'親切のつもりで署名し、アパートを担保に差し出してしまった。',clue:'他人の融資に不動産を担保として差し出してはいけない。',lines:[m('ルナを信じる！ ここにサインだ！'),l('surprised','えっ、ほんとに！？'),c('happy','大家さん太っ腹ニャ。'),n('契約書に署名した瞬間、男の笑顔が消えた。'),n('数日後。返済を迫る通知と、けもの荘の差し押さえ手続きの書面が届いた。'),m('俺のアパートが……持っていかれる！？'),l('sad','ごめん……こんなはずじゃ……。')]},
    {id:'stamp',label:'ハンコだけ貸す！ あとは頼んだ！',bad:'contract-stamp',regret:'印鑑を預けたせいで、知らない契約が成立してしまった。',clue:'印鑑や署名を他人任せにしない。',lines:[m('ハンコだけ貸す！ あとは頼んだ！'),l('surprised','それ、ほんとにいいの？'),c('neutral','ハンコって押すだけで金が出るニャ？'),n('男は大家の印鑑を使い、建物を担保にする書類を仕上げた。'),n('数日後。けもの荘の差し押さえ通知が届く。'),m('ハンコ一本で家が消えるとか聞いてねぇぞ！'),l('sad','……大家さん、ごめんなさい。')]},
    {id:'refuse',label:'担保は絶対ダメだ！ 契約は持ち帰れ！',lines:[m('担保は絶対ダメだ！ 契約は持ち帰れ！'),l('surprised','でも、今日だけって……。'),m('今日しか考える時間をくれない契約なんて、なおさらダメだ！'),c('happy','じゃあモクのハンコも貸さないニャ。'),m('お前はそもそも持ってないだろ！'),n('大家は署名を拒み、契約内容を確認することにした。男は舌打ちして立ち去った。'),l('sad','……焦ってた。助かったよ、大家さん。'),m('次からは小さい文字ほど先に読め。')]}
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
    n('けもの荘、3日目の午後。一人の女性が、大きなキャリーバッグを引いてやって来た。'),
    l('happy','こんにちは！ 今日からお世話になります、金城ルナです。'),
    m('ああ、入居申込書の人ね。よろしく。'),
    l('neutral','よろしくね！ 夜の仕事だから、帰りが遅くなることもあるけど。'),
    m('騒がなきゃ別に構わないよ。'),
    c('neutral','モクですニャ。101号室に住んでるニャ。'),
    l('happy','あ、隣の人？ よろしくね！'),
    c('neutral','タバコの煙が来ても気にしないでほしいニャ。'),
    m('そこはお前が気にしろよ！'),
    l('happy','あはは！ にぎやかなアパートだね。'),
    m('今までは静かだったんだけどな……。'),
    c('neutral','モクは静かに暮らしてるニャ。'),
    m('お前が一番うるせぇんだよ！'),
    n('こうして、けもの荘に二人目の住人がやって来た。これから少しずつ、アパートの暮らしも変わっていく。'),
    l('happy','あっ、そうだ。今日の午後、ちょっと荷物届くからよろしくね！'),
    m('おう、わかった。'),
    c('neutral','何が届くニャ？'),
    l('shy','んー、仕事で使うものかな♡'),
    n('ルナはにっこり笑った。大家はまだ、その笑顔の裏に隠れた金銭事情を知らない。')
  ];
  return s;
}
export const nextActTwoAt=s=>Object.entries(ACT_TWO_EVENTS).find(([id])=>!s.actOne.completed.includes(id))?.[1].at??105;
export function advanceActTwo(s,hours){
 const a=s.actOne;if(!a.started||a.status!=='playing'||a.pending||a.prologuePending||hours<=0)return;
 const at=nextActTwoAt(s),end=Math.min(at,s.hour+hours);
 const scene=Object.keys(ACT_TWO_EVENTS).find(id=>!a.completed.includes(id));
 if(scene&&s.hour<=at-.5&&end>=at-.5){advance(s,Math.max(0,at-.5-s.hour));s.pending=null;s.management.pending=null;s.management.queue=[];a.rollbackPoint={scene,state:JSON.parse(JSON.stringify({...s,actOne:{...a,rollbackPoint:undefined}}))};}
 advance(s,Math.max(0,end-s.hour));s.pending=null;s.management.pending=null;s.management.queue=[];
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
 n('こうして第二幕は幕を閉じた。燃えず、売られず、けもの荘は今日もそこにある。'),
 n('だが、静かな日々が続くかどうかは、また別の話。')];
 s.ending={name:'第二幕クリア — 残った鍵',text:'けもの荘は、借金のカタにならずに済んだ。'};}
}
export function answerActTwo(s,eventId,choiceId){
 const a=s.actOne,p=a.pending,event=ACT_TWO_EVENTS[p?.scene];const choice=event?.choices.find(c=>c.id===choiceId);
 if(a.status!=='playing'||p?.eventId!==Number(eventId)||!choice)return null;
 const original=s.events.find(e=>e.id===p.eventId);original.read=true;original.actChoice=choiceId;
 a.chosenChoices=actTwoChosen(s);a.pending=null;a.completed.push(p.scene);
 const r=addEvent(s,'life','返事：'+choice.label,choice.lines[0].text,[102]);r.actScene='reply';r.cast=['hostess','cat'];r.stageOnly=true;r.lines=choice.lines;
 if(choice.bad){a.status='bad';a.failure=choice.bad;if(!a.memory.includes(choice.bad))a.memory.push(choice.bad);s.ending={name:(p.scene==='bag'?'夜逃げ':'差し押さえ')+' — '+event.title,text:choice.regret};}
 return r;
}
export function rewindActTwo(s){
 const a=s.actOne;const scene=Object.keys(ACT_TWO_EVENTS).find(id=>ACT_TWO_EVENTS[id].choices.some(c=>c.bad===a.failure));
 let next=a.rollbackPoint?.scene===scene?JSON.parse(JSON.stringify(a.rollbackPoint.state)):JSON.parse(JSON.stringify(s));
 if(!a.rollbackPoint||a.rollbackPoint.scene!==scene){next.hour=ACT_TWO_EVENTS[scene].at-.5;next.events=next.events.filter(e=>e.actScene!==scene&&e.actScene!=='reply');next.actOne.completed=a.completed.filter(x=>x!==scene);}
 next.actOne.attempt=a.attempt+1;next.actOne.memory=[...a.memory];next.actOne.chosenChoices=actTwoChosen(s);next.actOne.status='playing';next.actOne.pending=null;next.actOne.prologuePending=false;next.ending=null;next.pending=null;next.events.forEach(e=>e.read=true);
 const intro=addEvent(next,'life','また、差し押さえの前へ','時計が30分前に戻った。',[102]);intro.actScene='act2-rewind';intro.cast=['hostess','cat'];intro.stageOnly=true;intro.read=false;intro.lines=[
 n(scene==='bag'?'失ったはずのけもの荘が戻った。時計は荷物が届く30分前を指している。':'差し押さえの通知が消えた。時計は、契約を間違えた30分前を指している。'),
 m(scene==='bag'?'……また戻った。あの荷物と書類、今度は見逃さねぇ。':'……また戻った。今度こそ、絶対にハンコは押さねぇ。'),
 l('surprised','大家さん？ 何かあった？'),
 m('ああ。取り返しのつかない未来を見た。'),
 c('tired','大家さん、寝不足ニャ？'),
 m('お前らのせいでな！！')];
 next.actOne.rewindIntroPending=true;next.actOne.rewindIntroCursor=0;
 return next;
}

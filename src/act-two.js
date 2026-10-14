import {advance,addEvent,admit} from './simulation.js';
const n=text=>({speaker:'narrator',emotion:'neutral',text});
const m=text=>({speaker:'manager',emotion:'neutral',text});
const l=(emotion,text)=>({speaker:'hostess',emotion,text});
const c=(emotion,text)=>({speaker:'cat',emotion,text});
export const ACT_TWO_TITLE='第二幕「アパートを借金（ルナ）から守れ！」';
export const ACT_TWO_EVENTS={
  bag:{at:62,title:'第一の請求：仕事用のバッグが増える',call:'ルナのバッグ代をどうする？',detail:'3日目14時。102号室から大きな段ボールが三箱も届いた。',lines:[
    n('入居してまだ数時間。102号室の前に段ボールが三箱積まれている。'),
    l('happy','お疲れさま、大家さん。ちょうどいいところに。'),
    m('おい、引っ越し荷物にしては増えてないか？'),
    l('shy','仕事用のバッグ。全部必要経費なの。'),
    c('tired','段ボールのほうが部屋より広そうニャ。'),
    m('それで、いくら使ったんだよ。'),
    l('sad','……カードの請求が、ちょっとだけ。'),
    m('その「ちょっと」はいくらだ？'),
    l('shy','大家さん、立て替えてくれない？ お礼は相談無料で。'),
    m('家賃より先に俺の財布を燃やす気か！？')
  ],choices:[
    {id:'guarantee',label:'俺が全部払う！ 家賃から引いとけ！',bad:'bag-guarantee',regret:'家賃収入まで消えて、大家の口座が空っぽになった。',clue:'住人の個人的な買い物を大家が無条件に肩代わりしてはいけない。',lines:[m('俺が全部払う！ 家賃から引いとけ！'),l('happy','えっ、大家さん、神様！？'),c('happy','モクのストロング缶も家賃から引けるニャ？'),m('お前は黙ってろ！'),n('その晩。ルナのカード請求に続き、大家の口座から家賃相当額が消えていく。'),l('surprised','……あれ？ 来月の分も買っちゃった。'),n('大家の資金繰りは破綻。けもの荘の維持費さえ払えなくなった。')]},
    {id:'loan',label:'消費者金融で一発逆転だ！',bad:'bag-loan',regret:'借りて返すつもりが、借金だけが残った。',clue:'借金を返すために新しい借金を勧めない。',lines:[m('消費者金融で一発逆転だ！'),l('surprised','それ、一発逆転じゃなくて借りるだけじゃない？'),c('happy','利息って毎月増えるおまけニャ？'),m('違う！ ……いや、俺もよく知らねぇ！'),n('翌朝、支払いのための借り入れが膨らみ、大家も保証の書類に巻き込まれる。'),l('sad','バッグを売っても足りない……。'),n('督促状がアパートに届き始めた。')]},
    {id:'return',label:'未使用分を返品！ まず明細を見せろ！',lines:[m('未使用分を返品！ まず明細を見せろ！'),l('surprised','えっ、これ全部お気に入りなのに！'),m('お気に入りを三つも同時に持てるか！'),c('neutral','モクは両手で二缶いけるニャ。'),m('お前は例外を出すな！'),n('ルナは未使用のバッグを返品し、支払いを整理した。大家は保証人にならずに済んだ。'),l('shy','……ありがと。笑ってごまかすところだった。'),m('家賃はちゃんと払えよ。')]}
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
  e.lines=[n('けもの荘、3日目の午後。申込書の差出人が、キャリーバッグを引いて現れた。'),l('happy','こんにちは！ 今日からお世話になります、金城ルナです。'),m('……あんたが新しい入居者か。'),l('happy','夜は仕事で留守が多いけど、家賃はちゃんと払うよ。'),c('tired','モクですニャ。タバコは吸うニャ。'),l('surprised','わ、すごい煙。火災報知器は大丈夫？'),m('その話は俺の前でするな……！'),l('shy','あはは。ところで荷物、あと三箱届くから。'),m('……三箱！？'),n('燃えなかったけもの荘に、新しい火種ではなく、新しい請求書がやって来た。'),m('頼むから、家だけは取られないでくれよ……。')];
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
 if(choice.bad){a.status='bad';a.failure=choice.bad;if(!a.memory.includes(choice.bad))a.memory.push(choice.bad);s.ending={name:(p.scene==='bag'?'経営破綻':'差し押さえ')+' — '+event.title,text:choice.regret};}
 return r;
}
export function rewindActTwo(s){
 const a=s.actOne;const scene=Object.keys(ACT_TWO_EVENTS).find(id=>ACT_TWO_EVENTS[id].choices.some(c=>c.bad===a.failure));
 let next=a.rollbackPoint?.scene===scene?JSON.parse(JSON.stringify(a.rollbackPoint.state)):JSON.parse(JSON.stringify(s));
 if(!a.rollbackPoint||a.rollbackPoint.scene!==scene){next.hour=ACT_TWO_EVENTS[scene].at-.5;next.events=next.events.filter(e=>e.actScene!==scene&&e.actScene!=='reply');next.actOne.completed=a.completed.filter(x=>x!==scene);}
 next.actOne.attempt=a.attempt+1;next.actOne.memory=[...a.memory];next.actOne.chosenChoices=actTwoChosen(s);next.actOne.status='playing';next.actOne.pending=null;next.actOne.prologuePending=false;next.ending=null;next.pending=null;next.events.forEach(e=>e.read=true);
 const intro=addEvent(next,'life','また、差し押さえの前へ','時計が30分前に戻った。',[102]);intro.actScene='act2-rewind';intro.cast=['hostess','cat'];intro.stageOnly=true;intro.read=false;intro.lines=[
 n('差し押さえの通知が消えた。時計は、契約を間違えた30分前を指している。'),
 m('……また戻った。今度こそ、絶対にハンコは押さねぇ。'),
 l('surprised','大家さん？ 何かあった？'),
 m('ああ。取り返しのつかない未来を見た。'),
 c('tired','大家さん、寝不足ニャ？'),
 m('お前らのせいでな！！')];
 next.actOne.rewindIntroPending=true;next.actOne.rewindIntroCursor=0;
 return next;
}

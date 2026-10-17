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
const FIRST_STALKER_TRAGEDY_LINES=[
      n('そのとき、モクが現れる。'),
      c('neutral','……おい。'),
      n('男「……あ？」'),
      n('モクがゆっくりと近づいてくる。'),
      c('neutral','……ルナが帰れって言ってるニャ。'),
      n('男「なんだよ、お前。邪魔すんなよ。」'),
      c('neutral','……聞こえなかったのかニャ？'),
      n('モクは男の目をじっと見据える。'),
      c('angry','帰れって言ってんだニャ！！'),
      n('モクが一歩踏み出す。男は思わず後ずさる。'),
      n('男「……っ！ わ、分かったよ！」'),
      n('男は慌てて背を向け、逃げるように走り去った。'),
      m('……お前、そんな怖い顔できたのか。'),
      c('neutral','モクはいつも優しいニャ。'),
      m('自分で言うなよ……。'),
      l('sad','……モクちゃん、ありがとう……。'),
      c('happy','当然ニャ！'),
      n('ルナは男が逃げた方向を不安そうに見つめていた。'),
      l('sad','……本当に、もう来ないかな……。'),
      m('もう大丈夫だろ。今日はゆっくり休め。'),
      l('sad','……うん。ありがとう、大家さん。'),
      c('happy','また来たらモクが追い払うニャ！'),
      m('ははっ。頼りにしてるぞ。'),
      l('sad','……じゃあ、おやすみなさい。'),
      n('ルナは102号室へ戻り、大家とモクもそれぞれ部屋へ戻った。'),
      n('深夜。大家が102号室の前を通りかかる。'),
      n('扉が少し開いている。'),
      m('……ん？ ルナ？'),
      n('返事はない。'),
      m('……おい、開けっぱなしだぞ。'),
      n('大家は102号室へ入る。倒れた椅子と割れたグラスが目に入る。'),
      m('……なんだ、これ……。'),
      n('部屋の奥で、ルナが血だらけになって倒れていた。'),
      {...n('辺りの音が途切れる。'),tragedyEffect:'silence'},
      {...m('…………ルナ？'),voicePerformance:'tragedy-shock'},
      n('返事はない。'),
      m('……おい……。'),
      m('……嘘だろ……。'),
      n('大家はルナに駆け寄る。'),
      {...m('ルナ！！ しっかりしろ！！'),voicePerformance:'tragedy-panic'},
      {...m('頼む……目を開けてくれ……！'),voicePerformance:'tragedy-grief'},
      n('ルナは動かない。'),
      {...m('……くそっ！ 救急車……！'),voicePerformance:'tragedy-panic'},
      {...n('大家が立ち上がろうとした、その瞬間。鈍い衝撃音が響く。'),tragedyEffect:'impact'},
      {...n('視界が揺れ、すべてが暗闇に沈んだ。'),tragedyEffect:'blackout'},
      {...n('……カチッ。'),tragedyEffect:'clock'},
      {...n('暗闇の中で時計の針が逆回転を始める。'),tragedyEffect:'clock'},
      {...n('針が夕暮れの18時を指すと、白い光が広がった。'),flashbackEffect:'whiteout'}
    ];
export const ACT_TWO_EVENTS={
  bag:{at:66,title:'第一の事件：夕暮れの待ち伏せ',call:'ルナを追う男にどう対応する？',detail:'3日目18時。けもの荘の玄関前で、ルナが見知らぬ男に呼び止められた。',lines:[
    n('夕暮れ。大家がアパートの前を掃除していると、男の声が聞こえてきた。'),
    n('男「あっ！ ルナちゃん！」'),
    l('surprised','……っ！'),
    n('振り返ったルナの表情が、一瞬で凍りつく。'),
    n('男「やっと見つけたよ！ 急に連絡くれなくなるから、心配したんだよ？」'),
    l('surprised','……なんで……ここが……。'),
    n('男「頑張って探したんだ。ルナちゃん、引っ越したんでしょ？」'),
    l('sad','……もう、お店は辞めたから。'),
    n('男「うん、知ってるよ。でも、俺たちの関係は別じゃない？」'),
    l('angry','……そんな関係じゃない！'),
    n('男は笑顔のまま、一歩近づいた。'),
    n('男「照れなくていいって。俺、ルナちゃんのこと本気なんだから。」'),
    l('sad','……お願い。もう帰って。'),
    n('その声に気づき、大家が二人の間に入る。'),
    m('おい、あんた。何やってるんだ？'),
    n('男「……誰？」'),
    m('ここの大家だ。'),
    n('男「……大家？ へえ。」'),
    n('男は大家を上から下まで眺める。'),
    n('男「ルナちゃん。この人とはどういう関係？」'),
    l('sad','……大家さん。それだけだよ。'),
    n('男「ふうん……。」'),
    n('男の笑顔が消えかける。'),
    m('ルナは帰ってくれって言ってるだろ。今日はもう帰れ。'),
    n('男「……あんたには関係ないだろ。」'),
    n('男は大家を押しのけようとする。')
  ],choices:[
    {id:'loan',label:'モク、お前がルナの彼氏のフリをしろ！',lines:[
      m('モク、お前がルナの彼氏のフリをしろ！'),
      c('neutral','馬鹿じゃないのかニャ？ モクは女ニャ。大家がやれニャ。'),
      m('あっ……そうだった。'),
      c('angry','忘れるなニャ！！'),
      n('男「おい！ さっきから何をごちゃごちゃ話してんだよ！」'),
      m('あー……実は俺がルナの彼氏だ！'),
      l('surprised','えっ！？'),
      n('男「……は？ 彼氏？」'),
      n('男「嘘だろ？ ルナちゃん、そんなこと一言も言ってなかったじゃん！」'),
      l('neutral','……言う必要ないでしょ。'),
      n('ルナは事情を察し、大家の腕に抱きつく。'),
      l('happy','そうなの♡ この人があたしの彼氏。'),
      m('……お、おう！'),
      c('neutral','大家、顔が赤いニャ。'),
      m('うるせぇ！ 今は黙ってろ！'),
      n('男「……ふざけんなよ。俺はずっとルナちゃんのこと待ってたんだぞ！」'),
      l('angry','だから、待ってなんて頼んでない！'),
      n('男「……そいつのせいか？」'),
      n('男が大家に詰め寄る。'),
      n('男「そいつがいるから、俺に会ってくれないのかよ！」'),
      m('違うだろ。ルナは最初から嫌がってるじゃねぇか。'),
      n('男「うるせぇ！ お前には関係ねぇんだよ！」'),
      n('男が大家の胸ぐらをつかもうとする。'),
      c('neutral','……おい。'),
      n('モクが男の前に立ちはだかる。'),
      n('男「……なんだよ、今度は！」'),
      c('neutral','……ルナが嫌がってるニャ。'),
      n('男「だから何だよ！」'),
      c('neutral','……聞こえなかったのかニャ？'),
      n('モクの表情が一変する。'),
      c('angry','帰れって言ってんだニャ！！'),
      n('モクが一歩踏み出す。男は思わず後ずさる。'),
      n('男「……っ！ な、なんだよお前！」'),
      m('俺の彼女に二度と近づくな。'),
      c('angry','次はこんなもんじゃ済まないニャ。'),
      n('男「……くそっ！ 覚えてろよ！」'),
      n('男は逃げるように立ち去った。'),
      m('……ふぅ。行ったか。'),
      l('happy','……ねえ、大家さん♡'),
      m('ん？'),
      l('happy','さっき……『俺の彼女』って言ってくれたよね♡'),
      m('あ、あれは！ あいつを追い払うためにだな……！'),
      l('happy','ふふっ♡ 分かってるよ。'),
      l('shy','……でも、ちょっと嬉しかったな♡'),
      m('……そ、そうか。'),
      c('neutral','大家、顔が真っ赤ニャ。'),
      m('うるせぇ！！'),
      l('happy','あははっ♡'),
      n('ルナの笑顔を見て、大家はふと表情を曇らせる。'),
      {...m('……前も、あいつは帰っていった。'),innerVoice:true},
      {...m('……でも、あの夜……。'),innerVoice:true},
      m('……ルナ。今日は1人で過ごすな、俺も部屋に泊まる。'),
      l('surprised','……えっ？'),
      c('neutral','……大家、さっき彼氏のフリって言ってなかったかニャ？'),
      m('……は？'),
      c('neutral','もう本物の彼氏になるつもりかニャ？'),
      m('ちげぇよ！！ あいつがまた来るかもしれねぇだろ！'),
      l('happy','ふふっ♡ あたしは嬉しいけど？'),
      m('ルナまで茶化すな！！'),
      c('neutral','……じゃあモクも泊まるニャ。'),
      m('……お前も？'),
      c('neutral','大家が変なことしないように見張るニャ！'),
      m('見張る相手が違うだろ！！'),
      l('happy','あははっ♡ 二人ともありがとう。'),
      n('その夜、大家とモクは102号室に泊まり込み、ルナを朝まで守った。'),
      n('翌朝。三人は無事に朝を迎えた。'),
      c('tired','ふぁぁ……見張りは完璧だったニャ。'),
      m('お前、真っ先に寝てただろ！！'),
      l('happy','あははっ♡'),
      n('大家は笑っているルナを見て、小さく息をつく。'),
      {...m('……よかった。今度は守れたんだ。'),innerVoice:true},
      n('第一の事件「夕暮れの待ち伏せ」クリア')
    ]},
    {id:'guarantee',label:'俺がルナの彼氏だ。文句あるか！',bad:'bag-guarantee',endingName:'甘い罠',regret:'ルナに運営資金と修繕費を持ち逃げされ、けもの荘の資金繰りが破綻した。',clue:'金銭トラブルを自分が引き受けると口にした大家は、ルナの甘い誘いにも警戒心を失ってしまった。',lines:[
      m('金の話なら、まず俺を通せ！'),
      n('男「へえ……大家さんが責任を持ってくれるんですか？」'),
      m('いや、そういう意味じゃねぇ！！'),
      n('男「……まあ、今日は引き下がりますよ。あとは店の人間から連絡させます。」'),
      n('男は含みのある笑みを浮かべて立ち去った。'),
      n('その夜。騒動が落ち着いたけもの荘の玄関。'),
      l('shy','大家さん、今日は本当にありがとう♡'),
      m('ああ。まあ、無事でよかったよ。'),
      l('shy','ねえ……大家さん。'),
      m('ん？'),
      l('shy','ちょっと、二人きりで相談したいことがあるんだけど……♡'),
      m('ここじゃ駄目なのか？'),
      l('shy','……駄目。二人だけの秘密にしたいの。'),
      n('ルナは大家の袖をそっと引いた。'),
      m('……お、おう。'),
      n('ルナが意味ありげに微笑む。画面がゆっくり暗転する。'),
      n('翌朝。チュン、チュン……。雀の鳴き声が聞こえる。'),
      n('朝日が差し込む。大家がゆっくり目を覚ます。'),
      m('……ん……？ もう朝か……。'),
      m('……ルナ？'),
      n('返事はない。'),
      n('ふと、机の上に開かれた金庫が目に入った。'),
      m('……は？'),
      n('アパートの修繕費と運営費として保管していた現金が、すべて消えていた。'),
      m('……おい、嘘だろ……。'),
      n('そのとき、廊下からモクが顔を出した。'),
      c('surprised','……大家、なんで服着てないニャ？'),
      m('……え？'),
      n('大家は自分の姿を見下ろす。'),
      m('うわああああああ！！'),
      c('angry','ヘンタイニャ！！'),
      n('モクは勢いよく扉を閉めた。'),
      n('大家は慌てて服を着ると、102号室へ走った。'),
      n('しかし、102号室はもぬけの殻だった。ルナの荷物も、姿もない。'),
      m('……ルナ……お前……。'),
      n('何度電話をかけても、ルナは出なかった。'),
      n('その後、けもの荘は修繕費と当面の運営資金を失い、予定されていた支払いが滞る。'),
      n('資金繰りは急速に悪化し、大家はついにアパートを手放すことになった。'),
      m('……俺、何やってんだろうな……。'),
      c('tired','……大家、女を見る目がなかったニャ。'),
      m('……うるせぇよ……。'),
      n('誰もいなくなった102号室の扉が、静かに閉まる。')
    ]},
    {id:'return',label:'ルナ、俺の後ろに隠れてろ！',bad:'bag-return',endingName:'恋の代償',regret:'ルナの突然の失踪で意気消沈した大家は管理業務を放り出し、資金繰りが悪化してけもの荘を売却した。',clue:'ルナの失踪後、大家がアパート管理を長期間放棄したことで経営が立ち行かなくなった。',lines:[
      m('ルナ、俺の後ろに隠れてろ！'),
      n('大家はルナをかばうように、男の前へ立ちはだかった。'),
      l('surprised','……大家さん？'),
      m('女の子一人を寄ってたかって追い回すんじゃねぇ！'),
      n('男「いや、俺一人ですけど。」'),
      c('neutral','確かに一人ニャ。'),
      m('そこは黙ってろ！！'),
      n('男「……で、店のお金はどうするんです？」'),
      m('知るか！ 証拠もねぇのに騒ぐな！'),
      n('男「……へえ。ずいぶん頼もしい大家さんですね。」'),
      m('当たり前だ。俺はここの大家だからな！'),
      c('neutral','いつもは家賃のことで泣いてるニャ。'),
      m('今いいところなんだよ！！'),
      l('shy','……ふふっ。大家さんって、こういう人なんだ♡'),
      n('男「……まあいいです。また来ますから。」'),
      n('男は不満そうに立ち去った。'),
      n('男が去ると、ルナは大家の袖をつかんだ。'),
      l('sad','……大家さん、怖かったぁ……。'),
      m('ああ、もう大丈夫だ。俺が追い払ったからな。'),
      c('neutral','また来るって言ってたニャ。'),
      m('余計なこと言うな！！'),
      n('ルナは目元を押さえ、小さく涙を浮かべる。'),
      l('shy','……本当にありがとう。あたし、誰かに守ってもらったの、久しぶりで……。'),
      m('……お、おう。'),
      l('shy','ねえ、大家さん。ちょっとだけ、お礼させて？♡'),
      m('礼？ いや、別にいいって。'),
      l('shy','だめ♡ 二人きりで、ちゃんとお礼したいの。'),
      c('neutral','……大家、顔がニヤけてるニャ。'),
      m('ニヤけてねぇよ！'),
      l('happy','ふふっ。行こ、大家さん♡'),
      n('ルナは大家の腕にそっと絡みついた。'),
      c('neutral','……うわぁ……ニャ。'),
      n('二人は大家の部屋へ。扉が閉まり、画面が暗転する。'),
      n('翌朝。チュン、チュン……。雀の鳴き声。'),
      n('朝日が差し込む。大家がゆっくりと目を覚ます。'),
      m('……ん……？ もう朝か……。'),
      m('……ルナ？'),
      n('返事はない。'),
      n('そこへモクが顔を出した。'),
      c('surprised','……大家、なんで服着てないニャ？'),
      m('……え？'),
      n('大家は自分の姿を見下ろす。'),
      m('うわああああああ！！'),
      c('angry','ヘンタイニャ！！'),
      m('違うんだーーー！！'),
      n('モクは勢いよく扉を閉めた。'),
      n('大家は慌てて服を着ると、102号室へ走った。'),
      n('しかし、102号室はもぬけの殻だった。ルナの荷物も姿もない。'),
      m('……嘘だろ……。'),
      n('数日後。大家は管理人室でぼんやりと天井を見つめていた。'),
      c('neutral','大家、今日も仕事しないのかニャ？'),
      m('……ルナ……。'),
      c('neutral','家賃の集金はどうするニャ？'),
      m('……ルナ……。'),
      c('tired','……重症ニャ。'),
      n('それから数週間。大家は仕事も管理業務も放り出し、アパートは荒れていった。'),
      n('修繕の手配は滞り、支払いも遅れ始める。もともと余裕のなかった資金繰りは、ついに限界を迎えた。'),
      n('数か月後。けもの荘の前には「売物件」の看板が立っていた。'),
      c('neutral','大家、女ひとりでアパート失ったニャ。'),
      m('……うるせぇ……。'),
      c('neutral','恋は盲目ニャ。'),
      m('お前がまともなこと言うなよ……。')
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
export const actTwoChoices=(s,scene)=>scene==='bag'&&s.actOne?.attempt===1?[{...ACT_TWO_EVENTS.bag.choices.find(choice=>choice.id==='guarantee'),label:'もう大丈夫だろ。今日はゆっくり休め。'}]:ACT_TWO_EVENTS[scene]?.choices||[];
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
    n('その声を聞きつけ、101号室のドアが開いた。モクが廊下から顔を出す。'),
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
  // eventConversation prepends the scene detail narration, so offset by one.
  e.revealCharacterAt=1+e.lines.findIndex(line=>line.speaker==='cat');
  for(const event of s.events)if(event!==e&&event.actScene&&event.actScene!=='act2-prologue')event.read=true;
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
 if(scene){const ev=ACT_TWO_EVENTS[scene],e=addEvent(s,'trouble',ev.title,ev.detail,[102]);e.actScene=scene;e.cast=['hostess','cat'];e.stageOnly=true;e.lines=(scene==='bag'&&a.attempt>1?[n('男「……あんたには関係ないだろ。」'),n('男は大家を押しのけようとする。'),n('モクが男の前に歩み出た。'),c('neutral','……おい。'),m('……今度は、どうする……？')]:ev.lines).map(x=>({...x}));a.pending={scene,eventId:e.id};}
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
 const firstStalkerTragedy=p.scene==='bag'&&a.attempt===1&&choiceId==='guarantee';
 const replyLines=firstStalkerTragedy?FIRST_STALKER_TRAGEDY_LINES:choice.lines;
 const r=addEvent(s,'life','返事：'+(firstStalkerTragedy?'もう大丈夫だろ。今日はゆっくり休め。':choice.label),replyLines[0].text,[102]);r.actScene='reply';r.cast=['hostess','cat'];r.stageOnly=true;r.lines=replyLines;
 if(choice.bad){a.status='bad';a.failure=choice.bad;if(!a.memory.includes(choice.bad))a.memory.push(choice.bad);s.ending={name:firstStalkerTragedy?'BAD END — 夕暮れの待ち伏せ':choice.endingName?('BAD END — '+choice.endingName):(p.scene==='bag'?'夜逃げ':'差し押さえ')+' — '+event.title,text:choice.regret};}
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
 const firstStalkerLoop=scene==='bag'&&a.attempt===1;
 const intro=addEvent(next,'life',firstStalkerLoop?'初めての巻き戻し':'また、事件の前へ',firstStalkerLoop?'血だらけのルナを見た直後、夕暮れの景色が戻っている。':storyCheckpointTarget(s).label+'に時間が戻っている。',[102]);
 intro.actScene='act2-rewind';intro.cast=['hostess','cat'];intro.stageOnly=true;intro.read=false;
 intro.revealCharacterAt=firstStalkerLoop?3:0;
 intro.lines=firstStalkerLoop?[
  n('夕暮れ。さっき聞いたはずの声が、耳に飛び込んでくる。'),
  n('男「……あんたには関係ないだろ。」'),
  {...m('……っ！？'),voicePerformance:'tragedy-shock'},
  n('大家は思わず頭を押さえる。だが、痛みはない。'),
  m('……待て……ここ……さっきの……？'),
  l('surprised','……大家さん？ 大丈夫？'),
  m('……ルナ……？'),
  n('血だらけで倒れていたはずのルナが、何事もなかったように立っている。'),
  m('……生きてる……。'),
  l('surprised','えっ？ 何言ってるの？'),
  m('……俺は……確か……。'),
  n('あの鈍い衝撃の記憶がよみがえる。'),
  {...m('……っ！'),voicePerformance:'tragedy-shock'},
  l('surprised','大家さん！？'),
  {...m('……夢……だったのか……？'),innerVoice:true},
  {...m('……いや……違う。この男も……この時間も……全部、同じだ……。'),innerVoice:true},
  n('男「さっきから無視してんじゃねえよ！」'),
  n('男が大家に詰め寄る。'),
  {...m('……こいつが……ルナを……？'),innerVoice:true},
  {...m('……いや、決めつけるな。俺だって、何が起きたのか分かってねぇ……。'),innerVoice:true},
  c('neutral','……おい。'),
  {...m('……そうだ。このあとモクが、あいつを追い返した……。'),innerVoice:true},
  {...m('……俺は、あれでもう大丈夫だと思った……。'),innerVoice:true},
  {...m('……また同じことが起きるかもしれない……。'),innerVoice:true},
  m('……絶対に、あんな目には遭わせねぇ。')
 ]:[
  n('失ったはずのけもの荘が戻った。'+storyCheckpointTarget(s).label+'に時間が戻っている。'),
  m(scene==='bag'?'……また戻った。今度こそルナを守る。':'……また戻った。今度こそ、絶対にハンコは押さねぇ。'),
  l('surprised','大家さん？ 何かあった？'),
  m('ああ。取り返しのつかない未来を見た。'),
  c('tired','大家、寝不足ニャ？'),
  m('お前らのせいでな！！')
 ];
 if(firstStalkerLoop){advanceActTwo(next,ACT_TWO_EVENTS.bag.at-next.hour);}
 next.actOne.rewindIntroPending=true;next.actOne.rewindIntroCursor=0;
 return next;
}

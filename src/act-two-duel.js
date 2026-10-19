// A fixed four-round picture play. No combat simulation or timers in saved state.
export const DUEL_ART={fiance:'assets/events/duel/fiance.png',gifter:'assets/events/duel/gifter.png',salesman:'assets/events/duel/salesman.png',boss:'assets/events/duel/boss.png',yandere:'assets/events/duel/yandere.png',domination:'assets/events/duel/domination.png'};
const duelLine=(speaker,text,emotion='neutral',extra={})=>({speaker,text,emotion,...extra});
const dn=text=>duelLine('narrator',text),dm=text=>duelLine('manager',text),dl=(text,emotion='happy')=>duelLine('hostess',text,emotion),dc=text=>duelLine('cat',text);
export const DUEL_INTRO=[
 dl('大家さ〜ん♡ ちょっとお願いがあるんだけど'),dm('……嫌な予感しかしねぇ。'),dl('今日だけ、あたしの彼氏になってくれない？'),dm('はぁ！？ 昨日も似たようなことやっただろ！！'),dl('昨日は昨日。今日は今日♡'),dc('大家、彼氏のアルバイト始めたニャ？'),
 dl('できれば結婚してほしいんだけど。少しだけでいいから♡'),dm('結婚にお試し期間をつけるな！！'),
 dl('前に、いろんな人にちょっと期待させちゃって……今日ここに来るって。','sad'),dm('ちょっと、で何人来るんだ。'),dc('大家、玄関に整理券がいるニャ。'),
 dm('彼氏でも夫でもねぇ。大家として話は聞く。お前も、自分で説明しろよ。'),dl('はぁい♡ 頼りにしてるね、大家さん。'),dc('モクは廊下で見守るニャ。手に負えなかったら呼ぶニャ。')
];
export const DUEL_ROUNDS=[
 {enemy:'fiance',name:'花束の自称婚約者',lines:[dn('花束男「結婚するなら優しい人がいいって言ったよね？ 毎日おはようを送った！ つまり婚約だ！」'),dl('好みの話が、いつの間にか婚姻届に……。','surprised'),dc('モクも大家におはようって言ったニャ。危なかったニャ。')],choices:[
 ['vow','こいつの明日は、俺が守る！',3],['boundary','好みと約束は別だ。本人の返事を聞け！',1],['help','花束、モク宛てってことにできない？',-1]]},
 {enemy:'gifter',name:'買い物王',lines:[dn('買い物王「これだけ貢いだんだ！ 俺にはルナちゃんに会う権利がある！」'),dl('そんなに買ってたの……？','surprised'),dm('待て。その抱き枕、誰が売った。'),dl('……通販って便利だよね♡'),dc('本人より先に枕が入居しそうニャ。')],choices:[
 ['shield','金額でこいつの笑顔は買わせねぇ！',3],['receipt','贈り物と交際は別会計だ！',1],['discount','俺の家賃も、ついでに貢いでくれない？',-1]]},
 {enemy:'salesman',name:'うさんくさい勧誘男',lines:[dn('勧誘男「ルナさんは僕と夢を追うと！ まずは大家さんが最上位会員に……」'),dl('夢の話はしたけど、会費の話は初耳♡'),dc('寝るだけならモクが無料で教えるニャ。')],choices:[
 ['future','こいつの未来に、勝手な値札をつけるな！',3],['cancel','本人が断ってる。勧誘もここで終了だ！',1],['sleep','モク先生の無料お昼寝講座に変更で……',-1]]},
 {enemy:'boss',name:'黒服の迎え役',lines:[dn('黒服「迎えに来た。ルナ、お前が『いつでも戻る』と言ったんだろう」'),dl('あれはお店で忘れ物を受け取る話！ 働きに戻るとは言ってない！','angry'),dc('全員、都合のいいところだけ聞いてるニャ。'),dn('黒服が腕を組む。大家はルナの前に立った。')],choices:[
 ['ultimate','大家流超絶漢気奥義！',7],['leave','忘れ物だけ返せ。今の暮らしは本人が決める！',1],['catapult','お引き取りは……こちらの猫まで！',-1]]}
];
export const duelOutcome=hearts=>hearts>=10?'yandere':hearts<=1?'domination':'clear';
export const duelChoices=round=>DUEL_ROUNDS[round]?.choices.map(([id,label,delta])=>({id,label,attack:label,delta}))||[];
export function duelEncounterLines(round){return DUEL_ROUNDS[round].lines.map(line=>({...line,duelRound:round}));}
export function duelReplyLines(round,choice){
 const weak=choice.delta<0;
 return [duelLine('manager',choice.label,weak?'neutral':'angry',weak?{duelWindup:true}:{duelAttack:choice.label,duelRank:choice.delta===7?4:choice.delta===3?3:2}),
  ...(weak?[{...dc('大家の口座も度胸も残高不足ニャ。'),duelWindup:true},duelLine('cat','出張お断りキックニャ！！','angry',{duelAttack:'出張お断りキックニャ！！',duelRank:1})]:[]),
  duelLine('narrator',weak?'廊下のモクが跳び出した。一直線の体当たりに、男は道路の向こうへすっ飛んだ。':'大家のひと言に男はのけぞり、足をもつれさせて逃げていった。','neutral',{duelRound:round,duelDefeated:true,duelPlayback:true}),
  duelLine('hostess',weak?'……大家さんより、モクちゃんに頼む方が早いね。':choice.delta>=3?'今の、ずるい……♡ もっと言ってほしいな。':'ありがとう。……あたしからも、ちゃんと断るね。',weak?'tired':'shy',{duelRound:round,duelHeartUpdate:true}),
  dc(weak?'助っ人の報酬はツナ缶ニャ。':'大家、決め顔のまま鼻の下を伸ばすなニャ。'),dm(weak?'家賃と相殺な。':'伸ばしてねぇ！！')
 ].map(line=>({...line,duelRound:round}));
}
// This deterioration belongs only to the high-heart BAD branch.
// Keep the final illustration behind an explicit reveal, not the outcome flag.
export function duelYandereEndingLines(){
 const phase=(name,lines)=>lines.map(line=>({...line,duelEndingPhase:name}));
 return [
  ...phase('relief',[
   dl('……帰ったんだね。ほんとに、みんな。','surprised'),
   dn('ルナは通りの先を何度も確かめてから、ようやく肩の力を抜いた。'),
   dl('ありがと、大家さん。途中から、笑ってごまかすのも無理だった。','sad'),
   dm('だったら最初から、無理だって言え。話がこじれる前にな。'),
   dl('うん。……今日は、お礼だけ言わせて。','neutral'),
   dc('お礼と婚姻届は別々にするニャ。'),
   dl('分かってるって。……ふふ。今日は本当に、助かった。','happy'),
   dn('いつもの調子に戻った声に、大家も小さく息をついた。')
  ]),
  ...phase('closeness',[
   dn('その夜。見回り中の大家が102号室の前を通ると、扉が細く開いた。'),
   dl('……大家さん。まだ、起きてる？','sad'),
   dm('見りゃ分かるだろ。どうした。'),
   dl('階段の音がすると、また誰か来たのかと思って。','sad'),
   dn('ルナは笑おうとした。けれど、ドアノブを握る指には力が入ったままだった。'),
   dm('さっき見てきた。誰もいねぇよ。戸締まりも、もう一度確かめとけ。'),
   dl('じゃあ……少しだけ、ここにいてもいい？','sad'),
   dm('俺はもう一周してくる。それまでならな。冷えるから、上着を着ろ。'),
   dn('戻ってくると、ルナはカーディガンを羽織って扉の前に立っていた。'),
   dl('……ほんとに戻ってきた。','surprised'),
   dm('見回りだぞ。途中で帰ってどうする。'),
   dl('うん。……そうだよね。おやすみ、大家さん。','happy'),
   dn('扉が閉まるまで、ルナの目は大家から離れなかった。')
  ]),
  ...phase('dependence',[
   dn('それから数日、見回りの帰りには、ルナが温かいお茶を持って待つようになった。'),
   dl('お疲れさま。今日はちゃんと、熱すぎないやつ♡','happy'),
   dm('おう、助かる。でも、毎晩待ってなくていいからな。'),
   dl('待ってないよ。たまたま、眠れなかっただけ。','shy'),
   dn('お茶を飲む間だけの立ち話が、十分になり、二十分になった。'),
   dn('ある晩、修繕の電話が長引いた。大家が廊下へ出ると、二つの湯のみはすっかり冷えていた。'),
   dl('……今日は、来ないのかと思った。','sad'),
   dm('水道の業者と話してた。先に寝ててよかったんだぞ。'),
   dl('あたしと話すより、そっちが大事？','sad'),
   dm('大事とか、そういう比べ方じゃねぇだろ。水が止まったらお前も困る。'),
   dl('……ごめん。変なこと言ったね。','sad'),
   dn('ルナは冷めたお茶を持ち帰った。翌晩は、大家が電話に出るより前から、廊下で待っていた。'),
   dl('誰から？ どれくらいかかる？ ……終わったら、あたしのところに来てね。','neutral'),
   dc('ルナ、大家は予約したら貸し切りになる店じゃないニャ。'),
   dl('分かってるよ。……ちゃんと、分かってる。','sad'),
   dn('そう答えながら、ルナは大家が階段を下りるまで、袖を離さなかった。')
  ]),
  ...phase('interference',[
   dn('数日後。約束の時刻を過ぎても、内見の客は来なかった。'),
   dm('……おかしいな。昨日、時間を確認したばかりだぞ。'),
   dl('その人なら帰ってもらったよ。大家さん、忙しそうだったから。','happy'),
   dm('帰ってもらった？ お前が？'),
   dl('知らない人をまた入れて、昼間みたいになったら嫌でしょ？','neutral'),
   dm('部屋を見に来ただけの人だ。何もしてねぇ人まで追い返すな。'),
   dl('……怒るんだ。大家さんのために、やったのに。','sad'),
   dm('お前を守るのと、誰も入れないのは違う。俺はここの大家なんだよ。'),
   dn('ルナは黙ってうつむいた。その晩のお茶は、廊下に置かれないままだった。')
  ]),
  ...phase('isolation',[
   dn('夜。管理室の前で、ルナが大家を待っていた。'),
   dl('……今日のこと、謝りたくて。少しだけ、話してもいい？','sad'),
   dm('ああ。俺も言い方はきつかった。でも、勝手に断るのはもうやめてくれ。'),
   dl('うん。大家さんが来てくれたとき、すごく安心したの。','sad'),
   dl('ここにいてもいいんだって。もう、誰かに連れていかれなくていいんだって。','sad'),
   dm('それは今も変わんねぇよ。だからって、俺の仕事まで取り上げるな。'),
   dl('……仕事があるから、行っちゃうんだよね。','neutral'),
   dn('うつむいたまま、ルナがつぶやいた。大家は返事をしようとして、腰の鍵束がないことに気づいた。'),
   dm('ルナ。……鍵、どこにやった。'),
   dl('もう待ってるだけは、嫌なの。戻ってくるかどうか、足音を数えるのも。','sad'),
   dm('返せ。俺がどこへ行くかは、お前が決めることじゃねぇ。'),
   dn('ルナが顔を上げた。上着をつかむ手をほどこうと、大家が管理室へ一歩下がる。背後の扉が閉まり、鍵の回る音がした。')
  ]),
  ...phase('reveal',[
   dl('……じゃあ、行かなくていいようにするね。今度はあたしが、大家さんを守る番♡','shy'),
   dm('……ルナ。扉を開けろ。'),
   dl('お客さんも、お仕事も、あたしが断ってあげる。だからもう、あたしだけ見てて。','shy'),
   dn('それきり、管理室から大家が呼び鈴に応えることはなくなった。内見も修繕もルナに断られ、閉じた扉の内側で、けもの荘の経営は止まった。')
  ])
 ];
}

export function duelEndingLines(outcome){
 const victory=[dn('四人の足音が遠ざかり、けもの荘の前に静けさが戻った。'),dm('……全員、帰った！'),dc('玄関前の渋滞解消ニャ。')].map(line=>({...line,duelRound:3,duelDefeated:true}));
 const endings={
 yandere:duelYandereEndingLines(),
 domination:[dl('大家さん。そこ、立ってないで。','tired'),dm('へ？'),dl('モクちゃんのツナ缶買って、廊下を磨いて、帳簿はあたしに渡して。返事は？'),dm('……はい。'),dc('大家が管理される側になったニャ。'),dl('自分で何も決められないんでしょ？ じゃあ、鍵もお金もあたしが持つね♡'),dn('ルナは管理椅子に腰を下ろし、指先で次の仕事を示した。大家は口を開きかけ、また頭を下げた。'),dl('言い訳は聞いてないよ。終わったら報告。褒めるかどうかは、あたしが決めるから。'),dc('大家、家賃の交渉だけは……ニャ？'),dm('……まずルナに、お伺いを……。'),dn('修繕も募集もルナの気分次第。管理鍵と帳簿を取り上げられ、大家はけもの荘を経営する実権を失った。')],
 clear:[dl('大家さん、今日は……助かった。','sad'),dm('じゃあまず、さっきの四人に訂正の連絡だ。変な期待を持たせたところは、お前も謝れ。'),dl('えー、お説教まで付いてるの？'),dm('彼氏代行は終了。ここからは大家の通常業務だ。'),dc('延長料金は家賃に上乗せニャ。'),dm('お前が請求するな。'),dl('……分かった。曖昧にして逃げるの、やめる。忘れ物も自分で取りに行く。','neutral'),dm('一人で不安なら相談しろ。ただし、結婚は相談料に含まれてねぇからな。'),dl('ふふ。じゃあ、お礼はお茶で♡'),dc('モクにはツナ缶ニャ。'),dm('お前、結局それか！'),dn('ルナは四件の連絡を済ませ、スマートフォンをしまった。管理鍵は、大家の手に戻っている。'),dl('……ありがと。大家さん。','neutral'),dm('ああ。次は呼び鈴、一人ずつで頼む。'),dc('予約制の迷惑男ニャ。'),dm('予約も受け付けねぇよ！！')]
 };
 return [...victory,...endings[outcome].map(line=>({...line,duelEnding:outcome}))];
}

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
 {enemy:'fiance',name:'花束の自称婚約者',lines:[dn('花束男「結婚するなら優しい人がいいって言ったよね？ 毎日おはようを送った！ つまり婚約だ！」'),dl('好みの話が、いつの間にか婚姻届に……。','surprised'),dm('朝の挨拶を役所に提出するな。'),dc('モクも大家におはようって言ったニャ。危なかったニャ。')],choices:[
 ['vow','こいつの明日は、俺が守る！','俺が守る！',3],['boundary','好みと約束は別だ。本人の返事を聞け！','約束は別だ！',1],['help','花束、モク宛てってことにできない？','モク、頼む！',-1]]},
 {enemy:'gifter',name:'買い物王',lines:[dn('買い物王「これだけ貢いだんだ！ 俺にはルナちゃんに会う権利がある！」'),dl('プレゼントは嬉しいけど、面会券は付いてないよ？'),dm('待て。その抱き枕、誰が売った。'),dl('……通販って便利だよね♡'),dc('本人より先に枕が入居しそうニャ。')],choices:[
 ['shield','金額でこいつの笑顔は買わせねぇ！','笑顔は売り物じゃねぇ！',3],['receipt','贈り物と交際は別会計だ！','別会計だ！',1],['discount','俺の家賃も、ついでに貢いでくれない？','モク、頼む！',-1]]},
 {enemy:'salesman',name:'うさんくさい勧誘男',lines:[dn('勧誘男「ルナさんは僕と夢を追うと！ まずは大家さんが最上位会員に……」'),dl('夢の話はしたけど、会費の話は初耳♡'),dm('夢に月額料金をつけるな！'),dc('寝るだけならモクが無料で教えるニャ。')],choices:[
 ['future','こいつの未来に、勝手な値札をつけるな！','未来を売るな！',3],['cancel','本人が断ってる。勧誘もここで終了だ！','勧誘終了！',1],['sleep','モク先生の無料お昼寝講座に変更で……','モク、頼む！',-1]]},
 {enemy:'boss',name:'黒服の迎え役',lines:[dn('黒服「迎えに来た。ルナ、お前が『いつでも戻る』と言ったんだろう」'),dl('あれはお店で忘れ物を受け取る話！ 働きに戻るとは言ってない！','angry'),dm('お前も言葉を省略しすぎだ！！'),dc('全員、都合のいいところだけ聞いてるニャ。'),dn('黒服が腕を組む。大家はルナの前に立った。')],choices:[
 ['ultimate','大家流超絶漢気奥義！','大家流超絶漢気奥義！',7],['leave','忘れ物だけ返せ。今の暮らしは本人が決める！','本人が決める！',1],['catapult','お引き取りは……こちらの猫まで！','モク、頼む！',-1]]}
];
export const duelOutcome=hearts=>hearts>=10?'yandere':hearts<=1?'domination':'clear';
export const duelChoices=round=>DUEL_ROUNDS[round]?.choices.map(([id,label,attack,delta])=>({id,label,attack,delta}))||[];
export function duelEncounterLines(round){return DUEL_ROUNDS[round].lines.map(line=>({...line,duelRound:round}));}
export function duelReplyLines(round,choice){
 const weak=choice.delta<0;
 return [duelLine('manager',choice.label,'neutral',{duelRound:round}),
  ...(weak?[dc('大家の口座も度胸も残高不足ニャ。'),duelLine('cat','出張お断りキックニャ！！','angry',{duelRound:round,duelAttack:'モク出動！',duelRank:1})]:[duelLine('manager',choice.attack,'angry',{duelRound:round,duelAttack:choice.attack,duelRank:choice.delta===7?4:choice.delta===3?3:2})]),
  duelLine('narrator',weak?'廊下のモクが跳び出した。一直線の体当たりに、男は道路の向こうへすっ飛んだ。':'大家のひと言に男はのけぞり、足をもつれさせて逃げていった。','neutral',{duelRound:round,duelDefeated:true}),
  duelLine('hostess',weak?'……大家さんより、モクちゃんに頼む方が早いね。':choice.delta>=3?'今の、ずるい……♡ もっと言ってほしいな。':'ありがとう。……あたしからも、ちゃんと断るね。',weak?'tired':'shy',{duelRound:round,duelHeartUpdate:true}),
  dc(weak?'助っ人の報酬はツナ缶ニャ。':'大家、決め顔のまま鼻の下を伸ばすなニャ。'),dm(weak?'家賃と相殺な。':'伸ばしてねぇ！！')
 ].map(line=>({...line,duelRound:round}));
}
export function duelEndingLines(outcome){
 const victory=[dn('四人の足音が遠ざかり、けもの荘の前に静けさが戻った。'),dm('……全員、帰った！'),dc('玄関前の渋滞解消ニャ。')].map(line=>({...line,duelRound:3,duelDefeated:true}));
 const endings={
 yandere:[dl('うん。これで、邪魔する人はいなくなったね♡','shy'),dm('……ルナ？'),dl('あんなに守ってくれるんだもん。あたしも大家さんを守らなきゃ。誰にも会わせないように♡'),dn('ルナの指が大家の上着をつかむ。反対の手では、管理室の鍵が揺れていた。'),dl('集金？ あたしがするよ。内見？ あたしだけ見て。外出？ ……誰に会うの？'),dm('待て。それじゃ仕事が……。'),dl('お仕事とあたし、比べる必要ある？ ずっと一緒だよね、大家さん♡'),dc('大家の募集条件が「ルナ以外お断り」になったニャ。'),dn('入居希望者も業者も門前払い。閉じた管理室で二人きりの日々だけが続き、けもの荘の経営は止まった。')],
 domination:[dl('大家さん。そこ、立ってないで。','tired'),dm('へ？'),dl('モクちゃんのツナ缶買って、廊下を磨いて、帳簿はあたしに渡して。返事は？'),dm('……はい。'),dc('大家が管理される側になったニャ。'),dl('自分で何も決められないんでしょ？ じゃあ、鍵もお金もあたしが持つね♡'),dn('ルナは管理椅子に腰を下ろし、指先で次の仕事を示した。大家は口を開きかけ、また頭を下げた。'),dl('言い訳は聞いてないよ。終わったら報告。褒めるかどうかは、あたしが決めるから。'),dc('大家、家賃の交渉だけは……ニャ？'),dm('……まずルナに、お伺いを……。'),dn('修繕も募集もルナの気分次第。管理鍵と帳簿を取り上げられ、大家はけもの荘を経営する実権を失った。')],
 clear:[dl('大家さん、今日は……助かった。','sad'),dm('じゃあまず、さっきの四人に訂正の連絡だ。変な期待を持たせたところは、お前も謝れ。'),dl('えー、お説教まで付いてるの？'),dm('彼氏代行は終了。ここからは大家の通常業務だ。'),dc('延長料金は家賃に上乗せニャ。'),dm('お前が請求するな。'),dl('……分かった。曖昧にして逃げるの、やめる。忘れ物も自分で取りに行く。','neutral'),dm('一人で不安なら相談しろ。ただし、結婚は相談料に含まれてねぇからな。'),dl('ふふ。じゃあ、お礼はお茶で♡'),dc('モクにはツナ缶ニャ。'),dm('お前、結局それか！'),dn('ルナは四件の連絡を済ませ、スマートフォンをしまった。管理鍵は、大家の手に戻っている。'),dl('……ありがと。大家さん。','neutral'),dm('ああ。次は呼び鈴、一人ずつで頼む。'),dc('予約制の迷惑男ニャ。'),dm('予約も受け付けねぇよ！！')]
 };
 return [...victory,...endings[outcome].map(line=>({...line,duelEnding:outcome}))];
}

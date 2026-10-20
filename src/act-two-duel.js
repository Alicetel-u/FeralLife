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
 ['vow','こいつの明日は、俺が守る！',3],['boundary','好みと約束は別だ。本人の返事を聞け！',1],['help','花束、モク宛てってことにできない？',-2]]},
 {enemy:'gifter',name:'買い物王',lines:[dn('買い物王「これだけ貢いだんだ！ 俺にはルナちゃんに会う権利がある！」'),dl('そんなに買ってたの……？','surprised'),dm('待て。その抱き枕、誰が売った。'),dl('……通販って便利だよね♡'),dc('本人より先に枕が入居しそうニャ。')],choices:[
 ['shield','金額でこいつの笑顔は買わせねぇ！',3],['receipt','贈り物と交際は別会計だ！',1],['discount','俺の家賃も、ついでに貢いでくれない？',-2]]},
 {enemy:'salesman',name:'うさんくさい勧誘男',lines:[dn('勧誘男「ルナさんは僕と夢を追うと！ まずは大家さんが最上位会員に……」'),dl('夢の話はしたけど、会費の話は初耳♡'),dc('寝るだけならモクが無料で教えるニャ。')],choices:[
 ['future','こいつの未来に、勝手な値札をつけるな！',3],['cancel','本人が断ってる。勧誘もここで終了だ！',1],['sleep','モク先生の無料お昼寝講座に変更で……',-2]]},
 {enemy:'boss',name:'黒服の迎え役',lines:[dn('黒服「迎えに来た。ルナ、お前が『いつでも戻る』と言ったんだろう」'),dl('あれはお店で忘れ物を受け取る話！ 働きに戻るとは言ってない！','angry'),dc('全員、都合のいいところだけ聞いてるニャ。'),dn('黒服が腕を組む。大家はルナの前に立った。')],choices:[
 ['ultimate','大家流超絶漢気奥義！',7],['leave','忘れ物だけ返せ。今の暮らしは本人が決める！',1],['catapult','モク流奥義・煙ノ肉球乱舞を頼む！',-4]]}
];
export const duelOutcome=hearts=>hearts>=10?'yandere':hearts<=1?'domination':'clear';
export const duelChoices=round=>DUEL_ROUNDS[round]?.choices.map(([id,label,delta])=>({id,label,attack:label,delta}))||[];
export function duelEncounterLines(round){return DUEL_ROUNDS[round].lines.map(line=>({...line,duelRound:round}));}
// Each answer has its own short exchange. Stored transcripts remain unchanged on reload.
const DUEL_REPLIES={
 vow:{
  retreat:'花束男は「明日まで！？」と声を裏返らせ、花束を抱えて走り去った。',
  luna:'明日も守ってくれるんだ……♡ じゃあ、朝いちばんに会いに行ってもいい？',emotion:'shy',
  moku:'大家、一日だけの彼氏が明日の予約まで取ってるニャ。',manager:'警備の話だ！！ 予約は取ってねぇ！'},
 boundary:{
  retreat:'花束男はルナの「婚約してません」を聞くと、花束で顔を隠して引き返した。',
  luna:'好みを聞かれただけなのにね。……うん、婚約してないって、ちゃんと言えた。',emotion:'neutral',
  moku:'おはようで婚約なら、モクは近所中と結婚してるニャ。',manager:'だから挨拶だけで籍は入らねぇんだよ。'},
 help:{
  windup:'勝手にモクの縁談をまとめるなニャ。',attack:'その縁談、お断りニャ！！',
  retreat:'廊下から跳んできたモクの体当たりに、花束男は花びらを散らして逃げ出した。',
  luna:'あたしの代わりにモクちゃんを差し出すの……？ 大家さん、そこは頑張ってよ。',emotion:'tired',
  moku:'仲人料じゃなくて迷惑料を払うニャ。',manager:'悪かった！ 次から自分で断る！'},
 shield:{
  retreat:'買い物王は抱き枕をぎゅっと抱え、「返品だ！」と叫びながら遠ざかった。',
  luna:'じゃあ、この笑顔は大家さんにあげる♡ ……お金じゃ買えないんだもんね？',emotion:'shy',
  moku:'無料の笑顔がいちばん高くつきそうニャ。',manager:'勝手に見積もるな。俺は買ってねぇ。'},
 receipt:{
  retreat:'買い物王はレシートと抱き枕を交互に見て、通販の問い合わせ先を探しながら帰っていった。',
  luna:'贈り物を受け取ったら、断っちゃいけない気がしてた。……そこは別でいいんだね。',emotion:'neutral',
  moku:'じゃあツナ缶をもらっても、家賃は払わなくていいニャ？',manager:'それは別会計にならねぇ。払え。'},
 discount:{
  windup:'便乗して貢がせる相手を増やすなニャ。',attack:'押し売りまとめて返品ニャ！！',
  retreat:'モクが廊下から跳びかかった。買い物王は抱き枕を盾にしながら、慌てて通りへ逃げた。',
  luna:'大家さんまで貢いでもらう側に回らないでよ。……あたしを断る話はどこ行ったの？',emotion:'tired',
  moku:'大家の抱き枕も売って穴埋めするニャ？',manager:'売るな！！ それで家賃の穴が埋まるか！'},
 future:{
  retreat:'勧誘男は申込書を背中に隠し、「またの機会に」と言い残して早足で去った。',
  luna:'あたしの未来、そんなふうに考えてくれるんだ。……大家さんの隣も、空けといてね♡',emotion:'shy',
  moku:'値札を剥がしたら、大家の隣に予約が入ったニャ。',manager:'隣室の入居審査みたいに言うな！'},
 cancel:{
  retreat:'勧誘男は開きかけたパンフレットを閉じ、営業用の笑顔のまま後ずさった。',
  luna:'断っても話を続けられるから困ってたの。……あたし、もう入らないって言う。',emotion:'neutral',
  moku:'モクも掃除当番を断ったら終了でいいニャ？',manager:'それは勧誘じゃなくて当番だ。ほうきを持て。'},
 sleep:{
  windup:'講座は休講ニャ。いまから実技だけやるニャ。',attack:'迷惑営業、おやすみニャ！！',
  retreat:'モクは廊下を蹴って飛び出した。勧誘男は体当たりに押し出され、会員募集の声ごと遠ざかった。',
  luna:'大家さん、断るところまでモクちゃんに丸投げ……。無料だからって頼りすぎじゃない？',emotion:'tired',
  moku:'無料なのは昼寝だけニャ。起こした分は有料ニャ。',manager:'さっきまで普通に起きてただろ！'},
 ultimate:{
  retreat:'黒服は大家の剣幕に一歩退き、何か言い返そうとして、結局そのまま踵を返した。',
  luna:'……あたしのために、そこまでしてくれるんだ。今の大家さん、ずっと見てたい……♡',emotion:'shy',
  moku:'奥義のあともその構えニャ？ 肩、つるニャ。',manager:'……先に言え。もうちょっとつってる。'},
 leave:{
  retreat:'黒服はルナの返事を聞き、舌打ちをひとつ残して通りの向こうへ消えた。',
  luna:'うん。忘れ物は受け取る。でも働きには戻らない。……あたしが、そう決めた。',emotion:'neutral',
  moku:'ついでにモクの暮らしも、昼寝中心に決めたいニャ。',manager:'お前は最初からそう暮らしてるだろ。'},
 catapult:{
  windup:'煙幕代はツナ缶三つニャ。目、閉じとくニャ！',attack:'モク流奥義・煙ノ肉球乱舞ニャ！！',
  retreat:'モクが吐いた煙が黒服の目の前でふわりと広がった。煙の中から肉球がぽふぽふぽふっと頬を連打する。黒服は両頬を押さえ、道路へ逃げていった。',
  luna:'最後までモクちゃん任せなんだ……。大家さん、せめてあたしの前に立っててほしかった。',emotion:'tired',
  moku:'煙に巻いてお見送りニャ。大家、ツナ缶は三つニャ。',manager:'分かったから、俺の顔に煙を吐くな！！'}
};
export function duelReplyLines(round,choice){
 const weak=choice.delta<0,reply=DUEL_REPLIES[choice.id];
 return [duelLine('manager',choice.label,weak?'neutral':'angry',weak?{duelWindup:true}:{duelAttack:choice.label,duelRank:choice.delta===7?4:choice.delta===3?3:2}),
  ...(weak?[{...dc(reply.windup),duelWindup:true},duelLine('cat',reply.attack,'angry',{duelAttack:reply.attack,duelRank:1,...(choice.id==='catapult'?{duelCatUltimate:true}:{})})]:[]),
  duelLine('narrator',reply.retreat,'neutral',{duelDefeated:true,duelPlayback:true}),
  duelLine('hostess',reply.luna,reply.emotion,{duelHeartUpdate:true}),
  dc(reply.moku),dm(reply.manager)
 ].map(line=>({...line,duelRound:round}));
}
// This deterioration belongs only to the high-heart BAD branch.
// Keep the final illustration behind an explicit reveal, not the outcome flag.
export function duelYandereEndingLines(){
 // Exactly five daily exchanges. Day transitions are presentation-only:
 // they must not advance simulation time or change saved game clocks.
 const day=(number,luna,manager,emotion='happy')=>[
  {...dl(luna,emotion),duelEndingPhase:'day-'+number,duelStoryDay:number,duelDayStart:true},
  {...dm(manager),duelEndingPhase:'day-'+number,duelStoryDay:number}
 ];
 return [
  ...day(1,'大家さ〜ん♡ 昨日のこと思い出したら、また好きになっちゃった♡','……いや、俺は大家として当然のことをしただけだぞ？','happy'),
  ...day(2,'大家さんのために、お弁当作ったの♡ 朝・昼・晩の三食分♡','……ありがたいけど、なんで全部ハート形なんだよ。','shy'),
  ...day(3,'大家さんの予定、全部あたしのスマホに入れといたよ♡','……なんで俺より俺の予定に詳しいんだよ！？','neutral'),
  ...day(4,'今日の内見のお客さん？ 大家さんが疲れちゃうから、全部断っといた♡','おい！！ それ俺の仕事だぞ！？ 勝手に断るな！！','neutral'),
  ...day(5,'もう誰にも邪魔されないように、大家さんのお部屋、外から鍵かけちゃった♡','……おい、ルナ。冗談だろ……？ 開けろ！！','shy'),
  {...dl('……ねえ、大家さん。これからは、あたし以外の声に返事しちゃダメだよ♡','shy'),duelEndingPhase:'reveal',duelStoryDay:5},
  {...dm('……頼む、ルナ。俺をここから出してくれ……。'),duelEndingPhase:'reveal',duelStoryDay:5},
  {...dl('ふふっ♡ 大丈夫。あたしはずーっと、そばにいるからね♡','shy'),duelEndingPhase:'reveal',duelStoryDay:5}
 ];
}

export function duelEndingLines(outcome){
 const victory=[dn('四人の足音が遠ざかり、けもの荘の前に静けさが戻った。'),dm('……全員、帰った！'),dc('玄関前の渋滞解消ニャ。')].map(line=>({...line,duelRound:3,duelDefeated:true}));
 const introductions={
  yandere:[
   dl('……大家さん、すごい。あたしのために、あんなに必死になってくれるなんて……♡','shy'),
   dm('いや、別にお前のためだけってわけじゃ……。'),
   dl('ふふっ♡ もう、隠さなくてもいいのに♡','happy'),
   dc('……なんか、話が噛み合ってないニャ。'),
   dl('ねえ大家さん。これからも、ずーっと守ってくれるよね？♡','shy'),
   dm('……おい、なんでそうなる。')
  ],
  domination:[
   dl('……大家さん。さっきの、ちょっとひどかったよね？','tired'),
   dm('……え？'),
   dl('あたしに全部押し付けて、自分じゃ何も決められなくて。','tired'),
   dm('いや、それは……。'),
   dl('ふーん。言い訳はできるんだ？','tired'),
   dc('……大家、急に小さくなったニャ。'),
   dl('じゃあ大家さん。これからは、あたしの言うこと聞いてね？','tired'),
   dm('……はい。')
  ],
  clear:[
   dl('……はぁ〜。やっと帰ってくれたぁ……。','neutral'),
   dm('お前なぁ……二度とこんな騒ぎ起こすなよ？'),
   dl('えへへ……でも、大家さん、ちょっとカッコよかったよ♡','shy'),
   dm('褒めても説教はなくならねぇぞ。'),
   dc('大家、顔がちょっと赤いニャ。'),
   dm('赤くねぇ！！'),
   dl('ふふっ♡','happy')
  ]
 };
 const endings={
 yandere:duelYandereEndingLines(),
 domination:[dl('大家さん。そこ、立ってないで。','tired'),dm('へ？'),dl('モクちゃんのツナ缶買って、廊下を磨いて、帳簿はあたしに渡して。返事は？'),dm('……はい。'),dc('大家が管理される側になったニャ。'),dl('自分で何も決められないんでしょ？ じゃあ、鍵もお金もあたしが持つね♡'),dn('ルナは管理椅子に腰を下ろし、指先で次の仕事を示した。大家は口を開きかけ、また頭を下げた。'),dl('言い訳は聞いてないよ。終わったら報告。褒めるかどうかは、あたしが決めるから。'),dc('大家、家賃の交渉だけは……ニャ？'),dm('……まずルナに、お伺いを……。'),dn('修繕も募集もルナの気分次第。管理鍵と帳簿を取り上げられ、大家はけもの荘を経営する実権を失った。')],
 clear:[dl('大家さん、今日は……助かった。','sad'),dm('じゃあまず、さっきの四人に訂正の連絡だ。変な期待を持たせたところは、お前も謝れ。'),dl('えー、お説教まで付いてるの？'),dm('彼氏代行は終了。ここからは大家の通常業務だ。'),dc('延長料金は家賃に上乗せニャ。'),dm('お前が請求するな。'),dl('……分かった。曖昧にして逃げるの、やめる。忘れ物も自分で取りに行く。','neutral'),dm('一人で不安なら相談しろ。ただし、結婚は相談料に含まれてねぇからな。'),dl('ふふ。じゃあ、お礼はお茶で♡'),dc('モクにはツナ缶ニャ。'),dm('お前、結局それか！'),dn('ルナは四件の連絡を済ませ、スマートフォンをしまった。管理鍵は、大家の手に戻っている。'),dl('……ありがと。大家さん。','neutral'),dm('ああ。次は呼び鈴、一人ずつで頼む。'),dc('予約制の迷惑男ニャ。'),dm('予約も受け付けねぇよ！！')]
 };
 return [...victory.map((line,i)=>i===0?{...line,duelVictoryResult:outcome}:line),...[...introductions[outcome],...endings[outcome]].map(line=>({...line,duelEnding:outcome}))];
}

import {failedChoiceKeys} from './choice-history.js';
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
  ash:{at:23,title:'第一の火種：灰皿がもう限界ニャ！',call:'灰皿がもう限界ニャ！',detail:'1日目23時。101号室。テーブルにはストロング缶、灰皿には山盛りの吸い殻。まだ熱い吸い殻をどうするか、モクが大家へ相談してきた。',lines:[
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
      am('……は？ 何言ってんだ、お前。'),
      ac('neutral','なんか、ゴミ袋から煙が出てるニャ。'),
      am('煙……？'),
      am('……って、おい！！ 燃えてんじゃねぇか！！'),
      ac('surprised','ニャ！？ ほんとだニャ！'),
      an('ゴミ袋から炎が噴き上がる。積み上げられた段ボールに火が移り、部屋の空気が一気に熱くなる。'),
      am('くそっ、もう無理だ！ モク、逃げるぞ！！'),
      ac('surprised','えっ、でもテレビつけっぱなしニャ！'),
      am('テレビなんかどうでもいい！！ 命が先だろ！！'),
      an('大家はモクの腕をつかみ、煙の中を出口へ走った。'),
      ac('neutral','……大家。'),
      am('なんだよ！ 今度は！！'),
      ac('tired','……明日から、ちゃんと片づけるニャ。'),
      am('だから今日やれって言ってんだろぉぉ！！'),
      an('二人が外へ飛び出した直後、101号室の窓から炎が噴き出した。'),
      an('火は瞬く間に建物全体へ広がっていく。'),
      an('けもの荘は、全焼した。')
    ],regret:'ゴミと一緒に捨てろなんて……火が残ってるって言ってたのに。',clue:'消えていない吸い殻をゴミ袋に入れてはいけない。',ending:'燃えるゴミの日'},
    {id:'balcony',label:'ベランダからポイしとけ！',bad:'ash-balcony',lines:[
      am('ベランダからポイしとけ！'),
      ac('happy','おっ、証拠隠滅ニャ！'),
      an('モクは吸い殻をベランダから投げ捨てた。'),
      ac('happy','これで灰皿スッキリニャ！'),
      an('数分後。ベランダの外から、焦げ臭い匂いが漂ってきた。'),
      ac('neutral','……大家。なんか下が明るいニャ。'),
      an('大家がベランダから下をのぞくと、ゴミ置き場から炎が上がっていた。'),
      am('……は！？ おいおいおい！ 下、燃えてんじゃねぇか！！'),
      ac('surprised','ニャ！？ ゴミ置き場がキャンプファイヤーになってるニャ！'),
      am('キャンプじゃねぇよ！！ お前、まだ火ついてたのか！？'),
      ac('neutral','……だから、まだ熱いって言ったニャ。'),
      am('……あ。'),
      {...am('……待てよ。外に捨てろって言ったの、俺じゃねぇか。'),innerVoice:true},
      an('炎は段ボールに燃え移り、建物の外壁へと広がっていく。'),
      am('……くそっ。とにかく逃げるぞ、モク！'),
      ac('surprised','待つニャ！ 洗濯物、まだ干してあるニャ！'),
      am('いいから来い！ 今は命が先だ！！'),
      an('大家はモクの腕をつかみ、煙の立ち込める廊下を走った。'),
      {...am('何やってんだ、俺……。こんなことになるって、少し考えりゃ分かっただろ……。'),innerVoice:true},
      an('二人が振り返ると、101号室のベランダは炎に包まれていた。'),
      ac('sad','……大家。けもの荘、なくなっちゃうニャ……？'),
      am('……。'),
      an('大家には、返す言葉がなかった。'),
      an('火は瞬く間に建物全体へ広がっていく。'),
      an('けもの荘は、全焼した。')
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
      am('チャーハンの心配してる場合かよ！ 火！ 火がついてんぞ！！'),
      ac('surprised','ニャ！？ 紙くずが燃えてるニャ！'),
      am('とにかく水！ 早く持ってこい！'),
      ac('neutral','それなら最初から水でよかったんじゃないかニャ……？'),
      am('……あ。'),
      {...am('……確かに。なんで冷凍庫なんて言ったんだ、俺。'),innerVoice:true},
      an('火は床のゴミから段ボールへ燃え移り、黒い煙が部屋を満たしていく。'),
      am('くそっ、もう間に合わねぇ！ モク、逃げるぞ！'),
      ac('surprised','待つニャ！ 冷凍庫のチャーハン、出しっぱなしニャ！'),
      am('もうチャーハンは諦めろ！ 命の方が大事だろ！！'),
      an('大家はモクの腕をつかみ、煙の中を出口へ走った。'),
      {...am('……モクは言われたとおりにしただけだ。俺がちゃんと考えてりゃ、こんなことには……。'),innerVoice:true},
      ac('sad','……大家。'),
      am('……なんだ？'),
      ac('sad','……チャーハン、もう食べられないかニャ。'),
      am('……帰る場所もなくなりそうなんだぞ。'),
      an('二人が外へ飛び出した直後、101号室の窓から炎が噴き出した。'),
      an('火は瞬く間に建物全体へ広がっていく。'),
      an('けもの荘は、全焼した。')
    ],regret:'冷やす前に、火を消せばよかった……。',clue:'冷凍庫へ運ぶ前に、吸い殻の火を確実に消すべきだった。',ending:'冷凍失敗、建物はこんがり'},
    {id:'water',label:'灰皿ごと水に沈めろ！',lines:[
      am('灰皿ごと水に沈めろ！'),
      ac('surprised','灰皿を溺れさせるニャ！？'),
      am('火を消すんだよ！'),
      ac('angry','……最初からそう言えニャ！'),
      an('モクは吸い殻を水で確実に消火し、灰皿を安定した安全な場所へ置いた。'),
      ac('happy','ふぅ……これで安心ニャ。'),
      am('最初からやれよ！'),
      ac('happy','いやぁ、大家に聞いて正解だったニャ。'),
      am('こんなことで毎回呼ぶなよ……。'),
      ac('neutral','でも、勝手にやって失敗したら怒るんだろニャ？'),
      am('……それはそうだけどよ。'),
      ac('happy','じゃあ、これからも困ったら大家に相談するニャ。'),
      am('なんかうまいこと使われてる気がする……。'),
      ac('neutral','明日からちゃんとするニャ。'),
      am('今日やれ！！')
    ],clue:'前の周回で失ったものを思い出した。吸い殻は水で確実に消火する。'}
  ]},
  dinner:{at:37,title:'第二の火種：寝不足なのに料理すんな！',call:'寝不足なのに料理すんな！',detail:'2日目13時。昼過ぎの101号室。朝まで動画を見ていたモクが、眠そうな顔でフライパンを握っている。テーブルにはストロング缶とカップ麺の容器。',lines:[
    an('昼過ぎの101号室。昨夜から動画を見続けていたモク。テーブルには飲みかけのストロング缶と、食べ終わったカップ麺の容器。本人はフライパンを片手に、今にも寝落ちしそうになっている。'),
    ac('tired','大家さ〜ん……腹減ったニャ……。'),
    am('うわっ、なんだその顔！ ゾンビかよ！'),
    ac('tired','昨日、ちょっと夜更かししたニャ……。'),
    am('ちょっと？ 何時まで起きてたんだよ。'),
    ac('shy','朝の……8時くらいニャ。'),
    am('それもう夜更かしじゃねぇだろ！ 朝まで何やってたんだ！？'),
    ac('tired','動画見てたニャ……。あと一本だけって思ってたら、朝になってたニャ。'),
    am('何本見たんだよ……。'),
    ac('tired','……覚えてないニャ。'),
    am('そこまで見たらもう修行だろ！！'),
    an('モクは大きなあくびをすると、フライパンをコンロに置いた。'),
    ac('tired','とりあえず……飯作るニャ……。'),
    am('おい待て。その状態で火使う気か！？'),
    ac('tired','大丈夫ニャ……。料理くらい、目つぶっててもできるニャ……。'),
    am('目つぶるな！！ 寝るだろ！！'),
    ac('tired','……じゃあ片目だけにするニャ。'),
    am('そういう問題じゃねぇ！！'),
    ac('tired','……大家、さっきから声でかいニャ。頭に響くニャ……。'),
    am('誰のせいだよ！！'),
    ac('tired','……もう考えるのも面倒ニャ。大家、どうすればいいニャ……？'),
    am('はぁ……結局、俺が決めるのかよ……。')
  ],choices:[
    {id:'coronation',label:'先にタバコでも吸って落ち着け！',lines:[
      am('先にタバコでも吸って落ち着け！'),
      ac('happy','おっ、大家もたまにはいいこと言うニャ。'),
      am('ただしコンロには触るなよ！ まずその眠気をどうにかしろ！'),
      ac('tired','わかってるニャ……。ちょっと一服するだけニャ……。'),
      an('モクはソファに腰掛け、タバコに火をつけた。'),
      ac('tired','はぁ〜……落ち着くニャ……。'),
      am('……おい、目が閉じかけてるぞ。'),
      ac('tired','閉じてないニャ……ちょっと休憩してるだけニャ……。'),
      am('だからタバコ持ったまま寝るなって……。'),
      ac('tired','すぅ……すぅ……。'),
      am('寝てんじゃねぇか！！'),
      an('その瞬間、モクの指から火のついたタバコが滑り落ちた。'),
      am('……っ！！ 危ねぇ！！'),
      an('大家はとっさに手を伸ばし、落ちてきたタバコを素手で受け止めた。'),
      am('あっっっっちぃぃぃぃ！！！！'),
      am('何してんだこのバカ猫！！ 火事になるだろうがぁぁ！！'),
      an('大家は慌ててタバコを安全に消火し、灰皿を片づけた。'),
      ac('tired','……んにゃ……大家……うるさいニャ……。'),
      am('誰のせいで騒いでると思ってんだよ！！'),
      ac('tired','……あと五分……寝かせてニャ……。'),
      am('五分で足りるか！！ 今日はもう寝てろ！！ 料理は禁止だ！！'),
      an('大家はモクの手から残りのタバコを遠ざけ、ソファに毛布を掛けてやった。'),
      ac('tired','……ありがとニャ……。'),
      am('……ったく。手のかかる猫だな。'),
      an('モクはそのまま深い眠りについた。'),
      am('……腹減ってんのは俺もなんだけどな。'),
      an('こうして、けもの荘は今日も全焼を免れた。')
    ],clue:'寝不足のモクをコンロから離し、落とした火種は大家がすぐに消した。'},
    {id:'turbo',label:'俺が見張ってるから好きに作れ！',bad:'dinner-turbo',lines:[
      am('俺が見張ってるから好きに作れ！'),
      ac('happy','おっ、今日は監督付きニャ。安心ニャ〜。'),
      am('ただし、寝そうになったら即中止だからな！'),
      ac('neutral','わかってるニャ。そこまで子供じゃないニャ。'),
      an('モクはフライパンに油をひき、コンロに火をつけた。'),
      ac('tired','今日はチャーハンにするニャ……。'),
      am('お前、冷凍チャーハン持ってただろ。あれでいいじゃねぇか。'),
      ac('neutral','あれは非常食ニャ。今は通常時ニャ。'),
      am('非常事態みてぇな顔してんだろうが！'),
      ac('tired','……大家、ちょっと頼みがあるニャ。'),
      am('今度はなんだよ。'),
      ac('tired','冷蔵庫の麦茶、取ってほしいニャ。喉カラカラだニャ……。'),
      am('自分で取れよ……。ったく。'),
      an('大家が冷蔵庫へ向かった、そのわずかな間だった。'),
      ac('tired','……ふぁぁ……。'),
      an('モクの手からフライパンの柄が離れる。身体がゆっくり傾き、コンロの前で眠り込んでしまった。'),
      am('おい、麦茶……って、寝てんじゃねぇか！！'),
      an('大家が駆け寄ろうとした瞬間、フライパンの油から炎が上がった。'),
      am('うわっ！？ おい！！ 火！ 火が出てんぞ！！'),
      ac('surprised','……ニャ？ チャーハン、もうできたニャ……？'),
      am('できてねぇよ！！ 部屋が燃えてんだよ！！'),
      an('炎はコンロの周囲に置かれた紙袋へ燃え移り、黒煙が立ち上る。'),
      {...am('くそっ……！ 見張ってるって言ったのに、何やってんだ俺！！'),innerVoice:true},
      am('モク！！ もういい、逃げるぞ！！'),
      ac('surprised','ニャ！？ ご飯はどうするニャ！？'),
      am('こんな時に飯の心配すんな！！'),
      an('大家はモクを引っ張り、煙の立ち込める101号室から逃げ出した。'),
      an('火は瞬く間に建物全体へ広がっていく。'),
      an('けもの荘は、全焼した。')
    ],regret:'見張ると約束したのに、少し目を離したせいで……。',clue:'眠気の強い状態で火を使う料理をさせてしまった。'},
    {id:'show',label:'腹減ってんなら俺をパシれ！',bad:'dinner-show',lines:[
      am('腹減ってんなら俺をパシれ！'),
      ac('surprised','……ニャ？ 大家が買い物行ってくれるニャ？'),
      am('お前にコンロ使わせるよりマシだろ。何食いたい？'),
      ac('happy','唐揚げ弁当。大盛り。あとプリンも頼むニャ。'),
      am('遠慮って言葉、知ってるか？'),
      ac('neutral','知ってるけど、今は使わないニャ。'),
      am('……ったく。絶対に火使うなよ！ 弁当買ってくるから！'),
      ac('happy','わかったニャ〜。行ってらっしゃいニャ〜。'),
      an('大家は財布を片手に、近所のコンビニへ向かった。'),
      ac('neutral','……さて、飯作るかニャ。'),
      an('モクは迷うことなくコンロに火をつけた。'),
      ac('neutral','大家が帰ってくるまでに、ちょっと何か食べるニャ。'),
      an('冷蔵庫を開けると、昨日の残りのソーセージが転がっていた。'),
      ac('happy','おっ、ちょうどいいニャ。'),
      an('モクはフライパンにソーセージを放り込んだ。'),
      ac('tired','……焼けるまで、ちょっと座るニャ。'),
      an('モクはソファに腰掛け、そのまま眠り込んでしまった。'),
      an('しばらくして、フライパンから煙が上がり、コンロの周囲に置かれた紙袋に火が燃え移った。'),
      an('一方その頃。コンビニへ向かっていた大家が、ふとアパートを振り返る。'),
      am('……ん？ なんだ、あの煙……。'),
      am('……って、おい！！ 俺のアパートじゃねぇか！！'),
      an('大家は慌てて引き返し、101号室へ駆け込んだ。'),
      am('モク！！ 起きろ！！ 火事だぞ！！'),
      ac('tired','……ニャ？ もう弁当買ってきたニャ？'),
      am('買い物すら行けてねぇよ！！ お前、火使ったな！？'),
      ac('tired','……ちょっとソーセージを……。'),
      am('あれだけ使うなって言っただろうが！！'),
      an('大家は寝ぼけたモクを引っ張り、煙の中から外へ逃げ出した。'),
      ac('tired','……大家、唐揚げ弁当は……？'),
      am('アパート燃やしといて弁当の心配かよ！！'),
      an('炎は瞬く間に建物全体へ広がっていく。'),
      an('けもの荘は、全焼した。')
    ],regret:'火を使うなと念を押したのに、モクを一人にしてしまった……。',clue:'モクは大家が買い物に行った直後、約束を破ってコンロを使っていた。'}

  ]}
};

const FIRST_ASH_TRAGEDY_LINES=[
 am('とりあえず、ゴミ袋にまとめて捨てとけ。'),
 ac('neutral','ゴミ袋でいいのかニャ？'),
 am('ああ。いつまでも灰皿いっぱいにしておくわけにもいかねえだろ。'),
 ac('neutral','わかったニャ。大家がそう言うならそうするニャ。'),
 am('……なんだよ、妙に素直だな。'),
 ac('happy','だって大家だろ？ 信用してるニャ。'),
 am('そういうときだけ都合よく信用するなよ。'),
 ac('happy','にゃはは。じゃ、ありがとニャ！'),
 an('モクが部屋の奥へ戻り、大家はその場を離れた。'),
 an('数分後。101号室の窓から、突然、黒い煙が噴き出した。'),
 {...am('……なんだ、あの煙？'),voicePerformance:'tragedy-shock'},
 an('ガラスの割れる音。窓から炎が吹き出す。'),
 {...am('おい、嘘だろ！？ モク！！'),voicePerformance:'tragedy-panic'},
 {...am('火事だ！！ 早く逃げろ！！'),voicePerformance:'tragedy-panic'},
 {...ac('tired','ゲホッ……大家……！'),voicePerformance:'tragedy-choking'},
 {...am('モク！？ まだ中にいるのか！？'),voicePerformance:'tragedy-panic'},
 {...ac('surprised','煙が……前が見えないニャ……！'),voicePerformance:'tragedy-fear'},
 {...am('待ってろ！！ 今そっちに——！'),voicePerformance:'tragedy-panic'},
 an('大家が駆け寄る。しかし、猛烈な熱気と黒煙に阻まれ、入り口へ近づけない。'),
 {...ac('sad','大家……助け……'),voicePerformance:'tragedy-fading'},
 an('激しい崩落音。炎が燃え上がり、モクの声が途切れた。'),
 {...am('モク！！'),voicePerformance:'tragedy-panic'},
 {...am('おい……返事しろよ……！'),voicePerformance:'tragedy-grief'},
 {...am('モク……頼む、返事をしてくれ。'),voicePerformance:'tragedy-grief'},
 an('返事はなかった。')
];

export function getActOneChoices(s,scene){
  const choices=ACT_ONE_EVENTS[scene]?.choices||[];
  return scene==='ash'&&s.actOne?.attempt===1?choices.filter(c=>c.id==='trash').map(c=>({...c,label:'とりあえず、ゴミ袋にまとめて捨てとけ'})):choices.filter(c=>scene!=='ash'||c.id!=='freezer');
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
  saveStoryCheckpoint(s,'ash','初めてモクの部屋を訪ねた夕暮れ');
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
      am("そういう意味じゃねぇよ……。"),
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
      am("お前も住んでんだろ！！"),
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
  const firstTragedy=p.scene==='ash'&&a.attempt===1&&choiceId==='trash';
  const replyLines=firstTragedy?FIRST_ASH_TRAGEDY_LINES:choice.lines;
  const result=addEvent(s,'life','返事：'+choice.label,replyLines[0].text,[101]);
  result.actScene='reply';result.cast=['cat'];result.stageOnly=true;result.lines=replyLines.map(l=>({...l}));
  if(choice.bad){
    a.status='bad';a.failure=choice.bad;
    if(!a.memory.includes(choice.bad))a.memory.push(choice.bad);
    s.ending={name:'全焼 — '+c.title,text:choice.regret};
  }
  if(!choice.bad&&p.scene==='ash')saveStoryCheckpoint(s,'dinner','灰皿の吸い殻を片づけた夜');
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
  next.actOne.skipUnlockedScene=scene;
  next.actOne.memory=[...s.actOne.memory];
  next.actOne.chosenChoices=actOneChosenChoices(s);
  next.actOne.failedChoices=[...failedChoiceKeys(s)];
  next.actOne.started=true;next.actOne.status='playing';next.actOne.pending=null;
  delete next.actOne.conversation;
  next.actOne.rewindIntroPending=false;next.actOne.rewindTitlePending=false;
  next.ending=null;next.pending=null;
  next.events.forEach(e=>e.read=true);
  const firstLoop=s.actOne.attempt===1;
  const resumeAtAsh=scene==='ash';
  if(resumeAtAsh){
    // Restore the unanswered consultation, not the afternoon observation route.
    for(let step=0;step<4&&!next.actOne.pending;step++)advanceActOne(next,Math.max(.01,ACT_ONE_EVENTS.ash.at-next.hour));
    const consultation=next.events.find(e=>e.id===next.actOne.pending?.eventId);
    if(consultation){
      consultation.lines=[am('……なあ、モク。')];
      consultation.detail=consultation.lines[0].text;consultation.choicePresented=true;
    }
    if(!(validStoryCheckpoint(next.actOne.rollbackPoint,1)&&next.actOne.rollbackPoint.scene==='ash'&&next.actOne.rollbackPoint.state.hour===23)){
      const checkpoint={...next,actOne:{...next.actOne,pending:null}};
      saveStoryCheckpoint(checkpoint,'ash','灰皿の相談を受けた夜');
      next.actOne.rollbackPoint=checkpoint.actOne.rollbackPoint;
    }
  }
  if(scene==='dinner'){
    // Migrate older success snapshots to the unanswered cooking consultation.
    for(let step=0;step<4&&!next.actOne.pending;step++)advanceActOne(next,Math.max(.01,ACT_ONE_EVENTS.dinner.at-next.hour));
    const consultation=next.events.find(e=>e.id===next.actOne.pending?.eventId);
    if(consultation){consultation.read=false;delete consultation.choicePresented;}
    if(!(validStoryCheckpoint(next.actOne.rollbackPoint,1)&&next.actOne.rollbackPoint.scene==='dinner'&&next.actOne.rollbackPoint.state.hour===37)){
      const checkpoint={...next,actOne:{...next.actOne,pending:null}};
      saveStoryCheckpoint(checkpoint,'dinner','料理の相談を受けた昼');
      next.actOne.rollbackPoint=checkpoint.actOne.rollbackPoint;
    }
  }
  const intro=addEvent(next,'life',firstLoop?'初めての巻き戻し':'また、火事の前へ',
    firstLoop?'焼け落ちたはずの101号室が、何事もなかったように戻っている。':'また時間が戻った。'+storyCheckpointTarget(s).label+'だ。',[101]);
  intro.actScene='rewind';intro.cast=['cat'];intro.stageOnly=true;intro.read=false;
  intro.revealCharacterAt=0;
  if(resumeAtAsh||scene==='dinner'){intro.resumeChoice=true;intro.resumeScene=scene;}
  intro.lines=firstLoop?[
    an('焦げた臭いが消えた。見慣れた101号室に、モクの声が響く。'),
    ac('neutral','灰皿いっぱいになったニャ。'),
    am('……モク！？'),
    am('お前……無事なのか！？'),
    ac('neutral','無事も何も、ずっとここにいるニャ。'),
    am('いや、だって……さっきまで火事で……！'),
    ac('surprised','火事？ 何の話ニャ？'),
    an('モクはきょとんとした顔で、大家を見ている。'),
    ac('tired','大家？ 顔色悪いニャ。'),
    an('大家は震える手を握りしめ、壁の時計を見上げた。'),
    an('時計は、23時を指している。'),
    an('さっき、灰皿の相談を受けたのと同じ時刻だった。'),
    {...am('……戻ってる？ 時間が……？'),innerVoice:true},
    an('服に焦げ跡はない。息を吸っても、もう喉は痛まなかった。'),
    {...am('なんでだ……？ あんなに熱かったのに。煙も、炎も……全部覚えてる。'),innerVoice:true},
    ac('surprised','それが……さっき吸ったやつ、まだ熱いニャ。'),
    an('モクの口ぶりも、さっきと同じだ。吸い殻は、まだ捨てられていない。'),
    {...am('だったら……今度こそ、間違えられねぇ。'),innerVoice:true}
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
  next.actOne.skipUnlockedScene=Object.keys(ACT_ONE_EVENTS).find(id=>ACT_ONE_EVENTS[id].choices.some(c=>c.bad===s.actOne.failure))||'ash';
  next.actOne.rewindIntroPending=true;next.actOne.rewindIntroCursor=0;
  return next;
}
export function validActOne(s){
  const a=s?.actOne;
  if(a?.chapter===2){
    if(a.version!==1||!Number.isInteger(a.attempt)||a.attempt<1||!Number.isInteger(a.seed)||!Array.isArray(a.memory)||!Array.isArray(a.completed)||!['playing','bad','clear'].includes(a.status))return false;
    if(a.duel!==undefined){
      const d=a.duel;
      if(!Number.isInteger(d.round)||d.round<0||d.round>4||!Number.isInteger(d.hearts)||d.hearts< -10||d.hearts>16||!Array.isArray(d.history)||d.history.length!==d.round)return false;
      const ids=[['vow','boundary','help'],['shield','receipt','discount'],['future','cancel','sleep'],['ultimate','leave','catapult']];let hearts=0;
      for(let round=0;round<d.round;round++){
        const h=d.history[round],i=ids[round].indexOf(h?.choice);
        if(i<0||h.round!==round||h.before!==hearts)return false;
        // Legacy rounds retain their saved, capped scores. New answers can cross zero and ten.
        if(h.scoringVersion!==undefined&&h.scoringVersion!==2&&h.scoringVersion!==3)return false;
        const delta=[[3,1,-2],[3,1,-2],[3,1,-2],[7,1,h.scoringVersion===3?-4:-2]][round][i];
        hearts=h.scoringVersion===undefined?Math.max(0,Math.min(10,hearts+[[3,1,-1],[3,1,-1],[3,1,-1],[7,1,-1]][round][i])):hearts+delta;
        if(h.after!==hearts)return false;
      }
      if(d.hearts!==hearts)return false;
    }
    const scenes={bag:{at:62},contract:{at:81},duel:{at:84}},failures=['bag-guarantee','bag-loan','bag-return','contract-sign','contract-stamp','duel-yandere','duel-domination'];
    const chosen=['bag:guarantee','bag:loan','bag:return','contract:sign','contract:stamp','contract:refuse'];
    if(a.failedChoices!==undefined&&(!Array.isArray(a.failedChoices)||a.failedChoices.some(x=>!chosen.includes(x))))return false;
    if(!Array.isArray(a.chosenChoices)||a.chosenChoices.some(x=>!chosen.includes(x))||a.memory.some(x=>!failures.includes(x))||a.completed.some(x=>!Object.hasOwn(scenes,x)))return false;
    if(s.hour<57||s.hour>105||s.residents.length!==2||!s.residents.some(r=>r.type==='hostess'))return false;
    if(a.pending!==null&&(!scenes[a.pending?.scene]||!s.events.some(e=>e.id===a.pending.eventId&&e.actScene===a.pending.scene)))return false;
    if(a.rollbackPoint!==undefined){const p=a.rollbackPoint,saved=p?.state;if(!scenes[p?.scene]||(p.kind==='story'?!validStoryCheckpoint(p,2):saved?.hour!==scenes[p.scene].at-.5)||saved?.actOne?.rollbackPoint!==undefined||saved?.actOne?.pending!==null||saved?.actOne?.status!=='playing'||!validateSave(saved)||!validActOne(saved))return false;}
    return a.status==='playing'?!s.ending:a.status==='clear'?s.hour===105&&[2,3].includes(a.completed.length)&&!!s.ending:failures.includes(a.failure)&&!!s.ending;
  }if(!a||a.version!==1||typeof a.started!=='boolean'||!Number.isInteger(a.attempt)||a.attempt<1||!Number.isInteger(a.seed)||!Array.isArray(a.memory)||!Array.isArray(a.completed)||!['playing','bad','clear'].includes(a.status))return false;
  if(a.rollbackPoint!==undefined){
    const point=a.rollbackPoint,event=(a.chapter===2?{'bag':{at:62},'contract':{at:81}}:ACT_ONE_EVENTS)[point?.scene],saved=point?.state;
    if(!event||saved?.actOne?.rollbackPoint!==undefined||(point.kind==='story'?!validStoryCheckpoint(point,1):saved?.hour!==event.at-.5)||saved?.actOne?.pending!==null||saved?.actOne?.status!=='playing'||!validateSave(saved)||!validActOne(saved))return false;
  }
  if(a.failedChoices!==undefined){const known=Object.entries(ACT_ONE_EVENTS).flatMap(([scene,e])=>e.choices.map(c=>`${scene}:${c.id}`));if(!Array.isArray(a.failedChoices)||a.failedChoices.some(key=>!known.includes(key)))return false;}
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

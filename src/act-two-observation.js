const lunaLine=(text,emotion='happy')=>({speaker:'hostess',name:'ルナ',emotion,text});
const mokuLine=(text,emotion='neutral')=>({speaker:'cat',name:'モク',emotion,text});

// Small domestic scenes before the visitor arrives. No incident knowledge yet.
export const ACT_TWO_OBSERVATION_BEATS=[
 {id:'luna-unpack',phase:0,at:57.08,title:'ルナ、荷ほどき開始',lines:[
  lunaLine('まずは服をしまって、お化粧品を並べて……。'),
  lunaLine('あれ、靴が片方ない。……あった、バッグの中！','surprised'),
  lunaLine('よし。誰が来ても大丈夫。押し入れさえ開けなければ♡','shy')
 ]},
 {id:'luna-neighbor',phase:0,at:59.1,title:'モク流・ご近所あいさつ',together:true,lines:[
  mokuLine('引っ越しお疲れニャ。差し入れの受付はこちらニャ。','happy'),
  lunaLine('あれ？ もらうの、あたしのほうじゃない？','surprised'),
  mokuLine('新生活を応援する気持ちは持ってきたニャ。'),
  lunaLine('手ぶらだけど、口はよく動くんだね。'),
  mokuLine('口なら家賃もかからないニャ。','happy'),
  lunaLine('ふふっ。じゃあ、お茶だけ飲んでいく？')
 ]},
 {id:'luna-tidy',phase:0,at:61.08,title:'102号室をぴかぴかに',lines:[
  lunaLine('鏡、よし。テーブル、よし。窓も拭いて……。'),
  lunaLine('うん、明るくなった。ここ、けっこう好きかも。'),
  lunaLine('……あとは押し入れね。今日は開けない約束だった♡','shy')
 ]},
 {id:'luna-tea',phase:0,at:63.1,title:'お茶と働き者の口',together:true,lines:[
  lunaLine('モクちゃん、お茶のおかわりは？'),
  mokuLine('もらうニャ。片づけを見てたら疲れたニャ。','tired'),
  lunaLine('見てただけで？','surprised'),
  mokuLine('心の中では、ずっと応援してたニャ。'),
  lunaLine('じゃあ、心の中でお皿も洗っておいて♡','shy'),
  mokuLine('……急に眠くなってきたニャ。','tired')
 ]},
 {id:'luna-before-outing',phase:0,at:65.08,title:'ルナ、お出かけの支度',lines:[
  lunaLine('出かける前に、ひと口だけ。お腹が鳴ったら台無しだし。'),
  lunaLine('スマホと鍵、よし。リップも……うん、よし♡','shy'),
  lunaLine('帰ったら続きを片づけよう。今度こそ押し入れも、ね。')
 ]}
];

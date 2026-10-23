const lunaLine=(text,emotion='happy')=>({speaker:'hostess',name:'ルナ',emotion,text});
const mokuLine=(text,emotion='neutral')=>({speaker:'cat',name:'モク',emotion,text});

// Stable IDs preserve existing observation saves. Every scene is now a shared conversation.
export const ACT_TWO_OBSERVATION_BEATS=[
 {id:'luna-unpack',phase:0,at:57.08,title:'強いやつ、ください',together:true,lines:[
  lunaLine('モクちゃん、何か飲む？'),
  mokuLine('強いやつニャ。','happy'),
  lunaLine('コーヒー、濃いめでいい？'),
  mokuLine('そっちの強さじゃないニャ。','surprised'),
  lunaLine('じゃあ、お水。肝臓に優しいほうで。','shy'),
  mokuLine('引っ越してきたのに、もう母親ニャ。','tired')
 ]},
 {id:'luna-neighbor',phase:0,at:59.1,title:'褒めると、こうなる',together:true,lines:[
  lunaLine('モクちゃんって、頼りになるね。'),
  mokuLine('……何を運ぶニャ？','surprised'),
  lunaLine('まだ何も頼んでないよ。','surprised'),
  mokuLine('なら、もう一回言ってほしいニャ。','happy'),
  lunaLine('モクちゃん、頼りになるね♡','shy'),
  mokuLine('よし。今ので今日は働いたニャ。','happy')
 ]},
 {id:'luna-tidy',phase:0,at:61.08,title:'記念写真の必勝法',together:true,lines:[
  lunaLine('引っ越し記念に、一枚撮ろうよ。'),
  mokuLine('顔が小さく写る場所はどこニャ？'),
  lunaLine('少し後ろに下がるといいよ。'),
  mokuLine('このくらいニャ？'),
  lunaLine('うん。……モクちゃん、画面から消えた。','surprised'),
  mokuLine('大成功ニャ。顔の大きさ、ゼロニャ。','happy')
 ]},
 {id:'luna-tea',phase:0,at:63.1,title:'恋愛相談、お腹がすいてる場合',together:true,lines:[
  lunaLine('好きな人に「会いたい」って送るなら、何時がいい？','shy'),
  mokuLine('ごはんの前ニャ。'),
  lunaLine('お腹すいてると、会いたくなるの？','surprised'),
  mokuLine('「何か食べた？」までセットで送るニャ。'),
  lunaLine('それ、好きな人への連絡？','surprised'),
  mokuLine('ごはんを出してくれそうな人への連絡ニャ。','happy')
 ]},
 {id:'luna-before-outing',phase:0,at:65.08,title:'モク流、不審者の見分け方',together:true,lines:[
  lunaLine('じゃ、お仕事行ってくるね。お留守番、頼める？'),
  mokuLine('任せるニャ。不審な人は入れないニャ。','happy'),
  lunaLine('頼もしい。誰か来たら、まずどうする？'),
  mokuLine('何か持ってきたか聞くニャ。'),
  lunaLine('手ぶらだったら？'),
  mokuLine('不審者ニャ。')
 ]}
];

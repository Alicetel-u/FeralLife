// Authored epilogue. Direction is metadata, never dialogue or narration.
const epN=text=>({speaker:'narrator',text,emotion:'neutral'});
const epM=(text,innerVoice=false)=>({speaker:'manager',text,emotion:'neutral',...(innerVoice?{innerVoice:true}:{})});
const epL=(text,emotion='happy')=>({speaker:'hostess',text,emotion});
const epC=(text,emotion='neutral')=>({speaker:'cat',text,emotion});
const epCut=(scene,shot,lines,transition)=>lines.map((line,index)=>({...line,epilogueScene:scene,epilogueShot:shot,...(index===0&&transition?{epilogueTransition:transition}:{})}));

export const ACT_TWO_EPILOGUE_LINES=[
 ...epCut('morning','company',[
  epN('五日目の朝。'),
  epN('昨日までの騒ぎが嘘だったかのように、けもの荘にはいつもの静けさが戻っていた。'),
  epN('玄関先で、大家は大きく伸びをした。'),
  epM('……やっと、いつもの大家の仕事に戻れるな。'),
  epL('大家さ〜ん♡'),
  epM('……その呼び方で近づいてくると、嫌な予感しかしねぇ。'),
  epL('ひどーい！ せっかくお礼を言いに来たのに。','surprised'),
  epM('お礼？'),
  epL('うん。昨日は……ありがとね。大家さんのおかげで、ちゃんとみんなに断れたよ。','shy'),
  epM('……まあ、分かってくれたならいい。'),
  epL('えへへ♡ やっぱり大家さんって、頼りになるね。'),
  epM('だからって、もう彼氏役はやらねぇぞ。'),
  epL('え〜？ 一日くらいいいじゃん♡','shy'),
  epM('昨日ので懲りろ！！'),
  epC('大家、モクの彼氏役もお願いするニャ。'),
  epM('なんでお前まで参加するんだよ！！'),
  epC('毎日ツナ缶を買って、掃除して、家賃も払ってくれる彼氏がいいニャ。'),
  epM('それ彼氏じゃなくて便利な財布だろ！！'),
  epL('ふふっ♡ モクちゃん、理想高いね。'),
  epC('大家は不合格ニャ。'),
  epM('こっちから願い下げだ！！'),
  epN('ルナが笑い、モクは大きなあくびをする。'),
  epN('何度も繰り返した時間。何度も失ったはずの、何でもない朝。'),
  epN('大家は二人を見ながら、小さく息を吐いた。'),
  epM('……まあ、こんなもんか。',true),
  epC('大家、なんか笑ってるニャ。','happy'),
  epM('笑ってねぇよ。'),
  epL('あ、照れてる♡','shy'),
  epM('お前ら、いい加減にしろ！！')
 ],'fade'),
 ...epCut('alone','steps',[
  epN('ルナとモクが部屋へ戻り、玄関には大家一人が残された。'),
  epN('さっきまでの騒がしさが嘘のように、辺りは静まり返っている。'),
  epM('……ったく。朝から疲れる連中だぜ。'),
  epN('大家は小さく笑い、玄関の階段に腰を下ろした。'),
  epM('……終わった、んだよな。',true),
  epN('何気なく見上げた空は、どこまでも青かった。'),
  epM('……モクの火事に、ルナの騒動……。',true),
  epM('何回やり直したんだ、俺は……。',true),
  epN('大家は自分の手を見つめた。'),
  epN('何度も間違え、何度も取り返しのつかない結末を迎えた。それでも今、目の前にはいつもと変わらないけもの荘がある。'),
  epM('……まあ、いいか。'),
  epM('今度こそ、普通に暮らせりゃ……。'),
  {...epN('不意に、耳鳴りがした。'),epilogueSfx:'ring',epilogueSilent:true},
  {...epM('……ん？'),epilogueSilent:true}
 ],'fade'),
 ...epCut('memory','ledger',[
  {...epN('白い光の中に、古びた入居者名簿が浮かび上がる。'),epilogueSfx:'page'},
  epN('そこには、いくつもの名前が並んでいた。しかし、そのほとんどが黒く塗り潰されている。'),
  epM('……なんだ、これ……。'),
  {speaker:'mystery',emotion:'neutral',text:'……余計なことは考えるな。'}
 ],'white'),
 ...epCut('memory','blank',[
  {...epN('名簿のページが、ひとりでにめくられた。最後のページだけが、何も書かれていない。'),epilogueSfx:'page'},
  {speaker:'mystery',emotion:'neutral',text:'……証拠は全部、燃やしてしまえ。'}
 ],'page'),
 ...epCut('memory','burn',[
  {...epN('名簿の端に火がつく。黒く塗られた名前が炎に呑まれていく。'),epilogueSfx:'fire'},
  epM('……待て！！')
 ]),
 ...epCut('return','steps',[
  epM('……っ、はぁ……！'),
  epN('大家は玄関の階段に座ったまま、荒い息をついていた。'),
  epM('……また、あの声か……。',true),
  epN('目の前には、いつもどおりのけもの荘がある。'),
  epM('……証拠って、何のことだよ……。',true),
  epN('大家はしばらく建物を見つめていた。やがてゆっくりと立ち上がる。'),
  epM('……気味悪ぃな……。')
 ],'flash-return'),
 ...epCut('night','outside',[
  epN('その夜。'),
  epN('101号室からは、モクの寝息が聞こえていた。'),
  epN('大家もようやく眠りにつき、けもの荘は静まり返っていた。'),
  epN('ただ一部屋。102号室だけには、まだ明かりが灯っていた。')
 ],'night'),
 ...epCut('night','vanity',[
  epL('……ふふっ♡','shy'),
  epN('ルナは髪をほどき、鏡に映る自分を見つめた。それから引き出しの奥に、そっと手を伸ばす。'),
  {...epN('小さな鍵が回る。古い引き出しが、音もなく開いた。'),epilogueSfx:'unlock'},
  epN('ルナは中にある何かを見つめ、しばらく黙っていた。'),
  epL('……大家さん、ほんとにいい人♡','shy'),
  epN('誰に話しかけるでもなく、ルナが呟く。'),
  epL('あんなに必死になって……。','shy'),
  epL('……あたしのこと、守ってくれたんだもんね。','shy'),
  epN('ルナは引き出しの中身に触れ、そっと微笑んだ。'),
  epL('……でも、大家さん。','neutral')
 ],'fade'),
 ...epCut('secret','close',[
  {...epL('……あたし、嘘はついてないよ？','neutral'),epilogueFocus:true},
  epN('鏡に映るルナの口元が、ゆっくりと吊り上がる。'),
  epL('全部は、ね♡','shy'),
  {...epN('引き出しに鍵がかけられる。'),epilogueSfx:'lock'},
  epN('その中に何があったのか。大家は、まだ知らない。')
 ])
];

// Upgrade only unfinished old epilogues. Other events, clocks and endings stay intact.
export function refreshActTwoEpilogue(state){
 const act=state.actOne;
 if(act?.chapter!==2||act.status!=='clear'||act.epilogueSeen)return false;
 const event=state.events.find(item=>item.actScene==='act2-epilogue');
 if(!event||event.epilogueVersion===2)return false;
 const old=event.lines?.[0]?.text===event.detail?event.lines:[{text:event.detail},...(event.lines||[])];
 const cursor=Math.min(act.epilogueCursor||0,old.length-1),line=old[cursor];
 let next=ACT_TWO_EPILOGUE_LINES.findIndex(item=>item.text===line?.text&&item.speaker===line?.speaker);
 if(next<0){
  const night=old.findIndex(item=>item.text?.startsWith('その夜。'));
  const memory=old.findIndex(item=>item.flashbackEffect==='whiteout');
  const after=memory<0?-1:old.findIndex((item,index)=>index>memory&&item.flashbackEffect!=='whiteout');
  const scene=night>=0&&cursor>=night?'night':memory>=0&&cursor>=memory?(after>=0&&cursor>=after?'return':'memory'):'morning';
  next=ACT_TWO_EPILOGUE_LINES.findIndex(item=>item.epilogueScene===scene);
 }
 event.detail=ACT_TWO_EPILOGUE_LINES[0].text;
 event.lines=ACT_TWO_EPILOGUE_LINES.map(item=>({...item}));event.epilogueVersion=2;
 act.epilogueCursor=Math.max(0,next);return true;
}

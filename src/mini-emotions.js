import { actExpression } from './act-expressions.js';

// Presentation state only: no reaction timers or generated art enter save data.
export const MINI_EMOTIONS = ['happy','angry','sad','surprised','confused','scared','relieved','shy'];
export const LUNA_EXTRA_EMOTIONS = ['charm','flirt-wink','wicked'];
export const LUNA_MINI_EMOTIONS = ['happy','angry','sad','surprised','scared','confused',...LUNA_EXTRA_EMOTIONS];
export const MOKU_EXTRA_EMOTIONS = ['furious','panic','despair','pleading','stunned','laughing','exasperated','rejecting'];
export const MOKU_MINI_EMOTIONS = [...MINI_EMOTIONS,'exasperated'];
export const MINI_EMOTION_NAMES = {charm:'お色気',wicked:'悪い顔',neutral:'通常',happy:'喜び',angry:'怒り',sad:'悲しみ',surprised:'驚き',confused:'困惑',scared:'恐怖',relieved:'安心',shy:'照れ',tired:'疲れ',furious:'激怒',panic:'恐慌',despair:'絶望',pleading:'必死の訴え',stunned:'愕然',laughing:'大笑い','flirt-wink':'誘惑・ウインク','flirt-lean':'誘惑・甘える',exasperated:'強い呆れ',rejecting:'拒絶'};
export const MINI_EMOTION_ART = {
  cat: {src:'assets/characters/cat/emotions-v4.png',image:null,height:454,frames:{
    'happy':[40,1,342,454],
    'angry':[414,33,355,424],
    'sad':[783,47,312,409],
    'surprised':[32,460,348,450],
    'confused':[411,462,335,451],
    'scared':[789,505,330,405],
    'relieved':[38,915,333,443],
    'shy':[433,924,322,434],
    'exasperated':[788,921,347,439],
  }},
  hostess: {src:'assets/characters/hostess/emotions-v4.png',image:null,height:446,frames:{
    'happy':[26,4,370,446],
    'angry':[413,4,378,446],
    'sad':[819,18,363,432],
    'surprised':[21,450,377,414],
    'scared':[428,472,367,392],
    'confused':[845,449,345,416],
    'charm':[37,863,357,432],
    'flirt-wink':[421,863,399,430],
    'wicked':[832,864,354,429],
  }},
  ann: {src:'assets/characters/ann/emotions-v1.png',image:null,height:180,frames:{
    happy:[14,13,132,177],
    angry:[174,12,132,178],
    sad:[336,12,128,178],
    surprised:[496,12,128,178],
    confused:[10,204,140,178],
    scared:[171,204,138,178],
    relieved:[335,203,130,179],
    shy:[493,202,134,180],
  }},
  peko: {src:'assets/characters/peko/emotions-v1.png',image:null,height:147,frames:{
    happy:[7,43,145,147],
    angry:[165,46,150,144],
    sad:[327,45,146,145],
    surprised:[488,44,143,146],
    confused:[11,236,138,146],
    scared:[171,236,138,146],
    relieved:[327,236,146,146],
    shy:[489,236,141,146],
  }},
  sister: {src:'assets/characters/sister/emotions-v1.png',image:null,height:180,frames:{
    happy:[18,10,124,180],
    angry:[179,21,122,169],
    sad:[343,22,113,168],
    surprised:[495,18,129,172],
    confused:[20,204,120,178],
    scared:[181,210,117,172],
    relieved:[335,207,129,175],
    shy:[506,211,107,171],
  }},
  fox: {src:'assets/characters/fox/emotions-v1.png',image:null,height:180,frames:{
    happy:[10,12,140,178],
    angry:[171,17,138,173],
    sad:[336,18,128,172],
    surprised:[495,10,129,180],
    confused:[13,206,133,176],
    scared:[173,210,134,172],
    relieved:[333,206,134,176],
    shy:[499,205,122,177],
  }},
  manager: {src:'assets/characters/manager/emotions-v1.png',image:null,height:180,frames:{
    happy:[20,13,120,177],
    angry:[185,12,109,178],
    sad:[345,17,110,173],
    surprised:[506,12,108,178],
    confused:[26,204,108,178],
    scared:[187,205,105,177],
    relieved:[344,202,112,180],
    shy:[505,205,109,177],
  }},
  patron: {src:'assets/characters/patron/emotions-v1.png',image:null,height:180,frames:{
    happy:[8,11,143,179],
    angry:[166,10,147,180],
    sad:[328,25,143,165],
    surprised:[492,14,135,176],
    confused:[16,205,128,177],
    scared:[178,205,123,177],
    relieved:[339,202,121,180],
    shy:[503,203,114,179],
  }},
  rabbit: {src:'assets/characters/rabbit/emotions-v1.png',image:null,height:180,frames:{
    happy:[21,13,118,177],
    angry:[181,25,117,165],
    sad:[343,27,113,163],
    surprised:[499,10,121,180],
    confused:[22,205,115,177],
    scared:[182,217,116,165],
    relieved:[342,209,115,173],
    shy:[508,208,103,174],
  }},
  wolf: {src:'assets/characters/wolf/emotions-v1.png',image:null,height:180,frames:{
    happy:[16,10,128,180],
    angry:[176,12,128,178],
    sad:[339,15,122,175],
    surprised:[498,10,124,180],
    confused:[18,203,124,179],
    scared:[177,204,125,178],
    relieved:[338,204,124,178],
    shy:[502,204,115,178],
  }},
  bear: {src:'assets/characters/bear/emotions-v1.png',image:null,height:157,frames:{
    happy:[14,33,132,157],
    angry:[165,39,150,151],
    sad:[338,45,123,145],
    surprised:[503,34,114,156],
    confused:[26,225,107,157],
    scared:[186,231,108,151],
    relieved:[347,227,106,155],
    shy:[502,231,115,151],
  }},
  mouse: {src:'assets/characters/mouse/emotions-v1.png',image:null,height:180,frames:{
    happy:[21,12,117,178],
    angry:[181,14,118,176],
    sad:[343,14,113,176],
    surprised:[505,11,110,179],
    confused:[20,204,119,178],
    scared:[181,209,117,173],
    relieved:[344,202,111,180],
    shy:[508,204,103,178],
  }},
  tanuki: {src:'assets/characters/tanuki/emotions-v1.png',image:null,height:180,frames:{
    happy:[15,11,129,179],
    angry:[169,13,142,177],
    sad:[329,12,141,178],
    surprised:[498,13,123,177],
    confused:[17,202,125,180],
    scared:[173,210,133,172],
    relieved:[338,204,123,178],
    shy:[499,204,122,178],
  }},
};

// A shared vocabulary, with different strength and timing for each personality.
export const MINI_PERSONALITY = {
  cat:{strength:.65,tempo:.85},hostess:{strength:.8,tempo:.9},ann:{strength:.5,tempo:.75},
  peko:{strength:1.15,tempo:1.15},sister:{strength:.75,tempo:1},fox:{strength:.7,tempo:.7},
  rabbit:{strength:1,tempo:1},wolf:{strength:1.15,tempo:1.2},bear:{strength:.65,tempo:.8},
  mouse:{strength:.5,tempo:.75},tanuki:{strength:1,tempo:1.05},
  manager:{strength:1,tempo:1},patron:{strength:.7,tempo:.8}
};

// Miniature direction is independent of bust portraits and voice-cache emotions.
// Exact authored lines only: hearts or requests for help do NOT imply flirting.
export const LUNA_MINI_DIRECTIONS = {
  happy:['よろしくお願いします！ いや～、本当に助かりました！'],
  angry:['苦情を言っただけ。追い返す前に聞いてよ。','これ、昨日洗ったばっかりなの！ お客さんに「喫煙所から来た？」って言われたんだけど。'],
  sad:['今は……ごめん。全部は話せない。'],
  surprised:['えっ？'],
  confused:['それ、ほんとにいいの？','大家さん？ 何かあった？'],
  scared:['……前のお店のお客さん。何度も断ったのに、ずっと追いかけてくるの。','……言う必要ないでしょ。'],
  relieved:['大家さん、あのとき止めてくれてありがとう。','部屋が落ち着くと、ちょっと安心するね。'],
  shy:['……給料日になったら。'],
  furious:['帳簿の数字、店が勝手に書き換えてる。女の子たちの給料から引いたお金まで、私のせいにして。','閉めても匂いは出てるの。返事だけじゃなく対策して！'],
  panic:['待って。座布団、焦げてない？ 匂いより先にこっち！'],
  despair:['……もう、ここにもいられない。','……やっぱり、ここにもいられない。','ごめん……こんなはずじゃ……。'],
  pleading:['……大家さん。その人と話さないで。','……大家さん、お願い。その人には何も話さないで。','……お願い。もう帰って。'],
  stunned:['……どうして、ここが……。','……っ、なんで……ここまで……。','……なんで……ここが……。'],
  laughing:['あははっ！ 面白い人たちですね！'],
  'flirt-wink':['大家さん、今日は本当にありがとう♡','こんにちはー！ 今日からお世話になります、金城ルナです♡','お礼に、今夜ご飯おごるね。','モクちゃん、それ毎日言ってない？','私も休憩中。煙が少ない所なら座るよ。'],
  'flirt-lean':['ちょっと、二人きりで相談したいことがあるんだけど……♡','……駄目。二人だけの秘密にしたいの。','……大家さん、ほんとにいい人♡','ふふ。じゃあ、少しだけ休もうかな。','いいよ。愚痴でも聞く？ 私も今日はちょっと疲れた。']
};
LUNA_MINI_DIRECTIONS.charm=['ふふ。じゃあ、少しだけ休もうかな。','お礼に、今夜ご飯おごるね。'];
LUNA_MINI_DIRECTIONS.wicked=['モクちゃん、それ毎日言ってない？','手ぶらだけど、口はよく動くんだね。'];
const lunaMiniLookup=new Map(Object.entries(LUNA_MINI_DIRECTIONS).flatMap(([emotion,texts])=>texts.map(text=>[text,emotion])));

export const MOKU_MINI_DIRECTIONS = {
  furious:['えっ！？ 勝手に殺さないでニャ！？'],
  panic:['ニャ！？ 紙くずが燃えてるニャ！','煙が……前が見えないニャ……！'],
  despair:['モクはもう手遅れニャ。'],
  pleading:['大家……助け……'],
  stunned:['……正気かニャ？'],
  laughing:['にゃはは。じゃ、ありがとニャ！'],
  exasperated:['知ってるニャ。時計くらい読めるニャ。'],
  rejecting:['気持ち悪いニャ。']
};
const mokuMiniLookup=new Map(Object.entries(MOKU_MINI_DIRECTIONS).flatMap(([emotion,texts])=>texts.map(text=>[text,emotion])));

export function miniLineEmotion(line) {
  if(!line)return 'neutral';
  if(MINI_EMOTION_ART[line.speaker]&&miniEmotionFrameName(line.speaker,line.miniEmotion))return line.miniEmotion;
  if(line.speaker==='cat'&&mokuMiniLookup.has(line.text))return mokuMiniLookup.get(line.text);
  if(line.voicePerformance?.startsWith('tragedy-'))return /grief/.test(line.voicePerformance)?'sad':/shock/.test(line.voicePerformance)?'surprised':'scared';
  if(line.speaker==='hostess'&&lunaMiniLookup.has(line.text))return lunaMiniLookup.get(line.text);
  if(line.emotion&&line.emotion!=='neutral'&&Object.hasOwn(MINI_EMOTION_NAMES,line.emotion))return line.emotion;
  const directed=actExpression(line.speaker,line.text||'');
  if(directed!=='neutral')return directed;
  const text=line.text||'';
  if(/怖|こわい|助け|逃げ|前が見えない|返事をしてくれ/.test(text))return 'scared';
  if(/安心|ほっと|無事|よかった|助かった|守れた/.test(text))return 'relieved';
  if(/わからな|分からな|どういうこと|何だっけ|なんだっけ|どうすれば|困った/.test(text))return 'confused';
  if(/恥ずか|照れ|別に.*ため/.test(text))return 'shy';
  if(/ごめん|すみません|すまね|寂し|悲し|俺のせい|俺が悪/.test(text))return 'sad';
  if(/まさか|びっくり|嘘だろ|うそでしょ/.test(text))return 'surprised';
  if(/ありがとう|ありがと|嬉し|うれし|楽し|にゃはは/.test(text))return 'happy';
  if(/うるさ|ふざけ|やめろ|やめて|するなよ/.test(text))return 'angry';
  return 'neutral';
}

export function miniDailyEmotion(resident) {
  if(resident.action==='sleep')return 'neutral';
  if(resident.action==='fight')return 'angry';
  if((resident.needs?.stress||0)>=85)return 'sad';
  if((resident.needs?.sleep||0)>=85)return 'tired';
  return 'neutral';
}

export class MiniReactionState {
  constructor(){this.reactions=new Map();this.speech='';}
  reset(){this.reactions.clear();this.speech='';}
  update(lines,time){
    // Pause and re-render the same line without restarting a gesture. A new
    // neutral line explicitly clears this speaker's previous strong emotion.
    const key=JSON.stringify(lines.map(l=>[l.speaker,l.text,l.emotion,l.voicePerformance,l.miniEmotion]));
    if(key===this.speech){
      for(const line of lines){const reaction=this.reactions.get(line.speaker);if(reaction)reaction.until=time+2.4;}
      return;
    }
    this.speech=key;
    for(const line of lines)if(Object.hasOwn(MINI_PERSONALITY,line.speaker)){
      this.reactions.set(line.speaker,{emotion:miniLineEmotion(line),until:time+2.4});
    }
  }
  emotion(type,time,active=false){
    const reaction=this.reactions.get(type);
    return reaction&&(active||time<=reaction.until)?reaction.emotion:null;
  }
}

export function miniEmotionMotion(type,emotion,t,reduced=false) {
  if(reduced)return {dx:0,dy:0,rotate:0};
  const {strength,tempo}=MINI_PERSONALITY[type]||{strength:1,tempo:1},phase=t*tempo;
  switch(emotion){
    case 'laughing':
    case 'happy':return {dx:0,dy:-Math.max(0,Math.sin(phase*3))*1.8*strength,rotate:0};
    case 'furious':
    case 'angry':return {dx:Math.sin(phase*7)*.6*strength,dy:0,rotate:0};
    case 'confused':return {dx:0,dy:0,rotate:Math.sin(phase*1.5)*.025*strength};
    case 'panic':
    case 'scared':return {dx:Math.sin(phase*14)*.8*strength,dy:0,rotate:0};
    case 'flirt-wink':return {dx:0,dy:0,rotate:Math.sin(phase*1.2)*.012*strength};
    case 'flirt-lean':return {dx:0,dy:Math.sin(phase*1.2)*.25*strength,rotate:0};
    default:return {dx:0,dy:0,rotate:0};
  }
}

// Cache a matte-free cutout with a soft one-pixel edge. Interior colors stay
// intact, and semi-transparent background pixels cannot form visible rectangles.
const miniCutoutCache=new WeakMap();
function miniCutoutImage(art){
  if(!art.alphaCutoff||!globalThis.document?.createElement)return art.image;
  const previous=miniCutoutCache.get(art.image);
  if(previous?.cutoff===art.alphaCutoff)return previous.canvas;
  const canvas=document.createElement('canvas');canvas.width=art.image.width;canvas.height=art.image.height;
  const pen=canvas.getContext('2d',{willReadFrequently:true});pen.drawImage(art.image,0,0);
  const pixels=pen.getImageData(0,0,canvas.width,canvas.height);
  const data=pixels.data,width=canvas.width,height=canvas.height;
  const originalAlpha=new Uint8Array(width*height);
  for(let n=0;n<originalAlpha.length;n++)originalAlpha[n]=data[n*4+3];
  const lower=Math.max(96,art.alphaCutoff-64);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const at=y*width+x,alpha=originalAlpha[at];
    if(alpha>=art.alphaCutoff){data[at*4+3]=255;continue;}
    // Keep only a soft one-pixel fringe next to the solid character. This
    // restores fine hair/cloth edges without bringing back the generated matte.
    let touchesBody=false;
    if(alpha>lower)for(let dy=-1;dy<=1&&!touchesBody;dy++)for(let dx=-1;dx<=1;dx++){
      const nx=x+dx,ny=y+dy;
      if(nx>=0&&nx<width&&ny>=0&&ny<height&&originalAlpha[ny*width+nx]>=art.alphaCutoff){touchesBody=true;break;}
    }
    data[at*4+3]=touchesBody?Math.round(255*(alpha-lower)/(art.alphaCutoff-lower)):0;
  }
  pen.putImageData(pixels,0,0);miniCutoutCache.set(art.image,{cutoff:art.alphaCutoff,canvas});
  return canvas;
}

// Packed sheets have per-cell alpha bounds so transparent padding never changes
// the foot anchor. Scaling is shared across all eight poses of one character.
// Old semantic directions and saves resolve to current art without loading retired sheets.
export function miniEmotionFrameName(type,emotion){
 const art=MINI_EMOTION_ART[type];if(Object.hasOwn(art?.frames||{},emotion))return emotion;
 if(!['cat','hostess'].includes(type))return null;
 const aliases={furious:'angry',panic:'scared',despair:'sad',pleading:'scared',stunned:'surprised',laughing:'happy',rejecting:'exasperated',tired:'sad','flirt-lean':'charm',shy:'confused',relieved:'happy',exasperated:'angry'};
 const target=aliases[emotion];return art?.frames[target]?target:art?.frames[aliases[target]]?aliases[target]:null;
}
export function drawMiniEmotion(ctx,type,x,y,t,scale,direction,emotion,{moving=false,baseHeight=44,reduced=false}={}) {
  const art=MINI_EMOTION_ART[type],frame=art?.frames[miniEmotionFrameName(type,emotion)];
  if(!art?.image||!frame)return false;
  const [sx,sy,w,h]=frame,px=baseHeight/art.height;
  const motion=miniEmotionMotion(type,emotion,t,reduced||moving);
  ctx.save();ctx.translate(Math.round(x+motion.dx*scale),Math.round(y+motion.dy*scale));
  ctx.rotate(motion.rotate);ctx.scale(scale*direction,scale);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.drawImage(miniCutoutImage(art),sx,sy,w,h,-w*px/2,-h*px,w*px,h*px);
  ctx.restore();return true;
}

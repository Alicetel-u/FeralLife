import {OBSERVATION_ACTION_ART} from './observation-art.js';
import { MINI_EMOTION_ART } from './mini-emotions.js';
// Add future approved character art here; unregistered residents retain their draft sprites.
export const SCENE_ART = { src: 'assets/apartments.png', image: null };
// イベント専用の立ち絵。観察画面のドット絵とは独立して管理する。
export const EVENT_ART = {
  cat: 'assets/events/cat.png', hostess: 'assets/events/hostess.png',
  fox: 'assets/events/fox.png', ann: 'assets/events/ann.png',
  peko: 'assets/events/peko.png', sister: 'assets/events/sister.png'
};

// Dedicated bust portraits: each emotion has its own silhouette and gesture.
export const EVENT_EXPRESSIONS = {
  cat: {
    neutral: 'assets/events/busts/cat-neutral.png',
    happy: 'assets/events/busts/cat-happy.png',
    angry: 'assets/events/busts/cat-angry.png',
    sad: 'assets/events/busts/cat-sad.png',
    surprised: 'assets/events/busts/cat-surprised.png',
    shy: 'assets/events/busts/cat-shy.png',
    tired: 'assets/events/busts/cat-tired.png'
  },
  // Preserve Luna's approved original for neutral dialogue; authored mood-specific art is used for other emotions.
  hostess: {
    neutral: EVENT_ART.hostess,
    happy: 'assets/events/busts/hostess-happy.png',
    angry: 'assets/events/busts/hostess-angry.png',
    sad: 'assets/events/busts/hostess-sad.png',
    surprised: 'assets/events/busts/hostess-surprised.png',
    shy: 'assets/events/busts/hostess-shy.png',
    tired: 'assets/events/busts/hostess-tired.png'
  },
  fox: {
    neutral: 'assets/events/busts/fox-neutral.png',
    happy: 'assets/events/busts/fox-happy.png',
    angry: 'assets/events/busts/fox-angry.png',
    sad: 'assets/events/busts/fox-sad.png',
    surprised: 'assets/events/busts/fox-surprised.png',
    shy: 'assets/events/busts/fox-shy.png',
    tired: 'assets/events/busts/fox-tired.png'
  },
  ann: {
    neutral: 'assets/events/busts/ann-neutral.png',
    happy: 'assets/events/busts/ann-happy.png',
    angry: 'assets/events/busts/ann-angry.png',
    sad: 'assets/events/busts/ann-sad.png',
    surprised: 'assets/events/busts/ann-surprised.png',
    shy: 'assets/events/busts/ann-shy.png',
    tired: 'assets/events/busts/ann-tired.png'
  },
  peko: {
    neutral: 'assets/events/busts/peko-neutral.png',
    happy: 'assets/events/busts/peko-happy.png',
    angry: 'assets/events/busts/peko-angry.png',
    sad: 'assets/events/busts/peko-sad.png',
    surprised: 'assets/events/busts/peko-surprised.png',
    shy: 'assets/events/busts/peko-shy.png',
    tired: 'assets/events/busts/peko-tired.png'
  },
  sister: {
    neutral: 'assets/events/busts/sister-neutral.png',
    happy: 'assets/events/busts/sister-happy.png',
    angry: 'assets/events/busts/sister-angry.png',
    sad: 'assets/events/busts/sister-sad.png',
    surprised: 'assets/events/busts/sister-surprised.png',
    shy: 'assets/events/busts/sister-shy.png',
    tired: 'assets/events/busts/sister-tired.png'
  }
};

export function eventParticipants(event, residents) {
  const speakers = (event.lines || []).map(line => line.speaker);
  const occupants = (event.rooms || []).flatMap(room => residents.filter(r => r.room === room).map(r => r.type));
  return [...new Set([...speakers, ...occupants])].filter(type => EVENT_ART[type]);
}
// 入居者ごとの部屋絵。キーは住人の type。未登録の部屋は従来の共通間取りのまま。
export const ROOM_ART = {
  cat: { src: 'assets/rooms/cat/interior-illustrated-v1.png', image: null },
  hostess: { src: 'assets/rooms/hostess/interior-illustrated-v1.png', image: null }
};

// ポーズ差分の共通設定：立ち・座りは 96×128（足元 48,126）、寝姿は 160×112（体の下端中央 80,108）。
// 単体版ビルドで画像を埋め込めるよう、パスは省略せず文字列で書く。
const catPose = (src, origin = [48, 126]) => ({ src, origin, image: null });

// Presentation sizes, not canonical physical heights. Keep the same correction
// across every pose; ears, hair and seated silhouettes remain part of the art.
function observationCharacterArt(type){
 const actions=OBSERVATION_ACTION_ART[type],stand=actions.stand;
 return {src:stand.src,portraitSrc:stand.src,displayHeight:type==='cat'?44:45,origin:stand.origin,image:null,portrait:null,
  poses:Object.fromEntries(Object.entries(actions).map(([name,pose])=>[name,catPose(pose.src,pose.origin)])),
  actionPoses:{idle:['base','sit','base','chat'],tv:'sit',sleep:'sleep',eat:'eat',drink:'drink',clean:'clean',fight:'base',chat:'chat',counsel:'chat',shop:'base',outing:'base',smoke:'base'},
  ...(type==='cat'?{smokeTip:{base:[18,-56]}}:{})};
}
export const CHARACTER_ART = {
  // Match Moku's visible height: the 512px idle art has a 420px body.
  manager: {
    src:'assets/characters/manager/new-poses/daily/idle.png',portraitSrc:'assets/characters/manager/idle.png',displayHeight:53.63809524,origin:[256.5,474],image:null,portrait:null,
    poses:{
      battle_badend:catPose('assets/characters/manager/new-poses/act2-battle/badend.png',[212.0,497]),
      battle_fail:catPose('assets/characters/manager/new-poses/act2-battle/fail.png',[294.0,477]),
      battle_kime_mid:catPose('assets/characters/manager/new-poses/act2-battle/kime_mid.png',[302.5,499]),
      battle_kime_strong:catPose('assets/characters/manager/new-poses/act2-battle/kime_strong.png',[264.5,505]),
      battle_kime_weak:catPose('assets/characters/manager/new-poses/act2-battle/kime_weak.png',[244.5,498]),
      battle_ougi:catPose('assets/characters/manager/new-poses/act2-battle/ougi.png',[249.5,498]),
      battle_protect:catPose('assets/characters/manager/new-poses/act2-battle/protect.png',[229.5,494]),
      battle_stand_proud:catPose('assets/characters/manager/new-poses/act2-battle/stand_proud.png',[235.0,504]),
      battle_victory:catPose('assets/characters/manager/new-poses/act2-battle/victory.png',[219.5,494]),
      clean:catPose('assets/characters/manager/new-poses/daily/clean.png',[210.5,483]),
      idle:catPose('assets/characters/manager/new-poses/daily/idle.png',[256.5,474]),
      sit:catPose('assets/characters/manager/new-poses/daily/sit.png',[241.0,464]),
      sleep:catPose('assets/characters/manager/new-poses/daily/sleep.png',[240.5,457]),
      smartphone:catPose('assets/characters/manager/new-poses/daily/smartphone.png',[228.5,480]),
      talk:catPose('assets/characters/manager/new-poses/daily/talk.png',[246.0,474]),
      think:catPose('assets/characters/manager/new-poses/daily/think.png',[269.0,478]),
      walk_a:catPose('assets/characters/manager/new-poses/daily/walk_a.png',[260.0,476]),
      walk_b:catPose('assets/characters/manager/new-poses/daily/walk_b.png',[245.5,475]),
      angry:catPose('assets/characters/manager/new-poses/emotions/angry.png',[232.5,493]),
      happy:catPose('assets/characters/manager/new-poses/emotions/happy.png',[251.0,492]),
      neutral:catPose('assets/characters/manager/new-poses/emotions/neutral.png',[256.0,492]),
      sad:catPose('assets/characters/manager/new-poses/emotions/sad.png',[235.0,492]),
      serious:catPose('assets/characters/manager/new-poses/emotions/serious.png',[261.0,498]),
      shy:catPose('assets/characters/manager/new-poses/emotions/shy.png',[226.0,495]),
      surprised:catPose('assets/characters/manager/new-poses/emotions/surprised.png',[215.5,495]),
      tired:catPose('assets/characters/manager/new-poses/emotions/tired.png',[253.0,493]),
      troubled:catPose('assets/characters/manager/new-poses/emotions/troubled.png',[243.0,492]),
      clean_a:catPose('assets/characters/manager/new-poses/daily/clean.png',[210.5,483]),
      clean_b:catPose('assets/characters/manager/new-poses/daily/clean.png',[210.5,483]),
      retort:catPose('assets/characters/manager/new-poses/emotions/troubled.png',[243.0,492]),
      confused:catPose('assets/characters/manager/new-poses/emotions/troubled.png',[243.0,492]),
      scared:catPose('assets/characters/manager/new-poses/emotions/surprised.png',[215.5,495]),
      relieved:catPose('assets/characters/manager/new-poses/emotions/happy.png',[251.0,492])
    },actionPoses:{idle:'idle',chat:'talk',clean:'clean'}
  },
  ann: {
    src: 'assets/characters/ann/poses/stand.png', portraitSrc: 'assets/characters/ann/idle.png', displayHeight: 43, origin: [64, 126], image: null, portrait: null,
    poses: {
      stand: catPose('assets/characters/ann/poses/stand.png', [64, 126]),
      walk_a: catPose('assets/characters/ann/poses/walk_a.png', [64, 126]),
      walk_b: catPose('assets/characters/ann/poses/walk_b.png', [64, 126]),
      sit: catPose('assets/characters/ann/poses/sit.png', [64, 126]),
      sleep: catPose('assets/characters/ann/poses/sleep.png', [80, 110]),
      eat: catPose('assets/characters/ann/poses/eat.png', [64, 126]),
      drink: catPose('assets/characters/ann/poses/drink.png', [64, 126]),
      clean: catPose('assets/characters/ann/poses/clean.png', [64, 126]),
      angry: catPose('assets/characters/ann/poses/angry.png', [64, 126]),
      chat: catPose('assets/characters/ann/poses/chat.png', [64, 126]),
      phone: catPose('assets/characters/ann/poses/phone.png', [64, 126]),
      shop: catPose('assets/characters/ann/poses/shop.png', [64, 126])
    },
    actionPoses: { idle: ['stand', 'phone', 'sit', 'chat'], tv: 'sit', eat: 'eat', drink: 'drink', clean: 'clean', fight: 'angry', chat: 'chat', sleep: 'sleep', outing: 'stand', shop: 'shop', checkBrother: 'phone', smoke: 'stand' }
  },
  patron: {
    src: 'assets/characters/patron/idle.png', portraitSrc: 'assets/characters/patron/idle.png', displayHeight: 44, origin: [627, 1230], image: null, portrait: null
  },
  peko: {
    src: 'assets/characters/peko/poses/stand.png', portraitSrc: 'assets/characters/peko/idle.png', displayHeight: 42, origin: [64, 126], image: null, portrait: null,
    poses: {
      stand: catPose('assets/characters/peko/poses/stand.png', [64, 126]),
      walk_a: catPose('assets/characters/peko/poses/walk_a.png', [64, 126]),
      walk_b: catPose('assets/characters/peko/poses/walk_b.png', [64, 126]),
      sit: catPose('assets/characters/peko/poses/sit.png', [64, 126]),
      sleep: catPose('assets/characters/peko/poses/sleep.png', [80, 110]),
      eat: catPose('assets/characters/peko/poses/eat.png', [64, 126]),
      drink: catPose('assets/characters/peko/poses/drink.png', [64, 126]),
      clean: catPose('assets/characters/peko/poses/clean.png', [64, 126]),
      angry: catPose('assets/characters/peko/poses/angry.png', [64, 126]),
      chat: catPose('assets/characters/peko/poses/chat.png', [64, 126]),
      phone: catPose('assets/characters/peko/poses/phone.png', [64, 126]),
      shop: catPose('assets/characters/peko/poses/shop.png', [64, 126])
    },
    actionPoses: { idle: ['stand', 'sit', 'phone', 'chat'], tv: 'sit', eat: 'eat', drink: 'drink', clean: 'clean', fight: 'angry', chat: 'chat', sleep: 'sleep', outing: 'stand', shop: 'shop', checkBrother: 'phone', smoke: 'stand' }
  },
  sister: {
    src: 'assets/characters/sister/poses/stand.png', portraitSrc: 'assets/characters/sister/idle.png', displayHeight: 42, origin: [64, 126], image: null, portrait: null,
    poses: {
      stand: catPose('assets/characters/sister/poses/stand.png', [64, 126]),
      walk_a: catPose('assets/characters/sister/poses/walk_a.png', [64, 126]),
      walk_b: catPose('assets/characters/sister/poses/walk_b.png', [64, 126]),
      sit: catPose('assets/characters/sister/poses/sit.png', [64, 126]),
      sleep: catPose('assets/characters/sister/poses/sleep.png', [80, 110]),
      eat: catPose('assets/characters/sister/poses/eat.png', [64, 126]),
      drink: catPose('assets/characters/sister/poses/drink.png', [64, 126]),
      clean: catPose('assets/characters/sister/poses/clean.png', [64, 126]),
      angry: catPose('assets/characters/sister/poses/angry.png', [64, 126]),
      chat: catPose('assets/characters/sister/poses/chat.png', [64, 126]),
      phone: catPose('assets/characters/sister/poses/phone.png', [64, 126]),
      shop: catPose('assets/characters/sister/poses/shop.png', [64, 126])
    },
    actionPoses: { idle: ['stand', 'sit', 'phone', 'chat'], tv: 'sit', eat: 'eat', drink: 'drink', clean: 'clean', fight: 'angry', chat: 'chat', sleep: 'sleep', outing: 'stand', shop: 'shop', checkBrother: 'phone', smoke: 'stand' }
  },
  hostess:observationCharacterArt('hostess'),
  cat:observationCharacterArt('cat'),
  fox: {
    src: 'assets/characters/fox/base-game.png', portraitSrc: 'assets/characters/fox/portrait-game.png', displayHeight: 44, origin: [64, 126], image: null, portrait: null,
    poses: {
      stand: catPose('assets/characters/fox/poses/stand.png', [64,126]),
      walk_a: catPose('assets/characters/fox/poses/walk_a.png', [64,126]),
      walk_b: catPose('assets/characters/fox/poses/walk_b.png', [64,126]),
      sit: catPose('assets/characters/fox/poses/sit.png', [64,126]),
      sleep: catPose('assets/characters/fox/poses/sleep.png', [88,108]),
      eat: catPose('assets/characters/fox/poses/eat.png', [64,126]),
      drink: catPose('assets/characters/fox/poses/drink.png', [64,126]),
      clean: catPose('assets/characters/fox/poses/clean.png', [64,126]),
      angry: catPose('assets/characters/fox/poses/angry.png', [64,126]),
      chat: catPose('assets/characters/fox/poses/chat.png', [64,126])
    },
    actionPoses: {idle:['base','sit','stand','chat'],tv:'sit',eat:'eat',drink:'drink',clean:'clean',fight:'angry',chat:'chat',sleep:'sleep',outing:'stand',smoke:'stand'}
  }
};

// 起動時に全画像の完了を待たない。表示に必要な画像から順番に読み込む。
const imageCache = new Map();
function loadImage(src) {
  if (!imageCache.has(src)) imageCache.set(src,new Promise(resolve=>{
    const image=new Image();
    image.onload=()=>resolve(image);
    image.onerror=()=>{console.warn('Image could not load:',src);resolve(null);};
    image.src=src;
  }));
  return imageCache.get(src);
}
async function assignImage(art,property,src,onReady) {
  if (!src) return;
  const image=await loadImage(src);
  art[property]=image;
  if (image) onReady?.();
}
export function loadRoomArt(onReady,onSettled) {
  return Promise.all(Object.values(ROOM_ART).map(art=>assignImage(art,'image',art.src,onReady).finally(()=>onSettled?.())));
}
export function loadCharacterArt(onReady,onSettled) {
  // 初期画面の背景とモクだけを優先。それ以外はブラウザのアイドル時間に少しずつ。
  const first=[
    assignImage(SCENE_ART,'image',SCENE_ART.src,onReady),
    ...['cat','manager'].flatMap(type=>{
      const art=CHARACTER_ART[type];
      return [assignImage(art,'image',art.src,onReady),assignImage(art,'portrait',art.portraitSrc,onReady),assignImage(MINI_EMOTION_ART[type],'image',MINI_EMOTION_ART[type].src,onReady)];
    })
  ];
  const remaining=[];
  for(const [type,art] of Object.entries(MINI_EMOTION_ART))if(!['cat','manager'].includes(type))remaining.push(()=>assignImage(art,'image',art.src,onReady));
  for (const [type,art] of Object.entries(CHARACTER_ART)) {
    if (!['cat','manager'].includes(type)) {
      remaining.push(()=>assignImage(art,'image',art.src,onReady));
      remaining.push(()=>assignImage(art,'portrait',art.portraitSrc,onReady));
    }
    for (const pose of Object.values(art.poses||{})) remaining.push(()=>assignImage(pose,'image',pose.src,onReady));
  }
  const initial=first.map(task=>task.finally(()=>onSettled?.()));
  Promise.all(initial).then(()=>{
    // 同時接続と画像デコードの集中を避ける。起動画面をブロックしない。
    const schedule=window.requestIdleCallback||((fn)=>setTimeout(fn,40));
    let index=0;
    const batch=()=>{
      const tasks=remaining.slice(index,index+3);index+=tasks.length;
      Promise.all(tasks.map(task=>task())).finally(()=>{if(index<remaining.length)schedule(batch);});
    };
    schedule(batch);
  });
  return Promise.all(initial);
}

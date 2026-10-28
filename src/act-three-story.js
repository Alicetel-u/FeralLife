import {messagePages} from './message-pages.js';
// Dialogue supplied by the user in 「けもの荘プロローグ制作」, through Mimi's farewell.
// Stage directions are represented as effects or in-world observations, never UI narration.
const act3Line=(speaker,text,extra={})=>({speaker,text,...extra});
export const ACT_THREE_MAP_SCENES={
 departure:{step:0,cast:['cat','hostess'],lines:[
  act3Line('cat','外、えらいことになってるニャ……'),
  act3Line('hostess','ねえ大家さん……本当にここから逃げられるの？',{emotion:'sad'}),
  act3Line('manager','ああ。脱出地点までの道は分かってる'),
  act3Line('cat','そんな簡単に言って大丈夫なのかニャ？'),
  act3Line('manager','大丈夫だ。何度も確認してる'),
  act3Line('hostess','……何度も？'),
  act3Line('manager','いや、こっちの話だ'),
  act3Line('manager','いいか。何があっても俺から離れるな'),
  act3Line('cat','分かったニャ！'),
  act3Line('hostess','うん。大家さんを信じる',{emotion:'happy'}),
  act3Line('manager','……行くぞ')
 ]},
 crossing:{step:1,cast:['cat','hostess'],lines:[
  act3Line('manager','止まれ'),
  act3Line('cat','ど、どうしたニャ？',{emotion:'surprised'}),
  act3Line('manager','この先は通らない'),
  act3Line('hostess','でも、誰もいないよ？'),
  act3Line('manager','……3、2、1'),
  act3Line('narrator','交差点にゾンビが現れ、群れが道路を横切っていく。',{horde:true}),
  act3Line('cat','うおっ！？ 出たニャ！！',{emotion:'surprised',horde:true}),
  act3Line('hostess','えっ……なんで分かったの！？',{emotion:'surprised',horde:true}),
  act3Line('manager','いいから静かに。今のうちに裏道へ回る',{horde:true}),
  act3Line('cat','大家、何者なんだニャ……',{horde:true}),
  act3Line('manager','ただの大家だよ',{horde:true})
 ]},
 store:{step:3,cast:['cat','hostess','rabbit'],lines:[
  act3Line('cat','はぁ……はぁ……生きた心地がしなかったニャ……',{emotion:'tired'}),
  act3Line('hostess','でも、本当に一度も襲われなかったね'),
  act3Line('manager','ここまでは予定どおりだ'),
  act3Line('cat','予定どおりって……全部知ってたみたいな言い方ニャ'),
  act3Line('manager','……少し休むぞ。必要な物もある'),
  act3Line('hostess','あれ？ ねえ、店の中に誰かいる……'),
  act3Line('narrator','割れたガラスの向こうに、見慣れない獣人の姿が見える。'),
  act3Line('manager','……生存者か'),
  act3Line('narrator','割れた自動ドアをくぐる。荒らされた商品棚の奥から、物音がする。',{inside:true}),
  act3Line('hostess','……誰かいるの？',{inside:true}),
  act3Line('mystery','ひっ……！？',{inside:true}),
  act3Line('narrator','棚の陰から、ピンク髪の猫獣人の少女が顔を出す。',{inside:true,revealMimi:true}),
  act3Line('rabbit','ぞ、ゾンビじゃない……？',{emotion:'sad',inside:true}),
  act3Line('cat','どこをどう見たらゾンビに見えるニャ！',{emotion:'angry',inside:true}),
  act3Line('rabbit','だ、だって！ さっきから怖い人ばっかり来るんだもん！',{emotion:'sad',inside:true}),
  act3Line('hostess','大丈夫だよ。私たちは普通の人だから',{inside:true}),
  act3Line('rabbit','銃！',{emotion:'surprised',inside:true}),
  act3Line('manager','ああ…緊急事態だ気にすんな',{inside:true}),
  act3Line('rabbit','はい…',{emotion:'sad',inside:true}),
  act3Line('manager','……怪我してるのか？',{inside:true}),
  act3Line('narrator','少女は片足をかばいながら立っている。',{inside:true}),
  act3Line('rabbit','うん……逃げるときに転んじゃって……',{emotion:'sad',inside:true}),
  act3Line('manager','俺たちは街の外に向かってる。一緒に来るか？',{inside:true}),
  act3Line('rabbit','えっ！ 本当に！？',{emotion:'happy',inside:true}),
  act3Line('narrator','立ち上がろうとした少女が、足の痛みに顔をしかめて座り込む。',{inside:true}),
  act3Line('rabbit','いたっ……！',{emotion:'sad',inside:true}),
  act3Line('hostess','無理しないで！',{emotion:'sad',inside:true}),
  act3Line('rabbit','……ごめんなさい。走れそうにない……',{emotion:'sad',inside:true}),
  act3Line('cat','この外、ゾンビだらけニャ……',{inside:true}),
  act3Line('narrator','大家は店の外を確認する。遠くからゾンビのうめき声が聞こえる。',{inside:true}),
  act3Line('manager','……ここに残るのも危険だな',{inside:true}),
  act3Line('manager','少し戻ったところに、俺のアパートがある',{inside:true}),
  act3Line('rabbit','アパート……？',{inside:true}),
  act3Line('manager','二階に空き部屋がある。そこを使っていい',{inside:true}),
  act3Line('narrator','大家はポケットから鍵を取り出し、少女に差し出す。',{inside:true}),
  act3Line('rabbit','えっ……知らない人なのに、いいの？',{inside:true}),
  act3Line('manager','ああ。足が治るまで好きに使ってくれ',{inside:true}),
  act3Line('rabbit','……ありがとう！',{emotion:'happy',inside:true,keyGiven:true}),
  act3Line('cat','大家、ずいぶん太っ腹ニャ！',{emotion:'happy',inside:true}),
  act3Line('manager','お前も少しは見習え',{inside:true}),
  act3Line('cat','なんでオイラが怒られるニャ！？',{emotion:'surprised',inside:true}),
  act3Line('narrator','緊張していた少女が、小さく笑う。',{inside:true}),
  act3Line('hostess','ミミちゃん、だったよね？ 無理しないでね',{inside:true}),
  act3Line('rabbit','うん！ みんなも気をつけて！',{emotion:'happy',inside:true}),
  act3Line('manager','表通りは危険だ。裏道を使えばアパートまで行ける',{inside:true}),
  act3Line('rabbit','分かった。……あの！',{inside:true}),
  act3Line('manager','ん？',{inside:true}),
  act3Line('rabbit','また……会える？',{emotion:'sad',inside:true}),
  act3Line('narrator','大家は一瞬、言葉に詰まる。',{inside:true}),
  act3Line('manager','……ああ。きっとな',{inside:true}),
  act3Line('rabbit','……うん！',{emotion:'happy',inside:true}),
  act3Line('narrator','ミミは鍵を両手で握りしめる。大家たちはコンビニを出た。',{inside:true})
 ]}
};
export const ACT_THREE_STORE_INTERIOR='assets/events/chapter3/store-interior.png';
export function actThreeStoryProgress(saved){
 if(saved?.mapStoryRevision!==1)return {step:0,scene:'departure',cursor:0,page:0,seen:[],keyGiven:false};
 const seen=[];for(const id of ['departure','crossing','store']){if(!saved.mapSeen?.includes(id))break;seen.push(id);}
 // Only the authored, played order can unlock a later location.
 const max=!seen.includes('departure')?0:!seen.includes('crossing')?1:3;
 const step=Math.min(max,Math.max(0,Number.isInteger(saved.mapStep)?saved.mapStep:0));
 const required=step===0?'departure':step===1?'crossing':step===3?'store':null;
 const scene=required&&!seen.includes(required)?required:null;
 const cursor=scene&&scene===saved.mapScene?Math.min(ACT_THREE_MAP_SCENES[scene].lines.length-1,Math.max(0,saved.mapCursor|0)):0;
 const page=scene?Math.min(messagePages(ACT_THREE_MAP_SCENES[scene].lines[cursor].text).length-1,Math.max(0,saved.mapPage|0)):0;
 return {step,scene,cursor,page,seen,keyGiven:seen.includes('store')||scene==='store'&&ACT_THREE_MAP_SCENES.store.lines.slice(0,cursor+1).some(l=>l.keyGiven)};
}
export function actThreeStorySave(progress){return {phase:'map',afterSeen:true,mapStoryRevision:1,mapStep:progress.step,mapScene:progress.scene,mapCursor:progress.cursor,mapPage:progress.page,mapSeen:[...progress.seen],mimiKeyGiven:!!progress.keyGiven};}
export function actThreeStoryDebug(id){
 const choices={departure:{step:0,scene:'departure',seen:[]},crossing:{step:1,scene:'crossing',seen:['departure']},detour:{step:2,scene:null,seen:['departure','crossing']},store:{step:3,scene:'store',seen:['departure','crossing']},farewell:{step:3,scene:'store',cursor:42,seen:['departure','crossing'],keyGiven:true}};
 const entry=choices[id];return entry?actThreeStorySave({cursor:0,page:0,keyGiven:false,...entry}):null;
}

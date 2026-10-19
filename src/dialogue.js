import {observationActive,observationView} from './act-one-observation.js';
import { firstActMutters } from './act-one-life.js';
import { secondActChat,lunaMutters,lunaNearby } from './act-two-life.js';
const NAMES = { cat: 'モク', rabbit: 'ミミ', fox: 'ホロ', wolf: 'ウル', bear: 'ゴロ', mouse: 'チリ', tanuki: 'ポン', hostess: 'ルナ', sister: 'ネム', peko: 'ペコ', ann: 'アン' };
export const SPEECH_MS = { line: 5200, mutter: 7000 };

// Old saves use the same voice as new dialogue. Punctuation-only pauses stay pauses.
export const mokuNya = text => String(text).replace(/([^。！？!?\n]+)([。！？!?]+|$)/gm, (whole, body, ending) => {
  const tail = body.match(/^(.*?)(\s*)$/);
  const words = tail[1], spaces = tail[2];
  return words && /[\p{L}\p{N}]/u.test(words) && !words.endsWith('ニャ') ? words + 'ニャ' + spaces + ending : whole;
});
const say = (speaker, text, emotion = 'neutral') => ({ speaker, name: NAMES[speaker] || '住人', text: speaker === 'cat' ? mokuNya(text) : text, emotion });
const mark = (state, id) => { if (!Array.isArray(state.heard)) state.heard = []; if (!state.heard.includes(id)) state.heard.push(id); };
const heard = (state, id) => Array.isArray(state.heard) && state.heard.includes(id);

// Event IDs change every meal/visit; identical ordinary dialogue is still the same scene.
export const dialogueSceneKey = event => event.lines?.length && !event.caseId && !event.caseResult && !event.followupOf
  ? 'scene:'+JSON.stringify(event.lines.map(({speaker,text})=>[speaker,text])) : null;
export function claimAutomaticScene(state,event) {
  const key=dialogueSceneKey(event);
  if(!key)return true;
  if(heard(state,key))return false;
  mark(state,key);return true;
}
const AUTOMATIC_SCENES={
  1:new Set(['opening','prologue','ash','dinner','epilogue','rewind']),
  2:new Set(['act2-prologue','bag','duel','act2-epilogue','act2-rewind'])
};
// A queued scene from the other chapter must not open when this chapter's dialogue closes.
export function automaticChapterScene(event,act) {
  if(!event?.lines?.length||!event.actScene)return false;
  const chapter=act?.chapter===2?2:1;
  // Legacy/debug saves may retain unread introductions after the story has moved on.
  if(chapter===1&&['opening','prologue'].includes(event.actScene)&&(act?.pending||act?.completed?.length||act?.rewindIntroPending))return false;
  if(['ash','dinner','bag','contract'].includes(event.actScene)&&act?.completed?.includes(event.actScene))return false;
  if(event.actScene==='reply')return chapter===2?!!event.cast?.includes('hostess'):!event.cast?.includes('hostess');
  return AUTOMATIC_SCENES[chapter].has(event.actScene);
}
export function rememberReadScenes(state) {
  for(const event of state.events)if(event.read){const key=dialogueSceneKey(event);if(key)mark(state,key);}
}

export const OPENING_LINES = [
  say('cat', '……新しい大家さん？ モクです。よろしくニャ。', 'neutral'),
  say('cat', '部屋、散らかっててごめんニャ。いま座る場所を……あ、そこも缶があったニャ。', 'sad'),
  say('cat', '明日から片づけるつもりニャ。今日は、その準備をしたところニャ。', 'tired'),
  say('cat', '何を準備したかって？ ……ゴミ袋の値段、調べたニャ。', 'shy'),
  say('cat', '買ってないニャ。そこまで聞かれるとは思ってなかったニャ。', 'tired')
];
const MUTTERS = {
  smoke: ['一本だけにしよう……。あ、また火つけちゃった。', 'ネムに咳のこと聞かれたら、怒られるかな。', '窓、もうちょっと開けるか。隣に匂いが行くと悪いし。', '灰皿、洗わないとな。……その前に火は消そう。'],
  drink: ['今日も仕事探すページだけ見て終わっちゃった。', 'ネムから返信来た。……あとで返すと、また忘れるな。', 'もう一本はやめとこう。明日起きられなくなるし。'],
  idle: ['動くの面倒……。でも、このまま夕方になるのも嫌だな。', 'ゴミの日、今日だった？ ……昨日か。', '大家さん、見てるなら一緒に片づけてくれてもいいのに。'],
  eat: ['これ、昨日の残りか。匂いは……やめとこう。', 'ちゃんと食べたって言える物、作っとかないと。', 'お腹は空くのに、料理する気力は湧かないんだよな。'],
  tv: ['この回、前にも見た。……でも最後は忘れた。', 'ここで笑ったら、少し元気になる気がする。', 'リモコン遠い……。隣の缶よりは遠くないか。'],
  clean: ['床、こんな色だったんだ。ちょっと気持ちいい。', '一本ずつでも、捨てれば減る……はず。', 'ここまでやったら休憩。いや、もう一袋だけ。'],
  sleep: ['五分だけ……。ネムには起きてから返す。', '寝る前はやる気あったのに……明日は覚えてるかな。'],
  outing: ['食料買って帰ろう。タバコだけだとまた怒られる。', '袋、重い。ちゃんとご飯買った証拠だな。'],
  chat: ['一人も楽だけど、たまに誰かの声があると安心する。', 'いまの話、もう少し聞いてもいいかな。'],
  fight: ['言い方、きつかったかな……。でも全部私が悪いのは違う。', '謝るなら、落ち着いてからちゃんと言いたい。']
};
const FALLBACK = ['……いま何しようとしてたっけ。', '大家さん、暇なら声かけてくれてもいいのに。'];
// Active residents each answer the preceding line, rather than a shared poetic fallback.
const reply = {
  chat: { hostess:'いいよ。愚痴でも聞く？ 私も今日はちょっと疲れた。', sister:'お姉ちゃんから話しかけるの、珍しいね。聞くよ。', fox:'話すのはいいけど、その煙、こっちに来てる。', peko:'うん！ ご飯の話じゃなくても、聞くよ。', ann:'私も、一人だと考えすぎちゃう日がある。', rabbit:'うん。ただ、その服に煙がつくのは嫌だから窓際はやめよう。', wolf:'今は配信切ってる。普通に話していいよ。', bear:'いいよ。ご飯食べながらでもよければ。', mouse:'聞いてるよ。これだけ先にしまわせて。', tanuki:'たまには賭けの話じゃないのも聞きたい。' },
  fight: { hostess:'苦情を言っただけ。追い返す前に聞いてよ。', sister:'お姉ちゃん、怒鳴ると何が嫌か分かんない。', fox:'私も言い方は悪かった。でも、その匂いは嫌。', peko:'私にも言いたいことあるの！ 最後まで聞いて！', ann:'言い返す前に、何が困ってるかだけ聞いて。', rabbit:'その言い方で、もっと話したくなくなる。', wolf:'分かった。声は落とすから、そっちも怒鳴らないで。', bear:'勝手に食べたのは悪かった。ごめん。', mouse:'いきなり怒られたら、説明もできないよ。', tanuki:'ごめん。でも、全部こっちのせいにしないで。' },
  doorChat: { hostess:'私も休憩中。煙が少ない所なら座るよ。', sister:'お姉ちゃん、ご飯食べた？ 話の前にそれ聞きたい。', fox:'座る。……その缶、飲んでいいやつ？', peko:'お邪魔します！ ご飯の匂いにつられたわけじゃないよ！', ann:'ありがとう。少しだけ話したくて。', rabbit:'お邪魔するね。窓、もう少し開けてもいい？', wolf:'今日はカメラ持ってない。心配しなくていいよ。', bear:'少しだけ。今、食べてたところだった？', mouse:'ありがとう。足元、どこに置いたらいい？', tanuki:'お邪魔する。今日は何も売らないから安心して。' },
  doorFight: { hostess:'閉めても匂いは出てるの。返事だけじゃなく対策して！', sister:'お姉ちゃん、ちゃんと顔見て話したい。', fox:'煙でむせたんだよ。怒りたいわけじゃない。', peko:'追い返さないで。私の話も聞いてよ！', ann:'今、落ち着いて言ってる。無視しないで。', rabbit:'服に匂いがついて困ってるの。話くらい聞いて。', wolf:'声は抑えるから、ドア越しでも聞いて。', bear:'食べ物のことで謝りに来たんだけど。', mouse:'取りに来た物があるだけ。怒らないで。', tanuki:'ごめん。でも今は確認したいだけ。' },
  steal: { hostess:'……ごめん。もらっていいと思い込んだ。買い直す。', sister:'お姉ちゃんの分だった？ ごめん、聞けばよかった。', fox:'おつまみに合いそうで……。いや、ごめん。言い訳。', peko:'ごめん！ すごくお腹空いてて……でも勝手に食べちゃ駄目だよね。', ann:'すみません。残り物だからいいと思ってしまった。', rabbit:'名前、見てなかった。ごめん。', wolf:'悪かった。代わりの物、ちゃんと持ってくる。', bear:'ごめん。食べる前に聞くべきだった。', mouse:'片づける物と間違えた。ごめん。', tanuki:'ごめん。少しくらいならって、勝手に決めた。' },
  sell: { hostess:'いらない物を、断りづらく売らないでよ。', sister:'お姉ちゃん、それ本当に必要なの？', fox:'縁起物より飲み物が欲しくて……でも断ればよかった。', peko:'これ買ったら、ご飯買えないんだけど。', ann:'説明を聞いただけで、買うとは言ってないよ。', rabbit:'服に合わせる物じゃないから、私は買わない。', wolf:'紹介はできるけど、効果まで約束はしないよ。', bear:'食べられる物だと勘違いした。返してもいい？', mouse:'置く場所がないから、今回はやめておく。', tanuki:'運が良くなると思ったんだけど……分からないな。' }
};
const answer = (table,type) => table[type] || 'ちょっと待って。私の話も聞いて。';
const INCIDENTS = {
 smoke: { id:'ash-vent',kind:'life',title:'モクが、換気の言い訳を飲み込んだ。',detail:'窓は指一本ぶん開いていた。大家に顔をしかめられ、モクは窓をもう少し開ける。灰皿を隠すより、その方が早かった。',impact:'一服でストレスは下がった。火の始末も確認した。',lines:[say('cat','……煙い？ ごめん。自分だと慣れちゃって分からなくなるニャ。','sad'),say('cat','窓、開けてたつもりだったけど……これじゃ隙間だニャ。','shy'),say('cat','次はちゃんと開けるニャ。タバコやめる約束まで、いま押し込まないでニャ。','tired')] },
 drink: { id:'toast-can',kind:'life',title:'モクの乾杯に、返信が来た。',detail:'一人で缶を開けたモクのスマホに、ネムから「ご飯は？」と届く。夕飯の写真を撮るため、姉は缶を画面の外へどかした。',impact:'飲酒でストレスは下がった。空き缶が増えた。',lines:[say('cat','お疲れ、私。……何に疲れたんだろうニャ。','tired'),say('cat','ネムから「ご飯は？」って。缶の写真送ったら怒るよねニャ。','sad'),say('cat','何か食べてから返すニャ。心配されるの、嫌なわけじゃないニャ。','shy')] },
 idle: { id:'stain-boss',kind:'life',title:'モクが、動かない理由を探した。',detail:'モクは天井を見上げていた。やることは分かっている。でも立ち上がるまでが遠い。大家の足音が近づくと、空き缶を一本だけ拾った。',impact:'何もしない時間が過ぎた。片づけは一本だけ進んだ。',lines:[say('cat','ずっと天井見てたニャ。考え事……って言うほど、何も考えてないニャ。','tired'),say('cat','やらなきゃって思うほど、動きづらい日もあるニャ。','sad'),say('cat','……今日は一本捨てるニャ。二本目は、褒められたら考えるニャ。','shy')] },
 eat: { id:'expiry-family',kind:'trouble',title:'モクが、昨日の残りと目を合わせた。',detail:'冷蔵庫から出した容器は、開けた瞬間に食欲を奪った。モクは箸を止める。節約のつもりで体調を崩すと、ネムの説教まで追加される。',impact:'食事で空腹は下がった。怪しい残り物は捨てた。',lines:[say('cat','これ、いつのだっけ。……匂い、ちょっとまずいニャ。','surprised'),say('cat','もったいないけど捨てるニャ。ネムに心配かける方が嫌ニャ。','sad'),say('cat','ちゃんと食べる物を作るニャ。まず鍋……あ、洗うところからニャ。','tired')] },
 tv: { id:'rerun-life',kind:'life',title:'モクが、知っている話で笑った。',detail:'再放送だと気づいたのに、モクは最後まで見た。笑う場所も同じだった。番組が終わると、一瞬だけ部屋が静かすぎた。',impact:'テレビで娯楽欲求が下がった。',lines:[say('cat','この回、前も笑ったニャ。分かってても笑っちゃうニャ。','happy'),say('cat','一人で笑ってると、たまにちょっと恥ずかしいニャ。','shy'),say('cat','……大家さんも見る？ あ、そこは缶どかしてから座ってニャ。','neutral')] },
 clean: { id:'clean-ash',kind:'life',title:'モクが、空いた床を守ろうとした。',detail:'ゴミ袋が一つ満杯になった。久しぶりに床が見える。モクは喜んで灰皿を置きかけ、いま片づけた意味を思い出した。',impact:'片づけでゴミが減った。',lines:[say('cat','見て、床が見えたニャ。……褒めるには遅すぎる？','happy'),say('cat','ここに灰皿を置けば……いや、それで散らかったんだったニャ。','surprised'),say('cat','綺麗なままにするニャ。今日はここ、ネムが座れるようにニャ。','shy')] },
 sleep: { id:'sleep-rent',kind:'life',title:'モクが、五分だけを延長した。',detail:'起こされたモクは、枕を抱いて五分だけ待ってほしいと言う。机のスマホには未読の通知があった。寝ぼけた手が、画面の手前で止まる。',impact:'眠気は下がっていく。返信はまだ送れていない。',lines:[say('cat','……起きてるニャ。目だけ、まだ寝てるニャ。','tired'),say('cat','ネムに返事しないと。五分だけ待ってニャ。','sad'),say('cat','五分前にも言った？ ……それはごめんニャ。時計、こっちに置いてニャ。','shy')] },
 chat: { id:'fill-silence',kind:'life',title:'モクが、用のない立ち話に誘った。',detail:'モクは用事があるわけではなかった。通りかかった相手を呼び止めてから、何を話すか考える。灰皿は、相手から遠い方へ動かした。',impact:'立ち話で関係が少し改善した。',lines:other=>[say('cat','あ、ちょっといい？ 用はないんだけど……誰かと話したくてニャ。','shy'),...(other?[say(other,answer(reply.chat,other),'neutral')]:[]),say('cat','ありがとうニャ。私から呼んだのに話題ないの、ちょっと気まずいニャ。','shy')] },
 fight: { id:'smell-follows',kind:'trouble',title:'モクが、強く言った後で口を閉じた。',detail:'廊下からの苦情に、モクは先に言い返した。相手の顔を見てから、問題は煙だけではなく、自分の言い方にも増えたと気づいた。',impact:'口論で関係が悪化した。',lines:other=>[say('cat','私ばっかり言われても困るニャ。そっちだって……。','angry'),...(other?[say(other,answer(reply.fight,other),'angry')]:[]),say('cat','……うん。先に聞くニャ。怒鳴ったのは、ごめんニャ。','sad')] }
};
const DOORS = {
 chat:{id:'door-chat',kind:'life',title:name=>`${name}が、モクの部屋で足の置き場を探した。`,detail:'モクは訪ねてきた相手を部屋へ誘った。しかし椅子にも床にも缶がある。「座って」と言ってから、姉は慌てて片づけた。',impact:'立ち話で関係が動いた。',lines:actor=>[say('cat','どうぞニャ。……座る前に待って。そこ、缶が転がるニャ。','shy'),say(actor,answer(reply.doorChat,actor),'neutral'),say('cat','片づけ途中ニャ。「途中」は、昨日から続いてるニャ。','tired')]},
 fight:{id:'door-fight',kind:'trouble',title:name=>`${name}の苦情に、モクがドア越しで言い返した。`,detail:'ドアを開けずに答えたモクへ、廊下から困っている理由が返った。姉はドアノブに手をかける。逃げたままでは、話も終わらない。',impact:'口論で関係が悪化した。',lines:actor=>[say('cat','いま開けたら、もっと煙が出るニャ。ここで聞くニャ。','tired'),say(actor,answer(reply.doorFight,actor),'angry'),say('cat','……分かったニャ。ドア閉めて、話まで閉めたのは悪かったニャ。','sad')]},
 steal:{id:'door-steal',kind:'trouble',title:name=>`${name}が、モクの夕飯を先に食べていた。`,detail:'夕飯にするはずの容器が空になっていた。モクが名前の札を見せると、食べた相手はようやく箸を置いた。洗った容器では、お腹は満たせない。',impact:'食べ物がなくなり、モクのストレスと関係が悪化した。',lines:actor=>[say('cat','それ、私の夕飯だったニャ。名前も書いたのにニャ。','angry'),say(actor,answer(reply.steal,actor),'sad'),say('cat','次は先に聞いてニャ。……容器を洗ったのは嬉しいけど、ご飯も返してほしいニャ。','sad')]},
 sell:{id:'door-sell',kind:'trouble',title:name=>`${name}が、買った石より先に財布を見た。`,detail:'縁起物の石の話は、いつの間にか代金の話になっていた。相手の顔を見て、モクは石を引っ込める。今のままでは、運より関係が悪くなる。',impact:'所持金が動き、関係が悪化した。',lines:actor=>[say('cat','買った物の話かと思ってたニャ。お金が絡むなら、先に言ってニャ。','angry'),say(actor,answer(reply.sell,actor),'sad'),say('cat','いらないなら返そうニャ。運が良くなる前に、気まずくなってるニャ。','tired'),say(actor,'うん。次は値段も、先に確認する。','sad')]}
};
const copyLines = lines => lines.map(line => ({ ...line }));
export function catMutters(action) { return MUTTERS[action] || FALLBACK; }
export function catIncident(state,action,otherType=null) {
  const scene=INCIDENTS[action];if(!scene||heard(state,scene.id))return null;mark(state,scene.id);
  return {kind:scene.kind,title:scene.title,detail:scene.detail,impact:scene.impact,lines:typeof scene.lines==='function'?scene.lines(otherType):copyLines(scene.lines)};
}
export function catDoorIncident(state,actorType,action) {
  const scene=DOORS[action];if(!scene||actorType==='cat'||!NAMES[actorType]||heard(state,scene.id))return null;mark(state,scene.id);
  return {kind:scene.kind,title:scene.title(NAMES[actorType]),detail:scene.detail,impact:scene.impact,lines:scene.lines(actorType)};
}
export function catOutingLines(state) {
  if(heard(state,'first-outing'))return null;mark(state,'first-outing');
  return [say('cat','買い出し、行ってくるニャ。今日は食料もちゃんと買うニャ。','neutral'),say('cat','……タバコだけじゃないニャ。最初から疑わないでニャ。','angry'),say('cat','卵とパン、メモしたニャ。メモを忘れたら、帰りに思い出させてニャ。','shy')];
}
export function catRentLines(state,paid) {
  const id=paid?'rent-ok':'rent-short';if(heard(state,id))return null;mark(state,id);
  return paid
    ? [say('cat','家賃、入ってるニャ。数えたから、たぶん足りるニャ。','neutral'),say('cat','……ちゃんと足りた？ よかったニャ。食費を少し調整したニャ。','happy'),say('cat','偉いって言われると、次も払わなきゃって思うニャ。いや、最初から払うけどニャ。','shy')]
    : [say('cat','封筒、足りないニャ。ごめん、買い物の順番を間違えたニャ。','sad'),say('cat','来週、仕事に入れたら返すニャ。……入れなかったら先に連絡するニャ。','sad'),say('cat','タバコ代から減らせって顔してるニャ。分かってるニャ。それは私も思ったニャ。','tired')];
}
export function catRentScene() {
  return {kind:'life',title:'モクが、家賃の封筒を少し誇らしそうに出した。',detail:'モクが封筒を差し出し、足りるか大家の顔を見た。全部入っていると分かると、隠していた息を吐く。次も同じように払うため、仕事の予定を確認した。',impact:'家賃は払われた。'};
}

export function createTalk(latestEventId = 0) {
  return { seenEvent: latestEventId, eventId: 0, index: 0, since: 0, queue: [], mutterIndex: 0, mutterAction: '', mutterShownAt: null, currentMutter: null, bubbles: [] };
}
export function stepTalk(talk, state, now, stopped) {
  if(observationActive(state)){const view=observationView(state);talk.chapterChat=null;talk.bubbles=view?.line?[view.line]:[];talk.mutterShownAt=view?.identity;return talk;}
  if(state.actOne?.chapter===2)return stepSecondActTalk(talk,state,now,stopped);
  if(state.actOne){const view=observationActive(state)?observationView(state):null;talk.bubbles=view?.line?[view.line]:[];talk.mutterShownAt=view?.identity;return talk;}
  for (const event of state.events) {
    if (event.read || event.stageOnly || !event.lines?.length || event.id <= talk.seenEvent || event.id === talk.eventId || talk.queue.includes(event.id)) continue;
    talk.queue.push(event.id);
  }
  talk.queue.sort((a, b) => a - b);
  if (talk.queue.length > 3) for (const id of talk.queue.splice(0, talk.queue.length - 3)) talk.seenEvent = Math.max(talk.seenEvent, id);
  if (!talk.eventId && talk.queue.length) { talk.eventId = talk.queue.shift(); talk.index = 0; talk.since = now; }
  const incident = () => talk.eventId ? state.events.find(event => event.id === talk.eventId) : null;
  let reading = incident();
  if(reading?.read){talk.seenEvent=Math.max(talk.seenEvent,talk.eventId);talk.eventId=0;talk.index=0;reading=null;}
  if (!talk.since) talk.since = now;
  if (!stopped && now - talk.since >= (reading?.lines?.[talk.index] ? SPEECH_MS.line : SPEECH_MS.mutter)) {
    talk.since = now;
    if (reading?.lines?.[talk.index] && talk.index < reading.lines.length - 1) talk.index += 1;
    else if (reading?.lines?.[talk.index]) {
      talk.seenEvent = Math.max(talk.seenEvent, talk.eventId);
      talk.eventId = 0; talk.index = 0; talk.mutterAction = '';
      if (talk.queue.length) { talk.eventId = talk.queue.shift(); talk.index = 0; }
    } else talk.mutterIndex += 1;
  }
  reading = incident();
  const line = reading?.lines?.[talk.index];
  if (line) { talk.currentMutter=null;talk.mutterShownAt=null;talk.bubbles = [{ ...line, text: line.speaker === 'cat' ? mokuNya(line.text) : line.text }]; return talk; }
  const cat = state.residents.find(resident => resident.type === 'cat');
  if (!cat) { talk.bubbles = []; return talk; }
  if(talk.currentMutter&&(stopped||now-talk.mutterShownAt<Math.max(SPEECH_MS.mutter,talk.currentMutter.text.length*100))){talk.bubbles=[talk.currentMutter];return talk;}
  if (cat.action !== talk.mutterAction) { talk.mutterAction = cat.action; talk.mutterIndex += 1; talk.since = now; }
  const pool = state.actOne&&state.actOne.chapter!==2 ? firstActMutters(state) : catMutters(cat.action);
  talk.currentMutter={ speaker:'cat',name:'モク',text:mokuNya(pool[talk.mutterIndex % pool.length]) };
  talk.mutterShownAt=now;talk.since=now;talk.bubbles=[talk.currentMutter];
  return talk;
}

function stepSecondActTalk(talk,state,now,stopped){
 const delta=talk.chapterLastTime===undefined?0:Math.max(0,now-talk.chapterLastTime);talk.chapterLastTime=now;
 if(stopped){if(talk.chapterChat)talk.chapterChat.since+=delta;if(talk.mutterShownAt!==null)talk.mutterShownAt+=delta;return talk;}
 const scene=secondActChat(state);
 if(talk.chapterChat&&(!scene||scene.key!==talk.chapterChat.key))talk.chapterChat=null;
 if(!talk.chapterChat&&scene&&!heard(state,scene.key))talk.chapterChat={...scene,index:0,since:now};
 if(talk.chapterChat){
  const chat=talk.chapterChat;
  if(now-chat.since>=SPEECH_MS.line){chat.index++;chat.since=now;}
  if(chat.index<chat.lines.length){const [speaker,text]=chat.lines[chat.index];talk.bubbles=[say(speaker,text)];return talk;}
  mark(state,chat.key);talk.chapterChat=null;talk.currentMutter=null;
 }
 // Never keep a remote Moku bubble after a meeting ends.
 if(talk.currentMutter?.speaker==='cat'&&!lunaNearby(state))talk.currentMutter=null;
 const pool=lunaMutters(state);
 if(!pool.length){talk.currentMutter=null;talk.bubbles=[];return talk;}
 if(talk.currentMutter&&now-talk.mutterShownAt<Math.max(SPEECH_MS.mutter,talk.currentMutter.text.length*100)){talk.bubbles=[talk.currentMutter];return talk;}
 talk.mutterIndex++;talk.currentMutter=say('hostess',pool[talk.mutterIndex%pool.length]);talk.mutterShownAt=now;talk.bubbles=[talk.currentMutter];return talk;
}

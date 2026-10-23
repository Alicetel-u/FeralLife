// Exact-line direction for chapter dialogue. Neutral deadpan remains intentional
// where no entry exists; never infer a chapter reaction from punctuation alone.
const ACT_EXPRESSION_DIRECTION = {
  cat: {
    tired: [
      '明日からちゃんとするニャ。','でも一睡もしてないから、朝帰りじゃないニャ。',
      '口の換気ニャ……。','明日からやるニャ。今日は準備の日ニャ。',
      '変な大家ニャ。アパートは生き物じゃないニャ。','昨日の夜から起きてるから、まだ昨日ニャ。',
      'モクはもう手遅れニャ。','静かな人がいいニャ。','今日は忙しいニャ。寝る予定があるニャ。',
      'そうニャ。','荷物も持ってっちゃったニャ。','紙の中身は確認しなかったニャ。'
    ],
    surprised: [
      'ニャ？ 誰がニャ？','大家、なんか笑ってるニャ。','……正気かニャ？',
      '新しい住人が来るニャ？','大家、何ぼーっとしてるニャ？',
      '大家？ どうしたニャ？','大家？ 何かあったニャ？','大家？',
      'どうしたニャ？','引っ越すニャ？','……軽っ！？','重いと思って勢いつけすぎたニャ！',
      '何が届くニャ？','ハンコって押すだけで金が出るニャ？'
    ],
    happy: [
      'ちゃんと寝たから、今日はもう働いた気分ニャ。','大家。歓迎会するニャ？','酒代は大家持ちで。','じゃあ酒買ってきてニャ。',
      'モクも手伝うニャ。','大家、仕事が早いニャ。','任せろニャ！ モクは力持ちニャ！',
      'モクのおかげで助かったニャ！','じゃあ、ご褒美にストロング缶買ってニャ。',
      '大家、酒はまだかニャ？'
    ],
    sad: ['卵がないニャ。','箱に裏切られたニャ……。'],
    angry: ['知ってるニャ。時計くらい読めるニャ。','気持ち悪いニャ。','あれは蓋が強かったニャ。'],
    shy: ['タバコ吸っても怒らない人がいいニャ。','タバコの煙が来ても気にしないでほしいニャ。']
  },
  hostess: {
    happy: ['はーい！ 大家さん、代わりに受け取ってくれる？','ありがとー！ 助かった♡','よろしくね！ 夜の仕事だから、帰りが遅くなることもあるけど。'],
    shy: ['今、部屋を片づけてて手が離せないの！ お願い♡'],
    surprised: ['なになに？ どうしたの？'],
    sad: ['え？ ネットで知り合った人からだけど……。']
  }
};
const actExpressionLookup = new Map(Object.entries(ACT_EXPRESSION_DIRECTION).flatMap(([speaker,emotions])=>
  Object.entries(emotions).flatMap(([emotion,texts])=>texts.map(text=>[speaker+'\n'+text,emotion]))));

export function actExpression(speaker,text,emotion='neutral') {
  return emotion==='neutral' ? actExpressionLookup.get(speaker+'\n'+text)||emotion : emotion;
}

export function savedActExpression(line,event) {
  // Resolve old neutral assignments without rewriting saves or ordinary dialogue.
  if(!event.stageOnly||!['opening','prologue','ash','dinner','reply','epilogue','rewind','act2-prologue','bag','contract','act2-epilogue','act2-rewind'].includes(event.actScene))return line?.emotion;
  return actExpression(line?.speaker,line?.text,line?.emotion);
}

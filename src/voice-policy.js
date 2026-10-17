// Shared by extraction and playback; never infer anger from punctuation or sprite emotion.
export function voiceSpeaker(line) {
  return line.speaker==='大家（心の声）'?'manager':line.speaker;
}
export function voicePerformance(line) {
  if(line.voicePerformance)return line.voicePerformance;
  if(line.innerVoice||line.speaker==='大家（心の声）')return 'inner';
  if(line.voiceChapter===2)return actTwoVoicePerformance(line);
  if(voiceSpeaker(line)==='manager'&&/なんで俺が決める|結局、俺が決める|誰のせいだと思って/.test(line.text))return 'weary';
  if(voiceSpeaker(line)==='manager'&&/火を消せよ|誰のせいだよ|箱のせい|換気扇より先|煙だらけ/.test(line.text))return 'retort';
  if(voiceSpeaker(line)==='cat')return line.emotion==='happy'?'moku-happy':line.emotion==='surprised'?'moku-surprised':'moku';
  return 'normal';
}
export function voiceLineKey(line) {
  return JSON.stringify([voiceSpeaker(line),line.text,voicePerformance(line),Boolean(line.memoryVoice)]);
}

// Chapter-scoped delivery keeps already approved act-one recordings unchanged.
export function actTwoVoicePerformance(line){
 const {speaker,text='',emotion='neutral'}=line;
 if(speaker==='hostess'){
  if(emotion==='sad'||/悪いこと|やり直さなきゃ|怖かった|お願い。もう帰って/.test(text))return 'luna-serious';
  if(emotion==='angry')return 'luna-firm';
  if(emotion==='surprised')return 'luna-surprised';
  if(emotion==='tired')return /はぁ/.test(text)?'luna-breathless':'luna-quiet';
  if(emotion==='shy'||/二人きり|二人だけ|あたしの彼氏|俺の彼女|お礼したい|行こ、大家|モクちゃん、それ毎日/.test(text))return 'luna-flirt';
  return emotion==='happy'?'luna-happy':'luna-normal';
 }
 if(speaker==='cat'){
  if(emotion==='sad')return 'act2-moku-sad';
  if(emotion==='angry'||/ルナが嫌が|ルナが帰れ|聞こえなかった|次はこんな/.test(text))return 'act2-moku-firm';
  if(emotion==='surprised')return 'act2-moku-surprised';
  return emotion==='happy'?'act2-moku-happy':'act2-moku';
 }
 if(/うるせ|黙って|違うんだ|ちげぇ|ニヤけて|今いいところ|真っ先に寝|見張る相手|バケモノ|わああ/.test(text))return 'act2-retort';
 if(/嘘だろ|分からねぇ|募集しない|帰ってくる|ルナが戻|知らないやつ|夢.*だった|生きてる/.test(text))return 'act2-manager-serious';
 if(/帰れ|近づくな|守る|守れ|あんな目|追い回して/.test(text))return 'act2-manager-firm';
 return 'act2-manager';
}

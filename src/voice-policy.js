// Shared by extraction and playback; never infer anger from punctuation or sprite emotion.
export function voiceSpeaker(line) {
  if(line.voiceChapter===3&&line.speaker==='mystery')return 'rabbit';
  // The one shared post-battle scene has a spoken neutral narration.
  // Keep the visible transcript speaker as narrator; borrow the existing
  // announcer voice only for its sound, not the ending dialogue.
  if(line.speaker==='narrator'&&line.duelVictoryResult&&line.duelDefeated)return 'announcer';
  return line.speaker==='大家（心の声）'?'manager':line.speaker;
}
export function voicePerformance(line) {
  if(line.voicePerformance)return line.voicePerformance;
  // The voice-review catalog stores this voiced narration under its audio actor
  // (announcer) while the game still displays it as narrator. Keep its key stable.
  if(['narrator','announcer'].includes(line.speaker)&&line.duelVictoryResult&&line.duelDefeated)return 'act2-victory-narration';
  if(line.voiceChapter===3)return actThreeVoicePerformance(line);
  if(line.innerVoice||line.speaker==='大家（心の声）')return 'inner';
  if(Number.isInteger(line.duelRound)&&!line.duelEnding){
    const speaker=voiceSpeaker(line);
    if(speaker==='manager')return line.duelAttack?'duel-manager-attack':'duel-manager';
    if(speaker==='cat')return line.duelAttack?'duel-moku-attack':'duel-moku';
    if(speaker==='hostess')return 'duel-luna';
  }
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

export function actThreeVoicePerformance(line){
 if(line.collapse||/^[…\s]*[えは]？$/.test(line.text))return 'act3-shocked';
 if(/^[…\s]+$/.test(line.text))return 'act3-silence';
 if(line.aftermath&&line.emotion==='surprised'||line.emotion==='surprised'&&line.horde)return 'act3-panic';
 if(line.emotion==='surprised')return 'act3-startled';
 if(line.speaker==='rabbit'||line.speaker==='mystery')return line.emotion==='happy'?'act3-mimi-bright':line.emotion==='sad'||line.speaker==='mystery'?'act3-mimi-afraid':'act3-mimi';
 if(line.speaker==='manager')return /離れるな|動くな|止まれ|生き残らせる|危険/.test(line.text)?'act3-resolute':'act3-manager';
 if(line.emotion==='sad'||line.emotion==='tired')return 'act3-tense';
 return line.emotion==='happy'?'act3-relieved':'act3-alert';
}

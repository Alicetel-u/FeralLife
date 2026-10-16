// Shared by extraction and playback; never infer anger from punctuation or sprite emotion.
export function voiceSpeaker(line) {
  return line.speaker==='大家（心の声）'?'manager':line.speaker;
}
export function voicePerformance(line) {
  if(line.voicePerformance)return line.voicePerformance;
  if(line.innerVoice||line.speaker==='大家（心の声）')return 'inner';
  if(voiceSpeaker(line)==='manager'&&/なんで俺が決める|結局、俺が決める|誰のせいだと思って/.test(line.text))return 'weary';
  if(voiceSpeaker(line)==='manager'&&/火を消せよ|誰のせいだよ|箱のせい|換気扇より先|煙だらけ/.test(line.text))return 'retort';
  if(voiceSpeaker(line)==='cat')return line.emotion==='happy'?'moku-happy':line.emotion==='surprised'?'moku-surprised':'moku';
  return 'normal';
}
export function voiceLineKey(line) {
  return JSON.stringify([voiceSpeaker(line),line.text,voicePerformance(line),Boolean(line.memoryVoice)]);
}

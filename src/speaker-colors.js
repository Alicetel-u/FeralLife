// Dark-panel and pale-bubble variants of the same speaker identity.
export const SPEAKER_COLORS={
 cat:['#bad8a6','#36562c'],hostess:['#ffb5d6','#863651'],sister:['#ffe09d','#72501c'],
 fox:['#ffc29a','#834324'],peko:['#a9e5e0','#23605d'],ann:['#d5baff','#674080'],
 rabbit:['#f6bcec','#7b3d70'],wolf:['#afccff','#36558a'],bear:['#e1cf9b','#645122'],
 mouse:['#cbd5a2','#515f2c'],tanuki:['#f4bbab','#804635'],
 manager:['#bce2ff','#315b7b'],narrator:['#eee5d7','#514b43'],inner:['#c8c8e5','#51516f'],
 mystery:['#dfb9e8','#714779'],memory:['#c4d9dc','#425e64']
};
export function speakerColors(line){const key=line?.memoryVoice?'memory':line?.innerVoice?'inner':line?.speaker;return SPEAKER_COLORS[key]||SPEAKER_COLORS.narrator;}
export function speakerColorStyle(line){const [night,day]=speakerColors(line);return `--speech-color:${night};--speech-day:${day}`;}

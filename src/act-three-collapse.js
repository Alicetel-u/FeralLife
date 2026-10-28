// Two preloaded stills and a short compositor animation make the fall legible.
export const ACT_THREE_COLLAPSE_ART={
 fall:'assets/events/chapter3/bridge-collapse-fall.png',
 after:'assets/events/chapter3/bridge-collapse-after.png'
};
export const ACT_THREE_COLLAPSE_HOLD=3.2;
export function actThreeCollapseFrame(age,reduced=false){
 const t=Math.max(0,Number(age)||0),mix=reduced?1:Math.min(1,Math.max(0,(t-.45)/.35));
 const impact=reduced?0:Math.max(0,1-Math.abs(t-.55)/.2)*4;
 return {phase:reduced||t>=.8?'aftermath':t<.45?'fall':'impact',fallOpacity:1-mix,afterOpacity:mix,transform:`translate(${Math.sin(t*67)*impact}px,${Math.cos(t*71)*impact}px) scale(${reduced?1:1+Math.min(t/ACT_THREE_COLLAPSE_HOLD,1)*.025})`,ready:t>=ACT_THREE_COLLAPSE_HOLD};
}
export function actThreeCollapseHTML(){return `<div class="bridge-collapse-scene" hidden aria-label="橋の上に倒れたモクとルナを見て立ち尽くす大家"><div class="bridge-collapse-frame"><img class="bridge-collapse-art bridge-collapse-fall" src="${ACT_THREE_COLLAPSE_ART.fall}" alt="モクとルナの膝が同時に崩れ、橋の路面へ倒れ込む"><img class="bridge-collapse-art bridge-collapse-after" src="${ACT_THREE_COLLAPSE_ART.after}" alt="橋の路面に全身を横たえて動かないモクとルナ。その間で大家が立ち尽くしている"></div><div class="bridge-collapse-shade" aria-hidden="true"></div></div>`;}

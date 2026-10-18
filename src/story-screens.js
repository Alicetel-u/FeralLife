// Graphic framing only: original buttons, text, cinematic timers and saves stay intact.
export function storyScreenHTML(html){
 const root=html.match(/^<section\b([^>]*)>/);if(!root)return html;
 const classes=root[1].match(/\bclass="([^"]*)"/)?.[1]?.split(/\s+/)||[];
 if(classes.includes('showcase-screen')||classes.includes('graphic-title')||classes.includes('unified-fire'))return html;
 const kind=classes.includes('act-intermission')?'intermission':classes.includes('act-title')?'chapter':classes.includes('act-burn')?'bad':classes.includes('act-clear')?'clear':classes.includes('debt-cinematic')?'debt':classes.includes('fire-cinematic')?'fire':classes.includes('rewind-screen')?'rewind':null;
 if(!kind)return html;
 const chapter=root[1].match(/data-chapter="(\d+)"/)?.[1]||'1';
 const serial=chapter==='2'?'02':'01';
 const sold=root[1].includes('data-debt-kind="sold"');
 const word={intermission:'NEXT',chapter:serial,bad:'BAD END',clear:'CLEAR',debt:sold?'SOLD':'SEIZED',fire:'BURN',rewind:'REWIND'}[kind];
 const chrome=`<div class="showcase-geometry" aria-hidden="true"><i class="showcase-plane"></i><i class="showcase-cut"></i><i class="showcase-dots"></i><span class="showcase-word">${word}</span></div><div class="showcase-wipe" aria-hidden="true"></div>`;
 const opening=root[0].replace(/class="([^"]*)"/,`class="$1 showcase-screen showcase-${kind}${kind==='intermission'?' showcase-clear':''}"`).replace(/>$/,` data-screen-kind="${kind}">`);
 return html.replace(root[0],opening+chrome);
}

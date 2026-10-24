// Short visual punchlines tied to the existing voiced observation lines.
// No RNG, timers, input, gameplay changes, or new save fields.
const gagClamp=n=>Math.max(0,Math.min(1,n));
const gagEase=n=>{n=gagClamp(n);return n*n*(3-2*n);};
const gagMix=(a,b,p)=>a+(b-a)*gagEase(p);
export const OBSERVATION_GAGS=['seat','ash-sign','phone-search','tv-late','before-dinner','blanket','wake-up','last-morning'];
export function observationComedy(state,resident,{reduced=false}={}){
 const act=state.actOne,o=act?.observation;
 if(!act?.started||act.status!=='playing'||act.pending||act.rewindIntroPending||act.prologuePending||!o)return null;
 let c=o.current;
 // Let a punchline settle during the existing inter-scene pause.
 if(!c&&o.gap>0&&o.done?.length)c={id:o.done.at(-1),index:99,elapsed:3};
 if(!c&&resident.type==='cat'&&resident.lifeBeat===17&&o.done?.includes('seat'))c={id:'seat',index:4,elapsed:3};
 if(!c&&resident.type==='cat'&&resident.lifeBeat===55&&o.done?.includes('wake-up'))c={id:'wake-up',index:1,elapsed:3};

 if(!c||!OBSERVATION_GAGS.includes(c.id))return null;
 const i=c.index||0,e=Math.max(0,c.elapsed||0),p=reduced?1:gagEase(e/.65),late=reduced?1:gagEase((e-.45)/.65);
 const d={id:c.id,action:'idle',pose:'stand',dx:0,dy:0,rotate:0,direction:1,props:[],reaction:null};
 const prop=(kind,x,y=0,extra={})=>d.props.push({kind,x,y,...extra});
 const cat=resident.type==='cat',luna=resident.type==='hostess';
 switch(c.id){
 case 'seat':
  if(!cat)return null;
  d.pose=i>=4?'sit':i===2?'stand':'clean';d.action=i>=4?'idle':i===2?'idle':'clean';
  d.dx=i===1?gagMix(0,-14,p):i===2?-14:i===3?gagMix(-14,10,p):i>=4?10:0;
  d.direction=i===1?-1:1;d.rotate=reduced?0:i===1||i===3?-.045*Math.sin(p*Math.PI):0;
  prop('can',i===0?-17:i===1?gagMix(-17,-43,late):-43,0,{angle:i===1?late*4.7:i>1?4.7:0});
  prop('can',i<3?20:i===3?gagMix(20,46,late):46,0,{angle:i===3?late*4.7:i>3?4.7:0});
  if(i===2)d.reaction='discover';if(i>=4)d.reaction='proud';break;
 case 'ash-sign':
  if(!cat)return null;
  d.pose=i===0?'stand':'chat';d.action='idle';
  prop('ashtray',25,-30);
  if(i===1){d.rotate=reduced?0:-.07*Math.sin(p*Math.PI);for(let n=0;n<4;n++)prop('stub',25+(n-1.5)*12*late,-30+30*late,{angle:late*(n-1)});d.reaction=late>.5?'oops':null;}
  if(i>=2)d.reaction='call';break;
 case 'phone-search':
  if(!cat)return null;
  // The phone was in her hand all along; do not spawn a second one at the reveal.
  d.pose=i>=2?'chat':'stand';d.direction=i===0?-1:1;d.rotate=!reduced&&i<2?-.07*p:0;
  prop('phone',i>=2?gagMix(-18,24,p):-18,i>=2?gagMix(-34,-66,p):-34);
  d.reaction=i>=2?'discover':i===1?'question':null;break;
 case 'tv-late':
  if(!cat)return null;d.pose='sit';prop('remote',23,-37,{angle:i===0?gagMix(-.4,.2,p):.2});
  d.reaction=i>=1?'proud':null;break;
 case 'before-dinner':
  if(!cat)return null;d.pose=i===0?'sit':i===1?'stand':'eat';d.action=i>=2?'eat':'idle';
  d.reaction=i===1?'hungry':null;d.rotate=!reduced&&i===1?-.045*p:0;break;
 case 'blanket':
  if(!cat)return null;d.pose='sleep';d.action='sleep';
  d.rotate=0;
  d.reaction=i===1?'sleepy':null;break;
 case 'wake-up':
  if(!cat)return null;d.pose=i===0?'sit':'stand';d.action='idle';
  if(i>=1){d.dx=10*p;d.dy=23*p;}d.reaction=i===0?'sleepy':null;break;
 case 'last-morning':
  if(!cat)return null;d.pose=i===0?'drink':i===1?'stand':'sit';d.action=i===0?'drink':'idle';
  prop('can',35,0);if(i===1)d.reaction='discover';if(i>=2)d.reaction='proud';break;

 }
 return d;
}

// Props are small code-drawn objects, using the same scale in room and overview.
export function drawObservationComedy(ctx,d,x,y,u,{reduced=false}={}){
 if(!d)return;
 const box=(a,b,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(a,b,w,h);};
 for(const prop of d.props){
  ctx.save();ctx.translate(x+prop.x*u,y+prop.y*u);ctx.scale(u,u);ctx.rotate(prop.angle||0);
  switch(prop.kind){
   case 'can':box(-5,-13,10,13,'#cfa54e');box(-5,-13,10,2,'#f4e8cc');box(-5,-5,10,3,'#54645a');box(-4,-1,8,1,'#71572e');break;
   case 'phone':box(-5,-15,10,18,'#252b38');box(-3,-13,6,12,'#9fd6df');box(-1,1,2,1,'#e9e8db');break;
   case 'remote':box(-3,-13,6,16,'#3a3544');box(-1,-11,2,2,'#c8746d');box(-1,-6,2,5,'#b9bbc2');break;
   case 'bag':box(-13,-26,26,26,'#915a65');box(-8,-32,16,7,'#3e3543');box(-13,-18,26,3,'#d3a58b');break;
   case 'shoe':box(-9,-6,18,6,'#e6c1ac');box(4,-14,4,9,'#9f686a');box(-9,-2,18,2,'#765056');break;
   case 'ashtray':box(-12,-4,24,5,'#84989b');box(-10,-6,20,2,'#d4dbcf');for(let n=0;n<4;n++)box(-8+n*5,-10-(n%2)*3,4,5,'#e7d9b8');break;
   case 'stub':box(-3,-2,6,3,'#d6c4a1');box(2,-2,2,3,'#66554c');break;
   case 'cloth':box(-8,-3,16,6,'#a5d4d2');break;
   case 'dish':box(-12,-3,24,3,'#f1e8d6');box(-8,0,16,2,'#9ca5aa');break;
   case 'glass':box(-6,-15,12,16,'#cee9e8');box(-4,-8,8,7,'#99cbd5');box(-6,-16,12,2,'#edf7ed');break;
   case 'photo':box(-23,-17,46,34,'#fff2d5');box(-20,-14,40,25,'#b8d6d2');box(-10,-8,11,15,'#cc8494');box(-11,-11,13,8,'#49343a');if(!prop.missingCat){box(6,-8,10,15,'#292932');box(5,-13,4,6,'#292932');box(14,-13,4,6,'#292932');}break;
   case 'keys':ctx.strokeStyle='#e8cc75';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-9,4,0,Math.PI*2);ctx.moveTo(0,-5);ctx.lineTo(0,5);ctx.lineTo(4,5);ctx.stroke();break;
  }
  ctx.restore();
 }
 if(!d.reaction)return;
 ctx.save();ctx.translate(x+34*u,y-105*u);ctx.scale(u,u);ctx.lineWidth=2;ctx.strokeStyle='#fff1b3';ctx.fillStyle='#fff1b3';
 // Static punctuation has no input affordance; never add a tap target or prompt.
 if(['question','oops','call'].includes(d.reaction)){
  ctx.font='bold 23px sans-serif';ctx.fillText(d.reaction==='question'?'?':'!',-5,0);
 }else if(d.reaction==='hungry'){
  ctx.beginPath();ctx.moveTo(-13,45);ctx.lineTo(-6,39);ctx.lineTo(1,45);ctx.lineTo(8,39);ctx.stroke();
 }else if(d.reaction==='sleepy'){
  ctx.font='bold 17px sans-serif';ctx.fillText('z',-5,0);
 }else {
  ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(0,9);ctx.moveTo(-8,0);ctx.lineTo(8,0);ctx.stroke();
 }
 ctx.restore();
}

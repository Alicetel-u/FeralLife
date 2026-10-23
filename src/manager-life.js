import {ACTIONS} from './simulation.js';
import {sampleJourney} from './movement.js';
// Presentation-only caretaker. Never a tenant, a needs simulation or a save mutation.
export function managerReaction(line){
 if(!line)return 'idle';
 const emotion=line.emotion,text=line.text||'';
 if(emotion==='surprised'||/燃えて|燃える|危ね|危ない|なんだって|えっ|は！？/.test(text))return 'surprised';
 if(emotion==='happy'||/ありがとう|ありがとな|よかった|助かった|生き残|守れた/.test(text))return 'happy';
 if(emotion==='sad'||/俺のせい|俺が悪|やっちま|申し訳|すまな/.test(text))return 'sad';
 if(emotion==='tired'||/はぁ|ため息|ったく|やれやれ|結局、俺/.test(text))return 'retort';
 if(emotion==='angry')return 'angry';
 if(/消せよ|なんだよ|誰のせい|なんで俺|じゃねぇか|するな|すんな|だろ、それ|問題にするな|寝てん/.test(text))return 'retort';
 return 'idle';
}
export function managerTarget(state,bubbles=[]){
 if(state.actOne?.chapter!==2&&state.actOne?.started&&!state.actOne?.completed?.includes('ash')&&!state.actOne?.pending){
  const speaking=bubbles[0];const p=state.residents.find(r=>r.type==='cat');
  const meeting=p?.lifeBeat===19.3;
  return {x:650,y:513,zone:'street',chat:meeting,direction:1,pose:meeting&&speaking?.speaker==='manager'?managerReaction(speaking):'clean'};
 }
 const outside=state.residents.map(r=>({r,p:sampleJourney(r,state.hour,ACTIONS[r.action].place)})).filter(({p})=>p.zone==='street'||(p.zone==='hall'&&p.y>=430));
 const speaking=bubbles[0];
 const visitor=outside.find(({r})=>r.type===speaking?.speaker)||outside.find(({r})=>r.room===state.selected);
 if(visitor){const {p}=visitor;return {x:Math.min(930,p.x+110),y:p.y,zone:p.zone,chat:true,direction:-1,pose:speaking?.speaker==='manager'?managerReaction(speaking):'idle'};}
 return {x:650,y:513,zone:'street',chat:false,direction:1,pose:'clean'};
}
// Four phases follow travelled distance, so pauses and frame rate never make
// the feet step in place or jump to an unrelated global animation phase.
export function managerFrame(target,t,moving=false,walkDistance=null){
 if(moving){
  const phase=walkDistance===null?t*5:walkDistance/20;
  return ['walk_a','walk_pass_a','walk_b','walk_pass_b'][Math.floor(phase)%4];
 }
 return target.chat?target.pose:(Math.floor(t*3)%2?'clean_b':'clean_a');
}
export function advanceManager(current,target,seconds){
 const p=current||{x:650,y:513,zone:'street',goalZone:'street',route:[]};
 const route=p.goalZone!==target.zone?(target.zone==='hall'?[{x:815,y:513},{x:777,y:440}]:[{x:777,y:440},{x:815,y:513}]):[...(p.route||[])];
 let x=p.x,y=p.y,travelled=0,budget=Math.max(0,Math.min(.1,seconds))*100;
 while(budget>0){const next=route[0]||target,dx=next.x-x,dy=next.y-y,d=Math.hypot(dx,dy);if(d<=budget){x=next.x;y=next.y;budget-=d;travelled+=d;if(route.length){route.shift();continue;}break;}x+=dx*budget/d;y+=dy*budget/d;travelled+=budget;break;}
 const moving=route.length>0||Math.hypot(target.x-x,target.y-y)>.01;
 const direction=Math.abs(x-p.x)>.001?Math.sign(x-p.x):(p.direction||target.direction||1);
 const zone=route.length===1?'stairs':route.length>1?(target.zone==='hall'?'street':'hall'):target.zone;
 return {x,y,zone,goalZone:target.zone,route,moving,direction,walkDistance:(p.walkDistance||0)+travelled};
}

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
 const outside=state.residents.map(r=>({r,p:sampleJourney(r,state.hour,ACTIONS[r.action].place)})).filter(({p})=>p.zone==='street'||(p.zone==='hall'&&p.y>=430));
 const speaking=bubbles[0];
 const visitor=outside.find(({r})=>r.type===speaking?.speaker)||outside.find(({r})=>r.room===state.selected);
 if(visitor){const {p}=visitor;return {x:Math.min(930,p.x+110),y:p.y,zone:p.zone,chat:true,direction:-1,pose:speaking?.speaker==='manager'?managerReaction(speaking):'idle'};}
 return {x:650,y:513,zone:'street',chat:false,direction:1,pose:'clean'};
}
export function managerFrame(target,t,moving=false){
 if(moving)return Math.floor(t*4)%2?'walk_b':'walk_a';
 return target.chat?target.pose:(Math.floor(t*3)%2?'clean_b':'clean_a');
}
export function advanceManager(current,target,seconds){
 const p=current||{x:650,y:513,zone:'street',goalZone:'street',route:[]};
 const route=p.goalZone!==target.zone?(target.zone==='hall'?[{x:815,y:513},{x:777,y:440}]:[{x:777,y:440},{x:815,y:513}]):[...(p.route||[])];
 let x=p.x,y=p.y,budget=Math.max(0,Math.min(.1,seconds))*100;
 while(budget>0){const next=route[0]||target,dx=next.x-x,dy=next.y-y,d=Math.hypot(dx,dy);if(d<=budget){x=next.x;y=next.y;budget-=d;if(route.length){route.shift();continue;}break;}x+=dx*budget/d;y+=dy*budget/d;break;}
 const moving=route.length>0||Math.hypot(target.x-x,target.y-y)>.01;
 const direction=Math.abs(x-p.x)>.001?Math.sign(x-p.x):(p.direction||target.direction||1);
 return {x,y,zone:route.length?p.zone:target.zone,goalZone:target.zone,route,moving,direction};
}

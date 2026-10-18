// Snapshots live at story milestones, never at a fixed interval before a failure.
export function saveStoryCheckpoint(state,scene,label){
 const snapshot=JSON.parse(JSON.stringify({...state,actOne:{...state.actOne,rollbackPoint:undefined}}));
 state.actOne.rollbackPoint={kind:'story',scene,label,state:snapshot};
}
export function validStoryCheckpoint(point,chapter){
 const s=point?.state,a=s?.actOne;
 if(point?.kind!=='story'||!a||(a.chapter||1)!==chapter||typeof point.label!=='string')return false;
 if(chapter===1&&point.scene==='ash'&&s.hour===23&&a.pending===null&&a.completed.length===0){
  return s.events?.some(e=>e.actScene==='ash'&&e.hour===23)===true;
 }
 const routes=chapter===2?{bag:[57,57,[]],contract:[62,81,['bag']]}:{ash:[17,17,[]],dinner:[19,37,['ash']]};
 const route=routes[point.scene];if(!route)return false;
 const [min,max,completed]=route;
 return s.hour>=min&&(min===max?s.hour===max:s.hour<max)&&JSON.stringify(a.completed)===JSON.stringify(completed);
}
export function storyCheckpointTarget(state){
 const a=state.actOne,second=a.chapter===2,late=second?a.failure?.startsWith('contract-'):a.failure?.startsWith('dinner-');
 const point=a.rollbackPoint;
 if(!second&&!late&&(a.attempt===1||point?.scene==='ash'&&point.state?.hour===23&&validStoryCheckpoint(point,1)))return {hour:23,label:'灰皿の相談を受けた夜'};
 return {hour:point?.kind==='story'&&validStoryCheckpoint(point,second?2:1)?point.state.hour:second?(late?62:57):(late?23:17),label:second?(late?'あの男が立ち去った夕暮れ':'ルナが越してきた日'):(late?'灰皿の吸い殻を片づけた夜':'初めてモクの部屋を訪ねた夕暮れ')};
}

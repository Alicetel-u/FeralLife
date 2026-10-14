// Snapshots live at story milestones, never at a fixed interval before a failure.
export function saveStoryCheckpoint(state,scene,label){
 const snapshot=JSON.parse(JSON.stringify({...state,actOne:{...state.actOne,rollbackPoint:undefined}}));
 state.actOne.rollbackPoint={kind:'story',scene,label,state:snapshot};
}
export function validStoryCheckpoint(point,chapter){
 const s=point?.state,a=s?.actOne;
 if(point?.kind!=='story'||!a||(a.chapter||1)!==chapter||typeof point.label!=='string')return false;
 const routes=chapter===2?{bag:[57,57,[]],contract:[62,81,['bag']]}:{ash:[17,17,[]],dinner:[19,37,['ash']]};
 const route=routes[point.scene];if(!route)return false;
 const [min,max,completed]=route;
 return s.hour>=min&&(min===max?s.hour===max:s.hour<max)&&JSON.stringify(a.completed)===JSON.stringify(completed);
}
export function storyCheckpointTarget(state){
 const a=state.actOne,second=a.chapter===2,late=second?a.failure?.startsWith('contract-'):a.failure?.startsWith('dinner-');
 const point=a.rollbackPoint;
 return {hour:point?.kind==='story'&&validStoryCheckpoint(point,second?2:1)?point.state.hour:second?(late?62:57):(late?19:17),label:second?(late?'バッグの事件を回避した直後':'第二幕の開始時点'):(late?'灰皿の火事を回避した直後':'1日目17時・物語の開始時点')};
}

// Dialogue position is stored apart from the journal read flag so Continue can
// reopen the same line, including the reply before a BAD ending. Chapter two
// uses the same cursor; duel saves keep their own cursor as a fallback.
export function resumeConversation(state){
 const a=state.actOne,p=a?.conversation;
 if(!a||!p||!Number.isInteger(p.eventId)||!Number.isInteger(p.cursor)||p.cursor<0)return null;
 // Saves made before pages were stored resume that line at its first page.
 if(p.page!==undefined&&(!Number.isInteger(p.page)||p.page<0))return null;
 const event=state.events.find(e=>e.id===p.eventId&&e.lines?.length);
 if((event?.actScene==='epilogue'||event?.actScene==='act2-epilogue')&&a.epilogueSeen)return null;
 return event?{event,cursor:p.cursor,page:p.page??0}:null;
}
export function rememberConversation(state,event,cursor,page){
 if(state.actOne)state.actOne.conversation={eventId:event.id,cursor,page};
}
export function clearConversation(state,eventId){
 if(state.actOne?.conversation?.eventId===eventId)delete state.actOne.conversation;
}
function outcomeReply(state){
 // The journal is newest-first. Only the latest authored scene can be the current reply.
 for(const event of state.events||[]){
  if(!event.actScene)continue;
  return event.actScene==='reply'&&event.lines?.length?event:null;
 }
 return null;
}
// Continue restores the scene the player was actually in. A BAD ending cinematic
// is not a resume target: unfinished replies stay open, and a cinematic that
// already started returns to the rewind instead of replaying the fire.
export function continueDestination(state){
 const a=state.actOne;
 if(!a)return state.ending?{type:'ending'}:{type:'observe'};
 const reply=outcomeReply(state);
 const conversation=resumeConversation(state);
 if(reply&&!reply.read&&(!conversation||reply.id>conversation.event.id))return {type:'event',id:reply.id,cursor:0,page:0};
 if(conversation?.event.actScene==='reply')return {type:'event',id:conversation.event.id,cursor:conversation.cursor,page:conversation.page};
 if(a.status==='bad'&&a.outcomeSeen)return {type:'rewind'};
 if(a.status==='bad'&&reply&&conversation?.event.id!==reply.id)return {type:'event',id:reply.id,cursor:0,page:0};
 if(conversation)return {type:'event',id:conversation.event.id,cursor:conversation.cursor,page:conversation.page};
 const duel=a.duel,duelEvent=duel&&state.events.find(event=>event.id===duel.eventId);
 if(duelEvent?.duel&&!duel.dialogueComplete)return {type:'event',id:duelEvent.id,cursor:duel.cursor||0,page:duel.page||0};
 if(a.rewindIntroPending){
  const intro=state.events.find(event=>event.actScene===(a.chapter===2?'act2-rewind':'rewind'));
  if(intro)return {type:'event',id:intro.id,cursor:a.rewindIntroCursor||0,page:0};
 }
 if(a.chapter===2&&a.titlePending)return {type:'act2-opening'};
 if(a.chapter===2&&a.prologuePending){
  const intro=state.events.find(event=>event.actScene==='act2-prologue');
  if(intro)return {type:'event',id:intro.id};
 }
 if(a.status==='bad'&&state.ending)return {type:'rewind'};
 if(state.ending)return {type:'ending'};
 if(a.pending)return {type:'event',id:a.pending.eventId};
 return {type:'observe'};
}

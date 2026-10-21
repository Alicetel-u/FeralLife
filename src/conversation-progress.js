// First-act dialogue has no duel cursor. Keep its visible line/page separately
// from the journal's read flag, including the conversation before a BAD ending.
export function resumeConversation(state){
 const a=state.actOne,p=a?.conversation;
 if(!a||a.chapter===2||!p||![p.eventId,p.cursor,p.page].every(Number.isInteger)||p.cursor<0||p.page<0)return null;
 const event=state.events.find(e=>e.id===p.eventId&&e.lines?.length);
 if(event?.actScene==='epilogue'&&a.epilogueSeen)return null;
 return event?{event,cursor:p.cursor,page:p.page}:null;
}
export function rememberConversation(state,event,cursor,page){
 if(state.actOne&&state.actOne.chapter!==2)state.actOne.conversation={eventId:event.id,cursor,page};
}
export function clearConversation(state,eventId){
 if(state.actOne?.conversation?.eventId===eventId)delete state.actOne.conversation;
}

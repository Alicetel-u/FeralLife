import {voiceReviewParseReport} from '../src/voice-review-release.js';
import {voiceReviewEmpty,voiceReviewImport} from '../src/voice-review-store.js';
import {planVoices,digest} from './voice-script.mjs';
const tags=new Set(['animated','conversational','lighthearted','excited','exasperated','surprised','confused','thoughtful','worried','panicked','pleading','shouting','confident','sad','crying','strained','serious','warmly','upbeat','playful']);
const only=(value,keys)=>{if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(key=>!keys.includes(key)))throw Error('Unexpected request fields');};
export function compileVoiceAutomation(request,{catalog,retired,script,ids,config,pronunciations,repairs,ledger}){
 only(request,['requestId','maxCredits','report','corrections']);
 if(!/^[a-zA-Z0-9][a-zA-Z0-9_-]{7,63}$/.test(request.requestId)||!Number.isInteger(request.maxCredits)||request.maxCredits<0||request.maxCredits>5000||!Array.isArray(request.corrections)||request.corrections.length>30)throw Error('Invalid request ID, credit cap or correction count');
 const requestDigest=digest(request),prior=Object.hasOwn(ledger.runs,request.requestId)?ledger.runs[request.requestId]:null;
 if(prior){
  if(prior.requestDigest!==requestDigest)throw Error('Request ID was already used with different content');
  if(prior.status!=='completed')throw Error('Previous attempt is unfinished; inspect its journal before retrying. No new API calls were made.');
  return {noop:true,requestId:request.requestId,requestDigest};
 }
 const report=voiceReviewParseReport(typeof request.report==='string'?request.report:JSON.stringify(request.report),[...catalog,...retired]);
 const state=voiceReviewEmpty();voiceReviewImport(state,report);
 const active=new Map(catalog.map(row=>[row.id,row])),inactive=new Set(retired.map(row=>row.id)),targets=new Set();
 for(const [id,record] of Object.entries(state.records))if(record.status==='ng'&&!inactive.has(id)){
  if(!active.has(id)||active.get(id).version!==record.version)throw Error('A report refers to missing or outdated audio');
  targets.add(id);
 }
 const resolved=new Map([...active.values()].flatMap(row=>[[row.id,row],[row.reviewId,row]])),selected=new Map();
 for(const correction of request.corrections){
  only(correction,['id','spokenText','tags','settings','comment']);
  const row=resolved.get(correction.id);
  if(!row||!targets.has(row.id)||selected.has(row.id))throw Error('Corrections must match each current NG exactly once');
  if(typeof correction.spokenText!=='string'||!correction.spokenText.trim()||correction.spokenText.length>1500||/\[|\]/.test(correction.spokenText)||typeof correction.comment!=='string'||!correction.comment.trim()||correction.comment.length>200)throw Error('Invalid spoken text or factual repair comment');
  if(!Array.isArray(correction.tags)||!correction.tags.length||correction.tags.some(tag=>!tags.has(tag)))throw Error('Use supported, clearly spoken acting tags');
  only(correction.settings,['stability','similarity_boost','speed']);
  const settings={stability:.5,similarity_boost:.75,speed:1,...correction.settings};
  if(![0,.5,1].includes(settings.stability)||!Number.isFinite(settings.similarity_boost)||settings.similarity_boost<0||settings.similarity_boost>1||!Number.isFinite(settings.speed)||settings.speed<.8||settings.speed>1.2)throw Error('Voice settings are outside the supported range');
  const rule={speaker:JSON.parse(row.id)[0],text:row.line.text,spokenText:correction.spokenText,tags:correction.tags.map(tag=>'['+tag+']'),settings,repairComment:correction.comment};
  if([...selected.values()].some(old=>old.speaker===rule.speaker&&old.text===rule.text&&JSON.stringify(old)!==JSON.stringify(rule)))throw Error('Different performances of the same text need identical corrections or separate requests');
  selected.set(row.id,rule);
 }
 if(selected.size!==targets.size)throw Error('Every current NG needs one correction; retired NGs need none');
 const nextRepairs=structuredClone(repairs);
 for(const rule of selected.values()){
  const index=nextRepairs.lines.findIndex(old=>old.speaker===rule.speaker&&old.text===rule.text);
  if(index<0)nextRepairs.lines.push(rule);else nextRepairs.lines[index]=rule;
 }
 const rows=planVoices(script.filter(row=>targets.has(row.lineKey)),ids,config,pronunciations,nextRepairs.lines);
 if(rows.length!==targets.size)throw Error('The generation script does not cover every review target');
 const planId=digest(rows.map(row=>({source:row.source,hash:row.hash}))),estimatedCredits=rows.reduce((sum,row)=>sum+row.billableCharacters*config.estimatedCreditsPerCharacter,0);
 if(estimatedCredits>request.maxCredits)throw Error('Estimated credits exceed the requested cap');
 if(rows.length&&Object.values(ledger.runs).some(run=>run.planId===planId))throw Error('This exact audio plan was already attempted. Inspect it instead of generating again.');
 return {noop:false,requestId:request.requestId,requestDigest,planId,estimatedCredits,count:rows.length,report,nextRepairs,targets:[...targets]};
}

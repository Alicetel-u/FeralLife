import {voiceReviewImport,voiceReviewEmpty} from './voice-review-store.js';

export function voiceReviewValidatePublished(payload){
 if(payload?.schema!==1||!payload.decisions||typeof payload.decisions!=='object'||Array.isArray(payload.decisions))throw Error('公開用の音声判定形式が不正です。');
 for(const [id,r] of Object.entries(payload.decisions)){
  const key=JSON.parse(id);
  if(!Array.isArray(key)||key.length!==4||!['manager','cat','hostess'].includes(key[0])||typeof key[1]!=='string'||typeof key[2]!=='string'||typeof key[3]!=='boolean'||!['ok','ng'].includes(r?.status)||!r.version||typeof r.version!=='string'||r.version.length>128||!Number.isFinite(Date.parse(r.updatedAt)))throw Error('公開用の音声判定が不正です。');
  if(Object.keys(r).some(name=>!['status','version','updatedAt'].includes(name)))throw Error('公開用の判定にメモなどの非公開情報を含めないでください。');
 }
 if(Object.keys(payload).some(name=>!['schema','decisions'].includes(name)))throw Error('公開用データに余分な情報があります。');
 return payload;
}

// Audio identity takes precedence over a later timestamp on an obsolete recording.
export function voiceReviewApplyPublished(state,published,catalog){
 voiceReviewValidatePublished(published);
 const rows=new Map(catalog.map(row=>[row.id,row]));
 for(const [id,shared] of Object.entries(published.decisions)){
  const row=rows.get(id);if(!row)continue;
  const local=state.records[id];
  if(local){
   if(local.version===row.version&&shared.version!==row.version)continue;
   if(local.version===shared.version&&Date.parse(local.updatedAt)>=Date.parse(shared.updatedAt))continue;
   if(local.version!==row.version&&shared.version!==row.version&&Date.parse(local.updatedAt)>=Date.parse(shared.updatedAt))continue;
  }
  state.records[id]={id,chapter:row.chapter,speaker:row.line.speaker,text:row.line.text,scene:row.sceneLabel,source:row.source,...shared,issues:[],note:'',...(local?{history:[...(local.history||[]),{version:local.version,status:local.status,issues:local.issues,note:local.note,updatedAt:local.updatedAt}].slice(-10)}:{})};
 }
}

export function voiceReviewPublishReport(existing,payload,catalog){
 voiceReviewValidatePublished(existing);
 const state=voiceReviewEmpty();voiceReviewImport(state,payload);
 const next={schema:1,decisions:structuredClone(existing.decisions)},rows=new Map(catalog.map(row=>[row.id,row]));
 for(const [id,r] of Object.entries(state.records)){
  if(!['ok','ng'].includes(r.status))continue;
  const before=next.decisions[id],row=rows.get(id);
  if(before){
   if(before.version===row?.version&&r.version!==row.version)continue;
   if(before.version===r.version&&Date.parse(before.updatedAt)>=Date.parse(r.updatedAt))continue;
   if(before.version!==row?.version&&r.version!==row?.version&&Date.parse(before.updatedAt)>=Date.parse(r.updatedAt))continue;
  }
  next.decisions[id]={status:r.status,version:r.version,updatedAt:r.updatedAt};
 }
 next.decisions=Object.fromEntries(Object.entries(next.decisions).sort(([a],[b])=>a.localeCompare(b)));
 return voiceReviewValidatePublished(next);
}

export function voiceReviewUnpublished(state,published={decisions:{}}){
 return Object.fromEntries(Object.entries(state.records).filter(([id,r])=>{
  const shared=published.decisions[id];
  return ['ok','ng'].includes(r.status)&&!(shared?.status===r.status&&shared.version===r.version&&Date.parse(shared.updatedAt)>=Date.parse(r.updatedAt));
 }));
}

export function voiceReviewHandoff(state,catalog=[],published={decisions:{}}){
 const rows=new Map(catalog.map(row=>[row.id,row]));
 const records=Object.entries(voiceReviewUnpublished(state,published)).map(([id,r])=>[rows.get(id)?.reviewId||id,r.version,r.status,r.updatedAt,...(r.issues.length||r.note?[r.issues,r.note]:[])]);
 const payload={application:'kemono-voice-review',schema:2,records};
 return '\n\n--- KEMONO_VOICE_REVIEW_REPORT ---\n'+JSON.stringify(payload)+'\n--- END_KEMONO_VOICE_REVIEW_REPORT ---';
}

export function voiceReviewParseReport(text,catalog=[]){
 const match=text.match(/--- KEMONO_VOICE_REVIEW_REPORT ---\s*([\s\S]*?)\s*--- END_KEMONO_VOICE_REVIEW_REPORT ---/);
 const payload=JSON.parse(match?match[1]:text);
 if(payload.application!=='kemono-voice-review'||payload.schema!==2)return payload;
 if(!Array.isArray(payload.records))throw Error('短縮した判定の形式が不正です。');
 const rows=new Map(catalog.map(row=>[row.reviewId,row])),state=voiceReviewEmpty(),records={};
 for(const entry of payload.records){
  if(!Array.isArray(entry)||entry.length<4||entry.length>6)throw Error('短縮した判定の形式が不正です。');
  const [ref,version,status,updatedAt,issues=[],note='']=entry,row=rows.get(ref),id=row?.id||ref;
  let key;try{key=JSON.parse(id);}catch{throw Error('音声IDが見つかりません。最新カタログで読み込んでください。');}
  records[id]={id,version,status,updatedAt,issues,note,chapter:row?.chapter||1,speaker:key[0],text:key[1],scene:row?.sceneLabel||'旧台詞',source:row?.source||''};
 }
 const restored={application:'kemono-voice-review',schema:1,records};voiceReviewImport(state,restored);return restored;
}

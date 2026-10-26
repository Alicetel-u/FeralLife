export const VOICE_REVIEW_KEY='kemono-voice-review-v1';
export const VOICE_REVIEW_ISSUES={reading:'読み間違い',quiet:'声が小さい',flat:'棒読み・演技',clipping:'音割れ',timing:'間・速さ',missing:'音が出ない'};
export const VOICE_REVIEW_SPEAKERS={manager:'大家',cat:'モク',hostess:'ルナ'};
export function voiceReviewEmpty(){return {schema:1,records:{},cursorId:null,filters:{chapter:'all',scene:'all',speaker:'all',status:'all',search:'',sort:'scene'},catalogEntries:null};}
export function voiceReviewHasRepair(row,record){return !!(row.repaired||row.catalogChanged||record?.repaired||record?.history?.some(h=>h.status==='ng')||!!record&&record.version!==row.version);}
export function voiceReviewNeedsRecheck(row,record){
 if(row.removed)return false;
 // Explicitly published repairs are reviewable even on another device or
 // without the old local report. Decisions apply only to the current audio.
 if(row.repairReview){
  if(!record||record.version!==row.version)return true;
  return record.status==='todo';
 }
 if(!record||record.status==='ok')return false;
 // Historic mastering is not a request to recheck. Require an actual reported
 // issue followed by replacement audio; keep it pending until a new decision.
 if(record.status==='ng')return record.version!==row.version;
 return record.status==='todo'&&record.history?.some(h=>h.status==='ng'&&h.version!==row.version)||false;
}
export function voiceReviewNeedsInitial(row,record){
 if(row.removed||voiceReviewNeedsRecheck(row,record))return false;
 if(!record)return true;
 return record.status==='todo'&&!record.issues?.length&&!record.note&&!record.history?.some(h=>h.status==='ng');
}
export function voiceReviewOpenPending(state){state.filters={chapter:'all',scene:'all',speaker:'all',status:'pending',search:'',sort:'scene'};}
export function voiceReviewStatus(row,record){
 if(row.removed)return 'removed';
 if(voiceReviewNeedsRecheck(row,record))return 'changed';
 if(!record)return row.isNew?'new':row.catalogChanged?'changed':'todo';
 if(record.version!==row.version)return 'changed';
 if(record.status==='ok'&&voiceReviewHasRepair(row,record))return 'fixed';
 if(record.status==='todo'&&record.listenedVersion===row.version)return 'heard';
 return record.status||'todo';
}
// Save the known catalog independently from decisions, so unreviewed additions/deletions are visible too.
export function voiceReviewSyncCatalog(state,catalog){
 const initialized=state.catalogEntries!==null;state.catalogEntries ||= {};
 for(const row of catalog){
  const before=state.catalogEntries[row.id];
  state.catalogEntries[row.id]={chapter:row.chapter,scene:row.scene,sceneLabel:row.sceneLabel,source:row.source,version:row.version,repaired:!!row.repaired,added:before?.added??(initialized&&!before),changed:!!before?.changed||!!before&&before.version!==row.version};
 }
}
export function voiceReviewRows(catalog,state){
 const active=catalog.filter(r=>!r.removed),ids=new Set(active.map(r=>r.id));
 const rows=active.map(row=>({...row,isNew:!!state.catalogEntries?.[row.id]?.added,catalogChanged:!!state.catalogEntries?.[row.id]?.changed}));
 const known=new Set([...Object.keys(state.catalogEntries||{}),...Object.keys(state.records)]);
 for(const id of known)if(!ids.has(id)){
  const record=state.records[id],entry=state.catalogEntries?.[id];let key;try{key=JSON.parse(id);}catch{continue;}
  if(!Array.isArray(key)||key.length!==4||!['manager','cat','hostess'].includes(key[0])||typeof key[1]!=='string')continue;
  rows.push({id,chapter:entry?.chapter||record?.chapter||1,scene:entry?.scene||String(record?.chapter||1)+':removed',sceneLabel:entry?.sceneLabel||record?.scene||'旧台詞',source:entry?.source||record?.source||'',version:entry?.version||record?.version||'',line:{speaker:key[0],text:key[1]},removed:true,repaired:!!entry?.repaired});
 }
 return rows;
}
export function voiceReviewMark(state,row,patch){
 const before=state.records[row.id],history=before?.history||[];
 const current=before?.version===row.version?before:{};
 const record={id:row.id,chapter:row.chapter,speaker:row.line.speaker,text:row.line.text,scene:row.sceneLabel,source:row.source,version:row.version,status:'todo',issues:[],note:'',...current,...patch,updatedAt:new Date().toISOString()};
 // An explicit new decision applies to the current recording and retains the old decision.
 record.version=row.version;record.repaired=voiceReviewHasRepair(row,before);
 if(before&&before.version!==row.version)record.history=[...history,{version:before.version,status:before.status,issues:before.issues,note:before.note,updatedAt:before.updatedAt}].slice(-10);
 state.records[row.id]=record;return record;
}
export function voiceReviewImport(state,payload){
 if(!payload||payload.application!=='kemono-voice-review'||payload.schema!==1||!payload.records||typeof payload.records!=='object'||Array.isArray(payload.records))throw Error('けもの荘の音声チェック用バックアップではありません。');
 const incoming={};
 for(const [id,r] of Object.entries(payload.records)){
  let key;try{key=JSON.parse(id);}catch{throw Error('記録の識別キーが不正です。');}
  const speaker=r?.speaker==='大家（心の声）'?'manager':r?.speaker;
  if(!Array.isArray(key)||key.length!==4||!['manager','cat','hostess'].includes(key[0])||typeof key[2]!=='string'||typeof key[3]!=='boolean'||typeof key[1]!=='string'||!r||!['manager','cat','hostess'].includes(speaker)||speaker!==key[0]||!['todo','ok','ng'].includes(r.status)||typeof r.version!=='string'||r.version.length>128||typeof r.note!=='string'||r.note.length>2000||!Array.isArray(r.issues)||r.issues.some(v=>!Object.hasOwn(VOICE_REVIEW_ISSUES,v))||!Number.isFinite(Date.parse(r.updatedAt)))throw Error('バックアップの記録形式が不正です。');
  incoming[id]={id,chapter:r.chapter,speaker,text:String(r.text||'').slice(0,3000),scene:String(r.scene||'').slice(0,200),source:String(r.source||'').slice(0,500),version:r.version,status:r.status,issues:[...new Set(r.issues)],note:r.note,updatedAt:r.updatedAt,repaired:!!r.repaired,...(Array.isArray(r.history)?{history:r.history.slice(-10).map(h=>({version:String(h.version||'').slice(0,128),status:['todo','ng','ok'].includes(h.status)?h.status:'todo',issues:Array.isArray(h.issues)?h.issues.filter(v=>Object.hasOwn(VOICE_REVIEW_ISSUES,v)):[],note:String(h.note||'').slice(0,2000),updatedAt:String(h.updatedAt||'')}))}:{}),...(typeof r.listenedVersion==='string'?{listenedVersion:r.listenedVersion}:{})};
 }
 const snapshots={};
 if(payload.catalogEntries&&typeof payload.catalogEntries==='object'&&!Array.isArray(payload.catalogEntries))for(const [id,entry] of Object.entries(payload.catalogEntries)){
  let key;try{key=JSON.parse(id);}catch{throw Error('台詞一覧の識別キーが不正です。');}
  if(!Array.isArray(key)||key.length!==4||!['manager','cat','hostess'].includes(key[0])||typeof key[1]!=='string'||typeof key[2]!=='string'||typeof key[3]!=='boolean'||!entry||![1,2].includes(entry.chapter)||typeof entry.version!=='string')throw Error('台詞一覧の形式が不正です。');
  snapshots[id]={chapter:entry.chapter,scene:String(entry.scene||'').slice(0,200),sceneLabel:String(entry.sceneLabel||'').slice(0,200),source:String(entry.source||'').slice(0,500),version:entry.version.slice(0,128),repaired:!!entry.repaired,added:!!entry.added,changed:!!entry.changed};
 }
 if(payload.catalogEntries){state.catalogEntries ||= {};for(const [id,entry] of Object.entries(snapshots))if(!state.catalogEntries[id])state.catalogEntries[id]=entry;}
 let imported=0;
 for(const [id,r] of Object.entries(incoming))if(!state.records[id]||Date.parse(r.updatedAt)>Date.parse(state.records[id].updatedAt)){state.records[id]=r;imported++;}
 return imported;
}
export function voiceReviewLoad(storage){
 const state=voiceReviewEmpty();let warning='';
 try{const raw=storage?.getItem(VOICE_REVIEW_KEY);if(raw){const saved=JSON.parse(raw);voiceReviewImport(state,{...saved,application:'kemono-voice-review'});state.cursorId=typeof saved.cursorId==='string'?saved.cursorId:null;if(saved.filters&&typeof saved.filters==='object')for(const name of Object.keys(state.filters))if(typeof saved.filters[name]==='string')state.filters[name]=saved.filters[name].slice(0,200);}}
 catch{warning='保存記録を読み込めません。バックアップがあれば復元してください。';}
 return {state,warning};
}
export function voiceReviewBackup(state){return JSON.stringify({application:'kemono-voice-review',schema:1,exportedAt:new Date().toISOString(),records:state.records,catalogEntries:state.catalogEntries,cursorId:state.cursorId,filters:state.filters},null,2);}
export function voiceReviewFilter(catalog,state){
 const f=state.filters;
 const rows=voiceReviewRows(catalog,state).filter(row=>{
  const status=voiceReviewStatus(row,state.records[row.id]);
  const matches=f.status==='pending'?voiceReviewNeedsInitial(row,state.records[row.id]):f.status==='recheck'?voiceReviewNeedsRecheck(row,state.records[row.id]):f.status==='todo'?['todo','new'].includes(status):f.status==='repaired'?voiceReviewHasRepair(row,state.records[row.id]):f.status==='ok'?['ok','fixed'].includes(status):f.status==='all'||status===f.status;
  return (!row.removed||f.status==='removed')&&(f.chapter==='all'||String(row.chapter)===f.chapter)&&(f.scene==='all'||row.scene===f.scene)&&(f.speaker==='all'||row.line.speaker===f.speaker)&&matches&&(!f.search||row.line.text.includes(f.search));
 });
 const priority={new:0,changed:1,ng:2,todo:3,heard:4,fixed:5,ok:6,removed:7};
 if(f.sort==='status')rows.sort((a,b)=>priority[voiceReviewStatus(a,state.records[a.id])]-priority[voiceReviewStatus(b,state.records[b.id])]);
 else if(f.sort==='updated')rows.sort((a,b)=>(Date.parse(state.records[b.id]?.updatedAt)||0)-(Date.parse(state.records[a.id]?.updatedAt)||0));
 else if(f.sort==='speaker')rows.sort((a,b)=>a.line.speaker.localeCompare(b.line.speaker));
 return rows;
}
export function voiceReviewExport(state,catalog){
 const current=new Map(catalog.map(r=>[r.id,r]));
 const records=Object.values(state.records).filter(r=>r.status==='ng'&&(r.issues.length||r.note));
 if(!records.length)return '音声の修正指摘はまだありません。';
 const activeCount=records.filter(r=>current.has(r.id)).length;
 return ['けもの荘 音声修正依頼',`現行の修正依頼 ${activeCount}件／削除済み履歴 ${records.length-activeCount}件。表示台詞とシナリオは変更せず、現行の該当音声だけを修正してください。`,'',...records.flatMap((r,i)=>{
  const row=current.get(r.id),changed=row&&row.version!==r.version;
  return [`【${i+1}｜第${r.chapter}幕／${r.scene}／${VOICE_REVIEW_SPEAKERS[r.speaker]}】`,`台詞：「${r.text}」`,`指摘：${r.issues.map(v=>VOICE_REVIEW_ISSUES[v]).join('・')||'メモ参照'}`,...(r.note?[`メモ：${r.note}`]:[]),...(changed?['音声更新済み・再確認待ち（指摘は更新前の音声に対するもの）']:!row?['現在の台本にはない旧台詞の記録（削除済み・再生成不要）']:[]),`識別キー：${r.id}`,`確認した音声版：${r.version}`,`出現箇所：${r.source}`,''];
 })].join('\n');
}

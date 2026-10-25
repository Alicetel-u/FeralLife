export const VOICE_REVIEW_KEY='kemono-voice-review-v1';
export const VOICE_REVIEW_ISSUES={reading:'読み間違い',quiet:'声が小さい',flat:'棒読み・演技',clipping:'音割れ',timing:'間・速さ',missing:'音が出ない'};
export const VOICE_REVIEW_SPEAKERS={manager:'大家',cat:'モク',hostess:'ルナ'};
export function voiceReviewEmpty(){return {schema:1,records:{},cursorId:null,filters:{chapter:'all',scene:'all',speaker:'all',status:'all',search:''}};}
export function voiceReviewStatus(row,record){if(!record)return 'todo';if(record.version!==row.version)return 'changed';if(record.status==='todo'&&record.listenedVersion===row.version)return 'heard';return record.status||'todo';}
export function voiceReviewMark(state,row,patch){
 const before=state.records[row.id],history=before?.history||[];
 const record={...before,id:row.id,chapter:row.chapter,speaker:row.line.speaker,text:row.line.text,scene:row.sceneLabel,source:row.source,version:row.version,status:'todo',issues:[],note:'',...before,...patch,updatedAt:new Date().toISOString()};
 // An explicit new decision applies to the current recording and retains the old decision.
 record.version=row.version;
 if(before&&before.version!==row.version)record.history=[...history,{version:before.version,status:before.status,issues:before.issues,note:before.note,updatedAt:before.updatedAt}].slice(-10);
 state.records[row.id]=record;return record;
}
export function voiceReviewImport(state,payload){
 if(!payload||payload.application!=='kemono-voice-review'||payload.schema!==1||!payload.records||typeof payload.records!=='object'||Array.isArray(payload.records))throw Error('けもの荘の音声チェック用バックアップではありません。');
 const incoming={};
 for(const [id,r] of Object.entries(payload.records)){
  let key;try{key=JSON.parse(id);}catch{throw Error('記録の識別キーが不正です。');}
  if(!Array.isArray(key)||key.length!==4||typeof key[1]!=='string'||!r||!['manager','cat','hostess'].includes(r.speaker)||!['todo','ok','ng'].includes(r.status)||typeof r.version!=='string'||r.version.length>128||typeof r.note!=='string'||r.note.length>2000||!Array.isArray(r.issues)||r.issues.some(v=>!Object.hasOwn(VOICE_REVIEW_ISSUES,v))||!Number.isFinite(Date.parse(r.updatedAt)))throw Error('バックアップの記録形式が不正です。');
  incoming[id]={id,chapter:r.chapter,speaker:r.speaker,text:String(r.text||'').slice(0,3000),scene:String(r.scene||'').slice(0,200),source:String(r.source||'').slice(0,500),version:r.version,status:r.status,issues:[...new Set(r.issues)],note:r.note,updatedAt:r.updatedAt,...(Array.isArray(r.history)?{history:r.history.slice(-10).map(h=>({version:String(h.version||'').slice(0,128),status:['todo','ng','ok'].includes(h.status)?h.status:'todo',issues:Array.isArray(h.issues)?h.issues.filter(v=>Object.hasOwn(VOICE_REVIEW_ISSUES,v)):[],note:String(h.note||'').slice(0,2000),updatedAt:String(h.updatedAt||'')}))}:{}),...(typeof r.listenedVersion==='string'?{listenedVersion:r.listenedVersion}:{})};
 }
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
export function voiceReviewBackup(state){return JSON.stringify({application:'kemono-voice-review',schema:1,exportedAt:new Date().toISOString(),records:state.records,cursorId:state.cursorId,filters:state.filters},null,2);}
export function voiceReviewFilter(catalog,state){const f=state.filters;return catalog.filter(row=>(f.chapter==='all'||String(row.chapter)===f.chapter)&&(f.scene==='all'||row.scene===f.scene)&&(f.speaker==='all'||row.line.speaker===f.speaker)&&(f.status==='all'||voiceReviewStatus(row,state.records[row.id])===f.status)&&(!f.search||row.line.text.includes(f.search)));}
export function voiceReviewExport(state,catalog){
 const current=new Map(catalog.map(r=>[r.id,r]));
 const records=Object.values(state.records).filter(r=>r.status==='ng'&&(r.issues.length||r.note));
 if(!records.length)return '音声の修正指摘はまだありません。';
 return ['けもの荘 音声修正依頼',`指摘 ${records.length}件。表示台詞とシナリオは変更せず、該当音声を修正してください。`,'',...records.flatMap((r,i)=>{
  const row=current.get(r.id),changed=row&&row.version!==r.version;
  return [`【${i+1}｜第${r.chapter}幕／${r.scene}／${VOICE_REVIEW_SPEAKERS[r.speaker]}】`,`台詞：「${r.text}」`,`指摘：${r.issues.map(v=>VOICE_REVIEW_ISSUES[v]).join('・')||'メモ参照'}`,...(r.note?[`メモ：${r.note}`]:[]),...(changed?['音声更新済み・再確認待ち（指摘は更新前の音声に対するもの）']:!row?['現在の台本にはない旧台詞の記録']:[]),`識別キー：${r.id}`,`確認した音声版：${r.version}`,`出現箇所：${r.source}`,''];
 })].join('\n');
}

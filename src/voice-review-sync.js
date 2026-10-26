import {voiceReviewEmpty,voiceReviewImport,voiceReviewBackup} from './voice-review-store.js';

export const VOICE_REVIEW_REMOTE={repository:'Alicetel-u/FeralLife-voice-review',path:'voice-review.json'};
const reviewSyncEncode=text=>{const bytes=new TextEncoder().encode(text);let binary='';for(let i=0;i<bytes.length;i+=16384)binary+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(binary);};
const reviewSyncDecode=text=>new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(text.replace(/\s/g,'')),c=>c.charCodeAt(0)));
const reviewSyncRank=record=>({todo:0,ok:1,ng:2}[record.status]??0);
export function voiceReviewMergeSnapshots(local,remote){
 const a=voiceReviewEmpty(),b=voiceReviewEmpty();voiceReviewImport(a,local);voiceReviewImport(b,remote);
 for(const [id,incoming] of Object.entries(b.records)){
  const before=a.records[id];
  if(!before){a.records[id]=incoming;continue;}
  const delta=Date.parse(incoming.updatedAt)-Date.parse(before.updatedAt);
  const newer=delta>0||delta===0&&(reviewSyncRank(incoming)>reviewSyncRank(before)||reviewSyncRank(incoming)===reviewSyncRank(before)&&JSON.stringify(incoming)>JSON.stringify(before));
  const winner=newer?incoming:before,loser=newer?before:incoming;
  const history=[...(before.history||[]),...(incoming.history||[]),...(before.version!==incoming.version?[{version:loser.version,status:loser.status,issues:loser.issues,note:loser.note,updatedAt:loser.updatedAt}]:[])];
  const unique=[...new Map(history.map(h=>[JSON.stringify(h),h])).values()].sort((x,y)=>(Date.parse(x.updatedAt)||0)-(Date.parse(y.updatedAt)||0)||JSON.stringify(x).localeCompare(JSON.stringify(y))).slice(-10);
  a.records[id]={...winner,...(unique.length?{history:unique}:{})};
 }
 if(b.catalogEntries){a.catalogEntries||={};for(const [id,entry] of Object.entries(b.catalogEntries))a.catalogEntries[id]||=entry;}
 a.records=Object.fromEntries(Object.entries(a.records).sort(([x],[y])=>x.localeCompare(y)));
 if(a.catalogEntries)a.catalogEntries=Object.fromEntries(Object.entries(a.catalogEntries).sort(([x],[y])=>x.localeCompare(y)));
 return JSON.parse(voiceReviewBackup(a));
}
export function voiceReviewApplySync(state,payload){
 const merged=voiceReviewMergeSnapshots(JSON.parse(voiceReviewBackup(state)),payload);
 const changed=Object.entries(merged.records).filter(([id,record])=>JSON.stringify(state.records[id])!==JSON.stringify(record)).length;
 state.records=merged.records;state.catalogEntries=merged.catalogEntries;return changed;
}
export function createVoiceReviewRepositorySync({request,remote=VOICE_REVIEW_REMOTE}){
 const base='repos/'+remote.repository,content=base+'/contents/'+remote.path;
 const verify=async()=>{const repo=await request(base);if(repo.private!==true)throw Error('同期先が非公開ではないため、保存・読み込みを停止しました。');};
 const read=async()=>{try{const file=await request(content);if(file.encoding!=='base64'||!file.content||file.size>5000000)throw Error('同期ファイルの形式が不正です。');const data=JSON.parse(reviewSyncDecode(file.content));voiceReviewImport(voiceReviewEmpty(),data);return {sha:file.sha,data};}catch(error){if(error.status===404)return {sha:null,data:JSON.parse(voiceReviewBackup(voiceReviewEmpty()))};throw error;}};
 return {
  async download(){await verify();return (await read()).data;},
  async upload(local){voiceReviewImport(voiceReviewEmpty(),local);await verify();
   for(let attempt=0;attempt<3;attempt++){
    const current=await read(),merged=voiceReviewMergeSnapshots(local,current.data);
    const same=JSON.stringify(merged.records)===JSON.stringify(current.data.records)&&JSON.stringify(merged.catalogEntries)===JSON.stringify(current.data.catalogEntries);
    if(same&&current.sha)return merged;
    try{await request(content,{method:'PUT',body:{message:'Sync private voice review decisions',content:reviewSyncEncode(JSON.stringify(merged,null,2)+'\n'),...(current.sha?{sha:current.sha}:{})}});return merged;}
    catch(error){if(![409,422].includes(error.status)||attempt===2)throw error;}
   }
  }
 };
}
export function createVoiceReviewSyncClient({fetchImpl=globalThis.fetch,location=globalThis.location}={}){
 const local=location?.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(location?.hostname);
 let token='';const controller=new AbortController();
 const request=async(path,{method='GET',body}={})=>{
  if(!token)throw Error('GitHub用トークンを入力してください。トークンは保存されません。');
  const response=await fetchImpl('https://api.github.com/'+path,{method,headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),cache:'no-store',redirect:'error',signal:AbortSignal.any([controller.signal,AbortSignal.timeout(30000)])});
  if(!response.ok){const error=Error(response.status===401?'GitHubの認証に失敗しました。':response.status===403?'GitHubの権限または利用制限を確認してください。':response.status===404?'同期先が見つかりません。非公開リポジトリへのアクセス権を確認してください。':'GitHubとの同期に失敗しました（'+response.status+'）。');error.status=response.status;throw error;}
  return response.json();
 };
 const service=createVoiceReviewRepositorySync({request});
 const bridge=async(method,data)=>{
  const response=await fetchImpl('/api/voice-review-sync',{method,headers:{'X-Feral-Voice-Review':'1',...(data?{'Content-Type':'application/json'}:{})},...(data?{body:JSON.stringify(data)}:{}),cache:'no-store',redirect:'error',signal:controller.signal});
  let result;try{result=await response.json();}catch{throw Error('ローカル同期を利用できません。最新版で npm run dev を実行してください。');}
  if(!response.ok)throw Error(result.error||'PCのGitHubログインを確認してください。');return result;
 };
 return {local,setToken(value){token=String(value||'').trim();},download:()=>local?bridge('GET'):service.download(),upload:data=>local?bridge('POST',data):service.upload(data),dispose(){token='';controller.abort();}};
}

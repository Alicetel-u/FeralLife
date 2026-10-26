import {spawn} from 'node:child_process';
import {createVoiceReviewRepositorySync} from '../src/voice-review-sync.js';

export function voiceReviewGitHubRequest(path,{method='GET',body}={}){
 return new Promise((resolve,reject)=>{
  const child=spawn('gh',['api',path,'--method',method,...(body?['--input','-']:[])],{windowsHide:true,stdio:['pipe','pipe','pipe']});
  child.stdout.setEncoding('utf8');child.stderr.setEncoding('utf8');
  let output='',errors='',settled=false;const fail=error=>{if(settled)return;settled=true;clearTimeout(timer);reject(error);};
  const timer=setTimeout(()=>{child.kill();fail(Error('GitHubとの通信がタイムアウトしました。再度同期してください。'));},30000);
  child.on('error',()=>fail(Error('GitHub CLIが見つかりません。gh をインストールし gh auth login を実行してください。')));
  child.stdout.on('data',chunk=>{output+=chunk;if(output.length>8000000){child.kill();fail(Error('同期データが大きすぎます。'));}});
  child.stderr.on('data',chunk=>{if(errors.length<4000)errors+=chunk;});
  child.stdin.on('error',()=>{});
  child.on('close',code=>{if(settled)return;clearTimeout(timer);if(code!==0){const error=Error('PCのGitHubログインと非公開リポジトリへの権限を確認してください（gh auth login）。');error.status=Number(errors.match(/HTTP (\d{3})/)?.[1]||0);fail(error);return;}settled=true;try{resolve(JSON.parse(output));}catch{reject(Error('GitHubの応答を読み込めませんでした。'));}});
  child.stdin.end(body?JSON.stringify(body):undefined);
 });
}
export function createVoiceReviewSyncHandler({request=voiceReviewGitHubRequest}={}){
 const service=createVoiceReviewRepositorySync({request});
 return async(req,res)=>{
  const reply=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));};
  const host=req.headers.host||'',origin=req.headers.origin;
  if(!/^(localhost|127\.0\.0\.1):\d+$/.test(host)||req.headers['x-feral-voice-review']!=='1'||origin&&origin!=='http://'+host||req.headers['sec-fetch-site']==='cross-site'){reply(403,{error:'このPCのゲーム画面から同期してください。'});return;}
  if(!['GET','POST'].includes(req.method)){reply(405,{error:'対応していない操作です。'});return;}
  try{
   if(req.method==='GET'){reply(200,await service.download());return;}
   if(!req.headers['content-type']?.startsWith('application/json')){reply(415,{error:'JSON形式で同期してください。'});return;}
   const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>5000000){reply(413,{error:'同期データが大きすぎます。'});return;}chunks.push(Buffer.from(chunk));}
   let payload;try{payload=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{reply(400,{error:'同期データを読み込めませんでした。'});return;}
   reply(200,await service.upload(payload));
  }catch(error){reply(502,{error:error.message||'GitHubとの同期に失敗しました。'});}
 };
}

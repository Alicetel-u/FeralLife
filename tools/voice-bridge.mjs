import {readFile} from 'node:fs/promises';
import {createCipheriv,createDecipheriv,publicEncrypt,privateDecrypt,randomBytes,constants} from 'node:crypto';

const PREFIX='VOICE_REPAIR_ENCRYPTED_V1';
const b64=b=>Buffer.from(b).toString('base64');
const unb64=s=>Buffer.from(s,'base64');
const validRequest=request=>{
  if(!request||typeof request!=='object'||!Array.isArray(request.corrections)||!request.report||!/^[-_a-zA-Z0-9]{8,64}$/.test(request.requestId)||!Number.isInteger(request.maxCredits)||request.maxCredits<0||request.maxCredits>5000)throw Error('Invalid voice request');
};
export function encryptRequest(request,publicKey){
  validRequest(request);
  const data=Buffer.from(JSON.stringify(request));if(data.length>60000)throw Error('Request exceeds 60000 bytes');
  const key=randomBytes(32),iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);
  const ciphertext=Buffer.concat([cipher.update(data),cipher.final()]);
  const sealedKey=publicEncrypt({key:publicKey,padding:constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},key);
  return PREFIX+'\n'+JSON.stringify({version:1,alg:'RSA-OAEP-SHA256+A256GCM',key:b64(sealedKey),iv:b64(iv),tag:b64(cipher.getAuthTag()),data:b64(ciphertext)});
}
export function decryptIssue(body,privateKey){
  if(typeof body!=='string'||body.length>110000||!body.startsWith(PREFIX+'\n'))throw Error('Invalid bridge issue format');
  const envelope=JSON.parse(body.slice(PREFIX.length+1));
  if(envelope.version!==1||envelope.alg!=='RSA-OAEP-SHA256+A256GCM')throw Error('Unsupported bridge encryption');
  for(const field of ['key','iv','tag','data'])if(typeof envelope[field]!=='string'||!/^[a-zA-Z0-9+/]*={0,2}$/.test(envelope[field]))throw Error('Invalid base64 payload');
  const key=privateDecrypt({key:privateKey,padding:constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},unb64(envelope.key));
  const iv=unb64(envelope.iv),tag=unb64(envelope.tag);if(key.length!==32||iv.length!==12||tag.length!==16)throw Error('Invalid key material');
  const decipher=createDecipheriv('aes-256-gcm',key,iv);decipher.setAuthTag(tag);
  const decoded=Buffer.concat([decipher.update(unb64(envelope.data)),decipher.final()]);
  if(decoded.length>60000)throw Error('Request is too long');
  const request=JSON.parse(decoded.toString('utf8'));validRequest(request);return request;
}
async function github(path,method,token,body){
  const r=await fetch('https://api.github.com'+path,{method,headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(20000)});
  if(!r.ok)throw Error('GitHub API '+r.status+': '+(await r.text()).slice(0,500));
}
if(process.argv[1]?.endsWith('/voice-bridge.mjs')){
  const mode=process.argv[2];
  if(mode==='encrypt'){
    const request=JSON.parse(await readFile(process.argv[3],'utf8'));
    const publicKey=await readFile(new URL('../docs/voice-bridge-public.pem',import.meta.url),'utf8');
    console.log(encryptRequest(request,publicKey));
  }else if(mode==='dispatch'){
    const event=JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH,'utf8'));
    const repo=process.env.GITHUB_REPOSITORY,owner=repo?.split('/')[0];
    if(!repo||!owner||event.action!=='opened'||event.issue?.user?.login?.toLowerCase()!==owner.toLowerCase()||event.issue?.pull_request||!event.issue.title.startsWith('[Voice Bridge]'))throw Error('Only repository owner created voice bridge issues are accepted');
    const privateKey=process.env.VOICE_BRIDGE_PRIVATE_KEY?.replace(/\\n/g,'\n');if(!privateKey)throw Error('VOICE_BRIDGE_PRIVATE_KEY Actions secret missing');
    const request=decryptIssue(event.issue.body,privateKey);
    const modeRequested=/^\[Voice Bridge\] validate$/.test(event.issue.title)?'validate':/^\[Voice Bridge\] repair$/.test(event.issue.title)?'repair':null;
    if(!modeRequested)throw Error('Invalid voice bridge title');
    const token=process.env.GITHUB_TOKEN;if(!token)throw Error('GITHUB_TOKEN missing');
    await github('/repos/'+repo+'/actions/workflows/voice-review-automation.yml/dispatches','POST',token,{ref:'main',inputs:{mode:modeRequested,request_json:JSON.stringify(request)}});
    await github('/repos/'+repo+'/issues/'+event.issue.number+'/comments','POST',token,{body:'Accepted encrypted voice request '+request.requestId+' ('+modeRequested+'). Check voice automation runs for completion. Acceptance is not generation success.'});
  }else{console.error('Usage: node tools/voice-bridge.mjs encrypt request.json | dispatch');process.exitCode=1;}
}

import {readFile,writeFile,mkdir,open,rename,stat,unlink} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,dirname,join} from 'node:path';
import {extractVoiceScript,extractCompleteVoiceScript,planVoices,digest,normalizeVoiceIds} from './voice-script.mjs';
import {voicePerformance} from '../src/voice-policy.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const json=async path=>JSON.parse((await readFile(join(root,path),'utf8')).replace(/^\uFEFF/,''));
const exists=async path=>{try{return (await stat(join(root,path))).size>0;}catch{return false;}};
const atomic=async(path,data)=>{
  await writeFile(join(root,path+'.tmp'),data);
  // Windows can briefly lock the manifest while another process reads it.
  // Retry only the local rename; a charged API request is never repeated here.
  for(let attempt=0;;attempt++){
    try{await rename(join(root,path+'.tmp'),join(root,path));return;}
    catch(error){if(!['EPERM','EACCES','EBUSY'].includes(error.code)||attempt>=9)throw error;await new Promise(resolve=>setTimeout(resolve,100));}
  }
};
const args=process.argv.slice(2),scope=args.find(a=>a.startsWith('--scope='))?.split('=')[1]||'intro';
const ids=normalizeVoiceIds(await json('config/voice-ids.json')),config=await json('config/voice-performance.json');
const sampleMoku=args.includes('--sample-moku');
if(sampleMoku&&scope!=='intro')throw Error('Moku sample requires intro scope');
const firstTragedy=args.includes('--first-tragedy');
if(firstTragedy&&scope!=='act1')throw Error('First tragedy requires act1 scope');
const filmOnly=args.includes('--film-only');
if(filmOnly&&scope!=='act2-trouble1')throw Error('Film filter requires act2-trouble1 scope');
const repairOnly=scope==='repairs';
const repairs=(await json('config/voice-repairs.json')).lines;
const fillMissing=scope==='missing';
let script=(fillMissing||repairOnly?extractCompleteVoiceScript():extractVoiceScript(scope)).filter(row=>(!firstTragedy||row.source.includes('attempt-1/ash/trash/reply'))&&(!filmOnly||row.source.startsWith('act2/film/')));
if(repairOnly)script=script.filter(row=>repairs.some(r=>r.speaker===row.speaker&&r.text===row.line.text));
if(fillMissing){
  const {VOICE_MANIFEST}=await import('../src/voice-manifest.js');
  const missing=[];
  for(const row of script)if(!VOICE_MANIFEST[row.lineKey]||!await exists(VOICE_MANIFEST[row.lineKey].file))missing.push({...row,performance:row.speaker==='manager'?'duel-manager':row.speaker==='cat'?'duel-moku':'duel-luna'});
  script=missing;
}
const speaker=args.find(a=>a.startsWith('--speaker='))?.slice('--speaker='.length);
const sourcePrefix=args.find(a=>a.startsWith('--source-prefix='))?.slice('--source-prefix='.length);
if(sourcePrefix)script=script.filter(row=>row.source.startsWith(sourcePrefix));
// Preserve each scene's original performance when filling a narrowly scoped rewrite.
if(args.includes('--only-missing')){
  const {VOICE_MANIFEST}=await import('../src/voice-manifest.js');
  const missing=[];
  for(const row of script)if(!VOICE_MANIFEST[row.lineKey]||!await exists(VOICE_MANIFEST[row.lineKey].file))missing.push(row);
  script=missing;
}
if(speaker&&!['cat','manager','hostess'].includes(speaker))throw Error('Unknown speaker filter');
if(speaker==='manager'&&!['intro','act1','act2-trouble1','act2-duel','missing','repairs'].includes(scope))throw Error('Landlord generation is limited to supported chapter scopes');
const pronunciationIssues=(await json('config/voice-pronunciation-issues.json')).issues;
const pronunciationOnly=args.includes('--pronunciation-only');
if(pronunciationOnly&&(sampleMoku||scope!=='intro'))throw Error('Pronunciation repair requires intro scope without sample mode');
const selectedScript=pronunciationOnly?script.filter(row=>pronunciationIssues.some(issue=>row.line.text.includes(issue.term))):sampleMoku?script.filter(row=>row.speaker==='cat').slice(0,2):script;
const rows=planVoices(speaker?selectedScript.filter(row=>row.speaker===speaker):selectedScript,ids,config,pronunciationIssues,repairs);
const pronunciationReview=pronunciationIssues.map(issue=>({...issue,sources:rows.filter(row=>row.text.includes(issue.term)).map(row=>row.source)})).filter(issue=>issue.sources.length);
await mkdir(join(root,'.local'),{recursive:true});
const planId=digest(rows.map(r=>({source:r.source,hash:r.hash})));
let journal=await exists('.local/voice-journal.json')?await json('.local/voice-journal.json'):{};
const unique=[...new Map(rows.map(r=>[r.hash,r])).values()];
const pending=[];
for(const row of unique)if(!await exists(row.file))pending.push(row);
const estimate=pending.reduce((n,r)=>n+r.billableCharacters*config.estimatedCreditsPerCharacter,0);
const report={scope,planId,model:config.model,lines:rows.length,unique:unique.length,pending:pending.length,estimatedCredits:estimate,estimateOnly:true,pronunciationReview,rows:rows.map(({line,request,...row})=>({...row,spokenInput:request.text,settings:request.voice_settings,tags:config.profiles[row.performance].tags}))};
await atomic('.local/voice-plan.json',JSON.stringify(report,null,2)+'\n');
await atomic('.local/voice-plan.md',[
  fillMissing?'# 第一幕・第二幕の不足ボイス補完':scope==='act2-duel'?'# ミニゲームボイス・生成計画':'# 序盤ボイス・生成前確認',
  '',`対象: ${scope} / ${rows.length}件 / 新規 ${pending.length}件 / 推定 ${estimate}クレジット（実残高とは別）`,
  `モデル: ${config.model} / 承認ID: ${planId}`,
  '', scope==='act2-duel'?'ミニゲーム4戦の掛け合い・全選択肢・奥義と勝利の掛け声が対象。立ち絵の導入・BAD END・ナレーションは含みません。':scope==='intro'?'独り言は操作タイミングで表示順や有無が変わります。ナレーション・手紙・選択肢後の返答は含みません。':'選択肢の全分岐・周回・エピローグを含みます。ナレーション・手紙は除外します。',
  '', '|順|話者|演技|本文文字数|台詞|','|---:|---|---|---:|---|',
  ...rows.map((r,i)=>`|${i+1}|${r.speaker}|${r.performance}|${r.characters}|${r.text.replaceAll('\n',' / ').replaceAll('|','\\|')}|`),
  '', '## 生成設定', '```json',JSON.stringify(config,null,2),'```',''
].join('\n'));
if(!args.includes('--quiet'))console.table(report.rows.map((r,i)=>({no:i+1,source:r.source,speaker:r.speaker,performance:r.performance,characters:r.characters,text:r.text})));
if(!args.includes('--quiet')&&pronunciationReview.length)console.table(pronunciationReview.map(issue=>({term:issue.term,reading:issue.reading,status:issue.status,lines:issue.sources.length})));
console.log(JSON.stringify({scope,planId,model:config.model,lines:rows.length,unique:unique.length,pending:pending.length,estimatedCredits:estimate,estimateOnly:true}));
if(!args.includes('--verify')&&!args.includes('--generate'))process.exit(0);
const allowedGeneration=repairOnly||fillMissing||scope==='act2-trouble1'||scope==='act2-duel'||scope==='intro'||(scope==='act1'&&(['cat','manager'].includes(speaker)||firstTragedy)&&!sampleMoku&&!pronunciationOnly);
if(args.includes('--generate')&&(!allowedGeneration||!args.includes('--approve='+planId)))throw Error('Generation requires an allowed scope and authorization of the current plan hash');
let key;
try{key=(await json('.local/elevenlabs.json')).apiKey;}catch{throw Error('Local API key missing. Run npm run voice:setup (do not paste key into chat).');}
if(typeof key!=='string'||!key.trim())throw Error('Empty API key');
// Verify ignore protection and absence from the Git index, without printing the key.
const {spawnSync}=await import('node:child_process');
const ignored=spawnSync('git',['check-ignore','--quiet','.local/elevenlabs.json'],{cwd:root});
const tracked=spawnSync('git',['ls-files','--error-unmatch','.local/elevenlabs.json'],{cwd:root,stdio:'ignore'});
if(ignored.error||tracked.error)throw Error('Unable to check Git protection: child process permission denied');
if(ignored.status!==0||tracked.status!==1)throw Error('Secret is not protected by gitignore');
async function api(path,options={}){
  let response;
  try{response=await fetch('https://api.elevenlabs.io/v1/'+path,{...options,headers:{'xi-api-key':key,'Content-Type':'application/json'},signal:AbortSignal.timeout(90000)});}catch{throw Error('API connection failed; no automatic retry. Inspect journal/history before retrying.');}
  if(!response.ok){
    let code='';
    try{const body=await response.json();const status=body?.detail?.status;if(['invalid_api_key','missing_permissions','quota_exceeded','voice_not_found','model_not_found','insufficient_credits'].includes(status))code=' / '+status;}catch{}
    throw Error('ElevenLabs HTTP '+response.status+code+'; stopped without retry');
  }
  return response;
}
async function verify(){
  for(const [speaker,id] of Object.entries(ids))if(id){await api('voices/'+encodeURIComponent(id));console.log('Voice accessible: '+speaker+' / '+id);}
  const models=await (await api('models')).json();
  const model=models.find(m=>m.model_id===config.model&&m.can_do_text_to_speech);
  if(!model||!model.languages?.some(l=>l.language_id==='ja'))throw Error('Selected Japanese TTS model unavailable');
  console.log('Verified Japanese TTS model: '+model.model_id);
  const balance=await (await api('user/subscription')).json();
  const actual={characterCount:balance.character_count,characterLimit:balance.character_limit,remaining:balance.character_limit-balance.character_count};
  console.log('Actual account balance (separate from estimate): '+JSON.stringify(actual));return actual;
}
if(repairOnly&&unique.length>30)throw Error('Unexpected repair volume');
const before=await verify();
if(!args.includes('--generate'))process.exit(0);
if(scope==='act2-trouble1'&&(unique.length>350||estimate>20000))throw Error('Abnormal trouble-one generation volume; review scope before spending');
if(scope==='act2-duel'&&(unique.length>120||estimate>10000))throw Error('Abnormal mini-game generation volume; review scope before spending');
if(fillMissing&&(unique.length>700||estimate>40000))throw Error('Abnormal missing-voice generation volume; review scope before spending');
if(pending.some(r=>!r.voiceId))throw Error('Missing voice ID');
if(!Number.isFinite(before.remaining)||before.remaining<estimate)throw Error('Insufficient or unavailable balance');
// Exclusive lock and durable intent BEFORE the charged call. An ambiguous failure
// stays blocked until its history is manually reconciled; never blindly retry.
const lock=await open(join(root,'.local/voice-generation.lock'),'wx');
try{
  journal=await exists('.local/voice-journal.json')?await json('.local/voice-journal.json'):{};
  await mkdir(join(root,'assets/voices'),{recursive:true});
  let completed=0;
  for(const row of pending){
    if(await exists(row.file))continue;
    if(journal[row.hash])throw Error('Existing generation attempt requires history reconciliation: '+row.hash);
    journal[row.hash]={status:'in-flight',source:row.source,started:new Date().toISOString()};
    await atomic('.local/voice-journal.json',JSON.stringify(journal,null,2));
    const response=await api('text-to-speech/'+encodeURIComponent(row.voiceId)+'?output_format='+config.outputFormat,{method:'POST',body:JSON.stringify(row.request)});
    const audio=Buffer.from(await response.arrayBuffer());
    if(!response.headers.get('content-type')?.includes('audio/')||audio.length<128)throw Error('Invalid audio response; inspect history');
    await atomic(row.file,audio);
    journal[row.hash]={...journal[row.hash],status:'complete',requestId:response.headers.get('request-id'),chargedCharacters:response.headers.get('character-cost')};
    await atomic('.local/voice-journal.json',JSON.stringify(journal,null,2));
    // Publish each completed clip so a later failure never loses usable work.
    await publish();
    if(++completed%25===0)console.log(JSON.stringify({completed,total:pending.length}));
  }
  await publish();
  const after=await verify();
  console.log('Observed account usage delta (may include other account activity): '+(after.characterCount-before.characterCount));
}finally{await lock.close();await unlink(join(root,'.local/voice-generation.lock'));}
async function publish(){
  let manifest={};
  const module=await import('../src/voice-manifest.js?time='+Date.now());manifest={...module.VOICE_MANIFEST};
  for(const row of rows)if(await exists(row.file))manifest[row.lineKey]={file:row.file,hash:row.hash,source:row.source,speaker:row.speaker,text:row.text,performance:fillMissing?voicePerformance(row.line):row.performance,...(fillMissing?{deliveryProfile:row.performance}:{}),model:config.model};
  await atomic('src/voice-manifest.js','// Generated clips only.\nexport const VOICE_MANIFEST = '+JSON.stringify(manifest,null,2)+';\n');
}

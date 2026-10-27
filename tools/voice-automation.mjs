import {readFile,writeFile,mkdir,appendFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {VOICE_REVIEW_CATALOG,VOICE_REVIEW_RETIRED} from '../src/voice-review-catalog.js';
import {voiceReviewPublishReport} from '../src/voice-review-release.js';
import {extractCompleteVoiceScript} from './voice-script.mjs';
import {compileVoiceAutomation} from './voice-automation-request.mjs';
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const save=async(path,value)=>writeFile(path,JSON.stringify(value,null,2)+'\n');
const run=(cmd,args)=>{const result=spawnSync(cmd,args,{stdio:'inherit',windowsHide:true});if(result.status!==0)throw Error(cmd+' failed; do not retry paid generation without checking the receipt');};
const receiptPath='config/voice-automation-runs.json',statePath='.local/voice-automation-state.json';
const phase=process.argv[2];await mkdir('.local',{recursive:true});
if(phase==='prepare'){
 let request;try{const raw=process.env.REQUEST_JSON||(process.env.GITHUB_EVENT_PATH?(await json(process.env.GITHUB_EVENT_PATH)).inputs.request_json:await readFile(process.argv[3],'utf8'));if(raw.length>60000)throw Error();request=JSON.parse(raw);}catch{throw Error('Supply valid request JSON below 60000 characters');}
 const state=compileVoiceAutomation(request,{catalog:VOICE_REVIEW_CATALOG,retired:VOICE_REVIEW_RETIRED,script:extractCompleteVoiceScript(),ids:await json('config/voice-ids.json'),config:await json('config/voice-performance.json'),pronunciations:(await json('config/voice-pronunciation-issues.json')).issues,repairs:await json('config/voice-repairs.json'),ledger:await json(receiptPath)});
 await save(statePath,state);
 const summary={requestId:state.requestId,alreadyCompleted:state.noop,recordings:state.count||0,estimatedCredits:state.estimatedCredits||0};console.log(JSON.stringify(summary));
 if(process.env.GITHUB_OUTPUT)await appendFile(process.env.GITHUB_OUTPUT,'noop='+state.noop+'\n');
 if(process.env.GITHUB_STEP_SUMMARY)await appendFile(process.env.GITHUB_STEP_SUMMARY,'Voice request plan\n\n```json\n'+JSON.stringify(summary,null,2)+'\n```\n');
}else{
 const state=await json(statePath);if(state.noop)process.exit(0);
 if(phase==='begin'){
  if(state.count){
   const key=process.env.ELEVENLABS_API_KEY;if(!key)throw Error('Configure ELEVENLABS_API_KEY1 or ELEVENLABS_API_KEY repository secret');
   const response=await fetch('https://api.elevenlabs.io/v1/user/subscription',{headers:{'xi-api-key':key},signal:AbortSignal.timeout(30000)});
   if(!response.ok)throw Error('ElevenLabs credential check failed before generation');
   const balance=await response.json();if(balance.character_limit-balance.character_count<state.estimatedCredits)throw Error('Insufficient generation balance');
  }
  const ledger=await json(receiptPath);if(ledger.runs[state.requestId])throw Error('Request receipt already exists');
  ledger.runs[state.requestId]={requestDigest:state.requestDigest,planId:state.planId,status:'started',recordings:state.count,startedAt:new Date().toISOString(),workflowRun:process.env.GITHUB_RUN_ID||null};await save(receiptPath,ledger);
 }else if(phase==='generate'){
  const receipt=(await json(receiptPath)).runs[state.requestId];if(receipt?.status!=='started'||receipt.requestDigest!==state.requestDigest)throw Error('A matching durable receipt is required');
  await save('config/voice-repairs.json',state.nextRepairs);
  const shared=await json('config/voice-review-published.json');await save('config/voice-review-published.json',voiceReviewPublishReport(shared,state.report,VOICE_REVIEW_CATALOG));
  if(state.count){
   await save('.local/voice-automation-report.json',state.report);
   run(process.execPath,['tools/voices.mjs','--scope=repairs','--review-report=.local/voice-automation-report.json','--quiet','--generate','--approve='+state.planId]);
   run(process.execPath,['tools/master-reviewed-voices.mjs','.local/voice-plan.json']);
  }
 }else if(phase==='complete'){
  const ledger=await json(receiptPath),receipt=ledger.runs[state.requestId];if(receipt?.status!=='started')throw Error('Missing started receipt');
  Object.assign(receipt,{status:'completed',completedAt:new Date().toISOString()});await save(receiptPath,ledger);
  const files=['config/voice-automation-runs.json','config/voice-repairs.json','config/voice-review-published.json','src/voice-manifest.js','src/voice-review-catalog.js','src/voice-review-published.js'];
  if(state.count)for(const row of (await json('.local/voice-plan.json')).rows){if(!/^[a-f0-9]{64}$/.test(row.hash))throw Error('Invalid generated file identity');files.push('assets/voices/'+row.hash+'.mp3','assets/voices/'+row.hash+'.repair.mp3');}
  run('git',['add','--',...files]);
 }else throw Error('Unknown voice automation phase');
}

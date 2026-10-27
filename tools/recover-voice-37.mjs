import {readFile,writeFile,copyFile,stat} from 'node:fs/promises';
import {decryptIssue} from './voice-bridge.mjs';
import {compileVoiceAutomation} from './voice-automation-request.mjs';
import {extractCompleteVoiceScript,planVoices,digest} from './voice-script.mjs';
import {VOICE_REVIEW_CATALOG,VOICE_REVIEW_RETIRED} from '../src/voice-review-catalog.js';
import {VOICE_MANIFEST} from '../src/voice-manifest.js';
import {voiceReviewPublishReport} from '../src/voice-review-release.js';
const cases=[
 {requestId:'voice-20261027-review-37-part1-01',run:'40459085372',issue:24,count:30,folder:'.local/recovery-30/'},
 {requestId:'voice-20261027-review-37-part2-01',run:'40459094366',issue:25,count:7,folder:'.local/recovery-7/'}
];
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const ledger=await json('config/voice-automation-runs.json');
const oldLedger=structuredClone(ledger);
for(const c of cases)delete oldLedger.runs[c.requestId];
const secret=process.env.VOICE_BRIDGE_PRIVATE_KEY?.replace(/\\n/g,'\n');
const token=process.env.GITHUB_TOKEN;
if(!secret||!token)throw Error('Recovery credentials unavailable');
const ids=await json('config/voice-ids.json'),config=await json('config/voice-performance.json');
const pronunciations=(await json('config/voice-pronunciation-issues.json')).issues;
const originalRepairs=await json('config/voice-repairs.json'),nextRepairs=structuredClone(originalRepairs);
let published=await json('config/voice-review-published.json');
const manifest=structuredClone(VOICE_MANIFEST);
const script=extractCompleteVoiceScript();
let restored=0;
for(const c of cases){
 const receipt=ledger.runs[c.requestId];
 if(receipt?.status!=='started'||String(receipt.workflowRun)!==c.run||receipt.recordings!==c.count)throw Error('Unmatched started receipt: '+c.requestId);
 const response=await fetch('https://api.github.com/repos/Alicetel-u/FeralLife/issues/'+c.issue,{headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json'}});
 if(!response.ok)throw Error('Cannot read issue '+c.issue);
 const issue=await response.json();
 if(issue.title!=='[Voice Bridge] repair'||issue.user?.login!=='Alicetel-u')throw Error('Incorrect original issue');
 const request=decryptIssue(issue.body,secret);
 if(request.requestId!==c.requestId)throw Error('Unexpected request identity');
 const compiled=compileVoiceAutomation(request,{catalog:VOICE_REVIEW_CATALOG,retired:VOICE_REVIEW_RETIRED,script,ids,config,pronunciations,repairs:originalRepairs,ledger:oldLedger});
 if(compiled.requestDigest!==receipt.requestDigest||compiled.planId!==receipt.planId||compiled.count!==c.count)throw Error('Immutable receipt mismatch');
 const plan=await json(c.folder+'.local/voice-plan.json'),journal=await json(c.folder+'.local/voice-journal.json');
 if(plan.planId!==receipt.planId||plan.rows.length!==c.count)throw Error('Artifact plan mismatch');
 const planned=planVoices(script.filter(row=>compiled.targets.includes(row.lineKey)),ids,config,pronunciations,compiled.nextRepairs.lines);
 if(planned.length!==c.count||digest(planned.map(row=>({source:row.source,hash:row.hash})))!==plan.planId)throw Error('Generated plan differs');
 for(const row of plan.rows){
  const actual=planned.find(x=>x.lineKey===row.lineKey);
  const rule=compiled.nextRepairs.lines.find(x=>x.speaker===row.speaker&&x.text===row.text);
  if(!actual||actual.hash!==row.hash||actual.voiceId!==row.voiceId||actual.request.text!==row.spokenInput||JSON.stringify(actual.request.voice_settings)!==JSON.stringify(row.settings)||!rule?.repairComment)throw Error('Recording identity mismatch '+row.source);
  if(journal[row.hash]?.status!=='complete'||!journal[row.hash]?.requestId||!journal[row.hash]?.chargedCharacters)throw Error('Incomplete charge journal');
  const stem=c.folder+'assets/voices/'+row.hash;
  for(const suffix of ['.mp3','.repair.mp3'])if((await stat(stem+suffix)).size<8192)throw Error('Missing completed audio '+stem+suffix);
  for(const suffix of ['.mp3','.repair.mp3'])await copyFile(stem+suffix,'assets/voices/'+row.hash+suffix);
  const old=manifest[row.lineKey];if(!old)throw Error('Missing manifest identity '+row.lineKey);
  manifest[row.lineKey]={...old,file:'assets/voices/'+row.hash+'.repair.mp3',hash:row.hash,source:row.source,speaker:row.speaker,text:row.text,performance:row.performance,model:config.model,repairReview:true,repairComment:'再生成済み。'+rule.repairComment,audioMastering:{integratedLUFS:-18,truePeakDBTP:-6,tailPaddingSeconds:.25,fadeInSeconds:.004,fadeOutSeconds:.016}};
  delete manifest[row.lineKey].fastFile;
  restored++;
 }
 for(const rule of compiled.nextRepairs.lines){
  const original=originalRepairs.lines.find(x=>x.speaker===rule.speaker&&x.text===rule.text);
  if(original&&JSON.stringify(original)===JSON.stringify(rule))continue;
  const index=nextRepairs.lines.findIndex(x=>x.speaker===rule.speaker&&x.text===rule.text);
  if(index<0)nextRepairs.lines.push(rule);else nextRepairs.lines[index]=rule;
 }
 published=voiceReviewPublishReport(published,compiled.report,VOICE_REVIEW_CATALOG);
 Object.assign(receipt,{status:'completed',completedAt:new Date().toISOString()});
}
if(restored!==37)throw Error('Unexpected restored recording count');
await writeFile('config/voice-repairs.json',JSON.stringify(nextRepairs,null,2)+'\n');
await writeFile('config/voice-review-published.json',JSON.stringify(published,null,2)+'\n');
await writeFile('src/voice-manifest.js','// Generated clips only.\nexport const VOICE_MANIFEST = '+JSON.stringify(manifest,null,2)+';\n');
await writeFile('config/voice-automation-runs.json',JSON.stringify(ledger,null,2)+'\n');
console.log('Restored '+restored+' authenticated completed audio recordings without any paid API request');

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {compileVoiceAutomation} from '../tools/voice-automation-request.mjs';
import {VOICE_REVIEW_CATALOG,VOICE_REVIEW_RETIRED} from '../src/voice-review-catalog.js';
import {extractCompleteVoiceScript} from '../tools/voice-script.mjs';
const json=async path=>JSON.parse(await readFile(new URL(path,import.meta.url),'utf8'));
const data={catalog:VOICE_REVIEW_CATALOG,retired:VOICE_REVIEW_RETIRED,script:extractCompleteVoiceScript(),ids:await json('../config/voice-ids.json'),config:await json('../config/voice-performance.json'),pronunciations:(await json('../config/voice-pronunciation-issues.json')).issues,repairs:await json('../config/voice-repairs.json'),ledger:{schema:1,runs:{}}};
const sample=VOICE_REVIEW_CATALOG.find(row=>row.source==='act1/observation/outside:7')||VOICE_REVIEW_CATALOG[0];
const make=()=>({requestId:'test-request-0001',maxCredits:500,report:{application:'kemono-voice-review',schema:2,records:[[sample.reviewId,sample.version,'ng','2026-10-27T00:00:00Z',['reading'],'利用者だけのメモ']]},corrections:[{id:sample.reviewId,spokenText:sample.line.text,tags:['animated','conversational'],settings:{stability:.5,similarity_boost:.75,speed:1},comment:'読みの区切りを調整して再生成。'}]});

test('a ChatGPT request compiles only current reported audio without changing its dialogue or voice identity',()=>{
 const request=make(),before=JSON.stringify(data),plan=compileVoiceAutomation(request,data);
 assert.equal(plan.count,1);assert.deepEqual(plan.targets,[sample.id]);assert.ok(plan.estimatedCredits>0&&plan.estimatedCredits<=request.maxCredits);
 assert.equal(JSON.stringify(data),before);assert.ok(!JSON.stringify(plan.nextRepairs).includes('利用者だけのメモ'));
 const rule=plan.nextRepairs.lines.find(row=>row.speaker===sample.line.speaker&&row.text===sample.line.text);assert.equal(rule.text,sample.line.text);
});

test('budget, stale versions, unreported corrections and unsafe settings stop before generation',()=>{
 let request=make();request.maxCredits=0;assert.throws(()=>compileVoiceAutomation(request,data),/cap/);
 request=make();request.report.records[0][1]='obsolete';assert.throws(()=>compileVoiceAutomation(request,data),/outdated/);
 request=make();request.corrections=[];assert.throws(()=>compileVoiceAutomation(request,data),/Every current NG/);
 request=make();request.corrections[0].tags=['whispers'];assert.throws(()=>compileVoiceAutomation(request,data),/clearly spoken/);
 request=make();request.corrections[0].settings.speed=100;assert.throws(()=>compileVoiceAutomation(request,data),/range/);
 request=make();request.command='arbitrary shell';assert.throws(()=>compileVoiceAutomation(request,data),/fields/);
});

test('removed audio is never regenerated and OK-only reports can publish without a voice call',()=>{
 const request=make(),old=VOICE_REVIEW_RETIRED[0];request.report.records=[[old.reviewId,'old','ng','2026-10-27T00:00:00Z',['reading'],'旧指摘'],[sample.reviewId,sample.version,'ok','2026-10-27T00:00:00Z']];request.corrections=[];request.maxCredits=0;
 const plan=compileVoiceAutomation(request,data);assert.equal(plan.count,0);assert.equal(plan.estimatedCredits,0);
 request.corrections=make().corrections;assert.throws(()=>compileVoiceAutomation(request,data),/match/);
});

test('durable receipts reject unfinished attempts and duplicate plans while completed identical requests are no-ops',()=>{
 const request=make(),plan=compileVoiceAutomation(request,data),entry={requestDigest:plan.requestDigest,planId:plan.planId,status:'started'};
 const context={...data,ledger:{schema:1,runs:{[request.requestId]:entry}}};
 assert.throws(()=>compileVoiceAutomation(request,context),/unfinished/);
 entry.status='completed';assert.equal(compileVoiceAutomation(request,context).noop,true);
 const changed=make();changed.maxCredits++;assert.throws(()=>compileVoiceAutomation(changed,context),/different content/);
 const differentId=make();differentId.requestId='new-request-0002';assert.throws(()=>compileVoiceAutomation(differentId,context),/already attempted/);
});

test('the workflow reads private input from the event file and explicitly triggers Pages after the bot push',async()=>{
 const workflow=await readFile(new URL('../.github/workflows/voice-review-automation.yml',import.meta.url),'utf8');
 assert.match(workflow,/default: validate/);assert.doesNotMatch(workflow,/\$\{\{ inputs.request_json \}\}/);
 const runner=await readFile(new URL('../tools/voice-automation.mjs',import.meta.url),'utf8');assert.match(runner,/GITHUB_EVENT_PATH/);
 assert.ok(workflow.indexOf('Persist duplicate-charge guard')<workflow.indexOf('Generate only reviewed recordings'));
 assert.match(workflow,/deploy-pages\.yml\/dispatches/);
 const schema=await json('../docs/voice-automation-action.json');assert.equal(schema.servers[0].url,'https://api.github.com');
 assert.ok(Object.keys(schema.paths).every(path=>path.startsWith('/repos/Alicetel-u/FeralLife/')));
});

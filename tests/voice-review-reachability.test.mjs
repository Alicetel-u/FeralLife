import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,unlinkSync,rmdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {VOICE_REVIEW_CATALOG,VOICE_REVIEW_RETIRED} from '../src/voice-review-catalog.js';
import {VOICE_MANIFEST} from '../src/voice-manifest.js';
import {getActOneChoices,createActOne} from '../src/act-one.js';
import {tracePlayableVoiceLines} from '../tools/voice-reachability.mjs';
import {voiceReviewEmpty,voiceReviewMark,voiceReviewSyncCatalog,voiceReviewFilter,voiceReviewBackup,voiceReviewLoad,voiceReviewImport,voiceReviewExport} from '../src/voice-review-store.js';
import {voiceReviewParseReport} from '../src/voice-review-release.js';
const retired=VOICE_REVIEW_RETIRED.find(row=>JSON.parse(row.id)[1]==='灰皿を冷凍庫にぶち込め！ キンキンに冷やせ！');

test('hidden freezer, old restart, suppressed mutters and unshown generic events are not review targets',()=>{
 for(const attempt of [1,2,3,10])assert.ok(!getActOneChoices(createActOne(42,[],attempt,true),'ash').some(choice=>choice.id==='freezer'));
 for(const row of VOICE_REVIEW_CATALOG)assert.doesNotMatch(row.source,/\/freezer:|\/restart\/|\/ambient\/|\/ambient:|\/undefined:/);
 assert.ok(retired);assert.ok(!VOICE_REVIEW_CATALOG.some(row=>row.id===retired.id));
 for(const text of ['全部、覚えてる。','少し歩くニャ。座りっぱなしで足が固まったニャ。','困ったときは、ちゃんと相談しよう。','家賃、入ってるニャ。数えたから、たぶん足りるニャ。'])assert.ok(!VOICE_REVIEW_CATALOG.some(row=>row.line.text===text),text);
});

test('review entries have real reachable paths while missing recordings remain a separate diagnostic',()=>{
 const trace=tracePlayableVoiceLines(VOICE_MANIFEST);
 assert.ok(trace.states>100&&trace.states<10000);
 for(const row of VOICE_REVIEW_CATALOG)assert.equal(trace.lines.get(row.id)?.recorded,true,row.id);
 for(const row of VOICE_REVIEW_RETIRED)assert.ok(!trace.lines.has(row.id),row.id);
 assert.ok(trace.missing.some(row=>row.source.includes('act2-rewind')));
 const active=new Set(VOICE_REVIEW_CATALOG.map(row=>row.id));
 for(const row of trace.missing)assert.ok(!active.has(row.lineKey));
});

test('removed review decisions survive reload as history without entering any active queue',()=>{
 const state=voiceReviewEmpty(),old={...retired,line:{speaker:'manager',text:JSON.parse(retired.id)[1]},scene:'1:ash',version:'old-audio'};
 voiceReviewSyncCatalog(state,[old]);voiceReviewMark(state,old,{status:'ng',issues:['reading'],note:'以前の指摘を保存'});
 voiceReviewSyncCatalog(state,VOICE_REVIEW_CATALOG);
 for(const status of ['pending','recheck','all','ng','todo','repaired']){state.filters.status=status;assert.ok(!voiceReviewFilter(VOICE_REVIEW_CATALOG,state).some(row=>row.id===old.id),status);}
 state.filters.status='removed';assert.equal(voiceReviewFilter(VOICE_REVIEW_CATALOG,state).find(row=>row.id===old.id).removed,true);
 const saved=voiceReviewBackup(state),restored=voiceReviewLoad({getItem:()=>saved}).state;
 assert.equal(restored.records[old.id].note,'以前の指摘を保存');assert.match(voiceReviewExport(restored,VOICE_REVIEW_CATALOG),/現行の修正依頼 0件／削除済み履歴 1件/);
});

test('pre-cleanup short reports are still importable and retired-only repair plans stop before any API call',()=>{
 const payload={application:'kemono-voice-review',schema:2,records:[[retired.reviewId,'old-audio','ng','2026-10-27T01:00:00Z',['reading'],'旧台詞の指摘']]};
 const text=JSON.stringify(payload),parsed=voiceReviewParseReport(text,[...VOICE_REVIEW_CATALOG,...VOICE_REVIEW_RETIRED]);
 assert.equal(parsed.records[retired.id].note,'旧台詞の指摘');
 const state=voiceReviewEmpty();voiceReviewImport(state,parsed);state.filters.status='pending';assert.ok(!voiceReviewFilter(VOICE_REVIEW_CATALOG,state).some(row=>row.id===retired.id));
 const folder=mkdtempSync(join(tmpdir(),'feral-retired-report-')),report=join(folder,'report.txt');
 try{
  writeFileSync(report,text);
  const result=spawnSync(process.execPath,['tools/voices.mjs','--scope=repairs','--review-report='+report,'--quiet'],{cwd:fileURLToPath(new URL('..',import.meta.url)),encoding:'utf8',windowsHide:true});
  assert.equal(result.status,1);assert.match(result.stderr,/No reported audio requires repair/);
 }finally{unlinkSync(report);rmdirSync(folder);}
});

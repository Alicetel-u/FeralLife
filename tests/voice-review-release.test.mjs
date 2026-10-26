import test from 'node:test';
import assert from 'node:assert/strict';
import {voiceReviewEmpty,voiceReviewMark,voiceReviewOpenPending,voiceReviewFilter,voiceReviewBackup,voiceReviewLoad} from '../src/voice-review-store.js';
import {voiceReviewApplyPublished,voiceReviewPublishReport,voiceReviewHandoff,voiceReviewParseReport,voiceReviewValidatePublished} from '../src/voice-review-release.js';
import {mountVoiceReview} from '../src/voice-review.js';
const row=text=>({id:JSON.stringify(['cat',text,'moku',false]),version:'v1',chapter:1,scene:'1:opening',sceneLabel:'冒頭',source:'act1/opening',line:{speaker:'cat',text}});
const empty=()=>({schema:1,decisions:{}}),snapshot=s=>JSON.parse(voiceReviewBackup(s));
const mark=(state,r,status,time,note='')=>{voiceReviewMark(state,r,{status,note,issues:status==='ng'?['reading']:[]});state.records[r.id].updatedAt=time;};
const memory=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};};

test('handoff -> publish -> fresh PC/mobile retains OK, repair waits, new audio and unjudged playback',()=>{
 const accepted=row('確認済み'),flagged=row('修正待ち'),repaired=row('差し替え対象'),fresh=row('まだ未確認'),heard=row('聞いたが未判定');
 const catalog=[accepted,flagged,repaired,fresh,heard],state=voiceReviewEmpty();
 for(const [r,status] of [[accepted,'ok'],[flagged,'ng'],[repaired,'ng'],[heard,'todo']])mark(state,r,status,'2026-10-26T01:00:00Z','非公開メモ');
 const report=voiceReviewParseReport('修正依頼'+voiceReviewHandoff(state));
 assert.equal(report.records[accepted.id].status,'ok');assert.equal(report.records[flagged.id].note,'非公開メモ');
 const published=voiceReviewPublishReport(empty(),report,catalog);
 assert.ok(!JSON.stringify(published).includes('非公開メモ'));assert.equal(Object.keys(published.decisions).length,3);
 const release=catalog.map(r=>r.id===repaired.id?{...r,version:'v2',repairReview:true}:r);
 for(let device=0;device<2;device++){
  const next=voiceReviewEmpty();voiceReviewApplyPublished(next,published,release);voiceReviewOpenPending(next);
  assert.deepEqual(voiceReviewFilter(release,next).map(r=>r.id),[fresh.id,heard.id]);
  next.filters.status='recheck';assert.deepEqual(voiceReviewFilter(release,next).map(r=>r.id),[repaired.id]);
 }
});

test('published current approval defeats newer obsolete report, while newer local current decision survives',()=>{
 const current={...row('音声版'),version:'v2',repairReview:true},old={...current,version:'v1'};
 const state=voiceReviewEmpty(),approved=voiceReviewEmpty();mark(approved,current,'ok','2026-10-26T01:00:00Z');
 const published=voiceReviewPublishReport(empty(),snapshot(approved),[current]);
 mark(state,old,'ng','2026-10-26T02:00:00Z','旧録音へのメモ');voiceReviewApplyPublished(state,published,[current]);
 assert.equal(state.records[current.id].status,'ok');assert.equal(state.records[current.id].version,'v2');assert.equal(state.records[current.id].history[0].note,'旧録音へのメモ');
 const obsolete=voiceReviewEmpty();mark(obsolete,old,'ng','2026-10-26T03:00:00Z');
 assert.deepEqual(voiceReviewPublishReport(published,snapshot(obsolete),[current]),published);
 mark(state,current,'ng','2026-10-26T04:00:00Z','新しい指摘');voiceReviewApplyPublished(state,published,[current]);assert.equal(state.records[current.id].note,'新しい指摘');
 const olderPublished=voiceReviewPublishReport(empty(),snapshot(obsolete),[current]);voiceReviewApplyPublished(approved,olderPublished,[current]);assert.equal(approved.records[current.id].status,'ok');
});

test('OK-only exports work, old backups remain supported and malformed/private release data is rejected',()=>{
 const r=row('問題なし'),state=voiceReviewEmpty();mark(state,r,'ok','2026-10-26T01:00:00Z');
 const published=voiceReviewPublishReport(empty(),voiceReviewParseReport(voiceReviewBackup(state)),[r]);
 assert.equal(published.decisions[r.id].status,'ok');assert.throws(()=>voiceReviewValidatePublished({schema:1,decisions:{[r.id]:{...published.decisions[r.id],note:'秘密'}}}));
 assert.throws(()=>voiceReviewPublishReport(published,{application:'wrong',schema:1,records:{}},[r]));
});

test('real review UI hides OK immediately, opens repaired audio separately, exports both decisions and reopens cleanly',async()=>{
 const initial=row('未確認テスト'),repair={...row('修正テスト'),version:'v2',repairReview:true,repairComment:'読みを修正'};
 const storage=memory(),listeners=new Map(),root={innerHTML:'',addEventListener:(n,f)=>listeners.set(n,f),removeEventListener:n=>listeners.delete(n),contains:()=>true,querySelector:()=>null};
 const priorDocument=globalThis.document;globalThis.document={addEventListener(){},removeEventListener(){}};
 const click=async action=>{const button={dataset:{vr:action}};await listeners.get('click')({target:{closest:()=>button},stopPropagation(){}});};
 let dispose;
 try{
  dispose=mountVoiceReview(root,{storage,catalog:[initial,repair],published:empty(),player:{stop(){}}});
  assert.match(root.innerHTML,/未確認テスト/);assert.doesNotMatch(root.innerHTML,/GitHub同期|修正テスト/);
  await click('ok');assert.match(root.innerHTML,/未確認の音声はありません/);
  await click('recheck');assert.match(root.innerHTML,/修正テスト/);assert.match(root.innerHTML,/読みを修正/);
  await click('ok');assert.match(root.innerHTML,/修正後の確認待ちはありません/);
  await click('export');assert.match(root.innerHTML,/KEMONO_VOICE_REVIEW_REPORT/);
  const saved=voiceReviewLoad(storage).state;assert.equal(saved.records[initial.id].status,'ok');assert.equal(saved.records[repair.id].status,'ok');
  dispose();dispose=mountVoiceReview(root,{storage,catalog:[initial,repair],published:empty(),player:{stop(){}}});
  assert.match(root.innerHTML,/未確認の音声はありません/);await click('recheck');assert.match(root.innerHTML,/修正後の確認待ちはありません/);
 }finally{dispose?.();globalThis.document=priorDocument;}
});

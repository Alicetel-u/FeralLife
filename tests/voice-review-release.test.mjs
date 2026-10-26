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

test('compact files preserve OK/NG and private notes, skip published decisions and support unknown historical keys',()=>{
 const accepted={...row('既に公開した判定'),reviewId:'aabbccdd00112233'},newer={...row('今回の指摘'),reviewId:'aabbccdd00112244'},removed=row('以前の台詞'),state=voiceReviewEmpty();
 mark(state,accepted,'ok','2026-10-27T01:00:00Z');mark(state,newer,'ng','2026-10-27T02:00:00Z','読みがおかしい');mark(state,removed,'ok','2026-10-27T03:00:00Z');
 const published=voiceReviewPublishReport(empty(),{application:'kemono-voice-review',schema:1,records:{[accepted.id]:state.records[accepted.id]}},[accepted,newer]);
 const handoff=voiceReviewHandoff(state,[accepted,newer],published),parsed=voiceReviewParseReport(handoff,[accepted,newer]);
 assert.equal(Object.keys(parsed.records).length,2);assert.equal(parsed.records[newer.id].note,'読みがおかしい');assert.equal(parsed.records[removed.id].status,'ok');assert.ok(!handoff.includes(accepted.id));assert.ok(!handoff.includes(newer.id));
 assert.throws(()=>voiceReviewParseReport(handoff,[]),/最新カタログ/);
});

test('OK advances and plays immediately without continuous mode, and report shares as a text attachment',async()=>{
 const first=row('一番目'),second={...row('二番目'),reviewId:'0011223344556677'},storage=memory(),listeners=new Map(),played=[];
 const root={innerHTML:'',addEventListener:(n,f)=>listeners.set(n,f),removeEventListener:n=>listeners.delete(n),contains:()=>true,querySelector:()=>null};
 const oldDocument=globalThis.document,oldNavigator=Object.getOwnPropertyDescriptor(globalThis,'navigator');let shared,dispose;
 globalThis.document={addEventListener(){},removeEventListener(){}};Object.defineProperty(globalThis,'navigator',{configurable:true,value:{canShare:()=>true,share:async args=>{shared=args;}}});
 const click=async action=>listeners.get('click')({target:{closest:()=>({dataset:{vr:action}})},stopPropagation(){}});
 try{
  dispose=mountVoiceReview(root,{storage,catalog:[first,second],published:empty(),player:{stop(){},unlock(){},play(line){played.push(line.text);}}});
  await click('ok');assert.deepEqual(played,['二番目']);assert.match(root.innerHTML,/連続 OFF/);
  await click('ok');assert.deepEqual(played,['二番目']);assert.match(root.innerHTML,/未確認の音声はありません/);
  await click('export');await click('share');assert.equal(shared.files.length,1);assert.match(shared.files[0].name,/\.txt$/);
  const parsed=voiceReviewParseReport(await shared.files[0].text(),[first,second]);assert.equal(parsed.records[first.id].status,'ok');assert.equal(parsed.records[second.id].status,'ok');
 }finally{dispose?.();globalThis.document=oldDocument;if(oldNavigator)Object.defineProperty(globalThis,'navigator',oldNavigator);else delete globalThis.navigator;}
});

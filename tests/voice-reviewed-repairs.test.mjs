import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {VOICE_MANIFEST} from '../src/voice-manifest.js';
import {VOICE_REVIEW_CATALOG} from '../src/voice-review-catalog.js';
import {voiceReviewApplyPublished} from '../src/voice-review-release.js';
import {voiceReviewEmpty,voiceReviewOpenPending,voiceReviewFilter,voiceReviewMark,voiceReviewBackup,voiceReviewLoad} from '../src/voice-review-store.js';
import {extractCompleteVoiceScript,planVoices} from '../tools/voice-script.mjs';
const texts=[
 'うわっくっせぇ！！煙だらけじゃねーか！',
 '……スマホどこやったかニャ？',
 '……ないニャ。',
 '灰皿を冷凍庫にぶち込め！ キンキンに冷やせ！',
 '……確かに。なんで冷凍庫なんて言ったんだ、俺。',
 '大家、いい知らせニャ。',
 '立ってた場所だけじゃねぇか！'
];

const reportedVersions=['042427cf2282546ff8e5','7c9d0520703c1bd90189','12a83a3a39bc61e92cad','704688e6eac162684c18','ef1fa699b902a9444a84','6648c175f9f78c9f9993','51fc5dd898d0248c844d'];
const reported={schema:1,decisions:Object.fromEntries(texts.map((text,i)=>[VOICE_REVIEW_CATALOG.find(r=>r.line.text===text).id,{status:'ng',version:reportedVersions[i],updatedAt:'2026-10-26T17:45:16.542Z'}]))};

test('seven requested recordings have new audio identities, repair comments and edge protection',()=>{
 for(const text of texts){
  const row=VOICE_REVIEW_CATALOG.find(r=>r.line.text===text),clip=VOICE_MANIFEST[row.id];
  assert.equal(reported.decisions[row.id].status,'ng');
  assert.notEqual(row.version,reported.decisions[row.id].version,text);
  assert.equal(row.repairReview,true);assert.match(row.repairComment,/再生成/);
  assert.equal(clip.file,`assets/voices/${clip.hash}.repair.mp3`);
  assert.equal(clip.audioMastering.tailPaddingSeconds,.25);assert.equal(clip.audioMastering.truePeakDBTP,-6);
  assert.equal(clip.fastFile,undefined);
 }
});

test('published decisions keep repairs separate until a current-audio decision survives reload',()=>{
 const state=voiceReviewEmpty();voiceReviewApplyPublished(state,reported,VOICE_REVIEW_CATALOG);voiceReviewOpenPending(state);
 const pending=new Set(voiceReviewFilter(VOICE_REVIEW_CATALOG,state).map(r=>r.id));
 state.filters.status='recheck';const recheck=new Set(voiceReviewFilter(VOICE_REVIEW_CATALOG,state).map(r=>r.id));
 for(const text of texts){
  const row=VOICE_REVIEW_CATALOG.find(r=>r.line.text===text);
  assert.ok(!pending.has(row.id));assert.ok(recheck.has(row.id));voiceReviewMark(state,row,{status:'ok'});
 }
 const saved=voiceReviewBackup(state),restored=voiceReviewLoad({getItem:()=>saved}).state;
 voiceReviewApplyPublished(restored,reported,VOICE_REVIEW_CATALOG);restored.filters.status='recheck';
 const remaining=new Set(voiceReviewFilter(VOICE_REVIEW_CATALOG,restored).map(r=>r.id));
 for(const text of texts){const row=VOICE_REVIEW_CATALOG.find(r=>r.line.text===text);assert.ok(!remaining.has(row.id));assert.equal(restored.records[row.id].status,'ok');}
});

test('smoke, freezer and standing-place corrections are applied only as spoken pronunciation overrides',async()=>{
 const json=async path=>JSON.parse(await readFile(new URL(path,import.meta.url),'utf8'));
 const config=await json('../config/voice-performance.json'),repairs=(await json('../config/voice-repairs.json')).lines,ids=await json('../config/voice-ids.json');
 const planned=planVoices(extractCompleteVoiceScript(),ids,config,(await json('../config/voice-pronunciation-issues.json')).issues,repairs);
 const readings={
  'うわっくっせぇ！！煙だらけじゃねーか！':'けむり',
  '灰皿を冷凍庫にぶち込め！ キンキンに冷やせ！':'れいとうこ',
  '……確かに。なんで冷凍庫なんて言ったんだ、俺。':'れいとうこ',
  '立ってた場所だけじゃねぇか！':'たってた、ばしょ'
 };
 for(const [text,reading] of Object.entries(readings)){
  const row=planned.find(r=>r.text===text);assert.ok(row.request.text.includes(reading));assert.equal(row.line.text,text);
  assert.equal(row.hash,VOICE_MANIFEST[row.lineKey].hash);
 }
});

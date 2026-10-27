import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {VOICE_MANIFEST} from '../src/voice-manifest.js';
import {VOICE_REVIEW_CATALOG} from '../src/voice-review-catalog.js';
import {voiceReviewApplyPublished} from '../src/voice-review-release.js';
import {voiceReviewEmpty,voiceReviewOpenPending,voiceReviewFilter,voiceReviewMark,voiceReviewBackup,voiceReviewLoad} from '../src/voice-review-store.js';
import {extractCompleteVoiceScript,planVoices} from '../tools/voice-script.mjs';
const originalTexts=[
 'うわっくっせぇ！！煙だらけじゃねーか！',
 '……スマホどこやったかニャ？',
 '……ないニャ。',
 '灰皿を冷凍庫にぶち込め！ キンキンに冷やせ！',
 '……確かに。なんで冷凍庫なんて言ったんだ、俺。',
 '大家、いい知らせニャ。',
 '立ってた場所だけじゃねぇか！'
];

const texts=originalTexts.filter(text=>VOICE_REVIEW_CATALOG.some(row=>row.line.text===text));
const reportedVersions=['042427cf2282546ff8e5','7c9d0520703c1bd90189','12a83a3a39bc61e92cad','704688e6eac162684c18','ef1fa699b902a9444a84','6648c175f9f78c9f9993','51fc5dd898d0248c844d'];
const reported={schema:1,decisions:Object.fromEntries(texts.map((text,i)=>[VOICE_REVIEW_CATALOG.find(r=>r.line.text===text).id,{status:'ng',version:reportedVersions[originalTexts.indexOf(text)],updatedAt:'2026-10-26T17:45:16.542Z'}]))};

test('active repaired recordings keep new audio identities, repair comments and edge protection',()=>{
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

const originalNextTexts=[
 'もう一本……灰皿が山盛りニャ。','せめて両足ぶんは今日やれ！',
 '灰皿を冷凍庫にぶち込め！ キンキンに冷やせ！','もうチャーハンは諦めろ！ 命の方が大事だろ！！',
 '煙……？','灰皿ごと水に沈めろ！','モク！？ まだ中にいるのか！？','おい……返事しろよ……！'
];
const nextTexts=originalNextTexts.filter(text=>VOICE_REVIEW_CATALOG.some(row=>row.line.text===text));
const nextReportedVersions=['5cbc2827f3758868c2a9','36cbe5e3f96612473759','123b34bc05d2c5685e57','230d8f1aa54e77c550d3','e9686fcf2c3c8f2d063a','c29d12f68b918d9dcf3e','201da6c50ba21303c302','a9b1195eb6a1d75e0251'];

test('active follow-up repairs remain separate without reopening accepted recordings',()=>{
 const accepted=texts.filter(text=>!nextTexts.includes(text)),decisions={};
 for(const text of accepted){const row=VOICE_REVIEW_CATALOG.find(r=>r.line.text===text);decisions[row.id]={status:'ok',version:row.version,updatedAt:'2026-10-26T18:16:11.182Z'};}
 for(let i=0;i<nextTexts.length;i++){const row=VOICE_REVIEW_CATALOG.find(r=>r.line.text===nextTexts[i]);decisions[row.id]={status:'ng',version:nextReportedVersions[originalNextTexts.indexOf(nextTexts[i])],updatedAt:'2026-10-26T18:16:11.182Z'};assert.notEqual(row.version,nextReportedVersions[originalNextTexts.indexOf(nextTexts[i])]);assert.equal(row.repairReview,true);}
 const state=voiceReviewEmpty();voiceReviewApplyPublished(state,{schema:1,decisions},VOICE_REVIEW_CATALOG);state.filters.status='recheck';
 const recheck=new Set(voiceReviewFilter(VOICE_REVIEW_CATALOG,state).map(r=>r.id));
 for(const text of nextTexts)assert.ok(recheck.has(VOICE_REVIEW_CATALOG.find(r=>r.line.text===text).id));
 for(const text of accepted)assert.ok(!recheck.has(VOICE_REVIEW_CATALOG.find(r=>r.line.text===text).id));
 voiceReviewOpenPending(state);const pending=new Set(voiceReviewFilter(VOICE_REVIEW_CATALOG,state).map(r=>r.id));
 for(const text of [...nextTexts,...accepted])assert.ok(!pending.has(VOICE_REVIEW_CATALOG.find(r=>r.line.text===text).id));
});

test('freezer keeps natural mixed writing while the fire plea uses panic instead of commanding delivery',async()=>{
 const repairs=JSON.parse(await readFile(new URL('../config/voice-repairs.json',import.meta.url),'utf8')).lines;
 const freezer=repairs.find(r=>r.text==='灰皿を冷凍庫にぶち込め！ キンキンに冷やせ！');assert.ok(freezer.spokenText.includes('灰皿'));assert.ok(freezer.spokenText.includes('れいとうこ'));assert.ok(freezer.spokenText.includes('ぶち込め'));
 const plea=repairs.find(r=>r.text==='おい……返事しろよ……！');assert.ok(plea.tags.includes('[crying]'));assert.ok(plea.tags.includes('[pleading]'));
 assert.ok(!plea.tags.some(tag=>/angry|confident|lighthearted|playful|shouting/.test(tag)));assert.ok(plea.settings.speed>=.8&&plea.settings.speed<=1.2);
 const forceful=repairs.find(r=>r.text==='灰皿ごと水に沈めろ！');assert.ok(forceful.tags.includes('[serious]'));assert.ok(forceful.tags.includes('[shouting]'));
});

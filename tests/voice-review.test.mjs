import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {VOICE_MANIFEST} from '../src/voice-manifest.js';
import {VOICE_REVIEW_KEY,voiceReviewEmpty,voiceReviewStatus,voiceReviewMark,voiceReviewLoad,voiceReviewImport,voiceReviewBackup,voiceReviewExport,voiceReviewFilter} from '../src/voice-review-store.js';
import {VOICE_REVIEW_CATALOG} from '../src/voice-review-catalog.js';
import {extractCompleteVoiceScript} from '../tools/voice-script.mjs';
const row=VOICE_REVIEW_CATALOG.find(r=>r.chapter===2&&r.line.speaker==='hostess');
const memory=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};};

test('the voice review catalog contains only current playable lines and content fingerprints',()=>{
 const rows=extractCompleteVoiceScript();assert.equal(VOICE_REVIEW_CATALOG.length,rows.length);
 assert.deepEqual(new Set(VOICE_REVIEW_CATALOG.map(r=>r.id)),new Set(rows.map(r=>r.lineKey)));
 for(const r of VOICE_REVIEW_CATALOG){assert.match(r.version,/^[a-f0-9]{20}$/);assert.ok([1,2].includes(r.chapter));assert.ok(r.sceneLabel);}
 assert.ok(VOICE_REVIEW_CATALOG.some(r=>r.scene==='2:observation2'));
});

test('checks, multiple issues, notes, filters and resume position survive reload and unrelated releases',()=>{
 const state=voiceReviewEmpty(),storage=memory();
 voiceReviewMark(state,row,{status:'ng',issues:['reading','quiet'],note:'にゅうきょしゃが聞き取りづらい'});
 state.cursorId=row.id;state.filters={...state.filters,chapter:'2',speaker:'hostess'};
 storage.setItem(VOICE_REVIEW_KEY,voiceReviewBackup(state));
 const loaded=voiceReviewLoad(storage);assert.equal(loaded.warning,'');assert.deepEqual(loaded.state,state);
 assert.equal(voiceReviewStatus({...row},loaded.state.records[row.id]),'ng');
 assert.ok(voiceReviewFilter(VOICE_REVIEW_CATALOG,loaded.state).every(r=>r.chapter===2&&r.line.speaker==='hostess'));
});

test('replaced audio asks for rechecking while previous notes remain exportable; unchanged audio keeps its status',()=>{
 const state=voiceReviewEmpty();voiceReviewMark(state,row,{status:'ng',issues:['reading'],note:'語尾が切れる'});
 const changed={...row,version:'new-recording'};
 assert.equal(voiceReviewStatus(changed,state.records[row.id]),'changed');
 assert.match(voiceReviewExport(state,[changed]),/更新前の音声/);assert.match(voiceReviewExport(state,[changed]),/語尾が切れる/);
 voiceReviewMark(state,changed,{status:'ok',issues:[],note:''});
 assert.equal(voiceReviewStatus(changed,state.records[row.id]),'ok');assert.equal(state.records[row.id].history[0].note,'語尾が切れる');
 const storage=memory();storage.setItem(VOICE_REVIEW_KEY,voiceReviewBackup(state));assert.equal(voiceReviewLoad(storage).state.records[row.id].history[0].note,'語尾が切れる');
});

test('backups merge by newer decision and never delete notes for removed lines',()=>{
 const older=voiceReviewEmpty();voiceReviewMark(older,row,{status:'ng',issues:['reading'],note:'旧メモ'});older.records[row.id].updatedAt='2026-10-01T00:00:00Z';
 const newer=voiceReviewEmpty();voiceReviewMark(newer,row,{status:'ng',issues:['quiet'],note:'新しいメモ'});newer.records[row.id].updatedAt='2026-10-02T00:00:00Z';
 assert.equal(voiceReviewImport(newer,JSON.parse(voiceReviewBackup(older))),0);assert.equal(newer.records[row.id].note,'新しいメモ');
 assert.match(voiceReviewExport(newer,[]),/旧台詞の記録/);assert.match(voiceReviewExport(newer,[]),/新しいメモ/);
 assert.throws(()=>voiceReviewImport(newer,{application:'another-game',schema:1,records:{}}));
 const bad=JSON.parse(voiceReviewBackup(older));bad.records[row.id].issues=['invalid'];assert.throws(()=>voiceReviewImport(newer,bad));assert.equal(newer.records[row.id].note,'新しいメモ');
});

test('the handoff includes the exact lookup key, scene, line, problem and memo',()=>{
 const state=voiceReviewEmpty();voiceReviewMark(state,row,{status:'ng',issues:['reading','flat'],note:'元気に話してほしい'});
 const out=voiceReviewExport(state,[row]);for(const value of [row.id,row.sceneLabel,row.line.text,'読み間違い','棒読み・演技','元気に話してほしい',row.version])assert.ok(out.includes(value));
});

 test('listened recordings can be filtered separately without treating them as approved',()=>{
 const state=voiceReviewEmpty();voiceReviewMark(state,row,{listenedVersion:row.version});
 assert.equal(voiceReviewStatus(row,state.records[row.id]),'heard');assert.equal(state.records[row.id].status,'todo');
 state.filters.status='todo';assert.equal(voiceReviewFilter([row],state).length,0);
 state.filters.status='heard';assert.equal(voiceReviewFilter([row],state).length,1);
 assert.equal(voiceReviewStatus({...row,version:'replaced'},state.records[row.id]),'changed');
 });

test('recording versions are tied to played audio contents, not the release or source filename',async()=>{
 for(let i=0;i<VOICE_REVIEW_CATALOG.length;i+=8)await Promise.all(VOICE_REVIEW_CATALOG.slice(i,i+8).map(async row=>{
  const clip=VOICE_MANIFEST[row.id];const data=await readFile(new URL('../'+(clip.fastFile||clip.file),import.meta.url));
  assert.equal(row.version,createHash('sha256').update(data).digest('hex').slice(0,20),row.source);
 }));
});

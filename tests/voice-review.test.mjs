import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {VOICE_MANIFEST} from '../src/voice-manifest.js';
import {VOICE_REVIEW_KEY,voiceReviewEmpty,voiceReviewSyncCatalog,voiceReviewRows,voiceReviewHasRepair,voiceReviewStatus,voiceReviewMark,voiceReviewLoad,voiceReviewImport,voiceReviewBackup,voiceReviewExport,voiceReviewFilter} from '../src/voice-review-store.js';
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
 assert.equal(voiceReviewStatus(changed,state.records[row.id]),'fixed');assert.equal(state.records[row.id].history[0].note,'語尾が切れる');
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


const variant=(text,version='v1')=>({...row,id:JSON.stringify([row.line.speaker,text,'normal',false]),line:{...row.line,text},version,repaired:false});
test('catalog migration preserves old checks and a first catalog snapshot does not mark everything new',()=>{
 const state=voiceReviewEmpty(),a=variant('確認済みの台詞'),b=variant('まだ聞いていない台詞');
 voiceReviewMark(state,a,{status:'ok'});voiceReviewSyncCatalog(state,[a,b]);
 assert.deepEqual(voiceReviewRows([a,b],state).map(r=>voiceReviewStatus(r,state.records[r.id])),['ok','todo']);
 const storage=memory();storage.setItem(VOICE_REVIEW_KEY,voiceReviewBackup(state));assert.deepEqual(voiceReviewLoad(storage).state,state);
});

test('added and removed wording is tracked even without decisions, while changed audio asks for rechecking',()=>{
 const state=voiceReviewEmpty(),old=variant('変更前の台詞'),unchanged=variant('そのままの台詞'),audio=variant('録音だけ直す台詞');
 voiceReviewSyncCatalog(state,[old,unchanged,audio]);voiceReviewMark(state,unchanged,{status:'ok'});voiceReviewMark(state,audio,{status:'ng',issues:['quiet'],note:'小さい'});
 const added=variant('変更後の新しい台詞'),changed={...audio,version:'v2'},catalog=[unchanged,changed,added];
 voiceReviewSyncCatalog(state,catalog);
 const rows=voiceReviewRows(catalog,state),status=id=>{const r=rows.find(r=>r.id===id);return voiceReviewStatus(r,state.records[id]);};
 assert.equal(status(old.id),'removed');assert.equal(status(added.id),'new');assert.equal(status(changed.id),'changed');assert.equal(status(unchanged.id),'ok');
 assert.ok(!voiceReviewFilter(catalog,state).some(r=>r.id===old.id));
 state.filters.status='removed';assert.deepEqual(voiceReviewFilter(catalog,state).map(r=>r.id),[old.id]);
 state.filters.status='new';assert.deepEqual(voiceReviewFilter(catalog,state).map(r=>r.id),[added.id]);
 const storage=memory();storage.setItem(VOICE_REVIEW_KEY,voiceReviewBackup(state));const reload=voiceReviewLoad(storage).state;voiceReviewSyncCatalog(reload,catalog);
 assert.equal(voiceReviewStatus(voiceReviewRows(catalog,reload).find(r=>r.id===added.id),null),'new');assert.equal(reload.records[audio.id].note,'小さい');
});

test('repair history and accepted repairs can be filtered without resetting ordinary OK decisions',()=>{
 const state=voiceReviewEmpty(),ordinary=variant('最初から問題なし'),fixed=variant('修正する台詞'),known={...variant('既に修正した録音'),repaired:true};
 voiceReviewMark(state,ordinary,{status:'ok'});voiceReviewMark(state,fixed,{status:'ng',issues:['clipping'],note:'最後にブツッ'});
 const update={...fixed,version:'v2'};voiceReviewSyncCatalog(state,[ordinary,update,known]);
 voiceReviewMark(state,update,{status:'ok',issues:[],note:''});
 assert.equal(voiceReviewStatus(update,state.records[update.id]),'fixed');assert.equal(voiceReviewStatus(ordinary,state.records[ordinary.id]),'ok');
 state.filters.status='repaired';assert.deepEqual(new Set(voiceReviewFilter([ordinary,update,known],state).map(r=>r.id)),new Set([fixed.id,known.id]));
 state.filters.status='fixed';assert.deepEqual(voiceReviewFilter([ordinary,update,known],state).map(r=>r.id),[fixed.id]);
 state.filters.status='ok';assert.equal(voiceReviewFilter([ordinary,update,known],state).length,2);
});

test('sorting prioritizes additions and changed recordings or recent decisions and survives backup',()=>{
 const state=voiceReviewEmpty(),a=variant('問題なし'),b=variant('指摘あり'),c=variant('新規');voiceReviewSyncCatalog(state,[a,b]);
 voiceReviewMark(state,a,{status:'ok'});voiceReviewMark(state,b,{status:'ng',issues:['flat']});state.records[a.id].updatedAt='2026-10-01T00:00:00Z';state.records[b.id].updatedAt='2026-10-02T00:00:00Z';voiceReviewSyncCatalog(state,[a,b,c]);
 state.filters.sort='status';assert.deepEqual(voiceReviewFilter([a,b,c],state).map(r=>r.id),[c.id,b.id,a.id]);
 state.filters.sort='updated';assert.deepEqual(voiceReviewFilter([a,b,c],state).map(r=>r.id),[b.id,a.id,c.id]);
 const storage=memory();storage.setItem(VOICE_REVIEW_KEY,voiceReviewBackup(state));assert.equal(voiceReviewLoad(storage).state.filters.sort,'updated');
});

test('deleted flagged wording remains in exports as history and is never requested for regeneration',()=>{
 const state=voiceReviewEmpty(),old=variant('削除する台詞');voiceReviewMark(state,old,{status:'ng',issues:['reading'],note:'以前の指摘'});voiceReviewSyncCatalog(state,[old]);voiceReviewSyncCatalog(state,[]);
 const text=voiceReviewExport(state,[]);assert.match(text,/現行の修正依頼 0件/);assert.match(text,/再生成不要/);assert.match(text,/以前の指摘/);
});


test('old inner-voice speaker spelling migrates without losing a saved note',()=>{
 const state=voiceReviewEmpty(),r=variant('心の声');r.id=JSON.stringify(['manager',r.line.text,'inner',false]);r.line.speaker='manager';
 voiceReviewMark(state,r,{status:'ng',issues:['quiet'],note:'心の声が小さい'});state.records[r.id].speaker='大家（心の声）';
 const storage=memory();storage.setItem(VOICE_REVIEW_KEY,voiceReviewBackup(state));const restored=voiceReviewLoad(storage);
 assert.equal(restored.warning,'');assert.equal(restored.state.records[r.id].speaker,'manager');assert.equal(restored.state.records[r.id].note,'心の声が小さい');
 assert.ok(VOICE_REVIEW_CATALOG.every(r=>['manager','cat','hostess'].includes(r.line.speaker)));
});

test('imported catalog identities cannot inject a speaker attribute into removed-line history',()=>{
 const state=voiceReviewEmpty(),payload=JSON.parse(voiceReviewBackup(state));payload.catalogEntries={};
 payload.catalogEntries[JSON.stringify(['cat" onclick="bad()','台詞','normal',false])]={chapter:1,version:'v1'};
 assert.throws(()=>voiceReviewImport(state,payload),/形式/);assert.equal(state.catalogEntries,null);
});


test('a saved unplayed filter still includes newly added wording after a release',()=>{
 const state=voiceReviewEmpty(),old=variant('未再生だった台詞'),added=variant('更新で追加された台詞');
 voiceReviewSyncCatalog(state,[old]);state.filters.status='todo';voiceReviewSyncCatalog(state,[old,added]);
 assert.deepEqual(voiceReviewFilter([old,added],state).map(r=>r.id),[old.id,added.id]);
});

test('opening review hides accepted audio without losing decisions, including updated OK audio',async()=>{
 const {voiceReviewOpenPending}=await import('../src/voice-review-store.js');
 const state=voiceReviewEmpty(),a=variant('承認済み'),b=variant('修正後承認済み'),c=variant('要確認');b.repaired=true;
 voiceReviewMark(state,a,{status:'ok'});voiceReviewMark(state,b,{status:'ok'});
 state.filters.status='all';voiceReviewOpenPending(state);
 assert.equal(state.filters.sort,'scene');assert.deepEqual(voiceReviewFilter([a,b,c],state).map(r=>r.id),[c.id]);
 const newer={...a,version:'v2'};
 assert.ok(!voiceReviewFilter([newer,b,c],state).some(r=>r.id===a.id));
 const storage=memory();storage.setItem(VOICE_REVIEW_KEY,voiceReviewBackup(state));const restored=voiceReviewLoad(storage).state;voiceReviewOpenPending(restored);
 assert.equal(restored.records[a.id].status,'ok');assert.equal(voiceReviewFilter([a,b,c],restored).length,1);
 restored.filters.status='all';assert.equal(voiceReviewFilter([a,b,c],restored).length,3);
});

test('repair recheck excludes accepted and re-reported current audio, and keeps old notes on updates',()=>{
 const state=voiceReviewEmpty(),a={...variant('修正した音声'),repaired:true,repairComment:'語尾を調整。'},b=variant('元のまま');
 state.filters.status='recheck';assert.deepEqual(voiceReviewFilter([a,b],state).map(r=>r.id),[]);
 voiceReviewMark(state,a,{status:'ng',issues:['timing'],note:'旧版の語尾'});
 assert.equal(voiceReviewFilter([a,b],state).length,0);
 const newer={...a,version:'v2'};assert.equal(voiceReviewFilter([newer,b],state).length,1);
 voiceReviewMark(state,newer,{listenedVersion:'v2',status:'todo'});assert.equal(voiceReviewFilter([newer,b],state).length,1);
 voiceReviewMark(state,newer,{status:'ok',issues:[],note:''});assert.equal(voiceReviewFilter([newer,b],state).length,0);
 assert.equal(state.records[a.id].history[0].note,'旧版の語尾');
});

test('the five reported repairs include their concrete correction comments in the catalog',()=>{
 const rows=VOICE_REVIEW_CATALOG.filter(r=>VOICE_MANIFEST[r.id].repairComment);
 assert.equal(rows.length,5);
 for(const r of rows){assert.equal(r.repairComment,VOICE_MANIFEST[r.id].repairComment);assert.ok(r.repaired);assert.match(r.repairComment,/再生成/);}
});

test('repair recheck requires an actual flagged replacement, not historic mastering or OK audio',()=>{
 const state=voiceReviewEmpty(),mastered={...variant('過去の音量調整'),repaired:true},heard={...variant('聞いただけの調整音声'),repaired:true},ok=variant('問題なしのまま'),fixed={...variant('修正確認済み'),repaired:true},reported=variant('指摘して直した音声');
 voiceReviewMark(state,heard,{listenedVersion:heard.version});
 voiceReviewMark(state,ok,{status:'ok'});voiceReviewMark(state,fixed,{status:'ok'});
 voiceReviewMark(state,reported,{status:'ng',issues:['timing'],note:'語尾切れ'});
 const changed={...reported,version:'v2'},okChanged={...ok,version:'v2'};
 const catalog=[mastered,heard,okChanged,fixed,changed];voiceReviewSyncCatalog(state,catalog);state.filters.status='recheck';
 assert.deepEqual(voiceReviewFilter(catalog,state).map(r=>r.id),[reported.id]);
 voiceReviewMark(state,changed,{status:'ok',issues:[],note:''});assert.equal(voiceReviewFilter(catalog,state).length,0);
 const storage=memory();storage.setItem(VOICE_REVIEW_KEY,voiceReviewBackup(state));const restored=voiceReviewLoad(storage).state;
 assert.equal(voiceReviewFilter(catalog,restored).length,0);assert.equal(restored.records[ok.id].status,'ok');
});

test('initial checking and repaired checking are disjoint across reopen and saved filters',async()=>{
 const {voiceReviewOpenPending}=await import('../src/voice-review-store.js');
 const state=voiceReviewEmpty(),fresh=variant('未確認'),heard=variant('再生済み未判定'),ok=variant('問題なし'),ng=variant('指摘済み修正待ち'),repair=variant('修正前'),fixed={...variant('修正後OK'),repaired:true};
 voiceReviewMark(state,heard,{listenedVersion:heard.version});voiceReviewMark(state,ok,{status:'ok'});
 voiceReviewMark(state,ng,{status:'ng',issues:['flat'],note:'演技'});voiceReviewMark(state,repair,{status:'ng',issues:['timing'],note:'語尾'});voiceReviewMark(state,fixed,{status:'ok'});
 const changed={...repair,version:'v2'},catalog=[fresh,heard,ok,ng,changed,fixed];
 voiceReviewSyncCatalog(state,catalog);state.filters={chapter:'2',scene:'missing',speaker:'cat',status:'ng',search:'保存済み検索',sort:'updated'};
 voiceReviewOpenPending(state);
 assert.deepEqual(voiceReviewFilter(catalog,state).map(r=>r.id),[fresh.id,heard.id]);
 assert.equal(state.filters.scene,'all');assert.equal(state.filters.search,'');
 state.filters.status='recheck';assert.deepEqual(voiceReviewFilter(catalog,state).map(r=>r.id),[repair.id]);
 const storage=memory();storage.setItem(VOICE_REVIEW_KEY,voiceReviewBackup(state));const restored=voiceReviewLoad(storage).state;voiceReviewOpenPending(restored);
 assert.deepEqual(voiceReviewFilter(catalog,restored).map(r=>r.id),[fresh.id,heard.id]);
 assert.equal(restored.records[ng.id].note,'演技');assert.equal(restored.records[repair.id].note,'語尾');
 voiceReviewMark(restored,fresh,{status:'ng',issues:['quiet']});assert.deepEqual(voiceReviewFilter(catalog,restored).map(r=>r.id),[heard.id]);
 voiceReviewMark(restored,heard,{status:'ok'});assert.equal(voiceReviewFilter(catalog,restored).length,0);
});

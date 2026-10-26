import test from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {voiceReviewEmpty,voiceReviewBackup,voiceReviewMark,voiceReviewOpenPending,voiceReviewFilter} from '../src/voice-review-store.js';
import {voiceReviewMergeSnapshots,voiceReviewApplySync,createVoiceReviewRepositorySync,createVoiceReviewSyncClient} from '../src/voice-review-sync.js';
import {createVoiceReviewSyncHandler} from '../tools/voice-review-github-server.mjs';

const snapshot=state=>JSON.parse(voiceReviewBackup(state));
const row=text=>({id:JSON.stringify(['cat',text,'moku',false]),version:'v1',chapter:1,scene:'1:opening',sceneLabel:'オープニング',source:'act1/opening',line:{speaker:'cat',text}});
const record=(state,text,status,time,note='')=>{const r=row(text);voiceReviewMark(state,r,{status,note,issues:status==='ng'?['timing']:[]});state.records[r.id].updatedAt=time;return r;};
function repository(initial=snapshot(voiceReviewEmpty()),privateRepo=true){
 const memory={data:structuredClone(initial),sha:'sha-1',writes:0,calls:[],conflicts:0,onConflict:null};
 memory.request=async(path,options={})=>{
  memory.calls.push({path,method:options.method||'GET'});
  if(!path.includes('/contents/'))return {private:privateRepo};
  if(options.method!=='PUT')return {sha:memory.sha,size:Buffer.byteLength(JSON.stringify(memory.data)),encoding:'base64',content:Buffer.from(JSON.stringify(memory.data)).toString('base64')};
  if(memory.conflicts>0){memory.conflicts--;memory.onConflict?.();const e=Error('Conflict');e.status=409;throw e;}
  assert.equal(options.body.sha,memory.sha);memory.data=JSON.parse(Buffer.from(options.body.content,'base64').toString('utf8'));memory.sha='sha-'+(++memory.writes+1);return {content:{sha:memory.sha}};
 };return memory;
}

test('two PCs merge newest decisions, Japanese notes and retained old audio reports',()=>{
 const a=voiceReviewEmpty(),b=voiceReviewEmpty();
 const shared=record(a,'日本語の指摘ニャ。','ng','2026-10-26T01:00:00Z','語尾が切れる');
 record(b,shared.line.text,'ok','2026-10-26T02:00:00Z');record(a,'PC-Aの判定','ok','2026-10-26T01:30:00Z');record(b,'PC-Bの指摘','ng','2026-10-26T02:30:00Z','明るくしてほしい');
 b.records[shared.id].version='v2';
 const merged=voiceReviewMergeSnapshots(snapshot(a),snapshot(b));
 assert.equal(Object.keys(merged.records).length,3);assert.equal(merged.records[shared.id].status,'ok');
 assert.equal(merged.records[shared.id].history[0].note,'語尾が切れる');assert.equal(a.records[shared.id].status,'ng');
 const again=voiceReviewMergeSnapshots(merged,snapshot(a));assert.deepEqual(again.records,merged.records);
});

test('same timestamp conflicts converge and sync applies them without overwriting local filters',()=>{
 const a=voiceReviewEmpty(),b=voiceReviewEmpty(),r=record(a,'同時刻','ok','2026-10-26T01:00:00Z');record(b,'同時刻','ng','2026-10-26T01:00:00Z','同時刻の指摘');
 const ab=voiceReviewMergeSnapshots(snapshot(a),snapshot(b)),ba=voiceReviewMergeSnapshots(snapshot(b),snapshot(a));
 assert.deepEqual(ab.records,ba.records);assert.equal(ab.records[r.id].status,'ng');
 a.filters.search='端末の検索';a.cursorId=r.id;assert.equal(voiceReviewApplySync(a,snapshot(b)),1);assert.equal(a.records[r.id].status,'ng');assert.equal(a.filters.search,'端末の検索');assert.equal(a.cursorId,r.id);
});

test('repository sync verifies privacy and preserves remote and local records through a SHA race',async()=>{
 const a=voiceReviewEmpty(),b=voiceReviewEmpty();record(a,'PC-A','ok','2026-10-26T01:00:00Z');record(b,'PC-B','ng','2026-10-26T01:00:00Z','語尾');
 const repo=repository(snapshot(b));repo.conflicts=1;repo.onConflict=()=>{record(b,'競合中に追加','ok','2026-10-26T02:00:00Z');repo.data=snapshot(b);repo.sha='concurrent-sha';};
 const service=createVoiceReviewRepositorySync({request:repo.request});const result=await service.upload(snapshot(a));
 assert.equal(Object.keys(result.records).length,3);assert.equal(repo.writes,1);assert.deepEqual((await service.download()).records,result.records);
 await service.upload(result);assert.equal(repo.writes,1,'unchanged sync does not create another commit');
 const publicRepo=repository(snapshot(b),false);await assert.rejects(createVoiceReviewRepositorySync({request:publicRepo.request}).upload(snapshot(a)),/非公開/);assert.equal(publicRepo.calls.length,1);
});

test('invalid remote data and failed writes do not mutate local decisions',async()=>{
 const state=voiceReviewEmpty();record(state,'保持する記録','ng','2026-10-26T01:00:00Z','保持するメモ');const before=snapshot(state);
 const corrupt=repository({application:'wrong',schema:1,records:{}});
 await assert.rejects(createVoiceReviewRepositorySync({request:corrupt.request}).upload(before));assert.equal(corrupt.writes,0);
 const failing=repository();failing.conflicts=4;
 await assert.rejects(createVoiceReviewRepositorySync({request:failing.request}).upload(before));assert.equal(failing.calls.filter(c=>c.method==='PUT').length,3);
 assert.deepEqual(state.records,before.records);
});

test('reading on a second PC hides accepted audio and keeps repaired checks separate',async()=>{
 const a=voiceReviewEmpty(),b=voiceReviewEmpty(),ordinary=record(a,'確認済み','ok','2026-10-26T01:00:00Z'),fresh=row('未確認');
 const repair={...record(a,'修正した音声','ng','2026-10-26T01:00:00Z','以前の指摘'),version:'v2',repairReview:true};
 const repo=repository();const service=createVoiceReviewRepositorySync({request:repo.request});await service.upload(snapshot(a));voiceReviewApplySync(b,await service.download());voiceReviewOpenPending(b);
 assert.deepEqual(voiceReviewFilter([ordinary,fresh,repair],b).map(r=>r.id),[fresh.id]);b.filters.status='recheck';assert.deepEqual(voiceReviewFilter([ordinary,fresh,repair],b).map(r=>r.id),[repair.id]);
});

test('browser authentication is only in memory and only sent to GitHub API',async()=>{
 const repo=repository(),calls=[];
 const fetchImpl=async(url,options)=>{calls.push({url,options});const data=await repo.request(url.replace('https://api.github.com/',''),{method:options.method,body:options.body?JSON.parse(options.body):undefined});return {ok:true,status:200,json:async()=>data};};
 const client=createVoiceReviewSyncClient({fetchImpl,location:{protocol:'https:',hostname:'alicetel-u.github.io'}});
 await assert.rejects(client.download(),/トークン/);assert.equal(calls.length,0);client.setToken('test-session-credential');await client.download();
 assert.ok(calls.every(c=>c.url.startsWith('https://api.github.com/repos/Alicetel-u/FeralLife-voice-review')));assert.ok(calls.every(c=>c.options.headers.Authorization==='Bearer test-session-credential'));
 client.dispose();await assert.rejects(client.download(),/トークン/);assert.ok(!JSON.stringify(snapshot(voiceReviewEmpty())).includes('credential'));
});

test('local bridge rejects cross-origin requests, missing headers and invalid uploads',async()=>{
 const repo=repository(),handler=createVoiceReviewSyncHandler({request:repo.request});
 const send=async({method='GET',headers={},body='',fragmented=false}={})=>{const bytes=Buffer.from(body),req=Readable.from(fragmented?Array.from(bytes,byte=>Buffer.from([byte])):[bytes]);req.method=method;req.headers={host:'127.0.0.1:4173',...headers};const response={writeHead(status){this.status=status;},end(text){this.data=JSON.parse(text);}};await handler(req,response);return response;};
 assert.equal((await send()).status,403);assert.equal((await send({headers:{'x-feral-voice-review':'1',origin:'https://other.example'}})).status,403);assert.equal(repo.calls.length,0);
 assert.equal((await send({headers:{'x-feral-voice-review':'1',host:'attacker.example'}})).status,403);
 const headers={'x-feral-voice-review':'1','content-type':'application/json',origin:'http://127.0.0.1:4173'};
 assert.equal((await send({method:'POST',headers,body:'not json'})).status,400);
 const state=voiceReviewEmpty();record(state,'ローカル経由のメモ','ng','2026-10-26T01:00:00Z','非公開の記録');
 const save=await send({method:'POST',headers,body:voiceReviewBackup(state),fragmented:true});assert.equal(save.status,200);
 const loaded=(await send({headers})).data;assert.equal(Object.values(loaded.records)[0].note,'非公開の記録');assert.equal(repo.writes,1);
});

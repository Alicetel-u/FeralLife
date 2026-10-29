import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {extractVoiceScript,planVoices} from '../tools/voice-script.mjs';
import {voiceSpeaker,voiceLineKey} from '../src/voice-policy.js';
import {ACT_THREE_MAP_SCENES} from '../src/act-three-story.js';
import {VOICE_MANIFEST} from '../src/voice-manifest.js';
import {tracePlayableVoiceLines} from '../tools/voice-reachability.mjs';
import {VOICE_REVIEW_CATALOG} from '../src/voice-review-catalog.js';
test('implemented third-act dialogue uses projected v4 performances with Mimi and real review reachability',async()=>{
 const rows=extractVoiceScript('act3-current');
 assert.equal(rows.length,106);
 const load=async p=>JSON.parse(await readFile(new URL('../'+p,import.meta.url),'utf8'));
 const plan=planVoices(rows,await load('config/voice-ids.json'),await load('config/voice-performance.json'),(await load('config/voice-pronunciation-issues.json')).issues,(await load('config/voice-repairs.json')).lines);
 const reach=tracePlayableVoiceLines(VOICE_MANIFEST),catalog=new Set(VOICE_REVIEW_CATALOG.map(r=>r.id));
 for(const row of plan){
  assert.equal(row.request.model_id,'eleven_v4');assert.equal(row.request.voice_settings.stability,.5);
  assert.equal(row.request.voice_settings.speed,undefined);
  assert.doesNotMatch(row.request.text,/whisper|mumbling|softly/i);
  const recording=VOICE_MANIFEST[row.lineKey];assert.equal(recording.hash,row.hash);assert.equal(recording.model,'eleven_v4');
  assert.ok((await readFile(new URL('../'+recording.file,import.meta.url))).length>128);
  assert.equal(recording.audioMastering.integratedLUFS,-18);
  assert.ok(reach.lines.has(row.lineKey));assert.ok(catalog.has(row.lineKey));
 }
 const hidden=ACT_THREE_MAP_SCENES.store.lines.find(l=>l.speaker==='mystery');
 assert.equal(voiceSpeaker(hidden),'rabbit');
 assert.ok(VOICE_MANIFEST[voiceLineKey(hidden)]);
 assert.ok(!rows.some(r=>r.line.text==='…………'));
 assert.ok(rows.some(r=>r.line.collapse&&r.performance==='act3-shocked'));
});

test('after-rewind dialogue plays once, stops on narration and exit, and uses the shared voice controls',async()=>{
 const {startActThreeAfter}=await import('../src/act-three-prologue.js');
 const oldImage=globalThis.Image,oldDocument=globalThis.document;
 const el=()=>({style:{setProperty(){}},hidden:true,setAttribute(){},querySelector(){return el();}});
 const elements=new Map();let click;
 const section={focus(){},dataset:{},querySelector(k){if(!elements.has(k))elements.set(k,el());return elements.get(k);},addEventListener(k,fn){if(k==='click')click=fn;},removeEventListener(){}};
 const calls=[];let stopped=0;
 const voice={play(line){calls.push(line);},stop(){stopped++;},setSuspended(){},get enabled(){return true;}};
 let stop;
 try{
  globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
  globalThis.Image=class{set src(v){queueMicrotask(()=>this.onload());}async decode(){}};
  stop=startActThreeAfter({querySelector:()=>section},()=>{},{voice});
  await new Promise(resolve=>setTimeout(resolve,0));
  const next=()=>click({target:{closest:()=>({hasAttribute:k=>k==='data-dialogue-next'})},preventDefault(){},stopPropagation(){}});
  next();assert.equal(calls.length,1);assert.equal(calls[0].voiceChapter,3);
  next();assert.equal(calls.length,1);assert.ok(stopped>=3);
 }finally{stop?.();globalThis.Image=oldImage;globalThis.document=oldDocument;}
});
test('Mimi review decisions survive backup and published decision validation',async()=>{
 const {voiceReviewEmpty,voiceReviewMark,voiceReviewBackup,voiceReviewLoad}=await import('../src/voice-review-store.js');
 const {voiceReviewValidatePublished}=await import('../src/voice-review-release.js');
 const row=VOICE_REVIEW_CATALOG.find(row=>row.line.speaker==='rabbit');
 const state=voiceReviewEmpty();voiceReviewMark(state,row,{status:'ok'});
 const loaded=voiceReviewLoad({getItem:()=>voiceReviewBackup(state)}).state;
 assert.equal(loaded.records[row.id].status,'ok');
 const record=loaded.records[row.id];
 assert.ok(voiceReviewValidatePublished({schema:1,decisions:{[row.id]:{status:'ok',version:record.version,updatedAt:record.updatedAt}}}));
});

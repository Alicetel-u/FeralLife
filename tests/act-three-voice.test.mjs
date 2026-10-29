import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {ACT_THREE_SHOTS} from '../src/act-three-prologue.js';
import {extractVoiceScript,planVoices} from '../tools/voice-script.mjs';
import {VOICE_MANIFEST} from '../src/voice-manifest.js';
import {VOICE_REVIEW_CATALOG} from '../src/voice-review-catalog.js';
import {voiceReviewEmpty,voiceReviewMark,voiceReviewBackup,voiceReviewLoad,voiceReviewOpenPending,voiceReviewFilter} from '../src/voice-review-store.js';
const json=async file=>JSON.parse(await readFile(new URL('../'+file,import.meta.url),'utf8'));
test('third-act film cues resolve their own generated voices and begin in the unreviewed queue',async()=>{
 const script=extractVoiceScript('act3-prologue');assert.equal(script.length,14);
 const config=await json('config/voice-performance.json');
 config.generationDefaults=await json('config/voice-generation-defaults.json');
 const repairs=(await json('config/voice-repairs.json')).lines.map(({tags,settings,...other})=>other);
 const plan=planVoices(script,await json('config/voice-ids.json'),config,(await json('config/voice-pronunciation-issues.json')).issues,repairs);
 const state=voiceReviewEmpty();voiceReviewOpenPending(state);const pending=new Set(voiceReviewFilter(VOICE_REVIEW_CATALOG,state).map(row=>row.id));
 for(const row of plan){assert.equal(VOICE_MANIFEST[row.lineKey].hash,row.hash);assert.ok((await readFile(new URL('../'+VOICE_MANIFEST[row.lineKey].file,import.meta.url))).length>128);assert.ok(pending.has(row.lineKey));assert.ok(!/whisper|mumbling|softly/i.test(row.request.text));}
 assert.equal(ACT_THREE_SHOTS.flatMap(shot=>shot.cues).length,plan.length);
 const announcer=VOICE_REVIEW_CATALOG.find(row=>row.chapter===3&&row.line.speaker==='announcer');voiceReviewMark(state,announcer,{status:'ok'});
 assert.equal(voiceReviewLoad({getItem:()=>voiceReviewBackup(state)}).state.records[announcer.id].status,'ok');
});

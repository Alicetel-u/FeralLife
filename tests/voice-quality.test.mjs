import test from 'node:test';
import assert from 'node:assert/strict';
import {stat} from 'node:fs/promises';
import {assertSpokenDuration} from '../tools/voice-quality.mjs';
import {VOICE_MANIFEST} from '../src/voice-manifest.js';

test('a full spoken sentence cannot be accepted as a tiny recording, while gasps and silence can',()=>{
 assert.throws(()=>assertSpokenDuration('ゴミ袋でいいのかニャ？',.16),/too short/);
 assert.doesNotThrow(()=>assertSpokenDuration('ゴミ袋でいいのかニャ？',1.6));
 for(const text of ['……。','…………。','……っ！'])assert.doesNotThrow(()=>assertSpokenDuration(text,.16));
 for(const seconds of [0,NaN,Infinity])assert.throws(()=>assertSpokenDuration('大家さん！',seconds),/duration/);
});

test('the truncated Moku sentence uses the restored recording and all audited repairs are playable',async()=>{
 const moku=Object.values(VOICE_MANIFEST).find(e=>e.speaker==='cat'&&e.text==='ゴミ袋でいいのかニャ？');
 assert.match(moku.file,/\.qa\.mp3$/);assert.ok(moku.audioQuality.restoredFrom);
 assert.ok(moku.audioQuality.durationSeconds>=1);
 assert.ok((await stat(new URL('../'+moku.file,import.meta.url))).size>8192);
 const repaired=Object.values(VOICE_MANIFEST).filter(e=>e.audioQuality);
 assert.ok(repaired.length>=28,'Previously audited audio-quality clips remain present');
 for(const entry of repaired){assertSpokenDuration(entry.text,entry.audioQuality.durationSeconds);assert.ok((await stat(new URL('../'+(entry.fastFile||entry.file),import.meta.url))).size>0);}
 const attack=repaired.find(e=>e.text.includes('煙ノ肉球乱舞'));
 assert.equal(attack.audioQuality.peakReductionDB,4);assert.match(attack.fastFile,/\.qa\.attack\.mp3$/);
});

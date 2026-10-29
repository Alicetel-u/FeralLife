import test from 'node:test';
import assert from 'node:assert/strict';
import {access} from 'node:fs/promises';
import {extractCompleteVoiceScript} from '../tools/voice-script.mjs';
import {VOICE_MANIFEST} from '../src/voice-manifest.js';
import {voiceLineKey,voicePerformance} from '../src/voice-policy.js';

test('every authored landlord, Moku and Luna line has a playable recording across both acts',async()=>{
 const rows=extractCompleteVoiceScript();
 assert.ok(rows.length>750);
 assert.equal(new Set(rows.map(row=>row.lineKey)).size,rows.length);
 for(const row of rows){
  assert.equal(row.lineKey,voiceLineKey(row.line));
  const clip=VOICE_MANIFEST[row.lineKey];
  assert.ok(clip,`${row.source}: ${row.line.text}`);
  await access(new URL('../'+(clip.fastFile||clip.file),import.meta.url));
  if(clip.deliveryProfile){
   assert.equal(clip.performance,voicePerformance(row.line));
   if(clip.deliveryProfile.startsWith('v3-inspired-v4:')){
    assert.equal(clip.model,'eleven_v4','adopted delivery must use Eleven v4');
    assert.ok(['v3-inspired-v4:casual','v3-inspired-v4:tense'].includes(clip.deliveryProfile),'unknown v4 delivery profile');
   }else{
    assert.equal(clip.deliveryProfile,{manager:'duel-manager',cat:'duel-moku',hostess:'duel-luna'}[row.speaker]);
   }
   assert.equal(clip.fastFile,undefined,'approved samples play at their recorded speed');
  }
 }
 assert.ok(rows.some(row=>row.line.epilogueScene==='secret'));
 assert.ok(rows.some(row=>row.source==='act2/ambient/complete'));
});

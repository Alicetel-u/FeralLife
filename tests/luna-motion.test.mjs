import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {LUNA_MOTION_ASSETS,LUNA_MOTION_DURATION,lunaMotionState,lunaMotionHTML} from '../src/luna-motion.js';

test('collapse has eight distinct authored poses before the camera reveals the building',()=>{
 const frames=[0,.33,.46,.59,.73,.87,1.03,1.19].map(t=>lunaMotionState(t).pose);
 assert.deepEqual(frames,[0,1,2,3,4,5,6,7]);
 assert.equal(lunaMotionState(2).phase,'breath');
 assert.equal(lunaMotionState(5).phase,'reveal');
 assert.equal(lunaMotionState(12).phase,'hold');
 for(const path of Object.values(LUNA_MOTION_ASSETS))assert.ok(existsSync(path),path);
});
test('body and background move at different depths and settle before the final voice',()=>{
 const near=lunaMotionState(2.8),far=lunaMotionState(7.5);
 assert.ok(near.characterScale>far.characterScale);
 assert.notEqual(near.characterScale/far.characterScale,near.backgroundScale/far.backgroundScale);
 assert.equal(far.pose,7);
 assert.match(lunaMotionState(9).subtitle,/ここなら/);
 assert.equal(lunaMotionState(7).subtitle,'');
 assert.equal(lunaMotionState(100).time,LUNA_MOTION_DURATION);
});
test('reduced motion holds a seated pose and fixed framing; sample has playback controls',()=>{
 for(const t of [0,1,6,12]){
  const state=lunaMotionState(t,true);
  assert.equal(state.pose,7);assert.equal(state.characterScale,1.74);
  assert.equal(state.backgroundScale,1.02);assert.equal(state.impact,0);assert.equal(state.breath,0);
 }
 const html=lunaMotionHTML();
 for(const control of ['data-motion-start','data-motion-pause','data-motion-replay','data-motion-exit'])assert.ok(html.includes(control));
 assert.ok(!/ink-dialogue|stage-bubble/.test(html));
});

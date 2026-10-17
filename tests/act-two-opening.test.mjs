import test from 'node:test';
import assert from 'node:assert/strict';
import { ACT_TWO_OPENING_SCENES, actTwoOpeningHTML } from '../src/act-two-opening.js';
import { PROLOGUE_CUTS, prologueCutHTML } from '../src/opening-prologue.js';

test('Luna cinematic uses the first-act text and cut UI',()=>{
 const html=actTwoOpeningHTML();
 for(const cls of ['ink-prologue','ink-cut-content','ink-dialogue','ink-next','ink-progress']){
  assert.ok(html.includes(cls)||prologueCutHTML(ACT_TWO_OPENING_SCENES[0]).includes(cls),cls);
 }
 assert.ok(ACT_TWO_OPENING_SCENES.length>=5);
 assert.ok(ACT_TWO_OPENING_SCENES.at(-1).text.includes('ここなら、しばらく隠れられるかな'));
 assert.ok(!html.includes('a2-bag'));
 assert.ok(!html.includes('a2-street'));
 assert.ok(PROLOGUE_CUTS.length>0);
});

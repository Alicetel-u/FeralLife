import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import { ACT_TWO_OPENING_SCENES as shots, actTwoOpeningHTML, actTwoOpeningFrame } from '../src/act-two-opening.js';

test('Luna film uses dedicated assets without dialogue windows',()=>{
 const html=actTwoOpeningHTML();
 assert.ok(!/ink-dialogue|stage-bubble|ink-prologue|ink-speaker/.test(html));
 for(const control of ['data-film-pause','data-film-next','data-film-skip'])assert.ok(html.includes(control));
 for(const shot of shots){assert.ok(existsSync(shot.image));assert.ok(shot.duration>0);}
 assert.ok(shots.at(-1).text.includes('ここなら、しばらく隠れられるかな'));
});
test('seated shot flows into continuous pullback to full building',()=>{
 const collapse=shots.findIndex(s=>s.shot==='collapse'),reveal=collapse+1;
 assert.equal(shots[collapse].image,shots[reveal].image);
 assert.equal(actTwoOpeningFrame(collapse,shots[collapse].duration).transform,actTwoOpeningFrame(reveal,0).transform);
 assert.equal(actTwoOpeningFrame(reveal,shots[reveal].duration).transform,'translate(0%,0%) scale(1)');
});
test('subtitles follow timed voice cues and reduced motion removes camera movement',()=>{
 assert.equal(actTwoOpeningFrame(1,0).subtitle,'');
 assert.match(actTwoOpeningFrame(1,1).subtitle,/追ってこない/);
 assert.equal(actTwoOpeningFrame(1,5).subtitle,'');
 for(let i=0;i<shots.length;i++)assert.equal(actTwoOpeningFrame(i,2,true).transform,'translate(0%,0%) scale(1)');
 const ids=shots.flatMap(s=>s.cues.filter(c=>!c.silent).map(c=>c.id));assert.equal(new Set(ids).size,ids.length);
 assert.equal(actTwoOpeningFrame(0,0).black,1);
 assert.equal(actTwoOpeningFrame(shots.length-1,shots.at(-1).duration).black,1);
});

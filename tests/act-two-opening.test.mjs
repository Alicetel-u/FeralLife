import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {ACT_TWO_OPENING_SCENES as shots,ACT_TWO_SEATED_ART,ACT_TWO_OPENING_DURATION,actTwoOpeningHTML,actTwoOpeningFrame} from '../src/act-two-opening.js';

test('full opening uses stills and a single transparent seated character without dialogue UI',()=>{
 const html=actTwoOpeningHTML();
 assert.ok(!/canvas|sprite|ink-dialogue|stage-bubble|ink-prologue/.test(html));
 for(const control of ['data-film-pause','data-film-next','data-film-skip'])assert.ok(html.includes(control));
 for(const shot of shots){assert.ok(existsSync(shot.image));assert.ok(shot.duration>0);}
 assert.ok(existsSync(ACT_TWO_SEATED_ART));
 assert.ok(!shots.some(s=>/sheet|poses/.test(s.image)));
 assert.ok(ACT_TWO_OPENING_DURATION>20&&ACT_TWO_OPENING_DURATION<30);
 assert.deepEqual(shots.map(s=>s.shot),['cold','heel','chase','glance','blind','listen','call','collapse','silence','reveal','look','out']);
});
test('seated image and backdrop remain continuous through silence, reveal and final line',()=>{
 const indices=['collapse','silence','reveal','look'].map(name=>shots.findIndex(s=>s.shot===name));
 for(let i=0;i<indices.length-1;i++){
  const left=indices[i],right=indices[i+1];
  assert.equal(shots[left].image,shots[right].image);
  const end=actTwoOpeningFrame(left,shots[left].duration),start=actTwoOpeningFrame(right,0);
  assert.equal(end.transform,start.transform);assert.equal(end.foreground,start.foreground);
 }
 const reveal=indices[2];
 assert.notEqual(actTwoOpeningFrame(reveal,0).foreground,actTwoOpeningFrame(reveal,shots[reveal].duration).foreground);
 assert.equal(shots[indices[1]].quiet,true);
});
test('event-driven shakes stop in quiet shots and reduced motion preserves composition',()=>{
 const chase=shots.findIndex(s=>s.shot==='chase'),listen=shots.findIndex(s=>s.shot==='listen');
 assert.notEqual(actTwoOpeningFrame(chase,.08).rig,actTwoOpeningFrame(chase,.19).rig);
 assert.equal(actTwoOpeningFrame(listen,.5).rig,actTwoOpeningFrame(listen,2).rig);
 for(let i=0;i<shots.length;i++){
  const a=actTwoOpeningFrame(i,.2,true),b=actTwoOpeningFrame(i,1,true);
  assert.equal(a.rig,b.rig);assert.equal(a.transform,b.transform);assert.equal(a.foreground,b.foreground);assert.equal(a.blur,0);
 }
 assert.match(actTwoOpeningFrame(listen,1).subtitle,/追ってこない/);
 assert.equal(actTwoOpeningFrame(0,0).black,1);
 assert.equal(actTwoOpeningFrame(shots.length-1,1).black,1);
 const ids=shots.flatMap(s=>s.cues.filter(c=>!c.silent).map(c=>c.id));assert.equal(new Set(ids).size,ids.length);
});
test('story and both old preview links invoke the same full opening; prototype is disconnected',()=>{
 const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 assert.match(app,/function showActTwoOpening\(\)\{\s*openModal\(actTwoOpeningHTML\(\)\);\s*stopOpeningPrologue=startActTwoOpening/);
 assert.match(app,/state\.actOne\.chapter===2&&state\.actOne\.titlePending\)\{showActTwoOpening\(\)/);
 assert.match(app,/\['act-two-opening','luna-motion'\]\.includes\(previewType\)/);
 assert.ok(!/startLunaMotion|lunaMotionHTML/.test(app));
});

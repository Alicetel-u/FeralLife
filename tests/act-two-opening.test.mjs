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
 assert.ok(ACT_TWO_OPENING_DURATION>=33&&ACT_TWO_OPENING_DURATION<=38);
 assert.deepEqual(shots.map(s=>s.shot),['heel','chase','listen','call','dismiss','collapse','notice','reveal','out']);
});
test('notification and readable rental notice precede the building reveal',()=>{
 const call=shots.findIndex(s=>s.shot==='call'),notice=shots.findIndex(s=>s.shot==='notice'),reveal=shots.findIndex(s=>s.shot==='reveal');
 assert.ok(call<notice&&notice<reveal);
 assert.ok(shots[call].events.some(e=>e.type==='ring'&&e.at<.65));
 assert.equal(actTwoOpeningFrame(call,.3).notification,false);
 assert.equal(actTwoOpeningFrame(call,.7).notification,true);
 assert.ok(actTwoOpeningHTML().includes('まだ話は終わっていない'));
 assert.ok(actTwoOpeningHTML().includes('入居者募集'));
 assert.ok(shots.find(s=>s.shot==='collapse').cues.length===0);
 assert.ok(shots.some(s=>s.pose==='rear')&&shots.some(s=>s.pose==='turn'));
 const dialogue=shots.flatMap(s=>s.cues.map(c=>c.text)).join('');
 assert.ok(!/もう、足が|少しだけ|まだ、来るの/.test(dialogue));
 const out=shots.findIndex(s=>s.shot==='out');
 assert.equal(actTwoOpeningFrame(reveal,shots[reveal].duration).transform,actTwoOpeningFrame(out,0).transform);
 assert.equal(actTwoOpeningFrame(reveal,shots[reveal].duration).foreground,actTwoOpeningFrame(out,0).foreground);
});
test('event-driven shakes stop in quiet shots and reduced motion preserves composition',()=>{
 const chase=shots.findIndex(s=>s.shot==='chase'),listen=shots.findIndex(s=>s.shot==='listen');
 assert.notEqual(actTwoOpeningFrame(chase,.08).rig,actTwoOpeningFrame(chase,.19).rig);
 assert.equal(actTwoOpeningFrame(listen,.5).rig,actTwoOpeningFrame(listen,2).rig);
 for(let i=0;i<shots.length;i++){
  const a=actTwoOpeningFrame(i,.2,true),b=actTwoOpeningFrame(i,1,true);
  assert.equal(a.rig,b.rig);assert.equal(a.transform,b.transform);assert.equal(a.foreground,b.foreground);assert.equal(a.blur,0);
 }
 assert.match(actTwoOpeningFrame(listen,2).subtitle,/ここまで来れば/);
 assert.equal(actTwoOpeningFrame(0,0).black,1);
 assert.equal(actTwoOpeningFrame(shots.length-1,2).black,1);
 const ids=shots.flatMap(s=>s.cues.filter(c=>!c.silent).map(c=>c.id));assert.equal(new Set(ids).size,ids.length);
});
test('story and both old preview links invoke the same full opening; prototype is disconnected',()=>{
 const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 assert.match(app,/function showActTwoOpening\(\)\{\s*openModal\(actTwoOpeningHTML\(\)\);\s*stopOpeningPrologue=startActTwoOpening/);
 assert.match(app,/state\.actOne\.chapter===2&&state\.actOne\.titlePending\)\{showActTwoOpening\(\)/);
 assert.match(app,/\['act-two-opening','luna-motion'\]\.includes\(previewType\)/);
 assert.ok(!/startLunaMotion|lunaMotionHTML/.test(app));
});

test('escape never shows the apartment and the listening shot continues the same camera',()=>{
 const firstBuilding=shots.findIndex(s=>s.person);
 assert.ok(shots.slice(0,firstBuilding).every(s=>!s.image.includes('luna-flight')&&!s.image.includes('courtyard')));
 const chase=shots.findIndex(s=>s.shot==='chase'),listen=chase+1;
 assert.equal(shots[chase].image,shots[listen].image);
 assert.equal(actTwoOpeningFrame(chase,shots[chase].duration).rig,actTwoOpeningFrame(listen,0).rig);
 assert.ok(!shots.some(s=>s.shot==='blind'));
});

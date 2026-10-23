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
 assert.ok(ACT_TWO_OPENING_DURATION>=30&&ACT_TWO_OPENING_DURATION<=38);
 assert.deepEqual(shots.map(s=>s.shot),['heel','chase','listen','call','dismiss','notice','reveal','out']);
});
test('notification and readable rental notice precede the building reveal',()=>{
 const call=shots.findIndex(s=>s.shot==='call'),notice=shots.findIndex(s=>s.shot==='notice'),reveal=shots.findIndex(s=>s.shot==='reveal');
 assert.ok(call<notice&&notice<reveal);
 assert.ok(shots[call].events.some(e=>e.type==='ring'&&e.at<.65));
 assert.equal(actTwoOpeningFrame(call,.3).notification,false);
 assert.equal(actTwoOpeningFrame(call,.7).notification,true);
 assert.ok(actTwoOpeningHTML().includes('まだ話は<br>終わっていない'));
 assert.ok(actTwoOpeningHTML().includes('入居者募集'));
 assert.ok(!shots.some(s=>s.shot==='collapse'));
 assert.equal(shots.find(s=>s.shot==='chase').pose,undefined);
 assert.equal(shots[call].pose,undefined);
 assert.ok(shots.every(s=>!s.pose));
 assert.ok(!/luna-film-standing|luna-film-device|luna-film-message/.test(actTwoOpeningHTML()));
 assert.equal(actTwoOpeningFrame(call,4.7).notification,false);
 assert.ok(actTwoOpeningHTML().includes('luna-film-phone-ui'));
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
 assert.match(app,/type==='act2-opening'\)\{showActTwoOpening\(\)/);
 assert.match(app,/\['act-two-opening','luna-motion'\]\.includes\(previewType\)/);
 assert.ok(!/startLunaMotion|lunaMotionHTML/.test(app));
});

test('rebuilt escape and phone shots use composed artwork and settle before listening',()=>{
 const firstBuilding=shots.findIndex(s=>s.person);
 assert.ok(shots.slice(0,firstBuilding).every(s=>!s.image.includes('luna-flight')&&!s.image.includes('courtyard')));
 const chase=shots.findIndex(s=>s.shot==='chase'),listen=chase+1;
 assert.notEqual(shots[chase].image,shots[listen].image);
 assert.ok(shots.slice(chase,chase+4).every(s=>/-v2\.png$/.test(s.image)));
 assert.equal(actTwoOpeningFrame(chase,shots[chase].duration).rig,actTwoOpeningFrame(listen,0).rig);
 assert.ok(!shots.some(s=>s.shot==='blind'));
});
test('dismiss blacks out directly into the rental notice',()=>{
 const dismiss=shots.findIndex(s=>s.shot==='dismiss'),collapse=dismiss+1;
 assert.equal(shots[dismiss].image,'assets/events/luna-dismiss-v2.png');
 assert.notEqual(shots[dismiss].image,shots[dismiss-1].image);
 assert.deepEqual(shots[dismiss].from,shots[dismiss].to);
 assert.equal(shots[dismiss].cues.length,1);
 assert.equal(shots[dismiss].cues[0].text,'……あたし、そんなに悪いことしたかな……。');
 assert.ok(shots[dismiss].cues[0].end<shots[dismiss].duration);
 assert.equal(actTwoOpeningFrame(dismiss,shots[dismiss].duration-.7).black,0);
 assert.ok(actTwoOpeningFrame(dismiss,shots[dismiss].duration-.4).black>0);
 assert.equal(actTwoOpeningFrame(dismiss,shots[dismiss].duration).black,1);
 assert.equal(actTwoOpeningFrame(collapse,0).black,0);
 assert.deepEqual(shots.slice(collapse).map(s=>[s.shot,s.image,s.events.map(e=>e.type).join(','),s.cues.map(c=>c.id).join(',')]),[
  ['notice','assets/events/luna-rental-insert.png','','vacancy'],
  ['reveal','assets/events/luna-courtyard-plate.png','','shelter'],
  ['out','assets/events/luna-courtyard-plate.png','','']
 ]);
 assert.equal(shots[collapse].shot,'notice');
});

test('opening voice mix moderates Luna loudness without changing normal conversations',()=>{
 const cues=shots.flatMap(shot=>shot.cues);
 assert.equal(cues.length,6);
 assert.ok(cues.every(cue=>cue.voiceGain>0&&cue.voiceGain<=0.65));
 assert.equal(cues.find(cue=>cue.id==='persistent').voiceGain,0.55);
 assert.equal(cues.find(cue=>cue.id==='breath').voiceGain,0.58);
});

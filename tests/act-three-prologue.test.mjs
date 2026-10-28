import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {ACT_THREE_SHOTS,actThreeFrame,actThreeTitleFrame,actThreeHTML} from '../src/act-three-prologue.js';
import {rewindTransitionHTML,rewindBeat} from '../src/rewind-transition.js';
import {storyScreenHTML} from '../src/story-screens.js';
import {eventStageHTML} from '../src/event-stage.js';
const expected=[
 ['announcer','緊急速報です！ 各地で原因不明の暴動が発生！'],['announcer','感染は世界各国に拡大し、政府は――'],
 ['cat','まだ来るニャ！！'],['hostess','多すぎるって！！'],['manager','下がってろ！！'],['manager','……弾切れか'],
 ['cat','減ってないニャ！！'],['hostess','もう無理！！'],['manager','モク、ルナ。裏から行け'],['hostess','大家さんは！？'],
 ['manager','俺が止める'],['cat','無茶だニャ！！'],['manager','いいから行け！！'],['hostess','大家さん！！']
];
test('chapter three plays exactly the approved dialogue and nine distinct event CGs',()=>{
 assert.deepEqual(ACT_THREE_SHOTS.flatMap(s=>s.cues.map(c=>[c.speaker,c.text])),expected);
 const images=ACT_THREE_SHOTS.filter(s=>s.image);assert.equal(new Set(images.map(s=>s.image)).size,9);
 for(const shot of images)assert.ok(existsSync(shot.image),shot.image);
 for(const shot of ACT_THREE_SHOTS)for(const cue of shot.cues){assert.ok(cue.at>=0&&cue.end<=shot.duration);const html=eventStageHTML({detail:cue.text,lines:[cue],cast:[]},[],0,0,{hideCharacters:true,cinematic:true});assert.ok(html.includes(cue.text));assert.ok(!html.includes('stage-character'));}
 assert.ok(!/stage-character|canvas|data-choice|BAD END/.test(actThreeHTML()));
});
test('last cry cuts straight to charge, followed by whiteout and a silent reused clock',()=>{
 const knife=ACT_THREE_SHOTS.findIndex(s=>s.id==='knife');assert.equal(ACT_THREE_SHOTS[knife].cues.at(-1).end,ACT_THREE_SHOTS[knife].duration);
 assert.deepEqual(ACT_THREE_SHOTS.slice(knife).map(s=>s.id),['knife','charge','white']);
 assert.equal(actThreeFrame(9,0).white,1);
 const html=rewindTransitionHTML('',1,true,3,true);assert.match(html,/data-rewind-phase="clock"/);assert.ok(!html.includes('fire-cinematic'));assert.match(html,/<p class="rewind-voice" aria-live="polite"><\/p>/);
 assert.equal(storyScreenHTML(html),html);
 // Existing timing and speech are unchanged for previous acts.
 assert.equal(rewindBeat(0,1,true,2).phase,'dark');assert.equal(rewindBeat(0,1,false,1).text,'嘘だろ……。');
});
test('camera impulses and reduced motion are bounded; title finishes after its fade',()=>{
 assert.ok(actThreeFrame(1,.02).flash>0);assert.equal(actThreeFrame(2,1).flash,0);
 for(let i=0;i<ACT_THREE_SHOTS.length;i++){const a=actThreeFrame(i,0,true),b=actThreeFrame(i,1,true);assert.equal(a.transform,b.transform);assert.equal(a.rig,'none');assert.equal(a.flash,0);}
 assert.equal(actThreeTitleFrame(0).number,0);assert.equal(actThreeTitleFrame(1.5).title,0);assert.equal(actThreeTitleFrame(3).title,1);assert.equal(actThreeTitleFrame(5).black,0);assert.equal(actThreeTitleFrame(7).black,1);assert.equal(actThreeTitleFrame(7).finished,true);
});
test('story entry, preview, debug and Continue share the same implementation',()=>{
 const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 assert.match(app,/data-act2-finish'\)\)showNextChapter\(\)/);assert.match(app,/if\(state.actThree\)\{showActThree\(\);return;/);
 assert.match(app,/clockOnly:true/);assert.match(app,/data-debug-act3/);assert.match(app,/actThreePreview\?'feral-act-three-preview-v1'/);
});

test('title boom plays once at title reveal and obeys sound settings and visibility',async()=>{
 const {createActThreeTitleSound,ACT_THREE_TITLE_SOUND}=await import('../src/act-three-prologue.js');
 const audio={paused:true,volume:1,playCount:0,play(){this.paused=false;this.playCount++;return Promise.resolve();},pause(){this.paused=true;},removeAttribute(){},load(){}};
 const saved=globalThis.document;globalThis.document={hidden:false};
 try{
  const sound=createActThreeTitleSound({enabled:true,volume:.35},null,()=>audio);assert.equal(audio.src,ACT_THREE_TITLE_SOUND);
  sound.play();sound.play();assert.equal(audio.playCount,1);assert.equal(audio.volume,.35);
  document.hidden=true;sound.visibility();assert.equal(audio.paused,true);document.hidden=false;sound.visibility();assert.equal(audio.playCount,2);
  sound.stop();assert.equal(audio.paused,true);sound.visibility();assert.equal(audio.playCount,2);
  const muted=createActThreeTitleSound({enabled:false,volume:1},null,()=>audio);muted.play();assert.equal(audio.playCount,2);muted.stop();
  const code=readFileSync(new URL('../src/act-three-prologue.js',import.meta.url),'utf8');assert.match(code,/t>=1\.7&&!hit\)\{hit=true;sound\.play\(\)/);
 }finally{globalThis.document=saved;}
});

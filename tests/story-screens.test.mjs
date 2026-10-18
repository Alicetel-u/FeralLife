import test from 'node:test';
import assert from 'node:assert/strict';
import {storyScreenHTML} from '../src/story-screens.js';
import {fireEndingHTML} from '../src/fire-ending.js';
import {debtEndingHTML} from '../src/debt-ending.js';
import {rewindTransitionHTML} from '../src/rewind-transition.js';
import {troubleAvoidedHTML} from '../src/trouble-victory.js';
import {stalkerPrefaceHTML} from '../src/first-stalker-stage.js';

test('all chapter and result screens retain their original actions and copy inside the new framing',()=>{
 for(const [type,kind] of [['graphic-title','title'],['act-title','chapter'],['act-burn','bad'],['act-clear','clear'],['act-intermission','intermission']]){
  const original=`<section class="act-screen ${type}" data-chapter="2"><h2 id="modal-title">見出し</h2><button data-act2-start>第二幕を始める</button></section>`;
  const html=storyScreenHTML(original);
  assert.ok(html.includes(`showcase-${kind}`));assert.ok(html.includes('CHAPTER / 02')||kind!=='chapter');
  assert.ok(html.includes('<h2 id="modal-title">見出し</h2><button data-act2-start>第二幕を始める</button>'));
  assert.equal(storyScreenHTML(html),html,'framing is never duplicated');
  assert.equal((html.match(/id="modal-title"/g)||[]).length,1);
 }
});

test('fire, sale, seizure and rewind keep cinematic controls and their own scenes',()=>{
 const samples=[fireEndingHTML('ash-trash'),debtEndingHTML('bag-return'),debtEndingHTML('contract-sign'),rewindTransitionHTML('bag-guarantee',1,true,2)];
 for(const original of samples){
  const html=storyScreenHTML(original);
  assert.ok(html.includes('showcase-screen'));
  for(const action of original.match(/data-(?:fire-finish|debt-finish|rewind-skip)/g)||[])assert.ok(html.includes(action));
  assert.ok(html.includes(original.slice(original.indexOf('>')+1)));
 }
});

test('trouble avoided, ordinary dialogue and the approved horror interlude stay untouched',()=>{
 const samples=[troubleAvoidedHTML(1),troubleAvoidedHTML(2),stalkerPrefaceHTML(),'<div class="event-stage">会話</div>','<section class="act-screen luna-film" data-act2-opening>映像</section>'];
 for(const html of samples)assert.equal(storyScreenHTML(html),html);
});

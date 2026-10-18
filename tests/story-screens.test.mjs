import {readFileSync} from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {storyScreenHTML} from '../src/story-screens.js';
import {fireEndingHTML} from '../src/fire-ending.js';
import {debtEndingHTML} from '../src/debt-ending.js';
import {rewindTransitionHTML} from '../src/rewind-transition.js';
import {troubleAvoidedHTML} from '../src/trouble-victory.js';
import {stalkerPrefaceHTML} from '../src/first-stalker-stage.js';

test('all chapter and result screens retain their original actions and copy inside the new framing',()=>{
 for(const [type,kind] of [['act-title','chapter'],['act-burn','bad'],['act-clear','clear'],['act-intermission','intermission']]){
  const original=`<section class="act-screen ${type}" data-chapter="2"><h2 id="modal-title">見出し</h2><button data-act2-start>第二幕を始める</button></section>`;
  const html=storyScreenHTML(original);
  assert.ok(html.includes(`showcase-${kind}`));
  assert.doesNotMatch(html,/showcase-mast|showcase-footer|THE APARTMENT \/|KEMONOSOU|CHAPTER \/ 02/);
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
  assert.doesNotMatch(html,/showcase-mast|showcase-footer|THE APARTMENT \//);
  for(const action of original.match(/data-(?:fire-finish|debt-finish|rewind-skip)/g)||[])assert.ok(html.includes(action));
  assert.ok(html.includes(original.slice(original.indexOf('>')+1)));
 }
});

test('trouble avoided, ordinary dialogue and the approved horror interlude stay untouched',()=>{
 const samples=[fireEndingHTML('ash-trash',{firstTragedy:true}),'<section class="act-screen game-title graphic-title"><button data-game-new>はじめから</button><button data-title-help>遊び方</button></section>',troubleAvoidedHTML(1),troubleAvoidedHTML(2),stalkerPrefaceHTML(),'<div class="event-stage">会話</div>','<section class="act-screen luna-film" data-act2-opening>映像</section>'];
 for(const html of samples)assert.equal(storyScreenHTML(html),html);
});


test('rewind clock stays above the blackout and below the restored scene',()=>{
 const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
 const layer=selector=>{
  const rules=[...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(m=>m[1].trim()===selector);
  return Number(rules.at(-1)?.[2].match(/z-index:\s*(\d+)/)?.[1]);
 };
 const dark=layer('.rewind-dark'),clock=layer('.showcase-rewind .rewind-clock'),restored=layer('.rewind-restored-room');
 assert.ok(clock>dark,'clock must be visible above the opaque blackout');
 assert.ok(clock<restored,'restored scenery must cover the clock on return');
});


test('fire captions retain one centered layout instead of mixing panel and fade coordinates',()=>{
 const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
 assert.doesNotMatch(css,/\.showcase-fire \.fire-narration\s*\{/);
 assert.match(css,/\.fire-cinematic>\.fire-narration\{[^}]*top:50%;left:50%;right:auto;bottom:auto/);
 const html=storyScreenHTML(fireEndingHTML('ash-trash',{firstTragedy:true}));
 assert.doesNotMatch(html,/showcase-|>BURN</);
 assert.match(html,/first-fire-exterior\.png/);
});

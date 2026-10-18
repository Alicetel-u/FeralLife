import test from 'node:test';
import assert from 'node:assert/strict';
import {fireEndingPhase,fireEndingHTML} from '../src/fire-ending.js';

test('fire moves from room to building to ruins at the cinematic boundaries',()=>{
  for(const [at,phase] of [[0,'room'],[4.99,'room'],[5,'building'],[10.99,'building'],[11,'ruins'],[15,'ruins']]) assert.equal(fireEndingPhase(at),phase);
});

test('first tragedy continues from the outdoor fire plate without returning to a room shot',()=>{
 const html=fireEndingHTML('ash-trash',{firstTragedy:true});
 assert.match(html,/first-tragedy-fire/);assert.match(html,/data-fire-phase="building"/);
 assert.match(html,/first-fire-exterior.png/);
 assert.match(html,/さっきまで普通に話してた/);
 assert.doesNotMatch(fireEndingHTML('ash-trash'),/first-tragedy-fire/);
});

test('fire presents quiet narration without website-style headings or panels',()=>{
  for(const failure of ['ash-laundry','ash-wind','dinner-turbo','dinner-show']) {
    const html=fireEndingHTML(failure);
    assert.match(html,/class="fire-narration"/);
    assert.doesNotMatch(html,/fire-caption|<small>|<h2[^>]*>消し忘れ/);
    assert.doesNotMatch(html,/data-fire-finish|クリックで次へ|<button/);
    assert.match(html,/assets\/rooms\/cat\/interior-illustrated-v1.png/);
    assert.match(html,/assets\/apartments.png/);
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { EVENT_EXPRESSIONS, EVENT_ART } from '../src/character-art.js';
import { eventEmotion, eventStageHTML, EVENT_EMOTION_NAMES } from '../src/event-stage.js';

test('residents retain seven emotion mappings and approved distinct character art',async()=>{
  assert.equal(Object.keys(EVENT_EXPRESSIONS).length,6);
  const hashes=[];
  for(const [character,states] of Object.entries(EVENT_EXPRESSIONS)) {
    assert.deepEqual(Object.keys(states),Object.keys(EVENT_EMOTION_NAMES));
    assert.equal(new Set(Object.values(states)).size,7);
    if(character==='hostess')assert.equal(states.neutral,EVENT_ART.hostess);
    for(const src of Object.values(states)) {
      const data=await readFile(new URL('../'+src,import.meta.url));
      assert.equal(data.subarray(1,4).toString(),'PNG');
      // PNG IHDR color type 6 carries an actual alpha channel.
      assert.equal(data[25],6,src+' must carry RGBA transparency');
      assert.ok(data.readUInt32BE(16)>=512&&data.readUInt32BE(20)>=512,src+' must have sufficient resolution');
      hashes.push(createHash('sha256').update(data).digest('hex'));
    }
  }
  assert.equal(new Set(hashes).size,42,'Six sets of seven distinct character expression portraits');
});
test('directed story reactions override ambiguous text; explicit emotion wins',()=>{
  const line={speaker:'fox',text:'近くない方がいいよ。'};
  assert.equal(eventEmotion(line,{caseId:'roomshare',lines:[null,null,null,line]}),'shy');
  assert.equal(eventEmotion({...line,emotion:'happy'}),'happy');
  assert.equal(eventEmotion({text:'ごめんね'}),'sad');
  assert.equal(eventEmotion({text:'ありがとう'}),'happy');
  assert.equal(eventEmotion({text:'まさか'}),'surprised');
  assert.equal(eventEmotion({text:'眠い'}),'tired');
});
test('listener holds their last reaction through manager lines and narration',()=>{
  const event={detail:'相談',cast:['cat','sister'],lines:[{speaker:'cat',text:'待って',emotion:'angry'},{speaker:'sister',text:'兄',emotion:'sad'},{speaker:'manager',text:'どうした'}]};
  const html=eventStageHTML(event,[],3);
  assert.match(html,/left[^>]+data-emotion="angry"/);
  assert.match(html,/right[^>]+data-emotion="sad"/);
  assert.match(html,/cat-angry.png/);
  assert.match(html,/sister-sad.png/);
  assert.doesNotMatch(html,/data-character="manager"/);
});

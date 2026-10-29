import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { EVENT_EXPRESSIONS, EVENT_ART } from '../src/character-art.js';
import { eventEmotion, eventStageHTML, EVENT_EMOTION_NAMES } from '../src/event-stage.js';

test('residents retain seven emotion mappings and approved distinct character art',async()=>{
  const {rabbit,...originalResidents}=EVENT_EXPRESSIONS;
  assert.equal(Object.keys(originalResidents).length,6);
  assert.ok(rabbit,'Mimi has her dedicated portraits');
  const hashes=[];
  for(const [character,states] of Object.entries(originalResidents)) {
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
test('listeners retain their most recent expressions while landlord speaks',()=>{
  const event={detail:'相談',cast:['cat','sister'],lines:[{speaker:'cat',text:'待って',emotion:'angry'},{speaker:'sister',text:'兄',emotion:'sad'},{speaker:'manager',text:'どうした'}]};
  const html=eventStageHTML(event,[],3);
  assert.match(html,/left[^>]+data-emotion="angry"/);
  assert.match(html,/right[^>]+data-emotion="sad"/);
  assert.match(html,/cat-angry.png/);
  assert.match(html,/sister-sad.png/);
  assert.doesNotMatch(html,/data-character="manager"/);
});


test('Mimi uses dedicated transparent bust portraits in her approved introduction',async()=>{
 assert.deepEqual(Object.keys(EVENT_EXPRESSIONS.rabbit),['neutral','happy','sad','surprised']);
 const paths=new Set(Object.values(EVENT_EXPRESSIONS.rabbit));assert.equal(paths.size,3);
 for(const src of paths){const data=await readFile(new URL('../'+src,import.meta.url));assert.equal(data[25],6);assert.ok(data.readUInt32BE(16)>=512&&data.readUInt32BE(20)>=512);}
 const line={speaker:'rabbit',text:'……ありがとう！',emotion:'happy'},html=eventStageHTML({detail:line.text,lines:[line],cast:['rabbit']},[],0);
 assert.match(html,/mimi-happy.png/);assert.match(html,/data-character="rabbit"/);
});

import test from 'node:test';import assert from 'node:assert/strict';
import {SPEAKER_COLORS,speakerColors,speakerColorStyle} from '../src/speaker-colors.js';
import {CHARACTERS} from '../src/simulation.js';
import {eventStageHTML} from '../src/event-stage.js';
const lum=hex=>{const v=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return v[0]*.2126+v[1]*.7152+v[2]*.0722;};
const contrast=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
test('every resident has distinct legible colors on dark panels and light bubbles',()=>{
 for(const key of Object.keys(CHARACTERS))assert.ok(SPEAKER_COLORS[key],key);
 assert.equal(new Set(Object.values(SPEAKER_COLORS).map(x=>x[0])).size,Object.keys(SPEAKER_COLORS).length);
 for(const [key,[night,day]] of Object.entries(SPEAKER_COLORS)){assert.ok(contrast(night,'#1c1520')>=4.5,key+' night');assert.ok(contrast(day,'#faf5e9')>=4.5,key+' day');}
});
test('inner and memory voices override the speaker without altering dialogue',()=>{
 assert.deepEqual(speakerColors({speaker:'manager',innerVoice:true}),SPEAKER_COLORS.inner);
 assert.deepEqual(speakerColors({speaker:'manager',memoryVoice:true}),SPEAKER_COLORS.memory);
 assert.deepEqual(speakerColors({speaker:'unknown'}),SPEAKER_COLORS.narrator);
 const event={title:'test',detail:'台詞',cast:['cat'],lines:[{speaker:'cat',text:'台詞'}]};
 const html=eventStageHTML(event,[],0);assert.ok(html.includes(speakerColorStyle({speaker:'cat'})));assert.match(html,/台詞/);
});

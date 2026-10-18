import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame} from '../src/simulation.js';
import {ACT_TWO_EVENTS,beginActTwo,advanceActTwo} from '../src/act-two.js';
import {eventConversation,eventStageHTML} from '../src/event-stage.js';

test('both Act 2 men remain offscreen; their lines show Luna alone across every branch',()=>{
 for(const [scene,definition] of Object.entries(ACT_TWO_EVENTS))for(const lines of [definition.lines,...definition.choices.map(c=>c.lines)]){
  const event={actScene:lines===definition.lines?scene:'reply',cast:['hostess','cat'],lines,detail:lines[0].text};
  for(const [index,line] of eventConversation(event).entries())if(line.text.startsWith('男「')){
   const html=eventStageHTML(event,[],index);
   assert.ok(html.includes('data-character="hostess"'),line.text);
   assert.ok(!html.includes('data-character="cat"'),line.text);
   assert.equal((html.match(/<figure /g)||[]).length,1);
   assert.ok(html.includes('speaker-name')&&html.includes('mobile-dialogue-tap'));
  }
 }
});

for(const attempt of [1,2])test(`Moku appears only on her real entrance, attempt ${attempt}`,()=>{
 const state=beginActTwo(createGame(42));Object.assign(state.actOne,{started:true,prologuePending:false,attempt});advanceActTwo(state,100);
 const event=state.events.find(e=>e.id===state.actOne.pending.eventId),lines=eventConversation(event);
 const entrance=lines.findIndex(l=>l.speaker==='cat'||/モクが(?:現れる|男の前に歩み出た)/.test(l.text));
 for(let i=0;i<entrance;i++)assert.ok(!eventStageHTML(event,[],i).includes('data-character="cat"'));
 assert.ok(eventStageHTML(event,[],lines.findIndex(l=>l.speaker==='cat')).includes('data-character="cat"'));
});

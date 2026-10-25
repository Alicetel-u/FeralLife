import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame} from '../src/simulation.js';
import {ACT_TWO_EVENTS,beginActTwo,advanceActTwo} from '../src/act-two.js';
import {eventConversation,eventStageHTML} from '../src/event-stage.js';

test('unseen men never get a substitute portrait; residents remain after joining the scene',()=>{
 for(const [scene,definition] of Object.entries(ACT_TWO_EVENTS))for(const lines of [definition.lines,...definition.choices.map(c=>c.lines)]){
  const event={actScene:lines===definition.lines?scene:'reply',cast:['hostess','cat'],lines,detail:lines[0].text};
  const entrance=eventConversation(event).findIndex(l=>l.speaker==='cat'||/モクが(?:現れる|男の前に歩み出た)/.test(l.text));
  for(const [index,line] of eventConversation(event).entries())if(line.text.startsWith('男「')){
   const html=eventStageHTML(event,[],index);
   assert.ok(html.includes('data-character="hostess"'),line.text);
   const joined=event.actScene==='reply'||entrance>=0&&index>=entrance;
   assert.equal(html.includes('data-character="cat"'),joined,line.text);
   assert.equal((html.match(/<figure /g)||[]).length,joined?2:1);
   assert.ok(html.includes('speaker-name')&&html.includes('mobile-dialogue-tap'));
  }
 }
});

for(const attempt of [1,2])test(`Moku appears only on her real entrance, attempt ${attempt}`,()=>{
 const state=beginActTwo(createGame(42));Object.assign(state.actOne,{started:true,prologuePending:false,attempt});advanceActTwo(state,100);
 const event=state.events.find(e=>e.id===state.actOne.pending.eventId),lines=eventConversation(event);
 const entrance=lines.findIndex(l=>l.speaker==='cat'||/モクが(?:現れる|男の前に歩み出た)/.test(l.text));
 for(let i=0;i<entrance;i++)assert.ok(!eventStageHTML(event,[],i).includes('data-character="cat"'));
 for(let i=entrance;i<lines.length;i++)assert.equal(eventStageHTML(event,[],i).includes('data-character="cat"'),!['manager','hostess'].includes(lines[i].speaker),lines[i].text);
 if(attempt===1)assert.ok(lines.slice(entrance).some(l=>l.text.startsWith('男「')),'checks the man speaking after Moku enters');
});

import test from 'node:test';import assert from 'node:assert/strict';
import {eventStageHTML} from '../src/event-stage.js';
test('whiteout uses a centered text stage without characters or a dialogue window',()=>{
 for(const line of [{speaker:'mystery',text:'記憶の声',flashbackEffect:'whiteout'},{speaker:'manager',text:'過去の声',memoryVoice:true,flashbackEffect:'whiteout'}]){
 const html=eventStageHTML({detail:line.text,lines:[line],cast:['cat']},[],0);
 assert.match(html,/memory-whiteout/);assert.match(html,/memory-text/);assert.ok(html.includes(line.text));assert.doesNotMatch(html,/stage-bubble|stage-character|stage-page/);assert.match(html,/aria-live="polite"/);
 if(line.memoryVoice)assert.match(html,/大家（過去の声）/);
 }
 const normal=eventStageHTML({detail:'今',lines:[{speaker:'cat',text:'今'}],cast:['cat']},[],0);assert.match(normal,/stage-bubble/);assert.doesNotMatch(normal,/memory-whiteout/);
});

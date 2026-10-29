import test from 'node:test';
import assert from 'node:assert/strict';
import {ACT_ONE_EVENTS} from '../src/act-one.js';
import {ACT_TWO_EVENTS} from '../src/act-two.js';
import {eventConversation,eventStageHTML,eventPortraitVisible} from '../src/event-stage.js';
import {duelStageHTML} from '../src/act-two-duel-stage.js';
const portraits=html=>[...html.matchAll(/<figure[^>]*data-character="([^"]+)"/g)].map(m=>m[1]);

test('every normal trouble and reply keeps listeners on stage when the landlord speaks',()=>{
 let checked=0,landlordLines=0,twoResidentLines=0;
 for(const definitions of [ACT_ONE_EVENTS,ACT_TWO_EVENTS])for(const [scene,definition] of Object.entries(definitions)){
  for(const lines of [definition.lines,...definition.choices.map(c=>c.lines)].filter(Array.isArray)){
   const event=JSON.parse(JSON.stringify({actScene:lines===definition.lines?scene:'reply',cast:['hostess','cat'],detail:lines[0]?.text,lines}));
   for(const [index,line] of eventConversation(event).entries()){
    if(!['manager','cat','hostess'].includes(line.speaker)||line.flashbackEffect==='whiteout')continue;
    const html=eventStageHTML(event,[],index),visible=portraits(html);
    assert.ok(visible.includes('hostess'),scene+': Luna remains present for '+line.text);
    assert.ok(!visible.includes('manager'),scene+': landlord stays off camera');
    if(line.speaker==='manager'){assert.ok(visible.length>0,scene+': listeners may not disappear');landlordLines++;}
    if(event.actScene==='reply'){assert.deepEqual(visible,['hostess','cat'],scene+': all participants stay, including during landlord speech');twoResidentLines++;}
    assert.match(html,/stage-speaker/);assert.match(html,/mobile-dialogue-tap/);checked++;
   }
  }
 }
 assert.ok(checked>100&&landlordLines>10&&twoResidentLines>20);
});

test('duel prelude retains two people on all pages, even during lengthy landlord speech',()=>{
 const lines=[{speaker:'cat',text:'大家！'},{speaker:'manager',text:'俺が話す。'.repeat(70)},{speaker:'hostess',text:'大家さん！'},{speaker:'manager',text:'待ってろ。'}];
 const event={duel:true,detail:lines[0].text,cast:['cat','hostess'],lines};
 for(const [index] of lines.entries())for(const page of [0,1,99]){
  const html=duelStageHTML(event,[],index,page);
  assert.deepEqual(portraits(html),['cat','hostess']);
  assert.match(html,/duel-opening-background/);
  assert.ok(!html.includes('data-character="manager"'));
 }
});

test('cinematic framing and actual empty-cast scenes still suppress portraits',()=>{
 const line={speaker:'manager',text:'下がってろ！'};
 const event={detail:line.text,lines:[line],cast:['hostess','cat']};
 assert.deepEqual(portraits(eventStageHTML(event,[],0)),['hostess','cat']);
 assert.deepEqual(portraits(eventStageHTML(event,[],0,0,{hideCharacters:true,cinematic:true})),[]);
 assert.deepEqual(portraits(eventStageHTML({...event,cast:[]},[],0)),[]);
 assert.equal(eventPortraitVisible('cat',line),true);
 assert.equal(eventPortraitVisible('cat',line,{hideCharacters:true}),false);
 assert.equal(eventPortraitVisible('manager',line),false);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {MANAGEMENT_CASES} from '../src/event-cases.js';
import {createGame,admit,addEvent,validateSave,CHARACTERS,ACTIONS} from '../src/simulation.js';
import {openManagementCase,resolveManagementCase,ensureManagement} from '../src/management.js';
import {eventEmotion,eventConversation,EVENT_EMOTION_NAMES} from '../src/event-stage.js';
import {mokuNya} from '../src/dialogue.js';

const residents=()=>{
  const s=createGame(18);
  for(const type of ['fox','hostess','sister','peko','ann']){s.pending=[type];admit(s,type);}
  return s;
};

test('all 72 answers immediately stage both residents reacting, with authored expressions',()=>{
  assert.equal(Object.keys(MANAGEMENT_CASES).length,24);
  for(const [id,c]of Object.entries(MANAGEMENT_CASES)){
    for(const choice of c.choices){
      const s=residents();
      assert.equal(openManagementCase(s,id,addEvent),true,id);
      const original=s.events.find(e=>e.id===s.management.pending.eventId);
      for(const l of original.lines)assert.ok(Object.hasOwn(EVENT_EMOTION_NAMES,l.emotion),id);
      const result=resolveManagementCase(s,original.id,choice.id,addEvent);
      assert.ok(result.stageOnly);
      assert.equal(result.lines[0].speaker,'manager');
      assert.equal(result.lines[0].text,choice.reply);
      assert.equal(eventConversation(result)[0].text,choice.reply,'No duplicate answer intro');
      for(const type of c.cast){
        const reaction=result.lines.find(l=>l.speaker===type);
        assert.ok(reaction,`${id}/${choice.id}/${type}: reaction must be in the immediate scene`);
        assert.ok(['angry','surprised','sad','tired'].includes(reaction.emotion),`${id}/${choice.id}: don't greet the insensitive answer with a smile`);
      }
      for(const l of result.lines){assert.ok(Object.hasOwn(EVENT_EMOTION_NAMES,l.emotion));assert.equal(eventEmotion(l,result),l.emotion);}
      assert.ok(result.lines.length>=6);
      assert.ok(validateSave(JSON.parse(JSON.stringify(s))),id+'/'+choice.id);
    }
  }
});
test('version two pending dialogue upgrades without charging or resetting play',()=>{
  const s=residents();openManagementCase(s,'quit_smoking',addEvent);
  const p=s.management.pending,e=s.events.find(e=>e.id===p.eventId);
  p.narrativeVersion=2;e.lines=[{speaker:'sister',text:'兄の旧台詞'}];
  const snapshot=JSON.stringify({funds:s.management.funds,hour:s.hour,decisions:s.management.decisions,residents:s.residents});
  ensureManagement(s);
  assert.equal(p.narrativeVersion,3);
  assert.ok(e.lines.some(l=>l.text.includes('お姉ちゃん')));
  assert.ok(e.lines.every(l=>Object.hasOwn(EVENT_EMOTION_NAMES,l.emotion)));
  assert.equal(JSON.stringify({funds:s.management.funds,hour:s.hour,decisions:s.management.decisions,residents:s.residents}),snapshot);
  assert.ok(validateSave(s));
});
test('Moku is Nemu’s elder sister throughout authored game text',async()=>{
  assert.match(CHARACTERS.sister.quote,/お姉ちゃん/);
  assert.match(CHARACTERS.sister.bio,/妹/);
  assert.match(ACTIONS.checkBrother.label,/姉/); // persisted action ID is retained.
  for(const name of ['event-cases','dialogue','simulation']){
    const source=await readFile(new URL('../src/'+name+'.js',import.meta.url),'utf8');
    assert.doesNotMatch(source,/お兄ちゃん|兄妹|兄には|兄の|俺/);
  }
  assert.equal(mokuNya('……'),'……');
  assert.equal(mokuNya('ありがとうニャ。'),'ありがとうニャ。');
});

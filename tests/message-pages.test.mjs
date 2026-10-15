import test from 'node:test';
import assert from 'node:assert/strict';
import {messagePages} from '../src/message-pages.js';
import {eventStageHTML} from '../src/event-stage.js';
import {ACT_TWO_EVENTS} from '../src/act-two.js';
import {EVENT_EXPRESSIONS} from '../src/character-art.js';

test('all second-act messages retain every character across punctuation-aware pages',()=>{
 for(const event of Object.values(ACT_TWO_EVENTS))for(const line of [ ...event.lines,...event.choices.flatMap(c=>c.lines)]){
  const pages=messagePages(line.text);assert.equal(pages.join(''),line.text);
  for(const page of pages)assert.ok(Array.from(page).length<=55);
 }
 const text='まず荷物を確認する。次に、書類をよく読む。'.repeat(9);
 const pages=messagePages(text);assert.ok(pages.length>1);assert.match(pages[0],/[。！？、]$/);
 assert.equal(messagePages('短いセリフ。')[0],'短いセリフ。');
});
test('continuation pages retain speaker and expression while displaying only their own text',()=>{
 const text='長い手紙を読んでいます。'.repeat(10),event={detail:text,cast:['hostess'],lines:[{speaker:'hostess',emotion:'sad',text}]};
 const pages=messagePages(text);
 for(let i=0;i<pages.length;i++){
  const html=eventStageHTML(event,[],0,i);
  assert.ok(html.includes(`<p>${pages[i]}</p>`));assert.ok(html.includes(EVENT_EXPRESSIONS.hostess.sad));assert.match(html,/data-emotion="sad"/);
  assert.ok(html.includes(`${i+1} / ${pages.length}`));
 }
});

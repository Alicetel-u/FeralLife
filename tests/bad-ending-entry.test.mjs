import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {badEndingEntryPlan,badEndingEntryHTML,startBadEndingEntry} from '../src/bad-ending-entry.js';

test('BAD END entry styles match fire, stalker, absence, and duel outcomes',()=>{
 const expected={
  'ash-trash':'fire','ash-balcony':'fire','ash-freezer':'fire',
  'dinner-turbo':'fire','dinner-show':'fire',
  'bag-guarantee':'stalker','bag-return':'absence',
  'duel-yandere':'obsession','duel-domination':'submission'
 };
 for(const [failure,kind] of Object.entries(expected)){
  const plan=badEndingEntryPlan(failure),html=badEndingEntryHTML(failure);
  assert.equal(plan.kind,kind,failure);
  assert.ok(plan.hold>=900&&plan.veil>=750&&plan.linger>=800);
  assert.equal(plan.total,plan.hold+plan.veil+plan.linger);
  assert.ok(html.includes('data-kind="'+kind+'"'));
  assert.ok(html.includes('bad-entry-caption'));
 }
 assert.equal(badEndingEntryPlan('contract-eviction').kind,'debt');
});

test('the ending overlay waits for the last voice, then pauses with a hidden tab and swaps once',()=>{
 const node={isConnected:true,dataset:{},style:{setProperty(){}}};
 const host={innerHTML:'',get firstElementChild(){return node;},remove(){node.isConnected=false;}};
 const doc={hidden:false,createElement(){return host;}};
 const modal={ownerDocument:doc,append(element){assert.equal(element,host);}};
 let callback,frame=0,cancelled=0,swap=0,voice=true;
 const raf=next=>{callback=next;return ++frame;},cancel=()=>{cancelled++;};
 const stop=startBadEndingEntry(modal,'ash-trash',()=>{swap++;},{voiceBusy:()=>voice,raf,cancel});
 const advance=now=>callback(now);
 for(const now of [0,1000,1800])advance(now);
 assert.equal(swap,0,'the voice must finish before any transition clock progresses');
 voice=false;
 advance(1900);advance(2020);advance(2160);
 assert.equal(node.dataset.phase,'hold');
 doc.hidden=true;advance(3500);advance(5500);
 assert.equal(node.dataset.phase,'hold','the clock pauses while hidden');
 doc.hidden=false;
 for(let now=5600;now<14000&&swap===0;now+=120)advance(now);
 assert.equal(swap,1);
 assert.equal(node.dataset.phase,'reveal');
 for(let now=14000;now<17000&&node.isConnected;now+=120)advance(now);
 assert.equal(node.isConnected,false,'the overlay is removed after revealing the cinematic');
 assert.ok(cancelled>0);
 stop();
 assert.equal(swap,1);
});

test('BAD END entry is wired to the last dialogue rather than opening a result instantly',()=>{
 const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 assert.match(app,/startBadEndingEntry\(modal,failure/);
 assert.match(app,/function closeModal\(\) \{\s*if\(enterBadEnding\(\)\)return;/);
 assert.match(app,/characterVoice\.busy/);
 assert.match(app,/if\(enterBadEnding\(\)\)return;/);
 assert.match(app,/bad-entry-host/);
 assert.match(app,/function resetActState[\s\S]{0,120}stopBadEntry\(\)/);
});

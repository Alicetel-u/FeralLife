import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createGame} from '../src/simulation.js';
import {beginActTwo,advanceActTwo,answerActTwo,rewindActTwo} from '../src/act-two.js';
import {eventConversation,eventStageHTML} from '../src/event-stage.js';
import {isFirstStalkerReply,firstStalkerCut,firstStalkerStageHTML,needsStalkerPreface,stalkerPrefaceHTML,startStalkerPreface} from '../src/first-stalker-stage.js';
import {rewindBeat,rewindTransitionHTML} from '../src/rewind-transition.js';
import {VOICE_MANIFEST} from '../src/voice-manifest.js';
import {voiceLineKey} from '../src/voice-policy.js';
function tragedy(){const state=beginActTwo(createGame(42));Object.assign(state.actOne,{started:true,titlePending:false,prologuePending:false});advanceActTwo(state,100);return {state,event:answerActTwo(state,state.actOne.pending.eventId,'guarantee')};}
test('first night uses directed backgrounds and the original window without showing Luna',()=>{
 const {state,event}=tragedy(),lines=eventConversation(event);assert.ok(isFirstStalkerReply(event));
 assert.deepEqual([...new Set(lines.map((_,i)=>firstStalkerCut(lines,i)))],['farewell','corridor','door','room','silence','plea','behind','impact','blackout']);
 for(let i=0;i<lines.length;i++){
  const cut=firstStalkerCut(lines,i),html=firstStalkerStageHTML(event,[],i);
  assert.ok(html.includes('class="speaker-name"')&&html.includes('mobile-dialogue-tap'));
  assert.ok(!/stalker-clock|stalker-cinematic-copy|memory-whiteout/.test(html));
  if(cut!=='farewell'){assert.ok(html.includes('first-stalker-stage'));assert.ok(!html.includes('stage-character'));}
  else assert.equal(html,eventStageHTML(event,[],i));
  if(['corridor','door'].includes(cut))assert.ok(html.includes('first-stalker-door.png'));
  if(['room','silence','plea','behind'].includes(cut))assert.ok(html.includes('first-stalker-room.png'));
  if(lines[i].speaker==='manager')assert.ok(VOICE_MANIFEST[voiceLineKey({...lines[i],voiceChapter:2})],'existing voice retained: '+lines[i].text);
 }
 assert.ok(!/血だらけ|倒れていた|ルナは動かない/.test(JSON.stringify(lines)));
 const next=rewindActTwo(state);assert.equal(next.actOne.attempt,2);assert.equal(next.hour,66);
 assert.ok(!/血だらけ|倒れていた/.test(JSON.stringify(eventConversation(next.events.find(e=>e.actScene==='act2-rewind')))));
});
test('legacy saves keep cursor positions but lose explicit narration and the duplicate clock',()=>{
 const {event}=tragedy(),legacy=structuredClone(event),at=legacy.lines.findIndex(l=>l.text.includes('足を止めた'));
 legacy.lines[at].text='部屋の奥で、ルナが血だらけになって倒れていた。';
 legacy.lines.at(-2).text='暗闇の中で時計の針が逆回転を始める。';legacy.lines.at(-2).tragedyEffect='clock';
 legacy.lines.at(-1).flashbackEffect='whiteout';
 const before=JSON.stringify(legacy),lines=eventConversation(legacy);
 assert.equal(lines.length,eventConversation(event).length);
 assert.ok(lines.some(l=>l.text.includes('足を止めた')));assert.ok(!lines.some(l=>l.tragedyEffect==='clock'||l.flashbackEffect==='whiteout'));
 assert.ok(!firstStalkerStageHTML(legacy,[],lines.length-1).includes('rewind-clock'));
 assert.equal(JSON.stringify(legacy),before);
});
test('night ending enters the single existing rewind directly without fire narration',()=>{
 for(const t of [0,1,2,3,5])assert.ok(!/煙|火|吸い/.test(rewindBeat(t,1,true,2).text));
 assert.match(rewindBeat(3,1,true,1).text,/煙/);
 const html=rewindTransitionHTML('bag-guarantee',1,true,2);assert.ok(html.includes('data-chapter="2"'));assert.equal((html.match(/<svg class="rewind-clock-dial"/g)||[]).length,1);
 const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 assert.match(app,/if\(a.failure==='bag-guarantee'&&a.attempt===1\)\{\s*beginRewind\(true\);return;/);
});


test('the white preface appears only when entering the first forced night, including SKIP',()=>{
 const {event}=tragedy(),lines=eventConversation(event),night=lines.findIndex(l=>l.text.startsWith('深夜。'));
 assert.equal(needsStalkerPreface(event,{id:event.id,index:night-1},night),true);
 assert.equal(needsStalkerPreface(event,{id:event.id,index:0},lines.length-1),true);
 assert.equal(needsStalkerPreface(event,{id:event.id,index:night},night+1),false);
 assert.equal(needsStalkerPreface(event,{id:event.id,index:night+1},night),false);
 assert.equal(needsStalkerPreface({...event,actScene:'bag'},{id:event.id,index:0},night),false);
 const html=stalkerPrefaceHTML();assert.ok(html.includes('あの何気ないひと言が、<br><span>取り返しのつかない夜につながるなんて。'));
 assert.ok(!html.includes('<img'));
 const discovery=lines.findIndex(l=>l.text.includes('足を止めた'));
 assert.ok(firstStalkerStageHTML(event,[],discovery).includes('data-discovery="true"'));
 assert.ok(firstStalkerStageHTML(event,[],discovery).includes('first-stalker-ink'));
 assert.ok(!firstStalkerStageHTML(event,[],discovery+1).includes('data-discovery="true"'));
});

test('preface holds long enough to read, pauses while hidden, and cancels without advancing',async()=>{
 let resolve,reject,visibility,click,completed=0;
 const classes=new Set(),doc={hidden:false,addEventListener:(t,fn)=>visibility=fn,removeEventListener:()=>visibility=null};
 const button={addEventListener:(t,fn)=>click=fn,removeEventListener:()=>click=null};
 const clock={currentTime:0,finished:new Promise((yes,no)=>{resolve=yes;reject=no;}),pause(){this.paused=true;},play(){this.paused=false;},cancel(){}};
 const root={ownerDocument:doc,classList:{toggle:(name,value)=>value?classes.add(name):classes.delete(name)},querySelector:()=>button,animate:(frames,options)=>{assert.equal(options.duration,4800);return clock;}};
 const stop=startStalkerPreface(root,()=>completed++);
 click();assert.equal(completed,0);
 doc.hidden=true;visibility();assert.equal(clock.paused,true);assert.ok(classes.has('preface-paused'));
 doc.hidden=false;visibility();assert.equal(clock.paused,false);
 clock.currentTime=1600;click();assert.equal(completed,0);
 clock.currentTime=2999;click();assert.equal(completed,0);
 clock.currentTime=3000;click();resolve();await Promise.resolve();assert.equal(completed,1);assert.equal(visibility,null);assert.equal(click,null);stop();
 clock.finished=new Promise((yes,no)=>{reject=no;});const cancel=startStalkerPreface(root,()=>completed++);cancel();reject(Error('cancelled'));await Promise.resolve();assert.equal(completed,1);
});


test('second-act rewind keeps tense Luna portraits and the apartment exterior',()=>{
 const {state}=tragedy(),next=rewindActTwo(state),event=next.events.find(e=>e.actScene==='act2-rewind');
 const lines=eventConversation(event);
 for(let i=0;i<lines.length;i++){
  const html=eventStageHTML(event,[],i);
  assert.match(html,/data-character="hostess"/);
  assert.ok(!html.includes('fullbody-art'));
  assert.ok(!/data-emotion="(?:happy|shy)" data-character="hostess"/.test(html));
 }
 assert.match(eventStageHTML(event,[],0),/data-emotion="sad" data-character="hostess"/);
 for(const [text,emotion] of [['……大家さん？ 大丈夫？','sad'],['……生きてる……。','surprised'],['男「さっきから無視してんじゃねえよ！」','angry'],['男が大家に詰め寄る。','sad']]){
  const index=lines.findIndex(line=>line.text===text);assert.ok(index>=0);
  const html=eventStageHTML(event,[],index);
  assert.ok(html.includes(`data-emotion="${emotion}" data-character="hostess"`));
 }
 const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 assert.ok(app.includes("['bag','act2-rewind'].includes(e.actScene)&&state.actOne?.chapter===2?'data-act-two-stalker-exterior'"));
 assert.equal(rewindBeat(3,1,true,2).text,'……ルナ……。');
 assert.ok(!rewindTransitionHTML('bag-guarantee',1,true,2).includes('もう一度、やり直せるなら'));
 assert.ok(!eventConversation(tragedy().event).some(l=>l.text.includes('息が続かない')));
});

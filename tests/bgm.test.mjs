import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { NORMAL_BGM_SRC, MOKU_BGM_SRC, LUNA_BGM_SRC, DUEL_BGM_SRC, OPENING_BGM_SRC, bedCue, createNormalBgm } from '../src/bgm.js';
import {DUEL_INTRO,duelEncounterLines,duelEndingLines} from '../src/act-two-duel.js';
import {duelStageHTML} from '../src/act-two-duel-stage.js';
import {eventConversation} from '../src/event-stage.js';

function fakeAudio() {
  return {
    loop: false, preload: '', volume: 1, paused: true, currentTime: 0,
    play() { this.paused = false; return Promise.resolve(); },
    pause() { this.paused = true; },
  };
}

test('Luna theme loops, resumes after dedicated cues and obeys sound settings',async()=>{
  const normal=fakeAudio(),luna=fakeAudio(),duel=fakeAudio();
  const bgm=createNormalBgm(normal,fakeAudio(),fakeAudio(),fakeAudio(),fakeAudio(),fakeAudio(),fakeAudio(),fakeAudio(),duel,luna);
  assert.equal(LUNA_BGM_SRC,'assets/audio/luna-odayakana-gogo.mp3');
  await bgm.setScene(false,'luna');assert.equal(luna.paused,true);
  await bgm.unlock();assert.equal(luna.paused,false);assert.equal(luna.loop,true);assert.equal(normal.paused,true);
  luna.currentTime=31;await bgm.setScene(false,'luna');assert.equal(luna.currentTime,31);
  await bgm.setScene(false,'duel');assert.equal(luna.paused,true);assert.equal(duel.paused,false);
  await bgm.setScene(false,'luna');assert.equal(luna.currentTime,31);assert.equal(luna.paused,false);assert.equal(duel.paused,true);
  await bgm.setVolume(.2);assert.equal(luna.volume,.2);
  await bgm.setSuppressed(true);assert.equal(luna.paused,true);
  await bgm.setSuppressed(false);assert.equal(luna.currentTime,31);assert.equal(luna.paused,false);
  await bgm.setEnabled(false);assert.equal(luna.paused,true);
  await bgm.setEnabled(true);assert.equal(luna.paused,false);
  await bgm.setScene(false,'normal');assert.equal(luna.paused,true);assert.equal(normal.paused,false);
});

test('Luna conversations keep her theme with Moku present while dedicated scene music wins',async()=>{
  const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
  const source=app.slice(app.indexOf('function syncNormalBgm(){'),app.indexOf("modal.addEventListener('luna-film-phase'"));
  const luna='.event-stage .stage-character[data-character="hostess"]',moku='.event-stage .stage-character[data-character="cat"]';
  for(const [visible,event,line,expected] of [
    [[luna],{}, {},'luna'],[[luna,moku],{}, {},'luna'],[[moku],{}, {},'moku'],[[],{}, {},'normal'],
    [[luna,moku,'.duel-stage .duel-field'],{duel:true},{duelRound:0},'duel'],
    [[luna,moku],{duel:true},{},'luna'],
    [[luna,moku],{duel:true},{duelRound:0},'luna'],
    [[luna,moku,'.duel-stage .duel-field'],{duel:true},{duelEnding:'yandere'},'duel'],
    [[luna,moku,'.duel-stage .duel-field'],{duel:true},{duelEnding:'clear'},'duel'],
    [[luna,'.trouble-card'],{}, {},'trouble'],[[luna,'.trouble-victory'],{}, {},'victory'],
    [[luna,'.duel-bad'],{}, {},'bad'],[[luna,'[data-act2-opening]'],{}, {},'uneasy']
  ]){
    let cue;
    const context={document:{hidden:false},state:{actOne:{chapter:2},events:[{id:1,...event}]},eventView:{id:1,index:0},
      eventConversation:()=>[line],bedCue:()=> 'normal',
      modal:{open:true,classList:{contains:()=>true},querySelector:s=>s.split(',').some(part=>visible.includes(part))?{dataset:{}}:null},
      normalBgm:{setScene:(_,name)=>{cue=name;}}};
    vm.createContext(context);vm.runInContext(source+'\nsyncNormalBgm();',context);assert.equal(cue,expected);
  }
});

test('duel music loops continuously across dialogue, obeys controls and stops for results',async()=>{
  const normal=fakeAudio(),duel=fakeAudio(),bad=fakeAudio();
  const bgm=createNormalBgm(normal,fakeAudio(),bad,fakeAudio(),fakeAudio(),fakeAudio(),fakeAudio(),fakeAudio(),duel, fakeAudio());
  assert.equal(DUEL_BGM_SRC,'assets/audio/duel-ao-wo-isoide.mp3');
  await bgm.setScene(false,'duel');assert.equal(duel.paused,true);
  await bgm.unlock();assert.equal(duel.paused,false);assert.equal(normal.paused,true);assert.equal(duel.loop,true);
  duel.currentTime=24;await bgm.setScene(false,'duel');assert.equal(duel.currentTime,24);
  await bgm.setSuppressed(true);assert.equal(duel.paused,true);
  await bgm.setSuppressed(false);assert.equal(duel.currentTime,24);assert.equal(duel.paused,false);
  await bgm.setVolume(.2);assert.equal(duel.volume,.2);
  await bgm.setEnabled(false);assert.equal(duel.paused,true);
  await bgm.setEnabled(true);assert.equal(duel.paused,false);
  await bgm.setScene(false,'bad');assert.equal(duel.paused,true);assert.equal(bad.paused,false);
  await bgm.setScene(false,'duel');assert.equal(duel.currentTime,0,'a new attempt starts at the beginning');
  await bgm.setScene(false,'normal');assert.equal(duel.paused,true);assert.equal(normal.paused,false);
});

test('real scene selection starts duel music on entry and gives results priority',async()=>{
  const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
  const source=app.slice(app.indexOf('function syncNormalBgm(){'),app.indexOf("modal.addEventListener('luna-film-phase'"));
  for(const [line,screen,expected] of [
    [{},null,'normal'],[{duelRound:0},'.duel-stage .duel-field','duel'],[{duelRound:3,duelDefeated:true},'.duel-stage .duel-field','duel'],
    [{duelRound:3,duelEnding:'clear'},'.duel-stage .duel-field','duel'],[{duelRound:3,duelEnding:'yandere'},'.duel-stage .duel-field','duel'],[{duelEnding:'yandere',duelEndingPhase:'day-1'},null,'normal'],[{duelEnding:'yandere',duelEndingPhase:'reveal'},null,'bad'],[{duelRound:3,duelEnding:'domination'},null,'bad'],
    [{duelRound:3},'.duel-bad','bad'],[{duelRound:3},'.trouble-victory','victory']
  ]){
    let cue;
    const context={document:{hidden:false},state:{actOne:{chapter:2},events:[{id:1,duel:true}]},eventView:{id:1,index:0},
      eventConversation:()=>[line],bedCue:()=> 'normal',
      modal:{open:true,classList:{contains:()=>true},querySelector:s=>screen&&s.split(',').includes(screen)?{}:null},
      normalBgm:{setScene:(_,name)=>{cue=name;}}};
    vm.createContext(context);vm.runInContext(source+'\nsyncNormalBgm();',context);assert.equal(cue,expected);
  }
});

test('rendered opening, battle and ending transcripts stop the battle audio outside real mini-game rounds',async()=>{
  const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
  const source=app.slice(app.indexOf('function syncNormalBgm(){'),app.indexOf("modal.addEventListener('luna-film-phase'"));
  const battle=fakeAudio();
  const bgm=createNormalBgm(fakeAudio(),fakeAudio(),fakeAudio(),fakeAudio(),fakeAudio(),fakeAudio(),fakeAudio(),fakeAudio(),battle,fakeAudio());
  await bgm.unlock();
  const samples=[{lines:[...DUEL_INTRO,...duelEncounterLines(0)]},...['clear','yandere','domination'].map(outcome=>({lines:duelEndingLines(outcome)}))];
  let checkedBattle=0,checkedPortraits=0;
  for(const sample of samples){
    const event={id:1,duel:true,cast:['hostess','cat'],detail:sample.lines[0].text,...sample};
    const lines=eventConversation(event);
    for(let index=0;index<lines.length;index++){
      const html=duelStageHTML(event,[],index),line=lines[index];
      const selectors=new Set();
      if(html.includes('class="duel-field"'))selectors.add('.duel-stage .duel-field');
      for(const type of ['hostess','cat'])if(html.includes(`data-character="${type}"`))selectors.add(`.event-stage .stage-character[data-character="${type}"]`);
      const context={document:{hidden:false},state:{actOne:{chapter:2},events:[event]},eventView:{id:1,index},eventConversation,bedCue,
        modal:{open:true,classList:{contains:()=>true},querySelector:s=>s.split(',').some(part=>selectors.has(part))?{dataset:{}}:null},normalBgm:bgm};
      vm.createContext(context);await vm.runInContext(source+'\nsyncNormalBgm();',context);
      const miniGame=selectors.has('.duel-stage .duel-field')&&(!line.duelEnding||line.duelEnding==='clear'||line.duelEnding==='yandere'&&!line.duelEndingPhase);
      assert.equal(battle.paused,!miniGame,`battle audio at ${line.text}`);
      if(miniGame)checkedBattle++;else checkedPortraits++;
    }
  }
  assert.ok(checkedBattle>0&&checkedPortraits>0);
});

test('normal bgm waits for a gesture, then loops until a cinematic', async () => {
  const audio = fakeAudio();
  const bgm = createNormalBgm(audio, fakeAudio(), fakeAudio(), fakeAudio(), fakeAudio(), fakeAudio(), fakeAudio(), fakeAudio(), fakeAudio(), fakeAudio());
  assert.equal(audio.loop, true);
  assert.equal(audio.volume, 0.35);
  assert.equal(await bgm.setSuppressed(false), false);
  assert.equal(audio.paused, true);
  assert.equal(await bgm.unlock(), true);
  assert.equal(audio.paused, false);
  await bgm.setSuppressed(true);
  assert.equal(audio.paused, true);
  await bgm.setSuppressed(false);
  assert.equal(audio.paused, false);
  await bgm.setEnabled(false);
  assert.equal(bgm.label(), '♫ <span>BGM OFF</span>');
  assert.equal(audio.paused, true);
  await bgm.unlock();
  assert.equal(audio.paused, true);
  await bgm.setEnabled(true);
  assert.equal(audio.paused, false);
});

test('trouble cue replaces the everyday theme and restarts only when trouble begins', async () => {
  const normal = fakeAudio();
  const trouble = fakeAudio();
  const bgm = createNormalBgm(normal, trouble, fakeAudio(), fakeAudio(), fakeAudio(), fakeAudio(), fakeAudio(), fakeAudio(), fakeAudio(), fakeAudio());
  await bgm.unlock();
  assert.equal(normal.paused, false);
  assert.equal(trouble.paused, true);
  normal.currentTime = 12;
  await bgm.setScene(false, 'trouble');
  assert.equal(bgm.cue, 'trouble');
  assert.equal(normal.paused, true);
  assert.equal(trouble.paused, false);
  assert.equal(trouble.currentTime, 0);
  trouble.currentTime = 8;
  await bgm.setScene(false, 'trouble');
  assert.equal(trouble.currentTime, 8);
  assert.equal(trouble.paused, false);
  await bgm.setScene(true, 'trouble');
  assert.equal(trouble.paused, true);
  await bgm.setScene(false, 'normal');
  assert.equal(normal.paused, false);
  assert.equal(normal.currentTime, 12);
  assert.equal(trouble.paused, true);
});

test('bad ending cue uses the fire track and continues through the same ending', async () => {
  const normal = fakeAudio();
  const bad = fakeAudio();
  const bgm = createNormalBgm(normal, fakeAudio(), bad, fakeAudio(), fakeAudio(), fakeAudio(), fakeAudio(), fakeAudio(), fakeAudio(), fakeAudio());
  await bgm.unlock();
  normal.currentTime = 4;
  await bgm.setScene(false, 'bad');
  assert.equal(bgm.cue, 'bad');
  assert.equal(bad.paused, false);
  assert.equal(bad.currentTime, 0);
  assert.equal(normal.paused, true);
  bad.currentTime = 6;
  await bgm.setScene(false, 'bad');
  assert.equal(bad.currentTime, 6);
  await bgm.setScene(false, 'normal');
  assert.equal(normal.paused, false);
  assert.equal(normal.currentTime, 4);
  assert.equal(bad.paused, true);
});

test('game title cue uses the countdown and restarts only when the title returns', async () => {
  const normal = fakeAudio();
  const title = fakeAudio();
  const bgm = createNormalBgm(normal, fakeAudio(), fakeAudio(), title, fakeAudio(), fakeAudio(), fakeAudio(), fakeAudio(), fakeAudio(), fakeAudio());
  await bgm.unlock();
  normal.currentTime = 9;
  await bgm.setScene(false, 'title');
  assert.equal(bgm.cue, 'title');
  assert.equal(title.paused, false);
  assert.equal(title.currentTime, 0);
  assert.equal(normal.paused, true);
  title.currentTime = 5;
  await bgm.setScene(false, 'title');
  assert.equal(title.currentTime, 5);
  await bgm.setScene(false, 'normal');
  assert.equal(normal.paused, false);
  assert.equal(normal.currentTime, 9);
  assert.equal(title.paused, true);
});

test('clock cue starts when the rewind dial appears and does not restart mid-dial', async () => {
  const bad = fakeAudio();
  const clock = fakeAudio();
  const bgm = createNormalBgm(fakeAudio(), fakeAudio(), bad, fakeAudio(), clock, fakeAudio(), fakeAudio(), fakeAudio(), fakeAudio(), fakeAudio());
  await bgm.unlock();
  await bgm.setScene(false, 'bad');
  assert.equal(bad.paused, false);
  await bgm.setScene(false, 'clock');
  assert.equal(bgm.cue, 'clock');
  assert.equal(clock.paused, false);
  assert.equal(clock.currentTime, 0);
  assert.equal(bad.paused, true);
  clock.currentTime = 3;
  await bgm.setScene(false, 'clock');
  assert.equal(clock.currentTime, 3);
});

test('uneasy air replaces the everyday theme after the first leap and resumes across other cues', async () => {
  const normal = fakeAudio();
  const trouble = fakeAudio();
  const uneasy = fakeAudio();
  const bgm = createNormalBgm(normal, trouble, fakeAudio(), fakeAudio(), fakeAudio(), uneasy, fakeAudio(), fakeAudio(), fakeAudio(), fakeAudio());
  await bgm.unlock();
  normal.currentTime = 7;
  await bgm.setScene(false, 'uneasy');
  assert.equal(bgm.cue, 'uneasy');
  assert.equal(uneasy.paused, false);
  assert.equal(uneasy.currentTime, 0);
  assert.equal(normal.paused, true);
  uneasy.currentTime = 11;
  await bgm.setScene(false, 'uneasy');
  assert.equal(uneasy.currentTime, 11);
  await bgm.setScene(false, 'trouble');
  await bgm.setScene(false, 'uneasy');
  assert.equal(uneasy.paused, false);
  assert.equal(uneasy.currentTime, 11);
  assert.equal(trouble.paused, true);
  await bgm.setScene(false, 'normal');
  assert.equal(normal.paused, false);
  assert.equal(normal.currentTime, 7);
});

test('observation keeps the normal bed after a rewind; Moku dialogue has a separate theme', () => {
  assert.equal(NORMAL_BGM_SRC, 'assets/audio/normal-pop.mp3');
  assert.equal(MOKU_BGM_SRC, 'assets/audio/moku-theme.mp3');
  assert.equal(bedCue({ attempt: 1 }), 'normal');
  assert.equal(bedCue({ attempt: 2 }), 'normal');
  assert.equal(bedCue({ attempt: 5 }), 'normal');
  assert.equal(bedCue({ chapter: 2, attempt: 1 }), 'normal');
  assert.equal(bedCue({ chapter: 2, attempt: 4 }), 'normal');
  assert.equal(bedCue(undefined), 'normal');
});

test('victory fanfare replaces trouble on a cleared result and does not restart on the same screen', async () => {
  const trouble = fakeAudio();
  const victory = fakeAudio();
  const uneasy = fakeAudio();
  const bgm = createNormalBgm(fakeAudio(), trouble, fakeAudio(), fakeAudio(), fakeAudio(), uneasy, victory, fakeAudio(), fakeAudio(), fakeAudio());
  await bgm.unlock();
  await bgm.setScene(false, 'trouble');
  trouble.currentTime = 6;
  await bgm.setScene(false, 'victory');
  assert.equal(bgm.cue, 'victory');
  assert.equal(victory.paused, false);
  assert.equal(victory.currentTime, 0);
  assert.equal(trouble.paused, true);
  victory.currentTime = 2;
  await bgm.setScene(false, 'victory');
  assert.equal(victory.currentTime, 2);
  uneasy.currentTime = 9;
  await bgm.setScene(false, 'uneasy');
  assert.equal(uneasy.paused, false);
  assert.equal(uneasy.currentTime, 9);
  assert.equal(victory.paused, true);
});

test('packaged bgm files are mp3s', async () => {
  for (const name of ['luna-odayakana-gogo.mp3', 'duel-ao-wo-isoide.mp3', 'moku-theme.mp3', 'the-midnight-crossing.mp3', 'trouble-persona.mp3', 'bad-end-fire.mp3', 'title-countdown.mp3', 'clock-rewind.mp3', 'uneasy-air.mp3', 'victory-fanfare.mp3']) {
    const file = await readFile(new URL('../assets/audio/' + name, import.meta.url));
    assert.ok(file.length > 100000);
    assert.ok(file[0] === 0xff || file.subarray(0, 3).toString() === 'ID3');
  }
});

test('opening BGM switches to Moku on chapter one title',async()=>{
 assert.equal(OPENING_BGM_SRC,'assets/audio/the-midnight-crossing.mp3');
 const opening=fakeAudio(),moku=fakeAudio();
 const bgm=createNormalBgm(fakeAudio(),fakeAudio(),fakeAudio(),fakeAudio(),fakeAudio(),fakeAudio(),fakeAudio(),moku,fakeAudio(),fakeAudio(),opening);
 await bgm.unlock();await bgm.setScene(false,'opening');
 assert.equal(opening.paused,false);
 opening.currentTime=18;await bgm.setScene(false,'opening');assert.equal(opening.currentTime,18);
 await bgm.setScene(false,'moku');assert.equal(opening.paused,true);assert.equal(moku.paused,false);
});
test('prologue, logo and chapter title use distinct cue selectors',async()=>{
 const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
 const source=app.slice(app.indexOf('function syncNormalBgm(){'),app.indexOf("modal.addEventListener('luna-film-phase'"));
 for(const [selector,scene,expected] of [
  ['.cinematic-prologue',null,'opening'],['.opening-reveal',null,'opening'],
  [null,'prologue','opening'],['.act-title[data-chapter="1"]',null,'moku'],
  ['.act-title[data-chapter="2"]',null,'luna'],['.game-title',null,'title']]){
   let cue;
   const context={document:{hidden:false},state:{actOne:{chapter:1},events:[{id:1,actScene:scene}]},eventView:{id:1,index:0},eventConversation:()=>[{}],bedCue:()=> 'normal',
    modal:{open:true,classList:{contains:()=>!!scene},querySelector:q=>q.split(',').some(x=>x===selector)?{dataset:{}}:null},
    normalBgm:{setScene:(_,name)=>{cue=name;}}};
   vm.createContext(context);vm.runInContext(source+'\nsyncNormalBgm();',context);
   assert.equal(cue,expected,String(selector||scene));
 }
});

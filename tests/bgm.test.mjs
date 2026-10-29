import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { NORMAL_BGM_SRC, MOKU_BGM_SRC, LUNA_BGM_SRC, DUEL_BGM_SRC, OPENING_BGM_SRC, CLOCK_BGM_SRC, UNEASY_BGM_SRC, bedCue, createNormalBgm, firstActMokuDialogueTheme } from '../src/bgm.js';
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
      eventConversation:()=>[line],bedCue:()=> 'normal',firstActMokuDialogueTheme,
      modal:{open:true,classList:{contains:()=>true},querySelector:s=>s.split(',').some(part=>visible.includes(part))?{dataset:{}}:null},
      normalBgm:{setScene:(_,name)=>{cue=name;}}};
    vm.createContext(context);vm.runInContext(source+'\nsyncNormalBgm();',context);assert.equal(cue,expected);
  }
});

test('First-act Moku music continues throughout the landlord narration and speech without a portrait',async()=>{
  const {createActOne}=await import('../src/act-one.js');
  const {eventStageHTML}=await import('../src/event-stage.js');
  const {voiceLineKey}=await import('../src/voice-policy.js');
  const {VOICE_MANIFEST}=await import('../src/voice-manifest.js');
  const {createVoicePlayer}=await import('../src/voice-player.js');
  const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
  const source=app.slice(app.indexOf('function syncNormalBgm(){'),app.indexOf("modal.addEventListener('luna-film-phase'"));
  const state=createActOne(1),event=state.events[0],lines=eventConversation(event);
  const moku=fakeAudio(),normal=fakeAudio(),bgm=createNormalBgm(normal,fakeAudio(),fakeAudio(),fakeAudio(),fakeAudio(),fakeAudio(),fakeAudio(),moku);
  const videos=[];
  const voice=createVoicePlayer({storage:null,manifest:VOICE_MANIFEST,makeAudio:()=>{const item={src:'',play(){return Promise.resolve()},pause(){},removeAttribute(){},load(){}};videos.push(item);return item;}});
  await bgm.unlock();
  for(let i=0;i<lines.length;i++){
    const line=lines[i],html=eventStageHTML(event,state.residents,i);
    const mokuPortrait=html.includes('data-character="cat"');
    if(line.speaker==='manager')assert.equal(mokuPortrait,false,'manager does not draw Moku portrait');
    let cue=null;
    const context={document:{hidden:false},state:{actOne:{chapter:1},events:[event]},eventView:{id:event.id,index:i},
      eventConversation:()=>lines,bedCue:()=> 'normal',firstActMokuDialogueTheme,
      modal:{open:true,classList:{contains:()=>true},querySelector:s=>{
        if(s.includes('stage-character[data-character="cat"]')&&mokuPortrait)return {dataset:{}};
        return null;
      }},
      normalBgm:{setScene:(_,next)=>{cue=next;}}};
    vm.createContext(context);
    vm.runInContext(source+'\nsyncNormalBgm();',context);
    assert.equal(cue,'moku','First-act scene should keep Moku track for '+line.speaker+': '+line.text);
    await bgm.setScene(false,cue);
    if(i===1)moku.currentTime=19;
    assert.equal(moku.paused,false);assert.equal(normal.paused,true);
    if(i>1)assert.equal(moku.currentTime,19,'Music must not restart on each speaker');
    if(line.speaker==='manager'){
      const entry=VOICE_MANIFEST[voiceLineKey(line)];
      assert.ok(entry,'Manager line missing from current manifest: '+line.text);
      assert.equal(entry.model,'eleven_v4');
      assert.match(entry.file,/\.opening-v4\.mp3$/);
      voice.play(line,'test:'+i);
      assert.equal(videos.at(-1).src,entry.file,'Player must use the newly installed V4 recording');
    }
  }
  voice.stop();
  assert.equal(firstActMokuDialogueTheme({cast:['cat']},{chapter:2}),false,'Second act is unaffected');
  assert.equal(firstActMokuDialogueTheme({cast:['hostess']},{chapter:1}),false,'Luna scenes are unaffected');
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

test('prewarming loads only selected tracks and never unlocks playback or rewinds them',async()=>{
 const tracks=Array.from({length:11},()=>({...fakeAudio(),loads:0,load(){this.loads++;}}));
 const bgm=createNormalBgm(...tracks),[normal,trouble,bad,title,clock,uneasy,victory,moku,duel,luna,opening]=tracks;
 bgm.preload('title');assert.equal(title.loads,1);assert.equal(title.preload,'auto');assert.ok(tracks.every(a=>a.paused));
 assert.equal(normal.loads,0);assert.equal(duel.loads,0);
 await bgm.setScene(false,'title');assert.equal(title.loads,1);assert.equal(opening.loads,1);assert.equal(title.paused,true);
 await bgm.unlock();assert.equal(title.paused,false);
 title.currentTime=12;bgm.preload('title');await bgm.setScene(false,'title');
 assert.equal(title.currentTime,12);assert.equal(title.loads,1);
 await bgm.setScene(false,'opening');assert.equal(opening.loads,1);assert.equal(moku.loads,1);assert.equal(opening.paused,false);
 await bgm.setScene(true,'bad');assert.equal(bad.paused,true);assert.equal(clock.loads,1);
 await bgm.setScene(false,'clock');assert.equal(clock.loop,false);assert.equal(clock.loads,1);
});

test('third-act music starts at the prologue, pauses and restarts for a replay',async()=>{
 const normal=fakeAudio(),film=fakeAudio();
 const bgm=createNormalBgm(normal,fakeAudio(),fakeAudio(),fakeAudio(),fakeAudio(),fakeAudio(),fakeAudio(),fakeAudio(),fakeAudio(),fakeAudio(),fakeAudio(),film);
 await bgm.unlock();await bgm.setScene(false,'act3');assert.equal(film.paused,false);assert.equal(normal.paused,true);assert.equal(film.loop,true);
 film.currentTime=12;await bgm.setScene(true,'act3');assert.equal(film.paused,true);
 await bgm.setScene(false,'act3');assert.equal(film.currentTime,12);assert.equal(film.paused,false);
 await bgm.setVolume(.2);assert.equal(film.volume,.2);await bgm.setEnabled(false);assert.equal(film.paused,true);
 await bgm.setEnabled(true);await bgm.setScene(false,'clock');assert.equal(film.paused,true);
 await bgm.setScene(false,'act3');assert.equal(film.currentTime,0);assert.equal(film.paused,false);
});

test('third-act film selects its track and suppresses it on pause, whiteout, or hidden tab',async()=>{
 const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
 const source=app.slice(app.indexOf('function syncNormalBgm(){'),app.indexOf("modal.addEventListener('luna-film-phase'"));
 for(const [cut,paused,hidden,suppressed] of [['news','false',false,false],['news','true',false,true],['white','false',false,true],['news','false',true,true]]){
  let result;const film={dataset:{cut,paused}};
  const context={document:{hidden},state:{actOne:{chapter:2},events:[]},eventView:null,eventConversation:()=>[],bedCue:()=> 'normal',
   modal:{open:true,classList:{contains:()=>false},querySelector:s=>s==='[data-act3-film]'?film:null},normalBgm:{setScene:(quiet,cue)=>result={quiet,cue}}};
  vm.createContext(context);vm.runInContext(source+'\nsyncNormalBgm();',context);assert.equal(result.cue,'act3');assert.equal(result.quiet,suppressed);
 }
});


test('map and Mimi cues use their uploaded tracks and preserve their position between lines',async()=>{
 const previous=globalThis.Audio,created=[];
 globalThis.Audio=class{constructor(){Object.assign(this,fakeAudio());created.push(this);}};
 try{
  const bgm=createNormalBgm(...Array.from({length:12},fakeAudio));
  const map=created.find(a=>a.src==='assets/audio/act3-map.mp3'),mimi=created.find(a=>a.src==='assets/audio/mimi-theme.mp3');
  assert.ok(map&&mimi);await bgm.unlock();await bgm.setScene(false,'act3map');assert.equal(map.paused,false);assert.equal(mimi.paused,true);
  map.currentTime=15;await bgm.setScene(false,'act3map');assert.equal(map.currentTime,15);
  await bgm.setScene(false,'mimi');assert.equal(map.paused,true);assert.equal(mimi.paused,false);mimi.currentTime=8;
  await bgm.setScene(false,'mimi');assert.equal(mimi.currentTime,8);await bgm.setEnabled(false);assert.equal(mimi.paused,true);
 }finally{if(previous===undefined)delete globalThis.Audio;else globalThis.Audio=previous;}
});


test('bridge collapse remains silent when scene synchronization runs again',async()=>{
 const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
 const source=app.slice(app.indexOf('function syncNormalBgm(){'),app.indexOf("modal.addEventListener('luna-film-phase'"));
 for(const collapsed of [false,true]){
  let result;
  const context={document:{hidden:false},state:{actOne:{chapter:2},events:[]},eventView:null,eventConversation:()=>[],bedCue:()=> 'normal',
   modal:{open:true,classList:{contains:()=>false},querySelector:s=>s==='[data-act3-map]'||collapsed&&s==='[data-act3-map][data-collapse="true"]'?{}:null},normalBgm:{setScene:(quiet,cue)=>result={quiet,cue}}};
  vm.createContext(context);vm.runInContext(source+'\nsyncNormalBgm();',context);assert.equal(result.cue,'act3map');assert.equal(result.quiet,collapsed);
 }
});

test('act three return uses post-BAD-END uneasy music, not a looping clock SE',async()=>{
 assert.equal(UNEASY_BGM_SRC,'assets/audio/uneasy-air.mp3');
 assert.equal(CLOCK_BGM_SRC,'assets/audio/clock-rewind.mp3');
 const oldAudio=globalThis.Audio,generated=[];
 globalThis.Audio=class{constructor(){Object.assign(this,fakeAudio());generated.push(this);}};
 try{
  const args=Array.from({length:12},()=>fakeAudio()),clock=args[4],uneasy=args[5];
  const bgm=createNormalBgm(...args);
  const map=generated.find(a=>a.src==='assets/audio/act3-map.mp3');
  assert.ok(map);
  assert.equal(generated.some(a=>a.src===CLOCK_BGM_SRC),false,'No second audio element may loop the clock SE');
  assert.equal(clock.loop,false);assert.equal(uneasy.loop,true);
  await bgm.unlock();
  await bgm.setScene(false,'act3map');assert.equal(map.paused,false);
  await bgm.setScene(false,'clock');assert.equal(clock.paused,false);assert.equal(map.paused,true);
  await bgm.setSuppressed(true);assert.equal(clock.paused,true);
  await bgm.setScene(false,'uneasy');
  assert.equal(uneasy.paused,false);assert.equal(clock.paused,true);assert.equal(map.paused,true);
  uneasy.currentTime=17;await bgm.setScene(false,'uneasy');assert.equal(uneasy.currentTime,17);
 }finally{if(oldAudio===undefined)delete globalThis.Audio;else globalThis.Audio=oldAudio;}
});

test('post-rewind saves select uneasy before map attributes initialize, with no map BGM flash',async()=>{
 const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
 const source=app.slice(app.indexOf('function syncNormalBgm(){'),app.indexOf("modal.addEventListener('luna-film-phase'"));
 for(const [progress,selectors,expected] of [
  [{phase:'map',mapScene:'return',mapSeen:['departure','crossing','detour','store']},['[data-act3-map]'],'uneasy'],
  [{phase:'map',mapScene:'return',mapSeen:['departure','crossing','detour','store']},['[data-act3-map]','[data-act3-map][data-scene="mimi"]'],'uneasy'],
  [{phase:'map',mapScene:null,mapSeen:[]},['[data-act3-map]','[data-act3-map][data-rewind-return="true"]'],'uneasy'],
  [{phase:'map',mapScene:'homecoming',mapSeen:['departure','crossing','detour','store','return']},['[data-act3-map]'],'uneasy'],
  [{phase:'map',mapScene:null,mapSeen:['departure','crossing','detour','store','return']},['[data-act3-map]'],'uneasy'],
  [{phase:'map',mapScene:'store',mapSeen:['departure','crossing','detour']},['[data-act3-map]','[data-act3-map][data-scene="mimi"]'],'mimi'],
  [{phase:'map',mapScene:'crossing',mapSeen:['departure']},['[data-act3-map]'],'act3map']
 ]){
  let result;
  const context={document:{hidden:false},state:{actOne:{chapter:2},actThree:progress,events:[]},eventView:null,
   eventConversation:()=>[],bedCue:()=> 'normal',
   modal:{open:true,classList:{contains:()=>false},querySelector:q=>selectors.includes(q)?{dataset:{}}:null},
   normalBgm:{setScene:(quiet,cue)=>result={quiet,cue}}};
  vm.createContext(context);vm.runInContext(source+'\nsyncNormalBgm();',context);
  assert.equal(result.cue,expected,JSON.stringify(progress));assert.equal(result.quiet,false);
 }
 assert.match(app,/state\.actThree=actThreeStoryDebug\('return'\);save\(\);showActThreeMap\(\)/);
 const handoff=app.slice(app.indexOf('onLoop:()=>{'),app.indexOf('onBack:()=>openModal(actThreeCompleteHTML())'));
 assert.ok(!handoff.includes("normalBgm.setSuppressed(false);\n      state.actThree"));
});

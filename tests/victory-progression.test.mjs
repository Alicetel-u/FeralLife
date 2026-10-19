import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createActOne,advanceActOne,answerActOne,rewindBeforeFire,ACT_ONE_EVENTS} from '../src/act-one.js';
import {beginActTwo,advanceActTwo,answerActTwo,ACT_TWO_EVENTS} from '../src/act-two.js';
import {rememberReadScenes,automaticChapterScene,claimAutomaticScene} from '../src/dialogue.js';
import {avoidedTrouble,troubleAvoidedHTML,startTroubleVictory} from '../src/trouble-victory.js';
import {eventConversation} from '../src/event-stage.js';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const queueSource=app.slice(app.indexOf('function syncStageCursor()'),app.indexOf("let lastStalkerImpactCue="));
const debugSource=app.slice(app.indexOf('function startDeveloperScene('),app.indexOf("document.addEventListener('click',e=>{"));
const closeSource=app.slice(app.indexOf('function closeModal()'),app.indexOf("modal.addEventListener('close'"));

test('cooking success and the actual victory button never replay the opening',()=>{
 for(const route of ['normal','debug','rewind','legacy-unread']){
  let selected=null,victoryButton=null;
  const classes=new Set(),opened=[];
  const context={state:null,restored:false,eventPreview:false,previewResident:null,stageQueue:[],seenStageId:0,stageScanState:null,stageScanNextId:-1,
   ACT_ONE_EVENTS,ACT_TWO_EVENTS,createActOne,advanceActOne,answerActOne,beginActTwo,advanceActTwo,answerActTwo,developerMode:false,
   rememberReadScenes,automaticChapterScene,claimAutomaticScene,avoidedTrouble,troubleAvoidedHTML,startTroubleVictory,eventConversation,
   eventView:null,document:{hidden:false,documentElement:{classList:{contains:()=>false}}},
   modal:{open:true,classList:{contains:v=>classes.has(v)},querySelector:()=>({querySelector:()=>victoryButton}),close(){this.open=false;context.openNextStageEvent();}},
   characterVoice:{stop(){}},stopOpeningPrologue(){},cleanupChoiceUI(){},cleanupDuelPlayback(){},clearFireEnding(){context.stopFireEnding?.();context.stopFireEnding=null;},stopFireEnding:null,eventAutoTimer:null,clearTimeout,
   save(){},updateUI(){},syncNormalBgm(){},
   showEvent(id){selected=context.state.events.find(e=>e.id===id);selected.read=true;opened.push(selected.actScene);classes.add('conversation-modal');context.modal.open=true;context.eventView={id,index:eventConversation(selected).length-1};},
   openModal(html){assert.match(html,/trouble-victory/);opened.push('victory');classes.clear();victoryButton=new EventTarget();victoryButton.focus=()=>{};},
   resetActState(next){context.state=next;context.syncStageCursor();},
  };
  context.endingShown=false;
  const endingSource=app.slice(app.indexOf('function showActEnding('),app.indexOf('function showActTwoEnding('));
  vm.createContext(context);vm.runInContext(queueSource+'\n'+debugSource+'\n'+closeSource+'\n'+endingSource,context);
  if(route==='debug')vm.runInContext("startDeveloperScene('1:dinner')",context);
  else{
   let s=createActOne(42,[],2,true);advanceActOne(s,100);answerActOne(s,s.actOne.pending.eventId,'water');advanceActOne(s,100);
   if(route==='rewind'){answerActOne(s,s.actOne.pending.eventId,'turbo');s=rewindBeforeFire(s);s.actOne.rewindIntroPending=false;}
   if(route!=='legacy-unread')s.events.forEach(e=>e.read=true);
   context.state=s;context.syncStageCursor();
  }
  const reply=answerActOne(context.state,context.state.actOne.pending.eventId,'coronation');context.showEvent(reply.id);
  vm.runInContext('closeModal();',context);assert.equal(opened.at(-1),'victory',route);
  victoryButton.dispatchEvent(new Event('click'));
  assert.notEqual(opened.at(-1),'opening',route+' replays opening after victory');
  assert.notEqual(opened.at(-1),'ash',route+' replays ash after victory');
  assert.equal(context.state.hour,37,route+' must not rewind the clock');
  assert.deepEqual(context.state.actOne.completed,['ash','dinner']);
  for(const e of context.state.events)e.read=true;
  advanceActOne(context.state,100);context.queueFreshStageEvents();context.showActEnding();
  assert.equal(context.state.actOne.status,'clear');assert.equal(opened.at(-1),'epilogue',route+' reaches the ending');
 }
});

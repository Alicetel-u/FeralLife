import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
import {fireEndingHTML} from '../src/fire-ending.js';
import {createActOne,advanceActOne,answerActOne,rewindBeforeFire,validActOne} from '../src/act-one.js';
import {storyCheckpointTarget} from '../src/story-checkpoints.js';
import {validateSave} from '../src/simulation.js';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const fire=readFileSync(new URL('../src/fire-ending.js',import.meta.url),'utf8');
const rewind=readFileSync(new URL('../src/rewind-transition.js',import.meta.url),'utf8').replace(/^import .*\r?\n/,'').replaceAll('export function','function');
const ending=app.slice(app.indexOf('function showActEnding('),app.indexOf('function showActTwoEnding('));
const begin=app.slice(app.indexOf('function beginRewind('),app.indexOf('let rewindWhiteoutPending'));
const reset=app.slice(app.indexOf('function resetActState('),app.indexOf("modal.addEventListener('cancel'"));

test('real fire and clock callbacks reach a playable checkpoint for every live first-act failure',()=>{
 for(const attempt of [1,2,3])for(const choice of attempt===1?['trash']:['trash','balcony','turbo','show']){
  for(const audioMode of ['off','ended','blocked','error','stalled']){
   let state=createActOne(42,[],attempt,true);
   advanceActOne(state,100);
   if(['turbo','show'].includes(choice)){answerActOne(state,state.actOne.pending.eventId,'water');advanceActOne(state,100);}
   assert.ok(answerActOne(state,state.actOne.pending.eventId,choice));
   state=JSON.parse(JSON.stringify(state));
   let now=0,id=0,completed=0;const frames=new Map(),screens=[];
   const node=()=>({dataset:{},style:{setProperty(){}},classList:{add(){},remove(){},toggle(){}}});
   const root=()=>{const nodes=new Map();return {isConnected:true,dataset:{chapter:'1'},classList:{add(){}},dispatchEvent(){},querySelector(s){if(!nodes.has(s))nodes.set(s,node());return nodes.get(s);}};};
   let current=null;
   const context={state,endingShown:false,stopFireEnding:null,fireEndingHTML,storyCheckpointTarget,
    performance:{now:()=>now},document:{hidden:false},matchMedia:()=>({matches:attempt===3}),
    CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}},
    requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:key=>frames.delete(key),
    createFirePainter:()=>()=>{},modal:{querySelector:()=>current},
    $:()=>({getAttribute:()=>audioMode==='off'?'false':'true'}),
    normalBgm:{clockAudio:{ended:audioMode==='ended',paused:audioMode==='blocked',error:audioMode==='error'?{}:null}},
    openModal(html){context.stopFireEnding?.();if(current)current.isConnected=false;current=root();screens.push(html);},
    rewindBeforeFire,rewindWhiteoutPending:false,restored:true,talk:{},createTalk:()=>({}),
    inheritObservation(){},syncStageCursor(){},profileKey:null,lastEventId:0,paused:false,autoFollow:true,
    renderer:{reset(){}},closeModal(){context.stopFireEnding?.();if(current)current.isConnected=false;},
    updateCamera(){},updateRooms(){},updateUI(){},save(){assert.ok(validateSave(context.state));},
    showEvent(eventId){assert.ok(context.state.events.some(e=>e.id===eventId&&e.actScene==='rewind'));completed++;},
    showActTitle(){assert.fail('rewind must resume its dialogue');},
   };
   vm.createContext(context);
   vm.runInContext(fire.slice(fire.indexOf('export function fireEndingPhase'),fire.indexOf('// Gradients')).replaceAll('export function','function')+'\n'+fire.slice(fire.indexOf('export function startFireEnding')).replace('export function','function')+'\n'+rewind+'\n'+ending+'\n'+begin+'\n'+reset+'\nshowActEnding();',context);
   const tick=()=>{now+=100;const queued=[...frames.values()];frames.clear();for(const fn of queued)fn(now);};
   context.document.hidden=true;for(let n=0;n<60;n++)tick();
   assert.equal(screens.length,1,'hidden fire must pause');assert.equal(completed,0);
   context.document.hidden=false;
   for(let n=0;n<500&&completed===0;n++)tick();
   const label=`attempt ${attempt}, ${choice}, audio ${audioMode}`;
   assert.equal(completed,1,label);
   assert.equal(screens.length,2,label+' has one fire and one rewind');
   assert.match(screens[0],/unified-fire/);assert.doesNotMatch(screens[1],/fire-cinematic/);
   assert.ok(validActOne(context.state)&&validateSave(context.state),label);
   assert.equal(context.state.ending,null);assert.equal(context.state.actOne.attempt,attempt+1);
   assert.equal(context.state.hour,storyCheckpointTarget(state).hour);
   context.stopFireEnding();for(let n=0;n<5;n++)tick();assert.equal(completed,1);
   const loaded=JSON.parse(JSON.stringify(context.state));loaded.actOne.rewindIntroPending=false;
   advanceActOne(loaded,100);
   if(loaded.actOne.pending?.scene==='ash')assert.ok(answerActOne(loaded,loaded.actOne.pending.eventId,'water'));
   advanceActOne(loaded,100);assert.equal(loaded.actOne.pending.scene,'dinner');
   assert.ok(answerActOne(loaded,loaded.actOne.pending.eventId,'coronation'));
   advanceActOne(loaded,100);assert.equal(loaded.actOne.status,'clear',label+' can finish');
  }
 }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,admit,advance,addEvent,validateSave} from '../src/simulation.js';
import {MANAGEMENT_CASES} from '../src/event-cases.js';
import {ensureManagement,openManagementCase,resolveManagementCase,tickManagement,managementEnding} from '../src/management.js';
import {eventConversation,eventStageHTML,troubleCardHTML} from '../src/event-stage.js';
import {createTalk,stepTalk} from '../src/dialogue.js';

function fullHouse(seed=7) {
  const s=createGame(seed);
  for(const type of ['hostess','fox','sister','peko','ann']){s.pending=[type];assert.ok(admit(s,type));}
  return s;
}
function answer(s,id,choice) {
  assert.ok(openManagementCase(s,id,addEvent),id);
  const eventId=s.management.pending.eventId;
  const result=resolveManagementCase(s,eventId,choice,addEvent);
  assert.ok(result,`${id}:${choice}`);return result;
}

test('18 resident cases and six chain scenes each offer three valid, persistable choices',()=>{
  assert.equal(Object.values(MANAGEMENT_CASES).filter(c=>!c.chain).length,18);
  assert.equal(Object.values(MANAGEMENT_CASES).filter(c=>c.chain).length,6);
  for(const [id,c]of Object.entries(MANAGEMENT_CASES)){
    assert.equal(c.choices.length,3,id);
    for(const choice of c.choices){
      const s=fullHouse();answer(s,id,choice.id);
      assert.ok(validateSave(s),id+':'+choice.id);
      if(choice.follow){
        s.hour+=choice.follow.delay;tickManagement(s,addEvent);
        assert.ok(s.events.some(e=>e.followupOf===id),id);
        assert.ok(validateSave(s),id+' after report');
      }
    }
  }
});

test('pending requests do not time out or disappear when journal reaches its limit',()=>{
  const s=fullHouse(1);advance(s,13);
  const {eventId,caseId}=s.management.pending;
  const before=JSON.parse(JSON.stringify(s.management.pending));
  advance(s,200);
  for(let i=0;i<300;i++)addEvent(s,'life','日常','缶を一本動かした。');
  assert.deepEqual(s.management.pending,before);
  assert.equal(s.management.completed.includes(caseId),false);
  assert.ok(s.events.some(e=>e.id===eventId));assert.equal(s.events.length,240);
  assert.ok(validateSave(s));
  assert.ok(resolveManagementCase(s,eventId,'check',addEvent));
});

test('a choice cannot be replayed, forged or charged twice',()=>{
  const s=fullHouse();openManagementCase(s,'cigarette',addEvent);
  const id=s.management.pending.eventId,funds=s.management.funds;
  assert.equal(resolveManagementCase(s,id,'invented',addEvent),null);
  assert.equal(resolveManagementCase(s,id+1,'inspect',addEvent),null);
  assert.equal(s.management.funds,funds);
  resolveManagementCase(s,id,'inspect',addEvent);
  const paid=s.management.funds;
  assert.equal(resolveManagementCase(s,id,'inspect',addEvent),null);
  assert.equal(s.management.funds,paid);assert.equal(s.management.queue.length,1);
});

test('fire consequences and roommate chain survive a save and fire only once',()=>{
  const s=fullHouse();answer(s,'cigarette','leave');
  const restored=JSON.parse(JSON.stringify(s));assert.ok(validateSave(restored));
  advance(s,12);advance(restored,12);assert.deepEqual(s,restored);
  assert.equal(s.events.filter(e=>e.followupOf==='cigarette').length,1);
  advance(s,4);
  assert.equal(s.management.pending.caseId,'roomshare');
  const fox=s.residents.find(r=>r.type==='fox');
  const old=fox.relationships.cat;
  resolveManagementCase(s,s.management.pending.eventId,'rules',addEvent);
  assert.equal(fox.relationships.cat,old+12);
  assert.equal(s.events.filter(e=>e.followupOf==='cigarette').length,1);
});

test('probabilistic contest commits one outcome, with both success and failure reachable',()=>{
  const outcomes=new Set();
  for(let seed=1;seed<=100;seed++){
    const s=fullHouse(seed);answer(s,'contest','team');
    const restored=JSON.parse(JSON.stringify(s));
    advance(s,12);advance(restored,12);assert.deepEqual(s,restored);
    outcomes.add(s.management.success>0?'win':'loss');
  }
  assert.deepEqual([...outcomes].sort(),['loss','win']);
});

test('management uses a separate random stream and books rent and maintenance once',()=>{
  const s=fullHouse(999),m=ensureManagement(s),seed=s.seed,start=m.funds;
  answer(s,'contest','team');assert.equal(s.seed,seed);
  s.hour=24;s.rent+=7200;tickManagement(s,addEvent);
  assert.equal(m.funds,start-4000+7200-3600);
  const funds=m.funds;tickManagement(s,addEvent);assert.equal(m.funds,funds);
});

test('old saves migrate without resetting residents, invalid case/queue data is rejected',()=>{
  const s=createGame(9);delete s.management;assert.ok(validateSave(s));
  const original=JSON.stringify(s.residents);ensureManagement(s);assert.equal(JSON.stringify(s.residents),original);
  for(const mutate of [
    x=>{x.management.safety=101;},
    x=>{x.management.completed=['__proto__'];},
    x=>{x.management.pending={caseId:'__proto__',eventId:1,openedAt:17};},
    x=>{x.management.queue=[{kind:'case',caseId:'not-real',dueAt:20}];},
    x=>{x.management.queue=[{kind:'report',parentCase:'cigarette',parentEvent:1,cast:['cat'],title:'x',text:'x',dueAt:20,effects:{funds:Infinity},next:null}];}
  ]){const x=structuredClone(s);mutate(x);assert.equal(validateSave(x),false);}
});

test('all five new ending categories are reachable and retain observation-only endings',()=>{
  const base=fullHouse();assert.equal(managementEnding(base),null);
  base.management.decisions=Array.from({length:3},()=>({caseId:'cigarette',choiceId:'check',hour:17}));
  const cases=[
    [{funds:-1},'管理人の財布だけ、退去しました'],
    [{safety:20},'全員、鍵を返す前夜'],
    [{funds:60000,success:3},'家主は、ご近所だった'],
    [{buzz:70},'住める炎上スポット'],
    [{solidarity:8,trust:70,safety:70},'ろくでもない、助け合い']
  ];
  for(const [stats,name]of cases){const s=structuredClone(base);Object.assign(s.management,stats);assert.equal(managementEnding(s)?.name,name);}
});

test('ordinary events and authored requests use left/right portraits with escaped speech',()=>{
  const s=fullHouse();openManagementCase(s,'collection',addEvent);
  const e=s.events[0],lines=eventConversation(e);
  assert.equal(lines[0].speaker,'narrator');assert.ok(lines.some(l=>l.speaker==='sister'));
  const i=lines.findIndex(l=>l.speaker==='sister');
  const html=eventStageHTML(e,s.residents,i);
  assert.ok(html.includes('stage-character left'));assert.ok(html.includes('stage-character right'));
  assert.ok(html.includes('stage-bubble right'));assert.ok(html.includes('assets/events/sister.png'));
  const unsafe={detail:'<script>alert(1)</script>',lines:[{speaker:'cat',text:'<img src=x onerror=bad()>'}],rooms:[101]};
  assert.ok(!eventStageHTML(unsafe,s.residents,1).includes('<img src=x'));
  const talk=createTalk(e.id-1);stepTalk(talk,s,1000,false);
  assert.notEqual(talk.eventId,e.id,'private requests are not broadcast on the observation canvas');
});

test('sensitive pregnancy support stays opt-in while daily scenes keep being available',()=>{
  const s=fullHouse();s.hour=350;
  s.management.completed=Object.keys(MANAGEMENT_CASES).filter(id=>id!=='pregnancy');
  tickManagement(s,addEvent);assert.equal(s.management.pending,null);
  s.management.includeSensitive=true;tickManagement(s,addEvent);
  assert.equal(s.management.pending.caseId,'pregnancy');
});

test('actual eighteen-day playthroughs reach all five management endings without editing metrics',()=>{
  const endings=new Set();
  for(let seed=1;seed<=170;seed++){
    const s=createGame(seed*9471);let randomSeed=seed;
    const next=()=>{randomSeed^=randomSeed<<13;randomSeed^=randomSeed>>>17;randomSeed^=randomSeed<<5;return(randomSeed>>>0)/4294967296;};
    while(!s.ending){
      advance(s,1);
      if(s.pending)admit(s,s.pending[Math.floor(next()*s.pending.length)]);
      const p=s.management.pending;if(!p||s.ending)continue;
      const choices=MANAGEMENT_CASES[p.caseId].choices;
      const cost=c=>(c.effects.funds||0)+(c.follow?.effects?.funds||0);
      const choice=seed<=100?[...choices].sort((a,b)=>cost(a)-cost(b))[0]:seed===170?choices[2]:choices[Math.floor(next()*3)];
      resolveManagementCase(s,p.eventId,choice.id,addEvent);
    }
    assert.ok(validateSave(s),`seed ${seed}`);endings.add(s.ending.name);
  }
  for(const name of ['管理人の財布だけ、退去しました','全員、鍵を返す前夜','家主は、ご近所だった','住める炎上スポット','ろくでもない、助け合い'])assert.ok(endings.has(name),name);
});

test('conflicts wait for both residents and legacy solo requests migrate without losing the save',()=>{
  const s=createGame(33);
  assert.equal(openManagementCase(s,'cigarette',addEvent),false);
  const old=addEvent(s,'trouble','旧相談','以前のモクの相談。',[101]);
  Object.assign(old,{caseId:'cigarette',cast:['cat'],lines:[{speaker:'cat',text:'旧相談だニャ。'}],stageOnly:true});
  s.management.pending={caseId:'cigarette',eventId:old.id,openedAt:s.hour};
  assert.ok(validateSave(s));
  ensureManagement(s);
  assert.equal(s.management.pending,null);
  assert.ok(s.management.queue.some(q=>q.caseId==='cigarette'));
  s.pending=['hostess'];admit(s,'hostess');s.hour=40;tickManagement(s,addEvent);
  assert.equal(s.management.pending.caseId,'cigarette');
  const event=s.events.find(e=>e.id===s.management.pending.eventId);
  assert.deepEqual(event.cast,['cat','hostess']);
  const result=resolveManagementCase(s,event.id,'check',addEvent);
  assert.equal(result.lines[0].speaker,'manager');
  assert.ok(result.lines.some(l=>l.speaker==='cat')&&result.lines.some(l=>l.speaker==='hostess'));
  assert.ok(result.lines.length>=6);
  assert.ok(validateSave(s));
});

test('every consultation has a shouted trouble title and an escaped slam card',()=>{
  for(const [id,c] of Object.entries(MANAGEMENT_CASES)){
    assert.equal(typeof c.call,'string',id);
    assert.ok(c.call.endsWith('！'),id);
    assert.ok(c.call.length<=16,id+':'+c.call);
  }
  assert.equal(MANAGEMENT_CASES.cigarette.call,'モクのタバコがくせぇ！');
  const html=troubleCardHTML('<script>','slam');
  assert.ok(html.includes('トラブル発生！'));
  assert.ok(html.includes('trouble-card slam'));
  assert.ok(!html.includes('<script>'));
});

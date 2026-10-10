import { MANAGEMENT_CASES } from './event-cases.js';
import { createVisit, createRoomMove, sampleJourney } from './movement.js';

const managementClamp = (n, lo=0, hi=100) => Math.max(lo,Math.min(hi,n));
const MANAGEMENT_TYPES = ['cat','fox','hostess','sister','peko','ann'];
const MANAGEMENT_ACTIONS = ['idle','eat','sleep','smoke','drink','tv','clean','shop','chat','counsel','fight'];
const MANAGEMENT_METRICS = ['funds','safety','trust','buzz','solidarity','repairs','success'];
const MANAGEMENT_NEEDS = ['hunger','sleep','stress','hygiene','fun','alcohol','smoke'];

export function ensureManagement(state) {
  if (!state.management) {
    state.management={version:1,funds:22000,safety:70,trust:50,buzz:0,solidarity:0,repairs:0,success:0,includeSensitive:false,seed:(state.seed^0x6d2b79f5)>>>0||1,pending:null,queue:[],completed:[],decisions:[],nextAt:Math.max(30,state.hour+6),lastDay:Math.floor(state.hour/24),rentSeen:state.rent};
    for(let i=0;i<3;i++)managementRandom(state.management);
  }
  return state.management;
}
function managementRandom(m) {let x=m.seed;x^=x<<13;x^=x>>>17;x^=x<<5;m.seed=x>>>0;return m.seed/4294967296;}
const managementHasCast = (state,c) => c.cast.every(type=>state.residents.some(r=>r.type===type));

export function managementSummary(state) {
  const m=ensureManagement(state),rs=state.residents;
  const relations=rs.flatMap(r=>Object.values(r.relationships));
  const average=values=>values.reduce((a,b)=>a+b,0)/Math.max(1,values.length);
  return {...m,happiness:Math.round(average(rs.map(r=>managementClamp(100-(r.needs.stress+r.needs.hunger+r.needs.sleep)/3)))),neighbors:Math.round((average(relations)+100)/2)};
}

function managementApply(state,e={}) {
  const m=ensureManagement(state);
  for(const key of MANAGEMENT_METRICS) if(Number.isFinite(e[key])) {
    m[key]+=e[key];
    if(['safety','trust','buzz'].includes(key))m[key]=managementClamp(m[key]);
    if(['solidarity','repairs','success'].includes(key))m[key]=managementClamp(m[key],0,1000);
  }
  for(const r of state.residents) {
    const changes=e.residents?.[r.type]||{};
    if(Number.isFinite(e.allStress))r.needs.stress=managementClamp(r.needs.stress+e.allStress);
    for(const key of MANAGEMENT_NEEDS)if(Number.isFinite(changes[key]))r.needs[key]=managementClamp(r.needs[key]+changes[key]);
    if(Number.isFinite(changes.cash)) {r.cash+=changes.cash;if(r.cash<0){r.debt-=r.cash;r.cash=0;}}
    if(Number.isFinite(changes.debt))r.debt=Math.max(0,r.debt+changes.debt);
    if(Number.isFinite(changes.trash))r.trash=managementClamp(r.trash+changes.trash);
    // Show reactions in the observation scene, without interrupting a trip in progress.
    const action=e.scenes?.[r.type];
    if(action && (!r.journey || state.hour>=r.journey.endsAt)) {
      const from=sampleJourney(r,state.hour);
      const target=e.visit?.[0]===r.type?state.residents.find(other=>other.type===e.visit[1]):null;
      r.action=action;r.actionAge=0;
      r.journey=target?createVisit(r,state.hour,from,target.room):createRoomMove(r,state.hour,from,'table');
      r.storyUntil=Math.max(state.hour+2,r.journey.endsAt);
    }
  }
  for(const [a,b,delta] of e.relations||[]) {
    const ra=state.residents.find(r=>r.type===a),rb=state.residents.find(r=>r.type===b);
    if(!ra||!rb)continue;
    const value=managementClamp((ra.relationships[rb.id]||0)+delta,-100,100);
    ra.relationships[rb.id]=value;rb.relationships[ra.id]=value;
  }
}

export function managementImpact(e={}) {
  const labels={funds:'管理資金',safety:'安全',trust:'管理人への信頼',buzz:'話題',solidarity:'助け合い',repairs:'修繕',success:'小さな成功'};
  const parts=MANAGEMENT_METRICS.filter(k=>e[k]).map(k=>`${labels[k]} ${e[k]>0?'+':''}${k==='funds'?'¥':''}${e[k].toLocaleString('ja-JP')}`);
  if(e.allStress)parts.push(`全員のストレス ${e.allStress>0?'+':''}${e.allStress}`);
  if(e.relations?.length)parts.push(e.relations.some(r=>r[2]<0)?'ご近所の関係に変化':'ご近所の関係が改善');
  if(e.residents)parts.push('本人の暮らしにも変化');
  return parts.join(' / ')||'記録と、住人の返事が残った。';
}

export function openManagementCase(state,id,emit) {
  const m=ensureManagement(state),c=Object.hasOwn(MANAGEMENT_CASES,id)?MANAGEMENT_CASES[id]:null;
  if(state.ending||m.pending||!c||m.completed.includes(id)||!managementHasCast(state,c))return false;
  const rooms=c.cast.map(type=>state.residents.find(r=>r.type===type).room);
  const event=emit(state,'trouble',c.title,c.detail,rooms,'管理人への相談。返事を保留しても時間切れにはなりません。');
  event.caseId=id;event.cast=[...c.cast];event.stageOnly=true;event.lines=c.lines.map(([speaker,text])=>({speaker,text}));
  m.pending={caseId:id,eventId:event.id,openedAt:state.hour};
  return true;
}

export function resolveManagementCase(state,eventId,choiceId,emit) {
  const m=ensureManagement(state),p=m.pending,c=MANAGEMENT_CASES[p?.caseId];
  const choice=c?.choices.find(x=>x.id===choiceId);
  if(state.ending||!p||p.eventId!==Number(eventId)||!choice)return null;
  const original=state.events.find(e=>e.id===p.eventId),id=p.caseId;
  if(original){original.choiceId=choiceId;original.read=true;}
  managementApply(state,choice.effects);
  m.completed.push(id);m.decisions.push({caseId:id,choiceId,hour:state.hour});m.pending=null;m.nextAt=state.hour+16;
  let later=choice.follow;
  if(later) {
    // Roll once at commitment; store the selected outcome, never reroll on reload.
    if(Number.isFinite(later.chance)&&managementRandom(m)>=later.chance)later={...later,...later.failure};
    const {delay,title,text,effects={},next=null}=later;
    m.queue.push({dueAt:state.hour+delay,kind:'report',parentCase:id,parentEvent:p.eventId,cast:[...c.cast],title,text,effects,next});
  }
  const result=emit(state,'life','返事：'+choice.label,choice.reply,c.cast.map(type=>state.residents.find(r=>r.type===type).room),managementImpact(choice.effects));
  result.parentEvent=p.eventId;result.caseResult=id;
  result.stageOnly=true;
  result.cast=[...c.cast];
  const speaker=id==='collection'&&choiceId==='post'?'sister':c.cast[0];
  result.lines=[{speaker,text:choice.reply}];
  if(later)result.followAt=state.hour+later.delay;
  return result;
}

export function tickManagement(state,emit) {
  const m=ensureManagement(state),day=Math.floor(state.hour/24);
  // Resident rent and management funds are separate ledgers. Existing totals stay intact.
  m.funds+=Math.max(0,state.rent-m.rentSeen);m.rentSeen=state.rent;
  if(day>m.lastDay) {
    const cost=(1800+state.residents.length*300)*(day-m.lastDay);
    m.funds-=cost;m.safety=managementClamp(m.safety-(day-m.lastDay));m.lastDay=day;
    if(m.decisions.length && day%3===0)emit(state,'life','管理人の封筒。入ったお金と、出ていくお金。','家賃は集まる。でも共用灯も、階段も、黙って維持できるわけではない。',[],`直近の維持費 ¥${cost.toLocaleString('ja-JP')}。家賃の入金は管理資金にも加算。`);
  }
  for(const item of [...m.queue]) {
    if(item.kind!=='report'||item.dueAt>state.hour)continue;
    m.queue.splice(m.queue.indexOf(item),1);managementApply(state,item.effects);
    const report=emit(state,'life',item.title,item.text,state.residents.filter(r=>item.cast.includes(r.type)).map(r=>r.room),managementImpact(item.effects));
    report.parentEvent=item.parentEvent;report.followupOf=item.parentCase;
    report.stageOnly=true;
    report.cast=[...item.cast];
    report.lines=[{speaker:'narrator',text:item.text}];
    if(item.next&&!m.completed.includes(item.next)&&m.pending?.caseId!==item.next&&!m.queue.some(q=>q.kind==='case'&&q.caseId===item.next))m.queue.push({kind:'case',caseId:item.next,dueAt:state.hour+6});
  }
  // Keep one request available without forcing a modal or punishing delayed replies.
  if(m.pending||state.hour<m.nextAt||state.hour>392)return;
  const chain=m.queue.find(q=>q.kind==='case'&&q.dueAt<=state.hour&&managementHasCast(state,MANAGEMENT_CASES[q.caseId]));
  if(chain) {
    m.queue.splice(m.queue.indexOf(chain),1);
    if(openManagementCase(state,chain.caseId,emit))return;
  }
  const eligible=Object.entries(MANAGEMENT_CASES).filter(([id,c])=>!c.chain&&(!c.sensitive||m.includeSensitive)&&!m.completed.includes(id)&&managementHasCast(state,c)&&state.hour>=(c.day-1)*24&&(!c.requires||m.completed.includes(c.requires)));
  if(!eligible.length)return;
  // Prefer residents who have had fewer requests, so the newest arrival gets a voice.
  const count=type=>m.decisions.filter(d=>MANAGEMENT_CASES[d.caseId].cast[0]===type).length;
  const minimum=Math.min(...eligible.map(([,c])=>count(c.cast[0])));
  const fair=eligible.filter(([,c])=>count(c.cast[0])===minimum);
  const [id]=fair[Math.floor(managementRandom(m)*fair.length)];
  openManagementCase(state,id,emit);
}

export function managementEnding(state) {
  const m=managementSummary(state);
  if(m.decisions.length<3)return null;
  if(m.funds<0)return {name:'管理人の財布だけ、退去しました',text:'直した壁も、立て替えた食費も、誰かの役には立った。\nでも管理費の封筒だけは、もう膨らまない。\n「来週には払うから」。今日は管理人も、同じことを言った。'};
  if(m.safety<=25)return {name:'全員、鍵を返す前夜',text:'話題は増えた。暮らしにくさは、もっと増えた。\n玄関前の行列と修繕の貼り紙を見て、住人たちは別の帰り道を探し始めた。\n最後の夜だけ、妙に静かなけもの荘だった。'};
  if(m.success>=3&&m.funds>=60000)return {name:'家主は、ご近所だった',text:'配膳、撮影、相談仕事。小さな成功を持ち寄るうち、\n住人たちは修繕に口を出せるくらいのお金を貯めた。\n「買い取るなら、先に壁を厚くしよう」。\n明日からの大家候補は、今日も隣に住んでいる。'};
  if(m.buzz>=65)return {name:'住める炎上スポット',text:'困りごとの後始末が、いつの間にか名物になった。\n写真を撮りたい人と、静かに寝たい人。\n観光案内に載っても、ゴミ当番は減らなかった。'};
  if(m.solidarity>=8&&m.trust>=60&&m.safety>=60&&m.neighbors>=40)return {name:'ろくでもない、助け合い',text:'誰も立派になったわけではない。\nただ、空のお皿を返すとき、次の人の分を少し残すようになった。\nお金はあまり増えていない。帰る場所への気持ちは、少し増えた。'};
  return null;
}

function validManagementEffects(e) {
  if(!e||typeof e!=='object'||Array.isArray(e))return false;
  if(Object.keys(e).some(k=>![...MANAGEMENT_METRICS,'residents','relations','allStress','scenes','visit'].includes(k)))return false;
  if([...MANAGEMENT_METRICS,'allStress'].some(k=>k in e&&!Number.isFinite(e[k])))return false;
  if(e.residents)for(const [type,changes]of Object.entries(e.residents)) {
    if(!MANAGEMENT_TYPES.includes(type)||!changes||typeof changes!=='object'||Object.entries(changes).some(([k,v])=>![...MANAGEMENT_NEEDS,'cash','debt','trash'].includes(k)||!Number.isFinite(v)))return false;
  }
  if(e.relations&&(!Array.isArray(e.relations)||e.relations.some(r=>!Array.isArray(r)||r.length!==3||!MANAGEMENT_TYPES.includes(r[0])||!MANAGEMENT_TYPES.includes(r[1])||!Number.isFinite(r[2]))))return false;
  if(e.scenes&&Object.entries(e.scenes).some(([t,a])=>!MANAGEMENT_TYPES.includes(t)||!MANAGEMENT_ACTIONS.includes(a)))return false;
  if(e.visit&&(!Array.isArray(e.visit)||e.visit.length!==2||!e.visit.every(t=>MANAGEMENT_TYPES.includes(t))))return false;
  return true;
}

export function validManagement(state) {
  // Validate scene IDs even in otherwise old saves; inherited object keys aren't cases.
  for(const event of state.events) {
    if(event.caseId!==undefined&&(!Object.hasOwn(MANAGEMENT_CASES,event.caseId)||(event.choiceId!==undefined&&!MANAGEMENT_CASES[event.caseId].choices.some(c=>c.id===event.choiceId))))return false;
    if(event.cast!==undefined&&(!Array.isArray(event.cast)||!event.cast.every(type=>MANAGEMENT_TYPES.includes(type))))return false;
    if(event.stageOnly!==undefined&&typeof event.stageOnly!=='boolean')return false;
    if(event.lines!==undefined&&(!Array.isArray(event.lines)||event.lines.some(l=>!l||typeof l.text!=='string'||typeof l.speaker!=='string')))return false;
  }
  const m=state.management;if(m===undefined)return true; // Existing saves migrate lazily.
  if(!m||m.version!==1||!MANAGEMENT_METRICS.every(k=>Number.isFinite(m[k]))||!Number.isInteger(m.seed)||!Number.isFinite(m.nextAt)||!Number.isFinite(m.lastDay)||!Number.isFinite(m.rentSeen)||!Array.isArray(m.completed)||!Array.isArray(m.decisions)||!Array.isArray(m.queue)||m.queue.length>64)return false;
  if(m.includeSensitive!==undefined&&typeof m.includeSensitive!=='boolean')return false;
  if(['safety','trust','buzz'].some(k=>m[k]<0||m[k]>100)||['solidarity','repairs','success'].some(k=>m[k]<0))return false;
  const known=id=>typeof id==='string'&&Object.hasOwn(MANAGEMENT_CASES,id);
  if(m.completed.some(id=>!known(id))||new Set(m.completed).size!==m.completed.length||m.decisions.length>64||m.decisions.some(d=>!d||!known(d.caseId)||!MANAGEMENT_CASES[d.caseId].choices.some(c=>c.id===d.choiceId)||!Number.isFinite(d.hour)))return false;
  if(m.pending!==null) {
    const p=m.pending,c=known(p?.caseId)?MANAGEMENT_CASES[p.caseId]:null;
    if(!c||m.completed.includes(p.caseId)||!managementHasCast(state,c)||!Number.isFinite(p.openedAt)||!Number.isInteger(p.eventId)||!state.events.some(e=>e.id===p.eventId&&e.caseId===p.caseId))return false;
  }
  for(const q of m.queue) {
    if(!q||!Number.isFinite(q.dueAt))return false;
    if(q.kind==='case') {if(!known(q.caseId)||!MANAGEMENT_CASES[q.caseId].chain)return false;}
    else if(q.kind==='report') {
      if(!known(q.parentCase)||!Number.isInteger(q.parentEvent)||!Array.isArray(q.cast)||!q.cast.every(t=>MANAGEMENT_TYPES.includes(t))||typeof q.title!=='string'||typeof q.text!=='string'||!validManagementEffects(q.effects)||(q.next!==null&&(!known(q.next)||!MANAGEMENT_CASES[q.next].chain)))return false;
    } else return false;
  }
  return true;
}

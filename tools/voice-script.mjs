import {DUEL_ROUNDS,duelChoices,duelEncounterLines,duelReplyLines,duelEndingLines} from '../src/act-two-duel.js';
import {ACT_TWO_OBSERVATION_BEATS} from '../src/act-two-observation.js';
import {secondActLife,secondActChat,lunaMutters} from '../src/act-two-life.js';
import {OBSERVATION_BEATS} from '../src/act-one-observation.js';
import {PROLOGUE_CUTS,INITIAL_MOKU_LINES} from '../src/opening-prologue.js';
import {ACT_TWO_OPENING_SCENES} from '../src/act-two-opening.js';
import {ACT_ONE_EVENTS,createActOne,advanceActOne,answerActOne,getActOneChoices,rewindBeforeFire,rewindActOne} from '../src/act-one.js';
import {ACT_TWO_EVENTS,beginActTwo,advanceActTwo,answerActTwo,rewindActTwo} from '../src/act-two.js';
import {firstActLife,firstActMutters} from '../src/act-one-life.js';
import {voiceSpeaker,voicePerformance,voiceLineKey} from '../src/voice-policy.js';
import {createHash} from 'node:crypto';
export const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
export const normalizeVoiceIds=ids=>ids.characters?Object.fromEntries(Object.entries(ids.characters).map(([speaker,value])=>[speaker,value.voiceId||null])):ids;
// Match playback's chapter-two lookup, including epilogues and all failure routes.
export function extractCompleteVoiceScript(){
  const ambient=[],state=createActOne(1,[],2,true);beginActTwo(state);
  state.actOne.started=true;state.actOne.prologuePending=false;state.actOne.titlePending=false;
  for(let tick=0;tick<=1920;tick++){
    state.hour=57+tick/40;secondActLife(state,.025);
    const chat=secondActChat(state);
    const lines=[...(!chat?.observationId?chat?.lines||[]:[]).map(([speaker,text])=>({speaker,text})),...lunaMutters(state).map(text=>({speaker:'hostess',text}))];
    for(const line of lines)ambient.push({source:'act2/ambient/complete',line,speaker:voiceSpeaker(line)});
  }
  const rows=[...extractVoiceScript('all'),...extractVoiceScript('act2-trouble1'),...ambient].map(row=>{
    const line=row.source.startsWith('act2/')?{...row.line,voiceChapter:2}:row.line;
    return {...row,line,lineKey:voiceLineKey(line),performance:voicePerformance(line)};
  });
  return [...new Map(rows.map(row=>[row.lineKey,row])).values()];
}
export function extractVoiceScript(scope='intro') {
  if(!['intro','act1','act2','act2-trouble1','act2-duel','all'].includes(scope))throw Error('Unknown scope');
  const result=[];
  const add=(source,lines)=>lines.forEach((line,index)=>{
    if(line.silent)return;
    if(scope==='act2-trouble1')line={...line,voiceChapter:2};
    const speaker=voiceSpeaker(line);
    if(['cat','manager','hostess'].includes(speaker))result.push({source:source+':'+index,line,speaker,performance:voicePerformance(line),lineKey:voiceLineKey(line)});
  });
  if(scope==='act2-duel'){
    for(let round=0;round<4;round++){
      add('act2/duel/round-'+round,duelEncounterLines(round));
      for(const choice of duelChoices(round))add('act2/duel/'+round+'/'+choice.id,duelReplyLines(round,choice));
    }
    // The victory call belongs to the mini-game; full-size ending scenes do not.
    add('act2/duel/victory',duelEndingLines('clear').filter(line=>!line.duelEnding));
    return [...new Map(result.map(row=>[row.lineKey,row])).values()];
  }
  if(['act2','act2-trouble1','all'].includes(scope))for(const beat of ACT_TWO_OBSERVATION_BEATS)add('act2/observation/'+beat.id,beat.lines);
  const state=createActOne(1);
  if(scope==='act2-trouble1'){
    for(const shot of ACT_TWO_OPENING_SCENES)add('act2/film/'+shot.shot,shot.cues.filter(c=>!c.silent));
    beginActTwo(state);state.actOne.started=true;state.actOne.prologuePending=false;state.actOne.titlePending=false;
    add('act2/opening',state.events.find(e=>e.actScene==='act2-prologue').lines);
    const start=structuredClone(state);
    const ambient=new Set();
    for(let i=0;i<1000&&!state.actOne.pending;i++){
      const chat=secondActChat(state);
      if(chat&&!chat.observationId&&!ambient.has(chat.key)){ambient.add(chat.key);add('act2/observation/'+chat.key,chat.lines.map(([speaker,text])=>({speaker,text})));}
      for(const text of lunaMutters(state))if(!ambient.has(text)){ambient.add(text);add('act2/ambient',[{speaker:'hostess',text}]);}
      advanceActTwo(state,.025);
    }
    if(state.actOne.pending?.scene!=='bag')throw Error('First act-two trouble not reached');
    add('act2/bag',ACT_TWO_EVENTS.bag.lines);
    for(const choice of ACT_TWO_EVENTS.bag.choices)add('act2/bag/'+choice.id,choice.lines);
    for(const attempt of [1,2]){
      const entry=structuredClone(start);entry.actOne.attempt=attempt;advanceActTwo(entry,100);
      add('act2/bag/attempt-'+attempt,entry.events.find(e=>e.id===entry.actOne.pending.eventId).lines);
      for(const choice of ACT_TWO_EVENTS.bag.choices){
        const next=structuredClone(entry),reply=answerActTwo(next,next.actOne.pending.eventId,choice.id);
        add('act2/bag/runtime/'+attempt+'/'+choice.id,reply.lines);
        if(next.actOne.status==='bad'){
          const rewind=rewindActTwo(next);
          add('act2/bag/rewind/'+attempt+'/'+choice.id,rewind.events.find(e=>e.actScene==='act2-rewind').lines);
        }
      }
    }
    return [...new Map(result.map(r=>[r.lineKey,r])).values()];
  }

  if(scope!=='act2'){
    add('prologue',PROLOGUE_CUTS);
    add('foyer',INITIAL_MOKU_LINES);
    add('act1/opening',state.events[0].lines);
    // Ambient bubbles vary with walking/timing. Enumerate existing runtime pools,
    // in earliest possible order, without maintaining another copy of their text.
    state.actOne.started=true;firstActLife(state);
    const seen=new Set();
    for(let i=0;i<=100;i++){
      if(i)advanceActOne(state,0.025);
      const pool=firstActMutters(state)||[];
      for(const [index,text] of pool.entries())if(!seen.has(text)){seen.add(text);add('act1/ambient/'+state.hour.toFixed(3)+'/'+index,[{speaker:'cat',text}]);}
      if(state.actOne.pending)break;
    }
    if(scope==='intro')add('act1/ash',ACT_ONE_EVENTS.ash.lines);
    else for(const [scene,event] of Object.entries(ACT_ONE_EVENTS)){
      add('act1/'+scene,event.lines);
      for(const choice of event.choices)add('act1/'+scene+'/'+choice.id,choice.lines);
    }
  }
  if(['act1','all'].includes(scope))for(const beat of OBSERVATION_BEATS)add('act1/observation/'+beat.id,beat.lines);
  if(['act2','all'].includes(scope)){
    for(const shot of ACT_TWO_OPENING_SCENES)add('act2/film/'+shot.shot,shot.cues.filter(cue=>!cue.silent));
    beginActTwo(state);add('act2/opening',state.events.find(e=>e.actScene==='act2-prologue').lines);
    // beginActTwo prepends its prologue event.
    for(const [scene,event] of Object.entries(ACT_TWO_EVENTS)){
      add('act2/'+scene,event.lines);
      for(const choice of event.choices)add('act2/'+scene+'/'+choice.id,choice.lines);
    }
  }
  if(scope!=='intro'){
    // Execute the existing state transitions to discover authored epilogues,
    // inner voices and rewind variants. Never parse or duplicate dialogue strings.
    const known=new Set(result.map(r=>r.lineKey));
    const discover=(s,chapter,path)=>{
      for(const event of s.events){
        const fresh=(event.lines||[]).filter(line=>!known.has(voiceLineKey(line)));
        add(`act${chapter}/runtime/${path}/${event.actScene}`,fresh);
        for(const line of fresh)known.add(voiceLineKey(line));
      }
    };
    const walk=(s,chapter,path,depth=0)=>{
      if(depth>7)throw Error('Unexpected story branch depth');
      const advance=chapter===1?advanceActOne:advanceActTwo;
      if(chapter===1){
        // Visit the actual daily schedule on every safe branch, including travel
        // and the post-ash period, rather than sampling only opening mutters.
        for(let i=0;i<2400&&s.actOne.status==='playing'&&!s.actOne.pending;i++){
          firstActLife(s);
          const fresh=(firstActMutters(s)||[]).map(text=>({speaker:'cat',text})).filter(line=>!known.has(voiceLineKey(line)));
          add(`act1/ambient/runtime/${path}/${s.hour.toFixed(3)}`,fresh);
          for(const line of fresh)known.add(voiceLineKey(line));
          advance(s,0.025);
        }
        if(s.actOne.pending){
          const fresh=(firstActMutters(s)||[]).map(text=>({speaker:'cat',text})).filter(line=>!known.has(voiceLineKey(line)));
          add(`act1/ambient/runtime/${path}/pending`,fresh);
          for(const line of fresh)known.add(voiceLineKey(line));
        }
      }else for(let i=0;i<8&&s.actOne.status==='playing'&&!s.actOne.pending;i++)advance(s,100);
      discover(s,chapter,path);
      if(!s.actOne.pending)return;
      const scene=s.actOne.pending.scene;
      if(chapter===2&&scene==='duel'){
        for(let round=0;round<4;round++){
          add('act2/duel/round-'+round,duelEncounterLines(round));
          for(const choice of duelChoices(round))add('act2/duel/'+round+'/'+choice.id,duelReplyLines(round,choice));
        }
        for(const ending of ['clear','yandere','domination'])add('act2/duel/'+ending,duelEndingLines(ending));
        const next=structuredClone(s);
        for(const id of ['boundary','receipt','cancel','leave'])answerActTwo(next,next.actOne.pending.eventId,id);
        discover(next,chapter,path+'/duel');walk(next,chapter,path+'/duel',depth+1);return;
      }
      const choices=chapter===1?getActOneChoices(s,scene):ACT_TWO_EVENTS[scene].choices;
      for(const choice of choices){
        const next=structuredClone(s);
        (chapter===1?answerActOne:answerActTwo)(next,next.actOne.pending.eventId,choice.id);
        const branch=path+'/'+scene+'/'+choice.id;
        discover(next,chapter,branch);
        if(next.actOne.status==='bad'){
          discover(chapter===1?rewindBeforeFire(next):rewindActTwo(next),chapter,branch+'/rewind');
          if(chapter===1)discover(rewindActOne(next),chapter,branch+'/restart');
        }else walk(next,chapter,branch,depth+1);
      }
    };
    if(scope!=='act2')for(const attempt of [1,2,3])walk(createActOne(1,[],attempt,true),1,'attempt-'+attempt);
    if(scope!=='act1'){
      const second=createActOne(1,[],2,true);beginActTwo(second);
      second.actOne.started=true;second.actOne.prologuePending=false;second.actOne.titlePending=false;
      walk(second,2,'attempt-1');
    }
  }
  return result;
}
export const voiceRoomNumberReading=text=>text.replace(/([1-9][0-9]{2})号室/g,(_,number)=>[...number].map(d=>['まる','いち','に','さん','よん','ご','ろく','なな','はち','きゅう'][Number(d)]).join('')+'ごうしつ');
export function planVoices(rows,ids,config,pronunciations=[],repairs=[]){
  ids=normalizeVoiceIds(ids);
  return rows.map(row=>{
    const profile=config.profiles[row.performance];
    if(config.model!=='eleven_v3'&&profile.tags.length)throw Error('Audio tags require the reviewed eleven_v3 model');
    // Change only the spoken spelling; displayed dialogue and lookup keys stay canonical.
    const duelReadings=row.performance.startsWith('duel-')?[{term:'大家流',reading:'おおやりゅう'},{term:'漢気',reading:'おとこぎ'},{term:'煙ノ',reading:'けむりの'},{term:'肉球乱舞',reading:'にくきゅうらんぶ'}]:[];
    const filmReadings=row.performance==='luna-film-tense'?[{term:'入居者',reading:'にゅうきょしゃ'},{term:'募集',reading:'ぼしゅう'}]:[];
    const repair=repairs.find(r=>r.speaker===row.speaker&&r.text===row.line.text);
    const spokenText=voiceRoomNumberReading(repair?.spokenText??[...filmReadings,...duelReadings,...pronunciations].sort((a,b)=>b.term.length-a.term.length).reduce((text,rule)=>text.replaceAll(rule.term,rule.reading),row.line.text));
    const request={text:[...(repair?.tags||profile.tags),spokenText].join(' '),model_id:config.model,voice_settings:{...profile.settings,...repair?.settings}};
    if(/\[(?:softly|whispers?|whispering|mumbling)\]/i.test(request.text))throw Error('Voice delivery must be clear and projected; whisper/mumble tags are disabled');
    const voiceId=ids[row.speaker]||null;
    const hash=digest({voiceId,request,performance:row.performance,format:config.outputFormat});
    return {...row,text:row.line.text,voiceId,request,hash,file:'assets/voices/'+hash+'.mp3',characters:Array.from(row.line.text).length,billableCharacters:Array.from(request.text).length,direction:profile.direction};
  });
}

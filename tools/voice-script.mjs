import {PROLOGUE_CUTS,INITIAL_MOKU_LINES} from '../src/opening-prologue.js';
import {ACT_ONE_EVENTS,createActOne,advanceActOne,answerActOne,getActOneChoices,rewindBeforeFire,rewindActOne} from '../src/act-one.js';
import {ACT_TWO_EVENTS,beginActTwo,advanceActTwo,answerActTwo,rewindActTwo} from '../src/act-two.js';
import {firstActLife,firstActMutters} from '../src/act-one-life.js';
import {voiceSpeaker,voicePerformance,voiceLineKey} from '../src/voice-policy.js';
import {createHash} from 'node:crypto';
export const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
export const normalizeVoiceIds=ids=>ids.characters?Object.fromEntries(Object.entries(ids.characters).map(([speaker,value])=>[speaker,value.voiceId||null])):ids;
export function extractVoiceScript(scope='intro') {
  if(!['intro','act1','act2','all'].includes(scope))throw Error('Unknown scope');
  const result=[];
  const add=(source,lines)=>lines.forEach((line,index)=>{
    const speaker=voiceSpeaker(line);
    if(['cat','manager','hostess'].includes(speaker))result.push({source:source+':'+index,line,speaker,performance:voicePerformance(line),lineKey:voiceLineKey(line)});
  });
  const state=createActOne(1);
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
  if(['act2','all'].includes(scope)){
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
      if(depth>3)throw Error('Unexpected story branch depth');
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
export function planVoices(rows,ids,config,pronunciations=[]){
  ids=normalizeVoiceIds(ids);
  return rows.map(row=>{
    const profile=config.profiles[row.performance];
    if(config.model!=='eleven_v3'&&profile.tags.length)throw Error('Audio tags require the reviewed eleven_v3 model');
    // Change only the spoken spelling; displayed dialogue and lookup keys stay canonical.
    const spokenText=[...pronunciations].sort((a,b)=>b.term.length-a.term.length).reduce((text,rule)=>text.replaceAll(rule.term,rule.reading),row.line.text);
    const request={text:[...profile.tags,spokenText].join(' '),model_id:config.model,voice_settings:profile.settings};
    const voiceId=ids[row.speaker]||null;
    const hash=digest({voiceId,request,performance:row.performance,format:config.outputFormat});
    return {...row,text:row.line.text,voiceId,request,hash,file:'assets/voices/'+hash+'.mp3',characters:Array.from(row.line.text).length,billableCharacters:Array.from(request.text).length,direction:profile.direction};
  });
}

import {extractCompleteVoiceScript} from './voice-script.mjs';
import {VOICE_MANIFEST} from '../src/voice-manifest.js';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const catalog=[];
for(const row of extractCompleteVoiceScript()){
 const chapter=row.source.startsWith('act2/')?2:1,s=row.source,l=row.line;
 let scene='ambient',label='日常の独り言',order=90;
 if(s.includes('/observation/')){scene=chapter===2?(s.includes('four-kings')?'observation2':'observation1'):'observation';label=chapter===2?(scene==='observation2'?'観察2｜ルナと四天王':'観察1｜新入りの味方'):'観察パート';order=20;}
 else if(l.epilogueScene||s.includes('/epilogue')){scene='ending';label='エンディング';order=80;}
 else if(l.duelEnding&&l.duelEnding!=='clear'||/\/duel\/(yandere|domination)/.test(s)){scene='bad';label='バトル後のBAD END';order=75;}
 else if(s.includes('/rewind')){scene='rewind';label='巻き戻り後の会話';order=70;}
 else if(Number.isInteger(l.duelRound)||/\/duel\/(?:round-|[0-3]\/)/.test(s)){scene='battle';label='ミニゲームバトル';order=60;}
 else if(s.includes('/duel')){scene='duel-intro';label='トラブル2｜バトル前後の会話';order=50;}
 else if(s.includes('/ash')){scene='ash';label='トラブル1｜灰皿の火事';order=30;}
 else if(s.includes('/dinner')){scene='dinner';label='トラブル2｜料理';order=40;}
 else if(s.includes('/bag')){scene='bag';label='トラブル1｜夕暮れの待ち伏せ';order=30;}
 else if(s.startsWith('prologue')||s.startsWith('foyer')||s.includes('/opening')||s.includes('/film/')){scene='opening';label='プロローグ・オープニング';order=10;}
 const clip=VOICE_MANIFEST[row.lineKey];if(!clip)throw Error('Voice missing: '+row.source);
 const bytes=await readFile(new URL('../'+(clip.fastFile||clip.file),import.meta.url));
 const repaired=!!clip.audioQuality||/\.repair\.mp3$/.test(clip.file);
 const repairComment=clip.repairComment||(clip.audioQuality?[clip.audioQuality.restoredFrom?'録音を復元。':'',clip.audioQuality.edgeSilenceTrimmed?'前後の余分な無音を調整。':'',clip.audioQuality.peakReductionDB?'音量のピークを抑制。':''].join(''):repaired?'音声を再生成し、音量を調整。':'');
 catalog.push({id:row.lineKey,repaired,...(repairComment?{repairComment}:{}),chapter,scene:chapter+':'+scene,sceneLabel:label,order,source:s,line:{...l,speaker:row.speaker},version:createHash('sha256').update(bytes).digest('hex').slice(0,20)});
}
catalog.sort((a,b)=>a.chapter-b.chapter||a.order-b.order||a.source.localeCompare(b.source,'ja',{numeric:true}));
await writeFile(new URL('../src/voice-review-catalog.js',import.meta.url),'// Generated from the current playable script; rebuild with tools/build-voice-review.mjs.\nexport const VOICE_REVIEW_CATALOG = '+JSON.stringify(catalog,null,2)+';\n');
console.log('Voice review catalog: '+catalog.length+' recordings');

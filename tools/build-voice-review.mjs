import {extractCompleteVoiceScript} from './voice-script.mjs';
import {VOICE_MANIFEST} from '../src/voice-manifest.js';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {voiceReviewValidatePublished} from '../src/voice-review-release.js';
import {tracePlayableVoiceLines} from './voice-reachability.mjs';
const published=voiceReviewValidatePublished(JSON.parse(await readFile(new URL('../config/voice-review-published.json',import.meta.url),'utf8')));
await writeFile(new URL('../src/voice-review-published.js',import.meta.url),'// Generated; contains decisions only, never private notes.\nexport const VOICE_REVIEW_PUBLISHED = '+JSON.stringify(published,null,2)+';\n');
const catalog=[];
const reachable=tracePlayableVoiceLines(VOICE_MANIFEST);
const previous=await import('../src/voice-review-catalog.js');
const retired=new Map((previous.VOICE_REVIEW_RETIRED||[]).map(row=>[row.id,row]));
for(const row of extractCompleteVoiceScript()){
 const witness=reachable.lines.get(row.lineKey);
 const replaceSource=/\/freezer:|\/restart\/|\/ambient\/|\/ambient:|\/undefined:/.test(row.source);
 const s=replaceSource&&witness?witness.source:row.source;
 const chapter=s.startsWith('act3/')?3:s.startsWith('act2/')?2:1,l=row.line;
 if(!reachable.lines.has(row.lineKey)){
  // Keep short IDs importable for reports exported before this cleanup. This is
  // an identity index only: no recording, player row or review target is created.
  retired.set(row.lineKey,{id:row.lineKey,reviewId:createHash('sha256').update(row.lineKey).digest('hex').slice(0,16),chapter,sceneLabel:'旧台詞（確認対象外）',source:s});
  continue;
 }
 retired.delete(row.lineKey);
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
 if(s.startsWith('act3/map/')){const id=s.split('/')[2].split(':')[0];scene='map-'+id;label=({departure:'出発',crossing:'交差点',detour:'裏道の爆発',store:'コンビニ・ミミ',bridge:'橋の悲劇',return:'コンビニへの帰還'})[id]||id;order=30+['departure','crossing','detour','store','bridge','return'].indexOf(id);}
 else if(s.startsWith('act3/after/')){scene='after';label='死に戻り後・再出発';order=20;}
 const clip=VOICE_MANIFEST[row.lineKey];if(!clip)throw Error('Voice missing: '+row.source);
 const bytes=await readFile(new URL('../'+(clip.fastFile||clip.file),import.meta.url));
 const repaired=!!clip.audioQuality||/\.repair\.mp3$/.test(clip.file);
 const repairComment=clip.repairComment||(clip.audioQuality?[clip.audioQuality.restoredFrom?'録音を復元。':'',clip.audioQuality.edgeSilenceTrimmed?'前後の余分な無音を調整。':'',clip.audioQuality.peakReductionDB?'音量のピークを抑制。':''].join(''):repaired?'音声を再生成し、音量を調整。':'');
 catalog.push({id:row.lineKey,reviewId:createHash('sha256').update(row.lineKey).digest('hex').slice(0,16),repaired,...(clip.repairReview?{repairReview:true}:{}),...(repairComment?{repairComment}:{}),chapter,scene:chapter+':'+scene,sceneLabel:label,order,source:s,line:{...l,speaker:row.speaker,...(l.speaker==='大家（心の声）'?{innerVoice:true}:{})},version:createHash('sha256').update(bytes).update(clip.reviewRevision||'').digest('hex').slice(0,20)});
}
catalog.sort((a,b)=>a.chapter-b.chapter||a.order-b.order||a.source.localeCompare(b.source,'ja',{numeric:true}));
await writeFile(new URL('../src/voice-review-catalog.js',import.meta.url),'// Generated from reachable gameplay; rebuild with tools/build-voice-review.mjs.\nexport const VOICE_REVIEW_CATALOG = '+JSON.stringify(catalog,null,2)+';\n// Historical short IDs are retained for import only, never for playback or review.\nexport const VOICE_REVIEW_RETIRED = '+JSON.stringify([...retired.values()],null,2)+';\n');
console.log(`Voice review catalog: ${catalog.length} recordings; ${retired.size} retired identities; ${reachable.missing.length} reachable lines without recordings`);

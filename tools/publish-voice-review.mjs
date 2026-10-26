import {readFile,writeFile} from 'node:fs/promises';
import {VOICE_REVIEW_CATALOG} from '../src/voice-review-catalog.js';
import {voiceReviewParseReport,voiceReviewPublishReport} from '../src/voice-review-release.js';
const input=process.argv[2];if(!input)throw Error('Usage: node tools/publish-voice-review.mjs <export.txt or backup.json>');
const target=new URL('../config/voice-review-published.json',import.meta.url);
const existing=JSON.parse(await readFile(target,'utf8'));
const next=voiceReviewPublishReport(existing,voiceReviewParseReport(await readFile(input,'utf8'),VOICE_REVIEW_CATALOG),VOICE_REVIEW_CATALOG);
await writeFile(target,JSON.stringify(next,null,2)+'\n');
console.log(`Published review decisions: ${Object.keys(next.decisions).length}. Run npm run build, test and deploy with the repaired audio.`);

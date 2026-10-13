import {createRequire} from 'node:module';
import {join,resolve} from 'node:path';
import {mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const require=createRequire(join(process.env.FERAL_ASSET_MODULE_ROOT,'package.json'));
const {chromium}=require('playwright');
process.env.PORT='4174';
await import('../server.mjs');
const browser=await chromium.launch({headless:true,channel:'msedge'});
const page=await browser.newPage({viewport:{width:1672,height:941}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const check=(x,msg)=>{if(!x)throw new Error(msg);};
await mkdir('docs/dialogue-preview',{recursive:true});
await page.goto('http://127.0.0.1:4174/');
await page.click('[data-act-start]');
await page.waitForSelector('.conversation-modal[open]');
await page.click('[data-dialogue-next]');
check((await page.locator('.stage-bubble').innerText()).includes('新しい大家さん'),'New game automatically stages Moku opening');
await page.screenshot({path:'docs/dialogue-preview/opening.png'});
await page.click('[data-event-skip]');
await page.click('[data-close]:visible');
await page.click('#new-game');await page.click('[data-restart]');
await page.click('[data-act-start]');
await page.waitForSelector('.conversation-modal[open]');
await page.click('[data-dialogue-next]');
check((await page.locator('.stage-bubble').innerText()).includes('新しい大家さん'),'Restart also stages opening');
const saved=await page.evaluate(()=>localStorage.getItem('feral-act-one-v1'));
for(const [id,choice]of [['cigarette','check'],['cigarette','inspect'],['cigarette','leave'],['quit_smoking','no_pressure'],['jobs','stall']]){
  await page.goto('http://127.0.0.1:4174/index.html?preview=events&case='+id);
  await page.waitForSelector('#request-notice:visible');await page.click('#request-notice');
  await page.click('[data-event-skip]');
  check(await page.locator('[data-choice]').count()===3,id+' has exactly three answers');
  await page.click('[data-choice="'+choice+'"]');
  check(await page.locator('[data-choice]').count()===0,'Answer resolves immediately');
  await page.click('[data-dialogue-next]');
  await page.locator('.stage-character img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
  await page.screenshot({path:'docs/dialogue-preview/'+id+'-'+choice+'.png'});
  if(id==='cigarette'&&choice==='check'){
    await page.click('[data-dialogue-next]');
    check(await page.locator('[data-character="hostess"]').getAttribute('data-emotion')==='surprised','Immediate incredulous expression');
    check((await page.locator('.stage-bubble').innerText()).includes('匂いに、線が見える'),'Specific human response follows pause');
    await page.setViewportSize({width:390,height:844});
    check(await page.evaluate(()=>document.body.scrollWidth<=innerWidth),'Mobile has no horizontal overflow');
    await page.screenshot({path:'docs/dialogue-preview/mobile-reaction.png'});
    await page.setViewportSize({width:1672,height:941});
  }
  if(id==='quit_smoking'){
    check((await page.locator('.stage-bubble').innerText()).includes('ネムが口を閉じた'),'Silence is immediately visible');
    await page.click('[data-dialogue-next]');
    check(await page.locator('[data-character="cat"]').getAttribute('data-emotion')==='angry','Elder sister objects instead of blaming younger sister');
  }
  await page.click('[data-event-log]');
  check((await page.locator('.conversation-log').innerText()).length>80,'Full response is available in LOG');
}
check(await page.evaluate(()=>localStorage.getItem('feral-act-one-v1'))===saved,'Preview leaves normal save intact');
await page.goto(pathToFileURL(resolve('play.html')).href+'?preview=events&case=jobs',{timeout:60000});
await page.waitForSelector('#request-notice:visible');await page.click('#request-notice');await page.click('[data-event-skip]');
await page.click('[data-choice="match"]');await page.click('[data-dialogue-next]');
check((await page.locator('.stage-bubble').innerText()).includes('パンを焼く仕事'),'Generated standalone contains new dialogue');
check(await page.locator('[data-character="peko"]').getAttribute('data-emotion')==='surprised','Standalone preserves explicit emotion');
await page.screenshot({path:'docs/dialogue-preview/standalone.png'});
check(!errors.length,errors.join('\n'));
await browser.close();
console.log('Verified opening/restart, all three cigarette answers, sister and job reactions, mobile, LOG and standalone.');
process.exit(0);

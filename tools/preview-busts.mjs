import {createRequire} from 'node:module';
import {join,resolve} from 'node:path';
import {mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const require=createRequire(join(process.env.FERAL_ASSET_MODULE_ROOT,'package.json'));
const {chromium}=require('playwright');
await mkdir('docs/bust-preview',{recursive:true});
await import('../server.mjs');
const browser=await chromium.launch({headless:true,channel:'msedge'});
const page=await browser.newPage({viewport:{width:1500,height:1100}});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.route('**/favicon.ico',r=>r.fulfill({status:204}));
const check=(condition,message)=>{if(!condition)throw new Error(message);};
await page.goto(pathToFileURL(resolve('会話表情一覧.html')).href);
for(const type of process.argv.includes('--scene-only')?[]:['cat','hostess','fox','ann','peko','sister']){
  await page.selectOption('#resident',type);
  await page.locator('.card img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
  check(await page.locator('.card img').count()===7,'Seven emotions per resident');
  await page.screenshot({path:`docs/bust-preview/${type}.png`,fullPage:true});
}
for(const viewport of [{width:1672,height:941},{width:1366,height:768},{width:390,height:844}]){
  await page.setViewportSize(viewport);
  await page.goto('http://localhost:4173/index.html?preview=events&case=cigarette');
  await page.waitForSelector('#request-notice:visible');
  await page.click('#request-notice');
  await page.click('[data-dialogue-next]');
  await page.locator('.stage-character img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
  check(await page.locator('.stage-character[data-character="hostess"]').getAttribute('data-emotion')==='angry','Directed hostess anger');
  check(await page.evaluate(()=>document.body.scrollWidth<=innerWidth),'No horizontal overflow');
  await page.screenshot({path:`docs/bust-preview/conversation-${viewport.width}.png`});
  await page.click('[data-dialogue-next]');
  check(await page.locator('.stage-character[data-character="cat"]').getAttribute('data-emotion')==='tired','Moku switches to her evasive reaction');
  check(await page.locator('.stage-character[data-character="hostess"]').getAttribute('data-emotion')==='angry','Listener retains anger');
}
// Verify the actual double-click game artifact, including the decision flow.
await page.setViewportSize({width:1672,height:941});
await page.goto(pathToFileURL(resolve('play.html')).href+'?preview=events&case=roomshare',{timeout:60000});
await page.waitForSelector('#request-notice:visible');
await page.click('#request-notice');
await page.click('[data-dialogue-next]');
await page.locator('.stage-character img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
check(await page.locator('.stage-character img').evaluateAll(images=>images.every(img=>img.src.startsWith('data:image/png;base64,')&&img.naturalWidth>=512)),'Standalone busts embedded');
await page.click('[data-event-skip]');
check(await page.locator('[data-choice]').count()===3,'Standalone offers three choices');
await page.locator('[data-choice]').first().click();
check(await page.locator('[data-choice]').count()===0,'Standalone choice is resolved');
await page.click('[data-event-skip]');
await page.screenshot({path:'docs/bust-preview/standalone-reply.png'});
check(await page.evaluate(()=>localStorage.getItem('feral-apartments-v1'))===null,'Preview does not modify save');
await browser.close();
check(!errors.length,errors.join('\n'));
console.log(process.argv.includes('--scene-only')?'Verified directed reactions, listener continuity, and 3 conversation viewport sizes.':'Verified all 42 portraits in local file gallery, directed reactions, listener continuity, and 3 conversation viewport sizes.');
process.exit(0);

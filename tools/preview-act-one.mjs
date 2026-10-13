import {createRequire} from 'node:module';
import {join,resolve} from 'node:path';
import {mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const actRequire=createRequire(join(process.env.FERAL_ASSET_MODULE_ROOT,'package.json'));
const {chromium}=actRequire('playwright');
process.env.PORT='4175';await import('../server.mjs');
const browser=await chromium.launch({headless:true,channel:'msedge'});
const errors=[];
const check=(x,msg)=>{if(!x)throw new Error(msg);};
await mkdir('docs/act-one-preview',{recursive:true});
const page=await browser.newPage({viewport:{width:1672,height:941}});
page.on('pageerror',e=>errors.push(e.message));
const snapshot=name=>page.screenshot({path:'docs/act-one-preview/'+name+'.png'});
const finish=async()=>{await page.click('[data-event-skip]');await page.click('[data-close]:visible');};
const begin=async()=>{await page.waitForSelector('[data-act-start]');await page.click('[data-act-start]');await page.waitForSelector('.conversation-modal[open]');await finish();};
const waitScene=async()=>{await page.click('[data-act-wait]');await page.waitForSelector('.conversation-modal[open]');await page.click('[data-event-skip]');check(await page.locator('[data-choice]').count()===3,'Three peculiar answers');};
const answer=async id=>{await page.click('[data-choice="'+id+'"]');await page.waitForSelector('.conversation-modal[open]');};
await page.goto('http://127.0.0.1:4175/');await page.waitForSelector('[data-act-start]');
await page.locator('.act-key-art').evaluate(img=>img.decode());await snapshot('title-desktop');
await page.setViewportSize({width:390,height:844});await snapshot('title-mobile');
check(await page.evaluate(()=>document.body.scrollWidth<=innerWidth),'Title fits mobile');
await page.setViewportSize({width:1672,height:941});await begin();await waitScene();await snapshot('first-choices');
await answer('laundry');await page.click('[data-dialogue-next]');await page.click('[data-dialogue-next]');
check(await page.locator('[data-character="cat"]').getAttribute('data-emotion')==='surprised','Moku is incredulous right after answer');await snapshot('reaction');
await finish();await page.waitForSelector('[data-act-rewind]');await snapshot('bad-end');
let save=await page.evaluate(()=>JSON.parse(localStorage.getItem('feral-act-one-v1')));
check(save.actOne.status==='bad'&&save.actOne.memory.includes('ash-laundry'),'Bad end saved');
await page.reload();await page.waitForSelector('[data-act-start]');
check((await page.locator('[data-act-start]').innerText()).includes('続きを'),'Saved game also opens on main title');
await page.click('[data-act-start]');await page.waitForSelector('[data-act-rewind]');
await page.click('[data-act-rewind]');await page.waitForSelector('.conversation-modal[open]');await page.click('[data-event-skip]');await snapshot('loop');await page.click('[data-close]:visible');
save=await page.evaluate(()=>JSON.parse(localStorage.getItem('feral-act-one-v1')));check(save.hour>=17&&save.hour<18&&save.actOne.attempt===2,'Loop resets time, retains attempt');
await page.click('#management-button');check((await page.locator('#modal-content').innerText()).includes('熱はなくならない'),'Memory remains in landlord notebook');await page.click('[data-close]:visible');
await waitScene();await answer('landlord');await finish();await waitScene();await snapshot('second-choices');
await answer('coronation');await finish();await page.click('[data-act-wait]');await page.waitForSelector('[data-act-reward]');await snapshot('clear');
save=await page.evaluate(()=>JSON.parse(localStorage.getItem('feral-act-one-v1')));check(save.hour===57&&save.residents.length===1&&save.actOne.status==='clear','Clear at day 3 09:00 with Moku alone');
await page.click('[data-act-reward]');await page.click('[data-act-admit="hostess"]');await snapshot('reward');
check((await page.locator('#modal-content').innerText()).includes('入居予約済み'),'Admission selection unlocked');
// Every bad answer must work through real UI, not just data functions.
for(const [scene,id]of [['ash','wind'],['dinner','turbo'],['dinner','show']]){
  await page.click('[data-act-replay]');await begin();await waitScene();
  if(scene==='dinner'){await answer('landlord');await finish();await waitScene();}
  await answer(id);await finish();await page.waitForSelector('[data-act-rewind]');
  check((await page.locator('.act-ending-copy').innerText()).includes('全 焼'),'All branches burn the apartment');
  await page.click('[data-act-rewind]');await page.waitForSelector('.conversation-modal[open]');await finish();
  // Return to reward-free new act using the explicit full reset.
  await page.click('#new-game');await page.click('[data-restart]');await begin();await waitScene();await answer('landlord');await finish();await waitScene();await answer('coronation');await finish();await page.click('[data-act-wait]');await page.waitForSelector('[data-act-reward]');
  await page.click('[data-act-reward]');
}
// Standalone starts with its own title and embeds the key art.
await page.goto(pathToFileURL(resolve('play.html')).href,{timeout:60000});await page.waitForSelector('[data-act-start]');
check(await page.locator('.act-key-art').evaluate(img=>img.src.startsWith('data:image/png;base64,')),'Standalone embeds title artwork');
await begin();await waitScene();await answer('landlord');await finish();await waitScene();await answer('coronation');await finish();await page.click('[data-act-wait]');await page.waitForSelector('[data-act-reward]');
await page.setViewportSize({width:390,height:844});await snapshot('clear-mobile');
check(await page.evaluate(()=>document.body.scrollWidth<=innerWidth),'Ending fits mobile');
check(!errors.length,errors.join('\n'));await browser.close();
console.log('Verified title/start, all four bad ends, first loop/reload/memory, full survival, reward and embedded standalone.');process.exit(0);

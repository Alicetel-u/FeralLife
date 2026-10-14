import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const require=createRequire(join(process.env.FERAL_ASSET_MODULE_ROOT,'package.json'));
const {chromium}=require('playwright');
const {createActOne,advanceActOne,answerActOne,rewindActOne}=await import('../src/act-one.js');
let fixture=createActOne(42,[],1,true);advanceActOne(fixture,2);answerActOne(fixture,fixture.actOne.pending.eventId,'trash');fixture=rewindActOne(fixture);fixture.events.forEach(e=>e.read=true);advanceActOne(fixture,2);
const browser=await chromium.launch({headless:true,channel:'chrome',timeout:20000});
try {
  const page=await browser.newPage({viewport:{width:1366,height:768}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('http://game.local/**',async route=>{
    const p=new URL(route.request().url()).pathname;
    await route.fulfill({body:await readFile(resolve('.'+(p==='/'?'/index.html':p))),contentType:p.endsWith('.js')?'application/javascript':p.endsWith('.css')?'text/css':p.endsWith('.png')?'image/png':'text/html'});
  });
  await mkdir('docs/opening-flow-preview',{recursive:true});
  await page.addInitScript(state=>localStorage.setItem('feral-act-one-v1',JSON.stringify(state)),fixture);
  await page.goto('http://game.local/');await page.click('[data-game-continue]');await page.waitForSelector('[data-event-skip]');await page.click('[data-event-skip]');
  assert.equal(await page.locator('.choice-history-badge').count(),1);
  assert.equal(await page.locator('[data-choice="trash"].previously-chosen').count(),1);
  assert.match(await page.locator('[data-choice="trash"]').innerText(),/選択済み/);
  await page.screenshot({path:'docs/opening-flow-preview/choice-history.png'});
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:'docs/opening-flow-preview/choice-history-mobile.png'});
  await page.click('[data-choice="trash"]');await page.waitForSelector('[data-dialogue-next]');
  assert.deepEqual(errors,[]);
  console.log('Verified selection badge, mobile and reselecting a previously chosen answer.');
} finally {await browser.close();}

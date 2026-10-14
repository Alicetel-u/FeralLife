import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {createActOne,advanceActOne,answerActOne} from '../src/act-one.js';
const require=createRequire(join(process.env.FERAL_ASSET_MODULE_ROOT,'package.json'));
const {chromium}=require('playwright');
const repeat=process.env.FERAL_PREVIEW_REPEAT==='1';
const fixture=createActOne(42,[],repeat?2:1,true);advanceActOne(fixture,2);answerActOne(fixture,fixture.actOne.pending.eventId,'trash');fixture.events.forEach(e=>e.read=true);
const browser=await chromium.launch({headless:true,channel:'chrome',timeout:20000});
try{
  const page=await browser.newPage({viewport:{width:1366,height:768}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(s=>{if(!sessionStorage.getItem('rewind-fixture')){localStorage.setItem('feral-act-one-v1',JSON.stringify(s));sessionStorage.setItem('rewind-fixture','1');}},fixture);
  await page.route('http://game.local/**',async route=>{
    const p=new URL(route.request().url()).pathname;
    await route.fulfill({body:await readFile(resolve('.'+(p==='/'?'/index.html':p))),contentType:p.endsWith('.js')?'application/javascript':p.endsWith('.css')?'text/css':p.endsWith('.png')?'image/png':'text/html'});
  });
  await mkdir('docs/rewind-preview',{recursive:true});
  const shot=name=>page.screenshot({path:'docs/rewind-preview/'+name+'.png'});
  await page.goto('http://game.local/');await page.click('[data-game-continue]');await page.click('[data-fire-finish]');
  assert.equal(await page.locator('.act-loop-reveal').count(),0);
  await page.click('[data-act-rewind]');await page.waitForSelector('[data-rewind-phase="fire"]');
  await page.waitForTimeout(2200);assert.match(await page.locator('.rewind-voice').innerText(),repeat?/大丈夫/:/俺が/);await shot('01-regret');
  await page.waitForSelector('[data-rewind-phase="dark"]');await shot('02-dark');
  await page.waitForSelector('[data-rewind-phase="clock"]');await page.waitForTimeout(1000);if(repeat)assert.match(await page.locator('.rewind-voice').innerText(),/次こそは……絶対に守ってやる！/);await shot('03-clock');
  await page.waitForSelector('[data-rewind-intro]');
  const save=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('feral-act-one-v1')));
  assert.equal((await save()).actOne.attempt,repeat?3:2);assert.equal((await save()).hour,17);
  if(!repeat){
  await page.click('[data-dialogue-next]');assert.match(await page.locator('.stage-bubble').innerText(),/新しい大家さん/);
  await page.click('[data-dialogue-next]');assert.match(await page.locator('.stage-bubble').innerText(),/…………は？/);await shot('04-reunion');
  for(let i=0;i<6;i++)await page.click('[data-dialogue-next]');
  assert.match(await page.locator('.stage-speaker').innerText(),/心の声/);
  await page.reload();await page.click('[data-game-continue]');await page.waitForSelector('[data-rewind-intro]');
  assert.match(await page.locator('.stage-bubble').innerText(),/……夢？/);
  assert.equal((await save()).actOne.rewindIntroCursor,8);
  await page.setViewportSize({width:390,height:844});await shot('05-mobile-inner-voice');
  await page.click('[data-event-skip]');assert.match(await page.locator('.stage-bubble').innerText(),/もう二度と/);
  }else{await shot('04-reunion');await page.click('[data-event-skip]');assert.match(await page.locator('.stage-bubble').innerText(),/今度こそ/);}
  await page.click('[data-rewind-title].primary-button');await page.waitForSelector('[data-act-start]');
  assert.match(await page.locator('#modal-title').innerText(),/火事/);
  await page.waitForSelector('.act-title-fire [data-fire-phase="building"]');await page.waitForTimeout(1500);await shot('06-burning-chapter');
  await page.reload();await page.click('[data-game-continue]');await page.waitForSelector('[data-act-start]');
  await page.click('[data-act-start]');await page.waitForFunction(()=>!document.getElementById('modal').open);
  await page.click('[data-act-wait]');await page.click('[data-event-skip]');assert.equal(await page.locator('[data-choice="trash"].previously-chosen').count(),1);
  assert.equal(await page.evaluate(()=>document.body.scrollWidth<=innerWidth),true);
  const standalone=await browser.newPage({viewport:{width:1366,height:768}});standalone.on('pageerror',e=>errors.push(e.message));
  await standalone.addInitScript(s=>localStorage.setItem('feral-act-one-v1',JSON.stringify(s)),fixture);
  await standalone.goto(pathToFileURL(resolve('play.html')).href,{timeout:60000});await standalone.click('[data-game-continue]');await standalone.click('[data-fire-finish]');await standalone.click('[data-act-rewind]');await standalone.waitForSelector('.rewind-screen');
  assert.equal(await standalone.locator('.rewind-restored-room').evaluate(img=>img.src.startsWith('data:image/png;base64,')),true);
  await standalone.click('[data-rewind-skip]');await standalone.waitForSelector('[data-rewind-intro]');await standalone.click('[data-event-skip]');await standalone.click('[data-rewind-title].primary-button');await standalone.waitForSelector('[data-act-start]');
  assert.deepEqual(errors,[]);console.log('Verified fire -> silence -> reverse clock -> reunion -> chapter -> observation, cursor/title reload, preserved selection badge, mobile and standalone.');
}finally{await browser.close();}

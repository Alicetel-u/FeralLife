import {createRequire} from 'node:module';
import {readFile, mkdir} from 'node:fs/promises';
import {resolve, join} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {createActOne, advanceActOne, answerActOne} from '../src/act-one.js';

const require = createRequire(join(process.env.FERAL_ASSET_MODULE_ROOT, 'package.json'));
const {chromium} = require('playwright');
const browser = await chromium.launch({headless:true, channel:'chrome', timeout:20000});
try {
  const page = await browser.newPage({viewport:{width:1366,height:768}});
  let fixture=null;
  const errors=[]; page.on('pageerror', e => {errors.push(e.message);console.error('PAGE ERROR',e.message);});
  await page.route('http://game.local/**', async route => {
    const p = new URL(route.request().url()).pathname;
    let body=await readFile(resolve('.'+(p==='/'?'/index.html':p)));
    if(p==='/'&&fixture)body=body.toString().replace('<head>', '<head><script>localStorage.setItem("feral-act-one-v1",'+JSON.stringify(JSON.stringify(fixture))+');</script>');
    await route.fulfill({body, contentType:p.endsWith('.js')?'application/javascript':p.endsWith('.css')?'text/css':p.endsWith('.png')?'image/png':'text/html'});
  });
  await mkdir('docs/fire-ending-preview',{recursive:true});
  const makeBad = (scene, choice) => {
    const state=createActOne(42,[],choice==='freezer'?1:2,true);
    advanceActOne(state,2);
    if(scene==='dinner') { answerActOne(state,state.actOne.pending.eventId,'water'); advanceActOne(state,18); }
    answerActOne(state,state.actOne.pending.eventId,choice);
    state.events.forEach(e=>e.read=true);
    return state;
  };
  await page.goto('http://game.local/');
  for (const [scene,choice] of [['ash','trash'],['ash','balcony'],['ash','freezer'],['dinner','turbo'],['dinner','show']]) {
    const state=makeBad(scene,choice);
    fixture=state;
    await page.reload(); await page.waitForTimeout(1500); if(!await page.locator('[data-game-continue]').count()) console.log('NO CONTINUE',await page.locator('body').innerText(),errors); await page.click('[data-game-continue]');
    await page.waitForSelector('.fire-cinematic[data-fire-phase="room"]');
    assert.equal(await page.locator('.fire-room-background').evaluate(img=>img.complete&&img.naturalWidth>0),true);
    if(choice==='trash') {
      await page.waitForTimeout(2200);
      await page.screenshot({path:'docs/fire-ending-preview/01-room.png'});
      await page.waitForSelector('[data-fire-phase="building"]',{timeout:10000});
      await page.waitForTimeout(1000);
      await page.screenshot({path:'docs/fire-ending-preview/02-building.png'});
      await page.waitForSelector('[data-fire-phase="ruins"]',{timeout:10000});
      await page.waitForTimeout(500);
      await page.screenshot({path:'docs/fire-ending-preview/03-ruins.png'});
      await page.waitForSelector('[data-act-rewind]',{timeout:8000});
      await page.screenshot({path:'docs/fire-ending-preview/04-ending.png'});
    } else {
      assert.equal(await page.locator('.fire-caption').count(),0);
      assert.equal(await page.locator('.fire-narration').count(),1);
      await page.click('[data-fire-finish]');
      await page.waitForSelector('[data-act-rewind]');
    }
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('feral-act-one-v1')));
    assert.equal(saved.actOne.failure,state.actOne.failure);
    await page.click('[data-act-rewind]');
    await page.waitForSelector('[data-act-start]');
    assert.match(await page.locator('#modal-title').innerText(),/火事/);
    assert.equal(await page.locator('.fire-canvas').count(),0);
    await page.click('[data-act-start]'); await page.waitForFunction(()=>!document.getElementById('modal').open);
  }
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  fixture=makeBad('dinner','turbo');
  await page.reload(); await page.click('[data-game-continue]');
  await page.waitForSelector('.fire-cinematic');
  await page.screenshot({path:'docs/fire-ending-preview/05-mobile.png'});
  assert.equal(await page.evaluate(()=>document.body.scrollWidth<=innerWidth),true);
  await page.click('[data-fire-finish]'); await page.waitForSelector('[data-act-rewind]');
  await page.screenshot({path:'docs/fire-ending-preview/06-mobile-ending.png'});
  await page.addInitScript(s=>localStorage.setItem('feral-act-one-v1',JSON.stringify(s)),makeBad('ash','balcony'));
  await page.goto(pathToFileURL(resolve('play.html')).href,{timeout:60000});
  await page.reload(); await page.click('[data-game-continue]'); await page.waitForSelector('.fire-cinematic');
  assert.equal(await page.locator('.fire-room-background').evaluate(img=>img.src.startsWith('data:image/png;base64,')&&img.complete&&img.naturalWidth>0),true);
  await page.click('[data-fire-finish]'); await page.waitForSelector('[data-act-rewind]');
  assert.deepEqual(errors,[]);
  console.log('Verified room/building/ruins progression, four bad ends, skip, loop, mobile reduced motion and standalone embedded artwork.');
} finally { await browser.close(); }

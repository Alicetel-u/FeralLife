import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {createActOne,advanceActOne,answerActOne} from '../src/act-one.js';
const require=createRequire(join(process.env.FERAL_ASSET_MODULE_ROOT,'package.json'));
const {chromium}=require('playwright');
const fixture=createActOne(42,[],1,true);advanceActOne(fixture,2);answerActOne(fixture,fixture.actOne.pending.eventId,'trash');fixture.events.forEach(e=>e.read=true);
const browser=await chromium.launch({headless:true,channel:'chrome',timeout:20000});
try{
  const page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(s=>{if(!sessionStorage.getItem('auto-rewind-fixture')){localStorage.setItem('feral-act-one-v1',JSON.stringify(s));sessionStorage.setItem('auto-rewind-fixture','1');}},fixture);
  await page.route('http://game.local/**',async route=>{
    const p=new URL(route.request().url()).pathname;
    await route.fulfill({body:await readFile(resolve('.'+(p==='/'?'/index.html':p))),contentType:p.endsWith('.js')?'application/javascript':p.endsWith('.css')?'text/css':p.endsWith('.png')?'image/png':'text/html'});
  });
  await mkdir('docs/auto-rewind-preview',{recursive:true});
  const save=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('feral-act-one-v1')));
  const finishReply=async()=>{await page.click('[data-event-skip]');await page.click('[data-close].primary-button');};
  await page.goto('http://game.local/');await page.click('[data-game-continue]');await page.click('[data-fire-finish]');await page.click('[data-rewind-skip]');
  await page.waitForFunction(()=>!document.getElementById('modal').open);
  await page.click('[data-act-wait]');await page.click('[data-event-skip]');await page.click('[data-event-auto]');
  await page.waitForTimeout(4500);assert.equal(await page.locator('[data-choice]').count(),3);assert.equal((await save()).hour,19);assert.equal((await save()).actOne.pending.scene,'ash');
  await page.click('[data-choice="trash"]');await page.click('[data-event-skip]');await page.click('[data-event-auto]');
  await page.waitForSelector('.fire-cinematic',{timeout:10000});
  assert.equal(await page.locator('.conversation-modal[open]').count(),0);
  await page.click('[data-fire-finish]');await page.click('[data-rewind-skip]');await page.waitForFunction(()=>!document.getElementById('modal').open);
  await page.click('[data-act-wait]');await page.waitForSelector('[data-event-auto][aria-pressed="true"]');
  assert.deepEqual(errors,[]);console.log('Verified AUTO finishes final dialogue, proceeds into fire, holds on unanswered choices and stays enabled across scenes.');
}finally{await browser.close();}

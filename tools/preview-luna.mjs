import {createRequire} from 'node:module';
import {join} from 'node:path';
const require=createRequire(join(process.env.FERAL_ASSET_MODULE_ROOT,'package.json'));
const {chromium}=require('playwright'),sharp=require('sharp');
await import('../server.mjs');
const browser=await chromium.launch({headless:true,channel:'msedge'});
const page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[];
await page.route('**/favicon.ico',route=>route.fulfill({status:204}));
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errors.push(m.text());});
await page.goto('http://localhost:4173/tests/luna-visual.html');
await page.waitForFunction(()=>document.querySelector('#world')&&document.querySelector('#action').onchange);
await page.selectOption('#action','counsel');
await page.waitForTimeout(300);
await page.screenshot({path:'docs/luna-game.png'});
for(const action of ['sleep','eat','drink','clean','fight','chat','shop']){
  await page.selectOption('#action',action);
  await page.waitForTimeout(80);
}
await page.click('#walk');
await page.waitForTimeout(300);
await page.screenshot({path:'docs/luna-walk.png'});
await page.goto('http://localhost:4173/play.html?preview=hostess');
await page.waitForTimeout(1200);
if(errors.length)throw new Error(errors.join('\n'));
await browser.close();
const names=['idle','poses/walk_a','poses/walk_b','poses/sit','poses/sleep','poses/eat','poses/drink','poses/clean','poses/angry','poses/chat'];
const inputs=[];
for(let i=0;i<names.length;i++){
  const input=await sharp('assets/characters/hostess/'+names[i]+'.png').resize(256,256,{fit:'contain',kernel:'nearest',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
  inputs.push({input,left:(i%5)*270+7,top:Math.floor(i/5)*280+10});
}
await sharp({create:{width:1350,height:560,channels:4,background:'#243328'}}).composite(inputs).png().toFile('docs/luna-poses.png');
console.log('Verified living poses, counsel, walking and standalone; no browser errors.');
process.exit(0);

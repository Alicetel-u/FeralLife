// Normalize reviewed RGBA cutouts only. Never classify foreground colors as background.
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(process.env.FERAL_ASSET_MODULE_ROOT ? join(process.env.FERAL_ASSET_MODULE_ROOT,'package.json') : import.meta.url);
const sharp=require('sharp');
const dir=join(root,'assets/characters/cat');
const poses=['walk_a','walk_b','sit','sleep','eat','drink','clean','angry','chat'];
async function bounds(path,reference=false){
  const {data,info}=await sharp(path).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let left=info.width,top=info.height,right=-1,bottom=-1;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
    const i=(y*info.width+x)*4;
    const visible=reference ? !(Math.min(data[i],data[i+1],data[i+2])>=222 && Math.max(data[i],data[i+1],data[i+2])-Math.min(data[i],data[i+1],data[i+2])<=22) : data[i+3]>=128;
    if(visible){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
  }
  if(right<left)throw new Error(`Empty cutout: ${path}`);
  // Add a small transparent safety margin without changing any alpha or color values.
  if(!reference){left=Math.max(0,left-2);top=Math.max(0,top-2);right=Math.min(info.width-1,right+2);bottom=Math.min(info.height-1,bottom+2);}
  return {left,top,width:right-left+1,height:bottom-top+1};
}
async function frame(buffer,size,origin,name){
  const {width,height}=await sharp(buffer).metadata();
  const left=origin[0]-Math.floor(width/2),top=origin[1]+1-height;
  if(left<0||top<0||left+width>size[0]||top+height>size[1])throw new Error(`Frame overflow: ${name}`);
  await sharp({create:{width:size[0],height:size[1],channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite([{input:buffer,left,top}]).png().toFile(join(dir,name));
}
const basePath=join(dir,'cutout-master.png');
const baseBox=await bounds(basePath);
const cropped=await sharp(basePath).extract(baseBox).png().toBuffer();
await sharp(cropped).toFile(join(dir,'cutout.png'));
// Keep the same frame dimensions and foot origins consumed by character-art.js.
const sprite=await sharp(cropped).resize(82,112,{fit:'inside',kernel:'nearest'}).png().toBuffer();
const portrait=await sharp(cropped).resize(100,136,{fit:'inside',kernel:'nearest'}).png().toBuffer();
await frame(sprite,[96,128],[48,126],'idle.png');
await frame(portrait,[128,160],[64,147],'portrait.png');
const refBox=await bounds(join(dir,'poses/raw/walk_a.jpg'),true),referenceScale=111/refBox.height;
const poseManifest={};
for(const name of poses){
  const path=join(dir,`poses/cutouts/${name}.png`),box=await bounds(path),original=await bounds(join(dir,`poses/raw/${name}.jpg`),true);
  const width=Math.round(original.width*referenceScale),height=Math.round(original.height*referenceScale);
  const buffer=await sharp(path).extract(box).resize(width,height,{kernel:'nearest',fit:'fill'}).png().toBuffer();
  const size=name==='sleep'?[160,112]:[96,128],origin=name==='sleep'?[80,108]:[48,126];
  await frame(buffer,size,origin,`poses/${name}.png`);
  poseManifest[name]={source:`poses/raw/${name}.jpg`,cutout:`poses/cutouts/${name}.png`,frame:{width:size[0],height:size[1],origin},content:{width,height}};
  console.log(`${name}: ${width}x${height} -> ${size.join('x')}`);
}
await writeFile(join(dir,'asset.json'),JSON.stringify({character:'cat',source:'reference-original.png',method:'Built-in ImageGen background-extraction repair; preserved RGBA alpha and nearest-neighbor normalization',updated:'2026-10-09',cutout:'cutout.png',sprite:'idle.png',portrait:'portrait.png',frame:{width:96,height:128,origin:[48,126]},portraitFrame:{width:128,height:160},displayHeight:44,supportedPoses:['base-standing',...poses],poses:poseManifest,note:'原稿保持。白色しきい値による背景除去と輪郭の侵食は使わず、確認済み透過PNGから縮小する。生成編集のため原稿との完全なピクセル一致は保証しない。'},null,2)+'\n');
console.log('Prepared reviewed Moku cutouts; no foreground-color removal.');

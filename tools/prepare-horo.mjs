// Normalize reviewed transparent masters; retain alpha and all foreground colors.
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(process.env.FERAL_ASSET_MODULE_ROOT?join(process.env.FERAL_ASSET_MODULE_ROOT,'package.json'):import.meta.url);
const sharp=require('sharp'),dir=join(root,'assets/characters/fox');
const poses=['stand','walk_a','walk_b','sit','sleep','eat','drink','clean','angry','chat'];
await mkdir(join(dir,'poses'),{recursive:true});
async function crop(path){
  const {data,info}=await sharp(path).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let l=info.width,t=info.height,r=-1,b=-1;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>=128){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
  if(r<l)throw new Error('Empty master: '+path);
  l=Math.max(0,l-2);t=Math.max(0,t-2);r=Math.min(info.width-1,r+2);b=Math.min(info.height-1,b+2);
  return sharp(path).extract({left:l,top:t,width:r-l+1,height:b-t+1}).png().toBuffer();
}
async function frame(path,out,size,origin,fit){
  const cropped=await crop(path),buf=await sharp(cropped).resize(fit[0],fit[1],{fit:'inside',kernel:'nearest'}).png().toBuffer();
  const {width,height}=await sharp(buf).metadata(),left=origin[0]-Math.floor(width/2),top=origin[1]+1-height;
  if(left<0||top<0||left+width>size[0]||top+height>size[1])throw new Error('Frame overflow: '+out);
  await sharp({create:{width:size[0],height:size[1],channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite([{input:buf,left,top}]).png().toFile(join(dir,out));
}
await frame(join(dir,'cutout-master.png'),'base-game.png',[128,128],[64,126],[112,104]);
await frame(join(dir,'cutout-master.png'),'portrait-game.png',[128,160],[64,147],[112,136]);
const manifest={};
for(const name of poses){
  const sleep=name==='sleep',standing=['stand','walk_a','walk_b','clean','angry'].includes(name);
  const size=sleep?[176,112]:[128,128],origin=sleep?[88,108]:[64,126],fit=sleep?[164,96]:standing?[112,112]:[112,100];
  await frame(join(dir,'poses/masters',name+'.png'),'poses/'+name+'.png',size,origin,fit);
  manifest[name]={source:'poses/masters/'+name+'.png',src:'poses/'+name+'.png',frame:{width:size[0],height:size[1],origin}};
}
await writeFile(join(dir,'asset.json'),JSON.stringify({character:'fox',name:'酔田 ホロ',source:'reference-original.png',method:'Built-in ImageGen identity-preserve pose variants; reviewed RGBA alpha retained, nearest-neighbor normalization',updated:'2026-10-09',sprite:'base-game.png',portrait:'portrait-game.png',frame:{width:128,height:128,origin:[64,126]},portraitFrame:{width:128,height:160},displayHeight:44,poses:manifest,note:'元の座り絵と原稿を保持。内部ID foxを維持してセーブ互換を保つ。生成差分は完全なピクセル一致を保証しない。'},null,2)+'\n');

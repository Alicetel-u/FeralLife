// Normalize ImageGen RGBA masters without deleting any foreground color.
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(process.env.FERAL_ASSET_MODULE_ROOT?join(process.env.FERAL_ASSET_MODULE_ROOT,'package.json'):import.meta.url);
const sharp=require('sharp'),dir=join(root,'assets/characters/hostess');
const names=['walk_a','walk_b','sit','sleep','eat','drink','clean','angry','chat'];
await mkdir(join(dir,'poses/masters'),{recursive:true});
async function crop(input){
  const {data,info}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let l=info.width,t=info.height,r=-1,b=-1,clear=0;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
    const a=data[(y*info.width+x)*4+3];
    if(a===0)clear++;
    if(a>=128){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
  }
  if(r<l||clear<info.width*info.height*.1)throw new Error('Missing transparent cutout');
  return sharp(input).extract({left:l,top:t,width:r-l+1,height:b-t+1}).png().toBuffer();
}
async function frame(input,out,size,origin,fit){
  const buf=await sharp(await crop(input)).resize(...fit,{fit:'inside',kernel:'nearest'}).png().toBuffer();
  const {width,height}=await sharp(buf).metadata();
  await sharp({create:{width:size[0],height:size[1],channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite([{input:buf,left:origin[0]-Math.floor(width/2),top:origin[1]+1-height}]).png().toFile(join(dir,out));
}
await frame(join(dir,'cutout-master.png'),'idle.png',[128,128],[64,126],[116,116]);
await frame(join(dir,'cutout-master.png'),'portrait.png',[128,160],[64,147],[116,136]);
const atlas=join(dir,'poses/atlas-master.png'),meta=await sharp(atlas).metadata(),poses={};
// Reviewed boundaries: the generated wide sleeping tail extends past its nominal cell.
// Use the transparent gutters rather than slicing through the 3x3 grid lines.
const regions=[[0,0,440,436],[440,0,400,436],[850,0,404,436],[0,437,476,408],[477,437,363,408],[850,437,404,408],[0,846,476,408],[477,846,363,408],[850,846,404,408]];
for(let i=0;i<names.length;i++){
  const name=names[i];
  if(meta.width!==1254||meta.height!==1254)throw new Error('Atlas changed: review cutout regions before regenerating');
  const [left,top,width,height]=regions[i];
  const buf=await sharp(atlas).extract({left,top,width,height}).png().toBuffer();
  const master=join(dir,'poses/masters',name+'.png');
  await sharp(buf).toFile(master);
  const sleep=name==='sleep',size=sleep?[176,112]:[128,128],origin=sleep?[88,108]:[64,126];
  const fit=sleep?[164,78]:name==='sit'?[116,100]:[116,116];
  await frame(master,'poses/'+name+'.png',size,origin,fit);
  poses[name]={src:'poses/'+name+'.png',frame:{width:size[0],height:size[1],origin}};
}
await writeFile(join(dir,'asset.json'),JSON.stringify({character:'hostess',name:'金城 ルナ',updated:'2026-10-10',source:'reference-original.png',method:'Built-in ImageGen transparent base and 3x3 pose atlas; alpha-preserving nearest-neighbor framing',frame:{width:128,height:128,origin:[64,126]},poses},null,2)+'\n');
console.log('Prepared Luna base, portrait and nine animation poses.');

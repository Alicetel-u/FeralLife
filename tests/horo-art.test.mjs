import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CHARACTER_ART} from '../src/character-art.js';
import {resolvePose} from '../src/renderer.js';
test('Horo switches walking and living poses and falls back for unloaded art',()=>{
  const art=CHARACTER_ART.fox;
  const saved=Object.fromEntries(Object.entries(art.poses).map(([k,v])=>[k,v.image]));
  try {
    for(const p of Object.values(art.poses))p.image={};
    assert.equal(resolvePose('fox','drink',true,0,17),'walk_a');
    assert.equal(resolvePose('fox','drink',true,.25,17),'walk_b');
    for(const [action,pose] of Object.entries({eat:'eat',drink:'drink',clean:'clean',sleep:'sleep',fight:'angry',chat:'chat',tv:'sit',outing:'stand'}))assert.equal(resolvePose('fox',action,false,0,17),pose);
    art.poses.sleep.image=null;
    assert.equal(resolvePose('fox','sleep'),'base');
  } finally {for(const [k,image] of Object.entries(saved))art.poses[k].image=image;}
});
test('all Horo frames have registered dimensions and are embedded in standalone',async()=>{
  const html=await readFile(new URL('../play.html',import.meta.url),'utf8');
  for(const [name,src] of [['base',CHARACTER_ART.fox.src],['portrait',CHARACTER_ART.fox.portraitSrc],...Object.entries(CHARACTER_ART.fox.poses).map(([n,p])=>[n,p.src])]){
    const png=await readFile(new URL('../'+src,import.meta.url));
    assert.equal(png.readUInt32BE(16),name==='sleep'?176:128,name);
    assert.equal(png.readUInt32BE(20),name==='sleep'?112:name==='portrait'?160:128,name);
    assert.equal(png[25],6,'RGBA: '+name);
    assert.ok(html.includes('data:image/png;base64,'+png.toString('base64')),name);
  }
});

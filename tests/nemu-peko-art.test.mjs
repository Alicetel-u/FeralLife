import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CHARACTER_ART} from '../src/character-art.js';
import {resolvePose} from '../src/renderer.js';
for (const type of ['sister','peko']) test(type+' switches walking and living poses and falls back for unloaded art',()=>{
  const art=CHARACTER_ART[type];
  const saved=Object.fromEntries(Object.entries(art.poses).map(([k,v])=>[k,v.image]));
  try {
    for(const p of Object.values(art.poses))p.image={};
    assert.equal(resolvePose(type,'drink',true,0,17),'walk_a');
    assert.equal(resolvePose(type,'drink',true,.25,17),'walk_b');
    for(const [action,pose] of Object.entries({eat:'eat',drink:'drink',clean:'clean',sleep:'sleep',fight:'angry',chat:'chat',tv:'sit',outing:'stand'}))assert.equal(resolvePose(type,action,false,0,17),pose);
    art.poses.sleep.image=null;
    assert.equal(resolvePose(type,'sleep'),'base');
  } finally {for(const [k,image] of Object.entries(saved))art.poses[k].image=image;}
});
for (const type of ['sister','peko']) test('all Nemu and Peko frames have registered dimensions and are embedded in standalone',async()=>{
  const html=await readFile(new URL('../play.html',import.meta.url),'utf8');
  for(const [name,src] of [['base',CHARACTER_ART[type].src],...Object.entries(CHARACTER_ART[type].poses).map(([n,p])=>[n,p.src])]){
    const png=await readFile(new URL('../'+src,import.meta.url));
    assert.equal(png.readUInt32BE(16),name==='sleep'?160:128,name);
    assert.equal(png.readUInt32BE(20),name==='sleep'?112:128,name);
    assert.equal(png[25],6,'RGBA: '+name);
    assert.ok(html.includes('data:image/png;base64,'+png.toString('base64')),name);
  }
});
import { drawCharacterEffects } from '../src/effects.js';
test('personal effects animate only during the matching stationary actions',()=>{
 const render=o=>{const marks=[];const ctx={save(){},restore(){},fillRect(...v){marks.push([...v,this.fillStyle]);}};drawCharacterEffects(ctx,{x:0,y:0,u:1,dir:1,t:.4,action:'idle',pose:'phone',needs:{},...o});return marks;};
 assert.ok(render({type:'sister'}).length>0);
 assert.equal(render({type:'sister',moving:true}).length,0);
 assert.equal(render({type:'cat'}).length,0);
 assert.notDeepEqual(render({type:'sister'}),render({type:'sister',t:1}));
 assert.ok(render({type:'peko',needs:{hunger:80}}).length>0);
 assert.equal(render({type:'peko',needs:{hunger:20}}).length,0);
});

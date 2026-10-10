import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CHARACTER_ART } from '../src/character-art.js';
import { resolvePose } from '../src/renderer.js';
import { drawCharacterEffects } from '../src/effects.js';

test('Luna uses walking frames while moving, living poses and safe fallback', () => {
  const art=CHARACTER_ART.hostess;
  try {
    for(const pose of Object.values(art.poses))pose.image={};
    assert.equal(resolvePose('hostess','counsel',true,0),'walk_a');
    assert.equal(resolvePose('hostess','sleep',true,.25),'walk_b');
    for(const [action,pose] of Object.entries({counsel:'chat',chat:'chat',sleep:'sleep',tv:'sit',eat:'eat',drink:'drink',clean:'clean',fight:'angry'}))assert.equal(resolvePose('hostess',action),pose);
    art.poses.sleep.image=null;
    assert.equal(resolvePose('hostess','sleep'),'base');
  } finally { for(const pose of Object.values(art.poses))pose.image=null; }
});

test('Luna counsel effects animate, stop while walking, and apply only to Luna', () => {
  const count = options => {
    let n=0;
    const ctx={save(){},restore(){},fillRect(){n++;}};
    drawCharacterEffects(ctx,{x:0,y:0,u:1,t:1,action:'counsel',speaking:true,...options});
    return n;
  };
  assert.ok(count({type:'hostess'})>0);
  assert.equal(count({type:'hostess',moving:true}),0);
  assert.equal(count({type:'cat'}),0);
});

test('Luna RGBA frames match foot origins and ship in standalone', async () => {
  const html=await readFile(new URL('../play.html',import.meta.url),'utf8');
  const art=CHARACTER_ART.hostess;
  for(const [name,src] of [['base',art.src],['portrait',art.portraitSrc],...Object.entries(art.poses).map(([n,p])=>[n,p.src])]){
    const png=await readFile(new URL('../'+src,import.meta.url));
    assert.equal(png.readUInt32BE(16),name==='sleep'?176:128,name);
    assert.equal(png.readUInt32BE(20),name==='sleep'?112:name==='portrait'?160:128,name);
    assert.equal(png[25],6,name+' RGBA');
    assert.ok(html.includes('data:image/png;base64,'+png.toString('base64')),name);
  }
});

import {readFileSync} from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {GAME_MODULES} from '../tools/game-modules.mjs';

test('production bundle includes every imported game module',()=>{
 for(const name of GAME_MODULES){
  const source=readFileSync(new URL(`../src/${name}.js`,import.meta.url),'utf8');
  for(const match of source.matchAll(/^import\s+.*?from\s+['"]\.\/([^'"?]+)\.js(?:\?[^'"]*)?['"]/gm)){
   assert.ok(GAME_MODULES.includes(match[1]),`${name} imports ${match[1]} but production omits it`);
  }
 }
});

test('bundled choice history resolves at the point where the trouble choices open',()=>{
 const sources=GAME_MODULES.filter(name=>['choice-history','choice-ui'].includes(name)).map(name=>readFileSync(new URL(`../src/${name}.js`,import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,''));
 const context={ROOM_ART:{},eventIcon:()=>''};vm.createContext(context);
 const html=vm.runInContext(sources.join('\n')+`\nchoiceUIHTML({id:1,actScene:'ash'},[{id:'trash',label:'返事',bad:'ash-trash'}],new Set(),failedChoiceKeys({actOne:{memory:[]}}))`,context);
 assert.match(html,/data-choice="trash"/);
 assert.doesNotMatch(html,/data-choice-exhausted/);
});


test('the shared web and standalone bundle initializes its dependencies, not just its syntax',()=>{
 const source=GAME_MODULES.filter(name=>name!=='app').map(name=>readFileSync(new URL(`../src/${name}.js`,import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'')).join('\n\n');
 const context=vm.createContext({});
 assert.doesNotThrow(()=>vm.runInContext(source,context,{filename:'game-bundle.js'}));
 const sample=vm.runInContext("({end:NEW_ALLY_END.cat,home:homeSpot(101,'table'),state:createActOne(42)})",context);
 assert.equal(sample.end.x,sample.home.x);assert.equal(sample.end.y,sample.home.y);
 assert.equal(sample.state.residents[0].room,101);
});

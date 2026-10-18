import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

test('a restored fire waits at START without replaying or saving before the title',()=>{
  const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
  const source=app.slice(app.indexOf('function frame(now)'),app.indexOf('\nsyncStageCursor();',app.indexOf('function frame(now)')));
  let scheduled=0;
  const context={lastTime:0,renderer:{last:0},state:{ending:true,actOne:{status:'bad'}},endingShown:false,
    document:{hidden:false,documentElement:{classList:{contains:()=>false}},querySelector:selector=>selector==='#entry-gate:not([hidden])'?{}:null},
    requestAnimationFrame:()=>scheduled++};
  vm.createContext(context);
  vm.runInContext(source+'\nframe(100);frame(200);',context);
  assert.equal(scheduled,2);
  assert.equal(context.renderer.last,200);
  assert.equal(context.endingShown,false);
  assert.equal(context.state.ending,true);
});

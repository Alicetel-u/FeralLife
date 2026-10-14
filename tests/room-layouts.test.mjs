import test from 'node:test';import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {ROOM_ART} from '../src/character-art.js';
import {ROOM_LAYOUTS,ROOM_SPOTS} from '../src/room-layouts.js';
import {homeSpot,exteriorRoomBounds} from '../src/movement.js';
test('both resident rooms ship embedded art with identical windows and usable furniture anchors',async()=>{
 const html=await readFile(new URL('../play.html',import.meta.url),'utf8');
 assert.deepEqual(ROOM_LAYOUTS.cat.window,ROOM_LAYOUTS.hostess.window);
 for(const type of ['cat','hostess']){
  const png=await readFile(new URL('../'+ROOM_ART[type].src,import.meta.url));
  assert.ok(html.includes('data:image/png;base64,'+png.toString('base64')));
  for(const key of ['bed','tv','table','fridge','window']){
   const [x,y]=ROOM_LAYOUTS[type].spots[key];assert.ok(x>0&&x<173&&y>0&&y<113);
   const b=exteriorRoomBounds(102);const point=homeSpot(102,key);assert.deepEqual([point.x-b.x,point.y-b.y],ROOM_SPOTS[key]);
  }
 }
});

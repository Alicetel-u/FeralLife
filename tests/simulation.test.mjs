import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, advance, admit, validateSave, ROOMS, NEEDS } from '../src/simulation.js';

test('initial resident and first recruitment at day 3, 09:00',()=>{
  const s=createGame(123);
  assert.equal(s.residents.length,1);assert.equal(s.residents[0].room,101);
  advance(s,39.9);assert.equal(s.pending,null);
  advance(s,.1);assert.equal(s.hour,57);assert.equal(s.pending.length,2);assert.notEqual(...s.pending);
});
test('accepts exactly one valid candidate and recruits every three days until full',()=>{
  const s=createGame(456);advance(s,40);
  assert.equal(admit(s,'cat'),false);
  for(let i=0;i<5;i++){
    assert.equal(s.pending.length,2);
    const chosen=s.pending[0];assert.equal(admit(s,chosen),true);assert.equal(admit(s,chosen),false);
    assert.equal(s.pending,null);assert.equal(s.residents.length,i+2);
    if(i<4){advance(s,71.9);assert.equal(s.pending,null);advance(s,.1);assert.ok(s.pending);}
  }
  assert.deepEqual(s.residents.map(r=>r.room),ROOMS);
  advance(s,72);assert.equal(s.pending,null);
});
test('needs stay bounded and behavior varies across a complete game',()=>{
  for(let seed=1;seed<=20;seed++){
    const s=createGame(seed),seen=new Set();
    while(!s.ending){advance(s,1);if(s.pending)admit(s,s.pending[seed % s.pending.length]);for(const r of s.residents){seen.add(r.action);for(const[k]of NEEDS)assert.ok(r.needs[k]>=0&&r.needs[k]<=100);assert.ok(r.cash>=0);}}
    assert.equal(s.hour,417);assert.equal(s.residents.length,6);assert.ok(seen.size>=9);assert.ok(s.rent>0);assert.ok(s.events.some(e=>e.kind==='trouble'));assert.ok(validateSave(s));
    const hour=s.hour;advance(s,100);assert.equal(s.hour,hour);
  }
});
test('fractional steps match large steps and save round trips preserve progression',()=>{
  const a=createGame(88),b=createGame(88);advance(a,31.5);
  for(let i=0;i<126;i++)advance(b,.25);
  assert.deepEqual(a,b);
  const restored=JSON.parse(JSON.stringify(a));assert.ok(validateSave(restored));advance(a,24);advance(restored,24);assert.deepEqual(a,restored);
});
test('relations and histories are maintained between residents',()=>{
  const s=createGame(42);advance(s,40);admit(s,s.pending[0]);advance(s,55);
  const [a,b]=s.residents;
  assert.equal(a.relationships[b.id],b.relationships[a.id]);assert.ok(a.history.length>0);assert.ok(b.history.length>0);
});
test('player may observe without admitting; incomplete saves are rejected',()=>{
  const s=createGame(99);advance(s,1000);assert.equal(s.ending.name,'ひとりと、ひとつの灰皿');assert.equal(s.hour,417);
  assert.equal(validateSave(null),false);assert.equal(validateSave({version:1}),false);
  const invalid=JSON.parse(JSON.stringify(createGame(10)));invalid.residents[0].needs.hunger=101;assert.equal(validateSave(invalid),false);
});
test('full occupancy can reach all four shared-living endings across 100 seeds',()=>{
  const endings=new Set();
  for(let seed=1;seed<=100;seed++){
    const s=createGame(seed);
    while(!s.ending){advance(s,1);if(s.pending)admit(s,s.pending[seed % s.pending.length]);}
    endings.add(s.ending.name);
  }
  assert.deepEqual([...endings].sort(),['ろくでもない、ただいま','明日払いの楽園','宝の山と、獣の巣','壁の薄い戦場'].sort());
});

test('new games recruit only the six illustrated residents, including final single applicant',()=>{
  const allowed = new Set(['cat', 'hostess', 'fox', 'sister', 'peko', 'ann']);
  const s = createGame(20261009);
  assert.deepEqual(new Set([s.residents[0].type, ...s.remaining]), allowed);
  for (let i = 0; i < 5; i++) {
    advance(s, i === 0 ? 40 : 72);
    assert.ok(s.pending);
    assert.equal(s.pending.length, i === 4 ? 1 : 2);
    assert.ok(s.pending.every(type => allowed.has(type)));
    assert.equal(admit(s, s.pending[0]), true);
    assert.equal(validateSave(s), true);
  }
  assert.equal(s.residents.length, 6);
  assert.equal(s.remaining.length, 0);
  assert.equal(s.pending, null);
});

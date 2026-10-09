import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, advance, admit, validateSave, CHARACTERS } from '../src/simulation.js';

function siblings(seed = 1) {
  const state = createGame(seed);
  advance(state, 40);
  state.pending = ['sister', 'hostess'];
  assert.ok(admit(state, 'sister'));
  return state;
}

test('Nemu is a separate adult resident and starts with a sibling relationship', () => {
  const state = siblings();
  assert.equal(CHARACTERS.sister.age, 22);
  assert.equal(state.residents[1].room, 102);
  assert.equal(state.residents[1].relationships.cat, 25);
  assert.equal(state.residents[0].relationships.sister, 25);
  assert.ok(state.events.some(e => e.lines?.some(line => line.speaker === 'sister')));
  const restored = JSON.parse(JSON.stringify(state));
  assert.ok(validateSave(restored));
  advance(state, 18);
  advance(restored, 18);
  assert.deepEqual(state, restored);
});

test('checking on Moku cleans his room and improves the sibling relationship', () => {
  let checked = false;
  for (let seed = 1; seed <= 30 && !checked; seed++) {
    const state = siblings(seed);
    const [cat, sister] = state.residents;
    cat.journey = null;
    cat.action = 'idle';
    cat.trash = 40;
    cat.needs.stress = 30;
    sister.needs = { hunger: 0, sleep: 0, stress: 30, hygiene: 100, fun: 40, alcohol: 0, smoke: 0 };
    advance(state, 1);
    if (sister.action !== 'checkBrother' || sister.targetRoom !== 101) continue;
    checked = true;
    assert.equal(sister.relationships.cat, 31);
    assert.equal(cat.relationships.sister, 31);
    assert.ok(cat.trash <= 33);
    assert.equal(sister.cash, 12000);
  }
  assert.ok(checked);
});

test('a sleeping brother is not visited or woken up', () => {
  let checked = false;
  for (let seed = 1; seed <= 30 && !checked; seed++) {
    const state = siblings(seed);
    const [cat, sister] = state.residents;
    state.hour = 23;
    cat.journey = null;
    cat.action = 'sleep';
    cat.needs.sleep = 100;
    sister.needs = { hunger: 0, sleep: 0, stress: 30, hygiene: 100, fun: 40, alcohol: 0, smoke: 0 };
    advance(state, 1);
    if (sister.action !== 'checkBrother') continue;
    checked = true;
    assert.equal(cat.action, 'sleep');
    assert.equal(sister.targetRoom, null);
    assert.equal(sister.relationships.cat, 25);
    assert.ok(sister.needs.stress >= 38);
  }
  assert.ok(checked);
});

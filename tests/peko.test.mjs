import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, advance, admit, validateSave } from '../src/simulation.js';

function hungryResident() {
  const state = createGame(1);
  advance(state, 40);
  state.pending = ['peko', 'hostess'];
  assert.ok(admit(state, 'peko'));
  const peko = state.residents.find(r => r.type === 'peko');
  peko.lastOutingDay = 3;
  peko.needs = { hunger: 100, sleep: 0, stress: 0, hygiene: 100, fun: 0, alcohol: 0, smoke: 0 };
  return { state, peko };
}

test('Peko enters with little cash and uses a cheap meal when broke', () => {
  const { state, peko } = hungryResident();
  assert.equal(peko.cash, 300);
  advance(state, 1);
  assert.equal(peko.action, 'eat');
  assert.equal(peko.cash, 100);
  assert.equal(peko.needs.hunger, 62);
  assert.ok(state.events.some(e => e.lines?.some(line => line.speaker === 'peko')));
  assert.ok(validateSave(JSON.parse(JSON.stringify(state))));
});

test('unaffordable food adds debt instead of a negative cash balance', () => {
  const { state, peko } = hungryResident();
  peko.cash = 50;
  advance(state, 1);
  assert.equal(peko.cash, 0);
  assert.equal(peko.debt, 150);
});

test('a full meal costs more and satisfies more hunger', () => {
  const { state, peko } = hungryResident();
  peko.cash = 1000;
  advance(state, 1);
  assert.equal(peko.cash, 100);
  assert.equal(peko.needs.hunger, 35);
  const restored = JSON.parse(JSON.stringify(state));
  advance(state, 20);
  advance(restored, 20);
  assert.deepEqual(state, restored);
});

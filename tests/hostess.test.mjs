import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, advance, admit, validateSave } from '../src/simulation.js';
import { OUTINGS } from '../src/movement.js';

test('Luna can be chosen at the first recruitment and survives save restoration', () => {
  const state = createGame(1);
  advance(state, 40);
  assert.ok(state.pending.includes('hostess'));
  assert.ok(admit(state, 'hostess'));
  assert.equal(state.selected, 102);
  const restored = JSON.parse(JSON.stringify(state));
  assert.ok(validateSave(restored));
  advance(restored, 12);
  const luna = restored.residents.find(r => r.type === 'hostess');
  assert.equal(luna.journey.kind, 'outing');
  assert.equal(luna.journey.reason, OUTINGS.hostess.reason);
  assert.equal(OUTINGS.hostess.duration, 8);
});

test('free counselling improves relationships without charging the listener', () => {
  let observed = false;
  for (let seed = 1; seed <= 20 && !observed; seed++) {
    const state = createGame(seed);
    advance(state, 40);
    admit(state, 'hostess');
    state.hour = 65; // 3日目17時、出勤前
    const [cat, luna] = state.residents;
    cat.lastOutingDay = 3;
    cat.journey = null;
    cat.needs.stress = 50;
    luna.needs = { hunger: 0, sleep: 0, stress: 0, hygiene: 100, fun: 100, alcohol: 0, smoke: 0 };
    luna.cooldowns = {};
    const relation = luna.relationships.cat;
    advance(state, 1);
    if (luna.action !== 'counsel') continue;
    observed = true;
    assert.equal(luna.relationships.cat, relation + 9);
    assert.equal(cat.relationships.hostess, relation + 9);
    assert.equal(luna.cash, 16000);
    assert.ok(cat.needs.stress < 50);
    assert.ok(state.events.some(e => e.lines?.some(line => line.speaker === 'hostess')));
  }
  assert.ok(observed, 'counselling should occur before work');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, advance, admit, validateSave } from '../src/simulation.js';
import { sampleJourney, sampleCompanion } from '../src/movement.js';

function meeting() {
  const state = createGame(1);
  advance(state, 40);
  state.pending = ['ann', 'hostess'];
  admit(state, 'ann');
  advance(state, 7);
  for (let wait = 0; wait < 3 && state.residents.find(r => r.type === 'ann').journey?.kind !== 'outing'; wait++) advance(state, 1);
  return { state, ann: state.residents.find(r => r.type === 'ann') };
}

test('an occasional meeting adds a visitor and support without occupying a room', () => {
  const { state, ann } = meeting();
  assert.equal(ann.journey.companion, 'patron');
  assert.equal(state.residents.length, 2);
  assert.ok(state.events.some(e => e.impact.includes('援助6000円')));
  const before = JSON.parse(JSON.stringify(state));
  assert.ok(validateSave(before));
  advance(state, 10);
  advance(before, 10);
  assert.deepEqual(state, before);
});

test('the visitor walks beside Ann on the outbound street, never inside or on return', () => {
  const { state, ann } = meeting();
  const j = ann.journey;
  assert.equal(sampleCompanion(ann, j.startedAt), null);
  let together = false;
  for (let hour = j.startedAt; hour < j.arriveAt; hour += .02) {
    const companion = sampleCompanion(ann, hour);
    if (!companion) continue;
    together = true;
    const p = sampleJourney(ann, hour);
    assert.equal(p.zone, 'street');
    assert.equal(Math.abs(companion.x - p.x), 55);
    assert.equal(companion.type, 'patron');
  }
  assert.ok(together);
  assert.equal(sampleCompanion(ann, j.arriveAt + .1), null);
  assert.equal(sampleCompanion(ann, j.returnAt + .1), null);
  advance(state, 24);
  assert.equal(ann.journey.companion, undefined, 'next day is a solo outing');
});

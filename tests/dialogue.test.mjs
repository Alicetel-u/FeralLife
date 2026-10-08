import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, advance } from '../src/simulation.js';
import { catIncident, catDoorIncident, catOutingLines, catRentLines, createTalk, stepTalk, SPEECH_MS } from '../src/dialogue.js';

test('the cat opens the observation by speaking', () => {
  const state = createGame(1);
  const spoken = state.events.find(event => event.lines?.length);
  assert.equal(spoken.lines[0].speaker, 'cat');
  assert.ok(spoken.lines.length >= 3);
  const talk = createTalk(0);
  stepTalk(talk, state, 1000, false);
  assert.equal(talk.bubbles[0].text, spoken.lines[0].text);
  stepTalk(talk, state, 1000 + SPEECH_MS.line, false);
  assert.equal(talk.bubbles[0].text, spoken.lines[1].text);
  stepTalk(talk, state, 1000 + SPEECH_MS.line, true);
  assert.equal(talk.bubbles[0].text, spoken.lines[1].text);
});

test('each cat incident and door scene is spoken once', () => {
  const state = { heard: [] };
  const smoke = catIncident(state, 'smoke');
  assert.equal(smoke.kind, 'life');
  assert.equal(catIncident(state, 'smoke'), null);
  for (const action of ['smoke', 'drink', 'idle', 'eat', 'tv', 'clean', 'sleep', 'chat', 'fight']) {
    const scene = catIncident({ heard: [] }, action, 'wolf');
    assert.ok(scene, action);
    for (const line of scene.lines) assert.ok(line.text.length > 0 && line.text.length <= 28, line.text);
  }
  const door = catDoorIncident(state, 'bear', 'steal');
  assert.equal(door.lines[1].speaker, 'bear');
  assert.equal(catDoorIncident(state, 'bear', 'steal'), null);
  assert.equal(catDoorIncident({ heard: [] }, 'cat', 'steal'), null);
  assert.ok(catOutingLines({ heard: [] }).length >= 3);
  assert.equal(catOutingLines(state.heard.includes('first-outing') ? state : { heard: ['first-outing'] }), null);
  assert.ok(catRentLines({ heard: [] }, false)[0].text.includes('封筒'));
  assert.equal(catRentLines({ heard: ['rent-short'] }, false), null);
});

test('a resumed observation does not replay old lines, and new speech still arrives', () => {
  const state = createGame(7);
  const talk = createTalk(state.events[0].id);
  stepTalk(talk, state, 1000, false);
  assert.equal(talk.bubbles[0].speaker, 'cat');
  assert.equal(talk.eventId, 0);
  advance(state, 1);
  stepTalk(talk, state, 2000, false);
  assert.ok(talk.bubbles[0].text.length > 0);
});

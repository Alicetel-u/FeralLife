import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateSave } from '../src/simulation.js';
import { createActOne, advanceActOne, answerActOne, validActOne } from '../src/act-one.js';
import { beginActTwo, advanceActTwo } from '../src/act-two.js';
import { automaticChapterScene } from '../src/dialogue.js';

const queuedScenes = state => state.events
  .filter(event => !event.read && event.lines?.length && automaticChapterScene(event, state.actOne))
  .sort((a, b) => a.id - b.id)
  .map(event => event.actScene);

const finishArrival = state => {
  state.actOne.started = true;
  state.actOne.titlePending = false;
  state.actOne.prologuePending = false;
  const intro = state.events.find(event => event.actScene === 'act2-prologue');
  intro.read = true;
  state.selected = 102;
};

test('chapter one opening stays automatic only during chapter one', () => {
  const first = createActOne(42, [], 1, true);
  const opening = first.events.find(event => event.actScene === 'opening');
  assert.equal(automaticChapterScene(opening, first.actOne), true);
  assert.equal(automaticChapterScene({ actScene: 'act2-prologue', lines: [{ text: '入居' }], cast: ['hostess', 'cat'] }, first.actOne), false);
  assert.equal(automaticChapterScene({ actScene: 'reply', lines: [{ text: '返事' }], cast: ['cat'] }, { chapter: 1 }), true);
  assert.equal(automaticChapterScene({ actScene: 'reply', lines: [{ text: '返事' }], cast: ['hostess', 'cat'] }, { chapter: 2 }), true);
  assert.equal(automaticChapterScene({ actScene: 'reply', lines: [{ text: '返事' }], cast: ['cat'] }, { chapter: 2 }), false);
  assert.equal(automaticChapterScene({ actScene: 'opening', lines: [{ text: '昔' }], cast: ['cat'] }, { chapter: 2 }), false);
});

test('finishing the Luna arrival does not queue the first-act opening', () => {
  const developer = createActOne(42, [], 1, true);
  beginActTwo(developer);
  const opening = developer.events.find(event => event.actScene === 'opening');
  assert.equal(opening.read, true);
  assert.equal(developer.actOne.chapter, 2);
  assert.equal(developer.hour, 57);
  assert.ok(developer.residents.some(resident => resident.type === 'cat' && resident.room === 101));
  assert.ok(developer.residents.some(resident => resident.type === 'hostess' && resident.room === 102));
  developer.actOne.started = true;
  developer.actOne.titlePending = false;
  developer.actOne.prologuePending = false;
  developer.events.filter(event => event.actScene === 'act2-prologue').forEach(event => { event.read = true; });
  developer.actOne.started = false;
  developer.actOne.titlePending = true;
  developer.actOne.prologuePending = true;
  const arrival = developer.events.find(event => event.actScene === 'act2-prologue');
  arrival.read = false;
  opening.read = false;
  finishArrival(developer);
  assert.deepEqual(queuedScenes(developer), []);
  assert.equal(automaticChapterScene(opening, developer.actOne), false);

  const cleared = createActOne(42, [], 2, true);
  advanceActOne(cleared, 100);
  answerActOne(cleared, cleared.actOne.pending.eventId, 'water');
  advanceActOne(cleared, 100);
  answerActOne(cleared, cleared.actOne.pending.eventId, 'coronation');
  advanceActOne(cleared, 100);
  assert.equal(cleared.actOne.status, 'clear');
  cleared.events.find(event => event.actScene === 'opening').read = false;
  beginActTwo(cleared);
  finishArrival(cleared);
  assert.equal(cleared.actOne.chapter, 2);
  assert.equal(cleared.events.find(event => event.actScene === 'opening').read, true);
  assert.deepEqual(queuedScenes(cleared), []);
  assert.ok(cleared.residents.some(resident => resident.type === 'cat' && resident.room === 101));
  assert.ok(cleared.residents.some(resident => resident.type === 'hostess' && resident.room === 102));
  const saved = JSON.parse(JSON.stringify(cleared));
  assert.equal(validActOne(saved) && validateSave(saved), true);
  assert.equal(saved.actOne.chapter, 2);
  assert.equal(saved.hour, 57);
  advanceActTwo(saved, 9);
  assert.equal(saved.actOne.pending.scene, 'bag');
  assert.equal(saved.events.find(event => event.actScene === 'bag')?.title, '第一の事件：夕暮れの待ち伏せ');
});

test('stage queue refuses scenes from the other chapter', () => {
  const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.match(app, /import \{[^}]*automaticChapterScene[^}]*\} from '\.\/dialogue\.js'/);
  assert.match(app, /function syncStageCursor\(\) \{[\s\S]*?automaticChapterScene\(event, state\.actOne\)/);
  assert.match(app, /function queueFreshStageEvents\(\) \{[\s\S]*?automaticChapterScene\(event, state\.actOne\)/);
  assert.match(app, /function openNextStageEvent\(\) \{[\s\S]*?automaticChapterScene\(event, state\.actOne\)/);
  assert.doesNotMatch(app, /__feralDebug/);
});

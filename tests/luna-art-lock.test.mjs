import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { EVENT_ART, EVENT_EXPRESSIONS } from '../src/character-art.js';
import { eventStageHTML } from '../src/event-stage.js';

// Approved Luna illustration (Git blob SHA). Changing it requires an intentional
// art approval and a deliberate update of this test, not a silent replacement.
const approvedPath = 'assets/events/hostess.png';
const approvedBlob = 'e078448bba0d59a783659f3eea0b7f6b74c5af24';
const expressions = ['neutral', 'happy', 'angry', 'sad', 'surprised', 'shy', 'tired'];

test('Luna keeps approved neutral art and uses explicit expressive portraits for other moods', () => {
  assert.equal(EVENT_ART.hostess, approvedPath);
  assert.equal(EVENT_EXPRESSIONS.hostess.neutral, approvedPath);
  for (const emotion of expressions.filter(e => e !== 'neutral')) {
    assert.equal(EVENT_EXPRESSIONS.hostess[emotion], `assets/events/busts/hostess-${emotion}.png`, emotion);
  }
});

test('the original Luna image bytes cannot silently be replaced', async () => {
  const bytes = await readFile(new URL('../' + approvedPath, import.meta.url));
  const sha = createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
  assert.equal(sha, approvedBlob, 'Luna art changed: approve the replacement before updating this baseline');
});

test('Luna dialogue preserves the approved neutral layout and changes emotion portraits', () => {
  const event = {
    id: 1, cast: ['hostess'], rooms: [102],
    lines: [{ speaker: 'hostess', emotion: 'neutral', text: 'こんにちは！' }],
  };
  const html = eventStageHTML(event, [], 0);
  assert.match(html, /data-character="hostess"/);
  assert.match(html, /src="assets\/events\/hostess\.png"/);
  assert.match(html, /fullbody-art/);
  assert.doesNotMatch(html, /busts\/hostess/);
  for (const emotion of expressions.filter(e => e !== 'neutral')) {
    const scene = eventStageHTML({...event, lines:[{speaker:'hostess',emotion,text:'こんにちは！'}]},[],1);
    assert.match(scene, new RegExp(`busts/hostess-${emotion}\\.png`));
    assert.match(scene, /expression-art/);
  }
});

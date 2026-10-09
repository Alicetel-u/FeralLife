import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ROOM_ART } from '../src/character-art.js';

test('Moku room art keeps the interior grid and is embedded in the standalone game', async () => {
  assert.equal(ROOM_ART.cat.src, 'assets/rooms/cat/interior.png');
  const png = await readFile(new URL('../assets/rooms/cat/interior.png', import.meta.url));
  assert.equal(png.readUInt32BE(16), 173 * 4);
  assert.equal(png.readUInt32BE(20), 113 * 4);
  const html = await readFile(new URL('../play.html', import.meta.url), 'utf8');
  assert.ok(html.includes('data:image/png;base64,' + png.toString('base64')));
});

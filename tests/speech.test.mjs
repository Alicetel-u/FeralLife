import test from 'node:test';
import assert from 'node:assert/strict';
import { wrapSpeechText } from '../src/renderer.js';

const pen = { measureText: text => ({ width: Array.from(text).length * 10 }) };
test('speech preserves explicit line breaks and long dialogue without losing characters', () => {
  const text = '今日は準備の日。\n明日からちゃんと片づけるつもりだけど、まずはごはんを食べて、そのあと少し寝る。';
  const lines = wrapSpeechText(pen, text, 70);
  assert.equal(lines[0], '今日は準備の日。');
  assert.equal(lines.join(''), text.replaceAll('\n', ''));
  assert.ok(lines.length > 3);
});
test('Japanese closing punctuation stays with its preceding phrase', () => {
  const lines = wrapSpeechText(pen, '明日から。「ちゃんとする」って言った。', 50);
  assert.ok(lines.every(line => !'、。「」'.includes(line[0]) || line[0] === '「'));
  assert.ok(lines.every(line => !line.endsWith('「')));
  assert.equal(lines.join(''), '明日から。「ちゃんとする」って言った。');
});

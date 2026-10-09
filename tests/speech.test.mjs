import test from 'node:test';
import assert from 'node:assert/strict';
import { wrapSpeechText, WorldRenderer, WORLD_WIDTH } from '../src/renderer.js';
import { createOuting, homeSpot, sampleJourney } from '../src/movement.js';

function view(name, focus = true, room = 101) {
  const renderer = Object.create(WorldRenderer.prototype);
  renderer.view = name;
  renderer.focus = focus;
  renderer.focusRoom = focus ? room : null;
  return renderer;
}
function outing(type, room, at) {
  const person = { type, room, action: 'outing' };
  person.journey = createOuting(person, 18, homeSpot(room));
  const state = { hour: at, selected: room, residents: [person] };
  return { person, state, pos: sampleJourney(person, at, 'table') };
}
function findHour(person, pred) {
  for (let hour = person.journey.startedAt; hour < person.journey.endsAt; hour += 0.002) {
    const pos = sampleJourney(person, hour, 'table');
    if (pred(pos)) return hour;
  }
  throw new Error('position not found');
}

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

test('a visible resident keeps the speech tail on the head, indoors and outdoors', () => {
  const indoors = outing('cat', 101, 18);
  const inside = view('interior').speechAnchor(indoors.state, 'cat');
  assert.equal(inside.tail, true);
  assert.equal(inside.source, '');
  assert.ok(inside.y < 900);

  const walker = outing('cat', 101, 18);
  const streetHour = findHour(walker.person, pos => pos.zone === 'street' && pos.x > 200 && pos.x < 900);
  const street = outing('cat', 101, streetHour);
  const renderer = view('exterior');
  const place = renderer.speechAnchor(street.state, 'cat');
  const head = renderer.projectExterior(street.pos.x, street.pos.y - 80 * 0.86, street.pos);
  const spriteTop = renderer.projectExterior(street.pos.x, street.pos.y - 80, street.pos);
  const oldLift = renderer.projectExterior(street.pos.x, street.pos.y - 108, street.pos);
  assert.equal(place.tail, true);
  assert.equal(place.source, '');
  assert.ok(Math.abs(place.y - head.y) < 1);
  assert.ok(place.y > spriteTop.y - 1);
  assert.ok(oldLift.y + 40 < place.y);

  const doorHour = findHour(walker.person, pos => pos.zone === 'hall');
  const door = view('exterior').speechAnchor(outing('cat', 101, doorHour).state, 'cat');
  assert.equal(door.tail, true);
  assert.equal(door.source, '');

  const upstairs = outing('cat', 201, 18);
  const stairsHour = findHour(upstairs.person, pos => pos.zone === 'stairs');
  const stairs = view('exterior', true, 201).speechAnchor(outing('cat', 201, stairsHour).state, 'cat');
  assert.equal(stairs.tail, true);
  assert.equal(stairs.source, '');
});

test('speech outside the screen stays at the exit and does not claim to come from the room', () => {
  const walker = outing('cat', 101, 18);
  const edgeHour = findHour(walker.person, pos => pos.x > 1045 && pos.zone === 'street');
  const edge = view('exterior').speechAnchor(outing('cat', 101, edgeHour).state, 'cat');
  assert.equal(edge.source, '外出中の声');
  assert.equal(edge.tail, true);
  assert.ok(edge.x > WORLD_WIDTH / 2);
  assert.equal(edge.source.includes('号室'), false);

  const away = outing('cat', 101, walker.person.journey.arriveAt + 0.2);
  const gone = view('exterior').speechAnchor(away.state, 'cat');
  assert.equal(gone.source, '外出中の声');
  assert.ok(gone.x > WORLD_WIDTH / 2);
  assert.ok(gone.y > 230);

  const left = outing('fox', 102, 18);
  const leftGone = view('exterior', true, 102).speechAnchor(outing('fox', 102, left.person.journey.arriveAt + 0.2).state, 'fox');
  assert.equal(leftGone.source, '外出中の声');
  assert.equal(leftGone.x, 72);

  const interior = view('interior').speechAnchor(away.state, 'cat');
  const roomCenter = (22 + 1156 / 2) * (WORLD_WIDTH / 1200);
  assert.equal(interior.source, '外出中の声');
  assert.equal(interior.tail, false);
  assert.ok(Math.abs(interior.x - roomCenter) < 1);
  assert.ok(Math.abs(interior.x - 1510) > 200);

  const upstairs = outing('cat', 201, 18);
  const onStairs = outing('cat', 201, findHour(upstairs.person, pos => pos.zone === 'stairs'));
  assert.equal(view('interior', true, 201).speechAnchor(onStairs.state, 'cat').source, '階段の声');
});

test('an exterior view points an indoor voice at that room door', () => {
  const home = { hour: 17, selected: 101, residents: [{ type: 'cat', room: 101, action: 'idle' }] };
  const renderer = view('exterior');
  const place = renderer.speechAnchor(home, 'cat');
  const pos = sampleJourney(home.residents[0], 17, 'table');
  const door = renderer.projectExterior(218 + 113, 440 - 28, pos);
  assert.equal(place.tail, true);
  assert.equal(place.source, '');
  assert.ok(Math.abs(place.x - door.x) < 1);
  assert.ok(Math.abs(place.y - door.y) < 1);
});

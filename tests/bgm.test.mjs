import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { bedCue, createNormalBgm } from '../src/bgm.js';

function fakeAudio() {
  return {
    loop: false, preload: '', volume: 1, paused: true, currentTime: 0,
    play() { this.paused = false; return Promise.resolve(); },
    pause() { this.paused = true; },
  };
}

test('normal bgm waits for a gesture, then loops until a cinematic', async () => {
  const audio = fakeAudio();
  const bgm = createNormalBgm(audio, fakeAudio(), fakeAudio(), fakeAudio(), fakeAudio(), fakeAudio());
  assert.equal(audio.loop, true);
  assert.equal(audio.volume, 0.35);
  assert.equal(await bgm.setSuppressed(false), false);
  assert.equal(audio.paused, true);
  assert.equal(await bgm.unlock(), true);
  assert.equal(audio.paused, false);
  await bgm.setSuppressed(true);
  assert.equal(audio.paused, true);
  await bgm.setSuppressed(false);
  assert.equal(audio.paused, false);
  await bgm.setEnabled(false);
  assert.equal(bgm.label(), '♫ <span>BGM OFF</span>');
  assert.equal(audio.paused, true);
  await bgm.unlock();
  assert.equal(audio.paused, true);
  await bgm.setEnabled(true);
  assert.equal(audio.paused, false);
});

test('trouble cue replaces the pop loop and restarts only when trouble begins', async () => {
  const normal = fakeAudio();
  const trouble = fakeAudio();
  const bgm = createNormalBgm(normal, trouble, fakeAudio(), fakeAudio(), fakeAudio(), fakeAudio());
  await bgm.unlock();
  assert.equal(normal.paused, false);
  assert.equal(trouble.paused, true);
  normal.currentTime = 12;
  await bgm.setScene(false, 'trouble');
  assert.equal(bgm.cue, 'trouble');
  assert.equal(normal.paused, true);
  assert.equal(trouble.paused, false);
  assert.equal(trouble.currentTime, 0);
  trouble.currentTime = 8;
  await bgm.setScene(false, 'trouble');
  assert.equal(trouble.currentTime, 8);
  assert.equal(trouble.paused, false);
  await bgm.setScene(true, 'trouble');
  assert.equal(trouble.paused, true);
  await bgm.setScene(false, 'normal');
  assert.equal(normal.paused, false);
  assert.equal(normal.currentTime, 12);
  assert.equal(trouble.paused, true);
});

test('bad ending cue uses the fire track and continues through the same ending', async () => {
  const normal = fakeAudio();
  const bad = fakeAudio();
  const bgm = createNormalBgm(normal, fakeAudio(), bad, fakeAudio(), fakeAudio(), fakeAudio());
  await bgm.unlock();
  normal.currentTime = 4;
  await bgm.setScene(false, 'bad');
  assert.equal(bgm.cue, 'bad');
  assert.equal(bad.paused, false);
  assert.equal(bad.currentTime, 0);
  assert.equal(normal.paused, true);
  bad.currentTime = 6;
  await bgm.setScene(false, 'bad');
  assert.equal(bad.currentTime, 6);
  await bgm.setScene(false, 'normal');
  assert.equal(normal.paused, false);
  assert.equal(normal.currentTime, 4);
  assert.equal(bad.paused, true);
});

test('game title cue uses the countdown and restarts only when the title returns', async () => {
  const normal = fakeAudio();
  const title = fakeAudio();
  const bgm = createNormalBgm(normal, fakeAudio(), fakeAudio(), title, fakeAudio(), fakeAudio());
  await bgm.unlock();
  normal.currentTime = 9;
  await bgm.setScene(false, 'title');
  assert.equal(bgm.cue, 'title');
  assert.equal(title.paused, false);
  assert.equal(title.currentTime, 0);
  assert.equal(normal.paused, true);
  title.currentTime = 5;
  await bgm.setScene(false, 'title');
  assert.equal(title.currentTime, 5);
  await bgm.setScene(false, 'normal');
  assert.equal(normal.paused, false);
  assert.equal(normal.currentTime, 9);
  assert.equal(title.paused, true);
});

test('clock cue starts when the rewind dial appears and does not restart mid-dial', async () => {
  const bad = fakeAudio();
  const clock = fakeAudio();
  const bgm = createNormalBgm(fakeAudio(), fakeAudio(), bad, fakeAudio(), clock, fakeAudio());
  await bgm.unlock();
  await bgm.setScene(false, 'bad');
  assert.equal(bad.paused, false);
  await bgm.setScene(false, 'clock');
  assert.equal(bgm.cue, 'clock');
  assert.equal(clock.paused, false);
  assert.equal(clock.currentTime, 0);
  assert.equal(bad.paused, true);
  clock.currentTime = 3;
  await bgm.setScene(false, 'clock');
  assert.equal(clock.currentTime, 3);
});

test('uneasy air replaces pop after the first leap and resumes across other cues', async () => {
  const normal = fakeAudio();
  const trouble = fakeAudio();
  const uneasy = fakeAudio();
  const bgm = createNormalBgm(normal, trouble, fakeAudio(), fakeAudio(), fakeAudio(), uneasy);
  await bgm.unlock();
  normal.currentTime = 7;
  await bgm.setScene(false, 'uneasy');
  assert.equal(bgm.cue, 'uneasy');
  assert.equal(uneasy.paused, false);
  assert.equal(uneasy.currentTime, 0);
  assert.equal(normal.paused, true);
  uneasy.currentTime = 11;
  await bgm.setScene(false, 'uneasy');
  assert.equal(uneasy.currentTime, 11);
  await bgm.setScene(false, 'trouble');
  await bgm.setScene(false, 'uneasy');
  assert.equal(uneasy.paused, false);
  assert.equal(uneasy.currentTime, 11);
  assert.equal(trouble.paused, true);
  await bgm.setScene(false, 'normal');
  assert.equal(normal.paused, false);
  assert.equal(normal.currentTime, 7);
});

test('everyday bed stays pop until chapter one has rewound once', () => {
  assert.equal(bedCue({ attempt: 1 }), 'normal');
  assert.equal(bedCue({ attempt: 2 }), 'uneasy');
  assert.equal(bedCue({ attempt: 5 }), 'uneasy');
  assert.equal(bedCue({ chapter: 2, attempt: 1 }), 'normal');
  assert.equal(bedCue({ chapter: 2, attempt: 4 }), 'normal');
  assert.equal(bedCue(undefined), 'normal');
});

test('packaged bgm files are mp3s', async () => {
  for (const name of ['normal-pop.mp3', 'trouble-persona.mp3', 'bad-end-fire.mp3', 'title-countdown.mp3', 'clock-rewind.mp3', 'uneasy-air.mp3']) {
    const file = await readFile(new URL('../assets/audio/' + name, import.meta.url));
    assert.ok(file.length > 100000);
    assert.ok(file[0] === 0xff || file.subarray(0, 3).toString() === 'ID3');
  }
});

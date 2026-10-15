export const NORMAL_BGM_SRC = 'assets/audio/normal-pop.mp3';
export const TROUBLE_BGM_SRC = 'assets/audio/trouble-persona.mp3';
export const BAD_END_BGM_SRC = 'assets/audio/bad-end-fire.mp3';
export const TITLE_BGM_SRC = 'assets/audio/title-countdown.mp3';
export const CLOCK_BGM_SRC = 'assets/audio/clock-rewind.mp3';
export const UNEASY_BGM_SRC = 'assets/audio/uneasy-air.mp3';
export const VICTORY_BGM_SRC = 'assets/audio/victory-fanfare.mp3';

function prepare(audio) {
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0.35;
  return audio;
}

const STINGS = new Set(['trouble', 'bad', 'title', 'clock', 'victory']);

// Pop until the first rewind. After that, chapter 1's everyday bed is the uneasy air.
// Chapter two keeps the pop bed. Title, trouble, bad endings, and the clock stay on their own cues.
export function bedCue(actOne) {
  if (actOne && actOne.chapter !== 2 && actOne.attempt >= 2) return 'uneasy';
  return 'normal';
}

// Pop during ordinary play, the uneasy air after the first time leap, the countdown on the game title,
// a persona sting on a trouble card, the result fanfare on a cleared trouble,
// the fire track through a bad ending, and the clock piece once the rewind dial appears.
export function createNormalBgm(normalAudio, troubleAudio, badAudio, titleAudio, clockAudio, uneasyAudio, victoryAudio) {
  const tracks = {
    normal: prepare(normalAudio || new Audio(NORMAL_BGM_SRC)),
    trouble: prepare(troubleAudio || new Audio(TROUBLE_BGM_SRC)),
    bad: prepare(badAudio || new Audio(BAD_END_BGM_SRC)),
    title: prepare(titleAudio || new Audio(TITLE_BGM_SRC)),
    clock: prepare(clockAudio || new Audio(CLOCK_BGM_SRC)),
    uneasy: prepare(uneasyAudio || new Audio(UNEASY_BGM_SRC)),
    victory: prepare(victoryAudio || new Audio(VICTORY_BGM_SRC)),
  };
  tracks.clock.loop = false;
  let enabled = true;
  let suppressed = false;
  let unlocked = false;
  let cue = 'normal';
  const sync = async () => {
    const active = tracks[cue];
    for (const audio of Object.values(tracks)) if (audio !== active) audio.pause();
    if (!unlocked || !enabled || suppressed) { active.pause(); return false; }
    if (active.ended && cue === 'clock') return true;
    if (!active.paused) return true;
    try { await active.play(); return true; }
    catch { return false; }
  };
  return {
    get enabled() { return enabled; },
    get cue() { return cue; },
    get clockAudio() { return tracks.clock; },
    label() { return enabled ? '♫ <span>BGM ON</span>' : '♫ <span>BGM OFF</span>'; },
    unlock() { unlocked = true; return sync(); },
    setEnabled(value) { enabled = !!value; return sync(); },
    setSuppressed(value) { suppressed = !!value; return sync(); },
    setScene(suppressedValue, nextCue) {
      suppressed = !!suppressedValue;
      const name = STINGS.has(nextCue) || nextCue === 'uneasy' ? nextCue : 'normal';
      if (STINGS.has(name) && cue !== name) tracks[name].currentTime = 0;
      cue = name;
      return sync();
    },
  };
}

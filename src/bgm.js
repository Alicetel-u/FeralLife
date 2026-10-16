export const NORMAL_BGM_SRC = 'assets/audio/normal-pop.mp3';
export const MOKU_BGM_SRC = 'assets/audio/moku-theme.mp3';
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

// Observation and everyday dialogue (including Moku's scenes) use Moku's theme.
// The first-rewind dialogue selects uneasy explicitly.
export function bedCue(actOne) {
  return 'normal';
}

// Moku's theme during ordinary play, uneasy air after the first time leap, countdown on the game title,
// a persona sting on a trouble card, the result fanfare on a cleared trouble,
// the fire track through a bad ending, and the clock piece once the rewind dial appears.
export function createNormalBgm(normalAudio, troubleAudio, badAudio, titleAudio, clockAudio, uneasyAudio, victoryAudio, mokuAudio) {
  const tracks = {
    normal: prepare(normalAudio || new Audio(NORMAL_BGM_SRC)),
    moku: prepare(mokuAudio || new Audio(MOKU_BGM_SRC)),
    trouble: prepare(troubleAudio || new Audio(TROUBLE_BGM_SRC)),
    bad: prepare(badAudio || new Audio(BAD_END_BGM_SRC)),
    title: prepare(titleAudio || new Audio(TITLE_BGM_SRC)),
    clock: prepare(clockAudio || new Audio(CLOCK_BGM_SRC)),
    uneasy: prepare(uneasyAudio || new Audio(UNEASY_BGM_SRC)),
    victory: prepare(victoryAudio || new Audio(VICTORY_BGM_SRC)),
  };
  tracks.clock.loop = false;
  let enabled = true;
  let volume = 0.35;
  try {
    const raw = globalThis.localStorage?.getItem('feral-bgm-volume');
    if (raw !== null && raw !== undefined) {
      const saved = Number(raw);
      if (Number.isFinite(saved)) volume = Math.max(0, Math.min(1, saved));
    }
  } catch {}
  const syncLevel = () => {
    const level = volume;
    for(const audio of Object.values(tracks)) audio.volume = level;
  };
  syncLevel();
  let suppressed = false;
  let unlocked = false;
  let cue = 'normal';
  const sync = async () => {
    const active = tracks[cue];
    for (const audio of Object.values(tracks)) if (audio !== active) audio.pause();
    if (!unlocked || !enabled || volume === 0 || suppressed) { active.pause(); return false; }
    if (active.ended && cue === 'clock') return true;
    if (!active.paused) return true;
    try { await active.play(); return true; }
    catch { return false; }
  };
  return {
    get enabled() { return enabled; },
    get volume() { return volume; },
    setVolume(value) { volume = Math.max(0, Math.min(1, Number(value) || 0)); try { globalThis.localStorage?.setItem('feral-bgm-volume', String(volume)); } catch {} syncLevel(); return sync(); },
    setVoiceActive() { /* Voice playback does not change BGM volume. */ },
    get cue() { return cue; },
    get clockAudio() { return tracks.clock; },
    label() { return enabled ? '♫ <span>BGM ON</span>' : '♫ <span>BGM OFF</span>'; },
    unlock() { unlocked = true; return sync(); },
    setEnabled(value) { enabled = !!value; return sync(); },
    setSuppressed(value) { suppressed = !!value; return sync(); },
    setScene(suppressedValue, nextCue) {
      suppressed = !!suppressedValue;
      const name = STINGS.has(nextCue) || nextCue === 'uneasy' || nextCue === 'moku' ? nextCue : 'normal';
      if (STINGS.has(name) && cue !== name) tracks[name].currentTime = 0;
      cue = name;
      return sync();
    },
  };
}

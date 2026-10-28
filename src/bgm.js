export const ACT_THREE_BGM_SRC = 'assets/audio/survival-tombs.mp3';
// Reserved upload paths: activate these cues only after both MP3 files are added.
export const ACT_THREE_MAP_BGM_SRC = 'assets/audio/act3-map.mp3';
export const MIMI_BGM_SRC = 'assets/audio/mimi-theme.mp3';
export const DUEL_BGM_SRC = 'assets/audio/duel-ao-wo-isoide.mp3';
export const NORMAL_BGM_SRC = 'assets/audio/normal-pop.mp3';
export const LUNA_BGM_SRC = 'assets/audio/luna-odayakana-gogo.mp3';
export const MOKU_BGM_SRC = 'assets/audio/moku-theme.mp3';
// First-act letter prologue, foyer exchange, and logo card.
export const OPENING_BGM_SRC = 'assets/audio/the-midnight-crossing.mp3';
export const TROUBLE_BGM_SRC = 'assets/audio/trouble-persona.mp3';
export const BAD_END_BGM_SRC = 'assets/audio/bad-end-fire.mp3';
export const TITLE_BGM_SRC = 'assets/audio/title-countdown.mp3';
export const CLOCK_BGM_SRC = 'assets/audio/clock-rewind.mp3';
export const UNEASY_BGM_SRC = 'assets/audio/uneasy-air.mp3';
export const VICTORY_BGM_SRC = 'assets/audio/victory-fanfare.mp3';

function prepare(audio) {
  audio.loop = true;
  audio.preload = 'none';
  audio.volume = 0.35;
  return audio;
}

function bgmTrack(provided,src){
  if(provided)return prepare(provided);
  const audio=prepare(new Audio());
  audio.src=src;
  return audio;
}

const STINGS = new Set(['trouble', 'bad', 'title', 'clock', 'victory', 'duel', 'opening', 'act3']);

// Observation uses the normal bed; dialogue selects character themes explicitly.
// The first-rewind dialogue selects uneasy explicitly.
export function bedCue(actOne) {
  return 'normal';
}

// Moku's theme during ordinary play, uneasy air after the first time leap, countdown on the game title,
// a persona sting on a trouble card, the result fanfare on a cleared trouble,
// the fire track through a bad ending, and the clock piece once the rewind dial appears.
export function createNormalBgm(normalAudio, troubleAudio, badAudio, titleAudio, clockAudio, uneasyAudio, victoryAudio, mokuAudio, duelAudio, lunaAudio, openingAudio, actThreeAudio) {
  const tracks = {
    normal: bgmTrack(normalAudio, NORMAL_BGM_SRC),
    act3: bgmTrack(actThreeAudio ?? (typeof Audio === 'undefined' ? normalAudio : null), ACT_THREE_BGM_SRC),
    duel: bgmTrack(duelAudio, DUEL_BGM_SRC),
    moku: bgmTrack(mokuAudio, MOKU_BGM_SRC),
    opening: bgmTrack(openingAudio ?? (typeof Audio === 'undefined' ? normalAudio : null), OPENING_BGM_SRC),
    luna: bgmTrack(lunaAudio, LUNA_BGM_SRC),
    trouble: bgmTrack(troubleAudio, TROUBLE_BGM_SRC),
    bad: bgmTrack(badAudio, BAD_END_BGM_SRC),
    title: bgmTrack(titleAudio, TITLE_BGM_SRC),
    clock: bgmTrack(clockAudio, CLOCK_BGM_SRC),
    uneasy: bgmTrack(uneasyAudio, UNEASY_BGM_SRC),
    victory: bgmTrack(victoryAudio, VICTORY_BGM_SRC),
  };
  tracks.clock.loop = false;
  const warmed=new Set();
  const warm=name=>{
    const audio=tracks[name];if(!audio||warmed.has(audio))return;
    warmed.add(audio);audio.preload='auto';
    // load() on a playing media element would restart it. Warm each track once.
    if(audio.paused)try{audio.load?.();}catch{}
  };
  const upcoming={title:'opening',opening:'moku',normal:'trouble',moku:'trouble',luna:'duel',trouble:'victory',bad:'clock',clock:'uneasy'};

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
    // Keep the user's BGM slider unchanged; reduce only the actual playback level on phones.
    const mobile = globalThis.matchMedia?.('(pointer: coarse) and (max-width: 950px)')?.matches === true;
    const level = volume * (mobile ? 0.3 : 1);
    for(const audio of Object.values(tracks)) audio.volume = level;
  };
  syncLevel();
  let suppressed = false;
  let unlocked = false;
  let cue = 'normal';
  let openingUnavailable = false;
  const sync = async () => {
    // If the opening file cannot play, keep the title theme instead of silence.
    const active = cue === 'opening' && openingUnavailable ? tracks.title : tracks[cue];
    warm(cue==='opening'&&openingUnavailable?'title':cue);
    for (const audio of Object.values(tracks)) if (audio !== active) audio.pause();
    if (!unlocked || !enabled || volume === 0 || suppressed) { active.pause(); return false; }
    if (active.ended && cue === 'clock') return true;
    if (!active.paused) return true;
    try { await active.play(); return true; }
    catch {
      if(cue === 'opening' && !openingUnavailable){openingUnavailable = true;return sync();}
      return false;
    }
  };
  return {
    preload(...names) { for(const name of names)warm(name); },
    get enabled() { return enabled; },
    get volume() { return volume; },
    setVolume(value) { volume = Math.max(0, Math.min(1, Number(value) || 0)); try { globalThis.localStorage?.setItem('feral-bgm-volume', String(volume)); } catch {} syncLevel(); return sync(); },
    get cue() { return cue; },
    get clockAudio() { return tracks.clock; },
    label() { return enabled ? '♫ <span>BGM ON</span>' : '♫ <span>BGM OFF</span>'; },
    unlock() { unlocked = true; return sync(); },
    setEnabled(value) { enabled = !!value; return sync(); },
    setSuppressed(value) { suppressed = !!value; return sync(); },
    setScene(suppressedValue, nextCue) {
      suppressed = !!suppressedValue;
      const name = STINGS.has(nextCue) || nextCue === 'uneasy' || nextCue === 'moku' || nextCue === 'luna' ? nextCue : 'normal';
      if (STINGS.has(name) && cue !== name) tracks[name].currentTime = 0;
      cue = name;
      warm(name);if(upcoming[name])warm(upcoming[name]);
      return sync();
    },
  };
}

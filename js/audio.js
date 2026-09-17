/**
 * audio.js
 * Funny, dancey, polyphonic procedural music and SFX powered by Tone.js.
 */

let sfxOk, sfxNo, sfxCdBeat, sfxCdGo;
let homeSynths = {}, gameSynths = {}, cdSynths = {};
let musicBus;
let hBeat = 0, gBeat = 0, cdBeat = 0;

/**
 * 64-step polyphonic dance progression for game mode (4 bars of 16th notes)
 */
const GAME_CHORDS = {
  // Bar 1: C Major 7 Funk bounce (off-beat stabs & slides)
  2: ['C4', 'E4', 'G4'],
  6: ['E4', 'G4', 'B4'],
  10: ['C4', 'E4', 'A4'],
  13: ['D4', 'F4', 'A4'],
  14: ['Eb4', 'G4', 'Bb4'], // Comical chromatic upbeat slide

  // Bar 2: A Minor 7 Dance groove
  18: ['A3', 'C4', 'E4', 'G4'],
  22: ['C4', 'E4', 'A4', 'C5'],
  26: ['A3', 'C4', 'E4'],
  29: ['Ab3', 'C4', 'Eb4'], // Funny cartoon slip
  30: ['G3', 'B3', 'D4'],

  // Bar 3: D Minor / F Major bounce
  34: ['D4', 'F4', 'A4'],
  38: ['F4', 'A4', 'C5'],
  42: ['D4', 'G4', 'B4'],
  45: ['F4', 'Ab4', 'Db5'], // Comical dramatic chord
  46: ['F#4', 'A4', 'D5'],

  // Bar 4: G7 Turnaround Climax
  50: ['G3', 'B3', 'D4', 'F4'],
  54: ['B3', 'D4', 'F4', 'A4'],
  58: ['G3', 'C4', 'E4'],
  61: ['F#3', 'A#3', 'C#4'], // Quirky chromatic passing stab
  62: ['G3', 'B3', 'D4', 'F4']
};

const GAME_BASS = {
  // Bar 1: Bouncy slap-octave walking bass
  0: 'C2', 3: 'C3', 6: 'E2', 8: 'G2', 10: 'Bb2', 12: 'C3', 14: 'B2',
  // Bar 2
  16: 'A1', 19: 'A2', 22: 'C2', 24: 'E2', 26: 'G2', 28: 'A2', 30: 'Ab2',
  // Bar 3
  32: 'D2', 35: 'D3', 38: 'F2', 40: 'A2', 42: 'C3', 44: 'D3', 46: 'Db2',
  // Bar 4
  48: 'G1', 50: 'G2', 52: 'B2', 54: 'D2', 56: 'F2', 58: 'G2', 60: 'Gb2', 62: 'G2'
};

const GAME_LEAD = {
  // Bar 1: Cheerful, funny chiptune/arcade hook
  0: 'E5', 2: 'G5', 4: 'A5', 6: 'C6', 8: 'A5', 10: 'G5', 12: 'E5', 14: 'D#5',
  // Bar 2: Bouncy cartoon response
  16: 'E5', 18: 'D5', 20: 'C5', 22: 'E5', 24: 'D5', 26: 'C5', 28: 'A4', 30: 'B4',
  // Bar 3: High playful dance strut
  32: 'F5', 34: 'A5', 36: 'D6', 38: 'C6', 40: 'A5', 42: 'F5', 44: 'E5', 46: 'D5',
  // Bar 4: Funny climax & trill
  48: 'G5', 50: 'A5', 52: 'B5', 54: 'C6', 56: 'D6', 58: 'B5', 60: 'G5', 62: 'F#5'
};

/**
 * 32-step polyphonic cartoon electro-swing lounge loop for home screen
 */
const HOME_CHORDS = {
  2: ['C4', 'E4', 'G4', 'A4'],
  6: ['E4', 'G4', 'B4', 'D5'],
  10: ['C4', 'E4', 'G4', 'A4'],
  14: ['Eb4', 'G4', 'Bb4'],
  18: ['G3', 'B3', 'D4', 'F4'],
  22: ['B3', 'D4', 'F4', 'A4'],
  26: ['G3', 'C4', 'E4'],
  30: ['G3', 'B3', 'D4', 'F4']
};

const HOME_BASS = {
  0: 'C2', 4: 'G2', 8: 'A1', 12: 'E2',
  16: 'D2', 20: 'A2', 24: 'G1', 28: 'B1'
};

const HOME_LEAD = {
  0: 'E5', 3: 'G5', 6: 'C6', 10: 'B5', 12: 'A5', 14: 'G5',
  16: 'F5', 18: 'A5', 22: 'G5', 24: 'F5', 28: 'E5', 30: 'D5'
};

/**
 * Initialize audio contexts and synthesize voices
 */
const initMusic = function() {
  if (musicOk) return;
  musicOk = true;

  try {
    Tone.start();
  } catch(e) {}

  try {
    Tone.Master.volume.value = Tone.gainToDb(Math.max(0.01, vol));
  } catch(e) {}

  // Master bus with gentle limiter & warm filter
  let musicFilter = new Tone.Filter(3800, 'lowpass').toDestination();
  musicBus = new Tone.Limiter(-3).connect(musicFilter);
  let musicGain = new Tone.Gain(0.55).connect(musicBus);

  // Sound effects
  sfxOk = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.005, decay: 0.12, sustain: 0.05, release: 0.08 },
    volume: -12
  }).toDestination();

  sfxNo = new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.01, decay: 0.18, sustain: 0.05, release: 0.12 },
    volume: -15
  }).toDestination();

  sfxCdBeat = new Tone.MembraneSynth({
    pitchDecay: 0.08,
    octaves: 4,
    envelope: { attack: 0.005, decay: 0.2, sustain: 0, release: 0.2 },
    volume: -12
  }).toDestination();

  sfxCdGo = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.35, sustain: 0.2, release: 0.3 },
    volume: -8
  }).toDestination();

  // ================= HOME SCREEN SYNTHS =================
  homeSynths.chords = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.02, decay: 0.18, sustain: 0.15, release: 0.18 },
    maxPolyphony: 6
  }).connect(musicGain);
  homeSynths.chords.volume.value = -17;

  homeSynths.bass = new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.015, decay: 0.22, sustain: 0.2, release: 0.15 }
  }).connect(musicGain);
  homeSynths.bass.volume.value = -14;

  homeSynths.lead = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.02, decay: 0.16, sustain: 0.25, release: 0.16 },
    portamento: 0.03
  }).connect(musicGain);
  homeSynths.lead.volume.value = -15;

  homeSynths.kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 5,
    envelope: { attack: 0.003, decay: 0.22, sustain: 0, release: 0.18 }
  }).connect(musicGain);
  homeSynths.kick.volume.value = -11;

  homeSynths.clap = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.003, decay: 0.09, sustain: 0 }
  }).connect(musicGain);
  homeSynths.clap.volume.value = -20;

  homeSynths.perk = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.005, decay: 0.06, sustain: 0, release: 0.04 }
  }).connect(musicGain);
  homeSynths.perk.volume.value = -18;

  // Home loop: 32-step 16th-note electro-lounge groove
  homeLoop = new Tone.Loop(function(t) {
    if (!sndOn) return;
    let s = hBeat % 32;

    // Gentle dance beat
    if (s % 8 === 0) homeSynths.kick.triggerAttackRelease('C1', '16n', t, 0.7);
    if (s % 8 === 4) homeSynths.clap.triggerAttackRelease('16n', t, 0.4);

    // Polyphonic chord stabs
    if (HOME_CHORDS[s]) {
      homeSynths.chords.triggerAttackRelease(HOME_CHORDS[s], '16n', t, 0.5);
    }

    // Walking comedy bass
    if (HOME_BASS[s]) {
      homeSynths.bass.triggerAttackRelease(HOME_BASS[s], '8n', t, 0.65);
    }

    // Whistling lead melody
    if (HOME_LEAD[s]) {
      homeSynths.lead.triggerAttackRelease(HOME_LEAD[s], '16n', t, 0.55);
    }

    // Cute bubble / woodblock tick
    if (s === 6 || s === 14 || s === 22 || s === 30) {
      homeSynths.perk.triggerAttackRelease('E6', '32n', t, 0.35);
    }

    hBeat++;
  }, '16n');

  // ================= GAME MODE SYNTHS =================
  gameSynths.chords = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.015, decay: 0.16, sustain: 0.1, release: 0.15 },
    maxPolyphony: 8
  }).connect(musicGain);
  gameSynths.chords.volume.value = -16;

  gameSynths.bass = new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.01, decay: 0.18, sustain: 0.25, release: 0.12 }
  }).connect(musicGain);
  gameSynths.bass.volume.value = -13;

  gameSynths.lead = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.02, decay: 0.15, sustain: 0.3, release: 0.15 },
    portamento: 0.02
  }).connect(musicGain);
  gameSynths.lead.volume.value = -14;

  gameSynths.kick = new Tone.MembraneSynth({
    pitchDecay: 0.06,
    octaves: 6,
    envelope: { attack: 0.002, decay: 0.24, sustain: 0, release: 0.15 }
  }).connect(musicGain);
  gameSynths.kick.volume.value = -9;

  gameSynths.clap = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.002, decay: 0.09, sustain: 0 }
  }).connect(musicGain);
  gameSynths.clap.volume.value = -17;

  // Funny cartoon "BOING!" synth
  gameSynths.boing = new Tone.MembraneSynth({
    pitchDecay: 0.18,
    octaves: 4,
    envelope: { attack: 0.002, decay: 0.24, sustain: 0.02, release: 0.14 }
  }).connect(musicGain);
  gameSynths.boing.volume.value = -15;

  // High playful bubble / chip tick
  gameSynths.perk = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.005, decay: 0.06, sustain: 0, release: 0.04 }
  }).connect(musicGain);
  gameSynths.perk.volume.value = -18;

  // Game loop: 64-step 16th-note dance engine
  gameLoop = new Tone.Loop(function(t) {
    if (!sndOn) return;
    let s = gBeat % 64;

    // Four-on-the-floor dance kick
    if (s % 4 === 0 || (s === 62 || s === 63)) {
      gameSynths.kick.triggerAttackRelease('C1', '16n', t, 0.75);
    }

    // Dance backbeat snare/clap on 2 & 4
    if (s % 8 === 4) {
      gameSynths.clap.triggerAttackRelease('16n', t, 0.45);
    }

    // Polyphonic offbeat funky chord stabs
    if (GAME_CHORDS[s]) {
      gameSynths.chords.triggerAttackRelease(GAME_CHORDS[s], '16n', t, 0.6);
    }

    // Comical slappy bouncy bass
    if (GAME_BASS[s]) {
      gameSynths.bass.triggerAttackRelease(GAME_BASS[s], '16n', t, 0.7);
    }

    // Funny whistling lead melody
    if (GAME_LEAD[s]) {
      gameSynths.lead.triggerAttackRelease(GAME_LEAD[s], '16n', t, 0.55);
    }

    // Funny cartoon boings on unexpected beats
    if (s === 14) gameSynths.boing.triggerAttackRelease('F#5', '16n', t, 0.5);
    if (s === 30) gameSynths.boing.triggerAttackRelease('A5', '16n', t, 0.5);
    if (s === 46) gameSynths.boing.triggerAttackRelease('F5', '16n', t, 0.5);
    if (s === 62) gameSynths.boing.triggerAttackRelease('G5', '16n', t, 0.6);

    // Bubble perk syncopations
    if (s === 7 || s === 23 || s === 39 || s === 55) {
      gameSynths.perk.triggerAttackRelease('C6', '32n', t, 0.35);
    }
    if (s === 15 || s === 31 || s === 47 || s === 63) {
      gameSynths.perk.triggerAttackRelease('G6', '32n', t, 0.4);
    }

    gBeat++;
  }, '16n');

  // ================= COUNTDOWN SYNTHS =================
  cdSynths.drum = new Tone.MembraneSynth({
    pitchDecay: 0.08,
    octaves: 5,
    envelope: { attack: 0.003, decay: 0.2, sustain: 0, release: 0.2 },
    volume: -10
  }).connect(musicGain);

  cdSynths.tick = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.005, decay: 0.12, sustain: 0, release: 0.08 },
    volume: -12
  }).connect(musicGain);

  cdSynths.chords = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.1, release: 0.12 },
    maxPolyphony: 4
  }).connect(musicGain);
  cdSynths.chords.volume.value = -14;

  let cdStepNotes = ['G4', 'B4', 'D5', 'G5'];
  let cdStepChords = [
    ['C4', 'E4', 'G4'],
    ['D4', 'F#4', 'A4'],
    ['E4', 'G#4', 'B4'],
    ['F4', 'A4', 'C5']
  ];

  cdLoop = new Tone.Loop(function(t) {
    if (!sndOn) return;
    let noteIdx = Math.floor(cdBeat / 4) % cdStepNotes.length;
    let chordIdx = Math.floor(cdBeat / 4) % cdStepChords.length;

    cdSynths.tick.triggerAttackRelease(cdStepNotes[noteIdx], '32n', t, 0.6);
    if (cdBeat % 2 === 0) {
      cdSynths.drum.triggerAttackRelease('C2', '16n', t, 0.7);
    }
    if (cdBeat % 4 === 0) {
      cdSynths.chords.triggerAttackRelease(cdStepChords[chordIdx], '16n', t, 0.55);
    }
    cdBeat++;
  }, '16n');

  Tone.Transport.bpm.value = 116;
  Tone.Transport.start();
  startHomeMusic();
};

/**
 * Start the home background music
 */
const startHomeMusic = function() {
  if (!musicOk) return;
  stopAllMusic();
  hBeat = 0;
  try {
    Tone.Transport.bpm.rampTo(116, 0.5);
  } catch(e) {
    Tone.Transport.bpm.value = 116;
  }
  homeLoop.start(0);
  homePlaying = true;
};

/**
 * Start the game background music based on category tempo
 * @param {string} catId 
 */
const startGameMusic = function(catId) {
  if (!musicOk) return;
  stopAllMusic();
  gBeat = 0;
  let catTempo = {
    calculate: 122,
    memorize: 110,
    analyze: 118,
    visualize: 120,
    weigh: 114,
    countup: 128,
    react: 136
  };
  let bpm = catTempo[catId] || 122;
  try {
    Tone.Transport.bpm.rampTo(bpm, 0.5);
  } catch(e) {
    Tone.Transport.bpm.value = bpm;
  }
  gameLoop.start(0);
  gamePlaying = true;
};

/**
 * Start the countdown music
 */
const startCdMusic = function() {
  if (!musicOk) return;
  stopAllMusic();
  cdBeat = 0;
  try {
    Tone.Transport.bpm.rampTo(132, 0.3);
  } catch(e) {
    Tone.Transport.bpm.value = 132;
  }
  cdLoop.start(0);
};

/**
 * Stop all playing music loops
 */
const stopAllMusic = function() {
  try { homeLoop.stop(); homePlaying = false; } catch(e) {}
  try { gameLoop.stop(); gamePlaying = false; } catch(e) {}
  try { cdLoop.stop(); } catch(e) {}
};

/**
 * Toggle sound on/off
 */
const toggleSnd = function() {
  sndOn = !sndOn;
  let icon = sndOn ? '🔊' : '🔇';
  let sb = document.getElementById('sndBtn'); if (sb) sb.textContent = icon;
  let hsb = document.getElementById('homeSndBtn'); if (hsb) hsb.textContent = icon;
  if (typeof updateSettingsUi === 'function') updateSettingsUi();
  if (!sndOn) {
    Tone.Transport.pause();
  } else {
    if (!musicOk) initMusic();
    else Tone.Transport.start();
  }
};

/**
 * Set the volume level
 * @param {number} v 
 */
const setVol = function(v) {
  vol = v / 100;
  try { Tone.Master.volume.value = Tone.gainToDb(Math.max(0.01, vol)); } catch(e) {}
  let gs = document.getElementById('volSlider'); if (gs) gs.value = v;
  let hs = document.getElementById('homeVolSlider'); if (hs) hs.value = v;
  let ss = document.getElementById('settingsVolSlider'); if (ss) ss.value = v;
  let vp = document.getElementById('settingsVolPercent'); if (vp) vp.textContent = v + '%';
};

/**
 * Play the cheerful victory sound effect
 */
const playOk = function() {
  if (!sndOn || !sfxOk) return;
  try {
    let now = Tone.now();
    sfxOk.triggerAttackRelease('C5', '32n', now, 0.6);
    sfxOk.triggerAttackRelease('E5', '32n', now + 0.05, 0.65);
    sfxOk.triggerAttackRelease('G5', '32n', now + 0.10, 0.7);
    sfxOk.triggerAttackRelease('C6', '16n', now + 0.15, 0.8);
  } catch(e) {}
};

/**
 * Play the comical cartoon error sound effect
 */
const playNo = function() {
  if (!sndOn || !sfxNo) return;
  try {
    let now = Tone.now();
    sfxNo.triggerAttackRelease('Eb3', '16n', now, 0.65);
    sfxNo.triggerAttackRelease('D3', '16n', now + 0.08, 0.7);
    sfxNo.triggerAttackRelease('Db3', '8n', now + 0.16, 0.75);
  } catch(e) {}
};

/**
 * Play countdown sound effect
 * @param {number} num 
 */
const playCd = function(num) {
  if (!sndOn || !sfxCdBeat) return;
  try {
    let notes = { 3: 'G4', 2: 'B4', 1: 'D5' };
    sfxCdBeat.triggerAttackRelease(notes[num] || 'G4', '8n');
  } catch(e) {}
};

/**
 * Play start go sound effect
 */
const playGo = function() {
  if (!sndOn || !sfxCdGo) return;
  try {
    sfxCdGo.triggerAttackRelease(['C4', 'G4', 'C5', 'E5'], '4n');
  } catch(e) {}
};

// Start audio context on first user interaction if enabled
if (typeof document !== 'undefined') {
  const unlockAudio = function() {
    if (!musicOk && sndOn) {
      try { initMusic(); } catch(e) {}
    }
    document.removeEventListener('pointerdown', unlockAudio);
    document.removeEventListener('keydown', unlockAudio);
  };
  document.addEventListener('pointerdown', unlockAudio, { passive: true });
  document.addEventListener('keydown', unlockAudio, { passive: true });
}

/**
 * state.js
 * Mutable game state and core utility functions.
 */

let S = {
  m: 'full', ci: 0, qn: 0, sc: 0, cs: {}, tm: 0, ti: null, ap: false, name: '', st: 0,
  best: parseInt(localStorage.getItem('e8b') || '0'),
  cb: JSON.parse(localStorage.getItem('e8c') || '{}'),
  all: JSON.parse(localStorage.getItem('e8a') || '[]'),
  correct: 0, wrong: 0, streak: 0, maxStreak: 0, wrongs: [], rxTimes: [], totalTime: 0, catStartTime: 0, catStats: {}, seed: '', group: '', isPaused: false, tabHidden: false, timerPausedAt: 0, remainingTm: 0,
  bigText: localStorage.getItem('e8bt') === '1'
};

let sndOn = true, musicOk = false, vol = 0.5;
let gameLoop, homeLoop, cdLoop, gamePlaying = false, homePlaying = false;
let streak = 0, lastClickTime = 0;
let pausedForHidden = false;
let compSeed = null;
let seedRand = null;

/**
 * Seeded PRNG (Mulberry32) for reproducible competition questions
 * @param {number} seed 
 * @returns {Function} PRNG function
 */
const makeSeededRng = function(seed) {
  let s = seed >>> 0;
  return function() {
    s = s + 0x6D2B79F5 | 0;
    let t = s;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
};

/**
 * Hash a string to a 32-bit integer
 * @param {string} str 
 * @returns {number}
 */
const hashCode = function(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return h;
};

/**
 * Save all scores to localStorage, capping at 100
 */
const saveScores = function() {
  if (S.all.length > 100) S.all = S.all.slice(-100);
  localStorage.setItem('e8a', JSON.stringify(S.all));
};

/**
 * Random integer between a and b (inclusive)
 * @param {number} a 
 * @param {number} b 
 * @returns {number}
 */
const ri = function(a, b) {
  let r = seedRand ? seedRand() : Math.random();
  return Math.floor(r * (b - a + 1)) + a;
};

/**
 * Shuffle an array in place
 * @param {Array} a 
 * @returns {Array}
 */
const shuf = function(a) {
  let r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    let j = ri(0, i);
    let t = r[i];
    r[i] = r[j];
    r[j] = t;
  }
  return r;
};

/**
 * Generate incorrect options near the correct answer
 * @param {number} ans 
 * @param {number} n 
 * @returns {Array}
 */
const genO = function(ans, n) {
  let o = [ans], sf = 0;
  while (o.length < n && sf < 80) {
    sf++;
    let off = ri(1, Math.max(3, Math.abs(Math.floor(ans * .35))));
    let c = ans + (Math.random() > .5 ? off : -off);
    if (c > 0 && o.indexOf(c) === -1) o.push(c);
  }
  return shuf(o);
};

/**
 * Get rank object for a given score
 * @param {number} s - Total score
 * @returns {{min:number, n:string, i:string}} Rank object
 */
const gR = function(s) {
  let r = RANKS[0];
  for (let i = 0; i < RANKS.length; i++) {
    if (s >= RANKS[i].min) r = RANKS[i];
  }
  return r;
};

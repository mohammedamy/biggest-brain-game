/**
 * js/challenge.js
 * Head-to-Head 2-Player Split-Screen Challenge Mode
 * Enables two players to compete simultaneously on the same device.
 */

let duel = {
  active: false,
  mode: 'all', // 'all' or single category id
  selectedCat: 'calculate',
  ci: 0,
  catList: [],
  timer: 45,
  timerId: null,
  seed: 0,
  p1: { name: 'Player 1', avatar: '🦁', score: 0, qn: 0, correct: 0, wrong: 0, streak: 0, maxStreak: 0, ap: true, st: 0, catScores: {}, cuNext: 0, cuNums: [], memSeq: '', memIn: '', memTimer: null, memLen: 0, visAns: 0, visIn: '' },
  p2: { name: 'Player 2', avatar: '🐯', score: 0, qn: 0, correct: 0, wrong: 0, streak: 0, maxStreak: 0, ap: true, st: 0, catScores: {}, cuNext: 0, cuNums: [], memSeq: '', memIn: '', memTimer: null, memLen: 0, visAns: 0, visIn: '' }
};

/**
 * Open the Challenge Setup Screen
 */
const showChallengeSetup = function() {
  document.body.classList.remove('challenge-mode');
  duel.active = false;
  clearInterval(duel.timerId);
  stopDuelCuPhysics();
  if (duel.p1.memTimer) { clearTimeout(duel.p1.memTimer); duel.p1.memTimer = null; }
  if (duel.p2.memTimer) { clearTimeout(duel.p2.memTimer); duel.p2.memTimer = null; }

  // Restore player names if previously entered
  let p1Inp = document.getElementById('chP1Name');
  let p2Inp = document.getElementById('chP2Name');
  if (p1Inp) p1Inp.value = duel.p1.name;
  if (p2Inp) p2Inp.value = duel.p2.name;

  // Build category buttons in setup
  let grid = document.getElementById('chCatGrid');
  if (grid) {
    grid.innerHTML = '<button class="ch-cat-btn ' + (duel.mode === 'all' ? 'selected' : '') + '" onclick="selectDuelCat(\'all\', this)"><span class="ci-icon">🌟</span><span>All 7 (Grand)</span></button>';
    CATS.forEach(function(c) {
      let isSel = (duel.mode === 'single' && duel.selectedCat === c.id);
      grid.innerHTML += '<button class="ch-cat-btn ' + (isSel ? 'selected' : '') + '" onclick="selectDuelCat(\'' + c.id + '\', this)"><span class="ci-icon">' + c.icon + '</span><span>' + c.name + '</span></button>';
    });
  }

  show('challengeSetupScreen');
};

/**
 * Select a duel mode or category
 * @param {string} catId
 * @param {HTMLElement} btn
 */
const selectDuelCat = function(catId, btn) {
  if (catId === 'all') {
    duel.mode = 'all';
  } else {
    duel.mode = 'single';
    duel.selectedCat = catId;
  }
  document.querySelectorAll('.ch-cat-btn').forEach(function(b) {
    b.classList.remove('selected');
  });
  if (btn) btn.classList.add('selected');
};

/**
 * Start the challenge battle
 */
const startChallengeBattle = function() {
  let p1Inp = document.getElementById('chP1Name');
  let p2Inp = document.getElementById('chP2Name');
  duel.p1.name = (p1Inp && p1Inp.value.trim()) ? p1Inp.value.trim() : 'Player 1';
  duel.p2.name = (p2Inp && p2Inp.value.trim()) ? p2Inp.value.trim() : 'Player 2';

  // Determine category playlist
  if (duel.mode === 'all') {
    duel.catList = CATS.slice();
  } else {
    let chosen = CATS.find(function(c) { return c.id === duel.selectedCat; }) || CATS[0];
    duel.catList = [chosen];
  }

  duel.ci = 0;
  duel.p1.score = 0;
  duel.p2.score = 0;
  duel.p1.catScores = {};
  duel.p2.catScores = {};
  duel.seed = Math.floor(Math.random() * 900000) + 100000;

  initMusic();
  startDuelRound(0);
};

/**
 * Start a specific duel category round
 * @param {number} idx - Category index in duel.catList
 */
const startDuelRound = function(idx) {
  duel.ci = idx;
  let cat = duel.catList[idx];

  // Show countdown overlay
  showCD(CATS.findIndex(function(c) { return c.id === cat.id; }), function() {
    beginDuelCategory(cat);
  });
};

/**
 * Begin duel category gameplay
 * @param {Object} cat - Category definition
 */
const beginDuelCategory = function(cat) {
  duel.active = true;
  document.body.classList.add('challenge-mode');

  // Reset category stats
  duel.p1.qn = 0;
  duel.p1.correct = 0;
  duel.p1.wrong = 0;
  duel.p1.streak = 0;
  duel.p1.ap = true;

  duel.p2.qn = 0;
  duel.p2.correct = 0;
  duel.p2.wrong = 0;
  duel.p2.streak = 0;
  duel.p2.ap = true;

  // Update HUD
  let hudCat = document.getElementById('chHudCat');
  if (hudCat) {
    let roundLabel = (duel.catList.length > 1) ? ' (' + (duel.ci + 1) + '/' + duel.catList.length + ')' : '';
    hudCat.innerHTML = cat.icon + ' ' + cat.name + '<span style="opacity:.6;font-size:.75rem">' + roundLabel + '</span>';
  }

  // Update Player names
  let p1n = document.getElementById('chP1HeaderName');
  let p2n = document.getElementById('chP2HeaderName');
  if (p1n) p1n.textContent = duel.p1.avatar + ' ' + duel.p1.name;
  if (p2n) p2n.textContent = duel.p2.avatar + ' ' + duel.p2.name;

  updateDuelHud();
  show('challengeGameScreen');
  startGameMusic(cat.id);

  // Start timer
  stDuelTimer();

  // Render initial questions for both players
  nextDuelQuestion('p1');
  nextDuelQuestion('p2');
};

/**
 * Start the shared 45s duel timer
 */
const stDuelTimer = function() {
  clearInterval(duel.timerId);
  duel.timer = CAT_TIME;
  updateDuelTimerRing();

  duel.timerId = setInterval(function() {
    if (pausedForHidden) return;
    duel.timer--;
    updateDuelTimerRing();

    if (duel.timer <= 0) {
      clearInterval(duel.timerId);
      duel.active = false;
      duel.p1.ap = false;
      duel.p2.ap = false;
      setTimeout(endDuelCategory, 500);
    }
  }, 1000);
};

/**
 * Update the shared duel circular timer
 */
const updateDuelTimerRing = function() {
  let el = document.getElementById('chTimerNum');
  if (el) {
    el.textContent = duel.timer;
    el.className = 'gt' + (duel.timer <= 5 ? ' warn' : '');
  }

  let r = document.getElementById('chTimerRing');
  if (r) {
    let pct = Math.max(0, duel.timer / CAT_TIME);
    let circ = 2 * Math.PI * 16;
    r.style.strokeDasharray = circ;
    r.style.strokeDashoffset = circ * (1 - pct);
  }
};

/**
 * Update Tug-of-War bar and player score displays
 */
const updateDuelHud = function() {
  let p1s = document.getElementById('chP1Score');
  let p2s = document.getElementById('chP2Score');
  let p1st = document.getElementById('chP1Streak');
  let p2st = document.getElementById('chP2Streak');
  let p1qn = document.getElementById('chP1Qn');
  let p2qn = document.getElementById('chP2Qn');

  if (p1s) p1s.textContent = duel.p1.score;
  if (p2s) p2s.textContent = duel.p2.score;
  if (p1st) p1st.textContent = duel.p1.streak > 1 ? '🔥 ' + duel.p1.streak : '';
  if (p2st) p2st.textContent = duel.p2.streak > 1 ? '🔥 ' + duel.p2.streak : '';
  if (p1qn) p1qn.textContent = 'Q:' + duel.p1.qn;
  if (p2qn) p2qn.textContent = 'Q:' + duel.p2.qn;

  // Tug-of-war indicator
  let p1Bar = document.getElementById('chTugP1');
  let p2Bar = document.getElementById('chTugP2');
  let tot = duel.p1.score + duel.p2.score;
  if (p1Bar && p2Bar) {
    if (tot === 0) {
      p1Bar.style.width = '50%';
      p2Bar.style.width = '50%';
    } else {
      let p1Pct = Math.max(15, Math.min(85, Math.round((duel.p1.score / tot) * 100)));
      p1Bar.style.width = p1Pct + '%';
      p2Bar.style.width = (100 - p1Pct) + '%';
    }
  }
};

/**
 * Generate an equivalent-difficulty question for a player based on question number & seed
 * Both players get the exact same difficulty tier and structure, but distinct numbers/choices
 * so they cannot screen-cheat or copy answers!
 * @param {string} catId
 * @param {number} qn
 * @param {'p1'|'p2'} pk - Player key
 * @returns {Object} Question descriptor
 */
const getDeterministicQuestion = function(catId, qn, pk) {
  let pOffset = (pk === 'p1') ? 10007 : 77777;
  let qSeed = (duel.seed + qn * 13337 + pOffset) >>> 0;
  let rng = makeSeededRng(qSeed);
  let d = Math.min(Math.ceil(qn / 2), 5);

  let qri = function(a, b) {
    return Math.floor(rng() * (b - a + 1)) + a;
  };

  let qshuf = function(arr) {
    let r = arr.slice();
    for (let i = r.length - 1; i > 0; i--) {
      let j = qri(0, i);
      let t = r[i]; r[i] = r[j]; r[j] = t;
    }
    return r;
  };

  let qgenO = function(ans, n) {
    let o = [ans], sf = 0;
    while (o.length < n && sf < 80) {
      sf++;
      let off = qri(1, Math.max(3, Math.abs(Math.floor(ans * .35))));
      let c = ans + (rng() > .5 ? off : -off);
      if (c > 0 && o.indexOf(c) === -1) o.push(c);
    }
    return qshuf(o);
  };

  if (catId === 'calculate') {
    let pool = d <= 2 ? ['add', 'sub', 'mul'] : d <= 3 ? ['sub', 'mul', 'mix'] : ['mul', 'mix', 'miss'];
    let t = pool[(qn - 1) % pool.length]; // Identical operation family on this question index
    if (t === 'add') {
      let x = qri(10, 40 + d * 15), y = qri(10, 40 + d * 15);
      return { ins: 'Solve', qText: x + ' + ' + y, opts: qgenO(x + y, 4), cor: x + y };
    } else if (t === 'sub') {
      let x = qri(30, 80 + d * 20), y = qri(10, x);
      return { ins: 'Solve', qText: x + ' − ' + y, opts: qgenO(x - y, 4), cor: x - y };
    } else if (t === 'mul') {
      let x = qri(3, 9 + d), y = qri(3, 10 + d);
      return { ins: 'Solve', qText: x + ' × ' + y, opts: qgenO(x * y, 4), cor: x * y };
    } else if (t === 'mix') {
      let x = qri(10, 40), y = qri(2, 8), z = qri(3, 15);
      return { ins: 'Solve', qText: x + ' + ' + y + ' × ' + z, opts: qgenO(x + y * z, 4), cor: x + y * z };
    } else {
      let x = qri(3, 12), y = qri(3, 12);
      return { ins: 'Solve', qText: '? × ' + y + ' = ' + (x * y), opts: qgenO(x, 4), cor: x };
    }
  } else if (catId === 'analyze') {
    let pt = ((qn - 1) % 4) + 1; // Symmetrical sequence pattern category
    let ans, ss;
    if (pt === 1) {
      let st = qri(2, 15), sp = qri(2, 4 + d);
      let sq = []; let v = st; for (let i = 0; i < 4; i++) { sq.push(v); v += sp; }
      ans = v; ss = sq.join(', ') + ', ?';
    } else if (pt === 2) {
      let st = qri(2, 4), ml = qri(2, 3);
      let sq = []; let v = st; for (let i = 0; i < 4; i++) { sq.push(v); v *= ml; }
      ans = v; ss = sq.join(', ') + ', ?';
    } else if (pt === 3) {
      let st = qri(1, 10), b2 = qri(1, 3);
      let sq = [st]; let v = st; for (let i = 0; i < 4; i++) { v += b2 + i; sq.push(v); }
      ans = v + b2 + 4; ss = sq.join(', ') + ', ?';
    } else {
      let o2 = qri(0, 5);
      let sq = []; for (let i = 1; i <= 5; i++) sq.push(i * i + o2);
      ans = 36 + o2; ss = sq.join(', ') + ', ?';
    }
    return { ins: 'What comes next?', qText: ss, opts: qgenO(ans, 4), cor: ans };
  } else if (catId === 'react') {
    let cols = [
      { n: 'Red', c: '#ff4444' }, { n: 'Blue', c: '#4488ff' },
      { n: 'Green', c: '#44cc44' }, { n: 'Yellow', c: '#ffcc00' },
      { n: 'Purple', c: '#bb44ff' }, { n: 'Orange', c: '#ff8833' }
    ];
    let four = qshuf(cols).slice(0, 4);
    let inkObj = four[0];
    let wordObj = qn >= 2 ? four[1] : four[0];
    let on = qshuf(four.map(function(x) { return x.n; }));
    return {
      ins: 'What COLOR is the ink?',
      isReact: true,
      wordText: wordObj.n,
      inkColor: inkObj.c,
      cor: inkObj.n,
      opts: on,
      fourPool: four
    };
  } else if (catId === 'weigh') {
    let p = qshuf(OBJ).slice(0, d <= 1 ? 3 : d <= 3 ? 4 : 5);
    let hv, clues;
    let localMk1 = function(a, b) {
      return { l: [a], r: [b], rs: a.w > b.w ? 'left' : a.w < b.w ? 'right' : 'equal' };
    };
    let localMkG = function(la, ra) {
      let lw = 0, rw = 0;
      la.forEach(function(o) { lw += o.w; });
      ra.forEach(function(o) { rw += o.w; });
      return { l: la, r: ra, rs: lw > rw ? 'left' : lw < rw ? 'right' : 'equal' };
    };
    let localFlip = function(cl) {
      return { l: cl.r, r: cl.l, rs: cl.rs === 'left' ? 'right' : cl.rs === 'right' ? 'left' : 'equal' };
    };

    if (d <= 1) {
      let A = qri(35, 55), B = qri(18, A - 6), C = qri(5, B - 4);
      p[0].w = A; p[1].w = B; p[2].w = C; hv = p[0];
      clues = [localMk1(p[0], p[1]), localMk1(p[1], p[2])];
    } else if (d === 2) {
      let A = qri(42, 60), C2 = qri(25, A - 6), B2 = qri(12, C2 - 4), D2 = qri(5, B2 - 2);
      p[0].w = A; p[1].w = B2; p[2].w = C2; p[3].w = D2; hv = p[0];
      clues = [localMk1(p[0], p[2]), localMk1(p[2], p[1]), localMk1(p[2], p[3])];
    } else if (d === 3) {
      let A = qri(45, 65), D3 = qri(28, A - 8), B3 = qri(15, D3 - 5), C3 = qri(8, B3 - 2);
      while (C3 + A <= D3 + B3) A += qri(2, 5);
      p[0].w = A; p[1].w = B3; p[2].w = C3; p[3].w = D3; hv = p[0];
      clues = [localMk1(p[3], p[1]), localMk1(p[3], p[2]), localMkG([p[2], p[0]], [p[3], p[1]])];
    } else if (d === 4) {
      let A = qri(52, 72), B4 = qri(34, A - 10), C4 = qri(24, B4 - 4), D4 = qri(15, C4 - 4), E4 = qri(5, D4 - 4);
      while (A + E4 <= B4 + D4) A += qri(2, 5);
      p[0].w = A; p[1].w = B4; p[2].w = C4; p[3].w = D4; p[4].w = E4; hv = p[0];
      clues = [localMk1(p[1], p[2]), localMk1(p[2], p[3]), localMk1(p[3], p[4]), localMkG([p[0], p[4]], [p[1], p[3]])];
    } else {
      let A = qri(58, 80), B5 = qri(36, A - 14), C5 = qri(25, B5 - 4), D5 = qri(17, C5 - 3), E5 = qri(6, D5 - 4);
      while (C5 + D5 <= B5) C5 += qri(1, 3);
      while (A + E5 <= B5 + C5) A += qri(2, 5);
      p[0].w = A; p[1].w = B5; p[2].w = C5; p[3].w = D5; p[4].w = E5; hv = p[0];
      clues = [localMkG([p[2], p[3]], [p[1]]), localMk1(p[1], p[2]), localMk1(p[3], p[4]), localMkG([p[0], p[4]], [p[1], p[2]])];
    }
    clues = qshuf(clues.map(function(cl) { return (rng() > 0.5) ? localFlip(cl) : cl; }));
    let choices = qshuf(p);
    return {
      ins: '⚖️ Which is the heaviest?',
      isWeigh: true,
      clues: clues,
      choices: choices,
      cor: hv.e
    };
  } else if (catId === 'visualize') {
    let data = generateLegoSvgData(qri, d, qn, pk + '_');
    return {
      ins: 'Count ALL cubes (hidden too)',
      isVis: true,
      svg: data.svg,
      cor: data.ans
    };
  } else if (catId === 'memorize') {
    let len = 3 + Math.min(Math.floor(qn / 2), 4);
    let digits = '';
    for (let i = 0; i < len; i++) digits += qri(1, 9);
    return {
      ins: 'Memorize!',
      isMem: true,
      seq: digits,
      len: len
    };
  } else if (catId === 'countup') {
    let count = 3 + Math.min(qn - 1, 4);
    let minV = (qn <= 2) ? 1 : (qn <= 4) ? 10 : 100;
    let maxV = (qn <= 2) ? 9 : (qn <= 4) ? 99 : 999;
    let nums = [];
    let used = {};
    for (let i = 0; i < count; i++) {
      let n;
      do { n = qri(minV, maxV); } while (used[n]);
      used[n] = true;
      nums.push(n);
    }
    nums.sort(function(a, b) { return a - b; });
    return {
      ins: 'Tap ascending (smallest first)',
      isCountUp: true,
      nums: nums
    };
  }

  return { ins: 'Solve', qText: '5 + 5', opts: [10, 8, 12, 15], cor: 10 };
};

/**
 * Show Memorize Input boxes and numpad for duel player
 * @param {'p1'|'p2'} pk
 */
const showDuelMemInput = function(pk) {
  let p = duel[pk];
  p.memIn = '';
  let card = document.getElementById(pk + 'Card');
  if (!card) return;

  let boxes = '<div class="ch-mem-row">';
  for (let i = 0; i < p.memLen; i++) {
    boxes += '<div class="ch-mem-box ' + (i === 0 ? 'active' : '') + '" id="' + pk + '_mb' + i + '"></div>';
  }
  boxes += '</div>';

  let npHtml = '<div class="numpad">' +
    '<div class="nk" onclick="handleDuelMemTap(\'' + pk + '\', 1)">1</div><div class="nk" onclick="handleDuelMemTap(\'' + pk + '\', 2)">2</div><div class="nk" onclick="handleDuelMemTap(\'' + pk + '\', 3)">3</div>' +
    '<div class="nk" onclick="handleDuelMemTap(\'' + pk + '\', 4)">4</div><div class="nk" onclick="handleDuelMemTap(\'' + pk + '\', 5)">5</div><div class="nk" onclick="handleDuelMemTap(\'' + pk + '\', 6)">6</div>' +
    '<div class="nk" onclick="handleDuelMemTap(\'' + pk + '\', 7)">7</div><div class="nk" onclick="handleDuelMemTap(\'' + pk + '\', 8)">8</div><div class="nk" onclick="handleDuelMemTap(\'' + pk + '\', 9)">9</div>' +
    '<div class="nk nk-del" onclick="handleDuelMemDel(\'' + pk + '\')">⌫</div><div class="nk" onclick="handleDuelMemTap(\'' + pk + '\', 0)">0</div>' +
    '<div class="nk nk-sub" onclick="handleDuelMemSub(\'' + pk + '\')">✓</div>' +
  '</div>';

  card.innerHTML = '<div class="ins">Enter sequence</div>' + boxes + npHtml;
};

/**
 * Handle numpad tap for duel memorize
 * @param {'p1'|'p2'} pk
 * @param {number} n
 */
const handleDuelMemTap = function(pk, n) {
  let p = duel[pk];
  if (!duel.active || !p.ap || p.memIn.length >= p.memLen) return;
  let idx = p.memIn.length;
  p.memIn += n;
  let b = document.getElementById(pk + '_mb' + idx);
  if (b) {
    b.textContent = n;
    b.classList.remove('active');
  }
  if (p.memIn.length < p.memLen) {
    let nextB = document.getElementById(pk + '_mb' + p.memIn.length);
    if (nextB) nextB.classList.add('active');
  } else {
    handleDuelMemSub(pk);
  }
};

/**
 * Handle backspace for duel memorize
 * @param {'p1'|'p2'} pk
 */
const handleDuelMemDel = function(pk) {
  let p = duel[pk];
  if (!duel.active || !p.ap || p.memIn.length <= 0) return;
  let curB = document.getElementById(pk + '_mb' + p.memIn.length);
  if (curB) curB.classList.remove('active');
  p.memIn = p.memIn.slice(0, -1);
  let b = document.getElementById(pk + '_mb' + p.memIn.length);
  if (b) {
    b.textContent = '';
    b.classList.add('active');
  }
};

/**
 * Handle submit for duel memorize
 * @param {'p1'|'p2'} pk
 */
const handleDuelMemSub = function(pk) {
  let p = duel[pk];
  if (!duel.active || !p.ap || !p.memIn.length) return;
  p.ap = false;
  let isCorrect = (p.memIn === p.memSeq);
  for (let i = 0; i < p.memLen; i++) {
    let b = document.getElementById(pk + '_mb' + i);
    if (b) {
      b.classList.remove('active');
      if (p.memIn[i] === p.memSeq[i]) {
        b.style.borderColor = 'var(--green)';
        b.style.background = 'rgba(91,200,160,.2)';
      } else {
        b.style.borderColor = '#ff5050';
        b.style.background = 'rgba(255,80,80,.15)';
      }
    }
  }
  handleDuelScoring(pk, isCorrect);
  setTimeout(function() {
    nextDuelQuestion(pk);
  }, 450);
};

/**
 * Handle numpad tap for duel visualize
 * @param {'p1'|'p2'} pk
 * @param {number} n
 */
const handleDuelVisTap = function(pk, n) {
  let p = duel[pk];
  if (!duel.active || !p.ap || p.visIn.length >= 3) return;
  p.visIn += n;
  let d = document.getElementById(pk + 'Ld');
  if (d) d.textContent = p.visIn;
};

/**
 * Handle backspace for duel visualize
 * @param {'p1'|'p2'} pk
 */
const handleDuelVisDel = function(pk) {
  let p = duel[pk];
  if (!duel.active || !p.ap || !p.visIn.length) return;
  p.visIn = p.visIn.slice(0, -1);
  let d = document.getElementById(pk + 'Ld');
  if (d) d.textContent = p.visIn || '_';
};

/**
 * Handle submit for duel visualize
 * @param {'p1'|'p2'} pk
 */
const handleDuelVisSub = function(pk) {
  let p = duel[pk];
  if (!duel.active || !p.ap || !p.visIn.length) return;
  p.ap = false;
  let d = document.getElementById(pk + 'Ld');
  let val = parseInt(p.visIn);
  let isCorrect = (val === p.visAns);
  if (d) {
    if (isCorrect) {
      d.style.color = 'var(--green)';
      d.textContent = '✓ ' + p.visAns;
    } else {
      d.style.color = '#ff5050';
      d.textContent = '✗→' + p.visAns;
    }
  }
  handleDuelScoring(pk, isCorrect);
  setTimeout(function() {
    nextDuelQuestion(pk);
  }, 450);
};

// ==================== BATTLE COUNT UP 2D COLLISION PHYSICS ====================
let duelCuAnimId = null;
let duelCuCircles = { p1: [], p2: [] };
let duelCuLastTime = 0;

const stopDuelCuPhysics = function(pk) {
  if (pk) {
    duelCuCircles[pk] = [];
    if (duelCuCircles.p1.length === 0 && duelCuCircles.p2.length === 0) {
      if (duelCuAnimId) {
        cancelAnimationFrame(duelCuAnimId);
        duelCuAnimId = null;
      }
    }
  } else {
    duelCuCircles = { p1: [], p2: [] };
    if (duelCuAnimId) {
      cancelAnimationFrame(duelCuAnimId);
      duelCuAnimId = null;
    }
  }
};

const startDuelCuPhysicsLoop = function() {
  duelCuLastTime = performance.now();

  const duelCuPhysicsStep = function(now) {
    if (!duel.active || (duelCuCircles.p1.length === 0 && duelCuCircles.p2.length === 0)) {
      stopDuelCuPhysics();
      return;
    }

    let dt = (now - duelCuLastTime) / 1000;
    duelCuLastTime = now;
    if (dt > 0.035) dt = 0.035;

    ['p1', 'p2'].forEach(function(pk) {
      let circles = duelCuCircles[pk];
      if (!circles || circles.length === 0) return;

      let ar = document.getElementById(pk + 'CuArena');
      if (!ar || !ar.isConnected) {
        duelCuCircles[pk] = [];
        return;
      }

      let curW = ar.offsetWidth || 190;
      let curH = ar.offsetHeight || 160;

      // 1. Move & Wall Reflections
      for (let i = 0; i < circles.length; i++) {
        let c = circles[i];
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        c.angle = (c.angle + c.rotSpeed * dt) % 360;

        if (c.x - c.r < 0) {
          c.x = c.r;
          c.vx = Math.abs(c.vx);
        } else if (c.x + c.r > curW) {
          c.x = curW - c.r;
          c.vx = -Math.abs(c.vx);
        }

        if (c.y - c.r < 0) {
          c.y = c.r;
          c.vy = Math.abs(c.vy);
        } else if (c.y + c.r > curH) {
          c.y = curH - c.r;
          c.vy = -Math.abs(c.vy);
        }
      }

      // 2. Elastic Circle-Circle Collisions (Zero Overlap Guaranteed)
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < circles.length; i++) {
          for (let j = i + 1; j < circles.length; j++) {
            let c1 = circles[i];
            let c2 = circles[j];
            let dx = c2.x - c1.x;
            let dy = c2.y - c1.y;
            let distSq = dx * dx + dy * dy;
            let minDist = c1.r + c2.r;

            if (distSq < minDist * minDist) {
              let dist = Math.sqrt(distSq);
              if (dist === 0) { dx = 1; dy = 0; dist = 1; }
              let nx = dx / dist;
              let ny = dy / dist;

              let overlap = (minDist - dist) * 0.5;
              c1.x -= nx * overlap;
              c1.y -= ny * overlap;
              c2.x += nx * overlap;
              c2.y += ny * overlap;

              c1.x = Math.max(c1.r, Math.min(curW - c1.r, c1.x));
              c1.y = Math.max(c1.r, Math.min(curH - c1.r, c1.y));
              c2.x = Math.max(c2.r, Math.min(curW - c2.r, c2.x));
              c2.y = Math.max(c2.r, Math.min(curH - c2.r, c2.y));

              let dvx = c1.vx - c2.vx;
              let dvy = c1.vy - c2.vy;
              let velAlongNormal = dvx * nx + dvy * ny;

              if (velAlongNormal > 0) {
                let e = 0.98;
                let impulse = -(1 + e) * velAlongNormal / (1 / c1.mass + 1 / c2.mass);
                c1.vx += (impulse / c1.mass) * nx;
                c1.vy += (impulse / c1.mass) * ny;
                c2.vx -= (impulse / c2.mass) * nx;
                c2.vy -= (impulse / c2.mass) * ny;
              }
            }
          }
        }
      }

      // 3. Render Positions & Rotations
      for (let i = 0; i < circles.length; i++) {
        let c = circles[i];
        c.el.style.left = Math.round(c.x - c.r) + 'px';
        c.el.style.top = Math.round(c.y - c.r) + 'px';
        c.el.style.transform = 'rotate(' + c.angle.toFixed(1) + 'deg)';
      }
    });

    duelCuAnimId = requestAnimationFrame(duelCuPhysicsStep);
  };

  duelCuAnimId = requestAnimationFrame(duelCuPhysicsStep);
};

/**
 * Render next question for Player 1 or Player 2
 * @param {'p1'|'p2'} pk - Player key
 */
const nextDuelQuestion = function(pk) {
  if (!duel.active) return;
  let p = duel[pk];
  p.qn++;
  p.st = Date.now();
  p.ap = true;

  if (p.memTimer) {
    clearTimeout(p.memTimer);
    p.memTimer = null;
  }

  updateDuelHud();

  let card = document.getElementById(pk + 'Card');
  if (!card) return;
  card.onclick = null;
  card.classList.remove('weigh-mode');

  let cat = duel.catList[duel.ci];
  let q = getDeterministicQuestion(cat.id, p.qn, pk);

  let keyLabels = (pk === 'p1') ? ['Q', 'W', 'E', 'R'] : ['U', 'I', 'O', 'P'];

  if (q.isCountUp) {
    stopDuelCuPhysics(pk);
    p.cuNums = q.nums;
    p.cuNext = 0;
    let arenaId = pk + 'CuArena';
    card.innerHTML = '<div class="ins">' + q.ins + '</div><div class="cu-arena" id="' + arenaId + '" style="height:100%;min-height:130px"></div>';
    let ar = document.getElementById(arenaId);
    let aw = ar.offsetWidth || 190;
    let ah = ar.offsetHeight || 160;

    let sf = shuf(p.cuNums.map(function(n, i) { return { n: n, i: i }; }));

    let count = q.nums.length;
    let minSz, maxSz;
    if (count <= 4) {
      minSz = 56; maxSz = 72;
    } else if (count <= 6) {
      minSz = 48; maxSz = 62;
    } else {
      minSz = 42; maxSz = 54;
    }

    let maxAllowed = Math.min(aw, ah) * 0.44;
    if (maxSz > maxAllowed) {
      let scale = maxAllowed / maxSz;
      minSz = Math.round(minSz * scale);
      maxSz = Math.round(maxSz * scale);
    }

    let pCircles = [];

    sf.forEach(function(item) {
      let sz = Math.round(minSz + Math.random() * (maxSz - minSz));
      let r = sz / 2;

      let tex = (typeof CU_TEXTURES !== 'undefined') ? CU_TEXTURES[item.i % CU_TEXTURES.length] : null;
      let bg = tex ? tex.bg : '#ff4d6a';
      let borderColor = tex ? tex.border : 'rgba(255,255,255,0.85)';

      // Rotation speed: between 30° and 300° per second in CW or CCW direction
      let degPerSec = 30 + Math.random() * 270;
      let rotDir = (Math.random() > 0.5) ? 1 : -1;
      let rotSpeed = degPerSec * rotDir;
      let angle = Math.random() * 360;

      let speed = 36 + Math.random() * 28;
      let moveAngle = Math.random() * Math.PI * 2;
      let vx = Math.cos(moveAngle) * speed;
      let vy = Math.sin(moveAngle) * speed;

      let el = document.createElement('div');
      el.className = 'cu-circle';
      el.id = pk + 'cu' + item.i;
      el.onclick = function() { handleDuelCountUpTap(pk, item.i); };

      let fontSize = Math.round(sz * (String(item.n).length > 2 ? 0.35 : 0.45));
      el.style.cssText = 'width:' + sz + 'px;height:' + sz + 'px;' +
        'background:' + bg + ';' +
        'border-color:' + borderColor + ';' +
        'font-size:' + fontSize + 'px;font-weight:900;' +
        'text-decoration:underline;text-underline-offset:3px;';
      el.textContent = item.n;
      ar.appendChild(el);

      let bestX = r + Math.random() * Math.max(10, aw - 2 * r);
      let bestY = r + Math.random() * Math.max(10, ah - 2 * r);
      let maxMinDist = -1;

      for (let att = 0; att < 80; att++) {
        let candX = r + Math.random() * Math.max(10, aw - 2 * r);
        let candY = r + Math.random() * Math.max(10, ah - 2 * r);
        let valid = true;
        let closest = Infinity;

        for (let j = 0; j < pCircles.length; j++) {
          let other = pCircles[j];
          let d = Math.hypot(candX - other.x, candY - other.y);
          let req = r + other.r + 5;
          if (d < req) { valid = false; }
          if (d - (r + other.r) < closest) { closest = d - (r + other.r); }
        }

        if (valid) {
          bestX = candX;
          bestY = candY;
          break;
        }
        if (closest > maxMinDist) {
          maxMinDist = closest;
          bestX = candX;
          bestY = candY;
        }
      }

      pCircles.push({
        x: bestX,
        y: bestY,
        r: r,
        sz: sz,
        vx: vx,
        vy: vy,
        angle: angle,
        rotSpeed: rotSpeed,
        mass: r * r,
        el: el,
        done: false
      });
    });

    for (let step = 0; step < 16; step++) {
      for (let i = 0; i < pCircles.length; i++) {
        for (let j = i + 1; j < pCircles.length; j++) {
          let c1 = pCircles[i], c2 = pCircles[j];
          let dx = c2.x - c1.x, dy = c2.y - c1.y;
          let dist = Math.hypot(dx, dy) || 0.001;
          let req = c1.r + c2.r + 3;
          if (dist < req) {
            let overlap = (req - dist) * 0.5;
            let nx = dx / dist, ny = dy / dist;
            c1.x -= nx * overlap; c1.y -= ny * overlap;
            c2.x += nx * overlap; c2.y += ny * overlap;
          }
        }
        let cObj = pCircles[i];
        cObj.x = Math.max(cObj.r, Math.min(aw - cObj.r, cObj.x));
        cObj.y = Math.max(cObj.r, Math.min(ah - cObj.r, cObj.y));
      }
    }

    for (let i = 0; i < pCircles.length; i++) {
      let cObj = pCircles[i];
      cObj.el.style.left = Math.round(cObj.x - cObj.r) + 'px';
      cObj.el.style.top = Math.round(cObj.y - cObj.r) + 'px';
      cObj.el.style.transform = 'rotate(' + cObj.angle.toFixed(1) + 'deg)';
    }

    duelCuCircles[pk] = pCircles;

    if (!duelCuAnimId) {
      startDuelCuPhysicsLoop();
    }
    return;
  }

  if (q.isMem) {
    p.memSeq = q.seq;
    p.memIn = '';
    p.memLen = q.len;

    card.onclick = function() {
      if (p.memTimer) {
        clearTimeout(p.memTimer);
        p.memTimer = null;
        card.onclick = null;
        showDuelMemInput(pk);
      }
    };

    card.innerHTML = '<div class="ins">' + q.ins + '</div>' +
      '<div class="cd2" style="letter-spacing:5px;color:var(--yellow);cursor:pointer">' + q.seq.split('').join('  ') + '</div>' +
      '<div style="font-size:11px;opacity:.4;margin-top:4px;cursor:pointer">Tap when ready</div>';

    p.memTimer = setTimeout(function() {
      if (!duel.active || !p.ap) return;
      p.memTimer = null;
      card.onclick = null;
      showDuelMemInput(pk);
    }, 1000 + q.len * 650);
    return;
  }

  if (q.isVis) {
    p.visAns = q.cor;
    p.visIn = '';
    card.onclick = null;

    let npHtml = '<div class="numpad">' +
      '<div class="nk" onclick="handleDuelVisTap(\'' + pk + '\', 1)">1</div><div class="nk" onclick="handleDuelVisTap(\'' + pk + '\', 2)">2</div><div class="nk" onclick="handleDuelVisTap(\'' + pk + '\', 3)">3</div>' +
      '<div class="nk" onclick="handleDuelVisTap(\'' + pk + '\', 4)">4</div><div class="nk" onclick="handleDuelVisTap(\'' + pk + '\', 5)">5</div><div class="nk" onclick="handleDuelVisTap(\'' + pk + '\', 6)">6</div>' +
      '<div class="nk" onclick="handleDuelVisTap(\'' + pk + '\', 7)">7</div><div class="nk" onclick="handleDuelVisTap(\'' + pk + '\', 8)">8</div><div class="nk" onclick="handleDuelVisTap(\'' + pk + '\', 9)">9</div>' +
      '<div class="nk nk-del" onclick="handleDuelVisDel(\'' + pk + '\')">⌫</div><div class="nk" onclick="handleDuelVisTap(\'' + pk + '\', 0)">0</div>' +
      '<div class="nk nk-sub" onclick="handleDuelVisSub(\'' + pk + '\')">✓</div>' +
    '</div>';

    card.innerHTML = '<div class="ins">' + q.ins + '</div>' +
      '<div class="ch-vis-wrap">' + q.svg + '</div>' +
      '<div class="ch-vis-display" id="' + pk + 'Ld">_</div>' +
      npHtml;
    return;
  }

  if (q.isWeigh) {
    card.onclick = null;
    card.classList.add('weigh-mode');
    let bh = '<div class="bwrap">';
    q.clues.forEach(function(cl, idx) {
      bh += '<div class="bitem" id="' + pk + '_bi' + idx + '"><div class="bbeam"><div class="bside bl"><div class="btray">' + cl.l.map(function(o){return o.e;}).join(' ') + '</div><div class="brope"></div></div><div class="bbar"></div><div class="bful"></div><div class="bside br"><div class="btray">' + cl.r.map(function(o){return o.e;}).join(' ') + '</div><div class="brope"></div></div></div></div>';
    });
    bh += '</div>';

    let optHtml = '<div class="og">' + q.choices.map(function(o, i) {
      return '<button class="ob ob-' + i + '" onclick="handleDuelMcq(\'' + pk + '\', this, \'' + o.e + '\', \'' + q.cor + '\')"><span class="key-badge">' + keyLabels[i] + '</span>' + o.e + '</button>';
    }).join('') + '</div>';

    card.innerHTML = '<div class="ins">' + q.ins + '</div>' + bh + optHtml;

    setTimeout(function() {
      if (!duel.active) return;
      q.clues.forEach(function(cl, idx) {
        let tc = cl.rs === 'left' ? 'tl' : cl.rs === 'right' ? 'tr' : 'te';
        let el = document.getElementById(pk + '_bi' + idx);
        if (el) el.classList.add(tc);
      });
    }, 180);
    return;
  }

  if (q.isReact) {
    card.onclick = null;
    let optHtml = '<div class="og">' + q.opts.map(function(name, i) {
      let btnInk = q.fourPool[(i + 1) % 4].c;
      let btnBg = q.fourPool[(i + 2) % 4].c + '22';
      return '<button class="ob" style="color:' + btnInk + ';background:' + btnBg + ';border-color:' + btnInk + '44" onclick="handleDuelMcq(\'' + pk + '\', this, \'' + name + '\', \'' + q.cor + '\')"><span class="key-badge">' + keyLabels[i] + '</span>' + name + '</button>';
    }).join('') + '</div>';

    card.innerHTML = '<div class="ins">' + q.ins + '</div><div class="cw" style="color:' + q.inkColor + ';font-size:clamp(2rem,7vw,3.2rem);margin-bottom:4px;padding:4px 14px">' + q.wordText + '</div>' + optHtml;
    return;
  }

  // Standard MCQ (Calculate, Analyze)
  card.onclick = null;
  let content = q.qHtml || ('<div class="cd2">' + q.qText + '</div>');
  let optHtml = '<div class="og">' + q.opts.map(function(o, i) {
    let corCheck = (typeof o === 'string') ? ('\'' + o + '\', \'' + q.cor + '\'') : (o + ', ' + q.cor);
    return '<button class="ob ob-' + i + '" onclick="handleDuelMcq(\'' + pk + '\', this, ' + corCheck + ')"><span class="key-badge">' + keyLabels[i] + '</span>' + o + '</button>';
  }).join('') + '</div>';

  card.innerHTML = '<div class="ins">' + q.ins + '</div>' + content + optHtml;
};

/**
 * Handle MCQ answer selection in duel
 * @param {'p1'|'p2'} pk
 * @param {HTMLElement} btn
 * @param {*} sel
 * @param {*} cor
 */
const handleDuelMcq = function(pk, btn, sel, cor) {
  if (!duel.active || !duel[pk].ap) return;
  duel[pk].ap = false;

  let isCorrect = (String(sel) === String(cor));
  let card = document.getElementById(pk + 'Card');
  let btns = card ? card.querySelectorAll('.ob') : [];

  if (isCorrect) {
    btn.classList.add('correct');
  } else {
    btn.classList.add('wrong');
    btns.forEach(function(b) {
      if (b.textContent.trim().indexOf(String(cor)) >= 0) b.classList.add('correct');
    });
  }

  handleDuelScoring(pk, isCorrect);

  btns.forEach(function(b) { b.classList.add('disabled'); });
  setTimeout(function() {
    nextDuelQuestion(pk);
  }, 350);
};

/**
 * Handle countup tap in duel
 * @param {'p1'|'p2'} pk
 * @param {number} idx
 */
const handleDuelCountUpTap = function(pk, idx) {
  if (!duel.active || !duel[pk].ap) return;
  let p = duel[pk];
  if (idx === p.cuNext) {
    let el = document.getElementById(pk + 'cu' + idx);
    if (el) el.classList.add('cu-done');
    let circles = duelCuCircles[pk];
    if (circles && circles[idx]) circles[idx].done = true;
    p.cuNext++;
    playOk();
    if (p.cuNext >= p.cuNums.length) {
      p.ap = false;
      stopDuelCuPhysics(pk);
      handleDuelScoring(pk, true);
      setTimeout(function() {
        nextDuelQuestion(pk);
      }, 350);
    }
  } else {
    let el = document.getElementById(pk + 'cu' + idx);
    if (el) {
      el.classList.add('cu-wrong');
      setTimeout(function() { el.classList.remove('cu-wrong'); }, 350);
    }
    handleDuelScoring(pk, false);
  }
};

/**
 * Handle scoring, streak bonuses, and visual effects for a duel answer
 * @param {'p1'|'p2'} pk
 * @param {boolean} isCorrect
 */
const handleDuelScoring = function(pk, isCorrect) {
  let p = duel[pk];
  let arena = document.getElementById(pk + 'Arena');

  if (isCorrect) {
    p.correct++;
    p.streak++;
    if (p.streak > p.maxStreak) p.maxStreak = p.streak;

    let el = (Date.now() - p.st) / 1000;
    let mult = el < 1.5 ? 3 : el < 3 ? 2 : el < 5 ? 1.5 : 1;
    let pts = Math.round(20 * mult);

    let bonus = 0;
    if (p.streak === 3) bonus = 5;
    else if (p.streak === 5) bonus = 15;
    else if (p.streak === 10) bonus = 30;
    else if (p.streak > 10 && p.streak % 5 === 0) bonus = 20;

    p.score += (pts + bonus);
    playOk();

    // Flash arena
    if (arena) {
      arena.style.boxShadow = 'inset 0 0 0 3px rgba(91,200,160,.8), 0 0 15px rgba(91,200,160,.5)';
      setTimeout(function() { arena.style.boxShadow = ''; }, 300);
    }
  } else {
    p.wrong++;
    p.streak = 0;
    playNo();

    if (arena) {
      arena.style.boxShadow = 'inset 0 0 0 3px rgba(255,80,80,.8), 0 0 15px rgba(255,80,80,.5)';
      setTimeout(function() { arena.style.boxShadow = ''; }, 300);
    }
  }

  updateDuelHud();
};

/**
 * End current duel category
 */
const endDuelCategory = function() {
  clearInterval(duel.timerId);
  duel.active = false;
  stopDuelCuPhysics();
  if (duel.p1.memTimer) { clearTimeout(duel.p1.memTimer); duel.p1.memTimer = null; }
  if (duel.p2.memTimer) { clearTimeout(duel.p2.memTimer); duel.p2.memTimer = null; }
  let cat = duel.catList[duel.ci];

  // Save category scores
  duel.p1.catScores[cat.id] = duel.p1.score;
  duel.p2.catScores[cat.id] = duel.p2.score;

  // If more categories in Grand Battle, proceed to next
  if (duel.ci < duel.catList.length - 1) {
    duel.ci++;
    startDuelRound(duel.ci);
  } else {
    // Showdown Final Results
    showDuelResults();
  }
};

/**
 * Show the Duel Showdown Results Screen
 */
const showDuelResults = function() {
  document.body.classList.remove('challenge-mode');
  show('challengeResScreen');

  let p1Total = duel.p1.score;
  let p2Total = duel.p2.score;

  let winnerText = '';
  let crownIcon = '🏆';
  if (p1Total > p2Total) {
    winnerText = duel.p1.name + ' WINS!';
  } else if (p2Total > p1Total) {
    winnerText = duel.p2.name + ' WINS!';
  } else {
    winnerText = 'IT\'S A TIE!';
    crownIcon = '🤝';
  }

  let crownEl = document.getElementById('chWinnerCrown');
  let titleEl = document.getElementById('chWinnerText');
  let p1NameRes = document.getElementById('chResP1Name');
  let p2NameRes = document.getElementById('chResP2Name');
  let p1TotEl = document.getElementById('chResP1Total');
  let p2TotEl = document.getElementById('chResP2Total');

  if (crownEl) crownEl.textContent = crownIcon;
  if (titleEl) titleEl.textContent = winnerText;
  if (p1NameRes) p1NameRes.textContent = duel.p1.avatar + ' ' + duel.p1.name;
  if (p2NameRes) p2NameRes.textContent = duel.p2.avatar + ' ' + duel.p2.name;
  if (p1TotEl) p1TotEl.textContent = p1Total + ' pts';
  if (p2TotEl) p2TotEl.textContent = p2Total + ' pts';

  // Category breakdown table
  let table = document.getElementById('chBreakdownList');
  if (table) {
    table.innerHTML = '';
    duel.catList.forEach(function(c) {
      let s1 = duel.p1.catScores[c.id] || 0;
      let s2 = duel.p2.catScores[c.id] || 0;
      let winBadge = (s1 > s2) ? '🦁' : (s2 > s1) ? '🐯' : '🤝';
      table.innerHTML += '<div class="ch-b-row">' +
        '<div class="ch-b-cat">' + c.icon + ' ' + c.name + '</div>' +
        '<div class="ch-b-p1">' + s1 + '</div>' +
        '<div class="ch-b-p2">' + s2 + '</div>' +
        '<div class="ch-b-win">' + winBadge + '</div>' +
        '</div>';
    });
  }

  playGo();
};

// ==================== KEYBOARD DUAL LISTENERS ====================
document.addEventListener('keydown', function(e) {
  if (!duel.active) return;

  // Player 1 Keys: Q, W, E, R (or 1, 2, 3, 4)
  let p1KeyMap = {
    'KeyQ': 0, 'KeyW': 1, 'KeyE': 2, 'KeyR': 3,
    'Digit1': 0, 'Digit2': 1, 'Digit3': 2, 'Digit4': 3
  };

  // Player 2 Keys: U, I, O, P (or 7, 8, 9, 0)
  let p2KeyMap = {
    'KeyU': 0, 'KeyI': 1, 'KeyO': 2, 'KeyP': 3,
    'Digit7': 0, 'Digit8': 1, 'Digit9': 2, 'Digit0': 3
  };

  if (p1KeyMap[e.code] !== undefined && duel.p1.ap) {
    let idx = p1KeyMap[e.code];
    let card = document.getElementById('p1Card');
    if (card) {
      let btns = card.querySelectorAll('.ob');
      if (btns[idx]) btns[idx].click();
    }
  }

  if (p2KeyMap[e.code] !== undefined && duel.p2.ap) {
    let idx = p2KeyMap[e.code];
    let card = document.getElementById('p2Card');
    if (card) {
      let btns = card.querySelectorAll('.ob');
      if (btns[idx]) btns[idx].click();
    }
  }

  // Handle on-screen Numpads for Player 1
  let p1Card = document.getElementById('p1Card');
  if (p1Card && p1Card.querySelector('.numpad') && duel.p1.ap) {
    if (e.code.startsWith('Digit')) {
      let d = parseInt(e.code.replace('Digit', ''));
      if (!isNaN(d)) {
        if (p1Card.querySelector('.ch-mem-row')) handleDuelMemTap('p1', d);
        else if (p1Card.querySelector('.ch-vis-display')) handleDuelVisTap('p1', d);
      }
    } else if (e.code === 'Backspace') {
      if (p1Card.querySelector('.ch-mem-row')) handleDuelMemDel('p1');
      else if (p1Card.querySelector('.ch-vis-display')) handleDuelVisDel('p1');
    } else if (e.code === 'Enter') {
      if (p1Card.querySelector('.ch-mem-row')) handleDuelMemSub('p1');
      else if (p1Card.querySelector('.ch-vis-display')) handleDuelVisSub('p1');
    }
  }

  // Handle on-screen Numpads for Player 2
  let p2Card = document.getElementById('p2Card');
  if (p2Card && p2Card.querySelector('.numpad') && duel.p2.ap) {
    if (e.code.startsWith('Numpad') && !isNaN(parseInt(e.code.replace('Numpad', '')))) {
      let d = parseInt(e.code.replace('Numpad', ''));
      if (p2Card.querySelector('.ch-mem-row')) handleDuelMemTap('p2', d);
      else if (p2Card.querySelector('.ch-vis-display')) handleDuelVisTap('p2', d);
    } else if (e.code === 'NumpadSubtract' || e.code === 'Delete') {
      if (p2Card.querySelector('.ch-mem-row')) handleDuelMemDel('p2');
      else if (p2Card.querySelector('.ch-vis-display')) handleDuelVisDel('p2');
    } else if (e.code === 'NumpadEnter') {
      if (p2Card.querySelector('.ch-mem-row')) handleDuelMemSub('p2');
      else if (p2Card.querySelector('.ch-vis-display')) handleDuelVisSub('p2');
    }
  }
});

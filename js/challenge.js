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
  p1: { name: 'Player 1', avatar: '🦁', score: 0, qn: 0, correct: 0, wrong: 0, streak: 0, maxStreak: 0, ap: true, st: 0, catScores: {}, cuNext: 0, cuNums: [] },
  p2: { name: 'Player 2', avatar: '🐯', score: 0, qn: 0, correct: 0, wrong: 0, streak: 0, maxStreak: 0, ap: true, st: 0, catScores: {}, cuNext: 0, cuNums: [] }
};

/**
 * Open the Challenge Setup Screen
 */
const showChallengeSetup = function() {
  document.body.classList.remove('challenge-mode');
  duel.active = false;
  clearInterval(duel.timerId);

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
 * Generate a deterministic question for any category based on question number & seed
 * @param {string} catId
 * @param {number} qn
 * @returns {Object} Question descriptor
 */
const getDeterministicQuestion = function(catId, qn) {
  let qSeed = (duel.seed + qn * 13337) >>> 0;
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
    let t = pool[qri(0, pool.length - 1)];
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
    let pt = qri(1, Math.min(d, 4));
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
    let pool = qshuf(OBJ).slice(0, 4);
    let heavy = pool[0].e;
    let other1 = pool[1].e, other2 = pool[2].e;
    // Two balance clues: heavy > other1, other1 > other2
    let clue1 = '<div style="font-size:1.4rem">' + heavy + ' ⚖️ ' + other1 + '</div>';
    let clue2 = '<div style="font-size:1.4rem">' + other1 + ' ⚖️ ' + other2 + '</div>';
    let clues = qshuf([clue1, clue2]).join('');
    let choices = qshuf([heavy, other1, other2, pool[3].e]);
    return {
      ins: 'Which is HEAVIEST?',
      qHtml: '<div style="display:flex;gap:12px;margin:4px 0">' + clues + '</div>',
      opts: choices,
      cor: heavy,
      isString: true
    };
  } else if (catId === 'visualize') {
    // 3D cubes count with rapid 4 MCQ options
    let layers = qri(2, Math.min(3 + d, 5));
    let totalCubes = qri(6, 12 + d * 3);
    return {
      ins: 'Count the 3D cubes',
      qHtml: '<div style="font-size:2.8rem;line-height:1;margin:4px 0">🧊 × ?</div><div style="font-size:.7rem;opacity:.6">(' + layers + ' layers deep)</div>',
      opts: qgenO(totalCubes, 4),
      cor: totalCubes
    };
  } else if (catId === 'memorize') {
    // Sequence recall: 4-6 digits
    let len = Math.min(3 + Math.floor(qn / 2), 6);
    let digits = '';
    for (let i = 0; i < len; i++) digits += qri(1, 9);
    // 3 plausible distractors
    let dist = [];
    while (dist.length < 3) {
      let dStr = digits.slice();
      let pos = qri(0, len - 1);
      let newD = String(qri(1, 9));
      dStr = dStr.substring(0, pos) + newD + dStr.substring(pos + 1);
      if (dStr !== digits && dist.indexOf(dStr) === -1) dist.push(dStr);
    }
    return {
      ins: 'Memorize & Recall',
      isMem: true,
      seq: digits,
      opts: qshuf([digits].concat(dist)),
      cor: digits
    };
  } else if (catId === 'countup') {
    // Mini Count Up arena for split screen
    let count = 4 + Math.min(qn - 1, 2); // 4 to 6 numbers
    let nums = [];
    let used = {};
    for (let i = 0; i < count; i++) {
      let n;
      do { n = qri(1, 50); } while (used[n]);
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

  // Fallback calculate
  return { ins: 'Solve', qText: '5 + 5', opts: [10, 8, 12, 15], cor: 10 };
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

  updateDuelHud();

  let card = document.getElementById(pk + 'Card');
  if (!card) return;

  let cat = duel.catList[duel.ci];
  let q = getDeterministicQuestion(cat.id, p.qn);

  // Key badges for desktop keyboard access:
  // P1: Q, W, E, R
  // P2: U, I, O, P
  let keyLabels = (pk === 'p1') ? ['Q', 'W', 'E', 'R'] : ['U', 'I', 'O', 'P'];

  if (q.isCountUp) {
    p.cuNums = q.nums;
    p.cuNext = 0;
    let arenaId = pk + 'CuArena';
    card.innerHTML = '<div class="ins">' + q.ins + '</div><div class="cu-arena" id="' + arenaId + '" style="height:100%;min-height:130px"></div>';
    let ar = document.getElementById(arenaId);
    let aw = ar.offsetWidth || 180;
    let ah = ar.offsetHeight || 130;

    let cols = 3, rows = 2;
    let cellW = aw / cols;
    let cellH = ah / rows;
    let slots = [];
    for (let r = 0; r < rows; r++) for (let cl = 0; cl < cols; cl++) slots.push({ r: r, c: cl });
    slots = shuf(slots);

    let colors = ['#ff4d6a', '#ffd93d', '#6bcb77', '#4d96ff', '#c780fa', '#ff884b'];

    p.cuNums.forEach(function(n, idx) {
      let slot = slots[idx % slots.length];
      let sz = Math.min(cellW * 0.72, cellH * 0.72, 48);
      let px = Math.round(slot.c * cellW + (cellW - sz) / 2);
      let py = Math.round(slot.r * cellH + (cellH - sz) / 2);

      let el = document.createElement('div');
      el.className = 'cu-circle';
      el.id = pk + 'cu' + idx;
      el.onclick = function() { handleDuelCountUpTap(pk, idx); };
      el.style.cssText = 'width:' + sz + 'px;height:' + sz + 'px;left:' + px + 'px;top:' + py + 'px;background:' + colors[idx % colors.length] + ';font-size:' + Math.round(sz * 0.42) + 'px;border-width:2.5px;';
      el.textContent = n;
      ar.appendChild(el);
    });
    return;
  }

  if (q.isMem) {
    card.innerHTML = '<div class="ins">Memorize!</div><div class="cd2" style="letter-spacing:4px;color:var(--yellow)">' + q.seq + '</div>';
    setTimeout(function() {
      if (!duel.active || !p.ap) return;
      let optHtml = '<div class="og">' + q.opts.map(function(o, i) {
        return '<button class="ob ob-' + i + '" onclick="handleDuelMcq(\'' + pk + '\', this, \'' + o + '\', \'' + q.cor + '\')"><span class="key-badge">' + keyLabels[i] + '</span>' + o + '</button>';
      }).join('') + '</div>';
      card.innerHTML = '<div class="ins">Which sequence was it?</div>' + optHtml;
    }, 1200);
    return;
  }

  if (q.isReact) {
    let optHtml = '<div class="og">' + q.opts.map(function(name, i) {
      let btnInk = q.fourPool[(i + 1) % 4].c;
      let btnBg = q.fourPool[(i + 2) % 4].c + '22';
      return '<button class="ob" style="color:' + btnInk + ';background:' + btnBg + ';border-color:' + btnInk + '44" onclick="handleDuelMcq(\'' + pk + '\', this, \'' + name + '\', \'' + q.cor + '\')"><span class="key-badge">' + keyLabels[i] + '</span>' + name + '</button>';
    }).join('') + '</div>';

    card.innerHTML = '<div class="ins">' + q.ins + '</div><div class="cw" style="color:' + q.inkColor + ';font-size:clamp(2rem,7vw,3.2rem);margin-bottom:4px;padding:4px 14px">' + q.wordText + '</div>' + optHtml;
    return;
  }

  // Standard MCQ (Calculate, Analyze, Weigh, Visualize)
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
    p.cuNext++;
    playOk();
    if (p.cuNext >= p.cuNums.length) {
      p.ap = false;
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
});

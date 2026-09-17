/**
 * ui.js
 * User interface manipulation functions.
 */

/**
 * Show a specific screen and hide others
 * @param {string} id 
 */
const show = function(id) {
  document.querySelectorAll('.screen').forEach(function(s) {
    s.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
};

/**
 * Show floating text animation
 * @param {string} t 
 * @param {boolean} ok 
 */
const showFly = function(t, ok) {
  let d = document.createElement('div');
  d.className = 'fly ' + (ok ? 'fly-ok' : 'fly-no');
  d.textContent = t;
  document.body.appendChild(d);
  setTimeout(function() { d.remove(); }, 700);
};

/**
 * Show a reaction emoji
 * @param {boolean} ok 
 */
const showRx = function(ok) {
  let d = document.createElement('div');
  d.className = 'react-emoji';
  d.textContent = ok ? ['🎉','✅','🔥','💪','⭐'][ri(0,4)] : ['❌','😬','💥','😵'][ri(0,3)];
  document.body.appendChild(d);
  setTimeout(function() { d.remove(); }, 800);
};

/**
 * Flash the card on answer
 * @param {boolean} ok 
 */
const flashCard = function(ok) {
  let card = document.getElementById('gCard');
  if(!card) return;
  card.style.transition = 'box-shadow .3s';
  card.style.boxShadow = ok ? 'inset 0 0 0 3px rgba(91,200,160,.7),0 0 25px rgba(91,200,160,.4)' : 'inset 0 0 0 3px rgba(255,80,80,.7),0 0 25px rgba(255,80,80,.4)';
  setTimeout(function() { card.style.boxShadow = ''; }, 350);
};

/**
 * Generate HTML for multiple choice options
 * @param {Array} opts 
 * @param {number|string} cor 
 * @returns {string} HTML string
 */
const mkO = function(opts, cor) {
  return '<div class="og">' + opts.map(function(o, i) {
    return '<button class="ob ob-' + i + '" onclick="chk(this,' + o + ',\'' + cor + '\')">' + o + '</button>';
  }).join('') + '</div>';
};

/**
 * Update the circular timer ring
 */
const updateTimerRing = function() {
  let r = document.getElementById('gtRing');
  if(!r) return;
  let pct = Math.max(0, S.tm / CAT_TIME);
  let circ = 2 * Math.PI * 16;
  r.style.strokeDasharray = circ;
  r.style.strokeDashoffset = circ * (1 - pct);
  let w = document.getElementById('gtRingWrap');
  if(w) w.classList.toggle('warn', S.tm <= 5);
};

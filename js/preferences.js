/**
 * preferences.js
 * User preferences, accessibility features, and settings drawer modal.
 */

let ttsOn = localStorage.getItem('e8tts') === '1';
let lastSpokenText = '';

/**
 * Toggle big text mode
 */
const toggleBigText = function() {
  S.bigText = !S.bigText;
  localStorage.setItem('e8bt', S.bigText ? '1' : '0');
  applyPrefs();
};

/**
 * Toggle text-to-speech
 */
const toggleTTS = function() {
  ttsOn = !ttsOn;
  localStorage.setItem('e8tts', ttsOn ? '1' : '0');
  applyPrefs();
  if (ttsOn && 'speechSynthesis' in window) {
    speak('Read aloud is on');
  }
};

/**
 * Apply current preferences to the UI
 */
const applyPrefs = function() {
  document.body.classList.toggle('big-text', !!S.bigText);
  let bt = document.getElementById('bigTextBtn');
  if (bt) bt.classList.toggle('pref-on', !!S.bigText);
  let tb = document.getElementById('ttsBtn');
  if (tb) tb.classList.toggle('pref-on', !!ttsOn);
  updateSettingsUi();
};

/**
 * Synchronize settings drawer UI to current state
 */
const updateSettingsUi = function() {
  let modal = document.getElementById('settingsModal');
  if (!modal) return;

  // Sound toggle button
  let st = document.getElementById('settingsSndToggle');
  let ss = document.getElementById('settingsSndStatus');
  if (st) {
    st.textContent = sndOn ? '🔊 On' : '🔇 Muted';
    st.classList.toggle('pref-on', sndOn);
  }
  if (ss) ss.textContent = sndOn ? 'Enabled' : 'Muted';

  // Volume slider in drawer
  let sv = document.getElementById('settingsVolSlider');
  let vp = document.getElementById('settingsVolPercent');
  let currentVolInt = Math.round(vol * 100);
  if (sv) sv.value = currentVolInt;
  if (vp) vp.textContent = currentVolInt + '%';

  // Big text toggle
  let btt = document.getElementById('settingsBigTextToggle');
  if (btt) {
    btt.textContent = S.bigText ? 'Active' : 'Off';
    btt.classList.toggle('pref-on', !!S.bigText);
  }

  // TTS toggle
  let ttt = document.getElementById('settingsTtsToggle');
  if (ttt) {
    ttt.textContent = ttsOn ? 'Active' : 'Off';
    ttt.classList.toggle('pref-on', !!ttsOn);
  }
};

/**
 * Open the settings drawer modal
 */
const openSettings = function() {
  let modal = document.getElementById('settingsModal');
  if (!modal) return;
  updateSettingsUi();
  modal.style.display = 'flex';
  modal.offsetHeight; // Trigger layout reflow for animation
  modal.classList.add('open');
};

/**
 * Close the settings drawer modal
 */
const closeSettings = function() {
  let modal = document.getElementById('settingsModal');
  if (!modal) return;
  modal.classList.remove('open');
  setTimeout(function() {
    if (!modal.classList.contains('open')) {
      modal.style.display = 'none';
    }
  }, 280);
};

/**
 * Close settings if clicking the darkened backdrop
 * @param {Event} e
 */
const closeSettingsOnBackdrop = function(e) {
  if (e.target.id === 'settingsModal') {
    closeSettings();
  }
};

/**
 * Speak the provided text
 * @param {string} text 
 */
const speak = function(text) {
  if (!ttsOn || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    let u = new SpeechSynthesisUtterance(text);
    u.rate = 1.0;
    u.pitch = 1.05;
    u.volume = 0.9;
    window.speechSynthesis.speak(u);
  } catch(e) {}
};

/**
 * Speak the instruction if it's new
 */
const speakInstructionIfNew = function() {
  let ins = document.querySelector('#gCard .ins');
  if (ins) {
    let t = ins.textContent.trim();
    if (t && t !== lastSpokenText) {
      lastSpokenText = t;
      speak(t);
    }
  }
};

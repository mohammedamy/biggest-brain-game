/**
 * preferences.js
 * User preferences and accessibility features.
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
  if(ttsOn && 'speechSynthesis' in window) {
    speak('Read aloud is on');
  }
};

/**
 * Apply current preferences to the UI
 */
const applyPrefs = function() {
  document.body.classList.toggle('big-text', !!S.bigText);
  let bt = document.getElementById('bigTextBtn'); if(bt) bt.classList.toggle('pref-on', !!S.bigText);
  let tb = document.getElementById('ttsBtn'); if(tb) tb.classList.toggle('pref-on', !!ttsOn);
};

/**
 * Speak the provided text
 * @param {string} text 
 */
const speak = function(text) {
  if(!ttsOn || !('speechSynthesis' in window)) return;
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
  if(ins) {
    let t = ins.textContent.trim();
    if(t && t !== lastSpokenText) {
      lastSpokenText = t;
      speak(t);
    }
  }
};

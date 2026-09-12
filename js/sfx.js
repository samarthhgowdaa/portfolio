/**
 * Cyberdeck Web Audio Synthesizer
 * Zero external audio files. Synthesizes subtle high-tech sci-fi UI sound effects
 * using the Web Audio API oscillator nodes. Disabled by default.
 */
window.SG_SFX = (function () {
  'use strict';

  var audioCtx = null;
  var enabled = false;

  function initContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      var AudioCtor = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtor();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Restore state
  try {
    enabled = localStorage.getItem('sg_sfx_enabled') === 'true';
  } catch (e) {}

  function setEnabled(val) {
    enabled = Boolean(val);
    try { localStorage.setItem('sg_sfx_enabled', String(enabled)); } catch (e) {}
    updateUI();
    if (enabled) {
      initContext();
      playChirp(880, 0.06);
    }
  }

  function updateUI() {
    var btn = document.getElementById('sfx-toggle');
    if (!btn) return;
    btn.setAttribute('aria-pressed', String(enabled));
    var label = btn.querySelector('.sfx-state');
    if (label) {
      label.textContent = enabled ? 'SFX: ON' : 'SFX: OFF';
    }
    btn.classList.toggle('is-active', enabled);
  }

  function playChirp(freq, duration) {
    if (!enabled) return;
    initContext();
    if (!audioCtx) return;

    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + duration);

    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }

  function playClick() {
    if (!enabled) return;
    initContext();
    if (!audioCtx) return;

    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.025);

    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.025);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.025);
  }

  function playTerminalKey() {
    if (!enabled) return;
    initContext();
    if (!audioCtx) return;

    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();

    osc.type = 'sine';
    var freq = 600 + Math.random() * 300;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.015);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.015);
  }

  function playLaunch() {
    if (!enabled) return;
    initContext();
    if (!audioCtx) return;

    var now = audioCtx.currentTime;
    [523.25, 659.25, 783.99].forEach(function (f, i) {
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.04);
      gain.gain.setValueAtTime(0.04, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.04 + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.08);
    });
  }

  // Setup click listener for buttons
  document.addEventListener('DOMContentLoaded', function () {
    updateUI();
    var btn = document.getElementById('sfx-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        setEnabled(!enabled);
      });
    }

    // Attach click sound to interactive buttons
    document.addEventListener('click', function (e) {
      if (e.target.closest('button, .btn, .nav a, .swatch-btn, .chip')) {
        playClick();
      }
    });
  });

  return {
    playClick: playClick,
    playChirp: playChirp,
    playTerminalKey: playTerminalKey,
    playLaunch: playLaunch,
    toggle: function () { setEnabled(!enabled); },
    isEnabled: function () { return enabled; }
  };
})();

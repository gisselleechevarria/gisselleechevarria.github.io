/* ===== DECODER AUDIO MODULE ===== */
/* Reuses parent's AudioContext for autoplay compatibility */

var audioContext = null;

function initAudio() {
  if (!audioContext) {
    try { audioContext = window.parent.scannerAudioCtx; } catch(e) {}
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

function sfx(type) {
  if (!audioContext) return;
  var t = audioContext.currentTime;

  if (type === 'decrypt-hover') {
    /* Quick digital unscramble — rising clicks */
    [0, 0.02, 0.04, 0.06].forEach(function(d, i) {
      var o = audioContext.createOscillator(); o.type = 'square';
      o.frequency.value = 400 + i * 200;
      var g = audioContext.createGain();
      g.gain.setValueAtTime(0.06, t + d);
      g.gain.exponentialRampToValueAtTime(0.001, t + d + 0.03);
      o.connect(g); g.connect(audioContext.destination);
      o.start(t + d); o.stop(t + d + 0.04);
    });
  }
  else if (type === 'decrypt-success') {
    /* Triumphant ascending chime */
    [0, 0.1, 0.2, 0.35, 0.5].forEach(function(d, i) {
      var o = audioContext.createOscillator(); o.type = 'square';
      o.frequency.value = [523, 659, 784, 1047, 1319][i];
      var g = audioContext.createGain();
      g.gain.setValueAtTime(0.1, t + d);
      g.gain.exponentialRampToValueAtTime(0.001, t + d + 0.2);
      o.connect(g); g.connect(audioContext.destination);
      o.start(t + d); o.stop(t + d + 0.22);
    });
  }
  else if (type === 'decrypt-fail') {
    /* Harsh buzz */
    var o = audioContext.createOscillator(); o.type = 'sawtooth';
    o.frequency.value = 100;
    var g = audioContext.createGain();
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.connect(g); g.connect(audioContext.destination);
    o.start(t); o.stop(t + 0.35);
  }
  else if (type === 'slot-reveal') {
    /* Password slot filled — bright ding */
    var o = audioContext.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(800, t);
    o.frequency.linearRampToValueAtTime(1200, t + 0.1);
    var g = audioContext.createGain();
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.connect(g); g.connect(audioContext.destination);
    o.start(t); o.stop(t + 0.35);
  }
  else if (type === 'passage-load') {
    /* New file loading — digital hum */
    var o = audioContext.createOscillator(); o.type = 'triangle';
    o.frequency.setValueAtTime(200, t);
    o.frequency.linearRampToValueAtTime(600, t + 0.3);
    var g = audioContext.createGain();
    g.gain.setValueAtTime(0.08, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    o.connect(g); g.connect(audioContext.destination);
    o.start(t); o.stop(t + 0.45);
  }
}

/* Synthesized BGM for Decoder — C minor, ~85 BPM with subtle rhythm */
var bgmOn = false;
function startBGM() {
  if (bgmOn || !audioContext) return;
  bgmOn = true;
  var dest = audioContext.destination;

  /* Filtered pad — warm sawtooth with slow LFO */
  var pad = audioContext.createOscillator(); pad.type = 'sawtooth'; pad.frequency.value = 65.4; /* C2 */
  var padG = audioContext.createGain(); padG.gain.value = 0.04;
  var padF = audioContext.createBiquadFilter(); padF.type = 'lowpass'; padF.frequency.value = 200;
  var lfo = audioContext.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.12;
  var lfoG = audioContext.createGain(); lfoG.gain.value = 120;
  lfo.connect(lfoG); lfoG.connect(padF.frequency);
  pad.connect(padF); padF.connect(padG); padG.connect(dest);
  pad.start(); lfo.start();

  /* Sub bass */
  var sub = audioContext.createOscillator(); sub.type = 'sine'; sub.frequency.value = 32.7; /* C1 */
  var subG = audioContext.createGain(); subG.gain.value = 0.06;
  sub.connect(subG); subG.connect(dest); sub.start();

  /* Bass line — C minor: C2, Eb2, G2, Bb2 (4-note loop, ~85 BPM = 706ms per beat) */
  var bassNotes = [65.4, 77.8, 98, 116.5]; /* C2, Eb2, G2, Bb2 */
  var beatMs = 706;
  function bass() {
    if (!bgmOn) return;
    var t = audioContext.currentTime;
    bassNotes.forEach(function(f, i) {
      var o = audioContext.createOscillator(); o.type = 'square';
      o.frequency.value = f;
      var g = audioContext.createGain();
      g.gain.setValueAtTime(0.05, t + i * beatMs / 1000);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * beatMs / 1000 + 0.5);
      var fl = audioContext.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 300;
      o.connect(fl); fl.connect(g); g.connect(dest);
      o.start(t + i * beatMs / 1000);
      o.stop(t + i * beatMs / 1000 + 0.55);
    });
    setTimeout(bass, beatMs * 4);
  }
  bass();

  /* Arpeggio — C minor: C4, Eb4, G4, C5, G4, Eb4 */
  var arpNotes = [261.6, 311.1, 392, 523.3, 392, 311.1];
  function arp() {
    if (!bgmOn) return;
    var t = audioContext.currentTime;
    arpNotes.forEach(function(f, i) {
      var o = audioContext.createOscillator(); o.type = 'triangle';
      o.frequency.value = f;
      var g = audioContext.createGain();
      g.gain.setValueAtTime(0, t + i * 0.47);
      g.gain.linearRampToValueAtTime(0.025, t + i * 0.47 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.47 + 0.35);
      var fl = audioContext.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 800;
      o.connect(fl); fl.connect(g); g.connect(dest);
      o.start(t + i * 0.47);
      o.stop(t + i * 0.47 + 0.4);
    });
    setTimeout(arp, 2820);
  }
  setTimeout(function() { arp(); }, beatMs * 2);

  /* Hi-hat rhythm — soft clicks on 8th notes */
  function hihat() {
    if (!bgmOn) return;
    var t = audioContext.currentTime;
    for (var i = 0; i < 8; i++) {
      var n = audioContext.createOscillator(); n.type = 'sawtooth';
      n.frequency.value = 6000 + Math.random() * 2000;
      var ng = audioContext.createGain();
      ng.gain.setValueAtTime(i % 2 === 0 ? 0.015 : 0.008, t + i * beatMs / 2000);
      ng.gain.exponentialRampToValueAtTime(0.001, t + i * beatMs / 2000 + 0.02);
      n.connect(ng); ng.connect(dest);
      n.start(t + i * beatMs / 2000);
      n.stop(t + i * beatMs / 2000 + 0.03);
    }
    setTimeout(hihat, beatMs * 4);
  }
  hihat();
}

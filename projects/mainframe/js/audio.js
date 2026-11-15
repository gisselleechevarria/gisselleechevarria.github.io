/* ===== AUDIO MODULE ===== */
/* Web Audio API sound effects for the virus scanner game */

var audioContext = null;

function initAudio() {
  if (!audioContext) {
    /* Try to reuse AudioContext created by parent during user gesture */
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

  if (type === 'scan') {
    /* Original v6 scan: sawtooth sweep 80→400→200 Hz with bandpass filter */
    var osc = audioContext.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.linearRampToValueAtTime(400, t + 1.5);
    osc.frequency.linearRampToValueAtTime(200, t + 2.2);
    var gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.linearRampToValueAtTime(0.1, t + 0.5);
    gain.gain.linearRampToValueAtTime(0.02, t + 2);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.4);
    var fl = audioContext.createBiquadFilter();
    fl.type = 'bandpass';
    fl.frequency.value = 300;
    fl.Q.value = 2;
    osc.connect(fl);
    fl.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(t);
    osc.stop(t + 2.5);
    /* Sub-oscillator */
    var sub = audioContext.createOscillator();
    sub.type = 'square';
    sub.frequency.value = 60;
    var sg = audioContext.createGain();
    sg.gain.setValueAtTime(0.03, t);
    sg.gain.exponentialRampToValueAtTime(0.001, t + 2.2);
    sub.connect(sg);
    sg.connect(audioContext.destination);
    sub.start(t);
    sub.stop(t + 2.3);
  }
  else if (type === 'lock') {
    [0, 0.06, 0.12].forEach(function(delay, i) {
      var osc = audioContext.createOscillator();
      osc.type = 'square';
      osc.frequency.value = [660, 880, 1100][i];
      var gain = audioContext.createGain();
      gain.gain.setValueAtTime(0.12, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.1);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.12);
    });
    var sub = audioContext.createOscillator();
    sub.type = 'sine';
    sub.frequency.value = 80;
    var sg = audioContext.createGain();
    sg.gain.setValueAtTime(0.15, t);
    sg.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    sub.connect(sg);
    sg.connect(audioContext.destination);
    sub.start(t);
    sub.stop(t + 0.35);
  }
  else if (type === 'quarantine') {
    [0, 0.04, 0.08].forEach(function(delay) {
      var osc = audioContext.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 200 + Math.random() * 400;
      var gain = audioContext.createGain();
      gain.gain.setValueAtTime(0.12, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.06);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.08);
    });
    [0.12, 0.18, 0.24].forEach(function(delay, i) {
      var osc = audioContext.createOscillator();
      osc.type = 'square';
      osc.frequency.value = [600, 800, 1100][i];
      var gain = audioContext.createGain();
      gain.gain.setValueAtTime(0.1, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.1);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.12);
    });
  }
  else if (type === 'wrong') {
    var osc = audioContext.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 120;
    var gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  }
  else if (type === 'drain') {
    var osc = audioContext.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.4);
    var gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    var lp = audioContext.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 600;
    osc.connect(lp);
    lp.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(t);
    osc.stop(t + 0.55);
  }
  else if (type === 'clean') {
    [0, 0.1, 0.2, 0.3, 0.45].forEach(function(delay, i) {
      var osc = audioContext.createOscillator();
      osc.type = 'square';
      osc.frequency.value = [523, 659, 784, 1047, 1319][i];
      var gain = audioContext.createGain();
      gain.gain.setValueAtTime(0.1, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.18);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.2);
    });
  }
  else if (type === 'glitch') {
    var osc = audioContext.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.linearRampToValueAtTime(80, t + 0.12);
    var gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(t);
    osc.stop(t + 0.18);
  }
  else if (type === 'purge') {
    var osc = audioContext.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.4);
    var gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    var fl = audioContext.createBiquadFilter();
    fl.type = 'lowpass';
    fl.frequency.setValueAtTime(2000, t);
    fl.frequency.exponentialRampToValueAtTime(100, t + 0.4);
    osc.connect(fl);
    fl.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(t);
    osc.stop(t + 0.5);
    var noise = audioContext.createOscillator();
    noise.type = 'sawtooth';
    noise.frequency.value = 40;
    var ng = audioContext.createGain();
    ng.gain.setValueAtTime(0.08, t + 0.1);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    noise.connect(ng);
    ng.connect(audioContext.destination);
    noise.start(t + 0.1);
    noise.stop(t + 0.4);
  }
  else if (type === 'meow-shock') {
    /* Shocked cat meow — high-pitched sweep down */
    var osc = audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.linearRampToValueAtTime(2200, t + 0.06);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.22);
    var gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(t);
    osc.stop(t + 0.28);
    /* Secondary harmonic */
    var osc2 = audioContext.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(2400, t);
    osc2.frequency.exponentialRampToValueAtTime(800, t + 0.2);
    var g2 = audioContext.createGain();
    g2.gain.setValueAtTime(0.06, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc2.connect(g2);
    g2.connect(audioContext.destination);
    osc2.start(t);
    osc2.stop(t + 0.25);
    /* Brief noise burst */
    var noise = audioContext.createOscillator();
    noise.type = 'sawtooth';
    noise.frequency.value = 4000;
    var ng = audioContext.createGain();
    ng.gain.setValueAtTime(0.04, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    noise.connect(ng);
    ng.connect(audioContext.destination);
    noise.start(t);
    noise.stop(t + 0.06);
  }
  else if (type === 'warning') {
    /* Ascending warning tones to draw attention to HP bar */
    [0, 0.2, 0.4].forEach(function(delay, i) {
      var osc = audioContext.createOscillator();
      osc.type = 'square';
      osc.frequency.value = [440, 660, 880][i];
      var gain = audioContext.createGain();
      gain.gain.setValueAtTime(0.08, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.18);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.2);
    });
  }
  else if (type === 'file-close') {
    /* Quick descending digital zip sound */
    var osc = audioContext.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.25);
    var gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    var fl = audioContext.createBiquadFilter();
    fl.type = 'lowpass';
    fl.frequency.setValueAtTime(3000, t);
    fl.frequency.exponentialRampToValueAtTime(200, t + 0.25);
    osc.connect(fl);
    fl.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(t);
    osc.stop(t + 0.35);
  }
  else if (type === 'shatter') {
    /* Pixel shatter — burst of tiny pops */
    [0, 0.03, 0.06, 0.1, 0.14, 0.18].forEach(function(delay) {
      var osc = audioContext.createOscillator();
      osc.type = 'square';
      osc.frequency.value = 800 + Math.random() * 2000;
      var gain = audioContext.createGain();
      gain.gain.setValueAtTime(0.08, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.04);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.05);
    });
    /* Low crunch */
    var crunch = audioContext.createOscillator();
    crunch.type = 'sawtooth';
    crunch.frequency.value = 60;
    var cg = audioContext.createGain();
    cg.gain.setValueAtTime(0.1, t);
    cg.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    crunch.connect(cg);
    cg.connect(audioContext.destination);
    crunch.start(t);
    crunch.stop(t + 0.25);
  }
  else if (type === 'sweep-crackle') {
    /* Rising static crackle for bottom-to-top disintegration */
    var noise = audioContext.createOscillator();
    noise.type = 'sawtooth';
    noise.frequency.setValueAtTime(100, t);
    noise.frequency.linearRampToValueAtTime(800, t + 0.6);
    noise.frequency.linearRampToValueAtTime(2000, t + 0.8);
    var ng = audioContext.createGain();
    ng.gain.setValueAtTime(0.06, t);
    ng.gain.linearRampToValueAtTime(0.1, t + 0.4);
    ng.gain.linearRampToValueAtTime(0.04, t + 0.7);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.85);
    var nf = audioContext.createBiquadFilter();
    nf.type = 'bandpass';
    nf.frequency.setValueAtTime(400, t);
    nf.frequency.linearRampToValueAtTime(3000, t + 0.8);
    nf.Q.value = 1;
    noise.connect(nf);
    nf.connect(ng);
    ng.connect(audioContext.destination);
    noise.start(t);
    noise.stop(t + 0.9);
    /* Crackling pops layered on top */
    [0, 0.08, 0.18, 0.28, 0.38, 0.48, 0.55, 0.62, 0.68, 0.72].forEach(function(d) {
      var pop = audioContext.createOscillator();
      pop.type = 'square';
      pop.frequency.value = 600 + Math.random() * 2400;
      var pg = audioContext.createGain();
      pg.gain.setValueAtTime(0.05, t + d);
      pg.gain.exponentialRampToValueAtTime(0.001, t + d + 0.03);
      pop.connect(pg);
      pg.connect(audioContext.destination);
      pop.start(t + d);
      pop.stop(t + d + 0.04);
    });
  }
  else if (type === 'poof') {
    /* Sharp final vanish burst */
    var osc = audioContext.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2000, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.15);
    var g = audioContext.createGain();
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(g);
    g.connect(audioContext.destination);
    osc.start(t);
    osc.stop(t + 0.2);
    /* White noise burst */
    var n2 = audioContext.createOscillator();
    n2.type = 'sawtooth';
    n2.frequency.value = 5000;
    var ng2 = audioContext.createGain();
    ng2.gain.setValueAtTime(0.06, t);
    ng2.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    n2.connect(ng2);
    ng2.connect(audioContext.destination);
    n2.start(t);
    n2.stop(t + 0.1);
  }
}

/* Synthesized ambient BGM (from original v6) */
var bgmOn = false;
function startBGM() {
  if (bgmOn || !audioContext) return;
  bgmOn = true;

  /* Sawtooth pad with LFO-modulated lowpass filter */
  var pad = audioContext.createOscillator();
  pad.type = 'sawtooth';
  pad.frequency.value = 55;
  var padGain = audioContext.createGain();
  padGain.gain.value = 0.06;
  var padFilter = audioContext.createBiquadFilter();
  padFilter.type = 'lowpass';
  padFilter.frequency.value = 200;
  var lfo = audioContext.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.15;
  var lfoGain = audioContext.createGain();
  lfoGain.gain.value = 150;
  lfo.connect(lfoGain);
  lfoGain.connect(padFilter.frequency);
  pad.connect(padFilter);
  padFilter.connect(padGain);
  padGain.connect(audioContext.destination);
  pad.start();
  lfo.start();

  /* Sub bass */
  var sub = audioContext.createOscillator();
  sub.type = 'sine';
  sub.frequency.value = 42;
  var subGain = audioContext.createGain();
  subGain.gain.value = 0.08;
  sub.connect(subGain);
  subGain.connect(audioContext.destination);
  sub.start();

  /* Harmonic layer */
  var harm = audioContext.createOscillator();
  harm.type = 'triangle';
  harm.frequency.value = 220;
  var harmGain = audioContext.createGain();
  harmGain.gain.value = 0.02;
  var harmFilter = audioContext.createBiquadFilter();
  harmFilter.type = 'lowpass';
  harmFilter.frequency.value = 300;
  harm.connect(harmFilter);
  harmFilter.connect(harmGain);
  harmGain.connect(audioContext.destination);
  harm.start();

  /* Arpeggio loop */
  function arp() {
    if (!bgmOn) return;
    var t = audioContext.currentTime;
    [110, 147, 165, 220, 165, 147].forEach(function(freq, i) {
      var osc = audioContext.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      var g = audioContext.createGain();
      g.gain.setValueAtTime(0, t + i * 0.4);
      g.gain.linearRampToValueAtTime(0.04, t + i * 0.4 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.4 + 0.35);
      var f = audioContext.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 800;
      osc.connect(f);
      f.connect(g);
      g.connect(audioContext.destination);
      osc.start(t + i * 0.4);
      osc.stop(t + i * 0.4 + 0.38);
    });
    setTimeout(arp, 2400);
  }
  arp();
}

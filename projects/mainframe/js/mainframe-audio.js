/* ===== MAINFRAME AUDIO MODULE ===== */
/* Web Audio API sound effects for the main MAINFRAME game */

var audioContext = null;
var soundOn = true;

function initAudio() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

function playClack() {
  if (!soundOn || !audioContext) return;
  var t = audioContext.currentTime;
  var bl = Math.floor(audioContext.sampleRate * 0.03);
  var b = audioContext.createBuffer(1, bl, audioContext.sampleRate);
  var d = b.getChannelData(0);
  for (var i = 0; i < bl; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bl * 0.065)) * 0.5;
  var n = audioContext.createBufferSource(); n.buffer = b;
  var f = audioContext.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1500 + Math.random() * 1500; f.Q.value = 1.5 + Math.random() * 3;
  var g = audioContext.createGain(); g.gain.setValueAtTime(0.5 + Math.random() * 0.35, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  n.connect(f); f.connect(g); g.connect(audioContext.destination); n.start(t); n.stop(t + 0.06);
  var o = audioContext.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(100 + Math.random() * 80, t); o.frequency.exponentialRampToValueAtTime(50, t + 0.04);
  var og = audioContext.createGain(); og.gain.setValueAtTime(0.12 + Math.random() * 0.08, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  o.connect(og); og.connect(audioContext.destination); o.start(t); o.stop(t + 0.05);
}

function playLogin() {
  if (!audioContext) return; var t = audioContext.currentTime;
  [0, 0.12, 0.24].forEach(function(dl, i) {
    var fr = [440, 554, 880][i]; var o = audioContext.createOscillator(); o.type = "square"; o.frequency.setValueAtTime(fr, t + dl);
    var g = audioContext.createGain(); g.gain.setValueAtTime(0, t + dl); g.gain.linearRampToValueAtTime(0.15, t + dl + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t + dl + 0.15);
    o.connect(g); g.connect(audioContext.destination); o.start(t + dl); o.stop(t + dl + 0.2);
  });
  var bl = Math.floor(audioContext.sampleRate * 0.5), b = audioContext.createBuffer(1, bl, audioContext.sampleRate), bd = b.getChannelData(0);
  for (var i = 0; i < bl; i++) bd[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bl * 0.15)) * 0.1;
  var ns = audioContext.createBufferSource(); ns.buffer = b;
  var hf = audioContext.createBiquadFilter(); hf.type = "highpass"; hf.frequency.setValueAtTime(800, t + 0.3); hf.frequency.exponentialRampToValueAtTime(4000, t + 0.7);
  var ng = audioContext.createGain(); ng.gain.setValueAtTime(0.3, t + 0.3); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
  ns.connect(hf); hf.connect(ng); ng.connect(audioContext.destination); ns.start(t + 0.3); ns.stop(t + 0.9);
  var co = audioContext.createOscillator(); co.type = "sine"; co.frequency.value = 1200;
  var cg = audioContext.createGain(); cg.gain.setValueAtTime(0, t + 0.5); cg.gain.linearRampToValueAtTime(0.2, t + 0.52); cg.gain.exponentialRampToValueAtTime(0.001, t + 0.75);
  co.connect(cg); cg.connect(audioContext.destination); co.start(t + 0.5); co.stop(t + 0.8);
}

function playAppear() {
  if (!audioContext) return; var t = audioContext.currentTime;
  [0, 0.06, 0.12, 0.18, 0.24].forEach(function(dl, i) {
    var fr = [330, 440, 554, 660, 880][i]; var o = audioContext.createOscillator(); o.type = "square"; o.frequency.value = fr;
    var g = audioContext.createGain(); g.gain.setValueAtTime(0, t + dl); g.gain.linearRampToValueAtTime(0.12, t + dl + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + dl + 0.1);
    o.connect(g); g.connect(audioContext.destination); o.start(t + dl); o.stop(t + dl + 0.12);
  });
}

function playBlip() {
  if (!soundOn || !audioContext) return; var t = audioContext.currentTime;
  var o = audioContext.createOscillator(); o.type = "square"; o.frequency.setValueAtTime(380 + Math.random() * 120, t);
  var g = audioContext.createGain(); g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  o.connect(g); g.connect(audioContext.destination); o.start(t); o.stop(t + 0.05);
}

function playEvilBlip() {
  if (!soundOn || !audioContext) return; var t = audioContext.currentTime;
  var o = audioContext.createOscillator(); o.type = "sawtooth"; o.frequency.setValueAtTime(150 + Math.random() * 80, t);
  var g = audioContext.createGain(); g.gain.setValueAtTime(0.14, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  o.connect(g); g.connect(audioContext.destination); o.start(t); o.stop(t + 0.07);
}

function playMeowHappy() {
  if (!audioContext) return; var t = audioContext.currentTime;
  var o = audioContext.createOscillator(); o.type = "sine";
  o.frequency.setValueAtTime(700, t); o.frequency.linearRampToValueAtTime(1400, t + 0.08); o.frequency.setValueAtTime(1200, t + 0.1); o.frequency.linearRampToValueAtTime(1500, t + 0.14); o.frequency.exponentialRampToValueAtTime(1000, t + 0.2);
  var g = audioContext.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.35, t + 0.02); g.gain.setValueAtTime(0.3, t + 0.08); g.gain.linearRampToValueAtTime(0.15, t + 0.14); g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
  o.connect(g); g.connect(audioContext.destination); o.start(t); o.stop(t + 0.25);
  var o2 = audioContext.createOscillator(); o2.type = "sine"; o2.frequency.setValueAtTime(1400, t); o2.frequency.linearRampToValueAtTime(2800, t + 0.08); o2.frequency.exponentialRampToValueAtTime(2000, t + 0.2);
  var g2 = audioContext.createGain(); g2.gain.setValueAtTime(0, t); g2.gain.linearRampToValueAtTime(0.12, t + 0.02); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  o2.connect(g2); g2.connect(audioContext.destination); o2.start(t); o2.stop(t + 0.22);
}

function playMeowShock() {
  if (!audioContext) return; var t = audioContext.currentTime;
  var o = audioContext.createOscillator(); o.type = "sine";
  o.frequency.setValueAtTime(1800, t); o.frequency.linearRampToValueAtTime(2200, t + 0.02); o.frequency.exponentialRampToValueAtTime(600, t + 0.18);
  var g = audioContext.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.4, t + 0.01); g.gain.setValueAtTime(0.35, t + 0.04); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  o.connect(g); g.connect(audioContext.destination); o.start(t); o.stop(t + 0.22);
  var o2 = audioContext.createOscillator(); o2.type = "triangle";
  o2.frequency.setValueAtTime(2400, t); o2.frequency.exponentialRampToValueAtTime(800, t + 0.15);
  var g2 = audioContext.createGain(); g2.gain.setValueAtTime(0, t); g2.gain.linearRampToValueAtTime(0.2, t + 0.01); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
  o2.connect(g2); g2.connect(audioContext.destination); o2.start(t); o2.stop(t + 0.18);
  var bl = Math.floor(audioContext.sampleRate * 0.1), b = audioContext.createBuffer(1, bl, audioContext.sampleRate), d = b.getChannelData(0);
  for (var i = 0; i < bl; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bl * 0.25)) * 0.12;
  var ns = audioContext.createBufferSource(); ns.buffer = b;
  var bp = audioContext.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 4000; bp.Q.value = 2;
  ns.connect(bp); bp.connect(audioContext.destination); ns.start(t); ns.stop(t + 0.12);
}

function playCatGrowl() {
  if (!audioContext) return; var t = audioContext.currentTime;
  var o = audioContext.createOscillator(); o.type = "sawtooth";
  o.frequency.setValueAtTime(150, t); o.frequency.linearRampToValueAtTime(130, t + 0.1); o.frequency.linearRampToValueAtTime(170, t + 0.25); o.frequency.linearRampToValueAtTime(120, t + 0.4); o.frequency.linearRampToValueAtTime(100, t + 0.55);
  var g = audioContext.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.3, t + 0.03); g.gain.setValueAtTime(0.28, t + 0.15); g.gain.setValueAtTime(0.25, t + 0.35); g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
  var lp = audioContext.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.setValueAtTime(500, t); lp.frequency.linearRampToValueAtTime(350, t + 0.3); lp.frequency.linearRampToValueAtTime(450, t + 0.5);
  o.connect(lp); lp.connect(g); g.connect(audioContext.destination); o.start(t); o.stop(t + 0.65);
  var lfo = audioContext.createOscillator(); lfo.type = "sine"; lfo.frequency.value = 45;
  var lg = audioContext.createGain(); lg.gain.value = 15;
  lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(t + 0.6);
  var bl = Math.floor(audioContext.sampleRate * 0.5), b = audioContext.createBuffer(1, bl, audioContext.sampleRate), d = b.getChannelData(0);
  for (var i = 0; i < bl; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(i / bl * Math.PI) * 0.06;
  var ns = audioContext.createBufferSource(); ns.buffer = b;
  var bp = audioContext.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 800; bp.Q.value = 1;
  ns.connect(bp); bp.connect(audioContext.destination); ns.start(t); ns.stop(t + 0.55);
}

function playEvilLaughPre() {
  if (!audioContext) return; var t = audioContext.currentTime;
  [0, 0.18, 0.36, 0.54, 0.72].forEach(function(dl, i) {
    var fr = [200, 260, 220, 180, 140][i];
    var o = audioContext.createOscillator(); o.type = "sawtooth"; o.frequency.setValueAtTime(fr, t + dl); o.frequency.linearRampToValueAtTime(fr * 0.6, t + dl + 0.15);
    var g = audioContext.createGain(); g.gain.setValueAtTime(0, t + dl); g.gain.linearRampToValueAtTime(0.2, t + dl + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t + dl + 0.17);
    var lp = audioContext.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 600;
    o.connect(lp); lp.connect(g); g.connect(audioContext.destination); o.start(t + dl); o.stop(t + dl + 0.18);
  });
}

function playSiren() {
  if (!audioContext) return; var t = audioContext.currentTime;
  for (var s = 0; s < 3; s++) {
    var o = audioContext.createOscillator(); o.type = "sawtooth";
    o.frequency.setValueAtTime(200, t + s * 0.6); o.frequency.linearRampToValueAtTime(800, t + s * 0.6 + 0.3); o.frequency.linearRampToValueAtTime(200, t + s * 0.6 + 0.6);
    var g = audioContext.createGain(); g.gain.setValueAtTime(0.12, t + s * 0.6); g.gain.setValueAtTime(0.12, t + s * 0.6 + 0.5); g.gain.linearRampToValueAtTime(0, t + s * 0.6 + 0.6);
    o.connect(g); g.connect(audioContext.destination); o.start(t + s * 0.6); o.stop(t + s * 0.6 + 0.6);
  }
  var bl = Math.floor(audioContext.sampleRate * 1.8), b = audioContext.createBuffer(1, bl, audioContext.sampleRate), d = b.getChannelData(0);
  for (var i = 0; i < bl; i++) d[i] = (Math.random() * 2 - 1) * 0.08 * Math.sin(i / bl * Math.PI);
  var ns = audioContext.createBufferSource(); ns.buffer = b; ns.connect(audioContext.destination); ns.start(t); ns.stop(t + 1.8);
}

function playEvilLaugh() {
  if (!audioContext) return; var t = audioContext.currentTime;
  [0, 0.15, 0.3, 0.45].forEach(function(dl, i) {
    var fr = [180, 220, 180, 140][i];
    var o = audioContext.createOscillator(); o.type = "sawtooth"; o.frequency.setValueAtTime(fr, t + dl); o.frequency.linearRampToValueAtTime(fr * 0.7, t + dl + 0.12);
    var g = audioContext.createGain(); g.gain.setValueAtTime(0.18, t + dl); g.gain.exponentialRampToValueAtTime(0.001, t + dl + 0.14);
    o.connect(g); g.connect(audioContext.destination); o.start(t + dl); o.stop(t + dl + 0.15);
  });
}

function playFileOpen() {
  if (!audioContext) return; var t = audioContext.currentTime;
  var o = audioContext.createOscillator(); o.type = "sine";
  o.frequency.setValueAtTime(100, t); o.frequency.exponentialRampToValueAtTime(800, t + 0.3); o.frequency.setValueAtTime(600, t + 0.35); o.frequency.exponentialRampToValueAtTime(1200, t + 0.5);
  var g = audioContext.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.2, t + 0.05); g.gain.setValueAtTime(0.15, t + 0.3); g.gain.linearRampToValueAtTime(0.08, t + 0.5); g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
  o.connect(g); g.connect(audioContext.destination); o.start(t); o.stop(t + 0.75);
  [0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45].forEach(function(dl) {
    var o2 = audioContext.createOscillator(); o2.type = "square"; o2.frequency.value = 800 + Math.random() * 1200;
    var g2 = audioContext.createGain(); g2.gain.setValueAtTime(0.06, t + dl); g2.gain.exponentialRampToValueAtTime(0.001, t + dl + 0.04);
    o2.connect(g2); g2.connect(audioContext.destination); o2.start(t + dl); o2.stop(t + dl + 0.05);
  });
  setTimeout(function() {
    if (!audioContext) return; var t2 = audioContext.currentTime;
    [0, 0.08].forEach(function(dl, i) {
      var o3 = audioContext.createOscillator(); o3.type = "sine"; o3.frequency.value = [880, 1320][i];
      var g3 = audioContext.createGain(); g3.gain.setValueAtTime(0.12, t2 + dl); g3.gain.exponentialRampToValueAtTime(0.001, t2 + dl + 0.15);
      o3.connect(g3); g3.connect(audioContext.destination); o3.start(t2 + dl); o3.stop(t2 + dl + 0.18);
    });
  }, 500);
}

function playGlitchHint() {
  if (!audioContext) return; var t = audioContext.currentTime;
  var o = audioContext.createOscillator(); o.type = "sawtooth"; o.frequency.setValueAtTime(300, t); o.frequency.linearRampToValueAtTime(100, t + 0.1);
  var g = audioContext.createGain(); g.gain.setValueAtTime(0.1, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  o.connect(g); g.connect(audioContext.destination); o.start(t); o.stop(t + 0.15);
}

function playHealthDrain() {
  if (!audioContext) return; var t = audioContext.currentTime;
  var o = audioContext.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(600, t); o.frequency.exponentialRampToValueAtTime(300, t + 0.2);
  var g = audioContext.createGain(); g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
  o.connect(g); g.connect(audioContext.destination); o.start(t); o.stop(t + 0.3);
}

/* Missing in original - implementing based on virus-scanner equivalents */
function playQuarantine() {
  if (!audioContext) return; var t = audioContext.currentTime;
  [0, 0.04, 0.08].forEach(function(d) {
    var o = audioContext.createOscillator(); o.type = "sawtooth"; o.frequency.value = 200 + Math.random() * 400;
    var g = audioContext.createGain(); g.gain.setValueAtTime(0.12, t + d); g.gain.exponentialRampToValueAtTime(0.001, t + d + 0.06);
    o.connect(g); g.connect(audioContext.destination); o.start(t + d); o.stop(t + d + 0.08);
  });
  [0.12, 0.18, 0.24].forEach(function(d, i) {
    var o = audioContext.createOscillator(); o.type = "square"; o.frequency.value = [600, 800, 1100][i];
    var g = audioContext.createGain(); g.gain.setValueAtTime(0.1, t + d); g.gain.exponentialRampToValueAtTime(0.001, t + d + 0.1);
    o.connect(g); g.connect(audioContext.destination); o.start(t + d); o.stop(t + d + 0.12);
  });
}

function playWrongBuzz() {
  if (!audioContext) return; var t = audioContext.currentTime;
  var o = audioContext.createOscillator(); o.type = "sawtooth"; o.frequency.value = 120;
  var g = audioContext.createGain(); g.gain.setValueAtTime(0.18, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
  o.connect(g); g.connect(audioContext.destination); o.start(t); o.stop(t + 0.3);
}

function playLockChain() {
  if (!audioContext) return; var t = audioContext.currentTime;
  /* Heavy metallic clank */
  var clank = audioContext.createOscillator(); clank.type = "square";
  clank.frequency.setValueAtTime(200, t); clank.frequency.exponentialRampToValueAtTime(60, t + 0.15);
  var cg = audioContext.createGain(); cg.gain.setValueAtTime(0.2, t); cg.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  clank.connect(cg); cg.connect(audioContext.destination); clank.start(t); clank.stop(t + 0.25);
  /* Chain rattle — rapid high clicks */
  [0.05, 0.1, 0.14, 0.17, 0.2].forEach(function(d) {
    var r = audioContext.createOscillator(); r.type = "square";
    r.frequency.value = 1500 + Math.random() * 1500;
    var rg = audioContext.createGain(); rg.gain.setValueAtTime(0.06, t + d); rg.gain.exponentialRampToValueAtTime(0.001, t + d + 0.03);
    r.connect(rg); rg.connect(audioContext.destination); r.start(t + d); r.stop(t + d + 0.04);
  });
}

function playChainSlam() {
  if (!audioContext) return; var t = audioContext.currentTime;
  /* Heavy bolt thud */
  var bolt = audioContext.createOscillator(); bolt.type = "sawtooth";
  bolt.frequency.setValueAtTime(120, t); bolt.frequency.exponentialRampToValueAtTime(25, t + 0.2);
  var bg = audioContext.createGain(); bg.gain.setValueAtTime(0.3, t); bg.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
  bolt.connect(bg); bg.connect(audioContext.destination); bolt.start(t); bolt.stop(t + 0.4);
  /* Metallic lock click */
  var click1 = audioContext.createOscillator(); click1.type = "square";
  click1.frequency.setValueAtTime(1800, t + 0.05); click1.frequency.exponentialRampToValueAtTime(400, t + 0.12);
  var cg1 = audioContext.createGain(); cg1.gain.setValueAtTime(0.15, t + 0.05); cg1.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  click1.connect(cg1); cg1.connect(audioContext.destination); click1.start(t + 0.05); click1.stop(t + 0.18);
  /* Second lock click (double-lock feel) */
  var click2 = audioContext.createOscillator(); click2.type = "square";
  click2.frequency.setValueAtTime(1400, t + 0.15); click2.frequency.exponentialRampToValueAtTime(300, t + 0.22);
  var cg2 = audioContext.createGain(); cg2.gain.setValueAtTime(0.12, t + 0.15); cg2.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
  click2.connect(cg2); cg2.connect(audioContext.destination); click2.start(t + 0.15); click2.stop(t + 0.28);
  /* Chain rattle */
  [0.2, 0.26, 0.32, 0.37, 0.42, 0.46, 0.5].forEach(function(d) {
    var c = audioContext.createOscillator(); c.type = "square"; c.frequency.value = 1000 + Math.random() * 2000;
    var cg = audioContext.createGain(); cg.gain.setValueAtTime(0.06, t + d); cg.gain.exponentialRampToValueAtTime(0.001, t + d + 0.04);
    c.connect(cg); cg.connect(audioContext.destination); c.start(t + d); c.stop(t + d + 0.05);
  });
  /* Deep resonance */
  var res = audioContext.createOscillator(); res.type = "sine"; res.frequency.value = 50;
  var rg = audioContext.createGain(); rg.gain.setValueAtTime(0.2, t + 0.1); rg.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
  res.connect(rg); rg.connect(audioContext.destination); res.start(t + 0.1); res.stop(t + 0.65);
}

function playWindowOpen() {
  if (!audioContext) return; var t = audioContext.currentTime;
  [0, 0.05, 0.1].forEach(function(d, i) {
    var o = audioContext.createOscillator(); o.type = "square"; o.frequency.value = [400, 600, 800][i];
    var g = audioContext.createGain(); g.gain.setValueAtTime(0.08, t + d); g.gain.exponentialRampToValueAtTime(0.001, t + d + 0.08);
    o.connect(g); g.connect(audioContext.destination); o.start(t + d); o.stop(t + d + 0.1);
  });
}

function playWindowClose() {
  if (!audioContext) return; var t = audioContext.currentTime;
  [0, 0.05, 0.1].forEach(function(d, i) {
    var o = audioContext.createOscillator(); o.type = "square"; o.frequency.value = [800, 600, 400][i];
    var g = audioContext.createGain(); g.gain.setValueAtTime(0.08, t + d); g.gain.exponentialRampToValueAtTime(0.001, t + d + 0.08);
    o.connect(g); g.connect(audioContext.destination); o.start(t + d); o.stop(t + d + 0.1);
  });
}

function playMaterialize() {
  if (!audioContext) return; var t = audioContext.currentTime;
  /* Ascending crystallize tones */
  [0, 0.08, 0.16, 0.24, 0.32, 0.4, 0.48].forEach(function(d, i) {
    var o = audioContext.createOscillator(); o.type = "triangle";
    o.frequency.value = 200 + i * 150;
    var g = audioContext.createGain(); g.gain.setValueAtTime(0.03 + i * 0.015, t + d); g.gain.exponentialRampToValueAtTime(0.001, t + d + 0.12);
    o.connect(g); g.connect(audioContext.destination); o.start(t + d); o.stop(t + d + 0.14);
  });
  /* Final shimmer */
  var sh = audioContext.createOscillator(); sh.type = "sine"; sh.frequency.value = 1400;
  var sg = audioContext.createGain(); sg.gain.setValueAtTime(0, t + 0.5); sg.gain.linearRampToValueAtTime(0.1, t + 0.55); sg.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
  sh.connect(sg); sg.connect(audioContext.destination); sh.start(t + 0.5); sh.stop(t + 0.85);
}

function playUnlock() {
  if (!audioContext) return; var t = audioContext.currentTime;
  /* Heavy metallic break */
  var brk = audioContext.createOscillator(); brk.type = "sawtooth";
  brk.frequency.setValueAtTime(150, t); brk.frequency.exponentialRampToValueAtTime(30, t + 0.3);
  var bg = audioContext.createGain(); bg.gain.setValueAtTime(0.25, t); bg.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
  brk.connect(bg); bg.connect(audioContext.destination); brk.start(t); brk.stop(t + 0.45);
  /* Chain snap pops */
  [0.05, 0.1, 0.15, 0.2].forEach(function(d) {
    var p = audioContext.createOscillator(); p.type = "square";
    p.frequency.value = 1500 + Math.random() * 2000;
    var pg = audioContext.createGain(); pg.gain.setValueAtTime(0.1, t + d); pg.gain.exponentialRampToValueAtTime(0.001, t + d + 0.04);
    p.connect(pg); pg.connect(audioContext.destination); p.start(t + d); p.stop(t + d + 0.05);
  });
  /* Triumphant ascending tones */
  [0.4, 0.5, 0.6, 0.75, 0.9].forEach(function(d, i) {
    var o = audioContext.createOscillator(); o.type = "square";
    o.frequency.value = [523, 659, 784, 1047, 1319][i];
    var g = audioContext.createGain(); g.gain.setValueAtTime(0.1, t + d); g.gain.exponentialRampToValueAtTime(0.001, t + d + 0.2);
    o.connect(g); g.connect(audioContext.destination); o.start(t + d); o.stop(t + d + 0.22);
  });
}

function playFileClean() {
  if (!audioContext) return; var t = audioContext.currentTime;
  [0, 0.1, 0.2, 0.3, 0.45].forEach(function(d, i) {
    var o = audioContext.createOscillator(); o.type = "square"; o.frequency.value = [523, 659, 784, 1047, 1319][i];
    var g = audioContext.createGain(); g.gain.setValueAtTime(0.1, t + d); g.gain.exponentialRampToValueAtTime(0.001, t + d + 0.18);
    o.connect(g); g.connect(audioContext.destination); o.start(t + d); o.stop(t + d + 0.2);
  });
}
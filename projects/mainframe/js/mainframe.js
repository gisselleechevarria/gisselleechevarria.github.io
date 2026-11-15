/* ===== MAINFRAME GAME MODULE ===== */
/* Main game logic for the MAINFRAME educational game */

/* --- Asset paths (replacing inline base64) --- */
var images = {
  greet:   'assets/mascot/greet.png',
  cmd:     'assets/mascot/cmd.png',
  exp:     'assets/mascot/exp.png',
  angry:   'assets/mascot/angry.png',
  shock:   'assets/mascot/shock.png',
  doc:     'assets/icons/doc.png',
  folder:  'assets/icons/folder.png',
  lock:    'assets/icons/lock.png',
  photo:   'assets/icons/photo.png',
  eDoc:    'assets/icons/eDoc.png',
  eFolder: 'assets/icons/eFolder.png',
  eLock:   'assets/icons/eLock.png',
  ePhoto:  'assets/icons/ePhoto.png',
  thumb:   'assets/mascot/thumb.png',
  eBug:    'assets/mascot/ebug.png'
};

/* Set initial icon sources from asset paths */
(function setIconSources() {
  var iconFiles = ['doc', 'folder', 'photo', 'lock', 'doc', 'folder'];
  for (var i = 0; i < 6; i++) {
    var el = document.getElementById('fi' + i);
    if (el) el.src = images[iconFiles[i]];
  }
  var mascotEl = document.getElementById('mascotImg');
  if (mascotEl) mascotEl.src = images.greet;
  var monsterEl = document.getElementById('monsterImg');
  if (monsterEl) monsterEl.src = images.eBug;
})();

(function() {
  var bgm = document.getElementById("bgm"); bgm.volume = 0.3;
  var evilBgm = document.getElementById("evilBgm"); evilBgm.volume = 0.35;

  function playOminous() { evilBgm.currentTime = 0; evilBgm.play().catch(function() {}); }
  function stopOminous() { evilBgm.pause(); evilBgm.currentTime = 0; }

  /* WORD FILTER */
  var badWords = atob("YXNzfGJpdGNofGNyYXB8ZGFtbnxkaWNrfGZ1Y2t8cGVuaXN8cGlzc3xzaGl0fHNsdXR8d2hvcmV8Ym9vYnx0aXR8Y29ja3xjdW50fGZhZ3xuaWdn").split("|");
  function isBad(s) {
    var w = s.toLowerCase().replace(/[^a-z]/g, "");
    if (!w) return false;
    for (var i = 0; i < badWords.length; i++) if (w.indexOf(badWords[i]) >= 0) return true;
    return false;
  }

  /* RAIN */
  var rb = document.getElementById("rB");
  for (var i = 0; i < 70; i++) {
    var c = document.createElement("div"); c.className = "rc";
    var br = Math.random();
    c.style.color = br > 0.92 ? "rgba(0,255,170,.38)" : br > 0.75 ? "rgba(0,255,170,.22)" : br < 0.12 ? "rgba(0,255,170,.04)" : "rgba(0,255,170,.12)";
    c.style.left = (i / 70 * 100) + "%";
    var dur = 3.5 + Math.random() * 12;
    c.style.animationDuration = dur + "s";
    c.style.animationDelay = (-Math.random() * dur) + "s";
    c.style.fontSize = (8 + Math.random() * 6) + "px";
    var chars = "";
    for (var j = 0; j < 40 + Math.floor(Math.random() * 30); j++) chars += Math.random() < 0.5 ? '0' : '1';
    c.textContent = chars;
    rb.appendChild(c);
  }

  /* FORM */
  var codeName = document.getElementById("codeName");
  var clearance = document.getElementById("clearance");
  var loginBtn = document.getElementById("loginBtn");
  var soundToggle = document.getElementById("sndTog");
  var errEl = document.getElementById("errMsg");

  codeName.addEventListener("keydown", function(e) {
    if (e.key.length === 1 && !/[a-zA-Z]/.test(e.key)) { e.preventDefault(); return; }
    if (["Tab", "Shift", "Control", "Alt", "Meta", "CapsLock", "Enter", "Backspace", "Delete", "ArrowLeft", "ArrowRight"].indexOf(e.key) >= 0) return;
    var n = Date.now(); if (n - (codeName._lk || 0) < 25) return; codeName._lk = n;
    initAudio(); playClack();
  });

  codeName.addEventListener("input", function() {
    codeName.value = codeName.value.replace(/[^a-zA-Z]/g, "");
    if (isBad(codeName.value)) { errEl.classList.add("show"); codeName.classList.add("err"); setTimeout(function() { codeName.classList.remove("err"); }, 400); }
    else { errEl.classList.remove("show"); }
    checkForm();
  });

  function checkForm() { loginBtn.disabled = !(codeName.value.trim() && !isBad(codeName.value) && clearance.value); }

  clearance.addEventListener("change", function() { initAudio(); playClack(); checkForm(); });
  soundToggle.addEventListener("click", function() { soundOn = !soundOn; soundToggle.textContent = "SOUND: " + (soundOn ? "ON" : "OFF"); bgm.volume = soundOn ? 0.3 : 0; });
  document.getElementById("musicPrompt").addEventListener("click", function() { this.style.display = "none"; initAudio(); bgm.play().catch(function() {}); });

  loginBtn.addEventListener("click", function() {
    if (loginBtn.disabled) return;
    window.agentCode = codeName.value.trim();
    window.clearLevel = clearance.value;
    playLogin();
    loginBtn.textContent = "ACCESS GRANTED"; loginBtn.disabled = true; loginBtn.style.background = "#00ffaa";
    setTimeout(function() {
      bgm.pause(); bgm.currentTime = 0;
      document.getElementById("loginPage").classList.add("hide");
      setTimeout(function() {
        document.getElementById("desktopPage").classList.add("show");
        document.getElementById("agentStatus").innerHTML = '<span class="dt"></span>AGENT: ' + window.agentCode;
        setTimeout(startDesktop, 800);
      }, 600);
    }, 1500);
  });

  /* CLOCK */
  function updateClock() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes();
    document.getElementById("clock").textContent = (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
  }
  setInterval(updateClock, 10000); updateClock();

  /* TYPEWRITER */
  var speechEl = document.getElementById("speechText"), mascotEl = document.getElementById("mascotImg");
  var typing = false, typeTimer = null, fullHTML = "", typeCb = null, currentBlipFn = playBlip;

  function typeText(html, cb, noSkip) {
    typing = true; fullHTML = html; typeCb = cb; speechEl.innerHTML = "";
    document.getElementById("speechSkip").style.display = noSkip ? "none" : "block";
    var plain = ""; var inT = false;
    for (var i = 0; i < html.length; i++) { if (html[i] === "<") inT = true; if (!inT) plain += html[i]; if (inT && html[i] === ">") inT = false; }
    var visLen = plain.length, ci = 0;
    function show() {
      if (ci >= visLen) { typing = false; speechEl.innerHTML = fullHTML; if (typeCb) { var fn = typeCb; typeCb = null; fn(); } return; }
      ci++; var out = "", vc = 0, inTag = false;
      for (var i = 0; i < html.length && vc < ci; i++) { if (html[i] === "<") inTag = true; if (!inTag) vc++; out += html[i]; if (inTag && html[i] === ">") inTag = false; }
      var opens = (out.match(/<b>/gi) || []).length, closes = (out.match(/<\/b>/gi) || []).length;
      if (opens > closes) out += "</b>";
      speechEl.innerHTML = out + '<span class="speech-cursor"></span>';
      currentBlipFn();
      typeTimer = setTimeout(show, 32 + Math.random() * 22);
    }
    show();
  }

  function skipType() { if (typing) { clearTimeout(typeTimer); typing = false; speechEl.innerHTML = fullHTML; if (typeCb) { var fn = typeCb; typeCb = null; fn(); } } }
  document.getElementById("speechBox").addEventListener("click", function(e) { if (e.target.id === "speechNext") return; skipType(); });

  /* DIALOG */
  var dialog = [], dIdx = 0;
  var speechBox = document.getElementById("speechBox"), nextBtn = document.getElementById("speechNext");
  var speechInner = document.getElementById("speechInner"), speechName = document.getElementById("speechName");

  function setSpeaker(name, evil) {
    speechName.textContent = name;
    speechName.classList.toggle("evil", !!evil);
    speechInner.classList.toggle("evil", !!evil);
    speechEl.classList.toggle("evil", !!evil);
    nextBtn.classList.toggle("evil", !!evil);
    currentBlipFn = evil ? playEvilBlip : playBlip;
  }

  function showNext() {
    if (dIdx >= dialog.length) { nextBtn.style.display = "none"; return; }
    nextBtn.style.display = "none";
    var line = dialog[dIdx];
    if (line.img) mascotEl.src = line.img;
    if (line.speaker) setSpeaker(line.speaker, line.evil);
    if (line.action) line.action();
    typeText(line.text, function() {
      dIdx++;
      if (dIdx < dialog.length && !dialog[dIdx - 1].noNext) nextBtn.style.display = "block";
      if (dialog[dIdx - 1].after) dialog[dIdx - 1].after();
    }, line.noSkip);
  }
  nextBtn.addEventListener("click", function() { if (!typing) showNext(); });

  /* GLITCH SEQUENCE */
  function doGlitch(cb) {
    var desk = document.getElementById("desktop"), gov = document.getElementById("glitchOvr");
    desk.classList.add("glitch-active"); gov.classList.add("active");
    playSiren();
    var bars = [];
    for (var i = 0; i < 8; i++) {
      var b = document.createElement("div"); b.className = "glitch-bar";
      b.style.top = Math.random() * 100 + "%"; b.style.height = (2 + Math.random() * 6) + "%";
      b.style.background = Math.random() > 0.5 ? "rgba(255,0,80,.2)" : "rgba(0,200,255,.15)";
      gov.appendChild(b); bars.push(b);
    }
    var fl = document.createElement("div"); fl.className = "glitch-flash"; gov.appendChild(fl);
    setTimeout(function() { fl.style.opacity = "1"; }, 200);
    setTimeout(function() { fl.style.opacity = "0"; }, 350);
    setTimeout(function() { fl.style.opacity = "1"; }, 600);
    setTimeout(function() { fl.style.opacity = "0"; }, 700);
    setTimeout(function() {
      var evilIcons = [images.eDoc, images.eFolder, images.ePhoto, images.eLock, images.eDoc, images.eFolder];
      for (var i = 0; i < 6; i++) { document.getElementById("fi" + i).src = evilIcons[i]; document.querySelectorAll(".desk-icon")[i].classList.add("corrupted"); }
      document.getElementById("secStatus").innerHTML = '<span class="dt" style="background:#ff3355;box-shadow:0 0 3px rgba(255,51,85,.4)"></span>BREACH!';
      document.getElementById("secStatus").style.color = "#ff5577";
      document.getElementById("fwStatus").innerHTML = '<span class="dt" style="background:#ff3355;box-shadow:0 0 3px rgba(255,51,85,.4)"></span>FIREWALL: DOWN';
      document.getElementById("fwStatus").style.color = "#ff5577";
    }, 800);
    setTimeout(function() {
      desk.classList.remove("glitch-active"); gov.classList.remove("active"); gov.innerHTML = "";
      if (cb) cb();
    }, 2000);
  }

  /* DESKTOP START */
  function startDesktop() {
    var name = window.agentCode || "Agent";
    playAppear(); playMeowHappy(); document.getElementById("mascot").classList.add("show");
    setTimeout(function() {
      speechBox.classList.add("show");
      dialog = [
        { text: "Hey there, <b>" + name + "</b>! I'm Byte, your cyber assistant.", img: images.greet, speaker: "BYTE" },
        { text: "Welcome to Mainframe HQ! Today is your first day as a junior agent.", img: images.greet, speaker: "BYTE" },
        { text: "Your job is to help protect our files from digital threats.", img: images.cmd, speaker: "BYTE" },
        { text: "These files on your desktop contain important data. Let me show you around\u2014", img: images.exp, speaker: "BYTE", noSkip: true, noNext: true, after: function() {
          setTimeout(function() {
            speechBox.classList.remove("show");
            playMeowShock(); mascotEl.src = images.shock;
            doGlitch(function() {
              playOminous(); speechBox.classList.add("show");
              dialog = [
                { text: "W-WHAT?! No no no! The system is under attack!", img: images.shock, speaker: "BYTE", after: function() { playEvilLaughPre(); } },
                { text: "Something is coming...", img: images.shock, speaker: "BYTE", noSkip: true, noNext: true, after: function() {
                  speechBox.classList.remove("show");
                  setTimeout(function() {
                    document.getElementById("desktop").classList.remove("glitch-active");
                    document.getElementById("monster").classList.add("show");
                    playAppear(); speechBox.classList.add("show");
                    dialog = [
                      { text: "Mwahaha! Your precious files are MINE now! No one can stop the mighty Corruptus!", speaker: "CORRUPTUS", evil: true, action: function() { playEvilLaugh(); } },
                      { text: "I have infected every single file in your system. There is NOTHING you can do!", speaker: "CORRUPTUS", evil: true },
                      { text: "Not so fast, Corruptus! <b>" + name + "</b>, we are NOT going to let this virus win!", img: images.angry, speaker: "BYTE", action: function() { playCatGrowl(); } },
                      { text: "Ha! Good luck with that, little cat. Your files are already infected!", speaker: "CORRUPTUS", evil: true, action: function() { playEvilLaugh(); } },
                      { text: "...", speaker: "CORRUPTUS", evil: true, noSkip: true, noNext: true, action: function() {
                        speechBox.classList.remove("show");
                        var mon = document.getElementById("monster");
                        mon.classList.remove("show"); mon.classList.add("hide");
                        setTimeout(function() {
                          stopOminous(); setSpeaker("BYTE");
                          speechBox.classList.add("show");
                          dialog = [
                            { text: "That was Corruptus, a dangerous malware virus. It has corrupted all our files...", img: images.exp, speaker: "BYTE" },
                            { text: "But don't worry. That's exactly why you're here, <b>" + name + "</b>. It's up to YOU to save them!", img: images.cmd, speaker: "BYTE" },
                            { text: "Click on <b>Virus Scanner</b> to start your first mission!", img: images.cmd, speaker: "BYTE", noNext: true, after: function() {
                              document.querySelectorAll(".desk-icon")[0].classList.add("highlight");
                            } }
                          ]; dIdx = 0; showNext();
                        }, 800);
                      } }
                    ]; dIdx = 0; showNext();
                  }, 600);
                } }
              ]; dIdx = 0; showNext();
            });
          }, 800);
        } }
      ];
      dIdx = 0; showNext();
    }, 600);
  }

  /* VIRUS SCANNER — launches scanner.html in iframe */
  function startVirusScanner() {
    /* Create AudioContext now during the user gesture so the iframe can reuse it */
    window.scannerAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var trans = document.getElementById("scanTransition");
    trans.classList.add("active");
    playFileOpen();
    setTimeout(function() {
      document.getElementById("desktopPage").classList.remove("show");
      var frame = document.getElementById("scannerFrame");
      frame.src = "scanner.html";
      frame.classList.add("show");
      trans.classList.remove("active");
    }, 1800);
  }

  /* Launch Decoder — loads decrypt.html in iframe */
  function startDecoder() {
    window.scannerAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var trans = document.getElementById("scanTransition");
    trans.classList.add("active");
    playFileOpen();
    setTimeout(function() {
      document.getElementById("desktopPage").classList.remove("show");
      var frame = document.getElementById("decoderFrame");
      frame.src = "decrypt.html";
      frame.classList.add("show");
      trans.classList.remove("active");
    }, 1800);
  }

  /* Hook desktop icon click */
  document.querySelectorAll(".desk-icon").forEach(function(icon) {
    icon.addEventListener("click", function() {
      var idx = parseInt(this.getAttribute("data-i"));
      if (idx === 0) startVirusScanner();
    });
  });

  /* Decoder icon — direct handler (icon 6 is added dynamically) */
  document.getElementById("decryptorIcon").addEventListener("click", function() {
    if (window.gamePhase === "open-decryptor") startDecoder();
  });

  /* === POST-SCANNER: Return to desktop and narrative bridge === */

  /* Canvas-drawn animated chains — 16-bit SNES-style pixel art */
  function animateChains(callback) {
    var container = document.getElementById("chainsOverlay");
    var parent = document.getElementById("deskIcons");
    container.classList.add("show");

    /* 2x resolution for crisp pixels */
    var scale = 2;
    var canvas = document.createElement("canvas");
    canvas.width = parent.offsetWidth * scale;
    canvas.height = parent.offsetHeight * scale;
    canvas.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;image-rendering:pixelated";
    canvas.id = "chainsCanvas";
    container.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    var W = canvas.width, H = canvas.height;

    /* Get bounds of locked icons (1-5) */
    var parentRect = parent.getBoundingClientRect();
    var icons = document.querySelectorAll(".desk-icon");
    var firstIcon = icons[1].getBoundingClientRect();
    var lastIcon = icons[5].getBoundingClientRect();
    var x1 = (firstIcon.left - parentRect.left) * scale;
    var y1 = (firstIcon.top - parentRect.top) * scale;
    var x2 = (lastIcon.right - parentRect.left) * scale;
    var y2 = (lastIcon.bottom - parentRect.top) * scale;
    var cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;

    /* 16-bit color palettes */
    var metal = { hi: "#d0d8e8", mid: "#8898b0", lo: "#4a5868", outline: "#1a2a2a", shadow: "#0a1a0a" };
    var gold = { hi: "#ffee66", mid: "#ddaa00", lo: "#886600", outline: "#332200", spec: "#ffffaa" };

    /* Pixel helper — draw a filled rect at integer coords */
    function px(x, y, w, h, color) {
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(x), Math.round(y), w, h);
    }

    /* Draw a single 16-bit chain link with full shading */
    function drawLink(x, y, horiz, alpha) {
      ctx.globalAlpha = alpha;
      var p = 2 * scale; /* pixel unit */
      var ow = horiz ? 9 * p : 5 * p; /* outer width */
      var oh = horiz ? 5 * p : 9 * p; /* outer height */
      var lx = Math.round(x - ow / 2), ly = Math.round(y - oh / 2);

      /* Drop shadow (green-tinted) */
      px(lx + p, ly + p, ow, oh, metal.shadow);

      /* Dark outline */
      px(lx, ly, ow, oh, metal.outline);

      /* Metal body */
      px(lx + p, ly + p, ow - 2 * p, oh - 2 * p, metal.mid);

      /* Top highlight (2px bright edge) */
      px(lx + p, ly + p, ow - 2 * p, p, metal.hi);
      /* Left highlight */
      px(lx + p, ly + p, p, oh - 2 * p, metal.hi);

      /* Bottom shadow edge */
      px(lx + p, ly + oh - 2 * p, ow - 2 * p, p, metal.lo);
      /* Right shadow edge */
      px(lx + ow - 2 * p, ly + p, p, oh - 2 * p, metal.lo);

      /* Specular highlight (top-left corner glint) */
      px(lx + 2 * p, ly + 2 * p, p, p, "#e8f0ff");

      /* Inner hole */
      var iw = ow - 6 * p, ih = oh - 6 * p;
      if (iw > 0 && ih > 0) {
        px(lx + 3 * p, ly + 3 * p, iw, ih, "#0a1a0a");
        /* Inner shadow (top-left of hole) */
        px(lx + 3 * p, ly + 3 * p, iw, Math.max(p / 2, 1), "#050d05");
        px(lx + 3 * p, ly + 3 * p, Math.max(p / 2, 1), ih, "#050d05");
      }

      /* Dithering on metal body (checkerboard texture) */
      ctx.globalAlpha = alpha * 0.08;
      for (var dy = 0; dy < oh - 4 * p; dy += 2 * p) {
        for (var dx = ((dy / p) % 2 === 0 ? 0 : p); dx < ow - 4 * p; dx += 2 * p) {
          px(lx + 2 * p + dx, ly + 2 * p + dy, p, p, metal.lo);
        }
      }
      ctx.globalAlpha = alpha;
    }

    /* Draw 16-bit padlock */
    function drawPadlock(alpha) {
      ctx.globalAlpha = alpha;
      var p = 2 * scale;
      var pw = 14 * p, ph = 10 * p;
      var plx = Math.round(cx - pw / 2), ply = Math.round(cy - 2 * p);

      /* Shackle drop shadow */
      px(cx - 5 * p + p, cy - 11 * p + p, 10 * p, 2 * p, metal.shadow);
      px(cx - 5 * p + p, cy - 11 * p + p, 2 * p, 8 * p, metal.shadow);
      px(cx + 3 * p + p, cy - 11 * p + p, 2 * p, 8 * p, metal.shadow);

      /* Shackle outline */
      px(cx - 5 * p, cy - 11 * p, 10 * p, 2 * p, metal.outline);
      px(cx - 5 * p, cy - 11 * p, 2 * p, 8 * p, metal.outline);
      px(cx + 3 * p, cy - 11 * p, 2 * p, 8 * p, metal.outline);
      /* Shackle body */
      px(cx - 4 * p, cy - 10 * p, 8 * p, p, metal.hi);
      px(cx - 4 * p, cy - 10 * p, p, 6 * p, metal.hi);
      px(cx - 3 * p, cy - 9 * p, 6 * p, p, metal.mid);
      px(cx + 2 * p, cy - 10 * p, p, 6 * p, metal.lo);
      /* Specular on shackle */
      px(cx - 3 * p, cy - 10 * p, p, p, "#e8f0ff");

      /* Body drop shadow */
      px(plx + p, ply + p, pw, ph, gold.outline);

      /* Body outline */
      px(plx, ply, pw, ph, gold.outline);

      /* Body fill */
      px(plx + p, ply + p, pw - 2 * p, ph - 2 * p, gold.mid);

      /* Top highlight */
      px(plx + p, ply + p, pw - 2 * p, p, gold.hi);
      px(plx + p, ply + p, p, ph - 2 * p, gold.hi);

      /* Bottom/right shadow */
      px(plx + p, ply + ph - 2 * p, pw - 2 * p, p, gold.lo);
      px(plx + pw - 2 * p, ply + p, p, ph - 2 * p, gold.lo);

      /* Specular highlight */
      px(plx + 2 * p, ply + 2 * p, p, p, gold.spec);
      px(plx + 3 * p, ply + 2 * p, p, p, gold.spec);

      /* Keyhole — circle + slot */
      px(cx - 2 * p, cy + p, 4 * p, 3 * p, gold.outline);
      px(cx - p, cy + 4 * p, 2 * p, 3 * p, gold.outline);
      /* Keyhole inner */
      px(cx - p, cy + 2 * p, 2 * p, 2 * p, "#0a0a00");
      px(Math.round(cx - p / 2), cy + 4 * p, p, 2 * p, "#0a0a00");

      /* Dithering on gold body */
      ctx.globalAlpha = alpha * 0.1;
      for (var dy = 0; dy < ph - 4 * p; dy += 2 * p) {
        for (var dx = ((dy / p) % 2 === 0 ? 0 : p); dx < pw - 4 * p; dx += 2 * p) {
          px(plx + 2 * p + dx, ply + 2 * p + dy, p, p, gold.lo);
        }
      }
      ctx.globalAlpha = alpha;
    }

    /* Generate link positions along two diagonals */
    var links = [];
    var linkGap = 10 * scale;

    function addDiagonal(sx, sy, ex, ey) {
      var dx = ex - sx, dy = ey - sy;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var steps = Math.floor(dist / linkGap);
      for (var i = 0; i <= steps; i++) {
        var t = i / steps;
        links.push({
          x: sx + dx * t, y: sy + dy * t,
          distFromCenter: Math.abs(t - 0.5) * 2,
          horiz: i % 2 === 0
        });
      }
    }

    var padX = 20 * scale, padY = 14 * scale;
    addDiagonal(x1 - padX, y1 - padY, x2 + padX, y2 + padY);
    addDiagonal(x2 + padX, y1 - padY, x1 - padX, y2 + padY);
    links.sort(function(a, b) { return a.distFromCenter - b.distFromCenter; });

    /* Animate — center outward */
    var startTime = performance.now();
    var duration = 900;

    function tick(now) {
      var t = Math.min((now - startTime) / duration, 1);
      ctx.clearRect(0, 0, W, H);

      /* Shadow layer over icons */
      ctx.globalAlpha = t * 0.25;
      ctx.fillStyle = "rgba(0,20,10,1)";
      ctx.fillRect(x1, y1, x2 - x1, y2 - y1);

      /* Draw chain links — two passes for interlocking */
      for (var pass = 0; pass < 2; pass++) {
        for (var i = 0; i < links.length; i++) {
          if (i % 2 !== pass) continue;
          var link = links[i];
          var lt = i / links.length;
          if (t < lt * 0.6) continue;
          var alpha = Math.min(1, (t - lt * 0.6) / 0.12);
          drawLink(link.x, link.y, link.horiz, alpha);
        }
      }

      /* Padlock */
      if (t > 0.05) {
        var pa = Math.min(1, (t - 0.05) / 0.2);
        drawPadlock(pa);
      }

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        ctx.globalAlpha = 1;
        if (callback) callback();
      }
    }
    requestAnimationFrame(tick);
  }

  function doGlitchLight(cb) {
    /* Lighter glitch for interruption (doesn't re-corrupt icons) */
    var desk = document.getElementById("desktop"), gov = document.getElementById("glitchOvr");
    desk.classList.add("glitch-active"); gov.classList.add("active");
    playSiren();
    for (var i = 0; i < 8; i++) {
      var b = document.createElement("div"); b.className = "glitch-bar";
      b.style.top = Math.random() * 100 + "%"; b.style.height = (2 + Math.random() * 6) + "%";
      b.style.background = Math.random() > 0.5 ? "rgba(255,0,80,.2)" : "rgba(0,200,255,.15)";
      gov.appendChild(b);
    }
    var fl = document.createElement("div"); fl.className = "glitch-flash"; gov.appendChild(fl);
    setTimeout(function() { fl.style.opacity = "1"; }, 200);
    setTimeout(function() { fl.style.opacity = "0"; }, 350);
    setTimeout(function() { fl.style.opacity = "1"; }, 600);
    setTimeout(function() { fl.style.opacity = "0"; }, 700);
    setTimeout(function() {
      desk.classList.remove("glitch-active"); gov.classList.remove("active"); gov.innerHTML = "";
      if (cb) cb();
    }, 2000);
  }

  window.onScannerComplete = function() {
    var name = window.agentCode || "Agent";
    /* Transition back to desktop */
    var trans = document.getElementById("scanTransition");
    trans.classList.add("active");
    setTimeout(function() {
      /* Kill scanner audio context to stop synthesized BGM */
      if (window.scannerAudioCtx) {
        try { window.scannerAudioCtx.close(); } catch(e) {}
        window.scannerAudioCtx = null;
      }
      var frame = document.getElementById("scannerFrame");
      if (frame.classList.contains("show")) {
        frame.classList.remove("show");
        frame.src = "";
      }
      document.getElementById("desktopPage").classList.add("show");
      trans.classList.remove("active");

      /* Ensure mascot is visible */
      document.getElementById("mascot").classList.add("show");
      mascotEl.src = images.thumb;
      setSpeaker("BYTE");

      /* Phase 2: Clean file animation + narrative */
      speechBox.classList.add("show");
      dialog = [
        { text: "Amazing job, Agent <b>" + name + "</b>! Let's head back and check the files.", img: images.thumb, speaker: "BYTE" },
        { text: "Look! The first file is clean now!", img: images.exp, speaker: "BYTE", after: function() {
          /* Animate icon 0 cleaning */
          var icon0 = document.getElementById("fi0");
          var deskIcon0 = document.querySelectorAll(".desk-icon")[0];
          deskIcon0.classList.add("cleaning");
          playAppear();
          setTimeout(function() {
            icon0.src = images.doc;
            deskIcon0.classList.remove("corrupted");
            deskIcon0.classList.remove("cleaning");
            deskIcon0.classList.remove("highlight");
          }, 800);
        } },
        { text: "Great, let\u2019s move on to the\u2014", img: images.cmd, speaker: "BYTE", noSkip: true, noNext: true, action: function() {
          /* Phase 3: Interrupt mid-sentence with glitch */
          setTimeout(function() {
            speechBox.classList.remove("show");
            playMeowShock(); mascotEl.src = images.shock;
            doGlitchLight(function() {
              playOminous(); speechBox.classList.add("show");
              document.getElementById("monsterImg").src = images.eBug;
              document.getElementById("monster").classList.remove("hide");
              document.getElementById("monster").classList.add("show");
              playAppear();
              dialog = [
                { text: "Not so fast\u2026 Let's see what you do if I LOCK these files!", speaker: "CORRUPTUS", evil: true, action: function() { playEvilLaugh(); } },
                { text: "Ha ha ha! Good luck getting them back!", speaker: "CORRUPTUS", evil: true },
                { text: "\u2026", speaker: "CORRUPTUS", evil: true, noNext: true, after: function() {
                  /* Phase 4: Glitch then lock animation */
                  speechBox.classList.remove("show");
                  doGlitchLight(function() {
                    /* Lock all remaining corrupted icons */
                    var icons = document.querySelectorAll(".desk-icon");
                    for (var i = 1; i < 6; i++) {
                      (function(idx) {
                        setTimeout(function() {
                          document.getElementById("fi" + idx).src = images.eLock;
                          icons[idx].classList.add("locked");
                          playLockChain();
                        }, (idx - 1) * 250);
                      })(i);
                    }
                    /* Animate chains wrapping + chain slam after icons lock */
                    setTimeout(function() {
                      playChainSlam();
                      animateChains(function() {
                        /* chains done */
                      });
                      /* Monster disappears after chains animate */
                      setTimeout(function() {
                        var mon = document.getElementById("monster");
                        mon.classList.remove("show"); mon.classList.add("hide");
                        stopOminous();
                        setTimeout(function() {
                          /* Phase 5: Cat reaction */
                          setSpeaker("BYTE");
                          speechBox.classList.add("show");
                          dialog = [
                            { text: "No\u2026 the files are locked!", img: images.shock, speaker: "BYTE" },
                            { text: "No worries. I know you're right for the job, <b>" + name + "</b>.", img: images.cmd, speaker: "BYTE" },
                            { text: "Let\u2019s decrypt these files and recover the password to unlock them.", img: images.exp, speaker: "BYTE" },
                            { text: "Try clicking on the locked files.", img: images.cmd, speaker: "BYTE", noNext: true, after: function() {
                              document.getElementById("chainsOverlay").classList.add("clickable");
                              window.gamePhase = "click-locked";
                            } }
                          ]; dIdx = 0; showNext();
                        }, 600);
                      }, 1200);
                    }, 1500);
                  });
                } }
              ]; dIdx = 0; showNext();
            });
          }, 1500);
        } }
      ];
      dIdx = 0; showNext();
    }, 1000);
  };

  /* Locked files click handler */
  document.addEventListener("click", function(e) {
    if (window.gamePhase !== "click-locked") return;
    var overlay = document.getElementById("chainsOverlay");
    if (!overlay.contains(e.target) && !e.target.closest(".desk-icon.locked")) return;
    window.gamePhase = "password-prompt";
    playWindowOpen();
    playLockChain();
    document.getElementById("passwordPrompt").classList.add("show");
    setTimeout(function() {
      dialog = [
        { text: "Hmm\u2026 we\u2019re going to need to figure out the password.", img: images.exp, speaker: "BYTE" },
        { text: "Let\u2019s open the <b>Decoder</b> to crack it!", img: images.cmd, speaker: "BYTE" },
        { text: "Click <b>CANCEL</b> to close this window and I'll set up the Decoder for you.", img: images.exp, speaker: "BYTE", noNext: true, after: function() {
          document.getElementById("ppClose").classList.add("show");
        } }
      ]; dIdx = 0; showNext();
    }, 500);
  });

  /* Password prompt CANCEL button */
  document.getElementById("ppCancel").addEventListener("click", function() {
    playWindowClose();
    document.getElementById("passwordPrompt").classList.remove("show");
    document.getElementById("ppClose").classList.remove("show");
    /* Pixel assembly animation for Decoder icon */
    document.getElementById("chainsOverlay").classList.remove("clickable");
    pixelAssemble(document.getElementById("decryptorIcon"), function() {
      window.gamePhase = "open-decryptor";
      dialog = [
        { text: "There! I've installed the <b>Decoder</b>. Click it to start!", img: images.cmd, speaker: "BYTE", noNext: true }
      ]; dIdx = 0; showNext();
    });
  });

  /* Also wire up the X close button */
  document.getElementById("ppClose").addEventListener("click", function() {
    document.getElementById("ppCancel").click();
  });

  /* Pixel assembly effect — dense grid converges to form icon */
  function pixelAssemble(targetEl, callback) {
    var parent = document.getElementById("deskIcons");
    var parentRect = parent.getBoundingClientRect();
    targetEl.style.display = "";
    targetEl.style.opacity = "0";
    var imgEl = document.getElementById("fi6");
    imgEl.src = "assets/icons/decrypt.png";
    /* Target the img element's exact bounds, not the full div */
    var imgRect = imgEl.getBoundingClientRect();
    var offX = imgRect.left - parentRect.left;
    var offY = imgRect.top - parentRect.top;
    var w = imgRect.width;
    var h = imgRect.height;

    var canvas = document.createElement("canvas");
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
    canvas.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;z-index:30;pointer-events:none";
    parent.appendChild(canvas);
    var ctx = canvas.getContext("2d");

    /* Dense grid of particles covering the icon area */
    var colors = ["#44eeff", "#cc88ff", "#00ffaa", "#ffcc44", "#ff44aa", "#44eeff", "#00ffaa"];
    var particles = [];
    var step = 3; /* 3px grid = very dense */
    for (var py = 0; py < h; py += step) {
      for (var px = 0; px < w; px += step) {
        var targetX = offX + px + Math.random() * step;
        var targetY = offY + py + Math.random() * step;
        /* Start from random positions across the whole parent area */
        var angle = Math.random() * Math.PI * 2;
        var dist = 150 + Math.random() * 250;
        particles.push({
          tx: targetX, ty: targetY,
          sx: targetX + Math.cos(angle) * dist,
          sy: targetY + Math.sin(angle) * dist,
          size: 2 + Math.random() * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 0.3 /* stagger arrival */
        });
      }
    }

    playMaterialize();
    var startTime = performance.now();
    var duration = 900;

    function tick(now) {
      var t = Math.min((now - startTime) / duration, 1);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        /* Each particle has its own delayed start */
        var pt = Math.max(0, (t - p.delay) / (1 - p.delay));
        if (pt <= 0) continue;
        var ease = 1 - Math.pow(1 - pt, 3);
        var x = p.sx + (p.tx - p.sx) * ease;
        var y = p.sy + (p.ty - p.sy) * ease;
        /* Particles become more opaque and solid as they arrive */
        var alpha = pt * pt;
        var s = p.size;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(x, y, s, s);
      }

      /* In the last 20%, start fading particles and brightening center */
      if (t > 0.8) {
        var fadeT = (t - 0.8) / 0.2;
        ctx.globalAlpha = fadeT * 0.3;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(offX, offY, w, h);
      }

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        canvas.remove();
        targetEl.style.opacity = "1";
        targetEl.classList.add("highlight");
        if (callback) callback();
      }
    }
    requestAnimationFrame(tick);
  }

  /* === ENTER PASSWORD — word selection === */
  document.addEventListener("click", function(e) {
    if (window.gamePhase !== "enter-password") return;
    var overlay = document.getElementById("chainsOverlay");
    if (!overlay.contains(e.target) && !e.target.closest(".desk-icon.locked")) return;
    window.gamePhase = "entering-password";
    playWindowOpen();

    /* Reset password prompt for entry mode */
    var ppEntered = document.getElementById("ppEntered");
    ppEntered.innerHTML = "";
    document.getElementById("ppBlank").style.display = "";
    var ppSubmit = document.getElementById("ppSubmit");
    ppSubmit.disabled = true;
    ppSubmit.classList.remove("ready");
    document.getElementById("ppCancel").style.display = "none";
    document.getElementById("ppClose").classList.remove("show");

    /* Build word boxes */
    var correctOrder = ["WHAT", "IT'S", "MOSTLY", "ABOUT"];
    var allWords = ["WHAT", "IT'S", "MOSTLY", "ABOUT", "ALWAYS"];
    /* Shuffle */
    for (var i = allWords.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = allWords[i]; allWords[i] = allWords[j]; allWords[j] = tmp;
    }

    var ppWords = document.getElementById("ppWords");
    ppWords.innerHTML = "";
    ppWords.classList.add("show");
    var enteredCount = 0;

    allWords.forEach(function(word) {
      var btn = document.createElement("button");
      btn.className = "pp-word";
      btn.textContent = word;
      btn.addEventListener("click", function() {
        if (btn.classList.contains("used")) return;
        if (word === correctOrder[enteredCount]) {
          /* Correct word */
          btn.classList.add("used");
          playBlip();
          var span = document.createElement("span");
          span.className = "pw-word";
          span.textContent = (enteredCount > 0 ? " " : "") + word;
          ppEntered.appendChild(span);
          enteredCount++;

          if (enteredCount >= 4) {
            document.getElementById("ppBlank").style.display = "none";
            ppSubmit.disabled = false;
            ppSubmit.classList.add("ready");
          }
        } else {
          /* Wrong word */
          playWrongBuzz();
          btn.classList.add("wrong-shake");
          setTimeout(function() { btn.classList.remove("wrong-shake"); }, 400);
        }
      });
      ppWords.appendChild(btn);
    });

    document.getElementById("passwordPrompt").classList.add("show");

    setTimeout(function() {
      dialog = [
        { text: "Click the words in the correct order to enter the password!", img: images.cmd, speaker: "BYTE", noNext: true }
      ]; dIdx = 0; showNext();
    }, 500);
  });

  /* SUBMIT button — trigger unlock */
  document.getElementById("ppSubmit").addEventListener("click", function() {
    if (this.disabled) return;
    window.gamePhase = "unlocking";
    document.getElementById("passwordPrompt").classList.remove("show");
    document.getElementById("ppWords").classList.remove("show");
    playUnlock();

    /* Unlock animation — chains disintegrate into pixels */
    setTimeout(function() {
      var chainsOverlay = document.getElementById("chainsOverlay");
      var chainsCanvas = document.getElementById("chainsCanvas");

      if (chainsCanvas) {
        /* Read chain pixel data and create disintegration particles */
        var ctx = chainsCanvas.getContext("2d");
        var W = chainsCanvas.width, H = chainsCanvas.height;
        var imgData = ctx.getImageData(0, 0, W, H);
        var particles = [];
        var step = 6; /* sample every 6 pixels for performance */

        for (var py = 0; py < H; py += step) {
          for (var px = 0; px < W; px += step) {
            var idx = (py * W + px) * 4;
            var a = imgData.data[idx + 3];
            if (a < 30) continue; /* skip transparent pixels */
            var r = imgData.data[idx], g = imgData.data[idx + 1], b = imgData.data[idx + 2];
            particles.push({
              x: px, y: py,
              vx: (Math.random() - 0.5) * 12,
              vy: -3 - Math.random() * 8,
              color: 'rgba(' + r + ',' + g + ',' + b + ',' + (a / 255) + ')',
              size: step
            });
          }
        }

        /* Animate disintegration */
        var startTime = performance.now();
        var duration = 800;
        playChainSlam();

        function tick(now) {
          var t = Math.min((now - startTime) / duration, 1);
          ctx.clearRect(0, 0, W, H);
          var ease = t * t;

          for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            var nx = p.x + p.vx * t * 40;
            var ny = p.y + p.vy * t * 40 + 150 * ease;
            var alpha = 1 - ease;
            var s = p.size * (1 - t * 0.5);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.fillRect(nx, ny, s, s);
          }

          if (t < 1) {
            requestAnimationFrame(tick);
          } else {
            chainsCanvas.remove();
            chainsOverlay.classList.remove("show", "clickable");

            /* Flash */
            var desk = document.getElementById("desktop");
            desk.classList.add("glitch-active");
            setTimeout(function() { desk.classList.remove("glitch-active"); }, 300);

            /* Unlock icons */
            var icons = document.querySelectorAll(".desk-icon");
            var normalEvil = [images.eDoc, images.eFolder, images.ePhoto, images.eLock, images.eDoc, images.eFolder];
            for (var i = 1; i < 6; i++) {
              (function(idx) {
                setTimeout(function() {
                  document.getElementById("fi" + idx).src = normalEvil[idx];
                  icons[idx].classList.remove("locked");
                  playBlip();
                }, idx * 150);
              })(i);
            }
            document.getElementById("fi0").src = images.doc;
            icons[0].classList.remove("corrupted", "locked");

            setTimeout(function() {
              setSpeaker("BYTE");
              speechBox.classList.add("show");
              var name = window.agentCode || "Agent";
              dialog = [
                { text: "The files are unlocked! Great work, <b>" + name + "</b>!", img: images.thumb, speaker: "BYTE" },
                { text: "We're making progress. The system is getting stronger!", img: images.exp, speaker: "BYTE", noNext: true }
              ]; dIdx = 0; showNext();
              window.gamePhase = "game2-complete";
            }, 1200);
          }
        }
        requestAnimationFrame(tick);
      } else {
        /* No canvas — just remove overlay */
        chainsOverlay.classList.remove("show", "clickable");
        var icons = document.querySelectorAll(".desk-icon");
        var normalEvil = [images.eDoc, images.eFolder, images.ePhoto, images.eLock, images.eDoc, images.eFolder];
        for (var i = 1; i < 6; i++) {
          document.getElementById("fi" + i).src = normalEvil[i];
          icons[i].classList.remove("locked");
        }
        document.getElementById("fi0").src = images.doc;
        icons[0].classList.remove("corrupted", "locked");
        setTimeout(function() {
          setSpeaker("BYTE");
          speechBox.classList.add("show");
          var name = window.agentCode || "Agent";
          dialog = [
            { text: "The files are unlocked! Great work, <b>" + name + "</b>!", img: images.thumb, speaker: "BYTE" },
            { text: "We're making progress. The system is getting stronger!", img: images.exp, speaker: "BYTE", noNext: true }
          ]; dIdx = 0; showNext();
          window.gamePhase = "game2-complete";
        }, 600);
      }
    }, 500);
  });

  /* === DECODER COMPLETE — return to desktop === */
  window.onDecoderComplete = function() {
    var name = window.agentCode || "Agent";
    var trans = document.getElementById("scanTransition");
    trans.classList.add("active");
    setTimeout(function() {
      if (window.scannerAudioCtx) {
        try { window.scannerAudioCtx.close(); } catch(e) {}
        window.scannerAudioCtx = null;
      }
      var frame = document.getElementById("decoderFrame");
      frame.classList.remove("show");
      frame.src = "";
      document.getElementById("desktopPage").classList.add("show");
      trans.classList.remove("active");
      document.getElementById("mascot").classList.add("show");
      mascotEl.src = images.thumb;
      setSpeaker("BYTE");

      /* Ensure icons are still locked + chains visible */
      var icons = document.querySelectorAll(".desk-icon");
      for (var i = 1; i < 6; i++) {
        icons[i].classList.add("locked");
        document.getElementById("fi" + i).src = images.eLock;
      }
      /* Re-draw chains if canvas was lost */
      var chainsOverlay = document.getElementById("chainsOverlay");
      if (!document.getElementById("chainsCanvas")) {
        animateChains(function() {});
      } else {
        chainsOverlay.classList.add("show");
      }

      speechBox.classList.add("show");
      dialog = [
        { text: "Excellent work, <b>" + name + "</b>! We've decoded the full password!", img: images.thumb, speaker: "BYTE" },
        { text: "The main idea is: <b>WHAT IT'S MOSTLY ABOUT</b>!", img: images.exp, speaker: "BYTE" },
        { text: "Now click on the locked files to enter the password!", img: images.cmd, speaker: "BYTE", noNext: true, after: function() {
          document.getElementById("chainsOverlay").classList.add("clickable");
          window.gamePhase = "enter-password";
        } }
      ]; dIdx = 0; showNext();
    }, 1000);
  };

})();
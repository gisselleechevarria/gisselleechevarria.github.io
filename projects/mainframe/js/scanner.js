/* ===== VIRUS SCANNER GAME MODULE ===== */
/* Main game logic for the MAINFRAME virus scanner mini-game */

/* --- Asset paths --- */
var assets = {
  exp:   'assets/mascot/exp.png',
  thumb: 'assets/mascot/thumb.png',
  shock: 'assets/mascot/shock.png',
  ebug:  'assets/mascot/ebug.png'
};

/* --- Game data (loaded from JSON) --- */
var passages = [];
var decoys = [];

/* --- HP bar state --- */
var hp = 100;
var totalDrain = 100 / 6;
var drainPerInfected = 0;
var firstDrain = false;

var hpColors = [
  '#cc1133','#dd1a22','#ee2211','#ff3a06','#ff5500','#ff6e00',
  '#ff8800','#ff9e00','#ffb411','#ffcc22','#ffdd33','#ffee44'
];

function renderHP() {
  var maxW = 510;
  var fillWidth = Math.round(hp / 100 * maxW);
  var svg = '';
  var x = 16;
  for (var i = 0; i < hpColors.length; i++) {
    var segW = i < hpColors.length - 1 ? Math.floor(maxW / hpColors.length) : maxW - x + 16;
    var w = Math.min(segW, fillWidth - (x - 16));
    if (w <= 0) break;
    svg += '<rect x="' + x + '" y="11" width="' + w + '" height="20" fill="' + hpColors[i] + '"/>';
    x += segW;
  }
  /* Highlight and shadow overlays */
  svg += '<rect x="16" y="11" width="' + fillWidth + '" height="3" fill="rgba(255,255,255,.3)"/>';
  svg += '<rect x="16" y="14" width="' + fillWidth + '" height="2" fill="rgba(255,255,255,.12)"/>';
  svg += '<rect x="16" y="28" width="' + fillWidth + '" height="1" fill="rgba(0,0,0,.15)"/>';
  svg += '<rect x="16" y="29" width="' + fillWidth + '" height="2" fill="rgba(0,0,0,.3)"/>';
  /* Segment dividers */
  var segPx = Math.floor(maxW / hpColors.length);
  for (var s = 16 + segPx; s < 16 + fillWidth; s += segPx) {
    svg += '<rect x="' + s + '" y="11" width="2" height="20" fill="rgba(0,0,0,.1)"/>';
  }
  document.getElementById('hpFill').innerHTML = svg;
  document.getElementById('hbPct').textContent = Math.round(hp) + '%';
}

function animDrain(amount, callback, duration) {
  var dur = duration || 1000;
  var target = Math.max(0, hp - amount);
  var startHP = hp;
  var startTime = performance.now();
  document.getElementById('hbFrame').classList.add('draining');
  sfx('drain');

  function tick(now) {
    var progress = Math.min((now - startTime) / dur, 1);
    hp = startHP - (startHP - target) * (1 - Math.pow(1 - progress, 3));
    renderHP();
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      hp = target;
      document.getElementById('hbFrame').classList.remove('draining');
      if (callback) callback();
    }
  }
  requestAnimationFrame(tick);
}

/* --- Dialog system --- */
var typewriterTimeout = null;

function say(message, face, callback) {
  document.getElementById('dPort').src = assets[face] || assets.exp;
  document.getElementById('dialogWrap').classList.add('show');
  var el = document.getElementById('dMsg');
  if (typewriterTimeout) clearTimeout(typewriterTimeout);
  el.innerHTML = '';
  var charIndex = 0;

  function tick() {
    if (charIndex >= message.length) {
      el.textContent = message;
      if (callback) callback();
      return;
    }
    charIndex++;
    el.innerHTML = message.substring(0, charIndex) + '<span class="cur"></span>';
    typewriterTimeout = setTimeout(tick, 22 + Math.random() * 14);
  }
  tick();
}

/* --- Game state --- */
var gameState = { passageIndex: 0, found: 0, needed: 0, wrongClicks: {}, busy: false };
var scanAnimId = null;

function countInfected(passageIndex) {
  var count = 0;
  passages[passageIndex].sentences.forEach(function(s) {
    if (!s.correct) count++;
  });
  return count;
}

function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = a[i];
    a[i] = a[j];
    a[j] = temp;
  }
  return a;
}

/* --- Pixel disintegration effect (bottom-to-top sweep with canvas) --- */
function pixelDisintegrate(element, callback) {
  var rect = element.getBoundingClientRect();
  var parent = element.parentElement;
  var parentRect = parent.getBoundingClientRect();
  var offX = rect.left - parentRect.left;
  var offY = rect.top - parentRect.top;
  var w = rect.width;
  var h = rect.height;

  /* Create canvas overlay */
  var canvas = document.createElement('canvas');
  canvas.width = parent.offsetWidth;
  canvas.height = parent.offsetHeight;
  canvas.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;z-index:10;pointer-events:none';
  parent.appendChild(canvas);
  var ctx = canvas.getContext('2d');

  /* Spawn particles in a grid covering the element */
  var colors = ['#44eeff', '#cc88ff', '#ff44aa', '#00ffaa', '#ffcc44'];
  var particles = [];
  var step = 4;
  for (var py = 0; py < h; py += step) {
    for (var px = 0; px < w; px += step) {
      if (Math.random() > 0.6) continue; /* sparse it slightly */
      var size = 2 + Math.random() * 3;
      /* activateAt: 0 at bottom, 1 at top — bottom rows activate first */
      var activateAt = 1 - (py / h);
      particles.push({
        x: offX + px, y: offY + py,
        ox: offX + px, oy: offY + py,
        vx: (Math.random() - 0.5) * 3,
        vy: -2 - Math.random() * 4,
        size: size,
        color: colors[Math.floor(Math.random() * colors.length)],
        activateAt: activateAt * 0.7, /* compress to 70% of duration so last 30% is collapse */
        active: false, life: 0
      });
    }
  }

  sfx('sweep-crackle');
  var duration = 800;
  var startTime = performance.now();

  function tick(now) {
    var t = Math.min((now - startTime) / duration, 1);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* Clip the original element — sweep line moves from bottom to top */
    var clipY = (1 - t * 1.3); /* goes from 1 to ~0 */
    if (clipY < 0) clipY = 0;
    element.style.clipPath = 'inset(0 0 ' + ((1 - clipY) * 100) + '% 0)';

    /* Final collapse phase (last 20%) */
    var collapsing = t > 0.8;
    var collapseT = collapsing ? (t - 0.8) / 0.2 : 0;

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];

      if (!p.active && t >= p.activateAt) {
        p.active = true;
        p.life = 0;
      }
      if (!p.active) continue;

      p.life += 0.016;
      var life = p.life;

      var x = p.ox + p.vx * life * 40;
      var y = p.oy + p.vy * life * 40;
      var s = p.size * Math.max(0, 1 - life * 1.2);
      var alpha = Math.max(0, 1 - life * 1.5);

      /* During collapse, accelerate everything upward and shrink fast */
      if (collapsing) {
        y -= collapseT * collapseT * 200;
        alpha *= (1 - collapseT);
        s *= (1 - collapseT);
      }

      if (alpha <= 0 || s <= 0) continue;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(x, y, s, s);
      /* Tiny glow */
      ctx.globalAlpha = alpha * 0.3;
      ctx.fillRect(x - 1, y - 1, s + 2, s + 2);
    }

    if (t < 1) {
      requestAnimationFrame(tick);
    } else {
      /* Cleanup */
      element.style.clipPath = '';
      element.style.display = 'none';
      element.classList.remove('show');
      canvas.remove();
      sfx('poof');
      if (callback) callback();
    }
  }
  requestAnimationFrame(tick);
}

/* --- Scan animation --- */
function runScanAnim(passageIndex, callback) {
  var track = document.getElementById('scanTrack');
  var glow = document.getElementById('scanGlow');
  var flash = document.getElementById('lockFlash');
  var resultBox = document.getElementById('resultBox');
  var viewport = document.getElementById('docVp');

  track.innerHTML = '';
  resultBox.classList.remove('show');
  resultBox.style.display = 'none';
  flash.classList.remove('go');

  /* Build fragment list with decoys for scrolling effect */
  var pool = shuffle(decoys);
  var bigPool = pool.concat(shuffle(decoys)).concat(shuffle(decoys));
  var insertAt = 18 + Math.floor(Math.random() * 6);
  var targetText = passages[passageIndex].sentences.map(function(s) { return s.text; }).join(' ');
  var frags = bigPool.slice(0, insertAt);
  frags.push(targetText);
  frags = frags.concat(bigPool.slice(insertAt, insertAt + 6));

  frags.forEach(function(txt) {
    var div = document.createElement('div');
    div.className = 'scan-frag';
    div.textContent = txt;
    if (txt === targetText) div.setAttribute('data-target', '1');
    track.appendChild(div);
  });

  var viewHeight = viewport.offsetHeight;
  var centerY = viewHeight / 2;
  glow.classList.add('on');
  glow.style.top = (centerY - 35) + 'px';

  var targetEl = track.querySelector('[data-target]');
  var stopAt = targetEl.offsetTop + targetEl.offsetHeight / 2 - centerY;
  sfx('scan');

  var duration = 2200;
  var startTime = performance.now();
  var scTrackEl = document.querySelector('.sc-track');
  var scTrackHeight = scTrackEl ? scTrackEl.offsetHeight - 20 : 100;
  var scThumb = document.getElementById('scThumb');

  function tick(now) {
    var elapsed = now - startTime;
    var t = Math.min(elapsed / duration, 1);
    var ease = 1 - Math.pow(1 - t, 3);
    var scrollPos = ease * stopAt;
    track.style.transform = 'translateY(-' + scrollPos + 'px)';

    /* Sync scrollbar thumb */
    var trackHeight = track.scrollHeight;
    var scrollPct = scrollPos / Math.max(trackHeight - viewHeight, 1);
    scThumb.style.top = Math.round(4 + scrollPct * scTrackHeight) + 'px';

    if (t < 1) {
      scanAnimId = requestAnimationFrame(tick);
    } else {
      glow.classList.remove('on');
      sfx('lock');
      var elTop = targetEl.getBoundingClientRect().top - viewport.getBoundingClientRect().top;
      flash.style.top = elTop + 'px';
      flash.style.height = targetEl.offsetHeight + 'px';
      flash.classList.add('go');
      track.querySelectorAll('.scan-frag').forEach(function(f) {
        if (!f.hasAttribute('data-target')) f.classList.add('dimmed');
      });
      setTimeout(function() {
        var r = targetEl.getBoundingClientRect();
        var bg = viewport.getBoundingClientRect();
        resultBox.style.top = Math.max(0, r.top - bg.top - 38) + 'px';
        resultBox.style.display = 'flex';
        setTimeout(function() { resultBox.classList.add('show'); }, 20);
        targetEl.style.opacity = '0';
        if (callback) callback();
      }, 800);
    }
  }
  scanAnimId = requestAnimationFrame(tick);
}

/* --- Load passage into UI --- */
function loadPassage(passageIndex) {
  var passage = passages[passageIndex];
  var para = document.getElementById('rbPara');
  var html = '';
  passage.sentences.forEach(function(s, i) {
    var cls = 'doc-s';
    /* infected-hint added dynamically during tutorial for passage 0 */
    html += '<span class="' + cls + '" data-p="' + passageIndex + '" data-s="' + i + '">' + s.text + '</span> ';
  });
  para.innerHTML = html;

  /* Attach click handlers */
  para.querySelectorAll('.doc-s').forEach(function(el) {
    el.onclick = function() {
      handleClick(
        parseInt(el.getAttribute('data-p')),
        parseInt(el.getAttribute('data-s')),
        el
      );
    };
  });

  var needed = countInfected(passageIndex);
  document.getElementById('rbThreats').textContent = needed;
  document.getElementById('rbThreats').style.color = '#ff3355';
  document.getElementById('rbThreatSub').textContent = 'of ' + needed;
  document.getElementById('rbClearedTag').style.display = 'none';
  document.getElementById('rbEntries').textContent = passage.sentences.length;
  document.getElementById('rbFile').textContent = (passageIndex + 1) + '/' + passages.length;
  document.getElementById('rbFoot').textContent = passage.sentences.length + ' ENTRIES LOADED';
  document.getElementById('rbStatus').textContent = 'ACTIVE';
  document.getElementById('rbStatus').style.color = '#ff6688';
  document.getElementById('tbThreat').className = 'tb-threat';
  document.getElementById('tbThreat').innerHTML = '&#9888; ' + needed + ' THREAT' + (needed > 1 ? 'S' : '');
}

/* --- Start a passage --- */
function startPassage(passageIndex) {
  gameState.passageIndex = passageIndex;
  gameState.found = 0;
  gameState.needed = countInfected(passageIndex);
  gameState.wrongClicks = {};
  gameState.busy = true;
  nextBtn.classList.remove('show');

  runScanAnim(passageIndex, function() {
    loadPassage(passageIndex);
    if (passageIndex === 0) {
      /* Tutorial: intro already shown before scan, now explain the task */
      say("Read the passage carefully. Find the detail that doesn't relate to the main idea and click on it.", "exp", function() {
        gameState.tutorialPhase = 'find-first';
        gameState.busy = false;
      });
    } else {
      say("Find " + gameState.needed + " infected detail" + (gameState.needed > 1 ? "s" : "") + "!", "exp", function() {
        gameState.busy = false;
      });
    }
  });
}

/* --- Handle sentence click --- */
function handleClick(passageIndex, sentenceIndex, el) {
  if (gameState.busy || passageIndex !== gameState.passageIndex ||
      el.classList.contains('phase1') || el.classList.contains('found')) return;

  /* If file already cleared, remind user */
  if (gameState.found >= gameState.needed) {
    say("This file is already clean! Click the NEXT FILE button to continue!", "exp", null);
    return;
  }

  initAudio();
  var sentence = passages[passageIndex].sentences[sentenceIndex];

  if (!sentence.correct) {
    /* Correct identification of infected data */
    gameState.busy = true;
    sfx('quarantine');
    el.className = 'doc-s phase1';
    setTimeout(function() { el.className = 'doc-s phase2'; }, 400);
    setTimeout(function() {
      el.className = 'doc-s phase3';
      sfx('purge');
      var prev = el.previousSibling;
      if (prev && prev.nodeType === 3) prev.textContent = '';
    }, 1000);
    setTimeout(function() { el.className = 'doc-s found'; }, 1500);

    gameState.found++;
    var remaining = gameState.needed - gameState.found;
    document.getElementById('rbThreats').textContent = remaining;
    document.getElementById('rbThreatSub').textContent = 'of ' + gameState.needed;
    document.getElementById('tbThreat').innerHTML = '&#9888; ' + remaining + ' THREAT' + (remaining !== 1 ? 'S' : '');

    /* Tutorial: after first correct click, reveal glitch on remaining infected */
    if (passageIndex === 0 && gameState.tutorialPhase === 'find-first') {
      gameState.tutorialPhase = 'glitch-reveal';
      setTimeout(function() {
        say("Great job! Sometimes infected data will glitch to help you spot it.", "thumb", function() {
          /* Show NEXT button so student can read at their pace */
          nextBtn.textContent = 'NEXT \u25B6';
          nextBtn.classList.add('show');
          nextBtn.onclick = function() {
            nextBtn.classList.remove('show');
            nextBtn.textContent = 'NEXT FILE \u25B6';
            nextBtn.onclick = null;
            /* Add glitch hint to remaining infected sentences */
            document.querySelectorAll('#rbPara .doc-s').forEach(function(d) {
              var si = parseInt(d.getAttribute('data-s'));
              if (!passages[passageIndex].sentences[si].correct &&
                  !d.classList.contains('found') &&
                  !d.classList.contains('phase1')) {
                d.classList.add('infected-hint');
              }
            });
            sfx('glitch');
            say("See? Click the glitching sentence to remove it!", "exp", function() {
              gameState.busy = false;
            });
          };
        });
      }, 1600);
    } else if (!firstDrain) {
      firstDrain = true;
      setTimeout(function() {
        sfx('meow-shock');
        say("Whoa! Look at the health bar up top! Something is happening!", "shock", function() {
          /* NEXT button so student can read at their pace */
          nextBtn.textContent = 'NEXT \u25B6';
          nextBtn.classList.add('show');
          nextBtn.onclick = function() {
            nextBtn.classList.remove('show');
            nextBtn.textContent = 'NEXT FILE \u25B6';
            nextBtn.onclick = null;
            /* Pulse HP bar to draw attention before draining */
            var hbFrame = document.getElementById('hbFrame');
            hbFrame.classList.add('attention');
            sfx('warning');
            setTimeout(function() {
              hbFrame.classList.remove('attention');
              animDrain(drainPerInfected, function() {
                say("Every time you quarantine bad data, Corruptus gets weaker! Keep it up, Agent!", "exp", function() {
                  nextBtn.textContent = 'NEXT \u25B6';
                  nextBtn.classList.add('show');
                  nextBtn.onclick = function() {
                    nextBtn.classList.remove('show');
                    nextBtn.textContent = 'NEXT FILE \u25B6';
                    nextBtn.onclick = null;
                    if (gameState.found >= gameState.needed) finishPassage(passageIndex);
                    else {
                      if (remaining > 0) say(remaining + " more infected detail" + (remaining > 1 ? "s" : "") + " to find!", "exp", null);
                      gameState.busy = false;
                    }
                  };
                });
              }, 2000); /* Slower first drain — 2 seconds */
            }, 1500); /* Wait for 3 attention pulses (0.5s x 3) */
          };
        });
      }, 1600);
    } else {
      setTimeout(function() {
        animDrain(drainPerInfected, function() {
          if (gameState.found >= gameState.needed) finishPassage(passageIndex);
          else {
            say(remaining + " more to find! Keep scanning!", "exp", null);
            gameState.busy = false;
          }
        });
      }, 1600);
    }
  } else {
    /* Wrong click */
    sfx('wrong');
    el.classList.add('wrong-flash');
    setTimeout(function() { el.classList.remove('wrong-flash'); }, 500);

    var key = passageIndex + '-' + sentenceIndex;
    gameState.wrongClicks[key] = (gameState.wrongClicks[key] || 0) + 1;

    if (gameState.wrongClicks[key] >= 2) {
      sfx('glitch');
      var hinted = false;
      document.querySelectorAll('#rbPara .doc-s').forEach(function(d) {
        if (hinted) return;
        var si = parseInt(d.getAttribute('data-s'));
        if (!passages[passageIndex].sentences[si].correct &&
            !d.classList.contains('found') &&
            !d.classList.contains('phase1')) {
          d.classList.add('hint-glitch');
          hinted = true;
        }
      });
      say("Look! The infected data is glitching! Click the glitching text!", "shock", null);
    } else {
      say("That sentence belongs! Look for the detail that doesn't fit the topic.", "exp", null);
    }
  }
}

/* --- Passage complete --- */
function finishPassage(passageIndex) {
  setTimeout(function() {
    sfx('clean');
    document.getElementById('rbStatus').textContent = 'CLEAN';
    document.getElementById('rbStatus').style.color = '#00ff88';
    document.getElementById('rbThreats').textContent = '0';
    document.getElementById('rbThreats').style.color = '#00ff88';
    document.getElementById('rbClearedTag').style.display = 'block';
    document.getElementById('tbThreat').className = 'tb-threat clean';
    document.getElementById('tbThreat').innerHTML = '&#10003; CLEAN';

    if (passageIndex + 1 < passages.length) {
      say("File cleaned! Corruptus is getting weaker!", "thumb", function() {
        nextBtn.classList.add('show');
        nextBtn.textContent = 'NEXT FILE \u25B6';
        gameState.busy = false;
      });
    } else {
      say("ALL FILES CLEANED! Virus Scanner complete! Great work, Agent!", "thumb", function() {
        nextBtn.textContent = 'RETURN TO HQ \u25B6';
        nextBtn.classList.add('show');
        nextBtn.onclick = function() {
          nextBtn.classList.remove('show');
          nextBtn.onclick = null;
          try { window.parent.onScannerComplete(); } catch(e) {}
        };
      });
    }
  }, 400);
}

/* --- Initialize game --- */
var nextBtn = document.getElementById('nextBtn');

nextBtn.addEventListener('click', function() {
  var next = gameState.passageIndex + 1;
  if (next >= passages.length || gameState.busy) return;
  nextBtn.classList.remove('show');
  /* Pixel disintegrate result box before starting next passage */
  var rb = document.getElementById('resultBox');
  if (rb.classList.contains('show')) {
    gameState.busy = true;
    pixelDisintegrate(rb, function() {
      gameState.busy = false;
      startPassage(next);
    });
  } else {
    startPassage(next);
  }
});

/* Start audio immediately (scanner opened via user click, so context is allowed) */
initAudio();
startBGM();

/* Fallback: resume audio on first user interaction if browser blocked autoplay */
document.addEventListener('click', function resumeAudio() {
  initAudio();
  document.removeEventListener('click', resumeAudio);
}, { once: true });

/* Load passage data from JSON and start */
fetch('data/passages.json')
  .then(function(response) { return response.json(); })
  .then(function(data) {
    /* Convert JSON format to game format */
    passages = data.passages.map(function(p) {
      return {
        title: p.title,
        sentences: p.sentences.map(function(s) {
          return { text: s.text, correct: s.correct };
        })
      };
    });
    decoys = data.decoys;

    /* Calculate drain per infected sentence */
    var totalInfected = 0;
    passages.forEach(function(p) {
      p.sentences.forEach(function(s) {
        if (!s.correct) totalInfected++;
      });
    });
    drainPerInfected = totalDrain / totalInfected;

    /* Set monster image */
    document.getElementById('monsterImg').src = assets.ebug;

    /* Render initial HP and show intro */
    renderHP();

    /* Show cat intro, then BEGIN SCAN button */
    say("We need to review these files for infected data. When you're ready, hit BEGIN SCAN!", "exp", null);

    document.getElementById('beginScanBtn').addEventListener('click', function() {
      document.getElementById('beginScanOverlay').classList.add('hidden');
      setTimeout(function() {
        startPassage(0);
      }, 300); /* Wait for fade-out transition */
    });
  })
  .catch(function(err) {
    console.error('Failed to load passage data:', err);
  });

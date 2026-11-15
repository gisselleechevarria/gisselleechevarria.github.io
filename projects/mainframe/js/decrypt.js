/* ===== DECODER v4 — Column Pause + Progressive Tutorial ===== */

var assets = {
  exp: 'assets/mascot/exp.png', thumb: 'assets/mascot/thumb.png',
  shock: 'assets/mascot/shock.png', cmd: 'assets/mascot/cmd.png'
};

var passages = [];
var tutorialData = null;
var gameState = {
  passageIndex: 0, busy: false, wrongCount: 0,
  passwordParts: ['WHAT', "IT'S", 'MOSTLY', 'ABOUT'], revealed: 0,
  scrolling: false, scrollAnimId: null, pausedCol: null,
  timerInterval: null, timerSeconds: 120, timerPaused: false,
  isTutorial: false
};
var scrollNodes = [];
var scrollSpeed = 50;

/* --- Scramble --- */
var scrambleChars = '!@#$%^&*_+-=|;:<>?/~0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function scrambleText(t) {
  var r = '';
  for (var i = 0; i < t.length; i++) r += t[i] === ' ' ? ' ' : scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
  return r;
}

/* --- Dialog --- */
var typewriterTimeout = null;
function say(msg, face, cb) {
  document.getElementById('dcPort').src = assets[face] || assets.exp;
  document.getElementById('dcDialogWrap').classList.add('show');
  var el = document.getElementById('dcMsg');
  if (typewriterTimeout) clearTimeout(typewriterTimeout);
  el.innerHTML = ''; var ci = 0;
  function tick() {
    if (ci >= msg.length) { el.textContent = msg; if (cb) cb(); return; }
    ci++; el.innerHTML = msg.substring(0, ci) + '<span class="cur"></span>';
    typewriterTimeout = setTimeout(tick, 22 + Math.random() * 14);
  }
  tick();
}
function showBtn(text, cb) {
  var btn = document.getElementById('dcNextBtn');
  btn.textContent = text; btn.classList.add('show');
  btn.onclick = function() { btn.classList.remove('show'); btn.onclick = null; cb(); };
}

/* --- Timer --- */
function startTimer() {
  gameState.timerSeconds = 120; gameState.timerPaused = false;
  updateTimerDisplay();
  document.getElementById('hudDot').classList.add('active');
  document.getElementById('hudStatus').textContent = 'SCANNING';
  if (gameState.timerInterval) clearInterval(gameState.timerInterval);
  gameState.timerInterval = setInterval(function() {
    if (gameState.timerPaused) return;
    gameState.timerSeconds--;
    updateTimerDisplay();
    if (gameState.timerSeconds <= 0) {
      clearInterval(gameState.timerInterval); stopScrolling();
      gameState.busy = true; sfx('decrypt-fail');
      say("Time's up! Let's try that one again.", "shock", function() {
        showBtn('RETRY \u25B6', function() { loadPassage(gameState.passageIndex, false); });
      });
    }
  }, 1000);
}
function pauseTimer() { gameState.timerPaused = true; }
function resumeTimer() { gameState.timerPaused = false; }
function updateTimerDisplay() {
  var el = document.getElementById('hudTimer');
  var m = Math.floor(gameState.timerSeconds / 60), s = gameState.timerSeconds % 60;
  el.textContent = m + ':' + (s < 10 ? '0' : '') + s;
  el.classList.remove('warning', 'danger');
  if (gameState.timerSeconds <= 30) el.classList.add('danger');
  else if (gameState.timerSeconds <= 60) el.classList.add('warning');
}

/* --- Scrolling (column-based pause) --- */
function stopScrolling() {
  gameState.scrolling = false;
  if (gameState.scrollAnimId) { cancelAnimationFrame(gameState.scrollAnimId); gameState.scrollAnimId = null; }
}

function startScrolling() {
  gameState.scrolling = true;
  var field = document.getElementById('decodeField');
  var fieldH = field.offsetHeight;
  var nodeH = 100;
  var lastTime = performance.now();

  function tick(now) {
    if (!gameState.scrolling) return;
    var dt = (now - lastTime) / 1000; lastTime = now;

    for (var i = 0; i < scrollNodes.length; i++) {
      var sn = scrollNodes[i];
      /* Pause entire column when hovered or hinted */
      if (gameState.pausedCol === sn.col) continue;

      sn.y -= scrollSpeed * dt;

      if (sn.y < -nodeH - 20) {
        sn.y = fieldH + 20;
        if (!sn.el.classList.contains('disabled') && !sn.el.classList.contains('hinted')) {
          sn.el.querySelector('.frag-body').textContent = scrambleText(sn.real);
          sn.el.classList.remove('decoded');
          sn.el.querySelector('.frag-status').textContent = 'ENCRYPTED';
        }
      }
      sn.el.style.top = Math.round(sn.y) + 'px';
    }
    gameState.scrollAnimId = requestAnimationFrame(tick);
  }
  gameState.scrollAnimId = requestAnimationFrame(tick);
}

/* --- Fragment labels --- */
var fragLabels = ['FRAGMENT_01','NODE_02','PACKET_03','SIGNAL_04','DATA_05','BLOCK_06','SECTOR_07','TRACE_08','STREAM_09','CIPHER_10','VECTOR_11','RELAY_12'];

/* --- Create fragment node --- */
function createFragNode(opt, idx) {
  var isLeft = idx % 2 === 0;
  var col = isLeft ? 'left' : 'right';
  var node = document.createElement('div');
  node.className = 'frag-node ' + (isLeft ? 'scroll-left' : 'scroll-right');

  var inner = document.createElement('div');
  inner.className = 'frag-inner';
  var header = document.createElement('div');
  header.className = 'frag-header';
  header.innerHTML = '<span class="frag-dot"></span><span class="frag-label">' +
    fragLabels[idx] + '</span><span class="frag-status">ENCRYPTED</span>';
  var body = document.createElement('div');
  body.className = 'frag-body';
  body.textContent = scrambleText(opt.text);
  inner.appendChild(header); inner.appendChild(body); node.appendChild(inner);

  node.setAttribute('data-real', opt.text);
  node.setAttribute('data-correct', opt.correct ? '1' : '0');
  node.setAttribute('data-col', col);

  /* Hover: pause entire column + decrypt this node */
  var unscrambleTimer = null;
  node.addEventListener('mouseenter', function() {
    if (node.classList.contains('disabled') || gameState.busy) return;
    gameState.pausedCol = col;
    var real = node.getAttribute('data-real');
    var step = 0, totalSteps = 10;
    sfx('decrypt-hover');
    header.querySelector('.frag-status').textContent = 'DECRYPTING...';
    document.getElementById('hudDot').classList.add('scanning');

    function unscramble() {
      step++;
      if (step >= totalSteps) {
        body.textContent = real; node.classList.add('decoded');
        header.querySelector('.frag-status').textContent = 'SIGNAL LOCKED';
        document.getElementById('hudDot').classList.remove('scanning');
        return;
      }
      var result = '', ratio = step / totalSteps;
      for (var i = 0; i < real.length; i++)
        result += (i / real.length < ratio || real[i] === ' ') ? real[i] : scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
      body.textContent = result;
      unscrambleTimer = setTimeout(unscramble, 35);
    }
    unscramble();
  });

  node.addEventListener('mouseleave', function() {
    if (node.classList.contains('disabled') || gameState.busy || node.classList.contains('hinted')) return;
    gameState.pausedCol = null;
    clearTimeout(unscrambleTimer);
    body.textContent = scrambleText(node.getAttribute('data-real'));
    node.classList.remove('decoded');
    header.querySelector('.frag-status').textContent = 'ENCRYPTED';
    document.getElementById('hudDot').classList.remove('scanning');
  });

  /* Click */
  node.addEventListener('click', function() {
    if (gameState.busy || node.classList.contains('disabled')) return;
    gameState.busy = true;
    gameState.pausedCol = null;
    stopScrolling();
    if (!gameState.isTutorial) pauseTimer();
    var isCorrect = node.getAttribute('data-correct') === '1';
    if (isCorrect) {
      if (gameState.isTutorial) handleTutorialCorrect(node);
      else handleCorrect(node);
    } else handleWrong(node);
  });

  return { node: node, col: col };
}

/* --- Build and show fragments in decode field --- */
function buildFragments(passage) {
  var field = document.getElementById('decodeField');
  field.querySelectorAll('.frag-node').forEach(function(n) { n.remove(); });
  scrollNodes = [];

  var shuffled = passage.options.map(function(o) { return { text: o.text, correct: o.correct }; });
  for (var i = shuffled.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
  }

  var fieldH = field.offsetHeight || 400;
  var leftCount = 0, rightCount = 0;
  var nodeSpacing = 90;

  shuffled.forEach(function(opt, idx) {
    var result = createFragNode(opt, idx);
    var node = result.node;
    var col = result.col;
    node.style.opacity = '0'; node.style.transition = 'opacity .4s';
    field.appendChild(node);

    var isLeft = col === 'left';
    var colIdx = isLeft ? leftCount++ : rightCount++;
    var startY = colIdx * nodeSpacing + (isLeft ? 0 : nodeSpacing / 2);

    scrollNodes.push({ el: node, y: startY, real: opt.text, col: col });
    node.style.top = startY + 'px';

    setTimeout(function() { node.style.opacity = '1'; }, 80 + idx * 100);
  });
}

/* --- Load passage --- */
function loadPassage(index, isTutorial) {
  var passage = isTutorial ? tutorialData : passages[index];
  gameState.passageIndex = index;
  gameState.busy = false;
  gameState.wrongCount = 0;
  gameState.isTutorial = isTutorial;
  gameState.pausedCol = null;
  stopScrolling();

  document.getElementById('hudFile').textContent = isTutorial ? 'TUTORIAL' : 'FILE ' + (index + 1) + '/4';
  document.getElementById('passageTitle').textContent = passage.title;
  document.getElementById('passageBody').textContent = passage.text;
  document.getElementById('hudStatus').textContent = 'STANDBY';
  document.getElementById('hudDot').className = 'hud-dot';

  /* Show panels */
  document.querySelector('.panel-passage').classList.remove('hidden-panel');
  document.querySelector('.panel-decode').classList.remove('hidden-panel');

  sfx('passage-load');
  buildFragments(passage);

  if (isTutorial) {
    say("Now find the MAIN IDEA and click it!", "cmd", function() {
      startScrolling();
    });
  } else {
    say("Fragments are scrolling! Hover to decode, find the MAIN IDEA!", "exp", function() {
      startTimer();
      startScrolling();
    });
  }
}

/* --- Tutorial correct --- */
function handleTutorialCorrect(node) {
  node.classList.add('correct'); sfx('decrypt-success');
  document.querySelectorAll('.frag-node').forEach(function(n) { if (n !== node) n.classList.add('disabled'); });

  var fb = document.getElementById('dcFeedback'), fbt = document.getElementById('dcFeedbackText');
  fb.classList.add('show', 'success'); fbt.textContent = 'CORRECT!';

  setTimeout(function() {
    fb.classList.remove('show', 'success');
    say("Great job! That's how you find the main idea!", "thumb", function() {
      showBtn('NEXT \u25B6', function() {
        say("In the real mission, you'll have 2 minutes per file. The timer starts when the fragments begin. Ready?", "cmd", function() {
          showBtn('BEGIN MISSION \u25B6', function() {
            loadPassage(0, false);
          });
        });
      });
    });
  }, 1200);
}

/* --- Correct answer (real game) --- */
function handleCorrect(node) {
  node.classList.add('correct'); sfx('decrypt-success');
  clearInterval(gameState.timerInterval);
  document.getElementById('hudStatus').textContent = 'DECRYPTED';
  document.getElementById('hudDot').className = 'hud-dot active';
  document.querySelectorAll('.frag-node').forEach(function(n) { if (n !== node) n.classList.add('disabled'); });

  var fb = document.getElementById('dcFeedback'), fbt = document.getElementById('dcFeedbackText');
  fb.classList.add('show', 'success'); fbt.textContent = 'DECRYPTION SUCCESSFUL';

  setTimeout(function() {
    fb.classList.remove('show', 'success');
    var si = gameState.revealed;
    document.getElementById('slot' + si).textContent = gameState.passwordParts[si];
    document.getElementById('slot' + si).classList.add('revealed');
    sfx('slot-reveal'); gameState.revealed++;

    setTimeout(function() {
      if (gameState.revealed >= 4) {
        say("We've got the full password! Let's head back and unlock those files!", "thumb", function() {
          showBtn('RETURN TO HQ \u25B6', function() {
            try { window.parent.onDecoderComplete(); } catch(e) {}
          });
        });
      } else {
        say("Password part decoded! " + (4 - gameState.revealed) + " more to go!", "thumb", function() {
          showBtn('NEXT FILE \u25B6', function() { loadPassage(gameState.revealed, false); });
        });
      }
    }, 600);
  }, 1500);
}

/* --- Wrong answer --- */
function handleWrong(node) {
  node.classList.add('wrong'); sfx('decrypt-fail');
  gameState.wrongCount++;

  var fb = document.getElementById('dcFeedback'), fbt = document.getElementById('dcFeedbackText');
  fb.classList.add('show', 'fail'); fbt.textContent = 'ACCESS DENIED';

  setTimeout(function() {
    fb.classList.remove('show', 'fail');
    node.classList.remove('wrong');
    gameState.busy = false;

    if (gameState.wrongCount >= 2) {
      /* Find the correct node and its scroll data */
      var hintNode = null, hintScrollData = null, hintCol = null;
      document.querySelectorAll('.frag-node').forEach(function(n) {
        if (n.getAttribute('data-correct') === '1') hintNode = n;
      });
      if (hintNode) {
        hintCol = hintNode.getAttribute('data-col');
        hintScrollData = scrollNodes.find(function(s) { return s.el === hintNode; });

        /* Apply hint styling */
        hintNode.classList.add('hinted', 'decoded');
        hintNode.querySelector('.frag-body').textContent = hintNode.getAttribute('data-real');
        hintNode.querySelector('.frag-status').textContent = 'HINT: TRY THIS ONE';
        hintNode.querySelector('.frag-label').textContent = '\u2605 MAIN IDEA';

        var field = document.getElementById('decodeField');
        var fieldH = field.offsetHeight;

        /* Let column scroll freely first (pausedCol = null), then pause once visible */
        gameState.pausedCol = null;
        startScrolling();

        /* Check every frame if the hinted node is visible */
        var scrollCheck = setInterval(function() {
          if (!hintScrollData) { clearInterval(scrollCheck); return; }
          var y = hintScrollData.y;
          /* Visible = between 10% and 70% of field height */
          if (y >= fieldH * 0.1 && y <= fieldH * 0.7) {
            gameState.pausedCol = hintCol;
            clearInterval(scrollCheck);
          }
        }, 30);
      }

      /* Penalty: subtract 15 seconds */
      if (!gameState.isTutorial) {
        gameState.timerSeconds = Math.max(10, gameState.timerSeconds - 15);
        updateTimerDisplay();
        /* Flash penalty text */
        var timerEl = document.getElementById('hudTimer');
        var origText = timerEl.textContent;
        timerEl.textContent = '-15 SEC';
        timerEl.classList.add('danger');
        setTimeout(function() {
          updateTimerDisplay();
        }, 800);
      }

      say("Look for the highlighted fragment! That's the main idea!", "cmd", null);
    } else {
      say("That's not the main idea. Try another fragment!", "shock", null);
      startScrolling();
    }

    if (!gameState.isTutorial) resumeTimer();
  }, 1200);
}

/* --- Progressive Tutorial --- */
function runProgressiveTutorial() {
  /* Start with panels dimmed */
  document.querySelector('.panel-passage').classList.add('hidden-panel');
  document.querySelector('.panel-decode').classList.add('hidden-panel');

  say("Welcome to the Decoder! Let me show you how it works.", "exp", function() {
    showBtn('NEXT \u25B6', function() {
      /* Step 2: Reveal passage */
      document.getElementById('passageTitle').textContent = tutorialData.title;
      document.getElementById('passageBody').textContent = tutorialData.text;
      document.getElementById('hudFile').textContent = 'TUTORIAL';
      document.querySelector('.panel-passage').classList.remove('hidden-panel');
      sfx('passage-load');

      say("Read the passage on the left carefully. It has important information.", "cmd", function() {
        showBtn('NEXT \u25B6', function() {
          /* Step 3: Reveal decode field with fragments */
          document.querySelector('.panel-decode').classList.remove('hidden-panel');
          gameState.isTutorial = true;
          gameState.wrongCount = 0;
          gameState.busy = false;
          gameState.pausedCol = null;
          buildFragments(tutorialData);

          say("Now hover over the data fragments on the right to decode them!", "exp", function() {
            showBtn('NEXT \u25B6', function() {
              say("Find the sentence that captures the MAIN IDEA and click it! Try it now!", "thumb", function() {
                startScrolling();
              });
            });
          });
        });
      });
    });
  });
}

/* --- Init --- */
initAudio(); startBGM();
document.addEventListener('click', function ra() { initAudio(); document.removeEventListener('click', ra); }, { once: true });

fetch('data/decrypt-passages.json')
  .then(function(r) { return r.json(); })
  .then(function(data) {
    passages = data.passages;
    tutorialData = data.tutorial;
    runProgressiveTutorial();
  })
  .catch(function(err) { console.error('Failed to load decoder data:', err); });

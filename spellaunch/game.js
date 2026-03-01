(function () {
  'use strict';

  const WORDS = [
    'NURSE', 'WORK', 'SHIRT', 'HURT', 'CHIRP', 'WORD', 'SERVE', 'CURLY',
    'DIRT', 'WORRY', 'TURN', 'STIR', 'FIRM', 'SKIRT', 'CHURNING', 'SWERVE',
    'SQUIRM', 'TWIRLING'
  ];

  let shuffledWords = [];

  const DECOY_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const blanksEl = document.getElementById('blanks');
  const clearingCountEl = document.getElementById('clearing-count');
  const vialsEl = document.querySelectorAll('.vial');
  const wordFlashEl = document.getElementById('word-flash');
  const messageOverlay = document.getElementById('message-overlay');
  const messageText = document.getElementById('message-text');
  const messageBtn = document.getElementById('message-btn');
  const startScreen = document.getElementById('start-screen');
  const startBtn = document.getElementById('start-btn');
  const gameOverScreen = document.getElementById('game-over-screen');
  const restartBtn = document.getElementById('restart-btn');
  const hintBtn = document.getElementById('hint-btn');
  const gameContainer = document.getElementById('game-container');
  const btnLeft = document.getElementById('btn-left');
  const btnRight = document.getElementById('btn-right');
  const btnFire = document.getElementById('btn-fire');
  const btnClear = document.getElementById('btn-clear');

  let width, height;
  let ship = { x: 0, w: 48, h: 32, speed: 6 };
  let lasers = [];
  let letters = [];
  let orbs = [];
  let currentWord = '';
  let nextLetterIndex = 0;
  let filledWord = [];
  const MAX_ENERGY = 10;
  let energy = MAX_ENERGY;
  let stageIndex = 0;
  let gameStarted = false;
  let wordFlashPhase = 'hidden'; // 'visible' | 'fading' | 'done'
  let wordFlashStartTime = 0;
  const CLEARING_SHOTS_PER_STAGE = 7;
  let clearingShots = CLEARING_SHOTS_PER_STAGE;
  let keys = { left: false, right: false, clear: false };
  let lastShot = 0;
  let lastClearShot = 0;
  const shotCooldown = 200;
  const BOTTOM_HUD_HEIGHT = 56;
  let hintUsedThisStage = false;

  function resize() {
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.round(rect.width);
    height = Math.round(rect.height);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (dpr !== 1) {
      ctx.scale(dpr, dpr);
    }
    if (gameStarted && ship.x === 0) ship.x = width / 2 - ship.w / 2;
  }

  function getCurrentWord() {
    return shuffledWords[stageIndex % shuffledWords.length];
  }

  function startStage() {
    currentWord = getCurrentWord();
    nextLetterIndex = 0;
    filledWord = currentWord.split('').map(() => null);
    letters = [];
    orbs = [];
    lasers = [];

    const wordLetters = currentWord.split('');
    const wrongCandidates = DECOY_LETTERS.split('').filter(ch => !currentWord.includes(ch));
    shuffleArray(wrongCandidates);
    const wrongLetters = wrongCandidates.slice(0, 5);

    for (const ch of wordLetters) {
      letters.push(createLetter(ch, true));
    }
    for (const ch of wrongLetters) {
      letters.push(createLetter(ch, false));
    }

    for (let i = 0; i < 3; i++) {
      orbs.push(createOrb());
    }

    shuffleArray(letters);

    wordFlashEl.textContent = currentWord;
    wordFlashEl.className = 'visible';
    wordFlashPhase = 'visible';
    wordFlashStartTime = performance.now();

    clearingShots = CLEARING_SHOTS_PER_STAGE;
    hintUsedThisStage = false;
    updateBlanksDisplay();
    updateClearingDisplay();
    updateVialsDisplay();
    updateHintButton();
  }

  function showWordAgain() {
    wordFlashEl.textContent = currentWord;
    wordFlashEl.classList.remove('fading');
    wordFlashEl.classList.add('visible');
    wordFlashPhase = 'visible';
    wordFlashStartTime = performance.now();
  }

  function updateHintButton() {
    if (!hintBtn) return;
    hintBtn.disabled = hintUsedThisStage;
    hintBtn.classList.toggle('used', hintUsedThisStage);
  }

  function createLetter(char, fromWord) {
    const margin = 60;
    return {
      char,
      x: margin + Math.random() * (width - 2 * margin),
      y: margin + Math.random() * (height * 0.5 - margin),
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 0.9,
      radius: 22,
      fromWord
    };
  }

  function createOrb() {
    const margin = 60;
    return {
      x: margin + Math.random() * (width - 2 * margin),
      y: margin + Math.random() * (height * 0.5 - margin),
      vx: (Math.random() - 0.5) * 1.4,
      vy: (Math.random() - 0.5) * 1.0,
      radius: 18
    };
  }

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function updateBlanksDisplay() {
    let html = '';
    for (let i = 0; i < currentWord.length; i++) {
      const ch = filledWord[i];
      const cls = ch != null ? 'filled' : 'empty';
      const display = ch != null ? ch : '＿';
      html += `<span class="${cls}">${display}</span>`;
    }
    blanksEl.innerHTML = html;
  }

  function updateClearingDisplay() {
    if (clearingCountEl) clearingCountEl.textContent = clearingShots;
  }

  function updateVialsDisplay() {
    vialsEl.forEach((vial, i) => {
      vial.classList.toggle('full', i < energy);
      vial.classList.toggle('empty', i >= energy);
    });
  }

  function showMessage(text, isCorrect, next) {
    messageText.textContent = text;
    messageOverlay.classList.remove('correct', 'wrong');
    messageOverlay.classList.add('visible', isCorrect ? 'correct' : 'wrong');
    messageOverlay.classList.add('active');
    messageBtn.onclick = () => {
      messageOverlay.classList.remove('visible', 'active');
      if (next) next();
    };
  }

  function checkStageComplete() {
    const allFilled = filledWord.every(ch => ch != null);
    if (!allFilled) return;

    const spelled = filledWord.join('');
    const correct = spelled === currentWord;

    if (correct) {
      showMessage('Correct! Stage complete.', true, () => {
        stageIndex++;
        startStage();
      });
    } else {
      energy--;
      updateVialsDisplay();
      if (energy <= 0) {
        showMessage('Wrong spelling! No energy left.', false, () => {
          messageOverlay.classList.remove('visible', 'active');
          if (gameContainer) gameContainer.classList.remove('playing');
          gameOverScreen.classList.add('visible');
        });
      } else {
        showMessage(`Wrong! You spelled "${spelled}". Lose one energy vial.`, false, () => {
          messageOverlay.classList.remove('visible', 'active');
          startStage();
        });
      }
    }
  }

  function updateWordFlash(now) {
    if (wordFlashPhase === 'hidden' || wordFlashPhase === 'done') return;
    const elapsed = (now - wordFlashStartTime) / 1000;
    if (wordFlashPhase === 'visible' && elapsed > 0.8) {
      wordFlashEl.classList.remove('visible');
      wordFlashEl.classList.add('fading');
      wordFlashPhase = 'fading';
      wordFlashStartTime = now;
    } else if (wordFlashPhase === 'fading' && elapsed >= 4) {
      wordFlashEl.classList.remove('fading');
      wordFlashPhase = 'done';
    }
  }

  function update(dt) {
    const now = performance.now();
    updateWordFlash(now);

    if (keys.left) ship.x = Math.max(ship.w / 2, ship.x - ship.speed);
    if (keys.right) ship.x = Math.min(width - ship.w / 2, ship.x + ship.speed);

    if ((keys.space || keys.fire) && now - lastShot > shotCooldown) {
      lastShot = now;
      keys.fire = false;
      lasers.push({
        x: ship.x,
        y: height - BOTTOM_HUD_HEIGHT - ship.h - 10,
        vy: -14,
        type: 'normal'
      });
    }
    if (keys.clear && clearingShots > 0 && now - lastClearShot > shotCooldown) {
      lastClearShot = now;
      keys.clear = false;
      clearingShots--;
      updateClearingDisplay();
      lasers.push({
        x: ship.x,
        y: height - BOTTOM_HUD_HEIGHT - ship.h - 10,
        vy: -14,
        type: 'clearing'
      });
    }

    for (let i = lasers.length - 1; i >= 0; i--) {
      const l = lasers[i];
      l.y += l.vy * (dt / 16);
      if (l.y < -20) {
        lasers.splice(i, 1);
        continue;
      }
      let hit = false;
      if (l.type === 'clearing') {
        for (let j = orbs.length - 1; j >= 0; j--) {
          const orb = orbs[j];
          const dx = l.x - orb.x;
          const dy = l.y - orb.y;
          if (dx * dx + dy * dy < (orb.radius + 4) ** 2) {
            orbs.splice(j, 1);
            lasers.splice(i, 1);
            hit = true;
            break;
          }
        }
        if (!hit) {
          for (let j = letters.length - 1; j >= 0; j--) {
            const letter = letters[j];
            const dx = l.x - letter.x;
            const dy = l.y - letter.y;
            if (dx * dx + dy * dy < (letter.radius + 4) ** 2) {
              const expected = currentWord[nextLetterIndex];
              if (letter.char === expected) {
                filledWord[nextLetterIndex] = letter.char;
                nextLetterIndex++;
                updateBlanksDisplay();
                checkStageComplete();
                energy--;
                updateVialsDisplay();
                if (energy <= 0) {
                  showMessage('Out of energy!', false, () => {
                    messageOverlay.classList.remove('visible', 'active');
                    if (gameContainer) gameContainer.classList.remove('playing');
                    gameOverScreen.classList.add('visible');
                  });
                }
              } else if (letter.fromWord) {
                letters.push(createLetter(letter.char, true));
              }
              letters.splice(j, 1);
              lasers.splice(i, 1);
              hit = true;
              break;
            }
          }
        }
      } else {
        for (let j = orbs.length - 1; j >= 0; j--) {
          const orb = orbs[j];
          const dx = l.x - orb.x;
          const dy = l.y - orb.y;
          if (dx * dx + dy * dy < (orb.radius + 4) ** 2) {
            if (energy < MAX_ENERGY) {
              energy = Math.min(MAX_ENERGY, energy + 1);
              updateVialsDisplay();
            }
            orbs.splice(j, 1);
            lasers.splice(i, 1);
            hit = true;
            break;
          }
        }
        if (!hit) {
          for (let j = letters.length - 1; j >= 0; j--) {
            const letter = letters[j];
            const dx = l.x - letter.x;
            const dy = l.y - letter.y;
            if (dx * dx + dy * dy < (letter.radius + 4) ** 2) {
              const expected = currentWord[nextLetterIndex];
              if (letter.char === expected) {
                filledWord[nextLetterIndex] = letter.char;
                nextLetterIndex++;
                updateBlanksDisplay();
                checkStageComplete();
              } else {
                energy--;
                updateVialsDisplay();
if (energy <= 0) {
                  showMessage('Out of energy!', false, () => {
                    messageOverlay.classList.remove('visible', 'active');
                    if (gameContainer) gameContainer.classList.remove('playing');
                    gameOverScreen.classList.add('visible');
                  });
                }
              if (letter.fromWord) {
                  letters.push(createLetter(letter.char, true));
                }
              }
              letters.splice(j, 1);
              lasers.splice(i, 1);
              break;
            }
          }
        }
      }
    }

    for (const orb of orbs) {
      orb.x += orb.vx * (dt / 16);
      orb.y += orb.vy * (dt / 16);
      if (orb.x < orb.radius || orb.x > width - orb.radius) orb.vx *= -1;
      if (orb.y < orb.radius + 40 || orb.y > height * 0.65) orb.vy *= -1;
    }

    for (const letter of letters) {
      letter.x += letter.vx * (dt / 16);
      letter.y += letter.vy * (dt / 16);
      if (letter.x < letter.radius || letter.x > width - letter.radius) letter.vx *= -1;
      if (letter.y < letter.radius + 40 || letter.y > height * 0.65) letter.vy *= -1;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (const orb of orbs) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 255, 120, 0.9)';
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    for (const letter of letters) {
      ctx.save();
      ctx.fillStyle = letter.fromWord ? 'rgba(100, 200, 255, 0.9)' : 'rgba(180, 140, 255, 0.85)';
      ctx.strokeStyle = letter.fromWord ? '#60a0ff' : '#a080e0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(letter.x, letter.y, letter.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px Orbitron, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(letter.char, letter.x, letter.y);
      ctx.restore();
    }

    for (const l of lasers) {
      if (l.type === 'clearing') {
        ctx.fillStyle = '#ffaa44';
        ctx.shadowColor = '#ff8800';
        ctx.shadowBlur = 12;
      } else {
        ctx.fillStyle = '#00ffcc';
        ctx.shadowColor = '#00ffcc';
        ctx.shadowBlur = 12;
      }
      ctx.fillRect(l.x - 2, l.y, 4, 16);
      ctx.shadowBlur = 0;
    }

    const sx = ship.x - ship.w / 2;
    const sy = height - BOTTOM_HUD_HEIGHT - ship.h - 20;
    ctx.save();
    ctx.fillStyle = '#4060a0';
    ctx.strokeStyle = '#80a0e0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx + ship.w / 2, sy);
    ctx.lineTo(sx + ship.w, sy + ship.h);
    ctx.lineTo(sx + ship.w / 2, sy + ship.h - 6);
    ctx.lineTo(sx, sy + ship.h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#00ccff';
    ctx.fillRect(sx + ship.w / 2 - 6, sy + 4, 12, 8);
    ctx.restore();
  }

  function loop(now) {
    const dt = Math.min(now - (loop.last || now), 64);
    loop.last = now;
    if (gameStarted) {
      update(dt);
      draw();
    }
    requestAnimationFrame(loop);
  }

  function startGame() {
    stageIndex = 0;
    energy = MAX_ENERGY;
    gameStarted = true;
    shuffledWords = WORDS.slice();
    shuffleArray(shuffledWords);
    startScreen.style.display = 'none';
    if (gameContainer) gameContainer.classList.add('playing');
    resize();
    ship.x = width / 2 - ship.w / 2;
    keys.space = false;
    keys.fire = false;
    keys.clear = false;
    startStage();
  }

  function restartGame() {
    gameOverScreen.classList.remove('visible');
    startGame();
  }

  window.addEventListener('resize', resize);

  document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'ArrowRight') keys.right = true;
    if (e.code === 'Space') {
      e.preventDefault();
      if (messageOverlay.classList.contains('visible')) {
        messageBtn.click();
        return;
      }
      if (gameOverScreen.classList.contains('visible')) {
        restartBtn.click();
        return;
      }
      if (getComputedStyle(startScreen).display !== 'none') {
        startBtn.click();
        return;
      }
      keys.space = true;
    }
    if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && !e.repeat) {
      e.preventDefault();
      keys.clear = true;
    }
  });
  document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'ArrowRight') keys.right = false;
    if (e.code === 'Space') keys.space = false;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keys.clear = false;
  });

  canvas.addEventListener('click', (e) => {
    if (!gameStarted) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = x * scaleX;
    const cy = y * scaleY;
    if (cy > height - BOTTOM_HUD_HEIGHT - ship.h - 40) keys.fire = true;
  });

  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', restartGame);

  if (hintBtn) {
    hintBtn.addEventListener('click', () => {
      if (!gameStarted || hintUsedThisStage) return;
      hintUsedThisStage = true;
      updateHintButton();
      showWordAgain();
    });
  }

  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    document.body.classList.add('touch-device');
  }

  function bindMobileButton(btn, keyName) {
    if (!btn) return;
    function setKey(v) {
      keys[keyName] = !!v;
    }
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      setKey(true);
    });
    btn.addEventListener('pointerup', (e) => {
      e.preventDefault();
      setKey(false);
    });
    btn.addEventListener('pointerleave', () => setKey(false));
    btn.addEventListener('pointercancel', () => setKey(false));
  }

  bindMobileButton(btnLeft, 'left');
  bindMobileButton(btnRight, 'right');
  bindMobileButton(btnFire, 'fire');
  bindMobileButton(btnClear, 'clear');

  resize();
  updateBlanksDisplay();
  updateClearingDisplay();
  updateVialsDisplay();
  requestAnimationFrame(loop);
})();

(function () {
  'use strict';

  const WORDS = [
    'NURSE', 'WORK', 'SHIRT', 'HURT', 'CHIRP', 'WORD', 'SERVE', 'CURLY',
    'DIRT', 'WORRY', 'TURN', 'STIR', 'FIRM', 'SKIRT', 'CHURNING', 'SWERVE',
    'SQUIRM', 'TWIRLING'
  ];

  let shuffledWords = [];

  const DECOY_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const SHIPS = [
    { id: 'default', name: 'Starter Ship', price: 0, img: 'spaceship.png?v=2' },
    { id: 'gallaga', name: 'Galaga Ship', price: 10, img: 'gallaga.png?v=2' },
    { id: 'millennium', name: 'Millennium Falcon', price: 30, img: 'millennium-falcon.png?v=2' },
    { id: 'optimus', name: 'Optimus Prime', price: 60, img: 'optimus-prime.png?v=2' }
  ];

  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const mothershipImg = new Image();
  mothershipImg.src = 'mothership.png?v=2';
  const playerShipImg = new Image();
  const blanksEl = document.getElementById('blanks');
  const shopOverlay = document.getElementById('shop-overlay');
  const shopShipsEl = document.getElementById('shop-ships');
  const shopScoinsCountEl = document.getElementById('shop-scoins-count');
  const shopCloseBtn = document.getElementById('shop-close-btn');
  const shopBtn = document.getElementById('shop-btn');
  const clearingCountEl = document.getElementById('clearing-count');
  const scoinsCountEl = document.getElementById('scoins-count');
  const vialsEl = document.querySelectorAll('.vial');
  const wordFlashEl = document.getElementById('word-flash');
  const messageOverlay = document.getElementById('message-overlay');
  const messageText = document.getElementById('message-text');
  const messageBtn = document.getElementById('message-btn');
  const splashScreen = document.getElementById('splash-screen');
  const splashContinueBtn = document.getElementById('splash-continue-btn');
  const startScreen = document.getElementById('start-screen');
  const startBtn = document.getElementById('start-btn');
  const gameOverScreen = document.getElementById('game-over-screen');
  const restartBtn = document.getElementById('restart-btn');
  const hintBtn = document.getElementById('hint-btn');
  const laserPathBtn = document.getElementById('laser-path-btn');
  const mothershipBadgeEl = document.getElementById('mothership-badge');
  const gameContainer = document.getElementById('game-container');
  const btnLeft = document.getElementById('btn-left');
  const btnRight = document.getElementById('btn-right');
  const btnFire = document.getElementById('btn-fire');
  const btnClear = document.getElementById('btn-clear');

  let width, height;
  let ship = { x: 0, w: 48, h: 32, speed: 4.5 };
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
  const BOTTOM_HUD_HEIGHT_TOUCH = 260;
  const MOBILE_LETTER_ORB_SCALE = 0.5;
  let effectiveBottomHudHeight = 56;
  let letterOrbScale = 1;
  let hintUsedThisStage = false;
  let showLaserPath = false;
  let sCoins = 0;
  const SCOINS_PER_STAGE = 20;
  let ownedShips = ['default'];
  let currentShipId = 'default';
  let currentWordInStage = 0;
  let wrongLettersThisStage = 0;
  let mothership = { y: -250, state: 'hidden', explodeTime: 0 };
  const MOTHERSHIP_FINAL_Y = 122;
  const MOTHERSHIP_SPEED = 2.5;
  const MAX_WRONG_LETTERS = 5;

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
    effectiveBottomHudHeight = document.body.classList.contains('touch-device')
      ? BOTTOM_HUD_HEIGHT_TOUCH
      : BOTTOM_HUD_HEIGHT;
    letterOrbScale = document.body.classList.contains('touch-device')
      ? MOBILE_LETTER_ORB_SCALE
      : 1;
    if (gameStarted && ship.x === 0) ship.x = width / 2 - ship.w / 2;
  }

  function getCurrentShip() {
    return SHIPS.find(s => s.id === currentShipId) || SHIPS[0];
  }

  function openShop() {
    if (shopOverlay) shopOverlay.classList.add('visible');
    if (shopScoinsCountEl) shopScoinsCountEl.textContent = sCoins;
    renderShop();
  }

  function closeShop() {
    if (shopOverlay) shopOverlay.classList.remove('visible');
  }

  function renderShop() {
    if (!shopShipsEl) return;
    shopShipsEl.innerHTML = '';
    SHIPS.forEach(s => {
      const owned = ownedShips.includes(s.id);
      const equipped = currentShipId === s.id;
      const canBuy = !owned && sCoins >= s.price;
      const card = document.createElement('div');
      card.className = 'shop-ship-card' + (equipped ? ' equipped' : '');
      const img = document.createElement('img');
      img.src = s.img;
      img.alt = s.name;
      const nameEl = document.createElement('div');
      nameEl.className = 'ship-name';
      nameEl.textContent = s.name;
      card.appendChild(img);
      card.appendChild(nameEl);
      if (!owned && s.price > 0) {
        const priceEl = document.createElement('div');
        priceEl.className = 'ship-price';
        priceEl.textContent = s.price + ' SCoins';
        card.appendChild(priceEl);
      }
      const action = document.createElement('button');
      action.type = 'button';
      action.className = 'ship-action';
      if (equipped) {
        action.textContent = 'Equipped';
        action.disabled = true;
      } else if (owned) {
        action.textContent = 'Equip';
        action.onclick = () => equipShip(s.id);
      } else {
        action.textContent = 'Buy';
        action.disabled = !canBuy;
        if (canBuy) action.onclick = () => buyShip(s.id);
      }
      card.appendChild(action);
      shopShipsEl.appendChild(card);
    });
  }

  function buyShip(id) {
    const s = SHIPS.find(ship => ship.id === id);
    if (!s || s.price === 0 || ownedShips.includes(id) || sCoins < s.price) return;
    sCoins -= s.price;
    ownedShips.push(id);
    updateSCoinsDisplay();
    if (shopScoinsCountEl) shopScoinsCountEl.textContent = sCoins;
    renderShop();
  }

  function equipShip(id) {
    if (!ownedShips.includes(id)) return;
    currentShipId = id;
    const s = getCurrentShip();
    playerShipImg.src = s.img;
    renderShop();
  }

  function getCurrentWord() {
    const idx = stageIndex * 2 + currentWordInStage;
    return shuffledWords[idx % shuffledWords.length];
  }

  function loadSecondWord() {
    currentWordInStage = 1;
    currentWord = getCurrentWord();
    nextLetterIndex = 0;
    filledWord = currentWord.split('').map(() => null);
    letters = [];
    orbs = [];
    lasers = [];
    hintUsedThisStage = false;
    updateHintButton();
    const wordLetters = currentWord.split('');
    const wrongCandidates = DECOY_LETTERS.split('').filter(ch => !currentWord.includes(ch));
    shuffleArray(wrongCandidates);
    const wrongLetters = wrongCandidates.slice(0, 5);
    for (const ch of wordLetters) letters.push(createLetter(ch, true));
    for (const ch of wrongLetters) letters.push(createLetter(ch, false));
    for (let i = 0; i < 3; i++) orbs.push(createOrb());
    ensureAllWordLettersPresent();
    shuffleArray(letters);
    wordFlashEl.textContent = currentWord;
    wordFlashEl.classList.remove('fading');
    wordFlashEl.classList.add('visible');
    wordFlashPhase = 'visible';
    wordFlashStartTime = performance.now();
    if (mothershipBadgeEl) mothershipBadgeEl.classList.add('visible');
    updateBlanksDisplay();
  }

  function triggerMothershipGameOver() {
    showMessage('The mothership destroyed your ship!', false, () => {
      messageOverlay.classList.remove('visible', 'active');
      if (gameContainer) gameContainer.classList.remove('playing');
      gameOverScreen.classList.add('visible');
    });
  }

  function startStage() {
    currentWordInStage = 0;
    wrongLettersThisStage = 0;
    mothership = { y: -250, state: 'hidden', explodeTime: 0 };
    currentWord = getCurrentWord();
    nextLetterIndex = 0;
    filledWord = currentWord.split('').map(() => null);
    letters = [];
    orbs = [];
    lasers = [];
    if (mothershipBadgeEl) mothershipBadgeEl.classList.remove('visible');

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

    ensureAllWordLettersPresent();
    shuffleArray(letters);

    wordFlashEl.textContent = currentWord;
    wordFlashEl.className = 'visible';
    wordFlashPhase = 'visible';
    wordFlashStartTime = performance.now();

    clearingShots = CLEARING_SHOTS_PER_STAGE;
    hintUsedThisStage = false;
    updateBlanksDisplay();
    updateClearingDisplay();
    updateSCoinsDisplay();
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
      radius: 22 * letterOrbScale,
      fromWord
    };
  }

  function ensureAllWordLettersPresent() {
    if (!currentWord) return;
    const required = {};
    for (let i = 0; i < currentWord.length; i++) {
      const c = currentWord[i];
      required[c] = (required[c] || 0) + 1;
    }
    const current = {};
    for (const l of letters) {
      if (l.fromWord) current[l.char] = (current[l.char] || 0) + 1;
    }
    let totalAdded = 0;
    const maxAdd = currentWord.length;
    for (const c of Object.keys(required)) {
      if (totalAdded >= maxAdd) break;
      const need = Math.max(0, Math.min(required[c] - (current[c] || 0), maxAdd - totalAdded));
      for (let i = 0; i < need; i++) {
        letters.push(createLetter(c, true));
        totalAdded++;
      }
    }
  }

  function createOrb() {
    const margin = 60;
    return {
      x: margin + Math.random() * (width - 2 * margin),
      y: margin + Math.random() * (height * 0.5 - margin),
      vx: (Math.random() - 0.5) * 1.4,
      vy: (Math.random() - 0.5) * 1.0,
      radius: 18 * letterOrbScale
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

  function updateSCoinsDisplay() {
    if (scoinsCountEl) scoinsCountEl.textContent = sCoins;
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
      if (currentWordInStage === 0) {
        mothership.state = 'flying_in';
        mothership.y = -250;
        loadSecondWord();
      } else {
        mothership.state = 'exploding';
        mothership.explodeTime = performance.now();
      }
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

    if (mothership.state === 'flying_in') {
      mothership.y += MOTHERSHIP_SPEED * (dt / 16);
      if (mothership.y >= MOTHERSHIP_FINAL_Y) {
        mothership.y = MOTHERSHIP_FINAL_Y;
        mothership.state = 'visible';
      }
    } else if (mothership.state === 'exploding') {
      const elapsed = (now - mothership.explodeTime) / 1000;
      if (elapsed >= 1.5) {
        mothership.state = 'hidden';
        sCoins += SCOINS_PER_STAGE;
        updateSCoinsDisplay();
        showMessage('Stage complete!', true, () => {
          stageIndex++;
          startStage();
        });
      }
    }

    if (keys.left) ship.x = Math.max(ship.w / 2, ship.x - ship.speed);
    if (keys.right) ship.x = Math.min(width - ship.w / 2, ship.x + ship.speed);

    if ((keys.space || keys.fire) && now - lastShot > shotCooldown) {
      lastShot = now;
      keys.fire = false;
      lasers.push({
        x: ship.x,
        y: height - effectiveBottomHudHeight - ship.h - 10,
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
        y: height - effectiveBottomHudHeight - ship.h - 10,
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
              } else {
                if (currentWordInStage === 1) {
                  wrongLettersThisStage++;
                  if (wrongLettersThisStage >= MAX_WRONG_LETTERS) triggerMothershipGameOver();
                }
                if (letter.fromWord) letters.push(createLetter(letter.char, true));
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
                if (currentWordInStage === 1) {
                  wrongLettersThisStage++;
                  if (wrongLettersThisStage >= MAX_WRONG_LETTERS) triggerMothershipGameOver();
                }
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

    if (mothership.state === 'flying_in' || mothership.state === 'visible') {
      const mx = width / 2;
      const mw = 280;
      const mh = 140;
      const barHeight = 8;
      const barWidth = mw + 20;
      const barY = mothership.y - barHeight - 4;
      const labelY = barY - 14;
      ctx.save();
      ctx.font = 'bold 14px Orbitron, monospace';
      ctx.fillStyle = '#cc2222';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Missed Letters: ' + wrongLettersThisStage + ' / 5', mx, labelY);
      if (mothershipImg.complete && mothershipImg.naturalWidth) {
        ctx.drawImage(mothershipImg, mx - mw / 2, mothership.y, mw, mh);
      } else {
        ctx.fillStyle = 'rgba(80, 40, 120, 0.95)';
        ctx.strokeStyle = '#a070e0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mx, mothership.y + mh - 8);
        ctx.lineTo(mx + mw / 2, mothership.y + mh);
        ctx.lineTo(mx + mw / 2 - 10, mothership.y + mh - 6);
        ctx.lineTo(mx, mothership.y + mh - 12);
        ctx.lineTo(mx - mw / 2 + 10, mothership.y + mh - 6);
        ctx.lineTo(mx - mw / 2, mothership.y + mh);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = '#302050';
      ctx.fillRect(mx - barWidth / 2, barY, barWidth, barHeight);
      ctx.fillStyle = '#cc2222';
      ctx.fillRect(mx - barWidth / 2, barY, barWidth * (wrongLettersThisStage / MAX_WRONG_LETTERS), barHeight);
      ctx.strokeStyle = '#882222';
      ctx.strokeRect(mx - barWidth / 2, barY, barWidth, barHeight);
      ctx.restore();
    } else if (mothership.state === 'exploding') {
      const elapsed = (performance.now() - mothership.explodeTime) / 1000;
      const radius = Math.min(150, elapsed * 120);
      const alpha = Math.max(0, 1 - elapsed / 1.2);
      ctx.save();
      ctx.fillStyle = `rgba(255, 180, 80, ${alpha * 0.8})`;
      ctx.beginPath();
      ctx.arc(width / 2, MOTHERSHIP_FINAL_Y + 70, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 100, 50, ${alpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(width / 2, MOTHERSHIP_FINAL_Y + 70, radius * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

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
      const ch = letter.char.toUpperCase();
      if (ch === 'O') {
        const r = letter.radius * 0.5;
        ctx.beginPath();
        ctx.arc(letter.x, letter.y, r * 0.85, 0, Math.PI * 2);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = Math.max(2.5, 3.5 * letterOrbScale);
        ctx.stroke();
      } else {
        ctx.font = 'bold ' + (24 * letterOrbScale) + 'px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(letter.char, letter.x, letter.y);
      }
      ctx.restore();
    }

    if (showLaserPath) {
      const pathY = height - effectiveBottomHudHeight - ship.h - 10;
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 255, 100, 0.6)';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#00ff66';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(ship.x, pathY);
      ctx.lineTo(ship.x, 0);
      ctx.stroke();
      ctx.shadowBlur = 0;
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
    const sy = height - effectiveBottomHudHeight - ship.h - 20;
    ctx.save();
    if (playerShipImg.complete && playerShipImg.naturalWidth) {
      const pw = 56;
      const ph = 48;
      ctx.drawImage(playerShipImg, ship.x - pw / 2, sy, pw, ph);
    } else {
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
    }
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
    sCoins = 0;
    gameStarted = true;
    playerShipImg.src = getCurrentShip().img;
    shuffledWords = WORDS.slice();
    shuffleArray(shuffledWords);
    startScreen.classList.remove('visible');
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
      if (startScreen.classList.contains('visible')) {
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
    if (document.body.classList.contains('touch-device')) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = x * scaleX;
    const cy = y * scaleY;
    if (cy > height - effectiveBottomHudHeight - ship.h - 40) keys.fire = true;
  });

  function dismissSplash() {
    if (splashScreen && splashScreen.classList.contains('hidden')) return;
    if (splashScreen) splashScreen.classList.add('hidden');
    if (startScreen) startScreen.classList.add('visible');
  }
  if (splashScreen) {
    splashScreen.addEventListener('click', dismissSplash);
  }
  if (splashContinueBtn) splashContinueBtn.addEventListener('click', (e) => { e.stopPropagation(); dismissSplash(); });
  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', restartGame);

  if (shopBtn) shopBtn.addEventListener('click', openShop);
  if (shopCloseBtn) shopCloseBtn.addEventListener('click', closeShop);

  if (hintBtn) {
    hintBtn.addEventListener('click', () => {
      if (!gameStarted || hintUsedThisStage) return;
      hintUsedThisStage = true;
      updateHintButton();
      showWordAgain();
    });
  }

  if (laserPathBtn) {
    laserPathBtn.addEventListener('click', () => {
      showLaserPath = !showLaserPath;
      laserPathBtn.classList.toggle('on', showLaserPath);
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
  updateSCoinsDisplay();
  updateVialsDisplay();
  playerShipImg.src = getCurrentShip().img;
  requestAnimationFrame(loop);
})();

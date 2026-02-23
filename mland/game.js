// Multiplication Land - RPG Math Game

const MONSTERS = [
  { id: 0, name: 'Woorm', baseHp: 15, imagePath: 'assets/monsters/Woorm.png' },
  { id: 1, name: 'Arfish', baseHp: 15, imagePath: 'assets/monsters/Arfish.png' },
  { id: 2, name: 'The Sohn', baseHp: 15, imagePath: 'assets/monsters/The_Sohn.png' },
  { id: 3, name: 'Lork', baseHp: 15, imagePath: 'assets/monsters/Lork.png' },
  { id: 4, name: 'Leafelegs', baseHp: 15, imagePath: 'assets/monsters/Leafelegs.png' },
  { id: 5, name: 'Shork', baseHp: 15, imagePath: 'assets/monsters/Shork.png' },
  { id: 6, name: 'Canonine', baseHp: 15, imagePath: 'assets/monsters/Canonine.png' },
];

const MONSTER_COUNT = MONSTERS.length;

const monsterImages = {};
MONSTERS.forEach(m => {
  const img = new Image();
  img.src = m.imagePath;
  monsterImages[m.id] = img;
});

function drawMonsterSprite(ctx, monster, width, height) {
  if (!monster || !monster.imagePath) return;
  const img = monsterImages[monster.id];
  if (img && img.complete && img.naturalWidth) {
    ctx.save();
    ctx.drawImage(img, 0, 0, width, height);
    ctx.restore();
  }
}

function getMonsterSpriteCanvas(monsterId, size) {
  const m = MONSTERS.find(x => x.id === monsterId);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  canvas.className = 'monster-pixel-sprite';
  const ctx = canvas.getContext('2d');
  if (m) drawMonsterSprite(ctx, m, size, size);
  return canvas;
}

const TILE_SIZE = 32;
const MAP_WIDTH = 20;
const MAP_HEIGHT = 15;
const ENCOUNTER_MIN_STEPS = 5;
const ENCOUNTER_MAX_STEPS = 12;
const PLAYER_MAX_HEALTH = 25;
const WRONG_ANSWER_DAMAGE = 5;
const ATTACK_METER_MAX = 60;
const METER_PER_CORRECT = 5;

const ATTACKS = [
  { id: 'magic-staff', name: 'Magic Staff', cost: 15, damage: 5, minLevel: 1 },
  { id: 'elemental-mix', name: 'Elemental Mix', cost: 20, damage: 10, minLevel: 2 },
  { id: 'spark-fury', name: 'Spark Fury', cost: 25, damage: 15, minLevel: 4 },
];

function rollNextEncounter() {
  return ENCOUNTER_MIN_STEPS + Math.floor(Math.random() * (ENCOUNTER_MAX_STEPS - ENCOUNTER_MIN_STEPS + 1));
}

// Terrain: 'grass' | 'tree' | 'river' | 'mountain'
function getTerrainMap() {
  const map = Array(MAP_HEIGHT).fill(null).map(() => Array(MAP_WIDTH).fill('grass'));
  // River - winds across the map (1–2 tiles wide)
  for (let x = 0; x < MAP_WIDTH; x++) {
    const riverY = 6 + Math.floor(Math.sin(x * 0.35) * 2);
    if (riverY >= 0 && riverY < MAP_HEIGHT) map[riverY][x] = 'river';
    if (riverY + 1 >= 0 && riverY + 1 < MAP_HEIGHT && Math.abs(Math.sin(x * 0.35)) > 0.5) {
      map[riverY + 1][x] = 'river';
    }
  }
  // Mountain - top right
  const mountainTiles = [
    [14,0],[15,0],[16,0],[17,0],[18,0],[19,0],
    [14,1],[15,1],[16,1],[17,1],[18,1],[19,1],
    [15,2],[16,2],[17,2],[18,2],[19,2],
    [16,3],[17,3],[18,3],
    [17,4],[18,4],
  ];
  mountainTiles.forEach(([x, y]) => { if (y < MAP_HEIGHT && x < MAP_WIDTH) map[y][x] = 'mountain'; });
  // Trees - scattered
  const treeCoords = [
    [2,1],[5,2],[8,1],[3,4],[7,8],[4,10],[11,2],[18,8],
    [1,7],[6,12],[13,4],[15,10],[9,11],[2,12],[10,0],[17,6],
  ];
  treeCoords.forEach(([x, y]) => {
    if (y < MAP_HEIGHT && x < MAP_WIDTH && map[y][x] === 'grass') map[y][x] = 'tree';
  });
  return map;
}

const TERRAIN_MAP = getTerrainMap();

function isWalkable(x, y) {
  if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return false;
  const tile = TERRAIN_MAP[y][x];
  return tile === 'grass' || tile === 'river' || tile === 'mountain';
}

const PLAYER_SPRITES = {
  boy: { wizard: '🧙', boat: '🚣', climb: '🧗' },
  girl: { wizard: '🧙‍♀️', boat: '🚣‍♀️', climb: '🧗‍♀️' },
};

let gameState = {
  mode: null,
  playerCharacter: 'boy',
  playerLevel: 1,
  playerAttack: 5,
  playerHealth: PLAYER_MAX_HEALTH,
  playerMaxHealth: PLAYER_MAX_HEALTH,
  caughtMonsters: [],
  playerX: 10,
  playerY: 10,
  steps: 0,
  stepsUntilEncounter: 0,
  problemsCorrect: 0,
  problemsTotal: 0,
  attackMeter: 0,
  currentBattle: null,
  inBattle: false,
};

const screens = {
  start: document.getElementById('start-screen'),
  overworld: document.getElementById('overworld-screen'),
  encounter: document.getElementById('battle-encounter-screen'),
  battle: document.getElementById('battle-screen'),
  levelUp: document.getElementById('level-up-screen'),
  gameOver: document.getElementById('game-over-screen'),
};

const LEVEL_UP_DURATION = 3000;
const ATTACK_EFFECT_DURATION = 2000;
const CONFETTI_COLORS = ['#f4d03f', '#f8b4d9', '#98eec9', '#e74c3c', '#3498db', '#9b59b6'];

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

function getBaseNumber() {
  return gameState.mode === 5 ? 5 : 6;
}

function generateProblem() {
  const base = getBaseNumber();
  const multiplier = Math.floor(Math.random() * 12) + 1;
  return { a: multiplier, b: base, answer: multiplier * base };
}

function generateWrongAnswers(correct) {
  const wrong = new Set();
  if (gameState.mode === 5) {
    let pool = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].filter(m => m !== correct);
    if (correct !== 5) pool = pool.filter(m => m !== 5);
    while (wrong.size < 3 && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      wrong.add(pool[idx]);
      pool.splice(idx, 1);
    }
    return [...wrong];
  }
  if (gameState.mode === 6) {
    let pool = [6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72].filter(m => m !== correct);
    if (correct !== 6) pool = pool.filter(m => m !== 6);
    while (wrong.size < 3 && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      wrong.add(pool[idx]);
      pool.splice(idx, 1);
    }
    return [...wrong];
  }
  while (wrong.size < 3) {
    const offset = (Math.floor(Math.random() * 7) - 3) * (Math.random() > 0.5 ? 1 : -1);
    const val = correct + offset;
    if (val > 0 && val !== correct) wrong.add(val);
  }
  return [...wrong];
}

function getRandomUncaughtMonster() {
  const uncaught = MONSTERS.filter(m => !gameState.caughtMonsters.includes(m.id));
  if (uncaught.length === 0) return null;
  return uncaught[Math.floor(Math.random() * uncaught.length)];
}

function startGame(mode) {
  const character = document.getElementById('char-boy').classList.contains('selected') ? 'boy' : 'girl';
  gameState = {
    mode,
    playerCharacter: character,
    playerLevel: 1,
    playerAttack: 5,
    playerHealth: PLAYER_MAX_HEALTH,
    playerMaxHealth: PLAYER_MAX_HEALTH,
    caughtMonsters: [],
    playerX: 10,
    playerY: 10,
    steps: 0,
    stepsUntilEncounter: rollNextEncounter(),
    problemsCorrect: 0,
    problemsTotal: 0,
    attackMeter: 0,
    currentBattle: null,
    inBattle: false,
  };
  screens.start.classList.add('hidden');
  screens.overworld.classList.remove('hidden');
  screens.encounter.classList.add('hidden');
  screens.battle.classList.add('hidden');
  screens.levelUp.classList.add('hidden');
  screens.gameOver.classList.add('hidden');
  updateHUD();
  drawOverworld();
  document.addEventListener('keydown', handleOverworldKey);
}

function updateHUD() {
  document.getElementById('player-level').textContent = gameState.playerLevel;
  document.getElementById('monsters-caught').textContent = gameState.caughtMonsters.length;
  const totalEl = document.getElementById('monsters-total');
  if (totalEl) totalEl.textContent = MONSTER_COUNT;
  updatePlayerHealthDisplay();
  updateMonsterInventory();
}

function updatePlayerHealthDisplay() {
  const pct = (gameState.playerHealth / gameState.playerMaxHealth) * 100;
  document.getElementById('player-health-bar').style.width = `${pct}%`;
  document.getElementById('player-health-text').textContent =
    `${gameState.playerHealth}/${gameState.playerMaxHealth}`;
  const battleBar = document.getElementById('battle-player-health-bar');
  const battleText = document.getElementById('battle-player-health-text');
  if (battleBar) battleBar.style.width = `${pct}%`;
  if (battleText) battleText.textContent = `${gameState.playerHealth}/${gameState.playerMaxHealth}`;
}

function fillMonsterInventorySlots(container) {
  if (!container) return;
  container.innerHTML = '';
  MONSTERS.forEach(m => {
    const caught = gameState.caughtMonsters.includes(m.id);
    const slot = document.createElement('div');
    slot.className = 'inventory-slot' + (caught ? ' caught' : '');
    const can = getMonsterSpriteCanvas(m.id, 40);
    slot.appendChild(can);
    const nameSpan = document.createElement('span');
    nameSpan.className = 'slot-name';
    nameSpan.textContent = m.name;
    slot.appendChild(nameSpan);
    container.appendChild(slot);
  });
}

function updateMonsterInventory() {
  fillMonsterInventorySlots(document.getElementById('inventory-slots'));
}

function updateBattleMonsterInventory() {
  fillMonsterInventorySlots(document.getElementById('battle-inventory-slots'));
}

function drawOverworld() {
  const offsetX = (canvas.width - MAP_WIDTH * TILE_SIZE) / 2;
  const offsetY = (canvas.height - MAP_HEIGHT * TILE_SIZE) / 2;

  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      const px = offsetX + x * TILE_SIZE;
      const py = offsetY + y * TILE_SIZE;
      const tile = TERRAIN_MAP[y][x];

      if (tile === 'grass') {
        const shade = (x + y) % 2 === 0 ? '#5d9b4a' : '#6aad54';
        ctx.fillStyle = shade;
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
      } else if (tile === 'river') {
        ctx.fillStyle = '#4a90d9';
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = 'rgba(135, 206, 250, 0.6)';
        ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
      } else if (tile === 'mountain') {
        ctx.fillStyle = '#6b5344';
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#2d1b4e';
        ctx.font = '24px Fredoka';
        ctx.textAlign = 'center';
        ctx.fillText('⛰', px + TILE_SIZE / 2, py + TILE_SIZE - 4);
      } else if (tile === 'tree') {
        ctx.fillStyle = (x + y) % 2 === 0 ? '#5d9b4a' : '#6aad54';
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        ctx.font = '24px Fredoka';
        ctx.textAlign = 'center';
        ctx.fillText('🌲', px + TILE_SIZE / 2, py + TILE_SIZE - 4);
      }
    }
  }

  ctx.font = '24px Fredoka';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#2d1b4e';
  const tile = TERRAIN_MAP[gameState.playerY][gameState.playerX];
  const sprites = PLAYER_SPRITES[gameState.playerCharacter] || PLAYER_SPRITES.boy;
  const playerSprite = tile === 'river' ? sprites.boat : tile === 'mountain' ? sprites.climb : sprites.wizard;
  ctx.fillText(playerSprite, offsetX + gameState.playerX * TILE_SIZE + TILE_SIZE / 2,
    offsetY + gameState.playerY * TILE_SIZE + TILE_SIZE - 4);
}

function tryMoveOverworld(dx, dy) {
  if (gameState.inBattle) return;
  if (dx === 0 && dy === 0) return;
  const nx = Math.max(0, Math.min(MAP_WIDTH - 1, gameState.playerX + dx));
  const ny = Math.max(0, Math.min(MAP_HEIGHT - 1, gameState.playerY + dy));
  if (!isWalkable(nx, ny)) return;
  gameState.playerX = nx;
  gameState.playerY = ny;
  gameState.steps++;
  gameState.stepsUntilEncounter--;

  if (gameState.caughtMonsters.length < MONSTER_COUNT && gameState.stepsUntilEncounter <= 0) {
    startBattle();
  } else {
    drawOverworld();
  }
}

function handleOverworldKey(e) {
  let dx = 0, dy = 0;
  if (['ArrowUp', 'KeyW'].includes(e.code)) dy = -1;
  if (['ArrowDown', 'KeyS'].includes(e.code)) dy = 1;
  if (['ArrowLeft', 'KeyA'].includes(e.code)) dx = -1;
  if (['ArrowRight', 'KeyD'].includes(e.code)) dx = 1;
  if (dx === 0 && dy === 0) return;

  e.preventDefault();
  tryMoveOverworld(dx, dy);
}

const BATTLE_ANIMATION_DURATION = 2000;

function startBattle() {
  const monster = getRandomUncaughtMonster();
  if (!monster) {
    drawOverworld();
    return;
  }

  gameState.inBattle = true;
  document.removeEventListener('keydown', handleOverworldKey);

  gameState.currentBattle = {
    monster: { ...monster },
    currentHp: monster.baseHp,
    maxHp: monster.baseHp,
    problem: generateProblem(),
    waitingForAttackChoice: false,
  };

  document.getElementById('encounter-monster-name').textContent = monster.name;
  const encCanvas = document.getElementById('encounter-monster-canvas');
  const encCtx = encCanvas.getContext('2d');
  encCtx.clearRect(0, 0, encCanvas.width, encCanvas.height);
  drawMonsterSprite(encCtx, monster, encCanvas.width, encCanvas.height);

  screens.encounter.classList.remove('hidden');

  setTimeout(() => {
    screens.encounter.classList.add('hidden');
    screens.overworld.classList.add('hidden');
    screens.battle.classList.remove('hidden');
    renderBattle();
  }, BATTLE_ANIMATION_DURATION);
}

function updateAttackMeterDisplay() {
  const pct = (gameState.attackMeter / ATTACK_METER_MAX) * 100;
  document.getElementById('attack-meter-bar').style.width = `${pct}%`;
  document.getElementById('attack-meter-text').textContent =
    `${gameState.attackMeter}/${ATTACK_METER_MAX}`;
}

function renderAttackButtons() {
  const panel = document.getElementById('attack-buttons-panel');
  const container = document.getElementById('attack-buttons');
  container.innerHTML = '';
  ATTACKS.forEach(a => {
    if (gameState.playerLevel < a.minLevel) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'attack-btn';
    btn.textContent = `${a.name} (${a.cost}) → ${a.damage} dmg`;
    btn.disabled = gameState.attackMeter < a.cost;
    btn.onclick = () => handleAttack(a.id);
    container.appendChild(btn);
  });
  panel.classList.toggle('hidden', !gameState.currentBattle.waitingForAttackChoice);
  const nextBtn = document.getElementById('next-problem-btn');
  if (nextBtn) nextBtn.disabled = gameState.attackMeter >= ATTACK_METER_MAX;
}

function renderBattle() {
  const b = gameState.currentBattle;
  const spriteCanvas = document.getElementById('monster-sprite-canvas');
  const spriteCtx = spriteCanvas.getContext('2d');
  spriteCtx.clearRect(0, 0, spriteCanvas.width, spriteCanvas.height);
  drawMonsterSprite(spriteCtx, b.monster, spriteCanvas.width, spriteCanvas.height);
  document.getElementById('monster-name').textContent = b.monster.name;
  updateBattleMonsterInventory();
  document.getElementById('monster-health-bar').style.width =
    `${(b.currentHp / b.maxHp) * 100}%`;
  document.getElementById('monster-health-text').textContent =
    `HP: ${b.currentHp}/${b.maxHp}`;
  updatePlayerHealthDisplay();
  updateAttackMeterDisplay();

  document.getElementById('problem-text').textContent =
    `${b.problem.a} × ${b.problem.b} = ?`;

  const answerInput = document.getElementById('answer-input');
  const answerForm = document.getElementById('answer-form');
  const submitBtn = document.getElementById('answer-submit-btn');
  if (answerInput) {
    answerInput.value = '';
    answerInput.disabled = false;
    answerInput.focus();
  }
  if (submitBtn) submitBtn.disabled = false;

  answerForm?.removeEventListener('submit', handleAnswerSubmit);
  answerForm?.addEventListener('submit', handleAnswerSubmit);

  document.getElementById('feedback-text').textContent = '';
  document.getElementById('feedback-text').className = 'feedback';
  document.getElementById('attack-buttons-panel').classList.add('hidden');
}

function handleAnswerSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('answer-input');
  const raw = input?.value?.trim();
  const answer = raw === '' ? NaN : parseInt(raw, 10);
  if (isNaN(answer)) return;
  handleAnswer(answer);
}

function handleAnswer(answer) {
  const b = gameState.currentBattle;
  const answerInput = document.getElementById('answer-input');
  const submitBtn = document.getElementById('answer-submit-btn');
  if (answerInput) answerInput.disabled = true;
  if (submitBtn) submitBtn.disabled = true;

  gameState.problemsTotal++;

  const feedback = document.getElementById('feedback-text');
  if (answer === b.problem.answer) {
    gameState.problemsCorrect++;
    gameState.attackMeter = Math.min(ATTACK_METER_MAX, gameState.attackMeter + METER_PER_CORRECT);
    feedback.textContent = `Correct! +${METER_PER_CORRECT} attack energy!`;
    feedback.className = 'feedback correct';
    updateAttackMeterDisplay();

    if (gameState.attackMeter >= 15) {
      b.waitingForAttackChoice = true;
      renderAttackButtons();
      const nextBtn = document.getElementById('next-problem-btn');
      nextBtn.removeEventListener('click', goToNextProblem);
      nextBtn.addEventListener('click', goToNextProblem);
    } else {
      setTimeout(nextProblem, 1200);
    }
  } else {
    gameState.playerHealth = Math.max(0, gameState.playerHealth - WRONG_ANSWER_DAMAGE);
    updatePlayerHealthDisplay();
    feedback.textContent = `Wrong! -${WRONG_ANSWER_DAMAGE} HP`;

    if (gameState.playerHealth <= 0) {
      feedback.className = 'feedback incorrect';
      setTimeout(() => gameOver(false), 1200);
    } else {
      feedback.className = 'feedback incorrect';
      setTimeout(() => {
        if (answerInput) {
          answerInput.value = '';
          answerInput.disabled = false;
          answerInput.focus();
        }
        if (submitBtn) submitBtn.disabled = false;
        feedback.textContent = '';
      }, 1000);
    }
  }
}

function runAttackEffect(attackId, onComplete) {
  const overlay = document.getElementById('attack-effect-overlay');
  const content = document.getElementById('attack-effect-content');
  overlay.className = 'attack-effect-overlay';
  content.innerHTML = '';

  if (attackId === 'magic-staff') {
    overlay.classList.add('attack-effect-magic-staff');
    const staff = document.createElement('div');
    staff.className = 'staff';
    staff.textContent = '🪄';
    content.appendChild(staff);
    for (let i = 0; i < 16; i++) {
      const s = document.createElement('span');
      s.className = 'sparkle';
      s.textContent = '✨';
      s.style.left = (20 + Math.random() * 60) + '%';
      s.style.top = (20 + Math.random() * 60) + '%';
      s.style.animationDelay = (Math.random() * 0.6) + 's';
      content.appendChild(s);
    }
  } else if (attackId === 'elemental-mix') {
    overlay.classList.add('attack-effect-elemental-mix');
    const tornado = document.createElement('div');
    tornado.className = 'tornado';
    const inner = document.createElement('div');
    inner.className = 'tornado-inner';
    ['🔥', '💧', '❄️', '🌍'].forEach(sym => {
      const e = document.createElement('span');
      e.className = 'element';
      e.textContent = sym;
      inner.appendChild(e);
    });
    tornado.appendChild(inner);
    content.appendChild(tornado);
  } else if (attackId === 'spark-fury') {
    overlay.classList.add('attack-effect-spark-fury');
    const sparkles = ['✨', '✦', '✧', '⭐', '✴'];
    const count = 120;
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.className = 'spark-fury-sparkle';
      s.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
      s.style.left = Math.random() * 100 + '%';
      s.style.top = Math.random() * 100 + '%';
      s.style.fontSize = (14 + Math.random() * 24) + 'px';
      s.style.animationDelay = (Math.random() * 0.9) + 's';
      content.appendChild(s);
    }
  }

  overlay.classList.remove('hidden');

  setTimeout(() => {
    overlay.classList.add('hidden');
    overlay.className = 'attack-effect-overlay hidden';
    content.innerHTML = '';
    onComplete();
  }, ATTACK_EFFECT_DURATION);
}

function handleAttack(attackId) {
  const b = gameState.currentBattle;
  const attack = ATTACKS.find(a => a.id === attackId);
  if (!attack || gameState.attackMeter < attack.cost || gameState.playerLevel < attack.minLevel) return;

  gameState.attackMeter -= attack.cost;
  b.currentHp = Math.max(0, b.currentHp - attack.damage);
  b.waitingForAttackChoice = false;
  document.getElementById('attack-buttons-panel').classList.add('hidden');

  updateAttackMeterDisplay();
  document.getElementById('monster-health-bar').style.width =
    `${(b.currentHp / b.maxHp) * 100}%`;
  document.getElementById('monster-health-text').textContent =
    `HP: ${b.currentHp}/${b.maxHp}`;
  document.getElementById('feedback-text').textContent =
    `${attack.name}! -${attack.damage} damage!`;
  document.getElementById('feedback-text').className = 'feedback correct';

  runAttackEffect(attackId, () => {
    const haloEl = document.getElementById('monster-halo');
    if (haloEl) {
      haloEl.classList.remove('burst');
      haloEl.offsetHeight;
      haloEl.classList.add('burst');
      setTimeout(() => haloEl.classList.remove('burst'), 650);
    }

    if (b.currentHp <= 0) {
      setTimeout(catchMonster, 800);
    } else {
      setTimeout(nextProblem, 1200);
    }
  });
}

function goToNextProblem() {
  const b = gameState.currentBattle;
  if (!b || !b.waitingForAttackChoice) return;
  if (gameState.attackMeter >= ATTACK_METER_MAX) return;
  document.getElementById('next-problem-btn').removeEventListener('click', goToNextProblem);
  b.waitingForAttackChoice = false;
  document.getElementById('attack-buttons-panel').classList.add('hidden');
  nextProblem();
}

function nextProblem() {
  gameState.currentBattle.problem = generateProblem();
  gameState.currentBattle.waitingForAttackChoice = false;
  renderBattle();
}

function runConfetti() {
  const container = document.getElementById('level-up-confetti');
  container.innerHTML = '';
  const count = 55;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    piece.style.animationDelay = Math.random() * 0.4 + 's';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    container.appendChild(piece);
  }
}

function showLevelUp(monster, newLevel, onComplete) {
  document.getElementById('level-up-new-level').textContent = newLevel;
  document.getElementById('level-up-monster-name').textContent = monster.name;

  const canvas = document.getElementById('level-up-monster-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMonsterSprite(ctx, monster, canvas.width, canvas.height);
  }

  const unlockedAttack = ATTACKS.find(a => a.minLevel === newLevel);
  const newMoveEl = document.getElementById('level-up-new-move');
  if (unlockedAttack) {
    newMoveEl.textContent = `New attack: ${unlockedAttack.name}! (${unlockedAttack.cost} energy → ${unlockedAttack.damage} damage)`;
    newMoveEl.classList.remove('hidden');
  } else {
    newMoveEl.textContent = '';
    newMoveEl.classList.add('hidden');
  }

  const continueBtn = document.getElementById('level-up-continue-btn');
  continueBtn.onclick = () => {
    screens.levelUp.classList.add('hidden');
    onComplete();
  };

  screens.levelUp.classList.remove('hidden');
  runConfetti();
}

function catchMonster() {
  const b = gameState.currentBattle;
  gameState.caughtMonsters.push(b.monster.id);
  gameState.playerLevel++;
  gameState.playerAttack = 4 + gameState.playerLevel;

  screens.battle.classList.add('hidden');
  gameState.inBattle = false;

  const newLevel = gameState.playerLevel;

  showLevelUp(b.monster, newLevel, () => {
    if (gameState.caughtMonsters.length >= MONSTER_COUNT) {
      showGameOver(true);
    } else {
      gameState.stepsUntilEncounter = rollNextEncounter();
      screens.overworld.classList.remove('hidden');
      updateHUD();
      drawOverworld();
      document.addEventListener('keydown', handleOverworldKey);
    }
  });
}

function gameOver(won) {
  screens.battle.classList.add('hidden');
  screens.encounter.classList.add('hidden');
  gameState.inBattle = false;
  showGameOver(won);
}

function showGameOver(won) {
  screens.overworld.classList.add('hidden');
  screens.gameOver.classList.remove('hidden');
  screens.gameOver.classList.toggle('lost', !won);

  document.getElementById('game-over-title').textContent = won
    ? "🎉 You've Caught Them All! 🎉"
    : "💔 Game Over 💔";
  document.getElementById('game-over-msg').textContent = won
    ? "Congratulations! You collected all 5 monsters from Multiplication Land!"
    : "You ran out of health! Keep practicing your multiplication to catch them all next time.";
  document.getElementById('problems-stats').textContent = gameState.problemsCorrect;
  document.getElementById('problems-total').textContent = gameState.problemsTotal;
  document.getElementById('game-over-level').textContent = gameState.playerLevel;

  const display = document.getElementById('game-over-monsters');
  display.innerHTML = '';
  gameState.caughtMonsters.forEach(id => {
    const m = MONSTERS.find(x => x.id === id);
    const el = document.createElement('div');
    el.className = 'caught-monster-badge';
    const can = getMonsterSpriteCanvas(id, 48);
    el.appendChild(can);
    const nameEl = document.createElement('small');
    nameEl.textContent = m.name;
    el.appendChild(nameEl);
    display.appendChild(el);
  });

  document.getElementById('play-again-btn').onclick = () => {
    screens.gameOver.classList.add('hidden');
    screens.start.classList.remove('hidden');
  };
}

function setCharacter(character) {
  const boyBtn = document.getElementById('char-boy');
  const girlBtn = document.getElementById('char-girl');
  if (character === 'boy') {
    boyBtn.classList.add('selected');
    boyBtn.setAttribute('aria-pressed', 'true');
    girlBtn.classList.remove('selected');
    girlBtn.setAttribute('aria-pressed', 'false');
  } else {
    girlBtn.classList.add('selected');
    girlBtn.setAttribute('aria-pressed', 'true');
    boyBtn.classList.remove('selected');
    boyBtn.setAttribute('aria-pressed', 'false');
  }
}

document.getElementById('char-boy').onclick = () => setCharacter('boy');
document.getElementById('char-girl').onclick = () => setCharacter('girl');
document.getElementById('mode-5').onclick = () => startGame(5);
document.getElementById('mode-6').onclick = () => startGame(6);

const isTouchDevice = 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
if (isTouchDevice) {
  const dpad = document.getElementById('dpad-container');
  const hint = document.getElementById('controls-hint');
  if (dpad) dpad.classList.remove('hidden');
  if (hint) hint.textContent = 'Tap the D-pad or use Arrow Keys / WASD to move';
  let lastDpadMove = { el: null, t: 0 };
  function handleDpadMove(e) {
    const dx = parseInt(this.dataset.dx || '0', 10);
    const dy = parseInt(this.dataset.dy || '0', 10);
    if (this.classList.contains('dpad-center')) return;
    if (e.type === 'click' && lastDpadMove.el === this && Date.now() - lastDpadMove.t < 400) return;
    lastDpadMove.el = this;
    lastDpadMove.t = Date.now();
    if (e.type === 'touchend') e.preventDefault();
    tryMoveOverworld(dx, dy);
  }
  document.querySelectorAll('.dpad-btn').forEach(btn => {
    btn.addEventListener('touchend', handleDpadMove, { passive: false });
    btn.addEventListener('click', handleDpadMove);
  });
}

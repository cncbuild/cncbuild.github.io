// Multiplication Land - RPG Math Game

const MONSTERS = [
  { id: 0, name: 'Woorm', baseHp: 15, imagePath: 'assets/monsters/Woorm.png' },
  { id: 1, name: 'Arfish', baseHp: 15, imagePath: 'assets/monsters/Arfish.png' },
  { id: 2, name: 'The Sohn', baseHp: 15, imagePath: 'assets/monsters/The_Sohn.png' },
  { id: 3, name: 'Lork', baseHp: 15, imagePath: 'assets/monsters/Lork.png' },
  { id: 4, name: 'Leafelegs', baseHp: 15, imagePath: 'assets/monsters/Leafelegs.png' },
  { id: 5, name: 'Shork', baseHp: 15, imagePath: 'assets/monsters/Shork.png' },
  { id: 6, name: 'Canonine', baseHp: 15, imagePath: 'assets/monsters/Canonine.png' },
  { id: 7, name: 'Golden Sohn', baseHp: 50, imagePath: 'assets/monsters/Golden-Sohn.png' },
  { id: 8, name: 'Shadeek', baseHp: 50, imagePath: 'assets/monsters/Shadeek.png' },
  { id: 9, name: 'Super Arfish', baseHp: 50, imagePath: 'assets/monsters/Super-Arfish.png' },
  { id: 10, name: 'Dynost', baseHp: 50, imagePath: 'assets/monsters/Dynost.png' },
  { id: 11, name: 'Bandihoot', baseHp: 50, imagePath: 'assets/kalaar/Bandihoot.png' },
  { id: 12, name: 'Calloon', baseHp: 15, imagePath: 'assets/kalaar/Calloon.png' },
  { id: 13, name: 'Golden Woorm', baseHp: 30, imagePath: 'assets/monsters/Woorm.png', goldenForm: true },
  { id: 14, name: 'Golden Arfish', baseHp: 30, imagePath: 'assets/monsters/Arfish.png', goldenForm: true },
  { id: 15, name: 'Golden The Sohn', baseHp: 30, imagePath: 'assets/monsters/The_Sohn.png', goldenForm: true },
  { id: 16, name: 'Golden Lork', baseHp: 30, imagePath: 'assets/monsters/Lork.png', goldenForm: true },
  { id: 17, name: 'Golden Leafelegs', baseHp: 30, imagePath: 'assets/monsters/Leafelegs.png', goldenForm: true },
  { id: 18, name: 'Golden Shork', baseHp: 30, imagePath: 'assets/monsters/Shork.png', goldenForm: true },
  { id: 19, name: 'Golden Canonine', baseHp: 30, imagePath: 'assets/monsters/Canonine.png', goldenForm: true },
  { id: 20, name: 'Ultra Sohn', baseHp: 80, imagePath: 'assets/monsters/Golden-Sohn.png', ultraBoss: true },
];

const MONSTER_COUNT = MONSTERS.length;
const PRE_GOLDEN_LEAGUE_MONSTER_COUNT = 13;
const GOLDEN_FORM_MONSTER_IDS = [13, 14, 15, 16, 17, 18, 19];
const ULTRA_SOHN_ID = 20;
const ORIGINAL_MONSTER_COUNT = 7;
const THE_SOHN_ID = 2;
/** Original monsters that must be caught before The Sohn can appear */
const ORIGINAL_IDS_BEFORE_SOHN = [0, 1, 3, 4, 5, 6];
const GOLDEN_SOHN_ID = 7;
const BANDIHOOT_ID = 11;
/** Top-left of Bandihoot's 2×2 footprint (4 squares) */
const BANDIHOOT_SIZE = 2;
const CALLOON_ID = 12;
/** Random encounters in Kalaar only (not Bandihoot — he is chased on the map) */
const KALAAR_ONLY_MONSTER_IDS = [CALLOON_ID];
const BANDIHOOT_MOVE_INTERVAL_MS = 850;
/** Shadeek, Super Arfish, Dynost — must be caught before Golden Sohn can appear */
const MEGA_MONSTERS_BEFORE_GOLDEN_IDS = [8, 9, 10];

const monsterImages = {};
MONSTERS.forEach(m => {
  const img = new Image();
  img.src = m.imagePath;
  monsterImages[m.id] = img;
});

function drawMonsterSprite(ctx, monster, width, height) {
  if (!monster || !monster.imagePath) return;
  const img = monsterImages[monster.id];
  if (!img || !img.complete || !img.naturalWidth) return;

  ctx.save();
  if (monster.goldenForm || monster.ultraBoss) {
    const pulse = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(Date.now() / (monster.ultraBoss ? 260 : 320)));
    const cx = width / 2;
    const cy = height / 2;
    const glowR = Math.max(width, height) * (monster.ultraBoss ? 0.72 : 0.58);
    const grad = ctx.createRadialGradient(cx, cy, glowR * 0.08, cx, cy, glowR);
    grad.addColorStop(0, `rgba(255, 230, 120, ${(monster.ultraBoss ? 0.9 : 0.75) * pulse})`);
    grad.addColorStop(0.45, `rgba(244, 208, 63, ${(monster.ultraBoss ? 0.6 : 0.45) * pulse})`);
    grad.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.shadowColor = '#f4d03f';
    ctx.shadowBlur = (monster.ultraBoss ? 22 : 14) + (monster.ultraBoss ? 14 : 10) * pulse;
    const inset = monster.ultraBoss ? width * 0.06 : 0;
    const drawW = width - inset * 2;
    const drawH = height - inset * 2;
    ctx.drawImage(img, inset, inset, drawW, drawH);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(255, 215, 0, ${(monster.ultraBoss ? 1 : 0.85) * pulse})`;
    ctx.lineWidth = Math.max(2, width / (monster.ultraBoss ? 16 : 24));
    ctx.strokeRect(inset + 1, inset + 1, drawW - 2, drawH - 2);
  } else {
    ctx.drawImage(img, 0, 0, width, height);
  }
  ctx.restore();
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
const WRONG_ANSWER_REVEAL_MS = 3200;
const HEAL_AFTER_CATCH = 10;
const ATTACK_METER_MAX = 60;
const METER_PER_CORRECT = 5;

const ATTACKS = [
  { id: 'magic-staff', name: 'Magic Staff', cost: 15, damage: 5, minLevel: 1 },
  { id: 'elemental-mix', name: 'Elemental Mix', cost: 20, damage: 10, minLevel: 2 },
  { id: 'spark-fury', name: 'Spark Fury', cost: 25, damage: 15, minLevel: 4 },
];

const STAR_ATTACKS = [
  { id: 'sharp-stars', name: 'Sharp Stars', cost: 20, damage: 12, starOnly: true },
  { id: 'handcuffs', name: 'Handcuffs', cost: 25, damage: 14, starOnly: true },
  { id: 'rage', name: 'Rage', cost: 30, damage: 18, starOnly: true },
];

/** Top-left tile of Alex's 2×2 footprint (4 squares) */
const KALAAR_ALEX_POS = { x: 2, y: 12 };
const KALAAR_ALEX_SIZE = 2;
const KALAAR_NPC_IMAGES = {
  alex: 'assets/kalaar/Alex.png',
  sharkoon: 'assets/kalaar/Sharkoon.png',
};

const KALAAR_ALEX_DIALOG_LINES = [
  { speaker: 'Alex', portrait: 'alex', text: 'Please help me!' },
  { speaker: 'Alex', portrait: 'alex', text: 'Bandihoot keeps on bothering us & stealing coins!' },
  { speaker: 'Sharkoon', portrait: 'sharkoon', text: 'Here, Wizard. I can help you.' },
  { speaker: 'Sharkoon', portrait: 'sharkoon', text: 'I have added a star to your fighting screen.' },
  { speaker: 'Sharkoon', portrait: 'sharkoon', text: 'When you click on it, you gain 3 new moves.' },
  { speaker: 'Sharkoon', portrait: 'sharkoon', text: 'Sharp Stars! Handcuffs! Rage!' },
];

const kalaarNpcImages = {};
Object.entries(KALAAR_NPC_IMAGES).forEach(([key, path]) => {
  const img = new Image();
  img.src = path;
  kalaarNpcImages[key] = img;
});

function rollNextEncounter() {
  return ENCOUNTER_MIN_STEPS + Math.floor(Math.random() * (ENCOUNTER_MAX_STEPS - ENCOUNTER_MIN_STEPS + 1));
}

const MAP_IDS = { MAIN: 'main', KALAAR: 'kalaar', GOLDA: 'golda' };
const ZONE_TITLE_DURATION_MS = 3400;

// Terrain: grass | tree | river | mountain | bridge | bridge-exit | street | building | plaza | bridge-west-exit
function getMainTerrainMap() {
  const map = Array(MAP_HEIGHT).fill(null).map(() => Array(MAP_WIDTH).fill('grass'));
  for (let x = 0; x < MAP_WIDTH; x++) {
    const riverY = 6 + Math.floor(Math.sin(x * 0.35) * 2);
    if (riverY >= 0 && riverY < MAP_HEIGHT) map[riverY][x] = 'river';
    if (riverY + 1 >= 0 && riverY + 1 < MAP_HEIGHT && Math.abs(Math.sin(x * 0.35)) > 0.5) {
      map[riverY + 1][x] = 'river';
    }
  }
  const mountainTiles = [
    [14,0],[15,0],[16,0],[17,0],[18,0],[19,0],
    [14,1],[15,1],[16,1],[17,1],[18,1],[19,1],
    [15,2],[16,2],[17,2],[18,2],[19,2],
    [16,3],[17,3],[18,3],
    [17,4],[18,4],
  ];
  mountainTiles.forEach(([x, y]) => { if (y < MAP_HEIGHT && x < MAP_WIDTH) map[y][x] = 'mountain'; });
  const treeCoords = [
    [2,1],[5,2],[8,1],[3,4],[7,8],[4,10],[11,2],
    [1,7],[6,12],[13,4],[15,10],[9,11],[2,12],[10,0],[17,6],
  ];
  treeCoords.forEach(([x, y]) => {
    if (y < MAP_HEIGHT && x < MAP_WIDTH && map[y][x] === 'grass') map[y][x] = 'tree';
  });
  for (let y = 6; y <= 10; y++) {
    map[y][18] = 'bridge';
    map[y][19] = y === 8 ? 'bridge-exit' : 'bridge';
  }
  map[0][10] = 'golda-bridge-exit';
  map[1][10] = 'golda-bridge';
  return map;
}

function getGoldaTerrainMap() {
  const map = Array(MAP_HEIGHT).fill(null).map(() => Array(MAP_WIDTH).fill('gold-grass'));
  for (let x = 0; x < MAP_WIDTH; x++) {
    const riverY = 6 + Math.floor(Math.sin(x * 0.35) * 2);
    if (riverY >= 0 && riverY < MAP_HEIGHT) map[riverY][x] = 'gold-river';
    if (riverY + 1 >= 0 && riverY + 1 < MAP_HEIGHT && Math.abs(Math.sin(x * 0.35)) > 0.5) {
      map[riverY + 1][x] = 'gold-river';
    }
  }
  const mountainTiles = [
    [14,0],[15,0],[16,0],[17,0],[18,0],[19,0],
    [14,1],[15,1],[16,1],[17,1],[18,1],[19,1],
    [15,2],[16,2],[17,2],[18,2],[19,2],
    [16,3],[17,3],[18,3],
    [17,4],[18,4],
  ];
  mountainTiles.forEach(([x, y]) => { if (y < MAP_HEIGHT && x < MAP_WIDTH) map[y][x] = 'gold-mountain'; });
  const treeCoords = [
    [2,1],[5,2],[8,1],[3,4],[7,8],[4,10],[11,2],
    [1,7],[6,12],[13,4],[15,10],[9,11],[2,12],[10,0],[17,6],
  ];
  treeCoords.forEach(([x, y]) => {
    if (y < MAP_HEIGHT && x < MAP_WIDTH && map[y][x] === 'gold-grass') map[y][x] = 'gold-tree';
  });
  for (let y = 6; y <= 10; y++) {
    map[y][0] = y === 8 ? 'golda-bridge-west-exit' : 'golda-bridge';
    map[y][1] = 'gold-grass';
  }
  return map;
}

function getKalaarTerrainMap() {
  const map = Array(MAP_HEIGHT).fill(null).map(() => Array(MAP_WIDTH).fill('building'));
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      if (x % 4 === 1 || x % 4 === 2 || y % 3 === 1) {
        map[y][x] = 'street';
      }
    }
  }
  const plazas = [
    [5,4],[5,5],[6,4],[6,5],[13,9],[13,10],[14,9],[14,10],
    [9,7],[10,7],[9,8],[10,8],
  ];
  plazas.forEach(([x, y]) => { map[y][x] = 'plaza'; });
  for (let y = 6; y <= 10; y++) {
    map[y][0] = y === 8 ? 'bridge-west-exit' : 'bridge';
    map[y][1] = 'street';
  }
  map[7][2] = 'street';
  map[8][2] = 'street';
  map[7][3] = 'plaza';
  map[8][3] = 'plaza';
  map[12][1] = 'street';
  map[12][2] = 'plaza';
  map[12][3] = 'plaza';
  map[13][1] = 'plaza';
  map[13][2] = 'plaza';
  map[13][3] = 'plaza';
  map[13][4] = 'street';
  map[14][1] = 'plaza';
  map[14][2] = 'street';
  return map;
}

const TERRAIN_MAPS = {
  [MAP_IDS.MAIN]: getMainTerrainMap(),
  [MAP_IDS.KALAAR]: getKalaarTerrainMap(),
  [MAP_IDS.GOLDA]: getGoldaTerrainMap(),
};

function getActiveTerrainMap() {
  return TERRAIN_MAPS[gameState.currentMap || MAP_IDS.MAIN];
}

function isWalkable(x, y) {
  if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return false;
  const tile = getActiveTerrainMap()[y][x];
  if (gameState.currentMap === MAP_IDS.KALAAR) {
    if (isKalaarAlexTile(x, y)) return false;
    return tile === 'street' || tile === 'plaza' || tile === 'bridge' || tile === 'bridge-west-exit';
  }
  if (gameState.currentMap === MAP_IDS.GOLDA) {
    return (
      tile === 'gold-grass' || tile === 'gold-tree' || tile === 'gold-river' ||
      tile === 'gold-mountain' || tile === 'golda-bridge' || tile === 'golda-bridge-west-exit'
    );
  }
  if (tile === 'golda-bridge' || tile === 'golda-bridge-exit') {
    return gameState.goldenLeagueActive;
  }
  return tile === 'grass' || tile === 'river' || tile === 'mountain' || tile === 'bridge' || tile === 'bridge-exit';
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
  megaTeamActive: false,
  megaLeagueMusicActive: false,
  goldenLeagueActive: false,
  playerX: 10,
  playerY: 10,
  steps: 0,
  stepsUntilEncounter: 0,
  problemsCorrect: 0,
  problemsTotal: 0,
  attackMeter: 0,
  currentBattle: null,
  inBattle: false,
  currentMap: MAP_IDS.MAIN,
  zoneTitleActive: false,
  kalaarAlexHelpComplete: false,
  starMovesUnlocked: false,
  kalaarDialogActive: false,
  battleStarMovesOpen: false,
  bandihootX: null,
  bandihootY: null,
};

const SAVE_VERSION = 1;
const SAVE_KEY_PREFIX = 'multiplication-land-save-';
const MODE_LAUNCH_OPTIONS = [
  { elementId: 'mode-5', mode: 5, label: "Multiply By 5's" },
  { elementId: 'mode-6', mode: 6, label: "Multiply By 6's" },
  { elementId: 'mode-7', mode: 7, label: "Multiply By 7's" },
  { elementId: 'mode-8', mode: 8, label: "Multiply By 8's" },
  { elementId: 'mode-9', mode: 9, label: "Multiply By 9's" },
  { elementId: 'mode-11', mode: 11, label: "Multiply By 11's" },
  { elementId: 'mode-12', mode: 12, label: "Multiply By 12's" },
  { elementId: 'mode-all', mode: 'all', label: 'All Multiplication Facts' },
];

let pendingLaunchMode = null;

function getSaveStorageKey(mode) {
  return `${SAVE_KEY_PREFIX}${mode}`;
}

function getTransientGameStateDefaults() {
  return {
    currentBattle: null,
    inBattle: false,
    zoneTitleActive: false,
    kalaarDialogActive: false,
    battleStarMovesOpen: false,
  };
}

function collectPersistedGameState() {
  return {
    mode: gameState.mode,
    playerCharacter: gameState.playerCharacter,
    playerLevel: gameState.playerLevel,
    playerAttack: gameState.playerAttack,
    playerHealth: gameState.playerHealth,
    playerMaxHealth: gameState.playerMaxHealth,
    caughtMonsters: [...gameState.caughtMonsters],
    megaTeamActive: gameState.megaTeamActive,
    megaLeagueMusicActive: gameState.megaLeagueMusicActive,
    goldenLeagueActive: gameState.goldenLeagueActive,
    playerX: gameState.playerX,
    playerY: gameState.playerY,
    steps: gameState.steps,
    stepsUntilEncounter: gameState.stepsUntilEncounter,
    problemsCorrect: gameState.problemsCorrect,
    problemsTotal: gameState.problemsTotal,
    recentAnswers: Array.isArray(gameState.recentAnswers) ? [...gameState.recentAnswers] : [],
    weakFacts: gameState.weakFacts && typeof gameState.weakFacts === 'object'
      ? { ...gameState.weakFacts }
      : {},
    lastFactKey: gameState.lastFactKey ?? null,
    answerMode: gameState.answerMode ?? getDefaultAnswerModeForLevel(gameState.playerLevel),
    answerModePromoteStreak: gameState.answerModePromoteStreak ?? 0,
    answerModeDemoteStreak: gameState.answerModeDemoteStreak ?? 0,
    attackMeter: gameState.attackMeter,
    currentMap: gameState.currentMap,
    kalaarAlexHelpComplete: gameState.kalaarAlexHelpComplete,
    starMovesUnlocked: gameState.starMovesUnlocked,
    bandihootX: gameState.bandihootX,
    bandihootY: gameState.bandihootY,
  };
}

function saveGame() {
  if (gameState.mode == null) return;
  try {
    const payload = {
      version: SAVE_VERSION,
      savedAt: Date.now(),
      state: collectPersistedGameState(),
    };
    localStorage.setItem(getSaveStorageKey(gameState.mode), JSON.stringify(payload));
  } catch (err) {
    console.warn('Could not save game progress.', err);
  }
}

function clearSavedGame(mode) {
  try {
    localStorage.removeItem(getSaveStorageKey(mode));
  } catch (err) {
    console.warn('Could not clear saved game.', err);
  }
}

function readSavedGamePayload(mode) {
  try {
    const raw = localStorage.getItem(getSaveStorageKey(mode));
    if (!raw) return null;
    const payload = JSON.parse(raw);
    if (!payload || payload.version !== SAVE_VERSION || !payload.state) return null;
    if (payload.state.mode !== mode) return null;
    return payload;
  } catch {
    return null;
  }
}

function hasSavedGame(mode) {
  return readSavedGamePayload(mode) != null;
}

function getSavedGameSummary(mode) {
  const payload = readSavedGamePayload(mode);
  if (!payload) return null;
  const state = payload.state;
  const caughtCount = Array.isArray(state.caughtMonsters) ? state.caughtMonsters.length : 0;
  return {
    level: state.playerLevel ?? 1,
    caughtCount,
    health: state.playerHealth ?? PLAYER_MAX_HEALTH,
    maxHealth: state.playerMaxHealth ?? PLAYER_MAX_HEALTH,
    character: state.playerCharacter === 'girl' ? 'girl' : 'boy',
    savedAt: payload.savedAt ?? null,
  };
}

function sanitizeLoadedGameState(saved, mode) {
  const caughtMonsters = Array.isArray(saved.caughtMonsters)
    ? saved.caughtMonsters.filter(id => Number.isInteger(id) && id >= 0 && id < MONSTER_COUNT)
    : [];
  const playerLevel = Number.isFinite(saved.playerLevel) ? Math.max(1, saved.playerLevel) : 1;
  const playerMaxHealth = Number.isFinite(saved.playerMaxHealth)
    ? Math.max(1, saved.playerMaxHealth)
    : PLAYER_MAX_HEALTH;
  const playerHealth = Number.isFinite(saved.playerHealth)
    ? Math.min(playerMaxHealth, Math.max(0, saved.playerHealth))
    : playerMaxHealth;

  return {
    ...getTransientGameStateDefaults(),
    mode,
    playerCharacter: saved.playerCharacter === 'girl' ? 'girl' : 'boy',
    playerLevel,
    playerAttack: Number.isFinite(saved.playerAttack) ? saved.playerAttack : 4 + playerLevel,
    playerHealth,
    playerMaxHealth,
    caughtMonsters,
    megaTeamActive: !!saved.megaTeamActive,
    megaLeagueMusicActive: !!saved.megaLeagueMusicActive,
    goldenLeagueActive: !!saved.goldenLeagueActive,
    playerX: Number.isFinite(saved.playerX) ? saved.playerX : 10,
    playerY: Number.isFinite(saved.playerY) ? saved.playerY : 10,
    steps: Number.isFinite(saved.steps) ? saved.steps : 0,
    stepsUntilEncounter: Number.isFinite(saved.stepsUntilEncounter)
      ? saved.stepsUntilEncounter
      : rollNextEncounter(),
    problemsCorrect: Number.isFinite(saved.problemsCorrect) ? saved.problemsCorrect : 0,
    problemsTotal: Number.isFinite(saved.problemsTotal) ? saved.problemsTotal : 0,
    recentAnswers: Array.isArray(saved.recentAnswers) ? saved.recentAnswers : [],
    weakFacts: saved.weakFacts && typeof saved.weakFacts === 'object' ? saved.weakFacts : {},
    lastFactKey: saved.lastFactKey ?? null,
    answerMode: saved.answerMode ?? getDefaultAnswerModeForLevel(playerLevel),
    answerModePromoteStreak: Number.isFinite(saved.answerModePromoteStreak)
      ? saved.answerModePromoteStreak
      : 0,
    answerModeDemoteStreak: Number.isFinite(saved.answerModeDemoteStreak)
      ? saved.answerModeDemoteStreak
      : 0,
    attackMeter: Number.isFinite(saved.attackMeter) ? saved.attackMeter : 0,
    currentMap: Object.values(MAP_IDS).includes(saved.currentMap) ? saved.currentMap : MAP_IDS.MAIN,
    kalaarAlexHelpComplete: !!saved.kalaarAlexHelpComplete,
    starMovesUnlocked: !!saved.starMovesUnlocked,
    bandihootX: Number.isFinite(saved.bandihootX) ? saved.bandihootX : null,
    bandihootY: Number.isFinite(saved.bandihootY) ? saved.bandihootY : null,
  };
}

function loadSavedGame(mode) {
  const payload = readSavedGamePayload(mode);
  if (!payload) return null;
  return sanitizeLoadedGameState(payload.state, mode);
}

function createFreshGameState(mode, character) {
  return {
    mode,
    playerCharacter: character,
    playerLevel: 1,
    playerAttack: 5,
    playerHealth: PLAYER_MAX_HEALTH,
    playerMaxHealth: PLAYER_MAX_HEALTH,
    caughtMonsters: [],
    megaTeamActive: false,
    megaLeagueMusicActive: false,
    goldenLeagueActive: false,
    playerX: 10,
    playerY: 10,
    steps: 0,
    stepsUntilEncounter: rollNextEncounter(),
    problemsCorrect: 0,
    problemsTotal: 0,
    recentAnswers: [],
    weakFacts: {},
    lastFactKey: null,
    answerMode: getDefaultAnswerModeForLevel(1),
    answerModePromoteStreak: 0,
    answerModeDemoteStreak: 0,
    attackMeter: 0,
    ...getTransientGameStateDefaults(),
    currentMap: MAP_IDS.MAIN,
    kalaarAlexHelpComplete: false,
    starMovesUnlocked: false,
    bandihootX: null,
    bandihootY: null,
  };
}

function hideAllGameScreens() {
  screens.start.classList.add('hidden');
  screens.overworld.classList.add('hidden');
  screens.encounter.classList.add('hidden');
  screens.battle.classList.add('hidden');
  screens.levelUp.classList.add('hidden');
  if (screens.alexMegaTeam) screens.alexMegaTeam.classList.add('hidden');
  if (screens.sohnReveal) screens.sohnReveal.classList.add('hidden');
  if (screens.ultraSohnReveal) screens.ultraSohnReveal.classList.add('hidden');
  if (screens.kalaarAlexDialog) screens.kalaarAlexDialog.classList.add('hidden');
  if (screens.goldenLeague) screens.goldenLeague.classList.add('hidden');
  screens.gameOver.classList.add('hidden');
}

function enterGameFromState(state) {
  gameState = state;
  document.removeEventListener('keydown', handleOverworldKey);
  hideAllGameScreens();
  setOverworldMapTheme(gameState.currentMap || MAP_IDS.MAIN);
  startThemeMusic();
  screens.overworld.classList.remove('hidden');
  ensureBandihootSpawned();
  updateHUD();
  drawOverworld();
  document.addEventListener('keydown', handleOverworldKey);
  saveGame();
}

function getModeLaunchLabel(mode) {
  return MODE_LAUNCH_OPTIONS.find(entry => entry.mode === mode)?.label ?? 'This mode';
}

function formatSaveSummaryText(summary) {
  const characterLabel = summary.character === 'girl' ? 'Girl wizard' : 'Boy wizard';
  return `Level ${summary.level} · ${summary.caughtCount} monsters caught · ${summary.health}/${summary.maxHealth} HP · ${characterLabel}`;
}

function hideSaveChoiceDialog() {
  const dialog = document.getElementById('save-choice-dialog');
  if (dialog) dialog.classList.add('hidden');
  pendingLaunchMode = null;
}

function showSaveChoiceDialog(mode) {
  const dialog = document.getElementById('save-choice-dialog');
  const titleEl = document.getElementById('save-choice-mode-title');
  const summaryEl = document.getElementById('save-choice-summary');
  const summary = getSavedGameSummary(mode);
  if (!dialog || !titleEl || !summaryEl || !summary) return false;

  pendingLaunchMode = mode;
  titleEl.textContent = getModeLaunchLabel(mode);
  summaryEl.textContent = formatSaveSummaryText(summary);
  dialog.classList.remove('hidden');
  document.getElementById('save-continue-btn')?.focus();
  return true;
}

function updateModeSaveBadges() {
  MODE_LAUNCH_OPTIONS.forEach(({ elementId, mode }) => {
    const btn = document.getElementById(elementId);
    if (!btn) return;
    let hint = btn.querySelector('.mode-save-hint');
    if (!hint) {
      hint = document.createElement('span');
      hint.className = 'mode-save-hint hidden';
      btn.appendChild(hint);
    }
    const summary = getSavedGameSummary(mode);
    if (summary) {
      hint.textContent = `Saved · Lv ${summary.level}`;
      hint.classList.remove('hidden');
    } else {
      hint.textContent = '';
      hint.classList.add('hidden');
    }
  });
}

function showStartScreen() {
  hideSaveChoiceDialog();
  hideAllGameScreens();
  screens.start.classList.remove('hidden');
  updateModeSaveBadges();
}

function startNewGame(mode) {
  hideSaveChoiceDialog();
  clearSavedGame(mode);
  const character = document.getElementById('char-boy').classList.contains('selected') ? 'boy' : 'girl';
  enterGameFromState(createFreshGameState(mode, character));
  updateModeSaveBadges();
}

function continueSavedGame(mode) {
  hideSaveChoiceDialog();
  const savedState = loadSavedGame(mode);
  if (!savedState) {
    startNewGame(mode);
    return;
  }
  setCharacter(savedState.playerCharacter);
  enterGameFromState(savedState);
}

function promptModeLaunch(mode) {
  if (hasSavedGame(mode)) {
    showSaveChoiceDialog(mode);
    return;
  }
  startNewGame(mode);
}

const screens = {
  start: document.getElementById('start-screen'),
  overworld: document.getElementById('overworld-screen'),
  encounter: document.getElementById('battle-encounter-screen'),
  battle: document.getElementById('battle-screen'),
  levelUp: document.getElementById('level-up-screen'),
  alexMegaTeam: document.getElementById('alex-mega-team-screen'),
  goldenLeague: document.getElementById('golden-league-screen'),
  sohnReveal: document.getElementById('sohn-reveal-screen'),
  ultraSohnReveal: document.getElementById('ultra-sohn-reveal-screen'),
  kalaarAlexDialog: document.getElementById('kalaar-alex-dialog-screen'),
  gameOver: document.getElementById('game-over-screen'),
};

const themeMusic = document.getElementById('theme-music');
const battleMusic = document.getElementById('battle-music');
const megaLeagueMusic = document.getElementById('mega-league-music');
const kalaarMusic = document.getElementById('kalaar-music');

function getAllMusicTracks() {
  return [themeMusic, battleMusic, megaLeagueMusic, kalaarMusic];
}

function pauseMusicTrack(track) {
  if (!track) return;
  track.pause();
  track.currentTime = 0;
}

function setAllMusicMuted(muted) {
  getAllMusicTracks().forEach(a => {
    if (a) a.muted = muted;
  });
}

function syncMusicMuteButtons() {
  const muted = themeMusic?.muted ?? false;
  document.querySelectorAll('.music-mute-btn').forEach(btn => {
    btn.textContent = muted ? 'Unmute' : 'Mute';
    btn.setAttribute('aria-label', muted ? 'Unmute music' : 'Mute music');
    btn.setAttribute('aria-pressed', muted ? 'true' : 'false');
  });
}

function toggleThemeMute() {
  if (!getAllMusicTracks().some(a => a)) return;
  const muted = !(themeMusic?.muted ?? false);
  setAllMusicMuted(muted);
  syncMusicMuteButtons();
}

function getOverworldMusicTrack() {
  if (gameState.currentMap === MAP_IDS.KALAAR) return kalaarMusic;
  if (gameState.currentMap === MAP_IDS.GOLDA || gameState.goldenLeagueActive) return megaLeagueMusic;
  if (gameState.megaLeagueMusicActive) return megaLeagueMusic;
  return themeMusic;
}

function playOverworldMusic() {
  pauseMusicTrack(battleMusic);
  pauseMusicTrack(themeMusic);
  pauseMusicTrack(megaLeagueMusic);
  pauseMusicTrack(kalaarMusic);
  const track = getOverworldMusicTrack();
  if (!track) return;
  track.loop = true;
  track.play().catch(() => {});
}

function startThemeMusic() {
  playOverworldMusic();
}

function playBattleMusic() {
  pauseMusicTrack(themeMusic);
  pauseMusicTrack(megaLeagueMusic);
  pauseMusicTrack(kalaarMusic);
  if (!battleMusic) return;
  battleMusic.loop = true;
  battleMusic.currentTime = 0;
  battleMusic.play().catch(() => {});
}

function playNonBattleMusic() {
  playOverworldMusic();
}

function beginMegaLeagueMusic() {
  gameState.megaLeagueMusicActive = true;
  pauseMusicTrack(battleMusic);
  playOverworldMusic();
}

function pauseAllMusic() {
  getAllMusicTracks().forEach(pauseMusicTrack);
}

const LEVEL_UP_DURATION = 3000;
const ATTACK_EFFECT_DURATION = 2000;
const CONFETTI_COLORS = ['#f4d03f', '#f8b4d9', '#98eec9', '#e74c3c', '#3498db', '#9b59b6'];

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const ACCURACY_WINDOW = 15;
const ACCURACY_MIN_ANSWERS = 8;
const ACCURACY_WIDEN_THRESHOLD = 0.85;
const ACCURACY_NARROW_THRESHOLD = 0.6;
const WEAK_FACT_REVIEW_CHANCE = 0.35;
const WEAK_FACT_CHOICE_UNLOCK_STREAK = 2;
const ANSWER_MODE_PROMOTE_CORRECT = 8;
const ANSWER_MODE_DEMOTE_WRONG = 4;

const FACT_CAP_TIERS = [
  { maxMultiplier: 5, maxLowFactor: 5, maxHighFactor: 5 },
  { maxMultiplier: 8, maxLowFactor: 8, maxHighFactor: 8 },
  { maxMultiplier: 12, maxLowFactor: 10, maxHighFactor: 12 },
];

function getLevelCapTierIndex(level) {
  if (level <= 2) return 0;
  if (level <= 4) return 1;
  return 2;
}

function getRecentAccuracy() {
  const recent = gameState.recentAnswers;
  if (!recent || recent.length < ACCURACY_MIN_ANSWERS) return null;
  const correct = recent.filter(r => r.correct).length;
  return correct / recent.length;
}

/** Level caps adjusted by recent accuracy (widen when hot, narrow when struggling). */
function getEffectiveFactCaps() {
  let tier = getLevelCapTierIndex(gameState.playerLevel);
  const accuracy = getRecentAccuracy();
  if (accuracy !== null) {
    if (accuracy >= ACCURACY_WIDEN_THRESHOLD) {
      tier = Math.min(FACT_CAP_TIERS.length - 1, tier + 1);
    } else if (accuracy <= ACCURACY_NARROW_THRESHOLD) {
      tier = Math.max(0, tier - 1);
    }
  }
  return FACT_CAP_TIERS[tier];
}

function getAllFactsProductsForCaps(maxLowFactor, maxHighFactor) {
  const products = new Set();
  for (let i = 2; i <= maxLowFactor; i++) {
    for (let j = 2; j <= maxHighFactor; j++) products.add(i * j);
  }
  return [...products];
}

function filterTablePoolByCaps(pool, base) {
  const { maxMultiplier } = getEffectiveFactCaps();
  return pool.filter(m => m / base <= maxMultiplier);
}

function getBaseNumber() {
  return gameState.mode;
}

function factKeyFromProblem(problem) {
  if (gameState.mode === 'all') {
    const lo = Math.min(problem.a, problem.b);
    const hi = Math.max(problem.a, problem.b);
    return `${lo}-${hi}`;
  }
  return `${problem.a}-${problem.b}`;
}

function problemFromFactKey(key, caps) {
  const parts = key.split('-').map(Number);
  if (parts.length !== 2 || parts.some(n => Number.isNaN(n))) return null;
  const [first, second] = parts;
  if (gameState.mode === 'all') {
    const lo = Math.min(first, second);
    const hi = Math.max(first, second);
    if (lo < 2 || hi < 2 || lo > caps.maxLowFactor || hi > caps.maxHighFactor) return null;
    if (Math.random() < 0.5) {
      return { a: lo, b: hi, answer: lo * hi };
    }
    return { a: hi, b: lo, answer: lo * hi };
  }
  const mult = first;
  const base = second;
  if (base !== getBaseNumber() || mult < 1 || mult > caps.maxMultiplier) return null;
  return { a: mult, b: base, answer: mult * base };
}

function getDefaultAnswerModeForLevel(level) {
  return level <= 2 ? 'choice' : 'typed';
}

function factNeedsChoiceReview(problem) {
  const key = factKeyFromProblem(problem);
  const stats = gameState.weakFacts?.[key];
  if (!stats || stats.misses === 0) return false;
  return (stats.correctStreak || 0) < WEAK_FACT_CHOICE_UNLOCK_STREAK;
}

function getAnswerModeForProblem(problem) {
  if (factNeedsChoiceReview(problem)) return 'choice';
  if (gameState.playerLevel <= 2) return 'choice';
  return gameState.answerMode || getDefaultAnswerModeForLevel(gameState.playerLevel);
}

function syncAnswerModeOnLevelUp(newLevel) {
  if (newLevel === 3) {
    gameState.answerMode = 'typed';
    gameState.answerModePromoteStreak = 0;
    gameState.answerModeDemoteStreak = 0;
  }
}

function updateAnswerModeHysteresis(correct, inputMode) {
  if (gameState.playerLevel <= 2) return;

  if (inputMode === 'choice') {
    if (correct) {
      gameState.answerModePromoteStreak = (gameState.answerModePromoteStreak || 0) + 1;
      if (gameState.answerModePromoteStreak >= ANSWER_MODE_PROMOTE_CORRECT) {
        gameState.answerMode = 'typed';
        gameState.answerModePromoteStreak = 0;
        gameState.answerModeDemoteStreak = 0;
      }
    } else {
      gameState.answerModePromoteStreak = 0;
    }
  } else if (inputMode === 'typed') {
    if (!correct) {
      gameState.answerModeDemoteStreak = (gameState.answerModeDemoteStreak || 0) + 1;
      if (gameState.answerModeDemoteStreak >= ANSWER_MODE_DEMOTE_WRONG) {
        gameState.answerMode = 'choice';
        gameState.answerModeDemoteStreak = 0;
        gameState.answerModePromoteStreak = 0;
      }
    } else {
      gameState.answerModeDemoteStreak = 0;
    }
  }
}

function recordAnswerResult(problem, correct, inputMode) {
  const key = factKeyFromProblem(problem);
  if (!gameState.recentAnswers) gameState.recentAnswers = [];
  gameState.recentAnswers.push({ correct, factKey: key, inputMode });
  if (gameState.recentAnswers.length > ACCURACY_WINDOW) {
    gameState.recentAnswers.shift();
  }
  if (!gameState.weakFacts) gameState.weakFacts = {};
  if (!gameState.weakFacts[key]) {
    gameState.weakFacts[key] = { misses: 0, attempts: 0, correctStreak: 0 };
  }
  gameState.weakFacts[key].attempts++;
  if (!correct) {
    gameState.weakFacts[key].misses++;
    gameState.weakFacts[key].correctStreak = 0;
  } else {
    gameState.weakFacts[key].correctStreak = (gameState.weakFacts[key].correctStreak || 0) + 1;
  }
  updateAnswerModeHysteresis(correct, inputMode);
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildMultipleChoiceAnswers(correct) {
  const choices = new Set([correct]);
  generateWrongAnswers(correct).forEach(w => choices.add(w));
  let attempts = 0;
  while (choices.size < 4 && attempts < 40) {
    const offset = (Math.floor(Math.random() * 7) - 3) * (Math.random() > 0.5 ? 1 : -1);
    const val = correct + offset;
    if (val > 0 && val !== correct) choices.add(val);
    attempts++;
  }
  return shuffleArray([...choices]);
}

function pickWeakFactForReview(caps) {
  const entries = Object.entries(gameState.weakFacts || {})
    .filter(([, stats]) => stats.misses > 0)
    .map(([key, stats]) => ({ key, stats, problem: problemFromFactKey(key, caps) }))
    .filter(entry => entry.problem);

  if (entries.length === 0) return null;

  const totalWeight = entries.reduce((sum, e) => sum + e.stats.misses, 0);
  let roll = Math.random() * totalWeight;
  for (const entry of entries) {
    roll -= entry.stats.misses;
    if (roll <= 0) return entry.problem;
  }
  return entries[entries.length - 1].problem;
}

function generateRandomProblem(caps) {
  if (gameState.mode === 'all') {
    const factorLow = randomInt(2, caps.maxLowFactor);
    const factorHigh = randomInt(2, caps.maxHighFactor);
    if (Math.random() < 0.5) {
      return { a: factorLow, b: factorHigh, answer: factorLow * factorHigh };
    }
    return { a: factorHigh, b: factorLow, answer: factorLow * factorHigh };
  }
  const base = getBaseNumber();
  const multiplier = randomInt(1, caps.maxMultiplier);
  return { a: multiplier, b: base, answer: multiplier * base };
}

function generateProblem() {
  const caps = getEffectiveFactCaps();

  if (gameState.weakFacts && Math.random() < WEAK_FACT_REVIEW_CHANCE) {
    const review = pickWeakFactForReview(caps);
    if (review) {
      const key = factKeyFromProblem(review);
      if (key !== gameState.lastFactKey) {
        gameState.lastFactKey = key;
        return review;
      }
    }
  }

  const maxAttempts = 12;
  for (let i = 0; i < maxAttempts; i++) {
    const problem = generateRandomProblem(caps);
    const key = factKeyFromProblem(problem);
    if (key !== gameState.lastFactKey || i === maxAttempts - 1) {
      gameState.lastFactKey = key;
      return problem;
    }
  }

  const problem = generateRandomProblem(caps);
  gameState.lastFactKey = factKeyFromProblem(problem);
  return problem;
}

function generateWrongAnswers(correct) {
  const wrong = new Set();
  if (gameState.mode === 5) {
    let pool = filterTablePoolByCaps([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60], 5).filter(m => m !== correct);
    if (correct !== 5) pool = pool.filter(m => m !== 5);
    while (wrong.size < 3 && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      wrong.add(pool[idx]);
      pool.splice(idx, 1);
    }
    return [...wrong];
  }
  if (gameState.mode === 6) {
    let pool = filterTablePoolByCaps([6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72], 6).filter(m => m !== correct);
    if (correct !== 6) pool = pool.filter(m => m !== 6);
    while (wrong.size < 3 && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      wrong.add(pool[idx]);
      pool.splice(idx, 1);
    }
    return [...wrong];
  }
  if (gameState.mode === 7) {
    let pool = filterTablePoolByCaps([7, 14, 21, 28, 35, 42, 49, 56, 63, 70, 77, 84], 7).filter(m => m !== correct);
    if (correct !== 7) pool = pool.filter(m => m !== 7);
    while (wrong.size < 3 && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      wrong.add(pool[idx]);
      pool.splice(idx, 1);
    }
    return [...wrong];
  }
  if (gameState.mode === 8) {
    let pool = filterTablePoolByCaps([8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96], 8).filter(m => m !== correct);
    if (correct !== 8) pool = pool.filter(m => m !== 8);
    while (wrong.size < 3 && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      wrong.add(pool[idx]);
      pool.splice(idx, 1);
    }
    return [...wrong];
  }
  if (gameState.mode === 9) {
    let pool = filterTablePoolByCaps([9, 18, 27, 36, 45, 54, 63, 72, 81, 90, 99, 108], 9).filter(m => m !== correct);
    if (correct !== 9) pool = pool.filter(m => m !== 9);
    while (wrong.size < 3 && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      wrong.add(pool[idx]);
      pool.splice(idx, 1);
    }
    return [...wrong];
  }
  if (gameState.mode === 11) {
    let pool = filterTablePoolByCaps([11, 22, 33, 44, 55, 66, 77, 88, 99, 110, 121, 132], 11).filter(m => m !== correct);
    if (correct !== 11) pool = pool.filter(m => m !== 11);
    while (wrong.size < 3 && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      wrong.add(pool[idx]);
      pool.splice(idx, 1);
    }
    return [...wrong];
  }
  if (gameState.mode === 12) {
    let pool = filterTablePoolByCaps([12, 24, 36, 48, 60, 72, 84, 96, 108, 120, 132, 144], 12).filter(m => m !== correct);
    if (correct !== 12) pool = pool.filter(m => m !== 12);
    while (wrong.size < 3 && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      wrong.add(pool[idx]);
      pool.splice(idx, 1);
    }
    return [...wrong];
  }
  if (gameState.mode === 'all') {
    const caps = getEffectiveFactCaps();
    let pool = getAllFactsProductsForCaps(caps.maxLowFactor, caps.maxHighFactor).filter(m => m !== correct);
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

function hasCaughtAllBeforeTheSohn() {
  return ORIGINAL_IDS_BEFORE_SOHN.every(id => gameState.caughtMonsters.includes(id));
}

function hasCaughtAllOriginals() {
  for (let id = 0; id < ORIGINAL_MONSTER_COUNT; id++) {
    if (!gameState.caughtMonsters.includes(id)) return false;
  }
  return true;
}

function hasCaughtAllPreGoldenLeagueMonsters() {
  for (let id = 0; id < PRE_GOLDEN_LEAGUE_MONSTER_COUNT; id++) {
    if (!gameState.caughtMonsters.includes(id)) return false;
  }
  return true;
}

function hasCaughtAllGoldenForms() {
  return GOLDEN_FORM_MONSTER_IDS.every(id => gameState.caughtMonsters.includes(id));
}

function hasCaughtUltraSohn() {
  return gameState.caughtMonsters.includes(ULTRA_SOHN_ID);
}

function hasCaughtBandihoot() {
  return gameState.caughtMonsters.includes(BANDIHOOT_ID);
}

function isBandihootActiveOnKalaar() {
  return (
    gameState.currentMap === MAP_IDS.KALAAR &&
    gameState.kalaarAlexHelpComplete &&
    !hasCaughtBandihoot()
  );
}

function getRandomUncaughtMonster() {
  let pool = MONSTERS.filter(m => !gameState.caughtMonsters.includes(m.id));
  pool = pool.filter(m => m.id !== BANDIHOOT_ID);

  if (gameState.currentMap === MAP_IDS.GOLDA) {
    if (hasCaughtUltraSohn()) return null;
    if (hasCaughtAllGoldenForms()) {
      pool = pool.filter(m => m.id === ULTRA_SOHN_ID);
    } else {
      pool = pool.filter(m => GOLDEN_FORM_MONSTER_IDS.includes(m.id));
    }
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  if (gameState.currentMap === MAP_IDS.KALAAR) {
    pool = pool.filter(m => KALAAR_ONLY_MONSTER_IDS.includes(m.id));
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  pool = pool.filter(m => !KALAAR_ONLY_MONSTER_IDS.includes(m.id));
  pool = pool.filter(m => !GOLDEN_FORM_MONSTER_IDS.includes(m.id));
  pool = pool.filter(m => m.id !== ULTRA_SOHN_ID);
  if (pool.length === 0) return null;
  if (!gameState.megaTeamActive) {
    pool = pool.filter(m => m.id < ORIGINAL_MONSTER_COUNT);
    if (!gameState.caughtMonsters.includes(THE_SOHN_ID)) {
      if (hasCaughtAllBeforeTheSohn()) {
        pool = pool.filter(m => m.id === THE_SOHN_ID);
      } else {
        pool = pool.filter(m => m.id !== THE_SOHN_ID);
      }
    }
  } else {
    pool = pool.filter(m => m.id >= ORIGINAL_MONSTER_COUNT);
    const allOtherMegaCaught = MEGA_MONSTERS_BEFORE_GOLDEN_IDS.every(id =>
      gameState.caughtMonsters.includes(id)
    );
    const goldenCaught = gameState.caughtMonsters.includes(GOLDEN_SOHN_ID);
    if (!allOtherMegaCaught) {
      pool = pool.filter(m => MEGA_MONSTERS_BEFORE_GOLDEN_IDS.includes(m.id));
    } else if (!goldenCaught) {
      pool = pool.filter(m => m.id === GOLDEN_SOHN_ID);
    }
  }
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function getInventoryMonsters() {
  if (gameState.goldenLeagueActive) {
    return MONSTERS.filter(
      m => GOLDEN_FORM_MONSTER_IDS.includes(m.id) || m.id === ULTRA_SOHN_ID
    );
  }
  if (!gameState.megaTeamActive) {
    const list = MONSTERS.filter(m => m.id < ORIGINAL_MONSTER_COUNT);
    if (gameState.kalaarAlexHelpComplete) {
      const kalaarMonsters = MONSTERS.filter(
        m => m.id === BANDIHOOT_ID || KALAAR_ONLY_MONSTER_IDS.includes(m.id)
      );
      return [...list, ...kalaarMonsters];
    }
    return list;
  }
  return MONSTERS.filter(m => !GOLDEN_FORM_MONSTER_IDS.includes(m.id));
}

function updateHUD() {
  document.getElementById('player-level').textContent = gameState.playerLevel;
  const inv = getInventoryMonsters();
  const caughtShown = gameState.caughtMonsters.filter(id => inv.some(m => m.id === id)).length;
  document.getElementById('monsters-caught').textContent = caughtShown;
  const totalEl = document.getElementById('monsters-total');
  if (totalEl) totalEl.textContent = inv.length;
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

function createInventorySlot(monster) {
  const caught = gameState.caughtMonsters.includes(monster.id);
  const slot = document.createElement('div');
  slot.className = 'inventory-slot' + (caught ? ' caught' : '');
  if (monster.goldenForm) slot.classList.add('inventory-slot-golden');
  if (monster.id === THE_SOHN_ID) slot.classList.add('inventory-slot-sohn');
  if (monster.ultraBoss || monster.id === ULTRA_SOHN_ID) slot.classList.add('inventory-slot-ultra');
  const can = getMonsterSpriteCanvas(monster.id, 40);
  slot.appendChild(can);
  const nameSpan = document.createElement('span');
  nameSpan.className = 'slot-name';
  nameSpan.textContent = monster.name;
  slot.appendChild(nameSpan);
  return slot;
}

function fillMonsterInventory(mainContainer, sohnContainer) {
  if (!mainContainer || !sohnContainer) return;
  mainContainer.innerHTML = '';
  sohnContainer.innerHTML = '';
  const monsters = getInventoryMonsters();
  const sohnMonsterId = gameState.goldenLeagueActive ? ULTRA_SOHN_ID : THE_SOHN_ID;
  const useSohnSlot = gameState.goldenLeagueActive || !gameState.megaTeamActive;
  const sohn = useSohnSlot ? monsters.find(m => m.id === sohnMonsterId) : null;
  monsters.filter(m => !useSohnSlot || m.id !== sohnMonsterId).forEach(m => {
    mainContainer.appendChild(createInventorySlot(m));
  });
  if (sohn) {
    sohnContainer.appendChild(createInventorySlot(sohn));
  }
  const divider = mainContainer.closest('.inventory-layout')?.querySelector('.inventory-sohn-divider');
  const sohnArea = sohnContainer.closest('.inventory-sohn-area') || sohnContainer;
  if (divider) divider.classList.toggle('hidden', !useSohnSlot);
  if (sohnArea && sohnArea.classList) sohnArea.classList.toggle('hidden', !useSohnSlot);
}

function updateMonsterInventory() {
  fillMonsterInventory(
    document.getElementById('inventory-slots'),
    document.getElementById('inventory-sohn-slot')
  );
}

function updateBattleMonsterInventory() {
  fillMonsterInventory(
    document.getElementById('battle-inventory-slots'),
    document.getElementById('battle-inventory-sohn-slot')
  );
}

function setOverworldMapTheme(mapId) {
  const screen = screens.overworld;
  if (!screen) return;
  screen.classList.toggle('kalaar-theme', mapId === MAP_IDS.KALAAR);
  screen.classList.toggle('golda-theme', mapId === MAP_IDS.GOLDA);
}

function drawKalaarWindow(px, py, seed) {
  const lit = (seed % 3) !== 0;
  ctx.fillStyle = lit ? '#c41e3a' : '#3d0808';
  ctx.fillRect(px + 6, py + 8, 8, 10);
  ctx.fillRect(px + 18, py + 8, 8, 10);
  if (seed % 2 === 0) {
    ctx.fillRect(px + 12, py + 20, 8, 6);
  }
}

function drawOverworldTile(tile, px, py, x, y) {
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
  } else if (tile === 'bridge' || tile === 'bridge-exit' || tile === 'bridge-west-exit') {
    ctx.fillStyle = (x + y) % 2 === 0 ? '#8b6914' : '#a67c2d';
    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    ctx.strokeStyle = '#5c4a1a';
    ctx.lineWidth = 2;
    for (let i = 4; i < TILE_SIZE; i += 8) {
      ctx.beginPath();
      ctx.moveTo(px, py + i);
      ctx.lineTo(px + TILE_SIZE, py + i);
      ctx.stroke();
    }
    if (tile !== 'bridge') {
      ctx.font = '20px Fredoka';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#2d1b4e';
      ctx.fillText('🌉', px + TILE_SIZE / 2, py + TILE_SIZE - 6);
    }
  } else if (tile === 'street') {
    ctx.fillStyle = (x + y) % 2 === 0 ? '#141414' : '#1f1f1f';
    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    ctx.strokeStyle = '#8b0000';
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
  } else if (tile === 'plaza') {
    ctx.fillStyle = (x + y) % 2 === 0 ? '#2a0505' : '#3d0a0a';
    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#5c1010';
    ctx.fillRect(px + 10, py + 14, 12, 4);
  } else if (tile === 'building') {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    drawKalaarWindow(px, py, x * 7 + y * 11);
    ctx.strokeStyle = '#5c0000';
    ctx.lineWidth = 2;
    ctx.strokeRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);
  } else if (tile === 'gold-grass') {
    const shade = (x + y) % 2 === 0 ? '#c9a227' : '#dbb84d';
    ctx.fillStyle = shade;
    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = 'rgba(255, 235, 150, 0.25)';
    ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
  } else if (tile === 'gold-river') {
    ctx.fillStyle = '#d4a84b';
    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = 'rgba(255, 248, 200, 0.55)';
    ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
  } else if (tile === 'gold-mountain') {
    ctx.fillStyle = '#8b6914';
    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#f4d03f';
    ctx.font = '24px Fredoka';
    ctx.textAlign = 'center';
    ctx.fillText('⛰', px + TILE_SIZE / 2, py + TILE_SIZE - 4);
  } else if (tile === 'gold-tree') {
    ctx.fillStyle = (x + y) % 2 === 0 ? '#c9a227' : '#dbb84d';
    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    ctx.font = '24px Fredoka';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#b8860b';
    ctx.fillText('🌳', px + TILE_SIZE / 2, py + TILE_SIZE - 4);
  } else if (tile === 'golda-bridge' || tile === 'golda-bridge-exit' || tile === 'golda-bridge-west-exit') {
    ctx.fillStyle = (x + y) % 2 === 0 ? '#c9a227' : '#e8c547';
    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    ctx.strokeStyle = '#8b6914';
    ctx.lineWidth = 2;
    for (let i = 4; i < TILE_SIZE; i += 8) {
      ctx.beginPath();
      ctx.moveTo(px, py + i);
      ctx.lineTo(px + TILE_SIZE, py + i);
      ctx.stroke();
    }
    if (tile !== 'golda-bridge') {
      ctx.font = '20px Fredoka';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#5c4a1a';
      ctx.fillText('🌉', px + TILE_SIZE / 2, py + TILE_SIZE - 6);
    }
  }
}

let overworldAnimFrameId = null;

function stopOverworldAnimLoop() {
  if (overworldAnimFrameId !== null) {
    cancelAnimationFrame(overworldAnimFrameId);
    overworldAnimFrameId = null;
  }
}

function shouldAnimateKalaarOverworld() {
  return (
    !screens.overworld.classList.contains('hidden') &&
    !gameState.inBattle &&
    !gameState.kalaarDialogActive &&
    !gameState.zoneTitleActive &&
    gameState.currentMap === MAP_IDS.KALAAR &&
    (!gameState.kalaarAlexHelpComplete || isBandihootActiveOnKalaar())
  );
}

let lastBandihootMoveTime = 0;

function syncOverworldAnimLoop() {
  if (!shouldAnimateKalaarOverworld()) {
    stopOverworldAnimLoop();
    return;
  }
  if (overworldAnimFrameId !== null) return;
  function tick() {
    if (!shouldAnimateKalaarOverworld()) {
      stopOverworldAnimLoop();
      return;
    }
    tickBandihootWander();
    drawOverworldFrame();
    overworldAnimFrameId = requestAnimationFrame(tick);
  }
  overworldAnimFrameId = requestAnimationFrame(tick);
}

function drawOverworldFrame() {
  const terrain = getActiveTerrainMap();
  const offsetX = (canvas.width - MAP_WIDTH * TILE_SIZE) / 2;
  const offsetY = (canvas.height - MAP_HEIGHT * TILE_SIZE) / 2;

  if (gameState.currentMap === MAP_IDS.KALAAR) {
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (gameState.currentMap === MAP_IDS.GOLDA) {
    ctx.fillStyle = '#2a1f00';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      const px = offsetX + x * TILE_SIZE;
      const py = offsetY + y * TILE_SIZE;
      drawOverworldTile(terrain[y][x], px, py, x, y);
    }
  }

  if (gameState.currentMap === MAP_IDS.KALAAR) {
    drawKalaarAlexNpc(offsetX, offsetY);
    drawBandihootNpc(offsetX, offsetY);
  }

  ctx.font = '24px Fredoka';
  ctx.textAlign = 'center';
  const onKalaar = gameState.currentMap === MAP_IDS.KALAAR;
  const onGolda = gameState.currentMap === MAP_IDS.GOLDA;
  ctx.fillStyle = onKalaar ? '#ffcccc' : onGolda ? '#fff8e7' : '#2d1b4e';
  const tile = terrain[gameState.playerY][gameState.playerX];
  const sprites = PLAYER_SPRITES[gameState.playerCharacter] || PLAYER_SPRITES.boy;
  let playerSprite = sprites.wizard;
  if (tile === 'river' || tile === 'gold-river') playerSprite = sprites.boat;
  else if (tile === 'mountain' || tile === 'gold-mountain') playerSprite = sprites.climb;
  ctx.fillText(playerSprite, offsetX + gameState.playerX * TILE_SIZE + TILE_SIZE / 2,
    offsetY + gameState.playerY * TILE_SIZE + TILE_SIZE - 4);
}

function drawOverworld() {
  drawOverworldFrame();
  syncOverworldAnimLoop();
}

function getKalaarAlexTiles() {
  const tiles = [];
  for (let dy = 0; dy < KALAAR_ALEX_SIZE; dy++) {
    for (let dx = 0; dx < KALAAR_ALEX_SIZE; dx++) {
      tiles.push({ x: KALAAR_ALEX_POS.x + dx, y: KALAAR_ALEX_POS.y + dy });
    }
  }
  return tiles;
}

function isKalaarAlexTile(x, y) {
  return getKalaarAlexTiles().some(t => t.x === x && t.y === y);
}

function drawKalaarAlexNpc(offsetX, offsetY) {
  const ax = offsetX + KALAAR_ALEX_POS.x * TILE_SIZE;
  const ay = offsetY + KALAAR_ALEX_POS.y * TILE_SIZE;
  const alexW = KALAAR_ALEX_SIZE * TILE_SIZE;
  const alexH = KALAAR_ALEX_SIZE * TILE_SIZE;
  const img = kalaarNpcImages.alex;
  if (img && img.complete && img.naturalWidth) {
    ctx.drawImage(img, ax + 2, ay + 2, alexW - 4, alexH - 4);
  } else {
    ctx.font = '22px Fredoka';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffcccc';
    ctx.fillText('Alex', ax + alexW / 2, ay + alexH - 6);
  }

  if (!gameState.kalaarAlexHelpComplete) {
    const arrowX = ax + alexW + 4;
    const arrowY = ay + alexH / 2;
    const pulse = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(Date.now() / 280));
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.font = 'bold 22px Fredoka';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#3498db';
    ctx.strokeStyle = '#1a5276';
    ctx.lineWidth = 2;
    ctx.strokeText('▶', arrowX, arrowY);
    ctx.fillText('▶', arrowX, arrowY);
    ctx.restore();
  }
}

function isNearKalaarAlex(px, py) {
  return getKalaarAlexTiles().some(
    t => Math.abs(px - t.x) <= 1 && Math.abs(py - t.y) <= 1
  );
}

function isKalaarWalkableTile(x, y) {
  if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return false;
  if (isKalaarAlexTile(x, y)) return false;
  const tile = TERRAIN_MAPS[MAP_IDS.KALAAR][y][x];
  return tile === 'street' || tile === 'plaza' || tile === 'bridge' || tile === 'bridge-west-exit';
}

function getKalaarSpawnTiles(minDistFromPlayer = 4) {
  const tiles = [];
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      if (!isKalaarWalkableTile(x, y)) continue;
      if (isKalaarAlexTile(x, y)) continue;
      const dist =
        Math.abs(x - gameState.playerX) + Math.abs(y - gameState.playerY);
      if (dist < minDistFromPlayer) continue;
      tiles.push({ x, y });
    }
  }
  return tiles;
}

function getBandihootTilesAt(bx, by) {
  const tiles = [];
  for (let dy = 0; dy < BANDIHOOT_SIZE; dy++) {
    for (let dx = 0; dx < BANDIHOOT_SIZE; dx++) {
      tiles.push({ x: bx + dx, y: by + dy });
    }
  }
  return tiles;
}

function getBandihootTiles() {
  if (gameState.bandihootX === null || gameState.bandihootY === null) return [];
  return getBandihootTilesAt(gameState.bandihootX, gameState.bandihootY);
}

function isValidBandihootPosition(bx, by) {
  if (bx < 0 || by < 0 || bx + BANDIHOOT_SIZE > MAP_WIDTH || by + BANDIHOOT_SIZE > MAP_HEIGHT) {
    return false;
  }
  return !getBandihootTilesAt(bx, by).some(t => isKalaarAlexTile(t.x, t.y));
}

function bandihootOverlapsPlayer(bx, by) {
  return getBandihootTilesAt(bx, by).some(
    t => t.x === gameState.playerX && t.y === gameState.playerY
  );
}

function bandihootDistanceToPlayer(bx, by) {
  const cx = bx + BANDIHOOT_SIZE / 2;
  const cy = by + BANDIHOOT_SIZE / 2;
  return Math.abs(cx - gameState.playerX) + Math.abs(cy - gameState.playerY);
}

function getBandihootSpawnPositions(minDistFromPlayer = 4) {
  const positions = [];
  for (let y = 0; y <= MAP_HEIGHT - BANDIHOOT_SIZE; y++) {
    for (let x = 0; x <= MAP_WIDTH - BANDIHOOT_SIZE; x++) {
      if (!isValidBandihootPosition(x, y)) continue;
      if (bandihootDistanceToPlayer(x, y) < minDistFromPlayer) continue;
      positions.push({ x, y });
    }
  }
  return positions;
}

function spawnBandihoot() {
  let positions = getBandihootSpawnPositions(4);
  if (positions.length === 0) positions = getBandihootSpawnPositions(2);
  if (positions.length === 0) positions = getBandihootSpawnPositions(0);
  if (positions.length === 0) return;
  const pick = positions[Math.floor(Math.random() * positions.length)];
  gameState.bandihootX = pick.x;
  gameState.bandihootY = pick.y;
  lastBandihootMoveTime = Date.now();
}

function ensureBandihootSpawned() {
  if (!isBandihootActiveOnKalaar()) return;
  if (gameState.bandihootX === null || gameState.bandihootY === null) {
    spawnBandihoot();
  }
}

function isNearBandihoot(px, py) {
  if (gameState.bandihootX === null || gameState.bandihootY === null) return false;
  return getBandihootTiles().some(
    t => Math.abs(px - t.x) <= 1 && Math.abs(py - t.y) <= 1
  );
}

function getBandihootMoveOptions() {
  const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
  const options = [];
  for (const [dx, dy] of dirs) {
    const nx = gameState.bandihootX + dx;
    const ny = gameState.bandihootY + dy;
    if (!isValidBandihootPosition(nx, ny)) continue;
    if (bandihootOverlapsPlayer(nx, ny)) continue;
    options.push({ x: nx, y: ny });
  }
  return options;
}

function pickBandihootStep() {
  const options = getBandihootMoveOptions();
  if (options.length === 0) return;
  const currentDist = bandihootDistanceToPlayer(gameState.bandihootX, gameState.bandihootY);
  const flee = options.filter(o => bandihootDistanceToPlayer(o.x, o.y) > currentDist);
  const pool = Math.random() < 0.65 && flee.length > 0 ? flee : options;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  gameState.bandihootX = pick.x;
  gameState.bandihootY = pick.y;
}

function tickBandihootWander() {
  if (!isBandihootActiveOnKalaar()) return;
  const now = Date.now();
  if (now - lastBandihootMoveTime < BANDIHOOT_MOVE_INTERVAL_MS) return;
  lastBandihootMoveTime = now;
  pickBandihootStep();
}

function stepBandihootOnPlayerMove() {
  if (!isBandihootActiveOnKalaar()) return;
  pickBandihootStep();
  lastBandihootMoveTime = Date.now();
}

function drawBandihootNpc(offsetX, offsetY) {
  if (!isBandihootActiveOnKalaar() || gameState.bandihootX === null) return;
  const floatY = Math.sin(Date.now() / 380) * 8;
  const bx = offsetX + gameState.bandihootX * TILE_SIZE;
  const by = offsetY + gameState.bandihootY * TILE_SIZE + floatY;
  const bw = BANDIHOOT_SIZE * TILE_SIZE;
  const bh = BANDIHOOT_SIZE * TILE_SIZE;
  const img = monsterImages[BANDIHOOT_ID];
  if (img && img.complete && img.naturalWidth) {
    ctx.drawImage(img, bx + 2, by + 2, bw - 4, bh - 4);
  } else {
    ctx.font = '22px Fredoka';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#9b59b6';
    ctx.fillText('Bandihoot', bx + bw / 2, by + bh - 6);
  }
}

function showBandihootEncounter(onComplete) {
  const monster = MONSTERS.find(m => m.id === BANDIHOOT_ID);
  const encText = document.querySelector('#battle-encounter-screen .encounter-text');
  if (encText) {
    encText.textContent = 'You caught up to Bandihoot!';
  }
  const encCanvas = document.getElementById('encounter-monster-canvas');
  const encCtx = encCanvas.getContext('2d');
  encCtx.clearRect(0, 0, encCanvas.width, encCanvas.height);
  if (monster) drawMonsterSprite(encCtx, monster, encCanvas.width, encCanvas.height);
  screens.encounter.classList.remove('hidden');
  setTimeout(() => {
    screens.encounter.classList.add('hidden');
    if (encText) {
      encText.innerHTML =
        'A wild <span id="encounter-monster-name">monster</span> appeared!';
    }
    onComplete();
  }, BATTLE_ANIMATION_DURATION);
}

function startBandihootBattle() {
  const monster = MONSTERS.find(m => m.id === BANDIHOOT_ID);
  if (!monster) return;
  stopOverworldAnimLoop();
  gameState.inBattle = true;
  document.removeEventListener('keydown', handleOverworldKey);
  gameState.currentBattle = createBattleState(monster);
  showBandihootEncounter(beginBattleScreen);
}

function tryInterceptBandihoot() {
  if (!isBandihootActiveOnKalaar()) return false;
  if (!isNearBandihoot(gameState.playerX, gameState.playerY)) return false;
  startBandihootBattle();
  return true;
}

function canTriggerOverworldEncounter() {
  if (gameState.goldenLeagueActive) {
    if (gameState.currentMap !== MAP_IDS.GOLDA) return false;
    return !hasCaughtUltraSohn();
  }
  if (gameState.currentMap === MAP_IDS.KALAAR) {
    if (!gameState.kalaarAlexHelpComplete) return false;
    if (!hasCaughtBandihoot()) return false;
  }
  if (gameState.currentMap === MAP_IDS.GOLDA) return false;
  return gameState.caughtMonsters.length < PRE_GOLDEN_LEAGUE_MONSTER_COUNT;
}

let kalaarAlexDialogCleanup = null;

function showKalaarAlexDialog(onComplete) {
  if (kalaarAlexDialogCleanup) {
    kalaarAlexDialogCleanup();
    kalaarAlexDialogCleanup = null;
  }

  const screen = screens.kalaarAlexDialog;
  const portraitEl = document.getElementById('kalaar-alex-dialog-portrait');
  const speakerEl = document.getElementById('kalaar-alex-dialog-speaker');
  const msgEl = document.getElementById('kalaar-alex-dialog-message');
  const contentEl = document.querySelector('.kalaar-alex-dialog-content');
  if (!screen || !msgEl || !KALAAR_ALEX_DIALOG_LINES.length) {
    onComplete?.();
    return;
  }

  gameState.kalaarDialogActive = true;
  document.removeEventListener('keydown', handleOverworldKey);

  let index = 0;
  const lastIndex = KALAAR_ALEX_DIALOG_LINES.length - 1;

  function render() {
    const line = KALAAR_ALEX_DIALOG_LINES[index];
    if (speakerEl) speakerEl.textContent = line.speaker;
    msgEl.textContent = line.text;
    if (portraitEl) {
      portraitEl.src = KALAAR_NPC_IMAGES[line.portrait] || KALAAR_NPC_IMAGES.alex;
      portraitEl.alt = line.speaker;
    }
  }

  function finish() {
    if (kalaarAlexDialogCleanup) {
      kalaarAlexDialogCleanup();
      kalaarAlexDialogCleanup = null;
    }
    screen.classList.add('hidden');
    gameState.kalaarDialogActive = false;
    gameState.kalaarAlexHelpComplete = true;
    gameState.starMovesUnlocked = true;
    document.addEventListener('keydown', handleOverworldKey);
    updateBattleStarButton();
    ensureBandihootSpawned();
    drawOverworld();
    saveGame();
    onComplete?.();
  }

  function advance() {
    if (index < lastIndex) {
      index++;
      render();
    } else {
      finish();
    }
  }

  function onKeyDown(e) {
    if (e.key !== 'Enter') return;
    if (e.repeat) return;
    e.preventDefault();
    advance();
  }

  function onContentClick(e) {
    advance();
  }

  window.addEventListener('keydown', onKeyDown, true);
  if (contentEl) contentEl.addEventListener('click', onContentClick);

  kalaarAlexDialogCleanup = () => {
    window.removeEventListener('keydown', onKeyDown, true);
    if (contentEl) contentEl.removeEventListener('click', onContentClick);
  };

  render();
  screen.classList.remove('hidden');
}

function tryKalaarAlexInteraction() {
  if (gameState.currentMap !== MAP_IDS.KALAAR) return false;
  if (gameState.kalaarAlexHelpComplete || gameState.kalaarDialogActive) return false;
  if (!isNearKalaarAlex(gameState.playerX, gameState.playerY)) return false;
  showKalaarAlexDialog();
  return true;
}

function showZoneTitle(text, onComplete) {
  const overlay = document.getElementById('zone-title-overlay');
  const textEl = document.getElementById('zone-title-text');
  if (!overlay || !textEl) {
    onComplete?.();
    return;
  }
  textEl.textContent = text;
  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden', 'false');
  overlay.classList.remove('zone-title-animate');
  void overlay.offsetWidth;
  overlay.classList.add('zone-title-animate');
  setTimeout(() => {
    overlay.classList.add('hidden');
    overlay.classList.remove('zone-title-animate');
    overlay.setAttribute('aria-hidden', 'true');
    onComplete?.();
  }, ZONE_TITLE_DURATION_MS);
}

function transitionToKalaar() {
  if (gameState.currentMap === MAP_IDS.KALAAR || gameState.zoneTitleActive) return;
  gameState.currentMap = MAP_IDS.KALAAR;
  gameState.playerX = 2;
  gameState.playerY = 8;
  gameState.zoneTitleActive = true;
  setOverworldMapTheme(MAP_IDS.KALAAR);
  playOverworldMusic();
  drawOverworld();
  showZoneTitle('The Land of Kalaar', () => {
    gameState.zoneTitleActive = false;
    ensureBandihootSpawned();
    drawOverworld();
    saveGame();
  });
}

function transitionToMain() {
  if (gameState.currentMap !== MAP_IDS.KALAAR || gameState.zoneTitleActive) return;
  gameState.currentMap = MAP_IDS.MAIN;
  gameState.playerX = 17;
  gameState.playerY = 8;
  setOverworldMapTheme(MAP_IDS.MAIN);
  playOverworldMusic();
  drawOverworld();
  saveGame();
}

function transitionToGolda() {
  if (gameState.currentMap === MAP_IDS.GOLDA || gameState.zoneTitleActive) return;
  gameState.currentMap = MAP_IDS.GOLDA;
  gameState.playerX = 10;
  gameState.playerY = 8;
  gameState.zoneTitleActive = true;
  setOverworldMapTheme(MAP_IDS.GOLDA);
  playOverworldMusic();
  drawOverworld();
  showZoneTitle('The Land of Golda', () => {
    gameState.zoneTitleActive = false;
    gameState.stepsUntilEncounter = rollNextEncounter();
    drawOverworld();
    saveGame();
  });
}

function transitionFromGoldaToMain() {
  if (gameState.currentMap !== MAP_IDS.GOLDA || gameState.zoneTitleActive) return;
  gameState.currentMap = MAP_IDS.MAIN;
  gameState.playerX = 10;
  gameState.playerY = 1;
  setOverworldMapTheme(MAP_IDS.MAIN);
  playOverworldMusic();
  drawOverworld();
  saveGame();
}

function beginGoldenLeague() {
  gameState.goldenLeagueActive = true;
  beginMegaLeagueMusic();
  screens.overworld.classList.remove('hidden');
  updateHUD();
  transitionToGolda();
  document.addEventListener('keydown', handleOverworldKey);
  saveGame();
}

function checkMapTransition(x, y) {
  const tile = getActiveTerrainMap()[y][x];
  if (tile === 'bridge-exit' && gameState.currentMap === MAP_IDS.MAIN) {
    transitionToKalaar();
    return true;
  }
  if (tile === 'bridge-west-exit' && gameState.currentMap === MAP_IDS.KALAAR) {
    transitionToMain();
    return true;
  }
  if (tile === 'golda-bridge-exit' && gameState.currentMap === MAP_IDS.MAIN && gameState.goldenLeagueActive) {
    transitionToGolda();
    return true;
  }
  if (tile === 'golda-bridge-west-exit' && gameState.currentMap === MAP_IDS.GOLDA) {
    transitionFromGoldaToMain();
    return true;
  }
  return false;
}

function tryMoveOverworld(dx, dy) {
  if (gameState.inBattle || gameState.zoneTitleActive || gameState.kalaarDialogActive) return;
  if (dx === 0 && dy === 0) return;
  const nx = Math.max(0, Math.min(MAP_WIDTH - 1, gameState.playerX + dx));
  const ny = Math.max(0, Math.min(MAP_HEIGHT - 1, gameState.playerY + dy));
  if (!isWalkable(nx, ny)) return;
  gameState.playerX = nx;
  gameState.playerY = ny;
  if (checkMapTransition(nx, ny)) return;
  if (tryKalaarAlexInteraction()) return;
  if (tryInterceptBandihoot()) return;
  stepBandihootOnPlayerMove();
  if (tryInterceptBandihoot()) return;
  gameState.steps++;
  gameState.stepsUntilEncounter--;

  if (canTriggerOverworldEncounter() && gameState.stepsUntilEncounter <= 0) {
    startBattle();
  } else {
    drawOverworld();
    saveGame();
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
const SOHN_REVEAL_DURATION_MS = 3800;
const ULTRA_SOHN_REVEAL_DURATION_MS = 4200;

function createBattleState(monster) {
  return {
    monster: { ...monster },
    currentHp: monster.baseHp,
    maxHp: monster.baseHp,
    problem: generateProblem(),
    waitingForAttackChoice: false,
    wrongHpPenaltyApplied: false,
  };
}

function beginBattleScreen() {
  stopOverworldAnimLoop();
  screens.encounter.classList.add('hidden');
  screens.overworld.classList.add('hidden');
  screens.battle.classList.remove('hidden');
  playBattleMusic();
  renderBattle();
}

function showStandardEncounter(monster, onComplete) {
  document.getElementById('encounter-monster-name').textContent = monster.name;
  const encCanvas = document.getElementById('encounter-monster-canvas');
  const encCtx = encCanvas.getContext('2d');
  encCtx.clearRect(0, 0, encCanvas.width, encCanvas.height);
  drawMonsterSprite(encCtx, monster, encCanvas.width, encCanvas.height);
  screens.encounter.classList.remove('hidden');
  setTimeout(() => {
    screens.encounter.classList.add('hidden');
    onComplete();
  }, BATTLE_ANIMATION_DURATION);
}

function showSohnReveal(onComplete) {
  const screen = screens.sohnReveal;
  const canvas = document.getElementById('sohn-reveal-canvas');
  if (!screen || !canvas) {
    onComplete();
    return;
  }
  const monster = MONSTERS.find(m => m.id === THE_SOHN_ID);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (monster) drawMonsterSprite(ctx, monster, canvas.width, canvas.height);

  screen.classList.remove('hidden');
  screen.classList.remove('sohn-reveal-animate');
  void screen.offsetWidth;
  screen.classList.add('sohn-reveal-animate');

  setTimeout(() => {
    screen.classList.add('hidden');
    screen.classList.remove('sohn-reveal-animate');
    onComplete();
  }, SOHN_REVEAL_DURATION_MS);
}

function showUltraSohnReveal(onComplete) {
  const screen = screens.ultraSohnReveal;
  const canvas = document.getElementById('ultra-sohn-reveal-canvas');
  if (!screen || !canvas) {
    onComplete();
    return;
  }
  const monster = MONSTERS.find(m => m.id === ULTRA_SOHN_ID);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (monster) drawMonsterSprite(ctx, monster, canvas.width, canvas.height);

  screen.classList.remove('hidden');
  screen.classList.remove('ultra-sohn-reveal-animate');
  void screen.offsetWidth;
  screen.classList.add('ultra-sohn-reveal-animate');

  setTimeout(() => {
    screen.classList.add('hidden');
    screen.classList.remove('ultra-sohn-reveal-animate');
    onComplete();
  }, ULTRA_SOHN_REVEAL_DURATION_MS);
}

function showUltraSohnEncounter(onComplete) {
  const monster = MONSTERS.find(m => m.id === ULTRA_SOHN_ID);
  const encText = document.querySelector('#battle-encounter-screen .encounter-text');
  if (encText) {
    encText.textContent = 'The Ultra Sohn rises before you!';
  }
  const encCanvas = document.getElementById('encounter-monster-canvas');
  encCanvas.width = 128;
  encCanvas.height = 128;
  encCanvas.classList.add('encounter-monster-ultra');
  const encCtx = encCanvas.getContext('2d');
  encCtx.clearRect(0, 0, encCanvas.width, encCanvas.height);
  if (monster) drawMonsterSprite(encCtx, monster, encCanvas.width, encCanvas.height);
  screens.encounter.classList.remove('hidden');
  setTimeout(() => {
    screens.encounter.classList.add('hidden');
    encCanvas.width = 96;
    encCanvas.height = 96;
    encCanvas.classList.remove('encounter-monster-ultra');
    if (encText) {
      encText.innerHTML =
        'A wild <span id="encounter-monster-name">monster</span> appeared!';
    }
    onComplete();
  }, BATTLE_ANIMATION_DURATION);
}

function startBattle() {
  saveGame();
  const monster = getRandomUncaughtMonster();
  if (!monster) {
    drawOverworld();
    return;
  }

  gameState.inBattle = true;
  document.removeEventListener('keydown', handleOverworldKey);
  gameState.currentBattle = createBattleState(monster);

  if (!gameState.megaTeamActive && monster.id === THE_SOHN_ID) {
    showSohnReveal(beginBattleScreen);
    return;
  }

  if (gameState.goldenLeagueActive && monster.id === ULTRA_SOHN_ID) {
    showUltraSohnReveal(() => {
      showUltraSohnEncounter(beginBattleScreen);
    });
    return;
  }

  showStandardEncounter(monster, beginBattleScreen);
}

function updateAttackMeterDisplay() {
  const pct = (gameState.attackMeter / ATTACK_METER_MAX) * 100;
  document.getElementById('attack-meter-bar').style.width = `${pct}%`;
  document.getElementById('attack-meter-text').textContent =
    `${gameState.attackMeter}/${ATTACK_METER_MAX}`;
}

function detachEnterNextProblemListener() {
  document.removeEventListener('keydown', handleEnterNextProblem, true);
}

function handleEnterNextProblem(e) {
  if (e.key !== 'Enter') return;
  const b = gameState.currentBattle;
  if (!b || !b.waitingForAttackChoice) return;
  if (gameState.attackMeter >= ATTACK_METER_MAX) return;
  e.preventDefault();
  e.stopPropagation();
  goToNextProblem();
}

function attachEnterNextProblemListener() {
  detachEnterNextProblemListener();
  document.addEventListener('keydown', handleEnterNextProblem, true);
}

function getAttackById(attackId) {
  return ATTACKS.find(a => a.id === attackId) || STAR_ATTACKS.find(a => a.id === attackId);
}

function updateBattleStarButton() {
  const starBtn = document.getElementById('battle-star-btn');
  const starLabel = document.getElementById('battle-star-label');
  const show = gameState.starMovesUnlocked;
  if (starBtn) starBtn.classList.toggle('hidden', !show);
  if (starLabel) starLabel.classList.toggle('hidden', !show);
}

function renderStarAttackButtons() {
  const container = document.getElementById('star-attack-buttons');
  if (!container) return;
  container.innerHTML = '';
  if (!gameState.starMovesUnlocked || !gameState.battleStarMovesOpen) {
    container.classList.add('hidden');
    return;
  }
  const b = gameState.currentBattle;
  if (!b?.waitingForAttackChoice) {
    container.classList.add('hidden');
    return;
  }
  container.classList.remove('hidden');
  STAR_ATTACKS.forEach(a => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'attack-btn attack-btn-star';
    btn.textContent = `${a.name} (${a.cost}) → ${a.damage} dmg`;
    btn.disabled = gameState.attackMeter < a.cost;
    btn.onclick = () => handleAttack(a.id);
    container.appendChild(btn);
  });
}

function toggleBattleStarMoves() {
  const b = gameState.currentBattle;
  if (!gameState.starMovesUnlocked || !b?.waitingForAttackChoice) return;
  gameState.battleStarMovesOpen = !gameState.battleStarMovesOpen;
  renderStarAttackButtons();
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
  const waiting = gameState.currentBattle?.waitingForAttackChoice;
  panel.classList.toggle('hidden', !waiting);
  const nextBtn = document.getElementById('next-problem-btn');
  if (nextBtn) nextBtn.disabled = gameState.attackMeter >= ATTACK_METER_MAX;
  if (waiting) {
    attachEnterNextProblemListener();
    renderStarAttackButtons();
  } else {
    gameState.battleStarMovesOpen = false;
    renderStarAttackButtons();
  }
  updateBattleStarButton();
}

function renderBattle() {
  const b = gameState.currentBattle;
  const spriteCanvas = document.getElementById('monster-sprite-canvas');
  const spriteCtx = spriteCanvas.getContext('2d');
  spriteCtx.clearRect(0, 0, spriteCanvas.width, spriteCanvas.height);
  drawMonsterSprite(spriteCtx, b.monster, spriteCanvas.width, spriteCanvas.height);
  const spriteWrap = document.querySelector('.monster-sprite-wrap');
  if (spriteWrap) {
    spriteWrap.classList.toggle('golden-monster-glow', !!b.monster.goldenForm);
    spriteWrap.classList.toggle('ultra-boss-glow', !!b.monster.ultraBoss);
  }
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

  renderAnswerUI(b.problem);

  document.getElementById('feedback-text').textContent = '';
  document.getElementById('feedback-text').className = 'feedback';
  hideWrongAnswerReveal();
  document.getElementById('attack-buttons-panel').classList.add('hidden');
  gameState.battleStarMovesOpen = false;
  renderStarAttackButtons();
  detachEnterNextProblemListener();
  updateBattleStarButton();
}

function showWrongAnswerReveal(problem) {
  const reveal = document.getElementById('wrong-answer-reveal');
  const equation = document.getElementById('wrong-answer-reveal-equation');
  if (equation) {
    equation.textContent = `${problem.a} × ${problem.b} = ${problem.answer}`;
  }
  reveal?.classList.remove('hidden');

  document.querySelectorAll('#answer-choice-panel .answer-btn').forEach(btn => {
    btn.classList.remove('answer-btn-reveal-correct');
    if (parseInt(btn.textContent, 10) === problem.answer) {
      btn.classList.add('answer-btn-reveal-correct');
    }
  });
}

function hideWrongAnswerReveal() {
  document.getElementById('wrong-answer-reveal')?.classList.add('hidden');
  document.querySelectorAll('#answer-choice-panel .answer-btn').forEach(btn => {
    btn.classList.remove('answer-btn-reveal-correct');
  });
}

function setAnswerInputsEnabled(enabled) {
  const mode = gameState.currentBattle?.currentAnswerMode;
  if (mode === 'choice') {
    document.querySelectorAll('#answer-choice-panel .answer-btn').forEach(btn => {
      btn.disabled = !enabled;
    });
    return;
  }
  const answerInput = document.getElementById('answer-input');
  const submitBtn = document.getElementById('answer-submit-btn');
  if (answerInput) {
    if (!enabled) answerInput.value = '';
    answerInput.disabled = !enabled;
    if (enabled) answerInput.focus();
  }
  if (submitBtn) submitBtn.disabled = !enabled;
}

function renderAnswerUI(problem) {
  const mode = getAnswerModeForProblem(problem);
  gameState.currentBattle.currentAnswerMode = mode;

  const hint = document.getElementById('answer-mode-hint');
  const choicePanel = document.getElementById('answer-choice-panel');
  const answerForm = document.getElementById('answer-form');

  hint?.classList.remove('hidden');
  answerForm?.removeEventListener('submit', handleAnswerSubmit);

  if (mode === 'choice') {
    if (hint) {
      hint.textContent = factNeedsChoiceReview(problem)
        ? 'Pick one — practicing a fact you missed'
        : 'Pick one';
    }
    choicePanel?.classList.remove('hidden');
    answerForm?.classList.add('hidden');
    if (choicePanel) {
      choicePanel.innerHTML = '';
      const answers = buildMultipleChoiceAnswers(problem.answer);
      answers.forEach(ans => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'answer-btn';
        btn.textContent = ans;
        btn.onclick = () => handleAnswer(ans);
        choicePanel.appendChild(btn);
      });
    }
  } else {
    if (hint) hint.textContent = 'Type your answer';
    choicePanel?.classList.add('hidden');
    if (choicePanel) choicePanel.innerHTML = '';
    answerForm?.classList.remove('hidden');
    answerForm?.addEventListener('submit', handleAnswerSubmit);
    setAnswerInputsEnabled(true);
  }
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
  setAnswerInputsEnabled(false);

  gameState.problemsTotal++;

  const isCorrect = answer === b.problem.answer;
  const inputMode = b.currentAnswerMode || 'typed';
  recordAnswerResult(b.problem, isCorrect, inputMode);

  const feedback = document.getElementById('feedback-text');
  if (isCorrect) {
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
    const applyHpPenalty = !b.wrongHpPenaltyApplied;
    if (applyHpPenalty) {
      b.wrongHpPenaltyApplied = true;
      gameState.playerHealth = Math.max(0, gameState.playerHealth - WRONG_ANSWER_DAMAGE);
      updatePlayerHealthDisplay();
    }
    feedback.textContent = applyHpPenalty
      ? `Wrong! -${WRONG_ANSWER_DAMAGE} HP`
      : 'Wrong! Try again.';
    feedback.className = 'feedback incorrect';
    showWrongAnswerReveal(b.problem);

    if (gameState.playerHealth <= 0) {
      setTimeout(() => gameOver(false), WRONG_ANSWER_REVEAL_MS);
    } else {
      setTimeout(() => {
        hideWrongAnswerReveal();
        feedback.textContent = '';
        feedback.className = 'feedback';
        setAnswerInputsEnabled(true);
      }, WRONG_ANSWER_REVEAL_MS);
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
  } else if (attackId === 'sharp-stars') {
    overlay.classList.add('attack-effect-sharp-stars');
    for (let i = 0; i < 40; i++) {
      const s = document.createElement('span');
      s.className = 'sharp-star';
      s.textContent = '★';
      s.style.left = Math.random() * 100 + '%';
      s.style.top = Math.random() * 100 + '%';
      s.style.animationDelay = (Math.random() * 0.5) + 's';
      content.appendChild(s);
    }
  } else if (attackId === 'handcuffs') {
    overlay.classList.add('attack-effect-handcuffs');
    const cuffs = document.createElement('div');
    cuffs.className = 'handcuffs-burst';
    cuffs.textContent = '⛓️⛓️';
    content.appendChild(cuffs);
  } else if (attackId === 'rage') {
    overlay.classList.add('attack-effect-rage');
    const rage = document.createElement('div');
    rage.className = 'rage-burst';
    rage.textContent = '💢🔥💢';
    content.appendChild(rage);
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
  const attack = getAttackById(attackId);
  if (!attack || gameState.attackMeter < attack.cost) return;
  if (attack.starOnly && !gameState.starMovesUnlocked) return;
  if (!attack.starOnly && gameState.playerLevel < (attack.minLevel || 1)) return;

  detachEnterNextProblemListener();
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
  detachEnterNextProblemListener();
  document.getElementById('next-problem-btn').removeEventListener('click', goToNextProblem);
  b.waitingForAttackChoice = false;
  document.getElementById('attack-buttons-panel').classList.add('hidden');
  nextProblem();
}

function nextProblem() {
  gameState.currentBattle.problem = generateProblem();
  gameState.currentBattle.waitingForAttackChoice = false;
  gameState.currentBattle.wrongHpPenaltyApplied = false;
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

function showLevelUp(monster, newLevel, healAmount, onComplete) {
  document.getElementById('level-up-new-level').textContent = newLevel;
  document.getElementById('level-up-monster-name').textContent = monster.name;
  const healTextEl = document.getElementById('level-up-heal-text');
  if (healTextEl) healTextEl.textContent = `Healed +${healAmount} HP!`;
  const levelUpHealthBar = document.getElementById('level-up-health-bar');
  const levelUpHealthText = document.getElementById('level-up-health-text');
  if (levelUpHealthBar) {
    const hpPct = (gameState.playerHealth / gameState.playerMaxHealth) * 100;
    levelUpHealthBar.style.width = `${hpPct}%`;
  }
  if (levelUpHealthText) {
    levelUpHealthText.textContent = `${gameState.playerHealth}/${gameState.playerMaxHealth}`;
  }

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
  const caughtBandihoot = b.monster.id === BANDIHOOT_ID;
  gameState.caughtMonsters.push(b.monster.id);
  if (caughtBandihoot) {
    gameState.bandihootX = null;
    gameState.bandihootY = null;
  }
  const beforeHeal = gameState.playerHealth;
  gameState.playerHealth = Math.min(gameState.playerMaxHealth, gameState.playerHealth + HEAL_AFTER_CATCH);
  const healed = gameState.playerHealth - beforeHeal;
  gameState.playerLevel++;
  syncAnswerModeOnLevelUp(gameState.playerLevel);
  gameState.playerAttack = 4 + gameState.playerLevel;
  updatePlayerHealthDisplay();
  saveGame();

  screens.battle.classList.add('hidden');
  gameState.inBattle = false;
  playNonBattleMusic();

  const newLevel = gameState.playerLevel;

  showLevelUp(b.monster, newLevel, healed, () => {
    if (hasCaughtAllOriginals() && !gameState.megaTeamActive) {
      showAlexMegaTeamOverlay(ALEX_MEGA_TEAM_SENTENCES, () => {
        gameState.megaTeamActive = true;
        gameState.stepsUntilEncounter = rollNextEncounter();
        screens.overworld.classList.remove('hidden');
        updateHUD();
        drawOverworld();
        document.addEventListener('keydown', handleOverworldKey);
        saveGame();
      });
    } else if (hasCaughtAllPreGoldenLeagueMonsters() && !gameState.goldenLeagueActive) {
      showGoldenLeagueIntro(() => beginGoldenLeague());
    } else if (gameState.goldenLeagueActive && hasCaughtUltraSohn()) {
      showGameOver(true);
    } else {
      gameState.stepsUntilEncounter = rollNextEncounter();
      screens.overworld.classList.remove('hidden');
      updateHUD();
      drawOverworld();
      document.addEventListener('keydown', handleOverworldKey);
      saveGame();
    }
  });
}

function gameOver(won) {
  screens.battle.classList.add('hidden');
  screens.encounter.classList.add('hidden');
  if (screens.sohnReveal) screens.sohnReveal.classList.add('hidden');
  if (screens.ultraSohnReveal) screens.ultraSohnReveal.classList.add('hidden');
  if (screens.kalaarAlexDialog) screens.kalaarAlexDialog.classList.add('hidden');
  if (screens.goldenLeague) screens.goldenLeague.classList.add('hidden');
  gameState.inBattle = false;
  playNonBattleMusic();
  showGameOver(won);
}

const ALEX_MEGA_TEAM_SENTENCES = [
  'Hello, welcome to the Mega Team.',
  'Here you will use your monsters to fight Mega Monsters and catch them.',
  'But, somehow, a really strange monster called the Golden Sohn has appeared!',
  'Let\'s see if you can catch him!',
];

const GOLDEN_LEAGUE_SENTENCES = [
  'Congratulations! You have caught every monster!',
  'Welcome to the Golden League!',
  'You are entering the Land of Golda.',
  'Catch all of your original monsters again — in their magnificent GOLDEN forms!',
];

let alexMegaTeamCleanup = null;
let goldenLeagueCleanup = null;

function showGoldenLeagueIntro(onComplete) {
  document.removeEventListener('keydown', handleOverworldKey);
  showAlexStyleOverlay({
    screen: screens.goldenLeague,
    msgEl: document.getElementById('golden-league-message'),
    hintEl: document.getElementById('golden-league-hint'),
    goBtn: document.getElementById('golden-league-go-btn'),
    contentEl: document.querySelector('.golden-league-content'),
    sentences: GOLDEN_LEAGUE_SENTENCES,
    onComplete,
    cleanupRef: () => goldenLeagueCleanup,
    setCleanup: fn => { goldenLeagueCleanup = fn; },
  });
}

function showAlexStyleOverlay(opts) {
  const {
    screen, msgEl, hintEl, goBtn, contentEl, sentences, onComplete,
    cleanupRef, setCleanup,
  } = opts;
  const prev = cleanupRef();
  if (prev) prev();

  if (!msgEl || !screen || !sentences?.length) {
    onComplete?.();
    return;
  }

  let index = 0;
  const lastIndex = sentences.length - 1;

  function render() {
    msgEl.textContent = sentences[index];
    const onLast = index >= lastIndex;
    if (hintEl) hintEl.classList.toggle('hidden', onLast);
    if (goBtn) goBtn.classList.toggle('hidden', !onLast);
  }

  function finish() {
    const c = cleanupRef();
    if (c) c();
    setCleanup(null);
    screen.classList.add('hidden');
    onComplete?.();
  }

  function advance() {
    if (index < lastIndex) {
      index++;
      render();
    } else {
      finish();
    }
  }

  function onKeyDown(e) {
    if (e.repeat) return;
    e.preventDefault();
    advance();
  }

  function onContentClick(e) {
    if (goBtn && !goBtn.classList.contains('hidden') && e.target === goBtn) return;
    advance();
  }

  function onGoClick(e) {
    e.stopPropagation();
    advance();
  }

  window.addEventListener('keydown', onKeyDown, true);
  if (contentEl) contentEl.addEventListener('click', onContentClick);
  if (goBtn) goBtn.addEventListener('click', onGoClick);

  setCleanup(() => {
    window.removeEventListener('keydown', onKeyDown, true);
    if (contentEl) contentEl.removeEventListener('click', onContentClick);
    if (goBtn) goBtn.removeEventListener('click', onGoClick);
  });

  render();
  screen.classList.remove('hidden');
}

function showAlexMegaTeamOverlay(sentences, onComplete) {
  if (alexMegaTeamCleanup) {
    alexMegaTeamCleanup();
    alexMegaTeamCleanup = null;
  }

  const msgEl = document.getElementById('alex-mega-team-message');
  const hintEl = document.getElementById('alex-mega-team-hint');
  const goBtn = document.getElementById('alex-mega-team-go-btn');
  const contentEl = document.querySelector('.alex-mega-team-content');
  if (!msgEl || !screens.alexMegaTeam || !sentences || sentences.length === 0) {
    onComplete();
    return;
  }

  if (sentences === ALEX_MEGA_TEAM_SENTENCES) {
    beginMegaLeagueMusic();
  }

  let index = 0;
  const lastIndex = sentences.length - 1;

  function render() {
    msgEl.textContent = sentences[index];
    const onLast = index >= lastIndex;
    if (hintEl) {
      hintEl.classList.toggle('hidden', onLast);
    }
    if (goBtn) {
      goBtn.classList.toggle('hidden', !onLast);
    }
  }

  function finish() {
    if (alexMegaTeamCleanup) {
      alexMegaTeamCleanup();
      alexMegaTeamCleanup = null;
    }
    screens.alexMegaTeam.classList.add('hidden');
    onComplete();
  }

  function advance() {
    if (index < lastIndex) {
      index++;
      render();
    } else {
      finish();
    }
  }

  function onKeyDown(e) {
    if (e.repeat) return;
    e.preventDefault();
    advance();
  }

  function onContentClick(e) {
    if (goBtn && !goBtn.classList.contains('hidden') && e.target === goBtn) return;
    advance();
  }

  function onGoClick(e) {
    e.stopPropagation();
    advance();
  }

  window.addEventListener('keydown', onKeyDown, true);
  if (contentEl) contentEl.addEventListener('click', onContentClick);
  if (goBtn) goBtn.addEventListener('click', onGoClick);

  alexMegaTeamCleanup = () => {
    window.removeEventListener('keydown', onKeyDown, true);
    if (contentEl) contentEl.removeEventListener('click', onContentClick);
    if (goBtn) goBtn.removeEventListener('click', onGoClick);
  };

  render();
  screens.alexMegaTeam.classList.remove('hidden');
}

function showGameOver(won) {
  if (won) clearSavedGame(gameState.mode);
  screens.overworld.classList.add('hidden');
  screens.gameOver.classList.remove('hidden');
  screens.gameOver.classList.toggle('lost', !won);

  document.getElementById('game-over-title').textContent = won
    ? "🎉 You've Caught Them All! 🎉"
    : "💔 Game Over 💔";
  const beatUltraSohn = won && hasCaughtUltraSohn();
  document.getElementById('game-over-msg').textContent = won
    ? beatUltraSohn
      ? 'Congratulations! You defeated the Ultra Sohn and conquered the Golden League!'
      : `Congratulations! You collected all ${MONSTER_COUNT} monsters from Multiplication Land!`
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
    pauseAllMusic();
    showStartScreen();
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

document.getElementById('game-container').addEventListener('click', e => {
  if (e.target.closest('.music-mute-btn')) {
    e.preventDefault();
    toggleThemeMute();
  }
});
syncMusicMuteButtons();

document.getElementById('char-boy').onclick = () => setCharacter('boy');
document.getElementById('char-girl').onclick = () => setCharacter('girl');
document.getElementById('save-continue-btn')?.addEventListener('click', () => {
  if (pendingLaunchMode != null) continueSavedGame(pendingLaunchMode);
});
document.getElementById('save-new-game-btn')?.addEventListener('click', () => {
  if (pendingLaunchMode != null) startNewGame(pendingLaunchMode);
});
document.getElementById('save-cancel-btn')?.addEventListener('click', hideSaveChoiceDialog);
document.getElementById('save-choice-dialog')?.addEventListener('click', e => {
  if (e.target.id === 'save-choice-dialog') hideSaveChoiceDialog();
});
MODE_LAUNCH_OPTIONS.forEach(({ elementId, mode }) => {
  const btn = document.getElementById(elementId);
  if (btn) btn.onclick = () => promptModeLaunch(mode);
});
updateModeSaveBadges();

const battleStarBtn = document.getElementById('battle-star-btn');
if (battleStarBtn) {
  battleStarBtn.addEventListener('click', e => {
    e.stopPropagation();
    toggleBattleStarMoves();
  });
}

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

import { QUIZ_QUESTIONS, type QuizQuestion } from '../data/quiz';
import {
  NORMAL_ENEMY_NAMES,
  BOSS_NAMES,
  SKIN_COLORS,
  HAIR_COLORS,
  HAIR_STYLES,
  OUTFIT_STYLES,
  OUTFIT_COLOR_KEYS,
  LOOKS_BY_GENDER,
  getLooks,
  pickRandom,
  seededPick,
  type Gender,
  type HairStyleId,
  type OutfitStyleId,
  type OutfitColorKey,
  type Look,
} from '../data/rpg';
import { SoundEngine } from './soundEngine';
import {
  drawSprite,
  drawStage,
  drawImpact,
  drawHeartIcon,
  drawReviveIcon,
  drawCutIcon,
  drawHintIcon,
  drawMuteIcon,
  drawVinylDisc,
  drawProfessorPortrait,
  preloadAllSprites,
  onSpritesLoaded,
  type Pose,
} from './spriteEngine';

type Difficulty = 'Iniciante' | 'Intermediário' | 'Avançado';
type Screen = 'cover' | 'creation' | 'walk' | 'battle' | 'gameover';

interface CharacterConfig {
  name: string;
  gender: Gender;
  skin: string;
  look: string;
  hairStyle: HairStyleId;
  hair: string;
  outfitStyle: OutfitStyleId;
  outfit: OutfitColorKey;
}

interface Enemy {
  name: string;
  isBoss: boolean;
  hp: number;
  maxHp: number;
  gender: Gender;
  skin: string;
  hair: string;
  hairStyle: HairStyleId;
  outfit: OutfitColorKey;
  outfitStyle: OutfitStyleId;
  bossTint: string | null;
}

interface LeaderboardEntry {
  name: string;
  score: number;
  bosses: number;
  difficulty: string;
  date: string;
}

const HEARTS_MAX = 3;
// Tempo de resposta começa em QUESTION_TIME_START e cai QUESTION_TIME_STEP
// segundos a cada resposta, até o piso QUESTION_TIME_MIN — fica mais apertado
// aos poucos ao longo da corrida, sem depender de uma dificuldade escolhida.
const QUESTION_TIME_START = 20;
const QUESTION_TIME_MIN = 7;
const QUESTION_TIME_STEP = 0.35;
const TIER_ORDER: Difficulty[] = ['Iniciante', 'Intermediário', 'Avançado'];
const BOSS_TINTS = ['#ffd23f', '#ff6b6b', '#8e44ad', '#3ddc84'];
const MEDAL_COLORS = ['#ffd23f', '#c9c9d4', '#c98a4b'];

const STORAGE_KEY = 'rsq-character';
const MUTE_KEY = 'rsq-muted';

function shuffle<T>(arr: T[]): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function qs<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

export function initRpgGame() {
  // ── Referências de DOM ──
  const header = qs<HTMLDivElement>('rsq-header');
  const coverScreen = qs<HTMLDivElement>('rsq-cover-screen');
  const creationScreen = qs<HTMLDivElement>('rsq-creation-screen');
  const walkScreen = qs<HTMLDivElement>('rsq-walk-screen');
  const battleScreen = qs<HTMLDivElement>('rsq-battle-screen');
  const gameoverScreen = qs<HTMLDivElement>('rsq-gameover-screen');

  const muteBtn = qs<HTMLButtonElement>('rsq-mute-btn');
  const muteBtnCover = qs<HTMLButtonElement>('rsq-mute-btn-cover');
  const muteIconCanvas = qs<HTMLCanvasElement>('rsq-mute-icon');
  const muteIconCoverCanvas = qs<HTMLCanvasElement>('rsq-mute-icon-cover');
  const muteIconCtx = muteIconCanvas.getContext('2d')!;
  const muteIconCoverCtx = muteIconCoverCanvas.getContext('2d')!;

  const playBtn = qs<HTMLButtonElement>('rsq-play-btn');

  const previewCanvas = qs<HTMLCanvasElement>('rsq-preview-canvas');
  const previewCtx = previewCanvas.getContext('2d')!;
  const nameInput = qs<HTMLInputElement>('rsq-name-input');
  const lookGrid = qs<HTMLDivElement>('rsq-look-grid');
  const startBtn = qs<HTMLButtonElement>('rsq-start-btn');
  const creationError = qs<HTMLParagraphElement>('rsq-creation-error');

  const walkPlayerCanvas = qs<HTMLCanvasElement>('rsq-walk-player-canvas');
  const walkEnemyCanvas = qs<HTMLCanvasElement>('rsq-walk-enemy-canvas');
  const walkPlayerCard = qs<HTMLDivElement>('rsq-vs-player-card');
  const walkEnemyCard = qs<HTMLDivElement>('rsq-vs-enemy-card');
  const walkVsWord = qs<HTMLDivElement>('rsq-vs-label');
  const walkCaption = qs<HTMLDivElement>('rsq-walk-caption');

  const heartsEl = qs<HTMLDivElement>('rsq-hearts');
  const roundLabel = qs<HTMLDivElement>('rsq-round-label');
  const scoreLabel = qs<HTMLDivElement>('rsq-score-label');
  const enemyLabel = qs<HTMLDivElement>('rsq-enemy-label');
  const enemyHpEl = qs<HTMLDivElement>('rsq-enemy-hp');
  const battleCanvas = qs<HTMLCanvasElement>('rsq-battle-canvas');
  const battleCtx = battleCanvas.getContext('2d')!;
  const timerBar = qs<HTMLDivElement>('rsq-timer-bar');
  const questionEl = qs<HTMLHeadingElement>('rsq-question');
  const optionsContainer = qs<HTMLDivElement>('rsq-options');
  const hintBox = qs<HTMLDivElement>('rsq-hint-box');
  const hintText = qs<HTMLSpanElement>('rsq-hint-text');
  const professorCanvas = qs<HTMLCanvasElement>('rsq-professor-canvas');
  const professorCtx = professorCanvas.getContext('2d')!;

  const itemReviveBtn = qs<HTMLButtonElement>('rsq-item-revive');
  const itemCutBtn = qs<HTMLButtonElement>('rsq-item-cut');
  const itemHintBtn = qs<HTMLButtonElement>('rsq-item-hint');
  const itemReviveCtx = itemReviveBtn.querySelector('canvas')!.getContext('2d')!;
  const itemCutCtx = itemCutBtn.querySelector('canvas')!.getContext('2d')!;
  const itemHintCtx = itemHintBtn.querySelector('canvas')!.getContext('2d')!;

  const vinylCanvas = qs<HTMLCanvasElement>('rsq-vinyl-canvas');
  const vinylCtx = vinylCanvas.getContext('2d')!;
  const finalScoreEl = qs<HTMLDivElement>('rsq-final-score');
  const finalBossesEl = qs<HTMLDivElement>('rsq-final-bosses');
  const finalDifficultyEl = qs<HTMLDivElement>('rsq-final-difficulty');
  const nameSubmitInput = qs<HTMLInputElement>('rsq-name-submit-input');
  const submitScoreBtn = qs<HTMLButtonElement>('rsq-submit-score-btn');
  const submitStatus = qs<HTMLParagraphElement>('rsq-submit-status');
  const leaderboardList = qs<HTMLOListElement>('rsq-leaderboard-list');
  const playAgainBtn = qs<HTMLButtonElement>('rsq-play-again-btn');

  // ── Estado do personagem ──
  const defaultLook = LOOKS_BY_GENDER.male[0];
  const character: CharacterConfig = {
    name: '',
    gender: 'male',
    skin: SKIN_COLORS[0],
    look: defaultLook.id,
    hairStyle: defaultLook.hairStyle,
    hair: defaultLook.hair,
    outfitStyle: defaultLook.outfitStyle,
    outfit: defaultLook.outfit,
  };

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && typeof saved === 'object') Object.assign(character, saved);
  } catch {
    /* ignora */
  }

  function saveCharacter() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(character));
    } catch {
      /* ignora (localStorage indisponível) */
    }
  }

  // ── Som: mudo ──
  let muted = false;
  try {
    muted = localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    /* ignora */
  }
  SoundEngine.muted = muted;

  function drawMuteIcons() {
    drawMuteIcon(muteIconCtx, muteIconCanvas.width, muteIconCanvas.height, muted);
    drawMuteIcon(muteIconCoverCtx, muteIconCoverCanvas.width, muteIconCoverCanvas.height, muted);
  }
  drawMuteIcons();

  function toggleMute() {
    muted = !muted;
    SoundEngine.setMuted(muted);
    try {
      localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    } catch {
      /* ignora */
    }
    drawMuteIcons();
  }
  muteBtn.addEventListener('click', toggleMute);
  muteBtnCover.addEventListener('click', toggleMute);

  // ── Navegação entre telas ──
  let screenName: Screen = 'cover';
  function showScreen(name: Screen) {
    screenName = name;
    header.classList.toggle('hidden', name === 'cover');
    coverScreen.classList.toggle('hidden', name !== 'cover');
    creationScreen.classList.toggle('hidden', name !== 'creation');
    walkScreen.classList.toggle('hidden', name !== 'walk');
    battleScreen.classList.toggle('hidden', name !== 'battle');
    gameoverScreen.classList.toggle('hidden', name !== 'gameover');
  }

  // ── Sprites: preload + redraw quando as imagens terminarem de carregar ──
  onSpritesLoaded(() => {
    if (screenName === 'creation') renderLookGrid();
    if (screenName === 'walk') drawWalkCards();
    drawProfessorPortrait(professorCtx, professorCanvas.width, professorCanvas.height);
  });
  preloadAllSprites();
  drawProfessorPortrait(professorCtx, professorCanvas.width, professorCanvas.height);
  drawReviveIcon(itemReviveCtx, 32, 32);
  drawCutIcon(itemCutCtx, 32, 32);
  drawHintIcon(itemHintCtx, 32, 32);

  // ── Tela: criação de personagem ──
  function renderLookGrid() {
    lookGrid.innerHTML = '';
    getLooks(character.gender).forEach((look) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'look-swatch';
      btn.dataset.look = look.id;
      btn.classList.toggle('is-active', look.id === character.look);

      const canvas = document.createElement('canvas');
      canvas.width = 60;
      canvas.height = 76;
      canvas.style.width = '44px';
      canvas.style.height = '55px';
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;
      drawSprite(ctx, {
        x: canvas.width / 2,
        groundY: canvas.height - 4,
        scale: 1.15,
        skin: character.skin,
        hair: look.hair,
        hairStyle: look.hairStyle,
        outfit: look.outfit,
        outfitStyle: look.outfitStyle,
        gender: character.gender,
        facing: 1,
        pose: 'idle',
        t: 0,
      });

      const label = document.createElement('span');
      label.textContent = look.label;

      btn.append(canvas, label);
      btn.addEventListener('click', () => selectLook(look));
      lookGrid.appendChild(btn);
    });
  }

  function syncCreationUI() {
    nameInput.value = character.name;
    document.querySelectorAll<HTMLElement>('.gender-swatch').forEach((el) => {
      el.classList.toggle('is-active', el.dataset.gender === character.gender);
    });
    document.querySelectorAll<HTMLElement>('.skin-swatch').forEach((el) => {
      el.classList.toggle('is-active', el.dataset.skin === character.skin);
    });
    renderLookGrid();
  }

  function selectGender(gender: Gender) {
    SoundEngine.playClick();
    const looks = getLooks(gender);
    const matched = looks.find((l) => l.id === character.look) || looks[0];
    character.gender = gender;
    character.look = matched.id;
    character.hairStyle = matched.hairStyle;
    character.hair = matched.hair;
    character.outfitStyle = matched.outfitStyle;
    character.outfit = matched.outfit;
    syncCreationUI();
  }

  function selectSkin(color: string) {
    SoundEngine.playClick();
    character.skin = color;
    syncCreationUI();
  }

  function selectLook(look: Look) {
    SoundEngine.playClick();
    character.look = look.id;
    character.hairStyle = look.hairStyle;
    character.hair = look.hair;
    character.outfitStyle = look.outfitStyle;
    character.outfit = look.outfit;
    syncCreationUI();
  }

  document.querySelectorAll<HTMLElement>('.gender-swatch').forEach((el) => {
    el.addEventListener('click', () => selectGender(el.dataset.gender as Gender));
  });
  document.querySelectorAll<HTMLElement>('.skin-swatch').forEach((el) => {
    el.addEventListener('click', () => selectSkin(el.dataset.skin!));
  });
  nameInput.addEventListener('input', () => {
    character.name = nameInput.value.slice(0, 16);
    creationError.classList.add('hidden');
  });

  syncCreationUI();

  // ── Preview do personagem (loop contínuo, ativo apenas na tela de criação) ──
  let previewRaf = 0;
  let previewStart = 0;
  function previewFrame(now: number) {
    const t = (now - previewStart) / 1000;
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    previewCtx.fillStyle = '#150b1f';
    previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
    previewCtx.imageSmoothingEnabled = false;
    drawSprite(previewCtx, {
      x: 80,
      groundY: 150,
      scale: 1.85,
      skin: character.skin,
      hair: character.hair,
      hairStyle: character.hairStyle,
      outfit: character.outfit,
      outfitStyle: character.outfitStyle,
      gender: character.gender,
      facing: 1,
      pose: 'idle',
      t,
    });
    previewRaf = requestAnimationFrame(previewFrame);
  }
  function startPreviewLoop() {
    cancelAnimationFrame(previewRaf);
    previewStart = performance.now();
    previewRaf = requestAnimationFrame(previewFrame);
  }
  startPreviewLoop();

  playBtn.addEventListener('click', () => {
    SoundEngine.startMusic();
    showScreen('creation');
  });

  startBtn.addEventListener('click', () => {
    character.name = nameInput.value.trim().slice(0, 16);
    if (!character.name) {
      creationError.classList.remove('hidden');
      return;
    }
    creationError.classList.add('hidden');
    saveCharacter();
    cancelAnimationFrame(previewRaf);
    SoundEngine.setBattleMode(false, true);
    startRun();
  });

  // ── Estado da corrida (run) ──
  let hearts = HEARTS_MAX;
  let score = 0;
  let streak = 0;
  let encounterIndex = 0;
  let bossesDefeated = 0;
  let lastEnemyName = '';

  let hasRevive = false;
  let hasCut = false;
  let hasHint = false;
  let disabledIndices: number[] = [];

  interface QueuedQuestion {
    question: QuizQuestion;
    tier: Difficulty;
  }
  let questionQueue: QueuedQuestion[] = [];
  let lastQuestion: QuizQuestion | null = null;
  let questionsAnswered = 0;
  let highestTier: Difficulty = 'Iniciante';
  let questionTimeTotal = QUESTION_TIME_START;

  let enemy: Enemy | null = null;
  let currentQuestion: QuizQuestion | null = null;
  let timerHandle: number | null = null;
  let timeLeft = 0;
  let answered = false;

  // Fila única, do fácil ao difícil: todas as perguntas de cada nível
  // embaralhadas dentro do próprio nível e concatenadas em ordem crescente
  // de dificuldade. Só reembaralha quando a fila inteira se esgota, então as
  // perguntas não se repetem dentro de uma volta completa.
  function buildQuestionQueue(): QueuedQuestion[] {
    return TIER_ORDER.flatMap((tier) => shuffle(QUIZ_QUESTIONS[tier]).map((question) => ({ question, tier })));
  }

  function nextQuestion(): QuizQuestion {
    if (questionQueue.length === 0) {
      questionQueue = buildQuestionQueue();
      if (lastQuestion && questionQueue[0].question === lastQuestion && questionQueue.length > 1) {
        [questionQueue[0], questionQueue[1]] = [questionQueue[1], questionQueue[0]];
      }
    }
    const entry = questionQueue.shift()!;
    lastQuestion = entry.question;
    if (TIER_ORDER.indexOf(entry.tier) > TIER_ORDER.indexOf(highestTier)) {
      highestTier = entry.tier;
    }
    return entry.question;
  }

  function currentQuestionTime(): number {
    return Math.max(QUESTION_TIME_MIN, QUESTION_TIME_START - questionsAnswered * QUESTION_TIME_STEP);
  }

  function buildEnemy(): Enemy {
    encounterIndex++;
    const isBoss = encounterIndex % 4 === 0;
    let name: string;
    if (isBoss) {
      name = pickRandom(BOSS_NAMES);
    } else {
      do {
        name = pickRandom(NORMAL_ENEMY_NAMES);
      } while (name === lastEnemyName && NORMAL_ENEMY_NAMES.length > 1);
    }
    lastEnemyName = name;
    return {
      name,
      isBoss,
      hp: isBoss ? 3 : 1,
      maxHp: isBoss ? 3 : 1,
      gender: seededPick(['male', 'female'] as const, name + '-g'),
      skin: seededPick(SKIN_COLORS, name + '-s'),
      hair: seededPick(HAIR_COLORS, name + '-h'),
      hairStyle: seededPick(
        HAIR_STYLES.map((h) => h.id),
        name + '-hs',
      ),
      outfit: seededPick(
        OUTFIT_COLOR_KEYS.map((o) => o.key),
        name + '-o',
      ),
      outfitStyle: seededPick(
        OUTFIT_STYLES.map((o) => o.id),
        name + '-os',
      ),
      bossTint: isBoss ? seededPick(BOSS_TINTS, name + '-bt') : null,
    };
  }

  // ── Loop de cena de batalha ──
  let battleAnim: { player: Pose; playerT: number; enemyPose: Pose; enemyT: number; impact: number | null } = {
    player: 'idle',
    playerT: 0,
    enemyPose: 'idle',
    enemyT: 0,
    impact: null,
  };
  let battleRaf = 0;
  let battleStart = 0;

  function battleLoop(now: number) {
    if (!battleStart) battleStart = now;
    const t = (now - battleStart) / 1000;
    const w = battleCanvas.width;
    const h = battleCanvas.height;
    battleCtx.imageSmoothingEnabled = false;
    battleCtx.clearRect(0, 0, w, h);
    drawStage(battleCtx, w, h, t, 0);

    const groundY = h - 24;
    drawSprite(battleCtx, {
      x: 70,
      groundY,
      scale: 2.8,
      skin: character.skin,
      hair: character.hair,
      hairStyle: character.hairStyle,
      outfit: character.outfit,
      outfitStyle: character.outfitStyle,
      gender: character.gender,
      facing: 1,
      pose: battleAnim.player,
      t: battleAnim.player === 'idle' ? t : battleAnim.playerT,
    });

    if (enemy) {
      drawSprite(battleCtx, {
        x: 250,
        groundY,
        scale: enemy.isBoss ? 3.1 : 2.8,
        skin: enemy.skin,
        hair: enemy.hair,
        hairStyle: enemy.hairStyle,
        outfit: enemy.outfit,
        outfitStyle: enemy.outfitStyle,
        gender: enemy.gender,
        facing: -1,
        pose: battleAnim.enemyPose,
        t: battleAnim.enemyPose === 'idle' ? t + 3 : battleAnim.enemyT,
        isBoss: enemy.isBoss,
        bossTint: enemy.bossTint,
      });
    }

    if (battleAnim.impact !== null) {
      drawImpact(battleCtx, 250, groundY - 60, battleAnim.impact);
    }

    battleRaf = requestAnimationFrame(battleLoop);
  }

  function startBattleLoop() {
    cancelAnimationFrame(battleRaf);
    battleStart = 0;
    battleAnim = { player: 'idle', playerT: 0, enemyPose: 'idle', enemyT: 0, impact: null };
    battleRaf = requestAnimationFrame(battleLoop);
  }

  function playAttackAnim(onDone: () => void) {
    const duration = 500;
    const start = performance.now();
    battleAnim.player = 'attack';
    function step(now: number) {
      const p = Math.min((now - start) / duration, 1);
      battleAnim.playerT = p;
      if (p > 0.4) {
        battleAnim.enemyPose = 'hurt';
        battleAnim.enemyT = (now - start) / 90;
        battleAnim.impact = Math.min((p - 0.4) / 0.6, 1);
      }
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        battleAnim.player = 'idle';
        battleAnim.enemyPose = 'idle';
        battleAnim.impact = null;
        onDone();
      }
    }
    requestAnimationFrame(step);
  }

  function playDefeatAnim(onDone: () => void) {
    const duration = 700;
    const start = performance.now();
    battleAnim.enemyPose = 'defeat';
    function step(now: number) {
      const p = Math.min((now - start) / duration, 1);
      battleAnim.enemyT = p;
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        onDone();
      }
    }
    requestAnimationFrame(step);
  }

  function playHurtAnim(onDone: () => void) {
    const duration = 500;
    const start = performance.now();
    battleAnim.player = 'hurt';
    function step(now: number) {
      const p = Math.min((now - start) / duration, 1);
      battleAnim.playerT = (now - start) / 30;
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        battleAnim.player = 'idle';
        onDone();
      }
    }
    requestAnimationFrame(step);
  }

  function playPlayerDefeatAnim(onDone: () => void) {
    const duration = 900;
    const start = performance.now();
    battleAnim.player = 'defeat';
    function step(now: number) {
      const p = Math.min((now - start) / duration, 1);
      battleAnim.playerT = p;
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        onDone();
      }
    }
    requestAnimationFrame(step);
  }

  // ── Transição de encontro (cartão VS) ──
  let walkTimeout: number | null = null;
  let walkTimeoutSlam: number | null = null;

  function drawWalkCards() {
    const playerCtx = walkPlayerCanvas.getContext('2d')!;
    playerCtx.imageSmoothingEnabled = false;
    playerCtx.clearRect(0, 0, walkPlayerCanvas.width, walkPlayerCanvas.height);
    drawSprite(playerCtx, {
      x: walkPlayerCanvas.width / 2,
      groundY: walkPlayerCanvas.height - 6,
      scale: 1.4,
      skin: character.skin,
      hair: character.hair,
      hairStyle: character.hairStyle,
      outfit: character.outfit,
      outfitStyle: character.outfitStyle,
      gender: character.gender,
      facing: 1,
      pose: 'idle',
      t: 0,
    });

    if (!enemy) return;
    const enemyCtx = walkEnemyCanvas.getContext('2d')!;
    enemyCtx.imageSmoothingEnabled = false;
    enemyCtx.clearRect(0, 0, walkEnemyCanvas.width, walkEnemyCanvas.height);
    drawSprite(enemyCtx, {
      x: walkEnemyCanvas.width / 2,
      groundY: walkEnemyCanvas.height - 6,
      scale: enemy.isBoss ? 1.55 : 1.4,
      skin: enemy.skin,
      hair: enemy.hair,
      hairStyle: enemy.hairStyle,
      outfit: enemy.outfit,
      outfitStyle: enemy.outfitStyle,
      gender: enemy.gender,
      facing: -1,
      pose: 'idle',
      t: 0,
      isBoss: enemy.isBoss,
      bossTint: enemy.bossTint,
    });
  }

  function playEncounterTransition(onDone: () => void) {
    if (walkTimeout) clearTimeout(walkTimeout);
    if (walkTimeoutSlam) clearTimeout(walkTimeoutSlam);
    showScreen('walk');
    walkCaption.textContent = enemy ? (enemy.isBoss ? `⚔ ${enemy.name} se aproxima!` : `${enemy.name} apareceu!`) : '';
    [walkPlayerCard, walkEnemyCard, walkVsWord, walkCaption].forEach((el) => el.classList.remove('is-in'));
    drawWalkCards();

    walkTimeoutSlam = window.setTimeout(() => {
      [walkPlayerCard, walkEnemyCard, walkVsWord, walkCaption].forEach((el) => el.classList.add('is-in'));
    }, 60);

    walkTimeout = window.setTimeout(() => {
      SoundEngine.setBattleMode(!!(enemy && enemy.isBoss));
      onDone();
    }, 1350);
  }

  // ── HUD ──
  function renderHearts() {
    heartsEl.innerHTML = '';
    for (let i = 0; i < HEARTS_MAX; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      canvas.style.width = '26px';
      canvas.style.height = '26px';
      drawHeartIcon(canvas.getContext('2d')!, 32, 32, i < hearts);
      heartsEl.appendChild(canvas);
    }
  }

  function renderEnemyHp() {
    enemyHpEl.innerHTML = '';
    if (!enemy) return;
    for (let i = 0; i < enemy.maxHp; i++) {
      const dot = document.createElement('div');
      dot.style.width = '14px';
      dot.style.height = '14px';
      dot.style.borderRadius = '4px';
      dot.style.background = i < enemy!.hp ? '#ffd23f' : 'rgba(255,255,255,0.12)';
      enemyHpEl.appendChild(dot);
    }
  }

  function renderItems() {
    const cutReady = hasCut && !answered;
    const hintReady = hasHint && !answered;
    itemReviveBtn.classList.toggle('is-ready', hasRevive);
    itemReviveBtn.disabled = !hasRevive;
    itemCutBtn.classList.toggle('is-ready', cutReady);
    itemCutBtn.disabled = !cutReady;
    itemHintBtn.classList.toggle('is-ready', hintReady);
    itemHintBtn.disabled = !hintReady;
  }

  function renderHud() {
    renderHearts();
    scoreLabel.textContent = `Pontos: ${score}`;
    const nextBossIn = 4 - ((encounterIndex - 1) % 4);
    roundLabel.textContent = enemy?.isBoss ? 'Batalha contra o Boss' : `Próximo boss em ${nextBossIn}`;
    if (enemy) {
      enemyLabel.textContent = enemy.isBoss ? `⚔ ${enemy.name}` : enemy.name;
      renderEnemyHp();
    }
    renderItems();
  }

  function maybeGrantItems(justWon: boolean) {
    if (hearts === 1 && !hasRevive) {
      hasRevive = true;
    }
    if (streak >= 4 && streak % 4 === 0 && !hasCut) {
      hasCut = true;
    }
    if (justWon && enemy && !enemy.isBoss && !hasHint && Math.random() < 0.3) {
      hasHint = true;
    }
  }

  function startTimer() {
    if (timerHandle) clearInterval(timerHandle);
    questionTimeTotal = currentQuestionTime();
    timeLeft = questionTimeTotal;
    updateTimerBar();
    timerHandle = window.setInterval(() => {
      timeLeft -= 0.1;
      updateTimerBar();
      if (timeLeft <= 0) {
        clearInterval(timerHandle!);
        handleAnswer(null);
      }
    }, 100);
  }

  function updateTimerBar() {
    const pct = Math.max(0, (timeLeft / questionTimeTotal) * 100);
    timerBar.style.width = `${pct}%`;
    timerBar.style.background = pct < 25 ? '#ff6b6b' : '#e63946';
  }

  function renderQuestion() {
    answered = false;
    disabledIndices = [];
    hintBox.classList.add('hidden');
    currentQuestion = nextQuestion();
    questionEl.textContent = currentQuestion.question;
    optionsContainer.innerHTML = '';
    currentQuestion.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.textContent = opt;
      btn.dataset.index = String(i);
      btn.className = 'rsq-option-btn';
      btn.addEventListener('click', () => handleAnswer(i));
      optionsContainer.appendChild(btn);
    });
    renderHud();
    startTimer();
  }

  itemReviveBtn.addEventListener('click', () => {
    if (!hasRevive) return;
    SoundEngine.playItem();
    hasRevive = false;
    hearts = Math.min(HEARTS_MAX, hearts + 1);
    renderHud();
  });

  itemCutBtn.addEventListener('click', () => {
    if (!hasCut || answered || !currentQuestion) return;
    SoundEngine.playItem();
    hasCut = false;
    const wrongIdx = currentQuestion.options.map((_, i) => i).filter((i) => i !== currentQuestion!.correctIndex);
    disabledIndices = shuffle(wrongIdx).slice(0, 2);
    disabledIndices.forEach((i) => {
      const btn = optionsContainer.querySelector<HTMLButtonElement>(`[data-index="${i}"]`);
      if (btn) {
        btn.disabled = true;
        btn.classList.add('is-cut');
      }
    });
    renderHud();
  });

  itemHintBtn.addEventListener('click', () => {
    if (!hasHint || answered || !currentQuestion) return;
    SoundEngine.playItem();
    hasHint = false;
    hintText.textContent = currentQuestion.hint;
    hintBox.classList.remove('hidden');
    renderHud();
  });

  function handleAnswer(index: number | null) {
    if (answered || !currentQuestion) return;
    answered = true;
    if (timerHandle) clearInterval(timerHandle);
    questionsAnswered++;

    const correct = index === currentQuestion.correctIndex;
    const buttons = Array.from(optionsContainer.querySelectorAll<HTMLButtonElement>('.rsq-option-btn'));
    buttons.forEach((b) => {
      b.disabled = true;
      const i = Number(b.dataset.index);
      if (i === currentQuestion!.correctIndex) {
        b.classList.add('is-correct');
      } else if (i === index) {
        b.classList.add('is-wrong');
      } else if (!disabledIndices.includes(i)) {
        b.classList.add('is-faded');
      }
    });
    renderItems();
    SoundEngine.playHit();

    if (correct) {
      streak++;
      score += 10 + streak * 2 + (enemy?.isBoss ? 5 : 0);
      playAttackAnim(() => {
        if (!enemy) return;
        enemy.hp--;
        maybeGrantItems(true);
        renderHud();
        if (enemy.hp <= 0) {
          if (enemy.isBoss) {
            bossesDefeated++;
            score += 50;
          }
          playDefeatAnim(() => {
            proceedToNextEncounter();
          });
        } else {
          setTimeout(() => renderQuestion(), 300);
        }
      });
    } else {
      streak = 0;
      playHurtAnim(() => {
        hearts--;
        maybeGrantItems(false);
        renderHud();
        if (hearts <= 0) {
          playPlayerDefeatAnim(() => endRun());
          return;
        }
        if (enemy?.isBoss) {
          // O boss só cai com 3 acertos — errar não faz ele ir embora.
          setTimeout(() => renderQuestion(), 300);
        } else {
          // Inimigo comum: errou, ele escapa e o próximo oponente aparece.
          proceedToNextEncounter();
        }
      });
    }
  }

  function proceedToNextEncounter() {
    cancelAnimationFrame(battleRaf);
    enemy = buildEnemy();
    playEncounterTransition(() => {
      showScreen('battle');
      startBattleLoop();
      renderQuestion();
    });
  }

  function startRun() {
    hearts = HEARTS_MAX;
    score = 0;
    streak = 0;
    encounterIndex = 0;
    bossesDefeated = 0;
    lastEnemyName = '';
    hasRevive = false;
    hasCut = false;
    hasHint = false;
    questionQueue = [];
    lastQuestion = null;
    questionsAnswered = 0;
    highestTier = 'Iniciante';
    proceedToNextEncounter();
  }

  // ── Fim de jogo e ranking ──
  let gameoverRaf = 0;

  function startVinylSpin() {
    cancelAnimationFrame(gameoverRaf);
    const start = performance.now();
    function step(now: number) {
      const spin = ((now - start) / 1000) * 0.35;
      drawVinylDisc(vinylCtx, vinylCanvas.width, vinylCanvas.height, spin);
      gameoverRaf = requestAnimationFrame(step);
    }
    gameoverRaf = requestAnimationFrame(step);
  }

  async function fetchLeaderboard(): Promise<LeaderboardEntry[] | null> {
    try {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) throw new Error('bad status');
      const data = await res.json();
      return Array.isArray(data.entries) ? data.entries : [];
    } catch {
      return null;
    }
  }

  async function submitScore(entry: { name: string; score: number; bosses: number; difficulty: string }): Promise<LeaderboardEntry[] | null> {
    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (!res.ok) throw new Error('bad status');
      const data = await res.json();
      return Array.isArray(data.entries) ? data.entries : [];
    } catch {
      return null;
    }
  }

  function renderLeaderboard(entries: LeaderboardEntry[]) {
    leaderboardList.innerHTML = '';
    if (entries.length === 0) {
      const li = document.createElement('li');
      li.className = 'text-center text-sm py-2 opacity-60';
      li.textContent = 'Nenhuma pontuação registrada ainda.';
      leaderboardList.appendChild(li);
      return;
    }
    entries.slice(0, 10).forEach((e, i) => {
      const li = document.createElement('li');
      li.className = 'rsq-leaderboard-row';

      const medal = document.createElement('span');
      medal.className = 'rsq-medal';
      medal.style.background = MEDAL_COLORS[i] || 'rgba(255,255,255,0.08)';
      medal.style.color = i < 3 ? '#1a0d22' : '#b9aecb';
      medal.textContent = String(i + 1);

      const name = document.createElement('span');
      name.className = 'flex-1 text-sm font-semibold';
      name.textContent = e.name;

      const scoreEl = document.createElement('span');
      scoreEl.className = 'font-bold text-sm';
      scoreEl.style.color = '#ffd23f';
      scoreEl.textContent = String(e.score);

      li.append(medal, name, scoreEl);
      leaderboardList.appendChild(li);
    });
  }

  async function endRun() {
    cancelAnimationFrame(battleRaf);
    SoundEngine.stopMusic();
    SoundEngine.playGameOver(!!enemy?.isBoss);
    showScreen('gameover');
    startVinylSpin();
    finalScoreEl.textContent = String(score);
    finalBossesEl.textContent = String(bossesDefeated);
    finalDifficultyEl.textContent = highestTier;
    nameSubmitInput.value = character.name;
    submitStatus.textContent = 'Carregando ranking…';
    leaderboardList.innerHTML = '';
    const entries = await fetchLeaderboard();
    if (entries === null) {
      submitStatus.textContent = 'Ranking global indisponível neste ambiente agora — mas sua pontuação ficou registrada aqui na tela.';
    } else {
      submitStatus.textContent = '';
      renderLeaderboard(entries);
    }
  }

  submitScoreBtn.addEventListener('click', async () => {
    const name = nameSubmitInput.value.trim().slice(0, 16) || character.name || 'Anônimo';
    submitStatus.textContent = 'Enviando…';
    submitScoreBtn.disabled = true;
    const entries = await submitScore({ name, score, bosses: bossesDefeated, difficulty: highestTier });
    submitScoreBtn.disabled = false;
    if (entries === null) {
      submitStatus.textContent = 'Não foi possível enviar agora. Tente de novo mais tarde.';
    } else {
      submitStatus.textContent = 'Pontuação enviada!';
      renderLeaderboard(entries);
    }
  });

  playAgainBtn.addEventListener('click', () => {
    cancelAnimationFrame(gameoverRaf);
    SoundEngine.startMusic();
    showScreen('creation');
    syncCreationUI();
    startPreviewLoop();
  });
}

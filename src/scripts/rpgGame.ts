import { QUIZ_QUESTIONS, type QuizQuestion } from '../data/quiz';
import {
  NORMAL_ENEMY_NAMES,
  BOSS_NAMES,
  SKIN_COLORS,
  HAIR_COLORS,
  OUTFIT_COLORS,
  seededPick,
  type InstrumentId,
} from '../data/rpg';

type Difficulty = 'Iniciante' | 'Intermediário' | 'Avançado';
type Pose = 'idle' | 'walk' | 'attack' | 'hurt' | 'defeat';

interface CharacterConfig {
  name: string;
  instrument: InstrumentId;
  skin: string;
  hair: string;
  outfit: string;
  difficulty: Difficulty;
}

interface LeaderboardEntry {
  name: string;
  score: number;
  bosses: number;
  difficulty: string;
  date: string;
}

const HEARTS_MAX = 3;
const TIME_PER_QUESTION: Record<Difficulty, number> = {
  Iniciante: 20,
  Intermediário: 14,
  Avançado: 9,
};

const STORAGE_KEY = 'rpg-character';

// ───────────────────────── Desenho (pixel art procedural) ─────────────────────────

function shade(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00ff) + amount;
  let b = (num & 0x0000ff) + amount;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function drawInstrument(ctx: CanvasRenderingContext2D, instrument: InstrumentId, armPhase: number, skin: string) {
  const handX = 9;
  const handY = -20 + armPhase * 0.3;

  if (instrument === 'bateria') {
    ctx.fillStyle = shade(skin, -10);
    ctx.fillRect(handX - 20, handY, 4, 10);
    ctx.strokeStyle = '#c8a06a';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(handX, handY);
    ctx.lineTo(handX + 8, handY - 8);
    ctx.moveTo(handX - 16, handY);
    ctx.lineTo(handX - 8, handY - 9);
    ctx.stroke();
    return;
  }

  ctx.fillStyle = shade(skin, -10);
  ctx.fillRect(handX - 4, handY, 4, 12);

  const bodyColor = instrument === 'guitarra' ? '#b5202d' : '#4a3728';
  ctx.save();
  ctx.translate(handX + 2, handY + 6);
  ctx.rotate(-0.5);
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(-2, -18, 3, 18);
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, 4, 6, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

interface HumanoidOpts {
  x: number;
  groundY: number;
  scale: number;
  skin: string;
  hair: string;
  outfit: string;
  instrument: InstrumentId;
  facing: 1 | -1;
  pose: Pose;
  t: number;
  crown?: boolean;
}

function drawHumanoid(ctx: CanvasRenderingContext2D, o: HumanoidOpts) {
  const { x, groundY, scale, skin, hair, outfit, instrument, facing, pose, t } = o;

  let bob = 0;
  let legPhase = 0;
  let armPhase = 0;
  let lean = 0;
  let rotate = 0;
  let fallY = 0;
  let alpha = 1;

  if (pose === 'idle') {
    bob = Math.sin(t * 2.4) * 1.2;
  } else if (pose === 'walk') {
    bob = Math.abs(Math.sin(t * 8)) * 1.5;
    legPhase = Math.sin(t * 8) * 5;
    armPhase = Math.sin(t * 8) * 4;
  } else if (pose === 'attack') {
    const swing = Math.sin(Math.min(t, 1) * Math.PI);
    lean = swing * 6;
    armPhase = swing * 10;
  } else if (pose === 'hurt') {
    lean = Math.sin(t * 40) * 3;
  } else if (pose === 'defeat') {
    const p = Math.min(t, 1);
    rotate = p * (Math.PI / 2.2);
    fallY = p * 4;
    alpha = 1 - p * 0.85;
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, groundY);
  ctx.scale(scale * facing, scale);
  ctx.translate(lean, -bob + fallY);
  if (rotate) ctx.rotate(rotate);

  if (o.crown) {
    ctx.save();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(-8, -40);
    ctx.lineTo(-8, -47);
    ctx.lineTo(-4, -41);
    ctx.lineTo(0, -48);
    ctx.lineTo(4, -41);
    ctx.lineTo(8, -47);
    ctx.lineTo(8, -40);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // pernas
  ctx.fillStyle = shade(outfit, -30);
  ctx.fillRect(-6 - legPhase * 0.2, -13, 5, 13);
  ctx.fillRect(1 + legPhase * 0.2, -13, 5, 13);

  // torso
  ctx.fillStyle = outfit;
  ctx.fillRect(-8, -28, 16, 16);

  // braço de trás
  ctx.fillStyle = shade(skin, -10);
  ctx.fillRect(-11, -26 + armPhase * 0.3, 4, 12);

  // instrumento + braço da frente
  drawInstrument(ctx, instrument, armPhase, skin);

  // cabeça
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(0, -34, 7, 0, Math.PI * 2);
  ctx.fill();

  // cabelo
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.arc(0, -36, 7.2, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-7, -38, 3, 6);
  ctx.fillRect(4, -38, 3, 6);

  // olhos
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(-3, -34, 1.6, 1.6);
  ctx.fillRect(1.4, -34, 1.6, 1.6);

  ctx.restore();
}

function drawImpact(ctx: CanvasRenderingContext2D, x: number, y: number, progress: number) {
  const r = 4 + progress * 14;
  ctx.save();
  ctx.globalAlpha = Math.max(0, 1 - progress);
  ctx.strokeStyle = '#ffd23f';
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(ang) * r * 0.4, y + Math.sin(ang) * r * 0.4);
    ctx.lineTo(x + Math.cos(ang) * r, y + Math.sin(ang) * r);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBattleBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#2b1320');
  grad.addColorStop(1, '#4a1f2e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#1a0e14';
  ctx.fillRect(0, h - 40, w, 40);

  ctx.globalAlpha = 0.15;
  ctx.fillStyle = '#e63946';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc((w / 5) * i + 20, h - 40, 60, Math.PI, 0);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawWalkBackground(ctx: CanvasRenderingContext2D, w: number, h: number, scrollX: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#1b1024');
  grad.addColorStop(1, '#2f1830');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#140b18';
  ctx.fillRect(0, h - 30, w, 30);

  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 14]);
  ctx.lineDashOffset = -scrollX;
  ctx.beginPath();
  ctx.moveTo(0, h - 15);
  ctx.lineTo(w, h - 15);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  for (let i = 0; i < 6; i++) {
    const bx = ((i * 140 - scrollX * 0.6) % (w + 140)) - 70;
    ctx.fillRect(bx, h - 60, 26, 30);
  }
}

// ───────────────────────── Utilitários ─────────────────────────

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

// ───────────────────────── Motor do jogo ─────────────────────────

export function initRpgGame() {
  const creationScreen = qs<HTMLDivElement>('rpg-creation-screen');
  const walkScreen = qs<HTMLDivElement>('rpg-walk-screen');
  const battleScreen = qs<HTMLDivElement>('rpg-battle-screen');
  const gameoverScreen = qs<HTMLDivElement>('rpg-gameover-screen');

  const previewCanvas = qs<HTMLCanvasElement>('rpg-preview-canvas');
  const previewCtx = previewCanvas.getContext('2d')!;
  const walkCanvas = qs<HTMLCanvasElement>('rpg-walk-canvas');
  const walkCtx = walkCanvas.getContext('2d')!;
  const battleCanvas = qs<HTMLCanvasElement>('rpg-battle-canvas');
  const battleCtx = battleCanvas.getContext('2d')!;

  const nameInput = qs<HTMLInputElement>('rpg-name-input');
  const startBtn = qs<HTMLButtonElement>('rpg-start-btn');
  const creationError = qs<HTMLParagraphElement>('rpg-creation-error');

  const heartsEl = qs<HTMLDivElement>('rpg-hearts');
  const roundLabel = qs<HTMLDivElement>('rpg-round-label');
  const scoreLabel = qs<HTMLDivElement>('rpg-score-label');
  const enemyLabel = qs<HTMLDivElement>('rpg-enemy-label');
  const enemyHpEl = qs<HTMLDivElement>('rpg-enemy-hp');
  const timerBar = qs<HTMLDivElement>('rpg-timer-bar');
  const questionEl = qs<HTMLHeadingElement>('rpg-question');
  const optionsContainer = qs<HTMLDivElement>('rpg-options');
  const hintBox = qs<HTMLDivElement>('rpg-hint-box');
  const hintText = qs<HTMLSpanElement>('rpg-hint-text');

  const itemReviveBtn = qs<HTMLButtonElement>('rpg-item-revive');
  const itemCutBtn = qs<HTMLButtonElement>('rpg-item-cut');
  const itemHintBtn = qs<HTMLButtonElement>('rpg-item-hint');

  const finalScoreEl = qs<HTMLParagraphElement>('rpg-final-score');
  const finalStatsEl = qs<HTMLParagraphElement>('rpg-final-stats');
  const nameSubmitInput = qs<HTMLInputElement>('rpg-name-submit-input');
  const submitScoreBtn = qs<HTMLButtonElement>('rpg-submit-score-btn');
  const submitStatus = qs<HTMLParagraphElement>('rpg-submit-status');
  const leaderboardList = qs<HTMLOListElement>('rpg-leaderboard-list');
  const playAgainBtn = qs<HTMLButtonElement>('rpg-play-again-btn');

  // ── Estado do personagem ──
  const character: CharacterConfig = {
    name: '',
    instrument: 'guitarra',
    skin: SKIN_COLORS[0],
    hair: HAIR_COLORS[0],
    outfit: OUTFIT_COLORS[0],
    difficulty: 'Iniciante',
  };

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved) Object.assign(character, saved);
  } catch {
    /* ignora */
  }

  function saveCharacter() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(character));
  }

  function applySwatchSelection(selector: string, attr: string, value: string) {
    document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
      const active = el.dataset[attr] === value;
      el.classList.toggle('border-brand', active);
      el.classList.toggle('scale-110', active);
      el.classList.toggle('border-transparent', !active);
    });
  }

  function syncCreationUI() {
    nameInput.value = character.name;
    document.querySelectorAll<HTMLElement>('.instrument-swatch').forEach((el) => {
      const active = el.dataset.instrument === character.instrument;
      el.classList.toggle('border-brand', active);
      el.classList.toggle('bg-brand/10', active);
    });
    document.querySelectorAll<HTMLElement>('.difficulty-swatch').forEach((el) => {
      const active = el.dataset.difficulty === character.difficulty;
      el.classList.toggle('border-brand', active);
      el.classList.toggle('bg-brand/10', active);
    });
    applySwatchSelection('.skin-swatch', 'skin', character.skin);
    applySwatchSelection('.hair-swatch', 'hair', character.hair);
    applySwatchSelection('.outfit-swatch', 'outfit', character.outfit);
  }

  document.querySelectorAll<HTMLElement>('.instrument-swatch').forEach((el) => {
    el.addEventListener('click', () => {
      character.instrument = el.dataset.instrument as InstrumentId;
      syncCreationUI();
    });
  });
  document.querySelectorAll<HTMLElement>('.difficulty-swatch').forEach((el) => {
    el.addEventListener('click', () => {
      character.difficulty = el.dataset.difficulty as Difficulty;
      syncCreationUI();
    });
  });
  document.querySelectorAll<HTMLElement>('.skin-swatch').forEach((el) => {
    el.addEventListener('click', () => {
      character.skin = el.dataset.skin!;
      syncCreationUI();
    });
  });
  document.querySelectorAll<HTMLElement>('.hair-swatch').forEach((el) => {
    el.addEventListener('click', () => {
      character.hair = el.dataset.hair!;
      syncCreationUI();
    });
  });
  document.querySelectorAll<HTMLElement>('.outfit-swatch').forEach((el) => {
    el.addEventListener('click', () => {
      character.outfit = el.dataset.outfit!;
      syncCreationUI();
    });
  });

  syncCreationUI();

  let previewRaf = 0;
  function runPreviewLoop() {
    const start = performance.now();
    function frame(now: number) {
      const t = (now - start) / 1000;
      previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
      drawHumanoid(previewCtx, {
        x: 70,
        groundY: 130,
        scale: 2.6,
        skin: character.skin,
        hair: character.hair,
        outfit: character.outfit,
        instrument: character.instrument,
        facing: 1,
        pose: 'idle',
        t,
      });
      previewRaf = requestAnimationFrame(frame);
    }
    previewRaf = requestAnimationFrame(frame);
  }
  runPreviewLoop();

  startBtn.addEventListener('click', () => {
    character.name = nameInput.value.trim().slice(0, 16);
    if (!character.name) {
      creationError.classList.remove('hidden');
      return;
    }
    creationError.classList.add('hidden');
    saveCharacter();
    cancelAnimationFrame(previewRaf);
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
  let cutUsedThisQuestion = false;
  let hintUsedThisQuestion = false;

  let questionQueue: Record<Difficulty, QuizQuestion[]> = {
    Iniciante: [],
    Intermediário: [],
    Avançado: [],
  };
  let lastQuestion: QuizQuestion | null = null;

  interface Enemy {
    name: string;
    isBoss: boolean;
    hp: number;
    maxHp: number;
    instrument: InstrumentId;
    skin: string;
    hair: string;
    outfit: string;
  }
  let enemy: Enemy | null = null;

  let currentQuestion: QuizQuestion | null = null;
  let timerHandle: number | null = null;
  let timeLeft = 0;
  let answered = false;

  function showScreen(name: 'creation' | 'walk' | 'battle' | 'gameover') {
    creationScreen.classList.toggle('hidden', name !== 'creation');
    walkScreen.classList.toggle('hidden', name !== 'walk');
    battleScreen.classList.toggle('hidden', name !== 'battle');
    gameoverScreen.classList.toggle('hidden', name !== 'gameover');
  }

  function nextQuestion(difficulty: Difficulty): QuizQuestion {
    if (questionQueue[difficulty].length === 0) {
      let pool = shuffle(QUIZ_QUESTIONS[difficulty]);
      if (lastQuestion && pool[0] === lastQuestion && pool.length > 1) {
        [pool[0], pool[1]] = [pool[1], pool[0]];
      }
      questionQueue[difficulty] = pool;
    }
    const q = questionQueue[difficulty].shift()!;
    lastQuestion = q;
    return q;
  }

  function buildEnemy(): Enemy {
    encounterIndex++;
    const isBoss = encounterIndex % 4 === 0;
    let name: string;
    if (isBoss) {
      name = BOSS_NAMES[Math.floor(Math.random() * BOSS_NAMES.length)];
    } else {
      do {
        name = NORMAL_ENEMY_NAMES[Math.floor(Math.random() * NORMAL_ENEMY_NAMES.length)];
      } while (name === lastEnemyName && NORMAL_ENEMY_NAMES.length > 1);
    }
    lastEnemyName = name;
    const instruments: InstrumentId[] = ['guitarra', 'baixo', 'bateria'];
    return {
      name,
      isBoss,
      hp: isBoss ? 3 : 1,
      maxHp: isBoss ? 3 : 1,
      instrument: seededPick(instruments, name + '-i'),
      skin: seededPick(SKIN_COLORS, name + '-s'),
      hair: seededPick(HAIR_COLORS, name + '-h'),
      outfit: seededPick(OUTFIT_COLORS, name + '-o'),
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
    battleCtx.clearRect(0, 0, w, h);
    drawBattleBackground(battleCtx, w, h);

    const groundY = h - 34;
    drawHumanoid(battleCtx, {
      x: 70,
      groundY,
      scale: 2.6,
      skin: character.skin,
      hair: character.hair,
      outfit: character.outfit,
      instrument: character.instrument,
      facing: 1,
      pose: battleAnim.player,
      t: battleAnim.player === 'idle' ? t : battleAnim.playerT,
    });

    if (enemy) {
      drawHumanoid(battleCtx, {
        x: 250,
        groundY,
        scale: enemy.isBoss ? 3.4 : 2.6,
        skin: enemy.skin,
        hair: enemy.hair,
        outfit: enemy.outfit,
        instrument: enemy.instrument,
        facing: -1,
        pose: battleAnim.enemyPose,
        t: battleAnim.enemyPose === 'idle' ? t + 3 : battleAnim.enemyT,
        crown: enemy.isBoss,
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

  // ── Cena "andando" ──
  function playWalkTransition(onDone: () => void) {
    showScreen('walk');
    const duration = 1100;
    const start = performance.now();
    function step(now: number) {
      const elapsed = now - start;
      const t = elapsed / 1000;
      const w = walkCanvas.width;
      const h = walkCanvas.height;
      const scrollX = t * 90;
      walkCtx.clearRect(0, 0, w, h);
      drawWalkBackground(walkCtx, w, h, scrollX);
      drawHumanoid(walkCtx, {
        x: 90,
        groundY: h - 24,
        scale: 2.4,
        skin: character.skin,
        hair: character.hair,
        outfit: character.outfit,
        instrument: character.instrument,
        facing: 1,
        pose: 'walk',
        t,
      });
      if (elapsed < duration) {
        requestAnimationFrame(step);
      } else {
        onDone();
      }
    }
    requestAnimationFrame(step);
  }

  // ── HUD ──
  function renderHearts() {
    heartsEl.textContent = '❤️'.repeat(hearts) + '🖤'.repeat(HEARTS_MAX - hearts);
  }

  function renderHud() {
    renderHearts();
    scoreLabel.textContent = `Pontos: ${score}`;
    const nextBossIn = 4 - ((encounterIndex - 1) % 4);
    roundLabel.textContent = enemy?.isBoss
      ? 'Batalha contra o Boss'
      : `Próximo boss em ${nextBossIn}`;
    if (enemy) {
      enemyLabel.textContent = enemy.isBoss ? `👑 ${enemy.name}` : enemy.name;
      enemyHpEl.textContent = '💥'.repeat(enemy.hp) + '·'.repeat(enemy.maxHp - enemy.hp);
    }
    itemReviveBtn.classList.toggle('hidden', !hasRevive);
    itemCutBtn.classList.toggle('hidden', !hasCut);
    itemHintBtn.classList.toggle('hidden', !hasHint);
    [itemReviveBtn, itemCutBtn, itemHintBtn].forEach((b) => b.classList.toggle('flex', !b.classList.contains('hidden')));
  }

  function maybeGrantItems(justWon: boolean) {
    if (hearts === 1 && !hasRevive) {
      hasRevive = true;
    }
    if (streak >= 4 && streak % 4 === 0 && !hasCut) {
      hasCut = true;
    }
    if (justWon && !enemy?.isBoss && !hasHint && Math.random() < 0.25) {
      hasHint = true;
    }
  }

  function startTimer() {
    if (timerHandle) clearInterval(timerHandle);
    timeLeft = TIME_PER_QUESTION[character.difficulty];
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
    const total = TIME_PER_QUESTION[character.difficulty];
    const pct = Math.max(0, (timeLeft / total) * 100);
    timerBar.style.width = `${pct}%`;
    timerBar.classList.toggle('bg-red-500', pct < 25);
    timerBar.classList.toggle('bg-brand', pct >= 25);
  }

  function renderQuestion() {
    answered = false;
    cutUsedThisQuestion = false;
    hintUsedThisQuestion = false;
    hintBox.classList.add('hidden');
    currentQuestion = nextQuestion(character.difficulty);
    questionEl.textContent = currentQuestion.question;
    optionsContainer.innerHTML = '';
    optionsContainer.className = 'grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5';
    currentQuestion.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.textContent = opt;
      btn.dataset.index = String(i);
      btn.className =
        'rpg-option text-left px-4 py-3 rounded-xl border border-border bg-card hover:border-brand/40 transition-colors text-sm font-medium';
      btn.addEventListener('click', () => handleAnswer(i));
      optionsContainer.appendChild(btn);
    });
    renderHud();
    startTimer();
  }

  itemReviveBtn.addEventListener('click', () => {
    if (!hasRevive) return;
    hasRevive = false;
    hearts = Math.min(HEARTS_MAX, hearts + 1);
    renderHud();
  });

  itemCutBtn.addEventListener('click', () => {
    if (!hasCut || cutUsedThisQuestion || !currentQuestion) return;
    hasCut = false;
    cutUsedThisQuestion = true;
    const buttons = Array.from(optionsContainer.querySelectorAll<HTMLButtonElement>('.rpg-option'));
    const wrongButtons = buttons.filter((b) => Number(b.dataset.index) !== currentQuestion!.correctIndex);
    shuffle(wrongButtons)
      .slice(0, 2)
      .forEach((b) => {
        b.disabled = true;
        b.classList.add('opacity-30', 'line-through');
      });
    renderHud();
  });

  itemHintBtn.addEventListener('click', () => {
    if (!hasHint || hintUsedThisQuestion || !currentQuestion) return;
    hasHint = false;
    hintUsedThisQuestion = true;
    hintText.textContent = currentQuestion.hint;
    hintBox.classList.remove('hidden');
    renderHud();
  });

  function handleAnswer(index: number | null) {
    if (answered || !currentQuestion) return;
    answered = true;
    if (timerHandle) clearInterval(timerHandle);

    const correct = index === currentQuestion.correctIndex;
    const buttons = Array.from(optionsContainer.querySelectorAll<HTMLButtonElement>('.rpg-option'));
    buttons.forEach((b) => {
      b.disabled = true;
      const i = Number(b.dataset.index);
      if (i === currentQuestion!.correctIndex) {
        b.classList.add('!border-green-500', '!bg-green-500/10');
      } else if (i === index) {
        b.classList.add('!border-red-500', '!bg-red-500/10');
      } else {
        b.classList.add('opacity-40');
      }
    });

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
            enemy = null;
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
          enemy = null;
          proceedToNextEncounter();
        }
      });
    }
  }

  function proceedToNextEncounter() {
    cancelAnimationFrame(battleRaf);
    playWalkTransition(() => {
      enemy = buildEnemy();
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
    hasRevive = false;
    hasCut = false;
    hasHint = false;
    questionQueue = { Iniciante: [], Intermediário: [], Avançado: [] };
    lastQuestion = null;
    proceedToNextEncounter();
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
      leaderboardList.innerHTML = '<li class="opacity-60 text-center">Nenhuma pontuação registrada ainda.</li>';
      return;
    }
    entries.slice(0, 10).forEach((e, i) => {
      const li = document.createElement('li');
      li.className = 'flex items-center justify-between gap-2';
      li.innerHTML = `<span>${i + 1}. ${e.name}</span><span class="font-bold">${e.score}</span>`;
      leaderboardList.appendChild(li);
    });
  }

  async function endRun() {
    cancelAnimationFrame(battleRaf);
    showScreen('gameover');
    finalScoreEl.textContent = `Pontuação final: ${score}`;
    finalStatsEl.textContent = `Bosses derrotados: ${bossesDefeated} · Dificuldade: ${character.difficulty}`;
    nameSubmitInput.value = character.name;
    submitStatus.textContent = 'Carregando ranking…';
    leaderboardList.innerHTML = '';
    const entries = await fetchLeaderboard();
    if (entries === null) {
      submitStatus.textContent = 'Ranking global indisponível neste ambiente agora — mas sua pontuação ficou registrada aqui na tela.';
      leaderboardList.innerHTML = '<li class="opacity-60 text-center">—</li>';
    } else {
      submitStatus.textContent = '';
      renderLeaderboard(entries);
    }
  }

  submitScoreBtn.addEventListener('click', async () => {
    const name = nameSubmitInput.value.trim().slice(0, 16) || character.name || 'Anônimo';
    submitStatus.textContent = 'Enviando…';
    submitScoreBtn.disabled = true;
    const entries = await submitScore({ name, score, bosses: bossesDefeated, difficulty: character.difficulty });
    submitScoreBtn.disabled = false;
    if (entries === null) {
      submitStatus.textContent = 'Não foi possível enviar agora. Tente de novo mais tarde.';
    } else {
      submitStatus.textContent = 'Pontuação enviada!';
      renderLeaderboard(entries);
    }
  });

  playAgainBtn.addEventListener('click', () => {
    showScreen('creation');
    syncCreationUI();
    runPreviewLoop();
  });
}

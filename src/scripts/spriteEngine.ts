import {
  SPRITE_PATHS,
  OUTFIT_HAS_REAL_COLORS,
  OUTFIT_COLOR_HEX,
  HAIR_COLOR_FILTERS,
  type Gender,
  type HairStyleId,
  type OutfitStyleId,
} from '../data/rpg';

export type Pose = 'idle' | 'walk' | 'attack' | 'hurt' | 'defeat';

export const PROFESSOR_LOOK = {
  gender: 'male' as Gender,
  skin: '#e0ac69',
  hair: '#f5f5f5',
  hairStyle: 'careca' as HairStyleId,
  outfit: 'navy',
  outfitStyle: 'jaqueta_couro' as OutfitStyleId,
};

// ───────────────────────── Carregamento e cache de imagens ─────────────────────────

const IMAGE_CACHE: Record<string, HTMLImageElement> = {};
const SPRITE_REDRAW_LISTENERS = new Set<() => void>();

export function onSpritesLoaded(fn: () => void) {
  SPRITE_REDRAW_LISTENERS.add(fn);
  return () => SPRITE_REDRAW_LISTENERS.delete(fn);
}

function getImage(path: string): HTMLImageElement {
  if (!IMAGE_CACHE[path]) {
    const img = new Image();
    img.onload = () => SPRITE_REDRAW_LISTENERS.forEach((fn) => fn());
    img.src = path;
    IMAGE_CACHE[path] = img;
  }
  return IMAGE_CACHE[path];
}

export function preloadAllSprites() {
  getImage(SPRITE_PATHS.body.male.idle);
  getImage(SPRITE_PATHS.body.male.walk);
  getImage(SPRITE_PATHS.body.female.idle);
  getImage(SPRITE_PATHS.body.female.walk);
  getImage(SPRITE_PATHS.head.male.idle);
  getImage(SPRITE_PATHS.head.male.walk);
  getImage(SPRITE_PATHS.head.female.idle);
  getImage(SPRITE_PATHS.head.female.walk);
  getImage(SPRITE_PATHS.legs.idle);
  getImage(SPRITE_PATHS.legs.walk);
  getImage(SPRITE_PATHS.feet.idle);
  getImage(SPRITE_PATHS.feet.walk);
  Object.values(SPRITE_PATHS.hair).forEach((h) => {
    getImage(h.idle);
    getImage(h.walk);
  });
  Object.values(SPRITE_PATHS.outfit).forEach((styleObj) => {
    Object.values(styleObj).forEach((colorObj) => {
      getImage(colorObj.idle);
      getImage(colorObj.walk);
    });
  });
}

function drawFrame(ctx: CanvasRenderingContext2D, img: HTMLImageElement, frameIndex: number, row: number, dx: number, dy: number, size: number) {
  if (!img.complete || img.naturalWidth === 0) return;
  ctx.drawImage(img, frameIndex * 64, row * 64, 64, 64, dx, dy, size, size);
}

// ───────────────────────── Recoloração (multiply blend + clip por alpha) ─────────────────────────

const TINT_CACHE: Record<string, HTMLCanvasElement> = {};

function getTintedSheet(img: HTMLImageElement, tintHex: string): HTMLCanvasElement | null {
  if (!img.complete || img.naturalWidth === 0) return null;
  const key = img.src + '|' + tintHex;
  if (!TINT_CACHE[key]) {
    const off = document.createElement('canvas');
    off.width = img.naturalWidth;
    off.height = img.naturalHeight;
    const octx = off.getContext('2d')!;
    octx.drawImage(img, 0, 0);
    octx.globalCompositeOperation = 'multiply';
    octx.fillStyle = tintHex;
    octx.fillRect(0, 0, off.width, off.height);
    octx.globalCompositeOperation = 'destination-in';
    octx.drawImage(img, 0, 0);
    TINT_CACHE[key] = off;
  }
  return TINT_CACHE[key];
}

function drawTintedFrame(ctx: CanvasRenderingContext2D, img: HTMLImageElement, frameIndex: number, row: number, dx: number, dy: number, size: number, tintHex: string) {
  const sheet = getTintedSheet(img, tintHex);
  if (!sheet) return;
  ctx.drawImage(sheet, frameIndex * 64, row * 64, 64, 64, dx, dy, size, size);
}

// ───────────────────────── Personagem (composição de camadas) ─────────────────────────

export interface DrawSpriteOpts {
  x: number;
  groundY: number;
  scale: number;
  skin: string;
  hair: string;
  hairStyle: HairStyleId;
  outfit: string;
  outfitStyle: OutfitStyleId;
  gender: Gender;
  facing: 1 | -1;
  pose: Pose;
  t: number;
  isBoss?: boolean;
  bossTint?: string | null;
}

export function drawSprite(ctx: CanvasRenderingContext2D, o: DrawSpriteOpts) {
  const { x, groundY, scale, hair, hairStyle, outfit, outfitStyle, facing, pose, t, isBoss, skin, gender } = o;
  const g: Gender = gender === 'female' ? 'female' : 'male';
  let lean = 0;
  let rotate = 0;
  let fallY = 0;
  let alpha = 1;
  let hurtFlash = 0;
  let animName: 'idle' | 'walk' = 'idle';
  let scaleBoost = 1;

  if (pose === 'walk') {
    animName = 'walk';
  } else if (pose === 'attack') {
    const p = Math.min(t, 1);
    const s = Math.sin(p * Math.PI);
    lean = facing * s * 10;
    scaleBoost = 1 + s * 0.12;
  } else if (pose === 'hurt') {
    const p = Math.min(t, 1);
    lean = -facing * (1 - p) * 9 + Math.sin(t * 45) * 2;
    hurtFlash = Math.max(0, 1 - t / 0.5);
  } else if (pose === 'defeat') {
    const p = Math.min(t, 1);
    rotate = p * (Math.PI / 2.2);
    fallY = p * 4;
    alpha = 1 - p * 0.85;
  }

  const dirRow = facing === 1 ? 3 : 1;
  const frameIndex = animName === 'walk' ? Math.floor(t * 10) % 9 : Math.floor(t * 1.6) % 2;
  const size = 64 * scale;

  ctx.save();
  ctx.translate(x, groundY);
  ctx.translate(lean, fallY);
  if (rotate) ctx.rotate(rotate);
  if (scaleBoost !== 1) ctx.scale(scaleBoost, scaleBoost);
  ctx.globalAlpha = alpha;

  if (isBoss) {
    const tint = o.bossTint || '#ffd23f';
    const pulse = 0.9 + Math.sin(t * 2.2) * 0.1;
    const glowR = size * 0.52 * pulse;
    const glow = ctx.createRadialGradient(0, -size * 0.32, 2, 0, -size * 0.32, glowR);
    glow.addColorStop(0, tint + '99');
    glow.addColorStop(0.75, tint + '22');
    glow.addColorStop(1, tint + '00');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, -size * 0.32, glowR, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 1, size * 0.17, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();

  const destX = -size / 2;
  const destY = -size + size * 0.05;

  const skinHex = skin || '#e0ac69';
  drawTintedFrame(ctx, getImage(SPRITE_PATHS.body[g][animName]), frameIndex, dirRow, destX, destY, size, skinHex);
  drawFrame(ctx, getImage(SPRITE_PATHS.feet[animName]), frameIndex, dirRow, destX, destY, size);
  drawFrame(ctx, getImage(SPRITE_PATHS.legs[animName]), frameIndex, dirRow, destX, destY, size);
  drawTintedFrame(ctx, getImage(SPRITE_PATHS.head[g][animName]), frameIndex, dirRow, destX, destY, size, skinHex);

  const outfitSet = SPRITE_PATHS.outfit[outfitStyle] || SPRITE_PATHS.outfit.camiseta_banda;
  const hasReal = OUTFIT_HAS_REAL_COLORS[outfitStyle];
  const outfitEntry = hasReal ? outfitSet[outfit] || outfitSet.red : outfitSet.base;
  if (outfitEntry) {
    if (hasReal) {
      drawFrame(ctx, getImage(outfitEntry[animName]), frameIndex, dirRow, destX, destY, size);
    } else {
      drawTintedFrame(ctx, getImage(outfitEntry[animName]), frameIndex, dirRow, destX, destY, size, OUTFIT_COLOR_HEX[outfit] || OUTFIT_COLOR_HEX.red);
    }
  }

  const hairSet = SPRITE_PATHS.hair[hairStyle] || SPRITE_PATHS.hair.curto;
  ctx.filter = HAIR_COLOR_FILTERS[hair] || 'none';
  drawFrame(ctx, getImage(hairSet[animName]), frameIndex, dirRow, destX, destY, size);
  ctx.filter = 'none';

  if (hurtFlash > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.globalAlpha = hurtFlash * 0.6;
    ctx.fillStyle = '#ff2b2b';
    ctx.fillRect(destX, destY, size, size);
    ctx.restore();
  }

  ctx.restore();
}

export function drawProfessorPortrait(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const off = document.createElement('canvas');
  off.width = 220;
  off.height = 220;
  const octx = off.getContext('2d')!;
  octx.imageSmoothingEnabled = false;
  const p = PROFESSOR_LOOK;
  drawSprite(octx, {
    x: 110,
    groundY: 200,
    scale: 2.75,
    skin: p.skin,
    hair: p.hair,
    hairStyle: p.hairStyle,
    outfit: p.outfit,
    outfitStyle: p.outfitStyle,
    gender: p.gender,
    facing: 1,
    pose: 'idle',
    t: 0,
  });
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(off, 42, 15, 130, 130, 0, 0, w, h);
}

// ───────────────────────── Cenário e efeitos ─────────────────────────

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

export function drawStage(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, scrollX: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#241033');
  grad.addColorStop(0.6, '#3a1740');
  grad.addColorStop(1, '#1a0d22');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  [w * 0.25, w * 0.75].forEach((sx, i) => {
    const sway = Math.sin(t * 0.6 + i * 2) * 14;
    const g = ctx.createRadialGradient(sx + sway, 0, 4, sx + sway, 0, h * 0.8);
    g.addColorStop(0, 'rgba(255,210,120,0.16)');
    g.addColorStop(1, 'rgba(255,210,120,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(sx + sway, 0);
    ctx.lineTo(sx + sway - 60, h);
    ctx.lineTo(sx + sway + 60, h);
    ctx.closePath();
    ctx.fill();
  });

  const floorY = h - 30;
  ctx.fillStyle = 'rgba(10,4,14,0.6)';
  for (let i = 0; i < 14; i++) {
    const bx = ((i * 26 - scrollX * 0.4) % (w + 26)) - 13;
    const bumpH = 8 + ((i * 37) % 6);
    ctx.beginPath();
    ctx.arc(bx, floorY, bumpH, Math.PI, 0);
    ctx.fill();
  }

  ctx.fillStyle = '#150a1c';
  ctx.fillRect(0, floorY, w, 30);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 10]);
  ctx.lineDashOffset = -scrollX;
  ctx.beginPath();
  ctx.moveTo(0, floorY + 15);
  ctx.lineTo(w, floorY + 15);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  roundRect(ctx, -6, floorY - 34, 26, 34, 3);
  ctx.fill();
  roundRect(ctx, w - 20, floorY - 34, 26, 34, 3);
  ctx.fill();
}

export function drawImpact(ctx: CanvasRenderingContext2D, x: number, y: number, progress: number) {
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

// ───────────────────────── Ícones pixel-art (corações, itens, vinil) ─────────────────────────

function drawPixelIcon(ctx: CanvasRenderingContext2D, w: number, h: number, painter: (o: CanvasRenderingContext2D) => void) {
  const off = document.createElement('canvas');
  off.width = 16;
  off.height = 16;
  const octx = off.getContext('2d')!;
  painter(octx);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(off, 0, 0, w, h);
}

export function drawHeartIcon(ctx: CanvasRenderingContext2D, w: number, h: number, filled: boolean) {
  drawPixelIcon(ctx, w, h, (o) => {
    if (filled) {
      o.fillStyle = '#e63946';
      o.fillRect(2, 2, 4, 2);
      o.fillRect(10, 2, 4, 2);
      o.fillRect(1, 4, 14, 3);
      o.fillRect(2, 7, 12, 2);
      o.fillRect(3, 9, 10, 2);
      o.fillRect(4, 11, 8, 2);
      o.fillRect(5, 13, 6, 1);
      o.fillRect(7, 14, 2, 1);
      o.fillStyle = '#ff8a94';
      o.fillRect(3, 3, 2, 2);
      o.fillRect(4, 5, 2, 2);
    } else {
      o.fillStyle = 'rgba(255,255,255,0.14)';
      o.fillRect(2, 2, 4, 2);
      o.fillRect(10, 2, 4, 2);
      o.fillRect(1, 4, 14, 3);
      o.fillRect(2, 7, 12, 2);
      o.fillRect(3, 9, 10, 2);
      o.fillRect(4, 11, 8, 2);
      o.fillRect(5, 13, 6, 1);
      o.fillRect(7, 14, 2, 1);
    }
  });
}

export function drawReviveIcon(ctx: CanvasRenderingContext2D, w: number, h: number) {
  drawHeartIcon(ctx, w, h, true);
}

export function drawCutIcon(ctx: CanvasRenderingContext2D, w: number, h: number) {
  drawPixelIcon(ctx, w, h, (o) => {
    o.fillStyle = '#d8d8d8';
    o.fillRect(1, 1, 6, 2);
    o.fillRect(1, 13, 6, 2);
    o.fillRect(6, 3, 2, 2);
    o.fillRect(6, 11, 2, 2);
    o.fillRect(8, 5, 2, 2);
    o.fillRect(8, 9, 2, 2);
    o.fillStyle = '#e63946';
    o.fillRect(9, 7, 3, 2);
    o.fillStyle = '#8a8a8a';
    o.fillRect(2, 1, 2, 2);
    o.fillRect(2, 13, 2, 2);
  });
}

export function drawHintIcon(ctx: CanvasRenderingContext2D, w: number, h: number) {
  drawPixelIcon(ctx, w, h, (o) => {
    o.fillStyle = '#ffd23f';
    o.fillRect(5, 1, 6, 1);
    o.fillRect(4, 2, 8, 6);
    o.fillRect(5, 8, 6, 1);
    o.fillStyle = '#ffe98a';
    o.fillRect(6, 3, 2, 2);
    o.fillStyle = '#cfcfcf';
    o.fillRect(6, 10, 4, 3);
    o.fillStyle = '#8a8a8a';
    o.fillRect(6, 13, 4, 1);
    o.fillStyle = '#f5a623';
    o.fillRect(1, 4, 2, 1);
    o.fillRect(13, 4, 2, 1);
  });
}

export function drawMuteIcon(ctx: CanvasRenderingContext2D, w: number, h: number, muted: boolean) {
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = '#f5f0fa';
  ctx.fillStyle = '#f5f0fa';
  ctx.lineWidth = 1.6;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(4, 9);
  ctx.lineTo(8, 9);
  ctx.lineTo(13, 5);
  ctx.lineTo(13, 15);
  ctx.lineTo(8, 11);
  ctx.lineTo(4, 11);
  ctx.closePath();
  ctx.fill();
  if (muted) {
    ctx.beginPath();
    ctx.moveTo(16, 6);
    ctx.lineTo(21, 14);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(21, 6);
    ctx.lineTo(16, 14);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(13, 10, 5.5, -0.7, 0.7);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(13, 10, 8.5, -0.6, 0.6);
    ctx.stroke();
  }
}

export function drawVinylDisc(ctx: CanvasRenderingContext2D, w: number, h: number, spin: number) {
  ctx.clearRect(0, 0, w, h);
  const cx = w / 2;
  const cy = h / 2;
  const R = Math.min(w, h) * 0.46;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(spin || 0);
  const vinylGrad = ctx.createRadialGradient(0, 0, R * 0.2, 0, 0, R);
  vinylGrad.addColorStop(0, '#2b2b33');
  vinylGrad.addColorStop(1, '#0e0e12');
  ctx.fillStyle = vinylGrad;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1.5;
  for (let i = 1; i <= 5; i++) {
    ctx.beginPath();
    ctx.arc(0, 0, R * (0.42 + i * 0.1), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#e63946';
  ctx.beginPath();
  ctx.arc(0, 0, R * 0.38, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd23f';
  ctx.beginPath();
  ctx.arc(0, 0, R * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a0d22';
  ctx.font = `700 ${Math.round(R * 0.15)}px 'Fredoka', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('FIM', 0, -R * 0.02);
  ctx.fillStyle = '#0e0e12';
  ctx.beginPath();
  ctx.arc(0, 0, R * 0.05, 0, Math.PI * 2);
  ctx.fill();
  const shine = ctx.createLinearGradient(-R, -R, R, R);
  shine.addColorStop(0, 'rgba(255,255,255,0.1)');
  shine.addColorStop(0.5, 'rgba(255,255,255,0)');
  shine.addColorStop(1, 'rgba(255,255,255,0.05)');
  ctx.fillStyle = shine;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

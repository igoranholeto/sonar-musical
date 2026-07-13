export const NORMAL_ENEMY_NAMES = [
  'Baixista Sem Ensaiar',
  'Roadie Confuso',
  'Guitarrista de Garagem',
  'Backing Vocal Desafinado',
  'Empresário Picareta',
  'Fã Barulhento',
  'DJ de Festa de Aniversário',
  'Cover de Cover',
  'Groupie Perdido',
  'Técnico de Som Estressado',
  'Baterista de Um Beat Só',
  'Crítico de Blog Chato',
  'Vizinho que Reclama do Som',
  'Pirata de CD',
  'Roadie que Perdeu o Cabo',
  'Cantor de Karaokê Convicto',
  'Produtor Que Só Fala de Plugin',
  'Influencer de Unboxing de Pedal',
  'Aquele Que Afina Errado de Propósito',
  'Guitar Hero Modo Fácil',
] as const;

export const BOSS_NAMES = [
  'Maestro das Trevas',
  'O Afinador Amaldiçoado',
  'Rei do Auto-Tune',
  'Barão do Feedback',
  'Lorde do Solo Infinito',
  'Imperador do Delay Excessivo',
  'Duque da Palheta Perdida',
  'Sultão do Microfone Sem Pilha',
] as const;

export type Gender = 'male' | 'female';
export type HairStyleId = 'curto' | 'ponytail' | 'franja' | 'moicano' | 'longo' | 'black_power' | 'topete' | 'careca';
export type OutfitStyleId = 'camiseta_banda' | 'jaqueta_couro' | 'colete_tachas' | 'moletom';
export type OutfitColorKey = 'red' | 'navy' | 'black' | 'green' | 'purple' | 'orange';
export type LookId = 'punk' | 'metal' | 'pop' | 'classico' | 'soul' | 'indie';

export const SKIN_COLORS = ['#f2c9a1', '#e0ac69', '#c68642', '#8d5524'];
export const HAIR_COLORS = ['#1a1a1a', '#5b3a29', '#d4a017', '#b3402c', '#4169e1', '#2e8b57', '#ff6fb0', '#f5f5f5'];

// ───────────────────────── Sprites (Universal LPC Spritesheet) ─────────────────────────
// Créditos: Universal LPC Spritesheet Character Generator
// https://github.com/LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator
// Licença CC-BY-SA 3.0 / GPL 3.0 — ver public/images/rpg/sprites/LICENSE.txt

const SPRITE_BASE = '/images/rpg/sprites';

interface SpriteFrames {
  idle: string;
  walk: string;
}

export const SPRITE_PATHS: {
  body: Record<Gender, SpriteFrames>;
  head: Record<Gender, SpriteFrames>;
  legs: SpriteFrames;
  feet: SpriteFrames;
  hair: Record<HairStyleId, SpriteFrames>;
  outfit: Record<OutfitStyleId, Record<string, SpriteFrames>>;
} = {
  body: {
    male: { idle: `${SPRITE_BASE}/body/male/idle.png`, walk: `${SPRITE_BASE}/body/male/walk.png` },
    female: { idle: `${SPRITE_BASE}/body/female/idle.png`, walk: `${SPRITE_BASE}/body/female/walk.png` },
  },
  head: {
    male: { idle: `${SPRITE_BASE}/head/male/idle.png`, walk: `${SPRITE_BASE}/head/male/walk.png` },
    female: { idle: `${SPRITE_BASE}/head/female/idle.png`, walk: `${SPRITE_BASE}/head/female/walk.png` },
  },
  legs: { idle: `${SPRITE_BASE}/legs/idle.png`, walk: `${SPRITE_BASE}/legs/walk.png` },
  feet: { idle: `${SPRITE_BASE}/feet/idle.png`, walk: `${SPRITE_BASE}/feet/walk.png` },
  hair: {
    curto: { idle: `${SPRITE_BASE}/hair/curto/idle.png`, walk: `${SPRITE_BASE}/hair/curto/walk.png` },
    moicano: { idle: `${SPRITE_BASE}/hair/moicano/idle.png`, walk: `${SPRITE_BASE}/hair/moicano/walk.png` },
    longo: { idle: `${SPRITE_BASE}/hair/longo/idle.png`, walk: `${SPRITE_BASE}/hair/longo/walk.png` },
    black_power: { idle: `${SPRITE_BASE}/hair/black_power/idle.png`, walk: `${SPRITE_BASE}/hair/black_power/walk.png` },
    topete: { idle: `${SPRITE_BASE}/hair/topete/idle.png`, walk: `${SPRITE_BASE}/hair/topete/walk.png` },
    careca: { idle: `${SPRITE_BASE}/hair/careca/idle.png`, walk: `${SPRITE_BASE}/hair/careca/walk.png` },
    ponytail: { idle: `${SPRITE_BASE}/hair/ponytail/idle.png`, walk: `${SPRITE_BASE}/hair/ponytail/walk.png` },
    franja: { idle: `${SPRITE_BASE}/hair/franja/idle.png`, walk: `${SPRITE_BASE}/hair/franja/walk.png` },
  },
  outfit: {
    camiseta_banda: { base: { idle: `${SPRITE_BASE}/outfit/camiseta_banda/base/idle.png`, walk: `${SPRITE_BASE}/outfit/camiseta_banda/base/walk.png` } },
    jaqueta_couro: {
      red: { idle: `${SPRITE_BASE}/outfit/jaqueta_couro/red/idle.png`, walk: `${SPRITE_BASE}/outfit/jaqueta_couro/red/walk.png` },
      navy: { idle: `${SPRITE_BASE}/outfit/jaqueta_couro/navy/idle.png`, walk: `${SPRITE_BASE}/outfit/jaqueta_couro/navy/walk.png` },
      black: { idle: `${SPRITE_BASE}/outfit/jaqueta_couro/black/idle.png`, walk: `${SPRITE_BASE}/outfit/jaqueta_couro/black/walk.png` },
      green: { idle: `${SPRITE_BASE}/outfit/jaqueta_couro/green/idle.png`, walk: `${SPRITE_BASE}/outfit/jaqueta_couro/green/walk.png` },
      purple: { idle: `${SPRITE_BASE}/outfit/jaqueta_couro/purple/idle.png`, walk: `${SPRITE_BASE}/outfit/jaqueta_couro/purple/walk.png` },
      orange: { idle: `${SPRITE_BASE}/outfit/jaqueta_couro/orange/idle.png`, walk: `${SPRITE_BASE}/outfit/jaqueta_couro/orange/walk.png` },
    },
    colete_tachas: {
      red: { idle: `${SPRITE_BASE}/outfit/colete_tachas/red/idle.png`, walk: `${SPRITE_BASE}/outfit/colete_tachas/red/walk.png` },
      navy: { idle: `${SPRITE_BASE}/outfit/colete_tachas/navy/idle.png`, walk: `${SPRITE_BASE}/outfit/colete_tachas/navy/walk.png` },
      black: { idle: `${SPRITE_BASE}/outfit/colete_tachas/black/idle.png`, walk: `${SPRITE_BASE}/outfit/colete_tachas/black/walk.png` },
      green: { idle: `${SPRITE_BASE}/outfit/colete_tachas/green/idle.png`, walk: `${SPRITE_BASE}/outfit/colete_tachas/green/walk.png` },
      purple: { idle: `${SPRITE_BASE}/outfit/colete_tachas/purple/idle.png`, walk: `${SPRITE_BASE}/outfit/colete_tachas/purple/walk.png` },
      orange: { idle: `${SPRITE_BASE}/outfit/colete_tachas/orange/idle.png`, walk: `${SPRITE_BASE}/outfit/colete_tachas/orange/walk.png` },
    },
    moletom: { base: { idle: `${SPRITE_BASE}/outfit/moletom/base/idle.png`, walk: `${SPRITE_BASE}/outfit/moletom/base/walk.png` } },
  },
};

export const OUTFIT_HAS_REAL_COLORS: Record<OutfitStyleId, boolean> = {
  jaqueta_couro: true,
  colete_tachas: true,
  camiseta_banda: false,
  moletom: false,
};

export const OUTFIT_COLOR_KEYS: { key: OutfitColorKey; hex: string }[] = [
  { key: 'red', hex: '#e63946' },
  { key: 'navy', hex: '#2a2a72' },
  { key: 'black', hex: '#1c1c1c' },
  { key: 'green', hex: '#2e8b57' },
  { key: 'purple', hex: '#8e44ad' },
  { key: 'orange', hex: '#f39c12' },
];

export const OUTFIT_COLOR_HEX: Record<string, string> = {
  red: '#e63946',
  navy: '#2a2a72',
  black: '#3a3a3a',
  green: '#2e8b57',
  purple: '#8e44ad',
  orange: '#f39c12',
};

export const HAIR_COLOR_FILTERS: Record<string, string> = {
  '#1a1a1a': 'brightness(0.5) saturate(0.6)',
  '#5b3a29': 'hue-rotate(0deg) saturate(0.9) brightness(0.78)',
  '#d4a017': 'hue-rotate(20deg) saturate(1.6) brightness(1.15)',
  '#b3402c': 'hue-rotate(-20deg) saturate(1.3) brightness(0.95)',
  '#4169e1': 'hue-rotate(195deg) saturate(2) brightness(1.05)',
  '#2e8b57': 'hue-rotate(105deg) saturate(1.5) brightness(0.95)',
  '#ff6fb0': 'hue-rotate(300deg) saturate(2) brightness(1.3)',
  '#f5f5f5': 'grayscale(1) brightness(2)',
};

export const HAIR_STYLES: { id: HairStyleId; label: string }[] = [
  { id: 'curto', label: 'Curto' },
  { id: 'ponytail', label: 'Rabo de cavalo' },
  { id: 'franja', label: 'Franja' },
  { id: 'moicano', label: 'Moicano' },
  { id: 'longo', label: 'Longo' },
  { id: 'black_power', label: 'Black Power' },
  { id: 'topete', label: 'Topete' },
  { id: 'careca', label: 'Careca' },
];

export const OUTFIT_STYLES: { id: OutfitStyleId; label: string }[] = [
  { id: 'camiseta_banda', label: 'Camiseta' },
  { id: 'jaqueta_couro', label: 'Jaqueta' },
  { id: 'colete_tachas', label: 'Colete' },
  { id: 'moletom', label: 'Moletom' },
];

export interface Look {
  id: LookId;
  label: string;
  hairStyle: HairStyleId;
  hair: string;
  outfitStyle: OutfitStyleId;
  outfit: OutfitColorKey;
}

export const LOOKS_BY_GENDER: Record<Gender, Look[]> = {
  male: [
    { id: 'punk', label: 'Punk', hairStyle: 'franja', hair: '#1a1a1a', outfitStyle: 'colete_tachas', outfit: 'black' },
    { id: 'metal', label: 'Metaleiro', hairStyle: 'longo', hair: '#1a1a1a', outfitStyle: 'jaqueta_couro', outfit: 'black' },
    { id: 'pop', label: 'Popstar', hairStyle: 'topete', hair: '#d4a017', outfitStyle: 'camiseta_banda', outfit: 'purple' },
    { id: 'classico', label: 'Clássico', hairStyle: 'curto', hair: '#5b3a29', outfitStyle: 'camiseta_banda', outfit: 'red' },
    { id: 'soul', label: 'Soul', hairStyle: 'black_power', hair: '#1a1a1a', outfitStyle: 'colete_tachas', outfit: 'orange' },
    { id: 'indie', label: 'Indie', hairStyle: 'careca', hair: '#5b3a29', outfitStyle: 'moletom', outfit: 'green' },
  ],
  female: [
    { id: 'punk', label: 'Punk', hairStyle: 'franja', hair: '#ff6fb0', outfitStyle: 'colete_tachas', outfit: 'black' },
    { id: 'metal', label: 'Metaleira', hairStyle: 'longo', hair: '#1a1a1a', outfitStyle: 'jaqueta_couro', outfit: 'purple' },
    { id: 'pop', label: 'Popstar', hairStyle: 'topete', hair: '#d4a017', outfitStyle: 'camiseta_banda', outfit: 'purple' },
    { id: 'classico', label: 'Clássica', hairStyle: 'longo', hair: '#5b3a29', outfitStyle: 'camiseta_banda', outfit: 'red' },
    { id: 'soul', label: 'Soul', hairStyle: 'black_power', hair: '#1a1a1a', outfitStyle: 'colete_tachas', outfit: 'orange' },
    { id: 'indie', label: 'Indie', hairStyle: 'longo', hair: '#d4a017', outfitStyle: 'moletom', outfit: 'navy' },
  ],
};

export function getLooks(gender: Gender): Look[] {
  return LOOKS_BY_GENDER[gender] || LOOKS_BY_GENDER.male;
}

export function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Hash simples e determinístico — mesmo nome sempre gera a mesma aparência do inimigo. */
export function seededPick<T>(arr: readonly T[], seed: string): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  }
  return arr[hash % arr.length];
}

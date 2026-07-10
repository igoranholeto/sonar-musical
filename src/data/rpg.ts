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

export type InstrumentId = 'guitarra' | 'baixo' | 'bateria';

export const INSTRUMENTS: { id: InstrumentId; label: string; emoji: string }[] = [
  { id: 'guitarra', label: 'Guitarra', emoji: '🎸' },
  { id: 'baixo', label: 'Baixo', emoji: '🎸' },
  { id: 'bateria', label: 'Bateria', emoji: '🥁' },
];

export const SKIN_COLORS = ['#f2c9a1', '#e0ac69', '#c68642', '#8d5524'];
export const HAIR_COLORS = ['#1a1a1a', '#5b3a29', '#d4a017', '#b3402c', '#4169e1', '#2e8b57', '#ff6fb0', '#f5f5f5'];
export const OUTFIT_COLORS = ['#e63946', '#2a2a72', '#1c1c1c', '#2e8b57', '#8e44ad', '#f39c12'];

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

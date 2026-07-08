export const GENEROS = ['Rock', 'Metal', 'Blues', 'Pop', 'Jazz', 'R&B', 'Sertanejo', 'Nacional'] as const;
export type Genero = (typeof GENEROS)[number];

// Matiz OKLCH por gênero — replica o mapeamento do design handoff das Bandas.
const HUES: Record<Genero, number> = {
  Rock: 25,
  Metal: 288,
  Blues: 255,
  Pop: 335,
  Jazz: 62,
  'R&B': 305,
  Sertanejo: 140,
  Nacional: 195,
};

function hue(genero: string): number {
  return HUES[genero as Genero] ?? 0;
}

export function generoAccent(genero: string): string {
  return `oklch(0.73 0.15 ${hue(genero)})`;
}

export function generoGradient(genero: string): string {
  const h = hue(genero);
  return `linear-gradient(140deg, oklch(0.70 0.15 ${h}) 0%, oklch(0.38 0.12 ${h}) 100%)`;
}

export function generoSoft(genero: string): string {
  return `oklch(0.73 0.15 ${hue(genero)} / 0.15)`;
}

export function slugify(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function iniciais(nome: string): string {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

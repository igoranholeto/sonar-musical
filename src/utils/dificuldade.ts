export const DIFICULDADES = ['Iniciante', 'Intermediário', 'Avançado'] as const;
export type Dificuldade = (typeof DIFICULDADES)[number];

export function dificuldadeClasses(dificuldade: string): string {
  switch (dificuldade) {
    case 'Iniciante':
    case 'Fácil':
      return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
    case 'Intermediário':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
    case 'Avançado':
      return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
    default:
      return 'bg-elevated text-muted';
  }
}

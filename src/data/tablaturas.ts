export interface FonteExterna {
  url: string;
  nome: string;
}

export interface Tablatura {
  titulo: string;
  artista: string;
  artistaSlug?: string;
  dificuldade: 'Fácil' | 'Intermediário' | 'Avançado';
  genero?: string;
  preview: string;
  /** PDF hospedado por nós — usado quando não há `fonteExterna`. */
  pdf?: string;
  /**
   * Quando a tablatura não é nossa (ex: transcrição licenciada de terceiros),
   * linkamos para a versão GRATUITA na fonte original em vez de hospedar uma cópia.
   * Nunca aponte para versões pagas/PRO — sempre confirme que é a versão free antes de adicionar aqui.
   */
  fonteExterna?: FonteExterna;
}

export const TABLATURAS: Tablatura[] = [
  {
    titulo: 'Power Chords Essenciais',
    artista: 'Exercício Sonar Musical',
    dificuldade: 'Fácil',
    genero: 'Exercício',
    pdf: '/tablaturas/power-chords-essenciais.pdf',
    preview: '/tablaturas/power-chords-essenciais-preview.webp',
  },
  {
    titulo: 'The Thrill Is Gone',
    artista: 'B.B. King',
    artistaSlug: 'bb-king',
    dificuldade: 'Intermediário',
    genero: 'Blues',
    preview: '/images/bbking-sonar.webp',
    fonteExterna: {
      url: 'https://tabs.ultimate-guitar.com/tab/b-b-king/the-thrill-is-gone-tabs-73271',
      nome: 'Ultimate-Guitar (grátis)',
    },
  },
];

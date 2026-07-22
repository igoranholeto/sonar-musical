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
  /**
   * Guia "como tocar" nosso, quando existe: explica tom, progressão, técnica e
   * timbre — o que os sites de cifra não cobrem. A cifra em si fica na fonte externa.
   */
  guiaUrl?: string;
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
  {
    titulo: 'Enter Sandman',
    guiaUrl: '/blog/como-tocar-enter-sandman-metallica/',
    artista: 'Metallica',
    artistaSlug: 'metallica',
    dificuldade: 'Intermediário',
    genero: 'Metal',
    preview: '/images/metallica-banda-capa.webp',
    fonteExterna: {
      url: 'https://tabs.ultimate-guitar.com/tab/metallica/enter-sandman-tabs-8595',
      nome: 'Ultimate-Guitar (grátis)',
    },
  },
  {
    titulo: 'Nothing Else Matters',
    artista: 'Metallica',
    artistaSlug: 'metallica',
    dificuldade: 'Intermediário',
    genero: 'Metal',
    preview: '/images/metallica-banda-capa.webp',
    fonteExterna: {
      url: 'https://tabs.ultimate-guitar.com/tab/metallica/nothing-else-matters-tabs-8519',
      nome: 'Ultimate-Guitar (grátis)',
    },
  },
  {
    titulo: 'The Trooper',
    artista: 'Iron Maiden',
    artistaSlug: 'iron-maiden',
    dificuldade: 'Avançado',
    genero: 'Metal',
    preview: '/images/iron-maiden-sonar-banda-ajuste-webp.webp',
    fonteExterna: {
      url: 'https://tabs.ultimate-guitar.com/tab/iron-maiden/the-trooper-tabs-71439',
      nome: 'Ultimate-Guitar (grátis)',
    },
  },
  {
    titulo: 'Fear of the Dark',
    artista: 'Iron Maiden',
    artistaSlug: 'iron-maiden',
    dificuldade: 'Intermediário',
    genero: 'Metal',
    preview: '/images/iron-maiden-sonar-banda-ajuste-webp.webp',
    fonteExterna: {
      url: 'https://tabs.ultimate-guitar.com/tab/iron-maiden/fear-of-the-dark-tabs-11269',
      nome: 'Ultimate-Guitar (grátis)',
    },
  },
  {
    titulo: 'Wish You Were Here',
    guiaUrl: '/blog/como-tocar-wish-you-were-here-pink-floyd/',
    artista: 'Pink Floyd',
    artistaSlug: 'pink-floyd',
    dificuldade: 'Fácil',
    genero: 'Rock',
    preview: '/images/pink-floyd-sonar.webp',
    fonteExterna: {
      url: 'https://tabs.ultimate-guitar.com/tab/pink-floyd/wish-you-were-here-tabs-984061',
      nome: 'Ultimate-Guitar (grátis)',
    },
  },
  {
    titulo: 'Yellow',
    artista: 'Coldplay',
    artistaSlug: 'coldplay',
    dificuldade: 'Fácil',
    genero: 'Pop',
    preview: '/images/coldplay-band-sonar.webp',
    fonteExterna: {
      url: 'https://tabs.ultimate-guitar.com/tab/coldplay/yellow-chords-16492',
      nome: 'Ultimate-Guitar (grátis)',
    },
  },
  {
    titulo: 'Tempo Perdido',
    guiaUrl: '/blog/como-tocar-tempo-perdido-legiao-urbana/',
    artista: 'Legião Urbana',
    artistaSlug: 'legiao-urbana',
    dificuldade: 'Fácil',
    genero: 'Nacional',
    preview: '/images/legiao-urbana-banda-sonar.webp',
    fonteExterna: {
      url: 'https://tabs.ultimate-guitar.com/tab/1480057',
      nome: 'Ultimate-Guitar (grátis)',
    },
  },
  {
    titulo: 'Square Hammer',
    artista: 'Ghost',
    artistaSlug: 'ghost',
    dificuldade: 'Intermediário',
    genero: 'Metal',
    preview: '/images/ghost-wacken-2018-sonar.jpg',
    fonteExterna: {
      url: 'https://tabs.ultimate-guitar.com/tab/ghost/square-hammer-tabs-1875811',
      nome: 'Ultimate-Guitar (grátis)',
    },
  },
  {
    titulo: 'Nightmare',
    artista: 'Avenged Sevenfold',
    artistaSlug: 'avenged-sevenfold',
    dificuldade: 'Avançado',
    genero: 'Metal',
    preview: '/images/avenged-sevenfold-live-2009-sonar.jpg',
    fonteExterna: {
      url: 'https://tabs.ultimate-guitar.com/tab/avenged-sevenfold/nightmare-tabs-963515',
      nome: 'Ultimate-Guitar (grátis)',
    },
  },
  {
    titulo: 'Blinding Lights',
    artista: 'The Weeknd',
    artistaSlug: 'the-weeknd',
    dificuldade: 'Fácil',
    genero: 'R&B',
    preview: '/images/the-weeknd-abel-sonar.jpg',
    fonteExterna: {
      url: 'https://tabs.ultimate-guitar.com/tab/the-weeknd/blinding-lights-chords-2908700',
      nome: 'Ultimate-Guitar (grátis)',
    },
  },
  {
    titulo: 'Sosseguei',
    artista: 'Jorge & Mateus',
    artistaSlug: 'jorge-e-mateus',
    dificuldade: 'Fácil',
    genero: 'Sertanejo',
    preview: '/images/jorge-e-mateus-show-sonar.jpg',
    fonteExterna: {
      url: 'https://tabs.ultimate-guitar.com/tab/jorge-mateus/sosseguei-chords-4757435',
      nome: 'Ultimate-Guitar (grátis)',
    },
  },
  {
    titulo: 'Evidências',
    guiaUrl: '/blog/como-tocar-evidencias-chitaozinho-e-xororo/',
    artista: 'Chitãozinho & Xororó',
    artistaSlug: 'chitaozinho-e-xororo',
    dificuldade: 'Intermediário',
    genero: 'Sertanejo',
    preview: '/images/capa-xitaozinho-sona.webp',
    fonteExterna: {
      url: 'https://tabs.ultimate-guitar.com/tab/2323429',
      nome: 'Ultimate-Guitar (grátis)',
    },
  },
  {
    titulo: 'When I Was Your Man',
    artista: 'Bruno Mars',
    artistaSlug: 'bruno-mars',
    dificuldade: 'Fácil',
    genero: 'Pop',
    preview: '/images/bruno-mars-sonar.webp',
    fonteExterna: {
      url: 'https://tabs.ultimate-guitar.com/tab/bruno-mars/when-i-was-your-man-chords-1198871',
      nome: 'Ultimate-Guitar (grátis)',
    },
  },
];

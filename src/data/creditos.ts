export interface CreditoFoto {
  /** O que a foto retrata. */
  descricao: string;
  /** Slug da banda a que a foto pertence (para agrupar e linkar). */
  bandaSlug: string;
  bandaNome: string;
  /** Nome do fotógrafo/autor, exatamente como consta na fonte. */
  autor: string;
  /** Página do autor. Ausente quando o autor não tem página pública. */
  autorUrl?: string;
  /** Nome curto da licença (ex: "CC BY-SA 4.0"). */
  licenca: string;
  /** URL do texto da licença (deed do Creative Commons). */
  licencaUrl: string;
  /** Página do arquivo original no Wikimedia Commons. */
  fonteUrl: string;
}

/**
 * Fotos de artistas/bandas sob licença Creative Commons, que exigem atribuição.
 * Todas vêm do Wikimedia Commons. Ao adicionar novas, sempre preencher autor,
 * licença e fonte — e linkar o autor apenas se ele tiver página pública real.
 */
export const CREDITOS_FOTOS: CreditoFoto[] = [
  // Ghost
  {
    descricao: 'Ghost ao vivo no Wacken Open Air 2018 (foto de capa)',
    bandaSlug: 'ghost',
    bandaNome: 'Ghost',
    autor: 'Andreas Lawen, Fotandi',
    autorUrl: 'https://commons.wikimedia.org/wiki/User:Fotandi',
    licenca: 'CC BY-SA 4.0',
    licencaUrl: 'https://creativecommons.org/licenses/by-sa/4.0/deed.pt',
    fonteUrl: 'https://commons.wikimedia.org/wiki/File:Ghost_-_Wacken_Open_Air_2018-5009.jpg',
  },
  {
    descricao: 'Papa (vocalista) ao vivo em San Diego',
    bandaSlug: 'ghost',
    bandaNome: 'Ghost',
    autor: 'Pink Floyd Fan 101',
    licenca: 'CC BY-SA 4.0',
    licencaUrl: 'https://creativecommons.org/licenses/by-sa/4.0/deed.pt',
    fonteUrl: 'https://commons.wikimedia.org/wiki/File:GhostSanDiego4.jpg',
  },
  {
    descricao: 'Nameless Ghoul (guitarra) ao vivo',
    bandaSlug: 'ghost',
    bandaNome: 'Ghost',
    autor: 'BraunOBruno',
    licenca: 'CC BY-SA 4.0',
    licencaUrl: 'https://creativecommons.org/licenses/by-sa/4.0/deed.pt',
    fonteUrl: "https://commons.wikimedia.org/wiki/File:Ghost's_Nameless_Ghoul_with_confetti_on_the_background_(cropped).jpg",
  },

  // Avenged Sevenfold
  {
    descricao: 'Avenged Sevenfold ao vivo em 2009 (foto de capa)',
    bandaSlug: 'avenged-sevenfold',
    bandaNome: 'Avenged Sevenfold',
    autor: 'Gino037',
    autorUrl: 'https://it.wikipedia.org/wiki/Utente:Gino037',
    licenca: 'CC BY 3.0',
    licencaUrl: 'https://creativecommons.org/licenses/by/3.0/deed.pt',
    fonteUrl: 'https://commons.wikimedia.org/wiki/File:Avenged_Sevenfold_concert_2009.jpg',
  },
  {
    descricao: 'M. Shadows ao vivo no Nova Rock 2014',
    bandaSlug: 'avenged-sevenfold',
    bandaNome: 'Avenged Sevenfold',
    autor: 'Alfred Nitsch',
    licenca: 'CC BY-SA 3.0 AT',
    licencaUrl: 'https://creativecommons.org/licenses/by-sa/3.0/at/deed.pt',
    fonteUrl: 'https://commons.wikimedia.org/wiki/File:20140615-143-Nova_Rock_2014-Avenged_Sevenfold-M_Shadows.JPG',
  },
  {
    descricao: 'Synyster Gates ao vivo',
    bandaSlug: 'avenged-sevenfold',
    bandaNome: 'Avenged Sevenfold',
    autor: 'Altriascarlett13',
    licenca: 'CC BY-SA 4.0',
    licencaUrl: 'https://creativecommons.org/licenses/by-sa/4.0/deed.pt',
    fonteUrl: 'https://commons.wikimedia.org/wiki/File:Avenged-sevenfold-synyster-gates.jpg',
  },
  {
    descricao: 'Zacky Vengeance ao vivo no Nova Rock 2014',
    bandaSlug: 'avenged-sevenfold',
    bandaNome: 'Avenged Sevenfold',
    autor: 'Alfred Nitsch',
    licenca: 'CC BY-SA 3.0 AT',
    licencaUrl: 'https://creativecommons.org/licenses/by-sa/3.0/at/deed.pt',
    fonteUrl: 'https://commons.wikimedia.org/wiki/File:20140615-138-Nova_Rock_2014-Avenged_Sevenfold-Zacky_Vengeance.JPG',
  },
  {
    descricao: 'Johnny Christ ao vivo em 2018',
    bandaSlug: 'avenged-sevenfold',
    bandaNome: 'Avenged Sevenfold',
    autor: 'Markus Felix | PushingPixels',
    autorUrl: 'https://commons.wikimedia.org/wiki/User_talk:MarkusFelix',
    licenca: 'CC BY-SA 4.0',
    licencaUrl: 'https://creativecommons.org/licenses/by-sa/4.0/deed.pt',
    fonteUrl: 'https://commons.wikimedia.org/wiki/File:Johnny_Christ_in_2018_(cropped).jpg',
  },
  {
    descricao: 'Brooks Wackerman ao vivo em 2007',
    bandaSlug: 'avenged-sevenfold',
    bandaNome: 'Avenged Sevenfold',
    autor: 'Ricapar',
    autorUrl: 'https://en.wikipedia.org/wiki/User:Ricapar',
    licenca: 'CC BY-SA 3.0',
    licencaUrl: 'https://creativecommons.org/licenses/by-sa/3.0/deed.pt',
    fonteUrl: 'https://commons.wikimedia.org/wiki/File:BrooksWackerman-Starland_Ballroom-2007.jpg',
  },

  // The Weeknd
  {
    descricao: 'The Weeknd ao vivo no Stade de France (foto de capa)',
    bandaSlug: 'the-weeknd',
    bandaNome: 'The Weeknd',
    autor: 'Zakarie Faibis',
    autorUrl: 'https://commons.wikimedia.org/wiki/User:Randy110912',
    licenca: 'CC BY-SA 4.0',
    licencaUrl: 'https://creativecommons.org/licenses/by-sa/4.0/deed.pt',
    fonteUrl: 'https://commons.wikimedia.org/wiki/File:Concert_The_Weeknd_Paris_21.jpg',
  },
  {
    descricao: 'The Weeknd ao vivo no Festival d\'été de Québec 2018 (retrato)',
    bandaSlug: 'the-weeknd',
    bandaNome: 'The Weeknd',
    autor: 'Nicolas Padovani',
    autorUrl: 'https://www.flickr.com/people/128375980@N04',
    licenca: 'CC BY 2.0',
    licencaUrl: 'https://creativecommons.org/licenses/by/2.0/deed.pt',
    fonteUrl: 'https://commons.wikimedia.org/wiki/File:FEQ_July_2018_The_Weeknd_(44778856382)_(cropped).jpg',
  },

  // Jorge & Mateus
  {
    descricao: 'Jorge & Mateus ao vivo em show na Bahia (foto de capa)',
    bandaSlug: 'jorge-e-mateus',
    bandaNome: 'Jorge & Mateus',
    autor: 'Bahia Notícias',
    autorUrl: 'https://www.flickr.com/photos/bahianoticias/',
    licenca: 'CC BY 2.0',
    licencaUrl: 'https://creativecommons.org/licenses/by/2.0/deed.pt',
    fonteUrl: 'https://commons.wikimedia.org/wiki/File:Jorge_%26_Mateus_show_na_Bahia.jpg',
  },
];

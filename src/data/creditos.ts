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
  /** URL do texto da licença (deed do Creative Commons). Ausente em licenças
   *  de atribuição sem deed público — nesses casos os termos estão na fonte. */
  licencaUrl?: string;
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
    descricao: 'Ghost ao vivo no Wacken Open Air 2018 (preview de tablatura)',
    bandaSlug: 'ghost',
    bandaNome: 'Ghost',
    autor: 'Andreas Lawen, Fotandi',
    autorUrl: 'https://commons.wikimedia.org/wiki/User:Fotandi',
    licenca: 'CC BY-SA 4.0',
    licencaUrl: 'https://creativecommons.org/licenses/by-sa/4.0/deed.pt',
    fonteUrl: 'https://commons.wikimedia.org/wiki/File:Ghost_-_Wacken_Open_Air_2018-5009.jpg',
  },
  {
    descricao: 'Papa (vocalista) ao vivo em San Diego (foto de capa)',
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
    descricao: 'The Weeknd ao vivo no Festival d\'été de Québec 2018 (retrato e foto de capa)',
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

  // Charlie Brown Jr.
  {
    descricao: 'Chorão em cima do skate durante show, em 2012 (foto de capa)',
    bandaSlug: 'charlie-brown-jr',
    bandaNome: 'Charlie Brown Jr.',
    autor: 'Editorial J',
    autorUrl: 'https://www.flickr.com/people/62838085@N06',
    licenca: 'CC BY-SA 2.0',
    licencaUrl: 'https://creativecommons.org/licenses/by-sa/2.0/deed.pt',
    fonteUrl: 'https://commons.wikimedia.org/wiki/File:Charlie_Brown_Jr._-_Outubro_2012_(cropped).jpg',
  },

  // Titãs
  {
    descricao: 'Titãs ao vivo em 2012, com a banda no palco (foto de capa)',
    bandaSlug: 'titas',
    bandaNome: 'Titãs',
    autor: 'Will Kemet',
    licenca: 'CC BY 2.0',
    licencaUrl: 'https://creativecommons.org/licenses/by/2.0/deed.pt',
    fonteUrl: 'https://commons.wikimedia.org/wiki/File:Tit%C3%A3s2012.jpg',
  },

  // Capital Inicial
  {
    descricao: 'Capital Inicial ao vivo em palco de grande porte (foto de capa)',
    bandaSlug: 'capital-inicial',
    bandaNome: 'Capital Inicial',
    autor: 'Roni1986',
    autorUrl: 'https://commons.wikimedia.org/wiki/User:Roni1986',
    licenca: 'CC BY-SA 4.0',
    licencaUrl: 'https://creativecommons.org/licenses/by-sa/4.0/deed.pt',
    fonteUrl: 'https://commons.wikimedia.org/wiki/File:Capital_Inicial.jpg',
  },
  {
    descricao: 'Dinho Ouro Preto cantando ao vivo',
    bandaSlug: 'capital-inicial',
    bandaNome: 'Capital Inicial',
    autor: 'Elaine Kitahara e Chafik Buttros',
    licenca: 'CC BY 3.0',
    licencaUrl: 'https://creativecommons.org/licenses/by/3.0/deed.pt',
    fonteUrl: 'https://commons.wikimedia.org/wiki/File:Dinho_Ouro_Preto.jpg',
  },
  {
    descricao: 'Yves Passarell, guitarrista da banda',
    bandaSlug: 'capital-inicial',
    bandaNome: 'Capital Inicial',
    autor: 'Ricardo Stuckert/PR',
    licenca: 'Atribuição (termos na fonte)',
    fonteUrl: 'https://commons.wikimedia.org/wiki/File:Yves_Passarell.jpg',
  },
  {
    descricao: 'Flávio Lemos tocando baixo ao vivo',
    bandaSlug: 'capital-inicial',
    bandaNome: 'Capital Inicial',
    autor: 'Rafaeldbo',
    licenca: 'CC BY-SA 4.0',
    licencaUrl: 'https://creativecommons.org/licenses/by-sa/4.0/deed.pt',
    fonteUrl: 'https://commons.wikimedia.org/wiki/File:Flaviolemoscapitalinicial.jpg',
  },

  // Metallica
  {
    descricao: 'Metallica no Gershwin Prize da Library of Congress, 2024 (foto de capa)',
    bandaSlug: 'metallica',
    bandaNome: 'Metallica',
    autor: 'Library of Congress',
    licenca: 'CC0 1.0 (domínio público)',
    licencaUrl: 'https://creativecommons.org/publicdomain/zero/1.0/deed.pt',
    fonteUrl: 'https://commons.wikimedia.org/wiki/File:Metallica_March_2024.jpg',
  },

  // Coldplay
  {
    descricao: 'Coldplay ao vivo no Wembley Stadium (foto de capa)',
    bandaSlug: 'coldplay',
    bandaNome: 'Coldplay',
    autor: 'Raph_PH',
    autorUrl: 'https://www.flickr.com/people/raph_ph/',
    licenca: 'CC BY 4.0',
    licencaUrl: 'https://creativecommons.org/licenses/by/4.0/deed.pt',
    fonteUrl: 'https://commons.wikimedia.org/wiki/File:ColdplayWembley120925_(cropped).jpg',
  },

  // Bruno Mars
  {
    descricao: 'Bruno Mars ao vivo na turnê 24K Magic (foto de capa)',
    bandaSlug: 'bruno-mars',
    bandaNome: 'Bruno Mars',
    autor: 'slgckgc',
    autorUrl: 'https://www.flickr.com/people/slgckgc/',
    licenca: 'CC BY 4.0',
    licencaUrl: 'https://creativecommons.org/licenses/by/4.0/deed.pt',
    fonteUrl: 'https://commons.wikimedia.org/wiki/File:BrunoMars24KMagicWorldTourLive_(cropped).jpg',
  },

  // Iron Maiden
  {
    descricao: 'Iron Maiden ao vivo em Madri, 2016 (foto de capa)',
    bandaSlug: 'iron-maiden',
    bandaNome: 'Iron Maiden',
    autor: 'dr_zoidberg',
    autorUrl: 'https://www.flickr.com/people/dr_zoidberg/',
    licenca: 'CC BY-SA 2.0',
    licencaUrl: 'https://creativecommons.org/licenses/by-sa/2.0/deed.pt',
    fonteUrl: 'https://commons.wikimedia.org/wiki/File:Iron_Maiden_live_in_Madrid_13_July_2016.jpg',
  },

  // B.B. King
  {
    descricao: 'B.B. King em evento nos anos 1980 (foto de capa)',
    bandaSlug: 'bb-king',
    bandaNome: 'B.B. King',
    autor: 'Alan Light',
    autorUrl: 'https://www.flickr.com/people/alan-light/',
    licenca: 'CC BY 2.0',
    licencaUrl: 'https://creativecommons.org/licenses/by/2.0/deed.pt',
    fonteUrl: 'https://commons.wikimedia.org/wiki/File:B._B._King_(2088048328).jpg',
  },

  // Miles Davis
  {
    descricao: 'Miles Davis tocando trompete ao vivo em 1987 (foto de capa)',
    bandaSlug: 'miles-davis',
    bandaNome: 'Miles Davis',
    autor: 'Firma Hagblom-Foto',
    licenca: 'Domínio público',
    fonteUrl: 'https://commons.wikimedia.org/wiki/File:Miles_Davis_1987.png',
  },
];

/**
 * Fotos de guitarras usadas como recorte nas capas dos artigos (no lugar da
 * ilustração vetorial). Todas do Wikimedia Commons, sob Creative Commons, com
 * fundo removido/recortado para composição — a atribuição é exigida pela licença.
 */
export interface CreditoCapa {
  /** O que a foto retrata e onde é usada. */
  descricao: string;
  autor: string;
  autorUrl?: string;
  licenca: string;
  licencaUrl?: string;
  fonteUrl: string;
}

export const CREDITOS_CAPAS: CreditoCapa[] = [
  {
    descricao: "Fender Stratocaster (guia da Strinberg e outras)",
    autor: "Auge=mit",
    autorUrl: "https://commons.wikimedia.org/wiki/User:Auge%3Dmit",
    licenca: "CC BY-SA 4.0",
    licencaUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.pt",
    fonteUrl: "https://commons.wikimedia.org/wiki/File:Fender_Stratocaster_Relic_FCS_AvR.png",
  },
  {
    descricao: "Fender Telecaster American Vintage 1952 (guia da Telecaster)",
    autor: "Massimo Barbieri",
    licenca: "CC BY-SA 3.0",
    licencaUrl: "https://creativecommons.org/licenses/by-sa/3.0/deed.pt",
    fonteUrl: "https://commons.wikimedia.org/wiki/File:Fender_Telecaster_American_Vintage_1952_transparent.png",
  },
  {
    descricao: "Gibson ES-335 (guia da guitarra semiacústica)",
    autor: "Auge=mit",
    autorUrl: "https://commons.wikimedia.org/wiki/User:Auge%3Dmit",
    licenca: "CC BY-SA 4.0",
    licencaUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.pt",
    fonteUrl: "https://commons.wikimedia.org/wiki/File:Gibson_ES_335_64_GCS_AvR.png",
  },
  {
    descricao: "Gibson Flying V Classic White (guia da Flying V)",
    autor: "Monika Fischer",
    licenca: "CC BY-SA 2.5",
    licencaUrl: "https://creativecommons.org/licenses/by-sa/2.5/deed.pt",
    fonteUrl: "https://commons.wikimedia.org/wiki/File:Gibson_Flying_V_Classic_White_noBG.png",
  },
  {
    descricao: "Yamaha Pacifica 112VCX (guia da Yamaha)",
    autor: "muzyczny.pl",
    autorUrl: "http://muzyczny.pl",
    licenca: "CC BY-SA 4.0",
    licencaUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.pt",
    fonteUrl: "https://commons.wikimedia.org/wiki/File:Gitara_elektryczna_Pacifica_112-VCX_firmy_Yamaha.jpg",
  },
  {
    descricao: "Gibson Moderne (glossário da guitarra)",
    autor: "Guitarpimp",
    autorUrl: "https://commons.wikimedia.org/wiki/User:Guitarpimp",
    licenca: "CC BY-SA 4.0",
    licencaUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.pt",
    fonteUrl: "https://commons.wikimedia.org/wiki/File:Gibson-Moderne-Heritage_noBG.jpg",
  },
  {
    descricao: "Epiphone Casino (guia da Giannini)",
    autor: "Maxo",
    autorUrl: "https://commons.wikimedia.org/wiki/User:Maxo",
    licenca: "CC BY-SA 4.0",
    licencaUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.pt",
    fonteUrl: "https://commons.wikimedia.org/wiki/File:Epiphone_Casino_VT_noBG.jpg",
  },
  {
    descricao: "Fender Jazzmaster (guia da Tagima)",
    autor: "Dirk-X · recorte de Auge=mit",
    licenca: "CC BY-SA 4.0",
    licencaUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.pt",
    fonteUrl: "https://commons.wikimedia.org/wiki/File:Fender_Jazzmaster_red_noBG.jpg",
  },
  {
    descricao: "Fender Jag-Stang (guia das nacionais baratas)",
    autor: "Quentin Thiel · recorte de Auge=mit",
    licenca: "CC BY-SA 4.0",
    licencaUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.pt",
    fonteUrl: "https://commons.wikimedia.org/wiki/File:Fender_Jag-Stang_Sonic_Blue_noBG.png",
  },
  {
    descricao: "Fender Starcaster (guia das marcas nacionais)",
    autor: "Tasmer",
    autorUrl: "https://commons.wikimedia.org/wiki/User:Tasmer",
    licenca: "CC BY-SA 3.0",
    licencaUrl: "https://creativecommons.org/licenses/by-sa/3.0/deed.pt",
    fonteUrl: "https://commons.wikimedia.org/wiki/File:Fender_Starcaster_noBG.png",
  },
  {
    descricao: "Gibson Les Paul 59 (guia de presentes)",
    autor: "Auge=mit",
    autorUrl: "https://commons.wikimedia.org/wiki/User:Auge%3Dmit",
    licenca: "CC BY-SA 4.0",
    licencaUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.pt",
    fonteUrl: "https://commons.wikimedia.org/wiki/File:GIBSON_Les_Paul_59_Collectors_Choice_CC4_SANDY_No_010_AvR.png",
  },
  {
    descricao: "Ibanez Artist (partes da guitarra)",
    autor: "NSX-Racer",
    autorUrl: "https://commons.wikimedia.org/wiki/User:NSX-Racer",
    licenca: "CC BY-SA 3.0",
    licencaUrl: "https://creativecommons.org/licenses/by-sa/3.0/deed.pt",
    fonteUrl: "https://commons.wikimedia.org/wiki/File:Ibanez_Artist_noBG.png",
  },
  {
    descricao: "Gibson Explorer (quanto custa ser guitarrista)",
    autor: "Guitarpimp",
    autorUrl: "https://commons.wikimedia.org/wiki/User:Guitarpimp",
    licenca: "CC BY-SA 3.0",
    licencaUrl: "https://creativecommons.org/licenses/by-sa/3.0/deed.pt",
    fonteUrl: "https://commons.wikimedia.org/wiki/File:Gibson-Explorer_noBG.png",
  },
  {
    descricao: "Gibson ES-350T de Chuck Berry (quem inventou a guitarra)",
    autor: "Smithsonian (CC0)",
    licenca: "CC0",
    licencaUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.pt",
    fonteUrl: "https://commons.wikimedia.org/wiki/File:Gibson_ES_350T_Chuck_Berry_noBG.png",
  },
  {
    descricao: "Fender Jaguar (Tagima vs Squier)",
    autor: "badgreeb fattkatt · recorte de Auge=mit",
    licenca: "CC BY-SA 4.0",
    licencaUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.pt",
    fonteUrl: "https://commons.wikimedia.org/wiki/File:Fender_Jaguar_3_tone_burst_noBG.png",
  },
  {
    descricao: "Ibanez Artcore AS73G (guia da Ibanez)",
    autor: "Auge=mit",
    autorUrl: "https://commons.wikimedia.org/wiki/User:Auge%3Dmit",
    licenca: "CC BY-SA 4.0",
    licencaUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.pt",
    fonteUrl: "https://commons.wikimedia.org/wiki/File:Ibanez_AS73G_PBM_noBG.png",
  },
];

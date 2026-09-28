export interface Author {
  slug: string;
  name: string;
  role: string;
  shortBio: string;
  bio: string;
  photo: string;
  sameAs: string[];
}

export const authors: Record<string, Author> = {
  'igor-anholeto': {
    slug: 'igor-anholeto',
    name: 'Igor Silva Anholeto',
    role: 'Fundador e autor do Sonar Musical',
    shortBio:
      'Toca guitarra desde os 13 anos, com repertório que passa por rock clássico, metal, blues e boa parte dos gêneros no meio do caminho.',
    bio: 'Igor começou a tocar guitarra aos 13 anos e nunca mais parou. Ao longo desses anos, passou por gêneros que vão do rock clássico ao metal, do blues ao pop, e, no caminho, trocou e mexeu numa quantidade generosa de equipamento até entender o que faz diferença no som e o que é só marketing. É o responsável por todas as análises, comparativos e recomendações do Sonar Musical, escritas a partir de anos tocando e de pesquisa cuidadosa sobre cada equipamento.',
    photo: '/images/autores/igor-anholeto.webp',
    sameAs: ['https://www.linkedin.com/in/igor-s-anholeto/'],
  },
};

export function getAuthorByName(name: string | undefined): Author | undefined {
  if (!name) return undefined;
  return Object.values(authors).find((a) => a.name === name);
}

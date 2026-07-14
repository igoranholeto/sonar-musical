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
    bio: 'Igor começou a tocar guitarra aos 13 anos e nunca mais parou. Ao longo desses anos, passou por gêneros que vão do rock clássico ao metal, do blues ao pop — e, no processo, testou, trocou e desmontou uma quantidade generosa de equipamento até entender de verdade o que faz diferença no som e o que é só marketing. É o responsável por todas as análises, comparativos e recomendações do Sonar Musical: cada equipamento recomendado aqui passou pelas mãos dele antes de virar texto.',
    photo: '/images/autores/igor-anholeto.webp',
    sameAs: [],
  },
};

export function getAuthorByName(name: string | undefined): Author | undefined {
  if (!name) return undefined;
  return Object.values(authors).find((a) => a.name === name);
}

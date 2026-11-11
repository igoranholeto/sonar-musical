// Dados das páginas de ofertas (/black-friday/) e das fichas de produto (/produto/<id>/),
// montados no build a partir do catálogo (src/data/produtos) e dos posts que citam cada
// produto em <AfiliadoCTA id="..." />. Os preços e a situação do anúncio vêm da última
// checagem de scripts/check-afiliados.mjs --atualizar-precos.
import { getCollection, type CollectionEntry } from 'astro:content';
import { isPublished } from './posts';
import { detectMarca } from './schema';
import { valorComissao } from './comissao';

export type StatusAnuncio = 'ativo' | 'pausado' | 'encerrado';

export interface PostQueRecomenda {
  slug: string;
  titulo: string;
  badge?: string;
  descricao?: string;
  destaques: string[];
}

export interface Variacao {
  /** Preço anterior e atual da última mudança registrada. */
  de: number;
  para: number;
  em: Date;
  reais: number; // positivo = baixou
  pct: number; // positivo = baixou
}

export interface Oferta {
  id: string;
  nome: string;
  marca: string | null;
  categoria?: string;
  categoriaNome: string;
  imagem?: string;
  imagemAlt: string;
  meli: string;
  preco: number;
  precoEm: Date;
  status: StatusAnuncio;
  statusDesde?: Date;
  /** Preço riscado que o próprio anúncio exibe, e o "% OFF" dele. */
  antes?: number;
  off?: number;
  /** "10x R$ 470,70 sem juros" (só quando é sem juros). */
  parcelas?: string;
  freteGratis?: boolean;
  nota?: number;
  avaliacoes?: number;
  /** Preços que registramos, em ordem de data (cada ponto = dia em que o preço mudou). */
  historico: { data: Date; preco: number }[];
  acompanhadoDesde: Date;
  menor: { preco: number; em: Date };
  maior: { preco: number; em: Date };
  /** Preço de hoje é o menor que já registramos (e já houve preço maior antes). */
  menorRegistrado: boolean;
  variacao?: Variacao;
  /** Desconto exibido na etiqueta: o do anúncio; sem ele, a queda que registramos. */
  desconto?: { pct: number; reais: number; de: number; fonte: 'anuncio' | 'historico' };
  posts: PostQueRecomenda[];
  ficha: [string, string][];
  valorClique?: number;
  /** Para anúncio pausado/encerrado: produto parecido com anúncio ativo. */
  alternativa?: string;
}

export const NOMES_CATEGORIA: Record<string, { singular: string; plural: string }> = {
  guitarra: { singular: 'Guitarra', plural: 'Guitarras' },
  violao: { singular: 'Violão', plural: 'Violões' },
  baixo: { singular: 'Baixo', plural: 'Baixos' },
  amplificador: { singular: 'Amplificador', plural: 'Amplificadores' },
  pedal: { singular: 'Pedal', plural: 'Pedais' },
  pedaleira: { singular: 'Pedaleira', plural: 'Pedaleiras' },
  teclado: { singular: 'Teclado', plural: 'Teclados' },
  bateria: { singular: 'Bateria', plural: 'Baterias' },
  percussao: { singular: 'Instrumento de percussão', plural: 'Instrumentos de percussão' },
  ukulele: { singular: 'Ukulele', plural: 'Ukuleles' },
  cavaquinho: { singular: 'Cavaquinho', plural: 'Cavaquinhos' },
  viola: { singular: 'Viola caipira', plural: 'Violas caipiras' },
  bandolim: { singular: 'Bandolim', plural: 'Bandolins' },
  violino: { singular: 'Violino', plural: 'Violinos' },
  sopro: { singular: 'Instrumento de sopro', plural: 'Instrumentos de sopro' },
  interface: { singular: 'Interface de áudio', plural: 'Interfaces de áudio' },
  microfone: { singular: 'Microfone', plural: 'Microfones' },
  fone: { singular: 'Fone de ouvido', plural: 'Fones de ouvido' },
  estudio: { singular: 'Equipamento de estúdio', plural: 'Equipamentos de estúdio' },
  controlador: { singular: 'Controlador MIDI', plural: 'Controladores MIDI' },
  cordas: { singular: 'Encordoamento', plural: 'Encordoamentos' },
  acessorio: { singular: 'Acessório', plural: 'Acessórios' },
};

export const ORDEM_CATEGORIAS = Object.keys(NOMES_CATEGORIA);

const UTC = { timeZone: 'UTC' } as const;
export const fmtData = (d: Date) => d.toLocaleDateString('pt-BR', { ...UTC, day: '2-digit', month: '2-digit' });
export const fmtDataLonga = (d: Date) =>
  d.toLocaleDateString('pt-BR', { ...UTC, day: 'numeric', month: 'long', year: 'numeric' });
export const fmtDataAno = (d: Date) => d.toLocaleDateString('pt-BR', { ...UTC, day: '2-digit', month: '2-digit', year: 'numeric' });
export const reais = (v: number) => `R$ ${Math.round(v).toLocaleString('pt-BR')}`;

const pct = (de: number, para: number) => Math.round(((de - para) / de) * 100);

// Atributos de um <AfiliadoCTA ... /> no MDX (strings e o array destaques).
function atributosCTA(bloco: string) {
  const attr = (nome: string) => bloco.match(new RegExp(`\\b${nome}="([^"]*)"`))?.[1];
  const lista = bloco.match(/\bdestaques=\{\[([\s\S]*?)\]\}/)?.[1] ?? '';
  const destaques = [...lista.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1].replace(/\\"/g, '"'));
  return { id: attr('id'), badge: attr('badge'), descricao: attr('descricao'), destaques };
}

let cache: Promise<Map<string, Oferta>> | undefined;

/** Todas as ofertas do catálogo, por id (calculado uma vez por build). */
export function carregarOfertas(): Promise<Map<string, Oferta>> {
  cache ??= montar();
  return cache;
}

async function montar(): Promise<Map<string, Oferta>> {
  const [produtos, posts] = await Promise.all([getCollection('produtos'), getCollection('blog', isPublished)]);

  // Posts que recomendam cada produto (do mais novo para o mais antigo).
  const porProduto = new Map<string, PostQueRecomenda[]>();
  const ordenados = [...posts].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  for (const post of ordenados) {
    for (const bloco of post.body?.match(/<AfiliadoCTA[\s\S]*?\/>/g) ?? []) {
      const { id, ...resto } = atributosCTA(bloco);
      if (!id) continue;
      const lista = porProduto.get(id) ?? [];
      if (lista.some((p) => p.slug === post.id)) continue;
      lista.push({ slug: post.id, titulo: post.data.title, ...resto });
      porProduto.set(id, lista);
    }
  }

  const ofertas = new Map<string, Oferta>();
  for (const p of produtos) ofertas.set(p.id, montarOferta(p, porProduto.get(p.id) ?? []));

  // Alternativa para anúncio pausado/encerrado: mesma categoria, anúncio ativo, preço
  // mais próximo (em proporção), com bônus para mesma marca e para quem os guias recomendam,
  // e penalidade quando muda o tipo (nylon x aço, 5 cordas, infantil, kit, canhoto...).
  const ativos = [...ofertas.values()].filter((o) => o.status === 'ativo');
  for (const o of ofertas.values()) {
    if (o.status === 'ativo' || !o.categoria) continue;
    let melhor: Oferta | undefined;
    let menorDist = Infinity;
    for (const c of ativos) {
      if (c.categoria !== o.categoria || c.id === o.id) continue;
      const dist = distancia(o, c) - Math.min(c.posts.length, 3) * 0.03;
      if (dist < menorDist) {
        menorDist = dist;
        melhor = c;
      }
    }
    if (melhor) o.alternativa = melhor.id;
  }
  return ofertas;
}

// Palavras do nome que mudam o tipo de produto dentro da mesma categoria.
const TIPOS = [
  /nylon|n[áa]ilon|cl[áa]ssico/i,
  /\ba[çc]o\b|folk/i,
  /5 cordas|\bV\b|\b5c\b/,
  /7 cordas/i,
  /12 cordas/i,
  /infantil|\b1\/2\b|\b3\/4\b|kids/i,
  /\bkit\b/i,
  /canhoto/i,
  /el[ée]tric|eletroac|\bCE\b|\bEQ\b/,
  // Pedais: o efeito tem de bater.
  /delay|\beco\b|\bDD-/i,
  /reverb|\bRV-/i,
  /drive|distor|fuzz|\bDS-|screamer|\bSD-1\b/i,
  /chorus|flanger|phaser|tremolo|vibrato/i,
  /compress/i,
  /looper/i,
  /afinador|tuner/i,
  /\bwah\b/i,
  /fonte/i,
];
function diferencaDeTipo(a: string, b: string): number {
  return TIPOS.reduce((n, re) => n + Number(re.test(a) !== re.test(b)), 0);
}

/** Quão diferentes são dois produtos da mesma categoria: preço (em proporção), tipo e marca. */
export function distancia(a: Oferta, b: Oferta): number {
  return Math.abs(Math.log(b.preco / a.preco)) + diferencaDeTipo(a.nome, b.nome) * 0.6 - (b.marca && b.marca === a.marca ? 0.15 : 0);
}

function montarOferta(p: CollectionEntry<'produtos'>, posts: PostQueRecomenda[]): Oferta {
  const d = p.data;
  const preco = Math.round(d.preco);
  const historico = [...d.historico]
    .map((h) => ({ data: h.data, preco: Math.round(h.preco) }))
    .sort((a, b) => a.data.valueOf() - b.data.valueOf());
  if (!historico.length || historico.at(-1)!.preco !== preco) historico.push({ data: d.precoEm, preco });

  let menor = historico[0];
  let maior = historico[0];
  for (const h of historico) {
    if (h.preco <= menor.preco) menor = h;
    if (h.preco > maior.preco) maior = h;
  }

  let variacao: Variacao | undefined;
  if (historico.length >= 2) {
    const [a, b] = historico.slice(-2);
    if (a.preco !== b.preco) variacao = { de: a.preco, para: b.preco, em: b.data, reais: a.preco - b.preco, pct: pct(a.preco, b.preco) };
  }

  const an = d.anuncio;
  const status: StatusAnuncio = an?.status ?? 'ativo';
  const antes = status === 'ativo' && an?.antes && an.antes > preco ? Math.round(an.antes) : undefined;
  let desconto: Oferta['desconto'];
  if (antes) desconto = { pct: an?.off ?? pct(antes, preco), reais: antes - preco, de: antes, fonte: 'anuncio' };
  else if (status === 'ativo' && variacao && variacao.reais > 0 && variacao.pct >= 1)
    desconto = { pct: variacao.pct, reais: variacao.reais, de: variacao.de, fonte: 'historico' };

  const categoria = d.categoria;
  return {
    id: p.id,
    nome: d.nome,
    marca: detectMarca(d.nome),
    categoria,
    categoriaNome: categoria ? NOMES_CATEGORIA[categoria]?.singular ?? categoria : 'Equipamento',
    imagem: d.imagem,
    imagemAlt: d.imagemAlt ?? d.nome,
    meli: d.meli,
    preco,
    precoEm: d.precoEm,
    status,
    statusDesde: an?.desde,
    antes,
    off: antes ? an?.off : undefined,
    parcelas: status === 'ativo' && an?.parcelas && /sem juros/i.test(an.parcelas) ? an.parcelas.replace(/R\$(?=\d)/, 'R$ ') : undefined,
    freteGratis: status === 'ativo' ? an?.freteGratis : undefined,
    nota: d.nota,
    avaliacoes: d.avaliacoes,
    historico,
    acompanhadoDesde: historico[0].data,
    menor: { preco: menor.preco, em: menor.data },
    maior: { preco: maior.preco, em: maior.data },
    menorRegistrado: historico.length >= 2 && preco <= menor.preco && maior.preco > preco,
    variacao,
    desconto,
    posts,
    ficha: d.ficha ?? [],
    valorClique: valorComissao(preco, categoria),
  };
}

/** Produto com conteúdo próprio suficiente para a ficha entrar no Google: citado num guia
 * ou com ficha técnica de verdade (5+ características da página do produto no ML). */
export const fichaIndexavel = (o: Oferta) => o.posts.length > 0 || o.ficha.length >= 5;

/**
 * Ficha técnica que a página mostra. Parte das características da página do produto no
 * Mercado Livre (campo ficha do catálogo) e completa com o que dá para afirmar a partir do
 * próprio nome (cordas, nylon/aço, tamanho, teclas, potência, canhoto), para nenhuma ficha
 * sair vazia mesmo quando o anúncio não traz a tabela.
 */
export function linhasDaFicha(o: Oferta): [string, string][] {
  const linhas: [string, string][] = [];
  const tem = (re: RegExp) => linhas.some(([k]) => re.test(k)) || o.ficha.some(([k]) => re.test(k));
  const add = (k: string, v: string | undefined, re = new RegExp(`^${k}$`, 'i')) => {
    if (v && !tem(re)) linhas.push([k, v]);
  };
  const n = o.nome;
  const marcaFicha = o.ficha.find(([k]) => /^marca$/i.test(k))?.[1];
  const marca = marcaFicha ?? o.marca;
  if (marca) linhas.push(['Marca', marca]);
  // Modelo: o nome sem a marca (e o que vem antes dela) e sem o complemento entre parênteses.
  const semMarca = o.marca ? n.replace(new RegExp(`^.*?\\b${o.marca}\\b\\s*`, 'i'), '') : '';
  add('Modelo', semMarca.replace(/\s*\(.*?\)\s*/g, ' ').trim() || undefined);
  add('Tipo', o.categoriaNome !== 'Equipamento' ? o.categoriaNome : undefined, /^(tipo|tipo de produto)$/i);
  for (const [k, v] of o.ficha) if (!/^marca$/i.test(k)) linhas.push([k, v]);
  add('Quantidade de cordas', n.match(/\b(\d{1,2}) cordas\b/i)?.[1], /cordas/i);
  if (/^(violao|cavaquinho|viola)$/.test(o.categoria ?? '')) {
    add('Tipo de corda', /nylon/i.test(n) ? 'Nylon' : /\b(aço|folk)\b/i.test(n) ? 'Aço' : undefined, /tipo de corda|material das cordas/i);
  }
  add('Tamanho', n.match(/\b([1-4]\/[2-4])\b/)?.[1] ?? n.match(/\b(Soprano|Concert|Tenor|Barítono)\b/i)?.[1], /tamanho/i);
  add('Quantidade de teclas', n.match(/\b(\d{2}) (?:mini )?teclas\b/i)?.[1], /teclas/i);
  add('Potência', n.match(/\b(\d{1,4}) ?W\b/)?.[1]?.concat(' W'), /potência/i);
  if (/canhoto/i.test(n)) add('Orientação da mão', 'Canhoto', /orientação/i);
  return linhas;
}

/** Ordem padrão da vitrine ("Em destaque"): disponíveis; com desconto; mais indicados nos
 * guias; maior desconto; mais avaliados. Igual ao comparador "destaque" de OfertasVitrine. */
export function ordemPadrao(a: Oferta, b: Oferta): number {
  const disp = Number(b.status === 'ativo') - Number(a.status === 'ativo');
  const comDesc = (o: Oferta) => Number(o.status === 'ativo' && (o.desconto?.pct ?? 0) > 0);
  return (
    disp ||
    comDesc(b) - comDesc(a) ||
    b.posts.length - a.posts.length ||
    (b.desconto?.pct ?? 0) - (a.desconto?.pct ?? 0) ||
    (b.avaliacoes ?? 0) - (a.avaliacoes ?? 0)
  );
}

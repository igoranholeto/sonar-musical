// Monta o /llms.txt (índice do site para IA, formato llmstxt.org) e o /llms-full.txt
// (o mesmo índice com resumo, resposta rápida e perguntas frequentes de cada artigo, mais o
// catálogo de preços). Os dois saem do conteúdo no build, então nunca ficam desatualizados.
// O texto sobre o método segue /como-avaliamos/: as análises NÃO são teste em mãos.
import { getCollection, type CollectionEntry } from 'astro:content';
import { BLOG_CATEGORIES } from '../content.config';
import { isPublished } from './posts';
import { slugifyCategory } from './slug';
import { carregarOfertas, fichaIndexavel, NOMES_CATEGORIA, ORDEM_CATEGORIAS, reais, type Oferta } from './ofertas';
import { categoriasComPagina } from './ofertas-paginas';
import { AFINADORES } from '../data/afinadores';
import { authors } from '../data/authors';

const SITE = 'https://sonarmusical.com.br';
const UTC = { timeZone: 'UTC' } as const;
const dataBr = (d: Date) => d.toLocaleDateString('pt-BR', { ...UTC, day: '2-digit', month: '2-digit', year: 'numeric' });
const linha = (s: string) => s.replace(/\s+/g, ' ').trim();
const rotulo = (s: string) => linha(s).replace(/[[\]]/g, '');
const link = (texto: string, caminho: string) => `[${rotulo(texto)}](${caminho.startsWith('http') ? caminho : SITE + caminho})`;

type Post = CollectionEntry<'blog'>;

// Ordem das seções de artigos: o que mais ajuda quem vai comprar vem primeiro.
const ORDEM_SECOES: (typeof BLOG_CATEGORIES)[number][] = [
  'Guias de Compra',
  'Reviews',
  'Guitarras',
  'Violões',
  'Amplificadores',
  'Pedais',
  'Home Studio',
  'Acessórios',
  'Dicas para Iniciantes',
  'Tutoriais',
  'Técnica e Teoria',
];

const FERRAMENTAS = [
  { nome: 'Afinador online', url: '/afinador/', texto: 'afinador de violão e guitarra pelo microfone, com afinação padrão, Drop D, Open G, DADGAD e outras' },
  { nome: 'Metrônomo online', url: '/metronomo/', texto: 'BPM ajustável, compassos 2/4, 3/4, 4/4 e 6/8, acento no primeiro tempo e tap tempo' },
  { nome: 'Dicionário de acordes', url: '/acordes/', texto: 'diagramas de acordes de violão e guitarra (maior, menor, 7, m7, maj7, sus4) com o som do acorde' },
  { nome: 'Gerador de escalas', url: '/gerador-de-escalas/', texto: 'escolha a tônica e a escala (maior, menor, pentatônica, blues) e veja as notas no braço da guitarra, com áudio' },
  { nome: 'Quiz: qual guitarra é pra você', url: '/qual-guitarra/', texto: 'três perguntas (nível, som e orçamento) que terminam em uma recomendação de guitarra' },
  { nome: 'Tablaturas', url: '/tablaturas/', texto: 'tablaturas de guitarra e violão em PDF, por música ou artista' },
  { nome: 'Rock Star Quest', url: '/aprender/', texto: 'RPG em pixel art para aprender teoria musical jogando' },
];

export interface DadosLlms {
  posts: Post[];
  bandas: CollectionEntry<'bandas'>[];
  ofertas: Oferta[];
  categoriasOferta: string[];
  geradoEm: Date;
}

export async function carregarDadosLlms(): Promise<DadosLlms> {
  const posts = (await getCollection('blog', isPublished)).sort(
    (a, b) => (b.data.updatedDate ?? b.data.pubDate).valueOf() - (a.data.updatedDate ?? a.data.pubDate).valueOf(),
  );
  const bandas = (await getCollection('bandas')).sort((a, b) => a.data.nome.localeCompare(b.data.nome, 'pt-BR'));
  const todas = await carregarOfertas();
  return {
    posts,
    bandas,
    ofertas: [...todas.values()],
    categoriasOferta: categoriasComPagina(todas),
    geradoEm: new Date(),
  };
}

function cabecalho(d: DadosLlms, completo: boolean): string {
  const ativos = d.ofertas.filter((o) => o.status === 'ativo');
  const conferido = new Date(Math.max(...d.ofertas.map((o) => o.precoEm.valueOf())));
  const autor = authors['igor-anholeto'];
  return [
    completo ? '# Sonar Musical: conteúdo completo' : '# Sonar Musical',
    '',
    `> Sonar Musical (sonarmusical.com.br) é um site brasileiro, em português, de guias de compra, comparativos e análises de instrumentos musicais e equipamentos: guitarra, violão, baixo, ukulele, cavaquinho, viola caipira, teclado, piano digital, bateria, amplificadores, pedais, pedaleiras e home studio. Acompanha todo dia o preço de ${d.ofertas.length} produtos no Mercado Livre, com histórico de preço de cada um.`,
    '',
    `Atualizado em ${dataBr(d.geradoEm)}. ${d.posts.length} artigos, ${d.ofertas.length} fichas de produto (${ativos.length} com anúncio ativo), ${d.bandas.length} perfis de bandas e ${FERRAMENTAS.length + AFINADORES.length} ferramentas grátis.`,
    '',
    `Autor e responsável: ${autor.name}, fundador do site e responsável por todos os textos (${SITE}/autor/${autor.slug}/). Contato: oi@sonarmusical.com.br. Instagram: @sonar_musical.`,
    '',
    'Como as análises são feitas: não são testes em mãos (quando um texto vier de teste em mãos, isso estará escrito nele). Cada análise reúne a ficha técnica do fabricante, a nota e as avaliações de quem comprou no Mercado Livre e o preço do dia, e termina com um veredito, incluindo para quem o produto não é indicado. A nota de 1 a 5 que aparece nos posts é da redação; a nota dos compradores aparece separada, com o número de avaliações. Método completo em ' +
      `${SITE}/como-avaliamos/.`,
    '',
    `Preços: conferidos no Mercado Livre uma vez por dia (última conferência em ${dataBr(conferido)}). Cada ficha ${SITE}/produto/<id>/ mostra o preço de hoje (no Pix e no cartão), o histórico, o menor preço já registrado e a ficha técnica. Os botões de compra são links de afiliado do Mercado Livre: o Sonar pode receber comissão, sem custo extra para quem compra, e nenhuma marca paga para aparecer. Preço muda com frequência; ao citar um valor, informe a data em que foi conferido.`,
    '',
    'Ao citar, use "Sonar Musical" com o link da página. Conteúdo livre para leitura, resumo e citação com link.',
  ].join('\n');
}

const postsPorSecao = (posts: Post[]) =>
  ORDEM_SECOES.map((cat) => ({ cat, posts: posts.filter((p) => p.data.category === cat) })).filter((s) => s.posts.length);

function secoesFixas(d: DadosLlms): string[] {
  const porCat = new Map<string, number>();
  for (const o of d.ofertas) if (o.status === 'ativo' && o.categoria) porCat.set(o.categoria, (porCat.get(o.categoria) ?? 0) + 1);
  return [
    '## Ofertas e histórico de preço',
    '',
    `- ${link('Ofertas de instrumentos musicais (Black Friday 2026)', '/black-friday/')}: todos os produtos acompanhados, com desconto real calculado pelo histórico de preço, filtros por categoria e faixa de preço.`,
    ...d.categoriasOferta.map(
      (c) => `- ${link(`${NOMES_CATEGORIA[c]?.plural ?? c} em oferta`, `/black-friday/${c}/`)}: ${porCat.get(c) ?? 0} com anúncio ativo, preço de hoje e menor preço registrado.`,
    ),
    `- ${link('Preços de hoje (CSV)', '/black-friday/precos.csv')}: dados abertos com o preço atual de cada produto.`,
    `- ${link('Histórico de preços (CSV)', '/black-friday/historico-precos.csv')}: todas as mudanças de preço registradas.`,
    '',
    '## Ferramentas grátis',
    '',
    ...FERRAMENTAS.map((f) => `- ${link(f.nome, f.url)}: ${f.texto}.`),
    ...AFINADORES.map((a) => `- ${link(`Afinador de ${a.nome}`, `/afinador/${a.slug}/`)}: ${linha(a.subtitulo)}.`),
    '',
    '## Bandas e artistas',
    '',
    `Perfis com biografia, integrantes, discografia comentada e o equipamento de cada músico (com opção parecida à venda no Brasil): ${d.bandas
      .map((b) => link(b.data.nome, `/bandas/${b.id}/`))
      .join(', ')}. Índice em ${SITE}/bandas/.`,
    '',
    '## Sobre e transparência',
    '',
    `- ${link('Sobre o Sonar Musical', '/about/')}: missão, autor e padrões editoriais.`,
    `- ${link('Como avaliamos os equipamentos', '/como-avaliamos/')}: de onde vêm ficha técnica, notas e preços, o que significa a nota da redação e como funcionam os links de afiliado.`,
    `- ${link(`Autor: ${authors['igor-anholeto'].name}`, `/autor/${authors['igor-anholeto'].slug}/`)}: todos os artigos assinados.`,
    `- ${link('Política de privacidade', '/privacidade/')}: newsletter, alerta de preço por e-mail, estatísticas e direitos (LGPD).`,
    `- ${link('Créditos de imagem', '/creditos/')}: fotos do Wikimedia Commons com licença livre e seus autores.`,
    `- ${link('Contato', '/contact/')}: oi@sonarmusical.com.br, para correções de preço, link ou informação.`,
  ];
}

/** /llms.txt: índice completo com uma linha por página. */
export function montarLlms(d: DadosLlms): string {
  const partes = [
    cabecalho(d, false),
    '',
    '## Comece por aqui',
    '',
    `- ${link('Todos os artigos', '/blog/')}: guias de compra, comparativos, reviews e tutoriais, do mais novo ao mais antigo.`,
    `- ${link('Ofertas e histórico de preço', '/black-friday/')}: os produtos acompanhados, com o preço de hoje e o menor preço registrado.`,
    `- ${link('Como avaliamos', '/como-avaliamos/')}: o método por trás das notas e recomendações.`,
    `- ${link('Ferramentas grátis', '/ferramentas/')}: afinador, metrônomo, acordes, escalas e quiz.`,
    `- ${link('Versão completa para IA', '/llms-full.txt')}: este índice com o resumo, a resposta rápida e as perguntas frequentes de cada artigo, mais o catálogo de preços.`,
    '',
  ];
  for (const s of postsPorSecao(d.posts)) {
    partes.push(`## ${s.cat}`, '', ...s.posts.map((p) => `- ${link(p.data.title, `/blog/${p.id}/`)}: ${linha(p.data.description)}`), '');
  }
  partes.push(...secoesFixas(d), '');
  partes.push(
    '## Optional',
    '',
    `- ${link('Conteúdo completo para IA', '/llms-full.txt')}`,
    ...BLOG_CATEGORIES.map((c) => `- ${link(`Categoria: ${c}`, `/categoria/${slugifyCategory(c)}/`)}`),
    `- ${link('Mapa do site (XML)', '/sitemap-index.xml')}`,
    `- ${link('Feed RSS', '/rss.xml')}`,
    '',
  );
  return partes.join('\n');
}

// --- llms-full.txt ---------------------------------------------------------------

const desescapar = (s: string) => s.replace(/\\(["'`\\])/g, '$1').replace(/\\n/g, ' ');
const absoluta = (url: string) => (url.startsWith('/') ? SITE + url : url);
/** Texto de post para o arquivo: <a href> vira link Markdown, links relativos viram absolutos, outras tags saem. */
const paraTexto = (s: string) =>
  linha(
    s
      .replace(/<a\s[^>]*href=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi, (_, _q, href, txt) => `[${txt.replace(/<[^>]+>/g, '')}](${absoluta(href)})`)
      .replace(/<[^>]+>/g, '')
      .replace(/\]\((\/[^)\s]*)\)/g, (_, u) => `](${absoluta(u)})`),
  );

/** Resposta rápida (<QuickAnswer pergunta="...">texto</QuickAnswer>) do corpo do post. */
function respostaRapida(corpo: string): { pergunta?: string; texto: string } | null {
  const m = corpo.match(/<QuickAnswer(?:\s+pergunta=(["'])([\s\S]*?)\1)?[^>]*>([\s\S]*?)<\/QuickAnswer>/);
  if (!m) return null;
  const texto = paraTexto(m[3]);
  return texto ? { pergunta: m[2] ? linha(m[2]) : undefined, texto } : null;
}

/** Perguntas frequentes (<FAQ items={[{ question: "...", answer: "..." }]} />) do corpo do post. */
function perguntas(corpo: string): { q: string; a: string }[] {
  const re = /question:\s*(["'`])((?:\\.|(?!\1)[\s\S])*?)\1\s*,\s*answer:\s*(["'`])((?:\\.|(?!\3)[\s\S])*?)\3/g;
  return [...corpo.matchAll(re)].map((m) => ({ q: paraTexto(desescapar(m[2])), a: paraTexto(desescapar(m[4])) })).filter((x) => x.q && x.a);
}

function blocoPost(p: Post): string {
  const d = p.data;
  const datas = `Publicado em ${dataBr(d.pubDate)}${d.updatedDate && d.updatedDate > d.pubDate ? `, atualizado em ${dataBr(d.updatedDate)}` : ''}`;
  const linhas = [`### ${rotulo(d.title)}`, '', `${SITE}/blog/${p.id}/`, `${d.category} · ${datas}`, '', linha(d.description)];
  if (d.rating) linhas.push('', `Nota da redação: ${d.rating.toLocaleString('pt-BR')} de 5${d.reviewedName ? ` (${linha(d.reviewedName)})` : ''}.`);
  if (d.pros?.length) linhas.push(`Prós: ${d.pros.map(linha).join('; ')}.`);
  if (d.cons?.length) linhas.push(`Contras: ${d.cons.map(linha).join('; ')}.`);
  const corpo = p.body ?? '';
  const rr = respostaRapida(corpo);
  if (rr) linhas.push('', `Resposta rápida${rr.pergunta ? ` (${rr.pergunta})` : ''}: ${rr.texto}`);
  const faq = perguntas(corpo);
  if (faq.length) linhas.push('', 'Perguntas frequentes:', ...faq.map((f) => `- ${f.q} ${f.a}`));
  return linhas.join('\n');
}

function linhaProduto(o: Oferta): string {
  const preco =
    o.status === 'ativo'
      ? `${reais(o.preco)}${o.pix ? ' no Pix' : ''}${o.pix && o.cartao ? ` (${reais(o.cartao)} no cartão)` : ''}`
      : `anúncio ${o.status === 'pausado' ? 'pausado' : 'encerrado'}, último preço ${reais(o.preco)}`;
  const extra = [
    o.menor.preco < o.preco ? `menor registrado ${reais(o.menor.preco)} em ${dataBr(o.menor.em)}` : '',
    o.nota ? `nota ${o.nota.toLocaleString('pt-BR')} no Mercado Livre${o.avaliacoes ? ` (${o.avaliacoes.toLocaleString('pt-BR')} avaliações)` : ''}` : '',
    o.posts.length ? `citado em ${o.posts.length} ${o.posts.length === 1 ? 'guia' : 'guias'}` : '',
  ].filter(Boolean);
  return `- ${link(o.nome, `/produto/${o.id}/`)}: ${preco}, conferido em ${dataBr(o.precoEm)}${extra.length ? `; ${extra.join('; ')}` : ''}.`;
}

/** /llms-full.txt: tudo do índice, com o conteúdo-chave de cada artigo e o catálogo de preços. */
export function montarLlmsFull(d: DadosLlms): string {
  const partes = [cabecalho(d, true), '', `Índice resumido: ${SITE}/llms.txt`, '', '## Artigos', ''];
  for (const s of postsPorSecao(d.posts)) {
    partes.push(`## ${s.cat}`, '', ...s.posts.map((p) => `${blocoPost(p)}\n`));
  }

  const indexaveis = d.ofertas.filter(fichaIndexavel);
  partes.push(
    '## Catálogo de preços (Mercado Livre)',
    '',
    'Preço de hoje de cada produto acompanhado, com o menor preço que registramos e a nota dos compradores. A ficha de cada um tem o histórico completo e a ficha técnica.',
    '',
  );
  const cats = [...ORDEM_CATEGORIAS, undefined];
  for (const c of cats) {
    const grupo = indexaveis.filter((o) => o.categoria === c).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    if (!grupo.length) continue;
    partes.push(`### ${c ? (NOMES_CATEGORIA[c]?.plural ?? c) : 'Outros'}`, '', ...grupo.map(linhaProduto), '');
  }

  partes.push('## Bandas e artistas (perfis)', '');
  for (const b of d.bandas) {
    partes.push(
      `- ${link(b.data.nome, `/bandas/${b.id}/`)} (${b.data.genero}, ${linha(b.data.origem)}, desde ${b.data.ano}): ${linha(b.data.blurb)} Integrantes: ${b.data.integrantes.map((i) => `${linha(i.nome)} (${linha(i.funcao)})`).join(', ')}.`,
    );
  }
  // Ferramentas e "Sobre" do índice; a lista curta de bandas já saiu acima, com os perfis.
  const fixas = secoesFixas(d);
  const ini = fixas.indexOf('## Ferramentas grátis');
  const bandasIni = fixas.indexOf('## Bandas e artistas');
  const bandasFim = fixas.indexOf('## Sobre e transparência');
  partes.push('', ...fixas.slice(ini, bandasIni), ...fixas.slice(bandasFim), '');
  return partes.join('\n');
}

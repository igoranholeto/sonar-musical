// Busca do site: produtos do catálogo (/busca-produtos.json, gerado no build) e guias
// (Pagefind, gerado depois do build). Usada pelo painel de busca do menu e pela /busca/.

interface ProdutoJson {
  i: string; // id
  n: string; // nome
  p: number; // preço de hoje
  f: string; // imagem
  c: string; // categoria
  s: 0 | 1 | 2; // ativo, pausado, encerrado
  a: number; // avaliações
  k: string; // marca e categoria normalizadas
}

interface Produto extends ProdutoJson {
  nomeNorm: string;
  palheiro: string;
}

export interface Guia {
  url: string;
  titulo: string;
}

export const normalizar = (t: string) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

let produtos: Promise<Produto[]> | null = null;

export function carregarProdutos(): Promise<Produto[]> {
  produtos ??= fetch('/busca-produtos.json')
    .then((r) => (r.ok ? r.json() : []))
    .then((lista: ProdutoJson[]) =>
      lista.map((p) => {
        const nomeNorm = normalizar(p.n);
        return { ...p, nomeNorm, palheiro: `${nomeNorm} ${p.i.replace(/-/g, ' ')} ${p.k}` };
      }),
    )
    .catch(() => {
      produtos = null;
      return [];
    });
  return produtos;
}

/** Variações do termo para aceitar plural simples ("fones" acha "fone"). */
function variacoes(termo: string) {
  const v = [termo];
  if (termo.length > 4 && termo.endsWith('es')) v.push(termo.slice(0, -2));
  if (termo.length > 3 && termo.endsWith('s')) v.push(termo.slice(0, -1));
  return v;
}

/** O termo aparece em qualquer ponto do texto. */
const contem = (texto: string, termo: string) => variacoes(termo).some((v) => texto.includes(v));

/** O termo começa uma palavra do texto ("fone" em "fone de ouvido", não em "microfone"). */
const iniciaPalavra = (texto: string, termo: string) => variacoes(termo).some((v) => ` ${texto}`.includes(` ${v}`));

export function buscarProdutos(lista: Produto[], consulta: string, limite = 6): Produto[] {
  const q = normalizar(consulta);
  const termos = q.split(' ').filter(Boolean);
  if (!termos.length) return [];
  const achados: { p: Produto; pontos: number }[] = [];
  for (const p of lista) {
    if (!termos.every((t) => contem(p.palheiro, t))) continue;
    let pontos = 0;
    if (p.nomeNorm.startsWith(q)) pontos += 40;
    for (const t of termos) {
      if (iniciaPalavra(p.nomeNorm, t)) pontos += 10;
      // Termo que é a categoria ou a marca ("microfone", "fender") puxa os produtos dela
      // para cima de um item de outra categoria que só cita a palavra no nome.
      if (iniciaPalavra(p.k, t)) pontos += 15;
      // Achado só no meio de uma palavra ("fone" dentro de "microfone") vai para o fim.
      if (!iniciaPalavra(p.palheiro, t)) pontos -= 40;
    }
    pontos += p.s === 0 ? 20 : p.s === 1 ? 5 : 0;
    pontos += Math.min(p.a, 5000) / 500;
    achados.push({ p, pontos });
  }
  return achados.sort((a, b) => b.pontos - a.pontos).slice(0, limite).map((x) => x.p);
}

// Pagefind só existe depois do build (npm run build); em `astro dev` a busca de guias fica vazia.
let pagefind: Promise<any> | null = null;

export function carregarPagefind() {
  const url = '/pagefind/pagefind.js';
  pagefind ??= import(/* @vite-ignore */ url).catch(() => null);
  return pagefind;
}

export async function buscarGuias(consulta: string, limite = 4): Promise<Guia[]> {
  const pf = await carregarPagefind();
  if (!pf) return [];
  try {
    const r = await pf.search(consulta);
    const dados = await Promise.all(r.results.slice(0, limite).map((x: any) => x.data()));
    return dados.map((d: any) => ({ url: d.url, titulo: d.meta?.title ?? d.url }));
  } catch {
    return [];
  }
}

export const esc = (t: string) =>
  t.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const preco = (v: number) => `R$ ${v.toLocaleString('pt-BR')}`;
const SITUACAO = ['', 'Esgotado', 'Anúncio encerrado'];

export function htmlProdutos(lista: Produto[]) {
  return `<ul class="bp-lista" role="list">${lista
    .map(
      (p) => `<li><a class="bp-prod" href="/produto/${esc(p.i)}/">${
        p.f
          ? `<img src="${esc(p.f)}" alt="" width="48" height="48" loading="lazy" decoding="async">`
          : '<span class="bp-prod__sem-foto" aria-hidden="true"></span>'
      }<span class="bp-prod__txt"><span class="bp-prod__nome">${esc(p.n)}</span><span class="bp-prod__cat">${esc(p.c)}</span></span><span class="bp-prod__preco${p.s ? ' bp-prod__preco--off' : ''}">${
        p.s ? `<small>${SITUACAO[p.s]}</small>` : ''
      }${preco(p.p)}</span></a></li>`,
    )
    .join('')}</ul>`;
}

export function htmlGuias(lista: Guia[]) {
  return `<ul class="bp-lista" role="list">${lista
    .map(
      (g) =>
        `<li><a class="bp-guia" href="${esc(g.url)}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span>${esc(g.titulo)}</span></a></li>`,
    )
    .join('')}</ul>`;
}

import { execSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';

/**
 * Data do último commit de cada arquivo versionado, em uma única passada pelo
 * git log. O log vem do mais recente para o mais antigo, então o primeiro
 * registro de cada arquivo é o que vale.
 */
function gitDatesByFile() {
  const map = new Map();
  let out;
  try {
    out = execSync('git log --pretty=format:@%cI --name-only', {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    // Sem git (ou clone raso): o sitemap sai sem lastmod, que é melhor do que
    // sair com uma data inventada.
    return map;
  }

  let commitDate = null;
  for (const line of out.split('\n')) {
    if (line.startsWith('@')) commitDate = line.slice(1);
    else if (line && commitDate && !map.has(line)) map.set(line, commitDate);
  }
  return map;
}

/**
 * Arquivo-fonte que determina o conteúdo de cada URL. Páginas de álbum e de
 * equipamentos são geradas a partir do markdown da banda, então herdam a data
 * dele.
 */
function sourceFor(pathname) {
  const [secao, item] = pathname.split('/').filter(Boolean);

  if (!secao) return 'src/pages/index.astro';
  if (secao === 'bandas') return item ? `src/data/bandas/${item}.md` : 'src/pages/bandas/index.astro';
  if (secao === 'blog') return item ? `src/data/blog/${item}.mdx` : 'src/pages/blog/index.astro';
  if (secao === 'categoria') return 'src/pages/categoria/[categoria].astro';
  if (secao === 'autor') return 'src/pages/autor/[slug].astro';
  if (secao === 'tablaturas') return 'src/data/tablaturas.ts';
  if (secao === 'aprender') return item ? `src/pages/aprender/${item}.astro` : 'src/pages/aprender/index.astro';
  return `src/pages/${secao}.astro`;
}

/**
 * Categoria de cada JSON do catálogo. As páginas de Black Friday e as fichas
 * /produto/ são geradas desses arquivos, que a rotina diária de preços
 * commita quando o anúncio muda.
 */
function categoriaPorProduto() {
  const map = new Map();
  try {
    for (const f of readdirSync('src/data/produtos')) {
      if (!f.endsWith('.json')) continue;
      const { categoria } = JSON.parse(readFileSync(`src/data/produtos/${f}`, 'utf8'));
      map.set(`src/data/produtos/${f}`, categoria ?? null);
    }
  } catch {
    // Sem catálogo: essas URLs saem sem lastmod.
  }
  return map;
}

/** Commit mais recente entre os produtos (de uma categoria ou de todas). */
function maisRecente(dates, categorias, categoria) {
  let melhor = null;
  for (const [arquivo, cat] of categorias) {
    if (categoria && cat !== categoria) continue;
    const d = dates.get(arquivo);
    if (d && (!melhor || Date.parse(d) > Date.parse(melhor))) melhor = d;
  }
  return melhor;
}

/** `serialize` do @astrojs/sitemap que preenche lastmod a partir do histórico. */
export function lastmodSerializer() {
  const dates = gitDatesByFile();
  const categorias = categoriaPorProduto();

  return (item) => {
    const pathname = new URL(item.url).pathname;
    const [secao, slug] = pathname.split('/').filter(Boolean);
    let date;
    if (secao === 'produto' && slug) date = dates.get(`src/data/produtos/${slug}.json`);
    else if (secao === 'black-friday') date = maisRecente(dates, categorias, slug);
    else date = dates.get(sourceFor(pathname));
    if (date) item.lastmod = date;
    return item;
  };
}

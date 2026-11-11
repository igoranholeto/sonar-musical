// Verifica para onde cada link de afiliado meli.la do site leva de fato.
// O Mercado Livre manda o link curto para a página social do afiliado com o produto em
// destaque (URL com ref=). Quando o anúncio é encerrado, o mesmo link cai na página genérica
// de listas (/social/<id>/lists), e o leitor não encontra o produto. Quando é só pausado, a
// página abre normalmente, mas o primeiro card (o produto do link) traz "Anúncio pausado".
// Uso: node scripts/check-afiliados.mjs   (lista só os quebrados; --all mostra todos)
//      --md arquivo.md grava um relatório em Markdown (usado pelo GitHub Actions)
//      --atualizar-precos grava no catálogo o preço que o ML mostra hoje em cada link OK
//        (og:title) e corrige os preços antigos no texto dos posts (lib/precos-texto.mjs)
import fs from 'node:fs';
import path from 'node:path';
import { sincronizarPrecosTexto, imprimirRelatorio, hojeISO, fmtPreco } from './lib/precos-texto.mjs';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36';
const links = new Map(); // url -> { produtos:Set, onde:Set, ids:Set }

function add(url, produto, onde, id) {
  if (!links.has(url)) links.set(url, { produtos: new Set(), onde: new Set(), ids: new Set() });
  const l = links.get(url);
  if (produto) l.produtos.add(produto);
  if (id) l.ids.add(id);
  l.onde.add(onde);
}

// Catálogo: src/data/produtos/<id>.json. Os posts citam o produto por <AfiliadoCTA id="..." />.
const CAT = 'src/data/produtos';
const catalogo = new Map();
for (const f of fs.readdirSync(CAT).filter((f) => f.endsWith('.json'))) {
  catalogo.set(f.replace(/\.json$/, ''), JSON.parse(fs.readFileSync(path.join(CAT, f), 'utf8')));
}
const usados = new Set();
for (const f of fs.readdirSync('src/data/blog').filter((f) => /\.mdx?$/.test(f))) {
  const t = fs.readFileSync(path.join('src/data/blog', f), 'utf8');
  const onde = `blog/${f.replace(/\.mdx?$/, '')}`;
  for (const c of t.match(/<AfiliadoCTA[\s\S]*?\/>/g) ?? []) {
    const id = c.match(/\bid="([^"]+)"/)?.[1];
    const url = c.match(/\burl="([^"]+)"/)?.[1] ?? catalogo.get(id)?.meli;
    if (id && !catalogo.has(id)) console.log(`ERRO\t${onde}: produto "${id}" não existe no catálogo`);
    if (id) usados.add(id);
    if (url?.includes('meli.la')) add(url, c.match(/produto="([^"]+)"/)?.[1] ?? catalogo.get(id)?.nome, onde, id);
  }
}
// Produtos do catálogo que nenhum post usa também são checados (podem voltar a ser usados).
for (const [id, p] of catalogo) if (!usados.has(id)) add(p.meli, p.nome, '(catálogo, sem uso)', id);

// Bandas: urlAfiliado no frontmatter (nome do item fica na linha "nome:" anterior)
for (const f of fs.readdirSync('src/data/bandas').filter((f) => /\.mdx?$/.test(f))) {
  const lines = fs.readFileSync(path.join('src/data/bandas', f), 'utf8').split('\n');
  lines.forEach((ln, i) => {
    const url = ln.match(/urlAfiliado:\s*(https:\/\/meli\.la\/\S+)/)?.[1];
    if (!url) return;
    // nome do item: mesmo bloco YAML (mesma indentação), antes ou depois da URL
    const ind = ln.match(/^\s*/)[0].length;
    let nome;
    for (const j of [i - 1, i - 2, i - 3, i - 4, i + 1, i + 2, i + 3]) {
      const m = lines[j]?.match(/^(\s*)(?:- )?nome:\s*(.+?)\s*$/);
      if (m && m[1].length + (lines[j].includes('- nome') ? 2 : 0) === ind) { nome = m[2]; break; }
    }
    add(url, nome, `bandas/${f.replace(/\.mdx?$/, '')}`);
  });
}

// URL final + título do produto em destaque (og:title da página social), para conferir se
// o link leva ao MESMO produto do CTA (já houve link "Pacifica 112V" abrindo outra Pacifica).
async function destino(url) {
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    try {
      const r = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': UA } });
      const html = await r.text();
      const titulo = html.match(/<meta property="og:title" content="([^"]*)"/)?.[1] ?? '';
      // O aviso de pausa só conta no primeiro card; os seguintes são outros produtos da lista.
      const [c1, c2 = html.length] = [...html.matchAll(/class="poly-card[ "]/g)].map((m) => m.index);
      const card = c1 != null ? html.slice(c1, c2) : '';
      const pausado = card.includes('Anúncio pausado');
      return { fim: r.url, titulo, pausado, card: dadosDoCard(card) };
    } catch {
      await new Promise((ok) => setTimeout(ok, 1500));
    }
  }
  return { fim: '', titulo: '', pausado: false, card: {} };
}

// O primeiro card da página social é o produto do link. Dele saem o preço riscado que o
// anúncio exibe ("Antes: 999 reais"), o "48% OFF", as parcelas, o frete grátis e o link do
// produto no catálogo do ML (/p/MLB...), usado só para coletar a ficha técnica.
function dadosDoCard(card) {
  if (!card) return {};
  const reais = (rotulo) => {
    const m = rotulo?.match(/([\d.]+) reais(?: com (\d+) centavos?)?/);
    return m ? Math.round(Number(m[1].replace(/\./g, '')) + Number(m[2] ?? 0) / 100) : undefined;
  };
  const antes = reais(card.match(/andes-money-amount--previous[\s\S]*?aria-label="([^"]+)"/)?.[1]);
  const off = Number(card.match(/(\d{1,2})% OFF/)?.[1]) || undefined;
  const parcelas = card
    .match(/poly-price__installments[^>]*>([\s\S]*?)<\/span>\s*<\/div>/)?.[1]
    ?.replace(/<[^>]+>/g, '')
    .replace(/&nbsp;|\s+/g, ' ')
    .trim();
  const href = card.match(/href="(https:\/\/[^"]+)"/)?.[1]?.split(/[?#]/)[0];
  return {
    antes,
    off,
    parcelas: parcelas && /^\d+x R\$/.test(parcelas) ? parcelas : undefined,
    freteGratis: /frete grátis/i.test(card),
    catalogo: href?.includes('mercadolivre.com.br') ? href : undefined,
  };
}

const resultado = [];
for (const [url, l] of links) {
  const { fim, titulo, pausado, card } = await destino(url);
  const status = fim.includes('/lists') ? 'LISTA' : !fim.includes('ref=') ? 'VERIFICAR' : pausado ? 'PAUSADO' : 'OK';
  resultado.push({ status, url, produtos: [...l.produtos].join(' / '), ids: [...l.ids], ml: status === 'OK' || status === 'PAUSADO' ? titulo : '', card, fim, onde: [...l.onde] });
}

const quebrados = resultado.filter((r) => r.status !== 'OK');
const mostrar = process.argv.includes('--all') ? resultado : quebrados;
for (const r of mostrar) {
  const ml = r.ml ? `\tML: ${r.ml}` : '';
  console.log(`${r.status}\t${r.url}\t${r.produtos}${ml}\t${r.onde.join(', ')}`);
}
console.log(`\n${resultado.length} links verificados: ${resultado.length - quebrados.length} OK, ${quebrados.length} quebrados ou a verificar.`);
fs.mkdirSync('covers-src', { recursive: true });
fs.writeFileSync('covers-src/_afiliados-check.json', JSON.stringify(resultado, null, 2));

// Preço do dia: o og:title termina em " - R$ 1.234" ou " - R$ 1.234,56".
if (process.argv.includes('--atualizar-precos')) {
  const hoje = hojeISO();
  const conferidos = [];
  const antigos = {};
  let mudaram = 0;
  for (const r of resultado) {
    // Situação do anúncio (páginas /black-friday/ e /produto/<id>/). VERIFICAR é falha
    // passageira do ML, então não mexe no que já estava gravado.
    const situacao = { OK: 'ativo', PAUSADO: 'pausado', LISTA: 'encerrado' }[r.status];
    if (!situacao) continue;
    const m = r.status === 'OK' && r.ml.match(/R\$\s*([\d.]+)(?:,(\d{1,2}))?\s*$/);
    const preco = m ? Math.round(Number(`${m[1].replace(/\./g, '')}.${m[2] ?? '0'}`)) : 0;
    for (const id of r.ids) {
      const prod = catalogo.get(id);
      if (!prod) continue;
      if (preco > 0) {
        conferidos.push(id);
        if (Math.round(prod.preco) !== preco) {
          console.log(`preço\t${id}: ${fmtPreco(prod.preco)} -> ${fmtPreco(preco)}`);
          antigos[id] = [prod.preco];
          prod.historico = [...(prod.historico ?? []).filter((h) => h.data !== hoje), { data: hoje, preco }];
          prod.preco = preco;
          mudaram++;
        }
        prod.precoEm = hoje;
      }
      const anterior = prod.anuncio ?? {};
      const c = situacao === 'ativo' ? r.card ?? {} : {};
      const catalogoML = c.catalogo ?? anterior.catalogo;
      prod.anuncio = {
        status: situacao,
        desde: anterior.status === situacao && anterior.desde ? anterior.desde : hoje,
        // O riscado só vale se for maior que o preço de hoje (às vezes o card fica defasado).
        ...(c.antes > Math.round(prod.preco) ? { antes: c.antes, off: c.off } : {}),
        ...(c.parcelas ? { parcelas: c.parcelas } : {}),
        ...(situacao === 'ativo' ? { freteGratis: Boolean(c.freteGratis) } : {}),
        ...(catalogoML ? { catalogo: catalogoML } : {}),
      };
      if (situacao !== 'ativo' && anterior.status === 'ativo') console.log(`anúncio\t${id}: ${situacao}`);
      fs.writeFileSync(path.join(CAT, `${id}.json`), JSON.stringify(prod, null, 2) + '\n');
    }
  }
  console.log(`\n${conferidos.length} preços conferidos, ${mudaram} mudaram.\n`);
  imprimirRelatorio(sincronizarPrecosTexto({ ids: conferidos, aplicar: true, hoje, antigos }), true);
}

const mdIdx = process.argv.indexOf('--md');
if (mdIdx > 0) {
  const linhas = quebrados.map((r) => {
    const arquivo = r.ids.length ? r.ids.map((id) => `\`src/data/produtos/${id}.json\``).join(', ') : r.onde.join(', ');
    return `- **${r.status}** ${r.produtos || '(sem nome)'}: ${r.url} → ${arquivo}`;
  });
  const md = [
    `${resultado.length} links verificados: ${resultado.length - quebrados.length} OK, ${quebrados.length} quebrados ou a verificar.`,
    '',
    'LISTA = o anúncio saiu do ar e o link cai na vitrine genérica. PAUSADO = o link abre o produto, mas o anúncio está pausado e não dá para comprar. VERIFICAR = o ML não respondeu como esperado (pode ser bloqueio temporário).',
    'Para corrigir: gerar um link novo no painel de afiliados e trocar `meli` (e o preço) no arquivo do produto.',
    '',
    ...linhas,
  ].join('\n');
  fs.writeFileSync(process.argv[mdIdx + 1], md + '\n');
}
process.exitCode = quebrados.some((r) => r.status === 'LISTA' || r.status === 'PAUSADO') ? 1 : 0;

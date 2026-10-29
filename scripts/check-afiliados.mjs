// Verifica para onde cada link de afiliado meli.la do site leva de fato.
// O Mercado Livre manda o link curto para a página social do afiliado com o produto em
// destaque (URL com ref=). Quando o anúncio é pausado ou encerrado, o mesmo link cai na
// página genérica de listas (/social/<id>/lists), e o leitor não encontra o produto.
// Uso: node scripts/check-afiliados.mjs   (lista só os quebrados; --all mostra todos)
//      --md arquivo.md grava um relatório em Markdown (usado pelo GitHub Actions)
import fs from 'node:fs';
import path from 'node:path';

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
      return { fim: r.url, titulo };
    } catch {
      await new Promise((ok) => setTimeout(ok, 1500));
    }
  }
  return { fim: '', titulo: '' };
}

const resultado = [];
for (const [url, l] of links) {
  const { fim, titulo } = await destino(url);
  const status = fim.includes('/lists') ? 'LISTA' : fim.includes('ref=') ? 'OK' : 'VERIFICAR';
  resultado.push({ status, url, produtos: [...l.produtos].join(' / '), ids: [...l.ids], ml: status === 'OK' ? titulo : '', fim, onde: [...l.onde] });
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

const mdIdx = process.argv.indexOf('--md');
if (mdIdx > 0) {
  const linhas = quebrados.map((r) => {
    const arquivo = r.ids.length ? r.ids.map((id) => `\`src/data/produtos/${id}.json\``).join(', ') : r.onde.join(', ');
    return `- **${r.status}** ${r.produtos || '(sem nome)'}: ${r.url} → ${arquivo}`;
  });
  const md = [
    `${resultado.length} links verificados: ${resultado.length - quebrados.length} OK, ${quebrados.length} quebrados ou a verificar.`,
    '',
    'LISTA = o anúncio saiu do ar e o link cai na vitrine genérica. VERIFICAR = o ML não respondeu como esperado (pode ser bloqueio temporário).',
    'Para corrigir: gerar um link novo no painel de afiliados e trocar `meli` (e o preço) no arquivo do produto.',
    '',
    ...linhas,
  ].join('\n');
  fs.writeFileSync(process.argv[mdIdx + 1], md + '\n');
}
process.exitCode = quebrados.some((r) => r.status === 'LISTA') ? 1 : 0;

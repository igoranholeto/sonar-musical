// Verifica para onde cada link de afiliado meli.la do site leva de fato.
// O Mercado Livre manda o link curto para a página social do afiliado com o produto em
// destaque (URL com ref=). Quando o anúncio é pausado ou encerrado, o mesmo link cai na
// página genérica de listas (/social/<id>/lists), e o leitor não encontra o produto.
// Uso: node scripts/check-afiliados.mjs   (lista só os quebrados; --all mostra todos)
import fs from 'node:fs';
import path from 'node:path';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36';
const links = new Map(); // url -> { produtos:Set, onde:Set }

function add(url, produto, onde) {
  if (!links.has(url)) links.set(url, { produtos: new Set(), onde: new Set() });
  const l = links.get(url);
  if (produto) l.produtos.add(produto);
  l.onde.add(onde);
}

// Posts: blocos <AfiliadoCTA ... />
for (const f of fs.readdirSync('src/data/blog').filter((f) => /\.mdx?$/.test(f))) {
  const t = fs.readFileSync(path.join('src/data/blog', f), 'utf8');
  for (const c of t.match(/<AfiliadoCTA[\s\S]*?\/>/g) ?? []) {
    const url = c.match(/url="([^"]+)"/)?.[1];
    if (url?.includes('meli.la')) add(url, c.match(/produto="([^"]+)"/)?.[1], `blog/${f.replace(/\.mdx?$/, '')}`);
  }
}
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
  resultado.push({ status, url, produtos: [...l.produtos].join(' / '), ml: status === 'OK' ? titulo : '', onde: [...l.onde] });
}

const quebrados = resultado.filter((r) => r.status !== 'OK');
const mostrar = process.argv.includes('--all') ? resultado : quebrados;
for (const r of mostrar) {
  const ml = r.ml ? `\tML: ${r.ml}` : '';
  console.log(`${r.status}\t${r.url}\t${r.produtos}${ml}\t${r.onde.join(', ')}`);
}
console.log(`\n${resultado.length} links verificados: ${resultado.length - quebrados.length} OK, ${quebrados.length} quebrados ou a verificar.`);
fs.writeFileSync('covers-src/_afiliados-check.json', JSON.stringify(resultado, null, 2));

// Verificador das regras editoriais do Sonar Musical. Falha (exit 1) quando encontra:
// - travessão (—) em posts e páginas de banda (usar vírgula ou dois-pontos);
// - "testamos", "testei", "nossos testes": o autor não tem os equipamentos;
// - AfiliadoCTA sem link meli.la ou com id que não existe no catálogo;
// - produto do catálogo com link fora do meli.la ou sem preço;
// - capa com foto (covers-src/_fullbleed_attrib.json) sem crédito em src/data/creditos.ts.
// Uso: node scripts/lint-conteudo.mjs
import fs from 'node:fs';
import path from 'node:path';

const erros = [];
const err = (onde, msg) => erros.push(`${onde}: ${msg}`);
const ler = (p) => fs.readFileSync(p, 'utf8');

const CAT = 'src/data/produtos';
const catalogo = new Map(
  fs.readdirSync(CAT).filter((f) => f.endsWith('.json')).map((f) => [f.replace(/\.json$/, ''), JSON.parse(ler(path.join(CAT, f)))]),
);
for (const [id, p] of catalogo) {
  if (!/^https:\/\/meli\.la\//.test(p.meli ?? '')) err(`produtos/${id}.json`, `link fora do meli.la: ${p.meli}`);
  if (!(p.preco > 0)) err(`produtos/${id}.json`, 'sem preço');
}

const linhaDe = (t, i) => t.slice(0, i).split('\n').length;
const TESTE = /\b(testamos|testei|testado por nós|nos nossos testes|em nossos testes|nossos testes)\b/gi;

for (const [dir, ext] of [['src/data/blog', /\.mdx?$/], ['src/data/bandas', /\.mdx?$/]]) {
  for (const f of fs.readdirSync(dir).filter((f) => ext.test(f))) {
    const p = path.join(dir, f);
    const t = ler(p);
    for (const m of t.matchAll(/—/g)) err(`${p}:${linhaDe(t, m.index)}`, 'travessão (—)');
    if (dir.endsWith('blog')) {
      for (const m of t.matchAll(TESTE)) err(`${p}:${linhaDe(t, m.index)}`, `"${m[0]}" (o autor não testa os equipamentos)`);
      for (const m of t.matchAll(/<AfiliadoCTA\b[\s\S]*?\/>/g)) {
        const bloco = m[0];
        const id = bloco.match(/\bid="([^"]+)"/)?.[1];
        const url = bloco.match(/\burl="([^"]+)"/)?.[1];
        const onde = `${p}:${linhaDe(t, m.index)}`;
        if (id && !catalogo.has(id)) err(onde, `AfiliadoCTA com id "${id}" que não existe em ${CAT}`);
        if (!id && !url) err(onde, 'AfiliadoCTA sem id= e sem url=');
        if (url && !/^https:\/\/meli\.la\//.test(url)) err(onde, `AfiliadoCTA com link fora do meli.la: ${url}`);
      }
    }
  }
}

// Capas com foto do Commons precisam de crédito: a URL de origem da foto tem de estar
// em src/data/creditos.ts (CREDITOS_CAPAS).
const attrib = 'covers-src/_fullbleed_attrib.json';
if (fs.existsSync(attrib)) {
  const creditos = ler('src/data/creditos.ts');
  for (const [slug, foto] of Object.entries(JSON.parse(ler(attrib)))) {
    if (!fs.existsSync(`src/data/blog/${slug}.mdx`) || !foto.source) continue;
    if (!creditos.includes(foto.source)) err(`blog/${slug}`, `capa com foto sem crédito em src/data/creditos.ts (${foto.source})`);
  }
}

if (erros.length) {
  console.log(erros.join('\n'));
  console.log(`\n${erros.length} problema(s) encontrado(s).`);
  process.exit(1);
}
console.log(`Conteúdo OK: ${catalogo.size} produtos no catálogo, nenhuma regra violada.`);

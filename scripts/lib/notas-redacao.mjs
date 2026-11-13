// Nota da redação: cada produto do catálogo tem UMA nota no site inteiro.
// A nota aparece no AfiliadoCTA (avaliacao={...}) e vai para o schema como Review; o mesmo
// produto com 4,5 num post e 4,0 em outro confunde o leitor e o Google.
//
// Qual nota vale (notaCanonica):
// 1. a do review dedicado ao produto (post com `rating` e `reviewedName`), que é a análise
//    mais completa; o "Nossa nota: X de 5" do texto desse post tem de bater com ela;
// 2. a de NOTAS_FIXAS, quando a regra 3 contradiz o veredito de um post;
// 3. a nota mais usada nos CTAs; no empate, a média de todos os usos.
// Usado por scripts/normalizar-notas.mjs (corrige) e scripts/lint-conteudo.mjs (acusa).
import fs from 'node:fs';
import path from 'node:path';

export const slugifyId = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const linhaDe = (t, i) => t.slice(0, i).split('\n').length;

// Mesmo instrumento com nome diferente no catálogo (kit, cor no nome): id -> id de referência.
const MESMO_MODELO = {
  'yamaha-f310': 'yamaha-f310-tobacco-brown-sunburst', // F310P = o F310 em kit (capa, afinador)
};

/**
 * modelo -> { usos: [{ id, slug, nota, linha }], review: { slug, nota } | null }
 * O modelo é o nome do catálogo: ids diferentes com o mesmo nome (cor ou anúncio diferente,
 * ex. boss-katana-mini e boss-katana-mini-7w) são o mesmo produto e dividem a nota.
 * Só a nota do Sonar (avaliacao do CTA, rating do review); a nota dos compradores do ML
 * (nota/avaliacoes do catálogo) é outra coisa e não passa por aqui.
 */
export function coletarNotas(blogDir = 'src/data/blog', catDir = 'src/data/produtos') {
  const nomes = new Map(
    fs.readdirSync(catDir).filter((f) => f.endsWith('.json'))
      .map((f) => [f.slice(0, -5), JSON.parse(fs.readFileSync(path.join(catDir, f), 'utf8')).nome ?? '']),
  );
  const modelo = (id) => slugifyId(nomes.get(MESMO_MODELO[id] ?? id) || id);
  const notas = new Map();
  const de = (id) => { const k = modelo(id); return notas.get(k) ?? notas.set(k, { usos: [], review: null }).get(k); };
  for (const f of fs.readdirSync(blogDir).filter((x) => x.endsWith('.mdx')).sort()) {
    const slug = f.slice(0, -4);
    const t = fs.readFileSync(path.join(blogDir, f), 'utf8');
    const ctas = [];
    for (const m of t.matchAll(/<AfiliadoCTA\b[\s\S]*?\/>/g)) {
      const id = m[0].match(/\bid="([^"]+)"/)?.[1];
      if (!id) continue;
      const nome = m[0].match(/\bproduto="([^"]+)"/)?.[1] ?? nomes.get(id) ?? '';
      ctas.push({ id, nome });
      const n = m[0].match(/avaliacao=\{([\d.]+)\}/)?.[1];
      if (n) de(id).usos.push({ id, slug, nota: Number(n), linha: linhaDe(t, m.index) });
    }
    const rating = t.match(/^rating:\s*([\d.]+)/m)?.[1];
    const alvo = t.match(/^reviewedName:\s*"([^"]+)"/m)?.[1];
    if (!rating || !alvo) continue;
    // O produto do review: o CTA do post com o mesmo nome (mesmo @id no schema), o CTA do
    // post cujo nome começa por ele ("Yamaha F310" -> "Yamaha F310 (tobacco brown sunburst)")
    // ou, sem CTA dele no post, o item do catálogo com esse nome.
    const s = slugifyId(alvo);
    const id = ctas.find((c) => slugifyId(c.nome) === s)?.id
      ?? ctas.find((c) => slugifyId(c.nome).startsWith(`${s}-`))?.id
      ?? [...nomes].find(([, n]) => slugifyId(n) === s)?.[0];
    if (id) de(id).review = { slug, nota: Number(rating) };
  }
  return notas;
}

// Nota decidida à mão quando a regra contradiz o veredito de um post (modelo -> nota).
const NOTAS_FIXAS = {
  // "Melhor guitarra até R$ 1.000" a recomenda para a maioria; pela média (4,1) ela ficaria
  // abaixo da TG-510 e da G-100 no mesmo post. 4,3: acima da STS100 (4,0) e abaixo da
  // Pacifica (4,5), como dizem os reviews dessas duas.
  'giannini-g-101': 4.3,
  // Ukuleles: o guia "melhor ukulele para iniciante" usava 4,2 a 4,7 e os de marcas e de
  // preço, 4,0 a 4,3. Pela regra o Shelby (o recomendado para começar) ficaria abaixo do
  // Tagima 21K soprano, e o guia diz que concert é melhor que soprano para a maioria.
  // Shelby = Malibu (o guia diz que são tão bem avaliados quanto), 21K logo abaixo.
  'shelby-su23m-concert': 4.5,
  'malibu-23s-concert': 4.5,
  'tagima-21k-soprano': 4.4,
};

const r1 = (x) => Math.round(x * 10 + 1e-9) / 10;

export function notaCanonica({ usos, review }, modelo) {
  if (review) return review.nota;
  if (modelo && NOTAS_FIXAS[modelo] != null) return NOTAS_FIXAS[modelo];
  const cont = new Map();
  for (const u of usos) cont.set(u.nota, (cont.get(u.nota) ?? 0) + 1);
  const max = Math.max(...cont.values());
  const topo = [...cont].filter(([, c]) => c === max).map(([n]) => n);
  // A mais usada; no empate (ex.: 4,5 num post e 4,0 em outro), a média de todos os usos.
  return topo.length === 1 ? topo[0] : r1(usos.reduce((a, u) => a + u.nota, 0) / usos.length);
}

/** Usos cuja nota difere da canônica: [{ modelo, id, slug, linha, nota, canonica }] */
export function divergencias(notas) {
  const out = [];
  for (const [modelo, info] of notas) {
    const c = notaCanonica(info, modelo);
    for (const u of info.usos) if (u.nota !== c) out.push({ modelo, ...u, canonica: c });
  }
  return out.sort((a, b) => a.slug.localeCompare(b.slug) || a.linha - b.linha);
}

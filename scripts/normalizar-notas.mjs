// Deixa cada produto com uma nota da redação só em todos os posts (regra em
// lib/notas-redacao.mjs: vale a do review dedicado; sem ele, a mais usada, e no empate a menor).
//
//   node scripts/normalizar-notas.mjs            simulação, lista o que mudaria
//   node scripts/normalizar-notas.mjs --aplicar  grava
import fs from 'node:fs';
import path from 'node:path';
import { coletarNotas, divergencias } from './lib/notas-redacao.mjs';

const BLOG = 'src/data/blog';
const aplicar = process.argv.includes('--aplicar');
const lista = divergencias(coletarNotas(BLOG));

const porPost = new Map();
for (const d of lista) (porPost.get(d.slug) ?? porPost.set(d.slug, []).get(d.slug)).push(d);

for (const [slug, ds] of porPost) {
  const file = path.join(BLOG, `${slug}.mdx`);
  let t = fs.readFileSync(file, 'utf8');
  for (const d of ds) {
    console.log(`${slug}:${d.linha} ${d.id}: ${d.nota} -> ${d.canonica}`);
    // Troca só dentro do CTA desse produto.
    t = t.replace(/<AfiliadoCTA\b[\s\S]*?\/>/g, (bloco) =>
      bloco.match(/\bid="([^"]+)"/)?.[1] === d.id ? bloco.replace(/avaliacao=\{[\d.]+\}/, `avaliacao={${d.canonica}}`) : bloco,
    );
  }
  if (aplicar) fs.writeFileSync(file, t);
}
const produtos = new Set(lista.map((d) => d.id)).size;
console.log(`\n${lista.length} CTAs de ${produtos} produtos em ${porPost.size} posts ${aplicar ? 'corrigidos' : 'mudariam (simulação, use --aplicar)'}.`);

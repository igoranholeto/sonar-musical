// Atualiza preço (e opcionalmente o link) de produtos do catálogo src/data/produtos.
// Cada atualização grava o preço novo, a data de hoje em precoEm e uma entrada em
// historico. Também remove dos posts o preço fixo (preco="...") que sobrescreve o
// catálogo para esse produto, para o CTA passar a mostrar o preço novo.
//
// MAP: id do produto OU link meli.la atual -> { p: 'preço', u: 'linkNovo' (opcional) }
//   node scripts/update-precos.mjs
import fs from 'node:fs';
import path from 'node:path';

const MAP = {
  // 'valeton-gp-100': { p: '970' },
  // 'https://meli.la/2AZ6NLV': { p: '989', u: 'https://meli.la/xxxxxxx' },
};

const CAT = 'src/data/produtos';
const hoje = new Date().toISOString().slice(0, 10);
const num = (p) => Number(String(p).replace(/\./g, '').replace(',', '.'));

const arquivos = fs.readdirSync(CAT).filter((f) => f.endsWith('.json'));
const porUrl = new Map();
for (const f of arquivos) porUrl.set(JSON.parse(fs.readFileSync(path.join(CAT, f), 'utf8')).meli, f.replace(/\.json$/, ''));

const atualizados = [];
for (const [chave, { p, u }] of Object.entries(MAP)) {
  const id = chave.startsWith('http') ? porUrl.get(chave) : chave;
  const arq = id && path.join(CAT, `${id}.json`);
  if (!arq || !fs.existsSync(arq)) {
    console.log(`✗ não encontrado no catálogo: ${chave}`);
    continue;
  }
  const prod = JSON.parse(fs.readFileSync(arq, 'utf8'));
  const preco = num(p);
  if (!Number.isFinite(preco) || preco <= 0) throw new Error(`preço inválido para ${chave}: ${p}`);
  prod.preco = preco;
  prod.precoEm = hoje;
  prod.historico = [...(prod.historico ?? []).filter((h) => h.data !== hoje), { data: hoje, preco }];
  if (u) prod.meli = u;
  fs.writeFileSync(arq, JSON.stringify(prod, null, 2) + '\n');
  atualizados.push(id);
  console.log(`✓ ${id}: R$ ${p}${u ? `  (novo link ${u})` : ''}`);
}

// Remove o preco="..." fixo dos CTAs desses produtos nos posts.
let removidos = 0;
const dir = 'src/data/blog';
for (const f of fs.readdirSync(dir).filter((f) => /\.mdx$/.test(f))) {
  const p = path.join(dir, f);
  const t = fs.readFileSync(p, 'utf8');
  const novo = t.replace(/<AfiliadoCTA\b[\s\S]*?\/>/g, (bloco) => {
    const id = bloco.match(/\bid="([^"]+)"/)?.[1];
    if (!id || !atualizados.includes(id) || !/\bpreco="/.test(bloco)) return bloco;
    removidos++;
    return bloco.replace(/\s*\bpreco="[^"]*"/, '');
  });
  if (novo !== t) fs.writeFileSync(p, novo);
}
console.log(`\n${atualizados.length}/${Object.keys(MAP).length} produtos atualizados; ${removidos} preços fixos removidos dos posts.`);
console.log('Lembrete: preços citados no texto e nas tabelas dos posts não mudam sozinhos.');

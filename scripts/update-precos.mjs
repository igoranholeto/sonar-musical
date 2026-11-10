// Atualiza preço (e opcionalmente o link) de produtos do catálogo src/data/produtos.
// Cada atualização grava o preço novo, a data de hoje em precoEm e uma entrada em
// historico. Depois leva o preço novo aos posts (scripts/lib/precos-texto.mjs): tira o
// preço fixo (preco="...") dos CTAs desses produtos, troca os preços antigos citados no
// texto, nas tabelas e no FAQ e lista o que precisa de revisão manual.
//
// MAP: id do produto OU link meli.la atual -> { p: 'preço', u: 'linkNovo' (opcional) }
//   node scripts/update-precos.mjs
import fs from 'node:fs';
import path from 'node:path';
import { sincronizarPrecosTexto, imprimirRelatorio, hojeISO } from './lib/precos-texto.mjs';

const MAP = {
  // 'valeton-gp-100': { p: '970' },
  // 'https://meli.la/2AZ6NLV': { p: '989', u: 'https://meli.la/xxxxxxx' },
};

const CAT = 'src/data/produtos';
const hoje = hojeISO();
const num = (p) => Number(String(p).replace(/\./g, '').replace(',', '.'));

const arquivos = fs.readdirSync(CAT).filter((f) => f.endsWith('.json'));
const porUrl = new Map();
for (const f of arquivos) porUrl.set(JSON.parse(fs.readFileSync(path.join(CAT, f), 'utf8')).meli, f.replace(/\.json$/, ''));

const atualizados = [];
const antigos = {};
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
  antigos[id] = [prod.preco];
  prod.preco = preco;
  prod.precoEm = hoje;
  prod.historico = [...(prod.historico ?? []).filter((h) => h.data !== hoje), { data: hoje, preco }];
  if (u) prod.meli = u;
  fs.writeFileSync(arq, JSON.stringify(prod, null, 2) + '\n');
  atualizados.push(id);
  console.log(`✓ ${id}: R$ ${p}${u ? `  (novo link ${u})` : ''}`);
}

console.log(`\n${atualizados.length}/${Object.keys(MAP).length} produtos atualizados.\n`);

// Preços citados no texto, nas tabelas e no FAQ.
if (atualizados.length) {
  imprimirRelatorio(sincronizarPrecosTexto({ ids: atualizados, aplicar: true, hoje, antigos }), true);
}

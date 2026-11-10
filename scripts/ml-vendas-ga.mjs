#!/usr/bin/env node
// Devolve ao GA4 as vendas de afiliado do Mercado Livre como evento purchase
// (Measurement Protocol), com a COMISSÃO como receita. O ML não avisa o site quando
// um clique vira venda: as vendas são lidas no painel de afiliados e anotadas em
// privado/vendas-ml.json, que fica fora do git (o repositório é público).
//
// Uso:
//   node scripts/ml-vendas-ga.mjs             mostra o que seria enviado (nada sai daqui)
//   node scripts/ml-vendas-ga.mjs --validar   confere os eventos no endpoint de debug do GA
//   node scripts/ml-vendas-ga.mjs --enviar    envia as vendas novas e grava enviadoEm
//
// Cada venda em privado/vendas-ml.json (lista):
//   {
//     "pedido": "2000019396924580",        número do pedido no painel (vira transaction_id)
//     "data": "2026-11-07",                dia da venda; "hora": "15:30" é opcional
//     "produto": "Ukulele Malibu 23S ...", nome no painel
//     "idProduto": "malibu-23s-concert",   id em src/data/produtos (opcional)
//     "venda": 237.43, "comissao": 23.36,  em reais
//     "status": "em revisão",              "em revisão" | "aprovada" | "cancelada"
//     "idVisitante": "123.456",            do affiliate_click que gerou a venda (opcional)
//     "idSessao": "1762380000",            idem (opcional)
//     "pagina": "https://sonarmusical.com.br/blog/...",  página do clique (opcional)
//     "enviadoEm": null, "estornadoEm": null   preenchidos pelo script
//   }
// Com idVisitante e idSessao a receita cai na sessão do clique (canal, página de
// entrada). Sem eles a venda entra num visitante próprio, com canal (not set). O GA só
// aceita data retroativa até 72 h: venda mais antiga entra com a data do envio.
// Venda cancelada depois de enviada vira evento refund.
// A chave GA_MP_SECRET vem do .env e nunca é impressa.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const MEDICAO = 'G-WZDXX7MLBD';
const ARQUIVO = 'privado/vendas-ml.json';
const LIMITE_RETRO_MS = 71 * 3600 * 1000; // o GA aceita até 72 h

const args = new Set(process.argv.slice(2));
const modo = args.has('--enviar') ? 'enviar' : args.has('--validar') ? 'validar' : 'mostrar';

function lerSegredo() {
  let v = process.env.GA_MP_SECRET;
  if (!v && existsSync('.env')) {
    const m = readFileSync('.env', 'utf8').match(/^\s*GA_MP_SECRET\s*=\s*(.*)$/m);
    v = m?.[1];
  }
  return v?.trim().replace(/^["']|["']$/g, '') || '';
}

function catalogo(id) {
  if (!id) return undefined;
  try {
    return JSON.parse(readFileSync(`src/data/produtos/${id}.json`, 'utf8'));
  } catch {
    console.warn(`  aviso: produto "${id}" não está no catálogo`);
    return undefined;
  }
}

// Visitante próprio e estável para venda sem clique casado (mesmo formato do _ga).
function visitanteSintetico(v) {
  const h = createHash('sha256').update(`ml-${v.comprador ?? v.pedido}`).digest();
  return `${h.readUInt32BE(0)}.${Math.floor(Date.parse(`${v.data}T12:00:00-03:00`) / 1000)}`;
}

function quando(v) {
  const t = Date.parse(`${v.data}T${v.hora ?? '12:00'}:00-03:00`);
  const agora = Date.now();
  return t < agora && agora - t < LIMITE_RETRO_MS ? t : undefined;
}

function evento(v, nome) {
  const cat = catalogo(v.idProduto);
  const params = {
    transaction_id: String(v.pedido),
    value: v.comissao,
    currency: 'BRL',
    affiliation: 'Mercado Livre',
    valor_venda: v.venda,
    items: [
      {
        item_id: v.idProduto ?? String(v.pedido),
        item_name: v.produto,
        ...(cat?.categoria && { item_category: cat.categoria }),
        affiliation: 'Mercado Livre',
        price: v.comissao,
        quantity: 1,
      },
    ],
    engagement_time_msec: 1,
  };
  if (v.idSessao) params.session_id = String(v.idSessao);
  if (v.pagina) params.page_location = v.pagina;
  const t = quando(v);
  return {
    client_id: v.idVisitante || visitanteSintetico(v),
    ...(t && { timestamp_micros: t * 1000 }),
    events: [{ name: nome, params }],
  };
}

async function postar(segredo, corpo, debug) {
  const url = `https://www.google-analytics.com/${debug ? 'debug/' : ''}mp/collect?measurement_id=${MEDICAO}&api_secret=${encodeURIComponent(segredo)}`;
  try {
    const r = await fetch(url, { method: 'POST', body: JSON.stringify(corpo) });
    const txt = await r.text();
    return { ok: r.ok, status: r.status, json: txt ? JSON.parse(txt) : null };
  } catch (e) {
    return { ok: false, status: 0, erro: String(e?.message ?? e).replaceAll(segredo, '***') };
  }
}

if (!existsSync(ARQUIVO)) {
  console.error(`Não achei ${ARQUIVO}. Crie a lista de vendas (formato no topo deste script).`);
  process.exit(1);
}
const vendas = JSON.parse(readFileSync(ARQUIVO, 'utf8'));

const fila = [];
for (const v of vendas) {
  if (v.status === 'cancelada') {
    if (v.enviadoEm && !v.estornadoEm) fila.push({ v, nome: 'refund' });
  } else if (!v.enviadoEm) {
    fila.push({ v, nome: 'purchase' });
  }
}

if (!fila.length) {
  console.log('Nada novo: todas as vendas já estão no GA.');
  process.exit(0);
}

const segredo = modo === 'mostrar' ? '' : lerSegredo();
if (modo !== 'mostrar' && !segredo) {
  console.error('GA_MP_SECRET não encontrado no .env.');
  process.exit(1);
}

let total = 0;
for (const { v, nome } of fila) {
  const corpo = evento(v, nome);
  const casado = v.idVisitante ? 'clique casado' : 'sem clique casado';
  const data = corpo.timestamp_micros ? v.data : `${v.data} (entra com a data de hoje)`;
  console.log(`${nome.padEnd(8)} #${v.pedido}  R$ ${v.comissao.toFixed(2)}  ${v.produto.slice(0, 48)}  [${casado}; ${data}]`);
  total += nome === 'refund' ? -v.comissao : v.comissao;

  if (modo === 'mostrar') continue;
  const r = await postar(segredo, corpo, modo === 'validar');
  if (modo === 'validar') {
    const msgs = r.json?.validationMessages ?? [];
    if (!r.ok || r.erro) console.log(`  ERRO ${r.status} ${r.erro ?? ''}`);
    else if (msgs.length) msgs.forEach((m) => console.log(`  ${m.validationCode}: ${m.description}`));
    else console.log('  ok');
  } else if (r.ok) {
    if (nome === 'refund') v.estornadoEm = new Date().toISOString();
    else v.enviadoEm = new Date().toISOString();
  } else {
    console.log(`  ERRO ${r.status} ${r.erro ?? ''}`);
  }
}

console.log(`\nComissão líquida ${modo === 'enviar' ? 'enviada' : 'na fila'}: R$ ${total.toFixed(2)}`);
if (modo === 'enviar') writeFileSync(ARQUIVO, JSON.stringify(vendas, null, 2) + '\n');
if (modo === 'mostrar') console.log('Nada foi enviado. Use --validar e depois --enviar.');

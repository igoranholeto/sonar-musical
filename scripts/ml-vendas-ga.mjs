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
//   node scripts/ml-vendas-ga.mjs --conhecidas
//        imprime os pedidos já anotados, para colar em scripts/ml-vendas-painel.js
//   node scripts/ml-vendas-ga.mjs --importar privado/ml-painel.txt
//        junta na lista o que scripts/ml-vendas-painel.js leu no painel: vendas novas,
//        mudança de status e não efetivadas (cancelada depois de enviada vira refund)
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

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const MEDICAO = 'G-WZDXX7MLBD';
const ARQUIVO = 'privado/vendas-ml.json';
const LIMITE_RETRO_MS = 71 * 3600 * 1000; // o GA aceita até 72 h

const argv = process.argv.slice(2);
const args = new Set(argv);
const modo = args.has('--enviar')
  ? 'enviar'
  : args.has('--validar')
    ? 'validar'
    : args.has('--importar')
      ? 'importar'
      : args.has('--conhecidas')
        ? 'conhecidas'
        : 'mostrar';

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

// ---------- painel de afiliados -> privado/vendas-ml.json ----------
const LETRA = { 'em revisão': 'R', aprovada: 'A', cancelada: 'X' };
function statusPt(bruto = '') {
  if (/REVIEW|PENDING/.test(bruto)) return 'em revisão';
  if (/CANCEL|REJECT|DENIED|REFUND|NOT_|NAO_EFETIVADA/.test(bruto)) return 'cancelada';
  if (/APPROV|PAID|CONFIRM|LIQUID|AVAILABLE/.test(bruto)) return 'aprovada';
  return bruto.toLowerCase() || 'em revisão';
}

// Acha o produto do catálogo pelo nome do anúncio (modelo pesa mais que palavra comum).
function fichas(s) {
  return new Set(
    String(s)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/([a-z]+)-(\d)/g, '$1$2')
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length >= 2),
  );
}
let catalogoNomes;
function adivinharProduto(nome) {
  if (!catalogoNomes) {
    let titulos = {};
    try {
      for (const r of JSON.parse(readFileSync('covers-src/_afiliados-check.json', 'utf8')))
        for (const id of r.ids ?? []) titulos[id] = String(r.ml ?? '').replace(/\s-\sR\$.*$/, '');
    } catch {
      titulos = {};
    }
    catalogoNomes = readdirSync('src/data/produtos')
      .filter((f) => f.endsWith('.json'))
      .map((f) => {
        const id = f.slice(0, -5);
        const p = JSON.parse(readFileSync(`src/data/produtos/${f}`, 'utf8'));
        return { id, t: fichas(`${id} ${p.nome} ${titulos[id] ?? ''}`) };
      });
  }
  const alvo = fichas(nome);
  const peso = (t) => (/\d/.test(t) && /[a-z]/.test(t) ? 3 : 1);
  // Kit só ganha de produto avulso se o anúncio vendido também for kit.
  const kit = (id) => (id.startsWith('kit-') && !alvo.has('kit') ? 2 : 0);
  const notas = catalogoNomes
    .map((c) => ({ id: c.id, n: [...alvo].reduce((s, t) => s + (c.t.has(t) ? peso(t) : 0), 0) - kit(c.id) }))
    .sort((a, b) => b.n - a.n);
  const [a, b] = notas;
  return a && a.n >= 5 && a.n - (b?.n ?? 0) >= 2 ? a.id : undefined;
}

function falhar(msg) {
  console.error(`✗ ${msg}\nNada foi gravado.`);
  process.exit(1);
}

function importar(arq) {
  if (!arq || !existsSync(arq)) falhar(`Arquivo do painel não encontrado: ${arq ?? '(faltou o caminho)'}`);
  const ls = readFileSync(arq, 'utf8')
    .replace(/\r/g, '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));
  const cab = ls.shift()?.match(/^ML\|[^|]*\|vendas (\d+)\|linhas (\d+)\|soma (-?[\d.]+)$/);
  if (!cab) falhar('A 1ª linha precisa ser o cabeçalho "ML|...|vendas N|linhas N|soma X".');
  if (ls.length !== Number(cab[2])) falhar(`O painel mandou ${cab[2]} linhas e o arquivo tem ${ls.length}: faltou ou sobrou parte.`);

  const novas = [];
  const canc = [];
  let soma = 0;
  for (const l of ls) {
    const c = l.split('|');
    if (c[0] === 'V' && c.length >= 10) {
      const [, id, dataBr, venda, comissao, pct, tipo, status, mlb, ...nome] = c;
      const d = dataBr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      const v = { id, data: d && `${d[3]}-${d[2]}-${d[1]}`, venda: Number(venda), comissao: Number(comissao), pct: Number(pct), tipo, status, mlb, nome: nome.join(' ') };
      if (!/^\d{10,}$/.test(id) || !v.data || !Number.isFinite(v.venda) || !Number.isFinite(v.comissao)) falhar(`Linha com valor estranho: ${l}`);
      soma += v.comissao;
      novas.push(v);
    } else if (c[0] === 'C' && /^\d{10,}$/.test(c[1] ?? '')) {
      canc.push({ id: c[1], status: c[2] ?? '' });
    } else {
      falhar(`Linha fora do formato: ${l}`);
    }
  }
  if (Math.abs(soma - Number(cab[3])) > 0.011) falhar(`A soma das comissões deu R$ ${soma.toFixed(2)} e o painel mandou R$ ${cab[3]}: algum valor foi copiado errado.`);

  const idsDoPainel = new Set(novas.map((v) => v.id));
  const acha = (p) =>
    vendas.find((v) => v.pedido === p.id || v.pedidoPainel === p.id) ??
    // O painel às vezes mostra outro número para o mesmo pedido: mesma data e mesmo valor.
    (p.data &&
      vendas.find(
        (v) => !v.pedidoPainel && !idsDoPainel.has(v.pedido) && v.data === p.data && Math.abs(v.venda - p.venda) < 0.01,
      ));

  const log = [];
  for (const p of novas) {
    const st = statusPt(p.status);
    const v = acha(p);
    if (!v) {
      const idProduto = adivinharProduto(p.nome);
      vendas.push({
        pedido: p.id,
        data: p.data,
        produto: p.nome,
        ...(idProduto && { idProduto }),
        venda: p.venda,
        comissao: p.comissao,
        status: st,
        tipo: p.tipo === 'I' ? 'indireta' : 'direta',
        mlb: p.mlb || null,
        idVisitante: null,
        idSessao: null,
        pagina: null,
        enviadoEm: null,
        estornadoEm: null,
      });
      log.push(`nova      #${p.id}  ${p.data}  R$ ${p.comissao.toFixed(2)}  ${p.nome.slice(0, 44)}  [${idProduto ?? 'produto não identificado'}]`);
      continue;
    }
    if (v.pedido !== p.id && !v.pedidoPainel) {
      v.pedidoPainel = p.id;
      log.push(`mesmo     #${v.pedido} aparece no painel como #${p.id}`);
    }
    if (v.status === 'cancelada' && st !== 'cancelada') {
      log.push(`atenção   #${v.pedido} está cancelada aqui e "${p.status}" no painel: mantida cancelada, confira à mão`);
    } else if (v.status !== st) {
      log.push(`status    #${v.pedido}  ${v.status} -> ${st}${st === 'cancelada' && v.enviadoEm ? ' (vira refund no --enviar)' : ''}`);
      v.status = st;
    }
    if (Math.abs(v.comissao - p.comissao) >= 0.01) {
      if (v.enviadoEm) log.push(`comissão  #${v.pedido}  R$ ${v.comissao.toFixed(2)} no GA, R$ ${p.comissao.toFixed(2)} no painel (GA fica com o valor enviado)`);
      else {
        log.push(`comissão  #${v.pedido}  R$ ${v.comissao.toFixed(2)} -> R$ ${p.comissao.toFixed(2)}`);
        v.comissao = p.comissao;
        v.venda = p.venda;
      }
    }
  }
  for (const c of canc) {
    const v = vendas.find((x) => x.pedido === c.id || x.pedidoPainel === c.id);
    if (!v) log.push(`não efet. #${c.id} não está na lista (nunca foi enviada ao GA): nada a fazer`);
    else if (v.status !== 'cancelada') {
      log.push(`não efet. #${v.pedido}  ${v.status} -> cancelada${v.enviadoEm ? ' (vira refund no --enviar)' : ''}`);
      v.status = 'cancelada';
    }
  }

  writeFileSync(ARQUIVO, JSON.stringify(vendas, null, 2) + '\n');
  console.log(log.length ? log.join('\n') : 'O painel não trouxe nada novo.');
  console.log(`\n${cab[1]} vendas no painel (janela da leitura); lista com ${vendas.length} pedidos.`);
}

if (modo === 'conhecidas') {
  const lista = vendas.flatMap((v) => [v.pedido, v.pedidoPainel].filter(Boolean).map((id) => `${id}:${LETRA[v.status] ?? 'R'}`));
  console.log(`const CONHECIDAS = '${lista.join(',')}';`);
  process.exit(0);
}
if (modo === 'importar') {
  importar(argv[argv.indexOf('--importar') + 1]);
  console.log('Próximo passo: node scripts/ml-vendas-ga.mjs --validar e depois --enviar.');
  process.exit(0);
}

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

// Alertas de preço (Netlify Blobs, store "alertas-preco"), vistos daqui do PC.
//
//   node scripts/alertas-preco.mjs --status            quantos alertas existem, por situação e por produto
//   node scripts/alertas-preco.mjs --verificar --seco  quantos avisos sairiam com os preços do site no ar
//   node scripts/alertas-preco.mjs --verificar         roda a conferência de verdade (manda os avisos)
//
// Nada aqui imprime e-mail de assinante nem token. A conferência normal roda sozinha no
// Netlify (deploy-succeeded + alertas-diario); este script é para olhar e para emergência.
// Credenciais: token do Netlify CLI (%APPDATA%/netlify/Config/config.json) e BREVO_API_KEY
// do .env. Nenhuma das duas é impressa.
import { readFileSync, existsSync } from 'node:fs';
import { getStore } from '@netlify/blobs';
import * as core from '../netlify/lib/alertas-core.mjs';

const DOMINIO = 'sonarmusical.com.br';
const args = process.argv.slice(2);

function lerEnv(nome) {
  if (process.env[nome]) return process.env[nome];
  if (!existsSync('.env')) return undefined;
  const m = readFileSync('.env', 'utf8').match(new RegExp(`^\\s*${nome}\\s*=\\s*(.*)$`, 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : undefined;
}

function lerTokenNetlify() {
  const p = `${process.env.APPDATA}/netlify/Config/config.json`;
  if (!existsSync(p)) throw new Error('Netlify CLI sem login (rode npx netlify login).');
  const cfg = JSON.parse(readFileSync(p, 'utf8'));
  const t = Object.values(cfg.users || {}).map((u) => u?.auth?.token).find(Boolean);
  if (!t) throw new Error('Token do Netlify CLI não encontrado.');
  return t;
}

async function abrirStore() {
  const token = lerTokenNetlify();
  const r = await fetch('https://api.netlify.com/api/v1/sites?filter=all&per_page=100', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error(`Netlify /sites: ${r.status}`);
  const site = (await r.json()).find((s) => s.custom_domain === DOMINIO);
  if (!site) throw new Error(`Site ${DOMINIO} não encontrado na conta do Netlify CLI.`);
  return getStore({ name: core.STORE, siteID: site.id, token, consistency: 'strong' });
}

async function status(store) {
  const { blobs } = await store.list({ prefix: 'alerta/' });
  const alertas = [];
  for (let i = 0; i < blobs.length; i += 20) {
    const lote = await Promise.all(blobs.slice(i, i + 20).map((b) => store.get(b.key, { type: 'json' })));
    alertas.push(...lote.filter(Boolean));
  }
  const porStatus = {};
  const porTipo = {};
  const porProduto = {};
  const emails = new Set();
  for (const a of alertas) {
    porStatus[a.status] = (porStatus[a.status] ?? 0) + 1;
    if (a.status === 'ativo') {
      porTipo[a.tipo] = (porTipo[a.tipo] ?? 0) + 1;
      porProduto[a.id] = (porProduto[a.id] ?? 0) + 1;
    }
    emails.add(core.sha(a.email));
  }
  const { blobs: ips } = await store.list({ prefix: 'ip/' });
  console.log(`Alertas: ${alertas.length} (${emails.size} e-mails diferentes)`);
  console.log(`Por situação: ${JSON.stringify(porStatus)}`);
  console.log(`Ativos por tipo: ${JSON.stringify(porTipo)}`);
  const top = Object.entries(porProduto).sort((a, b) => b[1] - a[1]).slice(0, 15);
  if (top.length) {
    console.log('Produtos mais acompanhados (ativos):');
    for (const [id, n] of top) console.log(`  ${String(n).padStart(3)}  ${id}`);
  }
  console.log(`Contadores de IP guardados: ${ips.length}`);
}

async function verificar(store, seco) {
  const produtos = await core.carregarPrecos(`https://${DOMINIO}`);
  const chave = lerEnv('BREVO_API_KEY');
  if (!seco && !chave) throw new Error('BREVO_API_KEY ausente no .env.');
  const { porProduto, ...resumo } = await core.verificarAlertas({ store, produtos, chave, seco });
  console.log(`${seco ? '[seco] ' : ''}${JSON.stringify(resumo)}`);
}

try {
  const store = await abrirStore();
  if (args.includes('--verificar')) await verificar(store, args.includes('--seco'));
  else await status(store);
} catch (err) {
  console.error(`Erro: ${String(err?.message ?? err).slice(0, 300)}`);
  process.exit(1);
}

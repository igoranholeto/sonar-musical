// Configura o Brevo (newsletter "Alerta de preço") pela API.
// A chave BREVO_API_KEY vem do .env (ou do ambiente) e NUNCA é impressa.
//
//   node scripts/brevo-setup.mjs                 status: remetentes, domínio, listas, modelos
//   node scripts/brevo-setup.mjs --criar         cria/atualiza a lista e os modelos de e-mail
//   node scripts/brevo-setup.mjs --dns           mostra os registros de DNS que o Brevo pede
//   node scripts/brevo-setup.mjs --dns --aplicar cadastra esses registros no DNS do Netlify
//   node scripts/brevo-setup.mjs --autenticar    pede ao Brevo para verificar o domínio
//   node scripts/brevo-setup.mjs --previa        grava os modelos em HTML no scratch para conferir
//
// Opções: --remetente oi@sonarmusical.com.br (padrão: primeiro remetente ativo do domínio)
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { confirmacao, boasVindas } from './lib/emails.mjs';

const DOMINIO = 'sonarmusical.com.br';
const NOME_LISTA = 'Alertas Sonar';
const NOME_PASTA = 'Sonar Musical';
const NETLIFY_SITE = 'da6e9ef9-8c82-4bb9-8227-f90d23bbc4af';

const args = process.argv.slice(2);
const tem = (f) => args.includes(f);
const valor = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined; };

function lerEnv(nome) {
  if (process.env[nome]) return process.env[nome];
  if (!existsSync('.env')) return undefined;
  const m = readFileSync('.env', 'utf8').match(new RegExp(`^\\s*${nome}\\s*=\\s*(.*)$`, 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : undefined;
}

if (tem('--previa')) {
  const dir = valor('--previa') || 'covers-src/_emails';
  mkdirSync(dir, { recursive: true });
  for (const [arq, t] of [['confirmacao', confirmacao], ['boas-vindas', boasVindas]]) {
    const html = t.html.replace('{{ doubleoptin }}', '#confirmar').replace('{{ unsubscribe }}', '#sair');
    writeFileSync(`${dir}/${arq}.html`, html);
    console.log(`${dir}/${arq}.html`);
  }
  process.exit(0);
}

const CHAVE = lerEnv('BREVO_API_KEY');
if (!CHAVE) {
  console.error('BREVO_API_KEY não encontrada no .env nem no ambiente.');
  process.exit(1);
}

async function brevo(metodo, caminho, corpo) {
  const r = await fetch(`https://api.brevo.com/v3${caminho}`, {
    method: metodo,
    headers: { 'api-key': CHAVE, accept: 'application/json', ...(corpo ? { 'content-type': 'application/json' } : {}) },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const texto = await r.text();
  let json = null;
  try { json = texto ? JSON.parse(texto) : null; } catch { /* resposta sem JSON */ }
  if (!r.ok) {
    const msg = json?.message || texto.slice(0, 200);
    throw new Error(`Brevo ${metodo} ${caminho}: ${r.status} ${msg}`);
  }
  return json;
}

// ---------- status ----------
async function status() {
  const conta = await brevo('GET', '/account');
  const planos = (conta.plan || []).map((p) => `${p.type}${p.credits != null ? ` (${p.credits} créditos ${p.creditsType || ''})` : ''}`);
  console.log('Plano:', planos.join(', ') || '?');

  const { senders = [] } = await brevo('GET', '/senders');
  console.log('\nRemetentes:');
  for (const s of senders) console.log(`  #${s.id} ${s.name} <${s.email}> ${s.active ? 'ATIVO' : 'aguardando confirmação'}`);
  if (!senders.length) console.log('  (nenhum)');

  const { domains = [] } = await brevo('GET', '/senders/domains');
  console.log('\nDomínios:');
  for (const d of domains) console.log(`  ${d.domain_name} | verificado: ${d.verified} | autenticado: ${d.authenticated}`);
  if (!domains.length) console.log('  (nenhum)');

  const { lists = [] } = await brevo('GET', '/contacts/lists?limit=50&offset=0');
  console.log('\nListas:');
  for (const l of lists) console.log(`  #${l.id} ${l.name} (${l.uniqueSubscribers ?? l.totalSubscribers ?? '?'} contatos)`);

  const { templates = [] } = await brevo('GET', '/smtp/templates?limit=100&offset=0');
  console.log('\nModelos:');
  for (const t of templates) console.log(`  #${t.id} ${t.name} | tag: ${t.tag || '-'} | ativo: ${t.isActive} | remetente: ${t.sender?.email || '?'}`);
  return { senders, domains, lists, templates };
}

// ---------- criar lista e modelos ----------
async function criar() {
  const { senders = [] } = await brevo('GET', '/senders');
  const pedido = valor('--remetente');
  const remetente = pedido
    ? senders.find((s) => s.email.toLowerCase() === pedido.toLowerCase())
    : senders.find((s) => s.active && s.email.endsWith(`@${DOMINIO}`));
  if (!remetente) throw new Error(`Nenhum remetente ${pedido || `@${DOMINIO}`} cadastrado no Brevo.`);
  if (!remetente.active) console.warn(`Atenção: o remetente ${remetente.email} ainda não foi confirmado.`);

  // Pasta e lista
  const { folders = [] } = await brevo('GET', '/contacts/folders?limit=50&offset=0');
  let pasta = folders.find((f) => f.name === NOME_PASTA);
  if (!pasta) pasta = { id: (await brevo('POST', '/contacts/folders', { name: NOME_PASTA })).id };
  const { lists = [] } = await brevo('GET', '/contacts/lists?limit=50&offset=0');
  let lista = lists.find((l) => l.name === NOME_LISTA);
  if (!lista) {
    lista = { id: (await brevo('POST', '/contacts/lists', { name: NOME_LISTA, folderId: pasta.id })).id };
    console.log(`Lista criada: #${lista.id} ${NOME_LISTA}`);
  } else console.log(`Lista já existe: #${lista.id} ${NOME_LISTA}`);

  // Modelos (cria ou atualiza pelo nome)
  const { templates = [] } = await brevo('GET', '/smtp/templates?limit=100&offset=0');
  const ids = {};
  for (const [chave, t, tag] of [['confirmacao', confirmacao, 'optin'], ['boasVindas', boasVindas, 'boas-vindas']]) {
    const corpo = {
      templateName: t.nome,
      subject: t.assunto,
      htmlContent: t.html,
      sender: { email: remetente.email, name: 'Sonar Musical' },
      replyTo: remetente.email,
      tag,
      isActive: true,
    };
    const existente = templates.find((x) => x.name === t.nome);
    if (existente) {
      await brevo('PUT', `/smtp/templates/${existente.id}`, corpo);
      ids[chave] = existente.id;
      console.log(`Modelo atualizado: #${existente.id} ${t.nome}`);
    } else {
      ids[chave] = (await brevo('POST', '/smtp/templates', corpo)).id;
      console.log(`Modelo criado: #${ids[chave]} ${t.nome}`);
    }
  }
  console.log(`\nPara o Netlify (não são segredos):\n  BREVO_LIST_ID=${lista.id}\n  BREVO_DOI_TEMPLATE_ID=${ids.confirmacao}`);
  console.log(`Modelo de boas-vindas para a automação: #${ids.boasVindas}`);
}

// ---------- DNS ----------
function registrosDoBrevo(info) {
  // O formato varia entre contas (dkim_record, dkim1Record, brevo_code, dmarc_record...).
  const out = [];
  for (const [nome, r] of Object.entries(info.dns_records || {})) {
    if (!r || typeof r !== 'object' || !r.type) continue;
    out.push({ nome, tipo: String(r.type).toUpperCase(), host: r.host_name || r.hostname || r.host || '@', valor: r.value, ok: r.status });
  }
  return out;
}

function lerTokenNetlify() {
  const p = `${process.env.APPDATA}/netlify/Config/config.json`;
  const cfg = JSON.parse(readFileSync(p, 'utf8'));
  return Object.values(cfg.users || {}).map((u) => u?.auth?.token).find(Boolean);
}

async function netlify(metodo, caminho, corpo) {
  const r = await fetch(`https://api.netlify.com/api/v1${caminho}`, {
    method: metodo,
    headers: { Authorization: `Bearer ${lerTokenNetlify()}`, ...(corpo ? { 'content-type': 'application/json' } : {}) },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const texto = await r.text();
  if (!r.ok) throw new Error(`Netlify ${metodo} ${caminho}: ${r.status} ${texto.slice(0, 200)}`);
  return texto ? JSON.parse(texto) : null;
}

const hostCompleto = (h) => (!h || h === '@' ? DOMINIO : h.endsWith(DOMINIO) ? h.replace(/\.$/, '') : `${h}.${DOMINIO}`);

async function dns() {
  const info = await brevo('GET', `/senders/domains/${DOMINIO}`);
  // A API não devolve os registros do subdomínio de marca (links e imagens com
  // em.sonarmusical.com.br); eles vêm da tela de domínio do Brevo.
  const marca = [
    { nome: 'marca', tipo: 'CNAME', host: 'em', valor: 'em-sonarmusical-com-br.brand.brevosend.com' },
    { nome: 'redirecionamento', tipo: 'CNAME', host: 'r.em', valor: 'em-sonarmusical-com-br.r.brand.brevosend.com' },
    { nome: 'imagens', tipo: 'CNAME', host: 'img.em', valor: 'em-sonarmusical-com-br.img.brand.brevosend.com' },
  ];
  const regs = [...registrosDoBrevo(info), ...marca];
  console.log(`Domínio ${DOMINIO} | verificado: ${info.verified} | autenticado: ${info.authenticated}`);
  for (const r of regs) console.log(`  [${r.ok === true ? 'ok' : r.ok === false ? 'falta' : '?'}] ${r.tipo} ${hostCompleto(r.host)} -> ${r.valor}`);

  const zonas = await netlify('GET', `/sites/${NETLIFY_SITE}/dns`);
  const zona = (zonas || []).find((z) => z.name === DOMINIO);
  if (!zona) throw new Error('Zona de DNS do Netlify não encontrada para o domínio.');
  const atuais = zona.records || (await netlify('GET', `/dns_zones/${zona.id}/dns_records`));

  const plano = [];
  for (const r of regs) {
    const host = hostCompleto(r.host);
    const iguais = atuais.filter((a) => a.hostname === host && a.type === r.tipo);
    if (iguais.some((a) => a.value.replace(/\.$/, '') === String(r.valor).replace(/\.$/, ''))) continue;
    if (r.tipo === 'TXT' && /^v=spf1/i.test(r.valor)) {
      // Nunca criar um segundo SPF: mescla o include do Brevo no SPF existente.
      const spf = atuais.find((a) => a.hostname === host && a.type === 'TXT' && /^v=spf1/i.test(a.value));
      const inc = (r.valor.match(/include:\S+/g) || []).filter((i) => !spf?.value.includes(i));
      if (spf && inc.length) plano.push({ acao: 'substituir', antigo: spf, novo: { type: 'TXT', hostname: host, value: spf.value.replace(/\s+([~-]all)/, ` ${inc.join(' ')} $1`) } });
      else if (!spf) plano.push({ acao: 'criar', novo: { type: 'TXT', hostname: host, value: r.valor } });
      continue;
    }
    if (r.tipo === 'TXT' && /^v=DMARC1/i.test(r.valor)) {
      const dm = atuais.find((a) => a.hostname === host && a.type === 'TXT');
      if (dm) { console.log(`  DMARC já existe (${dm.value}), mantido.`); continue; }
    }
    if (iguais.length && r.tipo === 'CNAME') plano.push({ acao: 'substituir', antigo: iguais[0], novo: { type: r.tipo, hostname: host, value: r.valor } });
    else plano.push({ acao: 'criar', novo: { type: r.tipo, hostname: host, value: r.valor } });
  }

  if (!plano.length) { console.log('\nDNS do Netlify já tem todos os registros.'); return; }
  console.log('\nMudanças no DNS do Netlify:');
  for (const p of plano) console.log(`  ${p.acao.toUpperCase()} ${p.novo.type} ${p.novo.hostname} = ${p.novo.value}${p.antigo ? `  (era: ${p.antigo.value})` : ''}`);
  if (!tem('--aplicar')) { console.log('\n(prévia; rode com --aplicar para cadastrar)'); return; }

  for (const p of plano) {
    await netlify('POST', `/dns_zones/${zona.id}/dns_records`, { ...p.novo, ttl: 3600 });
    if (p.antigo) await netlify('DELETE', `/dns_zones/${zona.id}/dns_records/${p.antigo.id}`);
    console.log(`  feito: ${p.novo.type} ${p.novo.hostname}`);
  }
}

async function autenticar() {
  const r = await brevo('PUT', `/senders/domains/${DOMINIO}/authenticate`);
  console.log(r?.message || 'pedido enviado');
  const info = await brevo('GET', `/senders/domains/${DOMINIO}`);
  console.log(`verificado: ${info.verified} | autenticado: ${info.authenticated}`);
}

async function adicionarRemetente(email) {
  const { senders = [] } = await brevo('GET', '/senders');
  const ja = senders.find((s) => s.email.toLowerCase() === email.toLowerCase());
  if (ja) { console.log(`Remetente já existe: #${ja.id} <${ja.email}> ${ja.active ? 'ATIVO' : 'aguardando confirmação'}`); return; }
  const r = await brevo('POST', '/senders', { name: 'Sonar Musical', email });
  console.log(`Remetente criado: #${r.id} <${email}>`);
}

try {
  if (valor('--add-remetente')) await adicionarRemetente(valor('--add-remetente'));
  else if (tem('--criar')) await criar();
  else if (tem('--dns')) await dns();
  else if (tem('--autenticar')) await autenticar();
  else await status();
} catch (e) {
  console.error(e.message);
  process.exit(1);
}

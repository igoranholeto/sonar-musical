// Alerta de preço por produto: regras, armazenamento (Netlify Blobs), e-mails e a checagem
// que roda depois de cada deploy. Usado pelas funções netlify/functions/alerta-preco.mts
// (criar, confirmar, cancelar, reativar), deploy-succeeded.mts e alertas-diario.mts, e pelo
// script local scripts/alertas-preco.mjs (status e checagem manual).
//
// Fluxo: a pessoa pede o alerta na ficha /produto/<id>/ -> fica "pendente" e recebe um
// e-mail de confirmação -> o clique deixa "ativo" -> depois de cada deploy (a rotina diária
// de preços faz push e a Netlify publica) comparamos o preço novo; se a condição bateu,
// mandamos UM e-mail e o alerta vira "disparado" (o e-mail traz "continuar acompanhando").
//
// Privacidade: o e-mail só fica no blob do próprio alerta; as chaves usam o hash dele.
// Nada aqui registra e-mail em log. Pendente sem clique some em 7 dias, alerta ativo vence
// em 180 dias, disparado some em 30 dias e cancelar apaga na hora.
import { createHash, randomBytes } from 'node:crypto';
import { layout, botao, h1, p, divisor, SITE, VERMELHO, TEXTO, SUAVE, BORDA, FONTE } from '../../scripts/lib/emails.mjs';

export const STORE = 'alertas-preco';
export const REMETENTE = { name: 'Sonar Musical', email: 'oi@sonarmusical.com.br' };
export const LISTA_NEWSLETTER = 4;
export const DIAS_PENDENTE = 7;
export const DIAS_VALIDADE = 180;
export const DIAS_GUARDAR_DISPARADO = 30;
export const MAX_POR_EMAIL = 30;
export const MAX_POR_IP_DIA = 15;
export const MAX_ENVIOS_POR_RODADA = 60;
const MIN_REENVIO_MS = 10 * 60 * 1000;
const DIA = 24 * 60 * 60 * 1000;

const EMAIL_VALIDO = /^[^\s@<>()"',;:]+@[^\s@<>()"',;:]+\.[a-z]{2,}$/i;

export const reais = (v) => `R$ ${Math.round(v).toLocaleString('pt-BR')}`;
export const sha = (s) => createHash('sha256').update(String(s)).digest('hex');
export const novoToken = () => randomBytes(24).toString('base64url');
const TOKEN_VALIDO = /^[A-Za-z0-9_-]{32}$/;
export const tokenValido = (t) => typeof t === 'string' && TOKEN_VALIDO.test(t);

// Chaves no store: o alerta e um índice por e-mail (hash) para contar e evitar duplicata.
export const chaveAlerta = (token) => `alerta/${token}`;
export const prefixoEmail = (email) => `email/${sha(email)}/`;
export const chaveIndice = (email, token) => `${prefixoEmail(email)}${token}`;
export const chaveIp = (ip, dia) => `ip/${sha(`${ip}|${dia}`)}`;

/** "1.299,90", "1299,90", "1299.90", "R$ 1.299" -> número; inválido -> NaN. */
export function lerReais(v) {
  if (typeof v === 'number') return v;
  let s = String(v ?? '').replace(/R\$|\s/gi, '');
  if (!s) return NaN;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  return /^\d+(\.\d+)?$/.test(s) ? Number(s) : NaN;
}

/** Valida o pedido do formulário contra o preço de hoje do produto. */
export function validarPedido(dados, produtos) {
  const email = String(dados.email ?? '').trim().toLowerCase();
  if (!EMAIL_VALIDO.test(email) || email.length > 254) return { ok: false, codigo: 'email', erro: 'Confira o e-mail: parece incompleto.' };
  const id = String(dados.id ?? '');
  const prod = produtos[id];
  if (!prod) return { ok: false, codigo: 'produto', erro: 'Não encontramos este produto. Recarregue a página e tente de novo.' };
  let tipo = String(dados.tipo ?? 'queda');
  // Sem JavaScript, digitar o valor não marca a opção "quando chegar a": valor preenchido
  // vale como alvo. (Com JavaScript, o form só manda o valor quando a opção está marcada.)
  if (tipo === 'queda' && String(dados.alvo ?? '').trim()) tipo = 'alvo';
  if (prod.s !== 'ativo') tipo = 'volta';
  else if (!['queda', 'alvo'].includes(tipo)) tipo = 'queda';
  let alvo;
  if (tipo === 'alvo') {
    alvo = lerReais(dados.alvo);
    if (!Number.isFinite(alvo) || alvo < 1) return { ok: false, codigo: 'alvo', erro: 'Digite o preço que você quer pagar, por exemplo 1.200.' };
    alvo = Math.round(alvo * 100) / 100;
    if (alvo >= prod.p) return { ok: false, codigo: 'alvo-alto', erro: `O preço de hoje (${reais(prod.p)}) já está abaixo disso. Escolha um valor menor ou "qualquer queda".` };
  }
  const newsletter = ['on', 'true', '1', 'sim'].includes(String(dados.newsletter ?? '').toLowerCase());
  return { ok: true, valores: { email, id, tipo, alvo, newsletter } };
}

/** O alerta deve disparar com o preço de hoje? Queda conta a partir de 1% e R$ 1. */
export function deveDisparar(a, prod) {
  if (!prod || prod.s !== 'ativo') return false;
  if (a.tipo === 'volta') return true;
  if (a.tipo === 'alvo') return prod.p <= a.alvo;
  return a.base - prod.p >= Math.max(1, a.base * 0.01);
}

export function descreverCondicao(a) {
  if (a.tipo === 'volta') return 'quando ele voltar a ficar disponível no Mercado Livre';
  if (a.tipo === 'alvo') return `quando o preço chegar a ${reais(a.alvo)} ou menos`;
  return `quando o preço baixar de ${reais(a.base)}`;
}

const precoTxt = (prod) => `${reais(prod.p)}${prod.x ? ' no Pix' : ''}`;
const dataBr = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '');

// --------------------------------------------------------------------------- links
const utm = (c) => `utm_source=alerta&utm_medium=email&utm_campaign=${c}`;
export const links = (token, id) => ({
  confirmar: `${SITE}/api/alerta/confirmar?t=${token}`,
  cancelar: `${SITE}/alerta/gerenciar/?a=cancelar&t=${token}`,
  reativar: `${SITE}/alerta/gerenciar/?a=reativar&t=${token}`,
  umClique: `${SITE}/api/alerta/cancelar?t=${token}`,
  produto: `${SITE}/produto/${id}/?${utm('alerta-preco')}`,
});

// --------------------------------------------------------------------------- e-mails
// Foto do produto (JPG de fundo branco gerado no build, ver src/utils/foto-email.ts):
// só quando o feed marca `f`, com largura e altura fixas para o Outlook não esticar.
const fotoProduto = (prod, id, href) =>
  prod.f
    ? `<tr><td align="center" style="padding:18px 20px 0;line-height:0"><a href="${href}"><img src="${SITE}/images/email-produtos/${id}.jpg" width="240" height="180" alt="${esc(prod.n)}" style="display:block;width:240px;max-width:100%;height:auto;border:0"></a></td></tr>`
    : '';

const caixaProduto = (nome, linhas, foto = '') => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="margin:6px 0 4px;border:1px solid ${BORDA};border-radius:12px">
  ${foto}<tr><td style="padding:18px 20px;font-family:${FONTE};color:${TEXTO}">
    <p style="margin:0 0 6px;font-size:17px;line-height:1.35;font-weight:800">${nome}</p>
    ${linhas.map((l) => `<p style="margin:0;font-size:15px;line-height:1.6;color:${SUAVE}">${l}</p>`).join('\n    ')}
  </td></tr>
</table>`;

const rodapeAlerta = (cancelar) =>
  [
    'Os links para o Mercado Livre no Sonar são de afiliado: se você comprar por eles, o Sonar recebe uma comissão, sem custo extra para você.<br><br>',
    `Sonar Musical · <a href="${SITE}/" style="color:${SUAVE}">sonarmusical.com.br</a>`,
    ` · <a href="${SITE}/privacidade/" style="color:${SUAVE}">Privacidade</a>`,
    cancelar ? ` · <a href="${cancelar}" style="color:${SUAVE}">Cancelar este alerta</a>` : '',
  ].join('');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function emailConfirmacao(a, prod, token) {
  const l = links(token, a.id);
  const nome = esc(prod.n);
  const assunto = `Confirme seu alerta de preço: ${prod.n}`;
  const corpo = [
    h1('Falta um clique para ativar o alerta'),
    p(`Você pediu para ser avisado sobre este produto ${descreverCondicao(a)}.`),
    caixaProduto(nome, [
      a.tipo === 'volta' ? `Hoje: anúncio fora do ar (último preço ${reais(prod.p)})` : `Hoje: <strong style="color:${TEXTO}">${precoTxt(prod)}</strong> (conferido em ${dataBr(prod.e)})`,
      `Avisamos ${descreverCondicao(a)}.`,
    ], fotoProduto(prod, a.id, l.produto)),
    botao(l.confirmar, 'Confirmar alerta'),
    '<div style="clear:both"></div>',
    p(`Não foi você? Ignore este e-mail: sem o clique, nada acontece e o pedido é apagado em ${DIAS_PENDENTE} dias.`, `font-size:14px;color:${SUAVE};margin-top:18px`),
  ].join('\n');
  const html = layout({ preheader: `Confirme para receber o aviso de preço de ${nome}.`, corpo, rodape: rodapeAlerta() });
  const texto = [
    'Falta um clique para ativar o alerta.',
    `Produto: ${prod.n}. Hoje: ${precoTxt(prod)}.`,
    `Avisamos ${descreverCondicao(a)}.`,
    `Confirmar: ${l.confirmar}`,
    `Não foi você? Ignore este e-mail; o pedido é apagado em ${DIAS_PENDENTE} dias.`,
  ].join('\n\n');
  return { assunto, html, texto };
}

export function emailDisparo(a, prod, token) {
  const l = links(token, a.id);
  const nome = esc(prod.n);
  const volta = a.tipo === 'volta';
  const antes = a.base;
  const economia = !volta && antes > prod.p ? antes - prod.p : 0;
  const assunto = volta ? `Voltou: ${prod.n} por ${reais(prod.p)}` : `Baixou: ${prod.n} por ${reais(prod.p)}`;
  const linhas = [
    `<span style="font-size:24px;line-height:1.3;font-weight:800;color:${VERMELHO}">${precoTxt(prod)}</span>`,
    economia ? `Quando você criou o alerta: <s>${reais(antes)}</s>. Economia de <strong style="color:${TEXTO}">${reais(economia)}</strong>.` : '',
    prod.x && prod.c ? `No cartão: ${reais(prod.c)}.` : '',
    `Menor preço que já registramos: ${reais(prod.m)}.`,
  ].filter(Boolean);
  const corpo = [
    h1(volta ? 'O produto voltou' : 'O preço baixou'),
    p(volta ? 'O produto que você pediu para acompanhar voltou a ficar disponível no Mercado Livre.' : a.tipo === 'alvo' ? `O preço chegou ao valor que você pediu (${reais(a.alvo)} ou menos).` : 'O preço do produto que você acompanha caiu.'),
    caixaProduto(nome, linhas, fotoProduto(prod, a.id, l.produto)),
    botao(l.produto, 'Ver o produto e o histórico'),
    '<div style="clear:both"></div>',
    p(`Preço conferido no Mercado Livre em ${dataBr(prod.e)}. Os preços mudam rápido, principalmente perto da Black Friday: confira o valor no anúncio antes de comprar.`, `font-size:14px;color:${SUAVE};margin-top:18px`),
    divisor,
    p(`Este alerta avisa uma vez só. Quer continuar acompanhando? <a href="${l.reativar}" style="color:${VERMELHO};font-weight:700">Continuar acompanhando</a> (avisamos na próxima queda a partir do preço de hoje).`, 'font-size:14px'),
  ].join('\n');
  const html = layout({ preheader: `${prod.n} está por ${precoTxt(prod)}.`, corpo, rodape: rodapeAlerta(l.cancelar) });
  const texto = [
    volta ? 'O produto voltou a ficar disponível.' : 'O preço baixou.',
    `${prod.n}: ${precoTxt(prod)}${economia ? ` (era ${reais(antes)} quando você criou o alerta)` : ''}.`,
    `Ver o produto: ${l.produto}`,
    `Preço conferido em ${dataBr(prod.e)}; confira no anúncio antes de comprar.`,
    `Continuar acompanhando: ${l.reativar}`,
    `Cancelar este alerta: ${l.cancelar}`,
  ].join('\n\n');
  return { assunto, html, texto };
}

// --------------------------------------------------------------------------- Brevo
export async function enviarBrevo(chave, { para, assunto, html, texto, tags = [], umClique }) {
  if (!chave) throw new Error('BREVO_API_KEY ausente');
  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': chave, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: REMETENTE,
      to: [{ email: para }],
      subject: assunto,
      htmlContent: html,
      textContent: texto,
      tags: ['alerta-preco', ...tags],
      ...(umClique ? { headers: { 'List-Unsubscribe': `<${umClique}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } } : {}),
    }),
  });
  if (!r.ok) throw new Error(`Brevo ${r.status}: ${(await r.text().catch(() => '')).slice(0, 200)}`);
  return (await r.json().catch(() => ({}))).messageId;
}

/** Inscreve na lista do resumo de ofertas (a pessoa já confirmou o e-mail pelo clique). */
export async function inscreverNewsletter(chave, email) {
  const r = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: { 'api-key': chave, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ email, listIds: [LISTA_NEWSLETTER], updateEnabled: true }),
  });
  if (!r.ok && r.status !== 204) throw new Error(`Brevo contatos ${r.status}`);
}

// --------------------------------------------------------------------------- preços
export async function carregarPrecos(base = SITE) {
  const r = await fetch(`${base.replace(/\/$/, '')}/alertas/precos.json`, { headers: { 'cache-control': 'no-cache' } });
  if (!r.ok) throw new Error(`precos.json ${r.status}`);
  return (await r.json()).produtos;
}

// --------------------------------------------------------------------------- operações
async function emLotes(itens, n, fn) {
  const out = [];
  for (let i = 0; i < itens.length; i += n) out.push(...(await Promise.all(itens.slice(i, i + n).map(fn))));
  return out;
}

export async function apagarAlerta(store, a) {
  await Promise.all([store.delete(chaveAlerta(a.token)), store.delete(chaveIndice(a.email, a.token))]);
}

/** Alertas (pendentes e ativos) deste e-mail: [{ token, ...alerta }]. */
export async function alertasDoEmail(store, email) {
  const { blobs } = await store.list({ prefix: prefixoEmail(email) });
  const lista = await emLotes(blobs, 20, (b) => store.get(chaveAlerta(b.key.split('/').pop()), { type: 'json' }));
  return lista.filter(Boolean);
}

/** Conta um pedido do IP no dia; devolve false se passou do limite. */
export async function contarIp(store, ip, agora = new Date()) {
  if (!ip) return true;
  const dia = agora.toISOString().slice(0, 10);
  const k = chaveIp(ip, dia);
  const atual = (await store.get(k, { type: 'json' })) ?? { dia, n: 0 };
  if (atual.n >= MAX_POR_IP_DIA) return false;
  await store.setJSON(k, { dia, n: atual.n + 1 });
  return true;
}

/**
 * Cria o alerta pendente e manda o e-mail de confirmação.
 * Devolve { ok, erro?, reaproveitado? }.
 */
export async function criarAlerta({ store, produtos, dados, ip, chave, agora = new Date() }) {
  const v = validarPedido(dados, produtos);
  if (!v.ok) return v;
  const { email, id, tipo, alvo, newsletter } = v.valores;
  if (!(await contarIp(store, ip, agora))) return { ok: false, codigo: 'limite-ip', erro: 'Muitos pedidos hoje a partir desta conexão. Tente amanhã.' };

  const existentes = await alertasDoEmail(store, email);
  const recente = existentes.find((a) => a.id === id && a.status === 'pendente' && agora - new Date(a.criadoEm) < MIN_REENVIO_MS);
  if (recente) return { ok: true, reaproveitado: true };
  if (existentes.filter((a) => a.status === 'pendente' || a.status === 'ativo').length >= MAX_POR_EMAIL) {
    return { ok: false, codigo: 'limite-email', erro: `Este e-mail já tem ${MAX_POR_EMAIL} alertas. Cancele algum pelo link dos e-mails antes de criar outro.` };
  }

  const prod = produtos[id];
  const token = novoToken();
  const a = {
    v: 1,
    token,
    email,
    id,
    nome: prod.n,
    tipo,
    ...(tipo === 'alvo' ? { alvo } : {}),
    base: prod.p,
    newsletter,
    status: 'pendente',
    criadoEm: agora.toISOString(),
  };
  await Promise.all([store.setJSON(chaveAlerta(token), a), store.setJSON(chaveIndice(email, token), { id })]);
  try {
    const e = emailConfirmacao(a, prod, token);
    await enviarBrevo(chave, { para: email, ...e, tags: ['confirmacao'] });
  } catch (err) {
    await apagarAlerta(store, a);
    console.error(`alerta: falha ao enviar confirmação (${String(err?.message ?? err).slice(0, 200)})`);
    return { ok: false, codigo: 'envio', erro: 'Não conseguimos enviar o e-mail de confirmação agora. Tente de novo em alguns minutos.' };
  }
  return { ok: true };
}

/** Clique no e-mail de confirmação. Devolve { ok, id? }. */
export async function confirmarAlerta({ store, token, chave, agora = new Date() }) {
  if (!tokenValido(token)) return { ok: false };
  const a = await store.get(chaveAlerta(token), { type: 'json' });
  if (!a) return { ok: false };
  if (a.status === 'pendente') {
    if (agora - new Date(a.criadoEm) > DIAS_PENDENTE * DIA) {
      await apagarAlerta(store, a);
      return { ok: false };
    }
    // Um alerta por produto e e-mail: o novo substitui o anterior.
    for (const outro of await alertasDoEmail(store, a.email)) {
      if (outro.token !== token && outro.id === a.id) await apagarAlerta(store, outro);
    }
    a.status = 'ativo';
    a.confirmadoEm = agora.toISOString();
    a.expiraEm = new Date(+agora + DIAS_VALIDADE * DIA).toISOString();
    await store.setJSON(chaveAlerta(token), a);
    if (a.newsletter && chave) {
      try {
        await inscreverNewsletter(chave, a.email);
      } catch (err) {
        console.error(`alerta: falha ao inscrever na lista (${String(err?.message ?? err).slice(0, 120)})`);
      }
    }
  }
  return { ok: true, id: a.id };
}

export async function cancelarAlerta({ store, token }) {
  if (!tokenValido(token)) return { ok: false };
  const a = await store.get(chaveAlerta(token), { type: 'json' });
  if (a) await apagarAlerta(store, a);
  return { ok: true, id: a?.id };
}

/** "Continuar acompanhando" depois do aviso: volta a valer a partir do preço de hoje. */
export async function reativarAlerta({ store, token, produtos, agora = new Date() }) {
  if (!tokenValido(token)) return { ok: false };
  const a = await store.get(chaveAlerta(token), { type: 'json' });
  if (!a || a.status === 'pendente') return { ok: false };
  const prod = produtos[a.id];
  if (!prod) return { ok: false };
  if (prod.s !== 'ativo') a.tipo = 'volta';
  else if (a.tipo === 'volta' || (a.tipo === 'alvo' && a.alvo >= prod.p)) a.tipo = 'queda';
  if (a.tipo !== 'alvo') delete a.alvo;
  a.base = prod.p;
  a.status = 'ativo';
  a.reativadoEm = agora.toISOString();
  a.expiraEm = new Date(+agora + DIAS_VALIDADE * DIA).toISOString();
  delete a.disparadoEm;
  delete a.precoDisparo;
  await store.setJSON(chaveAlerta(token), a);
  return { ok: true, id: a.id, condicao: descreverCondicao(a) };
}

/**
 * Compara os alertas ativos com os preços de hoje, manda os avisos e faz a limpeza.
 * `seco: true` só conta, sem enviar nem gravar. Devolve um resumo sem e-mails.
 */
export async function verificarAlertas({ store, produtos, chave, agora = new Date(), seco = false }) {
  const r = { ativos: 0, pendentes: 0, disparados: 0, avisos: 0, apagados: 0, erros: 0, adiados: 0, porProduto: {} };
  const { blobs } = await store.list({ prefix: 'alerta/' });
  const alertas = (await emLotes(blobs, 20, (b) => store.get(b.key, { type: 'json' }))).filter(Boolean);

  const aDisparar = [];
  for (const a of alertas) {
    const idade = agora - new Date(a.criadoEm);
    if (a.status === 'pendente') {
      if (idade > DIAS_PENDENTE * DIA) {
        r.apagados++;
        if (!seco) await apagarAlerta(store, a);
      } else r.pendentes++;
      continue;
    }
    if (a.status === 'disparado') {
      if (agora - new Date(a.disparadoEm) > DIAS_GUARDAR_DISPARADO * DIA) {
        r.apagados++;
        if (!seco) await apagarAlerta(store, a);
      } else r.disparados++;
      continue;
    }
    if (a.status !== 'ativo') continue;
    if (a.expiraEm && new Date(a.expiraEm) < agora) {
      r.apagados++;
      if (!seco) await apagarAlerta(store, a);
      continue;
    }
    r.ativos++;
    r.porProduto[a.id] = (r.porProduto[a.id] ?? 0) + 1;
    if (deveDisparar(a, produtos[a.id])) aDisparar.push(a);
  }

  const agoraLote = aDisparar.slice(0, MAX_ENVIOS_POR_RODADA);
  r.adiados = aDisparar.length - agoraLote.length;
  if (seco) {
    r.avisos = agoraLote.length;
    return r;
  }
  await emLotes(agoraLote, 10, async (a) => {
    const prod = produtos[a.id];
    // Marca antes de enviar: se outra rodada rodar junto, não manda em dobro.
    const disparado = { ...a, status: 'disparado', disparadoEm: agora.toISOString(), precoDisparo: prod.p };
    await store.setJSON(chaveAlerta(a.token), disparado);
    try {
      const e = emailDisparo(a, prod, a.token);
      await enviarBrevo(chave, { para: a.email, ...e, tags: [a.tipo === 'volta' ? 'voltou' : 'baixou'], umClique: links(a.token, a.id).umClique });
      r.avisos++;
      r.ativos--;
      r.disparados++;
    } catch (err) {
      await store.setJSON(chaveAlerta(a.token), a);
      r.erros++;
      console.error(`alerta: falha ao enviar aviso de ${a.id} (${String(err?.message ?? err).slice(0, 200)})`);
    }
  });

  // Contadores de IP de dias anteriores.
  if (!seco) {
    const hoje = agora.toISOString().slice(0, 10);
    const { blobs: ips } = await store.list({ prefix: 'ip/' });
    await emLotes(ips, 20, async (b) => {
      const v = await store.get(b.key, { type: 'json' });
      if (!v || v.dia !== hoje) await store.delete(b.key);
    });
  }
  return r;
}

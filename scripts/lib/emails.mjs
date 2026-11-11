// Modelos de e-mail da newsletter, com a marca do Sonar.
// Usados por scripts/brevo-setup.mjs (cria/atualiza no Brevo) e pelas imagens
// de scripts/gen-email-logo.mjs.
//
// Regras de HTML de e-mail: tabelas, estilos inline, largura 600 px, imagens em
// PNG/JPG hospedadas no site, sem fonte da web e sem SVG. Colunas usam a técnica
// "híbrida" (inline-block com max-width), que vira uma coluna só no celular sem
// depender de media query. {{ doubleoptin }} e {{ unsubscribe }} são do Brevo.

const SITE = 'https://sonarmusical.com.br';
const IMG = `${SITE}/images/email`;
const VERMELHO = '#d32f3c';
const TEXTO = '#18181b';
const SUAVE = '#52525b';
const BORDA = '#e4e4e7';
const FONTE = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

const utm = (campanha) => `utm_source=newsletter&utm_medium=email&utm_campaign=${campanha}`;
const link = (path, campanha) => `${SITE}${path}${path.includes('?') ? '&' : '?'}${utm(campanha)}`;

function botao(href, texto, { tamanho = 16, padding = '14px 28px', margem = '28px 0 8px', alinhar = 'left' } = {}) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${alinhar}" style="margin:${margem}">
  <tr><td align="center" bgcolor="${VERMELHO}" style="border-radius:10px">
    <a href="${href}" style="display:inline-block;padding:${padding};font-family:${FONTE};font-size:${tamanho}px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px">${texto}</a>
  </td></tr>
</table>`;
}

// Botão "fantasma" (contorno), para ações secundárias lado a lado.
const pilula = (href, texto) =>
  `<a href="${href}" style="display:inline-block;margin:0 4px 8px;padding:10px 16px;border:2px solid ${VERMELHO};border-radius:999px;font-family:${FONTE};font-size:14px;font-weight:700;color:${VERMELHO};text-decoration:none">${texto}</a>`;

function layout({ preheader, corpo, rodape }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<title>Sonar Musical</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f4f5">
<tr><td align="center" style="padding:24px 12px">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px">
    <tr><td style="border-radius:14px 14px 0 0;overflow:hidden;line-height:0">
      <a href="${link('/', 'cabecalho')}"><img src="${IMG}/cabecalho.png" width="600" alt="Sonar Musical" style="display:block;width:100%;max-width:600px;height:auto;border:0;border-radius:14px 14px 0 0"></a>
    </td></tr>
    <tr><td bgcolor="#ffffff" style="padding:36px 36px 28px;border-radius:0 0 14px 14px;font-family:${FONTE};font-size:16px;line-height:1.6;color:${TEXTO}">
${corpo}
    </td></tr>
    <tr><td style="padding:22px 24px;font-family:${FONTE};font-size:12px;line-height:1.6;color:${SUAVE};text-align:center">
${rodape}
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

const h1 = (t) => `<h1 style="margin:0 0 16px;font-size:26px;line-height:1.25;font-weight:800;color:${TEXTO}">${t}</h1>`;
const h2 = (t, extra = '') => `<h2 style="margin:0 0 6px;font-size:20px;line-height:1.3;font-weight:800;color:${TEXTO};${extra}">${t}</h2>`;
const p = (t, extra = '') => `<p style="margin:0 0 14px;${extra}">${t}</p>`;
const divisor = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:30px 0 26px"><tr><td style="border-top:1px solid ${BORDA};font-size:0;line-height:0">&nbsp;</td></tr></table>`;

const rodapeBase = (comCancelar) => [
  comCancelar ? 'Os links para o Mercado Livre nos nossos guias são de afiliado: se você comprar por eles, o Sonar recebe uma comissão, sem custo extra para você.<br><br>' : '',
  `Sonar Musical · <a href="${SITE}/" style="color:${SUAVE}">sonarmusical.com.br</a>`,
  ` · <a href="https://www.instagram.com/sonar_musical" style="color:${SUAVE}">Instagram</a>`,
  ` · <a href="${SITE}/privacidade/" style="color:${SUAVE}">Privacidade</a>`,
  comCancelar ? ` · <a href="{{ unsubscribe }}" style="color:${SUAVE}">Cancelar inscrição</a>` : '',
].join('');

export const confirmacao = {
  nome: 'Sonar | Confirmação de inscrição',
  assunto: 'Confirme sua inscrição no Sonar Musical',
  preheader: 'Falta um clique para receber os alertas de preço.',
  get html() {
    return layout({
      preheader: this.preheader,
      corpo: [
        h1('Falta só um clique'),
        p('Você pediu para receber os alertas de preço do Sonar Musical. Para confirmar que este e-mail é seu, clique no botão:'),
        botao('{{ doubleoptin }}', 'Confirmar inscrição'),
        `<div style="clear:both"></div>`,
        p('Se não foi você, é só ignorar esta mensagem. Sem a confirmação, ninguém entra na lista.', `font-size:14px;color:${SUAVE};margin-top:18px`),
      ].join('\n'),
      rodape: rodapeBase(false),
    });
  },
};

// Guias recomendados no e-mail de boas-vindas (as capas saem de public/images/blog/<slug>.jpg).
export const GUIAS_BOAS_VINDAS = [
  { href: '/blog/presente-de-natal-para-guitarrista/', titulo: 'Presente de Natal para guitarrista', desc: 'Ideias por faixa de preço, dos acessórios aos pedais.' },
  { href: '/blog/melhor-violao-para-iniciante/', titulo: 'Melhor violão para iniciante', desc: 'Os modelos com melhor nota dos compradores, por orçamento.' },
  { href: '/blog/melhores-guitarras-eletricas-para-iniciantes-2026/', titulo: 'Melhores guitarras para iniciantes', desc: 'Da primeira guitarra ao kit completo com amplificador.' },
  { href: '/blog/melhor-teclado-infantil/', titulo: 'Melhor teclado infantil', desc: 'Para quem quer dar música de presente no Natal.' },
];

const slugDe = (href) => href.split('/').filter(Boolean).pop();

function cartaoGuia(g, campanha) {
  const url = link(g.href, campanha);
  return `<!--[if mso]><td width="264" valign="top"><![endif]-->
<div style="display:inline-block;width:100%;max-width:264px;vertical-align:top;font-size:16px;text-align:left">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:0 6px 22px">
    <a href="${url}"><img src="${IMG}/guias/${slugDe(g.href)}.jpg" width="252" alt="${g.titulo}" style="display:block;width:100%;height:auto;border:0;border-radius:10px"></a>
    <p style="margin:12px 0 4px;font-family:${FONTE};font-size:16px;line-height:1.35;font-weight:800"><a href="${url}" style="color:${TEXTO};text-decoration:none">${g.titulo}</a></p>
    <p style="margin:0 0 10px;font-family:${FONTE};font-size:14px;line-height:1.5;color:${SUAVE}">${g.desc}</p>
    <a href="${url}" style="font-family:${FONTE};font-size:14px;font-weight:700;color:${VERMELHO};text-decoration:none">Ler o guia &rarr;</a>
  </td></tr></table>
</div>
<!--[if mso]></td><![endif]-->`;
}

function gradeGuias(guias, campanha) {
  const linhas = [];
  for (let i = 0; i < guias.length; i += 2) {
    linhas.push(`<!--[if mso]><table role="presentation" width="528" cellpadding="0" cellspacing="0" border="0"><tr><![endif]-->
<div style="font-size:0;text-align:center;margin:0 -6px">
${guias.slice(i, i + 2).map((g) => cartaoGuia(g, campanha)).join('\n')}
</div>
<!--[if mso]></tr></table><![endif]-->`);
  }
  return linhas.join('\n');
}

function beneficio(icone, titulo, texto) {
  return `<tr>
  <td width="56" valign="top" style="padding:0 16px 18px 0"><img src="${IMG}/icone-${icone}.png" width="56" height="56" alt="" style="display:block;border:0"></td>
  <td valign="top" style="padding:4px 0 18px;font-family:${FONTE};font-size:15px;line-height:1.5;color:${SUAVE}"><strong style="display:block;font-size:16px;color:${TEXTO}">${titulo}</strong>${texto}</td>
</tr>`;
}

export const boasVindas = {
  nome: 'Sonar | Boas-vindas',
  assunto: 'Inscrição confirmada no Sonar Musical',
  preheader: 'O que você vai receber e os guias para começar.',
  get html() {
    const c = 'boas-vindas';
    return layout({
      preheader: this.preheader,
      corpo: [
        h1('Inscrição confirmada!'),
        p('Obrigado por se inscrever nos alertas de preço do Sonar Musical. A partir de agora, é isso que chega no seu e-mail:', 'margin-bottom:22px'),
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${beneficio('preco', 'Quedas de preço', 'Quando os instrumentos e equipamentos dos nossos guias ficam mais baratos no Mercado Livre.')}
${beneficio('presente', 'Black Friday e Natal', 'Um resumo com o que realmente baixou de preço, conferido no dia.')}
${beneficio('email', 'No máximo um e-mail por semana', 'Sem enxurrada. Sair da lista leva um clique.')}
</table>`,
        divisor,
        h2('Para começar, os guias mais procurados'),
        p('Comparações com preço do dia e a nota de quem comprou.', `font-size:15px;color:${SUAVE};margin-bottom:20px`),
        gradeGuias(GUIAS_BOAS_VINDAS, c),
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">${botao(link('/blog/', c), 'Ver todos os guias', { margem: '6px auto 0', alinhar: 'center' })}</td></tr></table>`,
        divisor,
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#141416" style="border-radius:12px;padding:26px 24px;text-align:center;font-family:${FONTE}">
  <p style="margin:0 0 6px;font-size:12px;font-weight:800;letter-spacing:2px;color:#ef4b57">BLACK FRIDAY · 27/11</p>
  <p style="margin:0 0 6px;font-size:20px;line-height:1.3;font-weight:800;color:#ffffff">Fique de olho na sua caixa de entrada</p>
  <p style="margin:0;font-size:15px;line-height:1.5;color:#d4d4d8">Vamos comparar os preços do dia com o histórico e mandar só o que baixou de verdade.</p>
</td></tr></table>`,
        divisor,
        h2('Ferramentas grátis no site', 'text-align:center'),
        p('Para estudar sem instalar nada:', `font-size:15px;color:${SUAVE};text-align:center;margin-bottom:16px`),
        `<div style="text-align:center">${[
          pilula(link('/afinador/', c), 'Afinador online'),
          pilula(link('/acordes/', c), 'Dicionário de acordes'),
          pilula(link('/metronomo/', c), 'Metrônomo'),
          pilula(link('/gerador-de-escalas/', c), 'Gerador de escalas'),
        ].join('\n')}</div>`,
        p('Quer sugerir uma análise? É só responder este e-mail. Lemos todos.', `margin-top:22px;text-align:center;font-size:15px;color:${SUAVE}`),
      ].join('\n'),
      rodape: rodapeBase(true),
    });
  },
};

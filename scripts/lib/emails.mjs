// Modelos de e-mail da newsletter, com a marca do Sonar.
// Usados por scripts/brevo-setup.mjs, que cria ou atualiza os modelos no Brevo.
//
// Regras de HTML de e-mail: tabelas, estilos inline, largura 600 px, sem fonte
// da web e sem SVG. As variáveis {{ doubleoptin }} e {{ unsubscribe }} são do
// Brevo e viram links no envio.

const SITE = 'https://sonarmusical.com.br';
const VERMELHO = '#d32f3c';
const TEXTO = '#18181b';
const SUAVE = '#52525b';
const FONTE = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

const utm = (campanha) => `utm_source=newsletter&utm_medium=email&utm_campaign=${campanha}`;
const link = (path, campanha) => `${SITE}${path}${path.includes('?') ? '&' : '?'}${utm(campanha)}`;

function botao(href, texto) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 8px">
  <tr><td align="center" bgcolor="${VERMELHO}" style="border-radius:10px">
    <a href="${href}" style="display:inline-block;padding:14px 28px;font-family:${FONTE};font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px">${texto}</a>
  </td></tr>
</table>`;
}

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
      <a href="${link('/', 'cabecalho')}"><img src="${SITE}/images/email/cabecalho.png" width="600" alt="Sonar Musical" style="display:block;width:100%;max-width:600px;height:auto;border:0;border-radius:14px 14px 0 0"></a>
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
const p = (t, extra = '') => `<p style="margin:0 0 14px;${extra}">${t}</p>`;

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
        p('Se não foi você, é só ignorar esta mensagem. Sem a confirmação, ninguém entra na lista.', `font-size:14px;color:${SUAVE};margin-top:18px`),
      ].join('\n'),
      rodape: `Sonar Musical · <a href="${SITE}/" style="color:${SUAVE}">sonarmusical.com.br</a> · <a href="${SITE}/privacidade/" style="color:${SUAVE}">Privacidade</a>`,
    });
  },
};

const guias = [
  ['/blog/presente-de-natal-para-guitarrista/', 'Presente de Natal para guitarrista', 'Ideias por faixa de preço, dos acessórios aos pedais.'],
  ['/blog/melhor-violao-para-iniciante/', 'Melhor violão para iniciante', 'Os modelos com melhor nota dos compradores, por orçamento.'],
  ['/blog/melhores-guitarras-eletricas-para-iniciantes-2026/', 'Melhores guitarras para iniciantes', 'Da primeira guitarra ao kit completo com amplificador.'],
  ['/blog/melhor-teclado-infantil/', 'Melhor teclado infantil', 'Para quem quer dar música de presente no Natal.'],
];

export const boasVindas = {
  nome: 'Sonar | Boas-vindas',
  assunto: 'Inscrição confirmada no Sonar Musical',
  preheader: 'O que você vai receber e por onde começar.',
  get html() {
    const lista = guias.map(([href, titulo, desc]) => `<tr><td style="padding:12px 0;border-top:1px solid #e4e4e7">
  <a href="${link(href, 'boas-vindas')}" style="font-weight:700;color:${VERMELHO};text-decoration:none">${titulo}</a><br>
  <span style="font-size:14px;color:${SUAVE}">${desc}</span>
</td></tr>`).join('\n');
    return layout({
      preheader: this.preheader,
      corpo: [
        h1('Inscrição confirmada'),
        p('Obrigado por se inscrever. Daqui pra frente, você recebe:'),
        `<ul style="margin:0 0 18px;padding-left:20px">
  <li style="margin-bottom:8px"><strong>Quedas de preço</strong> dos instrumentos e equipamentos dos nossos guias no Mercado Livre.</li>
  <li style="margin-bottom:8px"><strong>Resumo de Black Friday e Natal</strong> com o que realmente baixou, conferido no dia.</li>
  <li><strong>No máximo um e-mail por semana.</strong> Sair da lista leva um clique.</li>
</ul>`,
        p('<strong>Para começar, os guias mais procurados:</strong>', 'margin-top:8px'),
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${lista}</table>`,
        p(`Também tem ferramentas grátis no site: <a href="${link('/afinador/', 'boas-vindas')}" style="color:${VERMELHO}">afinador online</a>, <a href="${link('/acordes/', 'boas-vindas')}" style="color:${VERMELHO}">dicionário de acordes</a> e <a href="${link('/metronomo/', 'boas-vindas')}" style="color:${VERMELHO}">metrônomo</a>.`, 'margin-top:22px'),
        p('Quer sugerir uma análise? É só responder este e-mail. Lemos todos.'),
      ].join('\n'),
      rodape: [
        'Os links para o Mercado Livre nos nossos guias são de afiliado: se você comprar por eles, o Sonar recebe uma comissão, sem custo extra para você.',
        `<br><br>Sonar Musical · <a href="${SITE}/" style="color:${SUAVE}">sonarmusical.com.br</a> · <a href="${SITE}/privacidade/" style="color:${SUAVE}">Privacidade</a> · <a href="{{ unsubscribe }}" style="color:${SUAVE}">Cancelar inscrição</a>`,
      ].join(''),
    });
  },
};

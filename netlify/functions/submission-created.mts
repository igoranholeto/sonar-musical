// Função de evento do Netlify: roda a cada envio de formulário VERIFICADO
// (o que cai no spam não chega aqui). Para o formulário "newsletter", manda o
// e-mail para o Brevo com confirmação dupla: o Brevo envia o e-mail
// "Confirme sua inscrição" e só põe a pessoa na lista depois do clique.
//
// A chave fica na variável de ambiente BREVO_API_KEY do Netlify (nunca no código).
// A lista e o modelo de confirmação foram criados por scripts/brevo-setup.mjs
// (lista #4 "Alertas Sonar", modelo #1 "Sonar | Confirmação de inscrição").
// Não são segredos; as variáveis de ambiente só servem para trocar sem deploy.

const BREVO_LISTA_ID = Number(process.env.BREVO_LIST_ID || 4);
const BREVO_MODELO_CONFIRMACAO_ID = Number(process.env.BREVO_DOI_TEMPLATE_ID || 1);
const REDIRECIONAR_PARA = 'https://sonarmusical.com.br/newsletter/confirmada/';

const EMAIL_VALIDO = /^[^\s@<>()"',;:]+@[^\s@<>()"',;:]+\.[a-z]{2,}$/i;

const ok = (msg: string) => {
  console.log(msg);
  return { statusCode: 200, body: msg };
};

export const handler = async (event: { body?: string | null }) => {
  let payload: { form_name?: string; data?: Record<string, unknown> } = {};
  try {
    payload = JSON.parse(event.body || '{}').payload || {};
  } catch {
    return ok('corpo inválido, ignorado');
  }

  if (payload.form_name !== 'newsletter') return ok(`form ${payload.form_name ?? '?'} ignorado`);

  const email = String(payload.data?.email ?? '').trim().toLowerCase();
  if (payload.data?.['bot-field']) return ok('honeypot preenchido, ignorado');
  if (!EMAIL_VALIDO.test(email) || email.length > 254) return ok('e-mail inválido, ignorado');

  const chave = process.env.BREVO_API_KEY;
  if (!chave || !BREVO_LISTA_ID || !BREVO_MODELO_CONFIRMACAO_ID) {
    return ok('BREVO_API_KEY ausente; inscrição fica só no Netlify');
  }

  const r = await fetch('https://api.brevo.com/v3/contacts/doubleOptinConfirmation', {
    method: 'POST',
    headers: { 'api-key': chave, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      email,
      includeListIds: [BREVO_LISTA_ID],
      templateId: BREVO_MODELO_CONFIRMACAO_ID,
      redirectionUrl: REDIRECIONAR_PARA,
    }),
  });

  if (r.ok) return ok('confirmação enviada pelo Brevo');
  // Não registra o e-mail no log: só o status e a mensagem de erro do Brevo.
  const erro = await r.text().catch(() => '');
  console.error(`Brevo respondeu ${r.status}: ${erro.slice(0, 300)}`);
  return { statusCode: 200, body: 'erro no Brevo registrado' };
};

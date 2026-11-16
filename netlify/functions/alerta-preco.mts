// API do alerta de preço (regras em netlify/lib/alertas-core.mjs):
//   POST /api/alerta              cria o alerta pendente e manda o e-mail de confirmação
//   GET  /api/alerta/confirmar?t= clique do e-mail: ativa e leva para /alerta/ativado/
//   POST /api/alerta/cancelar     cancela (página /alerta/gerenciar/ e List-Unsubscribe de um clique)
//   POST /api/alerta/reativar     "continuar acompanhando" depois do aviso
// Cancelar e reativar são POST de propósito: robôs que abrem links de e-mail (antivírus,
// Outlook) fazem GET e não podem mudar nada. A chave do Brevo vem de BREVO_API_KEY.
import type { Config, Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
// @ts-ignore: módulo JS compartilhado com os scripts locais
import * as core from '../lib/alertas-core.mjs';

let cache: { em: number; produtos: Record<string, unknown> } | null = null;
async function produtosDe(origem: string) {
  if (cache && Date.now() - cache.em < 5 * 60 * 1000) return cache.produtos;
  cache = { em: Date.now(), produtos: await core.carregarPrecos(origem) };
  return cache.produtos;
}

const querJson = (req: Request) => (req.headers.get('accept') ?? '').includes('application/json');
const json = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const ir = (origem: string, caminho: string) => Response.redirect(`${origem}${caminho}`, 303);

async function lerCorpo(req: Request): Promise<Record<string, string>> {
  const tipo = req.headers.get('content-type') ?? '';
  try {
    if (tipo.includes('application/json')) return ((await req.json()) ?? {}) as Record<string, string>;
    const f = await req.formData();
    return Object.fromEntries([...f.entries()].map(([k, v]) => [k, String(v)]));
  } catch {
    return {};
  }
}

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const origem = url.origin;
  const acao = context.params?.acao ?? '';
  const store = getStore({ name: core.STORE, consistency: 'strong' });
  const chave = process.env.BREVO_API_KEY;

  try {
    if (!acao && req.method === 'POST') {
      const dados = await lerCorpo(req);
      // Campo invisível preenchido = robô: finge que deu certo e não faz nada.
      if (dados['bot-field']) return querJson(req) ? json({ ok: true }) : ir(origem, '/alerta/confirme/');
      const produtos = await produtosDe(origem);
      const r = await core.criarAlerta({ store, produtos, dados, ip: context.ip, chave });
      if (querJson(req)) return json(r, r.ok ? 200 : 400);
      return ir(origem, r.ok ? '/alerta/confirme/' : `/alerta/erro/?c=${encodeURIComponent(r.codigo ?? '')}`);
    }

    if (acao === 'confirmar' && req.method === 'GET') {
      const r = await core.confirmarAlerta({ store, token: url.searchParams.get('t'), chave });
      return ir(origem, r.ok ? `/alerta/ativado/?p=${encodeURIComponent(r.id)}` : '/alerta/link-invalido/');
    }

    if (acao === 'cancelar' && req.method === 'POST') {
      const dados = await lerCorpo(req);
      const r = await core.cancelarAlerta({ store, token: url.searchParams.get('t') ?? dados.t });
      return json(r, r.ok ? 200 : 400);
    }

    if (acao === 'reativar' && req.method === 'POST') {
      const dados = await lerCorpo(req);
      const produtos = await produtosDe(origem);
      const r = await core.reativarAlerta({ store, token: dados.t, produtos });
      return json(r, r.ok ? 200 : 400);
    }

    // GET em cancelar/reativar (link colado no navegador): manda para a página com o botão.
    if ((acao === 'cancelar' || acao === 'reativar') && req.method === 'GET') {
      const t = url.searchParams.get('t') ?? '';
      return ir(origem, `/alerta/gerenciar/?a=${acao}&t=${encodeURIComponent(t)}`);
    }
  } catch (err) {
    console.error(`alerta-preco ${acao || 'criar'}: ${String((err as Error)?.message ?? err).slice(0, 200)}`);
    return querJson(req) || req.method === 'POST'
      ? json({ ok: false, erro: 'Algo deu errado do nosso lado. Tente de novo em alguns minutos.' }, 500)
      : ir(origem, '/alerta/link-invalido/');
  }

  return json({ ok: false, erro: 'Método não permitido' }, 405);
};

export const config: Config = {
  path: ['/api/alerta', '/api/alerta/:acao'],
};

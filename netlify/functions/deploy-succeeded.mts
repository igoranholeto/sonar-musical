// Função de evento do Netlify: roda depois de cada deploy publicado. Os preços do
// catálogo só mudam por deploy (a rotina diária faz push), então é aqui que os alertas
// de preço são conferidos e os avisos saem, logo depois que o preço novo vai ao ar.
// Regras em netlify/lib/alertas-core.mjs; a reserva diária fica em alertas-diario.mts.
import { connectLambda, getStore } from '@netlify/blobs';
// @ts-ignore: módulo JS compartilhado com os scripts locais
import * as core from '../lib/alertas-core.mjs';

export const handler = async (event: { body?: string | null }) => {
  let deploy: { context?: string; deploy_ssl_url?: string; ssl_url?: string } = {};
  try {
    deploy = JSON.parse(event.body || '{}').payload || {};
  } catch {
    /* corpo inválido: segue com o domínio principal */
  }
  if (deploy.context && deploy.context !== 'production') {
    return { statusCode: 200, body: `deploy ${deploy.context} ignorado` };
  }
  try {
    connectLambda(event as never);
    const produtos = await core.carregarPrecos(deploy.deploy_ssl_url || deploy.ssl_url || 'https://sonarmusical.com.br');
    const r = await core.verificarAlertas({
      store: getStore({ name: core.STORE, consistency: 'strong' }),
      produtos,
      chave: process.env.BREVO_API_KEY,
    });
    const { porProduto, ...resumo } = r;
    console.log(`alertas depois do deploy: ${JSON.stringify(resumo)}`);
    return { statusCode: 200, body: JSON.stringify(resumo) };
  } catch (err) {
    console.error(`alertas depois do deploy: ${String((err as Error)?.message ?? err).slice(0, 200)}`);
    return { statusCode: 200, body: 'erro registrado' };
  }
};

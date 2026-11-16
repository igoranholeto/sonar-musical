// Reserva diária dos alertas de preço: se a função deploy-succeeded falhar ou um deploy
// não disparar o evento, os avisos saem aqui, às 9h30 de Brasília (depois da rotina das 7h).
// Os alertas avisam uma vez só (viram "disparado"), então rodar as duas não manda em dobro.
import type { Config } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
// @ts-ignore: módulo JS compartilhado com os scripts locais
import * as core from '../lib/alertas-core.mjs';

export default async () => {
  try {
    const produtos = await core.carregarPrecos('https://sonarmusical.com.br');
    const r = await core.verificarAlertas({
      store: getStore({ name: core.STORE, consistency: 'strong' }),
      produtos,
      chave: process.env.BREVO_API_KEY,
    });
    const { porProduto, ...resumo } = r;
    console.log(`alertas (diário): ${JSON.stringify(resumo)}`);
  } catch (err) {
    console.error(`alertas (diário): ${String((err as Error)?.message ?? err).slice(0, 200)}`);
  }
};

export const config: Config = {
  schedule: '30 12 * * *',
};

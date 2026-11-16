// /llms-full.txt: o índice do /llms.txt com o conteúdo-chave de cada artigo (resumo,
// resposta rápida, perguntas frequentes) e o catálogo de preços. Gerado no build.
import { carregarDadosLlms, montarLlmsFull } from '../utils/llms';

export async function GET() {
  return new Response(montarLlmsFull(await carregarDadosLlms()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

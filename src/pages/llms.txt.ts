// /llms.txt (llmstxt.org): índice do site para assistentes de IA, gerado no build.
import { carregarDadosLlms, montarLlms } from '../utils/llms';

export async function GET() {
  return new Response(montarLlms(await carregarDadosLlms()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

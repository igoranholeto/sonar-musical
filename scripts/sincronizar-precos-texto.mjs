// Troca, no texto dos posts, os preços antigos de cada produto pelo preço atual do catálogo
// (lógica em scripts/lib/precos-texto.mjs). Roda sozinho no fim de update-precos.mjs e de
// check-afiliados.mjs --atualizar-precos; use direto para revisar o site inteiro.
//   node scripts/sincronizar-precos-texto.mjs                 simulação em todos os posts
//   node scripts/sincronizar-precos-texto.mjs --aplicar       grava as trocas
//   --ids a,b      só esses produtos      --posts x,y      só esses posts
import { sincronizarPrecosTexto, imprimirRelatorio } from './lib/precos-texto.mjs';

const arg = (nome) => {
  const i = process.argv.indexOf(nome);
  return i > 0 ? process.argv[i + 1].split(',').map((s) => s.trim()).filter(Boolean) : null;
};
const aplicar = process.argv.includes('--aplicar');
imprimirRelatorio(sincronizarPrecosTexto({ ids: arg('--ids'), posts: arg('--posts'), aplicar }), aplicar);

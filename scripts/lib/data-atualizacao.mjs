// "Atualizado em" dos posts (campo updatedDate do frontmatter).
//
// Regra: a data só avança quando o CONTEÚDO do post muda de verdade (preço citado no texto,
// parágrafo reescrito, seção nova). Ajuste de título, capa, import, link interno avulso ou
// troca de tipografia não contam. O Google pede que a data de modificação reflita mudança
// significativa, e o leitor vê a mesma data no topo do post (PostLayout) e no schema
// (dateModified), então ela precisa ser verdadeira.
//
// Usado por precos-texto.mjs (quando um preço do texto muda) e por datas-atualizacao.mjs
// (que reconstrói as datas a partir do histórico do git).

/**
 * Grava `updatedDate: dia` no frontmatter se `dia` for depois da publicação e depois do
 * updatedDate atual. Devolve o texto (igual ao original quando não há o que mudar).
 */
export function marcarAtualizado(texto, dia) {
  const fim = texto.indexOf('\n---', 3);
  if (!texto.startsWith('---') || fim < 0) return texto;
  const fm = texto.slice(0, fim);
  const pub = fm.match(/^pubDate:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1];
  if (!pub || dia <= pub) return texto;
  const atual = fm.match(/^updatedDate:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1];
  if (atual && atual >= dia) return texto;
  const novoFm = atual
    ? fm.replace(/^updatedDate:.*$/m, `updatedDate: ${dia}`)
    : fm.replace(/^(pubDate:.*)$/m, `$1\nupdatedDate: ${dia}`);
  return novoFm + texto.slice(fim);
}

/** Valores em reais citados no texto, na ordem: mudou algum, o conteúdo mudou. */
export const precosCitados = (t) => (t.match(/R\$\s?\d[\d.,]*/g) ?? []).join('|');

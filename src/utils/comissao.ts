// Comissão de afiliado do Mercado Livre, usada como valor estimado do clique no GA
// (evento affiliate_click, parâmetro value): quanto o clique renderia se virasse compra.
// Taxas conferidas nos pedidos do painel de afiliados em nov/2026: guitarra,
// amplificador e ukulele pagaram 12%; o cabo P10 (acessório) pagou 16%. Categoria sem
// pedido conferido fica no padrão de 12% até aparecer uma venda que diga o contrário.
export const TAXA_PADRAO = 0.12;
const TAXA_POR_CATEGORIA: Record<string, number> = {
  acessorio: 0.16,
};

export function taxaComissao(categoria?: string): number {
  return (categoria && TAXA_POR_CATEGORIA[categoria]) || TAXA_PADRAO;
}

/** Comissão estimada em reais (2 casas), ou undefined sem preço. */
export function valorComissao(preco: number | undefined, categoria?: string): number | undefined {
  if (!preco || !(preco > 0)) return undefined;
  return Math.round(preco * taxaComissao(categoria) * 100) / 100;
}

/** Primeiro número de um preço em texto ("~R$ 5.490", "R$ 300–500") em reais. */
export function precoDeTexto(texto?: string): number | undefined {
  const m = texto?.match(/\d[\d.]*(?:,\d+)?/);
  if (!m) return undefined;
  const n = Number(m[0].replace(/\./g, '').replace(',', '.'));
  return n > 0 ? n : undefined;
}

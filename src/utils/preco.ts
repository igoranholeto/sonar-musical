// Preço do catálogo (número) no formato exibido nos CTAs: "A partir de R$ 1.234".
export function formatPreco(valor: number): string {
  const casas = valor % 1 ? 2 : 0;
  return `A partir de R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: 2 })}`;
}

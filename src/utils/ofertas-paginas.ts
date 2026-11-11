// Textos e listas das páginas /black-friday/ (geral e por categoria), calculados no
// build a partir das ofertas do dia.
import { NOMES_CATEGORIA, ORDEM_CATEGORIAS, reais, type Oferta } from './ofertas';

/** Categoria só ganha página própria com produtos suficientes para uma vitrine. */
export const MIN_PRODUTOS_CATEGORIA = 5;

export function categoriasComPagina(todas: Map<string, Oferta>): string[] {
  const n = new Map<string, number>();
  for (const o of todas.values()) if (o.categoria) n.set(o.categoria, (n.get(o.categoria) ?? 0) + 1);
  return ORDEM_CATEGORIAS.filter((c) => (n.get(c) ?? 0) >= MIN_PRODUTOS_CATEGORIA);
}

/** Guias que mais citam produtos do grupo (para "leia o guia antes de comprar"). */
export function guiasDoGrupo(ofertas: Oferta[], limite = 6) {
  const cont = new Map<string, { slug: string; titulo: string; n: number }>();
  for (const o of ofertas) {
    for (const p of o.posts) {
      const g = cont.get(p.slug) ?? { slug: p.slug, titulo: p.titulo, n: 0 };
      g.n++;
      cont.set(p.slug, g);
    }
  }
  return [...cont.values()].sort((a, b) => b.n - a.n).slice(0, limite);
}

const lista = (itens: string[]) => (itens.length <= 1 ? itens.join('') : `${itens.slice(0, -1).join(', ')} e ${itens.at(-1)}`);

export function faqGeral(todas: Map<string, Oferta>) {
  const ativos = [...todas.values()].filter((o) => o.status === 'ativo');
  const comDesc = ativos.filter((o) => o.desconto).sort((a, b) => b.desconto!.pct - a.desconto!.pct);
  const top = comDesc.slice(0, 3).map((o) => `${o.nome} (-${o.desconto!.pct}%)`);
  return [
    {
      question: 'Quando é a Black Friday 2026?',
      answer:
        'A Black Friday 2026 cai na sexta-feira, 27 de novembro. No Mercado Livre as ofertas costumam começar alguns dias antes e seguir pelo fim de semana até a Cyber Monday, em 30 de novembro. Esta página é atualizada durante todo o período.',
    },
    {
      question: 'Os descontos da Black Friday são reais?',
      answer:
        'Nem sempre. O preço riscado que o anúncio mostra é definido pelo vendedor, e há casos de preço que sobe antes da Black Friday para o desconto parecer maior. Por isso registramos o preço de cada produto a cada checagem: o aviso “Baixou R$ X” e o selo “Menor preço que registramos” vêm do nosso histórico, não do anúncio.',
    },
    {
      question: 'Quais instrumentos estão com o maior desconto hoje?',
      answer: top.length
        ? `Na última checagem, os maiores descontos exibidos nos anúncios eram ${lista(top)}. Use a ordenação “Maior desconto” para ver a lista completa e confira o histórico na ficha de cada produto.`
        : 'Na última checagem nenhum anúncio exibia desconto. Use a ordenação “Menor preço” e acompanhe o histórico na ficha de cada produto.',
    },
    {
      question: 'Vale a pena esperar a Black Friday para comprar instrumento?',
      answer:
        'Vale para quem não tem pressa e já sabe o modelo que quer: guitarras, violões, teclados e pedaleiras de marcas grandes costumam ter as melhores quedas nessa época. Se o preço de hoje já é o menor que registramos, esperar pode não compensar, porque o estoque das ofertas acaba rápido.',
    },
    {
      question: 'Com que frequência os preços desta página são atualizados?',
      answer:
        'Os anúncios são conferidos todos os dias, e com mais frequência na semana da Black Friday. A data da última checagem aparece no topo da página e na ficha de cada produto. Mesmo assim, o preço pode mudar entre uma checagem e outra: o que vale é o que aparece no anúncio na hora da compra.',
    },
    {
      question: 'O que acontece quando um anúncio acaba?',
      answer:
        'O produto continua na página, no fim da lista e marcado como “Esgotado” (anúncio pausado) ou “Anúncio encerrado”, com o último preço que vimos e um produto parecido da mesma categoria que está disponível. Quando encontramos um anúncio novo do mesmo modelo, o link é trocado.',
    },
  ];
}

export function textosCategoria(cat: string, ofertas: Oferta[]) {
  const nome = NOMES_CATEGORIA[cat];
  const plural = nome.plural.toLowerCase();
  const singular = nome.singular.toLowerCase();
  const ativos = ofertas.filter((o) => o.status === 'ativo');
  const precos = ativos.map((o) => o.preco).sort((a, b) => a - b);
  const maisBarato = ativos.reduce<Oferta | undefined>((m, o) => (!m || o.preco < m.preco ? o : m), undefined);
  const maiorDesc = ativos.filter((o) => o.desconto).sort((a, b) => b.desconto!.pct - a.desconto!.pct)[0];
  const maisAvaliado = ativos.filter((o) => o.avaliacoes).sort((a, b) => b.avaliacoes! - a.avaliacoes!)[0];
  const faixa = precos.length > 1 ? `de ${reais(precos[0])} a ${reais(precos.at(-1)!)}` : '';

  const titulo = `Black Friday de ${nome.plural} 2026: Ofertas de Hoje`;
  const descricao = `${ofertas.length} ${plural} com preço de hoje no Mercado Livre${faixa ? `, ${faixa}` : ''}, preço riscado, % de desconto e histórico de preço. Atualizado na Black Friday 2026.`;
  const h1 = `Black Friday de ${plural}: ofertas de hoje`;
  const intro = `${ofertas.length} ${plural}, dos que indicamos nos nossos guias aos mais vendidos e bem avaliados do Mercado Livre, com o preço de hoje no Mercado Livre${faixa ? ` (${faixa})` : ''}, quanto custavam, a porcentagem de desconto e cada mudança de preço que registramos.`;

  const faq = [
    maisBarato && {
      question: `Qual o modelo mais barato de ${singular} em oferta?`,
      answer: `Na última checagem, o mais barato desta lista era ${maisBarato.nome}, por ${reais(maisBarato.preco)} no Mercado Livre${maisBarato.desconto ? `, ${maisBarato.desconto.pct}% abaixo do preço riscado` : ''}. Ordene por “Menor preço” para ver os outros.`,
    },
    maiorDesc && {
      question: `Qual ${singular} está com o maior desconto?`,
      answer: `O maior desconto exibido era o de ${maiorDesc.nome}: de ${reais(maiorDesc.desconto!.de)} por ${reais(maiorDesc.preco)} (-${maiorDesc.desconto!.pct}%). Confira na ficha do produto se o preço já esteve mais baixo antes.`,
    },
    maisAvaliado && {
      question: `Qual o modelo de ${singular} mais bem avaliado da lista?`,
      answer: `O mais avaliado pelos compradores do Mercado Livre é ${maisAvaliado.nome}, com ${maisAvaliado.avaliacoes!.toLocaleString('pt-BR')} avaliações${maisAvaliado.nota ? ` e nota ${maisAvaliado.nota.toLocaleString('pt-BR')}` : ''}. Use “Melhor nota” ou “Mais avaliados” para comparar.`,
    },
    {
      question: `Vale a pena comprar ${singular} na Black Friday?`,
      answer: `Vale quando o desconto é real. Olhe o aviso de mudança de preço e o selo “Menor preço que registramos” em cada card: eles vêm do histórico que guardamos, não do preço riscado do anúncio. Se ainda está em dúvida sobre o modelo, leia antes os guias listados nesta página.`,
    },
  ].filter(Boolean) as { question: string; answer: string }[];

  return { titulo, descricao, h1, intro, faq };
}

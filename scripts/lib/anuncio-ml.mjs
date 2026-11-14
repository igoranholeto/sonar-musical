// Leitura de um link de afiliado meli.la e do bloco `anuncio` do catálogo (src/data/produtos).
// Usado por check-afiliados.mjs (todos os links) e update-precos.mjs (link trocado à mão),
// para que as páginas /black-friday/ e /produto/<id>/ mostrem a situação real do anúncio.

export const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36';

// URL final + título do produto em destaque (og:title da página social), para conferir se
// o link leva ao MESMO produto do CTA (já houve link "Pacifica 112V" abrindo outra Pacifica).
export async function destino(url) {
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    try {
      const r = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': UA } });
      const html = await r.text();
      const titulo = html.match(/<meta property="og:title" content="([^"]*)"/)?.[1] ?? '';
      // O aviso de pausa só conta no primeiro card; os seguintes são outros produtos da lista.
      const [c1, c2 = html.length] = [...html.matchAll(/class="poly-card[ "]/g)].map((m) => m.index);
      const card = c1 != null ? html.slice(c1, c2) : '';
      const pausado = card.includes('Anúncio pausado');
      return { fim: r.url, titulo, pausado, card: dadosDoCard(card) };
    } catch {
      await new Promise((ok) => setTimeout(ok, 1500));
    }
  }
  return { fim: '', titulo: '', pausado: false, card: {} };
}

/** OK, LISTA (anúncio encerrado), PAUSADO ou VERIFICAR (o ML não respondeu como esperado). */
export const statusDoDestino = ({ fim, pausado }) =>
  fim.includes('/lists') ? 'LISTA' : !fim.includes('ref=') ? 'VERIFICAR' : pausado ? 'PAUSADO' : 'OK';

/** Preço do dia: o og:title termina em " - R$ 1.234" ou " - R$ 1.234,56" (0 se não achar). */
export function precoDoTitulo(titulo) {
  const m = titulo?.match(/R\$\s*([\d.]+)(?:,(\d{1,2}))?\s*$/);
  return m ? Math.round(Number(`${m[1].replace(/\./g, '')}.${m[2] ?? '0'}`)) : 0;
}

// O primeiro card da página social é o produto do link. Dele saem o preço riscado que o
// anúncio exibe ("Antes: 999 reais"), o "48% OFF", as parcelas, o frete grátis e o link do
// produto no catálogo do ML (/p/MLB...), usado só para coletar a ficha técnica.
export function dadosDoCard(card) {
  if (!card) return {};
  const reais = (rotulo) => {
    const m = rotulo?.match(/([\d.]+) reais(?: com (\d+) centavos?)?/);
    return m ? Math.round(Number(m[1].replace(/\./g, '')) + Number(m[2] ?? 0) / 100) : undefined;
  };
  const antes = reais(card.match(/andes-money-amount--previous[\s\S]*?aria-label="([^"]+)"/)?.[1]);
  const off = Number(card.match(/(\d{1,2})% OFF/)?.[1]) || undefined;
  let parcelas = card
    .match(/poly-price__installments[^>]*>([\s\S]*?)<\/span>\s*<\/div>/)?.[1]
    ?.replace(/<[^>]+>/g, '')
    .replace(/&nbsp;|\s+/g, ' ')
    .replace(/R\$\s*/g, 'R$ ')
    .trim();
  // Desde nov/2026 o ML mostra o preço do Pix como principal ("44% OFF no Pix") e o
  // cartão vem embaixo: "ou R$ 573,54 em 10x R$ 57,35 sem juros". O og:title traz o do Pix.
  const pix = /poly-price__current[\s\S]*?no Pix/.test(card.split('poly-price__installments')[0]);
  let cartao;
  const ou = parcelas?.match(/^ou R\$ ([\d.]+)(?:,(\d{1,2}))? em (\d+x R\$ [\d.,]+(?: sem juros)?)/);
  if (ou) {
    cartao = Math.round(Number(`${ou[1].replace(/\./g, '')}.${ou[2] ?? '0'}`));
    parcelas = ou[3];
  }
  const href = card.match(/href="(https:\/\/[^"]+)"/)?.[1]?.split(/[?#]/)[0];
  return {
    antes,
    off,
    pix: pix || undefined,
    cartao: pix ? cartao : undefined,
    parcelas: parcelas && /^\d+x R\$/.test(parcelas) ? parcelas : undefined,
    freteGratis: /frete grátis/i.test(card),
    catalogo: href?.includes('mercadolivre.com.br') ? href : undefined,
  };
}

/**
 * Bloco `anuncio` do produto. `situacao` é ativo, pausado ou encerrado; `card` vem de
 * dadosDoCard. Com linkNovo, nada do anúncio anterior é aproveitado (data e catálogo do ML
 * eram de outro anúncio).
 */
export function montarAnuncio(prod, situacao, card, hoje, { linkNovo = false } = {}) {
  const anterior = linkNovo ? {} : prod.anuncio ?? {};
  const c = situacao === 'ativo' ? card ?? {} : {};
  const catalogoML = c.catalogo ?? anterior.catalogo;
  return {
    status: situacao,
    desde: anterior.status === situacao && anterior.desde ? anterior.desde : hoje,
    // O riscado só vale se for maior que o preço de hoje (às vezes o card fica defasado).
    ...(c.antes > Math.round(prod.preco) ? { antes: c.antes, off: c.off } : {}),
    // Preço do Pix: o do catálogo (og:title) só vale no Pix; no cartão sai `cartao`.
    ...(c.pix ? { pix: true, ...(c.cartao > Math.round(prod.preco) ? { cartao: c.cartao } : {}) } : {}),
    ...(c.parcelas ? { parcelas: c.parcelas } : {}),
    ...(situacao === 'ativo' ? { freteGratis: Boolean(c.freteGratis) } : {}),
    ...(catalogoML ? { catalogo: catalogoML } : {}),
  };
}

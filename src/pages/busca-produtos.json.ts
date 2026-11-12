// Índice de produtos para a busca do site (painel do menu e página /busca/).
// Gerado no build com o preço do dia; o navegador só baixa quando a pessoa abre a busca.
import { NOMES_CATEGORIA, carregarOfertas } from '../utils/ofertas';

const norm = (t: string) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const STATUS = { ativo: 0, pausado: 1, encerrado: 2 } as const;

export async function GET() {
  const todas = await carregarOfertas();
  const lista = [...todas.values()].map((o) => ({
    i: o.id,
    n: o.nome,
    p: Math.round(o.preco),
    f: o.imagem ?? '',
    c: o.categoriaNome,
    s: STATUS[o.status],
    a: o.avaliacoes ?? 0,
    // Palavras extras que não estão no nome: marca e categoria no singular e no plural.
    k: norm([o.marca, o.categoriaNome, o.categoria ? NOMES_CATEGORIA[o.categoria]?.plural : ''].filter(Boolean).join(' ')),
  }));
  return new Response(JSON.stringify(lista), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

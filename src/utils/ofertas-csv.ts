// Dados abertos da Black Friday: o resumo de preço de cada produto e o histórico completo,
// em CSV (RFC 4180, UTF-8 com BOM para o Excel abrir os acentos). Descritos no schema
// Dataset da página /black-friday/.
import { absUrl } from './schema';
import { carregarOfertas } from './ofertas';

const dia = (d: Date) => d.toISOString().slice(0, 10);
const cel = (v: string | number | undefined | null) => {
  if (v == null || v === '') return '';
  if (typeof v === 'number') return String(v);
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
};
const csv = (linhas: (string | number | undefined | null)[][]) =>
  new Response('﻿' + linhas.map((l) => l.map(cel).join(',')).join('\r\n') + '\r\n', {
    headers: { 'Content-Type': 'text/csv; charset=utf-8' },
  });

export const CSV_RESUMO = '/black-friday/precos.csv';
export const CSV_HISTORICO = '/black-friday/historico-precos.csv';

export async function csvResumo() {
  const ofertas = [...(await carregarOfertas()).values()];
  return csv([
    [
      'id',
      'produto',
      'marca',
      'categoria',
      'status_anuncio',
      'preco_atual_brl',
      'preco_riscado_anuncio_brl',
      'desconto_anuncio_pct',
      'menor_preco_registrado_brl',
      'data_menor_preco',
      'maior_preco_registrado_brl',
      'data_maior_preco',
      'acompanhado_desde',
      'conferido_em',
      'pagina',
    ],
    ...ofertas.map((o) => [
      o.id,
      o.nome,
      o.ficha.find(([k]) => /^marca$/i.test(k))?.[1] ?? o.marca,
      o.categoriaNome,
      o.status,
      o.preco,
      o.antes,
      o.off,
      o.menor.preco,
      dia(o.menor.em),
      o.maior.preco,
      dia(o.maior.em),
      dia(o.acompanhadoDesde),
      dia(o.precoEm),
      absUrl(`/produto/${o.id}/`),
    ]),
  ]);
}

export async function csvHistorico() {
  const ofertas = [...(await carregarOfertas()).values()];
  return csv([
    ['id', 'produto', 'categoria', 'data', 'preco_brl'],
    ...ofertas.flatMap((o) => o.historico.map((h) => [o.id, o.nome, o.categoriaNome, dia(h.data), h.preco])),
  ]);
}

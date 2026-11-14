// Roda DENTRO de uma aba do Chrome logada no painel de afiliados do Mercado Livre
// (https://www.mercadolivre.com.br/afiliados/dashboard), pela ferramenta de JavaScript.
// Lê as vendas pela mesma API que o painel usa e devolve só o que o site ainda não sabe.
//
// 1. `node scripts/ml-vendas-ga.mjs --conhecidas` imprime a linha CONHECIDAS: cole no
//    lugar da string abaixo (errar um id não estraga nada: o importador deduplica).
// 2. Rode este arquivo inteiro na aba. A ferramenta corta respostas em ~1.000 caracteres,
//    então a saída vem em partes de linhas inteiras: se a 1ª linha for "#parte 1/N",
//    rode `window.__vendasML[1]`, `window.__vendasML[2]`... e cole tudo na ordem.
// 3. Salve o texto em privado/ml-painel.txt e rode
//    `node scripts/ml-vendas-ga.mjs --importar privado/ml-painel.txt`.
//    A 1ª linha traz quantas linhas e a soma das comissões: o importador recusa o
//    arquivo se o texto colado não bater com elas.
//
// Formato: V|pedido|data|venda|comissao|pct|D ou I (direta/indireta)|status|MLB|nome
//          C|pedido|status   (venda que o painel lista como não efetivada)
const CONHECIDAS = ''; // ex.: '2000019396924580:R,2000019386980978:X'
const DIAS = 30; // vendas novas e mudanças de status
const DIAS_CANCEL = 120; // cancelamentos podem chegar bem depois da venda

const sabe = new Map(CONHECIDAS.split(',').filter(Boolean).map((s) => s.trim().split(':')));
const letra = (st = '') => (/REVIEW|PENDING/.test(st) ? 'R' : /CANCEL|REJECT|DENIED|REFUND|NOT_/.test(st) ? 'X' : /APPROV|PAID|CONFIRM|LIQUID|AVAILABLE/.test(st) ? 'A' : '?');
const dia = (d) => new Date(d.getTime() - 3 * 3600e3).toISOString().slice(0, 10);
const faixa = (dias) =>
  encodeURIComponent(`${dia(new Date(Date.now() - dias * 86400e3))}T00:00:00.000-03:00--${dia(new Date(Date.now() + 86400e3))}T00:00:00.000-03:00`);
async function tudo(rota, dias) {
  const itens = [];
  let total = 0;
  for (let p = 1; p <= 40; p++) {
    const r = await fetch(`/affiliate-program/api/dashboard/${rota}?metric_tab=general&type=GENERAL&filter_time_range=${faixa(dias)}&items_per_page=50&page=${p}`, {
      credentials: 'include',
    });
    if (!r.ok) throw new Error(`${rota}: HTTP ${r.status}`);
    const j = await r.json();
    total = j.total_results ?? 0;
    itens.push(...(j.item_list ?? []));
    if (!j.item_list?.length || itens.length >= total) break;
  }
  if (itens.length < total) throw new Error(`${rota}: li ${itens.length} de ${total}`);
  return itens;
}
const limpa = (s) => String(s ?? '').replace(/[|\n]/g, ' ').trim();
const vendas = await tudo('sales/general', DIAS);
const naoEfetivadas = await tudo('orders-cancelled', DIAS_CANCEL);
const linhas = [];
let soma = 0;
for (const i of vendas) {
  const id = String(i.id);
  if (sabe.get(id) === letra(i.status)) continue;
  soma += i.commissionValue;
  linhas.push(
    ['V', id, i.date, i.saleValue, i.commissionValue, i.commissionPercentage, i.saleType === 'INDIRECT' ? 'I' : 'D', i.status, i.link?.match(/MLB-?\d+/)?.[0]?.replace('-', '') ?? '', limpa(i.productName).slice(0, 60)].join('|'),
  );
}
for (const i of naoEfetivadas) {
  const id = String(i.id ?? i.orderId ?? i.order_id ?? '');
  if (!id || sabe.get(id) === 'X') continue;
  linhas.push(['C', id, limpa(i.status ?? 'NAO_EFETIVADA')].join('|'));
}
// Partes com linhas inteiras; a linha "#parte i/N" é ignorada pelo importador, então é
// só colar todas as partes uma embaixo da outra.
const partes = [[`ML|${new Date().toISOString().slice(0, 16)}|vendas ${vendas.length}|linhas ${linhas.length}|soma ${soma.toFixed(2)}`]];
for (const l of linhas) {
  const atual = partes[partes.length - 1];
  if (atual.join('\n').length + l.length > 850) partes.push([l]);
  else atual.push(l);
}
window.__vendasML = partes.map((p, i) => (partes.length > 1 ? [`#parte ${i + 1}/${partes.length}`, ...p] : p).join('\n'));
window.__vendasML[0];

// Leva o preço atual do catálogo (src/data/produtos) para o TEXTO dos posts.
//
// O CTA já mostra o preço do catálogo, mas o texto, as tabelas e o FAQ citam o preço do dia
// em que o post foi escrito. Quando o preço muda, o texto fica com o valor antigo. Este
// módulo troca, em cada post que cita o produto, os preços antigos dele (os valores do
// campo historico) pelo preço atual.
//
// Para não trocar o número errado:
// - o valor antigo só é trocado numa linha que cita o produto (modelo ou nome), ou, se o
//   valor não for redondo (ex.: R$ 1.899), em qualquer linha do post que cita o produto;
// - valores que também são preço (atual ou antigo) de OUTRO produto do mesmo post ficam
//   de fora e aparecem no relatório para revisão manual;
// - limites de faixa ("até R$ 1.000", "abaixo de", "a partir de", "menos de", "mais de",
//   "acima de") e valores com centavos (R$ 92,99) não são tocados.
// Se depois da troca todos os produtos do post estiverem com preço de hoje, a data de
// "preços conferidos/consultados no Mercado Livre em DD/MM/AAAA" também é atualizada.
//
// Uso pelos scripts: sincronizarPrecosTexto({ ids, aplicar }) devolve o relatório.
import fs from 'node:fs';
import path from 'node:path';

const CAT = 'src/data/produtos';
const BLOG = 'src/data/blog';

// Nomes que o texto usa e que não saem do nome do catálogo (id -> lista de termos).
const APELIDOS = {
  'boss-tu-02-afinador-clip': ['TU-02'],
  'boss-tu-3-afinador-cromatico': ['TU-3'],
  'epiphone-les-paul-standard-50s': ['Les Paul Standard', "'50s", '50s'],
  'fender-player-ii-stratocaster': ['Player II'],
  'squier-affinity-stratocaster': ['Affinity'],
  'squier-affinity-stratocaster-preta': ['Affinity'],
  'jackson-dinky-minion-js1x': ['JS1X', 'Minion'],
  'jackson-js22-dinky': ['JS22'],
  'gretsch-electromatic': ['Electromatic', 'G5622'],
  'strinberg-flying-v': ['FVS450', 'Flying V'],
  'strinberg-sts100-stratocaster': ['STS100'],
  'giannini-start-n-14': ['N-14', 'N14'],
  'michael-go-play-vm15ny': ['Go Play', 'VM15NY'],
  'michael-galaxy-vm925dtc': ['Galaxy', 'VM925DTC'],
  'michael-gm385n': ['GM385', 'GM385N'],
  'yamaha-pacifica-012': ['Pacifica 012', 'PAC012'],
  'malibu-23s-concert': ['Malibu'],
  'shelby-su23m-concert': ['Shelby', 'SU23M'],
  'tagima-41k-soprano': ['41K'],
  'tagima-21k-soprano': ['21K'],
};

const MARCAS = /^(gibson|epiphone|fender|squier|tagima|strinberg|giannini|michael|yamaha|ibanez|jackson|cort|prs|gretsch|boss|eagle|takamine|taylor|crafter|rozini|memphis|condor|waldman|casio|roland|korg|vogga|kalani|kala|shelby|malibu|harmonics|vivace|alesis|donner|voik|snark|korg|d'addario|bertô)$/i;

export const fmtPreco = (n) => 'R$ ' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const hojeISO = () =>new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
const dataBR = (iso) => iso.split('-').reverse().join('/');

export function lerCatalogo() {
  const cat = new Map();
  for (const f of fs.readdirSync(CAT).filter((f) => f.endsWith('.json'))) {
    cat.set(f.replace(/\.json$/, ''), JSON.parse(fs.readFileSync(path.join(CAT, f), 'utf8')));
  }
  return cat;
}

// Termos que identificam o produto numa linha: nome, nome sem a marca e códigos de modelo.
function termos(id, p) {
  const nome = String(p.nome ?? '').replace(/\(.*?\)/g, '').trim();
  const palavras = nome.split(/\s+/).filter(Boolean);
  const semMarca = palavras.filter((w, i) => !(i === 0 && MARCAS.test(w))).join(' ');
  const codigos = palavras.filter((w) => /\d/.test(w) && w.replace(/\W/g, '').length >= 3);
  return [...new Set([nome, semMarca, ...codigos, ...(APELIDOS[id] ?? [])].filter((t) => t && t.length >= 3))];
}

// Ids citados no post: CTA, barra de compra e TopEscolhas.
export function idsDoPost(texto) {
  return [...new Set([...texto.matchAll(/\bid(?:="|: ")([a-z0-9-]+)"/g)].map((m) => m[1]))];
}

const LIMITE = /(até|abaixo de|acima de|a partir de|menos de|mais de|faixa de|entre)\s*$/i;
// Faixa ("R$ 900–1.400", "de R$ 1.800 a R$ 2.500"): é estimativa, não o preço do anúncio.
const FAIXA_ANTES = /(?:[–-]|\ba)\s*(?:R\$\s*)?$/;
const FAIXA_DEPOIS = /^\s*(?:[–-]\s*(?:R\$\s*)?\d|a\s+R\$)/;
// Preço com data ou no passado ("Em 29/10 ela estava em R$ 870", "R$ 919 em 2 de novembro"):
// é registro histórico, fica como está e vai para revisão manual. Data com dois dígitos,
// para não confundir com tamanho de instrumento (3/4, 7/8).
const DATA = /\b(?:0[1-9]|[12]\d|3[01])\/(?:0[1-9]|1[0-2])\b|\b\d{1,2}º? de (?:janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\b/i;
const PASSADO = /\b(?:estava|esteve|custava|era de|chegou a|caiu|subiu|antes)\b/i;
// "Preço no Mercado Livre em 06/11/2026: R$ 1.899": troca o preço e a data juntos.
const PRECO_DATADO = /(em )(\d{2}\/\d{2}\/\d{4})(:\s*)$/;
// Valor que identifica o produto sozinho (não é número redondo nem preço pequeno genérico).
const distintivo = (v) => v >= 100 && v % 50 !== 0;

// antigos: { id: [preços] } que já não estão no historico (o mesmo dia sobrescreve a entrada).
export function sincronizarPrecosTexto({ ids = null, posts = null, aplicar = false, hoje = hojeISO(), antigos = {} } = {}) {
  const cat = lerCatalogo();
  const filtro = ids ? new Set(ids) : null;
  const relatorio = { fixos: [], trocas: [], ambiguos: [], faltando: [], datas: [], arquivos: [] };
  const arquivos = fs.readdirSync(BLOG).filter((f) => /\.mdx$/.test(f) && (!posts || posts.includes(f.replace(/\.mdx$/, ''))));

  for (const f of arquivos) {
    const file = path.join(BLOG, f);
    const original = fs.readFileSync(file, 'utf8');
    const citados = idsDoPost(original).filter((id) => cat.has(id));
    const alvo = citados.filter((id) => !filtro || filtro.has(id));
    if (!alvo.length) continue;

    // Valores (atuais e antigos) de cada produto do post, para achar ambiguidade.
    const valoresDe = new Map(citados.map((id) => {
      const p = cat.get(id);
      return [id, new Set([p.preco, ...(p.historico ?? []).map((h) => h.preco), ...(antigos[id] ?? [])].filter((v) => v > 0).map(Math.round))];
    }));

    const termosCache = new Map();
    const termosDe = (o) => termosCache.get(o) ?? termosCache.set(o, termos(o, cat.get(o))).get(o);

    const slug = f.replace(/\.mdx$/, '');
    let mudou = false;

    // Preço fixo no CTA (preco="A partir de R$ ...") sobrescreve o catálogo: sai, para a
    // caixa de compra mostrar o preço atual.
    const semFixo = original.replace(/<AfiliadoCTA\b[\s\S]*?\/>/g, (bloco) => {
      const id = bloco.match(/\bid="([^"]+)"/)?.[1];
      if (!alvo.includes(id) || !/\bpreco="/.test(bloco)) return bloco;
      relatorio.fixos.push(`${slug} [${id}] ${bloco.match(/\bpreco="([^"]*)"/)[1]} -> ${fmtPreco(cat.get(id).preco)} do catálogo`);
      mudou = true;
      return bloco.replace(/\s*\bpreco="[^"]*"/, '');
    });

    // Linhas com o fim de linha original de cada uma (há arquivos com CRLF e LF misturados).
    const partes = semFixo.split(/(\r?\n)/);
    let linhas = partes.filter((_, i) => i % 2 === 0);
    const quebras = partes.filter((_, i) => i % 2 === 1);

    for (const id of alvo) {
      const p = cat.get(id);
      const atual = Math.round(p.preco);
      const novo = fmtPreco(atual);
      const tks = termos(id, p);
      const velhos = [...valoresDe.get(id)].filter((v) => v !== atual);
      for (const v of velhos) {
        const outro = citados.find((o) => o !== id && valoresDe.get(o).has(v));
        const velho = fmtPreco(v);
        const re = new RegExp(`${esc(velho)}(?![\\d.,]\\d|\\d)`, 'g');
        linhas = linhas.map((l, i) => {
          if (!l.includes(velho)) return l;
          const citaProduto = tks.some((t) => l.toLowerCase().includes(t.toLowerCase()));
          if (outro) {
            relatorio.ambiguos.push(`${slug}:${i + 1} ${velho} pode ser de ${id} ou de ${outro}`);
            return l;
          }
          if (!citaProduto && !distintivo(v)) return l;
          // Linha que nomeia outro produto do post e não este: o valor era erro de texto
          // daquela linha (já houve Epiphone com o preço da Squier). Fica para revisão.
          if (!citaProduto && citados.some((o) => o !== id && termosDe(o).some((t) => l.toLowerCase().includes(t.toLowerCase())))) {
            relatorio.ambiguos.push(`${slug}:${i + 1} ${velho} de ${id} está numa linha de outro produto (atual ${novo})`);
            return l;
          }
          let datado = false;
          let n = l.replace(re, (m, pos) => {
            const antes = l.slice(0, pos);
            const depois = l.slice(pos + m.length);
            if (LIMITE.test(antes) || FAIXA_ANTES.test(antes) || FAIXA_DEPOIS.test(depois)) return m;
            if (PRECO_DATADO.test(antes)) {
              datado = true;
              return novo;
            }
            if (DATA.test(antes.slice(-60)) || DATA.test(depois.slice(0, 40)) || PASSADO.test(antes.slice(-40))) {
              relatorio.ambiguos.push(`${slug}:${i + 1} ${velho} de ${id} está com data ou no passado (atual ${novo})`);
              return m;
            }
            return novo;
          });
          if (datado) n = n.replace(new RegExp(`(em )\\d{2}/\\d{2}/\\d{4}(:\\s*${esc(novo)})`, 'g'), `$1${dataBR(hoje)}$2`);
          if (n !== l) {
            relatorio.trocas.push(`${slug}:${i + 1} [${id}] ${velho} -> ${novo}`);
            mudou = true;
          }
          return n;
        });
      }
    }

    // Data da consulta ("preços conferidos/consultados no Mercado Livre em DD/MM/AAAA"): passa
    // a ser a data do preço MAIS ANTIGO entre os produtos do post, e só avança.
    if (mudou) {
      const datas = citados.map((id) => cat.get(id).precoEm).filter(Boolean).sort();
      const nova = datas[0] && dataBR(datas[0] > hoje ? hoje : datas[0]);
      const iso = (br) => br.split('/').reverse().join('-');
      const reData = /((?:conferidos?|consultados?) no Mercado Livre em )(\d{2}\/\d{2}\/\d{4})/g;
      if (nova) {
        linhas = linhas.map((l) => l.replace(reData, (m, a, d) => {
          if (iso(d) >= iso(nova)) return m;
          relatorio.datas.push(`${slug}: ${d} -> ${nova}`);
          return a + nova;
        }));
      }
    }

    // O texto ainda cita um preço antigo do produto e não cita o atual: revisar à mão
    // (preço arredondado, valor ambíguo, linha sem o nome do produto...).
    const final = linhas.map((l, i) => l + (quebras[i] ?? '')).join('');
    for (const id of alvo) {
      const atual = fmtPreco(cat.get(id).preco);
      const antigos = [...valoresDe.get(id)].map(fmtPreco).filter((v) => v !== atual && new RegExp(`${esc(v)}(?![\\d.,]\\d|\\d)`).test(final));
      if (antigos.length && !final.includes(atual)) relatorio.faltando.push(`${slug} [${id}] texto cita ${antigos.join(', ')} e não ${atual}`);
    }

    if (final !== original) {
      relatorio.arquivos.push(slug);
      if (aplicar) fs.writeFileSync(file, final);
    }
  }
  return relatorio;
}

export function imprimirRelatorio(r, aplicar) {
  for (const x of r.fixos) console.log(`  CTA     ${x}`);
  for (const t of r.trocas) console.log(`  troca   ${t}`);
  for (const d of r.datas) console.log(`  data    ${d}`);
  const revisar = [...new Set(r.ambiguos), ...r.faltando];
  for (const a of revisar) console.log(`  REVISAR ${a}`);
  console.log(`\nPreços no texto: ${r.trocas.length} trocas e ${r.fixos.length} preços fixos de CTA removidos em ${r.arquivos.length} posts${aplicar ? '' : ' (simulação, use --aplicar)'}; ${revisar.length} pontos para revisar à mão.`);
}

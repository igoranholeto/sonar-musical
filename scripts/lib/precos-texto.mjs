// Leva o preço atual do catálogo (src/data/produtos) para o TEXTO dos posts.
//
// O CTA já mostra o preço do catálogo, mas o texto, as tabelas e o FAQ citam o preço do dia
// em que o post foi escrito. Quando o preço muda, o texto fica com o valor antigo. Este
// módulo troca, em cada post que cita o produto, os preços antigos dele (os valores do
// campo historico) pelo preço atual.
//
// Produtos de um post:
// - citados: têm CTA, barra de compra ou TopEscolhas no post;
// - mencionados: não têm CTA, mas o texto escreve o código do modelo (TD-02K, P-225, SX600)
//   e esse código é de um produto só do catálogo. O preço deles só é trocado logo depois do
//   código ("**P-225** (cerca de R$ 4.488)").
// Linhas de tabela (celulas) valem por si: o nome da 1ª célula casa com um produto só do
// catálogo e a célula de preço passa a ser o preço dele, mesmo sem CTA no post.
//
// Frase com data ("custava cerca de R$ 2.174 em 16/11/2026", "Em 16/11/2026 custava..."):
// se a frase tem uma data completa só e todos os preços dela são de produtos do post, os
// preços e a data andam juntos (a data vira a da consulta do catálogo). Frase com
// comparação no tempo ("caiu", "antes", "riscado", "hoje"), diferença ("R$ 500 a mais"),
// preço desconhecido ou mais de uma data fica como está e vai para revisão.
//
// Para não trocar o número errado:
// - o valor antigo só é trocado numa linha que cita o produto (modelo ou nome), ou, se o
//   valor não for redondo (ex.: R$ 1.899), em qualquer linha do post que cita o produto;
// - valores que também são preço (atual ou antigo) de OUTRO produto do mesmo post ficam
//   de fora e aparecem no relatório para revisão manual;
// - limites de faixa ("até R$ 1.000", "abaixo de", "a partir de", "menos de", "mais de",
//   "acima de") e valores com centavos (R$ 92,99) não são tocados;
// - tabela com preço muito diferente do catálogo (mais de 25%) e que nunca foi preço do
//   produto vai para revisão: pode ser outra versão do produto.
// Diferenças em reais ("R$ 1.100 a mais que o P-45") não são recalculadas: quando o preço
// de um produto citado na linha muda bastante, a linha vai para revisão.
// Se depois da troca todos os produtos do post estiverem com preço de hoje, a data de
// "preços conferidos/consultados no Mercado Livre em DD/MM/AAAA" também é atualizada.
//
// Uso pelos scripts: sincronizarPrecosTexto({ ids, aplicar }) devolve o relatório.
import fs from 'node:fs';
import path from 'node:path';
import { marcarAtualizado, precosCitados } from './data-atualizacao.mjs';

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
const isoDe = (br) => br.split('/').reverse().join('-');
const inclui = (l, t) => l.toLowerCase().includes(t.toLowerCase());
const valorDe = (s) => Number(s.replace(/\D/g, ''));

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

// Código de modelo: uma palavra só, com letra e número (TD-02K, P-225, SX600, C40II).
const codigosDe = (id, p) => termos(id, p).filter((t) => !/\s/.test(t) && /\d/.test(t) && /[a-z]/i.test(t)).map((t) => t.toLowerCase());
// Palavras do texto, com hífen e apóstrofo dentro da palavra (TD-07DMK, '50s).
const tokens = (s) => new Set(s.toLowerCase().split(/[^\p{L}\p{N}'-]+/u).map((t) => t.replace(/^[-']+|[-']+$/g, '')).filter(Boolean));
// Palavras sem acento nem pontuação, para casar o nome da linha da tabela com o catálogo.
const palavrasDe = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

function indexar(cat) {
  const palavras = new Map();
  const primeiras = new Set();
  const porCodigo = new Map();
  for (const [id, p] of cat) {
    const ws = palavrasDe(p.nome);
    palavras.set(id, new Set(ws));
    if (ws[0]) primeiras.add(ws[0]);
    for (const c of codigosDe(id, p)) porCodigo.set(c, [...new Set([...(porCodigo.get(c) ?? []), id])]);
  }
  // Só código que é de um produto só (o mesmo modelo em duas cores fica de fora).
  const codigos = new Map();
  for (const [c, dono] of porCodigo) if (dono.length === 1) codigos.set(dono[0], [...(codigos.get(dono[0]) ?? []), c]);
  // Produto da linha de tabela: todas as palavras do nome estão no nome do catálogo, um
  // produto só casa, e o nome tem código de modelo ou duas palavras que não são marca nem
  // tipo (1ª palavra de algum nome do catálogo). "Memphis (Tagima)" é marca, não produto.
  const daLinha = (nome) => {
    const ws = palavrasDe(nome);
    if (!ws.length) return null;
    const cands = [...palavras].filter(([, set]) => ws.every((w) => set.has(w)));
    if (cands.length !== 1) return null;
    const proprias = ws.filter((w) => !primeiras.has(w));
    return ws.some((w) => /\d/.test(w) && /[a-z]/.test(w)) || proprias.length >= 2 ? cands[0][0] : null;
  };
  return { codigos, daLinha };
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
// Frase com data completa: só anda se não for comparação no tempo nem diferença de preço.
const DATA_COMPLETA = /\b(?:0[1-9]|[12]\d|3[01])\/(?:0[1-9]|1[0-2])\/20\d{2}\b/g;
const TEM_DATA_COMPLETA = new RegExp(DATA_COMPLETA.source);
const FRASE_FIXA = /(?<![\p{L}\p{N}])(?:hoje|agora|atualmente|caiu|subiu|baixou|chegou a|antes|riscad[oa]|desconto|promoç\p{L}*|diferença|a mais|a menos|mais barat\p{L}*|mais car\p{L}*|economiz\p{L}*)(?![\p{L}\p{N}])/iu;
const FIM_FRASE = /"|[.!?;](?=\s|$)/g;
// Rodapé da consulta ("Preços consultados no Mercado Livre em 19/11/2026", "Preços de
// 18/11/2026."): não faz do preço vizinho um registro histórico, e a data avança sozinha.
const RODAPE = /((?:conferidos?|consultados?) no Mercado Livre em |[Pp]reços (?:de|do Mercado Livre em) )(\d{2}\/\d{2}\/\d{4})/g;
const semRodape = (s) => s.replace(RODAPE, '');
const PRECO = /R\$\s?(\d{1,3}(?:\.\d{3})*)(?![\d,]|\.\d)/g;
// Diferença em reais que pode ter mudado junto com o preço.
const DIFERENCAS = [
  /R\$\s?(\d{1,3}(?:\.\d{3})*)(?=\s+(?:a mais|a menos|mais barat|mais car|de diferença))/g,
  /(?:diferença (?:é |era |fica |de )*(?:cerca de )?|economiza\w* (?:cerca de )?)R\$\s?(\d{1,3}(?:\.\d{3})*)/g,
];
// Valor que identifica o produto sozinho (não é número redondo nem preço pequeno genérico).
const distintivo = (v) => v >= 100 && v % 50 !== 0;

function frases(l) {
  const out = [];
  let ini = 0;
  for (const m of l.matchAll(FIM_FRASE)) {
    if (m.index > ini) out.push([ini, m.index]);
    ini = m.index + m[0].length;
  }
  if (l.length > ini) out.push([ini, l.length]);
  return out;
}

// antigos: { id: [preços] } que já não estão no historico (o mesmo dia sobrescreve a entrada).
export function sincronizarPrecosTexto({ ids = null, posts = null, aplicar = false, hoje = hojeISO(), antigos = {} } = {}) {
  const cat = lerCatalogo();
  const ind = indexar(cat);
  const filtro = ids ? new Set(ids) : null;
  const passa = (id) => !filtro || filtro.has(id);
  const relatorio = { fixos: [], trocas: [], ambiguos: [], faltando: [], datas: [], arquivos: [] };
  const arquivos = fs.readdirSync(BLOG).filter((f) => /\.mdx$/.test(f) && (!posts || posts.includes(f.replace(/\.mdx$/, ''))));

  // Valores (atuais e antigos) de cada produto, para achar ambiguidade. Atual inclui o
  // preço no cartão, que o texto às vezes cita ao lado do preço no Pix.
  const valoresCache = new Map();
  const valoresDe = (id) => {
    if (!valoresCache.has(id)) {
      const p = cat.get(id);
      valoresCache.set(id, new Set([p.preco, ...(p.historico ?? []).map((h) => h.preco), ...(antigos[id] ?? [])].filter((v) => v > 0).map(Math.round)));
    }
    return valoresCache.get(id);
  };
  const atuaisDe = (id) => new Set([cat.get(id).preco, cat.get(id).anuncio?.cartao].filter((v) => v > 0).map(Math.round));
  const termosCache = new Map();
  const termosDe = (o) => termosCache.get(o) ?? termosCache.set(o, termos(o, cat.get(o))).get(o);

  for (const f of arquivos) {
    const file = path.join(BLOG, f);
    const original = fs.readFileSync(file, 'utf8');
    const slug = f.replace(/\.mdx$/, '');
    const citados = idsDoPost(original).filter((id) => cat.has(id));
    const tokensPost = tokens(original);
    const mencionados = [...ind.codigos].filter(([id, cs]) => !citados.includes(id) && cs.some((c) => tokensPost.has(c))).map(([id]) => id);
    const doPost = [...citados, ...mencionados];
    const alvo = citados.filter(passa);
    // Linha cita o produto: nome ou código para os citados; só o código para os mencionados.
    const cita = (id, texto) => (citados.includes(id) ? termosDe(id).some((t) => inclui(texto, t)) : (ind.codigos.get(id) ?? []).some((c) => tokens(texto).has(c)));
    const mudancas = new Map(); // `${id}|${de}` -> { id, de, para }
    const anota = (id, de) => mudancas.set(`${id}|${de}`, { id, de, para: Math.round(cat.get(id).preco) });

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

    // 1. Frases com data completa: preço e data andam juntos quando a frase é só registro
    // da consulta ("custava cerca de R$ 2.174 em 16/11/2026").
    linhas = linhas.map((l, i) => {
      if (!/R\$/.test(l) || !TEM_DATA_COMPLETA.test(l)) return l;
      let out = l;
      for (const [a, b] of frases(l).reverse()) {
        const s = l.slice(a, b);
        const datas = s.match(DATA_COMPLETA);
        if (datas?.length !== 1 || DATA.test(s.replace(datas[0], '')) || FRASE_FIXA.test(s)) continue;
        const plano = [];
        let ok = true;
        for (const m of s.matchAll(PRECO)) {
          const antes = s.slice(0, m.index);
          if (LIMITE.test(antes) || FAIXA_ANTES.test(antes) || FAIXA_DEPOIS.test(s.slice(m.index + m[0].length))) { ok = false; break; }
          const v = valorDe(m[1]);
          const donos = doPost.filter((id) => (valoresDe(id).has(v) || atuaisDe(id).has(v)) && (cita(id, l) || (citados.includes(id) && distintivo(v))));
          if (donos.length !== 1) { ok = false; break; }
          plano.push({ m, v, id: donos[0], velho: !atuaisDe(donos[0]).has(v) });
        }
        const trocar = plano.filter((x) => x.velho);
        if (!ok || !trocar.length || !trocar.every((x) => passa(x.id))) continue;
        const consulta = [...new Set(plano.map((x) => cat.get(x.id).precoEm ?? ''))].sort()[0];
        if (!consulta) continue;
        const nova = dataBR(consulta > hoje ? hoje : consulta);
        if (isoDe(nova) <= isoDe(datas[0])) continue;
        let ns = s;
        for (const x of [...trocar].reverse()) {
          const novo = fmtPreco(cat.get(x.id).preco);
          ns = ns.slice(0, x.m.index) + novo + ns.slice(x.m.index + x.m[0].length);
          relatorio.trocas.push(`${slug}:${i + 1} [${x.id}] ${fmtPreco(x.v)} -> ${novo} (frase de ${datas[0]} -> ${nova})`);
          anota(x.id, x.v);
        }
        out = out.slice(0, a) + ns.replace(datas[0], nova) + out.slice(b);
        mudou = true;
      }
      return out;
    });

    // 2. Preços antigos de cada produto, linha a linha.
    for (const id of [...alvo, ...mencionados.filter(passa)]) {
      const menc = !citados.includes(id);
      const p = cat.get(id);
      const atual = Math.round(p.preco);
      const novo = fmtPreco(atual);
      // Preço no cartão também é atual: não vira "velho" só por estar no histórico.
      const velhos = [...valoresDe(id)].filter((v) => !atuaisDe(id).has(v));
      for (const v of velhos) {
        const outro = doPost.find((o) => o !== id && valoresDe(o).has(v));
        const velho = fmtPreco(v);
        const re = new RegExp(`${esc(velho)}(?![\\d.,]\\d|\\d)`, 'g');
        linhas = linhas.map((l, i) => {
          if (!l.includes(velho)) return l;
          const citaProduto = cita(id, l);
          if (menc && !citaProduto) return l;
          if (outro) {
            relatorio.ambiguos.push(`${slug}:${i + 1} ${velho} pode ser de ${id} ou de ${outro}`);
            return l;
          }
          if (!citaProduto && !distintivo(v)) return l;
          // Linha de tabela (uma linha = um produto) que nomeia outro produto do post e não
          // este: o valor era erro daquela linha (já houve Epiphone com o preço da Squier).
          // Fica para revisão. Em prosa não vale: o texto cita produtos por apelido curto
          // ("Debut", "Afterglow") e a regra virava falso alarme.
          const linhaTabela = /celulas:\s*\[/.test(l) || /^\s*\|/.test(l);
          if (!citaProduto && linhaTabela && citados.some((o) => o !== id && termosDe(o).some((t) => inclui(l, t)))) {
            relatorio.ambiguos.push(`${slug}:${i + 1} ${velho} de ${id} está numa linha de outro produto (atual ${novo})`);
            return l;
          }
          let datado = false;
          let n = l.replace(re, (m, pos) => {
            const antes = l.slice(0, pos);
            const depois = l.slice(pos + m.length);
            if (LIMITE.test(antes) || FAIXA_ANTES.test(antes) || FAIXA_DEPOIS.test(depois)) return m;
            // Produto sem CTA: só o preço escrito logo depois do código dele.
            if (menc) {
              const cauda = antes.slice(-45).toLowerCase();
              const ultimo = Math.max(...ind.codigos.get(id).map((c) => {
                const k = cauda.lastIndexOf(c);
                return k >= 0 && !/[\p{L}\p{N}]/u.test(cauda[k + c.length] ?? '') ? k : -1;
              }));
              if (ultimo < 0 || /R\$/.test(cauda.slice(ultimo))) return m;
            }
            if (PRECO_DATADO.test(antes)) {
              datado = true;
              return novo;
            }
            if (DATA.test(semRodape(antes).slice(-60)) || DATA.test(semRodape(depois).slice(0, 40)) || PASSADO.test(antes.slice(-40))) {
              relatorio.ambiguos.push(`${slug}:${i + 1} ${velho} de ${id} está com data ou no passado (atual ${novo})`);
              return m;
            }
            return novo;
          });
          if (datado) n = n.replace(new RegExp(`(em )\\d{2}/\\d{2}/\\d{4}(:\\s*${esc(novo)})`, 'g'), `$1${dataBR(hoje)}$2`);
          if (n !== l) {
            relatorio.trocas.push(`${slug}:${i + 1} [${id}] ${velho} -> ${novo}`);
            anota(id, v);
            mudou = true;
          }
          return n;
        });
      }
    }

    // 3. Tabelas: a linha cujo nome é de um produto só do catálogo leva o preço dele, com ou
    // sem CTA no post. Linha com data ou com mais de um preço fica como está.
    linhas = linhas.map((l, i) => {
      const m = l.match(/celulas:\s*\[(.*)\]/);
      if (!m || DATA.test(l)) return l;
      const cells = [...m[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1]);
      const precos = cells.map((c, k) => (k > 0 && /^R\$ [\d.]+$/.test(c) ? k : -1)).filter((k) => k > 0);
      if (precos.length !== 1) return l;
      const id = ind.daLinha(cells[0]);
      if (!id || !passa(id)) return l;
      const atual = Math.round(cat.get(id).preco);
      const v = valorDe(cells[precos[0]]);
      if (v === atual) return l;
      if (!valoresDe(id).has(v) && Math.abs(v - atual) / atual > 0.25) {
        relatorio.ambiguos.push(`${slug}:${i + 1} tabela "${cells[0]}" cita ${fmtPreco(v)} e o catálogo diz ${fmtPreco(atual)} [${id}]`);
        return l;
      }
      const velho = `"${cells[precos[0]]}"`;
      const pos = l.lastIndexOf(velho);
      relatorio.trocas.push(`${slug}:${i + 1} [${id}] tabela ${fmtPreco(v)} -> ${fmtPreco(atual)}`);
      anota(id, v);
      mudou = true;
      return l.slice(0, pos) + `"${fmtPreco(atual)}"` + l.slice(pos + velho.length);
    });

    // 4. Diferença em reais numa linha que cita um produto cujo preço mudou bastante.
    for (const { id, de, para } of mudancas.values()) {
      const delta = Math.abs(para - de);
      linhas.forEach((l, i) => {
        if (!cita(id, l)) return;
        for (const re of DIFERENCAS) {
          for (const m of l.matchAll(re)) {
            const d = valorDe(m[1]);
            if (delta >= Math.max(50, 0.15 * d)) relatorio.ambiguos.push(`${slug}:${i + 1} diferença de ${fmtPreco(d)} cita ${id}, que foi de ${fmtPreco(de)} para ${fmtPreco(para)}`);
          }
        }
      });
    }

    // Data da consulta ("preços conferidos/consultados no Mercado Livre em DD/MM/AAAA"): passa
    // a ser a data do preço MAIS ANTIGO entre os produtos do post e os que mudaram no texto,
    // e só avança.
    if (mudou) {
      const datas = [...new Set([...citados, ...[...mudancas.values()].map((x) => x.id)])].map((id) => cat.get(id).precoEm).filter(Boolean).sort();
      const nova = datas[0] && dataBR(datas[0] > hoje ? hoje : datas[0]);
      if (nova) {
        linhas = linhas.map((l) => l.replace(RODAPE, (m, a, d) => {
          if (isoDe(d) >= isoDe(nova)) return m;
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
      const antigos = [...valoresDe(id)].map(fmtPreco).filter((v) => v !== atual && new RegExp(`${esc(v)}(?![\\d.,]\\d|\\d)`).test(final));
      if (antigos.length && !final.includes(atual)) relatorio.faltando.push(`${slug} [${id}] texto cita ${antigos.join(', ')} e não ${atual}`);
    }

    if (final !== original) {
      relatorio.arquivos.push(slug);
      // Um preço citado mudou: o conteúdo mudou, e o "Atualizado em" do post acompanha.
      // Só a data de consulta ou o preço fixo de um CTA, sem preço novo no texto, não conta.
      const gravar = precosCitados(final) !== precosCitados(original) ? marcarAtualizado(final, hoje) : final;
      if (aplicar) fs.writeFileSync(file, gravar);
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

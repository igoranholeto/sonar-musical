// Reconstrói o "Atualizado em" (updatedDate) de cada post a partir do histórico do git.
//
// Um commit conta como atualização de um post quando muda o CONTEÚDO dele:
// - algum preço citado (R$) mudou; ou
// - pelo menos 6 linhas do corpo mudaram (parágrafo reescrito, seção nova, FAQ novo).
// Não contam: a criação do post, frontmatter (título, descrição, capa, tags), imports,
// link interno avulso (1 ou 2 linhas) e os commits mecânicos da lista EXCLUIR
// (troca de tipografia em todo o site, capas, migração dos CTAs para o catálogo, FAQ em
// markdown convertido para o componente) e linhas de JSON-LD.
// A data só avança (ver lib/data-atualizacao.mjs). Use de novo quando quiser: é idempotente.
//
//   node scripts/datas-atualizacao.mjs                 simulação, lista o que mudaria
//   node scripts/datas-atualizacao.mjs --aplicar       grava
//   node scripts/datas-atualizacao.mjs --excluir a,b   não mexe nesses slugs
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { marcarAtualizado } from './lib/data-atualizacao.mjs';

const BLOG = 'src/data/blog';
const EXCLUIR = ['b59a057', 'b5eea8d', 'b6703ff', '8fb903b', '133fe78', '3d950f8'];
const MSG_MECANICA = /travess[ãa]o|\bcapas?\b|covers/i;
const CHAVES_FM = /^(title|description|pubDate|updatedDate|category|image|imageAlt|tags|featured|author|formato|rating|reviewedName|pros|cons):/;
const MIN_LINHAS = 6;

const aplicar = process.argv.includes('--aplicar');
const iExc = process.argv.indexOf('--excluir');
const excluirSlugs = new Set(iExc > 0 ? process.argv[iExc + 1].split(',') : []);

const log = execSync(`git log -p --no-renames --format="@@COMMIT %h %cs %s" -- ${BLOG}`, {
  encoding: 'utf8',
  maxBuffer: 1024 * 1024 * 1024,
});

const precos = (linhas) => linhas.flatMap((l) => l.match(/R\$\s?\d[\d.,]*/g) ?? []).sort().join('|');
const ultima = new Map(); // slug -> { dia, commit, motivo }
let commit = null;
let arquivo = null;
let mudancas = null;

function fecharArquivo() {
  if (!arquivo || !mudancas || ultima.has(arquivo)) return;
  if (mudancas.criado || !commit || commit.mecanico) return;
  // Linha que só mudou a URL de um link (ex.: /afinador -> /afinador/) não é conteúdo novo.
  const norm = (l) => l.replace(/\]\([^)]*\)/g, ']()').replace(/href="[^"]*"/g, 'href=""').trim();
  // A linha de abertura do <QuickAnswer pergunta="..."> é marcação (a pergunta pode citar
  // "até R$ 3.000"), não preço do texto.
  const corpo = (ls) => ls.filter((l) => l.trim() && l.trim() !== '---' && !CHAVES_FM.test(l) && !/^import /.test(l) && !/^\s*"[@a-zA-Z]+":/.test(l) && !/^\s*<QuickAnswer\b/.test(l)).map(norm);
  const menos = corpo(mudancas.menos);
  const mais = corpo(mudancas.mais);
  const precoMudou = precos(menos) !== precos(mais);
  // Linhas que mudaram de fato: as que não reaparecem iguais do outro lado do diff.
  const resto = (a, b) => { const pool = [...b]; return a.filter((l) => { const i = pool.indexOf(l); if (i < 0) return true; pool.splice(i, 1); return false; }); };
  const linhas = resto(menos, mais).length + resto(mais, menos).length;
  if (precoMudou || linhas >= MIN_LINHAS) {
    ultima.set(arquivo, { dia: commit.dia, commit: commit.h, motivo: precoMudou ? 'preço' : `${linhas} linhas` });
  }
}

for (const linha of log.split('\n')) {
  if (linha.startsWith('@@COMMIT ')) {
    fecharArquivo();
    const [, h, dia, ...msg] = linha.split(' ');
    const texto = msg.join(' ');
    commit = { h, dia, mecanico: EXCLUIR.some((x) => h.startsWith(x)) || MSG_MECANICA.test(texto) };
    arquivo = null;
    mudancas = null;
    continue;
  }
  if (linha.startsWith('diff --git ')) {
    fecharArquivo();
    const m = linha.match(/ b\/src\/data\/blog\/([^/]+)\.mdx$/);
    arquivo = m ? m[1] : null;
    mudancas = { menos: [], mais: [], criado: false };
    continue;
  }
  if (!arquivo || !mudancas) continue;
  if (linha.startsWith('new file mode')) mudancas.criado = true;
  else if (/^(\+\+\+|---) (a\/|b\/|\/dev\/null)/.test(linha)) continue;
  else if (linha.startsWith('+')) mudancas.mais.push(linha.slice(1));
  else if (linha.startsWith('-')) mudancas.menos.push(linha.slice(1));
}
fecharArquivo();

let n = 0;
for (const f of fs.readdirSync(BLOG).filter((x) => x.endsWith('.mdx')).sort()) {
  const slug = f.replace(/\.mdx$/, '');
  const u = ultima.get(slug);
  if (!u || excluirSlugs.has(slug)) continue;
  const file = path.join(BLOG, f);
  const original = fs.readFileSync(file, 'utf8');
  const novo = marcarAtualizado(original, u.dia);
  if (novo === original) continue;
  n++;
  const antes = original.match(/^updatedDate:\s*(\S+)/m)?.[1] ?? '-';
  console.log(`${slug}: ${antes} -> ${u.dia} (${u.commit}, ${u.motivo})`);
  if (aplicar) fs.writeFileSync(file, novo);
}
console.log(`\n${n} posts ${aplicar ? 'atualizados' : 'mudariam (simulação, use --aplicar)'}.`);

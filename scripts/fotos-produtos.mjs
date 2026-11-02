// Foto recortada para os produtos do catálogo que ainda não têm imagem.
// A foto é a do próprio anúncio do link de afiliado (og:image da página do meli.la), que o
// afiliado pode usar; nenhuma imagem de fora do Mercado Livre entra aqui.
// Uso:
//   node scripts/fotos-produtos.mjs [--ids a,b] [--limiar 205]
//                                                 baixa, recorta e grava public/images/produtos/<id>.webp,
//                                                 com relatório em covers-src/_fotos-produtos.json
//                                                 e montagens covers-src/_fotos-produtos-N.png para conferir
//   node scripts/fotos-produtos.mjs --aplicar [--pular a,b]
//                                                 grava imagem/imagemAlt no JSON dos produtos do relatório
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { recortar } from './lib/recorte.mjs';

const CAT = 'src/data/produtos';
const OUT = 'public/images/produtos';
const REL = 'covers-src/_fotos-produtos.json';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36';
const arg = (nome) => {
  const i = process.argv.indexOf(nome);
  return i > 0 ? process.argv[i + 1].split(',') : null;
};
const ler = (id) => JSON.parse(fs.readFileSync(path.join(CAT, `${id}.json`), 'utf8'));

if (process.argv.includes('--aplicar')) {
  const pular = new Set(arg('--pular') ?? []);
  let n = 0;
  for (const r of JSON.parse(fs.readFileSync(REL, 'utf8'))) {
    if (!r.arquivo || pular.has(r.id)) continue;
    const j = ler(r.id);
    j.imagem = `/${r.arquivo.replace(/^public\//, '')}`;
    j.imagemAlt = j.nome;
    fs.writeFileSync(path.join(CAT, `${r.id}.json`), JSON.stringify(j, null, 2) + '\n');
    n++;
  }
  console.log(`${n} produtos com foto gravada no catálogo (${pular.size} pulados).`);
  process.exit(0);
}

const so = arg('--ids');
const ids = fs.readdirSync(CAT)
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace(/\.json$/, ''))
  .filter((id) => (so ? so.includes(id) : !ler(id).imagem));

const limiar = Number(arg('--limiar')?.[0] ?? 228);
const relatorio = [];
for (const id of ids) {
  const p = ler(id);
  const r = { id, nome: p.nome };
  try {
    const html = await (await fetch(p.meli, { headers: { 'User-Agent': UA } })).text();
    r.titulo = html.match(/<meta property="og:title" content="([^"]*)"/)?.[1];
    r.foto = html.match(/<meta property="og:image" content="([^"]*)"/)?.[1];
    if (!r.foto) throw new Error('página sem og:image');
    const img = Buffer.from(await (await fetch(r.foto, { headers: { 'User-Agent': UA } })).arrayBuffer());
    const arquivo = `${OUT}/${id}.webp`;
    const { fundoBranco } = await recortar(img, arquivo, 256, { limiar });
    r.arquivo = arquivo.replace(/\\/g, '/').replace(/^/, 'public/').replace(/^public\/public\//, 'public/');
    r.fundoBranco = Math.round(fundoBranco * 100) / 100;
  } catch (e) {
    r.erro = e.message;
  }
  relatorio.push(r);
  console.log(`${r.erro ? 'ERRO ' + r.erro : `fundo ${r.fundoBranco}`}\t${id}`);
}
// Com --ids, o relatório anterior é mantido e só esses produtos são trocados nele.
const anterior = so && fs.existsSync(REL) ? JSON.parse(fs.readFileSync(REL, 'utf8')).filter((r) => !so.includes(r.id)) : [];
fs.writeFileSync(REL, JSON.stringify([...anterior, ...relatorio].sort((a, b) => a.id.localeCompare(b.id)), null, 2));

// Montagens em fundo escuro (como no site), 10 por linha, para conferir de olho.
const ok = relatorio.filter((r) => r.arquivo);
const L = 140, COL = 10, POR = 60;
for (let g = 0; g * POR < ok.length; g++) {
  const lote = ok.slice(g * POR, (g + 1) * POR);
  const linhas = Math.ceil(lote.length / COL);
  const camadas = [];
  for (const [i, r] of lote.entries()) {
    const x = (i % COL) * L, y = Math.floor(i / COL) * (L + 18);
    camadas.push({ input: await sharp(r.arquivo).resize(L - 20, L - 20, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer(), left: x + 10, top: y + 4 });
    const nome = `${g * POR + i + 1}. ${r.id}`.slice(0, 24).replace(/&/g, '&amp;');
    camadas.push({ input: Buffer.from(`<svg width="${L}" height="18"><text x="4" y="13" font-size="10" font-family="sans-serif" fill="#ccc">${nome}</text></svg>`), left: x, top: y + L - 4 });
  }
  await sharp({ create: { width: COL * L, height: linhas * (L + 18), channels: 3, background: '#161616' } })
    .composite(camadas)
    .png()
    .toFile(`covers-src/_fotos-produtos-${g + 1}.png`);
}
console.log(`\n${ok.length} fotos recortadas, ${relatorio.length - ok.length} com erro. Confira as montagens covers-src/_fotos-produtos-N.png.`);

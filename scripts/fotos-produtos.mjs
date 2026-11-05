// Foto recortada dos produtos do catálogo (critério do recorte em scripts/lib/recorte.mjs).
// A foto é a do próprio anúncio do link de afiliado (og:image da página do meli.la), que o
// afiliado pode usar; nenhuma imagem de fora do Mercado Livre entra aqui.
// Uso:
//   node scripts/fotos-produtos.mjs [--ids a,b | --todos] [--inteira a,b] [--sem-buracos a,b] [--baixar]
//                                                 sem --ids/--todos: só os produtos sem imagem;
//                                                 --inteira: esses vão sem recorte (com o fundo branco);
//                                                 --sem-buracos: só sai o fundo de fora (somam às listas abaixo);
//                                                 --baixar: baixa a foto de novo em vez de usar o cache;
//                                                 baixa a foto grande (até 1200 px), recorta e grava public/images/produtos/<id>.webp,
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
    const imagem = `/${r.arquivo.replace(/^public\//, '')}`;
    // Mantém o texto alternativo já escrito quando a foto continua no mesmo arquivo.
    if (j.imagem !== imagem || !j.imagemAlt) j.imagemAlt = j.nome;
    j.imagem = imagem;
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
  .filter((id) => (so ? so.includes(id) : process.argv.includes('--todos') || !ler(id).imagem));

// Exceções conferidas de olho na montagem; o critério do recorte está em scripts/lib/recorte.mjs.
// Produto que o recorte não separa bem do fundo: vai inteiro, com o fundo branco.
const INTEIRAS = [
  'boss-tu-3-afinador-cromatico',      // pedal branco em fundo cinza-claro: o fundo come o pedal
  'guitarra-infantil-com-microfone',   // fundo com notas musicais desenhadas
];
// Branco impresso ou brilho que passa no critério de buraco: fica (só sai o fundo de fora).
const SEM_BURACOS = [
  'giannini-genw-nylon',          // fita branca do rótulo Canário
  'joyo-atmosphere-r-14',         // brilho dos knobs cromados
  'joyo-zip-amp-r-04',            // brilho dos knobs cromados
];
// Foto com sobra que o recorte não tira (reflexo no chão, marca nos cantos): fica só a caixa
// [esquerda, topo, largura, altura] em frações da foto.
const CORTE = {
  'kokko-fcp2-compressor': [0, 0, 1, 0.79],   // reflexo do pedal no chão
  'yamaha-trbx174': [0.1, 0, 0.8, 1],         // traços azuis nos cantos da foto
};
const inteiras = new Set([...INTEIRAS, ...(arg('--inteira') ?? [])]);
const semBuracos = new Set([...SEM_BURACOS, ...(arg('--sem-buracos') ?? [])]);
// A og:image vem na prévia (-P, ~250 px); a versão -F tem até 1200 px e dá um contorno preciso.
const grande = (u) => u.replace(/-[A-Z]\.(webp|jpe?g|png)$/i, '-F.$1');
async function baixar(u) {
  const r = await fetch(u, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`foto ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}
// A foto original fica guardada em covers-src/photos/ml/ (fora do git) para refazer o recorte
// sem baixar de novo; --baixar força baixar outra vez (link ou foto do anúncio mudou).
const CACHE = 'covers-src/photos/ml';
fs.mkdirSync(CACHE, { recursive: true });
const relatorio = [];
for (const id of ids) {
  const p = ler(id);
  const r = { id, nome: p.nome };
  try {
    const cache = path.join(CACHE, `${id}.img`);
    const antigo = fs.existsSync(REL) ? JSON.parse(fs.readFileSync(REL, 'utf8')).find((x) => x.id === id && x.meli === p.meli) : null;
    if (antigo && fs.existsSync(cache) && !process.argv.includes('--baixar')) {
      Object.assign(r, { titulo: antigo.titulo, foto: antigo.foto });
    } else {
      const html = await (await fetch(p.meli, { headers: { 'User-Agent': UA } })).text();
      r.titulo = html.match(/<meta property="og:title" content="([^"]*)"/)?.[1];
      r.foto = html.match(/<meta property="og:image" content="([^"]*)"/)?.[1];
      if (!r.foto) throw new Error('página sem og:image');
      fs.writeFileSync(cache, await baixar(grande(r.foto)).catch(() => baixar(r.foto)));
    }
    r.meli = p.meli;
    let img = fs.readFileSync(cache);
    if (CORTE[id]) {
      const { width, height } = await sharp(img).metadata();
      const [l, t, w, h] = CORTE[id];
      img = await sharp(img).extract({ left: Math.round(width * l), top: Math.round(height * t), width: Math.round(width * w), height: Math.round(height * h) }).toBuffer();
    }
    const arquivo = `${OUT}/${id}.webp`;
    const { modo, fundoBranco, buracos } = await recortar(img, arquivo, 256, { inteira: inteiras.has(id), buracos: !semBuracos.has(id) });
    r.modo = modo;
    r.buracos = buracos;
    if (inteiras.has(id)) r.inteira = true;
    r.arquivo = arquivo.replace(/\\/g, '/').replace(/^/, 'public/').replace(/^public\/public\//, 'public/');
    r.fundoBranco = Math.round(fundoBranco * 100) / 100;
  } catch (e) {
    r.erro = e.message;
  }
  relatorio.push(r);
  console.log(`${r.erro ? 'ERRO ' + r.erro : `${r.modo} fundo ${r.fundoBranco} buracos ${r.buracos}`}\t${id}`);
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
  await sharp({ create: { width: COL * L, height: linhas * (L + 18), channels: 3, background: '#1c1c1c' } })
    .composite(camadas)
    .png()
    .toFile(`covers-src/_fotos-produtos-${g + 1}.png`);
}
console.log(`\n${ok.length} fotos recortadas, ${relatorio.length - ok.length} com erro. Confira as montagens covers-src/_fotos-produtos-N.png.`);

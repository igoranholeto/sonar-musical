// Versões 1:1 e 4:3 das capas, para o `image` do Article no JSON-LD. O Google recomenda
// mandar a imagem em 16:9, 4:3 e 1:1; no celular ele corta para uma miniatura quase
// quadrada, e cortar a capa 16:9 decepa o título. Então as versões extras são SEM TEXTO:
//   - capa full-bleed (.jpg com foto em covers-src/photos-fb/<slug>.img): recorte da foto
//     original com position 'attention', em 1:1 e 4:3. Antes confere se a foto em cache é
//     mesmo a da capa atual (correlação da faixa de cima, que o scrim quase não escurece).
//   - capa desenhada (.png do gen-covers): redesenha só o motivo, sem título, num quadrado.
//     Só 1:1; o motivo é estreito demais para um 4:3 bonito.
//   - o resto (sem foto em cache) fica só com a capa 16:9.
// Saída: public/images/blog/formatos/<slug>-1x1.webp e <slug>-4x3.webp. O PostLayout só
// lista no schema o que existir. Uso: node scripts/gen-capas-formatos.mjs [--force] [--montage] [slug...]
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { DEFS, M, POSTS } from './gen-covers.mjs';

const DESENHO = Object.fromEntries(POSTS.map((p) => [p.slug, p]));

const POSTS_DIR = 'src/data/blog';
const CAPAS = 'public/images/blog';
const OUT = path.join(CAPAS, 'formatos');
const CACHE = 'covers-src/photos-fb';
const args = process.argv.slice(2);
const force = args.includes('--force');
const montage = args.includes('--montage');
const soEstes = args.filter((a) => !a.startsWith('--'));
fs.mkdirSync(OUT, { recursive: true });

const capas = fs.readdirSync(POSTS_DIR)
  .filter((f) => /\.mdx?$/.test(f))
  .map((f) => fs.readFileSync(path.join(POSTS_DIR, f), 'utf8').match(/^image:\s*"?\/images\/blog\/([^"\s]+)\.(jpg|png)"?\s*$/m))
  .filter(Boolean)
  .map((m) => ({ slug: m[1], ext: m[2] }))
  .filter((c) => !soEstes.length || soEstes.includes(c.slug));

// Faixa de cima (linhas 7 a 15 de 36) em cinza 64x36: correlação de Pearson. A capa pode
// ter sido cortada com outro `position`, então a foto é testada em vários e vale o melhor.
const POSICOES = ['attention', 'centre', 'north', 'south', 'entropy'];
// Correlação baixa só pelo enquadramento (capa cortada fora dessas posições), mas a foto em
// cache é a mesma da capa: conferido lado a lado em 24/11/2026.
const CONFERIDAS = new Set([
  'baixo-yamaha-e-bom', 'bateria-voik-e-boa', 'casio-ct-x3000-ou-ct-x5000', 'guitarra-stratocaster-guia-completo',
  'melhor-amplificador-de-guitarra-ate-1000-reais', 'melhor-bateria-eletronica-ate-3000-reais', 'melhor-kit-violao-iniciante',
  'melhores-marcas-de-ukulele', 'violao-barato-e-bom', 'violao-strinberg-e-bom',
]);
const faixa = async (input, position = 'attention') => {
  const { data } = await sharp(input, { failOn: 'none' })
    .resize(64, 36, { fit: 'cover', position }).greyscale().raw().toBuffer({ resolveWithObject: true });
  return Array.from(data.subarray(7 * 64, 15 * 64));
};
const correl = (a, b) => {
  const n = a.length, ma = a.reduce((s, x) => s + x, 0) / n, mb = b.reduce((s, x) => s + x, 0) / n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) { num += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2; }
  return da && db ? num / Math.sqrt(da * db) : 0;
};

const webp = (img) => img.webp({ quality: 74, effort: 5 });
const feitos = [], pulados = [];
for (const { slug, ext } of capas) {
  const q = path.join(OUT, `${slug}-1x1.webp`);
  if (!force && fs.existsSync(q)) { feitos.push(slug); continue; }
  const capa = path.join(CAPAS, `${slug}.${ext}`);
  if (!fs.existsSync(capa)) { pulados.push(`${slug} (capa não existe)`); continue; }
  try {
    const cache = path.join(CACHE, `${slug}.img`);
    if (ext === 'jpg' && fs.existsSync(cache)) {
      const foto = fs.readFileSync(cache);
      const alvo = await faixa(fs.readFileSync(capa));
      let r = -1;
      for (const pos of POSICOES) r = Math.max(r, correl(await faixa(foto, pos), alvo));
      if (r < 0.75 && !CONFERIDAS.has(slug)) { pulados.push(`${slug} (foto em cache não bate com a capa, r=${r.toFixed(2)})`); continue; }
      await webp(sharp(foto, { failOn: 'none' }).resize(720, 720, { fit: 'cover', position: 'attention' })).toFile(q);
      await webp(sharp(foto, { failOn: 'none' }).resize(960, 720, { fit: 'cover', position: 'attention' })).toFile(path.join(OUT, `${slug}-4x3.webp`));
      feitos.push(slug);
    } else if (ext === 'png' && DESENHO[slug]) {
      // Redesenha só fundo + brilho + desenho (sem wordmark nem título), num quadrado
      // centrado no desenho, que no gen-covers fica em torno de (920, 345).
      const p = DESENHO[slug];
      const svg = `<svg viewBox="600 25 640 640" xmlns="http://www.w3.org/2000/svg"><defs>${DEFS}</defs>
        <rect x="0" y="0" width="1400" height="700" fill="url(#bg)"/>
        <circle cx="920" cy="345" r="340" fill="url(#glow)"/>${M[p.motif](p.opt || {})}</svg>`;
      await webp(sharp(Buffer.from(svg), { density: 150 }).resize(720, 720)).toFile(q);
      feitos.push(slug);
    } else {
      pulados.push(`${slug} (jpg sem foto em cache)`);
    }
  } catch (e) {
    pulados.push(`${slug} (${e.message})`);
  }
}

console.log(`${feitos.length} capas com formatos extras, ${pulados.length} só com 16:9.`);
for (const p of pulados) console.log('  - ' + p);

if (montage) {
  const lista = feitos.filter((s) => !soEstes.length || soEstes.includes(s));
  const t = 150, cols = 12;
  const tiles = await Promise.all(lista.map((s) => sharp(path.join(OUT, `${s}-1x1.webp`)).resize(t, t).png().toBuffer()));
  const rows = Math.ceil(tiles.length / cols);
  await sharp({ create: { width: cols * t, height: rows * t, channels: 3, background: '#000' } })
    .composite(tiles.map((input, i) => ({ input, left: (i % cols) * t, top: Math.floor(i / cols) * t })))
    .png().toFile('covers-src/_formatos_montage.png');
  console.log('montagem em covers-src/_formatos_montage.png');
}

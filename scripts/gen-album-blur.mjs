// Gera miniaturas minúsculas (32px, WebP) das capas de álbum para o fundo desfocado do
// banner em /bandas/<banda>/albuns/<album>/. O fundo leva blur(38px), então uma imagem
// de 32px fica visualmente idêntica à capa inteira e pesa ~1 KB. Bônus: imagem de baixa
// entropia não conta como candidata a LCP, que volta a ser a capa nítida do card.
//   /images/albuns/<x>.jpg  ->  /images/albuns/blur/<x>.webp
// Uso: node scripts/gen-album-blur.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'public/images/albuns';
const OUT = path.join(SRC, 'blur');
fs.mkdirSync(OUT, { recursive: true });

let n = 0;
for (const f of fs.readdirSync(SRC)) {
  if (!/\.(jpe?g|png|webp)$/i.test(f)) continue;
  const out = path.join(OUT, f.replace(/\.\w+$/, '.webp'));
  await sharp(fs.readFileSync(path.join(SRC, f))).resize(32).webp({ quality: 60 }).toFile(out);
  n++;
}
console.log(`${OUT}: ${n} miniaturas`);

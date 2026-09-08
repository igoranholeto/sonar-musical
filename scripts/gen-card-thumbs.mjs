// Gera variantes WebP menores (para miniaturas de card) das capas e das fotos de
// banda, evitando baixar a imagem full (1200px) para exibir num card de ~360-660px.
// PageSpeed apontava "Melhorar a entrega de imagens". Usado via helper cardImg().
//   /images/blog/<x>.(png|jpg)  ->  /images/blog/cards/<x>.webp   (800px)
//   /images/<x>.(webp|png|jpg)  ->  /images/cards/<x>.webp        (900px)
// Uso: node scripts/gen-card-thumbs.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

async function run(dir, outDir, width) {
  fs.mkdirSync(outDir, { recursive: true });
  const files = fs.readdirSync(dir).filter(
    (f) => /\.(png|jpe?g|webp)$/i.test(f) && fs.statSync(path.join(dir, f)).isFile()
  );
  let ok = 0, saved = 0;
  for (const f of files) {
    const src = path.join(dir, f);
    const out = path.join(outDir, f.replace(/\.(png|jpe?g|webp)$/i, '.webp'));
    try {
      await sharp(src).resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toFile(out);
      saved += (fs.statSync(src).size - fs.statSync(out).size) / 1024;
      ok++;
    } catch (e) { console.log('erro', f, e.message); }
  }
  console.log(`${outDir}: ${ok} thumbs, economia ~${Math.round(saved)}KB`);
}

await run('public/images/blog', 'public/images/blog/cards', 800); // capas de post
await run('public/images', 'public/images/cards', 900);            // fotos de banda

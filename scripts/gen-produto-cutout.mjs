// Recorta a foto de um produto (remove o fundo branco) para usar no AfiliadoCTA.
// Fonte: imagem que o usuário fornece (arquivo local ou URL do anúncio no Mercado Livre,
// que o afiliado tem direito de usar). NÃO usar foto de produto copyright de terceiros.
// Uso:
//   node scripts/gen-produto-cutout.mjs <slug> <arquivo-ou-URL>
//   ex: node scripts/gen-produto-cutout.mjs squier-bullet-stratocaster ./foto.webp
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import sharp from 'sharp';

const OUT = 'public/images/produtos';
fs.mkdirSync(OUT, { recursive: true });

const [slug, src] = process.argv.slice(2);
if (!slug || !src) {
  console.error('uso: node scripts/gen-produto-cutout.mjs <slug> <arquivo-ou-URL>');
  process.exit(1);
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const TMP = path.join('covers-src', 'photos', `_prod_${slug}`);

async function main() {
  let input = src;
  if (/^https?:\/\//.test(src)) {
    input = TMP;
    execSync(`curl -sL -A "${UA}" -o "${input}" "${src}"`, { stdio: 'ignore' });
  }

  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const mn = Math.min(r, g, b), mx = Math.max(r, g, b);
    if (mn > 238 && (mx - mn) < 12) data[i + 3] = 0;          // branco puro → transparente
    else if (mn > 222 && (mx - mn) < 20) data[i + 3] = 110;   // borda suave
  }

  // WebP com transparência: bem menor que PNG para fotos recortadas (~20-40kB).
  const out = path.join(OUT, `${slug}.webp`);
  await sharp(data, { raw: { width, height, channels } })
    .trim()
    .resize({ width: 420, height: 420, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 86, alphaQuality: 90 })
    .toFile(out);

  try { if (fs.existsSync(TMP)) fs.unlinkSync(TMP); } catch { /* temp em uso no Windows; ignora */ }
  const kb = Math.round(fs.statSync(out).size / 1024);
  const m = await sharp(out).metadata();
  console.log(`✓ ${out}  (${m.width}x${m.height}, ${kb}KB) — use no CTA: imagem="/images/produtos/${slug}.webp"`);
}

main().catch((e) => { console.error('erro:', e.message); process.exit(1); });

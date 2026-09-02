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
  const N = width * height;

  // Só remove o branco CONECTADO À BORDA (o fundo), via flood-fill.
  // Branco interno (telas, logos, botões claros) é preservado.
  const isWhite = (idx) => {
    const p = idx * channels;
    const r = data[p], g = data[p + 1], b = data[p + 2];
    const mn = Math.min(r, g, b), mx = Math.max(r, g, b);
    return mn > 228 && (mx - mn) < 24;
  };
  const visited = new Uint8Array(N);
  const stack = [];
  for (let x = 0; x < width; x++) { stack.push(x, (height - 1) * width + x); }
  for (let y = 0; y < height; y++) { stack.push(y * width, y * width + width - 1); }
  while (stack.length) {
    const idx = stack.pop();
    if (idx < 0 || idx >= N || visited[idx]) continue;
    visited[idx] = 1;
    if (!isWhite(idx)) continue;          // chegou na borda do produto → para
    data[idx * channels + 3] = 0;         // fundo → transparente
    const x = idx % width, y = (idx - x) / width;
    if (x > 0) stack.push(idx - 1);
    if (x < width - 1) stack.push(idx + 1);
    if (y > 0) stack.push(idx - width);
    if (y < height - 1) stack.push(idx + width);
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

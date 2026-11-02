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
import { recortar } from './lib/recorte.mjs';

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

  const out = path.join(OUT, `${slug}.webp`);
  await recortar(input, out);

  try { if (fs.existsSync(TMP)) fs.unlinkSync(TMP); } catch { /* temp em uso no Windows; ignora */ }
  const kb = Math.round(fs.statSync(out).size / 1024);
  const m = await sharp(out).metadata();
  console.log(`✓ ${out}  (${m.width}x${m.height}, ${kb}KB) — use no CTA: imagem="/images/produtos/${slug}.webp"`);
}

main().catch((e) => { console.error('erro:', e.message); process.exit(1); });

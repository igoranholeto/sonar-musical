// Recorte da foto de produto: tira o fundo branco ligado à borda e grava WebP com transparência.
// Usado por gen-produto-cutout.mjs (um produto) e fotos-produtos.mjs (catálogo inteiro).
import sharp from 'sharp';

/**
 * @param {string | Buffer} input arquivo ou buffer da imagem
 * @param {string} out caminho do .webp
 * @param {number} max lado maior da saída, em px
 * @param {{ limiar?: number }} [opcoes] limiar = canal mínimo para contar como branco (fundos
 *   off-white pedem um valor menor, ex.: 205)
 * @returns {Promise<{ fundoBranco: number, width: number, height: number }>}
 *   fundoBranco = fração da borda que era branca (perto de 1 = foto de catálogo com fundo
 *   branco; baixo = foto com cenário, que fica inteira: recortar só abriria buracos nela).
 */
export async function recortar(input, out, max = 420, { limiar = 228 } = {}) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const N = width * height;

  // Só remove o branco CONECTADO À BORDA (o fundo), via flood-fill.
  // Branco interno (telas, logos, botões claros) é preservado.
  const isWhite = (idx) => {
    const p = idx * channels;
    const r = data[p], g = data[p + 1], b = data[p + 2];
    const mn = Math.min(r, g, b), mx = Math.max(r, g, b);
    return mn > limiar && (mx - mn) < 24;
  };
  const borda = [];
  for (let x = 0; x < width; x++) borda.push(x, (height - 1) * width + x);
  for (let y = 0; y < height; y++) borda.push(y * width, y * width + width - 1);
  const fundoBranco = borda.filter(isWhite).length / borda.length;

  const visited = new Uint8Array(N);
  const stack = fundoBranco < 0.3 ? [] : [...borda];
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

  // WebP com transparência: bem menor que PNG para fotos recortadas.
  const r = await sharp(data, { raw: { width, height, channels } })
    .trim()
    .resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 86, alphaQuality: 90 })
    .toFile(out);
  return { fundoBranco, width: r.width, height: r.height };
}

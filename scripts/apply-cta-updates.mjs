// Aplica as atualizações do CSV preenchido (ctas-para-atualizar.csv) nos posts:
// baixa+recorta a foto do produto, injeta imagem/imagemAlt no AfiliadoCTA,
// atualiza preço (col F) e o link de afiliado (col J, para links expirados).
// Depois reescreve o CSV removendo as linhas já concluídas.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const CSV = 'C:/Users/igors/AppData/Local/Temp/claude/C--Users-igors-projetos-sonar-musical/78c0622e-285f-4ffb-b817-3c1a30fe3a73/scratchpad/ctas-para-atualizar.csv';
const OUT = 'public/images/produtos';
fs.mkdirSync(OUT, { recursive: true });

const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/['"]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const fmtPreco = (v) => {
  const n = String(v).replace(/[^\d]/g, '');
  if (!n) return null;
  return 'A partir de R$ ' + Number(n).toLocaleString('pt-BR');
};

async function cutout(url, outPath) {
  const buf = Buffer.from(await (await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })).arrayBuffer());
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info, N = width * height;
  const isW = (i) => { const p = i * channels, r = data[p], g = data[p + 1], b = data[p + 2], mn = Math.min(r, g, b), mx = Math.max(r, g, b); return mn > 228 && (mx - mn) < 24; };
  const vis = new Uint8Array(N), st = [];
  for (let x = 0; x < width; x++) st.push(x, (height - 1) * width + x);
  for (let y = 0; y < height; y++) st.push(y * width, y * width + width - 1);
  while (st.length) { const i = st.pop(); if (i < 0 || i >= N || vis[i]) continue; vis[i] = 1; if (!isW(i)) continue; data[i * channels + 3] = 0; const x = i % width, y = (i - x) / width; if (x > 0) st.push(i - 1); if (x < width - 1) st.push(i + 1); if (y > 0) st.push(i - width); if (y < height - 1) st.push(i + width); }
  await sharp(data, { raw: { width, height, channels } }).trim().resize({ width: 420, height: 420, fit: 'inside', withoutEnlargement: true }).webp({ quality: 86, alphaQuality: 90 }).toFile(outPath);
  return Math.round(fs.statSync(outPath).size / 1024);
}

// ── lê o CSV ──
let raw = fs.readFileSync(CSV, 'utf8').replace(/^\uFEFF/, '');
const lines = raw.replace(/\r/g, '').split('\n').filter((l) => l.length);
const rows = lines.map((l) => l.split(';').map((c) => c.replace(/^"|"$/g, '')));
const header = rows[0];

const imgCache = {};   // url -> webp path
const done = new Set(); // índices de linha concluídos
const report = [];

for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  const [num, , post, prod, , precoN, img, , , linkJ] = r;
  if (!img || !img.trim()) continue;              // só processa linhas com imagem preenchida

  const file = `src/data/blog/${post}.mdx`;
  if (!fs.existsSync(file)) { report.push(`#${num} ! post não existe: ${post}`); continue; }
  let t = fs.readFileSync(file, 'utf8');

  // localiza o bloco do AfiliadoCTA por produto exato
  const marker = `produto="${prod}"`;
  const at = t.indexOf(marker);
  if (at === -1) { report.push(`#${num} ! CTA não encontrado (${prod}) em ${post}`); continue; }
  const start = t.lastIndexOf('<AfiliadoCTA', at);
  const end = t.indexOf('/>', at) + 2;
  let block = t.slice(start, end);

  // 1) imagem (recorta se ainda não baixou essa URL)
  const imgSlug = slugify(prod);
  let webp = imgCache[img];
  if (!webp) {
    const outPath = path.join(OUT, `${imgSlug}.webp`);
    try { const kb = await cutout(img.trim(), outPath); webp = `/images/produtos/${imgSlug}.webp`; imgCache[img] = webp; report.push(`   foto ${imgSlug}.webp (${kb}KB)`); }
    catch (e) { report.push(`#${num} ! erro na foto (${prod}): ${e.message}`); continue; }
  }
  if (!/\bimagem="/.test(block)) {
    block = block.replace(marker, `${marker}\n  imagem="${webp}"\n  imagemAlt="${prod}"`);
  } else {
    block = block.replace(/imagem="[^"]*"/, `imagem="${webp}"`);
  }

  // 2) preço novo (col F)
  if (precoN && precoN.trim()) {
    const p = fmtPreco(precoN);
    if (p) block = block.replace(/preco="[^"]*"/, `preco="${p}"`);
  }

  // 3) link novo (col J) para afiliados expirados
  if (linkJ && linkJ.trim()) {
    block = block.replace(/url="[^"]*"/, `url="${linkJ.trim()}"`);
  }

  t = t.slice(0, start) + block + t.slice(end);
  fs.writeFileSync(file, t);
  done.add(i);
  report.push(`#${num} ✓ ${prod} (${post})`);
}

// ── reescreve o CSV só com as linhas NÃO concluídas ──
const kept = [header, ...rows.slice(1).filter((_, idx) => !done.has(idx + 1))];
const csvOut = '\uFEFF' + kept.map((r) => r.join(';')).join('\r\n') + '\r\n';
fs.writeFileSync(CSV, csvOut);

console.log(report.join('\n'));
console.log(`\nConcluídos: ${done.size} | Restantes no CSV: ${kept.length - 1}`);

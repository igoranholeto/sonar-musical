// Capas com FOTO real de guitarra (recortada, fundo transparente) no lugar do desenho.
// Fotos: Wikimedia Commons (CC BY-SA), atribuídas em src/data/creditos.ts (CREDITOS_CAPAS).
// Substitui apenas as capas .png de guitarra que hoje usam a ilustração vetorial.
// Uso: node scripts/gen-photo-covers.mjs [--montage]
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { DEFS, wordmark, textBlock, POSTS } from './gen-covers.mjs';

const OUT = 'public/images/blog';
const PHOTOS = 'covers-src/photos';

// Parâmetros por foto. default cobre as guitarras verticais; overrides p/ casos especiais.
const DEF = { angle: -22, targetH: 600, cx: 935, cy: 350 };
const P = {
  lespaul:       { angle: -16, targetH: 280, cx: 1010, cy: 345 }, // horizontal: menor e à direita p/ não invadir o texto
  flyingv_white: { angle: -20, targetH: 600, cx: 930, cy: 350 },
  jagstang:      { angle: -22, targetH: 590, cx: 935, cy: 350 },
  lp59:          { angle: -20, targetH: 600, cx: 930, cy: 350 },
};
const paramsFor = (photo) => ({ ...DEF, ...(P[photo] || {}) });

// slug do post -> foto (cada capa uma guitarra DIFERENTE; foto certa por modelo onde possível)
const MAP = {
  'guitarra-telecaster-guia-completo': 'tele',
  'guitarra-ibanez-guia-completo': 'ibanez_semi',
  'guitarra-semi-acustica-guia-completo': 'es335',
  'guitarra-flying-v-guia-completo': 'flyingv_white',
  'guitarra-yamaha-guia-completo': 'pacifica',
  'guitarra-strinberg-guia-completo': 'strat',
  'glossario-de-guitarra': 'moderne',
  'guitarra-giannini-vale-a-pena': 'casino',
  'guitarra-tagima-e-boa': 'jazzmaster',
  'guitarras-nacionais-baratas': 'jagstang',
  'melhores-marcas-de-guitarra-nacionais': 'starcaster',
  'melhores-presentes-para-guitarristas': 'lp59',
  'partes-da-guitarra-eletrica': 'ibanez_artist',
  'quanto-custa-ser-guitarrista-no-brasil': 'explorer',
  'quem-inventou-a-guitarra-eletrica': 'es350t',
  'tagima-vs-squier': 'jaguar',
  // guitarra-sg e guitarra-jackson: sem foto CC livre — mantêm a ilustração.
};

function baseSVG(p) {
  return `<svg viewBox="0 0 1200 675" xmlns="http://www.w3.org/2000/svg" role="img">
  <defs>${DEFS}</defs>
  <rect width="1200" height="675" fill="url(#bg)"/>
  <g opacity="0.03" stroke="#fff" stroke-width="1"><line x1="0" y1="150" x2="1200" y2="150"/><line x1="0" y1="300" x2="1200" y2="300"/><line x1="0" y1="450" x2="1200" y2="450"/><line x1="0" y1="600" x2="1200" y2="600"/></g>
  <circle cx="920" cy="345" r="340" fill="url(#glow)"/>
  ${wordmark()}
  ${textBlock(p)}
</svg>`;
}

async function build(slug, photo) {
  const p = POSTS.find((x) => x.slug === slug);
  if (!p) { console.log('! post não encontrado no gen-covers: ' + slug); return; }
  const cfg = paramsFor(photo);

  const base = await sharp(Buffer.from(baseSVG(p)), { density: 150 }).resize(1200, 675).png().toBuffer();

  let g = await sharp(path.join(PHOTOS, photo + '.png'))
    .resize({ height: cfg.targetH })
    .rotate(cfg.angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  let gm = await sharp(g).metadata();

  const maxW = 1180, maxH = 655;
  if (gm.width > maxW || gm.height > maxH) {
    const scale = Math.min(maxW / gm.width, maxH / gm.height);
    g = await sharp(g).resize({ width: Math.round(gm.width * scale) }).toBuffer();
    gm = await sharp(g).metadata();
  }

  let left = Math.round(cfg.cx - gm.width / 2);
  let top = Math.round(cfg.cy - gm.height / 2);
  left = Math.max(0, Math.min(left, 1200 - gm.width));
  top = Math.max(0, Math.min(top, 675 - gm.height));

  const out = path.join(OUT, `${slug}.png`);
  await sharp(base).composite([{ input: g, left, top }]).png({ compressionLevel: 9 }).toFile(out);
  const kb = Math.round(fs.statSync(out).size / 1024);
  console.log(`✓ ${slug}.png  (foto: ${photo}, ${kb}KB)`);
}

const results = [];
for (const [slug, photo] of Object.entries(MAP)) {
  await build(slug, photo);
  results.push(slug);
}

if (process.argv.includes('--montage')) {
  const cols = 4, tw = 320, th = 180;
  const rows = Math.ceil(results.length / cols);
  const thumbs = await Promise.all(results.map(async (s) => ({ input: await sharp(path.join(OUT, `${s}.png`)).resize(tw, th).png().toBuffer() })));
  const comps = thumbs.map((t, i) => ({ input: t.input, left: (i % cols) * tw, top: Math.floor(i / cols) * th }));
  await sharp({ create: { width: cols * tw, height: rows * th, channels: 3, background: '#000' } }).composite(comps).png().toFile('covers-src/_photo_montage.png');
  console.log(`\nMontagem: covers-src/_photo_montage.png (${results.length} capas)`);
}

console.log(`\n${results.length} capas com foto geradas.`);

// Gera pins verticais (1000x1500) para o Pinterest, reaproveitando os motivos
// e o estilo das capas. Uso: node scripts/gen-pins.mjs [--all]
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { DEFS, wordmark, M, POSTS } from './gen-covers.mjs';

const OUT = 'pins';
fs.mkdirSync(OUT, { recursive: true });
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fit = (t, maxW, cap = 108) => Math.min(cap, Math.floor(maxW / (0.6 * Math.max((t || '').length, 1))));

// Posts principais (pilares + alto valor). --all gera todos.
const MAIN = new Set([
  'melhores-captadores-de-guitarra-2026', 'melhor-amplificador-de-guitarra-2026', 'guitarra-les-paul-guia-completo',
  'guitarra-stratocaster-guia-completo', 'teoria-musical-para-guitarra', 'glossario-de-guitarra',
  'afinacoes-de-guitarra', 'acordes-de-guitarra-para-iniciantes', 'como-tocar-violao-para-iniciantes',
  'melhores-guitarras-eletricas-para-iniciantes-2026', 'escala-pentatonica-de-guitarra', 'melhores-marcas-de-guitarra-nacionais',
  'guitarra-tagima-e-boa', 'melhores-presentes-para-guitarristas', 'tecnicas-de-guitarra', 'partes-da-guitarra-eletrica',
  'como-ler-cifra-de-guitarra', 'quanto-custa-ser-guitarrista-no-brasil', 'melhor-pedaleira-de-guitarra-2026',
  'melhores-cordas-de-guitarra-2026', 'melhores-violoes-2026', 'como-afinar-guitarra-guia-completo',
]);

function buildPin(p) {
  const motif = M[p.motif](p.opt || {});
  const s1 = fit(p.l1, 900), s2 = fit(p.l2, 900);
  return `<svg viewBox="0 0 1000 1500" xmlns="http://www.w3.org/2000/svg" role="img">
  <defs>${DEFS}</defs>
  <rect width="1000" height="1500" fill="url(#bg)"/>
  <g opacity="0.03" stroke="#fff" stroke-width="1">${Array.from({ length: 9 }, (_, i) => `<line x1="0" y1="${150 + i * 150}" x2="1000" y2="${150 + i * 150}"/>`).join('')}</g>
  <circle cx="500" cy="470" r="430" fill="url(#glow)"/>

  <!-- wordmark centralizado no topo -->
  <g transform="translate(300,44)">${wordmark()}</g>

  <!-- motivo (reposicionado e ampliado) -->
  <g transform="translate(500,470) scale(1.24) translate(-920,-350)">${motif}</g>

  <!-- bloco de texto (centralizado, terço inferior) -->
  <rect x="470" y="948" width="60" height="6" rx="3" fill="#e63946"/>
  <text x="500" y="1010" text-anchor="middle" font-family="'Helvetica Neue',Helvetica,Arial,sans-serif" font-size="28" font-weight="700" letter-spacing="6" fill="#c9c4bd">${esc(p.kicker)}</text>
  <g font-family="'Helvetica Neue',Helvetica,Arial,sans-serif" font-weight="800" text-anchor="middle" letter-spacing="0.5">
    <text x="500" y="1130" font-size="${s1}" fill="#f4f4f5">${esc(p.l1)}</text>
    ${p.l2 ? `<text x="500" y="${1130 + s2 + 20}" font-size="${s2}" fill="#e63946">${esc(p.l2)}</text>` : ''}
  </g>
  ${p.sub ? `<text x="500" y="${p.l2 ? 1130 + s2 + 78 : 1210}" text-anchor="middle" font-family="'Helvetica Neue',Helvetica,Arial,sans-serif" font-size="30" font-weight="500" fill="#9a958d">${esc(p.sub)}</text>` : ''}

  <!-- barra CTA no rodapé -->
  <rect x="0" y="1420" width="1000" height="80" fill="#e63946"/>
  <text x="500" y="1470" text-anchor="middle" font-family="'Helvetica Neue',Helvetica,Arial,sans-serif" font-size="30" font-weight="700" letter-spacing="1" fill="#fff">Leia o guia completo · sonarmusical.com.br</text>
</svg>`;
}

const all = process.argv.includes('--all');
const list = POSTS.filter((p) => all || MAIN.has(p.slug));
const done = [];
for (const p of list) {
  const svg = buildPin(p);
  const file = path.join(OUT, `${p.slug}.png`);
  await sharp(Buffer.from(svg), { density: 150 }).resize(1000, 1500).png({ compressionLevel: 9 }).toFile(file);
  done.push(p.slug);
  process.stdout.write('.');
}
// montagem de contato
const cols = 5, tw = 200, th = 300;
const rows = Math.ceil(done.length / cols);
const thumbs = await Promise.all(done.map((s) => sharp(path.join(OUT, `${s}.png`)).resize(tw, th).toBuffer()));
await sharp({ create: { width: cols * tw, height: rows * th, channels: 3, background: '#000' } })
  .composite(thumbs.map((b, i) => ({ input: b, left: (i % cols) * tw, top: Math.floor(i / cols) * th })))
  .jpeg({ quality: 82 }).toFile(path.join(OUT, '_montage.jpg'));
console.log(`\n${done.length} pins gerados em ${OUT}/ + _montage.jpg`);

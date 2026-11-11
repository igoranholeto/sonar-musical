// Gera as imagens usadas nos e-mails da newsletter (Brevo).
// E-mail não carrega SVG, WebP nem fonte da web com segurança, então tudo vira
// PNG/JPG com fundo próprio: o cabeçalho fica igual no modo claro e no escuro.
//
// Uso: node scripts/gen-email-logo.mjs
// Saída em public/images/email/:
//   cabecalho.png          1200x240, exibido a 600x120
//   icone-<nome>.png       ícones 112x112 dos benefícios, exibidos a 56x56
//   guias/<slug>.jpg       capas dos guias em 560x315, exibidas a ~250 px
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { GUIAS_BOAS_VINDAS } from './lib/emails.mjs';

const OUT = 'public/images/email';
mkdirSync(`${OUT}/guias`, { recursive: true });

const FONTE = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const VERMELHO = '#e63946';

// Mesmo ícone do cabeçalho do site (nota musical dentro do quadrado vermelho).
const icone = (x, y, s) => `
  <g transform="translate(${x},${y}) scale(${s})">
    <rect width="34" height="34" rx="9" fill="${VERMELHO}"/>
    <g transform="translate(6,6) scale(0.92)" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 18V5l12-2v13"/>
      <circle cx="6" cy="18" r="3" fill="#fff" stroke="none"/>
      <circle cx="18" cy="16" r="3" fill="#fff" stroke="none"/>
    </g>
  </g>`;

const cabecalho = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="240" viewBox="0 0 1200 240">
  <rect width="1200" height="240" fill="#141416"/>
  <rect y="234" width="1200" height="6" fill="${VERMELHO}"/>
  <g transform="translate(330,72)">
    ${icone(0, 0, 2.8)}
    <text x="122" y="70" font-family="${FONTE}" font-size="66" font-weight="700" letter-spacing="0.5" fill="#f4f4f5">Sonar<tspan fill="${VERMELHO}">Musical</tspan></text>
  </g>
</svg>`;
await sharp(Buffer.from(cabecalho)).png({ compressionLevel: 9, palette: true }).toFile(`${OUT}/cabecalho.png`);
console.log(`${OUT}/cabecalho.png`);

// Ícones dos benefícios (traços no estilo Lucide), branco sobre círculo vermelho.
const ICONES = {
  preco: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r="1.2" fill="#fff"/>',
  presente: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
  email: '<path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><path d="m16 19 2 2 4-4"/>',
};
for (const [nome, paths] of Object.entries(ICONES)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="112" height="112" viewBox="0 0 112 112">
  <circle cx="56" cy="56" r="56" fill="#fdecee"/>
  <g transform="translate(32,32) scale(2)" fill="none" stroke="${VERMELHO}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths.replace(/fill="#fff"/g, `fill="${VERMELHO}"`)}</g>
</svg>`;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(`${OUT}/icone-${nome}.png`);
  console.log(`${OUT}/icone-${nome}.png`);
}

// Capas dos guias recomendados no e-mail de boas-vindas (JPG: Outlook não lê WebP).
for (const g of GUIAS_BOAS_VINDAS) {
  const slug = g.href.split('/').filter(Boolean).pop();
  await sharp(`public/images/blog/${slug}.jpg`)
    .resize(560, 315, { fit: 'cover' })
    .jpeg({ quality: 78, mozjpeg: true })
    .toFile(`${OUT}/guias/${slug}.jpg`);
  console.log(`${OUT}/guias/${slug}.jpg`);
}

// Imagem de compartilhamento padrão (og:image do BaseLayout) para páginas sem capa própria:
// home, ferramentas, afinador, acordes etc. Arte original em SVG -> JPG 1200x630 com sharp.
// Uso: node scripts/gen-og-default.mjs
import sharp from 'sharp';

const W = 1200;
const H = 630;
const FONTE = "'Helvetica Neue',Helvetica,Arial,sans-serif";

// Ondas de som estilizadas (barras de equalizador) no canto direito.
const barras = Array.from({ length: 14 }, (_, i) => {
  const h = 30 + Math.round(110 * Math.abs(Math.sin(i * 0.62)) + 40 * Math.abs(Math.sin(i * 1.7)));
  const x = 900 + i * 17;
  return `<rect x="${x}" y="${200 - h / 2}" width="10" height="${h}" rx="5" fill="#e63946" fill-opacity="${0.35 + 0.6 * (i / 14)}"/>`;
}).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="a" cx="15%" cy="10%" r="60%"><stop offset="0" stop-color="#e63946" stop-opacity=".45"/><stop offset="1" stop-color="#e63946" stop-opacity="0"/></radialGradient>
    <radialGradient id="b" cx="95%" cy="95%" r="55%"><stop offset="0" stop-color="#7c3aed" stop-opacity=".35"/><stop offset="1" stop-color="#7c3aed" stop-opacity="0"/></radialGradient>
    <pattern id="grade" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0V36" fill="none" stroke="#fff" stroke-opacity=".05"/></pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="#0b0b0d"/>
  <rect width="${W}" height="${H}" fill="url(#grade)"/>
  <rect width="${W}" height="${H}" fill="url(#a)"/>
  <rect width="${W}" height="${H}" fill="url(#b)"/>
  ${barras}

  <g transform="translate(72 80)">
    <rect width="48" height="48" rx="11" fill="#e63946"/>
    <path d="M14 9v13.5a3.5 3.5 0 1 1-2-3.2V11l10-2v10.5a3.5 3.5 0 1 1-2-3.2V9.2z" fill="#fff" transform="translate(5 7) scale(1.25)"/>
    <text x="64" y="36" font-family="${FONTE}" font-size="38" font-weight="800" fill="#f4f4f5">Sonar<tspan fill="#e63946">Musical</tspan></text>
  </g>

  <text x="72" y="270" font-family="${FONTE}" font-size="64" font-weight="900" letter-spacing="-1.5" fill="#fff">Guias de compra de</text>
  <text x="72" y="345" font-family="${FONTE}" font-size="64" font-weight="900" letter-spacing="-1.5" fill="#fff">instrumentos musicais</text>
  <text x="72" y="420" font-family="${FONTE}" font-size="28" font-weight="500" fill="#d4d4d8">Análises honestas e preço real de violão, guitarra,</text>
  <text x="72" y="458" font-family="${FONTE}" font-size="28" font-weight="500" fill="#d4d4d8">teclado, bateria e mais</text>

  <g font-family="${FONTE}" font-size="22" font-weight="700" fill="#fca5a5" letter-spacing="3">
    <text x="72" y="560">AFINADOR  ✦  METRÔNOMO  ✦  ACORDES  ✦  GUIAS</text>
  </g>
  <text x="${W - 72}" y="560" text-anchor="end" font-family="${FONTE}" font-size="22" font-weight="600" fill="#a1a1aa">sonarmusical.com.br</text>
</svg>`;

await sharp(Buffer.from(svg)).jpeg({ quality: 86, mozjpeg: true }).toFile('public/og-default.jpg');
console.log('public/og-default.jpg');

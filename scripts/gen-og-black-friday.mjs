// Imagem de compartilhamento (og:image) da página /black-friday/: arte original em SVG
// convertida para JPG 1200x630 com sharp. Uso: node scripts/gen-og-black-friday.mjs
import fs from 'node:fs';
import sharp from 'sharp';

const W = 1200;
const H = 630;
const FONTE = "'Helvetica Neue',Helvetica,Arial,sans-serif";

// Faixa diagonal com o texto repetido (mesma ideia da faixa do placar da página).
const faixa = Array.from({ length: 6 }, () => 'BLACK FRIDAY 2026  ✦  ').join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="a" cx="18%" cy="12%" r="55%"><stop offset="0" stop-color="#e63946" stop-opacity=".75"/><stop offset="1" stop-color="#e63946" stop-opacity="0"/></radialGradient>
    <radialGradient id="b" cx="92%" cy="95%" r="55%"><stop offset="0" stop-color="#f59e0b" stop-opacity=".55"/><stop offset="1" stop-color="#f59e0b" stop-opacity="0"/></radialGradient>
    <radialGradient id="c" cx="62%" cy="35%" r="35%"><stop offset="0" stop-color="#7c3aed" stop-opacity=".35"/><stop offset="1" stop-color="#7c3aed" stop-opacity="0"/></radialGradient>
    <linearGradient id="txt" x1="0" x2="1"><stop offset="0" stop-color="#fde047"/><stop offset=".55" stop-color="#fff"/><stop offset="1" stop-color="#f97316"/></linearGradient>
    <pattern id="grade" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0V36" fill="none" stroke="#fff" stroke-opacity=".05"/></pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="#0b0b0d"/>
  <rect width="${W}" height="${H}" fill="url(#grade)"/>
  <rect width="${W}" height="${H}" fill="url(#a)"/>
  <rect width="${W}" height="${H}" fill="url(#b)"/>
  <rect width="${W}" height="${H}" fill="url(#c)"/>

  <g transform="translate(72 70)">
    <rect width="34" height="34" rx="8" fill="#e63946"/>
    <path d="M14 9v13.5a3.5 3.5 0 1 1-2-3.2V11l10-2v10.5a3.5 3.5 0 1 1-2-3.2V9.2z" fill="#fff" transform="translate(-1 1)"/>
    <text x="46" y="26" font-family="${FONTE}" font-size="26" font-weight="700" fill="#f4f4f5">Sonar<tspan fill="#e63946">Musical</tspan></text>
  </g>

  <text x="72" y="190" font-family="${FONTE}" font-size="26" font-weight="800" letter-spacing="6" fill="#fca5a5">SEXTA, 27 DE NOVEMBRO</text>
  <text x="66" y="318" font-family="${FONTE}" font-size="132" font-weight="900" letter-spacing="-4" fill="url(#txt)">BLACK FRIDAY</text>
  <text x="72" y="392" font-family="${FONTE}" font-size="44" font-weight="800" fill="#fff">Instrumentos musicais: as ofertas de hoje</text>
  <text x="72" y="444" font-family="${FONTE}" font-size="28" font-weight="500" fill="#d4d4d8">Preço riscado, % de desconto e histórico de preço de cada produto</text>

  <g transform="translate(600 560) rotate(-2.5)">
    <rect x="-700" y="-30" width="1400" height="60" fill="#e63946"/>
    <text x="-680" y="11" font-family="${FONTE}" font-size="26" font-weight="900" letter-spacing="6" fill="#fff">${faixa}</text>
  </g>
</svg>`;

fs.mkdirSync('public/images/og', { recursive: true });
await sharp(Buffer.from(svg)).jpeg({ quality: 86, mozjpeg: true }).toFile('public/images/og/black-friday.jpg');
console.log('public/images/og/black-friday.jpg');

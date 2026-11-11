// Gera as imagens da marca usadas nos e-mails da newsletter (Brevo).
// E-mail não carrega SVG nem fonte da web com segurança, então tudo vira PNG
// com fundo próprio: o cabeçalho fica igual no modo claro e no escuro do Gmail.
//
// Uso: node scripts/gen-email-logo.mjs
// Saída: public/images/email/cabecalho.png (1200x240, exibido a 600x120)
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const OUT = 'public/images/email';
mkdirSync(OUT, { recursive: true });

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

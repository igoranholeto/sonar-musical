// Gerador de capas (hero/og) do blog Sonar Musical.
// Arte vetorial original no estilo da marca → rasterizada em PNG 1200x675 via sharp.
// Uso: node scripts/gen-covers.mjs [--montage]
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const OUT = 'public/images/blog';
fs.mkdirSync(OUT, { recursive: true });

// ---------- helpers de texto ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// largura estimada de caixa-alta Helvetica bold
const fitSize = (text, maxW, cap = 94) => Math.min(cap, Math.floor(maxW / (0.62 * Math.max(text.length, 1))));

// ---------- defs compartilhados ----------
const DEFS = `
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#141416"/><stop offset="0.6" stop-color="#0e0e10"/><stop offset="1" stop-color="#090909"/>
  </linearGradient>
  <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#e63946" stop-opacity="0.32"/><stop offset="0.55" stop-color="#b8202d" stop-opacity="0.12"/><stop offset="1" stop-color="#090909" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#f2f2f4"/><stop offset="0.5" stop-color="#b9b9c0"/><stop offset="1" stop-color="#75757e"/>
  </linearGradient>
  <linearGradient id="cream" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#efe9dd"/><stop offset="1" stop-color="#d7cdba"/>
  </linearGradient>
  <linearGradient id="black" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#26222a"/><stop offset="1" stop-color="#151318"/>
  </linearGradient>
  <radialGradient id="pole" cx="0.35" cy="0.3" r="0.8">
    <stop offset="0" stop-color="#e8e8ec"/><stop offset="0.6" stop-color="#a9a9b1"/><stop offset="1" stop-color="#6c6c74"/>
  </radialGradient>
  <linearGradient id="wood" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#c9a06a"/><stop offset="1" stop-color="#9a6f3c"/>
  </linearGradient>`;

const wordmark = () => `
  <g transform="translate(80,46)">
    <rect x="0" y="0" width="34" height="34" rx="9" fill="#e63946"/>
    <g transform="translate(6,6) scale(0.92)" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3" fill="#fff" stroke="none"/><circle cx="18" cy="16" r="3" fill="#fff" stroke="none"/>
    </g>
    <text x="46" y="24" font-family="'Helvetica Neue',Helvetica,Arial,sans-serif" font-size="22" font-weight="700" letter-spacing="0.3" fill="#f4f4f5">Sonar<tspan fill="#e63946">Musical</tspan></text>
  </g>`;

const textBlock = ({ kicker, l1, l2, sub }) => {
  const s1 = fitSize(l1, 600), s2 = fitSize(l2, 600);
  return `
  <text x="84" y="250" font-family="'Helvetica Neue',Helvetica,Arial,sans-serif" font-size="24" font-weight="700" letter-spacing="7" fill="#c9c4bd">${esc(kicker)}</text>
  <g font-family="'Helvetica Neue',Helvetica,Arial,sans-serif" font-weight="700" letter-spacing="1">
    <text x="80" y="${l2 ? 348 : 388}" font-size="${s1}" fill="#f4f4f5">${esc(l1)}</text>
    ${l2 ? `<text x="80" y="440" font-size="${s2}" fill="#e63946">${esc(l2)}</text>` : ''}
  </g>
  ${sub ? `<text x="84" y="${l2 ? 498 : 452}" font-family="'Helvetica Neue',Helvetica,Arial,sans-serif" font-size="26" font-weight="500" letter-spacing="1" fill="#9a958d">${esc(sub)}</text>` : ''}`;
};

// ---------- motivos (desenhados ao redor de 0,0; colocados à direita) ----------
const M = {};

// GUITARRA elétrica (silhueta strat), acabamento parametrizável
M.guitar = ({ body = '#b5202d', guard = '#e9e4da' } = {}) => `
  <g transform="translate(905,350) rotate(-27) scale(0.92)">
    <rect x="120" y="-18" width="326" height="36" rx="4" fill="#232025" stroke="#e9e4da" stroke-opacity="0.4" stroke-width="1.2"/>
    <g stroke="#54505a" stroke-width="1.8">
      <line x1="170" y1="-18" x2="170" y2="18"/><line x1="214" y1="-18" x2="214" y2="18"/><line x1="258" y1="-18" x2="258" y2="18"/><line x1="302" y1="-18" x2="302" y2="18"/><line x1="346" y1="-18" x2="346" y2="18"/><line x1="390" y1="-18" x2="390" y2="18"/>
    </g>
    <path d="M446,-21 L512,-29 Q528,-25 528,-11 L524,17 Q516,27 496,23 L446,19 Z" fill="#1b181d"/>
    <g fill="#e9e4da"><circle cx="466" cy="-15" r="3.6"/><circle cx="488" cy="-18" r="3.6"/><circle cx="510" cy="-21" r="3.6"/><circle cx="466" cy="13" r="3.6"/><circle cx="488" cy="14" r="3.6"/><circle cx="510" cy="11" r="3.6"/></g>
    <path d="M-58,-112 C22,-114 44,-74 98,-68 C122,-64 132,-42 132,-18 L132,18 C132,42 122,64 98,68 C44,74 22,114 -58,112 C-132,110 -156,52 -156,0 C-156,-52 -132,-110 -58,-112 Z" fill="${body}"/>
    <path d="M-64,-74 C-4,-82 34,-42 44,8 C50,44 22,72 -30,74 C-104,77 -132,26 -122,-24 C-116,-54 -104,-68 -64,-74 Z" fill="${guard}" opacity="0.92"/>
    <g fill="#1a1418"><rect x="-24" y="-34" width="12" height="46" rx="3" transform="rotate(-16 -18 -11)"/><rect x="-52" y="-22" width="12" height="46" rx="3" transform="rotate(-16 -46 1)"/><rect x="-80" y="-10" width="12" height="46" rx="3" transform="rotate(-16 -74 13)"/></g>
    <rect x="22" y="-30" width="20" height="60" rx="3" fill="#3a343d" transform="rotate(-16 32 0)"/>
    <g fill="#1a1418"><circle cx="-96" cy="44" r="8"/><circle cx="-72" cy="54" r="8"/><circle cx="-48" cy="64" r="8"/></g>
    <g stroke="#6f6b60" stroke-width="1.3" opacity="0.85"><line x1="30" y1="-13" x2="446" y2="-13"/><line x1="30" y1="-8" x2="446" y2="-8"/><line x1="30" y1="-3" x2="446" y2="-3"/><line x1="30" y1="2" x2="446" y2="2"/><line x1="30" y1="7" x2="446" y2="7"/><line x1="30" y1="12" x2="446" y2="12"/></g>
  </g>`;

// GUITARRA Les Paul (single cutaway)
M.guitarLP = ({ body = '#c9a03a', guard = '#241a10' } = {}) => `
  <g transform="translate(905,350) rotate(-27) scale(0.92)">
    <rect x="118" y="-17" width="330" height="34" rx="4" fill="#3a2416"/>
    <g stroke="#5a4632" stroke-width="1.7"><line x1="168" y1="-17" x2="168" y2="17"/><line x1="212" y1="-17" x2="212" y2="17"/><line x1="256" y1="-17" x2="256" y2="17"/><line x1="300" y1="-17" x2="300" y2="17"/><line x1="344" y1="-17" x2="344" y2="17"/><line x1="388" y1="-17" x2="388" y2="17"/></g>
    <path d="M448,-22 L516,-30 Q532,-25 532,-9 L528,19 Q520,29 500,24 L448,18 Z" fill="#1b120b"/>
    <g fill="#e9e4da"><circle cx="470" cy="-16" r="3.4"/><circle cx="492" cy="-19" r="3.4"/><circle cx="512" cy="-22" r="3.4"/><circle cx="470" cy="12" r="3.4"/><circle cx="492" cy="13" r="3.4"/><circle cx="512" cy="10" r="3.4"/></g>
    <!-- corpo single-cut -->
    <path d="M118,-28 C124,-70 104,-96 60,-100 C24,-103 8,-92 -20,-98 C-88,-112 -150,-84 -162,-24 C-172,26 -156,74 -108,102 C-56,128 26,126 82,98 C120,79 124,34 118,-28 Z" fill="${body}"/>
    <path d="M118,-28 C124,-70 104,-96 60,-100 C24,-103 8,-92 -20,-98 C-88,-112 -150,-84 -162,-24 C-172,26 -156,74 -108,102 C-56,128 26,126 82,98 C120,79 124,34 118,-28 Z" fill="none" stroke="#f0e6c0" stroke-width="2" opacity="0.35"/>
    <!-- cutaway -->
    <path d="M96,-96 C120,-92 128,-70 126,-44 L106,-50 C106,-72 102,-86 86,-94 Z" fill="#0e0e10" opacity="0.55"/>
    <!-- humbuckers -->
    <g><rect x="-58" y="-30" width="52" height="24" rx="4" fill="${guard}"/><rect x="-92" y="4" width="52" height="24" rx="4" fill="${guard}"/></g>
    <g fill="#d8d8dc"><rect x="4" y="-28" width="14" height="58" rx="3"/><rect x="24" y="-24" width="10" height="50" rx="3"/></g>
    <g fill="#1a1418"><circle cx="-96" cy="52" r="8"/><circle cx="-72" cy="62" r="8"/><circle cx="-48" cy="72" r="8"/><circle cx="-24" cy="80" r="8"/></g>
    <g stroke="#6f6b60" stroke-width="1.2" opacity="0.8"><line x1="30" y1="-11" x2="448" y2="-11"/><line x1="30" y1="-6" x2="448" y2="-6"/><line x1="30" y1="-1" x2="448" y2="-1"/><line x1="30" y1="4" x2="448" y2="4"/><line x1="30" y1="9" x2="448" y2="9"/></g>
  </g>`;

// VIOLÃO (acústico) — corpo em figura-8 (dois bojos sobrepostos)
M.acoustic = () => `
  <g transform="translate(900,350) rotate(-22) scale(0.98)">
    <rect x="120" y="-13" width="320" height="26" rx="4" fill="#3a2a18"/>
    <path d="M440,-17 L505,-25 Q520,-19 518,-5 L514,17 Q506,26 488,21 L440,15 Z" fill="#241a10"/>
    <g stroke="#5a4632" stroke-width="1.6"><line x1="180" y1="-13" x2="180" y2="13"/><line x1="230" y1="-13" x2="230" y2="13"/><line x1="280" y1="-13" x2="280" y2="13"/><line x1="330" y1="-13" x2="330" y2="13"/></g>
    <ellipse cx="-72" cy="0" rx="98" ry="116" fill="url(#wood)"/>
    <ellipse cx="66" cy="0" rx="74" ry="86" fill="url(#wood)"/>
    <ellipse cx="-72" cy="0" rx="98" ry="116" fill="none" stroke="#5a3d1f" stroke-width="2" opacity="0.5"/>
    <circle cx="24" cy="0" r="30" fill="#160f08"/>
    <circle cx="24" cy="0" r="30" fill="none" stroke="#c9a06a" stroke-width="3" opacity="0.7"/>
    <rect x="-64" y="46" width="70" height="16" rx="3" fill="#2a1c10"/>
    <g stroke="#efe9dd" stroke-width="1.1" opacity="0.7"><line x1="-30" y1="-6" x2="440" y2="-6"/><line x1="-30" y1="-2" x2="440" y2="-2"/><line x1="-30" y1="2" x2="440" y2="2"/><line x1="-30" y1="6" x2="440" y2="6"/></g>
  </g>`;

// AMPLIFICADOR (combo)
M.amp = ({ tone = '#1b1b1e' } = {}) => `
  <g transform="translate(925,345)">
    <ellipse cx="0" cy="180" rx="180" ry="22" fill="#000" opacity="0.35"/>
    <rect x="-165" y="-160" width="330" height="330" rx="16" fill="${tone}" stroke="#000" stroke-opacity="0.4" stroke-width="2"/>
    <rect x="-150" y="-108" width="300" height="230" rx="8" fill="#0d0d0f"/>
    <g opacity="0.5" stroke="#2a2a2e" stroke-width="2">
      ${Array.from({ length: 12 }, (_, i) => `<line x1="${-150 + i * 26}" y1="-108" x2="${-150 + i * 26}" y2="122"/>`).join('')}
      ${Array.from({ length: 9 }, (_, i) => `<line x1="-150" y1="${-108 + i * 26}" x2="150" y2="${-108 + i * 26}"/>`).join('')}
    </g>
    <rect x="-165" y="-160" width="330" height="46" rx="12" fill="#0c0c0e"/>
    <g fill="url(#chrome)" stroke="#4a4a50" stroke-width="1.2">
      ${[-120, -78, -36, 6, 48, 90, 132].map((x) => `<circle cx="${x}" cy="-137" r="12"/>`).join('')}
    </g>
    <g stroke="#1a1a1e" stroke-width="2.4" stroke-linecap="round">
      ${[-120, -78, -36, 6, 48, 90, 132].map((x, i) => { const a = -0.9 + i * 0.28; return `<line x1="${x}" y1="-137" x2="${(x + Math.sin(a) * 9).toFixed(1)}" y2="${(-137 - Math.cos(a) * 9).toFixed(1)}"/>`; }).join('')}
    </g>
    <circle cx="150" cy="152" r="5" fill="#e63946"/>
    <rect x="-40" y="150" width="80" height="14" rx="4" fill="#2a2a2e"/>
  </g>`;

// PEDAL (stompbox)
M.pedal = ({ tone = '#c62432' } = {}) => `
  <g transform="translate(925,345)">
    <ellipse cx="0" cy="185" rx="130" ry="18" fill="#000" opacity="0.35"/>
    <rect x="-118" y="-170" width="236" height="350" rx="18" fill="${tone}" stroke="#000" stroke-opacity="0.35" stroke-width="2"/>
    <rect x="-100" y="-150" width="200" height="120" rx="8" fill="#0e0e10" opacity="0.85"/>
    <g fill="url(#chrome)" stroke="#3a3a40" stroke-width="1.5"><circle cx="-58" cy="-90" r="26"/><circle cx="0" cy="-90" r="26"/><circle cx="58" cy="-90" r="26"/></g>
    <g stroke="#1a1a1e" stroke-width="3" stroke-linecap="round"><line x1="-58" y1="-90" x2="-58" y2="-112"/><line x1="0" y1="-90" x2="14" y2="-108"/><line x1="58" y1="-90" x2="72" y2="-100"/></g>
    <rect x="-70" y="10" width="140" height="40" rx="6" fill="#0e0e10"/>
    <circle cx="0" cy="118" r="40" fill="#d8d8dc" stroke="#8a8a90" stroke-width="4"/>
    <circle cx="0" cy="118" r="24" fill="#b8b8be"/>
  </g>`;

// CAPTADORES (single + humbucker + P90)
M.pickups = () => `
  <g transform="translate(792,352) rotate(-9)">${singleCoil()}</g>
  <g transform="translate(935,330) scale(1.12)">${humbucker()}</g>
  <g transform="translate(1088,360) rotate(9)">${p90()}</g>
  <g font-family="'Helvetica Neue',Helvetica,Arial,sans-serif" font-size="18" font-weight="600" fill="#c9c4bd" text-anchor="middle">
    <text x="788" y="522">Single coil</text><text x="935" y="548">Humbucker</text><text x="1090" y="522">P90</text>
  </g>`;
function singleCoil() { return `<ellipse cx="0" cy="118" rx="44" ry="14" fill="#000" opacity="0.35"/><rect x="-30" y="-108" width="60" height="216" rx="16" fill="url(#cream)" stroke="#b9ad97" stroke-width="1.5"/><g fill="url(#pole)" stroke="#7a7a82" stroke-width="0.8">${[-80,-48,-16,16,48,80].map(y=>`<circle cx="0" cy="${y}" r="7"/>`).join('')}</g>`; }
function humbucker() { return `<ellipse cx="0" cy="122" rx="78" ry="16" fill="#000" opacity="0.4"/><rect x="-72" y="-112" width="144" height="224" rx="14" fill="url(#chrome)" stroke="#5c5c63" stroke-width="1.5"/><rect x="-62" y="-102" width="124" height="204" rx="10" fill="url(#black)"/><line x1="0" y1="-100" x2="0" y2="100" stroke="#0c0a0e" stroke-width="3"/><g fill="url(#pole)" stroke="#6f6f77" stroke-width="0.8">${[-78,-47,-16,15,46,77].map(y=>`<circle cx="-32" cy="${y}" r="8"/><circle cx="32" cy="${y}" r="8"/>`).join('')}</g><g stroke="#3a3a40" stroke-width="1.6">${[-78,-47,-16,15,46,77].map(y=>`<line x1="-37" y1="${y}" x2="-27" y2="${y}"/>`).join('')}</g>`; }
function p90() { return `<ellipse cx="0" cy="118" rx="52" ry="14" fill="#000" opacity="0.35"/><rect x="-44" y="-104" width="88" height="208" rx="18" fill="url(#cream)" stroke="#b9ad97" stroke-width="1.5"/><g fill="url(#pole)" stroke="#7a7a82" stroke-width="0.8">${[-70,-42,-14,14,42,70].map(y=>`<circle cx="0" cy="${y}" r="6.5"/>`).join('')}</g><circle cx="0" cy="-92" r="5" fill="#8a8078"/><circle cx="0" cy="92" r="5" fill="#8a8078"/>`; }

// CORDAS / HEADSTOCK
M.strings = () => `
  <g transform="translate(930,345) rotate(6)">
    <ellipse cx="0" cy="205" rx="120" ry="16" fill="#000" opacity="0.3"/>
    <rect x="-46" y="-30" width="92" height="240" rx="8" fill="#2a1c10"/>
    <path d="M-70,-170 L70,-170 Q92,-168 92,-140 L92,-40 Q92,-28 70,-28 L-70,-28 Q-92,-28 -92,-40 L-92,-140 Q-92,-168 -70,-170 Z" fill="#1b120b" stroke="#3a2a18" stroke-width="2"/>
    <g fill="url(#chrome)" stroke="#5a5a60" stroke-width="1.2">
      <circle cx="-64" cy="-140" r="12"/><circle cx="-64" cy="-96" r="12"/><circle cx="-64" cy="-52" r="12"/>
      <circle cx="64" cy="-140" r="12"/><circle cx="64" cy="-96" r="12"/><circle cx="64" cy="-52" r="12"/>
    </g>
    <g stroke="#cfcabf" stroke-linecap="round">
      ${[-35,-21,-7,7,21,35].map((x,i)=>`<line x1="${x}" y1="-30" x2="${x}" y2="205" stroke-width="${1+i*0.5}"/>`).join('')}
    </g>
  </g>`;

// INTERFACE de áudio
M.interface = () => `
  <g transform="translate(925,345)">
    <ellipse cx="0" cy="150" rx="175" ry="20" fill="#000" opacity="0.35"/>
    <rect x="-175" y="-120" width="350" height="250" rx="18" fill="#1b1b20" stroke="#000" stroke-opacity="0.4" stroke-width="2"/>
    <rect x="-175" y="-120" width="350" height="250" rx="18" fill="none" stroke="#e63946" stroke-opacity="0.25" stroke-width="2"/>
    <g fill="#0e0e12" stroke="#3a3a42" stroke-width="2"><circle cx="-96" cy="6" r="58"/><circle cx="40" cy="6" r="42"/></g>
    <g fill="url(#chrome)" stroke="#4a4a50" stroke-width="1.5"><circle cx="-96" cy="6" r="40"/><circle cx="40" cy="6" r="28"/></g>
    <g stroke="#1a1a1e" stroke-width="4" stroke-linecap="round"><line x1="-96" y1="6" x2="-96" y2="-30"/><line x1="40" y1="6" x2="58" y2="-18"/></g>
    <g fill="#e63946"><rect x="112" y="-70" width="10" height="10" rx="2"/><rect x="112" y="-52" width="10" height="10" rx="2" fill="#f5b700"/><rect x="112" y="-34" width="10" height="10" rx="2" fill="#4ade80"/></g>
    <g fill="#0e0e12" stroke="#3a3a42" stroke-width="2"><circle cx="-120" cy="96" r="18"/><circle cx="-72" cy="96" r="18"/></g>
  </g>`;

// BRAÇO / DIAGRAMA DE ACORDE
M.fretboard = () => `
  <g transform="translate(925,340)">
    <rect x="-150" y="-150" width="300" height="330" rx="12" fill="#1b120b" stroke="#3a2a18" stroke-width="3"/>
    <rect x="-150" y="-150" width="300" height="16" fill="#d8d3c6"/>
    <g stroke="#5a4632" stroke-width="4">${[-84,-18,48,114].map(y=>`<line x1="-150" y1="${y}" x2="150" y2="${y}"/>`).join('')}</g>
    <g stroke="#cfcabf" stroke-width="2.4">${[-110,-66,-22,22,66,110].map(x=>`<line x1="${x}" y1="-150" x2="${x}" y2="180"/>`).join('')}</g>
    <g fill="#e63946" stroke="#fff" stroke-width="2">
      <circle cx="-66" cy="-51" r="17"/><circle cx="22" cy="-51" r="17"/><circle cx="-22" cy="15" r="17"/>
    </g>
  </g>`;

// AFINADOR (medidor)
M.tuner = () => `
  <g transform="translate(925,360)">
    <ellipse cx="0" cy="150" rx="150" ry="18" fill="#000" opacity="0.3"/>
    <rect x="-160" y="-150" width="320" height="290" rx="20" fill="#17171b" stroke="#000" stroke-opacity="0.4" stroke-width="2"/>
    <path d="M-120,60 A130 130 0 0 1 120 60" fill="none" stroke="#2a2a30" stroke-width="14" stroke-linecap="round"/>
    <path d="M-16,-70 A130 130 0 0 1 16 -70" fill="none" stroke="#4ade80" stroke-width="14" stroke-linecap="round" transform="translate(0,130)"/>
    <g stroke="#6a6a72" stroke-width="3">${[-60,-30,0,30,60].map(a=>`<line x1="0" y1="-118" x2="0" y2="-104" transform="rotate(${a}) translate(0,130)"/>`).join('')}</g>
    <line x1="0" y1="60" x2="18" y2="-58" stroke="#e63946" stroke-width="6" stroke-linecap="round"/>
    <circle cx="0" cy="60" r="12" fill="#e63946"/>
    <text x="0" y="-2" font-family="'Helvetica Neue',Helvetica,Arial,sans-serif" font-size="72" font-weight="800" fill="#f4f4f5" text-anchor="middle">E</text>
  </g>`;

// TABLATURA / CIFRA
M.tab = () => `
  <g transform="translate(925,345)">
    <rect x="-185" y="-120" width="370" height="240" rx="14" fill="#141218" stroke="#2a2730" stroke-width="2"/>
    <text x="-160" y="-70" font-family="'Helvetica Neue',Helvetica,Arial,sans-serif" font-size="30" font-weight="800" fill="#e63946">TAB</text>
    <g stroke="#4a4652" stroke-width="2">${[-40,-14,12,38,64,90].map(y=>`<line x1="-160" y1="${y}" x2="160" y2="${y}"/>`).join('')}</g>
    <g font-family="'Helvetica Neue',Helvetica,Arial,sans-serif" font-size="22" font-weight="700" fill="#f4f4f5" text-anchor="middle">
      <text x="-110" y="-6">0</text><text x="-60" y="20">2</text><text x="-10" y="46">3</text><text x="40" y="20">2</text><text x="90" y="-6">0</text><text x="130" y="46">3</text>
    </g>
  </g>`;

// FERRAMENTAS (manutenção)
M.tools = () => `
  <g transform="translate(925,345) rotate(-8)">
    <ellipse cx="0" cy="175" rx="130" ry="16" fill="#000" opacity="0.3"/>
    <g transform="rotate(30)"><rect x="-14" y="-160" width="28" height="200" rx="6" fill="#e63946"/><rect x="-10" y="40" width="20" height="120" rx="4" fill="url(#chrome)"/><rect x="-16" y="150" width="32" height="20" rx="3" fill="#c9c9cf"/></g>
    <g transform="rotate(-32)"><rect x="-9" y="-150" width="18" height="300" rx="6" fill="#3a3a42"/><rect x="-9" y="-150" width="18" height="40" rx="6" fill="#e63946"/><path d="M-22,150 h44 v18 h-14 v14 h-16 v-14 h-14 Z" fill="#3a3a42"/></g>
    <circle cx="0" cy="0" r="16" fill="#1a1a1e" stroke="#4a4a50" stroke-width="3"/>
  </g>`;

// ---------- dados dos posts ----------
const g = (finish) => ({ guitar: finish });
const POSTS = [
  { slug: 'guitarra-eletrica-guia-completo', kicker: 'GUITARRAS · GUIA', l1: 'GUITARRA', l2: 'ELÉTRICA', motif: 'guitar', opt: { body: '#b5202d' } },
  { slug: 'guitarra-stratocaster-guia-completo', kicker: 'GUITARRAS · GUIA', l1: 'STRATO', l2: 'CASTER', motif: 'guitar', opt: { body: '#2f6db0', guard: '#f0ece2' } },
  { slug: 'guitarra-les-paul-guia-completo', kicker: 'GUITARRAS · GUIA', l1: 'LES', l2: 'PAUL', motif: 'guitarLP', opt: { body: '#c9a03a', guard: '#241a10' } },
  { slug: 'tipos-de-guitarra-eletrica', kicker: 'GUITARRAS', l1: 'TIPOS DE', l2: 'GUITARRA', motif: 'guitar', opt: { body: '#1a1418', guard: '#d8d3c6' } },
  { slug: 'guitarra-8-cordas-guia-completo', kicker: 'GUITARRAS', l1: 'GUITARRA', l2: '8 CORDAS', motif: 'guitar', opt: { body: '#14141a', guard: '#20202a' } },
  { slug: 'guitarra-de-12-cordas-guia-completo', kicker: 'GUITARRAS', l1: 'GUITARRA', l2: '12 CORDAS', motif: 'guitar', opt: { body: '#4a2d6b', guard: '#e9e4da' } },
  { slug: 'melhor-guitarra-7-cordas-2026', kicker: 'GUITARRAS · 2026', l1: 'GUITARRA', l2: '7 CORDAS', motif: 'guitar', opt: { body: '#0e5c4a', guard: '#14141a' } },
  { slug: 'guitarra-eletrica-profissional-guia-2026', kicker: 'GUITARRAS · 2026', l1: 'GUITARRA', l2: 'PRO', motif: 'guitar', opt: { body: '#101014', guard: '#c9a45a' } },
  { slug: 'guitarra-eletrica-usada-o-que-verificar', kicker: 'GUIA DE COMPRA', l1: 'GUITARRA', l2: 'USADA', motif: 'guitar', opt: { body: '#8a6a2a', guard: '#e9e4da' } },
  { slug: 'melhores-guitarras-eletricas-para-iniciantes-2026', kicker: 'GUIA · 2026', l1: 'GUITARRAS', l2: 'INICIANTE', motif: 'guitar', opt: { body: '#c62432' } },
  { slug: 'melhor-guitarra-eletrica-infantil', kicker: 'GUIA · 2026', l1: 'GUITARRA', l2: 'INFANTIL', motif: 'guitar', opt: { body: '#e0642a', guard: '#f0ece2' } },
  { slug: 'melhor-guitarra-para-blues', kicker: 'GUITARRAS · 2026', l1: 'GUITARRA', l2: 'PRA BLUES', motif: 'guitar', opt: { body: '#1c3f6e', guard: '#e9e4da' } },
  { slug: 'fender-vs-gibson-qual-escolher', kicker: 'COMPARATIVO', l1: 'FENDER vs', l2: 'GIBSON', motif: 'guitarLP', opt: { body: '#7a1f12', guard: '#241a10' } },
  { slug: 'quanto-custa-uma-guitarra-eletrica', kicker: 'GUIA DE COMPRA', l1: 'QUANTO', l2: 'CUSTA?', sub: 'guitarra elétrica · preços 2026', motif: 'guitar', opt: { body: '#2a8a6a', guard: '#e9e4da' } },
  { slug: 'quanto-custa-ser-guitarrista-no-brasil', kicker: 'GUIA · CUSTOS · 2026', l1: 'CUSTO DE SER', l2: 'GUITARRISTA', motif: 'guitar', opt: { body: '#1c1c22', guard: '#c9a45a' } },
  { slug: 'quantas-cordas-tem-uma-guitarra', kicker: 'TÉCNICA', l1: 'QUANTAS', l2: 'CORDAS?', motif: 'guitar', opt: { body: '#7a1fa0', guard: '#e9e4da' } },
  { slug: 'quem-inventou-a-guitarra-eletrica', kicker: 'HISTÓRIA', l1: 'QUEM', l2: 'INVENTOU?', sub: 'a guitarra elétrica', motif: 'guitar', opt: { body: '#8a5a2a', guard: '#efe9dd' } },
  { slug: 'squier-classic-vibe-60s-stratocaster-review', kicker: 'REVIEW', l1: 'SQUIER', l2: 'CLASSIC VIBE', motif: 'guitar', opt: { body: '#3a6ea5', guard: '#f0ece2' } },
  { slug: 'guitarra-com-amplificador-kit-iniciante', kicker: 'GUIA DE COMPRA', l1: 'KIT', l2: 'INICIANTE', sub: 'guitarra + amplificador', motif: 'guitar', opt: { body: '#b5202d' } },
  { slug: 'melhores-marcas-de-guitarra-nacionais', kicker: 'GUIA DE COMPRA', l1: 'MARCAS', l2: 'NACIONAIS', sub: 'Tagima · Giannini · Strinberg', motif: 'guitar', opt: { body: '#1c7a3a', guard: '#e9e4da' } },
  { slug: 'guitarra-tagima-e-boa', kicker: 'GUIA · MARCAS', l1: 'TAGIMA', l2: 'É BOA?', motif: 'guitar', opt: { body: '#101014', guard: '#c9a45a' } },
  { slug: 'guitarra-giannini-vale-a-pena', kicker: 'GUIA · MARCAS', l1: 'GIANNINI', l2: 'VALE A PENA?', motif: 'guitar', opt: { body: '#8a3b12', guard: '#efe9dd' } },
  { slug: 'guitarras-nacionais-baratas', kicker: 'GUIA DE COMPRA', l1: 'NACIONAIS', l2: 'BARATAS', sub: 'Strinberg · Michael · SX', motif: 'guitar', opt: { body: '#e0642a', guard: '#f0ece2' } },
  { slug: 'tagima-vs-squier', kicker: 'COMPARATIVO', l1: 'TAGIMA vs', l2: 'SQUIER', motif: 'guitar', opt: { body: '#2f6db0', guard: '#f0ece2' } },
  { slug: 'guitarra-telecaster-guia-completo', kicker: 'GUITARRAS · GUIA', l1: 'TELE', l2: 'CASTER', motif: 'guitar', opt: { body: '#caa042', guard: '#1a1418' } },
  { slug: 'guitarra-ibanez-guia-completo', kicker: 'GUITARRAS · MARCA', l1: 'GUITARRA', l2: 'IBANEZ', motif: 'guitar', opt: { body: '#155e75', guard: '#d8d3c6' } },
  { slug: 'guitarra-sg-guia-completo', kicker: 'GUITARRAS · GUIA', l1: 'GUITARRA', l2: 'SG', motif: 'guitarLP', opt: { body: '#a01f2d', guard: '#241a10' } },
  { slug: 'guitarra-semi-acustica-guia-completo', kicker: 'GUITARRAS · GUIA', l1: 'SEMI', l2: 'ACÚSTICA', motif: 'guitarLP', opt: { body: '#8a5a2a', guard: '#241a10' } },
  { slug: 'guitarra-jackson-guia-completo', kicker: 'GUITARRAS · MARCA', l1: 'GUITARRA', l2: 'JACKSON', motif: 'guitar', opt: { body: '#161018', guard: '#c8c3b8' } },

  { slug: 'amplificador-de-guitarra-guia-completo', kicker: 'AMPLIFICADORES', l1: 'AMPLIFICADOR', l2: 'DE GUITARRA', motif: 'amp' },
  { slug: 'amplificador-valvulado-ou-transistor', kicker: 'AMPLIFICADORES', l1: 'VALVULADO', l2: 'ou TRANSISTOR', motif: 'amp' },
  { slug: 'melhor-amplificador-de-guitarra-2026', kicker: 'AMPS · 2026', l1: 'MELHOR', l2: 'AMPLIFICADOR', motif: 'amp' },
  { slug: 'melhor-amplificador-valvulado-de-guitarra-2026', kicker: 'AMPS · 2026', l1: 'MELHOR', l2: 'VALVULADO', motif: 'amp', opt: { tone: '#2a1c10' } },
  { slug: 'melhor-mini-amplificador-de-guitarra-2026', kicker: 'AMPS · 2026', l1: 'MINI', l2: 'AMPLIFICADOR', motif: 'amp', opt: { tone: '#101014' } },
  { slug: 'review-fender-blues-junior-iv', kicker: 'REVIEW', l1: 'BLUES', l2: 'JUNIOR IV', motif: 'amp', opt: { tone: '#1c1a12' } },

  { slug: '5-pedais-boss-essenciais-para-guitarristas', kicker: 'PEDAIS', l1: '5 PEDAIS', l2: 'ESSENCIAIS', motif: 'pedal', opt: { tone: '#1f3a6e' } },
  { slug: 'como-montar-pedalboard', kicker: 'PEDAIS · TUTORIAL', l1: 'MONTAR', l2: 'PEDALBOARD', motif: 'pedal', opt: { tone: '#2a2a30' } },
  { slug: 'pedais-e-pedaleiras-guia-completo', kicker: 'PEDAIS · GUIA', l1: 'PEDAIS E', l2: 'PEDALEIRAS', motif: 'pedal', opt: { tone: '#0e6b52' } },
  { slug: 'pedal-de-distorcao-para-guitarra', kicker: 'PEDAIS', l1: 'PEDAL DE', l2: 'DISTORÇÃO', motif: 'pedal', opt: { tone: '#c62432' } },
  { slug: 'melhor-pedaleira-de-guitarra-2026', kicker: 'PEDAIS · 2026', l1: 'MELHOR', l2: 'PEDALEIRA', motif: 'pedal', opt: { tone: '#101014' } },

  { slug: 'melhores-captadores-de-guitarra-2026', kicker: 'ACESSÓRIOS · 2026', l1: 'MELHORES', l2: 'CAPTADORES', sub: 'single coil · humbucker · P90', motif: 'pickups' },
  { slug: 'captacoes-guitarra-passivas-vs-ativas', kicker: 'TÉCNICA', l1: 'PASSIVO', l2: 'ou ATIVO', sub: 'captadores de guitarra', motif: 'pickups' },

  { slug: 'melhores-cordas-de-guitarra-2026', kicker: 'ACESSÓRIOS · 2026', l1: 'MELHORES', l2: 'CORDAS', motif: 'strings' },
  { slug: 'cordas-de-guitarra-009-ou-010', kicker: 'ACESSÓRIOS', l1: '009', l2: 'ou 010?', sub: 'calibre de cordas', motif: 'strings' },
  { slug: 'como-trocar-as-cordas-da-guitarra', kicker: 'TUTORIAL', l1: 'TROCAR', l2: 'AS CORDAS', motif: 'strings' },
  { slug: 'nome-das-cordas-da-guitarra', kicker: 'TÉCNICA', l1: 'NOME DAS', l2: 'CORDAS', sub: 'E A D G B E', motif: 'strings' },

  { slug: 'melhor-interface-de-audio-para-guitarra-2026', kicker: 'HOME STUDIO · 2026', l1: 'MELHOR', l2: 'INTERFACE', sub: 'de áudio para guitarra', motif: 'interface' },
  { slug: 'como-gravar-guitarra-no-computador', kicker: 'HOME STUDIO', l1: 'GRAVAR', l2: 'NO PC', sub: 'guitarra em casa', motif: 'interface' },
  { slug: 'quanto-custa-montar-setup-de-guitarra', kicker: 'GUIA DE COMPRA', l1: 'MONTAR', l2: 'O SETUP', sub: 'quanto custa em 2026', motif: 'interface' },

  { slug: 'acordes-de-guitarra-para-iniciantes', kicker: 'INICIANTES', l1: 'ACORDES', l2: 'INICIANTE', motif: 'fretboard' },
  { slug: 'escala-pentatonica-de-guitarra', kicker: 'TÉCNICA E TEORIA', l1: 'ESCALA', l2: 'PENTATÔNICA', motif: 'fretboard' },
  { slug: 'quanto-tempo-aprender-guitarra', kicker: 'INICIANTES', l1: 'QUANTO', l2: 'TEMPO?', sub: 'para aprender guitarra', motif: 'fretboard' },
  { slug: 'como-ler-cifra-de-guitarra', kicker: 'TÉCNICA E TEORIA', l1: 'COMO LER', l2: 'CIFRA', motif: 'tab' },
  { slug: 'melhores-musicas-para-aprender-guitarra', kicker: 'INICIANTES', l1: 'MÚSICAS', l2: 'PARA TOCAR', sub: 'por nível e gênero', motif: 'tab' },

  { slug: 'como-afinar-guitarra-guia-completo', kicker: 'TUTORIAL', l1: 'COMO', l2: 'AFINAR', motif: 'tuner' },
  { slug: 'afinacoes-de-guitarra', kicker: 'TÉCNICA E TEORIA', l1: 'AFINAÇÕES', l2: 'DE GUITARRA', sub: 'Standard · Drop D · Open G', motif: 'strings' },
  { slug: 'partes-da-guitarra-eletrica', kicker: 'TÉCNICA E TEORIA', l1: 'PARTES DA', l2: 'GUITARRA', sub: 'anatomia peça por peça', motif: 'guitar', opt: { body: '#b5202d' } },
  { slug: 'teoria-musical-para-guitarra', kicker: 'TÉCNICA E TEORIA', l1: 'TEORIA', l2: 'MUSICAL', sub: 'escalas · acordes · tonalidades', motif: 'fretboard' },
  { slug: 'glossario-de-guitarra', kicker: 'REFERÊNCIA · A a Z', l1: 'GLOSSÁRIO', l2: 'DA GUITARRA', sub: 'todos os termos explicados', motif: 'guitar', opt: { body: '#101014', guard: '#c9a45a' } },
  { slug: 'como-fazer-manutencao-guitarra-em-casa', kicker: 'TUTORIAL', l1: 'MANUTENÇÃO', l2: 'EM CASA', sub: 'o que você mesmo faz', motif: 'tools' },
  { slug: 'problemas-comuns-na-guitarra', kicker: 'TUTORIAL', l1: 'PROBLEMAS', l2: 'COMUNS', sub: 'e como resolver', motif: 'tools' },
  { slug: 'fret-buzz-traste-zerando', kicker: 'TUTORIAL', l1: 'FRET BUZZ', l2: 'TRASTE ZERANDO', motif: 'fretboard' },
  { slug: 'guitarra-chiando-ruido', kicker: 'TUTORIAL', l1: 'GUITARRA', l2: 'CHIANDO', sub: 'como eliminar o ruído', motif: 'pickups' },
  { slug: 'guitarra-desafinando', kicker: 'TUTORIAL', l1: 'GUITARRA', l2: 'DESAFINANDO', motif: 'tuner' },
  { slug: 'como-abaixar-a-acao-da-guitarra', kicker: 'TUTORIAL', l1: 'ABAIXAR', l2: 'A AÇÃO', sub: 'da guitarra', motif: 'strings' },

  { slug: 'como-tocar-enter-sandman-metallica', kicker: 'COMO TOCAR', l1: 'ENTER', l2: 'SANDMAN', sub: 'Metallica', motif: 'tab' },
  { slug: 'como-tocar-evidencias-chitaozinho-e-xororo', kicker: 'COMO TOCAR', l1: 'TOCAR', l2: 'EVIDÊNCIAS', sub: 'Chitãozinho & Xororó', motif: 'tab' },
  { slug: 'como-tocar-tempo-perdido-legiao-urbana', kicker: 'COMO TOCAR', l1: 'TEMPO', l2: 'PERDIDO', sub: 'Legião Urbana', motif: 'tab' },
  { slug: 'como-tocar-wish-you-were-here-pink-floyd', kicker: 'COMO TOCAR', l1: 'WISH YOU', l2: 'WERE HERE', sub: 'Pink Floyd', motif: 'tab' },

  { slug: 'melhores-violoes-2026', kicker: 'VIOLÕES · 2026', l1: 'MELHORES', l2: 'VIOLÕES', motif: 'acoustic' },
  { slug: 'violao-ou-guitarra-por-onde-comecar', kicker: 'INICIANTES', l1: 'VIOLÃO ou', l2: 'GUITARRA?', motif: 'acoustic' },
  { slug: 'como-tocar-violao-para-iniciantes', kicker: 'INICIANTES', l1: 'COMO TOCAR', l2: 'VIOLÃO', sub: 'guia do zero', motif: 'acoustic' },
  { slug: 'tecnicas-de-guitarra', kicker: 'TÉCNICA E TEORIA', l1: 'TÉCNICAS', l2: 'DE GUITARRA', sub: 'bend · vibrato · palm mute', motif: 'fretboard' },
  { slug: 'melhores-presentes-para-guitarristas', kicker: 'GUIA DE COMPRA', l1: 'PRESENTES', l2: 'P/ GUITARRISTAS', motif: 'guitar', opt: { body: '#c62432' } },
];

// ---------- render ----------
const motifLabel = {
  guitar: 'uma guitarra elétrica', guitarLP: 'uma guitarra Les Paul', acoustic: 'um violão',
  amp: 'um amplificador', pedal: 'um pedal de efeito', pickups: 'captadores de guitarra',
  strings: 'as cordas e a mão da guitarra', interface: 'uma interface de áudio',
  fretboard: 'um diagrama de acorde no braço', tuner: 'um afinador', tab: 'uma tablatura', tools: 'ferramentas de manutenção',
};

function buildSVG(p) {
  const motif = M[p.motif](p.opt || {});
  return `<svg viewBox="0 0 1200 675" xmlns="http://www.w3.org/2000/svg" role="img">
  <defs>${DEFS}</defs>
  <rect width="1200" height="675" fill="url(#bg)"/>
  <g opacity="0.03" stroke="#fff" stroke-width="1"><line x1="0" y1="150" x2="1200" y2="150"/><line x1="0" y1="300" x2="1200" y2="300"/><line x1="0" y1="450" x2="1200" y2="450"/><line x1="0" y1="600" x2="1200" y2="600"/></g>
  <circle cx="920" cy="345" r="340" fill="url(#glow)"/>
  ${motif}
  ${wordmark()}
  ${textBlock(p)}
</svg>`;
}

export { DEFS, wordmark, M, POSTS, motifLabel };

// Só executa a geração quando rodado direto (não quando importado por gen-pins).
const isMain = process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('/scripts/gen-covers.mjs');
if (isMain) {
const only = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null;
const list = only ? POSTS.filter((p) => p.slug === only) : POSTS;
const results = [];
for (const p of list) {
  const svg = buildSVG(p);
  const file = path.join(OUT, `${p.slug}.png`);
  await sharp(Buffer.from(svg), { density: 150 }).resize(1200, 675).png({ compressionLevel: 9 }).toFile(file);
  const kb = Math.round(fs.statSync(file).size / 1024);
  const cap = `${p.l1} ${p.l2 || ''}`.trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  results.push({ slug: p.slug, motif: p.motif, kb, kicker: p.kicker, l1: p.l1, l2: p.l2 || '', alt: `${cap} — ilustração de ${motifLabel[p.motif]}, capa do Sonar Musical` });
  console.log(`✓ ${p.slug}.png (${p.motif}, ${kb}KB)`);
}

// montagem de contato para QA visual
if (process.argv.includes('--montage')) {
  const cols = 5, tw = 320, th = 180;
  const rows = Math.ceil(results.length / cols);
  const thumbs = await Promise.all(results.map(async (r) => ({ input: await sharp(path.join(OUT, `${r.slug}.png`)).resize(tw, th).png().toBuffer() })));
  const composites = thumbs.map((t, i) => ({ input: t.input, left: (i % cols) * tw, top: Math.floor(i / cols) * th }));
  await sharp({ create: { width: cols * tw, height: rows * th, channels: 3, background: '#000' } }).composite(composites).png().toFile('covers-src/_montage.png');
  console.log(`\nMontagem: covers-src/_montage.png (${results.length} capas)`);
}

// exporta alts para uso no update de frontmatter
fs.writeFileSync('covers-src/_alts.json', JSON.stringify(Object.fromEntries(results.map((r) => [r.slug, r.alt])), null, 2));
fs.writeFileSync('covers-src/_covers.json', JSON.stringify(Object.fromEntries(results.map((r) => [r.slug, { kicker: r.kicker, l1: r.l1, l2: r.l2, motif: r.motif }])), null, 2));
console.log(`\n${results.length} capas geradas.`);
}

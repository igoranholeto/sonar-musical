import fs from 'node:fs';
import sharp from 'sharp';
const defs=`
 <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2f2f4"/><stop offset="0.5" stop-color="#b9b9c0"/><stop offset="1" stop-color="#75757e"/></linearGradient>
 <linearGradient id="cream" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efe9dd"/><stop offset="1" stop-color="#d7cdba"/></linearGradient>
 <linearGradient id="black" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26222a"/><stop offset="1" stop-color="#151318"/></linearGradient>
 <radialGradient id="pole" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#e8e8ec"/><stop offset="0.6" stop-color="#a9a9b1"/><stop offset="1" stop-color="#6c6c74"/></radialGradient>`;
const single=`<rect x="-30" y="-96" width="60" height="192" rx="16" fill="url(#cream)" stroke="#b9ad97" stroke-width="1.5"/>`+[-72,-43,-14,14,43,72].map(y=>`<circle cx="0" cy="${y}" r="6.5" fill="url(#pole)" stroke="#7a7a82" stroke-width="0.8"/>`).join('');
const hum=`<rect x="-66" y="-100" width="132" height="200" rx="12" fill="url(#chrome)" stroke="#5c5c63" stroke-width="1.5"/><rect x="-57" y="-91" width="114" height="182" rx="9" fill="url(#black)"/><line x1="0" y1="-88" x2="0" y2="88" stroke="#0c0a0e" stroke-width="3"/>`+[-70,-42,-14,14,42,70].map(y=>`<circle cx="-29" cy="${y}" r="7.5" fill="url(#pole)" stroke="#6f6f77" stroke-width="0.8"/><circle cx="29" cy="${y}" r="7.5" fill="url(#pole)" stroke="#6f6f77" stroke-width="0.8"/><line x1="-33.5" y1="${y}" x2="-24.5" y2="${y}" stroke="#3a3a40" stroke-width="1.5"/>`).join('');
const p90=`<rect x="-42" y="-92" width="84" height="184" rx="18" fill="url(#cream)" stroke="#b9ad97" stroke-width="1.5"/>`+[-64,-38,-13,13,38,64].map(y=>`<circle cx="0" cy="${y}" r="6" fill="url(#pole)" stroke="#7a7a82" stroke-width="0.8"/>`).join('')+`<circle cx="0" cy="-82" r="4.5" fill="#8a8078"/><circle cx="0" cy="82" r="4.5" fill="#8a8078"/>`;
const col=(x,body,name,caption)=>`<g transform="translate(${x},170)">${body}</g>
 <text x="${x}" y="330" font-family="'Helvetica Neue',Helvetica,Arial,sans-serif" font-size="26" font-weight="700" fill="#f4f4f5" text-anchor="middle">${name}</text>
 <text x="${x}" y="360" font-family="'Helvetica Neue',Helvetica,Arial,sans-serif" font-size="17" fill="#9a958d" text-anchor="middle">${caption}</text>`;
const svg=`<svg viewBox="0 0 960 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagrama dos três tipos de captador: single coil, humbucker e P90">
 <defs>${defs}</defs>
 <rect width="960" height="400" rx="16" fill="#111214" stroke="#2a2a30" stroke-width="1.5"/>
 <line x1="320" y1="70" x2="320" y2="300" stroke="#2a2a30" stroke-width="1.2"/>
 <line x1="640" y1="70" x2="640" y2="300" stroke="#2a2a30" stroke-width="1.2"/>
 ${col(160,single,'Single coil','Brilhante e transparente · pode chiar')}
 ${col(480,hum,'Humbucker','Grosso e sem ruído · ideal p/ distorção')}
 ${col(800,p90,'P90','Meio-termo: corpo + brilho')}
</svg>`;
fs.writeFileSync('covers-src/diagrama-tipos-captador.svg',svg);
await sharp(Buffer.from(svg),{density:200}).resize(960,400).png({compressionLevel:9}).toFile('public/images/blog/diagrama-tipos-captador.png');
console.log('diagrama gerado:',Math.round(fs.statSync('public/images/blog/diagrama-tipos-captador.png').size/1024)+'KB');

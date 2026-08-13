import fs from 'node:fs';
import sharp from 'sharp';
const notes = ['C','D','E','F','G','A','B','C'];
const gaps = ['T','T','S','T','T','T','S']; // entre as notas
const W=980,H=320, cx0=90, step=112, cy=160;
const bubbles = notes.map((n,i)=>{
  const x=cx0+i*step;
  return `<circle cx="${x}" cy="${cy}" r="34" fill="${i===0||i===7?'#e63946':'#26222a'}" stroke="${i===0||i===7?'#e63946':'#3a3a42'}" stroke-width="2"/>
  <text x="${x}" y="${cy+8}" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="26" font-weight="800" fill="#fff">${n}</text>`;
}).join('');
const links = gaps.map((g,i)=>{
  const x1=cx0+i*step+34, x2=cx0+(i+1)*step-34, mid=(x1+x2)/2;
  const isT=g==='T';
  return `<line x1="${x1}" y1="${cy}" x2="${x2}" y2="${cy}" stroke="#4a4652" stroke-width="2"/>
  <rect x="${mid-17}" y="${cy-58}" width="34" height="26" rx="6" fill="${isT?'#1f6b52':'#6b3a1f'}"/>
  <text x="${mid}" y="${cy-39}" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="15" font-weight="800" fill="#fff">${g}</text>
  <text x="${mid}" y="${cy+52}" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="12" fill="#9a958d">${isT?'tom':'semitom'}</text>`;
}).join('');
const svg=`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fórmula da escala maior: tom, tom, semitom, tom, tom, tom, semitom">
 <rect width="${W}" height="${H}" rx="16" fill="#111214" stroke="#2a2a30" stroke-width="1.5"/>
 <text x="40" y="46" font-family="Helvetica,Arial,sans-serif" font-size="18" font-weight="700" fill="#e63946">ESCALA MAIOR — a fórmula</text>
 <text x="40" y="72" font-family="Helvetica,Arial,sans-serif" font-size="14" fill="#9a958d">T = tom (2 casas) · S = semitom (1 casa). Vale para qualquer tônica.</text>
 ${links}${bubbles}
 <text x="${W/2}" y="${H-24}" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="16" font-weight="700" fill="#c9c4bd">T · T · S · T · T · T · S</text>
</svg>`;
fs.writeFileSync('covers-src/diagrama-intervalos.svg',svg);
await sharp(Buffer.from(svg),{density:200}).resize(980,320).png({compressionLevel:9}).toFile('public/images/blog/diagrama-intervalos.png');
console.log('intervalos:',Math.round(fs.statSync('public/images/blog/diagrama-intervalos.png').size/1024)+'KB');

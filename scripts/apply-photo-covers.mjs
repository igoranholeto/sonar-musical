// Aplica capas de FOTO REAL (composta com a faixa da marca) nos posts que têm
// foto relevante; mantém ilustração + foto inline nos posts do KEEP.
// Uso: node scripts/apply-photo-covers.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const covers = JSON.parse(fs.readFileSync('covers-src/_covers.json', 'utf8'));
const orig = JSON.parse(fs.readFileSync('covers-src/_orig.json', 'utf8'));
const OUT = 'public/images/blog';
const DIR = 'src/data/blog';
// Mantêm ILUSTRAÇÃO na capa (exemplos do usuário) + ganham foto real inline
const KEEP = new Set(['quem-inventou-a-guitarra-eletrica', 'quanto-tempo-aprender-guitarra']);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const q = (s) => String(s).replace(/"/g, "'");
const fit = (t, maxW, cap = 92) => Math.min(cap, Math.floor(maxW / (0.6 * Math.max(t.length, 1))));
const hi = (u) => u.replace(/([?&])w=\d+/, '$1w=1600').replace(/q=\d+/, 'q=80');

const overlay = ({ kicker, l1, l2 }) => {
  const s1 = fit(l1, 720), s2 = fit(l2 || '', 720);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
   <defs>
     <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#080809" stop-opacity="0.12"/><stop offset="0.42" stop-color="#080809" stop-opacity="0.30"/><stop offset="0.72" stop-color="#080809" stop-opacity="0.86"/><stop offset="1" stop-color="#060608" stop-opacity="0.97"/></linearGradient>
     <linearGradient id="top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#060608" stop-opacity="0.72"/><stop offset="1" stop-color="#060608" stop-opacity="0"/></linearGradient>
   </defs>
   <rect width="1200" height="675" fill="url(#scrim)"/><rect width="1200" height="150" fill="url(#top)"/>
   <g transform="translate(80,46)"><rect width="34" height="34" rx="9" fill="#e63946"/><g transform="translate(6,6) scale(0.92)" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3" fill="#fff" stroke="none"/><circle cx="18" cy="16" r="3" fill="#fff" stroke="none"/></g><text x="46" y="24" font-family="Helvetica,Arial,sans-serif" font-size="22" font-weight="700" fill="#f4f4f5">Sonar<tspan fill="#e63946">Musical</tspan></text></g>
   <rect x="84" y="${l2 ? 452 : 512}" width="54" height="5" rx="2.5" fill="#e63946"/>
   <text x="84" y="${l2 ? 442 : 502}" font-family="Helvetica,Arial,sans-serif" font-size="23" font-weight="700" letter-spacing="6" fill="#e7e3db">${esc(kicker)}</text>
   <g font-family="Helvetica,Arial,sans-serif" font-weight="800" letter-spacing="0.5"><text x="80" y="${l2 ? 540 : 600}" font-size="${s1}" fill="#fff">${esc(l1)}</text>${l2 ? `<text x="80" y="628" font-size="${s2}" fill="#fff">${esc(l2)}</text>` : ''}</g>
  </svg>`);
};

const filePath = (slug) => {
  const mdx = path.join(DIR, slug + '.mdx');
  return fs.existsSync(mdx) ? mdx : path.join(DIR, slug + '.md');
};

const setFM = (slug, patch) => {
  const f = filePath(slug);
  const t = fs.readFileSync(f, 'utf8');
  const p = t.split(/^---$/m);
  let fm = p[1];
  for (const [k, v] of Object.entries(patch)) {
    const re = new RegExp('^' + k + ':.*$', 'm');
    if (re.test(fm)) fm = fm.replace(re, `${k}: "${q(v)}"`);
    else fm = fm.replace(/^(category:.*)$/m, `$1\n${k}: "${q(v)}"`);
  }
  p[1] = fm;
  fs.writeFileSync(f, p.join('---'));
};

const addInline = (slug, img, alt) => {
  const f = filePath(slug);
  let t = fs.readFileSync(f, 'utf8');
  if (t.includes('{/* foto-inline */}')) return false;
  const fig = `\n{/* foto-inline */}\n<figure style="margin:2rem 0">\n  <img src="${img}" alt="${q(alt)}" width="1200" height="675" loading="lazy" decoding="async" style="display:block;width:100%;height:auto;border-radius:12px" />\n</figure>\n`;
  const i = t.indexOf('\n## ');
  if (i < 0) { console.log('sem H2 p/ inline:', slug); return false; }
  t = t.slice(0, i) + fig + t.slice(i);
  fs.writeFileSync(f, t);
  return true;
};

let photo = 0, kept = 0, inline = 0;
for (const slug of Object.keys(covers)) {
  const has = orig[slug];
  if (has && !KEEP.has(slug)) {
    const res = await fetch(hi(has.img));
    if (!res.ok) { console.log('FALHA', slug, res.status); continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    const base = await sharp(buf).resize(1200, 675, { fit: 'cover', position: 'attention' }).toBuffer();
    await sharp(base).composite([{ input: overlay(covers[slug]) }]).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(OUT, slug + '.jpg'));
    try { fs.unlinkSync(path.join(OUT, slug + '.png')); } catch {}
    setFM(slug, { image: '/images/blog/' + slug + '.jpg', imageAlt: has.alt || `${covers[slug].l1} ${covers[slug].l2}` });
    photo++; process.stdout.write('.');
  } else if (has && KEEP.has(slug)) {
    if (addInline(slug, has.img.replace(/q=\d+/, 'q=80'), has.alt || '')) inline++;
    kept++;
  } else {
    kept++;
  }
}
console.log(`\ncapas-foto: ${photo} | mantêm ilustração: ${kept} | inline: ${inline}`);

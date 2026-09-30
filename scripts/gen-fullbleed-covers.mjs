// Capas FULL-BLEED (foto real de fundo inteiro + scrim + só o título), estilo "warlock".
// Busca foto CC no Wikimedia Commons, filtra por licença livre, baixa e compõe.
// Uso: node scripts/gen-fullbleed-covers.mjs [--montage]
// Requisitos: sharp, Node 18+ (fetch nativo).
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const OUT = 'public/images/blog';
const CACHE = 'covers-src/photos-fb';
fs.mkdirSync(CACHE, { recursive: true });

// slug -> { kicker, l1, l2, q: query no Commons, prefer: regex opcional p/ escolher arquivo }
const MAP = {
  'stratocaster-vs-telecaster':     { kicker: 'GUITARRAS · COMPARATIVO', l1: 'STRATO', l2: 'vs TELE', q: 'Fender Stratocaster guitar' },
  'les-paul-vs-stratocaster':       { kicker: 'GUITARRAS · COMPARATIVO', l1: 'LES PAUL', l2: 'vs STRATO', q: 'Gibson Les Paul guitar' },
  'melhor-guitarra-para-rock':      { kicker: 'GUIAS DE COMPRA · 2026', l1: 'GUITARRA', l2: 'PARA ROCK', q: 'guitarist playing electric guitar concert', prefer: /guitar/i },
  'melhor-guitarra-para-gospel':    { kicker: 'GUIAS DE COMPRA · 2026', l1: 'GUITARRA', l2: 'PARA GOSPEL', q: 'Fender Telecaster guitar' },
  'guitarra-prs-guia-completo':     { kicker: 'GUITARRAS · GUIA', l1: 'GUITARRA', l2: 'PRS', q: 'PRS Paul Reed Smith guitar' },
  'guitarra-schecter-guia-completo':{ kicker: 'GUITARRAS · GUIA', l1: 'GUITARRA', l2: 'SCHECTER', q: 'Schecter electric guitar', prefer: /schecter/i },
  'melhor-guitarra-para-jazz':      { kicker: 'GUIAS DE COMPRA · 2026', l1: 'GUITARRA', l2: 'PARA JAZZ', q: 'archtop jazz guitar' },
  'como-tocar-smoke-on-the-water':  { kicker: 'TUTORIAL · RIFF', l1: 'SMOKE ON', l2: 'THE WATER', q: 'electric guitar closeup' },
  'como-tocar-seven-nation-army':   { kicker: 'TUTORIAL · RIFF', l1: 'SEVEN', l2: 'NATION ARMY', q: 'red electric guitar' },
  'como-tocar-power-chord':         { kicker: 'TUTORIAL · TÉCNICA', l1: 'POWER', l2: 'CHORD', q: 'Gibson SG electric guitar', prefer: /SG|Gibson/i },
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fit = (t, maxW, cap = 92) => Math.min(cap, Math.floor(maxW / (0.6 * Math.max(t.length, 1))));
const stripHtml = (s) => String(s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

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

const FREE = /(cc[\s-]?by|cc[\s-]?by[\s-]?sa|cc0|public domain|pd|pdm|no restrictions|attribution)/i;
const NONFREE = /(fair use|non[\s-]?free|copyright|all rights)/i;

async function searchCommons(q) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent('filetype:bitmap ' + q)}&gsrnamespace=6&gsrlimit=25&prop=imageinfo&iiprop=url|extmetadata|mime|size&iiurlwidth=1600`;
  const res = await fetch(url, { headers: { 'User-Agent': 'SonarMusical-cover-bot/1.0 (contato via site)' } });
  if (!res.ok) throw new Error('commons search ' + res.status);
  const j = await res.json();
  const pages = j?.query?.pages ? Object.values(j.query.pages) : [];
  const out = [];
  for (const p of pages) {
    const ii = p.imageinfo?.[0]; if (!ii) continue;
    const em = ii.extmetadata || {};
    const lic = stripHtml(em.LicenseShortName?.value);
    const usage = stripHtml(em.UsageTerms?.value);
    const licBlob = `${lic} ${usage}`;
    if (NONFREE.test(licBlob) || !FREE.test(licBlob)) continue;
    if (!/image\/(jpeg|png)/.test(ii.mime || '')) continue;
    if ((ii.width || 0) < 1000) continue;
    if ((ii.width || 0) < (ii.height || 1) * 1.15) continue; // preferir paisagem p/ full-bleed
    out.push({
      title: p.title,
      thumburl: ii.thumburl || ii.url,
      url: ii.url,
      w: ii.width, h: ii.height,
      license: lic || usage,
      licenseUrl: stripHtml(em.LicenseUrl?.value),
      artist: stripHtml(em.Artist?.value) || 'Autor desconhecido',
      descUrl: ii.descriptionshorturl || ii.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,
    });
  }
  return out;
}

// slugs passados como argumentos (não-flag) => regenerar só esses
const onlySlugs = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const prevAttrib = fs.existsSync('covers-src/_fullbleed_attrib.json') ? JSON.parse(fs.readFileSync('covers-src/_fullbleed_attrib.json', 'utf8')) : {};

const results = [], attrib = { ...prevAttrib };
for (const [slug, cfg] of Object.entries(MAP)) {
  if (onlySlugs.length && !onlySlugs.includes(slug)) continue;
  try {
    const cands = await searchCommons(cfg.q);
    if (!cands.length) { console.log(`! sem candidato CC p/ ${slug} (q="${cfg.q}")`); continue; }
    if (cfg.prefer) cands.sort((a, b) => (cfg.prefer.test(b.title) ? 1 : 0) - (cfg.prefer.test(a.title) ? 1 : 0));
    const pick = cands[0];
    // baixa a versão 1600px
    const img = await fetch(pick.thumburl, { headers: { 'User-Agent': 'SonarMusical-cover-bot/1.0' } });
    const buf = Buffer.from(await img.arrayBuffer());
    const cachePath = path.join(CACHE, slug + '.img');
    fs.writeFileSync(cachePath, buf);
    const base = await sharp(buf).resize(1200, 675, { fit: 'cover', position: 'attention' }).toBuffer();
    const out = path.join(OUT, slug + '.jpg');
    await sharp(base).composite([{ input: overlay(cfg) }]).jpeg({ quality: 82, mozjpeg: true }).toFile(out);
    try { fs.unlinkSync(path.join(OUT, slug + '.png')); } catch {}
    const kb = Math.round(fs.statSync(out).size / 1024);
    attrib[slug] = { title: pick.title, artist: pick.artist, license: pick.license, licenseUrl: pick.licenseUrl, source: pick.descUrl };
    results.push(slug);
    console.log(`✓ ${slug}.jpg (${kb}KB) <- ${pick.title} [${pick.license}] por ${pick.artist}`);
  } catch (e) {
    console.log(`✗ ${slug}: ${e.message}`);
  }
}

fs.writeFileSync('covers-src/_fullbleed_attrib.json', JSON.stringify(attrib, null, 2));
console.log(`\n${results.length}/${Object.keys(MAP).length} capas full-bleed geradas. Atribuições em covers-src/_fullbleed_attrib.json`);

if (process.argv.includes('--montage') && results.length) {
  const cols = 4, tw = 320, th = 180;
  const rows = Math.ceil(results.length / cols);
  const thumbs = await Promise.all(results.map(async (s) => await sharp(path.join(OUT, `${s}.jpg`)).resize(tw, th).png().toBuffer()));
  const comps = thumbs.map((t, i) => ({ input: t, left: (i % cols) * tw, top: Math.floor(i / cols) * th }));
  await sharp({ create: { width: cols * tw, height: rows * th, channels: 3, background: '#000' } }).composite(comps).png().toFile('covers-src/_fb_montage.png');
  console.log('Montagem: covers-src/_fb_montage.png');
}

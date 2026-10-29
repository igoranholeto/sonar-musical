// Capas FULL-BLEED (foto real de fundo inteiro + scrim + só o título), estilo "warlock".
// Busca foto CC no Wikimedia Commons, filtra por licença livre, baixa e compõe.
// Uso: node scripts/gen-fullbleed-covers.mjs [--montage]
// Requisitos: sharp, Node 18+ (fetch nativo).
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { POSTS } from './gen-covers.mjs';

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
  // Lote 2026-10-05
  'como-fazer-setup-na-guitarra':   { kicker: 'TUTORIAL · MANUTENÇÃO', l1: 'SETUP DE', l2: 'GUITARRA', q: 'luthier guitar repair workbench', prefer: /guitar|luthier/i, avoid: /violin|cello|bass|logo/i },
  'guitarra-para-montar':           { kicker: 'GUITARRAS · DIY', l1: 'GUITARRA', l2: 'PARA MONTAR', q: 'guitar luthier workshop', prefer: /guitar|body/i, avoid: /bass|logo|violin|speed|artwork/i },
  'notas-no-braco-da-guitarra':     { kicker: 'TÉCNICA E TEORIA', l1: 'NOTAS NO', l2: 'BRAÇO', q: 'guitar fingerboard', prefer: /fret|fingerboard|neck|griffbrett/i, avoid: /bass|logo|violin/i },
  'melhor-pedal-de-overdrive':      { kicker: 'PEDAIS · 2026', l1: 'PEDAL DE', l2: 'OVERDRIVE', q: 'Ibanez Tube Screamer overdrive pedal', prefer: /tube screamer|overdrive|ts.?9|ts.?808|blues driver/i, avoid: /logo/i },
  'pedal-wah-wah':                  { kicker: 'PEDAIS · GUIA', l1: 'PEDAL', l2: 'WAH-WAH', q: 'Dunlop Cry Baby wah pedal', prefer: /wah|cry ?baby/i, avoid: /logo/i },
  'capotraste':                     { kicker: 'ACESSÓRIOS · GUIA', l1: 'CAPO', l2: 'TRASTE', q: 'guitar capo', prefer: /capo/i, avoid: /logo|cape|capo di|town|island/i },
  'amplificador-para-violao':       { kicker: 'AMPLIFICADORES · 2026', l1: 'AMP PARA', l2: 'VIOLÃO', q: 'acoustic guitar on stage microphone', prefer: /acoustic/i, avoid: /bass|logo|violin/i },
  'guitarra-canhota':               { kicker: 'GUITARRAS · GUIA', l1: 'GUITARRA', l2: 'CANHOTA', q: 'left-handed electric guitar', prefer: /left/i, avoid: /bass|logo/i },
  'como-tocar-come-as-you-are-nirvana': { kicker: 'TUTORIAL · RIFF', l1: 'COME AS', l2: 'YOU ARE', q: 'Fender Jaguar guitar', prefer: /jaguar|mustang|jag-stang/i, avoid: /car|automobile|bass|logo/i },
  // Lote 2026-10-16
  'melhor-guitarra-ate-1000-reais': { kicker: 'GUIAS DE COMPRA · 2026', l1: 'GUITARRA', l2: 'ATÉ R$ 1.000', q: 'stratocaster style electric guitar', prefer: /guitar|strat/i, avoid: /bass|logo|amp/i },
  'melhor-guitarra-ate-2000-reais': { kicker: 'GUIAS DE COMPRA · 2026', l1: 'GUITARRA', l2: 'ATÉ R$ 2.000', q: 'electric guitar on stage sunburst', prefer: /guitar/i, avoid: /bass|logo|amp/i },
  'melhor-pedaleira-custo-beneficio': { kicker: 'PEDAIS · 2026', l1: 'PEDALEIRA', l2: 'CUSTO-BENEFÍCIO', q: 'guitar multi-effects processor', prefer: /multi|effect|processor|pedal/i, avoid: /logo/i },
  'pedais-de-guitarra-baratos':     { kicker: 'PEDAIS · GUIA', l1: 'PEDAIS', l2: 'BARATOS', q: 'effects pedals guitar floor', prefer: /pedal|stomp/i, avoid: /logo|car|bicycle|piano|organ/i },
  'melhor-violao-para-iniciante':   { kicker: 'VIOLÕES · 2026', l1: 'VIOLÃO PARA', l2: 'INICIANTE', q: 'acoustic guitar steel string', prefer: /acoustic/i, avoid: /bass|logo|electric/i },
  'violao-nylon-ou-aco':            { kicker: 'VIOLÕES · GUIA', l1: 'NYLON', l2: 'OU AÇO?', q: 'classical guitar nylon strings', prefer: /classical|nylon|spanish/i, avoid: /bass|logo|electric/i },
  'guitarra-condor-e-boa':          { kicker: 'GUITARRAS · MARCAS', l1: 'CONDOR', l2: 'É BOA?', q: 'red stratocaster electric guitar', prefer: /guitar|strat/i, avoid: /bass|logo|amp/i },
  'guitarra-waldman-e-boa':         { kicker: 'GUITARRAS · MARCAS', l1: 'WALDMAN', l2: 'É BOA?', q: 'electric guitar locking tremolo black', prefer: /guitar/i, avoid: /bass|logo|amp|diagram|hint|svg|png|farsi|persian/i },
  'melhor-baixo-para-iniciante':    { kicker: 'BAIXO · 2026', l1: 'BAIXO PARA', l2: 'INICIANTE', q: 'Fender Precision Bass guitar', prefer: /precision|bass/i, avoid: /logo|fish|amp|player|concert|stage/i },
  'melhor-pedal-de-delay':          { kicker: 'PEDAIS · 2026', l1: 'PEDAL DE', l2: 'DELAY', q: 'delay pedal guitar effect', prefer: /delay|echo/i, avoid: /logo/i },
  'como-tocar-guitarra-com-fone':   { kicker: 'TUTORIAL · EM CASA', l1: 'GUITARRA', l2: 'COM FONE', q: 'headphones electric guitar', prefer: /headphone/i, avoid: /bass|logo|dj/i },
  // Lote 2026-10-17
  'jazz-bass-vs-precision-bass':    { kicker: 'BAIXO · COMPARATIVO', l1: 'JAZZ BASS', l2: 'vs PRECISION', q: 'Fender Jazz Bass guitar', prefer: /jazz.?bass/i, avoid: /logo|player|concert|stage|amp|live/i },
  'baixo-ativo-ou-passivo':         { kicker: 'BAIXO · GUIA', l1: 'BAIXO ATIVO', l2: 'OU PASSIVO?', q: 'five string bass guitar', prefer: /bass/i, avoid: /logo|player|concert|stage|live|fish/i },
  'baixo-4-ou-5-cordas':            { kicker: 'BAIXO · GUIA', l1: 'BAIXO 4 OU', l2: '5 CORDAS?', q: 'five string bass', prefer: /Five Strings Bass Guitar Head/i },
  'melhor-amplificador-para-baixo': { kicker: 'AMPLIFICADORES · 2026', l1: 'AMP PARA', l2: 'BAIXO', q: 'bass amplifier combo', prefer: /bass/i, avoid: /logo|fish|car|stereo|hifi/i },
  'cordas-de-baixo':                { kicker: 'BAIXO · ACESSÓRIOS', l1: 'CORDAS DE', l2: 'BAIXO', q: 'bass guitar strings', prefer: /Neck of Five Strings Bass Guitar/i },
  'melhor-pedal-de-reverb':         { kicker: 'PEDAIS · 2026', l1: 'PEDAL DE', l2: 'REVERB', q: 'reverb pedal guitar effect', prefer: /reverb/i, avoid: /logo/i },
  'melhor-pedal-compressor':        { kicker: 'PEDAIS · 2026', l1: 'PEDAL', l2: 'COMPRESSOR', q: 'compressor pedal', prefer: /Boss CS-3 Compression/i },
  'melhor-pedal-looper':            { kicker: 'PEDAIS · 2026', l1: 'PEDAL', l2: 'LOOPER', q: 'loop station pedal guitar', prefer: /loop/i, avoid: /logo/i },
  'fonte-para-pedal':               { kicker: 'PEDAIS · ACESSÓRIOS', l1: 'FONTE PARA', l2: 'PEDAL', q: 'guitar pedalboard effects', prefer: /pedalboard|pedal board|pedals/i, avoid: /logo|bicycle|car|piano|organ/i },
  'melhor-pedal-de-chorus':         { kicker: 'PEDAIS · 2026', l1: 'PEDAL DE', l2: 'CHORUS', q: 'Electro-Harmonix SmallClone chorus', prefer: /SmallClone/i },
  // Lote 2026-10-22
  'escala-maior-guitarra':          { kicker: 'TÉCNICA E TEORIA', l1: 'ESCALA', l2: 'MAIOR', q: 'guitar fretboard', prefer: /Neck and Fretboard of an Old Guitar/i },
  'campo-harmonico-guitarra':       { kicker: 'TÉCNICA E TEORIA', l1: 'CAMPO', l2: 'HARMÔNICO', q: 'barre chord guitar', prefer: /barre/i },
  'modos-gregos-guitarra':          { kicker: 'TÉCNICA E TEORIA', l1: 'MODOS', l2: 'GREGOS', q: 'guitarist guitar solo concert', prefer: /guitar/i, avoid: /bass|logo|violin/i },
  'arpejos-na-guitarra':            { kicker: 'TÉCNICA E TEORIA', l1: 'ARPEJOS NA', l2: 'GUITARRA', q: 'guitar fretboard', prefer: /File:Guitar fretboard closeup/i },
  'palm-mute-guitarra':             { kicker: 'TÉCNICA · MÃO DIREITA', l1: 'PALM', l2: 'MUTE', q: 'James Hetfield Metallica guitar', prefer: /Hetfield with Metallica -- 7 October 2004/i },
  'tapping-guitarra':               { kicker: 'TÉCNICA E TEORIA', l1: 'TAPPING NA', l2: 'GUITARRA', q: 'guitar tapping', prefer: /tapping|tap/i, avoid: /bass|logo|beer|water|stick/i },
  'vibrato-na-guitarra':            { kicker: 'TÉCNICA E TEORIA', l1: 'VIBRATO NA', l2: 'GUITARRA', q: 'man playing guitar sitting', prefer: /Alvin Madison/i },
  'slide-na-guitarra':              { kicker: 'TÉCNICA · 2026', l1: 'SLIDE NA', l2: 'GUITARRA', q: 'slide guitar bottleneck', prefer: /slide|bottleneck/i, avoid: /logo|lap steel|dobro|playground|water/i },
  'acordes-com-setima':             { kicker: 'TÉCNICA E TEORIA', l1: 'ACORDES COM', l2: 'SÉTIMA', q: 'acoustic guitar chord hand', prefer: /chord|hand/i, avoid: /bass|logo|violin|ukulele|diagram|chart/i },
  'quanto-tempo-praticar-guitarra-por-dia': { kicker: 'DICAS PARA INICIANTES', l1: 'QUANTO', l2: 'PRATICAR?', q: 'man playing guitar sitting', prefer: /Man-person-sitting-playing/i },
  // Lote 2026-10-29 (pautas top 3)
  'amplificador-meteoro-e-bom':     { kicker: 'AMPLIFICADORES · MARCAS', l1: 'METEORO', l2: 'É BOM?', q: 'combo amplifier guitar', prefer: /Guitar Amplifier Details/i },
  'amplificador-borne-e-bom':       { kicker: 'AMPLIFICADORES · MARCAS', l1: 'BORNE', l2: 'É BOM?', q: 'guitar amp knobs', prefer: /A close view of a vintage guitar amplifier/i },
  'fender-frontman-10g-e-bom':      { kicker: 'AMPLIFICADORES · REVIEW', l1: 'FRONTMAN', l2: '10G É BOM?', q: 'Fender Frontman amplifier', prefer: /frontman|fender/i, avoid: /bass|logo|car/i },
  'nux-mg-300-e-boa':               { kicker: 'PEDAIS · REVIEW', l1: 'NUX MG-300', l2: 'É BOA?', q: 'guitarist playing live stage', prefer: /DFC 5450 Solo guitarist/i },
  'valeton-gp-200-vale-a-pena':     { kicker: 'PEDAIS · REVIEW', l1: 'VALETON', l2: 'GP-200', q: 'guitar effects pedalboard stage', prefer: /pedal|effect|processor/i, avoid: /logo|car|bicycle|piano|organ/i },
  'violao-tagima-e-bom':            { kicker: 'VIOLÕES · MARCAS', l1: 'VIOLÃO', l2: 'TAGIMA', q: 'acoustic electric guitar cutaway', prefer: /cutaway|acoustic/i, avoid: /bass|logo|ukulele|violin|cello/i },
  'violao-giannini-e-bom':          { kicker: 'VIOLÕES · MARCAS', l1: 'VIOLÃO', l2: 'GIANNINI', q: 'acoustic guitar steel string dreadnought', prefer: /acoustic|dreadnought|giannini/i, avoid: /bass|logo|ukulele|violin|cello|electric/i },
  'violao-yamaha-f310-e-bom':       { kicker: 'VIOLÕES · REVIEW', l1: 'YAMAHA', l2: 'F310', q: 'folk acoustic guitar', prefer: /acoustic|folk/i, avoid: /bass|logo|ukulele|violin|cello|electric|label|martin|taylor|gibson|ibanez/i },
  'tagima-tg-510-e-boa':            { kicker: 'GUITARRAS · REVIEW', l1: 'TAGIMA', l2: 'TG-510', q: 'black stratocaster electric guitar', prefer: /strat/i, avoid: /bass|logo|amp/i },
  'melhor-corda-para-violao':       { kicker: 'ACESSÓRIOS · 2026', l1: 'CORDAS DE', l2: 'VIOLÃO', q: 'acoustic guitar strings close up', prefer: /string/i, avoid: /bass|logo|violin|cello|harp|piano|electric/i },
};

// Posts com MOTIVO de guitarra (texto vem do POSTS de gen-covers; aqui só a query da foto CC).
// prefer = regex que reordena candidatos por título p/ acertar o modelo certo.
const GUIT = {
  'guitarra-eletrica-guia-completo':               { q: 'electric guitar sunburst' },
  'guitarra-stratocaster-guia-completo':           { q: 'Fender Stratocaster guitar', prefer: /stratocaster/i },
  'guitarra-les-paul-guia-completo':               { q: 'Gibson Les Paul guitar', prefer: /les paul/i },
  'guitarra-telecaster-guia-completo':             { q: 'Fender Telecaster guitar', prefer: /telecaster/i },
  'guitarra-sg-guia-completo':                     { q: 'Gibson SG guitar', prefer: /\bSG\b/i },
  'guitarra-flying-v-guia-completo':               { q: 'Flying V guitar', prefer: /flying/i },
  'guitarra-explorer-guia-completo':               { q: 'Gibson Explorer guitar', prefer: /explorer/i },
  'guitarra-ibanez-guia-completo':                 { q: 'Ibanez electric guitar', prefer: /ibanez/i },
  'guitarra-jackson-guia-completo':                { q: 'Jackson electric guitar', prefer: /jackson/i },
  'guitarra-yamaha-guia-completo':                 { q: 'Yamaha Pacifica guitar', prefer: /yamaha|pacifica|revstar/i },
  'guitarra-semi-acustica-guia-completo':          { q: 'Gibson ES-335 semi-hollow guitar', prefer: /es.?335|semi|hollow|casino|dot/i },
  'guitarra-8-cordas-guia-completo':               { q: '8 string electric guitar', prefer: /8|eight|multiscale/i },
  'guitarra-de-12-cordas-guia-completo':           { q: '12 string electric guitar', prefer: /12|twelve/i },
  'guitarra-strinberg-guia-completo':              { q: 'stratocaster style electric guitar black', avoid: /bass|amp|logo/i },
  'guitarra-tagima-e-boa':                         { q: 'Tagima guitar Brazil', prefer: /tagima/i },
  'guitarra-giannini-vale-a-pena':                 { q: 'electric guitar single cut sunburst', avoid: /bass|amp|logo/i },
  'guitarra-seizi-guia-completo':                  { q: 'cherry electric guitar body', avoid: /bass|amp|booth|namm|logo|playmate|woman|girl/i },
  'guitarra-memphis-guia-completo':                { q: 'Tagima Memphis guitar', prefer: /memphis/i },
  'guitarras-nacionais-baratas':                   { q: 'affordable electric guitar' },
  'melhores-marcas-de-guitarra-nacionais':         { q: 'wall of electric guitars store', avoid: /bass|amp|logo|playmate|woman|girl|model|wylde|hendrix|clapton/i },
  'tagima-vs-squier':                              { q: 'Squier Stratocaster guitar', prefer: /squier/i },
  'squier-vs-fender':                              { q: 'Fender Stratocaster sunburst body', prefer: /fender|stratocaster|squier/i, avoid: /bass|amp|headstock|logo/i },
  'squier-classic-vibe-60s-stratocaster-review':   { q: 'Squier Classic Vibe Stratocaster', prefer: /squier|classic vibe|stratocaster/i },
  'tipos-de-guitarra-eletrica':                    { q: 'electric guitars collection wall' },
  'partes-da-guitarra-eletrica':                   { q: 'electric guitar body detail' },
  'glossario-de-guitarra':                         { q: 'electric guitar headstock detail' },
  'quem-inventou-a-guitarra-eletrica':             { q: 'vintage Fender Telecaster 1950s', prefer: /telecaster|stratocaster|fender|gibson|vintage/i, avoid: /amp|vox|bass|logo/i },
  'quantas-cordas-tem-uma-guitarra':               { q: 'electric guitar strings headstock', avoid: /amp|bass|tuner|logo/i },
  'guitarra-ou-baixo':                             { q: 'electric guitar and bass guitar', prefer: /bass/i },
  'guitarra-com-amplificador-kit-iniciante':       { q: 'electric guitar leaning on amplifier', prefer: /guitar/i, avoid: /amplifier head|tube amplifier|amp head/i },
  'guitarra-eletrica-usada-o-que-verificar':       { q: 'used electric guitar' },
  'guitarra-eletrica-profissional-guia-2026':      { q: 'professional electric guitar stage' },
  'melhor-guitarra-para-metal':                    { q: 'ESP guitar metal black', prefer: /esp|ltd|schecter|jackson|bc rich|pointed|explorer/i, avoid: /bass|amp|logo/i },
  'melhor-guitarra-para-blues':                    { q: 'blues electric guitar stratocaster' },
  'melhor-guitarra-7-cordas-2026':                 { q: 'seven string electric guitar Ibanez', prefer: /(7|seven).*(string|guitar)|ibanez rg|schecter/i, avoid: /bass|amp|logo/i },
  'melhor-guitarra-ate-3000-reais':                { q: 'electric guitar sunburst studio' },
  'melhor-guitarra-ate-5000-reais':                { q: 'electric guitar red' },
  'melhor-guitarra-eletrica-infantil':             { q: 'small electric guitar' },
  'melhores-guitarras-eletricas-para-iniciantes-2026': { q: 'electric guitar red body', prefer: /guitar/i, avoid: /band|singer|vocal|microphone|bass|logo/i },
  'quanto-custa-uma-guitarra-eletrica':            { q: 'electric guitar shop' },
  'quanto-custa-ser-guitarrista-no-brasil':        { q: 'guitarist playing electric guitar', prefer: /guitar/i, avoid: /vocal|singer|microphone|drum/i },
  'precos-equipamento-guitarra-brasil-2026':       { q: 'guitar amplifier pedals rig', prefer: /guitar|pedal|amp/i, avoid: /logo/i },
  'vale-a-pena-importar-guitarra':                 { q: 'electric guitar flight case', prefer: /guitar/i, avoid: /card|logo|sign/i },
  'onde-comprar-guitarra-no-brasil':               { q: 'guitar store electric guitars' },
  'melhores-presentes-para-guitarristas':          { q: 'electric guitar gift' },
  'presente-de-natal-para-guitarrista':            { q: 'electric guitar accessories', prefer: /guitar/i, avoid: /bass|logo/i },
  'presente-para-quem-esta-comecando-na-guitarra': { q: 'electric guitar on stand', prefer: /guitar/i, avoid: /bass|logo|band|singer/i },
  'epiphone-les-paul-vale-a-pena':                 { q: 'Epiphone Les Paul guitar', prefer: /epiphone/i },
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function searchCommons(q) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent('filetype:bitmap ' + q)}&gsrnamespace=6&gsrlimit=25&prop=imageinfo&iiprop=url|extmetadata|mime|size&iiurlwidth=1600`;
  let res;
  for (let attempt = 0; attempt < 5; attempt++) {
    res = await fetch(url, { headers: { 'User-Agent': 'SonarMusical-cover-bot/1.0 (contato via site sonarmusical.com.br)' } });
    if (res.ok) break;
    if (res.status === 429 || res.status === 503) { await sleep(3000 * (attempt + 1)); continue; }
    throw new Error('commons search ' + res.status);
  }
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
    if (/logo|company logo|\bsign\b|signage|poster|diagram|sticker|banner|nameplate|wordmark/i.test(p.title)) continue;
    if ((ii.width || 0) < 1000) continue;
    const landscape = (ii.width || 0) >= (ii.height || 1) * 1.15;
    out.push({
      landscape,
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
  out.sort((a, b) => (b.landscape ? 1 : 0) - (a.landscape ? 1 : 0));
  return out;
}

// monta a lista de trabalho: MAP explícito + GUIT (texto vindo do POSTS de gen-covers)
const WORK = { ...MAP };
for (const [slug, g] of Object.entries(GUIT)) {
  const p = POSTS.find((x) => x.slug === slug);
  if (!p) { console.log('! slug fora do POSTS de gen-covers: ' + slug); continue; }
  WORK[slug] = { kicker: p.kicker, l1: p.l1, l2: p.l2, q: g.q, prefer: g.prefer };
}

// args: slugs específicos, ou --guitars p/ rodar só o conjunto GUIT
const flags = process.argv.slice(2).filter((a) => a.startsWith('--'));
const onlySlugs = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const guitarsOnly = flags.includes('--guitars');
const prevAttrib = fs.existsSync('covers-src/_fullbleed_attrib.json') ? JSON.parse(fs.readFileSync('covers-src/_fullbleed_attrib.json', 'utf8')) : {};

// dedup: nenhuma foto repetida entre capas (inclui as já atribuídas antes)
const usedTitles = new Set(Object.values(prevAttrib).map((a) => a.title));

const results = [], attrib = { ...prevAttrib };
const force = flags.includes('--force');
for (const [slug, cfg] of Object.entries(WORK)) {
  if (onlySlugs.length && !onlySlugs.includes(slug)) continue;
  if (guitarsOnly && !GUIT[slug]) continue;
  // pula as já feitas (a menos que --force ou slug explícito)
  if (!force && !onlySlugs.length && attrib[slug] && fs.existsSync(path.join(OUT, slug + '.jpg'))) { continue; }
  try {
    await sleep(1500); // respeita o rate limit do Commons
    const cands = await searchCommons(cfg.q);
    if (!cands.length) { console.log(`! sem candidato CC p/ ${slug} (q="${cfg.q}")`); continue; }
    if (cfg.prefer) cands.sort((a, b) => ((cfg.prefer.test(b.title) ? 1 : 0) - (cfg.prefer.test(a.title) ? 1 : 0)) || ((b.landscape ? 1 : 0) - (a.landscape ? 1 : 0)));
    const ok = (c) => !usedTitles.has(c.title) && !(cfg.avoid && cfg.avoid.test(c.title));
    const pick = cands.find(ok) || cands.find((c) => !usedTitles.has(c.title)) || cands[0];
    usedTitles.add(pick.title);
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

// Atualiza preço (e opcionalmente o link) dos AfiliadoCTA por link antigo.
// MAP: urlAntiga -> { p: 'preço', u: 'urlNova' (opcional) }. Rode:
//   node scripts/update-precos.mjs
import fs from 'node:fs';
import path from 'node:path';

const MAP = {
  'https://meli.la/16dunp6': { p: '168' },      // Boss TU-3 Afinador
  'https://meli.la/2N4yRFz': { p: '1.649' },    // Bugera V5 Infinium
  'https://meli.la/1R6NUQC': { p: '670' },      // Captadores Malagoli
  'https://meli.la/1CZirBN': { p: '10.266' },   // Cort KX508 Multi Scale
  'https://meli.la/1Cbj7PW': { p: '138' },      // D'Addario NYXL 10-46
  'https://meli.la/1PzL49U': { p: '1.195' },    // DiMarzio Super Distortion DP100
  'https://meli.la/1ggdyxw': { p: '217' },      // Elixir Optiweb 10-46
  'https://meli.la/19FLPov': { p: '2.200', u: 'https://meli.la/2L2QpTr' }, // EMG 81/85 Set (novo link)
  'https://meli.la/2cdzCQ5': { p: '6.652' },    // Epiphone Les Paul Standard 50s
  'https://meli.la/1YbxQhF': { p: '127' },      // Ernie Ball Cobalt 10-46
  'https://meli.la/1SoYw2C': { p: '60' },       // Ernie Ball Regular Slinky 10-46
  'https://meli.la/14Y2Ev9': { p: '19.480' },   // Fender American Pro II Stratocaster
  'https://meli.la/1CcEWT2': { p: '5.010', u: 'https://meli.la/2nGSRQY' }, // Fender Blues Junior IV (novo link)
  'https://meli.la/257H32N': { p: '3.390' },    // Fender CD-60S
  'https://meli.la/1ddXKx6': { p: '1.953' },    // Fender Frontman 10G
  'https://meli.la/2LuL5jw': { p: '4.373', u: 'https://meli.la/1FpbGiK' }, // Fender Mustang GTX50 (novo link)
  'https://meli.la/2tChgoP': { p: '10.987', u: 'https://meli.la/2Gfnn35' }, // Fender Player Stratocaster (novo link)
};

const dir = 'src/data/blog';
const files = fs.readdirSync(dir).filter((f) => /\.mdx$/.test(f));
const counts = {};
for (const f of files) {
  const p = path.join(dir, f);
  let t = fs.readFileSync(p, 'utf8');
  let changed = false;
  t = t.replace(/<AfiliadoCTA\b[\s\S]*?\/>/g, (block) => {
    const um = block.match(/url\s*=\s*"([^"]*)"/);
    if (!um || !(um[1] in MAP)) return block;
    const { p: preco, u: novoUrl } = MAP[um[1]];
    counts[um[1]] = (counts[um[1]] || 0) + 1;
    changed = true;
    let out = block.replace(/preco\s*=\s*"[^"]*"/, `preco="A partir de R$ ${preco}"`);
    if (novoUrl) out = out.replace(/url\s*=\s*"[^"]*"/, `url="${novoUrl}"`);
    return out;
  });
  if (changed) fs.writeFileSync(p, t);
}
console.log(`Links atualizados: ${Object.keys(counts).length}/${Object.keys(MAP).length}`);
for (const u of Object.keys(MAP)) {
  const m = MAP[u];
  console.log(`  ${counts[u] ? '✓ ' + counts[u] + 'x' : '✗ 0x'}  R$ ${m.p}${m.u ? '  (novo link ' + m.u + ')' : ''}  <- ${u}`);
}

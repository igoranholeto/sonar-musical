// Envia URLs ao IndexNow. Basta um endpoint: o Bing repassa a lista aos outros buscadores
// participantes (Yandex, Seznam, Naver, Yep). Mandar a mesma lista a vários endpoints só
// triplicava a contagem no painel do Bing (3,1 mil URLs num dia com 1.064 no site).
// Espera cada URL responder 200 no ar antes de enviar (deploy do Netlify leva ~1 min).
// Uso:
//   node scripts/indexnow.mjs https://sonarmusical.com.br/blog/slug/ ...
//   node scripts/indexnow.mjs --slugs slug-a slug-b        (vira /blog/<slug>/)
//   node scripts/indexnow.mjs --sitemap                    (URLs do sitemap no ar cujo lastmod
//     mudou desde o último envio; o IndexNow pede só páginas novas ou alteradas)
//   node scripts/indexnow.mjs --sitemap --tudo             (todas, ignora o último envio)
import fs from 'node:fs';

const KEY = '5469a95b822a0e5ffc2379e28e60c0ed';
const HOST = 'sonarmusical.com.br';
// Maior lastmod já enviado no modo --sitemap (fora do git).
const ULTIMO = 'privado/indexnow-ultimo.txt';

const args = process.argv.slice(2);
const modoSitemap = args.includes('--sitemap');
let maiorLastmod = '';
const doSitemap = async () => {
  const xml = await (await fetch(`https://${HOST}/sitemap-0.xml`)).text();
  const itens = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
    loc: m[1].match(/<loc>([^<]+)<\/loc>/)?.[1],
    lastmod: m[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? '',
  })).filter((i) => i.loc);
  maiorLastmod = itens.reduce((max, i) => (i.lastmod > max ? i.lastmod : max), '');
  const desde = args.includes('--tudo') || !fs.existsSync(ULTIMO) ? '' : fs.readFileSync(ULTIMO, 'utf8').trim();
  // Sem lastmod a URL vai sempre (não dá para saber se mudou).
  const novas = itens.filter((i) => !desde || !i.lastmod || i.lastmod > desde);
  console.log(`Sitemap: ${itens.length} URLs, ${novas.length} ${desde ? `com lastmod depois de ${desde}` : 'enviadas (sem envio anterior ou --tudo)'}.`);
  return novas.map((i) => i.loc);
};
const urls = modoSitemap
  ? await doSitemap()
  : args.includes('--slugs')
    ? args.filter((a) => a !== '--slugs').map((s) => `https://${HOST}/blog/${s}/`)
    : args;
if (!urls.length) {
  if (modoSitemap) {
    console.log('Nada mudou no sitemap desde o último envio.');
    process.exit(0);
  }
  console.error('Nenhuma URL informada.');
  process.exit(1);
}
// No modo sitemap as URLs já estão no ar: confere só a primeira e a última.
const conferir = modoSitemap ? [urls[0], urls[urls.length - 1]] : urls;

const sleep = (ms) => new Promise((ok) => setTimeout(ok, ms));
for (const u of conferir) {
  let status = 0;
  for (let i = 0; i < 40; i++) {
    status = (await fetch(u, { method: 'HEAD' }).catch(() => ({ status: 0 }))).status;
    if (status === 200) break;
    await sleep(15000);
  }
  if (status !== 200) {
    console.error(`Fora do ar (${status}): ${u}. Nada foi enviado.`);
    process.exit(2);
  }
}

const body = JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls });
const enviar = (ep) => fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body })
  .then((r) => r.status).catch((e) => e.message);
// Bing primeiro; o endpoint genérico só entra se o Bing recusar.
let ok = false;
for (const ep of ['https://www.bing.com/indexnow', 'https://api.indexnow.org/indexnow']) {
  const status = await enviar(ep);
  console.log(`${ep}: ${status}`);
  if (status === 200 || status === 202) {
    ok = true;
    break;
  }
}
if (!ok) {
  console.error('Nenhum endpoint aceitou o envio.');
  process.exit(3);
}
if (modoSitemap && maiorLastmod) fs.writeFileSync(ULTIMO, maiorLastmod + '\n');
console.log(`${urls.length} URLs enviadas.`);

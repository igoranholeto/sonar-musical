// Envia URLs ao IndexNow (Bing, Yandex, Seznam e outros buscadores participantes).
// Espera cada URL responder 200 no ar antes de enviar (deploy do Netlify leva ~1 min).
// Uso:
//   node scripts/indexnow.mjs https://sonarmusical.com.br/blog/slug/ ...
//   node scripts/indexnow.mjs --slugs slug-a slug-b        (vira /blog/<slug>/)
const KEY = '5469a95b822a0e5ffc2379e28e60c0ed';
const HOST = 'sonarmusical.com.br';

const args = process.argv.slice(2);
const urls = args.includes('--slugs')
  ? args.filter((a) => a !== '--slugs').map((s) => `https://${HOST}/blog/${s}/`)
  : args;
if (!urls.length) {
  console.error('Nenhuma URL informada.');
  process.exit(1);
}

const sleep = (ms) => new Promise((ok) => setTimeout(ok, ms));
for (const u of urls) {
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
for (const ep of ['https://api.indexnow.org/indexnow', 'https://www.bing.com/indexnow', 'https://yandex.com/indexnow']) {
  const r = await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body }).catch((e) => ({ status: e.message }));
  console.log(`${ep}: ${r.status}`);
}
console.log(`${urls.length} URLs enviadas.`);

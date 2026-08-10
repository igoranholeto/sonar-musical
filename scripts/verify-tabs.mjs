// Verifica URLs do CifraClub (200) para candidatas a tablatura e emite as válidas.
// Uso: node scripts/verify-tabs.mjs
import fs from 'node:fs';

const preview = {
  metallica: '/images/metallica-gershwin-2024-sonar.webp',
  'iron-maiden': '/images/iron-maiden-madrid-2016-sonar.webp',
  'pink-floyd': '/images/pink-floyd-sonar.webp',
  coldplay: '/images/coldplay-wembley-2025-sonar.webp',
  'legiao-urbana': '/images/legiao-urbana-banda-sonar.webp',
  'capital-inicial': '/images/capital-inicial-live-sonar.jpg',
  'charlie-brown-jr': '/images/charlie-brown-jr-chorao-sonar.jpg',
  titas: '/images/titas-live-2012-sonar.jpg',
  ghost: '/images/ghost-wacken-2018-sonar.jpg',
  'avenged-sevenfold': '/images/avenged-sevenfold-live-2009-sonar.jpg',
  'the-weeknd': '/images/the-weeknd-abel-sonar.jpg',
  'bruno-mars': '/images/bruno-mars-24k-tour-sonar.webp',
  'jorge-e-mateus': '/images/jorge-e-mateus-show-sonar.jpg',
  'chitaozinho-e-xororo': '/images/capa-xitaozinho-sona.webp',
  'bb-king': '/images/bb-king-1987-sonar.webp',
};

// [titulo, artista, artistaSlug(banda), ccArtist, ccSong, dificuldade, genero]
const C = [
  ['Master of Puppets', 'Metallica', 'metallica', 'metallica', 'master-of-puppets', 'Avançado', 'Metal'],
  ['One', 'Metallica', 'metallica', 'metallica', 'one', 'Avançado', 'Metal'],
  ['Fade to Black', 'Metallica', 'metallica', 'metallica', 'fade-to-black', 'Intermediário', 'Metal'],
  ['Seek & Destroy', 'Metallica', 'metallica', 'metallica', 'seek-and-destroy', 'Intermediário', 'Metal'],
  ['For Whom the Bell Tolls', 'Metallica', 'metallica', 'metallica', 'for-whom-the-bell-tolls', 'Intermediário', 'Metal'],
  ['Run to the Hills', 'Iron Maiden', 'iron-maiden', 'iron-maiden', 'run-to-the-hills', 'Intermediário', 'Metal'],
  ['The Number of the Beast', 'Iron Maiden', 'iron-maiden', 'iron-maiden', 'the-number-of-the-beast', 'Intermediário', 'Metal'],
  ['Hallowed Be Thy Name', 'Iron Maiden', 'iron-maiden', 'iron-maiden', 'hallowed-be-thy-name', 'Avançado', 'Metal'],
  ['2 Minutes to Midnight', 'Iron Maiden', 'iron-maiden', 'iron-maiden', '2-minutes-to-midnight', 'Intermediário', 'Metal'],
  ['Wasted Years', 'Iron Maiden', 'iron-maiden', 'iron-maiden', 'wasted-years', 'Intermediário', 'Metal'],
  ['Comfortably Numb', 'Pink Floyd', 'pink-floyd', 'pink-floyd', 'comfortably-numb', 'Intermediário', 'Rock'],
  ['Another Brick in the Wall', 'Pink Floyd', 'pink-floyd', 'pink-floyd', 'another-brick-in-the-wall-part-2', 'Fácil', 'Rock'],
  ['Time', 'Pink Floyd', 'pink-floyd', 'pink-floyd', 'time', 'Intermediário', 'Rock'],
  ['Money', 'Pink Floyd', 'pink-floyd', 'pink-floyd', 'money', 'Intermediário', 'Rock'],
  ['Hey You', 'Pink Floyd', 'pink-floyd', 'pink-floyd', 'hey-you', 'Intermediário', 'Rock'],
  ['The Scientist', 'Coldplay', 'coldplay', 'coldplay', 'the-scientist', 'Fácil', 'Pop'],
  ['Viva la Vida', 'Coldplay', 'coldplay', 'coldplay', 'viva-la-vida', 'Fácil', 'Pop'],
  ['Fix You', 'Coldplay', 'coldplay', 'coldplay', 'fix-you', 'Fácil', 'Pop'],
  ['Clocks', 'Coldplay', 'coldplay', 'coldplay', 'clocks', 'Intermediário', 'Pop'],
  ['Paradise', 'Coldplay', 'coldplay', 'coldplay', 'paradise', 'Fácil', 'Pop'],
  ['Eduardo e Mônica', 'Legião Urbana', 'legiao-urbana', 'legiao-urbana', 'eduardo-e-monica', 'Fácil', 'Nacional'],
  ['Pais e Filhos', 'Legião Urbana', 'legiao-urbana', 'legiao-urbana', 'pais-e-filhos', 'Fácil', 'Nacional'],
  ['Faroeste Caboclo', 'Legião Urbana', 'legiao-urbana', 'legiao-urbana', 'faroeste-caboclo', 'Intermediário', 'Nacional'],
  ['Que País É Este', 'Legião Urbana', 'legiao-urbana', 'legiao-urbana', 'que-pais-e-este', 'Fácil', 'Nacional'],
  ['Primeiros Erros', 'Capital Inicial', 'capital-inicial', 'capital-inicial', 'primeiros-erros', 'Fácil', 'Nacional'],
  ['À Sua Maneira', 'Capital Inicial', 'capital-inicial', 'capital-inicial', 'a-sua-maneira', 'Fácil', 'Nacional'],
  ['Só os Loucos Sabem', 'Charlie Brown Jr.', 'charlie-brown-jr', 'charlie-brown-jr', 'so-os-loucos-sabem', 'Fácil', 'Nacional'],
  ['Zóio de Lula', 'Charlie Brown Jr.', 'charlie-brown-jr', 'charlie-brown-jr', 'zoio-de-lula', 'Intermediário', 'Nacional'],
  ['Epitáfio', 'Titãs', 'titas', 'titas', 'epitafio', 'Fácil', 'Nacional'],
  ['Comida', 'Titãs', 'titas', 'titas', 'comida', 'Fácil', 'Nacional'],
  ['Sonífera Ilha', 'Titãs', 'titas', 'titas', 'sonifera-ilha', 'Intermediário', 'Nacional'],
  ['Cirice', 'Ghost', 'ghost', 'ghost', 'cirice', 'Intermediário', 'Metal'],
  ['Dance Macabre', 'Ghost', 'ghost', 'ghost', 'dance-macabre', 'Intermediário', 'Metal'],
  ['Bat Country', 'Avenged Sevenfold', 'avenged-sevenfold', 'avenged-sevenfold', 'bat-country', 'Avançado', 'Metal'],
  ['Afterlife', 'Avenged Sevenfold', 'avenged-sevenfold', 'avenged-sevenfold', 'afterlife', 'Avançado', 'Metal'],
  ['Save Your Tears', 'The Weeknd', 'the-weeknd', 'the-weeknd', 'save-your-tears', 'Fácil', 'R&B'],
  ['Starboy', 'The Weeknd', 'the-weeknd', 'the-weeknd', 'starboy', 'Fácil', 'R&B'],
  ['Just the Way You Are', 'Bruno Mars', 'bruno-mars', 'bruno-mars', 'just-the-way-you-are', 'Fácil', 'Pop'],
  ['Grenade', 'Bruno Mars', 'bruno-mars', 'bruno-mars', 'grenade', 'Fácil', 'Pop'],
  ['The Lazy Song', 'Bruno Mars', 'bruno-mars', 'bruno-mars', 'the-lazy-song', 'Fácil', 'Pop'],
  ['Talking to the Moon', 'Bruno Mars', 'bruno-mars', 'bruno-mars', 'talking-to-the-moon', 'Fácil', 'Pop'],
  ['Os Anjos Cantam', 'Jorge & Mateus', 'jorge-e-mateus', 'jorge-e-mateus', 'os-anjos-cantam', 'Fácil', 'Sertanejo'],
  ['Pode Chorar', 'Jorge & Mateus', 'jorge-e-mateus', 'jorge-e-mateus', 'pode-chorar', 'Fácil', 'Sertanejo'],
  ['Página de Amor', 'Chitãozinho & Xororó', 'chitaozinho-e-xororo', 'chitaozinho-e-xororo', 'pagina-de-amor', 'Fácil', 'Sertanejo'],
  ['Fio de Cabelo', 'Chitãozinho & Xororó', 'chitaozinho-e-xororo', 'chitaozinho-e-xororo', 'fio-de-cabelo', 'Fácil', 'Sertanejo'],
  ['Everyday I Have the Blues', 'B.B. King', 'bb-king', 'b-b-king', 'everyday-i-have-the-blues', 'Intermediário', 'Blues'],
  ['Sweet Little Angel', 'B.B. King', 'bb-king', 'b-b-king', 'sweet-little-angel', 'Intermediário', 'Blues'],
];

const ok = [];
const bad = [];
for (const [titulo, artista, artistaSlug, ccA, ccS, dificuldade, genero] of C) {
  const url = `https://www.cifraclub.com.br/${ccA}/${ccS}/`;
  let status = 0;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, redirect: 'follow' });
    status = res.status;
  } catch (e) { status = -1; }
  if (status === 200) ok.push({ titulo, artista, artistaSlug, dificuldade, genero, preview: preview[artistaSlug], url });
  else bad.push(`${artista} — ${titulo} (${status}) ${url}`);
  process.stdout.write(status === 200 ? '.' : 'x');
}
fs.writeFileSync('covers-src/_tabs_ok.json', JSON.stringify(ok, null, 2));
console.log(`\nVálidas: ${ok.length} / ${C.length}`);
if (bad.length) console.log('Inválidas:\n' + bad.join('\n'));

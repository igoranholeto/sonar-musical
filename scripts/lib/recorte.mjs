// Recorte da foto de produto do Mercado Livre para WebP com transparência.
// Usado por gen-produto-cutout.mjs (um produto) e fotos-produtos.mjs (catálogo inteiro).
//
// Critério, na ordem:
// 1. Tipo de fundo, medido na borda da foto:
//    - branco: 90% ou mais da borda é branco puro (até TOL de diferença em cada canal). É o
//      padrão do ML. Sai só o branco puro: produto branco e reflexo ficam intactos.
//    - degradê: a borda é clara mas não pura (papel cinza, vinheta, sombra de estúdio). Sai o
//      fundo que muda devagar de um pixel para o vizinho, claro e sem cor; a borda do produto
//      muda de repente e segura o recorte.
//    - cenário: borda com pouco branco (foto de ambiente). A foto fica inteira.
// 2. Sai o fundo ligado à borda da foto. No fundo branco, sai também a sombra de estúdio em volta
//    do produto (a mancha cinza-clara que sobrava como borrão branco), mas só se for sombra mesmo:
//    - cinza neutro (no máximo SOMBRA_COR de diferença entre os canais; corpo branco de guitarra,
//      cromado e vidro puxam para creme ou azul);
//    - clara e começando suave a partir do branco: a até p px do fundo puro, no máximo
//      TOL + SOMBRA_RAMPA × p de diferença do branco (p medido numa foto de 1000 px). A beira de
//      um produto branco escurece de uma vez e segura;
//    - ligada ao fundo por uma faixa larga (2,4% do lado menor). Se só chega ao fundo por uma
//      passagem estreita, é o produto vazando, não sombra.
// 3. Sai o fundo preso dentro do produto (miolo do capotraste, alça do amplificador, vão entre
//    as voltas do cabo), mas só se for um buraco de verdade:
//    - branco puro, como o fundo de fora;
//    - largo: pelo menos 2,4% do lado menor da foto (cerca de 2 px no CTA de 84 px). Letra,
//      filete e brilho são mais finos;
//    - contornado pelo produto (anel escuro em volta), não por branco sombreado;
//    - perto da borda do produto, como num aro, alça ou cabo: a parte do produto entre o buraco e
//      o fundo de fora tem de 5 px até 7% do lado menor (ou até 4 vezes o raio do buraco). Letreiro
//      branco impresso no meio da caixa ou do pedal fica longe da borda; faixa branca colada na
//      borda (topo da embalagem) e brilho na beira do corpo têm menos de 5 px;
//    - menor que 15% da área do produto.
//    Logotipo, tela, corpo branco e reflexo ficam. O que passa no critério mas é branco impresso
//    ou brilho (fita do rótulo, knob cromado) vai com `buracos: false`, depois de conferido na
//    montagem.
// 4. Sobra solta pequena (sujeira, ponta de sombra) sai.
// 5. Contorno: nos 2 px da borda, a transparência é calculada separando a cor do produto
//    da cor do fundo, e o fundo misturado é tirado da cor. Assim não sobra franja clara.
import sharp from 'sharp';

const TOL = 12;          // diferença máxima do branco puro, por canal (ruído de compressão)
const CLARO = 70;        // degradê: até essa diferença do branco...
const CLARO_COR = 14;    // ...sem cor (diferença entre canais)...
const CLARO_PASSO = 3;   // ...e mudando no máximo isso de um pixel para o vizinho
const SOMBRA_COR = 2;     // sombra: diferença máxima entre canais (cinza neutro)...
const SOMBRA_RAMPA = 1.5; // ...e quanto pode escurecer por px de distância do fundo puro
const SOMBRA_FAIXA = 0.012; // ...ligada ao fundo por faixa de pelo menos 2× isso do lado menor
const BANDA = 2;       // px do contorno com transparência calculada

/** Distância chanfrada (3-4) até o pixel mais próximo fora de `dentro`; resultado em px. */
function distancia(dentro, w, h) {
  const INF = 1e9;
  const d = new Float32Array(w * h);
  for (let i = 0; i < d.length; i++) d[i] = dentro[i] ? INF : 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (!d[i]) continue;
    let v = d[i];
    if (x > 0) v = Math.min(v, d[i - 1] + 3);
    if (y > 0) {
      v = Math.min(v, d[i - w] + 3);
      if (x > 0) v = Math.min(v, d[i - w - 1] + 4);
      if (x < w - 1) v = Math.min(v, d[i - w + 1] + 4);
    }
    d[i] = v;
  }
  for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) {
    const i = y * w + x;
    if (!d[i]) continue;
    let v = d[i];
    if (x < w - 1) v = Math.min(v, d[i + 1] + 3);
    if (y < h - 1) {
      v = Math.min(v, d[i + w] + 3);
      if (x < w - 1) v = Math.min(v, d[i + w + 1] + 4);
      if (x > 0) v = Math.min(v, d[i + w - 1] + 4);
    }
    d[i] = v;
  }
  for (let i = 0; i < d.length; i++) d[i] /= 3;
  return d;
}

/** Componentes conexos (4-vizinhos) de `mascara`; devolve rótulos (0 = fora) e quantos são. */
function componentes(mascara, w, h) {
  const rot = new Int32Array(w * h);
  let n = 0;
  const pilha = [];
  for (let s = 0; s < rot.length; s++) {
    if (!mascara[s] || rot[s]) continue;
    rot[s] = ++n;
    pilha.push(s);
    while (pilha.length) {
      const i = pilha.pop();
      const x = i % w;
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w]) {
        if (j >= 0 && j < rot.length && mascara[j] && !rot[j]) { rot[j] = n; pilha.push(j); }
      }
    }
  }
  return { rot, n };
}

/**
 * @param {string | Buffer} input arquivo ou buffer da imagem
 * @param {string} out caminho do .webp
 * @param {number} max lado maior da saída, em px
 * @param {{ inteira?: boolean, buracos?: boolean }} [opcoes] inteira = não recortar (produto que o
 *   critério não separa bem do fundo; a foto vai com o fundo branco); buracos = false: só tira o
 *   fundo de fora (o branco de dentro é impresso, não buraco)
 * @returns {Promise<{ modo: string, fundoBranco: number, buracos: number, width: number, height: number }>}
 *   modo = branco | degrade | cenario | inteira; fundoBranco = fração da borda em branco puro
 */
export async function recortar(input, out, max = 420, { inteira = false, buracos: tirarBuracos = true } = {}) {
  const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const N = w * h;
  const px = (i, c) => data[i * 3 + c];

  // 1. Tipo de fundo.
  const borda = [];
  for (let x = 0; x < w; x++) borda.push(x, (h - 1) * w + x);
  for (let y = 1; y < h - 1; y++) borda.push(y * w, y * w + w - 1);
  const dist = new Uint8Array(N); // diferença do branco puro, no pior canal
  const cor = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    const r = px(i, 0), g = px(i, 1), b = px(i, 2);
    dist[i] = 255 - Math.min(r, g, b);
    cor[i] = Math.max(r, g, b) - Math.min(r, g, b);
  }
  const puro = (i) => dist[i] <= TOL;
  const fundoBranco = borda.filter(puro).length / borda.length;
  const bordaClara = borda.filter((i) => dist[i] <= CLARO).length / borda.length;
  const modo = inteira ? 'inteira'
    : fundoBranco >= 0.9 ? 'branco'
    : bordaClara >= 0.8 ? 'degrade'
    : fundoBranco >= 0.3 ? 'branco'
    : 'cenario';
  // Cor do fundo: branco puro, ou a mediana da borda no degradê.
  const mediana = (c) => { const v = borda.map((i) => px(i, c)).sort((a, b) => a - b); return v[v.length >> 1]; };
  const W = modo === 'degrade' ? [mediana(0), mediana(1), mediana(2)] : [255, 255, 255];

  const alfa = new Float32Array(N).fill(1);
  const rgb = Buffer.from(data);
  let buracos = 0;

  if (modo === 'branco' || modo === 'degrade') {
    // 2. Fundo ligado à borda.
    const fundo = new Uint8Array(N);
    const crescer = (sementes) => {
      const pilha = sementes.filter((i) => !fundo[i]);
      for (const i of pilha) fundo[i] = 1;
      while (pilha.length) {
        const i = pilha.pop();
        const x = i % w;
        for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w]) {
          if (j < 0 || j >= N || fundo[j]) continue;
          const suave = modo === 'degrade' && dist[j] <= CLARO && cor[j] <= CLARO_COR &&
            Math.abs(px(j, 0) - px(i, 0)) <= CLARO_PASSO && Math.abs(px(j, 1) - px(i, 1)) <= CLARO_PASSO && Math.abs(px(j, 2) - px(i, 2)) <= CLARO_PASSO;
          if (puro(j) || suave) { fundo[j] = 1; pilha.push(j); }
        }
      }
    };
    crescer(borda.filter((i) => puro(i) || (modo === 'degrade' && dist[i] <= CLARO)));

    if (modo === 'branco') {
      // Sombra: cresce do fundo puro por pixels neutros, claros e suaves.
      const lado = Math.min(w, h), escala = 1000 / lado;
      const prof = distancia(Uint8Array.from(fundo, (v) => 1 - v), w, h);
      const sombra = new Uint8Array(N);
      const pilha = [];
      for (let i = 0; i < N; i++) if (fundo[i]) pilha.push(i);
      while (pilha.length) {
        const i = pilha.pop();
        const x = i % w;
        for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w]) {
          if (j < 0 || j >= N || fundo[j] || sombra[j]) continue;
          if (dist[j] <= CLARO && cor[j] <= SOMBRA_COR && dist[j] <= TOL + SOMBRA_RAMPA * prof[j] * escala &&
            Math.abs(px(j, 0) - px(i, 0)) <= CLARO_PASSO && Math.abs(px(j, 1) - px(i, 1)) <= CLARO_PASSO && Math.abs(px(j, 2) - px(i, 2)) <= CLARO_PASSO) {
            sombra[j] = 1; pilha.push(j);
          }
        }
      }
      // Faixa larga: abertura (erosão + dilatação) de fundo + sombra com raio R; a parte erodida
      // que segue ligada à borda da foto é o fundo de verdade, e a sombra só vale perto dela.
      const R = SOMBRA_FAIXA * lado;
      const uniao = new Uint8Array(N);
      for (let i = 0; i < N; i++) uniao[i] = fundo[i] || sombra[i] ? 1 : 0;
      const miolo = distancia(uniao, w, h);
      const largo = new Uint8Array(N);
      for (let i = 0; i < N; i++) largo[i] = miolo[i] > R ? 1 : 0;
      const { rot } = componentes(largo, w, h);
      const ligado = new Set(borda.map((i) => rot[i]).filter(Boolean));
      const perto = distancia(Uint8Array.from(rot, (k) => (ligado.has(k) ? 0 : 1)), w, h);
      for (let i = 0; i < N; i++) if (sombra[i] && perto[i] <= R + 1) fundo[i] = 1;
    }

    // 3. Buracos: branco puro preso dentro do produto.
    let x0 = w, y0 = h, x1 = 0, y1 = 0;
    for (let i = 0; i < N; i++) if (!fundo[i]) {
      const x = i % w, y = (i - x) / w;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    const areaProduto = Math.max(1, (x1 - x0 + 1) * (y1 - y0 + 1));
    const candidato = new Uint8Array(N);
    for (let i = 0; i < N; i++) candidato[i] = puro(i) && !fundo[i] ? 1 : 0;
    const { rot, n } = componentes(candidato, w, h);
    if (n && tirarBuracos) {
      const largura = distancia(candidato, w, h);
      const area = new Float64Array(n + 1), raio = new Float32Array(n + 1);
      for (let i = 0; i < N; i++) {
        const k = rot[i];
        if (!k) continue;
        area[k]++;
        if (largura[i] > raio[k]) raio[k] = largura[i];
      }
      // Contorno do buraco: o anel de 3 a 5 px em volta dele (o 1º e o 2º px são a borda
      // borrada da foto, meio clara, e não dizem nada).
      const perto = distancia(Uint8Array.from(candidato, (v) => 1 - v), w, h);
      const aroSoma = new Float64Array(n + 1), aroN = new Float64Array(n + 1), aroForte = new Float64Array(n + 1);
      for (let i = 0; i < N; i++) {
        if (candidato[i] || fundo[i] || perto[i] < 3 || perto[i] > 5) continue;
        const x = i % w, y = (i - x) / w;
        let k = 0;
        for (let r = 1; r <= 6 && !k; r++) for (let dy = -r; dy <= r && !k; dy++) for (let dx = -r; dx <= r && !k; dx++) {
          const xx = x + dx, yy = y + dy;
          if (xx >= 0 && yy >= 0 && xx < w && yy < h) k = rot[yy * w + xx];
        }
        if (!k) continue;
        aroSoma[k] += dist[i]; aroN[k]++;
        if (dist[i] >= 40) aroForte[k]++;
      }
      // Distância de cada buraco até o fundo de fora (a espessura do produto em volta dele).
      const aFundo = distancia(Uint8Array.from(fundo, (v) => 1 - v), w, h);
      const vao = new Float32Array(n + 1).fill(1e9);
      for (let i = 0; i < N; i++) if (rot[i] && aFundo[i] < vao[rot[i]]) vao[rot[i]] = aFundo[i];
      const lado = Math.min(w, h);
      const sementes = [];
      const aceito = new Uint8Array(n + 1);
      for (let k = 1; k <= n; k++) {
        const contorno = aroN[k] ? aroSoma[k] / aroN[k] : 0;
        const forte = aroN[k] ? aroForte[k] / aroN[k] : 0;
        const pertoDaBorda = vao[k] >= 5 && vao[k] <= Math.max(0.07 * lado, 4 * raio[k]);
        if (raio[k] >= 0.012 * lado && pertoDaBorda && contorno >= 50 && forte >= 0.75 && area[k] <= 0.15 * areaProduto) {
          aceito[k] = 1;
          buracos++;
        }
      }
      for (let i = 0; i < N; i++) if (aceito[rot[i]]) sementes.push(i);
      crescer(sementes);
    }

    // 4. Sobras soltas pequenas.
    const produto = new Uint8Array(N);
    for (let i = 0; i < N; i++) produto[i] = fundo[i] ? 0 : 1;
    const ilhas = componentes(produto, w, h);
    const tam = new Float64Array(ilhas.n + 1);
    for (let i = 0; i < N; i++) tam[ilhas.rot[i]]++;
    let maior = 0;
    for (let k = 1; k <= ilhas.n; k++) if (tam[k] > maior) maior = tam[k];
    for (let i = 0; i < N; i++) {
      const k = ilhas.rot[i];
      if (k && tam[k] < Math.max(0.0015 * N, 0.01 * maior)) { fundo[i] = 1; produto[i] = 0; }
    }

    // 5. Contorno: separa a cor do produto do branco do fundo nos BANDA px da borda.
    const d = distancia(produto, w, h);
    const norma = (r, g, b) => Math.hypot(r - W[0], g - W[1], b - W[2]);
    for (let i = 0; i < N; i++) {
      if (fundo[i]) { alfa[i] = 0; continue; }
      if (d[i] > BANDA) continue;
      // Cor do produto: média dos pixels de dentro (3 a 5 px da borda) numa janela 7×7.
      const x = i % w, y = (i - x) / w;
      let sr = 0, sg = 0, sb = 0, sn = 0;
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const j = yy * w + xx;
        if (d[j] >= 3 && d[j] <= 5) { sr += px(j, 0); sg += px(j, 1); sb += px(j, 2); sn++; }
      }
      if (!sn) continue;
      const F = norma(sr / sn, sg / sn, sb / sn);
      if (F < 30) continue; // produto quase branco: não dá para separar; borda fica inteira
      const a = Math.min(1, norma(px(i, 0), px(i, 1), px(i, 2)) / F);
      if (a < 0.06) { alfa[i] = 0; continue; }
      alfa[i] = a;
      for (let c = 0; c < 3; c++) rgb[i * 3 + c] = Math.max(0, Math.min(255, Math.round(W[c] + (px(i, c) - W[c]) / a)));
    }
  }

  const rgba = Buffer.alloc(N * 4);
  for (let i = 0; i < N; i++) {
    const a = Math.round(alfa[i] * 255);
    if (!a) continue; // transparente fica 0,0,0,0, que é o que o trim corta
    rgba[i * 4] = rgb[i * 3]; rgba[i * 4 + 1] = rgb[i * 3 + 1]; rgba[i * 4 + 2] = rgb[i * 3 + 2];
    rgba[i * 4 + 3] = a;
  }
  const r = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .trim({ threshold: 0 })
    .resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 88, alphaQuality: 95 })
    .toFile(out);
  return { modo, fundoBranco, buracos, width: r.width, height: r.height };
}

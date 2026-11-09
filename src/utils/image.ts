import fs from 'node:fs';
import path from 'node:path';

// Fonte otimizada para miniaturas de card (home, categorias, relacionados).
// Capas locais têm uma versão WebP de 800px em /images/blog/cards/ (geradas por
// scripts/gen-card-thumbs.mjs); imagens do Unsplash são redimensionadas via URL.
// Evita baixar a capa full de 1200px para exibir num card de ~360-660px.
// Se a miniatura ainda não foi gerada, devolve a imagem original (em vez de um 404,
// que o Ahrefs acusou em 08/11/2026 nos posts publicados sem rodar o script).

const existe = (publico: string) => fs.existsSync(path.join(process.cwd(), 'public', publico));

export function cardImg(url: string | undefined): string | undefined {
  if (!url) return url;
  if (url.includes('images.unsplash.com')) return unsplashSrc(url, 800);
  const b = url.match(/^\/images\/blog\/(.+)\.(png|jpe?g|webp)$/i);
  if (b) {
    const card = `/images/blog/cards/${b[1]}.webp`;
    return existe(card) ? card : url;
  }
  // Imagens de banda em /images/*.webp têm variante em /images/cards/
  const g = url.match(/^\/images\/([^/]+)\.(png|jpe?g|webp)$/i);
  if (g) {
    const card = `/images/cards/${g[1]}.webp`;
    return existe(card) ? card : url;
  }
  return url;
}

export function unsplashSrc(url: string | undefined, width: number): string | undefined {
  if (!url || !url.includes('images.unsplash.com')) return url;
  try {
    const u = new URL(url);
    u.searchParams.set('w', String(width));
    u.searchParams.set('auto', 'format');
    u.searchParams.set('fit', 'crop');
    // Sempre força q=70: as URLs de frontmatter vêm com q=80 e as capas w=900
    // passavam de 100kB, q=70 com auto=format fica visualmente equivalente.
    u.searchParams.set('q', '70');
    return u.toString();
  } catch {
    return url;
  }
}

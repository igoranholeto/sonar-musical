import type { CollectionEntry } from 'astro:content';

// Posts agendados: um post com pubDate no futuro não gera página nem aparece em
// listagens, sitemap ou RSS até a data chegar. Como o site é estático, ele entra no
// ar no primeiro deploy depois do horário marcado (a rotina diária faz esse deploy).
export function isPublished(post: CollectionEntry<'blog'>): boolean {
  return post.data.pubDate.valueOf() <= Date.now();
}

export function unsplashSrc(url: string | undefined, width: number): string | undefined {
  if (!url || !url.includes('images.unsplash.com')) return url;
  try {
    const u = new URL(url);
    u.searchParams.set('w', String(width));
    u.searchParams.set('auto', 'format');
    u.searchParams.set('fit', 'crop');
    // Sempre força q=70: as URLs de frontmatter vêm com q=80 e as capas w=900
    // passavam de 100kB — q=70 com auto=format fica visualmente equivalente.
    u.searchParams.set('q', '70');
    return u.toString();
  } catch {
    return url;
  }
}

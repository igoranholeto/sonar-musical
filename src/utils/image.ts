export function unsplashSrc(url: string | undefined, width: number): string | undefined {
  if (!url || !url.includes('images.unsplash.com')) return url;
  try {
    const u = new URL(url);
    u.searchParams.set('w', String(width));
    u.searchParams.set('auto', 'format');
    u.searchParams.set('fit', 'crop');
    if (!u.searchParams.has('q')) u.searchParams.set('q', '75');
    return u.toString();
  } catch {
    return url;
  }
}

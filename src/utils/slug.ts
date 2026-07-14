const COMBINING_DIACRITICS = new RegExp('[̀-ͯ]', 'g');

export function normalizeSearch(text: string): string {
  return text.normalize('NFD').replace(COMBINING_DIACRITICS, '').toLowerCase();
}

export function slugifyCategory(category: string): string {
  return normalizeSearch(category).replace(/\s+/g, '-');
}

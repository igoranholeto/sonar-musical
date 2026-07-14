const COMBINING_DIACRITICS = new RegExp('[̀-ͯ]', 'g');

export function slugifyCategory(category: string): string {
  return category
    .normalize('NFD')
    .replace(COMBINING_DIACRITICS, '')
    .toLowerCase()
    .replace(/\s+/g, '-');
}

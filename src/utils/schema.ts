// Constantes e helpers de dados estruturados (JSON-LD) compartilhados entre layouts,
// páginas e componentes. Os @id fixos ligam os nós num grafo: o Google junta nós com
// o mesmo @id mesmo quando estão em blocos <script> diferentes da mesma página.
import type { Author } from '../data/authors';

export const SITE_URL = 'https://sonarmusical.com.br';
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const LOGO_URL = `${SITE_URL}/logo-512.png`;

export function absUrl(path: string): string {
  return /^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

export const organizationRef = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: 'Sonar Musical',
  url: SITE_URL,
  logo: { '@type': 'ImageObject', url: LOGO_URL, width: 512, height: 512 },
};

export function personId(author: Author): string {
  return `${SITE_URL}/autor/${author.slug}/#person`;
}

export function personRef(author: Author) {
  return {
    '@type': 'Person',
    '@id': personId(author),
    name: author.name,
    url: `${SITE_URL}/autor/${author.slug}/`,
    image: absUrl(author.photo),
    ...(author.sameAs.length > 0 && { sameAs: author.sameAs }),
  };
}

// "Squier Classic Vibe '60s Stratocaster" e "Squier Classic Vibe 60s Stratocaster"
// precisam gerar o mesmo id, então só sobram letras e números.
export function slugifyId(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function productId(pageUrl: string, name: string): string {
  return `${pageUrl.split('#')[0]}#produto-${slugifyId(name)}`;
}

export const MARCAS = [
  'Fender', 'Gibson', 'Ibanez', 'Marshall', 'Yamaha', 'Boss', 'Epiphone',
  'Squier', 'PRS', 'Schecter', 'ESP', 'Focusrite', 'Universal Audio', 'SSL',
  'Audient', 'Native Instruments', 'Ernie Ball', "D'Addario", 'Elixir', 'GHS',
  'Taylor', 'Martin', 'Line 6', 'Neural DSP', 'Zoom', 'Blackstar', 'Orange',
  'Suhr', 'Shure', 'Seymour Duncan', 'DiMarzio', 'Dunlop', 'MXR', 'Electro-Harmonix',
];

export function detectMarca(produto: string): string | null {
  return MARCAS.find((m) => produto.toLowerCase().startsWith(m.toLowerCase())) ?? null;
}

export function breadcrumb(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absUrl(it.path),
    })),
  };
}

// Página de listagem: CollectionPage com a lista de URLs como mainEntity.
export function collectionPage(opts: {
  path: string;
  name: string;
  description: string;
  items: { name: string; path: string }[];
}) {
  const url = absUrl(opts.path);
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#webpage`,
    url,
    name: opts.name,
    description: opts.description,
    inLanguage: 'pt-BR',
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORG_ID },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: opts.items.length,
      itemListElement: opts.items.map((it, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: it.name,
        url: absUrl(it.path),
      })),
    },
  };
}

// Dados do post atual, publicados em Astro.locals pela página do post para que
// componentes MDX (AfiliadoCTA) liguem a review ao autor, à data e ao produto do post.
export interface PostSchemaContext {
  url: string;
  pubDate: Date;
  author?: Author;
  reviewedProductId?: string;
}

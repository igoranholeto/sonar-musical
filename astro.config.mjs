// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { lastmodSerializer } from './src/utils/lastmod.mjs';

export default defineConfig({
  site: 'https://sonarmusical.com.br',
  // Padroniza a URL canônica com barra final (default do output de diretório do
  // Astro). Consolida o sinal de SEO que o GSC mostrava dividido entre /rota e
  // /rota/. A Netlify (Pretty URLs) faz o 301 da versão sem barra.
  trailingSlash: 'always',
  integrations: [mdx(), sitemap({
    serialize: lastmodSerializer(),
    // Busca interna e páginas de retorno de formulário são noindex: não entram no sitemap.
    // '/alerta' cobre /alerta/* (alerta de preço) e /alertas/precos.json.
    filter: (page) =>
      !page.includes('/busca/') && !page.includes('/contato-enviado/') && !page.includes('/newsletter/') && !page.includes('/alerta'),
  })],
  compressHTML: true,
  build: {
    // Inline de todo o CSS: elimina as requisições de CSS que bloqueiam a
    // renderização (o PageSpeed apontava ~690ms no mobile). O CSS do site é
    // pequeno (~14KB), então embutir compensa o custo de não cachear entre páginas.
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
  },
});

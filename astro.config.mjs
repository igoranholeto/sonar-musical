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
  integrations: [mdx(), sitemap({ serialize: lastmodSerializer() })],
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
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

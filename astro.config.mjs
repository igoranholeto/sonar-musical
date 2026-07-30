// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { lastmodSerializer } from './src/utils/lastmod.mjs';

export default defineConfig({
  site: 'https://sonarmusical.com.br',
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

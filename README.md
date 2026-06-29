# Sonar Musical

Blog de análises e guias de compra sobre equipamentos musicais — guitarras, amplificadores, captadores, pedaleiras e mais. Conteúdo honesto, sem hype.

Site: [sonarmusical.com.br](https://sonarmusical.com.br)

## Tecnologias

- **[Astro](https://astro.build)** — framework principal, geração estática de páginas
- **[Tailwind CSS](https://tailwindcss.com)** — estilização
- **[Decap CMS](https://decapcms.org)** — painel de administração para criação de artigos
- **[Netlify](https://netlify.com)** — hospedagem, deploy contínuo e Netlify Identity (autenticação do CMS)
- **Markdown** — formato dos artigos no blog

## Desenvolvimento local

```sh
npm install
npm run dev
```

O servidor sobe em `http://localhost:4321`.

## Build

```sh
npm run build
npm run preview
```

## Estrutura

```
src/
├── components/   # Componentes Astro reutilizáveis
├── data/blog/    # Artigos em Markdown
├── layouts/      # Layouts base das páginas
├── pages/        # Rotas do site
└── styles/       # CSS global
public/
└── admin/        # Painel Decap CMS
```

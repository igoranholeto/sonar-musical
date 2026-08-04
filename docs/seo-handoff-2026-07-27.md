# Handoff SEO — 27/07/2026

Contexto para revisão no Claude Code. Um agente analisou os dados do Google Search
Console e aplicou um primeiro lote de correções neste repositório. **Nada foi
buildado nem deployado.** O objetivo desta revisão é: (a) validar as alterações,
(b) descobrir qual é o gargalo real de crescimento, (c) ajustar o que estiver errado.

---

## 1. Situação do projeto

- Domínio comprado em **27/06/2026** — o site tem ~1 mês.
- Blog de análise de equipamento musical, monetizado com links de afiliado do
  Mercado Livre (`meli.la`) e Lomadee.
- **Nenhuma venda até hoje.**
- Stack: Astro 7 + MDX + Tailwind 4, deploy na Netlify, conteúdo em `src/data/blog`
  (34 posts) e `src/data/bandas`.

### Dados reais do GSC (28/06 a 25/07/2026)

| Métrica | Valor |
|---|---|
| Impressões | 224 (≈14/dia nas últimas 2 semanas) |
| Cliques | 7 |
| CTR | 3,12% |
| Posição média | 13,0 (11,8 nos últimos 7 dias) |
| Páginas indexadas | 95 de 141 conhecidas |
| Páginas fora do índice | 46 |

Quebra da não indexação: 29 "detectada mas não indexada", 8 "página com
redirecionamento", 5 "rastreada mas não indexada", 4 "não encontrado (404)".

Quebra por seção (impressões / cliques):

| Seção | URLs | Impressões | Cliques | Posição média |
|---|---|---|---|---|
| `/blog/` | 24 | 187 | 5 | ~10 |
| `/bandas/` | 47 | 89 | **0** | 30+ |
| Institucional | 8 | 26 | 2 | — |

Inflexão clara em **10–12/07**, quando a indexação saltou de 14 para 95 páginas.
As impressões saíram de ~2/dia para ~14/dia na sequência.

### Metas definidas anteriormente (prazo: set/2026)

| Meta | Status atual |
|---|---|
| 100–500 impressões/dia | ≈14/dia — **atrás** (14% do piso) |
| 1–10 cliques/dia | ≈0,4/dia — **atrás** |
| 40–60 posts indexados | 95 — **batida** |
| 5+ keywords long-tail no top 10 | 9 posts com pos. média ≤10 — **batida** |
| Primeiras comissões (mês 4–6) | 0 vendas — dentro do prazo |

Sobre a ausência de vendas: com 7 cliques totais, o esperado matematicamente é
~0,03 venda (7 × ~12% de clique em link de afiliado × ~3% de conversão). Não é
sintoma de problema no site. A primeira venda só fica provável em ~300–500
sessões; receita recorrente em 1.500–3.000 sessões/mês.

---

## 2. Alterações já aplicadas (revisar)

Todas sem commit. Diff limpo via `git diff --ignore-cr-at-eol -- src netlify.toml`
(o repo tem divergência de CRLF que polui o diff normal).

### 2.1 Titles e meta descriptions

Motivo: cinco páginas estavam em **posição 7–9 com ZERO cliques**. A impressão já
existe; o que falta é ganhar o clique. Era o único ganho de tráfego disponível sem
depender do Google.

| Arquivo | Title novo |
|---|---|
| `src/data/blog/melhor-amplificador-de-guitarra-2026.mdx` | Melhor Amplificador de Guitarra 2026: Top 6 de R$ 2 a 7 Mil |
| `src/data/blog/5-pedais-boss-essenciais-para-guitarristas.mdx` | 5 Pedais Boss Essenciais: Quais Comprar Primeiro em 2026 |
| `src/data/blog/melhor-guitarra-para-blues.mdx` | Melhor Guitarra para Blues 2026: Top 5 por Faixa de Preço |
| `src/data/blog/quantas-cordas-tem-uma-guitarra.mdx` | Quantas Cordas Tem uma Guitarra? 6, 7, 8 e 12 Comparadas |
| `src/pages/bandas/[slug]/equipamentos.astro` | `${nome}: Equipamentos e Setup Completo da Banda` (template, vale para 47 páginas) |

Todos entre 56–59 caracteres e descriptions entre 136–143, respeitando a lógica de
sufixo do `BaseLayout` (só anexa `| Sonar Musical` se o total couber em 60).

**Revisar:** os títulos citam faixas de preço ("R$ 2 a 7 Mil") — conferir se batem
com os preços realmente listados no corpo do post, senão vira promessa falsa.

### 2.2 Redirects dos 404 (`netlify.toml`)

Os 4 erros 404 do GSC foram identificados: são os slugs em inglês da versão
original do site, renomeados no commit `e77390f` (29/06/2026). Só um tinha
redirect. Adicionados os outros três:

```
/blog/best-beginner-electric-guitars-2025/   -> /blog/melhores-guitarras-eletricas-para-iniciantes-2026/
/blog/fender-blues-junior-iv-review/         -> /blog/review-fender-blues-junior-iv/
/blog/acoustic-vs-electric-which-to-start-with/ -> /blog/violao-ou-guitarra-por-onde-comecar/
```

Sobre os 8 "página com redirecionamento": foi feito grep em todo o `src/` e **não
existe nenhum link interno sem barra final**. São resíduo de deploys antigos e
devem sumir na revalidação — não há o que corrigir no código.

### 2.3 JSON-LD (`src/layouts/PostLayout.astro`)

O bug antigo (URL de imagem concatenada errada) **já estava corrigido**, assim como
o autor pessoa física. O que foi adicionado agora:

- `mainEntityOfPage`
- `dateModified` sempre presente (fallback para `pubDate`)
- `publisher.logo` como `ImageObject` (o Google pede para rich results de Article)
- breadcrumb `https://sonarmusical.com.br/blog` → `/blog/` (estava gerando um 301
  dentro do próprio dado estruturado)

---

## 3. O que NÃO foi feito e precisa de decisão

### 3.1 `itemReviewed.name` recebe o título do artigo

Em `PostLayout.astro`, quando existe `rating`, o schema vira `Review` e
`itemReviewed.name` recebe o `title` do post. Em "Melhor Amplificador de Guitarra
2026: Top 6..." isso declara ao Google que o produto avaliado se chama "Melhor
Amplificador de Guitarra 2026" — o que é falso.

Pior: **posts de roundup (vários produtos) não deveriam usar `Review` de jeito
nenhum** — o correto é `Article` + `ItemList`, e `Review` só em post de produto
único (ex.: `review-fender-blues-junior-iv`). Exige campo novo no frontmatter.
Precisa de decisão de arquitetura.

### 3.2 Build não validado

O `node_modules` foi instalado no Windows; o binário nativo do Rolldown não roda em
Linux, então o agente não conseguiu rodar `npm run build`. As alterações foram
validadas estaticamente (YAML dos frontmatters parseia, TOML parseia, destinos dos
redirects existem, chaves/parênteses balanceados no `.astro`). **Rodar o build
antes do deploy.**

### 3.3 Trabalho não commitado pré-existente

`src/pages/bandas/index.astro` e `src/pages/bandas/[slug]/albuns/[album].astro`
tinham alterações não commitadas (índice de álbuns e seção "Mais de [banda]") que
**não** foram feitas por este agente. Vão junto no próximo commit — revisar.

---

## 4. Perguntas para esta revisão — onde está o gargalo real

O diagnóstico até aqui foi feito de fora (GSC + fetch das páginas em produção).
Com acesso ao repo dá para ir mais fundo:

1. **As 29 páginas "detectada mas não indexada" — quais são?** Cruzar o sitemap
   gerado com a lista de URLs que já receberam impressão. A hipótese é que sejam
   quase todas de `/bandas/`. Se for isso, a pergunta é se elas devem sair do
   sitemap ou receber `noindex`, porque estão consumindo crawl budget sem retorno.

2. **`/bandas/` vale a pena?** 47 URLs (66% do site), 89 impressões, **0 cliques**,
   posição média 30+, sem link de afiliado. É a maior massa de conteúdo do projeto
   e não converte nada. As páginas de `/equipamentos/` são a exceção — a do
   Coldplay ranqueia em posição 8. Vale avaliar: congelar a seção, monetizar só as
   de equipamento, ou desindexar as de álbum?

3. **Qualidade real do conteúdo comercial.** Vários posts dizem "Testamos" mas
   usam foto do Unsplash. O sistema de reviews do Google penaliza isso
   explicitamente. Verificar quantos posts fazem essa afirmação e decidir: ou
   produzir mídia própria, ou reescrever a linguagem para não afirmar teste que não
   aconteceu.

4. **Linkagem interna.** Os posts comerciais que já ranqueiam (`melhor-pedaleira`,
   `melhor-guitarra-7-cordas`) deveriam estar recebendo link de todo o resto do
   site. Conferir se há páginas órfãs e se o link equity está indo para as páginas
   que vendem.

5. **Cobertura de keyword vs. conteúdo publicado.** `docs/keyword-research.tsv`
   tem o volume de busca do nicho. Cruzar com os 34 posts existentes para achar os
   termos de maior volume ainda sem página — especialmente em **home studio**
   (interfaces, microfones, monitores), identificado como o subnicho de menor
   concorrência do mercado (concorrentes com DR ~0 ranqueando em página 1).

6. **A hipótese de fundo que precisa ser testada:** o gargalo do projeto não é
   técnico nem de conteúdo — é **autoridade e volume**. O site tem DR 0, ~1 mês, e
   já está em top 10 em 9 termos. Se isso estiver certo, a única alavanca que
   importa nos próximos 60 dias é publicar mais conteúdo comercial e conseguir os
   primeiros backlinks, e todo o resto é otimização de margem. **Vale contestar
   essa conclusão se os dados do repo sugerirem outra coisa.**

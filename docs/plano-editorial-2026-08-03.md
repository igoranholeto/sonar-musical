# Plano editorial — semana de 03/08/2026

5 posts novos em `src/data/blog/`, escolhidos por cruzamento de `docs/keyword-research.tsv`
(1.000 keywords) contra os 34 posts existentes. Critério: maior volume agregado do cluster,
KD 0, presença de bloco "As pessoas também perguntam" e ainda sem página no site.

**Nada foi buildado nem commitado.** O `node_modules` do repo tem binário nativo do Rolldown
compilado para Windows, então `npm run build` não roda no ambiente Linux — mesma limitação
registrada no handoff de 27/07. Validação feita estaticamente (ver seção 4).

---

## 1. Calendário e keywords

### Segunda, 03/08 — 3 posts (os de maior valor comercial)

| Arquivo | Keyword principal | Vol. cluster | KD | Categoria |
|---|---|---|---|---|
| `melhor-mini-amplificador-de-guitarra-2026.mdx` | mini amplificador guitarra | ~880/mês | 0 | Amplificadores |
| `melhores-captadores-de-guitarra-2026.mdx` | captador de guitarra | ~540/mês | 0–2 | Acessórios |
| `cordas-de-guitarra-009-ou-010.mdx` | cordas guitarra 010 / 009 | ~610/mês | 0 | Acessórios |

### Quarta, 05/08

| Arquivo | Keyword principal | Vol. cluster | KD | Categoria |
|---|---|---|---|---|
| `guitarra-8-cordas-guia-completo.mdx` | guitarra 8 cordas | 200/mês | 0 | Guitarras |

### Sexta, 07/08

| Arquivo | Keyword principal | Vol. cluster | KD | Categoria |
|---|---|---|---|---|
| `melhor-guitarra-eletrica-infantil.mdx` | guitarra elétrica infantil | ~290/mês | 0 | Guias de Compra |

### Por que estas cinco

- **Mini amplificador** é o maior cluster comercial do TSV sem página: soma `mini amplificador
  guitarra` (500), `amplificador guitarra pequeno` (100), `amplificador de guitarra pequeno` (80),
  `guitarra com amplificador embutido` (60), `amplificador portatil guitarra` (50). Intenção
  transacional, público de apartamento — o perfil que converte em afiliado.
- **Captadores** tem 540 de volume no head term e o site só cobre o ângulo conceitual
  (`captacoes-guitarra-passivas-vs-ativas`, categoria Técnica e Teoria). Faltava a página comercial.
- **009 ou 010** agrega ~610 de volume espalhado em oito variações de grafia (`010`, `0.10`,
  `09`, `cordas de guitarra 09`…). É informacional com saída comercial direta e o único post da
  semana que já sai com links de afiliado reais.
- **8 cordas** é o vizinho natural de `melhor-guitarra-7-cordas-2026`, que já está em top 10.
  Publicado na quarta para não competir por crawl com os três de segunda.
- **Infantil** abre um público novo (pais, não guitarristas), com intenção transacional e
  concorrência fraca — a maioria dos resultados atuais confunde brinquedo com instrumento.

**Descartados e por quê:** `passeata contra a guitarra elétrica` (270/mês, zero monetização —
vale como link magnet num segundo momento); `guitarra elétrica barata` (200/mês, canibaliza
`melhores-guitarras-eletricas-para-iniciantes-2026`); `guitarra 12 cordas` (300/mês, mas a
intenção mistura guitarra e violão de 12 cordas).

---

## 2. SEO preenchido em todos os cinco

| Item | Status |
|---|---|
| Meta title | 53–57 caracteres, keyword no início |
| Meta description | 134–148 caracteres |
| `image` + `imageAlt` | Preenchidos (alt descritivo, não keyword stuffing) |
| Categoria | Validada contra `BLOG_CATEGORIES` em `src/content.config.ts` |
| Tags | 5 a 7 por post, cobrindo as variações do cluster |
| Schema Article + Breadcrumb | Automático via `PostLayout.astro` |
| Schema FAQPage | Componente `<FAQ>` — 7 a 8 perguntas por post |
| Schema Review | **Não usado** — nenhum post tem `rating` no frontmatter (ver seção 5) |
| `<QuickAnswer>` | Presente nos cinco, para featured snippet e citação em LLM |
| Tabela comparativa | 2 a 3 por post |
| Links internos de saída | 5 a 7 por post, todos validados |
| Links internos de entrada | Adicionados em 5 posts existentes (seção 3) |
| Autor | `Igor Silva Anholeto` → schema `Person` com `sameAs` |

**Formato definido a partir do SERP.** Os resultados que ranqueiam para essas keywords no Brasil
(mybest, eutescuto, instrumentosmusicais, Cifra Club) usam o mesmo padrão: listicle numerado
com tabela comparativa no topo, seção de critérios de compra antes dos produtos, ficha técnica
em bullets por item e FAQ ao final. Os cinco posts seguem esse esqueleto, com dois acréscimos:
`QuickAnswer` no topo (resposta em 2–3 frases, formato que o Google favorece em snippet) e
tabela de "perfil → modelo indicado" antes do FAQ. Largura de conteúdo: `max-w-3xl` do
`PostLayout`, sem alteração — 768px é adequado para as tabelas de 4–5 colunas usadas.

**FAQ construído a partir de "As pessoas também perguntam".** As perguntas foram levantadas
por busca nos SERPs brasileiros de cada termo. Exemplos que entraram: "quantos watts preciso
para tocar em casa", "vale a pena trocar o captador da guitarra", "preciso regular a guitarra
ao trocar de 009 para 010", "qual a afinação de uma guitarra de 8 cordas", "qual o tamanho de
guitarra para criança de 7 anos".

---

## 3. Links internos de entrada adicionados

O handoff apontou linkagem interna como gargalo. Cada post novo recebeu link contextual de
posts existentes relevantes:

| Post existente alterado | Aponta para |
|---|---|
| `melhor-amplificador-de-guitarra-2026.mdx` | mini amplificadores |
| `captacoes-guitarra-passivas-vs-ativas.mdx` | melhores captadores |
| `melhores-cordas-de-guitarra-2026.mdx` | cordas 009 ou 010 |
| `melhor-guitarra-7-cordas-2026.mdx` | guitarra 8 cordas |
| `melhores-guitarras-eletricas-para-iniciantes-2026.mdx` | guitarra elétrica infantil |

Contagem de links de entrada por post novo: mini amp 2, captadores 2, cordas 009/010 3,
8 cordas 1, infantil 1.

---

## 4. Validação executada

- YAML dos 39 frontmatters parseia sem erro
- Categorias conferidas contra o enum de `content.config.ts`
- 64 expressões JSX (`destaques`, `avaliacao`, blocos `items` do FAQ) parseadas com Node — nenhum erro de sintaxe
- Todos os itens de FAQ têm `question` e `answer` preenchidos
- Todos os links internos `/blog/*` apontam para arquivo existente
- Links para `/afinador/`, `/tablaturas/` e `/bandas/*` conferidos contra `src/pages` e `src/data/bandas`
- Componentes usados estão importados em todos os arquivos

**Pendente:** `npm run build` precisa rodar no Windows antes do deploy.

---

## 5. Decisões tomadas e o que precisa da sua ação

### 5.1 Links de afiliado — 22 placeholders para colar

Onde o produto já aparecia em outro post, o link `meli.la` existente foi reaproveitado.
Os produtos novos ficaram com `url="#COLAR-LINK-AFILIADO-..."`.

**Já com link real (5):**

| Post | Produto | Link |
|---|---|---|
| cordas 009/010 | GHS Boomers 9–42 | `meli.la/11aQpdm` |
| cordas 009/010 | Ernie Ball Regular Slinky 10–46 | `meli.la/1SoYw2C` |
| cordas 009/010 | D'Addario NYXL 10–46 | `meli.la/1Cbj7PW` |
| cordas 009/010 | Elixir Optiweb 10–46 | `meli.la/1ggdyxw` |
| infantil | Squier Bullet Stratocaster | `meli.la/1FbjijB` |

**Placeholders a preencher (22):**

- Mini amplificadores (6): Boss Katana Mini, Blackstar Fly 3 Bluetooth, Fender Frontman 10G, Positive Grid Spark Mini, Yamaha THR10II, Borne Vorax 630
- Captadores (7): Seymour Duncan SH-4 JB, Hot Rodded Set, DiMarzio Super Distortion DP100, EMG 81/85 Set, Fender Yosemite Strat Set, Fishman Fluence Modern, Malagoli
- 8 cordas (5): Cort KX508 Multi Scale, Ibanez RGMS8, Schecter C-8 Deluxe, Ibanez RGD Iron Label 8, ESP LTD Multiscale 8
- Infantil (4): Squier Mini Stratocaster, Ibanez GRGM21 miKro, Kit guitarra 3/4 com amplificador, guitarra infantil com microfone

Busque com `grep -rn "COLAR-LINK-AFILIADO" src/data/blog/` para achar todos.

### 5.2 Preços precisam ser conferidos

Todos os preços estão marcados como "preço estimado" e usam faixa, não valor fixo. Não foi
possível consultar preço real do Mercado Livre brasileiro no ambiente. **Confira antes de
publicar** — o handoff já alertou sobre título prometendo faixa de preço que não bate com o
corpo do post, e o mesmo risco vale aqui.

### 5.3 Linguagem de teste evitada

Nenhum dos cinco posts afirma "testamos". A redação usa "analisamos as especificações",
"a crítica recorrente é", "o ponto fraco é". Isso resolve, para os posts novos, o risco
apontado no item 3 da seção 4 do handoff (afirmação de teste com foto de banco de imagem,
que o sistema de reviews do Google penaliza explicitamente). **Os 34 posts antigos continuam
com o problema** — vale uma varredura separada.

### 5.4 Nenhum post recebeu `rating`

Decisão consciente. Com `rating` no frontmatter, o `PostLayout` troca o schema de `Article`
para `Review` e joga o título do post em `itemReviewed.name` — que em post de roundup declara
ao Google um produto inexistente chamado "Melhor Mini Amplificador de Guitarra 2026". É
exatamente o bug descrito no item 3.1 do handoff. Sem `rating`, os cinco posts saem como
`Article` + `FAQPage`, que é o schema correto para roundup. As notas por produto continuam
visíveis via `avaliacao` no `AfiliadoCTA`, sem virar dado estruturado.

Quando a arquitetura de schema for corrigida (campo novo no frontmatter para separar review
de produto único e roundup), o correto para estes posts é `Article` + `ItemList`.

### 5.5 O escalonamento de datas NÃO se aplica sozinho

Descoberta importante, ainda não resolvida. O blog **não tem mecanismo de draft nem filtro de
data de publicação**:

- `src/content.config.ts` não tem campo `draft` no schema da collection `blog`
- `src/pages/blog/index.astro` faz `getCollection('blog')` sem filtro (só ordena por `pubDate`)
- `src/pages/blog/[slug].astro` faz o mesmo em `getStaticPaths`

Consequência: os `pubDate` de 03/08, 05/08 e 07/08 são apenas data exibida. No primeiro deploy
os cinco posts entram no ar ao mesmo tempo, com data no futuro.

Opções para fazer o cronograma valer:

1. **Filtro de `pubDate` futuro** nas duas páginas + build hook diário na Netlify (cron). Deploy
   uma vez e cada post aparece na data. Ex.:
   `getCollection('blog', ({ data }) => import.meta.env.DEV || data.pubDate <= new Date())`.
   Atenção: sem rebuild agendado o site nunca regenera e o post nunca aparece.
2. **Campo `draft`** no schema + filtro nas páginas, virando `draft: false` manualmente e
   deployando em cada data.
3. **Commit por data** — sem mudança de código, publicando 3 na segunda, 1 na quarta, 1 na sexta.
4. **Publicar tudo agora**, ajustando os `pubDate` para a data real do deploy.

Nada disso foi implementado. Decisão pendente.

### 5.6 Estado do git

Nenhum commit foi feito. Último commit do repo: `463275a`.

- **Untracked:** os 5 posts novos, `docs/plano-editorial-2026-08-03.md`, `docs/seo-handoff-2026-07-27.md`
- **Modificados por este trabalho:** `melhor-amplificador-de-guitarra-2026.mdx`,
  `captacoes-guitarra-passivas-vs-ativas.mdx`, `melhores-cordas-de-guitarra-2026.mdx`,
  `melhor-guitarra-7-cordas-2026.mdx`, `melhores-guitarras-eletricas-para-iniciantes-2026.mdx`
  (apenas 1 parágrafo de link interno em cada)
- **Modificados de antes, não revisados:** ~35 arquivos, incluindo as correções do handoff de
  27/07 (`PostLayout.astro`, `netlify.toml`, titles) e trabalho em `src/data/bandas/`,
  `src/data/tablaturas.ts`, `src/pages/bandas/`. Um `git add .` levaria tudo junto.

### 5.7 Imagens

Todas usam Unsplash com `imageAlt` descritivo, seguindo o padrão atual do blog. Duas imagens
repetem URL de post existente (`photo-1550985616-10810253b84d` aparece em captadores e em
8 cordas) — vale trocar uma das duas por imagem própria, que resolve ao mesmo tempo o risco
de E-E-A-T do item 5.3.

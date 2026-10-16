# Agenda de posts: 10 por dia, de 17/10 a 22/10/2026

Lida pela rotina diária "sonar-10-posts-dia" (tarefa agendada no app do Claude). Cada execução escreve e publica o lote do dia, envia ao IndexNow e registra as URLs em `docs/agenda-posts-publicados.md`.

Regras do dono do site (Igor):
- Commits **sem** atribuição de IA (nada de Co-Authored-By).
- Nunca usar travessão (—). Usar vírgula ou dois-pontos. Meia-risca (–) só em faixas de preço.
- Honestidade: nunca "testamos/testei". Usar "analisamos/comparamos". CTA de compra (`AfiliadoCTA`) só com link real de afiliado do Mercado Livre (`meli.la`) gerado no painel, conferido para abrir o **mesmo produto**. Sem link real, sem CTA (o produto fica no texto).
- Capas: só foto real CC/domínio público do Wikimedia Commons (`scripts/gen-fullbleed-covers.mjs`), com crédito em `src/data/creditos.ts` (`CREDITOS_CAPAS`).
- O objetivo é ranquear no top do Google: conteúdo profundo, original e útil, pensado para o leitor brasileiro e o bolso brasileiro.

## Padrão de qualidade de cada post (checklist obrigatório)

1. **Validar a pauta antes de escrever:** abrir o autocomplete do Google (`suggestqueries.google.com/complete/search?client=firefox&hl=pt-BR&gl=br&q=...`) e a SERP no google.com.br. Ajustar o título e as seções à intenção que o Google mostra (comercial, informacional, tutorial). Se a pauta canibalizar um post existente em `src/data/blog/`, trocar pela reserva do dia.
2. **Tamanho:** 1.800 a 2.500 palavras de texto útil (sem enrolação). Cobrir as perguntas do "As pessoas também perguntam".
3. **Estrutura:** frontmatter completo (title até ~60 caracteres com a palavra-chave e o ano quando for guia de compra; description de 140 a 155 caracteres; category de `BLOG_CATEGORIES` em `src/content.config.ts`; image `.jpg`; imageAlt descritivo; 5 tags; `author: "Igor Silva Anholeto"`; `pubDate` = data do lote com hora `T06:00:00-03:00`).
   - Abertura de 2 a 3 frases + `<QuickAnswer>` respondendo direto (pensado para a AI Overview).
   - `<ComparativoProdutos>` quando houver produtos/opções.
   - H2/H3 lógicos (sem pular nível), listas e passos numerados quando for tutorial.
   - Seção "Erros comuns" ou "Como escolher".
   - `<FAQ>` com 5 a 6 perguntas reais (viram FAQPage no schema).
   - **No mínimo 6 links internos** para posts publicados relevantes (nunca para post ainda não publicado) e, quando fizer sentido, para `/afinador/`, `/metronomo/`, `/acordes/`, `/gerador-de-escalas/`.
   - Em pelo menos 2 posts antigos relevantes, adicionar um link contextual apontando para o post novo (na mesma execução, com o post novo já publicado no mesmo deploy).
4. **CTAs (guias de compra e "é boa?"):** 3 a 5 produtos reais à venda no Mercado Livre hoje. Fluxo: buscar no ML (Chrome logado como afiliado), preferir anúncio de **catálogo** (`/p/MLB...`) novo, destro, sem restrição de envio; abrir a página do produto, clicar em "Compartilhar" na barra "Afiliados" e copiar o `https://meli.la/...` do painel "Gerar link". Preço do CTA = preço da página no dia (`"A partir de R$ X"`, milhar com ponto, sem centavos). Depois de escrever, rodar a checagem de destino (ver Procedimento) e corrigir qualquer link que não abra o mesmo produto.
5. **Tutoriais "como tocar":** nunca reproduzir letra de música. Usar tablatura/cifra só do riff e dos acordes, e explicar técnica, afinação e timbre.
6. **Capa:** adicionar a entrada do slug no `MAP` de `scripts/gen-fullbleed-covers.mjs` (`kicker`, `l1`, `l2`, `q`, `prefer`, `avoid`), gerar, conferir o montage (`covers-src/_fb_montage.png`) e refazer as que não mostrarem o tema. Adicionar crédito em `CREDITOS_CAPAS`. Rodar `node scripts/gen-card-thumbs.mjs`.
7. **Validação antes do deploy:** `npx astro build` sem erro; metas até 155 caracteres; zero travessão; links internos existentes; JSON-LD válido.

## Procedimento de cada execução

1. `git pull` em `C:\Users\igors\projetos\sonar-musical` (branch `master`).
2. Ver qual lote é o de hoje (tabela abaixo). Se hoje for depois de 22/10/2026, não fazer nada.
3. Escrever os 10 posts do lote seguindo o checklist.
4. Build e validação. Conferir links de afiliado novos: para cada `meli.la` novo, `fetch` com User-Agent de navegador e ler `<meta property="og:title">` da página final; precisa ser o mesmo produto do CTA e a URL final não pode conter `/lists`.
5. `git add` dos arquivos do lote, commit (sem atribuição de IA) e `git push origin master`. O Netlify publica em ~1 minuto.
6. `node scripts/indexnow.mjs --slugs <os 10 slugs>` (espera as páginas responderem 200 e envia).
7. Acrescentar o lote em `docs/agenda-posts-publicados.md` (data + 10 URLs completas) e fazer commit/push desse arquivo.
8. Na execução de **22/10/2026**: depois de publicar, montar a lista completa de URLs por dia (17/10 a 22/10) a partir de `docs/agenda-posts-publicados.md` e entregar como resposta final da execução (e notificação), para o Igor enviar ao GSC. Em seguida, desativar a própria tarefa agendada.

## Lotes

### Sexta, 17/10: baixo e pedais por tipo
1. `jazz-bass-vs-precision-bass`: Jazz Bass ou Precision Bass, diferenças de som, braço e estilo (com CTAs).
2. `baixo-ativo-ou-passivo`: diferenças, prós e contras, bateria, para quem é cada um.
3. `baixo-4-ou-5-cordas`: qual escolher, afinação, estilos, transição.
4. `melhor-amplificador-para-baixo`: cubos de baixo para casa, igreja e ensaio por faixa de preço (CTAs).
5. `cordas-de-baixo`: calibres, níquel x aço, roundwound x flatwound, quando trocar (CTAs).
6. `melhor-pedal-de-reverb`: barato ao Boss, spring/hall/shimmer, ordem no board (CTAs).
7. `melhor-pedal-compressor`: o que faz, como ajustar, Fuhrmann, Kokko, Boss CS-3 (CTAs).
8. `melhor-pedal-looper`: como usar para estudar, M-Vave, Boss RC (CTAs).
9. `fonte-para-pedal`: fonte para pedalboard, isolada x daisy chain, voltagem e corrente (CTAs).
10. `melhor-pedal-de-chorus`: timbre anos 80, Boss CE-5, opções baratas, ajustes (CTAs).
- Reserva: `pedal-de-afinador` (melhor afinador de pedal).

### Sábado, 18/10: violão e outros instrumentos de corda
1. `violao-yamaha-ou-giannini`: comparativo das marcas mais vendidas, modelos e preços (CTAs).
2. `melhor-violao-eletroacustico`: para igreja, palco e gravação, por faixa de preço (CTAs).
3. `como-aprender-violao-sozinho`: plano de estudo de 30 dias, erros e recursos.
4. `melhor-cavaquinho-para-iniciante`: qual comprar, afinação, marcas (CTAs).
5. `melhor-ukulele-para-iniciante`: soprano, concert, tenor, marcas e preços (CTAs).
6. `como-afinar-cavaquinho`: afinações (D-G-B-D e outras), passo a passo.
7. `como-afinar-ukulele`: G-C-E-A, passo a passo, afinador.
8. `violao-7-cordas`: para que serve, choro e samba, afinação, modelos (CTAs).
9. `viola-caipira-para-iniciante`: afinações (cebolão, rio abaixo), modelos e preços (CTAs).
10. `cordas-de-violao`: nylon e aço, tensão, marcas e quando trocar (CTAs).
- Reserva: `como-trocar-cordas-do-violao`.

### Domingo, 19/10: marcas e formatos de guitarra
1. `guitarra-michael-e-boa` (CTAs).
2. `guitarra-cort-e-boa` (CTAs).
3. `guitarra-squier-e-boa`: linhas Sonic, Affinity, Classic Vibe, qual vale (CTAs).
4. `guitarra-phx-e-boa` (CTAs se houver no ML).
5. `guitarra-benson-e-boa` (CTAs se houver no ML).
6. `guitarra-headless-vale-a-pena` (CTAs).
7. `guitarra-24-ou-22-trastes`: diferenças reais de som e tocabilidade.
8. `melhor-guitarra-hss`: humbucker + single coils, por faixa de preço (CTAs).
9. `guitarra-com-floyd-rose`: vale a pena, como regular, prós e contras (CTAs).
10. `melhor-guitarra-para-solo`: o que importa para solar, modelos (CTAs).
- Reserva: `guitarra-epiphone-e-boa` (só se não canibalizar `epiphone-les-paul-vale-a-pena`).

### Segunda, 20/10: amplificação, gravação e acessórios
1. `melhor-amplificador-ate-1000-reais` (CTAs).
2. `amplificador-15w-30w-ou-50w`: potência certa para casa, ensaio e show.
3. `melhor-amplificador-para-igreja`: guitarra e violão no culto (CTAs).
4. `caixa-ativa-para-guitarra`: usar pedaleira em caixa ativa, PA, FRFR (CTAs).
5. `melhor-fone-para-tocar-guitarra`: fones fechados para estudo e gravação (CTAs).
6. `melhor-microfone-para-gravar-violao` (CTAs).
7. `como-gravar-violao-no-celular`: passo a passo, apps e microfones.
8. `melhor-afinador-de-guitarra`: clip, pedal e app (CTAs).
9. `melhor-correia-para-guitarra`: conforto, trava, largura (CTAs).
10. `como-usar-metronomo`: exercícios práticos com o metrônomo do site.
- Reserva: `melhor-suporte-para-guitarra`.

### Terça, 21/10: tutoriais "como tocar" (formato que mais converte em clique)
Validar volume de cada música no autocomplete/SERP antes; trocar por outra música famosa se o volume for baixo.
1. `como-tocar-sweet-child-o-mine`
2. `como-tocar-nothing-else-matters`
3. `como-tocar-hotel-california`
4. `como-tocar-wonderwall`
5. `como-tocar-knockin-on-heavens-door`
6. `como-tocar-back-in-black`
7. `como-tocar-pais-e-filhos-legiao-urbana`
8. `como-tocar-que-pais-e-esse-legiao-urbana`
9. `como-tocar-iron-man-black-sabbath`
10. `como-tocar-sunshine-of-your-love`
- Reserva: `como-tocar-highway-to-hell`.

### Quarta, 22/10: técnica e teoria
1. `escala-maior-guitarra`
2. `campo-harmonico-guitarra` (usar o componente `CampoHarmonico` se fizer sentido)
3. `modos-gregos-guitarra`
4. `arpejos-na-guitarra`
5. `palm-mute-guitarra`
6. `tapping-guitarra`
7. `vibrato-na-guitarra`
8. `slide-na-guitarra` (CTAs de slide, se houver)
9. `acordes-com-setima`
10. `quanto-tempo-praticar-guitarra-por-dia`
- Reserva: `escala-blues-guitarra`.

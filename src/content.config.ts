import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const BLOG_CATEGORIES = [
  'Guitarras',
  'Amplificadores',
  'Pedais',
  'Acessórios',
  'Guias de Compra',
  'Dicas para Iniciantes',
  'Home Studio',
  'Reviews',
  'Tutoriais',
  'Técnica e Teoria',
  'Violões',
] as const;

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/data/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(BLOG_CATEGORIES),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    rating: z.number().min(1).max(5).optional(),
    reviewedName: z.string().optional(),
    pros: z.array(z.string()).optional(),
    cons: z.array(z.string()).optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    author: z.string().default('Sonar Musical'),
    // 'decisao' = guia de decisão: escolhas com preço no topo e capa fora do topo no celular.
    formato: z.enum(['decisao']).optional(),
  }),
});

// Catálogo de produtos com link de afiliado: um JSON por produto. Os posts citam o
// produto por id (<AfiliadoCTA id="..." />) e o nome, o link meli.la, o preço e a foto
// saem daqui. Para atualizar um preço, muda-se um arquivo só.
export const CATEGORIAS_PRODUTO = ['guitarra', 'violao', 'cavaquinho', 'ukulele', 'pedal', 'pedaleira', 'amplificador', 'cordas', 'interface', 'acessorio', 'baixo', 'viola', 'bandolim', 'teclado', 'violino', 'bateria', 'percussao', 'sopro', 'microfone', 'fone', 'estudio', 'controlador'] as const;

const produtos = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/data/produtos' }),
  schema: z.object({
    nome: z.string(),
    meli: z.string().url(),
    preco: z.number().positive(),
    // Data em que o preço foi conferido no Mercado Livre.
    precoEm: z.coerce.date(),
    historico: z.array(z.object({ data: z.coerce.date(), preco: z.number().positive() })).default([]),
    categoria: z.enum(CATEGORIAS_PRODUTO).optional(),
    imagem: z.string().optional(),
    imagemAlt: z.string().optional(),
    // Nota e número de avaliações dos compradores no Mercado Livre, na data de precoEm.
    nota: z.number().min(0).max(5).optional(),
    avaliacoes: z.number().int().nonnegative().optional(),
    // Situação do anúncio na última checagem (scripts/check-afiliados.mjs --atualizar-precos).
    // antes/off = preço riscado e "% OFF" que o próprio anúncio exibe; desde = data em que
    // a situação mudou; catalogo = página do produto no ML, só para coletar a ficha técnica.
    anuncio: z
      .object({
        status: z.enum(['ativo', 'pausado', 'encerrado']),
        desde: z.coerce.date(),
        antes: z.number().positive().optional(),
        off: z.number().int().positive().optional(),
        parcelas: z.string().optional(),
        freteGratis: z.boolean().optional(),
        catalogo: z.string().url().optional(),
      })
      .optional(),
    // Ficha técnica (pares rótulo/valor) copiada da página do produto no ML.
    ficha: z.array(z.tuple([z.string(), z.string()])).optional(),
  }),
});

const GENEROS_BANDA =['Rock', 'Metal', 'Blues', 'Pop', 'Jazz', 'R&B', 'Sertanejo', 'Nacional'] as const;

const equipamentoItem = z.object({
  nome: z.string(),
  preco: z.string().optional(),
  urlAfiliado: z.string().optional(),
  // Quando o modelo original não é vendido novo no Brasil, o link aponta para um
  // similar à venda aqui; este campo guarda o nome dele e a página mostra a etiqueta.
  similar: z.string().optional(),
});

const bandas = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/data/bandas' }),
  schema: z.object({
    nome: z.string(),
    genero: z.enum(GENEROS_BANDA),
    origem: z.string(),
    ano: z.number(),
    fotoCapa: z.string().optional(),
    fotoCapaAlt: z.string().optional(),
    fotoCapaPosition: z.number().min(0).max(100).optional(),
    blurb: z.string(),
    integrantes: z.array(
      z.object({
        nome: z.string(),
        funcao: z.string(),
        foto: z.string().optional(),
        fotoAlt: z.string().optional(),
        anos: z.string().optional(),
        status: z.string().optional(),
        inspiracoes: z.string().optional(),
        resumo: z.string().optional(),
        pontos: z.array(z.string()).default([]),
        setup: z.array(
          z.object({
            tipo: z.string(),
            original: equipamentoItem.optional(),
            low: equipamentoItem.extend({ obs: z.string().optional() }).optional(),
          })
        ).default([]),
      })
    ),
    albuns: z.array(
      z.object({
        nome: z.string(),
        ano: z.number().optional(),
        descricao: z.string(),
        capa: z.string().optional(),
        capaAlt: z.string().optional(),
        spotifyUrl: z.string().optional(),
        temas: z.array(
          z.object({
            tema: z.string(),
            explicacao: z.string(),
          })
        ).default([]),
        scoresCriticos: z.array(
          z.object({
            fonte: z.string(),
            nota: z.number(),
            notaMax: z.number(),
          })
        ).default([]),
        musicasPopulares: z.array(
          z.object({
            nome: z.string(),
            streams: z.string(),
          })
        ).default([]),
        videoYoutubeId: z.string().optional(),
        videoTitulo: z.string().optional(),
        secoesAnalise: z.array(
          z.object({
            titulo: z.string(),
            texto: z.string(),
          })
        ).default([]),
      })
    ).default([]),
  }),
});

export const collections = { blog, bandas, produtos };

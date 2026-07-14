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
    pros: z.array(z.string()).optional(),
    cons: z.array(z.string()).optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    author: z.string().default('Sonar Musical'),
  }),
});

const GENEROS_BANDA = ['Rock', 'Metal', 'Blues', 'Pop', 'Jazz', 'R&B', 'Sertanejo', 'Nacional'] as const;

const equipamentoItem = z.object({
  nome: z.string(),
  preco: z.string().optional(),
  urlAfiliado: z.string().optional(),
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

export const collections = { blog, bandas };

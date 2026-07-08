import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/data/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum([
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
    ]),
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
  }),
});

export const collections = { blog, bandas };

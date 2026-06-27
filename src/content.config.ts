import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(['Guitarras', 'Amplificadores', 'Pedais', 'Acessórios', 'Guias de Compra', 'Dicas para Iniciantes']),
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

export const collections = { blog };

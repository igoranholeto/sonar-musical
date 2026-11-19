// Foto de cada produto em JPG com fundo branco, para os e-mails do alerta de preço
// (regras em src/utils/foto-email.ts).
import type { APIRoute, GetStaticPaths } from 'astro';
import { carregarOfertas } from '../../../utils/ofertas';
import { arquivoFotoEmail, gerarFotoEmail } from '../../../utils/foto-email';

export const getStaticPaths = (async () => {
  const paths = [];
  for (const o of (await carregarOfertas()).values()) {
    const arq = await arquivoFotoEmail(o.imagem);
    if (arq) paths.push({ params: { id: o.id }, props: { arq } });
  }
  return paths;
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) =>
  new Response(new Uint8Array(await gerarFotoEmail(props.arq as string)), { headers: { 'Content-Type': 'image/jpeg' } });

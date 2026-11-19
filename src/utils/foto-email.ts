// Foto do produto para os e-mails do alerta de preço.
//
// As fotos do catálogo (public/images/produtos/<id>.webp) têm fundo transparente e são
// pequenas. WebP não aparece no Outlook, e PNG transparente some no modo escuro do Gmail
// (produto preto em fundo escuro), então o build gera um JPG com fundo branco, numa caixa
// fixa de 240 x 180, em /images/email-produtos/<id>.jpg. O feed /alertas/precos.json marca
// com `f: 1` os produtos que têm a foto, e o e-mail só mostra a imagem nesses.
import fs from 'node:fs/promises';
import path from 'node:path';

export const LARGURA_FOTO_EMAIL = 240;
export const ALTURA_FOTO_EMAIL = 180;
export const urlFotoEmail = (id: string) => `/images/email-produtos/${id}.jpg`;

// Sem o sharp (dependência opcional do Astro), o build segue sem as fotos.
let sharp: Promise<typeof import('sharp').default | null> | undefined;
export const carregarSharp = () => (sharp ??= import('sharp').then((m) => m.default, () => null));

/** Caminho do arquivo da foto no disco, se o produto tem foto local e o sharp está disponível. */
export async function arquivoFotoEmail(imagem?: string): Promise<string | null> {
  if (!imagem?.startsWith('/images/') || !(await carregarSharp())) return null;
  const arq = path.join(process.cwd(), 'public', imagem);
  try {
    await fs.access(arq);
    return arq;
  } catch {
    return null;
  }
}

/** JPG com fundo branco, a foto centralizada na caixa e sem ampliar além do original. */
export async function gerarFotoEmail(arq: string): Promise<Buffer> {
  const s = (await carregarSharp())!;
  const { data, info } = await s(arq)
    .resize(LARGURA_FOTO_EMAIL, ALTURA_FOTO_EMAIL, { fit: 'inside', withoutEnlargement: true })
    .flatten({ background: '#ffffff' })
    .toBuffer({ resolveWithObject: true });
  const x = LARGURA_FOTO_EMAIL - info.width;
  const y = ALTURA_FOTO_EMAIL - info.height;
  return s(data)
    .extend({ left: Math.floor(x / 2), right: Math.ceil(x / 2), top: Math.floor(y / 2), bottom: Math.ceil(y / 2), background: '#ffffff' })
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();
}

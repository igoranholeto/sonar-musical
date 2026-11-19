// Preços atuais de cada produto do catálogo, no formato que as funções de alerta de preço
// leem depois de cada deploy (netlify/lib/alertas-core.mjs). Mesmos dados da ficha
// /produto/<id>/ e do CSV da Black Friday; só o essencial, para o arquivo ficar leve.
// `f: 1`: o produto tem a foto em JPG para e-mail (/images/email-produtos/<id>.jpg).
import { carregarOfertas } from '../../utils/ofertas';
import { arquivoFotoEmail } from '../../utils/foto-email';

export async function GET() {
  const produtos: Record<string, { n: string; p: number; s: string; e: string; x?: 1; c?: number; m: number; f?: 1 }> = {};
  for (const o of (await carregarOfertas()).values()) {
    produtos[o.id] = {
      n: o.nome,
      p: o.preco,
      s: o.status,
      e: o.precoEm.toISOString().slice(0, 10),
      ...(o.pix ? { x: 1 as const } : {}),
      ...(o.pix && o.cartao ? { c: o.cartao } : {}),
      m: o.menor.preco,
      ...((await arquivoFotoEmail(o.imagem)) ? { f: 1 as const } : {}),
    };
  }
  return new Response(JSON.stringify({ geradoEm: new Date().toISOString(), produtos }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

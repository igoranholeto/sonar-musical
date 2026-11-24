import type { Config, Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { createHash } from 'node:crypto';

const STORE_NAME = 'sonar-musical-leaderboard';
const BLOB_KEY = 'entries';
const MAX_ENTRIES = 50;
const MAX_NAME_LENGTH = 16;
// Uma partida dura minutos: 20 pontuações por IP por dia sobra para quem joga de verdade
// e impede que alguém encha o placar com nomes e pontos falsos.
const MAX_POR_IP_DIA = 20;

// Só o próprio site grava pontuação: o jogo chama a API pela mesma origem. Pedido sem
// Origin (curl, script) ou de outro domínio é recusado. Prévia de deploy e netlify dev
// continuam funcionando.
const ORIGENS_OK = [/^https:\/\/sonarmusical\.com\.br$/, /^https:\/\/[a-z0-9-]+--fastidious-kashata-25f3a7\.netlify\.app$/, /^http:\/\/localhost(:\d+)?$/];

interface LeaderboardEntry {
  name: string;
  score: number;
  bosses: number;
  difficulty: string;
  date: string;
}

function sanitizeName(raw: unknown): string {
  const name = typeof raw === 'string' ? raw.trim() : '';
  const cleaned = name.replace(/[^\p{L}\p{N} _.-]/gu, '').slice(0, MAX_NAME_LENGTH);
  return cleaned || 'Anônimo';
}

const json = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

/** Conta uma gravação do IP no dia; devolve false se passou do limite. O IP vai com hash. */
async function contarIp(store: ReturnType<typeof getStore>, ip: string | undefined): Promise<boolean> {
  if (!ip) return true;
  const dia = new Date().toISOString().slice(0, 10);
  const k = `ip/${createHash('sha256').update(`${ip}|${dia}`).digest('hex')}`;
  const atual = ((await store.get(k, { type: 'json' })) as { n: number } | null) ?? { n: 0 };
  if (atual.n >= MAX_POR_IP_DIA) return false;
  await store.setJSON(k, { dia, n: atual.n + 1 });
  return true;
}

export default async (req: Request, context: Context) => {
  const store = getStore(STORE_NAME);

  if (req.method === 'GET') {
    const entries = ((await store.get(BLOB_KEY, { type: 'json' })) as LeaderboardEntry[] | null) ?? [];
    return json({ entries });
  }

  if (req.method === 'POST') {
    const origem = req.headers.get('origin') ?? '';
    if (!ORIGENS_OK.some((re) => re.test(origem))) return json({ error: 'Origem não permitida' }, 403);
    if (!(await contarIp(store, context.ip))) return json({ error: 'Muitas pontuações hoje a partir desta conexão. Tente amanhã.' }, 429);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return json({ error: 'JSON inválido' }, 400);
    }

    const { name, score, bosses, difficulty } = (body ?? {}) as Record<string, unknown>;

    if (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 1_000_000) {
      return json({ error: 'Pontuação inválida' }, 400);
    }

    const entry: LeaderboardEntry = {
      name: sanitizeName(name),
      score: Math.round(score),
      bosses: typeof bosses === 'number' && Number.isFinite(bosses) ? Math.min(1000, Math.max(0, Math.round(bosses))) : 0,
      difficulty: typeof difficulty === 'string' ? difficulty.replace(/[^\p{L}\p{N} _.-]/gu, '').slice(0, 20) : 'Iniciante',
      date: new Date().toISOString(),
    };

    const current = ((await store.get(BLOB_KEY, { type: 'json' })) as LeaderboardEntry[] | null) ?? [];
    const updated = [...current, entry].sort((a, b) => b.score - a.score).slice(0, MAX_ENTRIES);

    await store.setJSON(BLOB_KEY, updated);

    return json({ entries: updated });
  }

  return json({ error: 'Método não permitido' }, 405);
};

export const config: Config = {
  path: '/api/leaderboard',
};

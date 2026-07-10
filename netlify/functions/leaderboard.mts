import type { Config } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

const STORE_NAME = 'sonar-musical-leaderboard';
const BLOB_KEY = 'entries';
const MAX_ENTRIES = 50;
const MAX_NAME_LENGTH = 16;

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

function corsHeaders(): Record<string, string> {
  return {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
  };
}

export default async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const store = getStore(STORE_NAME);

  if (req.method === 'GET') {
    const entries = ((await store.get(BLOB_KEY, { type: 'json' })) as LeaderboardEntry[] | null) ?? [];
    return new Response(JSON.stringify({ entries }), { headers: corsHeaders() });
  }

  if (req.method === 'POST') {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: corsHeaders() });
    }

    const { name, score, bosses, difficulty } = (body ?? {}) as Record<string, unknown>;

    if (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 1_000_000) {
      return new Response(JSON.stringify({ error: 'Pontuação inválida' }), { status: 400, headers: corsHeaders() });
    }

    const entry: LeaderboardEntry = {
      name: sanitizeName(name),
      score: Math.round(score),
      bosses: typeof bosses === 'number' && Number.isFinite(bosses) ? Math.max(0, Math.round(bosses)) : 0,
      difficulty: typeof difficulty === 'string' ? difficulty.slice(0, 20) : 'Iniciante',
      date: new Date().toISOString(),
    };

    const current = ((await store.get(BLOB_KEY, { type: 'json' })) as LeaderboardEntry[] | null) ?? [];
    const updated = [...current, entry].sort((a, b) => b.score - a.score).slice(0, MAX_ENTRIES);

    await store.setJSON(BLOB_KEY, updated);

    return new Response(JSON.stringify({ entries: updated }), { headers: corsHeaders() });
  }

  return new Response('Method not allowed', { status: 405, headers: corsHeaders() });
};

export const config: Config = {
  path: '/api/leaderboard',
};

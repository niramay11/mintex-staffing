import { NextResponse } from 'next/server';
import { ceipalFetch, CEIPAL_JOBS_URL } from '@/lib/ceipal';

export const maxDuration = 60;

const PAGE_SIZE = 50;
const CACHE_TTL = 5 * 60 * 1000;

let cache: { data: unknown[]; at: number } | null = null;
let inflight: Promise<unknown[]> | null = null;

function jobCodeNum(code: unknown): number {
  const m = String(code ?? '').match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

async function fetchPage(page: number): Promise<unknown[]> {
  const url = `${CEIPAL_JOBS_URL}?paging_length=${PAGE_SIZE}&page=${page}`;
  const res = await ceipalFetch(url);
  if (!res.ok) {
    console.error(`[jobs] page ${page} failed: ${res.status}`);
    return [];
  }
  const data = await res.json();
  return Array.isArray(data?.results) ? data.results : [];
}

async function fetchAllJobs(): Promise<unknown[]> {
  const all: unknown[] = [];

  // Sequential fetch — avoids CEIPAL rate-limit terminations
  for (let page = 1; page <= 200; page++) {
    const results = await fetchPage(page);
    if (results.length === 0) break;
    all.push(...results);
    if (results.length < PAGE_SIZE) break; // last page
  }

  // Keep only JPC jobs, deduplicate, sort newest first
  const jpc = all.filter(j =>
    String((j as Record<string, unknown>).job_code ?? '').startsWith('JPC')
  );

  const seen = new Set<string>();
  const deduped = jpc.filter(j => {
    const code = String((j as Record<string, unknown>).job_code ?? '');
    if (seen.has(code)) return false;
    seen.add(code);
    return true;
  });

  deduped.sort((a, b) =>
    jobCodeNum((b as Record<string, unknown>).job_code) -
    jobCodeNum((a as Record<string, unknown>).job_code)
  );

  return deduped;
}

export async function GET(req: import('next/server').NextRequest) {
  const forceRefresh = new URL(req.url).searchParams.get('refresh') === '1';

  try {
    if (!forceRefresh && cache && Date.now() < cache.at + CACHE_TTL) {
      return NextResponse.json({ results: cache.data, count: cache.data.length, cached_at: cache.at });
    }

    if (forceRefresh) { cache = null; inflight = null; }

    if (!inflight) {
      inflight = fetchAllJobs()
        .then(data => { cache = { data, at: Date.now() }; return data; })
        .finally(() => { inflight = null; });
    }

    const results = await inflight;
    return NextResponse.json({ results, count: results.length, cached_at: cache?.at ?? Date.now() });
  } catch (err) {
    console.error('[jobs] error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

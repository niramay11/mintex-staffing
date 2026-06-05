import { NextResponse } from 'next/server';
import { ceipalFetch, CEIPAL_JOBS_URL } from '@/lib/ceipal';

const PAGE_SIZE  = 50;
const CACHE_TTL  = 5 * 60 * 1000; // 5 minutes
const MAX_PAGES  = 50;             // safety cap — 50 × 50 = 2500 jobs max

let cache: { data: unknown[]; at: number } | null = null;
let inflight: Promise<unknown[]> | null = null;

function jobCodeNum(code: unknown): number {
  const m = String(code ?? '').match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

async function fetchPage(page: number): Promise<unknown[]> {
  const url = `${CEIPAL_JOBS_URL}?paging_length=${PAGE_SIZE}&page=${page}`;
  const res  = await ceipalFetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data?.results) ? data.results : [];
}

async function fetchAllJobs(): Promise<unknown[]> {
  // Fetch page 1 first
  const first = await fetchPage(1);
  if (first.length === 0) return [];

  // If page 1 is full, probe ahead in parallel batches
  const all = [...first];

  if (first.length === PAGE_SIZE) {
    // Fetch pages 2-50 in parallel batches of 10
    for (let batch = 0; batch < MAX_PAGES / 10; batch++) {
      const startPage = 2 + batch * 10;
      const pages = Array.from({ length: 10 }, (_, i) => startPage + i);
      const results = await Promise.all(pages.map(fetchPage));

      let done = false;
      for (const pageResults of results) {
        if (pageResults.length === 0) { done = true; break; }
        all.push(...pageResults);
        if (pageResults.length < PAGE_SIZE) { done = true; break; }
      }
      if (done) break;
    }
  }

  // Keep only real JPC jobs (filter out VJ / vendor jobs)
  const jpc = all.filter(j => String((j as Record<string,unknown>).job_code ?? '').startsWith('JPC'));

  // Deduplicate by job_code
  const seen = new Set<string>();
  const deduped = jpc.filter(j => {
    const code = String((j as Record<string,unknown>).job_code ?? '');
    if (seen.has(code)) return false;
    seen.add(code);
    return true;
  });

  // Sort newest first (JPC-1482 → 1482)
  deduped.sort((a, b) => jobCodeNum((b as Record<string,unknown>).job_code) - jobCodeNum((a as Record<string,unknown>).job_code));
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
    console.error('Jobs API error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

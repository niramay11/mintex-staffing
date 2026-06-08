import { NextResponse } from 'next/server';
import { ceipalFetch, CEIPAL_JOBS_URL } from '@/lib/ceipal';

export const maxDuration = 60;

const PAGE_SIZE     = 50;
const CACHE_TTL     = 5 * 60 * 1000;   // 5 min
const STALE_TTL     = 2 * 60 * 1000;   // 2 min stale window
const CACHE_VERSION = 8;

let cache: { data: unknown[]; at: number; v: number } | null = null;
let inflight: Promise<unknown[]> | null = null;

function jobCodeNum(code: unknown): number {
  const m = String(code ?? '').match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Returns the parsed results array, or null if the response is an error (HTML/non-JSON)
async function fetchPage(page: number): Promise<unknown[] | null> {
  try {
    const res = await ceipalFetch(`${CEIPAL_JOBS_URL}?paging_length=${PAGE_SIZE}&page=${page}`);
    if (!res.ok) return null;

    const text = await res.text();
    // CEIPAL sometimes returns HTML error pages instead of JSON — detect and treat as error
    if (!text.trim().startsWith('{') && !text.trim().startsWith('[')) {
      console.warn(`[jobs] page ${page} returned non-JSON response`);
      return null;
    }

    const data = JSON.parse(text);
    const results = Array.isArray(data?.results) ? data.results : [];
    return results;
  } catch (err) {
    console.warn(`[jobs] page ${page} error:`, err);
    return null;
  }
}

async function fetchAllJobs(): Promise<unknown[]> {
  const all: unknown[] = [];
  let consecutiveErrors = 0;

  for (let page = 1; page <= 300; page++) {
    const results = await fetchPage(page);

    if (results === null) {
      // API error — skip this page and retry logic
      consecutiveErrors++;
      if (consecutiveErrors >= 3) {
        console.warn('[jobs] 3 consecutive errors, stopping fetch');
        break;
      }
      await sleep(500); // back off on error
      continue;
    }

    consecutiveErrors = 0;

    if (results.length === 0) {
      // Genuine end of data
      break;
    }

    all.push(...results);

    if (results.length < PAGE_SIZE) {
      // Last page — no more data
      break;
    }

    // no delay — sequential requests don't trigger CEIPAL rate limits
  }

  // Filter: JPC prefix only, deduplicate, sort newest first
  const seen = new Set<string>();
  const jpc = all
    .filter(j => {
      const code = String((j as Record<string, unknown>).job_code ?? '');
      if (!code.startsWith('JPC')) return false;
      if (seen.has(code)) return false;
      seen.add(code);
      return true;
    });

  jpc.sort((a, b) =>
    jobCodeNum((b as Record<string, unknown>).job_code) -
    jobCodeNum((a as Record<string, unknown>).job_code)
  );

  console.log(`[jobs] fetched ${all.length} total records, ${jpc.length} JPC jobs`);
  return jpc;
}

function triggerRefresh() {
  if (inflight) return;
  inflight = fetchAllJobs()
    .then(data  => { cache = { data, at: Date.now(), v: CACHE_VERSION }; return data; })
    .catch(err  => { console.error('[jobs] refresh failed:', err); return cache?.data ?? []; })
    .finally(() => { inflight = null; });
}

export async function GET(req: import('next/server').NextRequest) {
  const forceRefresh = new URL(req.url).searchParams.get('refresh') === '1';

  try {
    if (forceRefresh) { cache = null; inflight = null; }

    const now = Date.now();

    if (cache && cache.v !== CACHE_VERSION) { cache = null; inflight = null; }

    if (!forceRefresh && cache) {
      const age = now - cache.at;
      if (age < CACHE_TTL)
        return NextResponse.json({ results: cache.data, count: cache.data.length, cached_at: cache.at });
      if (age < CACHE_TTL + STALE_TTL) {
        triggerRefresh(); // refresh in background, serve stale immediately
        return NextResponse.json({ results: cache.data, count: cache.data.length, cached_at: cache.at, stale: true });
      }
    }

    // No cache — fetch now and wait
    if (!inflight) triggerRefresh();
    const results = await inflight!;
    return NextResponse.json({ results, count: results.length, cached_at: cache?.at ?? now });

  } catch (err) {
    console.error('[jobs] GET error:', err);
    if (cache) return NextResponse.json({ results: cache.data, count: cache.data.length, cached_at: cache.at, stale: true });
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

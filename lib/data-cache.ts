import { unstable_cache } from 'next/cache';
import { ceipalFetch, ceipalFetchV2, CEIPAL_JOBS_URL, CEIPAL_PLACEMENTS_URL } from './ceipal';

const PAGE_SIZE  = 50;
const BATCH_SIZE = 3;
const REVALIDATE = 300; // 5 minutes — Next.js data cache (persists across serverless invocations)

function jobCodeNum(code: unknown): number {
  const m = String(code ?? '').match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

async function fetchPage(page: number): Promise<Record<string, unknown>[] | null> {
  try {
    const res  = await ceipalFetch(`${CEIPAL_JOBS_URL}?paging_length=${PAGE_SIZE}&page=${page}`);
    if (!res.ok) return null;
    const text = await res.text();
    if (!text.trim().startsWith('{') && !text.trim().startsWith('[')) return null;
    const data = JSON.parse(text);
    return Array.isArray(data?.results) ? data.results : [];
  } catch { return null; }
}

async function fetchPageWithRetry(page: number): Promise<Record<string, unknown>[]> {
  const first = await fetchPage(page);
  if (first !== null) return first;
  await new Promise(r => setTimeout(r, 800));
  return (await fetchPage(page)) ?? [];
}

async function _fetchAllJobs(): Promise<Record<string, unknown>[]> {
  const all: Record<string, unknown>[] = [];
  for (let start = 1; start <= 300; start += BATCH_SIZE) {
    const pages   = Array.from({ length: BATCH_SIZE }, (_, i) => start + i);
    const results = await Promise.all(pages.map(fetchPageWithRetry));
    let done = false;
    for (const pageResults of results) {
      if (pageResults.length === 0) { done = true; break; }
      all.push(...pageResults);
      if (pageResults.length < PAGE_SIZE) { done = true; break; }
    }
    if (done) break;
  }

  const seen = new Set<string>();
  const jpc = all.filter(j => {
    const code = String(j.job_code ?? '');
    if (!code.startsWith('JPC')) return false;
    if (seen.has(code)) return false;
    seen.add(code);
    return true;
  });
  jpc.sort((a, b) => jobCodeNum(b.job_code) - jobCodeNum(a.job_code));
  return jpc;
}

async function _fetchAllPlacements(): Promise<Record<string, unknown>[]> {
  try {
    const res = await ceipalFetchV2(`${CEIPAL_PLACEMENTS_URL}?paging_length=500&page=1`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.results) ? data.results : [];
  } catch { return []; }
}

// Cached versions — Next.js data cache persists across serverless function invocations on Vercel.
// First request fetches from CEIPAL; all subsequent requests within 5 minutes return instantly.
export const getAllJobs = unstable_cache(
  _fetchAllJobs,
  ['ceipal-all-jobs'],
  { revalidate: REVALIDATE },
);

export const getAllPlacements = unstable_cache(
  _fetchAllPlacements,
  ['ceipal-all-placements'],
  { revalidate: REVALIDATE },
);

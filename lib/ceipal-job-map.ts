import { ceipalFetch } from './ceipal';

const V2_JOBS_URL = 'https://api.ceipal.com/v2/getJobPostingsList/';

// Shared in-memory cache: job_code → v2 encoded ID
type JobMap = Record<string, string>;
let cache: { map: JobMap; at: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

export async function getJobMap(): Promise<JobMap> {
  if (cache && Date.now() < cache.at + CACHE_TTL) return cache.map;

  const map: JobMap = {};
  let nextUrl: string | null = `${V2_JOBS_URL}?paging_length=100&page=1`;

  while (nextUrl) {
    const res = await ceipalFetch(nextUrl);
    if (!res.ok) break;
    const data = await res.json();
    const results: Record<string, unknown>[] = Array.isArray(data?.results)
      ? data.results : Array.isArray(data) ? data : [];
    if (results.length === 0) break;
    for (const job of results) {
      const code = String(job.job_code ?? '').trim();
      const id   = String(job.id ?? '').trim();
      if (code && id) map[code] = id;
    }
    nextUrl = typeof data?.next === 'string' && data.next ? data.next : null;
  }

  cache = { map, at: Date.now() };
  return map;
}

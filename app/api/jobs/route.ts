import { NextResponse } from 'next/server';
import { ceipalFetch } from '@/lib/ceipal';

// Extend serverless function timeout (Vercel Pro = 60s, Enterprise = 300s)
export const maxDuration = 60;

const PAGE_SIZE   = 50;
const CACHE_TTL   = 5 * 60 * 1000;
const V2_JOBS_URL = 'https://api.ceipal.com/v2/getJobPostingsList/';

let cache: { data: unknown[]; at: number } | null = null;
let inflight: Promise<unknown[]> | null = null;

function jobCodeNum(code: unknown): number {
  const m = String(code ?? '').match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

// Map V2 field names to the shape the admin table + modal expect
function normalise(j: Record<string, unknown>): Record<string, unknown> {
  return {
    ...j,
    job_title:           j.position_title ?? j.job_title ?? '',
    job_code:            j.job_code ?? '',
    job_status:          j.job_status ?? '',
    job_type:            j.employment_type ?? j.job_type ?? '',
    city:                j.primary_city ?? j.city ?? '',
    states:              j.primary_state ?? j.states ?? '',
    country:             j.country ?? '',
    number_of_positions: j.number_of_positions ?? '',
    primary_skills:      j.skills ?? j.primary_skills ?? '',
    pay_rate___salary:   Array.isArray(j.pay_rates) && (j.pay_rates as Record<string, unknown>[]).length > 0
                           ? String((j.pay_rates as Record<string, unknown>[])[0].pay_rate ?? '')
                           : String(j.pay_rate___salary ?? ''),
    job_start_date:      j.job_start_date ?? '',
    job_end_date:        j.job_end_date ?? '',
    work_authorization:  j.work_authorization ?? '',
    tax_terms:           j.tax_terms ?? '',
    remote_job:          j.remote_opportunities ?? j.remote_job ?? '',
    industry:            j.industry ?? '',
    job_description:     j.requisition_description ?? j.public_job_desc ?? '',
    client:              j.client ?? '',
  };
}

type PageResult = { results: Record<string, unknown>[]; next: string | null; count: number };

async function fetchPage(page: number): Promise<PageResult> {
  const url = `${V2_JOBS_URL}?paging_length=${PAGE_SIZE}&page=${page}`;
  const res = await ceipalFetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error(`[jobs] CEIPAL page ${page} error ${res.status}:`, body);
    return { results: [], next: null, count: 0 };
  }
  const data = await res.json();
  const results: Record<string, unknown>[] = Array.isArray(data?.results)
    ? data.results
    : Array.isArray(data) ? data : [];
  return {
    results,
    next:  data?.next  ?? null,
    count: data?.count ?? 0,
  };
}

async function fetchAllJobs(): Promise<unknown[]> {
  const all: unknown[] = [];

  for (let page = 1; page <= 200; page++) {
    const { results, next } = await fetchPage(page);
    if (results.length === 0) break;
    all.push(...results.map(normalise));
    // Stop only when CEIPAL says there is no next page
    if (!next) break;
  }

  // Keep only JPC jobs, deduplicate, sort newest first
  const jpc = all.filter(j => String((j as Record<string, unknown>).job_code ?? '').includes('JPC'));

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

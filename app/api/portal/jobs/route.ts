import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/portal-auth';
import { ceipalFetch, CEIPAL_JOBS_URL } from '@/lib/ceipal';

const CACHE_TTL = 5 * 60 * 1000;
// Share the same cache as the admin jobs API to avoid double-fetching
let cache: { data: Record<string, unknown>[]; at: number } | null = null;
let inflight: Promise<Record<string, unknown>[]> | null = null;

export function invalidatePortalJobsCache() { cache = null; inflight = null; }
const PAGE_SIZE = 50;

async function fetchPage(page: number): Promise<Record<string, unknown>[]> {
  const res = await ceipalFetch(`${CEIPAL_JOBS_URL}?paging_length=${PAGE_SIZE}&page=${page}`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data?.results) ? data.results : [];
}

function jobCodeNum(code: unknown): number {
  const m = String(code ?? '').match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

async function fetchAllJobs(): Promise<Record<string, unknown>[]> {
  const first = await fetchPage(1);
  if (first.length === 0) return [];
  const all = [...first];
  if (first.length === PAGE_SIZE) {
    for (let batch = 0; batch < 5; batch++) {
      const startPage = 2 + batch * 10;
      const results = await Promise.all(Array.from({ length: 10 }, (_, i) => fetchPage(startPage + i)));
      let done = false;
      for (const r of results) {
        if (r.length === 0) { done = true; break; }
        all.push(...r);
        if (r.length < PAGE_SIZE) { done = true; break; }
      }
      if (done) break;
    }
  }
  const jpc = all.filter(j => String(j.job_code ?? '').startsWith('JPC'));
  const seen = new Set<string>();
  const deduped = jpc.filter(j => {
    const c = String(j.job_code ?? '');
    if (seen.has(c)) return false;
    seen.add(c); return true;
  });
  deduped.sort((a, b) => jobCodeNum(b.job_code) - jobCodeNum(a.job_code));
  return deduped;
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('portal_token')?.value;
  const client = await verifySession(token ?? '') as Record<string, unknown> | null;
  if (!client) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Load all jobs (cached)
    if (!cache || Date.now() > cache.at + CACHE_TTL) {
      if (!inflight) {
        inflight = fetchAllJobs()
          .then(d => { cache = { data: d, at: Date.now() }; return d; })
          .finally(() => { inflight = null; });
      }
      await inflight;
    }

    const all          = cache?.data ?? [];
    const allowedCodes = (client.allowed_job_codes as string[]) ?? [];
    const ceipalName   = String(client.ceipal_client_name ?? client.company ?? '').toLowerCase().trim();
    const permissions  = (client.permissions as Record<string, boolean>) ?? {};

    let jobs: Record<string, unknown>[];

    if (allowedCodes.length > 0) {
      // Admin specified exact job codes → show only those
      jobs = all.filter(j => allowedCodes.includes(String(j.job_code ?? '')));
    } else if (ceipalName) {
      // No specific codes → match by client name in CEIPAL (job.client field)
      jobs = all.filter(j => {
        const jobClient = String(j.client ?? '').toLowerCase().trim();
        return jobClient === ceipalName;
      });
    } else {
      jobs = [];
    }

    // Strip sensitive fields based on permissions
    const stripped = jobs.map(job => {
      const j = { ...job };
      if (!permissions.show_bill_rate && !permissions.show_job_salary) {
        delete j.client_bill_rate___salary;
      }
      if (!permissions.show_pay_rate && !permissions.show_job_salary) {
        delete j.pay_rate___salary;
      }
      if (!permissions.show_job_description) {
        delete j.job_description;
        delete j.public_job_description;
      }
      if (!permissions.show_required_skills) {
        delete j.primary_skills;
        delete j.secondary_skills;
      }
      return j;
    });

    return NextResponse.json({ results: stripped, count: stripped.length });
  } catch (err) {
    console.error('Portal jobs error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

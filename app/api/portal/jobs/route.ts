import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/portal-auth';
import { ceipalFetch, CEIPAL_JOBS_URL } from '@/lib/ceipal';

const PAGE_SIZE  = 50;
const CACHE_TTL  = 6 * 60 * 60 * 1000; // 6 hours
const STALE_TTL  = 30 * 60 * 1000;     // serve stale for 30 min while refreshing bg
const BATCH_SIZE = 5;                   // 5 parallel pages at a time

let cache: { data: Record<string, unknown>[]; at: number } | null = null;
let inflight: Promise<Record<string, unknown>[]> | null = null;

function jobCodeNum(code: unknown): number {
  const m = String(code ?? '').match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

async function fetchPage(page: number): Promise<Record<string, unknown>[]> {
  try {
    const res = await ceipalFetch(`${CEIPAL_JOBS_URL}?paging_length=${PAGE_SIZE}&page=${page}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.results) ? data.results : [];
  } catch { return []; }
}

async function fetchAllJobs(): Promise<Record<string, unknown>[]> {
  const all: Record<string, unknown>[] = [];

  for (let start = 1; start <= 200; start += BATCH_SIZE) {
    const pages   = Array.from({ length: BATCH_SIZE }, (_, i) => start + i);
    const results = await Promise.all(pages.map(fetchPage));
    let done = false;
    for (const r of results) {
      if (r.length === 0) { done = true; break; }
      all.push(...r);
      if (r.length < PAGE_SIZE) { done = true; break; }
    }
    if (done) break;
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

function triggerRefresh() {
  if (inflight) return;
  inflight = fetchAllJobs()
    .then(d => { cache = { data: d, at: Date.now() }; return d; })
    .finally(() => { inflight = null; });
}

const ALWAYS_STRIP = [
  'primary_recruiter','assigned_recruiter','sales_manager','recruitment_manager',
  'posted_by','created_by','modified_by','business_unit_id','business_unit',
  'apply_job','apply_job_without_registration','contact_person','client_job_id','is_recycle',
];

export async function GET(req: NextRequest) {
  const token = req.cookies.get('portal_token')?.value;
  const client = await verifySession(token ?? '') as Record<string, unknown> | null;
  if (!client) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const now = Date.now();

    // Stale-while-revalidate: serve cache instantly, refresh in background
    if (cache) {
      const age = now - cache.at;
      if (age >= CACHE_TTL && age < CACHE_TTL + STALE_TTL) triggerRefresh();
      else if (age >= CACHE_TTL + STALE_TTL) { cache = null; }
    }

    if (!cache) {
      if (!inflight) triggerRefresh();
      await inflight;
    }

    const all          = cache?.data ?? [];
    const allowedCodes = (client.allowed_job_codes as string[]) ?? [];
    const ceipalName   = String(client.ceipal_client_name ?? client.company ?? '').toLowerCase().trim();
    const permissions  = (client.permissions as Record<string, boolean>) ?? {};

    let jobs: Record<string, unknown>[];
    if (allowedCodes.length > 0) {
      jobs = all.filter(j => allowedCodes.includes(String(j.job_code ?? '')));
    } else if (ceipalName) {
      jobs = all.filter(j => String(j.client ?? '').toLowerCase().trim() === ceipalName);
    } else {
      jobs = [];
    }

    const stripped = jobs.map(job => {
      const j = { ...job };
      for (const f of ALWAYS_STRIP) delete j[f];
      if (!permissions.show_bill_rate)       { delete j.client_bill_rate___salary; }
      if (!permissions.show_pay_rate)        { delete j.pay_rate___salary; }
      if (!permissions.show_job_description) { delete j.job_description; delete j.public_job_description; }
      if (!permissions.show_required_skills) { delete j.primary_skills; delete j.secondary_skills; }
      return j;
    });

    return NextResponse.json({ results: stripped, count: stripped.length });
  } catch (err) {
    if (cache) {
      // Return stale on error rather than failing
      return NextResponse.json({ results: cache.data, count: cache.data.length });
    }
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

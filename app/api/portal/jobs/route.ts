import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/portal-auth';
import { ceipalFetch, CEIPAL_JOBS_URL } from '@/lib/ceipal';

const CACHE_TTL = 5 * 60 * 1000;
const PAGE_SIZE = 50;

let cache: { data: Record<string, unknown>[]; at: number } | null = null;
let inflight: Promise<Record<string, unknown>[]> | null = null;

function jobCodeNum(code: unknown): number {
  const m = String(code ?? '').match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

async function fetchPage(page: number): Promise<Record<string, unknown>[]> {
  const res = await ceipalFetch(`${CEIPAL_JOBS_URL}?paging_length=${PAGE_SIZE}&page=${page}`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data?.results) ? data.results : [];
}

async function fetchAllJobs(): Promise<Record<string, unknown>[]> {
  const all: Record<string, unknown>[] = [];

  // Sequential fetch — custom URL returns client name field needed for matching
  for (let page = 1; page <= 200; page++) {
    const results = await fetchPage(page);
    if (results.length === 0) break;
    all.push(...results);
    if (results.length < PAGE_SIZE) break;
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

// Always strip these internal fields from client view
const ALWAYS_STRIP = [
  'primary_recruiter', 'assigned_recruiter', 'sales_manager',
  'client_manager', 'recruitment_manager',
  'posted_by', 'created_by', 'modified_by',
  'business_unit_id', 'business_unit',
  'apply_job', 'apply_job_without_registration',
  'contact_person', 'client_job_id', 'is_recycle',
];

export async function GET(req: NextRequest) {
  const token = req.cookies.get('portal_token')?.value;
  const client = await verifySession(token ?? '') as Record<string, unknown> | null;
  if (!client) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
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
      // Admin assigned specific job codes
      jobs = all.filter(j => allowedCodes.includes(String(j.job_code ?? '')));
    } else if (ceipalName) {
      // Match by client name — custom URL returns client field with company name
      jobs = all.filter(j =>
        String(j.client ?? '').toLowerCase().trim() === ceipalName
      );
    } else {
      jobs = [];
    }

    // Strip fields based on permissions + always-private fields
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
    console.error('Portal jobs error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

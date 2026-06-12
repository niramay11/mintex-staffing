import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/portal-auth';
import { ceipalFetch } from '@/lib/ceipal';
import { getJobMap } from '@/lib/ceipal-job-map';
import { getAllJobs } from '@/lib/data-cache';

export const maxDuration = 60;

const CACHE_TTL = 3 * 60 * 1000;
let cache: { data: Record<string, unknown>[]; clientId: string; at: number } | null = null;

async function fetchApplicantName(jobSeekerId: string): Promise<string> {
  try {
    const res = await ceipalFetch(`https://api.ceipal.com/v2/getApplicantDetails/${encodeURIComponent(jobSeekerId)}/`);
    if (!res.ok) return '';
    const raw = await res.json();
    const d = (Array.isArray(raw) ? raw[0] : raw) as Record<string, unknown>;
    if (!d) return '';
    return String(
      d.consultant_name ?? d.full_name ?? d.applicant_name ??
      `${d.firstname ?? d.first_name ?? ''} ${d.lastname ?? d.last_name ?? ''}`.trim()
    ).trim();
  } catch { return ''; }
}

async function fetchJobSubmissions(v2Id: string): Promise<Record<string, unknown>[]> {
  try {
    const res = await ceipalFetch(`https://api.ceipal.com/v2/getSubmissionsList?jobId=${encodeURIComponent(v2Id)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
  } catch { return []; }
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('portal_token')?.value;
  const client = await verifySession(token ?? '') as Record<string, unknown> | null;
  if (!client) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clientId = String(client.id ?? client.name ?? '');

  // Accept explicit job_codes from frontend (most accurate — uses already-loaded job list)
  const url = new URL(req.url);
  const jobCodesParam = url.searchParams.get('job_codes');
  const explicitCodes = jobCodesParam ? jobCodesParam.split(',').map(s => s.trim()).filter(Boolean) : null;

  try {
    // Only use cache when no explicit job codes provided
    if (!explicitCodes && cache && cache.clientId === clientId && Date.now() - cache.at < CACHE_TTL) {
      return NextResponse.json({ results: cache.data, count: cache.data.length });
    }

    const permissions = (client.permissions as Record<string, boolean>) ?? {};
    const showName    = permissions.show_candidate_name !== false;
    const allowedCodes = (client.allowed_job_codes as string[]) ?? [];
    const ceipalName   = String(client.ceipal_client_name ?? client.company ?? '').toLowerCase().trim();

    let jobs: Record<string, unknown>[];

    if (explicitCodes && explicitCodes.length > 0) {
      // Frontend passes job codes already filtered by the portal jobs route (verified by session)
      // Use the full job info from getAllJobs for enrichment but only for these codes
      const allJobs = await getAllJobs();
      const jobMap  = new Map(allJobs.map(j => [String(j.job_code ?? ''), j]));
      jobs = explicitCodes.map(code => jobMap.get(code) ?? { job_code: code });
    } else {
      // No explicit codes — derive from session
      const allJobs = await getAllJobs();
      if (allowedCodes.length > 0) {
        jobs = allJobs.filter(j => allowedCodes.includes(String(j.job_code ?? '')));
      } else if (ceipalName) {
        jobs = allJobs.filter(j => String(j.client ?? '').toLowerCase().trim() === ceipalName);
      } else {
        jobs = [];
      }
    }

    if (jobs.length === 0) return NextResponse.json({ results: [], count: 0 });

    console.log(`[submissions] client="${ceipalName}" using ${jobs.length} jobs:`, jobs.map(j => j.job_code));

    // Get job code → v2Id map
    const map = await getJobMap();

    // Fetch submissions for all jobs in parallel (max 8 at a time)
    const BATCH = 8;
    const allSubmissions: Record<string, unknown>[] = [];

    for (let i = 0; i < jobs.length; i += BATCH) {
      const batch = jobs.slice(i, i + BATCH);
      const results = await Promise.all(batch.map(async job => {
        const jobCode = String(job.job_code ?? '');
        const v2Id    = map[jobCode] ?? '';
        if (!v2Id) return [];

        const subs = await fetchJobSubmissions(v2Id);
        if (subs.length > 0) console.log(`[submissions] job=${jobCode} fetched ${subs.length} submissions`);

        // Enrich and attach job context
        const enriched = await Promise.all(subs.map(async s => {
          const sub: Record<string, unknown> = { ...s };

          if (showName && sub.job_seeker_id) {
            const name = await fetchApplicantName(String(sub.job_seeker_id));
            if (name) sub.candidate_name = name;
          }

          // Attach job context
          sub.job_code  = jobCode;
          sub.job_title = job.job_title ?? '';
          sub.job_city  = job.city ?? '';
          sub.job_state = job.states ?? '';

          // Strip sensitive fields
          delete sub.submitted_by;
          delete sub.tagged_by;
          delete sub.job_seeker_id;
          delete sub.merge_document_path;
          delete sub.merged_pdf_document;
          delete sub.selected_submission_documents;
          delete sub.Documents;
          if (!permissions.show_pay_rate)  { delete sub.pay_rate; }
          if (!permissions.show_tax_terms) { delete sub.tax_term; }

          return sub;
        }));

        return enriched;
      }));

      for (const r of results) allSubmissions.push(...r);
    }

    // Sort by submitted_on descending
    allSubmissions.sort((a, b) => {
      const da = new Date(String(a.submitted_on ?? '')).getTime() || 0;
      const db = new Date(String(b.submitted_on ?? '')).getTime() || 0;
      return db - da;
    });

    cache = { data: allSubmissions, clientId, at: Date.now() };
    return NextResponse.json({ results: allSubmissions, count: allSubmissions.length });

  } catch (err) {
    console.error('[portal/submissions] error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

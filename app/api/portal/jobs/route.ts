import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/portal-auth';
import { getV2Jobs } from '@/lib/ceipal-job-map';
import { resolveCompanyId } from '@/lib/ceipal-client-map';

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
    const all          = await getV2Jobs();
    const allowedCodes = (client.allowed_job_codes as string[]) ?? [];
    const ceipalId     = String(client.ceipal_id   ?? '').trim();
    const ceipalName   = String(client.ceipal_client_name ?? client.company ?? '').toLowerCase().trim();
    const permissions  = (client.permissions as Record<string, boolean>) ?? {};

    // Keep only JPC jobs
    const jpc = all.filter(j => String(j.job_code ?? '').includes('JPC'));

    let jobs: Record<string, unknown>[];

    if (allowedCodes.length > 0) {
      // Admin explicitly assigned job codes — most precise, always works
      jobs = jpc.filter(j => allowedCodes.includes(String(j.job_code ?? '')));

    } else {
      // Auto-resolve: look up client's CEIPAL company ID by name,
      // then match against the V2 jobs `company` field
      const companyId = await resolveCompanyId(ceipalName) ?? ceipalId;

      if (companyId) {
        jobs = jpc.filter(j => String(j.company ?? '') === String(companyId));
      } else {
        // Last resort: name match on client field (works if custom-URL data cached)
        jobs = ceipalName
          ? jpc.filter(j => String(j.client ?? '').toLowerCase().trim() === ceipalName)
          : [];
      }
    }

    console.log(`[portal/jobs] client="${ceipalName}" → ${jobs.length} jobs`);

    // Strip private + permission-controlled fields
    const stripped = jobs.map(job => {
      const j = { ...job };
      for (const f of ALWAYS_STRIP) delete j[f];
      if (!permissions.show_bill_rate)       { delete j.client_bill_rate___salary; }
      if (!permissions.show_pay_rate)        { delete j.pay_rate___salary; delete j.pay_rates; }
      if (!permissions.show_job_description) { delete j.job_description; delete j.requisition_description; delete j.public_job_desc; }
      if (!permissions.show_required_skills) { delete j.primary_skills; delete j.secondary_skills; delete j.skills; }
      return j;
    });

    return NextResponse.json({ results: stripped, count: stripped.length });
  } catch (err) {
    console.error('Portal jobs error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

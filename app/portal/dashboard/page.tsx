import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/portal-auth';
import { getAllJobs, getAllPlacements } from '@/lib/data-cache';
import PortalDashboardClient from './PortalDashboardClient';

export const dynamic = 'force-dynamic';

const ALWAYS_STRIP = [
  'primary_recruiter','assigned_recruiter','sales_manager','recruitment_manager',
  'posted_by','created_by','modified_by','business_unit_id','business_unit',
  'apply_job','apply_job_without_registration','contact_person','client_job_id','is_recycle',
];

export default async function PortalDashboardPage() {
  const cookieStore = await cookies();
  const token  = cookieStore.get('portal_token')?.value ?? '';
  const client = await verifySession(token) as Record<string, unknown> | null;

  if (!client) redirect('/portal/login');

  const [allJobs, allPlacements] = await Promise.all([getAllJobs(), getAllPlacements()]);

  const allowedCodes = (client.allowed_job_codes as string[]) ?? [];
  const ceipalName   = String(client.ceipal_client_name ?? client.company ?? '').toLowerCase().trim();
  const permissions  = (client.permissions as Record<string, boolean>) ?? {};

  // Filter jobs for this client
  let jobs: Record<string, unknown>[];
  if (allowedCodes.length > 0) {
    jobs = allJobs.filter(j => allowedCodes.includes(String(j.job_code ?? '')));
  } else if (ceipalName) {
    jobs = allJobs.filter(j => String(j.client ?? '').toLowerCase().trim() === ceipalName);
  } else {
    jobs = [];
  }

  // Strip sensitive fields based on permissions
  const strippedJobs = jobs.map(job => {
    const j = { ...job };
    for (const f of ALWAYS_STRIP) delete j[f];
    if (!permissions.show_bill_rate)       delete j.client_bill_rate___salary;
    if (!permissions.show_pay_rate)        delete j.pay_rate___salary;
    if (!permissions.show_job_description) { delete j.job_description; delete j.public_job_description; }
    if (!permissions.show_required_skills) { delete j.primary_skills; delete j.secondary_skills; }
    return j;
  });

  // Filter placements for this client
  const placements = ceipalName
    ? allPlacements.filter(p => String(p.client_name ?? '').toLowerCase() === ceipalName).map(p => {
        const item = { ...p };
        if (!permissions.show_bill_rate)        delete item.client_bill_rate;
        if (!permissions.show_pay_rate)         delete item.pay_rate;
        if (!permissions.show_candidate_contact){ delete item.mobile_number; delete item.email; }
        return item;
      })
    : [];

  const clientInfo = {
    id:          String(client.id ?? ''),
    name:        String(client.name ?? ''),
    email:       String(client.email ?? ''),
    company:     String(client.company ?? ''),
    permissions,
  };

  return (
    <PortalDashboardClient
      client={clientInfo}
      initialJobs={strippedJobs}
      initialPlacements={placements}
    />
  );
}

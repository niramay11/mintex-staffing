"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type ClientInfo = {
  id: string; name: string; email: string; company: string;
  permissions: Record<string, boolean>;
};
type Job         = Record<string, unknown>;
type Placement   = Record<string, unknown>;
type Submission  = {
  id: string; submission_id: number; submission_status: string;
  pipeline_status: string; source: string; submitted_on: string;
  modified: string; tax_term?: string; employment_type?: string;
  pay_rate?: string | null; applicant_id?: number;
};

const PIPELINE_STAGES = [
  'Pipeline','Submission','Client Submission',
  'Interview','Confirmation','Placement','Not Joined',
] as const;

function mapStageIdx(status: string): number {
  const s = (status ?? '').toLowerCase();
  if (s.includes('not joined'))                                        return 6;
  if (s.includes('placement') || s.includes('placed'))                return 5;
  if (s.includes('confirmation') || s.includes('confirmed'))          return 4;
  if (s.includes('interview'))                                        return 3;
  if (s.includes('client submission') || s.includes('waiting'))       return 2;
  if (s.includes('submission') || s.includes('submitted')
    || s.includes('approved') || s.includes('internal'))             return 1;
  return 0;
}

function statusColor(s: string) {
  const l = s.toLowerCase();
  if (l === 'active')           return 'bg-green-900/50 text-green-400';
  if (l === 'on hold')          return 'bg-yellow-900/50 text-yellow-400';
  if (l === 'hold by client')   return 'bg-orange-900/50 text-orange-400';
  if (l === 'filled')           return 'bg-blue-900/50 text-blue-400';
  if (l === 'draft')            return 'bg-purple-900/50 text-purple-400';
  if (l.includes('closed'))     return 'bg-red-900/40 text-red-400';
  return 'bg-gray-800 text-gray-400';
}

function PipelineDots({ stageIdx, submittedOn }: { stageIdx: number; submittedOn: string }) {
  const fmt = (d: string) => { try { return new Date(d).toLocaleDateString(); } catch { return ''; } };
  return (
    <div className="flex items-center w-full mt-3">
      {PIPELINE_STAGES.map((stage, i) => {
        const done   = i < stageIdx;
        const active = i === stageIdx;
        const neg    = stageIdx === 6 && i === 6;
        return (
          <div key={stage} className="flex-1 flex flex-col items-center relative min-w-0">
            {i < PIPELINE_STAGES.length - 1 && (
              <div className={`absolute top-[7px] left-1/2 w-full h-0.5 z-0 ${done || active ? 'bg-orange-600' : 'bg-gray-700'}`} />
            )}
            <div className={`relative z-10 w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${
              neg ? 'bg-red-500 border-red-500' :
              active ? 'bg-orange-400 border-orange-400 ring-2 ring-orange-400/30' :
              done ? 'bg-orange-600 border-orange-600' : 'bg-gray-700 border-gray-600'
            }`} />
            <p className={`text-[9px] mt-1 text-center truncate w-full px-0.5 ${active ? 'text-orange-400' : done ? 'text-orange-700' : 'text-gray-600'}`}>
              {stage.split(' ')[0]}
            </p>
            {active && submittedOn && <p className="text-[8px] text-orange-500 text-center truncate w-full">{fmt(submittedOn)}</p>}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main client component ────────────────────────────────────────────────────
export default function PortalDashboardClient({
  client,
  initialJobs,
  initialPlacements,
}: {
  client: ClientInfo;
  initialJobs: Job[];
  initialPlacements: Placement[];
}) {
  const router = useRouter();
  const [jobs, setJobs]               = useState<Job[]>(initialJobs);
  const [placements, setPlacements]   = useState<Placement[]>(initialPlacements);
  const [activeTab, setActiveTab]     = useState<'jobs' | 'placements'>('jobs');
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [syncing, setSyncing]         = useState(false);
  const [lastSynced, setLastSynced]   = useState<Date | null>(null);

  // Keep initialJobs/Placements in sync if the server re-renders with fresh data
  useEffect(() => { setJobs(initialJobs); }, [initialJobs]);
  useEffect(() => { setPlacements(initialPlacements); }, [initialPlacements]);

  const syncData = async () => {
    setSyncing(true);
    try {
      const [jd, pd] = await Promise.all([
        fetch('/api/portal/jobs?refresh=1').then(r => r.json()),
        fetch('/api/portal/placements?refresh=1').then(r => r.json()),
      ]);
      setJobs(Array.isArray(jd.results) ? jd.results : []);
      setPlacements(Array.isArray(pd.results) ? pd.results : []);
      setLastSynced(new Date());
    } catch { /* keep existing data */ }
    finally { setSyncing(false); }
  };

  const handleLogout = async () => {
    await fetch('/api/portal/logout', { method: 'POST' });
    router.push('/portal/login');
  };

  const statuses = ['all', ...Array.from(new Set(jobs.map(j => String(j.job_status ?? '')).filter(Boolean)))];

  const filtered = jobs.filter(j => {
    const matchSearch = !search ||
      String(j.job_title ?? '').toLowerCase().includes(search.toLowerCase()) ||
      String(j.job_code  ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || String(j.job_status ?? '') === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredPlacements = placements.filter(p =>
    !search ||
    String(p.first_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    String(p.last_name  ?? '').toLowerCase().includes(search.toLowerCase()) ||
    String(p.job_title  ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/logo.svg" alt="Mintex Staffing" width={120} height={36} className="brightness-0 invert" />
            <span className="text-gray-700">|</span>
            <span className="text-sm text-gray-400">Client Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{client.name}</p>
              <p className="text-xs text-gray-500">{client.company || client.email}</p>
            </div>
            <button onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Jobs"        value={jobs.length} />
          <StatCard label="Active Positions"  value={jobs.filter(j => String(j.job_status ?? '').toLowerCase().includes('active')).length} />
          <StatCard label="Placed Candidates" value={placements.length} />
        </div>

        {/* Tabs + Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-1">
              {(['jobs','placements'] as const).map(tab => (
                <button key={tab} onClick={() => { setActiveTab(tab); setSearch(''); setStatusFilter('all'); }}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    activeTab === tab ? 'bg-orange-600 text-white' : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                  }`}>
                  {tab === 'jobs' ? `Jobs (${jobs.length})` : `Candidates (${placements.length})`}
                </button>
              ))}
            </div>
            {/* Sync button */}
            <div className="flex items-center gap-2">
              <button
                onClick={syncData}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm transition-colors disabled:opacity-50 border border-gray-700">
                <svg className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {syncing ? 'Syncing…' : 'Sync Now'}
              </button>
              {lastSynced && (
                <span className="text-xs text-gray-500">
                  Last synced: {lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'jobs' && statuses.length > 2 && (
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-white text-sm focus:border-orange-500 focus:outline-none">
                {statuses.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</option>)}
              </select>
            )}
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={activeTab === 'jobs' ? 'Search jobs…' : 'Search candidates…'}
              className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 text-white text-sm w-56 focus:border-orange-500 focus:outline-none" />
          </div>
        </div>

        {activeTab === 'jobs' ? (
          <JobsTable jobs={filtered} permissions={client.permissions} onView={setSelectedJob} />
        ) : (
          <PlacementsTable placements={filteredPlacements} permissions={client.permissions} />
        )}
      </main>

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          permissions={client.permissions}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
      <p className="text-3xl font-bold text-orange-400">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
    </div>
  );
}

// ─── Jobs table ───────────────────────────────────────────────────────────────
function JobsTable({ jobs, permissions, onView }: { jobs: Job[]; permissions: Record<string, boolean>; onView: (j: Job) => void }) {
  if (jobs.length === 0) return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="text-gray-400 font-medium mb-1">No job postings assigned yet</p>
      <p className="text-gray-600 text-sm">Contact your Mintex account manager to get access to job postings.</p>
      <p className="text-gray-600 text-xs mt-3">If you have jobs assigned, try clicking <span className="text-orange-400">Sync Now</span> above.</p>
    </div>
  );
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-900 text-gray-400 text-left">
            <th className="px-4 py-3 font-medium">Job Code</th>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Location</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium text-center">Positions</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {jobs.map((job, i) => (
            <tr key={String(job.job_code ?? i)} className="hover:bg-gray-900/50 transition-colors cursor-pointer" onClick={() => onView(job)}>
              <td className="px-4 py-3 text-orange-400 font-mono text-xs whitespace-nowrap">{String(job.job_code ?? '—')}</td>
              <td className="px-4 py-3 text-white font-medium max-w-xs"><div className="truncate">{String(job.job_title ?? '—')}</div></td>
              <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{[job.city, job.states].filter(Boolean).join(', ') || '—'}</td>
              <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{String(job.job_type ?? '—')}</td>
              <td className="px-4 py-3 text-gray-400 text-center">{String(job.number_of_positions ?? '—')}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusColor(String(job.job_status ?? ''))}`}>
                  {String(job.job_status ?? '—')}
                </span>
              </td>
              <td className="px-4 py-3">
                <button onClick={e => { e.stopPropagation(); onView(job); }}
                  className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold transition-colors">
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Placements table ─────────────────────────────────────────────────────────
function PlacementsTable({ placements, permissions }: { placements: Placement[]; permissions: Record<string, boolean> }) {
  if (placements.length === 0) return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
      <p className="text-gray-500">No placed candidates yet.</p>
    </div>
  );
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-900 text-gray-400 text-left">
            {permissions.show_candidate_name !== false && <th className="px-4 py-3 font-medium">Name</th>}
            <th className="px-4 py-3 font-medium">Job Title</th>
            <th className="px-4 py-3 font-medium">Start Date</th>
            <th className="px-4 py-3 font-medium">Tax Terms</th>
            {permissions.show_candidate_email && <th className="px-4 py-3 font-medium">Email</th>}
            {permissions.show_placement_bill_rate && <th className="px-4 py-3 font-medium">Bill Rate</th>}
            {permissions.show_placement_pay_rate  && <th className="px-4 py-3 font-medium">Pay Rate</th>}
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {placements.map((p, i) => (
            <tr key={i} className="hover:bg-gray-900/50 transition-colors">
              {permissions.show_candidate_name !== false && (
                <td className="px-4 py-3 text-white font-medium">{[p.first_name, p.last_name].filter(Boolean).join(' ') || '—'}</td>
              )}
              <td className="px-4 py-3 text-gray-300">{String(p.job_title ?? '—')}</td>
              <td className="px-4 py-3 text-gray-400">{String(p.actual_start_date ?? p.tentative_start_date ?? '—')}</td>
              <td className="px-4 py-3 text-gray-400">{String(p.tax_terms ?? '—')}</td>
              {permissions.show_candidate_email && <td className="px-4 py-3 text-gray-400">{String(p.email ?? '—')}</td>}
              {permissions.show_placement_bill_rate && <td className="px-4 py-3 text-gray-400">{String(p.client_bill_rate ?? '—')}</td>}
              {permissions.show_placement_pay_rate  && <td className="px-4 py-3 text-gray-400">{String(p.pay_rate ?? '—')}</td>}
              <td className="px-4 py-3">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-400">Placed</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Job Detail Modal ─────────────────────────────────────────────────────────
function InfoCard({ label, value }: { label: string; value: string }) {
  if (!value || value === 'null' || value === 'undefined' || value === '0') return null;
  return (
    <div className="bg-gray-800/60 rounded-xl p-3">
      <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-gray-200">{value}</p>
    </div>
  );
}

function JobDetailModal({ job, permissions, onClose }: {
  job: Job; permissions: Record<string, boolean>; onClose: () => void;
}) {
  const [activeTab, setActiveTab]   = useState<'snapshot' | 'description' | 'skills' | 'submissions'>('snapshot');
  const [detail, setDetail]         = useState<Record<string, unknown> | null>(null);
  const [detailLoading, setDL]      = useState(false);
  const [submissions, setSubs]      = useState<Submission[]>([]);
  const [subsLoading, setSL]        = useState(false);
  const [stageFilter, setStageFilter] = useState('all');

  const jobCode = String(job.job_code ?? '');
  const status  = String(job.job_status ?? '');

  useEffect(() => {
    if (!jobCode) return;
    setDL(true);
    fetch(`/api/portal/job-details?job_code=${encodeURIComponent(jobCode)}`)
      .then(r => r.json()).then(d => { setDetail(d); setDL(false); })
      .catch(() => setDL(false));

    setSL(true);
    fetch(`/api/portal/job-submissions?job_code=${encodeURIComponent(jobCode)}`)
      .then(r => r.json()).then(d => { setSubs(Array.isArray(d) ? d : []); setSL(false); })
      .catch(() => setSL(false));
  }, [jobCode]);

  const desc   = String(detail?.requisition_description ?? detail?.public_job_desc ?? job.job_description ?? '');
  const skills = String(detail?.skills ?? job.primary_skills ?? '');
  const hasDesc   = !!desc && permissions.show_job_description !== false;
  const hasSkills = !!skills && permissions.show_required_skills !== false;

  const stageCounts = PIPELINE_STAGES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = submissions.filter(sub => PIPELINE_STAGES[mapStageIdx(sub.submission_status || sub.pipeline_status)] === s).length;
    return acc;
  }, {});

  const filteredSubs = stageFilter === 'all'
    ? submissions
    : submissions.filter(sub => PIPELINE_STAGES[mapStageIdx(sub.submission_status || sub.pipeline_status)] === stageFilter);

  const tabs = [
    { key: 'snapshot'     as const, label: 'Snapshot' },
    ...(hasDesc    ? [{ key: 'description'  as const, label: 'Description' }] : []),
    ...(hasSkills  ? [{ key: 'skills'       as const, label: 'Skills' }] : []),
    { key: 'submissions'  as const, label: `Submissions${subsLoading ? '' : ` (${submissions.length})`}` },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center overflow-y-auto py-6 px-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-4xl shadow-2xl">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="text-orange-400 font-mono text-xs bg-orange-950/60 px-2.5 py-1 rounded-md border border-orange-800/40">
                  {jobCode}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor(status)}`}>
                  {status || '—'}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white">{String(job.job_title ?? 'Job Detail')}</h2>
              <p className="text-gray-400 text-sm mt-1">
                {[job.city, job.states, job.country].filter(Boolean).join(', ')}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none shrink-0 p-1">&times;</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-800">
            <div><p className="text-[11px] text-gray-500 uppercase tracking-wide">Positions</p><p className="text-sm font-semibold text-white mt-0.5">{String(job.number_of_positions ?? '—')}</p></div>
            <div><p className="text-[11px] text-gray-500 uppercase tracking-wide">Job Type</p><p className="text-sm font-semibold text-white mt-0.5">{String(job.job_type ?? '—')}</p></div>
            <div><p className="text-[11px] text-gray-500 uppercase tracking-wide">Remote</p><p className="text-sm font-semibold text-white mt-0.5">{String(detail?.remote_opportunities ?? job.remote_job ?? '—')}</p></div>
            <div><p className="text-[11px] text-gray-500 uppercase tracking-wide">Industry</p><p className="text-sm font-semibold text-white mt-0.5">{String(detail?.industry ?? job.industry ?? '—')}</p></div>
          </div>
        </div>

        <div className="flex border-b border-gray-800 px-6 gap-1 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeTab === t.key
                  ? 'text-orange-400 border-b-2 border-orange-400 -mb-px'
                  : 'text-gray-400 hover:text-white'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6 min-h-[280px]">
          {activeTab === 'snapshot' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <InfoCard label="Start Date"  value={String(job.job_start_date ?? detail?.job_start_date ?? '')} />
              <InfoCard label="End Date"    value={String(job.job_end_date ?? detail?.job_end_date ?? '')} />
              <InfoCard label="Duration"    value={String(job.duration ?? detail?.duration ?? '')} />
              <InfoCard label="Experience"  value={String(job.experience ?? detail?.experience ?? '')} />
              <InfoCard label="Work Auth"   value={String(job.work_authorization ?? detail?.work_authorization ?? '')} />
              <InfoCard label="Tax Terms"   value={String(job.tax_terms ?? detail?.tax_terms ?? '')} />
              <InfoCard label="Closing Date" value={String(detail?.closing_date ?? '')} />
              <InfoCard label="Positions"   value={String(job.number_of_positions ?? '')} />
              {permissions.show_bill_rate && (
                <InfoCard label="Bill Rate" value={String(job.client_bill_rate___salary ?? '')} />
              )}
              {permissions.show_pay_rate && Array.isArray(detail?.pay_rates) && (detail.pay_rates as Record<string,unknown>[]).length > 0 && (
                <InfoCard label="Pay Rate" value={String((detail.pay_rates as Record<string,unknown>[])[0].pay_rate ?? '')} />
              )}
              {detailLoading && (
                <div className="col-span-3 flex items-center gap-2 text-gray-500 text-xs pt-2">
                  <div className="w-3 h-3 border border-orange-500 border-t-transparent rounded-full animate-spin" />
                  Loading details…
                </div>
              )}
            </div>
          )}

          {activeTab === 'description' && hasDesc && (
            <div className="text-sm text-gray-300 leading-relaxed prose prose-invert prose-sm max-w-none max-h-[60vh] overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: desc }} />
          )}

          {activeTab === 'skills' && hasSkills && (
            <div className="flex flex-wrap gap-2">
              {skills.split(/,\s*/).filter(Boolean).map(s => (
                <span key={s} className="px-3 py-1.5 rounded-full bg-orange-950/60 text-orange-300 text-sm border border-orange-800/40">
                  {s.trim()}
                </span>
              ))}
            </div>
          )}

          {activeTab === 'submissions' && (
            <div>
              {subsLoading ? (
                <div className="flex items-center gap-3 py-10 justify-center text-gray-400">
                  <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  Loading submissions…
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    <button onClick={() => setStageFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${stageFilter === 'all' ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'}`}>
                      All <span className="ml-1 opacity-70">{submissions.length}</span>
                    </button>
                    {PIPELINE_STAGES.map(stage => (stageCounts[stage] ?? 0) > 0 && (
                      <button key={stage} onClick={() => setStageFilter(stage)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${stageFilter === stage ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'}`}>
                        {stage} <span className="ml-1 opacity-70">{stageCounts[stage]}</span>
                      </button>
                    ))}
                  </div>
                  {filteredSubs.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">
                      <p>No submissions{stageFilter !== 'all' ? ` in "${stageFilter}"` : ''} yet.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-800/60">
                      {filteredSubs.map((sub, i) => {
                        const stageIdx    = mapStageIdx(sub.submission_status || sub.pipeline_status || '');
                        const statusLabel = sub.submission_status || sub.pipeline_status || 'Unknown';
                        const statusCls   =
                          stageIdx === 6 ? 'text-red-400' :
                          stageIdx >= 4  ? 'text-blue-400' :
                          stageIdx >= 2  ? 'text-yellow-400' : 'text-green-400';
                        const submittedOn = sub.submitted_on
                          ? new Date(sub.submitted_on).toLocaleDateString('en-AU', { day:'2-digit', month:'short', year:'numeric' })
                          : '';
                        return (
                          <div key={sub.id ?? i} className="py-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-white">
                                  {permissions.show_candidate_name !== false
                                    ? `Candidate #${sub.applicant_id ?? (i + 1)}`
                                    : `Submission #${sub.submission_id}`}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {sub.source ? <span>Source: <span className="text-gray-400">{sub.source}</span></span> : null}
                                  {submittedOn ? <span className="ml-2">· {submittedOn}</span> : null}
                                </p>
                              </div>
                              <span className={`text-xs font-semibold whitespace-nowrap ${statusCls}`}>
                                {statusLabel}
                              </span>
                            </div>
                            <PipelineDots stageIdx={stageIdx} submittedOn={sub.submitted_on} />
                            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs">
                              {sub.employment_type && <span className="text-gray-500">Type: <span className="text-gray-300">{sub.employment_type}</span></span>}
                              {permissions.show_tax_terms !== false && sub.tax_term && <span className="text-gray-500">Tax: <span className="text-gray-300">{sub.tax_term}</span></span>}
                              {permissions.show_pay_rate && sub.pay_rate && <span className="text-gray-500">Pay: <span className="text-orange-300 font-medium">{sub.pay_rate}</span></span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 border-t border-gray-800 pt-4 flex justify-end">
          <button onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

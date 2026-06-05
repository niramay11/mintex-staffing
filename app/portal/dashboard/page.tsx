"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type ClientInfo = {
  id: string; name: string; email: string; company: string;
  permissions: Record<string, boolean>;
};
type Job = Record<string, unknown>;
type Placement = Record<string, unknown>;

export default function PortalDashboard() {
  const router = useRouter();
  const [client, setClient]         = useState<ClientInfo | null>(null);
  const [jobs, setJobs]             = useState<Job[]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [activeTab, setActiveTab]   = useState<"jobs" | "placements">("jobs");
  const [search, setSearch]         = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading]       = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Auth check
  useEffect(() => {
    fetch("/api/portal/me")
      .then(async r => {
        if (!r.ok) { router.replace("/portal/login"); return; }
        const data = await r.json();
        setClient(data);
        setAuthChecked(true);
      })
      .catch(() => router.replace("/portal/login"));
  }, []);

  // Load data after auth
  useEffect(() => {
    if (!authChecked) return;
    Promise.all([
      fetch("/api/portal/jobs").then(r => r.json()),
      fetch("/api/portal/placements").then(r => r.json()),
    ]).then(([jd, pd]) => {
      setJobs(Array.isArray(jd.results) ? jd.results : []);
      setPlacements(Array.isArray(pd.results) ? pd.results : []);
      setLoading(false);
    });
  }, [authChecked]);

  const handleLogout = async () => {
    await fetch("/api/portal/logout", { method: "POST" });
    router.push("/portal/login");
  };

  const filteredJobs = jobs.filter(j =>
    !search ||
    String(j.job_title ?? "").toLowerCase().includes(search.toLowerCase()) ||
    String(j.job_code  ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredPlacements = placements.filter(p =>
    !search ||
    String(p.first_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    String(p.last_name  ?? "").toLowerCase().includes(search.toLowerCase()) ||
    String(p.job_title  ?? "").toLowerCase().includes(search.toLowerCase())
  );

  if (!authChecked) return <div className="min-h-screen bg-gray-950" />;

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
              <p className="text-sm font-medium text-white">{client?.name}</p>
              <p className="text-xs text-gray-500">{client?.company || client?.email}</p>
            </div>
            <button onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Your Jobs" value={jobs.length} />
          <StatCard label="Placed Candidates" value={placements.length} />
          <StatCard label="Active Positions" value={jobs.filter(j => String(j.job_status) === "1" || String(j.job_status).toLowerCase().includes("active")).length} />
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-1">
            {(["jobs", "placements"] as const).map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); setSearch(""); }}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? "bg-orange-600 text-white"
                    : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
                }`}>
                {tab === "jobs" ? `Jobs (${jobs.length})` : `Candidates (${placements.length})`}
              </button>
            ))}
          </div>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder={activeTab === "jobs" ? "Search jobs…" : "Search candidates…"}
            className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 text-white text-sm w-64 focus:border-orange-500 focus:outline-none"
          />
        </div>

        {selectedJob && (
          <JobDetailModal job={selectedJob} permissions={client?.permissions ?? {}} onClose={() => setSelectedJob(null)} />
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === "jobs" ? (
          <JobsTable jobs={filteredJobs} permissions={client?.permissions ?? {}} onView={setSelectedJob} />
        ) : (
          <PlacementsTable placements={filteredPlacements} permissions={client?.permissions ?? {}} />
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
      <p className="text-3xl font-bold text-orange-400">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
    </div>
  );
}

function JobsTable({ jobs, permissions, onView }: { jobs: Job[]; permissions: Record<string, boolean>; onView: (j: Job) => void }) {
  if (jobs.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
        <p className="text-gray-500">No jobs assigned to your account yet.</p>
        <p className="text-xs text-gray-600 mt-2">Contact your Mintex account manager.</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-900 text-gray-400 text-left">
            <th className="px-4 py-3 font-medium">Job Code</th>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Location</th>
            <th className="px-4 py-3 font-medium">Type</th>
            {permissions.show_bill_rate && <th className="px-4 py-3 font-medium">Bill Rate</th>}
            <th className="px-4 py-3 font-medium">Positions</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {jobs.map((job, i) => (
            <tr key={String(job.job_code ?? i)} className="hover:bg-gray-900/50 transition-colors">
              <td className="px-4 py-3 text-orange-400 font-mono text-xs">{String(job.job_code ?? "—")}</td>
              <td className="px-4 py-3 text-white font-medium max-w-xs"><div className="truncate">{String(job.job_title ?? "—")}</div></td>
              <td className="px-4 py-3 text-gray-400">{[job.city, job.states].filter(Boolean).join(", ") || "—"}</td>
              <td className="px-4 py-3 text-gray-400">{String(job.job_type ?? "—")}</td>
              {permissions.show_bill_rate && <td className="px-4 py-3 text-gray-400">{String(job.client_bill_rate___salary ?? "—")}</td>}
              <td className="px-4 py-3 text-gray-400 text-center">{String(job.number_of_positions ?? "—")}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  String(job.job_status) === "1" || String(job.job_status).toLowerCase().includes("active")
                    ? "bg-green-900/50 text-green-400" : "bg-gray-800 text-gray-400"
                }`}>{String(job.job_status ?? "—")}</span>
              </td>
              <td className="px-4 py-3">
                <button onClick={() => onView(job)} className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition-colors">
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PlacementsTable({ placements, permissions }: { placements: Placement[]; permissions: Record<string, boolean> }) {
  if (placements.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
        <p className="text-gray-500">No placed candidates yet.</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-900 text-gray-400 text-left">
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Job Title</th>
            <th className="px-4 py-3 font-medium">Start Date</th>
            <th className="px-4 py-3 font-medium">Tax Terms</th>
            {permissions.show_candidate_contact && <th className="px-4 py-3 font-medium">Email</th>}
            {permissions.show_bill_rate && <th className="px-4 py-3 font-medium">Bill Rate</th>}
            {permissions.show_pay_rate  && <th className="px-4 py-3 font-medium">Pay Rate</th>}
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {placements.map((p, i) => (
            <tr key={i} className="hover:bg-gray-900/50 transition-colors">
              <td className="px-4 py-3 text-white font-medium">{[p.first_name, p.last_name].filter(Boolean).join(" ") || "—"}</td>
              <td className="px-4 py-3 text-gray-300">{String(p.job_title ?? "—")}</td>
              <td className="px-4 py-3 text-gray-400">{String(p.actual_start_date ?? p.tentative_start_date ?? "—")}</td>
              <td className="px-4 py-3 text-gray-400">{String(p.tax_terms ?? "—")}</td>
              {permissions.show_candidate_contact && <td className="px-4 py-3 text-gray-400">{String(p.email ?? "—")}</td>}
              {permissions.show_bill_rate && <td className="px-4 py-3 text-gray-400">{String(p.client_bill_rate ?? "—")}</td>}
              {permissions.show_pay_rate  && <td className="px-4 py-3 text-gray-400">{String(p.pay_rate ?? "—")}</td>}
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

function JobDetailModal({ job, permissions, onClose }: { job: Job; permissions: Record<string, boolean>; onClose: () => void }) {
  const fields: [string, string][] = [
    ["Job Code", "job_code"], ["Job Title", "job_title"],
    ["Job Type", "job_type"], ["Status", "job_status"],
    ["City", "city"], ["State", "states"], ["Country", "country"],
    ["Start Date", "job_start_date"], ["End Date", "job_end_date"],
    ["Positions", "number_of_positions"], ["Duration", "duration"],
    ["Work Auth", "work_authorization"], ["Tax Terms", "tax_terms"],
    ...(permissions.show_bill_rate ? [["Bill Rate", "client_bill_rate___salary"] as [string, string]] : []),
    ...(permissions.show_pay_rate  ? [["Pay Rate", "pay_rate___salary"] as [string, string]] : []),
    ["Primary Skills", "primary_skills"], ["Experience", "experience"],
    ["Remote", "remote_job"],
  ];

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-2xl">
        <div className="flex items-start justify-between p-6 border-b border-gray-800">
          <div>
            <h3 className="text-xl font-bold">{String(job.job_title ?? "Job Detail")}</h3>
            <p className="text-orange-400 font-mono text-sm mt-1">{String(job.job_code ?? "")}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        {!!job.job_description && (
          <div className="p-6 border-b border-gray-800">
            <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Description</h4>
            <div className="text-sm text-gray-300 leading-relaxed max-h-48 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: String(job.job_description) }} />
          </div>
        )}

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {fields.map(([label, key]) =>
            job[key] ? (
              <div key={key}>
                <span className="text-xs text-gray-500 block">{label}</span>
                <span className="text-sm text-gray-200">{String(job[key])}</span>
              </div>
            ) : null
          )}
        </div>

        <div className="p-6 pt-0">
          <button onClick={onClose} className="px-5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

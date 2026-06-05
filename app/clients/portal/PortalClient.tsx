"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Logo from "../../../public/logo.svg";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Job extends Record<string, any> {
    job_code: string; job_title: string; public_job_title: string;
    client: string; client_manager: string; end_client: string;
    client_bill_rate___salary: string; pay_rate___salary: string;
    job_start_date: string; job_end_date: string; job_status: string;
    job_type: string; remote_job: string; country: string; states: string;
    city: string; zip_code: string; location: string; experience: string;
    primary_skills: string; secondary_skills: string; number_of_positions: number;
    duration: string; priority: string; department: string; industry: string;
    degree: string; tax_terms: string; work_authorization: string;
    interview_mode: string; clearance: string; required_documents: string;
    required_hours_week: string; career_portal_published_date: string;
    Created: string; Modified: string; ceipal_ref__: string;
    job_description: string; public_job_description: string;
    additional_details: string; comments: string;
}

type ClientInfo = { id: string; name: string; company: string; permissions: Record<string, boolean> };

const C = {
    coral: '#FF5758', coralDim: 'rgba(255,87,88,0.1)', coralBdr: 'rgba(255,87,88,0.28)',
    cyan: '#57EEFF', cyanDim: 'rgba(87,238,255,0.08)', cyanBdr: 'rgba(87,238,255,0.22)', cyanText: '#7ED6E6',
};
const GF = 'var(--font-gilroy)';

const STATUS_DARK: Record<string, { bg: string; border: string; color: string; dot: string }> = {
    Active:    { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  color: '#6EE7B7', dot: '#10B981' },
    Open:      { bg: C.cyanDim,               border: C.cyanBdr,               color: C.cyanText, dot: C.cyan },
    'On Hold': { bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.28)', color: '#FCD34D', dot: '#FBBF24' },
    Closed:    { bg: C.coralDim,              border: C.coralBdr,              color: '#FFB3B3',  dot: C.coral },
    Filled:    { bg: 'rgba(155,92,246,0.1)',  border: 'rgba(155,92,246,0.28)', color: '#C4A8FF',  dot: '#9B5CF6' },
};

const TABLE_COLUMNS: { key: string; label: string }[] = [
    { key: "job_code",                      label: "Job Code" },
    { key: "job_title",                     label: "Job Title" },
    { key: "job_status",                    label: "Status" },
    { key: "job_type",                      label: "Type" },
    { key: "client",                        label: "Client" },
    { key: "city",                          label: "City" },
    { key: "states",                        label: "State" },
    { key: "remote_job",                    label: "Remote" },
    { key: "experience",                    label: "Experience" },
    { key: "primary_skills",               label: "Skills" },
    { key: "number_of_positions",           label: "Positions" },
    { key: "job_start_date",               label: "Start" },
];

// ─── Login Form ───────────────────────────────────────────────────────────────
function LoginForm({ onLogin }: { onLogin: (client: ClientInfo) => void }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError]       = useState("");
    const [loading, setLoading]   = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); setLoading(true);
        const res = await fetch("/api/portal/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        setLoading(false);
        if (!res.ok) { setError(data.error ?? "Login failed"); return; }
        // Fetch client info after login
        const meRes = await fetch("/api/portal/me");
        if (meRes.ok) onLogin(await meRes.json());
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #06091e 0%, #07122a 45%, #030e18 100%)' }}>
            {/* Grid texture */}
            <div className="fixed inset-0 pointer-events-none" style={{
                backgroundImage: `linear-gradient(rgba(87,238,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(87,238,255,0.03) 1px, transparent 1px)`,
                backgroundSize: '72px 72px', opacity: 0.5,
            }} />
            <div className="fixed top-0 left-0 w-[600px] h-[400px] pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 40%, rgba(87,238,255,0.05) 0%, transparent 60%)', filter: 'blur(60px)' }} />

            {/* Navbar */}
            <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
                style={{ background: scrolled ? 'rgba(6,9,30,0.97)' : 'rgba(6,9,30,0.6)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between" style={{ height: 60 }}>
                    <Link href="/"><Image src={Logo} alt="Mintex Staffing" width={160} height={22} priority /></Link>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: C.cyanDim, border: `1px solid ${C.cyanBdr}`, color: C.cyanText, fontFamily: GF }}>
                        Client Portal
                    </span>
                </div>
            </header>

            {/* Login card */}
            <div className="flex-1 flex items-center justify-center px-4 relative z-10" style={{ paddingTop: 80 }}>
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-sm">
                    <div className="mb-8 text-center">
                        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full"
                            style={{ background: C.cyanDim, border: `1px solid ${C.cyanBdr}` }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.cyan }} />
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: C.cyan, fontFamily: GF }}>Client Portal</span>
                        </div>
                        <h1 className="font-black text-3xl text-white" style={{ fontFamily: GF }}>Sign In</h1>
                        <p className="text-sm mt-2" style={{ color: 'rgba(170,185,210,0.5)', fontFamily: GF }}>Access your job postings & candidates</p>
                    </div>

                    <div className="rounded-2xl p-8" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'rgba(170,185,210,0.5)', fontFamily: GF }}>Username</label>
                                <input type="text" required value={username} onChange={e => setUsername(e.target.value)}
                                    placeholder="your_username" autoComplete="username"
                                    className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8f0ff', fontFamily: GF }}
                                    onFocus={e => { e.target.style.borderColor = C.cyanBdr; e.target.style.boxShadow = `0 0 0 3px rgba(87,238,255,0.07)`; }}
                                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'rgba(170,185,210,0.5)', fontFamily: GF }}>Password</label>
                                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••" autoComplete="current-password"
                                    className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8f0ff', fontFamily: GF }}
                                    onFocus={e => { e.target.style.borderColor = C.cyanBdr; e.target.style.boxShadow = `0 0 0 3px rgba(87,238,255,0.07)`; }}
                                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>

                            {error && (
                                <div className="px-4 py-3 rounded-xl text-sm" style={{ background: C.coralDim, border: `1px solid ${C.coralBdr}`, color: '#FFB3B3', fontFamily: GF }}>
                                    {error}
                                </div>
                            )}

                            <button type="submit" disabled={loading}
                                className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-50"
                                style={{ background: 'linear-gradient(135deg, rgba(87,238,255,0.15) 0%, rgba(87,238,255,0.08) 100%)', border: `1px solid ${C.cyanBdr}`, color: C.cyan, fontFamily: GF }}>
                                {loading ? "Signing in…" : "Sign In"}
                            </button>
                        </form>
                        <p className="text-center text-xs mt-6" style={{ color: 'rgba(170,185,210,0.3)', fontFamily: GF }}>
                            Credentials provided by your Mintex account manager
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

// ─── Main Portal Dashboard ────────────────────────────────────────────────────
export default function PortalClient() {
    const [authChecked, setAuthChecked] = useState(false);
    const [client, setClient]           = useState<ClientInfo | null>(null);
    const [jobs, setJobs]               = useState<Job[]>([]);
    const [loading, setLoading]         = useState(false);
    const [error, setError]             = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [expandedJob, setExpandedJob] = useState<string | null>(null);
    const [scrolled, setScrolled]       = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Check auth on mount
    useEffect(() => {
        fetch("/api/portal/me")
            .then(async r => {
                if (r.ok) setClient(await r.json());
                setAuthChecked(true);
            })
            .catch(() => setAuthChecked(true));
    }, []);

    const fetchJobs = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const res = await fetch("/api/portal/jobs");
            if (!res.ok) throw new Error((await res.json()).error ?? `Error ${res.status}`);
            const data = await res.json();
            setJobs(Array.isArray(data.results) ? data.results : []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load jobs");
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { if (client) fetchJobs(); }, [client, fetchJobs]);

    const handleLogout = async () => {
        await fetch("/api/portal/logout", { method: "POST" });
        setClient(null); setJobs([]);
    };

    if (!authChecked) return <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #06091e 0%, #07122a 45%, #030e18 100%)' }} />;

    if (!client) return <LoginForm onLogin={setClient} />;

    const uniqueStatuses = Array.from(new Set(jobs.map(j => j.job_status).filter(Boolean)));
    const filteredJobs = jobs.filter(job => {
        const matchStatus = statusFilter === "All" || job.job_status === statusFilter;
        const q = searchQuery.toLowerCase();
        const matchSearch = !q || job.job_title?.toLowerCase().includes(q) || job.job_code?.toLowerCase().includes(q) || job.primary_skills?.toLowerCase().includes(q);
        return matchStatus && matchSearch;
    });

    const statusCounts: Record<string, number> = {
        Total: jobs.length,
        ...Object.fromEntries(uniqueStatuses.map(s => [s, jobs.filter(j => j.job_status === s).length])),
    };

    const formatDate = (s: string) => {
        if (!s) return "";
        try { const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
        catch { return s; }
    };

    const renderCell = (job: Job, key: string) => {
        const val = job[key];
        if (val === null || val === undefined || val === "") return <span style={{ color: 'rgba(255,255,255,0.12)' }}>—</span>;
        if (key.includes("date") || key === "Created" || key === "Modified") return <span style={{ color: 'rgba(170,185,210,0.65)' }}>{formatDate(String(val))}</span>;
        if (key === "job_status") {
            const s = STATUS_DARK[val] ?? { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', color: 'rgba(200,215,235,0.7)', dot: 'rgba(255,255,255,0.4)' };
            return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontFamily: GF }}><span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />{val}</span>;
        }
        if (key === "priority") { const pColors: Record<string,string> = { High: C.coral, Medium: '#FCD34D', Low: '#6EE7B7' }; return <span style={{ color: pColors[val] ?? 'rgba(170,185,210,0.65)', fontFamily: GF, fontWeight: 600, fontSize: 11 }}>{val}</span>; }
        if (key === "remote_job") { const rColors: Record<string,string> = { Remote: '#6EE7B7', Hybrid: C.cyanText, 'On-site': '#FFB3B3' }; return <span style={{ color: rColors[val] ?? 'rgba(170,185,210,0.65)', fontFamily: GF, fontSize: 11 }}>{val}</span>; }
        return <span style={{ color: 'rgba(200,215,235,0.75)', fontFamily: GF }}>{String(val)}</span>;
    };

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #06091e 0%, #07122a 45%, #030e18 100%)' }}>
            <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(rgba(87,238,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(87,238,255,0.03) 1px, transparent 1px)`, backgroundSize: '72px 72px', opacity: 0.5 }} />
            <div className="fixed top-0 left-0 w-[600px] h-[400px] pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 40%, rgba(87,238,255,0.04) 0%, transparent 60%)', filter: 'blur(60px)' }} />
            <div className="fixed bottom-0 right-0 w-96 h-96 pointer-events-none" style={{ background: 'radial-gradient(circle at 70% 70%, rgba(255,87,88,0.04) 0%, transparent 65%)', filter: 'blur(60px)' }} />

            {/* Navbar */}
            <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
                style={{ background: scrolled ? 'rgba(6,9,30,0.97)' : 'rgba(6,9,30,0.6)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.4)' : 'none' }}>
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between" style={{ height: 60 }}>
                    <Link href="/"><Image src={Logo} alt="Mintex Staffing" width={160} height={22} priority /></Link>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-xs font-semibold text-white" style={{ fontFamily: GF }}>{client.company || client.name}</span>
                            <span className="text-[10px]" style={{ color: 'rgba(170,185,210,0.4)', fontFamily: GF }}>Client Portal</span>
                        </div>
                        <button onClick={handleLogout}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200"
                            style={{ background: 'rgba(255,87,88,0.1)', border: '1px solid rgba(255,87,88,0.25)', color: '#FFB3B3', fontFamily: GF }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,87,88,0.18)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,87,88,0.1)')}>
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" style={{ paddingTop: 80, paddingBottom: 80 }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                        <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full" style={{ background: C.cyanDim, border: `1px solid ${C.cyanBdr}` }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.cyan }} />
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: C.cyan, fontFamily: GF }}>Client Portal</span>
                        </div>
                        <h1 className="font-black leading-tight" style={{ fontFamily: GF, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
                            <span style={{ background: `linear-gradient(120deg, #ffffff 0%, #c8f8ff 60%, ${C.cyan} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                Job Postings Dashboard
                            </span>
                        </h1>
                        <p className="text-sm mt-1" style={{ color: 'rgba(170,185,210,0.5)', fontFamily: GF }}>
                            {jobs.length > 0 ? `${jobs.length} postings assigned to your account` : "Your assigned job postings from CEIPAL"}
                        </p>
                    </div>
                </motion.div>

                {/* Status stat cards */}
                {!loading && jobs.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                        {Object.entries(statusCounts).map(([label, count], i) => {
                            const isTotal = label === "Total";
                            const isActive = statusFilter === label || (isTotal && statusFilter === "All");
                            const s = STATUS_DARK[label];
                            return (
                                <motion.button key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                    onClick={() => setStatusFilter(isTotal ? "All" : (statusFilter === label ? "All" : label))}
                                    className="p-4 rounded-xl text-left transition-all duration-200"
                                    style={{ background: isActive ? (isTotal ? C.cyanDim : (s?.bg ?? C.cyanDim)) : 'rgba(255,255,255,0.03)', border: `1px solid ${isActive ? (isTotal ? C.cyanBdr : (s?.border ?? C.cyanBdr)) : 'rgba(255,255,255,0.07)'}` }}>
                                    <p className="text-2xl font-black mb-1" style={{ fontFamily: GF, color: isActive ? (isTotal ? C.cyan : (s?.color ?? C.cyan)) : '#f0f4ff' }}>{count}</p>
                                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: isActive ? (isTotal ? C.cyanText : (s?.color ?? C.cyanText)) : 'rgba(170,185,210,0.45)', fontFamily: GF }}>{label}</p>
                                </motion.button>
                            );
                        })}
                    </motion.div>
                )}

                {/* Filter bar */}
                {!loading && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                        className="flex flex-wrap items-center gap-3 mb-5 px-4 py-3 rounded-2xl"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}>
                        <div className="flex items-center gap-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(170,185,210,0.4)', fontFamily: GF }}>Status</label>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                                className="text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none cursor-pointer"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8f0ff', fontFamily: GF }}>
                                <option value="All" style={{ background: '#07122a' }}>All Statuses</option>
                                {uniqueStatuses.map(s => <option key={s} value={s} style={{ background: '#07122a' }}>{s}</option>)}
                            </select>
                        </div>
                        <div className="w-px h-5" style={{ background: 'rgba(255,255,255,0.07)' }} />
                        <div className="flex-1 min-w-[220px] relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'rgba(170,185,210,0.35)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search by title, code, skills…"
                                className="w-full pl-9 pr-4 py-2 rounded-lg text-xs focus:outline-none"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#e8f0ff', fontFamily: GF }} />
                        </div>
                        <span className="text-xs font-semibold ml-auto" style={{ color: 'rgba(170,185,210,0.4)', fontFamily: GF }}>{filteredJobs.length} result{filteredJobs.length !== 1 ? "s" : ""}</span>
                    </motion.div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-28">
                        <div className="relative w-10 h-10 mb-4">
                            <div className="absolute inset-0 rounded-full" style={{ border: `1px solid ${C.cyanDim}` }} />
                            <div className="absolute inset-0 rounded-full animate-spin" style={{ border: '1.5px solid transparent', borderTopColor: C.cyan }} />
                        </div>
                        <p className="text-xs tracking-[0.25em] uppercase" style={{ color: 'rgba(170,185,210,0.4)', fontFamily: GF }}>Loading postings…</p>
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl text-center" style={{ background: C.coralDim, border: `1px solid ${C.coralBdr}` }}>
                        <p className="text-sm font-semibold mb-3" style={{ color: '#FFB3B3', fontFamily: GF }}>{error}</p>
                        <button onClick={fetchJobs} className="px-5 py-2 rounded-xl text-sm font-bold" style={{ background: C.coralDim, border: `1px solid ${C.coralBdr}`, color: C.coral, fontFamily: GF }}>Retry</button>
                    </motion.div>
                )}

                {/* No jobs assigned */}
                {!loading && !error && jobs.length === 0 && (
                    <div className="py-24 text-center">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: C.cyanDim, border: `1px solid ${C.cyanBdr}` }}>
                            <svg className="w-6 h-6" style={{ color: C.cyanText }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-sm font-semibold" style={{ color: 'rgba(170,185,210,0.6)', fontFamily: GF }}>No job postings assigned yet</p>
                        <p className="text-xs mt-1" style={{ color: 'rgba(170,185,210,0.3)', fontFamily: GF }}>Contact your Mintex account manager to get access to job postings.</p>
                    </div>
                )}

                {/* Table */}
                {!loading && !error && filteredJobs.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(16px)' }}>
                        <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 0%, ${C.cyan}33 30%, ${C.coral}33 70%, transparent 100%)` }} />
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse">
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
                                        <th className="px-4 py-3 text-left w-10" style={{ color: 'rgba(170,185,210,0.35)', fontFamily: GF, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>#</th>
                                        {TABLE_COLUMNS.map(col => (
                                            <th key={col.key} className="px-3 py-3 text-left whitespace-nowrap" style={{ color: 'rgba(170,185,210,0.45)', fontFamily: GF, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{col.label}</th>
                                        ))}
                                        <th className="px-3 py-3 w-10" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredJobs.map((job, index) => {
                                        const isExpanded = expandedJob === job.job_code;
                                        return (
                                            <React.Fragment key={job.job_code || index}>
                                                <tr onClick={() => setExpandedJob(isExpanded ? null : job.job_code)}
                                                    className="cursor-pointer transition-all duration-150"
                                                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                                    onMouseLeave={e => (e.currentTarget.style.background = isExpanded ? 'rgba(87,238,255,0.04)' : 'transparent')}>
                                                    <td className="px-4 py-3 text-xs" style={{ color: 'rgba(170,185,210,0.28)', fontFamily: GF }}>{index + 1}</td>
                                                    {TABLE_COLUMNS.map(col => (
                                                        <td key={col.key} className="px-3 py-3 text-xs max-w-[180px] truncate" style={{ fontFamily: GF }}>{renderCell(job, col.key)}</td>
                                                    ))}
                                                    <td className="px-3 py-3">
                                                        <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: isExpanded ? C.cyanDim : 'rgba(255,255,255,0.04)', border: `1px solid ${isExpanded ? C.cyanBdr : 'rgba(255,255,255,0.08)'}` }}>
                                                            <svg className="w-3 h-3 transition-transform duration-200" style={{ color: isExpanded ? C.cyan : 'rgba(170,185,210,0.3)', transform: isExpanded ? 'rotate(180deg)' : 'none' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <tr>
                                                            <td colSpan={TABLE_COLUMNS.length + 2} style={{ background: 'rgba(87,238,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: 0 }}>
                                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} style={{ overflow: 'hidden' }}>
                                                                    <div className="px-6 py-5">
                                                                        <div className="flex flex-wrap gap-4 mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                                            {[
                                                                                { label: 'Department', val: job.department }, { label: 'Industry', val: job.industry },
                                                                                { label: 'Degree', val: job.degree }, { label: 'Tax Terms', val: job.tax_terms },
                                                                                { label: 'Work Auth', val: job.work_authorization }, { label: 'Interview', val: job.interview_mode },
                                                                                { label: 'Clearance', val: job.clearance }, { label: 'Duration', val: job.duration },
                                                                                { label: 'Hrs/Week', val: job.required_hours_week },
                                                                            ].filter(x => x.val).map(({ label, val }) => (
                                                                                <div key={label}>
                                                                                    <p className="text-[9px] uppercase tracking-wider font-bold mb-0.5" style={{ color: 'rgba(170,185,210,0.35)', fontFamily: GF }}>{label}</p>
                                                                                    <p className="text-xs font-semibold" style={{ color: 'rgba(200,215,235,0.75)', fontFamily: GF }}>{val}</p>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                        {job.secondary_skills && (
                                                                            <div className="mb-4">
                                                                                <p className="text-[9px] uppercase tracking-wider font-bold mb-2" style={{ color: 'rgba(170,185,210,0.35)', fontFamily: GF }}>Secondary Skills</p>
                                                                                <div className="flex flex-wrap gap-1.5">
                                                                                    {job.secondary_skills.split(',').map((s: string, i: number) => (
                                                                                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(180,195,220,0.6)', fontFamily: GF }}>{s.trim()}</span>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                                            {job.job_description && (
                                                                                <div>
                                                                                    <p className="text-[9px] uppercase tracking-wider font-bold mb-2" style={{ color: C.cyanText, fontFamily: GF }}>Job Description</p>
                                                                                    <div className="text-xs max-h-44 overflow-y-auto pr-2 leading-relaxed" style={{ color: 'rgba(190,205,225,0.65)', fontFamily: GF }} dangerouslySetInnerHTML={{ __html: job.job_description }} />
                                                                                </div>
                                                                            )}
                                                                            {job.public_job_description && (
                                                                                <div>
                                                                                    <p className="text-[9px] uppercase tracking-wider font-bold mb-2" style={{ color: C.cyanText, fontFamily: GF }}>Public Description</p>
                                                                                    <div className="text-xs max-h-44 overflow-y-auto pr-2 leading-relaxed" style={{ color: 'rgba(190,205,225,0.65)', fontFamily: GF }} dangerouslySetInnerHTML={{ __html: job.public_job_description }} />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </AnimatePresence>
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* Empty filter state */}
                {!loading && !error && filteredJobs.length === 0 && jobs.length > 0 && (
                    <div className="py-16 text-center">
                        <p className="text-sm" style={{ color: 'rgba(170,185,210,0.4)', fontFamily: GF }}>No jobs match your filters.</p>
                        <button onClick={() => { setStatusFilter("All"); setSearchQuery(""); }} className="mt-3 text-xs font-semibold" style={{ color: C.cyanText, fontFamily: GF }}>Clear filters</button>
                    </div>
                )}
            </div>
        </div>
    );
}

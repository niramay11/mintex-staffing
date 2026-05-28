"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Logo from "../../../public/logo.svg";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Job extends Record<string, any> {
    job_code: string;
    job_title: string;
    public_job_title: string;
    client: string;
    client_manager: string;
    end_client: string;
    client_bill_rate___salary: string;
    pay_rate___salary: string;
    job_start_date: string;
    job_end_date: string;
    job_status: string;
    job_type: string;
    remote_job: string;
    country: string;
    states: string;
    city: string;
    zip_code: string;
    location: string;
    experience: string;
    primary_skills: string;
    secondary_skills: string;
    number_of_positions: number;
    duration: string;
    priority: string;
    department: string;
    industry: string;
    degree: string;
    tax_terms: string;
    work_authorization: string;
    interview_mode: string;
    clearance: string;
    required_documents: string;
    required_hours_week: string;
    career_portal_published_date: string;
    Created: string;
    Modified: string;
    ceipal_ref__: string;
    job_description: string;
    public_job_description: string;
    additional_details: string;
    comments: string;
}

// Brand colors
const C = {
    coral:    '#FF5758',
    coralDim: 'rgba(255,87,88,0.1)',
    coralBdr: 'rgba(255,87,88,0.28)',
    cyan:     '#57EEFF',
    cyanDim:  'rgba(87,238,255,0.08)',
    cyanBdr:  'rgba(87,238,255,0.22)',
    cyanText: '#7ED6E6',
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
    { key: "end_client",                    label: "End Client" },
    { key: "client_manager",                label: "Manager" },
    { key: "city",                          label: "City" },
    { key: "states",                        label: "State" },
    { key: "remote_job",                    label: "Remote" },
    { key: "pay_rate___salary",             label: "Pay Rate" },
    { key: "client_bill_rate___salary",     label: "Bill Rate" },
    { key: "experience",                    label: "Experience" },
    { key: "primary_skills",               label: "Skills" },
    { key: "number_of_positions",           label: "Positions" },
    { key: "priority",                      label: "Priority" },
    { key: "job_start_date",               label: "Start" },
    { key: "job_end_date",                 label: "End" },
    { key: "career_portal_published_date", label: "Published" },
];

const PAGING_LENGTH = 50;

export default function PortalClient() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [expandedJob, setExpandedJob] = useState<string | null>(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const fetchJobs = useCallback(async (page: number) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/client-jobs?page=${page}&paging_length=${PAGING_LENGTH}`);
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Failed to fetch jobs (${res.status})`);
            }
            const data = await res.json();
            let jobsList: Job[] = [];
            if (data.results && Array.isArray(data.results)) {
                jobsList = data.results;
                setTotalCount(data.count || jobsList.length);
                setHasMore(!!data.next);
            } else if (Array.isArray(data)) {
                jobsList = data;
                setTotalCount(jobsList.length);
                setHasMore(false);
            }
            setJobs(jobsList);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load jobs");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchJobs(currentPage); }, [currentPage, fetchJobs]);

    const uniqueStatuses = Array.from(new Set(jobs.map(j => j.job_status).filter(Boolean)));

    const filteredJobs = jobs.filter(job => {
        const matchesStatus = statusFilter === "All" || job.job_status === statusFilter;
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q ||
            job.job_title?.toLowerCase().includes(q) ||
            job.job_code?.toLowerCase().includes(q) ||
            job.client?.toLowerCase().includes(q) ||
            job.city?.toLowerCase().includes(q) ||
            job.primary_skills?.toLowerCase().includes(q);
        return matchesStatus && matchesSearch;
    });

    const statusCounts: Record<string, number> = {
        Total: jobs.length,
        ...Object.fromEntries(uniqueStatuses.map(s => [s, jobs.filter(j => j.job_status === s).length])),
    };

    const formatDate = (s: string) => {
        if (!s) return "";
        try {
            const d = new Date(s);
            return isNaN(d.getTime()) ? s : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        } catch { return s; }
    };

    const renderCell = (job: Job, key: string) => {
        const val = job[key];
        if (val === null || val === undefined || val === "") {
            return <span style={{ color: 'rgba(255,255,255,0.12)' }}>—</span>;
        }
        if (key.includes("date") || key === "Created" || key === "Modified") {
            return <span style={{ color: 'rgba(170,185,210,0.65)' }}>{formatDate(String(val))}</span>;
        }
        if (key === "job_status") {
            const s = STATUS_DARK[val] ?? { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', color: 'rgba(200,215,235,0.7)', dot: 'rgba(255,255,255,0.4)' };
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontFamily: GF }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
                    {val}
                </span>
            );
        }
        if (key === "priority") {
            const pColors: Record<string, string> = { High: C.coral, Medium: '#FCD34D', Low: '#6EE7B7' };
            return <span style={{ color: pColors[val] ?? 'rgba(170,185,210,0.65)', fontFamily: GF, fontWeight: 600, fontSize: 11 }}>{val}</span>;
        }
        if (key === "remote_job") {
            const rColors: Record<string, string> = { Remote: '#6EE7B7', Hybrid: C.cyanText, 'On-site': '#FFB3B3' };
            return <span style={{ color: rColors[val] ?? 'rgba(170,185,210,0.65)', fontFamily: GF, fontSize: 11 }}>{val}</span>;
        }
        return <span style={{ color: 'rgba(200,215,235,0.75)', fontFamily: GF }}>{String(val)}</span>;
    };

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #06091e 0%, #07122a 45%, #030e18 100%)' }}>

            {/* Grid texture */}
            <div className="fixed inset-0 pointer-events-none" style={{
                backgroundImage: `linear-gradient(rgba(87,238,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(87,238,255,0.03) 1px, transparent 1px)`,
                backgroundSize: '72px 72px', opacity: 0.5,
            }} />
            <div className="fixed top-0 left-0 w-[600px] h-[400px] pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 40%, rgba(87,238,255,0.04) 0%, transparent 60%)', filter: 'blur(60px)' }} />
            <div className="fixed bottom-0 right-0 w-96 h-96 pointer-events-none" style={{ background: 'radial-gradient(circle at 70% 70%, rgba(255,87,88,0.04) 0%, transparent 65%)', filter: 'blur(60px)' }} />

            {/* ── NAVBAR ── */}
            <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
                style={{ background: scrolled ? 'rgba(6,9,30,0.97)' : 'rgba(6,9,30,0.6)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.4)' : 'none' }}>
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between" style={{ height: 60 }}>
                    <Link href="/">
                        <Image src={Logo} alt="Mintex Staffing" width={160} height={22} priority />
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link href="/clients"
                            className="hidden sm:flex items-center gap-1.5 text-xs font-medium transition-colors duration-200"
                            style={{ color: 'rgba(170,185,210,0.45)', fontFamily: GF }}
                            onMouseEnter={e => (e.currentTarget.style.color = C.cyanText)}
                            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(170,185,210,0.45)')}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Clients
                        </Link>
                        <div className="w-px h-3.5 hidden sm:block" style={{ background: 'rgba(255,255,255,0.1)' }} />
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: C.cyanDim, border: `1px solid ${C.cyanBdr}`, color: C.cyanText, fontFamily: GF }}>
                            Client Portal
                        </span>
                    </div>
                </div>
            </header>

            {/* ── CONTENT ── */}
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" style={{ paddingTop: 80, paddingBottom: 80 }}>

                {/* Page header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7 pb-6"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                        <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full"
                            style={{ background: C.cyanDim, border: `1px solid ${C.cyanBdr}` }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.cyan }} />
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: C.cyan, fontFamily: GF }}>Client Portal</span>
                        </div>
                        <h1 className="font-black leading-tight" style={{ fontFamily: GF, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
                            <span style={{
                                background: `linear-gradient(120deg, #ffffff 0%, #c8f8ff 60%, ${C.cyan} 100%)`,
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                            }}>Job Postings Dashboard</span>
                        </h1>
                        <p className="text-sm mt-1" style={{ color: 'rgba(170,185,210,0.5)', fontFamily: GF }}>
                            {totalCount > 0 ? `${totalCount.toLocaleString()} total postings from Ceipal` : "View and manage all client job postings"}
                        </p>
                    </div>
                    {!loading && jobs.length > 0 && (
                        <div className="flex items-center gap-2 text-xs flex-shrink-0" style={{ color: 'rgba(170,185,210,0.4)', fontFamily: GF }}>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Live data
                        </div>
                    )}
                </motion.div>

                {/* ── STATUS STAT CARDS ── */}
                {!loading && jobs.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
                        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                        {Object.entries(statusCounts).map(([label, count], i) => {
                            const isTotal = label === "Total";
                            const isActive = statusFilter === label || (isTotal && statusFilter === "All");
                            const s = STATUS_DARK[label];
                            return (
                                <motion.button key={label}
                                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                    onClick={() => setStatusFilter(isTotal ? "All" : (statusFilter === label ? "All" : label))}
                                    className="p-4 rounded-xl text-left transition-all duration-200"
                                    style={{
                                        background: isActive
                                            ? (isTotal ? C.cyanDim : (s?.bg ?? C.cyanDim))
                                            : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${isActive
                                            ? (isTotal ? C.cyanBdr : (s?.border ?? C.cyanBdr))
                                            : 'rgba(255,255,255,0.07)'}`,
                                        boxShadow: isActive ? `0 4px 20px rgba(87,238,255,0.08)` : 'none',
                                    }}>
                                    <p className="text-2xl font-black mb-1" style={{
                                        fontFamily: GF,
                                        color: isActive ? (isTotal ? C.cyan : (s?.color ?? C.cyan)) : '#f0f4ff',
                                    }}>{count}</p>
                                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{
                                        color: isActive ? (isTotal ? C.cyanText : (s?.color ?? C.cyanText)) : 'rgba(170,185,210,0.45)',
                                        fontFamily: GF,
                                    }}>{label}</p>
                                </motion.button>
                            );
                        })}
                    </motion.div>
                )}

                {/* ── FILTER BAR ── */}
                {!loading && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                        className="flex flex-wrap items-center gap-3 mb-5 px-4 py-3 rounded-2xl"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}>

                        {/* Status dropdown */}
                        <div className="flex items-center gap-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(170,185,210,0.4)', fontFamily: GF }}>Status</label>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                                className="text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none cursor-pointer transition-all duration-200"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8f0ff', fontFamily: GF }}
                                onFocus={e => { e.target.style.borderColor = C.cyanBdr; e.target.style.boxShadow = `0 0 0 3px rgba(87,238,255,0.07)`; }}
                                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}>
                                <option value="All" style={{ background: '#07122a' }}>All Statuses</option>
                                {uniqueStatuses.map(s => <option key={s} value={s} style={{ background: '#07122a' }}>{s}</option>)}
                            </select>
                        </div>

                        <div className="w-px h-5" style={{ background: 'rgba(255,255,255,0.07)' }} />

                        {/* Search */}
                        <div className="flex-1 min-w-[220px] relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'rgba(170,185,210,0.35)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search by title, code, client, skills…"
                                className="w-full pl-9 pr-4 py-2 rounded-lg text-xs focus:outline-none transition-all duration-200"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#e8f0ff', fontFamily: GF }}
                                onFocus={e => { e.target.style.borderColor = C.cyanBdr; e.target.style.boxShadow = `0 0 0 3px rgba(87,238,255,0.07)`; }}
                                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>

                        <span className="text-xs font-semibold ml-auto" style={{ color: 'rgba(170,185,210,0.4)', fontFamily: GF }}>
                            {filteredJobs.length} result{filteredJobs.length !== 1 ? "s" : ""}
                        </span>
                    </motion.div>
                )}

                {/* ── LOADING ── */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-28">
                        <div className="relative w-10 h-10 mb-4">
                            <div className="absolute inset-0 rounded-full" style={{ border: `1px solid ${C.cyanDim}` }} />
                            <div className="absolute inset-0 rounded-full animate-spin" style={{ border: '1.5px solid transparent', borderTopColor: C.cyan, filter: `drop-shadow(0 0 6px ${C.cyan}99)` }} />
                        </div>
                        <p className="text-xs tracking-[0.25em] uppercase" style={{ color: 'rgba(170,185,210,0.4)', fontFamily: GF }}>Loading postings…</p>
                    </div>
                )}

                {/* ── ERROR ── */}
                {error && !loading && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-2xl text-center"
                        style={{ background: C.coralDim, border: `1px solid ${C.coralBdr}` }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                            style={{ background: 'rgba(255,87,88,0.15)', border: `1px solid ${C.coralBdr}` }}>
                            <svg className="w-5 h-5" style={{ color: C.coral }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <p className="text-sm font-semibold mb-3" style={{ color: '#FFB3B3', fontFamily: GF }}>{error}</p>
                        <button onClick={() => fetchJobs(currentPage)}
                            className="px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200"
                            style={{ background: C.coralDim, border: `1px solid ${C.coralBdr}`, color: C.coral, fontFamily: GF }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,87,88,0.18)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.coralDim; }}>
                            Retry
                        </button>
                    </motion.div>
                )}

                {/* ── TABLE ── */}
                {!loading && !error && filteredJobs.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="rounded-2xl overflow-hidden"
                        style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(16px)' }}>

                        {/* Top border glow */}
                        <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 0%, ${C.cyan}33 30%, ${C.coral}33 70%, transparent 100%)` }} />

                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse">
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
                                        <th className="px-4 py-3 text-left w-10 flex-shrink-0" style={{ color: 'rgba(170,185,210,0.35)', fontFamily: GF, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>#</th>
                                        {TABLE_COLUMNS.map(col => (
                                            <th key={col.key} className="px-3 py-3 text-left whitespace-nowrap"
                                                style={{ color: 'rgba(170,185,210,0.45)', fontFamily: GF, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                                {col.label}
                                            </th>
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
                                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = isExpanded ? 'rgba(87,238,255,0.05)' : 'rgba(255,255,255,0.03)'; }}
                                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isExpanded ? 'rgba(87,238,255,0.04)' : 'transparent'; }}>
                                                    <td className="px-4 py-3 text-xs flex-shrink-0" style={{ color: 'rgba(170,185,210,0.28)', fontFamily: GF, minWidth: 36 }}>
                                                        {(currentPage - 1) * PAGING_LENGTH + index + 1}
                                                    </td>
                                                    {TABLE_COLUMNS.map(col => (
                                                        <td key={col.key} className="px-3 py-3 text-xs max-w-[180px] truncate" style={{ fontFamily: GF }}>
                                                            {renderCell(job, col.key)}
                                                        </td>
                                                    ))}
                                                    <td className="px-3 py-3">
                                                        <div className="w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200"
                                                            style={{ background: isExpanded ? C.cyanDim : 'rgba(255,255,255,0.04)', border: `1px solid ${isExpanded ? C.cyanBdr : 'rgba(255,255,255,0.08)'}` }}>
                                                            <svg className="w-3 h-3 transition-transform duration-200" style={{ color: isExpanded ? C.cyan : 'rgba(170,185,210,0.3)', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Expanded detail panel */}
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <tr>
                                                            <td colSpan={TABLE_COLUMNS.length + 2}
                                                                style={{ background: 'rgba(87,238,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: 0 }}>
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    exit={{ opacity: 0, height: 0 }}
                                                                    transition={{ duration: 0.22 }}
                                                                    style={{ overflow: 'hidden' }}>
                                                                    <div className="px-6 py-5">
                                                                        {/* Quick details row */}
                                                                        <div className="flex flex-wrap gap-4 mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                                            {[
                                                                                { label: 'Department', val: job.department },
                                                                                { label: 'Industry', val: job.industry },
                                                                                { label: 'Degree', val: job.degree },
                                                                                { label: 'Tax Terms', val: job.tax_terms },
                                                                                { label: 'Work Auth', val: job.work_authorization },
                                                                                { label: 'Interview', val: job.interview_mode },
                                                                                { label: 'Clearance', val: job.clearance },
                                                                                { label: 'Duration', val: job.duration },
                                                                                { label: 'Hrs/Week', val: job.required_hours_week },
                                                                                { label: 'Ceipal Ref', val: job.ceipal_ref__ },
                                                                            ].filter(x => x.val).map(({ label, val }) => (
                                                                                <div key={label} className="min-w-0">
                                                                                    <p className="text-[9px] uppercase tracking-wider font-bold mb-0.5" style={{ color: 'rgba(170,185,210,0.35)', fontFamily: GF }}>{label}</p>
                                                                                    <p className="text-xs font-semibold" style={{ color: 'rgba(200,215,235,0.75)', fontFamily: GF }}>{val}</p>
                                                                                </div>
                                                                            ))}
                                                                        </div>

                                                                        {/* Secondary skills */}
                                                                        {job.secondary_skills && (
                                                                            <div className="mb-4">
                                                                                <p className="text-[9px] uppercase tracking-wider font-bold mb-2" style={{ color: 'rgba(170,185,210,0.35)', fontFamily: GF }}>Secondary Skills</p>
                                                                                <div className="flex flex-wrap gap-1.5">
                                                                                    {job.secondary_skills.split(',').map((s: string, i: number) => (
                                                                                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md"
                                                                                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(180,195,220,0.6)', fontFamily: GF }}>
                                                                                            {s.trim()}
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* Descriptions */}
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                                            {job.job_description && (
                                                                                <div>
                                                                                    <p className="text-[9px] uppercase tracking-wider font-bold mb-2" style={{ color: C.cyanText, fontFamily: GF }}>Job Description</p>
                                                                                    <div className="text-xs max-h-44 overflow-y-auto pr-2 leading-relaxed"
                                                                                        style={{ color: 'rgba(190,205,225,0.65)', fontFamily: GF, scrollbarWidth: 'thin' }}
                                                                                        dangerouslySetInnerHTML={{ __html: job.job_description }} />
                                                                                </div>
                                                                            )}
                                                                            {job.public_job_description && (
                                                                                <div>
                                                                                    <p className="text-[9px] uppercase tracking-wider font-bold mb-2" style={{ color: C.cyanText, fontFamily: GF }}>Public Description</p>
                                                                                    <div className="text-xs max-h-44 overflow-y-auto pr-2 leading-relaxed"
                                                                                        style={{ color: 'rgba(190,205,225,0.65)', fontFamily: GF, scrollbarWidth: 'thin' }}
                                                                                        dangerouslySetInnerHTML={{ __html: job.public_job_description }} />
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* Comments / additional */}
                                                                        {(job.comments || job.additional_details) && (
                                                                            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                                                {job.comments && <p className="text-xs" style={{ color: 'rgba(170,185,210,0.5)', fontFamily: GF }}><span style={{ color: 'rgba(170,185,210,0.35)', fontWeight: 700 }}>COMMENTS: </span>{job.comments}</p>}
                                                                                {job.additional_details && <p className="text-xs mt-1" style={{ color: 'rgba(170,185,210,0.5)', fontFamily: GF }}><span style={{ color: 'rgba(170,185,210,0.35)', fontWeight: 700 }}>DETAILS: </span>{job.additional_details}</p>}
                                                                            </div>
                                                                        )}
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

                {/* Empty state */}
                {!loading && !error && filteredJobs.length === 0 && jobs.length > 0 && (
                    <div className="py-16 text-center">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <svg className="w-5 h-5" style={{ color: 'rgba(170,185,210,0.3)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-sm" style={{ color: 'rgba(170,185,210,0.4)', fontFamily: GF }}>No jobs match your filters.</p>
                        <button onClick={() => { setStatusFilter("All"); setSearchQuery(""); }}
                            className="mt-3 text-xs font-semibold transition-colors"
                            style={{ color: C.cyanText, fontFamily: GF }}
                            onMouseEnter={e => (e.currentTarget.style.color = C.cyan)}
                            onMouseLeave={e => (e.currentTarget.style.color = C.cyanText)}>
                            Clear filters
                        </button>
                    </div>
                )}

                {/* ── PAGINATION ── */}
                {!loading && !error && jobs.length > 0 && (
                    <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <span className="text-xs" style={{ color: 'rgba(170,185,210,0.38)', fontFamily: GF }}>
                            Page {currentPage} · {filteredJobs.length} shown{totalCount > 0 ? ` · ${totalCount.toLocaleString()} total` : ""}
                        </span>
                        <div className="flex items-center gap-2">
                            {[
                                { label: '← Prev', action: () => { setCurrentPage(p => p - 1); setExpandedJob(null); }, disabled: currentPage === 1 },
                                { label: 'Next →', action: () => { setCurrentPage(p => p + 1); setExpandedJob(null); }, disabled: !hasMore },
                            ].map(({ label, action, disabled }) => (
                                <button key={label} onClick={action} disabled={disabled}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                                    style={{
                                        background: disabled ? 'rgba(255,255,255,0.02)' : C.cyanDim,
                                        border: `1px solid ${disabled ? 'rgba(255,255,255,0.05)' : C.cyanBdr}`,
                                        color: disabled ? 'rgba(255,255,255,0.15)' : C.cyanText,
                                        cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: GF,
                                    }}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

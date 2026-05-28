"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Logo from '../../../public/logo.svg';

interface Job {
    job_code: string;
    job_title: string;
    city: string;
    states: string;
    zip_code: string;
    country: string;
    location: string;
    pay_rate___salary: string;
    career_portal_published_date: string;
    job_type: string;
    job_status: string;
    remote_job: string;
    experience: string;
    primary_skills: string;
    job_description: string;
    public_job_description: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiResponse = Job[] | { results: Job[]; count?: number; next?: string; previous?: string } | Record<string, any>;

const DUMMY_JOBS: Job[] = [
    {
        job_code: "MNT-1024", job_title: "Senior React Developer", city: "San Francisco",
        states: "California", zip_code: "94105", country: "USA", location: "San Francisco, CA",
        pay_rate___salary: "$120,000 - $160,000/yr", career_portal_published_date: "2026-03-01",
        job_type: "Full-Time", job_status: "Open", remote_job: "Hybrid", experience: "5+ years",
        primary_skills: "React, TypeScript, Node.js",
        job_description: "Senior React Developer position",
        public_job_description: "We are looking for an experienced React Developer to join our team.",
    },
    {
        job_code: "MNT-1025", job_title: "DevOps Engineer", city: "Austin",
        states: "Texas", zip_code: "73301", country: "USA", location: "Austin, TX",
        pay_rate___salary: "$110,000 - $145,000/yr", career_portal_published_date: "2026-02-28",
        job_type: "Full-Time", job_status: "Open", remote_job: "Remote", experience: "3+ years",
        primary_skills: "AWS, Docker, Kubernetes, CI/CD",
        job_description: "DevOps Engineer position",
        public_job_description: "Join our infrastructure team to build scalable cloud solutions.",
    },
    {
        job_code: "MNT-1026", job_title: "UI/UX Designer", city: "New York",
        states: "New York", zip_code: "10001", country: "USA", location: "New York, NY",
        pay_rate___salary: "$90,000 - $130,000/yr", career_portal_published_date: "2026-02-25",
        job_type: "Full-Time", job_status: "Open", remote_job: "On-site", experience: "4+ years",
        primary_skills: "Figma, Adobe XD, Prototyping",
        job_description: "UI/UX Designer position",
        public_job_description: "Design beautiful interfaces for enterprise clients.",
    },
];

// Brand colors — from logo: coral #FF5758, cyan #57EEFF, dark navy #070E2A
const C = {
    coral:     '#FF5758',
    coralDim:  'rgba(255,87,88,0.15)',
    coralBdr:  'rgba(255,87,88,0.3)',
    cyan:      '#57EEFF',
    cyanDim:   'rgba(87,238,255,0.1)',
    cyanBdr:   'rgba(87,238,255,0.25)',
    cyanText:  '#7ED6E6',
    navy:      '#070E2A',
};

const REMOTE_BADGE: Record<string, { bg: string; border: string; color: string; dot: string }> = {
    Remote:    { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  color: '#6EE7B7', dot: '#10B981' },
    Hybrid:    { bg: C.cyanDim,               border: C.cyanBdr,               color: C.cyanText, dot: C.cyan },
    'On-site': { bg: C.coralDim,              border: C.coralBdr,              color: '#FFB3B3',  dot: C.coral },
};

const GF = 'var(--font-gilroy)';

const JobsClient = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [totalCount, setTotalCount] = useState<number | null>(null);
    const [usingDummy, setUsingDummy] = useState(false);
    const [hoveredJob, setHoveredJob] = useState<string | null>(null);
    const [scrolled, setScrolled] = useState(false);

    const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [formData, setFormData] = useState({
        name: '', email: '', countryCode: '+1', contactNo: '', currentLocation: '', resume: null as File | null,
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const PAGING_LENGTH = 50;

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const fetchJobs = useCallback(async (page: number) => {
        setLoading(true); setUsingDummy(false);
        try {
            const res = await fetch(`/api/jobs?page=${page}&paging_length=${PAGING_LENGTH}`);
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `Error ${res.status}`);
            const data: ApiResponse = await res.json();
            let list: Job[] = [];
            if (Array.isArray(data)) {
                list = data;
            } else if (data && typeof data === 'object') {
                if ('results' in data && Array.isArray(data.results)) {
                    list = data.results;
                    if (typeof data.count === 'number') setTotalCount(data.count);
                    setHasMore(!!data.next);
                } else {
                    const arr = Object.values(data).find(v => Array.isArray(v));
                    if (arr && Array.isArray(arr)) list = arr;
                }
            }
            if (list.length === 0) {
                setJobs(DUMMY_JOBS); setUsingDummy(true); setTotalCount(DUMMY_JOBS.length); setHasMore(false);
            } else {
                setJobs(list);
                if (list.length >= PAGING_LENGTH) setHasMore(true);
                else if (!('next' in (data as object))) setHasMore(false);
            }
        } catch {
            setJobs(DUMMY_JOBS); setUsingDummy(true); setTotalCount(DUMMY_JOBS.length); setHasMore(false);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchJobs(currentPage); }, [currentPage, fetchJobs]);

    const fmtLocation = (j: Job) => j.location || [j.city, j.states, j.zip_code].filter(Boolean).join(', ') || 'N/A';
    const fmtPay = (j: Job) => {
        const r = (j.pay_rate___salary || '').trim();
        if (!r) return 'N/A';
        if (/[a-zA-Z/]/.test(r)) return r;
        const n = parseFloat(r.replace(/[,$\s]/g, ''));
        return isNaN(n) ? r : `$${n.toLocaleString()}${n < 500 ? '/hr' : '/yr'}`;
    };
    const fmtDate = (s: string) => {
        if (!s) return 'N/A';
        try { const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
        catch { return s; }
    };

    const toggleJob = (code: string) => {
        const s = new Set(selectedJobs); s.has(code) ? s.delete(code) : s.add(code); setSelectedJobs(s);
    };
    const toggleAll = () => setSelectedJobs(selectedJobs.size === jobs.length ? new Set() : new Set(jobs.map(j => j.job_code)));
    const getSelected = () => jobs.filter(j => selectedJobs.has(j.job_code));

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: value }));
        if (formErrors[name]) setFormErrors(p => { const n = { ...p }; delete n[name]; return n; });
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setFormData(p => ({ ...p, resume: e.target.files![0] }));
    };
    const closeModal = () => {
        setIsModalOpen(false); setSubmitStatus(null);
        setFormData({ name: '', email: '', countryCode: '+1', contactNo: '', currentLocation: '', resume: null });
        setFormErrors({});
    };
    const validate = () => {
        const e: Record<string, string> = {};
        if (!formData.name.trim() || formData.name.trim().length < 2) e.name = 'Full name required (min 2 chars)';
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Valid email required';
        if (!formData.contactNo.trim() || !/^\d{7,15}$/.test(formData.contactNo.replace(/[\s\-()]/g, ''))) e.contactNo = 'Valid phone number required';
        if (!formData.currentLocation.trim()) e.currentLocation = 'Location required';
        if (!formData.resume) e.resume = 'Resume required';
        setFormErrors(e); return Object.keys(e).length === 0;
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); if (!validate()) return;
        setSubmitting(true); setSubmitStatus(null);
        try {
            const fd = new FormData();
            fd.append('name', formData.name); fd.append('email', formData.email);
            fd.append('contactNo', `${formData.countryCode} ${formData.contactNo}`);
            fd.append('currentLocation', formData.currentLocation);
            fd.append('jobs', JSON.stringify(getSelected().map(j => ({ job_code: j.job_code, job_title: j.job_title, location: fmtLocation(j), pay_rate: fmtPay(j) }))));
            if (formData.resume) fd.append('resume', formData.resume);
            const res = await fetch('/api/apply', { method: 'POST', body: fd });
            const data = await res.json();
            if (res.ok) {
                setSubmitStatus({ type: 'success', message: 'Application submitted! We will be in touch soon.' });
                setTimeout(() => { closeModal(); setSelectedJobs(new Set()); }, 2500);
            } else {
                setSubmitStatus({ type: 'error', message: data.error || 'Submission failed. Please try again.' });
            }
        } catch { setSubmitStatus({ type: 'error', message: 'Network error. Check your connection.' }); }
        finally { setSubmitting(false); }
    };

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #06091e 0%, #07122a 45%, #030e18 100%)' }}>

            {/* ── GRID TEXTURE ── */}
            <div className="fixed inset-0 pointer-events-none" style={{
                backgroundImage: `linear-gradient(rgba(87,238,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(87,238,255,0.03) 1px, transparent 1px)`,
                backgroundSize: '72px 72px', opacity: 0.5,
            }} />
            {/* Ambient orbs — subtle, non-intrusive */}
            <div className="fixed top-0 left-0 w-[600px] h-[400px] pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 40%, rgba(87,238,255,0.04) 0%, transparent 60%)', filter: 'blur(60px)' }} />
            <div className="fixed bottom-0 right-0 w-96 h-96 pointer-events-none" style={{ background: 'radial-gradient(circle at 70% 70%, rgba(255,87,88,0.04) 0%, transparent 65%)', filter: 'blur(60px)' }} />

            {/* ── NAVBAR ── */}
            <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
                style={{
                    background: scrolled ? 'rgba(6,9,30,0.97)' : 'rgba(6,9,30,0.6)',
                    backdropFilter: 'blur(16px)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.4)' : 'none',
                }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between" style={{ height: 60 }}>
                    <Link href="/">
                        <Image src={Logo} alt="Mintex Staffing" width={160} height={22} priority />
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link href="/"
                            className="hidden sm:flex items-center gap-1.5 text-xs font-medium transition-colors duration-200"
                            style={{ color: 'rgba(170,185,210,0.45)', fontFamily: GF }}
                            onMouseEnter={e => (e.currentTarget.style.color = C.cyanText)}
                            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(170,185,210,0.45)')}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Home
                        </Link>
                        <div className="w-px h-3.5 hidden sm:block" style={{ background: 'rgba(255,255,255,0.1)' }} />
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: C.coralDim, border: `1px solid ${C.coralBdr}`, color: C.coral, fontFamily: GF }}>
                            Careers
                        </span>
                    </div>
                </div>
            </header>

            {/* ── PAGE CONTENT ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" style={{ paddingTop: 80, paddingBottom: 100 }}>

                {/* HERO — compact */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-7"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>

                    <div>
                        {/* Eyebrow */}
                        <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full"
                            style={{ background: 'rgba(255,87,88,0.07)', border: `1px solid ${C.coralBdr}` }}>
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: C.coral }} />
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: C.coral, fontFamily: GF }}>
                                Open Positions
                            </span>
                        </div>

                        <h1 className="font-black leading-tight" style={{ fontFamily: GF, fontSize: 'clamp(1.7rem, 3vw, 2.4rem)' }}>
                            <span style={{
                                background: `linear-gradient(120deg, #ffffff 0%, #c8f8ff 60%, ${C.cyan} 100%)`,
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                            }}>Available Positions</span>
                        </h1>
                        <p className="text-sm mt-1.5" style={{ color: 'rgba(170,185,210,0.5)', fontFamily: GF }}>
                            Select one or more roles and apply in a single step.
                        </p>
                    </div>

                    {usingDummy && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium flex-shrink-0"
                            style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', color: '#FCD34D', fontFamily: GF }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                            Sample data — live jobs load once the API is connected.
                        </motion.div>
                    )}
                </motion.div>

                {/* ── LOADING ── */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="relative w-10 h-10 mb-4">
                            <div className="absolute inset-0 rounded-full" style={{ border: `1px solid ${C.coralDim}` }} />
                            <div className="absolute inset-0 rounded-full animate-spin" style={{ border: '1.5px solid transparent', borderTopColor: C.coral, filter: `drop-shadow(0 0 6px ${C.coral}99)` }} />
                        </div>
                        <p className="text-xs tracking-[0.25em] uppercase" style={{ color: 'rgba(170,185,210,0.4)', fontFamily: GF }}>
                            Loading…
                        </p>
                    </div>
                )}

                {/* ── JOBS ── */}
                {!loading && jobs.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>

                        {/* Toolbar */}
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium" style={{ color: 'rgba(170,185,210,0.45)', fontFamily: GF }}>
                                    {totalCount ?? jobs.length} open position{(totalCount ?? jobs.length) !== 1 ? 's' : ''}
                                </span>
                                <AnimatePresence>
                                    {selectedJobs.size > 0 && (
                                        <motion.div initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.75 }}
                                            className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                                            style={{ background: C.coralDim, border: `1px solid ${C.coralBdr}` }}>
                                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: C.coral, boxShadow: `0 0 6px ${C.coral}` }} />
                                            <span className="text-xs font-bold" style={{ color: C.coral, fontFamily: GF }}>
                                                {selectedJobs.size} selected
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <button onClick={toggleAll}
                                className="text-xs font-semibold transition-all duration-200 px-3 py-1.5 rounded-lg"
                                style={{ color: 'rgba(170,185,210,0.4)', fontFamily: GF }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = C.cyanText; (e.currentTarget as HTMLElement).style.background = C.cyanDim; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(170,185,210,0.4)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                                {selectedJobs.size === jobs.length ? 'Deselect all' : 'Select all'}
                            </button>
                        </div>

                        {/* Cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {jobs.map((job, index) => {
                                const sel = selectedJobs.has(job.job_code);
                                const hov = hoveredJob === job.job_code;
                                const rb = REMOTE_BADGE[job.remote_job] ?? REMOTE_BADGE['On-site'];
                                return (
                                    <motion.div key={job.job_code || index}
                                        initial={{ opacity: 0, y: 24 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                        onClick={() => toggleJob(job.job_code)}
                                        onMouseEnter={() => setHoveredJob(job.job_code)}
                                        onMouseLeave={() => setHoveredJob(null)}
                                        className="cursor-pointer rounded-2xl relative overflow-hidden"
                                        style={{
                                            background: sel
                                                ? 'rgba(255,87,88,0.05)'
                                                : hov ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.025)',
                                            border: `1.5px solid ${sel
                                                ? C.coralBdr
                                                : hov ? 'rgba(87,238,255,0.18)' : 'rgba(255,255,255,0.07)'}`,
                                            boxShadow: sel
                                                ? `0 0 0 1px rgba(255,87,88,0.1), 0 8px 32px rgba(255,87,88,0.08)`
                                                : hov ? '0 8px 32px rgba(0,0,0,0.3)' : '0 2px 16px rgba(0,0,0,0.2)',
                                            backdropFilter: 'blur(16px)',
                                            transition: 'all 0.22s ease',
                                        }}>

                                        {/* Top shimmer line */}
                                        <div className="absolute top-0 left-0 right-0 h-px transition-all duration-300" style={{
                                            background: sel
                                                ? `linear-gradient(90deg, transparent, ${C.coral}99, transparent)`
                                                : hov
                                                    ? `linear-gradient(90deg, transparent, ${C.cyan}44, transparent)`
                                                    : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
                                        }} />

                                        <div className="p-5">
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1 mr-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="font-mono text-[10px] px-2 py-0.5 rounded"
                                                            style={{ background: 'rgba(87,238,255,0.07)', color: 'rgba(87,238,255,0.55)', border: '1px solid rgba(87,238,255,0.14)' }}>
                                                            {job.job_code}
                                                        </span>
                                                        {job.job_status === 'Open' && (
                                                            <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: '#6EE7B7', fontFamily: GF }}>
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                                Open
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="text-lg font-black leading-snug transition-colors duration-200"
                                                        style={{ fontFamily: GF, color: sel ? '#ffdede' : hov ? '#e4f8ff' : '#f0f4ff' }}>
                                                        {job.job_title || 'N/A'}
                                                    </h3>
                                                </div>

                                                {/* Checkbox — coral when selected, cyan on hover */}
                                                <div className="w-6 h-6 rounded-lg flex-shrink-0 mt-1 flex items-center justify-center"
                                                    style={{
                                                        background: sel ? C.coral : hov ? C.cyanDim : 'rgba(255,255,255,0.05)',
                                                        border: `1.5px solid ${sel ? C.coral : hov ? C.cyanBdr : 'rgba(255,255,255,0.15)'}`,
                                                        boxShadow: sel ? `0 0 16px ${C.coral}80` : 'none',
                                                        transition: 'all 0.2s ease',
                                                    }}>
                                                    <AnimatePresence>
                                                        {sel && (
                                                            <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                                                className="w-3.5 h-3.5" style={{ color: '#fff' }}
                                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </motion.svg>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>

                                            {/* Badges */}
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {job.job_type && (
                                                    <span className="text-[11px] px-3 py-1 rounded-full font-semibold"
                                                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.11)', color: 'rgba(215,225,240,0.7)', fontFamily: GF }}>
                                                        {job.job_type}
                                                    </span>
                                                )}
                                                {job.remote_job && (
                                                    <span className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full font-semibold"
                                                        style={{ background: rb.bg, border: `1px solid ${rb.border}`, color: rb.color, fontFamily: GF }}>
                                                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: rb.dot }} />
                                                        {job.remote_job}
                                                    </span>
                                                )}
                                                {job.experience && (
                                                    <span className="text-[11px] px-3 py-1 rounded-full font-semibold"
                                                        style={{ background: 'rgba(155,92,246,0.1)', border: '1px solid rgba(155,92,246,0.22)', color: '#C4A8FF', fontFamily: GF }}>
                                                        {job.experience}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Info grid */}
                                            <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 mb-4">
                                                {[
                                                    { label: 'Location', value: fmtLocation(job), icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /> },
                                                    { label: 'Salary', value: fmtPay(job), accent: true, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
                                                    { label: 'Posted', value: fmtDate(job.career_portal_published_date), icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
                                                    { label: 'State', value: job.states || 'N/A', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 21l1.9-5.7a8.5 8.5 0 113.8 3.8z" /> },
                                                ].map(({ label, value, accent, icon }) => (
                                                    <div key={label} className="flex items-center gap-2.5 min-w-0">
                                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                                            style={{ background: 'rgba(87,238,255,0.06)', border: '1px solid rgba(87,238,255,0.1)' }}>
                                                            <svg className="w-3.5 h-3.5" style={{ color: C.cyan }} fill="none" stroke="currentColor" viewBox="0 0 24 24">{icon}</svg>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[9px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: 'rgba(150,165,190,0.4)', fontFamily: GF }}>{label}</p>
                                                            <p className="text-xs font-semibold truncate" style={{ color: accent ? '#a3e8f0' : 'rgba(200,215,235,0.7)', fontFamily: GF }}>{value}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Skills */}
                                            {job.primary_skills && (
                                                <div className="flex flex-wrap gap-1.5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                    {job.primary_skills.split(',').slice(0, 5).map((s, i) => (
                                                        <span key={i} className="text-[10px] px-2.5 py-1 rounded-lg font-medium"
                                                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(180,195,220,0.5)', fontFamily: GF }}>
                                                            {s.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        <div className="mt-7 mb-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <span className="text-sm" style={{ color: 'rgba(170,185,210,0.38)', fontFamily: GF }}>
                                Showing {jobs.length}{totalCount !== null ? ` of ${totalCount}` : ''} · Page {currentPage}
                            </span>
                            <div className="flex items-center gap-2">
                                {[
                                    { label: '← Prev', action: () => { setCurrentPage(p => p - 1); setSelectedJobs(new Set()); }, disabled: currentPage === 1 },
                                    { label: 'Next →', action: () => { setCurrentPage(p => p + 1); setSelectedJobs(new Set()); }, disabled: !hasMore },
                                ].map(({ label, action, disabled }) => (
                                    <button key={label} onClick={action} disabled={disabled}
                                        className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
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
                    </motion.div>
                )}
            </div>

            {/* ── FLOATING APPLY BAR ── */}
            <AnimatePresence>
                {selectedJobs.size > 0 && !isModalOpen && (
                    <motion.div
                        initial={{ y: 120, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 120, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 360, damping: 26 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-4">
                        <div className="flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl"
                            style={{
                                background: 'rgba(4,8,22,0.97)',
                                backdropFilter: 'blur(32px)',
                                border: `1px solid ${C.coralBdr}`,
                                boxShadow: `0 0 0 1px rgba(255,87,88,0.06), 0 0 40px rgba(255,87,88,0.12), 0 20px 60px rgba(0,0,0,0.6)`,
                            }}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: C.coralDim, border: `1px solid ${C.coralBdr}` }}>
                                    <span className="text-sm font-black" style={{ color: C.coral, fontFamily: GF }}>{selectedJobs.size}</span>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(170,185,210,0.45)', fontFamily: GF }}>Selected</p>
                                    <p className="text-sm font-bold text-white leading-tight" style={{ fontFamily: GF }}>
                                        {selectedJobs.size} role{selectedJobs.size !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                    onClick={() => { setSubmitStatus(null); setIsModalOpen(true); }}
                                    className="px-6 py-2.5 rounded-xl font-black text-sm tracking-wider uppercase"
                                    style={{ background: `linear-gradient(135deg, ${C.coral}, #ff8a8a)`, color: '#fff', boxShadow: `0 0 24px ${C.coral}66`, fontFamily: GF }}>
                                    Apply Now
                                </motion.button>
                                <button onClick={() => setSelectedJobs(new Set())}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(180,190,210,0.4)' }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(180,190,210,0.4)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── MODAL ── */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                        className="fixed inset-0 flex items-center justify-center z-50 p-4"
                        style={{ backdropFilter: 'blur(20px)', background: 'rgba(2,5,16,0.92)' }}>
                        <motion.div
                            initial={{ scale: 0.93, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 12 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                            className="max-w-2xl w-full max-h-[90vh] overflow-hidden rounded-3xl"
                            style={{ background: 'rgba(4,8,22,0.98)', backdropFilter: 'blur(40px)', border: `1px solid ${C.coralBdr}`, boxShadow: `0 0 80px rgba(255,87,88,0.08), 0 40px 80px rgba(0,0,0,0.7)` }}>

                            {/* Coral top gradient line */}
                            <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${C.coral}, transparent)` }} />

                            <div className="overflow-y-auto max-h-[90vh]">
                                {/* Header */}
                                <div className="sticky top-0 z-10 flex justify-between items-start px-6 py-4"
                                    style={{ background: 'rgba(4,8,22,0.99)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div className="flex items-center gap-3">
                                        {/* Coral dot accent */}
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                            style={{ background: C.coralDim, border: `1px solid ${C.coralBdr}` }}>
                                            <svg className="w-4 h-4" style={{ color: C.coral }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black" style={{ color: '#f0f4ff', fontFamily: GF }}>Apply for Positions</h2>
                                            <p className="text-xs mt-0.5" style={{ color: 'rgba(170,185,210,0.45)', fontFamily: GF }}>Fill in your details below</p>
                                        </div>
                                    </div>
                                    <button onClick={closeModal}
                                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(200,210,230,0.4)' }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = 'rgba(200,210,230,0.4)'; }}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="px-6 pt-5 pb-6">
                                    {/* Status */}
                                    <AnimatePresence>
                                        {submitStatus && (
                                            <motion.div initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                                className="mb-5 p-4 rounded-xl overflow-hidden"
                                                style={{ background: submitStatus.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(255,87,88,0.08)', border: `1px solid ${submitStatus.type === 'success' ? 'rgba(16,185,129,0.25)' : C.coralBdr}` }}>
                                                <p className="text-sm font-semibold" style={{ color: submitStatus.type === 'success' ? '#6EE7B7' : '#FFB3B3', fontFamily: GF }}>
                                                    {submitStatus.message}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Selected roles */}
                                    <div className="mb-6 p-4 rounded-2xl" style={{ background: C.coralDim, border: `1px solid ${C.coralBdr}` }}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: C.coral, boxShadow: `0 0 6px ${C.coral}` }} />
                                            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.coral, fontFamily: GF }}>
                                                {selectedJobs.size} role{selectedJobs.size !== 1 ? 's' : ''} selected
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            {getSelected().map(job => (
                                                <div key={job.job_code} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                    <span className="font-mono text-[10px] flex-shrink-0 px-2 py-0.5 rounded"
                                                        style={{ background: 'rgba(87,238,255,0.07)', color: 'rgba(87,238,255,0.55)', border: '1px solid rgba(87,238,255,0.14)' }}>
                                                        {job.job_code}
                                                    </span>
                                                    <span className="text-sm font-semibold truncate" style={{ color: 'rgba(200,215,235,0.85)', fontFamily: GF }}>{job.job_title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Form */}
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {[
                                                { id: 'name', label: 'Full Name', type: 'text', ph: 'John Doe' },
                                                { id: 'email', label: 'Email Address', type: 'email', ph: 'john@example.com' },
                                            ].map(({ id, label, type, ph }) => (
                                                <div key={id}>
                                                    <label htmlFor={id} className="block text-[10px] font-bold uppercase tracking-wider mb-2"
                                                        style={{ color: 'rgba(170,185,210,0.5)', fontFamily: GF }}>
                                                        {label} <span style={{ color: C.coral }}>*</span>
                                                    </label>
                                                    <input type={type} id={id} name={id}
                                                        value={formData[id as 'name' | 'email']}
                                                        onChange={handleInputChange} placeholder={ph}
                                                        className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all duration-200"
                                                        style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${formErrors[id] ? C.coralBdr : 'rgba(255,255,255,0.09)'}`, color: '#e8f0ff', fontFamily: GF }}
                                                        onFocus={e => { e.target.style.borderColor = C.coralBdr; e.target.style.boxShadow = `0 0 0 3px rgba(255,87,88,0.07)`; }}
                                                        onBlur={e => { e.target.style.borderColor = formErrors[id] ? C.coralBdr : 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none'; }}
                                                    />
                                                    {formErrors[id] && <p className="mt-1.5 text-xs" style={{ color: '#FFB3B3', fontFamily: GF }}>{formErrors[id]}</p>}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-wider mb-2"
                                                    style={{ color: 'rgba(170,185,210,0.5)', fontFamily: GF }}>
                                                    Contact Number <span style={{ color: C.coral }}>*</span>
                                                </label>
                                                <div className="flex rounded-xl overflow-hidden"
                                                    style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${formErrors.contactNo ? C.coralBdr : 'rgba(255,255,255,0.09)'}` }}>
                                                    <select name="countryCode" value={formData.countryCode} onChange={handleInputChange}
                                                        className="px-3 py-3 text-sm focus:outline-none cursor-pointer"
                                                        style={{ background: C.coralDim, borderRight: '1px solid rgba(255,255,255,0.07)', color: C.coral, fontFamily: GF, appearance: 'none' }}>
                                                        {['+1 US','+44 UK','+91 IN','+61 AU','+49 DE','+33 FR','+81 JP','+86 CN','+55 BR','+52 MX','+971 AE','+65 SG','+82 KR']
                                                            .map(o => <option key={o} value={o.split(' ')[0]}>{o}</option>)}
                                                    </select>
                                                    <input type="tel" name="contactNo" value={formData.contactNo} onChange={handleInputChange}
                                                        placeholder="(555) 123-4567"
                                                        className="flex-1 px-4 py-3 focus:outline-none text-sm min-w-0"
                                                        style={{ background: 'transparent', color: '#e8f0ff', fontFamily: GF }} />
                                                </div>
                                                {formErrors.contactNo && <p className="mt-1.5 text-xs" style={{ color: '#FFB3B3', fontFamily: GF }}>{formErrors.contactNo}</p>}
                                            </div>
                                            <div>
                                                <label htmlFor="currentLocation" className="block text-[10px] font-bold uppercase tracking-wider mb-2"
                                                    style={{ color: 'rgba(170,185,210,0.5)', fontFamily: GF }}>
                                                    Current Location <span style={{ color: C.coral }}>*</span>
                                                </label>
                                                <input type="text" id="currentLocation" name="currentLocation"
                                                    value={formData.currentLocation} onChange={handleInputChange} placeholder="City, State"
                                                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all duration-200"
                                                    style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${formErrors.currentLocation ? C.coralBdr : 'rgba(255,255,255,0.09)'}`, color: '#e8f0ff', fontFamily: GF }}
                                                    onFocus={e => { e.target.style.borderColor = C.coralBdr; e.target.style.boxShadow = `0 0 0 3px rgba(255,87,88,0.07)`; }}
                                                    onBlur={e => { e.target.style.borderColor = formErrors.currentLocation ? C.coralBdr : 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none'; }}
                                                />
                                                {formErrors.currentLocation && <p className="mt-1.5 text-xs" style={{ color: '#FFB3B3', fontFamily: GF }}>{formErrors.currentLocation}</p>}
                                            </div>
                                        </div>

                                        {/* Resume */}
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-wider mb-2"
                                                style={{ color: 'rgba(170,185,210,0.5)', fontFamily: GF }}>
                                                Resume <span style={{ color: C.coral }}>*</span>
                                            </label>
                                            <label className="flex flex-col items-center justify-center w-full h-28 rounded-xl cursor-pointer transition-all duration-200"
                                                style={{ background: 'rgba(255,255,255,0.02)', border: `1.5px dashed ${formErrors.resume ? C.coralBdr : 'rgba(255,87,88,0.18)'}` }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.coralDim; (e.currentTarget as HTMLElement).style.borderColor = C.coralBdr; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; (e.currentTarget as HTMLElement).style.borderColor = formErrors.resume ? C.coralBdr : 'rgba(255,87,88,0.18)'; }}>
                                                <svg className="w-7 h-7 mb-2" style={{ color: 'rgba(255,87,88,0.45)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                <p className="text-sm" style={{ color: 'rgba(170,185,210,0.5)', fontFamily: GF }}>
                                                    <span style={{ color: '#FFB3B3', fontWeight: 600 }}>Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-[10px] mt-1" style={{ color: 'rgba(150,165,185,0.38)', fontFamily: GF }}>PDF, DOC, DOCX — max 5 MB</p>
                                                <input type="file" name="resume" accept=".pdf,.doc,.docx"
                                                    onChange={e => { handleFileChange(e); if (formErrors.resume) setFormErrors(p => { const n = { ...p }; delete n.resume; return n; }); }}
                                                    className="hidden" />
                                            </label>
                                            {formErrors.resume && <p className="mt-1.5 text-xs" style={{ color: '#FFB3B3', fontFamily: GF }}>{formErrors.resume}</p>}
                                            <AnimatePresence>
                                                {formData.resume && (
                                                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                        className="mt-2.5 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
                                                        style={{ background: C.coralDim, border: `1px solid ${C.coralBdr}` }}>
                                                        <svg className="w-4 h-4 flex-shrink-0" style={{ color: C.coral }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="text-xs font-semibold truncate" style={{ color: '#FFB3B3', fontFamily: GF }}>{formData.resume.name}</span>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex justify-end gap-3 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            <button type="button" onClick={closeModal}
                                                className="px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(190,205,225,0.6)', fontFamily: GF }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.color = '#e8f0ff'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = 'rgba(190,205,225,0.6)'; }}>
                                                Cancel
                                            </button>
                                            <motion.button type="submit" disabled={submitting}
                                                whileHover={submitting ? {} : { scale: 1.02 }} whileTap={submitting ? {} : { scale: 0.98 }}
                                                className="px-8 py-3 rounded-xl text-sm font-black tracking-wider uppercase flex items-center gap-2"
                                                style={{
                                                    background: submitting ? C.coralDim : `linear-gradient(135deg, ${C.coral}, #ff8a8a)`,
                                                    color: submitting ? C.coral : '#fff',
                                                    boxShadow: submitting ? 'none' : `0 0 24px ${C.coral}55`,
                                                    cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: GF,
                                                    border: submitting ? `1px solid ${C.coralBdr}` : 'none',
                                                }}>
                                                {submitting
                                                    ? <><span className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: `${C.coral}33`, borderTopColor: C.coral }} /> Submitting…</>
                                                    : 'Submit Application'
                                                }
                                            </motion.button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default JobsClient;

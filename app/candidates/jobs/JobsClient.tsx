"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
        primary_skills: "React, TypeScript, Node.js, GraphQL, Redux",
        job_description: "Senior React Developer position",
        public_job_description: `We are looking for an experienced Senior React Developer to join our growing engineering team. In this role, you will architect and build high-performance web applications used by thousands of enterprise clients daily.

Key Responsibilities:
• Design and implement scalable front-end solutions using React, TypeScript, and modern tooling
• Collaborate with product designers and backend engineers to deliver pixel-perfect features
• Mentor junior developers and participate in code reviews
• Optimize application performance and improve developer experience
• Contribute to architectural decisions and technical roadmap

Requirements:
• 5+ years of professional React experience
• Deep understanding of TypeScript and modern JavaScript (ES2022+)
• Experience with state management (Redux, Zustand, or Jotai)
• Familiarity with GraphQL and REST API integration
• Strong understanding of web performance optimization techniques

Benefits:
• Competitive salary ($120,000 – $160,000/yr)
• Comprehensive health, dental, and vision coverage
• 401(k) with 4% company match
• $2,000 annual learning & development budget
• Flexible hybrid work arrangement`,
    },
    {
        job_code: "MNT-1025", job_title: "DevOps Engineer", city: "Austin",
        states: "Texas", zip_code: "73301", country: "USA", location: "Austin, TX",
        pay_rate___salary: "$110,000 - $145,000/yr", career_portal_published_date: "2026-02-28",
        job_type: "Full-Time", job_status: "Open", remote_job: "Remote", experience: "3+ years",
        primary_skills: "AWS, Docker, Kubernetes, CI/CD, Terraform",
        job_description: "DevOps Engineer position",
        public_job_description: `Join our infrastructure team to build and maintain the cloud systems that power our platform at scale.

Key Responsibilities:
• Design and manage AWS infrastructure using Terraform and CloudFormation
• Build and maintain CI/CD pipelines (GitHub Actions, Jenkins)
• Manage Kubernetes clusters and containerized workloads
• Implement monitoring, alerting, and incident response workflows

Requirements:
• 3+ years of DevOps or SRE experience
• Hands-on expertise with AWS services (EKS, RDS, S3, CloudFront, Lambda)
• Proficiency with Docker and Kubernetes
• Strong scripting skills in Bash and Python

Benefits:
• 100% remote position
• Competitive salary ($110,000 – $145,000/yr)
• Home office stipend ($1,500 setup + $100/mo)
• Unlimited PTO`,
    },
    {
        job_code: "MNT-1026", job_title: "UI/UX Designer", city: "New York",
        states: "New York", zip_code: "10001", country: "USA", location: "New York, NY",
        pay_rate___salary: "$90,000 - $130,000/yr", career_portal_published_date: "2026-02-25",
        job_type: "Full-Time", job_status: "Open", remote_job: "On-site", experience: "4+ years",
        primary_skills: "Figma, Adobe XD, Prototyping, Design Systems",
        job_description: "UI/UX Designer position",
        public_job_description: `We are seeking a talented UI/UX Designer to craft beautiful, intuitive interfaces for our enterprise client suite.

Key Responsibilities:
• Create wireframes, prototypes, and high-fidelity designs in Figma
• Conduct user research, usability testing, and synthesize insights
• Maintain and evolve the company design system
• Collaborate with engineering to ensure faithful implementation

Requirements:
• 4+ years of product design experience
• Mastery of Figma (Auto Layout, Variables, Dev Mode)
• Strong portfolio demonstrating end-to-end product thinking

Benefits:
• Competitive salary ($90,000 – $130,000/yr)
• On-site role in our Manhattan office
• Annual design conference budget`,
    },
    {
        job_code: "MNT-1027", job_title: "Backend Engineer", city: "Seattle",
        states: "Washington", zip_code: "98101", country: "USA", location: "Seattle, WA",
        pay_rate___salary: "$130,000 - $170,000/yr", career_portal_published_date: "2026-03-05",
        job_type: "Full-Time", job_status: "Open", remote_job: "Remote", experience: "4+ years",
        primary_skills: "Python, Django, PostgreSQL, Redis, Microservices",
        job_description: "Backend Engineer position",
        public_job_description: `We are hiring a Backend Engineer to design and build the APIs and services powering our platform.

Key Responsibilities:
• Build and maintain RESTful APIs and microservices using Python and Django
• Design database schemas and optimize queries for scale
• Integrate third-party services and internal systems
• Participate in on-call rotation and incident response

Requirements:
• 4+ years of backend engineering experience
• Strong proficiency in Python and Django or FastAPI
• Deep knowledge of PostgreSQL and Redis
• Experience with microservices and distributed systems

Benefits:
• Fully remote role
• Competitive salary ($130,000 – $170,000/yr)
• Equity package
• Unlimited PTO`,
    },
    {
        job_code: "MNT-1028", job_title: "Data Analyst", city: "Chicago",
        states: "Illinois", zip_code: "60601", country: "USA", location: "Chicago, IL",
        pay_rate___salary: "$80,000 - $110,000/yr", career_portal_published_date: "2026-03-03",
        job_type: "Contract", job_status: "Open", remote_job: "Hybrid", experience: "2+ years",
        primary_skills: "SQL, Python, Tableau, Power BI, Excel",
        job_description: "Data Analyst position",
        public_job_description: `We need a Data Analyst to help our business teams make data-driven decisions.

Key Responsibilities:
• Build dashboards and reports in Tableau and Power BI
• Write complex SQL queries to extract and transform data
• Work with stakeholders to define KPIs and metrics
• Identify trends and present findings to leadership

Requirements:
• 2+ years of data analytics experience
• Expert SQL skills and experience with large datasets
• Proficiency in Python (pandas, numpy)
• Experience with BI tools (Tableau or Power BI)

Benefits:
• Contract role with potential for full-time conversion
• Competitive hourly rate
• Hybrid work schedule`,
    },
    {
        job_code: "MNT-1029", job_title: "Product Manager", city: "Los Angeles",
        states: "California", zip_code: "90001", country: "USA", location: "Los Angeles, CA",
        pay_rate___salary: "$115,000 - $150,000/yr", career_portal_published_date: "2026-02-20",
        job_type: "Full-Time", job_status: "Open", remote_job: "On-site", experience: "5+ years",
        primary_skills: "Roadmapping, Agile, Jira, User Research, Analytics",
        job_description: "Product Manager position",
        public_job_description: `We are looking for an experienced Product Manager to own the strategy and roadmap for our core product.

Key Responsibilities:
• Define product vision, strategy, and roadmap in collaboration with leadership
• Gather and prioritize product and customer requirements
• Work closely with engineering, design, and marketing
• Define and track success metrics for product features

Requirements:
• 5+ years of product management experience
• Strong analytical and problem-solving skills
• Experience working in Agile environments
• Excellent communication and stakeholder management skills

Benefits:
• Competitive salary ($115,000 – $150,000/yr)
• On-site role in Los Angeles
• Comprehensive benefits package`,
    },
];

const C = {
    coral:    '#FF5758',
    coralDim: 'rgba(255,87,88,0.12)',
    coralBdr: 'rgba(255,87,88,0.28)',
    cyan:     '#57EEFF',
    cyanDim:  'rgba(87,238,255,0.08)',
    cyanBdr:  'rgba(87,238,255,0.2)',
    cyanText: '#7ED6E6',
};

const REMOTE_COLORS: Record<string, { bg: string; border: string; color: string; dot: string }> = {
    Remote:    { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)', color: '#6EE7B7', dot: '#10B981' },
    Hybrid:    { bg: 'rgba(87,238,255,0.08)', border: 'rgba(87,238,255,0.2)',  color: '#7ED6E6', dot: '#57EEFF' },
    'On-site': { bg: 'rgba(255,87,88,0.12)',  border: 'rgba(255,87,88,0.28)', color: '#FFB3B3', dot: '#FF5758' },
};

const GF = 'var(--font-gilroy)';

const JobsClient = () => {
    const [jobs, setJobs]                 = useState<Job[]>([]);
    const [loading, setLoading]           = useState(true);
    const [currentPage, setCurrentPage]   = useState(1);
    const [hasMore, setHasMore]           = useState(false);
    const [totalCount, setTotalCount]     = useState<number | null>(null);
    const [usingDummy, setUsingDummy]     = useState(false);
    const [scrolled, setScrolled]         = useState(false);

    // Filters
    const [filterType, setFilterType]     = useState('All');
    const [filterRemote, setFilterRemote] = useState('All');
    const [filterExp, setFilterExp]       = useState('All');
    const [searchQuery, setSearchQuery]   = useState('');

    // Multi-select
    const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());

    // Detail modal
    const [detailJob, setDetailJob]       = useState<Job | null>(null);

    // Apply modal
    const [isApplyOpen, setIsApplyOpen]   = useState(false);
    const [submitting, setSubmitting]     = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [formData, setFormData]         = useState({ name: '', email: '', countryCode: '+1', contactNo: '', currentLocation: '', resume: null as File | null });
    const [formErrors, setFormErrors]     = useState<Record<string, string>>({});

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

    // Derived filter options from loaded jobs
    const jobTypes   = useMemo(() => ['All', ...Array.from(new Set(jobs.map(j => j.job_type).filter(Boolean)))], [jobs]);
    const remoteOpts = useMemo(() => ['All', ...Array.from(new Set(jobs.map(j => j.remote_job).filter(Boolean)))], [jobs]);
    const expOpts    = useMemo(() => ['All', ...Array.from(new Set(jobs.map(j => j.experience).filter(Boolean)))], [jobs]);

    // Filtered jobs
    const filteredJobs = useMemo(() => jobs.filter(j => {
        if (filterType   !== 'All' && j.job_type   !== filterType)   return false;
        if (filterRemote !== 'All' && j.remote_job  !== filterRemote) return false;
        if (filterExp    !== 'All' && j.experience  !== filterExp)    return false;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const haystack = `${j.job_title} ${j.primary_skills} ${j.city} ${j.states} ${j.location}`.toLowerCase();
            if (!haystack.includes(q)) return false;
        }
        return true;
    }), [jobs, filterType, filterRemote, filterExp, searchQuery]);

    const fmtLocation = (j: Job) => j.location || [j.city, j.states].filter(Boolean).join(', ') || 'N/A';
    const fmtPay = (j: Job) => {
        const r = (j.pay_rate___salary || '').trim();
        if (!r) return 'N/A';
        if (/[a-zA-Z/]/.test(r)) return r;
        const n = parseFloat(r.replace(/[,$\s]/g, ''));
        return isNaN(n) ? r : `$${n.toLocaleString()}${n < 500 ? '/hr' : '/yr'}`;
    };
    const fmtDate = (s: string) => {
        if (!s) return 'N/A';
        try { const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
        catch { return s; }
    };

    const toggleSelect = (code: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedCodes(prev => {
            const s = new Set(prev);
            s.has(code) ? s.delete(code) : s.add(code);
            return s;
        });
    };

    const openDetail  = (job: Job) => setDetailJob(job);
    const closeDetail = () => setDetailJob(null);

    const openApply = () => { setIsApplyOpen(true); setDetailJob(null); setSubmitStatus(null); };
    const closeApply = () => {
        setIsApplyOpen(false); setSubmitStatus(null);
        setFormData({ name: '', email: '', countryCode: '+1', contactNo: '', currentLocation: '', resume: null });
        setFormErrors({});
    };

    // If "Apply" clicked from detail modal, add that job to selection first
    const applyFromDetail = (job: Job) => {
        setSelectedCodes(prev => new Set([...prev, job.job_code]));
        openApply();
    };

    const selectedJobs = jobs.filter(j => selectedCodes.has(j.job_code));

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: value }));
        if (formErrors[name]) setFormErrors(p => { const n = { ...p }; delete n[name]; return n; });
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setFormData(p => ({ ...p, resume: e.target.files![0] }));
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
            fd.append('name', formData.name);
            fd.append('email', formData.email);
            fd.append('contactNo', `${formData.countryCode} ${formData.contactNo}`);
            fd.append('currentLocation', formData.currentLocation);
            fd.append('jobs', JSON.stringify(selectedJobs.map(j => ({ job_code: j.job_code, job_title: j.job_title, location: fmtLocation(j), pay_rate: fmtPay(j) }))));
            if (formData.resume) fd.append('resume', formData.resume);
            const res  = await fetch('/api/apply', { method: 'POST', body: fd });
            const data = await res.json();
            if (res.ok) {
                setSubmitStatus({ type: 'success', message: 'Application submitted! We will be in touch soon.' });
                setTimeout(() => { closeApply(); setSelectedCodes(new Set()); }, 2500);
            } else {
                setSubmitStatus({ type: 'error', message: data.error || 'Submission failed. Please try again.' });
            }
        } catch { setSubmitStatus({ type: 'error', message: 'Network error. Check your connection.' }); }
        finally { setSubmitting(false); }
    };

    const activeFilters = [filterType, filterRemote, filterExp].filter(f => f !== 'All').length + (searchQuery.trim() ? 1 : 0);
    const clearFilters = () => { setFilterType('All'); setFilterRemote('All'); setFilterExp('All'); setSearchQuery(''); };

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #06091e 0%, #060f28 50%, #030e18 100%)', fontFamily: GF }}>

            <div className="fixed inset-0 pointer-events-none" style={{
                backgroundImage: `linear-gradient(rgba(87,238,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(87,238,255,0.025) 1px, transparent 1px)`,
                backgroundSize: '80px 80px',
            }} />
            <div className="fixed top-0 left-0 pointer-events-none" style={{ width: 700, height: 500, background: 'radial-gradient(ellipse at 25% 35%, rgba(87,238,255,0.035) 0%, transparent 65%)', filter: 'blur(40px)' }} />
            <div className="fixed bottom-0 right-0 pointer-events-none" style={{ width: 500, height: 500, background: 'radial-gradient(circle at 65% 65%, rgba(255,87,88,0.03) 0%, transparent 65%)', filter: 'blur(40px)' }} />

            {/* NAVBAR */}
            <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
                style={{
                    background: scrolled ? 'rgba(5,8,24,0.97)' : 'rgba(5,8,24,0.55)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)'}`,
                    boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.45)' : 'none',
                }}>
                <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between" style={{ height: 62 }}>
                    <Link href="/"><Image src={Logo} alt="Mintex Staffing" width={155} height={22} priority /></Link>
                    <div className="flex items-center gap-4">
                        <Link href="/"
                            className="hidden sm:flex items-center gap-1.5 text-[13px] font-medium transition-colors duration-200"
                            style={{ color: 'rgba(160,178,205,0.5)', fontFamily: GF }}
                            onMouseEnter={e => (e.currentTarget.style.color = C.cyanText)}
                            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(160,178,205,0.5)')}>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Home
                        </Link>
                        <span className="text-[11px] font-bold px-3 py-1 rounded-full"
                            style={{ background: C.coralDim, border: `1px solid ${C.coralBdr}`, color: C.coral, fontFamily: GF }}>
                            Careers
                        </span>
                    </div>
                </div>
            </header>

            {/* PAGE */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 relative z-10" style={{ paddingTop: 78, paddingBottom: 100 }}>

                {/* Page header */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 py-7"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                        <div className="flex items-center gap-2.5 mb-2">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.coral, boxShadow: `0 0 8px ${C.coral}` }} />
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: C.coral, fontFamily: GF }}>Open Positions</span>
                        </div>
                        <h1 className="font-black leading-tight" style={{ fontFamily: GF, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
                            <span style={{ background: `linear-gradient(120deg, #ffffff 0%, #d4f8ff 55%, ${C.cyan} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                Find Your Next Role
                            </span>
                        </h1>
                        <p className="text-sm mt-1.5" style={{ color: 'rgba(160,178,205,0.45)', fontFamily: GF }}>
                            Select one or more positions and apply in a single step.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {!loading && (
                            <span className="text-sm font-medium" style={{ color: 'rgba(160,178,205,0.4)', fontFamily: GF }}>
                                {filteredJobs.length}{totalCount !== null ? ` of ${totalCount}` : ''} position{filteredJobs.length !== 1 ? 's' : ''}
                            </span>
                        )}
                        {usingDummy && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium"
                                style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.18)', color: '#FCD34D', fontFamily: GF }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                Sample data
                            </span>
                        )}
                    </div>
                </motion.div>

                {/* ── FILTER BAR ── */}
                {!loading && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="flex flex-col sm:flex-row gap-3 mt-5 mb-1">

                        {/* Search */}
                        <div className="relative flex-1 min-w-0">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                                style={{ color: 'rgba(160,178,205,0.35)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by title, skill, or location…"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all duration-200"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#e8f0ff', fontFamily: GF }}
                                onFocus={e => { e.target.style.borderColor = C.cyanBdr; e.target.style.boxShadow = `0 0 0 3px rgba(87,238,255,0.05)`; }}
                                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>

                        {/* Filter pills row */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Job Type */}
                            {jobTypes.length > 2 && (
                                <FilterSelect
                                    label="Type"
                                    value={filterType}
                                    options={jobTypes}
                                    onChange={setFilterType}
                                    active={filterType !== 'All'}
                                />
                            )}
                            {/* Remote */}
                            {remoteOpts.length > 2 && (
                                <FilterSelect
                                    label="Work Mode"
                                    value={filterRemote}
                                    options={remoteOpts}
                                    onChange={setFilterRemote}
                                    active={filterRemote !== 'All'}
                                />
                            )}
                            {/* Experience */}
                            {expOpts.length > 2 && (
                                <FilterSelect
                                    label="Experience"
                                    value={filterExp}
                                    options={expOpts}
                                    onChange={setFilterExp}
                                    active={filterExp !== 'All'}
                                />
                            )}

                            {/* Quick filter pills for work mode */}
                            {remoteOpts.length <= 2 && ['All', 'Remote', 'Hybrid', 'On-site'].map(opt => (
                                <button key={opt}
                                    onClick={() => setFilterRemote(opt)}
                                    className="px-3 py-2 rounded-xl text-[11px] font-bold transition-all duration-200"
                                    style={{
                                        background: filterRemote === opt ? C.cyanDim : 'rgba(255,255,255,0.04)',
                                        border: `1px solid ${filterRemote === opt ? C.cyanBdr : 'rgba(255,255,255,0.08)'}`,
                                        color: filterRemote === opt ? C.cyanText : 'rgba(160,178,205,0.5)',
                                        fontFamily: GF,
                                    }}>
                                    {opt}
                                </button>
                            ))}

                            {/* Clear */}
                            <AnimatePresence>
                                {activeFilters > 0 && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
                                        onClick={clearFilters}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all duration-200"
                                        style={{ background: C.coralDim, border: `1px solid ${C.coralBdr}`, color: C.coral, fontFamily: GF }}>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Clear ({activeFilters})
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="relative w-10 h-10 mb-4">
                            <div className="absolute inset-0 rounded-full" style={{ border: `1px solid ${C.coralDim}` }} />
                            <div className="absolute inset-0 rounded-full animate-spin" style={{ border: '1.5px solid transparent', borderTopColor: C.coral }} />
                        </div>
                        <p className="text-xs tracking-[0.2em] uppercase" style={{ color: 'rgba(160,178,205,0.4)', fontFamily: GF }}>Loading positions…</p>
                    </div>
                )}

                {/* GRID */}
                {!loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>

                        {filteredJobs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24">
                                <svg className="w-10 h-10 mb-3" style={{ color: 'rgba(160,178,205,0.2)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm font-semibold mb-1" style={{ color: 'rgba(160,178,205,0.35)', fontFamily: GF }}>No positions match your filters</p>
                                <button onClick={clearFilters} className="text-xs font-bold mt-2" style={{ color: C.coral, fontFamily: GF }}>Clear filters</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
                                {filteredJobs.map((job, index) => {
                                    const rc  = REMOTE_COLORS[job.remote_job] ?? REMOTE_COLORS['On-site'];
                                    const sel = selectedCodes.has(job.job_code);
                                    return (
                                        <motion.div
                                            key={job.job_code || index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                            onClick={() => openDetail(job)}
                                            className="cursor-pointer rounded-2xl relative overflow-hidden group"
                                            style={{
                                                background: sel ? 'rgba(255,87,88,0.06)' : 'rgba(255,255,255,0.025)',
                                                border: `1.5px solid ${sel ? C.coralBdr : 'rgba(255,255,255,0.07)'}`,
                                                backdropFilter: 'blur(16px)',
                                                boxShadow: sel ? `0 0 0 1px rgba(255,87,88,0.08), 0 4px 24px rgba(255,87,88,0.07)` : 'none',
                                                transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
                                            }}
                                            onMouseEnter={e => {
                                                if (!sel) {
                                                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(87,238,255,0.2)';
                                                    (e.currentTarget as HTMLElement).style.background   = 'rgba(255,255,255,0.04)';
                                                    (e.currentTarget as HTMLElement).style.boxShadow    = '0 8px 36px rgba(0,0,0,0.35)';
                                                }
                                            }}
                                            onMouseLeave={e => {
                                                if (!sel) {
                                                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                                                    (e.currentTarget as HTMLElement).style.background   = 'rgba(255,255,255,0.025)';
                                                    (e.currentTarget as HTMLElement).style.boxShadow    = 'none';
                                                }
                                            }}>

                                            {/* Top shimmer */}
                                            <div className="absolute top-0 left-0 right-0 h-px transition-all duration-300"
                                                style={{ background: sel ? `linear-gradient(90deg, transparent, ${C.coral}88, transparent)` : `linear-gradient(90deg, transparent, ${C.cyan}00, transparent)` }}
                                            />
                                            <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                style={{ background: `linear-gradient(90deg, transparent, ${C.cyan}55, transparent)`, display: sel ? 'none' : undefined }} />

                                            <div className="p-5">
                                                {/* Header */}
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div className="flex-1 min-w-0">
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
                                                        <h3 className="text-base font-black leading-snug" style={{ fontFamily: GF, color: sel ? '#ffdede' : '#f0f4ff' }}>
                                                            {job.job_title}
                                                        </h3>
                                                    </div>

                                                    {/* Checkbox */}
                                                    <div
                                                        onClick={e => toggleSelect(job.job_code, e)}
                                                        className="w-6 h-6 rounded-lg flex-shrink-0 mt-1 flex items-center justify-center cursor-pointer"
                                                        style={{
                                                            background: sel ? C.coral : 'rgba(255,255,255,0.05)',
                                                            border: `1.5px solid ${sel ? C.coral : 'rgba(255,255,255,0.15)'}`,
                                                            boxShadow: sel ? `0 0 14px ${C.coral}80` : 'none',
                                                            transition: 'all 0.18s ease',
                                                            flexShrink: 0,
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
                                                        <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
                                                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(205,220,240,0.65)', fontFamily: GF }}>
                                                            {job.job_type}
                                                        </span>
                                                    )}
                                                    {job.remote_job && (
                                                        <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-semibold"
                                                            style={{ background: rc.bg, border: `1px solid ${rc.border}`, color: rc.color, fontFamily: GF }}>
                                                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: rc.dot }} />
                                                            {job.remote_job}
                                                        </span>
                                                    )}
                                                    {job.experience && (
                                                        <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
                                                            style={{ background: 'rgba(155,92,246,0.1)', border: '1px solid rgba(155,92,246,0.2)', color: '#C4A8FF', fontFamily: GF }}>
                                                            {job.experience}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="grid grid-cols-2 gap-x-3 gap-y-3 mb-4">
                                                    {[
                                                        { label: 'Location', value: fmtLocation(job), d: 'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z' },
                                                        { label: 'Salary',   value: fmtPay(job),      d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', accent: true },
                                                        { label: 'Posted',   value: fmtDate(job.career_portal_published_date), d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                                                        { label: 'State',    value: job.states || 'N/A', d: 'M3 21l1.9-5.7a8.5 8.5 0 113.8 3.8z' },
                                                    ].map(({ label, value, d, accent }) => (
                                                        <div key={label} className="flex items-center gap-2 min-w-0">
                                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                                                style={{ background: 'rgba(87,238,255,0.05)', border: '1px solid rgba(87,238,255,0.1)' }}>
                                                                <svg className="w-3.5 h-3.5" style={{ color: C.cyan }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={d} />
                                                                </svg>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: 'rgba(150,165,190,0.4)', fontFamily: GF }}>{label}</p>
                                                                <p className="text-[12px] font-semibold truncate" style={{ color: accent ? '#a3e8f0' : 'rgba(200,215,235,0.75)', fontFamily: GF }}>{value}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Skills */}
                                                {job.primary_skills && (
                                                    <div className="flex flex-wrap gap-1.5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                        {job.primary_skills.split(',').slice(0, 4).map((s, i) => (
                                                            <span key={i} className="text-[10px] px-2.5 py-1 rounded-lg font-medium"
                                                                style={{ background: 'rgba(87,238,255,0.05)', border: '1px solid rgba(87,238,255,0.1)', color: 'rgba(135,220,235,0.6)', fontFamily: GF }}>
                                                                {s.trim()}
                                                            </span>
                                                        ))}
                                                        {job.primary_skills.split(',').length > 4 && (
                                                            <span className="text-[10px] px-2 py-1 font-medium" style={{ color: 'rgba(160,178,205,0.35)', fontFamily: GF }}>
                                                                +{job.primary_skills.split(',').length - 4} more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Bottom strip */}
                                            <div className="px-5 py-3 flex items-center justify-between"
                                                style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)' }}>
                                                <span className="text-[11px] font-semibold" style={{ color: 'rgba(160,178,205,0.4)', fontFamily: GF }}>
                                                    View full description
                                                </span>
                                                <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" style={{ color: 'rgba(87,238,255,0.4)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination */}
                        {filteredJobs.length > 0 && (
                            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <span className="text-sm" style={{ color: 'rgba(160,178,205,0.35)', fontFamily: GF }}>
                                    Showing {filteredJobs.length}{totalCount !== null ? ` of ${totalCount}` : ''} · Page {currentPage}
                                </span>
                                <div className="flex gap-2">
                                    {[
                                        { label: '← Prev', action: () => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }, disabled: currentPage === 1 },
                                        { label: 'Next →', action: () => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }, disabled: !hasMore },
                                    ].map(({ label, action, disabled }) => (
                                        <button key={label} onClick={action} disabled={disabled}
                                            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                                            style={{
                                                background: disabled ? 'rgba(255,255,255,0.02)' : C.cyanDim,
                                                border: `1px solid ${disabled ? 'rgba(255,255,255,0.04)' : C.cyanBdr}`,
                                                color: disabled ? 'rgba(255,255,255,0.15)' : C.cyanText,
                                                cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: GF,
                                            }}>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* ── FLOATING APPLY BAR ── */}
            <AnimatePresence>
                {selectedCodes.size > 0 && !isApplyOpen && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4">
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
                                    <span className="text-sm font-black" style={{ color: C.coral, fontFamily: GF }}>{selectedCodes.size}</span>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(160,178,205,0.45)', fontFamily: GF }}>Selected</p>
                                    <p className="text-sm font-bold text-white leading-tight" style={{ fontFamily: GF }}>
                                        {selectedCodes.size} role{selectedCodes.size !== 1 ? 's' : ''} chosen
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                    onClick={openApply}
                                    className="px-6 py-2.5 rounded-xl font-black text-sm tracking-wider uppercase"
                                    style={{ background: `linear-gradient(135deg, ${C.coral}, #ff8a8a)`, color: '#fff', boxShadow: `0 0 24px ${C.coral}66`, fontFamily: GF }}>
                                    Apply Now
                                </motion.button>
                                <button onClick={() => setSelectedCodes(new Set())}
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

            {/* ── JOB DETAIL MODAL ── */}
            <AnimatePresence>
                {detailJob && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ backdropFilter: 'blur(24px)', background: 'rgba(2,5,16,0.88)' }}
                        onClick={e => { if (e.target === e.currentTarget) closeDetail(); }}>
                        <motion.div
                            initial={{ scale: 0.94, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.96, opacity: 0, y: 12 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                            className="max-w-2xl w-full max-h-[90vh] rounded-3xl overflow-hidden"
                            style={{
                                background: 'rgba(4,8,22,0.99)',
                                border: '1px solid rgba(87,238,255,0.15)',
                                boxShadow: `0 0 80px rgba(87,238,255,0.05), 0 40px 80px rgba(0,0,0,0.7)`,
                            }}>

                            <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${C.cyan}88, transparent)` }} />

                            <div className="overflow-y-auto max-h-[90vh] hide-scrollbar">
                                {/* Header */}
                                <div className="sticky top-0 z-10 px-7 py-5 flex items-start justify-between"
                                    style={{ background: 'rgba(4,8,22,0.98)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div>
                                        <div className="flex items-center gap-2.5 mb-1.5">
                                            <span className="font-mono text-[10px] px-2 py-0.5 rounded"
                                                style={{ background: 'rgba(87,238,255,0.07)', color: 'rgba(87,238,255,0.6)', border: '1px solid rgba(87,238,255,0.14)' }}>
                                                {detailJob.job_code}
                                            </span>
                                            {detailJob.job_status === 'Open' && (
                                                <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: '#6EE7B7', fontFamily: GF }}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                    Actively Hiring
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="font-black" style={{ fontFamily: GF, fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', color: '#f0f4ff', lineHeight: 1.25 }}>
                                            {detailJob.job_title}
                                        </h2>
                                    </div>
                                    <button onClick={closeDetail}
                                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0 ml-4"
                                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(190,205,225,0.4)' }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = 'rgba(190,205,225,0.4)'; }}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="px-7 py-6">
                                    {/* Badges */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {detailJob.job_type && (
                                            <span className="text-[12px] px-3 py-1.5 rounded-full font-semibold"
                                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(210,225,245,0.7)', fontFamily: GF }}>
                                                {detailJob.job_type}
                                            </span>
                                        )}
                                        {detailJob.remote_job && (() => { const rc = REMOTE_COLORS[detailJob.remote_job] ?? REMOTE_COLORS['On-site']; return (
                                            <span className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full font-semibold"
                                                style={{ background: rc.bg, border: `1px solid ${rc.border}`, color: rc.color, fontFamily: GF }}>
                                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: rc.dot }} />
                                                {detailJob.remote_job}
                                            </span>
                                        ); })()}
                                        {detailJob.experience && (
                                            <span className="text-[12px] px-3 py-1.5 rounded-full font-semibold"
                                                style={{ background: 'rgba(155,92,246,0.1)', border: '1px solid rgba(155,92,246,0.2)', color: '#C4A8FF', fontFamily: GF }}>
                                                {detailJob.experience}
                                            </span>
                                        )}
                                    </div>

                                    {/* Info grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl mb-6"
                                        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        {[
                                            { label: 'Location', value: fmtLocation(detailJob), d: 'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z' },
                                            { label: 'Salary',   value: fmtPay(detailJob),      d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', accent: true },
                                            { label: 'Posted',   value: fmtDate(detailJob.career_portal_published_date), d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                                            { label: 'State',    value: detailJob.states || 'N/A', d: 'M3 21l1.9-5.7a8.5 8.5 0 113.8 3.8z' },
                                        ].map(({ label, value, d, accent }) => (
                                            <div key={label} className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                                    style={{ background: 'rgba(87,238,255,0.06)', border: '1px solid rgba(87,238,255,0.1)' }}>
                                                    <svg className="w-4 h-4" style={{ color: C.cyan }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={d} />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: 'rgba(150,165,190,0.4)', fontFamily: GF }}>{label}</p>
                                                    <p className="text-[12px] font-semibold" style={{ color: accent ? '#a3e8f0' : 'rgba(200,215,235,0.8)', fontFamily: GF }}>{value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Key Skills — above description */}
                                    {detailJob.primary_skills && (
                                        <div className="mb-6">
                                            <h3 className="font-black text-[11px] uppercase tracking-widest mb-3"
                                                style={{ color: 'rgba(160,178,205,0.45)', fontFamily: GF, letterSpacing: '0.15em' }}>
                                                Key Skills
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {detailJob.primary_skills.split(',').map((s, i) => (
                                                    <span key={i} className="text-[12px] px-3 py-1.5 rounded-lg font-semibold"
                                                        style={{ background: 'rgba(87,238,255,0.06)', border: '1px solid rgba(87,238,255,0.12)', color: 'rgba(135,220,235,0.75)', fontFamily: GF }}>
                                                        {s.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Description */}
                                    <div className="mb-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        <h3 className="font-black text-[11px] uppercase tracking-widest mb-4"
                                            style={{ color: 'rgba(160,178,205,0.45)', fontFamily: GF, letterSpacing: '0.15em' }}>
                                            About This Role
                                        </h3>
                                        <div className="space-y-3" style={{ fontSize: '0.875rem', lineHeight: 1.75, fontFamily: GF }}>
                                            {(detailJob.public_job_description || detailJob.job_description || 'No description available.')
                                                .split('\n').map((line, i) => {
                                                    const t = line.trim();
                                                    if (!t) return null;
                                                    if (t.startsWith('•')) return (
                                                        <div key={i} className="flex gap-3">
                                                            <span className="flex-shrink-0 mt-[7px] w-1.5 h-1.5 rounded-full" style={{ background: C.coral, opacity: 0.65 }} />
                                                            <p style={{ color: 'rgba(200,215,235,0.7)', fontFamily: GF }}>{t.slice(1).trim()}</p>
                                                        </div>
                                                    );
                                                    if (t.endsWith(':')) return (
                                                        <p key={i} className="font-bold pt-1" style={{ color: '#e8eeff', fontFamily: GF, fontSize: '0.9rem' }}>{t}</p>
                                                    );
                                                    return <p key={i} style={{ color: 'rgba(200,215,235,0.7)', fontFamily: GF }}>{t}</p>;
                                                })}
                                        </div>
                                    </div>

                                    {/* Apply CTA */}
                                    <div className="pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                            onClick={() => applyFromDetail(detailJob)}
                                            className="w-full py-4 rounded-2xl font-black text-sm tracking-widest uppercase"
                                            style={{
                                                background: `linear-gradient(135deg, ${C.coral} 0%, #ff8181 100%)`,
                                                color: '#fff',
                                                boxShadow: `0 0 36px ${C.coral}44, 0 8px 24px rgba(255,87,88,0.18)`,
                                                fontFamily: GF,
                                                letterSpacing: '0.1em',
                                            }}>
                                            Apply for This Position
                                        </motion.button>
                                        <p className="text-center text-xs mt-2.5" style={{ color: 'rgba(160,178,205,0.35)', fontFamily: GF }}>
                                            Takes less than 2 minutes
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── APPLY MODAL ── */}
            <AnimatePresence>
                {isApplyOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
                        className="fixed inset-0 flex items-center justify-center z-50 p-4"
                        style={{ backdropFilter: 'blur(24px)', background: 'rgba(2,5,16,0.9)' }}
                        onClick={e => { if (e.target === e.currentTarget) closeApply(); }}>
                        <motion.div
                            initial={{ scale: 0.94, opacity: 0, y: 16 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.96, opacity: 0, y: 8 }}
                            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                            className="max-w-xl w-full max-h-[92vh] overflow-hidden rounded-3xl"
                            style={{
                                background: 'rgba(4,8,22,0.99)',
                                border: `1px solid ${C.coralBdr}`,
                                boxShadow: `0 0 80px rgba(255,87,88,0.07), 0 40px 80px rgba(0,0,0,0.7)`,
                            }}>

                            <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${C.coral}, transparent)` }} />

                            <div className="overflow-y-auto max-h-[92vh] hide-scrollbar">
                                {/* Header */}
                                <div className="sticky top-0 z-10 flex justify-between items-center px-7 py-5"
                                    style={{ background: 'rgba(4,8,22,0.99)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div>
                                        <h2 className="text-lg font-black" style={{ color: '#f0f4ff', fontFamily: GF }}>Apply for Position{selectedJobs.length > 1 ? 's' : ''}</h2>
                                        <p className="text-[12px] mt-0.5 font-medium" style={{ color: 'rgba(160,178,205,0.5)', fontFamily: GF }}>
                                            {selectedJobs.length} role{selectedJobs.length !== 1 ? 's' : ''} selected
                                        </p>
                                    </div>
                                    <button onClick={closeApply}
                                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
                                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(190,205,225,0.4)' }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = 'rgba(190,205,225,0.4)'; }}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="px-7 pt-5 pb-7">
                                    <AnimatePresence>
                                        {submitStatus && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                                className="mb-5 p-4 rounded-xl overflow-hidden"
                                                style={{ background: submitStatus.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(255,87,88,0.08)', border: `1px solid ${submitStatus.type === 'success' ? 'rgba(16,185,129,0.22)' : C.coralBdr}` }}>
                                                <p className="text-sm font-semibold" style={{ color: submitStatus.type === 'success' ? '#6EE7B7' : '#FFB3B3', fontFamily: GF }}>
                                                    {submitStatus.message}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Selected roles list */}
                                    <div className="mb-6 p-4 rounded-2xl" style={{ background: C.coralDim, border: `1px solid ${C.coralBdr}` }}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: C.coral, boxShadow: `0 0 6px ${C.coral}` }} />
                                            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: C.coral, fontFamily: GF }}>
                                                {selectedJobs.length} role{selectedJobs.length !== 1 ? 's' : ''} selected
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            {selectedJobs.map(job => (
                                                <div key={job.job_code} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                    <span className="font-mono text-[10px] flex-shrink-0 px-2 py-0.5 rounded"
                                                        style={{ background: 'rgba(87,238,255,0.07)', color: 'rgba(87,238,255,0.55)', border: '1px solid rgba(87,238,255,0.14)' }}>
                                                        {job.job_code}
                                                    </span>
                                                    <span className="text-sm font-semibold flex-1 truncate" style={{ color: 'rgba(200,215,235,0.85)', fontFamily: GF }}>{job.job_title}</span>
                                                    <span className="text-[10px] font-medium flex-shrink-0" style={{ color: 'rgba(160,178,205,0.45)', fontFamily: GF }}>{fmtLocation(job)}</span>
                                                    <button
                                                        onClick={() => setSelectedCodes(prev => { const s = new Set(prev); s.delete(job.job_code); return s; })}
                                                        className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-all duration-150"
                                                        style={{ color: 'rgba(255,100,100,0.4)', background: 'transparent' }}
                                                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = C.coral; (e.currentTarget as HTMLElement).style.background = C.coralDim; }}
                                                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,100,100,0.4)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {[
                                                { id: 'name',  label: 'Full Name',     type: 'text',  ph: 'John Doe' },
                                                { id: 'email', label: 'Email Address', type: 'email', ph: 'john@example.com' },
                                            ].map(({ id, label, type, ph }) => (
                                                <div key={id}>
                                                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-2"
                                                        style={{ color: 'rgba(160,178,205,0.5)', fontFamily: GF }}>
                                                        {label} <span style={{ color: C.coral }}>*</span>
                                                    </label>
                                                    <input type={type} id={id} name={id}
                                                        value={formData[id as 'name' | 'email']}
                                                        onChange={handleInputChange} placeholder={ph}
                                                        className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all duration-200"
                                                        style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${formErrors[id] ? C.coralBdr : 'rgba(255,255,255,0.09)'}`, color: '#e8f0ff', fontFamily: GF }}
                                                        onFocus={e => { e.target.style.borderColor = C.coralBdr; e.target.style.boxShadow = `0 0 0 3px rgba(255,87,88,0.06)`; }}
                                                        onBlur={e => { e.target.style.borderColor = formErrors[id] ? C.coralBdr : 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none'; }} />
                                                    {formErrors[id] && <p className="mt-1.5 text-xs" style={{ color: '#FFB3B3', fontFamily: GF }}>{formErrors[id]}</p>}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-wider mb-2"
                                                    style={{ color: 'rgba(160,178,205,0.5)', fontFamily: GF }}>
                                                    Contact Number <span style={{ color: C.coral }}>*</span>
                                                </label>
                                                <div className="flex rounded-xl overflow-hidden"
                                                    style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${formErrors.contactNo ? C.coralBdr : 'rgba(255,255,255,0.09)'}` }}>
                                                    <select name="countryCode" value={formData.countryCode} onChange={handleInputChange}
                                                        className="px-3 py-3 text-sm focus:outline-none cursor-pointer"
                                                        style={{ background: C.coralDim, borderRight: '1px solid rgba(255,255,255,0.07)', color: C.coral, fontFamily: GF, appearance: 'none', minWidth: 64 }}>
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
                                                <label className="block text-[10px] font-bold uppercase tracking-wider mb-2"
                                                    style={{ color: 'rgba(160,178,205,0.5)', fontFamily: GF }}>
                                                    Current Location <span style={{ color: C.coral }}>*</span>
                                                </label>
                                                <input type="text" name="currentLocation" value={formData.currentLocation} onChange={handleInputChange}
                                                    placeholder="City, State"
                                                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all duration-200"
                                                    style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${formErrors.currentLocation ? C.coralBdr : 'rgba(255,255,255,0.09)'}`, color: '#e8f0ff', fontFamily: GF }}
                                                    onFocus={e => { e.target.style.borderColor = C.coralBdr; e.target.style.boxShadow = `0 0 0 3px rgba(255,87,88,0.06)`; }}
                                                    onBlur={e => { e.target.style.borderColor = formErrors.currentLocation ? C.coralBdr : 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none'; }} />
                                                {formErrors.currentLocation && <p className="mt-1.5 text-xs" style={{ color: '#FFB3B3', fontFamily: GF }}>{formErrors.currentLocation}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-wider mb-2"
                                                style={{ color: 'rgba(160,178,205,0.5)', fontFamily: GF }}>
                                                Resume <span style={{ color: C.coral }}>*</span>
                                            </label>
                                            <label className="flex flex-col items-center justify-center w-full h-28 rounded-xl cursor-pointer transition-all duration-200"
                                                style={{ background: 'rgba(255,255,255,0.02)', border: `1.5px dashed ${formErrors.resume ? C.coralBdr : 'rgba(255,87,88,0.15)'}` }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.coralDim; (e.currentTarget as HTMLElement).style.borderColor = C.coralBdr; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; (e.currentTarget as HTMLElement).style.borderColor = formErrors.resume ? C.coralBdr : 'rgba(255,87,88,0.15)'; }}>
                                                <svg className="w-7 h-7 mb-2" style={{ color: 'rgba(255,87,88,0.4)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                <p className="text-sm" style={{ color: 'rgba(160,178,205,0.5)', fontFamily: GF }}>
                                                    <span style={{ color: '#FFB3B3', fontWeight: 700 }}>Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-[10px] mt-1" style={{ color: 'rgba(150,165,185,0.35)', fontFamily: GF }}>PDF, DOC, DOCX — max 5 MB</p>
                                                <input type="file" name="resume" accept=".pdf,.doc,.docx"
                                                    onChange={e => { handleFileChange(e); if (formErrors.resume) setFormErrors(p => { const n = { ...p }; delete n.resume; return n; }); }}
                                                    className="hidden" />
                                            </label>
                                            {formErrors.resume && <p className="mt-1.5 text-xs" style={{ color: '#FFB3B3', fontFamily: GF }}>{formErrors.resume}</p>}
                                            <AnimatePresence>
                                                {formData.resume && (
                                                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
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

                                        <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            <button type="button" onClick={closeApply}
                                                className="px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(185,200,220,0.55)', fontFamily: GF }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.color = '#e8f0ff'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = 'rgba(185,200,220,0.55)'; }}>
                                                Cancel
                                            </button>
                                            <motion.button type="submit" disabled={submitting || selectedJobs.length === 0}
                                                whileHover={submitting ? {} : { scale: 1.02 }} whileTap={submitting ? {} : { scale: 0.98 }}
                                                className="px-8 py-3 rounded-xl text-sm font-black tracking-wider uppercase flex items-center gap-2"
                                                style={{
                                                    background: submitting ? C.coralDim : `linear-gradient(135deg, ${C.coral}, #ff8181)`,
                                                    color: submitting ? C.coral : '#fff',
                                                    boxShadow: submitting ? 'none' : `0 0 24px ${C.coral}50`,
                                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                                    border: submitting ? `1px solid ${C.coralBdr}` : 'none',
                                                    fontFamily: GF,
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

// Small reusable filter select
const FilterSelect = ({ label, value, options, onChange, active }: {
    label: string; value: string; options: string[];
    onChange: (v: string) => void; active: boolean;
}) => (
    <div className="relative">
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className="appearance-none pl-3 pr-7 py-2 rounded-xl text-[11px] font-bold focus:outline-none cursor-pointer transition-all duration-200"
            style={{
                background: active ? 'rgba(87,238,255,0.08)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${active ? 'rgba(87,238,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
                color: active ? '#7ED6E6' : 'rgba(160,178,205,0.6)',
                fontFamily: 'var(--font-gilroy)',
            }}>
            {options.map(o => <option key={o} value={o} style={{ background: '#06091e' }}>{o === 'All' ? `${label}: All` : o}</option>)}
        </select>
        <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none"
            style={{ color: active ? '#7ED6E6' : 'rgba(160,178,205,0.4)' }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
    </div>
);

export default JobsClient;

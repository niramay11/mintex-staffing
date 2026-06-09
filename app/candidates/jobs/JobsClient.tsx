"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Logo from '../../../public/logo.svg';
import ApplyView from './ApplyView';

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
    industry?: string;
    work_authorization?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiResponse = Job[] | { results: Job[]; count?: number; next?: string } | Record<string, any>;

// Mirror admin panel Active filter: job_status === "Active" + modified within 6 months
const SIX_MONTHS_AGO = new Date();
SIX_MONTHS_AGO.setMonth(SIX_MONTHS_AGO.getMonth() - 6);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isActiveJob = (j: Job): boolean => {
    if (String(j.job_status ?? '').trim() !== 'Active') return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const modStr = String(((j as any).Modified ?? (j as any).modified) ?? '').trim();
    if (modStr && modStr !== 'null' && modStr !== 'None') {
        const d = new Date(modStr);
        if (!isNaN(d.getTime()) && d < SIX_MONTHS_AGO) return false;
    }
    return true;
};


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

// Strip HTML tags and decode common entities for plain-text previews
const stripHtml = (html: string): string =>
    html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();

// ── FilterSection ────────────────────────────────────────────────────────────
const FilterSection = ({ label, options, selected, onToggle, defaultExpanded = true }: {
    label: string; options: string[]; selected: Set<string>;
    onToggle: (v: string) => void; defaultExpanded?: boolean;
}) => {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const activeCount = options.filter(o => selected.has(o)).length;
    return (
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <button onClick={() => setExpanded(p => !p)}
                className="w-full flex items-center justify-between px-5 py-4 text-left">
                <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold" style={{ color: '#e8eeff', fontFamily: GF }}>{label}</span>
                    {activeCount > 0
                        ? <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full" style={{ background: C.coralDim, color: C.coral, border: `1px solid ${C.coralBdr}` }}>{activeCount}</span>
                        : options.length > 0 && <span className="text-[10px] font-semibold" style={{ color: 'rgba(160,178,205,0.3)' }}>({options.length})</span>
                    }
                </div>
                <svg className="w-4 h-4 transition-transform duration-200 flex-shrink-0"
                    style={{ color: 'rgba(160,178,205,0.4)', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                        <div className="pb-3 px-5 space-y-1 max-h-52 overflow-y-auto hide-scrollbar">
                            {options.map(opt => {
                                const checked = selected.has(opt);
                                return (
                                    <label key={opt} className="flex items-center gap-3 py-1.5 cursor-pointer" onClick={() => onToggle(opt)}>
                                        <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all duration-150"
                                            style={{
                                                background: checked ? C.coral : 'rgba(255,255,255,0.04)',
                                                border: `1.5px solid ${checked ? C.coral : 'rgba(255,255,255,0.15)'}`,
                                                boxShadow: checked ? `0 0 8px ${C.coral}60` : 'none',
                                            }}>
                                            {checked && <svg className="w-2.5 h-2.5" style={{ color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                                            </svg>}
                                        </div>
                                        <span className="text-[13px] transition-colors duration-150" style={{ color: checked ? '#e8eeff' : 'rgba(160,178,205,0.65)', fontFamily: GF }}>
                                            {opt}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ── Job Detail Page View ─────────────────────────────────────────────────────
const JobDetailView = ({ job, onBack, onApply }: { job: Job; onBack: () => void; onApply: (job: Job) => void }) => {
    const fmtPay = (j: Job) => {
        const r = (j.pay_rate___salary || '').trim();
        if (!r) return null;
        if (/[a-zA-Z/]/.test(r)) return r;
        const n = parseFloat(r.replace(/[,$\s]/g, ''));
        return isNaN(n) ? r : `$${n.toLocaleString()}${n < 500 ? '/hr' : '/yr'}`;
    };
    const fmtDate = (s: string) => {
        if (!s) return null;
        try {
            const d = new Date(s);
            if (isNaN(d.getTime())) return null;
            const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
            if (diff === 0) return 'Today';
            if (diff === 1) return '1 day ago';
            if (diff < 30) return `${diff} days ago`;
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch { return null; }
    };
    const fmtFullDate = (s: string) => {
        if (!s) return 'N/A';
        try {
            const d = new Date(s);
            return isNaN(d.getTime()) ? s : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        } catch { return s; }
    };

    const descText = job.public_job_description || job.job_description || '';
    const rc = REMOTE_COLORS[job.remote_job] ?? REMOTE_COLORS['On-site'];
    const posted = fmtDate(job.career_portal_published_date);
    const pay = fmtPay(job);

    // Detect if the description is HTML
    const isHtml = (s: string) => /<[a-z][\s\S]*>/i.test(s);

    const renderDescription = (text: string) => {
        if (!text) return <p style={{ color: 'rgba(200,215,235,0.6)', fontFamily: GF }}>No description available.</p>;

        if (isHtml(text)) {
            return (
                <div
                    className="jd-html"
                    dangerouslySetInnerHTML={{ __html: text }}
                    style={{ color: 'rgba(200,215,235,0.78)', fontFamily: GF, fontSize: '0.875rem', lineHeight: 1.75 }}
                />
            );
        }

        // Plain-text fallback
        const lines = text.split('\n');
        const elements: React.ReactNode[] = [];
        lines.forEach((line, i) => {
            const t = line.trim();
            if (!t) { elements.push(<div key={i} className="h-2" />); return; }
            if (t.startsWith('•') || t.startsWith('-')) {
                elements.push(
                    <div key={i} className="flex gap-3 items-start">
                        <span className="flex-shrink-0 mt-[9px] w-1.5 h-1.5 rounded-full" style={{ background: C.coral, opacity: 0.7 }} />
                        <p className="text-sm leading-relaxed" style={{ color: 'rgba(200,215,235,0.75)', fontFamily: GF }}>{t.slice(1).trim()}</p>
                    </div>
                );
            } else if (t.endsWith(':') || (t.length < 80 && /^[A-Z][^a-z]{4,}$/.test(t))) {
                elements.push(
                    <p key={i} className="text-sm font-black mt-3" style={{ color: '#e8eeff', fontFamily: GF }}>{t}</p>
                );
            } else if (t.length < 100 && t.includes(':') && t.indexOf(':') < 35) {
                const colonIdx = t.indexOf(':');
                elements.push(
                    <p key={i} className="text-sm leading-relaxed" style={{ color: 'rgba(200,215,235,0.75)', fontFamily: GF }}>
                        <span style={{ color: '#e8eeff', fontWeight: 700 }}>{t.slice(0, colonIdx + 1)}</span>{t.slice(colonIdx + 1)}
                    </p>
                );
            } else {
                elements.push(
                    <p key={i} className="text-sm leading-relaxed" style={{ color: 'rgba(200,215,235,0.72)', fontFamily: GF }}>{t}</p>
                );
            }
        });
        return <div className="space-y-2">{elements}</div>;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full min-h-[calc(100vh-62px)]"
            style={{ background: 'linear-gradient(160deg, #06091e 0%, #060f28 50%, #030e18 100%)' }}>

            {/* Background grid */}
            <div className="fixed inset-0 pointer-events-none" style={{
                backgroundImage: `linear-gradient(rgba(87,238,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(87,238,255,0.018) 1px, transparent 1px)`,
                backgroundSize: '80px 80px',
            }} />

            <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 relative z-10">

                {/* Back link */}
                <button onClick={onBack}
                    className="flex items-center gap-2 text-sm font-semibold mb-6 transition-colors duration-150 group"
                    style={{ color: 'rgba(160,178,205,0.55)', fontFamily: GF }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = C.cyanText}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(160,178,205,0.55)'}>
                    <svg className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to search results
                </button>

                <div className="flex flex-col lg:flex-row gap-6">

                    {/* ── LEFT: Main content ── */}
                    <div className="flex-1 min-w-0 space-y-5">

                        {/* Job Details card */}
                        <div className="rounded-2xl overflow-hidden"
                            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}>
                            <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${C.cyan}55, transparent)` }} />

                            <div className="px-6 py-5">
                                <div className="flex items-center justify-between gap-4 mb-5">
                                    <h1 className="text-lg font-black" style={{ color: '#e8eeff', fontFamily: GF }}>Job Details</h1>
                                    <div className="flex items-center gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                            onClick={() => onApply(job)}
                                            className="px-6 py-2.5 rounded-xl font-black text-sm tracking-wide"
                                            style={{ background: `linear-gradient(135deg, ${C.coral}, #ff8181)`, color: '#fff', boxShadow: `0 0 20px ${C.coral}44`, fontFamily: GF }}>
                                            Apply
                                        </motion.button>
                                        <button
                                            onClick={() => window.print()}
                                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
                                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(160,178,205,0.5)' }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color = '#e8eeff'; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = 'rgba(160,178,205,0.5)'; }}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Job header */}
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: 'rgba(87,238,255,0.06)', border: '1px solid rgba(87,238,255,0.12)' }}>
                                        <svg className="w-5 h-5" style={{ color: C.cyanText }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                                            <span className="font-mono text-[11px] px-2 py-0.5 rounded"
                                                style={{ background: 'rgba(87,238,255,0.07)', color: 'rgba(87,238,255,0.6)', border: '1px solid rgba(87,238,255,0.14)' }}>
                                                {job.job_code}
                                            </span>
                                            <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: '#6EE7B7' }}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                    Actively Hiring
                                                </span>
                                        </div>
                                        <h2 className="text-xl font-black mb-2" style={{ color: '#f0f4ff', fontFamily: GF, lineHeight: 1.25 }}>
                                            {job.job_code} – {job.job_title}
                                        </h2>
                                        {/* Location */}
                                        <div className="flex items-start gap-1.5 mb-3">
                                            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'rgba(87,238,255,0.5)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="text-sm" style={{ color: 'rgba(160,178,205,0.65)', fontFamily: GF }}>
                                                {job.location || [job.city, job.states, job.zip_code, job.country].filter(Boolean).join(', ')}
                                            </span>
                                        </div>
                                        {/* Meta badges */}
                                        <div className="flex flex-wrap items-center gap-3">
                                            {job.experience && (
                                                <div className="flex items-center gap-1.5">
                                                    <svg className="w-3.5 h-3.5" style={{ color: 'rgba(160,178,205,0.4)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="text-[12px]" style={{ color: 'rgba(160,178,205,0.6)', fontFamily: GF }}>{job.experience}</span>
                                                </div>
                                            )}
                                            {job.job_type && (
                                                <div className="flex items-center gap-1.5">
                                                    <svg className="w-3.5 h-3.5" style={{ color: 'rgba(160,178,205,0.4)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="text-[12px]" style={{ color: 'rgba(160,178,205,0.6)', fontFamily: GF }}>{job.job_type}</span>
                                                </div>
                                            )}
                                            {posted && (
                                                <span className="text-[12px]" style={{ color: 'rgba(160,178,205,0.4)', fontFamily: GF }}>
                                                    Posted {posted}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Job Description card */}
                        <div className="rounded-2xl overflow-hidden"
                            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(16px)' }}>
                            <div className="px-6 py-5">
                                <h2 className="text-base font-black mb-5" style={{ color: '#e8eeff', fontFamily: GF }}>
                                    Job Description
                                </h2>
                                <div className="prose-sm leading-relaxed">
                                    {renderDescription(descText)}
                                </div>
                            </div>
                        </div>

                        {/* Skills card */}
                        {job.primary_skills && (
                            <div className="rounded-2xl overflow-hidden"
                                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(16px)' }}>
                                <div className="px-6 py-5">
                                    <h2 className="text-base font-black mb-4" style={{ color: '#e8eeff', fontFamily: GF }}>Key Skills</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {job.primary_skills.split(',').map((s, i) => (
                                            <span key={i} className="text-[12px] px-3 py-1.5 rounded-lg font-semibold"
                                                style={{ background: 'rgba(87,238,255,0.06)', border: '1px solid rgba(87,238,255,0.14)', color: 'rgba(135,220,235,0.8)', fontFamily: GF }}>
                                                {s.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Apply CTA */}
                        <div className="rounded-2xl px-6 py-5"
                            style={{ background: C.coralDim, border: `1px solid ${C.coralBdr}` }}>
                            <p className="text-sm font-semibold mb-3" style={{ color: 'rgba(200,215,235,0.7)', fontFamily: GF }}>
                                Interested in this position? Submit your application — takes less than 2 minutes.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={() => onApply(job)}
                                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-sm tracking-wide"
                                style={{ background: `linear-gradient(135deg, ${C.coral}, #ff8181)`, color: '#fff', boxShadow: `0 0 28px ${C.coral}44`, fontFamily: GF }}>
                                Apply for This Position
                            </motion.button>
                        </div>
                    </div>

                    {/* ── RIGHT: Job Posting Details sidebar ── */}
                    <div className="lg:w-72 flex-shrink-0">
                        <div className="lg:sticky lg:top-6 space-y-4">
                            <div className="rounded-2xl overflow-hidden"
                                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}>
                                <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                    <h3 className="text-sm font-black" style={{ color: '#e8eeff', fontFamily: GF }}>Job Posting Details</h3>
                                </div>
                                <div className="px-5 py-4 space-y-4">
                                    {[
                                        {
                                            icon: 'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
                                            label: 'Location',
                                            value: [job.city, job.states].filter(Boolean).join(', ') || 'N/A',
                                        },
                                        {
                                            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
                                            label: 'Job Type',
                                            value: job.job_type || 'N/A',
                                        },
                                        {
                                            icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064',
                                            label: 'Work Location',
                                            value: job.remote_job || 'N/A',
                                            badge: rc,
                                        },
                                        {
                                            icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
                                            label: 'Experience',
                                            value: job.experience || 'N/A',
                                        },
                                        ...(pay ? [{
                                            icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                                            label: 'Pay Rate',
                                            value: pay,
                                            accent: true,
                                        }] : []),
                                        {
                                            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
                                            label: 'Posted On',
                                            value: fmtFullDate(job.career_portal_published_date),
                                        },
                                        ...(job.zip_code ? [{
                                            icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
                                            label: 'Zip Code',
                                            value: job.zip_code,
                                        }] : []),
                                        ...(job.industry ? [{
                                            icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
                                            label: 'Industry',
                                            value: job.industry,
                                        }] : []),
                                    ].map(({ icon, label, value, badge, accent }) => (
                                        <div key={label} className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                                style={{ background: 'rgba(87,238,255,0.05)', border: '1px solid rgba(87,238,255,0.1)' }}>
                                                <svg className="w-3.5 h-3.5" style={{ color: C.cyanText }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon} />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[9px] uppercase tracking-wider font-bold mb-0.5" style={{ color: 'rgba(160,178,205,0.35)', fontFamily: GF }}>{label}</p>
                                                {badge ? (
                                                    <span className="inline-flex items-center gap-1.5 text-[12px] px-2 py-0.5 rounded-full font-semibold"
                                                        style={{ background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color, fontFamily: GF }}>
                                                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: badge.dot }} />
                                                        {value}
                                                    </span>
                                                ) : (
                                                    <p className="text-[13px] font-semibold" style={{ color: accent ? '#a3e8f0' : 'rgba(200,215,235,0.8)', fontFamily: GF }}>{value}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quick apply CTA in sidebar */}
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={() => onApply(job)}
                                className="w-full py-3.5 rounded-xl font-black text-sm tracking-wide"
                                style={{ background: `linear-gradient(135deg, ${C.coral}, #ff8181)`, color: '#fff', boxShadow: `0 0 24px ${C.coral}33`, fontFamily: GF }}>
                                Apply Now
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ── Main component ───────────────────────────────────────────────────────────
const JobsClient = () => {
    const [jobs, setJobs]               = useState<Job[]>([]);
    const [loading, setLoading]         = useState(true);
    const [hasMore, setHasMore]         = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [, setTotalCount]   = useState<number | null>(null);
    const [scrolled, setScrolled]       = useState(false);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    // Detail view
    const [detailJob, setDetailJob] = useState<Job | null>(null);

    // Filters (multi-select)
    const [filterTypes, setFilterTypes]             = useState<Set<string>>(new Set());
    const [filterLocations, setFilterLocations]     = useState<Set<string>>(new Set());
    const [filterExperiences, setFilterExperiences] = useState<Set<string>>(new Set());
    const [filterIndustries, setFilterIndustries]   = useState<Set<string>>(new Set());
    const [filterWorkAuths, setFilterWorkAuths]     = useState<Set<string>>(new Set());

    // Search
    const [searchTitle, setSearchTitle] = useState('');
    const [searchZip,   setSearchZip]   = useState('');
    const [appliedTitle, setAppliedTitle] = useState('');
    const [appliedZip,   setAppliedZip]   = useState('');

    // Apply view
    const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
    const [isApplyOpen, setIsApplyOpen]     = useState(false);

    const PAGING_LENGTH = 50;

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const fetchJobs = useCallback(async (page: number) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/jobs?page=${page}&paging_length=${PAGING_LENGTH}`);
            if (!res.ok) throw new Error();
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
            setJobs(list);
            if (list.length >= PAGING_LENGTH) setHasMore(true);
            else if (!('next' in (data as object))) setHasMore(false);
        } catch (err) {
            console.error('[jobs] fetch error:', err);
            setJobs([]);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchJobs(currentPage); }, [currentPage, fetchJobs]);

    // Filter Active jobs client-side — same logic as admin panel
    const activeJobs = useMemo(() => jobs.filter(isActiveJob), [jobs]);

    const jobTypes    = useMemo(() => Array.from(new Set(activeJobs.map(j => j.job_type).filter(Boolean))).sort(), [activeJobs]);
    const locationOpts = useMemo(() => Array.from(new Set(activeJobs.map(j => j.remote_job).filter(Boolean))).sort(), [activeJobs]);
    const expOpts     = useMemo(() => Array.from(new Set(activeJobs.map(j => j.experience).filter(Boolean))).sort(), [activeJobs]);
    const industries  = useMemo(() => Array.from(new Set(activeJobs.map(j => j.industry).filter(Boolean) as string[])).sort(), [activeJobs]);
    const workAuthOpts = useMemo(() => Array.from(new Set(activeJobs.map(j => j.work_authorization).filter(Boolean) as string[])).sort(), [activeJobs]);

    const toggleSet = (setter: React.Dispatch<React.SetStateAction<Set<string>>>, val: string) =>
        setter(prev => { const s = new Set(prev); s.has(val) ? s.delete(val) : s.add(val); return s; });

    const handleSearch = () => { setAppliedTitle(searchTitle); setAppliedZip(searchZip); };
    const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSearch(); };

    const activeFilterCount = filterTypes.size + filterLocations.size + filterExperiences.size + filterIndustries.size + filterWorkAuths.size
        + (appliedTitle.trim() ? 1 : 0) + (appliedZip.trim() ? 1 : 0);

    const clearAllFilters = () => {
        setFilterTypes(new Set()); setFilterLocations(new Set());
        setFilterExperiences(new Set()); setFilterIndustries(new Set());
        setFilterWorkAuths(new Set());
        setSearchTitle(''); setSearchZip('');
        setAppliedTitle(''); setAppliedZip('');
    };

    const filteredJobs = useMemo(() => activeJobs.filter(j => {
        if (filterTypes.size > 0 && !filterTypes.has(j.job_type)) return false;
        if (filterLocations.size > 0 && !filterLocations.has(j.remote_job)) return false;
        if (filterExperiences.size > 0 && !filterExperiences.has(j.experience)) return false;
        if (filterIndustries.size > 0 && j.industry && !filterIndustries.has(j.industry)) return false;
        if (filterWorkAuths.size > 0 && j.work_authorization && !filterWorkAuths.has(j.work_authorization)) return false;
        if (appliedTitle.trim()) {
            const q = appliedTitle.toLowerCase();
            if (!`${j.job_title} ${j.primary_skills} ${j.city} ${j.states} ${j.location}`.toLowerCase().includes(q)) return false;
        }
        if (appliedZip.trim()) {
            const z = appliedZip.trim();
            if (!j.zip_code?.includes(z) && !j.location?.includes(z)) return false;
        }
        return true;
    }), [activeJobs, filterTypes, filterLocations, filterExperiences, filterIndustries, appliedTitle, appliedZip]);

    const fmtDate = (s: string) => {
        if (!s) return null;
        try {
            const d = new Date(s);
            if (isNaN(d.getTime())) return null;
            const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
            if (diff === 0) return 'Today';
            if (diff === 1) return '1 day ago';
            if (diff < 30) return `${diff} days ago`;
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch { return null; }
    };

    const openDetail  = (job: Job) => { setDetailJob(job); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const closeDetail = () => setDetailJob(null);

    const selectedJobs = jobs.filter(j => selectedCodes.has(j.job_code));

    const openApply = (job?: Job) => {
        if (job) setSelectedCodes(prev => new Set([...prev, job.job_code]));
        setIsApplyOpen(true);
        setDetailJob(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const closeApply = () => {
        setIsApplyOpen(false);
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4" style={{ color: C.cyanText }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                    </svg>
                    <span className="font-black text-sm" style={{ color: '#e8eeff', fontFamily: GF }}>Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full" style={{ background: C.coralDim, color: C.coral, border: `1px solid ${C.coralBdr}` }}>{activeFilterCount}</span>
                    )}
                </div>
                {activeFilterCount > 0 && (
                    <button onClick={clearAllFilters} className="text-[11px] font-bold" style={{ color: C.coral, fontFamily: GF }}>Clear all</button>
                )}
            </div>
            <div className="flex-1 overflow-y-auto hide-scrollbar">
                {jobTypes.length > 0    && <FilterSection label="Job Type"           options={jobTypes}      selected={filterTypes}      onToggle={v => toggleSet(setFilterTypes, v)}      defaultExpanded />}
                {locationOpts.length > 0 && <FilterSection label="Work Location"    options={locationOpts}  selected={filterLocations}  onToggle={v => toggleSet(setFilterLocations, v)} defaultExpanded />}
                {workAuthOpts.length > 0 && <FilterSection label="Work Authorization" options={workAuthOpts} selected={filterWorkAuths}  onToggle={v => toggleSet(setFilterWorkAuths, v)} defaultExpanded />}
                {industries.length > 0  && <FilterSection label="Industry"          options={industries}    selected={filterIndustries}  onToggle={v => toggleSet(setFilterIndustries, v)} defaultExpanded={false} />}
                {expOpts.length > 0     && <FilterSection label="Experience"        options={expOpts}       selected={filterExperiences} onToggle={v => toggleSet(setFilterExperiences, v)} defaultExpanded={false} />}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #06091e 0%, #060f28 50%, #030e18 100%)', fontFamily: GF }}>

            <div className="fixed inset-0 pointer-events-none" style={{
                backgroundImage: `linear-gradient(rgba(87,238,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(87,238,255,0.018) 1px, transparent 1px)`,
                backgroundSize: '80px 80px',
            }} />

            {/* NAVBAR */}
            <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
                style={{
                    background: scrolled ? 'rgba(5,8,24,0.97)' : 'rgba(5,8,24,0.55)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)'}`,
                }}>
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex items-center justify-between" style={{ height: 62 }}>
                    <Link href="/"><Image src={Logo} alt="Mintex Staffing" width={155} height={22} priority /></Link>
                    <div className="flex items-center gap-3">
                        {!detailJob && (
                            <button onClick={() => setMobileFiltersOpen(true)}
                                className="lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-bold"
                                style={{ background: activeFilterCount > 0 ? C.coralDim : 'rgba(255,255,255,0.05)', border: `1px solid ${activeFilterCount > 0 ? C.coralBdr : 'rgba(255,255,255,0.08)'}`, color: activeFilterCount > 0 ? C.coral : 'rgba(160,178,205,0.6)', fontFamily: GF }}>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                                </svg>
                                Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                            </button>
                        )}
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

            {/* BODY */}
            <div className="max-w-[1400px] mx-auto relative z-10" style={{ paddingTop: 62 }}>
                <div className="flex min-h-[calc(100vh-62px)] relative">

                    {/* Sidebar */}
                    <aside className="hidden lg:flex flex-col w-72 flex-shrink-0 sticky top-[62px] self-start"
                        style={{ height: 'calc(100vh - 62px)', background: 'rgba(4,8,22,0.6)', borderRight: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)' }}>
                        {!loading ? <SidebarContent /> : (
                            <div className="flex items-center justify-center flex-1">
                                <div className="w-5 h-5 rounded-full animate-spin" style={{ border: '1.5px solid rgba(87,238,255,0.1)', borderTopColor: C.cyan }} />
                            </div>
                        )}
                    </aside>

                    {/* Main content area */}
                    <div className="flex-1 min-w-0">

                        {/* ── APPLY VIEW ── */}
                        <AnimatePresence mode="wait">
                            {isApplyOpen && selectedJobs.length > 0 && (
                                <ApplyView
                                    key="apply"
                                    jobs={selectedJobs}
                                    allJobs={activeJobs}
                                    onBack={closeApply}
                                    onSuccess={() => { closeApply(); setSelectedCodes(new Set()); }}
                                />
                            )}
                        </AnimatePresence>

                        {/* ── JOB DETAIL FULL-PAGE VIEW ── */}
                        <AnimatePresence mode="wait">
                            {!isApplyOpen && detailJob && (
                                <JobDetailView
                                    key={detailJob.job_code}
                                    job={detailJob}
                                    onBack={closeDetail}
                                    onApply={openApply}
                                />
                            )}
                        </AnimatePresence>

                        {/* ── JOB LIST (hidden when detail or apply is open) ── */}
                        <main className="px-4 sm:px-6 lg:px-8 py-6 pb-24" style={{ display: (isApplyOpen || detailJob) ? 'none' : 'block' }}>

                            {/* Heading */}
                            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-5">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.coral, boxShadow: `0 0 8px ${C.coral}` }} />
                                    <span className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: C.coral, fontFamily: GF }}>Open Positions</span>
                                </div>
                                <h1 className="font-black" style={{ fontFamily: GF, fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', lineHeight: 1.2 }}>
                                    <span style={{ background: `linear-gradient(120deg, #ffffff 0%, #d4f8ff 55%, ${C.cyan} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                        Find Your Next Role
                                    </span>
                                </h1>
                            </motion.div>

                            {/* Search bar */}
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.07 }}
                                className="flex flex-col sm:flex-row gap-2 mb-5">
                                <div className="relative flex-1">
                                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'rgba(160,178,205,0.35)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input type="text" placeholder="Search by job title"
                                        value={searchTitle} onChange={e => setSearchTitle(e.target.value)} onKeyDown={handleKeyDown}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none"
                                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#e8f0ff', fontFamily: GF }}
                                        onFocus={e => { e.target.style.borderColor = C.cyanBdr; e.target.style.boxShadow = `0 0 0 3px rgba(87,238,255,0.05)`; }}
                                        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none'; }} />
                                </div>
                                <div className="relative sm:w-44">
                                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'rgba(160,178,205,0.35)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <input type="text" placeholder="Enter Zip Code"
                                        value={searchZip} onChange={e => setSearchZip(e.target.value)} onKeyDown={handleKeyDown}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none"
                                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#e8f0ff', fontFamily: GF }}
                                        onFocus={e => { e.target.style.borderColor = C.cyanBdr; e.target.style.boxShadow = `0 0 0 3px rgba(87,238,255,0.05)`; }}
                                        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none'; }} />
                                </div>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                    onClick={handleSearch}
                                    className="px-7 py-3 rounded-xl font-black text-sm tracking-wide flex-shrink-0"
                                    style={{ background: `linear-gradient(135deg, ${C.coral}, #ff8181)`, color: '#fff', boxShadow: `0 0 20px ${C.coral}44`, fontFamily: GF }}>
                                    Search
                                </motion.button>
                            </motion.div>

                            {/* Results count */}
                            {!loading && (
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-semibold" style={{ color: 'rgba(160,178,205,0.55)', fontFamily: GF }}>
                                        <span style={{ color: '#e8eeff' }}>{filteredJobs.length}</span> active position{filteredJobs.length !== 1 ? 's' : ''} shown
                                    </span>
                                    {(appliedTitle || appliedZip) && (
                                        <button onClick={() => { setSearchTitle(''); setSearchZip(''); setAppliedTitle(''); setAppliedZip(''); }}
                                            className="text-[11px] font-bold flex items-center gap-1" style={{ color: C.coral, fontFamily: GF }}>
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Clear search
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Loading */}
                            {loading && (
                                <div className="flex flex-col items-center justify-center py-32">
                                    <div className="relative w-10 h-10 mb-4">
                                        <div className="absolute inset-0 rounded-full" style={{ border: `1px solid ${C.coralDim}` }} />
                                        <div className="absolute inset-0 rounded-full animate-spin" style={{ border: '1.5px solid transparent', borderTopColor: C.coral }} />
                                    </div>
                                    <p className="text-xs tracking-[0.2em] uppercase" style={{ color: 'rgba(160,178,205,0.4)', fontFamily: GF }}>Loading active positions…</p>
                                </div>
                            )}

                            {/* Grid */}
                            {!loading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
                                    {filteredJobs.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-24">
                                            <svg className="w-10 h-10 mb-3" style={{ color: 'rgba(160,178,205,0.2)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-sm font-semibold mb-1" style={{ color: 'rgba(160,178,205,0.35)', fontFamily: GF }}>No active positions match your filters</p>
                                            <button onClick={clearAllFilters} className="text-xs font-bold mt-2" style={{ color: C.coral, fontFamily: GF }}>Clear filters</button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {filteredJobs.map((job, index) => {
                                                const rc  = REMOTE_COLORS[job.remote_job] ?? REMOTE_COLORS['On-site'];
                                                const sel = selectedCodes.has(job.job_code);
                                                const posted = fmtDate(job.career_portal_published_date);
                                                return (
                                                    <motion.div
                                                        key={job.job_code || index}
                                                        initial={{ opacity: 0, y: 16 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                                        className="rounded-2xl relative overflow-hidden group flex flex-col"
                                                        style={{
                                                            background: sel ? 'rgba(255,87,88,0.05)' : 'rgba(255,255,255,0.025)',
                                                            border: `1.5px solid ${sel ? C.coralBdr : 'rgba(255,255,255,0.07)'}`,
                                                            backdropFilter: 'blur(16px)',
                                                            transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
                                                        }}
                                                        onMouseEnter={e => { if (!sel) { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(87,238,255,0.2)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'; } }}
                                                        onMouseLeave={e => { if (!sel) { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; } }}>

                                                        <div className="absolute top-0 left-0 right-0 h-px"
                                                            style={{ background: sel ? `linear-gradient(90deg,transparent,${C.coral}88,transparent)` : undefined }} />
                                                        <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                            style={{ background: `linear-gradient(90deg,transparent,${C.cyan}55,transparent)`, display: sel ? 'none' : undefined }} />

                                                        <div className="p-5 flex-1">
                                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-1.5">
                                                                        <span className="font-mono text-[10px] px-2 py-0.5 rounded"
                                                                            style={{ background: 'rgba(87,238,255,0.07)', color: 'rgba(87,238,255,0.55)', border: '1px solid rgba(87,238,255,0.14)' }}>
                                                                            {job.job_code}
                                                                        </span>
                                                                        <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: '#6EE7B7' }}>
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                                            Active
                                                                        </span>
                                                                    </div>
                                                                    <h3 className="text-base font-black leading-snug" style={{ fontFamily: GF, color: sel ? '#ffdede' : '#f0f4ff' }}>
                                                                        {job.job_title}
                                                                    </h3>
                                                                </div>
                                                                {/* Checkbox for multi-apply */}
                                                                <div
                                                                    onClick={e => { e.stopPropagation(); const s = new Set(selectedCodes); s.has(job.job_code) ? s.delete(job.job_code) : s.add(job.job_code); setSelectedCodes(s); }}
                                                                    className="w-5 h-5 rounded flex-shrink-0 mt-1.5 flex items-center justify-center cursor-pointer transition-all duration-150"
                                                                    style={{ background: sel ? C.coral : 'rgba(255,255,255,0.05)', border: `1.5px solid ${sel ? C.coral : 'rgba(255,255,255,0.15)'}`, boxShadow: sel ? `0 0 10px ${C.coral}70` : 'none' }}>
                                                                    {sel && <svg className="w-3 h-3" style={{ color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                                                                    </svg>}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-1.5 mb-3">
                                                                <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(87,238,255,0.5)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                                <span className="text-[12px]" style={{ color: 'rgba(160,178,205,0.6)', fontFamily: GF }}>
                                                                    {job.location || [job.city, job.states, job.zip_code].filter(Boolean).join(', ')}
                                                                </span>
                                                            </div>

                                                            {(job.public_job_description || job.job_description) && (
                                                                <p className="text-[12px] leading-relaxed mb-3 line-clamp-2"
                                                                    style={{ color: 'rgba(160,178,205,0.5)', fontFamily: GF }}>
                                                                    {stripHtml(job.public_job_description || job.job_description).slice(0, 160)}
                                                                </p>
                                                            )}

                                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                                {job.experience && (
                                                                    <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-semibold"
                                                                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(200,215,235,0.6)', fontFamily: GF }}>
                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                        </svg>
                                                                        {job.experience}
                                                                    </span>
                                                                )}
                                                                {job.remote_job && (
                                                                    <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-semibold"
                                                                        style={{ background: rc.bg, border: `1px solid ${rc.border}`, color: rc.color, fontFamily: GF }}>
                                                                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: rc.dot }} />
                                                                        {job.remote_job}
                                                                    </span>
                                                                )}
                                                                {job.job_type && (
                                                                    <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
                                                                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(200,215,235,0.55)', fontFamily: GF }}>
                                                                        {job.job_type}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {job.primary_skills && (
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {job.primary_skills.split(',').slice(0, 3).map((s, i) => (
                                                                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md font-medium"
                                                                            style={{ background: 'rgba(87,238,255,0.05)', border: '1px solid rgba(87,238,255,0.1)', color: 'rgba(120,210,225,0.6)', fontFamily: GF }}>
                                                                            {s.trim()}
                                                                        </span>
                                                                    ))}
                                                                    {job.primary_skills.split(',').length > 3 && (
                                                                        <span className="text-[10px] font-medium" style={{ color: 'rgba(160,178,205,0.3)', fontFamily: GF }}>
                                                                            +{job.primary_skills.split(',').length - 3}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="px-5 py-3 flex items-center justify-between flex-shrink-0"
                                                            style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                                                            <span className="text-[11px]" style={{ color: 'rgba(160,178,205,0.35)', fontFamily: GF }}>
                                                                {posted ? `Posted ${posted}` : 'Recently posted'}
                                                            </span>
                                                            <button
                                                                onClick={() => openDetail(job)}
                                                                className="flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-lg transition-all duration-200"
                                                                style={{ background: C.cyanDim, border: `1px solid ${C.cyanBdr}`, color: C.cyanText, fontFamily: GF }}
                                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(87,238,255,0.14)'; }}
                                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.cyanDim; }}>
                                                                View &amp; Apply
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {filteredJobs.length > 0 && (currentPage > 1 || hasMore) && (
                                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                                            <span className="text-sm" style={{ color: 'rgba(160,178,205,0.35)', fontFamily: GF }}>
                                                Page {currentPage} · {filteredJobs.length} positions
                                            </span>
                                            <div className="flex gap-2">
                                                {[
                                                    { label: '← Prev', action: () => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }, disabled: currentPage === 1 },
                                                    { label: 'Next →', action: () => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }, disabled: !hasMore },
                                                ].map(({ label, action, disabled }) => (
                                                    <button key={label} onClick={action} disabled={disabled}
                                                        className="px-5 py-2.5 rounded-xl text-sm font-semibold"
                                                        style={{ background: disabled ? 'rgba(255,255,255,0.02)' : C.cyanDim, border: `1px solid ${disabled ? 'rgba(255,255,255,0.04)' : C.cyanBdr}`, color: disabled ? 'rgba(255,255,255,0.15)' : C.cyanText, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: GF }}>
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </main>
                    </div>
                </div>
            </div>

            {/* Mobile filters drawer */}
            <AnimatePresence>
                {mobileFiltersOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 lg:hidden"
                            style={{ background: 'rgba(2,5,16,0.75)', backdropFilter: 'blur(8px)' }}
                            onClick={() => setMobileFiltersOpen(false)} />
                        <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                            className="fixed left-0 top-0 bottom-0 z-50 w-80 flex flex-col lg:hidden"
                            style={{ background: 'rgba(4,8,22,0.99)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
                                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <span className="font-black text-base" style={{ color: '#e8eeff', fontFamily: GF }}>Filters</span>
                                <button onClick={() => setMobileFiltersOpen(false)}
                                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(160,178,205,0.6)' }}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto hide-scrollbar">
                                <SidebarContent />
                            </div>
                            <div className="px-5 py-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <button onClick={() => setMobileFiltersOpen(false)}
                                    className="w-full py-3 rounded-xl font-black text-sm"
                                    style={{ background: `linear-gradient(135deg, ${C.coral}, #ff8181)`, color: '#fff', fontFamily: GF }}>
                                    Show {filteredJobs.length} Results
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Floating apply bar (multi-select) */}
            <AnimatePresence>
                {selectedCodes.size > 0 && !isApplyOpen && !detailJob && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4">
                        <div className="flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl"
                            style={{ background: 'rgba(4,8,22,0.97)', backdropFilter: 'blur(32px)', border: `1px solid ${C.coralBdr}`, boxShadow: `0 0 40px rgba(255,87,88,0.12), 0 20px 60px rgba(0,0,0,0.6)` }}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: C.coralDim, border: `1px solid ${C.coralBdr}` }}>
                                    <span className="text-sm font-black" style={{ color: C.coral, fontFamily: GF }}>{selectedCodes.size}</span>
                                </div>
                                <p className="text-sm font-bold text-white" style={{ fontFamily: GF }}>{selectedCodes.size} role{selectedCodes.size !== 1 ? 's' : ''} selected</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                    onClick={() => openApply()}
                                    className="px-6 py-2.5 rounded-xl font-black text-sm tracking-wider uppercase"
                                    style={{ background: `linear-gradient(135deg, ${C.coral}, #ff8a8a)`, color: '#fff', boxShadow: `0 0 24px ${C.coral}66`, fontFamily: GF }}>
                                    Apply Now
                                </motion.button>
                                <button onClick={() => setSelectedCodes(new Set())}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(180,190,210,0.4)' }}>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Apply view is rendered inside the main content area above */}
        </div>
    );
};

export default JobsClient;

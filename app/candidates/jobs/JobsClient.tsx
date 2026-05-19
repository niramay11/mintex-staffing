"use client";

import React, { useState, useEffect, useCallback } from 'react';

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
        job_code: "MNT-1024",
        job_title: "Senior React Developer",
        city: "San Francisco",
        states: "California",
        zip_code: "94105",
        country: "USA",
        location: "San Francisco, CA",
        pay_rate___salary: "$120,000 - $160,000/yr",
        career_portal_published_date: "2026-03-01",
        job_type: "Full-Time",
        job_status: "Open",
        remote_job: "Hybrid",
        experience: "5+ years",
        primary_skills: "React, TypeScript, Node.js",
        job_description: "Senior React Developer position",
        public_job_description: "We are looking for an experienced React Developer to join our team.",
    },
    {
        job_code: "MNT-1025",
        job_title: "DevOps Engineer",
        city: "Austin",
        states: "Texas",
        zip_code: "73301",
        country: "USA",
        location: "Austin, TX",
        pay_rate___salary: "$110,000 - $145,000/yr",
        career_portal_published_date: "2026-02-28",
        job_type: "Full-Time",
        job_status: "Open",
        remote_job: "Remote",
        experience: "3+ years",
        primary_skills: "AWS, Docker, Kubernetes, CI/CD",
        job_description: "DevOps Engineer position",
        public_job_description: "Join our infrastructure team to build scalable cloud solutions.",
    },
    {
        job_code: "MNT-1026",
        job_title: "UI/UX Designer",
        city: "New York",
        states: "New York",
        zip_code: "10001",
        country: "USA",
        location: "New York, NY",
        pay_rate___salary: "$90,000 - $130,000/yr",
        career_portal_published_date: "2026-02-25",
        job_type: "Full-Time",
        job_status: "Open",
        remote_job: "On-site",
        experience: "4+ years",
        primary_skills: "Figma, Adobe XD, Prototyping",
        job_description: "UI/UX Designer position",
        public_job_description: "Design beautiful interfaces for enterprise clients.",
    },
];

const JobsClient = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [totalCount, setTotalCount] = useState<number | null>(null);
    const [usingDummy, setUsingDummy] = useState(false);

    const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        countryCode: '+1',
        contactNo: '',
        currentLocation: '',
        resume: null as File | null
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const PAGING_LENGTH = 50;

    const fetchJobs = useCallback(async (page: number) => {
        setLoading(true);
        setUsingDummy(false);
        try {
            const res = await fetch(`/api/jobs?page=${page}&paging_length=${PAGING_LENGTH}`);
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Failed to fetch jobs (${res.status})`);
            }
            const data: ApiResponse = await res.json();

            let jobsList: Job[] = [];
            if (Array.isArray(data)) {
                jobsList = data;
            } else if (data && typeof data === 'object') {
                if ('results' in data && Array.isArray(data.results)) {
                    jobsList = data.results;
                    if ('count' in data && typeof data.count === 'number') {
                        setTotalCount(data.count);
                    }
                    setHasMore(!!data.next);
                } else {
                    const values = Object.values(data);
                    const arrayVal = values.find((v) => Array.isArray(v));
                    if (arrayVal && Array.isArray(arrayVal)) {
                        jobsList = arrayVal;
                    }
                }
            }

            if (jobsList.length === 0) {
                setJobs(DUMMY_JOBS);
                setUsingDummy(true);
                setTotalCount(DUMMY_JOBS.length);
                setHasMore(false);
            } else {
                setJobs(jobsList);
                if (jobsList.length >= PAGING_LENGTH) {
                    setHasMore(true);
                } else if (!('next' in (data as object))) {
                    setHasMore(false);
                }
            }
        } catch (err) {
            console.error('Error fetching jobs:', err);
            setJobs(DUMMY_JOBS);
            setUsingDummy(true);
            setTotalCount(DUMMY_JOBS.length);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchJobs(currentPage);
    }, [currentPage, fetchJobs]);

    const formatLocation = (job: Job): string => {
        if (job.location) return job.location;
        const parts = [job.city, job.states, job.zip_code].filter(Boolean);
        if (parts.length > 0) return parts.join(', ');
        return 'N/A';
    };

    const formatPayRate = (job: Job): string => {
        const raw = (job.pay_rate___salary || '').trim();
        if (!raw) return 'N/A';
        if (/[a-zA-Z/]/.test(raw)) return raw;
        const num = parseFloat(raw.replace(/[,$\s]/g, ''));
        if (isNaN(num)) return raw;
        const unit = num < 500 ? '/hr' : '/yr';
        return `$${num.toLocaleString()}${unit}`;
    };

    const formatDate = (dateStr: string): string => {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    const handleSelectJob = (jobCode: string) => {
        const newSelected = new Set(selectedJobs);
        if (newSelected.has(jobCode)) {
            newSelected.delete(jobCode);
        } else {
            newSelected.add(jobCode);
        }
        setSelectedJobs(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedJobs.size === jobs.length) {
            setSelectedJobs(new Set());
        } else {
            setSelectedJobs(new Set(jobs.map(job => job.job_code)));
        }
    };

    const handleApplyClick = () => {
        if (selectedJobs.size === 0) return;
        setSubmitStatus(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSubmitStatus(null);
        setFormData({
            name: '',
            email: '',
            countryCode: '+1',
            contactNo: '',
            currentLocation: '',
            resume: null
        });
        setFormErrors({});
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, resume: e.target.files![0] }));
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.name.trim()) errors.name = 'Full name is required';
        else if (formData.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';

        if (!formData.email.trim()) errors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Enter a valid email address';

        if (!formData.contactNo.trim()) errors.contactNo = 'Contact number is required';
        else if (!/^\d{7,15}$/.test(formData.contactNo.replace(/[\s\-()]/g, ''))) errors.contactNo = 'Enter a valid phone number';

        if (!formData.currentLocation.trim()) errors.currentLocation = 'Current location is required';

        if (!formData.resume) errors.resume = 'Resume is required';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setSubmitting(true);
        setSubmitStatus(null);

        try {
            const selectedJobsData = getSelectedJobsData();
            const formPayload = new FormData();
            formPayload.append('name', formData.name);
            formPayload.append('email', formData.email);
            formPayload.append('contactNo', `${formData.countryCode} ${formData.contactNo}`);
            formPayload.append('currentLocation', formData.currentLocation);
            formPayload.append('jobs', JSON.stringify(selectedJobsData.map(j => ({
                job_code: j.job_code,
                job_title: j.job_title,
                location: formatLocation(j),
                pay_rate: formatPayRate(j),
            }))));
            if (formData.resume) {
                formPayload.append('resume', formData.resume);
            }

            const res = await fetch('/api/apply', { method: 'POST', body: formPayload });
            const data = await res.json();

            if (res.ok) {
                setSubmitStatus({ type: 'success', message: 'Application submitted successfully! We will get back to you soon.' });
                setTimeout(() => {
                    handleCloseModal();
                    setSelectedJobs(new Set());
                }, 2500);
            } else {
                setSubmitStatus({ type: 'error', message: data.error || 'Failed to submit application. Please try again.' });
            }
        } catch {
            setSubmitStatus({ type: 'error', message: 'Network error. Please check your connection and try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    const getSelectedJobsData = () => {
        return jobs.filter(job => selectedJobs.has(job.job_code));
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
            setSelectedJobs(new Set());
        }
    };

    const handleNextPage = () => {
        if (hasMore) {
            setCurrentPage(prev => prev + 1);
            setSelectedJobs(new Set());
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
                {/* Header */}
                <div className="mb-10">
                    <p className="text-cyan-600 text-sm font-semibold tracking-[0.2em] uppercase mb-3">Careers</p>
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">
                        Available Positions
                    </h1>
                    <p className="text-gray-500 text-base">
                        Browse and apply to our current job openings
                    </p>
                    {usingDummy && (
                        <p className="text-amber-600 text-xs mt-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                            Showing sample listings. Live jobs will appear once the API is connected.
                        </p>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-2 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 text-sm">Loading job listings...</p>
                    </div>
                )}

                {/* Table */}
                {!loading && jobs.length > 0 && (
                    <>
                        <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
                            {/* Toolbar */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                                <div className="text-sm text-gray-500">
                                    {selectedJobs.size > 0 && (
                                        <span className="text-cyan-700 font-medium">
                                            {selectedJobs.size} position{selectedJobs.size !== 1 ? 's' : ''} selected
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={handleApplyClick}
                                    disabled={selectedJobs.size === 0}
                                    className={`px-6 py-2.5 text-sm font-semibold rounded-lg uppercase tracking-wider transition-all duration-300 ${
                                        selectedJobs.size === 0
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                            : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm'
                                    }`}
                                >
                                    Apply {selectedJobs.size > 0 && `(${selectedJobs.size})`}
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50">
                                            <th className="px-4 py-4 text-center w-12">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedJobs.size === jobs.length && jobs.length > 0}
                                                    onChange={handleSelectAll}
                                                    className="w-4 h-4 rounded border-gray-300 accent-cyan-600"
                                                />
                                            </th>
                                            {['Job Title', 'Location', 'States', 'Pay Rate / Salary', 'Posted'].map((header) => (
                                                <th key={header} className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {jobs.map((job, index) => (
                                            <tr
                                                key={job.job_code || index}
                                                onClick={() => handleSelectJob(job.job_code)}
                                                className={`transition-all duration-200 cursor-pointer ${
                                                    selectedJobs.has(job.job_code)
                                                        ? 'bg-cyan-50 border-l-2 border-l-cyan-600'
                                                        : 'hover:bg-gray-50 border-l-2 border-l-transparent'
                                                }`}
                                            >
                                                <td className="px-4 py-4 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedJobs.has(job.job_code)}
                                                        onChange={() => handleSelectJob(job.job_code)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-4 h-4 rounded border-gray-300 accent-cyan-600"
                                                    />
                                                </td>
                                                <td className="px-4 py-4 text-sm">
                                                    <span className="text-cyan-700 font-semibold hover:text-cyan-800 transition-colors">
                                                        {job.job_title || 'N/A'}
                                                    </span>
                                                    {job.job_type && (
                                                        <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                                                            {job.job_type}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-700">
                                                    {formatLocation(job)}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {job.states || 'N/A'}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                                                    {formatPayRate(job)}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(job.career_portal_published_date)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-gray-500">
                                Showing {jobs.length} position{jobs.length !== 1 ? 's' : ''}
                                {totalCount !== null && ` of ${totalCount} total`}
                                {' · '}Page {currentPage}
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                                        currentPage === 1
                                            ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white'
                                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400'
                                    }`}
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-gray-500 font-medium px-3">
                                    {currentPage}
                                </span>
                                <button
                                    onClick={handleNextPage}
                                    disabled={!hasMore}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                                        !hasMore
                                            ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white'
                                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400'
                                    }`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Application Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm bg-gray-900/40">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
                        <div className="p-8 overflow-y-auto max-h-[90vh]">
                            {/* Modal Header */}
                            <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-200">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Apply for Selected Positions</h2>
                                    <p className="text-sm text-gray-500">Complete the form below to submit your application</p>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors"
                                    aria-label="Close"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Status Message */}
                            {submitStatus && (
                                <div className={`mb-6 p-4 rounded-xl border ${
                                    submitStatus.type === 'success'
                                        ? 'bg-green-50 border-green-200 text-green-700'
                                        : 'bg-red-50 border-red-200 text-red-700'
                                }`}>
                                    <p className="text-sm font-medium">{submitStatus.message}</p>
                                </div>
                            )}

                            {/* Selected Jobs List */}
                            <div className="mb-8 p-4 rounded-xl bg-gray-50 border border-gray-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 bg-cyan-600 rounded-full" />
                                    <h3 className="text-sm font-semibold text-gray-700">Selected Roles ({selectedJobs.size})</h3>
                                </div>
                                <div className="space-y-2">
                                    {getSelectedJobsData().map((job) => (
                                        <div key={job.job_code} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200">
                                            <span className="font-mono text-xs text-cyan-700">{job.job_code}</span>
                                            <span className="text-sm text-gray-700">{job.job_title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Application Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Row 1: Full Name + Email */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="name" className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                            Full Name <span className="text-cyan-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-gray-900 placeholder:text-gray-400 ${formErrors.name ? 'border-red-400' : 'border-gray-300'}`}
                                            placeholder="John Doe"
                                        />
                                        {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                            Email Address <span className="text-cyan-600">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-gray-900 placeholder:text-gray-400 ${formErrors.email ? 'border-red-400' : 'border-gray-300'}`}
                                            placeholder="john.doe@example.com"
                                        />
                                        {formErrors.email && <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>}
                                    </div>
                                </div>

                                {/* Row 2: Contact Number + Current Location */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="contactNo" className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                            Contact Number <span className="text-cyan-600">*</span>
                                        </label>
                                        <div className={`flex rounded-lg overflow-hidden border bg-white focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all ${formErrors.contactNo ? 'border-red-400' : 'border-gray-300'}`}>
                                            <select
                                                name="countryCode"
                                                value={formData.countryCode}
                                                onChange={handleInputChange}
                                                className="px-2 py-3 bg-gray-50 text-gray-700 text-sm font-medium border-r border-gray-300 focus:outline-none cursor-pointer appearance-none"
                                                style={{ backgroundImage: 'none' }}
                                            >
                                                <option value="+1">+1 US</option>
                                                <option value="+44">+44 UK</option>
                                                <option value="+91">+91 IN</option>
                                                <option value="+61">+61 AU</option>
                                                <option value="+49">+49 DE</option>
                                                <option value="+33">+33 FR</option>
                                                <option value="+81">+81 JP</option>
                                                <option value="+86">+86 CN</option>
                                                <option value="+55">+55 BR</option>
                                                <option value="+52">+52 MX</option>
                                                <option value="+971">+971 AE</option>
                                                <option value="+65">+65 SG</option>
                                                <option value="+82">+82 KR</option>
                                            </select>
                                            <input
                                                type="tel"
                                                id="contactNo"
                                                name="contactNo"
                                                value={formData.contactNo}
                                                onChange={handleInputChange}
                                                className="flex-1 px-4 py-3 bg-white focus:outline-none text-gray-900 placeholder:text-gray-400 min-w-0"
                                                placeholder="(555) 123-4567"
                                            />
                                        </div>
                                        {formErrors.contactNo && <p className="mt-1 text-xs text-red-500">{formErrors.contactNo}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="currentLocation" className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                            Current Location <span className="text-cyan-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="currentLocation"
                                            name="currentLocation"
                                            value={formData.currentLocation}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-gray-900 placeholder:text-gray-400 ${formErrors.currentLocation ? 'border-red-400' : 'border-gray-300'}`}
                                            placeholder="City, State"
                                        />
                                        {formErrors.currentLocation && <p className="mt-1 text-xs text-red-500">{formErrors.currentLocation}</p>}
                                    </div>
                                </div>

                                {/* Resume Upload */}
                                <div>
                                    <label htmlFor="resume" className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                        Resume <span className="text-cyan-600">*</span>
                                    </label>
                                    <label className={`flex flex-col items-center justify-center w-full h-28 border border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-cyan-400 transition-all group ${formErrors.resume ? 'border-red-400' : 'border-gray-300'}`}>
                                        <div className="flex flex-col items-center justify-center py-4">
                                            <svg className="w-8 h-8 mb-2 text-gray-400 group-hover:text-cyan-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <p className="text-xs text-gray-500">
                                                <span className="text-cyan-700 font-medium">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-1">PDF, DOC, DOCX (MAX. 5MB)</p>
                                        </div>
                                        <input
                                            type="file"
                                            id="resume"
                                            name="resume"
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => {
                                                handleFileChange(e);
                                                if (formErrors.resume) setFormErrors(prev => { const n = { ...prev }; delete n.resume; return n; });
                                            }}
                                            className="hidden"
                                        />
                                    </label>
                                    {formErrors.resume && <p className="mt-1 text-xs text-red-500">{formErrors.resume}</p>}
                                    {formData.resume && (
                                        <div className="mt-2 flex items-center gap-2 p-2.5 bg-cyan-50 border border-cyan-200 rounded-lg">
                                            <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-xs font-medium text-cyan-800">{formData.resume.name}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium bg-white hover:bg-gray-50 transition-all text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        {submitting ? (
                                            <span className="flex items-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Submitting...
                                            </span>
                                        ) : (
                                            'Submit Application'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobsClient;

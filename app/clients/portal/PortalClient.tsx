"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

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

const STATUS_STYLES: Record<string, string> = {
    Active: "bg-green-50 text-green-700 border-green-200",
    "On Hold": "bg-amber-50 text-amber-700 border-amber-200",
    Closed: "bg-red-50 text-red-700 border-red-200",
    Open: "bg-cyan-50 text-cyan-700 border-cyan-200",
};

// All visible columns from the API — you can remove any you don't want
const TABLE_COLUMNS: { key: string; label: string }[] = [
    { key: "job_code", label: "Job Code" },
    { key: "ceipal_ref__", label: "Ceipal Ref" },
    { key: "job_title", label: "Job Title" },
    { key: "public_job_title", label: "Public Title" },
    { key: "job_status", label: "Status" },
    { key: "job_type", label: "Type" },
    { key: "client", label: "Client" },
    { key: "end_client", label: "End Client" },
    { key: "client_manager", label: "Client Manager" },
    { key: "department", label: "Department" },
    { key: "industry", label: "Industry" },
    { key: "city", label: "City" },
    { key: "states", label: "State" },
    { key: "country", label: "Country" },
    { key: "zip_code", label: "Zip Code" },
    { key: "location", label: "Location" },
    { key: "remote_job", label: "Remote" },
    { key: "pay_rate___salary", label: "Pay Rate / Salary" },
    { key: "client_bill_rate___salary", label: "Client Bill Rate" },
    { key: "experience", label: "Experience" },
    { key: "degree", label: "Degree" },
    { key: "primary_skills", label: "Primary Skills" },
    { key: "secondary_skills", label: "Secondary Skills" },
    { key: "number_of_positions", label: "Positions" },
    { key: "duration", label: "Duration" },
    { key: "required_hours_week", label: "Hrs/Week" },
    { key: "tax_terms", label: "Tax Terms" },
    { key: "work_authorization", label: "Work Auth" },
    { key: "interview_mode", label: "Interview Mode" },
    { key: "clearance", label: "Clearance" },
    { key: "priority", label: "Priority" },
    { key: "required_documents", label: "Required Docs" },
    { key: "job_start_date", label: "Start Date" },
    { key: "job_end_date", label: "End Date" },
    { key: "career_portal_published_date", label: "Published Date" },
    { key: "Created", label: "Created" },
    { key: "Modified", label: "Modified" },
    { key: "additional_details", label: "Additional Details" },
    { key: "comments", label: "Comments" },
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
            console.error("Error fetching client jobs:", err);
            setError(err instanceof Error ? err.message : "Failed to load jobs");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchJobs(currentPage);
    }, [currentPage, fetchJobs]);

    // Collect unique statuses from data
    const uniqueStatuses = Array.from(new Set(jobs.map(j => j.job_status).filter(Boolean)));

    const filteredJobs = jobs.filter((job) => {
        const matchesStatus = statusFilter === "All" || job.job_status === statusFilter;
        const matchesSearch =
            searchQuery === "" ||
            job.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.job_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.client?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.primary_skills?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const statusCounts: Record<string, number> = {
        total: jobs.length,
        ...Object.fromEntries(uniqueStatuses.map(s => [s, jobs.filter(j => j.job_status === s).length])),
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        } catch {
            return dateStr;
        }
    };

    const renderCellValue = (job: Job, key: string) => {
        const value = job[key];
        if (value === null || value === undefined || value === "") return <span className="text-gray-300">—</span>;

        // Format date fields
        if (key.includes("date") || key === "Created" || key === "Modified") {
            return formatDate(String(value));
        }

        // Status badge
        if (key === "job_status") {
            const style = STATUS_STYLES[value] || "bg-gray-100 text-gray-600 border-gray-200";
            return (
                <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border ${style}`}>
                    {value}
                </span>
            );
        }

        return String(value);
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4">
                    <div>
                        <Link href="/clients" className="text-gray-500 text-sm hover:text-cyan-700 transition-colors mb-3 inline-flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Clients
                        </Link>
                        <p className="text-cyan-600 text-sm font-semibold tracking-[0.2em] uppercase mb-3">Client Portal</p>
                        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2">Job Postings Dashboard</h1>
                        <p className="text-gray-500 text-sm">
                            {totalCount > 0 ? `${totalCount} total job postings from Ceipal` : "View and manage all job postings"}
                        </p>
                    </div>
                </div>

                {/* Status Summary Cards */}
                {!loading && jobs.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-xl bg-white border border-gray-200 text-center hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer shadow-sm"
                            onClick={() => setStatusFilter("All")}
                        >
                            <p className="text-2xl font-bold text-gray-900">{statusCounts.total}</p>
                            <p className="text-xs text-gray-500 mt-1">Total</p>
                        </motion.div>
                        {uniqueStatuses.map((status) => (
                            <motion.div
                                key={status}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-xl bg-white border text-center hover:bg-gray-50 transition-all cursor-pointer shadow-sm ${
                                    statusFilter === status ? "border-cyan-500 ring-2 ring-cyan-500/20" : "border-gray-200 hover:border-gray-300"
                                }`}
                                onClick={() => setStatusFilter(statusFilter === status ? "All" : status)}
                            >
                                <p className="text-2xl font-bold text-gray-900">{statusCounts[status]}</p>
                                <p className="text-xs text-gray-500 mt-1">{status}</p>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Filters */}
                {!loading && (
                    <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 cursor-pointer"
                            >
                                <option value="All">All Statuses</option>
                                {uniqueStatuses.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by title, code, client, city, skills..."
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                            />
                        </div>
                        <div className="text-sm text-gray-500">
                            {filteredJobs.length} result{filteredJobs.length !== 1 ? "s" : ""}
                        </div>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-2 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 text-sm">Loading job postings...</p>
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <div className="p-6 rounded-xl bg-red-50 border border-red-200 text-center">
                        <p className="text-red-700 text-sm mb-3">{error}</p>
                        <button
                            onClick={() => fetchJobs(currentPage)}
                            className="px-4 py-2 text-sm bg-red-100 border border-red-300 rounded-lg text-red-700 hover:bg-red-200 transition-all"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Table */}
                {!loading && !error && filteredJobs.length > 0 && (
                    <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50">
                                        <th className="px-3 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-10">
                                            #
                                        </th>
                                        {TABLE_COLUMNS.map((col) => (
                                            <th key={col.key} className="px-3 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                {col.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredJobs.map((job, index) => (
                                        <React.Fragment key={job.job_code || job.id || index}>
                                            <tr
                                                onClick={() => setExpandedJob(expandedJob === job.job_code ? null : job.job_code)}
                                                className="hover:bg-gray-50 transition-colors cursor-pointer"
                                            >
                                                <td className="px-3 py-3 text-sm text-gray-400">
                                                    {(currentPage - 1) * PAGING_LENGTH + index + 1}
                                                </td>
                                                {TABLE_COLUMNS.map((col) => (
                                                    <td key={col.key} className="px-3 py-3 text-sm text-gray-700 max-w-[200px] truncate">
                                                        {renderCellValue(job, col.key)}
                                                    </td>
                                                ))}
                                            </tr>
                                            {/* Expanded row — shows description & all remaining fields */}
                                            {expandedJob === job.job_code && (
                                                <tr>
                                                    <td colSpan={TABLE_COLUMNS.length + 1} className="px-6 py-6 bg-gray-50 border-t border-gray-200">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            {job.job_description && (
                                                                <div>
                                                                    <h4 className="text-xs font-semibold text-cyan-700 uppercase tracking-wider mb-2">Job Description</h4>
                                                                    <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto" dangerouslySetInnerHTML={{ __html: job.job_description }} />
                                                                </div>
                                                            )}
                                                            {job.public_job_description && (
                                                                <div>
                                                                    <h4 className="text-xs font-semibold text-cyan-700 uppercase tracking-wider mb-2">Public Job Description</h4>
                                                                    <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto" dangerouslySetInnerHTML={{ __html: job.public_job_description }} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && filteredJobs.length === 0 && jobs.length > 0 && (
                    <div className="py-16 text-center">
                        <p className="text-gray-500 text-sm">No jobs match your filters.</p>
                    </div>
                )}

                {/* Pagination */}
                {!loading && !error && jobs.length > 0 && (
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-500">
                            Page {currentPage} · Showing {filteredJobs.length} of {jobs.length} on this page
                            {totalCount > 0 && ` · ${totalCount} total`}
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => { setCurrentPage(p => p - 1); setExpandedJob(null); }}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                                    currentPage === 1
                                        ? "border-gray-200 text-gray-300 cursor-not-allowed bg-white"
                                        : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400"
                                }`}
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-500 font-medium px-3">{currentPage}</span>
                            <button
                                onClick={() => { setCurrentPage(p => p + 1); setExpandedJob(null); }}
                                disabled={!hasMore}
                                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                                    !hasMore
                                        ? "border-gray-200 text-gray-300 cursor-not-allowed bg-white"
                                        : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400"
                                }`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

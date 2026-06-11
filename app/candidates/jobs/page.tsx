import { Metadata } from 'next';
import { getAllJobs } from '@/lib/data-cache';
import JobsClient from './JobsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Job Listings - Mintex Staffing',
    description: 'Browse available job opportunities',
};

export default async function JobsPage() {
    const jobs = await getAllJobs();
    return <JobsClient initialJobs={jobs} />;
}

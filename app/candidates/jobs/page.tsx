import { Metadata } from 'next';
import JobsClient from './JobsClient';

export const metadata: Metadata = {
    title: 'Job Listings - Mintex Staffing',
    description: 'Browse available job opportunities',
};

const JobsPage = () => {
    return <JobsClient />;
};

export default JobsPage;


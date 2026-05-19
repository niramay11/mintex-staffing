import React from 'react';
import type { Metadata } from 'next';
import CandidatesClient from './CandidatesClient';

export const metadata: Metadata = {
    title: 'For Candidates - Unlock Your Potential | Mintex Staffing',
    description: 'Find your next career opportunity with Mintex Staffing. We support candidates with guidance, resources, and connections to top companies.',
};

const CandidatesPage = () => {
    return <CandidatesClient />;
};

export default CandidatesPage;
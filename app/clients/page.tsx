import React from 'react';
import type { Metadata } from 'next';
import ClientsClient from './ClientsClient';

export const metadata: Metadata = {
    title: 'For Clients - 5-Step Talent Engine | Mintex Staffing',
    description: 'Accelerate your hiring with Mintex Staffing. Our 5-Step Talent Engine ensures you get the right talent, right now.',
};

const ClientsPage = () => {
    return <ClientsClient />;
};

export default ClientsPage;
import React from 'react';
import type { Metadata } from 'next';
import ServedSectorsClient from './ServedSectorsClient';

export const metadata: Metadata = {
    title: 'Expertise Across Industries | Mintex Staffing',
    description: 'Mintex Staffing provides specialized staffing solutions across IT, Healthcare, Engineering, and more.',
};

const ServedSectorsPage = () => {
    return <ServedSectorsClient />;
};

export default ServedSectorsPage;
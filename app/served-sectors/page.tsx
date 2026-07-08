import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import ServedSectorsClient from './ServedSectorsClient';

export const metadata: Metadata = {
    title: 'Expertise Across Industries | Mintex Staffing',
    description: 'Mintex Staffing provides specialized staffing solutions across IT, Healthcare, Engineering, and more.',
};

const ServedSectorsPage = () => {
    return (
        <Suspense fallback={null}>
            <ServedSectorsClient />
        </Suspense>
    );
};

export default ServedSectorsPage;
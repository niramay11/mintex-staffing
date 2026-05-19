import { NextResponse } from 'next/server';
import { ceipalFetch, CEIPAL_JOBS_URL } from '@/lib/ceipal';

type CeipalJob = { job_status?: string;[key: string]: unknown };
type JobsPayload = { results: CeipalJob[]; count: number };

const CACHE_TTL_MS = 5 * 60 * 1000;

let cached: { data: JobsPayload; expiresAt: number } | null = null;
let inflight: Promise<JobsPayload> | null = null;

async function loadActiveJobs(): Promise<JobsPayload> {
    const url = new URL(CEIPAL_JOBS_URL);
    url.searchParams.set('paging_length', '500');
    url.searchParams.set('page', '1');
    url.searchParams.set('job_status', '1');

    const res = await ceipalFetch(url.toString());
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Ceipal ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    const results: CeipalJob[] = Array.isArray(data?.results) ? data.results : [];

    return { results, count: results.length };
}

export async function GET() {
    try {
        if (cached && Date.now() < cached.expiresAt) {
            return NextResponse.json(cached.data);
        }

        if (!inflight) {
            inflight = loadActiveJobs()
                .then((data) => {
                    cached = { data, expiresAt: Date.now() + CACHE_TTL_MS };
                    return data;
                })
                .finally(() => {
                    inflight = null;
                });
        }

        const data = await inflight;
        return NextResponse.json(data);
    } catch (error) {
        console.error('Jobs API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}

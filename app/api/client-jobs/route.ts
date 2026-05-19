import { NextResponse } from 'next/server';
import { ceipalFetch, CEIPAL_JOBS_URL } from '@/lib/ceipal';

type CeipalJob = { client?: string;[key: string]: unknown };
type JobsPayload = { results: CeipalJob[]; count: number; total_fetched: number };

const PAGE_SIZE = 50;
const MAX_PAGES = 200;
const BATCH = 5;
const CACHE_TTL_MS = 5 * 60 * 1000;
const CLIENT_NAME = 'Mintex Technology';

let cached: { data: JobsPayload; expiresAt: number } | null = null;
let inflight: Promise<JobsPayload> | null = null;

async function fetchPage(page: number): Promise<{ results: CeipalJob[]; next: unknown } | { error: string; status: number }> {
    const url = new URL(CEIPAL_JOBS_URL);
    url.searchParams.set('paging_length', String(PAGE_SIZE));
    url.searchParams.set('page', String(page));

    const res = await ceipalFetch(url.toString());
    if (res.status === 404) return { results: [], next: null };
    if (!res.ok) {
        const errorText = await res.text();
        return { error: errorText, status: res.status };
    }
    const data = await res.json();
    return {
        results: Array.isArray(data?.results) ? data.results : [],
        next: data?.next ?? null,
    };
}

async function loadMintexJobs(): Promise<JobsPayload> {
    const first = await fetchPage(1);
    if ('error' in first) throw new Error(`Ceipal ${first.status}: ${first.error}`);

    const allJobs: CeipalJob[] = [...first.results];
    let hasMore = first.results.length === PAGE_SIZE && !!first.next;
    let nextPage = 2;

    while (hasMore && nextPage <= MAX_PAGES) {
        const pages = Array.from(
            { length: Math.min(BATCH, MAX_PAGES - nextPage + 1) },
            (_, i) => nextPage + i
        );
        const batchResults = await Promise.all(pages.map(fetchPage));

        for (const r of batchResults) {
            if ('error' in r) throw new Error(`Ceipal ${r.status}: ${r.error}`);
            allJobs.push(...r.results);
        }

        const last = batchResults[batchResults.length - 1];
        if ('error' in last) break;
        hasMore = last.results.length === PAGE_SIZE && !!last.next;
        nextPage += BATCH;
    }

    const target = CLIENT_NAME.trim().toLowerCase();
    const filtered = allJobs.filter(
        (job) =>
            typeof job.client === 'string' &&
            job.client.trim().toLowerCase() === target
    );

    return {
        results: filtered,
        count: filtered.length,
        total_fetched: allJobs.length,
    };
}

export async function GET() {
    try {
        if (cached && Date.now() < cached.expiresAt) {
            return NextResponse.json(cached.data);
        }

        if (!inflight) {
            inflight = loadMintexJobs()
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
        console.error('Client jobs API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}

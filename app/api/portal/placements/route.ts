import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/portal-auth';
import { ceipalFetchV2, CEIPAL_PLACEMENTS_URL } from '@/lib/ceipal';

const CACHE_TTL = 5 * 60 * 1000;
let cache: { data: Record<string, unknown>[]; at: number } | null = null;
let inflight: Promise<Record<string, unknown>[]> | null = null;

async function fetchAllPlacements(): Promise<Record<string, unknown>[]> {
  const url = `${CEIPAL_PLACEMENTS_URL}?paging_length=500&page=1`;
  const res = await ceipalFetchV2(url);
  if (!res.ok) throw new Error(`CEIPAL placements ${res.status}`);
  const data = await res.json();
  return Array.isArray(data?.results) ? data.results : [];
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('portal_token')?.value;
  const client = await verifySession(token ?? '') as Record<string, unknown> | null;
  if (!client) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    if (!cache || Date.now() > cache.at + CACHE_TTL) {
      if (!inflight) {
        inflight = fetchAllPlacements()
          .then(d => { cache = { data: d, at: Date.now() }; return d; })
          .finally(() => { inflight = null; });
      }
      await inflight;
    }

    const all = cache?.data ?? [];
    const ceipalName = String(client.ceipal_client_name ?? '').toLowerCase();
    const permissions = (client.permissions as Record<string, boolean>) ?? {};

    // Filter to this client's placements by client_name in CEIPAL
    const placements = ceipalName
      ? all.filter(p => String(p.client_name ?? '').toLowerCase() === ceipalName)
      : [];

    // Strip sensitive fields based on permissions
    const stripped = placements.map(p => {
      const item = { ...p };
      if (!permissions.show_bill_rate)         { delete item.client_bill_rate; }
      if (!permissions.show_pay_rate)           { delete item.pay_rate; }
      if (!permissions.show_candidate_contact)  { delete item.mobile_number; delete item.email; }
      return item;
    });

    return NextResponse.json({ results: stripped, count: stripped.length });
  } catch (err) {
    console.error('Portal placements error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

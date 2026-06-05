// ─── Credentials (from .env) ──────────────────────────────────────────────────
const EMAIL    = process.env.CEIPAL_EMAIL    || 'kumar@mintextech.com';
const PASSWORD = process.env.CEIPAL_PASSWORD || 'Mintex@123';
const API_KEY  = process.env.CEIPAL_API_KEY  || '';

// ─── Auth URLs ────────────────────────────────────────────────────────────────
const AUTH_URL_V1 = 'https://api.ceipal.com/v1/createAuthtoken/';
const AUTH_URL_V2 = 'https://api.ceipal.com/v2/createAuthtoken/';

// ─── Data Endpoints ───────────────────────────────────────────────────────────
// API 1 — Custom Jobs Report (Client Portal)
export const CEIPAL_JOBS_URL =
  'https://api.ceipal.com/getCustomJobPostingDetails/Z3RkUkt2OXZJVld2MjFpOVRSTXoxZz09/afddc10aa5424b2974b109624f0ca710/';

// API 2 — Custom Placements Report (Candidate List)
export const CEIPAL_PLACEMENTS_URL =
  'https://api.ceipal.com/v2/getCustomPlacementDetails/VnllY0Q0TTRBbnp3dGJYYVZzZUkzdz09/fbcfaa69a0dcc8e55e39edfa680c36a9/';

// ─── Token cache ──────────────────────────────────────────────────────────────
type TokenCache = { token: string; expiresAt: number };
let cacheV1: TokenCache | null = null;
let cacheV2: TokenCache | null = null;

function parseXmlToken(xml: string): string {
  const m = xml.match(/<access_token>(.*?)<\/access_token>/);
  if (!m?.[1]) throw new Error('No access_token in CEIPAL response');
  return m[1];
}

async function fetchToken(authUrl: string): Promise<string> {
  if (!API_KEY) throw new Error('CEIPAL_API_KEY env var is missing');

  const res = await fetch(authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD, api_key: API_KEY, json: 1 }),
  });

  if (!res.ok) throw new Error(`CEIPAL auth failed: ${res.status}`);
  const text = await res.text();

  // CEIPAL returns XML or JSON depending on the json:1 param
  try {
    const json = JSON.parse(text);
    if (json?.access_token) return json.access_token;
  } catch {
    // fall through to XML parse
  }
  return parseXmlToken(text);
}

// ─── Public token getters ─────────────────────────────────────────────────────
export async function getCeipalToken(): Promise<string> {
  const BUFFER = 5 * 60 * 1000; // refresh 5 min before expiry
  if (cacheV1 && Date.now() < cacheV1.expiresAt - BUFFER) return cacheV1.token;
  const token = await fetchToken(AUTH_URL_V1);
  cacheV1 = { token, expiresAt: Date.now() + 50 * 60 * 1000 };
  return token;
}

export async function getCeipalTokenV2(): Promise<string> {
  const BUFFER = 5 * 60 * 1000;
  if (cacheV2 && Date.now() < cacheV2.expiresAt - BUFFER) return cacheV2.token;
  const token = await fetchToken(AUTH_URL_V2);
  cacheV2 = { token, expiresAt: Date.now() + 50 * 60 * 1000 };
  return token;
}

// ─── Authenticated fetch helpers ──────────────────────────────────────────────
async function doFetch(url: string, getToken: () => Promise<string>): Promise<Response> {
  let token = await getToken();
  let res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });

  if (res.status === 401 || res.status === 403) {
    // Invalidate cache and retry once
    cacheV1 = null;
    cacheV2 = null;
    token = await getToken();
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
  }
  return res;
}

export function ceipalFetch(url: string)   { return doFetch(url, getCeipalToken);   }
export function ceipalFetchV2(url: string) { return doFetch(url, getCeipalTokenV2); }

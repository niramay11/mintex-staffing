const CEIPAL_AUTH_URL = 'https://api.ceipal.com/v1/createAuthtoken/';

const CEIPAL_EMAIL = process.env.CEIPAL_EMAIL || 'kumar@mintextech.com';
const CEIPAL_PASSWORD = process.env.CEIPAL_PASSWORD || 'Mintex@123';
const CEIPAL_API_KEY = process.env.CEIPAL_API_KEY || '';

export const CEIPAL_JOBS_URL =
    'https://api.ceipal.com/getCustomJobPostingDetails/Z3RkUkt2OXZJVld2MjFpOVRSTXoxZz09/afddc10aa5424b2974b109624f0ca710/';

// In-memory token cache
let cachedToken: string | null = null;
let cachedRefreshToken: string | null = null;
let tokenExpiry = 0;

/**
 * Parse token from Ceipal XML response.
 * Response format: <root><access_token>...</access_token><refresh_token>...</refresh_token></root>
 */
function parseXmlToken(xml: string): { accessToken: string; refreshToken: string | null } {
    const accessMatch = xml.match(/<access_token>(.*?)<\/access_token>/);
    const refreshMatch = xml.match(/<refresh_token>(.*?)<\/refresh_token>/);
    if (!accessMatch?.[1]) {
        throw new Error('No access_token found in Ceipal auth response');
    }
    return {
        accessToken: accessMatch[1],
        refreshToken: refreshMatch?.[1] || null,
    };
}

/**
 * Get a valid Ceipal access token.
 * Generates a new one via credentials if expired or not cached.
 */
export async function getCeipalToken(): Promise<string> {
    // Return cached token if still valid (with 5 min buffer)
    if (cachedToken && Date.now() < tokenExpiry - 5 * 60 * 1000) {
        return cachedToken;
    }

    // Try refresh token first if we have one
    if (cachedRefreshToken) {
        try {
            const refreshResponse = await fetch('https://api.ceipal.com/v1/refreshToken/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: cachedRefreshToken }),
            });
            if (refreshResponse.ok) {
                const refreshText = await refreshResponse.text();
                const { accessToken, refreshToken } = parseXmlToken(refreshText);
                cachedToken = accessToken;
                cachedRefreshToken = refreshToken || cachedRefreshToken;
                tokenExpiry = Date.now() + 50 * 60 * 1000;
                return cachedToken;
            }
        } catch {
            console.log('Refresh token failed, falling back to credentials auth...');
        }
    }

    // Generate fresh token via credentials
    if (!CEIPAL_API_KEY) {
        throw new Error('CEIPAL_API_KEY environment variable is required');
    }

    const response = await fetch(CEIPAL_AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: CEIPAL_EMAIL,
            password: CEIPAL_PASSWORD,
            api_key: CEIPAL_API_KEY,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Ceipal auth error:', response.status, errorText);
        throw new Error(`Ceipal authentication failed: ${response.status}`);
    }

    const responseText = await response.text();
    const { accessToken, refreshToken } = parseXmlToken(responseText);

    cachedToken = accessToken;
    cachedRefreshToken = refreshToken;
    // JWT tokens from Ceipal expire in ~1 hour; cache for 50 minutes
    tokenExpiry = Date.now() + 50 * 60 * 1000;

    return cachedToken;
}

/**
 * Fetch from Ceipal API with automatic token management.
 * Retries once with a fresh token on 401/403.
 */
export async function ceipalFetch(url: string): Promise<Response> {
    const token = await getCeipalToken();
    let response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    // If token was rejected, invalidate cache and retry with fresh token
    if (response.status === 401 || response.status === 403) {
        console.log('Ceipal token rejected, generating new token...');
        cachedToken = null;
        tokenExpiry = 0;
        const newToken = await getCeipalToken();
        response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${newToken}`,
                'Content-Type': 'application/json',
            },
        });
    }

    return response;
}

import { supabase } from '../supabase.js';

const baseUrl = import.meta.env.VITE_API_BASE_URL || '';

export async function fetchWithAuth(
    input: RequestInfo,
    init: RequestInit = {},
    requireAuth = false
): Promise<Response> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(init.headers || {}),
    };

    if (requireAuth) {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const url =
        typeof input === 'string' && input.startsWith('/')
            ? baseUrl + input
            : input;

    const res = await fetch(url, {
        ...init,
        headers,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Feil (${res.status}): ${res.statusText}`);
    }

    return res;
}
